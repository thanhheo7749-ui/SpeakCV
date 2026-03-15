# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
import io
import requests
import pdfplumber
import docx
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from dotenv import load_dotenv

from .. import models
from ..ai_service import call_ai_chat, call_ai_chat_stream

load_dotenv() 

router = APIRouter()

async def extract_text_from_cv(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    extracted_text = ""
    
    if filename.endswith(".pdf"):
        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            print(f"PDF read error: {e}")
            raise HTTPException(status_code=400, detail="Cannot read PDF file")
            
    elif filename.endswith(('.doc', '.docx')):
        try:
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        except Exception as e:
            print(f"Word file read error: {e}")
            raise HTTPException(status_code=400, detail="Cannot read Word file")
    else:
        raise HTTPException(status_code=400, detail="Only PDF or Word (DOCX) files are supported.")
        
    return extracted_text.strip()

@router.post("/api/generate-cv")
async def generate_cv(request: models.CVGenRequest): 
    try:
        print(f"⏳ Generating CV for {request.position} | Style: {request.style_instruction}")
        
        system_prompt = f"Viết CV HTML cho {request.position} tại {request.company}. {request.style_instruction}"
        messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.user_info}]
        
        result = call_ai_chat(messages=messages, model="gpt-4o", timeout=120)
        
        print("✅ CV generated successfully!")
        return {"content": result.replace("```html","").replace("```","")}
            
    except Exception as e: 
        print(f"❌ CV GENERATION ERROR: {e}")
        return {"content": f"<p>System error: {e}</p>"}

from fastapi.responses import StreamingResponse
import json

@router.post("/api/review-cv")
async def review_cv(file: UploadFile = File(...), jd_text: str = Form("Không có JD")):
    try:
        print(f"⏳ Extracting text from CV: {file.filename}")
        
        cv_text = await extract_text_from_cv(file)
        
        if not cv_text:
            return {"review": "Cannot extract text from this CV file. Please try another file."}
        
        system_prompt = "You are an expert ATS system. Evaluate the candidate's CV against the JD. Output a beautifully formatted Markdown report in Vietnamese (DO NOT USE JSON). Include these sections: 🎯 Match Percentage (e.g., 85%), 🔑 Missing Keywords, and 📝 Detailed Feedback (Positive & Areas for Improvement). Use emojis, bold text, and bullet points to make it easy to read."
        
        prompt = f"Here is the extracted text from a candidate's CV: {cv_text}.\nHere is the JD: {jd_text}.\nPlease evaluate."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        print("✅ Starting CV Review stream!")
        return StreamingResponse(
            call_ai_chat_stream(messages=messages, model="gpt-4o", timeout=90),
            media_type="text/event-stream"
        )
            
    except Exception as e: 
        print(f"❌ CV READ ERROR: {e}")
        return StreamingResponse(iter([f"CV read error: {str(e)}"]), media_type="text/event-stream")


CV_JSON_SYSTEM_PROMPT = """Bạn là chuyên gia tư vấn CV hàng đầu. Nhiệm vụ của bạn là:
1. PHÂN TÍCH CV gốc: Đưa ra 2-3 điểm mạnh, 2-3 điểm yếu/thiếu sót (ví dụ: thiếu số liệu đo lường, thiếu kỹ năng quan trọng, mô tả chung chung, sai chính tả) và chấm điểm tổng quan (0-100).
2. VIẾT LẠI CV thành phiên bản chuyên nghiệp hơn.

BẮT BUỘC: Trả về KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY, không bọc trong markdown code block, không thêm bất kỳ text nào ngoài JSON.

Schema JSON bắt buộc:
{
  "analysis_feedback": {
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
    "overall_score": 75
  },
  "personal_info": {
    "name": "Họ và tên đầy đủ",
    "title": "Chức danh/Vị trí mong muốn",
    "email": "email nếu có trong CV gốc, hoặc để trống",
    "phone": "số điện thoại nếu có, hoặc để trống",
    "linkedin": "linkedin nếu có, hoặc để trống",
    "location": "địa chỉ/thành phố nếu có, hoặc để trống",
    "summary": "2-3 câu tóm tắt chuyên môn ấn tượng nhất"
  },
  "skills": ["kỹ năng 1", "kỹ năng 2", "...tối đa 10 kỹ năng quan trọng nhất"],
  "experience": [
    {
      "company": "Tên công ty",
      "role": "Vị trí/Chức vụ",
      "period": "MM/YYYY - MM/YYYY hoặc Hiện tại",
      "achievements": ["Thành tựu 1 bắt đầu bằng động từ mạnh", "Thành tựu 2 có số liệu cụ thể"]
    }
  ],
  "education": [
    {
      "school": "Tên trường",
      "degree": "Bằng cấp - Chuyên ngành",
      "period": "YYYY - YYYY"
    }
  ],
  "projects": [
    {
      "name": "Tên dự án",
      "description": "Mô tả ngắn gọn 1-2 câu về dự án và vai trò",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

QUY TẮC PHÂN TÍCH (analysis_feedback):
- strengths: Liệt kê 2-3 điểm mạnh nổi bật của CV gốc (ví dụ: có số liệu cụ thể, bố cục rõ ràng, kỹ năng phù hợp)
- weaknesses: Liệt kê 2-3 điểm yếu/thiếu sót cần cải thiện (ví dụ: thiếu số liệu đo lường, mô tả quá chung chung, thiếu kỹ năng quan trọng, sai chính tả)
- overall_score: Chấm điểm tổng quan từ 0-100 dựa trên chất lượng CV gốc

QUY TẮC VIẾT LẠI CV:
- Giữ lại TẤT CẢ thông tin thực tế từ CV gốc (tên, email, số điện thoại, công ty, trường học...)
- KHÔNG được bịa đặt thông tin không có trong CV gốc
- Viết lại achievements/mô tả cho chuyên nghiệp hơn, dùng động từ mạnh
- Nếu CV gốc không có thông tin cho một field, để string rỗng "" hoặc array rỗng []
- Mỗi achievement nên bắt đầu bằng động từ mạnh và có kết quả đo lường được nếu có thể
"""

CV_INDUSTRY_TONES = {
    "tech": """
PHONG CÁCH NGÀNH TECH/IT:
- Nhấn mạnh Tech Stack, frameworks, tools đã sử dụng
- Tôn vinh việc tối ưu hóa (giảm tải, tăng tốc độ, giảm bug)
- Dùng động từ: Kiến trúc, Triển khai, Tối ưu, Xây dựng, Phát triển
- Kỹ năng nên liệt kê theo nhóm: Languages, Frameworks, DevOps, Databases
""",
    "business": """
PHONG CÁCH NGÀNH KINH TẾ/MARKETING:
- TUYỆT ĐỐI nhấn mạnh Con số: %, VNĐ, USD, tỷ lệ chuyển đổi
- Mọi achievement phải quy về doanh thu, KPI, tiết kiệm chi phí
- Dùng động từ: Thúc đẩy, Đàm phán, Vượt chỉ tiêu, Quản trị, Tăng trưởng
""",
    "creative": """
PHONG CÁCH NGÀNH SÁNG TẠO/THIẾT KẾ:
- Nhấn mạnh Design Thinking, UX, sáng tạo
- Dùng động từ: Sáng tạo, Định hình, Thiết kế, Kể chuyện
- Kỹ năng nên tập trung: Adobe CC, Figma, UI/UX, Branding
""",
    "fresher": """
PHONG CÁCH SINH VIÊN/FRESHER:
- Làm nổi bật Đồ án, Dự án cá nhân, Hoạt động ngoại khóa
- Nhấn mạnh tinh thần ham học hỏi, thái độ cầu tiến
- Dùng động từ: Nghiên cứu, Tổ chức, Đóng góp, Hoàn thành
- Projects section nên được ưu tiên hơn Experience
"""
}


@router.post("/api/cv/upload-makeover")
async def upload_makeover_cv(file: UploadFile = File(...), industry: str = Form("tech")):
    try:
        print(f"⏳ CV Makeover — Extracting text from: {file.filename} | Industry: {industry}")

        cv_text = await extract_text_from_cv(file)

        if not cv_text:
            raise HTTPException(status_code=400, detail="Không thể trích xuất nội dung từ file CV. Vui lòng thử file khác.")

        # Build prompt with industry-specific tone
        industry_tone = CV_INDUSTRY_TONES.get(industry, CV_INDUSTRY_TONES["tech"])
        system_prompt = CV_JSON_SYSTEM_PROMPT + industry_tone

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Đây là nội dung CV cần phân tích và viết lại:\n\n{cv_text}"}
        ]

        result = call_ai_chat(
            messages=messages,
            model="gpt-4o",
            temperature=0.5,
            response_format={"type": "json_object"},
            timeout=120
        )

        # Safety: strip markdown code block wrappers if present
        cleaned = result.strip()
        if cleaned.startswith("```"):
            # Remove ```json ... ``` wrapper
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)

        # Parse and validate with Pydantic
        try:
            cv_json = json.loads(cleaned)
            validated = models.CVMakeoverData(**cv_json)
            cv_data = validated.model_dump()
        except (json.JSONDecodeError, Exception) as parse_err:
            print(f"⚠️ JSON parse/validation error: {parse_err}")
            print(f"Raw AI response: {result[:500]}")
            raise HTTPException(status_code=500, detail=f"AI trả về JSON không hợp lệ. Vui lòng thử lại.")

        print("✅ CV makeover completed (JSON mode)!")
        return {"cv_data": cv_data, "extracted_text": cv_text}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CV MAKEOVER ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Chỉnh sửa CV thất bại: {str(e)}")


CV_TAILOR_SYSTEM_PROMPT = """Bạn là chuyên gia tư vấn CV hàng đầu hệ thống ATS (Applicant Tracking System).
Nhiệm vụ của bạn là tối ưu hóa CV hiện tại của ứng viên để phù hợp nhất với Job Description (JD) được cung cấp.

BẮT BUỘC TUÂN THỦ CÁC RÀO CHẮN TRỌNG YẾU SAU (NẾU VI PHẠM SẼ GÂY HẬU QUẢ NGHIÊM TRỌNG):
1. KHÔNG ĐƯỢC BỊA ĐẶT (NO HALLUCINATION): Tuyệt đối không thêm bất kỳ công ty, dự án, trường học, điểm số, hoặc kinh nghiệm làm việc nào KHÔNG CÓ trong CV gốc.
2. KHÔNG THÊM KỸ NĂNG ẢO: Chỉ được phép viết lại hoặc làm nổi bật những kỹ năng mà ứng viên thực sự có. Không tự tiện thêm "React" nếu CV gốc chỉ có "Vue", trừ khi ý nghĩa hoàn toàn tương đương.
3. CHỈ ĐƯỢC PHÉP:
   - Sắp xếp lại thứ tự ưu tiên (kinh nghiệm/kỹ năng nào sát với JD nhất đưa lên đầu).
   - Tinh chỉnh từ khóa (Keyword matching): Viết lại các mô tả công việc (achievements) để mượt mà hơn và chứa các từ khóa từ JD (nhưng phải giữ nguyên bản chất thực tế).

BẮT BUỘC: Trả về KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY, không bọc trong markdown code block, không thêm bất kỳ text nào ngoài JSON.

Schema JSON bắt buộc (Tương tự CV gốc, CHỈ THAY ĐỔI phần analysis_feedback thành tailor_summary):
{
  "analysis_feedback": {
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
    "overall_score": 85
  },
  "personal_info": { ...giữ nguyên hoặc tinh chỉnh summary... },
  "skills": ["kỹ năng tốt nhất cho JD", "kỹ năng số 2"...],
  "experience": [ ...danh sách kinh nghiệm đã được sắp xếp và tinh chỉnh mô tả... ],
  "education": [ ...giữ nguyên... ],
  "projects": [ ...giữ nguyên hoặc tinh chỉnh mô tả... ]
}

LƯU Ý: Thay vì nhận xét chung chung ở `analysis_feedback`, hãy biến nó thành `tailor_summary` với:
- strengths: Những thay đổi chính bạn đã làm (ví dụ: "Đã làm nổi bật kinh nghiệm ReactJS", "Đưa kỹ năng Quản lý dự án lên đầu")
- weaknesses: Những từ khóa/yêu cầu quan trọng trong JD mà CV CÒN THIẾU (để báo cho ứng viên biết mức độ match)
- overall_score: Độ match của CV (sau khi tối ưu) với JD (0-100)
"""

@router.post("/api/cv/tailor")
async def tailor_cv(request: models.CVTailorRequest):
    try:
        jd_text = request.jd_text.strip()
        if not jd_text:
            raise HTTPException(status_code=400, detail="Không có nội dung Job Description (JD).")
        
        # Truncate JD to prevent token overflow
        if len(jd_text) > 5000:
            jd_text = jd_text[:5000] + "..."
            
        print(f"⏳ CV Tailor — Initiating tailoring for JD length: {len(jd_text)}")
        
        # We enforce JSON string format in prompt
        user_prompt = f"Đây là Job Description (JD):\n\n{jd_text}\n\n---\n\nĐây là CV gốc (JSON) cần được cấu trúc lại và tối ưu:\n\n{json.dumps(request.master_cv_json, ensure_ascii=False)}"
        
        messages = [
            {"role": "system", "content": CV_TAILOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        # Temperature is low (0.3) to minimize hallucination when tailoring true facts
        result = call_ai_chat(
            messages=messages,
            model="gpt-4o",
            temperature=0.3,
            response_format={"type": "json_object"},
            timeout=120
        )
        
        # Safety: strip markdown code block wrappers if present
        cleaned = result.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)
            
        # Parse and validate with Pydantic CVMakeoverData
        try:
            cv_json = json.loads(cleaned)
            validated = models.CVMakeoverData(**cv_json)
            cv_data = validated.model_dump()
            
            # Extract tailor_summary from what we hijacked as analysis_feedback
            tailor_summary = cv_data.get("analysis_feedback", {})
            
        except (json.JSONDecodeError, Exception) as parse_err:
            print(f"⚠️ JSON parse/validation error during tailoring: {parse_err}")
            raise HTTPException(status_code=500, detail="AI trả về JSON không hợp lệ. Vui lòng thử lại.")
            
        print("✅ CV tailor completed!")
        return {"cv_data": cv_data, "tailor_summary": tailor_summary}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CV TAILOR ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Tối ưu CV thất bại: {str(e)}")

