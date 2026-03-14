# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
import json
import requests
from fastapi import APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from .cv import extract_text_from_cv
from ..ai_service import call_ai_chat

load_dotenv()
router = APIRouter()

MOCK_JOBS = [
    {
        "id": 1,
        "company": "Công ty VNG",
        "role": "Tester",
        "requirements": "2 năm kinh nghiệm Manual Test, viết test case, kiểm thử chức năng/hồi quy/thăm dò trên Web/Mobile. Biết dùng Jira, DevTools. Ưu tiên biết Automation (Selenium, Cypress)."
    },
    {
        "id": 2,
        "company": "Công ty Luật TNHH Everest",
        "role": "Luật sư",
        "requirements": "Có Thẻ luật sư hoặc Chứng chỉ hành nghề. Có kinh nghiệm giải quyết vụ việc dân sự, hình sự. Tư vấn, soạn thảo văn bản pháp lý, tham gia tố tụng."
    },
    {
        "id": 3,
        "company": "Công ty Cổ Phần Quốc tế HOMEFARM",
        "role": "Kế Toán Tổng Hợp",
        "requirements": "Tốt nghiệp ĐH Kế toán/Tài chính, 3 năm kinh nghiệm. Quyết toán thuế, báo cáo tài chính, quản trị doanh thu chi phí, kế toán xuất nhập khẩu (L/C, T/T). Biết tiếng Anh/Trung là lợi thế."
    },
    {
        "id": 4,
        "company": "CÔNG TY CỔ PHẦN SỮA VIỆT NAM (Vinamilk)",
        "role": "Trưởng nhóm Marketing",
        "requirements": "3-5 năm kinh nghiệm Marketing, từng làm FMCG. Xây dựng chiến lược, chạy chiến dịch đa kênh (Facebook, TikTok), quản lý ngân sách ROI, định vị thương hiệu."
    },
    {
        "id": 5,
        "company": "Công ty gia công cơ khí chính xác Sukavina",
        "role": "Kỹ sư cơ khí",
        "requirements": "Đại học chuyên ngành Cơ khí/Chế tạo máy. 3 năm kinh nghiệm thiết kế khuôn, đồ gá. Thành thạo phần mềm 3D/2D (Inventor, Solidworks, AutoCAD). Đọc hiểu bản vẽ, sức bền vật liệu."
    }
]

@router.post("/api/jobs/match")
async def match_jobs(file: UploadFile = File(...)):
    try:
        print(f"⏳ Extracting text from CV for Job Matching: {file.filename}")
        cv_text = await extract_text_from_cv(file)
        
        if not cv_text:
            raise HTTPException(status_code=400, detail="Cannot extract text from CV.")

        prompt = f"Dưới đây là CV ứng viên: {cv_text}. Và danh sách 5 công việc: {MOCK_JOBS}. Hãy chọn ra 2 công việc PHÙ HỢP NHẤT với CV này. Trả về kết quả STRICTLY dưới dạng JSON array chứa các object: 'company', 'role', 'match_percentage' (số nguyên), 'reason' (1 câu giải thích tại sao hợp)."
        
        messages = [{"role": "user", "content": prompt}]
        
        content = call_ai_chat(
            messages=messages,
            model="gpt-4o",
            temperature=0.2,
            timeout=90
        )
        
        # Clean up markdown if AI still outputs it
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        try:
            matched_jobs = json.loads(content)
            return matched_jobs
        except json.JSONDecodeError as de:
            print(f"JSON Decode Error: {de}. Raw content: {content}")
            return []
            
    except Exception as e:
        print(f"❌ JOB MATCH ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

