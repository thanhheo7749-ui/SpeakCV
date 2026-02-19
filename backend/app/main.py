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

# --- IMPORT CÁC MODULE ---
from . import models, utils               # Import file models.py và utils.py cùng cấp
from .database import sql_models          # Import file sql_models.py trong thư mục database
from .database.database import engine, get_db  # Import engine và get_db từ database.py
from .auth import security                # Import security.py từ thư mục auth

load_dotenv()

# Tạo bảng trong Database (Tự động chạy khi server khởi động)
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

# --- API CHAT (Sửa lỗi NameError ở đây) ---
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
            system_prompt = f"Bạn là nhà tuyển dụng chuyên nghiệp. Vị trí: {request.jd_text}. Mode: {request.mode}. Tự sửa lỗi chính tả từ giọng nói (VD: 'Ria hách'->'React'). Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề (<50 từ), đặt câu hỏi ngắn gọn, dễ hiểu và độ khó cao dần theo thời gian hoặc theo yêu cầu của người phỏng vấn."
            
            data = {
                "model": "gpt-4o-mini", 
                "messages": [
                    {"role": "system", "content": system_prompt}, 
                    {"role": "user", "content": request.user_text}
                ],
                "max_tokens": 250
            }
            
            # TĂNG TIMEOUT LÊN 90 GIÂY NHƯ BẠN YÊU CẦU
            res = requests.post(url, headers=headers, json=data, timeout=90) 
            
            if res.status_code == 200:
                ai_text = res.json()["choices"][0]["message"]["content"]
                if ai_text: 
                    break # Thành công thì thoát vòng lặp ngay
            else:
                # NẾU LỖI, IN THẲNG NGUYÊN NHÂN RA MÀN HÌNH ĐEN
                print(f"⚠️ Lỗi từ Server AI (Mã {res.status_code}): {res.text}")
            
            time.sleep(2) # Nghỉ 2 giây rồi thử gọi lại
            
        except Exception as e: 
            print(f"⚠️ Lỗi Mạng/Timeout (Lần {attempt+1}): {e}")

    # Gán text mặc định nếu cả 3 lần đều xịt
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

# --- API HINT (Sửa lỗi NameError) ---
@app.post("/api/hint")
async def get_hint(request: models.HintRequest): # <--- Đã thêm 'models.'
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "free/gpt-5-mini", "messages": [{"role": "system", "content": "Gợi ý 3 ý ngắn."}, {"role": "user", "content": f"Câu hỏi: {request.last_question}. JD: {request.jd_text}"}] }
        res = requests.post(url, headers=headers, json=data, timeout=30)
        return {"hint": res.json()["choices"][0]["message"]["content"]}
    except: return {"hint": "Không lấy được gợi ý."}

# --- API REPORT (Sửa lỗi NameError) ---
@app.post("/api/end-interview")
async def end_interview(request: models.ReportRequest): # <--- Đã thêm 'models.'
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        system_prompt = f"Chấm điểm phỏng vấn (Thang 10). JD: {request.jd_text}. Output HTML Body Only (dùng TailwindCSS đẹp)."
        data = { "model": "free/gpt-5", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.history}] }
        res = requests.post(url, headers=headers, json=data, timeout=90)
        return {"report": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"report": "<p>Lỗi chấm điểm.</p>"}

# --- API GEN CV (Sửa lỗi NameError) ---
@app.post("/api/generate-cv")
async def generate_cv(request: models.CVGenRequest): # <--- Đã thêm 'models.'
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "free/gpt-5", "messages": [{"role": "system", "content": f"Viết CV HTML cho {request.position} tại {request.company}."}, {"role": "user", "content": request.user_info}] }
        res = requests.post(url, headers=headers, json=data, timeout=120)
        return {"content": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"content": "<p>Lỗi tạo CV.</p>"}

# --- API REVIEW CV ---
@app.post("/api/review-cv")
async def review_cv(file: UploadFile = File(...), company: str = Form("Công ty chung")):
    try:
        content = await file.read()
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        messages = [{"role": "user", "content": "Review CV này. Output HTML."}]
        
        # Gọi hàm từ utils.py
        if file.filename.lower().endswith(('.jpg', '.png')):
            base64_image = base64.b64encode(utils.compress_image(content)).decode('utf-8')
            messages[0]["content"] = [{"type": "text", "text": "Review CV. Output HTML."}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]
        else:
            messages[0]["content"] = f"Review CV:\n{utils.extract_text_from_file(content, file.filename)}"

        res = requests.post(url, headers=headers, json={"model": "free/gpt-5", "messages": messages}, timeout=90)
        return {"review": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"review": "<p>Lỗi đọc CV.</p>"}