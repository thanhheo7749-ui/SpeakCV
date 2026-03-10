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
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        
        system_prompt = f"Viết CV HTML cho {request.position} tại {request.company}. {request.style_instruction}"
        data = { "model": "gpt-4o", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.user_info}] }
        
        res = requests.post(url, headers=headers, json=data, timeout=120)
        
        if res.status_code == 200:
            print("✅ CV generated successfully!")
            return {"content": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
        else:
            print(f"⚠️ AI error: {res.text}")
            return {"content": f"<p>AI connection error: {res.status_code}</p>"}
            
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
                    yield f"AI Server error: {res.status_code}"
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
                yield f"\n\n**Error during report generation:** {str(e)}"

        print("✅ Starting CV Review stream!")
        return StreamingResponse(chunk_generator(), media_type="text/event-stream")
            
    except Exception as e: 
        print(f"❌ CV READ ERROR: {e}")
        return StreamingResponse(iter([f"CV read error: {str(e)}"]), media_type="text/event-stream")

MOCK_JOBS = [
    {
        "company": "VNG Corporation",
        "role": "Python/FastAPI Developer",
        "requirements": "3+ years Python, FastAPI experience, build scalable API, microservices. Strong SQL/NoSQL.",
        "salary": "$1500 - $2500",
        "logo_url_fake": "https://img.logo.dev/vng.com.vn?token=pk_nO3R-BWeSVm-nFT_X-uBIA"
    },
    {
        "company": "FPT Software",
        "role": "ReactJS Developer",
        "requirements": "Strong in React, Next.js, Redux, Tailwind CSS. Experience with REST APIs and Frontend optimization.",
        "salary": "$1000 - $2000",
        "logo_url_fake": "https://img.logo.dev/fpt.vn?token=pk_nO3R-BWeSVm-nFT_X-uBIA"
    },
    {
        "company": "Shopee",
        "role": "Data Analyst",
        "requirements": "SQL, Python for Data Analysis, Tableau/PowerBI. Ability to translate data to business insights.",
        "salary": "$1200 - $2200",
        "logo_url_fake": "https://img.logo.dev/shopee.vn?token=pk_nO3R-BWeSVm-nFT_X-uBIA"
    },
    {
        "company": "Momo",
        "role": "Backend Engineer (Java/Go)",
        "requirements": "High performance backend systems, Java Spring Boot or Golang, Redis, Kafka, Distributed systems.",
        "salary": "Up to $3000",
        "logo_url_fake": "https://img.logo.dev/momo.vn?token=pk_nO3R-BWeSVm-nFT_X-uBIA"
    },
    {
        "company": "Tiki",
        "role": "Fullstack Developer",
        "requirements": "Node.js (NestJS) + React. E-commerce backend experience is a plus. Docker, k8s.",
        "salary": "$1500 - $2800",
        "logo_url_fake": "https://img.logo.dev/tiki.vn?token=pk_nO3R-BWeSVm-nFT_X-uBIA"
    }
]

@router.post("/api/jobs/match")
async def match_jobs(file: UploadFile = File(...)):
    try:
        print(f"⏳ Extracting text from CV for Job Matching: {file.filename}")
        cv_text = await extract_text_from_cv(file)
        
        if not cv_text:
            raise HTTPException(status_code=400, detail="Cannot extract text from CV.")

        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        
        system_prompt = "You are an expert IT Recruiter and ATS system. Your task is to match the candidate's CV with the best suitable jobs from the provided list."
        prompt = f'''Dưới đây là nội dung CV của ứng viên:
{cv_text}

Và đây là danh sách các công việc đang mở:
{json.dumps(MOCK_JOBS, ensure_ascii=False, indent=2)}

Hãy phân tích CV và chọn ra chính xác 2 công việc phù hợp nhất.
Trả về kết quả STRICTLY ở định dạng JSON dạng list các object gồm:
- "company": string
- "role": string
- "match_percentage": number (ví dụ 85)
- "reason": string (1 câu giải thích ngắn gọn tại sao hợp)

CHÚ Ý: Chỉ trả về mảng JSON, KHÔNG BỌC trong markdown ```json, KHÔNG THÊM BẤT KỲ text nào khác.
'''
        
        data = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        
        res = requests.post(url, headers=headers, json=data, timeout=90)
        
        if res.status_code == 200:
            content = res.json()["choices"][0]["message"]["content"].strip()
            # Clean up markdown if AI still outputs it
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            try:
                matched_jobs = json.loads(content)
                # Map back the logo, salary, requirements from MOCK_JOBS
                for job in matched_jobs:
                    for mock_job in MOCK_JOBS:
                        if job.get('company') == mock_job['company'] and job.get('role') == mock_job['role']:
                            job['logo_url'] = mock_job['logo_url_fake']
                            job['salary'] = mock_job['salary']
                            break
                            
                return matched_jobs
            except json.JSONDecodeError as de:
                print(f"JSON Decode Error: {de}. Raw content: {content}")
                return []
        else:
            print(f"⚠️ AI error: {res.text}")
            raise HTTPException(status_code=500, detail="AI Service Error")
            
    except Exception as e:
        print(f"❌ JOB MATCH ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
