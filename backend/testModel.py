import os
import requests
from dotenv import load_dotenv

# Tải API Key từ file .env của bạn
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ Không tìm thấy OPENAI_API_KEY. Hãy kiểm tra lại file .env!")
    exit()

# Đường dẫn API mà bạn đang dùng
url = "https://newapi.ccfilm.online/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Danh sách các model phổ biến nhất hiện nay và các model có tiền tố "free/"
models_to_test = [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "free/gpt-3.5-turbo",
    "free/gpt-4o-mini",
    "free/gpt-4o",
    "free/claude-3-haiku"
]

print("🔍 ĐANG KIỂM TRA CÁC MODEL KHẢ DỤNG TRÊN SERVER...\n" + "="*50)

working_models = []

for model in models_to_test:
    print(f"⏳ Đang thử nghiệm: {model:<25}", end="")
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": "hi"}], # Chỉ gửi 1 chữ "hi" cho nhanh
        "max_tokens": 5
    }
    
    try:
        # Gửi request với thời gian chờ ngắn (15s) để đỡ mất thời gian
        res = requests.post(url, headers=headers, json=data, timeout=15)
        
        if res.status_code == 200:
            print("✅ HOẠT ĐỘNG!")
            working_models.append(model)
        else:
            # Lấy mã lỗi từ server (ví dụ: model_not_found)
            error_data = res.json().get("error", {})
            error_code = error_data.get("code", res.status_code)
            print(f"❌ LỖI: {error_code}")
            
    except requests.exceptions.Timeout:
        print("⚠️ QUÁ TẢI (Timeout)")
    except Exception as e:
        print("⚠️ LỖI KẾT NỐI")

print("\n" + "="*50)
print(f"🎉 KẾT LUẬN: BẠN CÓ THỂ DÙNG {len(working_models)} MODEL SAU:")
for m in working_models:
    print(f" 👉 {m}")