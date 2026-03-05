from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import sql_models
from ..database.database import get_db
from ..auth import security

router = APIRouter()

@router.post("/api/register")
def register(user: models.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(sql_models.User).filter(sql_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    hashed_pw = security.get_password_hash(user.password)
    new_user = sql_models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"message": "Registration successful"}

@router.post("/api/login", response_model=models.Token)
def login(user_data: models.UserLogin, db: Session = Depends(get_db)):
    user = db.query(sql_models.User).filter(sql_models.User.email == user_data.email).first()
    if not user or not security.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name}
