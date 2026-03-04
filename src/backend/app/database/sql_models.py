# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Date, Boolean
from sqlalchemy.sql import func
from .database import Base

# 1. Bảng Users (Chỉ chứa thông tin đăng nhập)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    hashed_password = Column(String(255))
    role = Column(String(50), default="user")
    credits = Column(Integer, default=50) # Đổi default thành 50 cho khớp với logic Free
    last_token_reset_date = Column(Date, default=func.current_date())

# 2. Bảng UserProfile (Thông tin chi tiết)
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    avatar = Column(Text, nullable=True)

# 3. Bảng Kinh nghiệm (Experience)
class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    company_name = Column(String(255))
    position = Column(String(255))
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

# 4. Bảng Học vấn (Education)
class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    school_name = Column(String(255))
    degree = Column(String(255))
    major = Column(String(255))
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

# 5. Bảng Lịch sử phỏng vấn
class InterviewHistory(Base):
    __tablename__ = "interview_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=True)
    position = Column(String(255))
    score = Column(Float)
    overall_feedback = Column(Text)
    details = Column(JSON)
    interview_type = Column(String(50), default="free")
    question_limit = Column(Integer, default=0)
    time_limit = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 6. BẢNG QUẢN LÝ JD MẪU
class JDTemplate(Base):
    __tablename__ = "jd_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 7. BẢNG CẤU HÌNH HỆ THỐNG
class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, index=True)
    setting_value = Column(Text)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# 8. BẢNG LỊCH SỬ GIAO DỊCH (CREDIT)
class TransactionHistory(Base):
    __tablename__ = "transaction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    transaction_type = Column(String(50)) # VD: 'add_credits', 'consume_credits'
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())