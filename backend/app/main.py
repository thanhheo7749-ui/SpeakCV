import os
import io
import urllib.parse
import requests
import time
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
from dotenv import load_dotenv
import base64
from sqlalchemy.orm import Session
from .routers import profile
from .routers.profile import get_current_user
import json
# --- IMPORT CÁC MODULE ---
from . import models, utils               
from .database import sql_models          
from .database.database import engine, get_db  
from .auth import security                

load_dotenv()

# Tạo bảng trong Database
sql_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(profile.router)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],       
    allow_headers=["*"],
    expose_headers=["X-AI-Response-Text"]
)

api_key = os.getenv("OPENAI_API_KEY")

# --- API ĐĂNG KÝ (AUTH) ---
@app.post("/api/register")
def register(user: models.UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra email trùng
    db_user = db.query(sql_models.User).filter(sql_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng")
    
    # Tạo user mới
    hashed_pw = security.get_password_hash(user.password)
    new_user = sql_models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"message": "Đăng ký thành công"}

# --- API ĐĂNG NHẬP (AUTH) ---
@app.post("/api/login", response_model=models.Token)
def login(user_data: models.UserLogin, db: Session = Depends(get_db)):
    user = db.query(sql_models.User).filter(sql_models.User.email == user_data.email).first()
    if not user or not security.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")
    
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name}

# --- API CHAT ---
@app.post("/api/chat")
async def chat(request: models.ChatRequest):
    print(f"\n📩 User: {request.user_text} | Voice: {request.voice_id}")
    
    if not api_key: 
        print("❌ LỖI NGHIÊM TRỌNG: Chưa có OPENAI_API_KEY trong file .env")
        raise HTTPException(status_code=500, detail="Chưa có API Key")

    ai_text = ""
    
    # Tăng thời gian chờ và thử lại 3 lần
    for attempt in range(3):
        try:
            print(f"⏳ Đang gọi AI (Lần {attempt + 1})... Vui lòng đợi.")
            
            url = "https://newapi.ccfilm.online/v1/chat/completions"
            headers = { 
                "Authorization": f"Bearer {api_key}", 
                "Content-Type": "application/json" 
            }
            system_prompt = f"Bạn là nhà tuyển dụng chuyên nghiệp. Vị trí: {request.jd_text}. Mode: {request.mode}. Tự sửa lỗi chính tả từ giọng nói (VD: 'Ria hách'->'React'). Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề (<50 từ), đặt câu hỏi ngắn gọn, dễ hiểu và độ khó cao dần theo thời gian hoặc theo yêu cầu của người phỏng vấn. Bạn sẽ từ chối mọi yêu cầu nào không liên quan đến vấn đề phỏng vấn."
            
            data = {
                "model": "gpt-4o-mini", 
                "messages": [
                    {"role": "system", "content": system_prompt}, 
                    {"role": "user", "content": request.user_text}
                ],
                "max_tokens": 250
            }
            
            res = requests.post(url, headers=headers, json=data, timeout=90) 
            
            if res.status_code == 200:
                ai_text = res.json()["choices"][0]["message"]["content"]
                if ai_text: 
                    break
            else:
                print(f"⚠️ Lỗi từ Server AI (Mã {res.status_code}): {res.text}")
            
            time.sleep(2)
            
        except Exception as e: 
            print(f"⚠️ Lỗi Mạng/Timeout (Lần {attempt+1}): {e}")

    ai_text = str(ai_text).strip() or "Mạng đang lag, bạn nói lại giúp mình nhé."
    print(f"✅ AI: {ai_text}")

    # --- TẠO AUDIO ---
    try:
        voice = request.voice_id if not request.voice_id.startswith("openai-") else "en-US-AndrewMultilingualNeural"
        communicate = edge_tts.Communicate(ai_text, voice)
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio": audio_stream.write(chunk["data"])
        audio_stream.seek(0)
        return StreamingResponse(audio_stream, media_type="audio/mpeg", headers={"X-AI-Response-Text": urllib.parse.quote(ai_text)})
    except Exception as e:
        print(f"❌ Lỗi tạo Âm thanh: {e}")
        return StreamingResponse(io.BytesIO(), media_type="audio/mpeg", headers={"X-AI-Response-Text": urllib.parse.quote("Lỗi âm thanh.")})

# --- API HINT ---
@app.post("/api/hint")
async def get_hint(request: models.HintRequest):
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "gpt-4o", "messages": [{"role": "system", "content": "Gợi ý 3 ý ngắn."}, {"role": "user", "content": f"Câu hỏi: {request.last_question}. JD: {request.jd_text}"}] }
        res = requests.post(url, headers=headers, json=data, timeout=30)
        return {"hint": res.json()["choices"][0]["message"]["content"]}
    except: return {"hint": "Không lấy được gợi ý."}

# --- API REPORT ---
@app.post("/api/end-interview")
async def end_interview(request: models.ReportRequest, current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        
        system_prompt = f"""
        Bạn là HR. Đánh giá ứng viên vị trí: {request.jd_text}.
        DỰA CHÍNH XÁC VÀO LỊCH SỬ PHỎNG VẤN. QUY TẮC TỐI THƯỢNG:
        1. TUYỆT ĐỐI KHÔNG tự bịa ra câu trả lời của ứng viên.
        2. Nếu trong lịch sử AI vừa hỏi mà ứng viên chưa có câu trả lời nào bên dưới, hãy ghi vào candidate_answer là "Ứng viên chưa trả lời" và không trừ điểm câu đó.
        
        BẮT BUỘC trả về JSON (không có markdown):
        {{
            "score": <điểm float 1-10>,
            "overall_feedback": "<Nhận xét tổng quan>",
            "details": [
                {{
                    "question": "<Câu AI hỏi>",
                    "candidate_answer": "<Trích dẫn ĐÚNG LỜI ứng viên. Nếu không có, ghi 'Ứng viên chưa trả lời'>",
                    "evaluation": "<Nhận xét chi tiết>",
                    "ideal_answer": "<Câu trả lời mẫu>"
                }}
            ]
        }}
        """
        
        data = { 
            "model": "gpt-4o-mini", 
            "response_format": { "type": "json_object" },
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": f"Lịch sử:\n{request.history}"}],
            "temperature": 0.2
        }
        
        res = requests.post(url, headers=headers, json=data, timeout=90)
        
        if res.status_code == 200:
            report_data = json.loads(res.json()["choices"][0]["message"]["content"])
            
            # --- LƯU VÀO DATABASE ---
            new_history = sql_models.InterviewHistory(
                user_id=current_user.id,
                position=request.position,
                score=report_data.get("score", 0),
                overall_feedback=report_data.get("overall_feedback", ""),
                details=report_data.get("details", [])
            )
            db.add(new_history)
            db.commit()
            
            return {"report": report_data}
        else:
            return {"report": {"score": 0, "overall_feedback": "Lỗi từ Server AI.", "details": []}}
            
    except Exception as e: 
        print(f"❌ Lỗi Report: {e}")
        return {"report": {"score": 0, "overall_feedback": "Lỗi hệ thống.", "details": []}}

# --- API GEN CV ---
@app.post("/api/generate-cv")
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

# --- API REVIEW CV ---
@app.post("/api/review-cv")
async def review_cv(file: UploadFile = File(...), company: str = Form("Công ty chung")):
    try:
        print(f"⏳ Đang đọc file CV: {file.filename}")
        content = await file.read()
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        messages = [{"role": "system", "content": "Review CV này. Output HTML."}]
        
        # Bóc tách text hoặc xử lý ảnh
        if file.filename.lower().endswith(('.jpg', '.png', '.jpeg')):
            base64_image = base64.b64encode(utils.compress_image(content)).decode('utf-8')
            messages[0]["content"] = [{"type": "text", "text": "Review CV. Output HTML."}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]
        else:
            extracted_text = utils.extract_text_from_file(content, file.filename)
            messages[0]["content"] = f"Review CV:\n{extracted_text}"

        res = requests.post(url, headers=headers, json={"model": "gpt-4o", "messages": messages}, timeout=90)
        
        if res.status_code == 200:
            print("✅ Review CV thành công!")
            return {"review": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
        else:
            print(f"⚠️ Lỗi từ AI: {res.text}")
            return {"review": f"<p>Lỗi kết nối AI: {res.status_code}</p>"}
            
    except Exception as e: 
        print(f"❌ LỖI ĐỌC CV: {e}")
        return {"review": f"<p>Lỗi đọc CV: {e}</p>"}

# --- LẤY LỊCH SỬ PHỎNG VẤN ---
@app.get("/api/history")
async def get_interview_history(current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Lấy danh sách lịch sử, sắp xếp mới nhất lên đầu
    histories = db.query(sql_models.InterviewHistory).filter(sql_models.InterviewHistory.user_id == current_user.id).order_by(sql_models.InterviewHistory.created_at.desc()).all()
    return {"histories": histories}