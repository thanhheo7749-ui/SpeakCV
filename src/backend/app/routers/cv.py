# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import io
import json

import pdfplumber
import docx
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

from .. import models
from ..ai_service import call_ai_chat, call_ai_chat_stream
from .cv_prompts import CV_JSON_SYSTEM_PROMPT, CV_INDUSTRY_TONES, CV_TAILOR_SYSTEM_PROMPT

router = APIRouter()


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

async def extract_text_from_cv(file: UploadFile) -> str:
    """Extract plain text from PDF or Word (DOCX) CV files."""
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


def strip_markdown_wrapper(text: str) -> str:
    """Remove ```json ... ``` wrappers that LLMs sometimes add despite instructions."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    return cleaned


def parse_and_validate_cv(raw_text: str) -> dict:
    """Parse AI response text into validated CVMakeoverData dict."""
    cleaned = strip_markdown_wrapper(raw_text)
    cv_json = json.loads(cleaned)
    validated = models.CVMakeoverData(**cv_json)
    return validated.model_dump()


# ──────────────────────────────────────────────
# Routes — CV Generation (HTML)
# ──────────────────────────────────────────────

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


# ──────────────────────────────────────────────
# Routes — CV Review (ATS Scoring, Streaming)
# ──────────────────────────────────────────────

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


# ──────────────────────────────────────────────
# Routes — CV Makeover (AI Rewrite → JSON)
# ──────────────────────────────────────────────

@router.post("/api/cv/upload-makeover")
async def upload_makeover_cv(file: UploadFile = File(...), industry: str = Form("tech")):
    try:
        print(f"⏳ CV Makeover — Extracting text from: {file.filename} | Industry: {industry}")

        cv_text = await extract_text_from_cv(file)

        if not cv_text:
            raise HTTPException(status_code=400, detail="Không thể trích xuất nội dung từ file CV. Vui lòng thử file khác.")

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

        try:
            cv_data = parse_and_validate_cv(result)
        except (json.JSONDecodeError, Exception) as parse_err:
            print(f"⚠️ JSON parse/validation error: {parse_err}")
            print(f"Raw AI response: {result[:500]}")
            raise HTTPException(status_code=500, detail="AI trả về JSON không hợp lệ. Vui lòng thử lại.")

        print("✅ CV makeover completed (JSON mode)!")
        return {"cv_data": cv_data, "extracted_text": cv_text}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CV MAKEOVER ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Chỉnh sửa CV thất bại: {str(e)}")


# ──────────────────────────────────────────────
# Routes — CV Tailor (Optimize CV for JD)
# ──────────────────────────────────────────────

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
        
        user_prompt = f"Đây là Job Description (JD):\n\n{jd_text}\n\n---\n\nĐây là CV gốc (JSON) cần được cấu trúc lại và tối ưu:\n\n{json.dumps(request.master_cv_json, ensure_ascii=False)}"
        
        messages = [
            {"role": "system", "content": CV_TAILOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        result = call_ai_chat(
            messages=messages,
            model="gpt-4o",
            temperature=0.3,
            response_format={"type": "json_object"},
            timeout=120
        )
        
        try:
            cleaned = strip_markdown_wrapper(result)
            raw_json = json.loads(cleaned)
            
            # Extract analysis data from raw response BEFORE Pydantic validation
            # (Pydantic defaults empty fields, which would lose the AI's actual scores)
            tailor_summary = raw_json.get("analysis_feedback") or raw_json.get("tailor_summary") or {}
            
            # Validate and normalize CV data via Pydantic model
            validated = models.CVMakeoverData(**raw_json)
            cv_data = validated.model_dump()
        except (json.JSONDecodeError, Exception) as parse_err:
            print(f"⚠️ JSON parse/validation error during tailoring: {parse_err}")
            print(f"Raw AI response: {result[:500]}")
            raise HTTPException(status_code=500, detail="AI trả về JSON không hợp lệ. Vui lòng thử lại.")
            
        print(f"✅ CV tailor completed! Score: {tailor_summary.get('overall_score', 'N/A')}%")
        return {"cv_data": cv_data, "tailor_summary": tailor_summary}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CV TAILOR ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Tối ưu CV thất bại: {str(e)}")
