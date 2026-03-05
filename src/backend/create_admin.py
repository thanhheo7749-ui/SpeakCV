# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from app.database.database import SessionLocal
from app.database.sql_models import User
from app.auth.security import get_password_hash

# Initialize DB connection
db = SessionLocal()

# Check if admin already exists
existing_admin = db.query(User).filter(User.email == "admin@gmail.com").first()

if existing_admin:
    print("⚠️ Admin account already exists!")
else:
    # Hash the password
    hashed_pw = get_password_hash("admin123456")
    
    # Create new user with 'admin' role
    new_admin = User(
        email="admin@gmail.com",
        full_name="Quản trị viên Hệ thống",
        hashed_password=hashed_pw,
        role="admin"
    )
    
    db.add(new_admin)
    db.commit()
    print("🎉 Admin account created successfully!")
    print("Email: admin@gmail.com")
    print("Password: admin123456")

db.close()