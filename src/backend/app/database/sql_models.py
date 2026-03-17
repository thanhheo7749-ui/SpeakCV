# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Date, Boolean
from sqlalchemy.sql import func
from .database import Base

# 1. Users table (login credentials only)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    hashed_password = Column(String(255))
    role = Column(String(50), default="user")
    credits = Column(Integer, default=50)
    plan = Column(String(20), default="free")
    last_token_reset_date = Column(Date, default=func.current_date())

# 2. UserProfile table (detailed user info)
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

# 3. Experience table
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

# 4. Education table
class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    school_name = Column(String(255))
    degree = Column(String(255))
    major = Column(String(255))
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

# 5. Interview history table
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

# 6. JD Templates table
class JDTemplate(Base):
    __tablename__ = "jd_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 7. System config table
class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, index=True)
    setting_value = Column(Text)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# 8. Transaction history table (credits)
class TransactionHistory(Base):
    __tablename__ = "transaction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    transaction_type = Column(String(50)) # e.g. 'add_credits', 'consume_credits'
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 9. Support messages table (live support)
class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    admin_id = Column(Integer, nullable=True) # ID of the responding admin, if any
    message = Column(Text)
    sender_type = Column(String(20)) # 'user' or 'admin'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 10. Transactions table (VNPAY)
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    amount = Column(Integer)
    txn_ref = Column(String(100), unique=True, index=True)
    status = Column(String(50), default="pending") # 'pending', 'success', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 11. Company Questions table (crowdsourced interview questions)
class CompanyQuestion(Base):
    __tablename__ = "company_questions"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), index=True)
    position = Column(String(200))
    question_text = Column(Text)
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_approved = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
