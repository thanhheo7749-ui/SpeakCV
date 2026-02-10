import os
import io
import urllib.parse
import requests  # Dùng requests để gửi tin nhắn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
from dotenv import load_dotenv

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

# Lấy Key từ .env
api_key = os.getenv("OPENAI_API_KEY")

class ChatRequest(BaseModel):
    user_text: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    print(f"\n📩 Frontend gửi: {request.user_text}")

    if not api_key:
        print("❌ LỖI: Chưa có OPENAI_API_KEY trong file .env")
        raise HTTPException(status_code=500, detail="Chưa cấu hình API Key")

    ai_text = ""

    # 1. GỌI API QUA SERVER RIÊNG (newapi.ccfilm.online)
    try:
        print("🤖 Đang kết nối tới newapi.ccfilm.online...")
        
        url = "https://newapi.ccfilm.online/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # --- CẤU HÌNH MODEL ---
        # Dùng model xịn nhất trong danh sách của bạn
        model_id = "free/gpt-5"  
        # Nếu thấy chậm, hãy đổi dòng trên thành: "free/gpt-5-mini"
        
        data = {
            "model": model_id, 
            "messages": [
                {"role": "system", "content": "Bạn là nhà tuyển dụng IT khó tính. Hãy phỏng vấn ứng viên, đặt câu hỏi ngắn gọn, sắc bén (dưới 2 câu) bằng tiếng Việt."},
                {"role": "user", "content": request.user_text}
            ]
        }

        response = requests.post(url, headers=headers, json=data)
        
        # In phản hồi để kiểm tra
        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", "Lỗi không xác định")
            print(f"❌ Server báo lỗi: {error_msg}")
            raise Exception(error_msg)

        # Lấy nội dung trả lời
        response_json = response.json()
        ai_text = response_json["choices"][0]["message"]["content"]
        print(f"✅ {model_id} trả lời: {ai_text}")

    except Exception as e:
        print(f"❌ Lỗi API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi API: {str(e)}")

    # 2. TẠO GIỌNG NÓI (Edge-TTS)
    try:
        communicate = edge_tts.Communicate(ai_text, "vi-VN-NamMinhNeural")
        memory_file = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                memory_file.write(chunk["data"])
        memory_file.seek(0)
        
        safe_text = urllib.parse.quote(ai_text)
        return StreamingResponse(
            memory_file, 
            media_type="audio/mpeg",
            headers={"X-AI-Response-Text": safe_text}
        )
    except Exception as e:
        print(f"❌ Lỗi TTS: {e}")
        raise HTTPException(status_code=500, detail="Lỗi tạo giọng nói")