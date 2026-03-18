# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .routers import profile, auth, cv, admin, interview, support, payment, jobs, stats, questions
from .database import sql_models          
from .database.database import engine, SessionLocal
from .auth.security import get_password_hash

load_dotenv()

sql_models.Base.metadata.create_all(bind=engine)

def seed_admin():
    """Create admin account if it doesn't exist."""
    admin_email = os.getenv("ADMIN_EMAIL", "admin@gmail.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_name = os.getenv("ADMIN_NAME", "Admin")

    db = SessionLocal()
    try:
        existing = db.query(sql_models.User).filter(sql_models.User.email == admin_email).first()
        if not existing:
            new_admin = sql_models.User(
                email=admin_email,
                full_name=admin_name,
                hashed_password=get_password_hash(admin_password),
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print(f"[SEED] Admin account created: {admin_email}")
        elif existing.role != "admin":
            existing.role = "admin"
            db.commit()
            print(f"[SEED] Admin role restored for: {admin_email}")
        else:
            print(f"[SEED] Admin account already exists: {admin_email}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_admin()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],       
    allow_headers=["*"],
    expose_headers=["X-AI-Response-Text"]
)

app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(admin.router)
app.include_router(interview.router)
app.include_router(support.router)
app.include_router(payment.router)
app.include_router(jobs.router)
app.include_router(stats.router)
app.include_router(questions.router)