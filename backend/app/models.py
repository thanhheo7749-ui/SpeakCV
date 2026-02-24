from typing import List, Optional
from pydantic import BaseModel
from datetime import date

# --- 1. MODEL CHO PROFILE ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[str] = None
    avatar: Optional[str] = None

# --- 2. MODEL CHO KINH NGHIỆM ---
class ExperienceCreate(BaseModel):
    company_name: str
    position: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None

# --- 3. MODEL CHO HỌC VẤN ---
class EducationCreate(BaseModel):
    school_name: str
    degree: str
    major: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

# --- CÁC MODEL CŨ ---
class ChatRequest(BaseModel):
    user_text: str
    jd_text: str = "" 
    voice_id: str = "en-US-AndrewMultilingualNeural"
    mode: str = "general"

class HintRequest(BaseModel):
    last_question: str
    jd_text: str = ""

class ReportRequest(BaseModel):
    history: str
    jd_text: str = ""
    position: str = "Chưa xác định"

class CVGenRequest(BaseModel):
    user_info: str
    position: str
    company: str
    style_instruction: str = ""

# --- THÊM MODEL MỚI CHO AUTH ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str