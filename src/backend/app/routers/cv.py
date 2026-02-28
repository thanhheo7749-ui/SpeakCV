import os
import io
import requests
import pdfplumber
import docx
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from dotenv import load_dotenv

from .. import models

load_dotenv() 

router = APIRouter()

api_key = os.getenv("OPENAI_API_KEY")

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
            print(f"Lỗi đọc PDF: {e}")
            raise HTTPException(status_code=400, detail="Không thể đọc file PDF")
            
    elif filename.endswith(('.doc', '.docx')):
        try:
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        except Exception as e:
            print(f"Lỗi đọc file Word: {e}")
            raise HTTPException(status_code=400, detail="Không thể đọc file Word")
    else:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF hoặc Word (DOCX).")
        
    return extracted_text.strip()

@router.post("/api/generate-cv")
async def generate_cv(request: models.CVGenRequest): 
    try:
        print(f"⏳ Đang tạo CV cho {request.position} | Style: {request.style_instruction}")
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        
        system_prompt = f"Viết CV HTML cho {request.position} tại {request.company}. {request.style_instruction}"
        data = { "model": "gpt-4o", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.user_info}] }
        
        res = requests.post(url, headers=headers, json=data, timeout=120)
        
        if res.status_code == 200:
            print("✅ Tạo CV thành công!")
            return {"content": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
        else:
            print(f"⚠️ Lỗi từ AI: {res.text}")
            return {"content": f"<p>Lỗi kết nối AI: {res.status_code}</p>"}
            
    except Exception as e: 
        print(f"❌ LỖI TẠO CV: {e}")
        return {"content": f"<p>Lỗi hệ thống: {e}</p>"}

from fastapi.responses import StreamingResponse
import json

@router.post("/api/review-cv")
async def review_cv(file: UploadFile = File(...), jd_text: str = Form("Không có JD")):
    try:
        print(f"⏳ Đang trích xuất text từ CV: {file.filename}")
        
        cv_text = await extract_text_from_cv(file)
        
        if not cv_text:
            return {"review": "Không thể trích xuất chữ từ file CV này. Vui lòng thử file khác."}
            
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        
        system_prompt = "You are an expert ATS system. Evaluate the candidate's CV against the JD. Output a beautifully formatted Markdown report in Vietnamese (DO NOT USE JSON). Include these sections: 🎯 Match Percentage (e.g., 85%), 🔑 Missing Keywords, and 📝 Detailed Feedback (Positive & Areas for Improvement). Use emojis, bold text, and bullet points to make it easy to read."
        
        prompt = f"Here is the extracted text from a candidate's CV: {cv_text}.\nHere is the JD: {jd_text}.\nPlease evaluate."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        data = {
            "model": "gpt-4o",
            "messages": messages,
            "stream": True
        }
        
        def chunk_generator():
            try:
                res = requests.post(url, headers=headers, json=data, stream=True, timeout=90)
                if res.status_code != 200:
                    yield f"Lỗi từ AI Server: {res.status_code}"
                    return
                    
                for line in res.iter_lines():
                    if line:
                        line_text = line.decode('utf-8')
                        if line_text.startswith("data: ") and line_text != "data: [DONE]":
                            try:
                                chunk_data = json.loads(line_text[6:].strip())
                                choices = chunk_data.get("choices", [])
                                if choices and len(choices) > 0:
                                    delta = choices[0].get("delta", {}).get("content", "")
                                    if delta:
                                        yield delta
                            except json.JSONDecodeError:
                                continue
            except Exception as e:
                yield f"\n\n**Lỗi trong quá trình tạo report:** {str(e)}"

        print("✅ Bắt đầu Stream Review CV!")
        return StreamingResponse(chunk_generator(), media_type="text/event-stream")
            
    except Exception as e: 
        print(f"❌ LỖI ĐỌC CV: {e}")
        return StreamingResponse(iter([f"Lỗi đọc CV: {str(e)}"]), media_type="text/event-stream")
