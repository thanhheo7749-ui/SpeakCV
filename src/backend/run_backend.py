# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
import subprocess
import sys

def run_server():
    port = os.environ.get("PORT", "8000")
    
    host = "0.0.0.0"

    print(f"\n[+] Dang khoi dong Backend Server tai http://{host}:{port} ...")
    
    command = [
        sys.executable, "-m", "uvicorn", "app.main:app", 
        "--host", host, 
        "--port", str(port)
    ]

    if not os.environ.get("PORT"):
        command.append("--reload")

    try:
        subprocess.run(command, check=True, cwd=".")
    except KeyboardInterrupt:
        print("\n🛑 Đã tắt Server thủ công.")
    except Exception as e:
        print(f"\n[!] Server bi loi: {e}")

if __name__ == "__main__":
    run_server()