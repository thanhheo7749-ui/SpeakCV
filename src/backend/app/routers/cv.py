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


