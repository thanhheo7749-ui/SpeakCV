from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Bổ sung import models (chứa JDTemplateRequest)
from .. import models 
from ..database import sql_models
from ..database.database import get_db
from .profile import get_current_user

router = APIRouter()

# 1. API DASHBOARD TỔNG QUAN
@router.get("/api/admin/dashboard")
async def get_admin_dashboard(current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập trang này!")

    total_users = db.query(sql_models.User).count()
    total_interviews = db.query(sql_models.InterviewHistory).count()
    
    estimated_total_tokens = total_interviews * 2500 
    
    users = db.query(sql_models.User).order_by(sql_models.User.id.desc()).all()
    user_list = []
    
    for u in users:
        user_interview_count = db.query(sql_models.InterviewHistory).filter(sql_models.InterviewHistory.user_id == u.id).count()
        
        user_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "interview_count": user_interview_count,
            "tokens_used": user_interview_count * 2500,
            "credits": u.credits 
        })

    return {
        "stats": {
            "total_users": total_users,
            "total_interviews": total_interviews,
            "total_tokens": estimated_total_tokens 
        },
        "users": user_list
    }

# 1.5. API CẤU HÌNH HỆ THỐNG (SYSTEM CONFIG)
@router.get("/api/admin/config")
async def get_system_config(
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    prompt_config = db.query(sql_models.SystemConfig).filter_by(setting_key="system_prompt").first()
    temp_config = db.query(sql_models.SystemConfig).filter_by(setting_key="temperature").first()

    return {
        "system_prompt": prompt_config.setting_value if prompt_config else "Bạn là một Giám đốc Nhân sự (HR) chuyên nghiệp...",
        "temperature": float(temp_config.setting_value) if temp_config else 0.7
    }

@router.put("/api/admin/config")
async def update_system_config(
    request: models.SystemConfigUpdate,
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")

    prompt_config = db.query(sql_models.SystemConfig).filter_by(setting_key="system_prompt").first()
    if not prompt_config:
        prompt_config = sql_models.SystemConfig(setting_key="system_prompt", setting_value=request.system_prompt)
        db.add(prompt_config)
    else:
        prompt_config.setting_value = request.system_prompt

    temp_config = db.query(sql_models.SystemConfig).filter_by(setting_key="temperature").first()
    if not temp_config:
        temp_config = sql_models.SystemConfig(setting_key="temperature", setting_value=str(request.temperature))
        db.add(temp_config)
    else:
        temp_config.setting_value = str(request.temperature)

    db.commit()
    return {"message": "Cập nhật cấu hình thành công!"}

# 2. API SYSTEM-WIDE INTERVIEW HISTORY
@router.get("/api/admin/interviews")
async def get_all_interviews(
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    interviews = db.query(
        sql_models.InterviewHistory, 
        sql_models.User.email, 
        sql_models.User.full_name
    ).join(
        sql_models.User, sql_models.User.id == sql_models.InterviewHistory.user_id
    ).order_by(
        sql_models.InterviewHistory.created_at.desc()
    ).all()
    
    result = []
    for hist, email, full_name in interviews:
        result.append({
            "id": hist.id,
            "user_email": email,
            "user_name": full_name,
            "position": hist.position,
            "score": hist.score,
            "title": hist.title,
            "details": hist.details,
            "created_at": hist.created_at
        })
        
    return {"interviews": result}

# 3. API QUẢN LÝ THƯ VIỆN JD MẪU
# Lấy danh sách tất cả JD mẫu
@router.get("/api/templates")
async def get_jd_templates(db: Session = Depends(get_db)):
    templates = db.query(sql_models.JDTemplate).order_by(sql_models.JDTemplate.created_at.desc()).all()
    return {"templates": templates}

# Tạo mới một JD mẫu
@router.post("/api/admin/templates")
async def create_jd_template(
    request: models.JDTemplateRequest, 
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    new_template = sql_models.JDTemplate(
        title=request.title,
        description=request.description
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return {"message": "Tạo JD mẫu thành công!", "template": new_template}

# Cập nhật JD mẫu
@router.put("/api/admin/templates/{template_id}")
async def update_jd_template(
    template_id: int, 
    request: models.JDTemplateRequest, 
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    template = db.query(sql_models.JDTemplate).filter(sql_models.JDTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Không tìm thấy JD mẫu")
        
    template.title = request.title
    template.description = request.description
    db.commit()
    return {"message": "Cập nhật thành công!"}

# Xóa JD mẫu
@router.delete("/api/admin/templates/{template_id}")
async def delete_jd_template(
    template_id: int, 
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    template = db.query(sql_models.JDTemplate).filter(sql_models.JDTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Không tìm thấy JD mẫu")
        
    db.delete(template)
    db.commit()
    return {"message": "Xóa thành công!"}

# Xóa user 
@router.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int, 
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
    
    # Không cho phép admin tự xóa chính mình bậy bạ
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Bạn không thể tự xóa tài khoản của chính mình!")
        
    user = db.query(sql_models.User).filter(sql_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    db.delete(user)
    db.commit()
    return {"message": "Đã xóa người dùng vĩnh viễn!"}

# 4. BƠM THÊM CREDIT CHO USER (CHỈ ADMIN)
@router.post("/api/admin/users/{user_id}/add-credits")
async def add_user_credits(
    user_id: int, 
    request: models.AddCreditRequest, 
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    user = db.query(sql_models.User).filter(sql_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    # Cộng dồn số credit hiện tại với số tiền admin nhập vào
    user.credits += request.amount

    # Ghi log lịch sử giao dịch
    new_txn = sql_models.TransactionHistory(
        user_id=user.id,
        amount=request.amount,
        transaction_type="add_credits",
        note=f"Admin {current_user.email} cộng thêm {request.amount} credits."
    )
    db.add(new_txn)
    
    db.commit()
    
    return {
        "message": f"Đã cộng thành công {request.amount} credit cho {user.full_name}!",
        "new_credits": user.credits
    }

# 5. API LỊCH SỬ GIAO DỊCH (CREDIT LOGS)
@router.get("/api/admin/transactions")
async def get_admin_transactions(
    current_user: sql_models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thực hiện")
        
    transactions = db.query(
        sql_models.TransactionHistory,
        sql_models.User.email,
        sql_models.User.full_name
    ).join(
        sql_models.User, sql_models.User.id == sql_models.TransactionHistory.user_id
    ).order_by(
        sql_models.TransactionHistory.created_at.desc()
    ).all()
    
    result = []
    for txn, email, full_name in transactions:
        result.append({
            "id": txn.id,
            "user_email": email,
            "user_name": full_name,
            "amount": txn.amount,
            "transaction_type": txn.transaction_type,
            "note": txn.note,
            "created_at": txn.created_at
        })
        
    return {"transactions": result}