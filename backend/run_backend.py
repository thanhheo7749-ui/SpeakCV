import subprocess
import time
import sys

def run_server():
    while True:
        print("\n🚀 Đang khởi động Backend Server...")
        # Lệnh chạy server
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd="." # Đảm bảo chạy đúng thư mục
        )
        
        # Đợi process chạy
        process.wait()
        
        # Nếu process bị thoát (do crash), in thông báo và chạy lại
        print("\n⚠️  CẢNH BÁO: Server vừa bị Crash! Đang tự động hồi sinh sau 2 giây...")
        time.sleep(2)

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n🛑 Đã tắt Server thủ công.")