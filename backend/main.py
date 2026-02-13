import os
import io
import urllib.parse
import base64
import requests
import time
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
from dotenv import load_dotenv
import pypdf
from docx import Document
from PIL import Image 

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-AI-Response-Text"]
)

api_key = os.getenv("OPENAI_API_KEY")

# --- GLOBAL ERROR HANDLER ---
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"🔥 LỖI SERVER: {str(exc)}")
    return JSONResponse(status_code=500, content={"message": "Lỗi nội bộ", "detail": str(exc)})

# --- MODELS ---
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

class CVGenRequest(BaseModel):
    user_info: str
    position: str
    company: str

# --- UTILS ---
def compress_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ('RGBA', 'P'): img = img.convert('RGB')
        img.thumbnail((1024, 1024))
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        return buffer.getvalue()
    except: return image_bytes 

def extract_text_from_file(file_content, filename):
    text = ""
    try:
        if filename.endswith(".pdf"):
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted: text += extracted + "\n"
        elif filename.endswith(".docx"):
            doc = Document(io.BytesIO(file_content))
            for para in doc.paragraphs: text += para.text + "\n"
        else:
            text = file_content.decode("utf-8")
    except: pass
    return text

def get_openai_audio(text, voice_id):
    try:
        actual_voice = voice_id.split("-")[1] 
        url = "https://api.openai.com/v1/audio/speech"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "tts-1", "input": text, "voice": actual_voice, "response_format": "mp3" }
        response = requests.post(url, headers=headers, json=data, timeout=30)
        if response.status_code == 200: return io.BytesIO(response.content)
        else: print(f"❌ OpenAI TTS Lỗi: {response.text}")
    except Exception as e: print(f"❌ OpenAI TTS Exception: {e}")
    return None

# --- API CHAT (CƠ CHẾ RETRY & DEBUG) ---
@app.post("/api/chat")
async def chat(request: ChatRequest):
    print(f"\n📩 User: {request.user_text} | Voice: {request.voice_id}")
    
    if not api_key: raise HTTPException(status_code=500, detail="Chưa có API Key")

    ai_text = ""
    
    # --- LOGIC GỌI API (THỬ 3 LẦN NẾU LỖI) ---
    max_retries = 3
    for attempt in range(max_retries):
        try:
            url = "https://newapi.ccfilm.online/v1/chat/completions"
            headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
            
            system_prompt = f"""
            Bạn là chuyên gia tuyển dụng IT. 
            Vị trí: {request.jd_text}. Chế độ: {request.mode}.
            Luật: Tự sửa lỗi chính tả cho ứng viên. Trả lời ngắn gọn (dưới 50 từ).
            """

            data = {
                "model": "free/gpt-5-mini", 
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.user_text}],
                "max_tokens": 250
            }
            
            print(f"🔄 Đang gọi AI (Lần {attempt + 1})...")
            response = requests.post(url, headers=headers, json=data, timeout=45)
            
            if response.status_code == 200:
                result = response.json()
                # Kiểm tra kỹ cấu trúc JSON trả về
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    if content and content.strip():
                        ai_text = content
                        break # Thành công -> Thoát vòng lặp
            
            print(f"⚠️ API Lỗi (Code {response.status_code}): {response.text[:100]}...")
            time.sleep(1) # Nghỉ 1s trước khi thử lại

        except Exception as e:
            print(f"⚠️ Lỗi kết nối (Lần {attempt + 1}): {e}")
            time.sleep(1)

    # --- XỬ LÝ NẾU VẪN THẤT BẠI ---
    if not ai_text or ai_text == "...":
        print("❌ Hết lượt thử: AI không trả lời.")
        ai_text = "Mạng bên mình đang yếu quá, bạn nói lại câu vừa rồi được không?"

    ai_text = str(ai_text).strip()
    print(f"✅ AI Final: {ai_text}")

    # --- TẠO AUDIO ---
    try:
        audio_stream = None
        # Ưu tiên OpenAI
        if request.voice_id.startswith("openai-"):
            print("🔊 Dùng OpenAI TTS...")
            audio_stream = get_openai_audio(ai_text, request.voice_id)
        
        # Fallback EdgeTTS
        if not audio_stream:
            voice = request.voice_id if not request.voice_id.startswith("openai-") else "en-US-AndrewMultilingualNeural"
            print(f"🔊 Dùng EdgeTTS: {voice}")
            communicate = edge_tts.Communicate(ai_text, voice)
            audio_stream = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio": audio_stream.write(chunk["data"])
            audio_stream.seek(0)

        return StreamingResponse(audio_stream, media_type="audio/mpeg", headers={"X-AI-Response-Text": urllib.parse.quote(ai_text)})

    except Exception as e:
        print(f"❌ Lỗi Audio: {e}")
        return StreamingResponse(io.BytesIO(), media_type="audio/mpeg", headers={"X-AI-Response-Text": urllib.parse.quote("Lỗi âm thanh.")})

# --- CÁC API KHÁC (GIỮ NGUYÊN) ---
@app.post("/api/hint")
async def get_hint(request: HintRequest):
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "free/gpt-5-mini", "messages": [{"role": "system", "content": "Gợi ý 3 ý ngắn."}, {"role": "user", "content": f"Câu hỏi: {request.last_question}"}] }
        res = requests.post(url, headers=headers, json=data, timeout=30)
        return {"hint": res.json()["choices"][0]["message"]["content"]}
    except: return {"hint": "Không lấy được gợi ý."}

@app.post("/api/end-interview")
async def end_interview(request: ReportRequest):
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        system_prompt = f"Chấm điểm phỏng vấn. JD: {request.jd_text}. Output HTML Body Only (Tailwind)."
        data = { "model": "free/gpt-5", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": request.history}] }
        res = requests.post(url, headers=headers, json=data, timeout=90)
        return {"report": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"report": "<p>Lỗi chấm điểm.</p>"}

@app.post("/api/generate-cv")
async def generate_cv(request: CVGenRequest):
    try:
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        data = { "model": "free/gpt-5", "messages": [{"role": "system", "content": f"Viết CV HTML cho {request.position} tại {request.company}."}, {"role": "user", "content": request.user_info}] }
        res = requests.post(url, headers=headers, json=data, timeout=120)
        return {"content": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"content": "<p>Lỗi tạo CV.</p>"}

@app.post("/api/review-cv")
async def review_cv(file: UploadFile = File(...), company: str = Form("Công ty chung")):
    try:
        content = await file.read()
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
        messages = [{"role": "user", "content": "Review CV này. Output HTML."}]
        if file.filename.lower().endswith(('.jpg', '.png')):
            base64_image = base64.b64encode(compress_image(content)).decode('utf-8')
            messages[0]["content"] = [{"type": "text", "text": "Review CV. Output HTML."}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]
        else: messages[0]["content"] = f"Review CV:\n{extract_text_from_file(content, file.filename)}"
        res = requests.post(url, headers=headers, json={"model": "free/gpt-5", "messages": messages}, timeout=90)
        return {"review": res.json()["choices"][0]["message"]["content"].replace("```html","").replace("```","")}
    except: return {"review": "<p>Lỗi đọc CV.</p>"}