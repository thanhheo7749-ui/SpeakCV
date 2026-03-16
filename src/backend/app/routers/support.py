# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import json
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from ..database import database, sql_models
from .. import models
from datetime import datetime, date

FREE_DAILY_LIMIT = 5

router = APIRouter(
    prefix="/api/support",
    tags=["Support"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int = None, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections.append(websocket)
        else:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = []
            self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None, is_admin: bool = False):
        if is_admin:
            if websocket in self.admin_connections:
                self.admin_connections.remove(websocket)
        else:
            if user_id in self.active_connections:
                if websocket in self.active_connections[user_id]:
                    self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)
        
    async def broadcast_to_admins(self, message: dict):
        for connection in self.admin_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, db: Session = Depends(get_db)):
    # Classify client_id: "admin" -> admin connection, numeric -> user connection
    is_admin = False
    user_id = None
    
    if client_id == "admin":
        is_admin = True
    else:
        try:
            user_id = int(client_id)
        except ValueError:
            await websocket.close()
            return
            
    await manager.connect(websocket, user_id, is_admin)
    auto_replied_this_session = False  # Track auto-reply per session
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                text_msg = payload.get("message", "")
                
                if not text_msg.strip():
                    continue
                
                # --- Rate limiting for free users ---
                if not is_admin and user_id:
                    user = db.query(sql_models.User).filter(sql_models.User.id == user_id).first()
                    if user and user.plan == "free":
                        today_start = datetime.combine(date.today(), datetime.min.time())
                        today_count = db.query(func.count(sql_models.SupportMessage.id)).filter(
                            sql_models.SupportMessage.user_id == user_id,
                            sql_models.SupportMessage.sender_type == "user",
                            sql_models.SupportMessage.created_at >= today_start
                        ).scalar() or 0
                        if today_count >= FREE_DAILY_LIMIT:
                            await manager.send_personal_message({
                                "id": -1,
                                "user_id": user_id,
                                "admin_id": None,
                                "message": f"Bạn đã hết {FREE_DAILY_LIMIT} lượt chat hôm nay. Nâng cấp Pro để chat không giới hạn!",
                                "sender_type": "system",
                                "is_read": True,
                                "created_at": datetime.now().isoformat(),
                                "quota_exceeded": True
                            }, websocket)
                            continue
                
                db_message = sql_models.SupportMessage(
                    user_id=user_id if not is_admin else payload.get("target_user_id"),
                    admin_id=None if not is_admin else 1,
                    message=text_msg,
                    sender_type="admin" if is_admin else "user",
                    is_read=is_admin
                )
                db.add(db_message)
                db.commit()
                db.refresh(db_message)
                
                msg_dict = {
                    "id": db_message.id,
                    "user_id": db_message.user_id,
                    "admin_id": db_message.admin_id,
                    "message": db_message.message,
                    "sender_type": db_message.sender_type,
                    "is_read": db_message.is_read,
                    "created_at": db_message.created_at.isoformat() if db_message.created_at else str(datetime.now())
                }
                
                if is_admin:
                    await manager.broadcast_to_user(db_message.user_id, msg_dict)
                    await manager.broadcast_to_admins(msg_dict)
                else:
                    await manager.broadcast_to_user(user_id, msg_dict)
                    await manager.broadcast_to_admins(msg_dict)
                    
                    # --- Auto-reply when no admin is online ---
                    if not auto_replied_this_session and len(manager.admin_connections) == 0:
                        auto_replied_this_session = True
                        auto_msg = sql_models.SupportMessage(
                            user_id=user_id,
                            admin_id=None,
                            message="Admin hiện không online. Chúng tôi sẽ phản hồi sớm nhất khi có mặt! 🙏",
                            sender_type="system",
                            is_read=True
                        )
                        db.add(auto_msg)
                        db.commit()
                        db.refresh(auto_msg)
                        auto_dict = {
                            "id": auto_msg.id,
                            "user_id": auto_msg.user_id,
                            "admin_id": None,
                            "message": auto_msg.message,
                            "sender_type": "system",
                            "is_read": True,
                            "created_at": auto_msg.created_at.isoformat() if auto_msg.created_at else str(datetime.now())
                        }
                        await manager.broadcast_to_user(user_id, auto_dict)
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, is_admin)

@router.get("/messages/{user_id}", response_model=List[models.SupportMessageResponse])
def get_user_messages(user_id: int, db: Session = Depends(database.get_db)):
    """Get message history for a specific user"""
    messages = db.query(sql_models.SupportMessage).filter(
        sql_models.SupportMessage.user_id == user_id
    ).order_by(sql_models.SupportMessage.created_at.asc()).all()
    
    res = []
    for msg in messages:
        m_dict = msg.__dict__.copy()
        if m_dict.get('created_at'):
             m_dict['created_at'] = m_dict['created_at'].isoformat()
        res.append(models.SupportMessageResponse(**m_dict))
    
    return res

@router.get("/active-chats")
def get_active_chats(db: Session = Depends(database.get_db)):
    """Get list of users with messages, prioritizing users with unread messages"""
    messages = db.query(sql_models.SupportMessage).order_by(
        desc(sql_models.SupportMessage.created_at)
    ).all()
    
    # Manual grouping by user_id
    chats_map = {}
    for msg in messages:
        uid = msg.user_id
        if uid not in chats_map:
            user = db.query(sql_models.User).filter(sql_models.User.id == uid).first()
            if not user:
                continue
                
            chats_map[uid] = {
                "user_id": uid,
                "full_name": user.full_name,
                "email": user.email,
                "last_message": msg.message,
                "last_message_time": msg.created_at.isoformat() if msg.created_at else None,
                "unread_count": 0
            }
        
        if not msg.is_read and msg.sender_type == "user":
            chats_map[uid]["unread_count"] += 1
            
    # Sort: unread first, then by latest message time
    chat_list = list(chats_map.values())
    chat_list.sort(key=lambda x: (x["unread_count"] > 0, x["last_message_time"]), reverse=True)
    
    return chat_list

@router.post("/messages/{user_id}/read")
def mark_messages_as_read(user_id: int, db: Session = Depends(database.get_db)):
    """Mark all admin/system messages as read (called by user when opening widget)"""
    db.query(sql_models.SupportMessage).filter(
        sql_models.SupportMessage.user_id == user_id,
        sql_models.SupportMessage.sender_type.in_(['admin', 'system']),
        sql_models.SupportMessage.is_read == False
    ).update({"is_read": True}, synchronize_session='fetch')
    db.commit()
    return {"status": "success"}

@router.get("/quota/{user_id}", response_model=models.QuotaResponse)
def get_user_quota(user_id: int, db: Session = Depends(database.get_db)):
    """Get remaining daily message quota for a user"""
    user = db.query(sql_models.User).filter(sql_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.plan == "pro":
        return models.QuotaResponse(remaining=-1, limit=-1)
    
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_count = db.query(func.count(sql_models.SupportMessage.id)).filter(
        sql_models.SupportMessage.user_id == user_id,
        sql_models.SupportMessage.sender_type == "user",
        sql_models.SupportMessage.created_at >= today_start
    ).scalar() or 0
    
    remaining = max(0, FREE_DAILY_LIMIT - today_count)
    return models.QuotaResponse(remaining=remaining, limit=FREE_DAILY_LIMIT)

@router.get("/unread-count/{user_id}", response_model=models.UnreadCountResponse)
def get_unread_count(user_id: int, db: Session = Depends(database.get_db)):
    """Get count of unread messages from admin/system for a user"""
    count = db.query(func.count(sql_models.SupportMessage.id)).filter(
        sql_models.SupportMessage.user_id == user_id,
        sql_models.SupportMessage.sender_type.in_(['admin', 'system']),
        sql_models.SupportMessage.is_read == False
    ).scalar() or 0
    return models.UnreadCountResponse(unread_count=count)
