# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import PyPDF2
import io

def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extract text from a PDF or plain text file"""
    text = ""
    try:
        if filename.lower().endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            text = content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"⚠️ File content extraction error: {e}")
        text = "Cannot read the content of this file."
    return text

def compress_image(content: bytes) -> bytes:
    """Image processing placeholder (kept to avoid missing library errors)"""
    return content

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

def sync_user_tokens(user, db: Session):
    """Check and reset tokens daily based on UTC+7 timezone (Lazy Evaluation)"""
    tz_vn = timezone(timedelta(hours=7))
    now_vn = datetime.now(tz_vn)
    current_date = now_vn.date()
    
    if not user.last_token_reset_date or user.last_token_reset_date < current_date:
        user.last_token_reset_date = current_date
        
        # Reset based on user role/package
        if user.role == "pro":
            user.credits = 2000
        else:
            user.credits = 50
            
        db.commit()
        db.refresh(user)