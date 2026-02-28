# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from app.database.database import SessionLocal
from app.database.sql_models import User
from app.auth.security import get_password_hash

# Khởi tạo kết nối DB
db = SessionLocal()

# Kiểm tra xem admin đã tồn tại chưa
existing_admin = db.query(User).filter(User.email == "admin@gmail.com").first()

if existing_admin:
    print("⚠️ Tài khoản Admin này đã tồn tại!")
else:
    # Băm mật khẩu
    hashed_pw = get_password_hash("admin123456")
    
    # Tạo user mới với role 'admin'
    new_admin = User(
        email="admin@gmail.com",
        full_name="Quản trị viên Hệ thống",
        hashed_password=hashed_pw,
        role="admin"  # Đảm bảo bảng User của bạn có cột role nhé
    )
    
    db.add(new_admin)
    db.commit()
    print("🎉 Đã tạo thành công tài khoản Admin!")
    print("Email: admin@gmail.com")
    print("Mật khẩu: admin123456")

db.close()