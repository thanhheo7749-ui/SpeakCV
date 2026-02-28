# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import PyPDF2
import io

def extract_text_from_file(content: bytes, filename: str) -> str:
    """Hàm bóc tách chữ từ file PDF hoặc Text"""
    text = ""
    try:
        if filename.lower().endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            # Nếu là file text thường (txt, md)
            text = content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"⚠️ Lỗi bóc tách nội dung file: {e}")
        text = "Không thể đọc được nội dung file này."
    return text

def compress_image(content: bytes) -> bytes:
    """Hàm xử lý ảnh (Tạm thời giữ nguyên để tránh lỗi thiếu thư viện)"""
    return content