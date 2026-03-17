# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from ..database import sql_models
from ..database.database import get_db
from .profile import get_current_user

router = APIRouter()

# --- Pydantic Models ---
class QuestionSubmit(BaseModel):
    company_name: str
    position: str
    question_text: str
    difficulty: str = "medium"

# --- PUBLIC: List approved questions ---
@router.get("/api/questions")
async def list_questions(
    company: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(sql_models.CompanyQuestion).filter(
        sql_models.CompanyQuestion.is_approved == True
    )

    if company:
        query = query.filter(
            sql_models.CompanyQuestion.company_name.ilike(f"%{company}%")
        )

    questions = query.order_by(
        sql_models.CompanyQuestion.created_at.desc()
    ).limit(200).all()

    return {
        "questions": [
            {
                "id": q.id,
                "company_name": q.company_name,
                "position": q.position,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "created_at": q.created_at.isoformat() if q.created_at else None,
            }
            for q in questions
        ]
    }

# --- PUBLIC: Get list of companies with question counts ---
@router.get("/api/questions/companies")
async def list_companies(db: Session = Depends(get_db)):
    results = (
        db.query(
            sql_models.CompanyQuestion.company_name,
            func.count(sql_models.CompanyQuestion.id).label("count")
        )
        .filter(sql_models.CompanyQuestion.is_approved == True)
        .group_by(sql_models.CompanyQuestion.company_name)
        .order_by(func.count(sql_models.CompanyQuestion.id).desc())
        .all()
    )

    return {
        "companies": [
            {"name": r[0], "count": r[1]}
            for r in results
        ]
    }

# --- AUTHENTICATED: Submit a question ---
@router.post("/api/questions")
async def submit_question(
    data: QuestionSubmit,
    current_user: sql_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.company_name.strip() or not data.question_text.strip():
        raise HTTPException(status_code=400, detail="Company name and question text are required")

    question = sql_models.CompanyQuestion(
        company_name=data.company_name.strip(),
        position=data.position.strip(),
        question_text=data.question_text.strip(),
        difficulty=data.difficulty,
        submitted_by=current_user.id,
        is_approved=False,
    )
    db.add(question)
    db.commit()
    return {"message": "Câu hỏi đã được gửi, đang chờ duyệt!", "id": question.id}

# --- ADMIN: Approve a question ---
@router.patch("/api/admin/questions/{question_id}/approve")
async def approve_question(
    question_id: int,
    current_user: sql_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    question = db.query(sql_models.CompanyQuestion).filter(
        sql_models.CompanyQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.is_approved = True
    db.commit()
    return {"message": "Đã duyệt câu hỏi!"}

# --- ADMIN: List pending questions ---
@router.get("/api/admin/questions/pending")
async def list_pending_questions(
    current_user: sql_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    questions = (
        db.query(sql_models.CompanyQuestion)
        .filter(sql_models.CompanyQuestion.is_approved == False)
        .order_by(sql_models.CompanyQuestion.created_at.desc())
        .all()
    )

    return {
        "questions": [
            {
                "id": q.id,
                "company_name": q.company_name,
                "position": q.position,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "submitted_by": q.submitted_by,
                "created_at": q.created_at.isoformat() if q.created_at else None,
            }
            for q in questions
        ]
    }

# --- ADMIN: Delete a question ---
@router.delete("/api/admin/questions/{question_id}")
async def delete_question(
    question_id: int,
    current_user: sql_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    question = db.query(sql_models.CompanyQuestion).filter(
        sql_models.CompanyQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()
    return {"message": "Đã xóa câu hỏi!"}
