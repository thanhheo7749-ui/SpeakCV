import os
import random
import string
import requests
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
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name, "role": user.role}

@router.post("/api/auth/google", response_model=models.Token)
def login_google(google_data: models.GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify the access token by fetching user profile from Google
        response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_data.token}"}
        )
        
        if not response.ok:
            raise ValueError("Failed to fetch user info with provided token")
            
        idinfo = response.json()

        email = idinfo.get("email")
        full_name = idinfo.get("name") or "Google User"

        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain email")

        # Check if user exists
        user = db.query(sql_models.User).filter(sql_models.User.email == email).first()

        if not user:
            # Create a new user with a random unguessable password since they use Google
            random_pw = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
            hashed_pw = security.get_password_hash(random_pw)
            
            user = sql_models.User(
                email=email,
                full_name=full_name,
                hashed_password=hashed_pw,
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = security.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name, "role": user.role}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
