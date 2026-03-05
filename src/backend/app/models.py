# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from typing import List, Optional
from pydantic import BaseModel
from datetime import date

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

class ExperienceCreate(BaseModel):
    company_name: str
    position: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None

class EducationCreate(BaseModel):
    school_name: str
    degree: str
    major: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ChatRequest(BaseModel):
    user_text: str
    jd_text: str = "" 
    voice_id: str = "en-US-AndrewMultilingualNeural"
    mode: str = "general"
    chat_history: list = []

class HintRequest(BaseModel):
    last_question: str
    jd_text: str = ""

class ReportRequest(BaseModel):
    history: str
    jd_text: str = ""
    position: str = "Chưa xác định"
    history_id: Optional[int] = None
    interview_type: str = "free"
    question_limit: int = 0
    time_limit: int = 0

class CVGenRequest(BaseModel):
    user_info: str
    position: str
    company: str
    style_instruction: str = ""

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    credits: int = 100

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str = "user"

class RenameRequest(BaseModel):
    title: str

class JDTemplateRequest(BaseModel):
    title: str
    description: str

class AddCreditRequest(BaseModel):
    amount: int

class SystemConfigUpdate(BaseModel):
    system_prompt: str
    temperature: float

class SupportMessageCreate(BaseModel):
    message: str

class SupportMessageResponse(BaseModel):
    id: int
    user_id: int
    admin_id: Optional[int] = None
    message: str
    sender_type: str
    is_read: bool
    created_at: str  

    class Config:
        from_attributes = True
