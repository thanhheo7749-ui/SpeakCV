# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .routers import profile, auth, cv, admin, interview, support, payment, jobs, stats, questions
from .database import sql_models          
from .database.database import engine

load_dotenv()

sql_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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