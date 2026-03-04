import json
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import database, sql_models
from .. import models
from datetime import datetime

router = APIRouter(
    prefix="/api/support",
    tags=["Support"]
)

# Thêm fallback để lấy session database cho websocket, hoặc tự tạo
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Connection Manager cho phần Chat Support
class ConnectionManager:
    def __init__(self):
        # Lưu các kết nối theo user_id
        # Mỗi user_id có thể có nhiều websocket (nếu mở nhiều tab)
        # Để đơn giản, ta dùng list
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Kết nối của Admin, chung 1 "kênh"
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
        # Gửi tới các cửa sổ của user
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)
        
    async def broadcast_to_admins(self, message: dict):
        # Gửi tới tất cả admin đang mở tab support
        for connection in self.admin_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# ==== WEBSOCKET ENDPOINTS ====
@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, db: Session = Depends(get_db)):
    # Phân loại client_id:
    # - Nếu là "admin", coi như admin kết nối
    # - Nếu là số (vd "12"), coi như user kết nối
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
    try:
        while True:
            # Nhận data text
            data = await websocket.receive_text()
            # Parse json {"message": "hello", "target_user_id": 12 (chỉ admin cần báo cho biết gửi đến ai)}
            try:
                payload = json.loads(data)
                text_msg = payload.get("message", "")
                
                if not text_msg.strip():
                    continue
                
                # Lưu vào DB
                db_message = sql_models.SupportMessage(
                    user_id=user_id if not is_admin else payload.get("target_user_id"),
                    admin_id=None if not is_admin else 1, # Tạm cứng admin ID hoặc lấy từ token
                    message=text_msg,
                    sender_type="admin" if is_admin else "user",
                    is_read=is_admin # Nếu admin gửi, coi như đã đọc vì user đang chờ
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
                
                # Gửi đi
                if is_admin:
                    # Truyền thông tin xuống admin và sang cho user
                    await manager.broadcast_to_user(db_message.user_id, msg_dict)
                    await manager.broadcast_to_admins(msg_dict)
                else:
                    # User gửi: gửi lại cho chính họ và đẩy lên cho tất cả Admins
                    await manager.broadcast_to_user(user_id, msg_dict)
                    await manager.broadcast_to_admins(msg_dict)
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, is_admin)

# ==== REST API ====

@router.get("/messages/{user_id}", response_model=List[models.SupportMessageResponse])
def get_user_messages(user_id: int, db: Session = Depends(database.get_db)):
    """Lấy lịch sử tin nhắn của 1 User"""
    messages = db.query(sql_models.SupportMessage).filter(
        sql_models.SupportMessage.user_id == user_id
    ).order_by(sql_models.SupportMessage.created_at.asc()).all()
    
    # Format created_at to string before returning
    res = []
    for msg in messages:
        m_dict = msg.__dict__.copy()
        if m_dict.get('created_at'):
             m_dict['created_at'] = m_dict['created_at'].isoformat()
        res.append(models.SupportMessageResponse(**m_dict))
    
    return res

@router.get("/active-chats")
def get_active_chats(db: Session = Depends(database.get_db)):
    """Lấy danh sách các users đang có tin nhắn (nhóm theo user), ưu tiên user có tin nhắn chưa đọc từ phía user"""
    # Một query đơn giản để lấy những messages mới nhất của từng user
    # Do SQLite/MySQL có chút khác biệt group by, ta fetch raw logic
    
    messages = db.query(sql_models.SupportMessage).order_by(
        desc(sql_models.SupportMessage.created_at)
    ).all()
    
    # Nhóm thủ công (bởi bảng messages thường không quá lớn hoẵc có thể tối ưu DB sau)
    chats_map = {}
    for msg in messages:
        uid = msg.user_id
        if uid not in chats_map:
            # Lấy thông tin user
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
            
    # Chuyển thành list và sort: Có unread lên trước, sau đó ngày mới nhất
    chat_list = list(chats_map.values())
    chat_list.sort(key=lambda x: (x["unread_count"] > 0, x["last_message_time"]), reverse=True)
    
    return chat_list

@router.post("/messages/{user_id}/read")
def mark_messages_as_read(user_id: int, db: Session = Depends(database.get_db)):
    """Admin gọi hàm này để đánh dấu các tin nhắn của user là đã đọc"""
    db.query(sql_models.SupportMessage).filter(
        sql_models.SupportMessage.user_id == user_id,
        sql_models.SupportMessage.sender_type == 'user',
        sql_models.SupportMessage.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}
