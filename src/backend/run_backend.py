# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import subprocess
import time
import sys
import os

# Hàm tìm và diệt tiến trình đang chiếm dụng Port (Chỉ dành cho Windows)
def kill_process_on_port(port):
    try:
        # Tìm PID đang dùng port
        cmd = f"netstat -ano | findstr :{port}"
        result = subprocess.check_output(cmd, shell=True).decode()
        
        if result:
            print(f"🧹 Đang dọn dẹp port {port}...")
            lines = result.strip().split('\n')
            for line in lines:
                parts = line.split()
                # PID thường nằm ở cột cuối cùng
                pid = parts[-1]
                if pid != '0':
                    os.system(f"taskkill /F /PID {pid} >nul 2>&1")
            time.sleep(1) # Đợi 1s cho Windows kịp đóng port
    except:
        pass # Nếu không tìm thấy port đang mở thì bỏ qua

def run_server():
    # Bước 1: Dọn dẹp port 8000 trước khi chạy để tránh lỗi
    kill_process_on_port(8000)

    while True:
        print("\n[+] Dang khoi dong Backend Server (http://127.0.0.1:8000)...")
        
        # Lệnh chạy server
        # Lưu ý: "app.main:app" nghĩa là vào thư mục app -> file main.py -> biến app
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
            cwd="." # Chạy từ thư mục hiện tại (backend/)
        )
        
        try:
            # Đợi process chạy
            process.wait()
        except KeyboardInterrupt:
            # Nếu người dùng bấm Ctrl+C
            process.terminate()
            break
        
        # Nếu process bị thoát (do crash), in thông báo và chạy lại
        print("\n[!] CANH BAO: Server vua bi Crash! Dang tu dong hoi sinh sau 2 giay...")
        
        # Dọn dẹp lại port phòng khi process cũ chưa nhả
        kill_process_on_port(8000) 
        time.sleep(2)

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n🛑 Đã tắt Server thủ công.")