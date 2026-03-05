from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import database, sql_models   
from .. import models                         
from ..auth import security                   
from ..utils import sync_user_tokens

router = APIRouter(prefix="/api", tags=["profile"])

def get_current_user(token: str = Depends(security.oauth2_scheme), db: Session = Depends(database.get_db)):
    email = security.verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(sql_models.User).filter(sql_models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    sync_user_tokens(user, db)
    return user

@router.get("/my-profile")
def get_my_profile(current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    profile = db.query(sql_models.UserProfile).filter(sql_models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = sql_models.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    exps = db.query(sql_models.Experience).filter(sql_models.Experience.user_id == current_user.id).all()
    edus = db.query(sql_models.Education).filter(sql_models.Education.user_id == current_user.id).all()

    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "credits": current_user.credits,
        "info": profile, 
        "experiences": exps, 
        "educations": edus
    }

@router.put("/my-profile")
def update_profile(data: models.ProfileUpdate, current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    
    if hasattr(data, 'full_name') and data.full_name is not None:
        current_user.full_name = data.full_name
        
    profile = db.query(sql_models.UserProfile).filter(sql_models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = sql_models.UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if data.phone is not None: profile.phone = data.phone
    if data.address is not None: profile.address = data.address
    if data.summary is not None: profile.summary = data.summary
    if data.skills is not None: profile.skills = data.skills
    if data.website is not None: profile.website = data.website
    if data.github is not None: profile.github = data.github
    if data.linkedin is not None: profile.linkedin = data.linkedin
    if data.avatar is not None: profile.avatar = data.avatar
    
    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/experience")
def add_experience(exp: models.ExperienceCreate, current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    new_exp = sql_models.Experience(
        user_id=current_user.id,
        company_name=exp.company_name,
        position=exp.position,
        start_date=exp.start_date,
        end_date=exp.end_date,
        is_current=exp.is_current,
        description=exp.description
    )
    db.add(new_exp)
    db.commit()
    return {"message": "Experience added successfully"}

@router.delete("/experience/{exp_id}")
def delete_experience(exp_id: int, current_user: sql_models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    exp = db.query(sql_models.Experience).filter(
        sql_models.Experience.id == exp_id, 
        sql_models.Experience.user_id == current_user.id
    ).first()
    
    if exp:
        db.delete(exp)
        db.commit()
        return {"message": "Deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Data not found or access denied")