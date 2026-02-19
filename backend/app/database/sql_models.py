from sqlalchemy import Column, Integer, String, Text, Boolean, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

# 1. Bảng Users (Chỉ chứa thông tin đăng nhập)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    hashed_password = Column(String(255))
    role = Column(String(50), default="user")

# 2. Bảng UserProfile (Thông tin chi tiết)
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Lưu ý: Map thủ công, không dùng ForeignKey để tránh lỗi ràng buộc chặt nếu chưa cần thiết
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # <--- Cột skills nằm ở đây

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