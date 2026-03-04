from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.request.user_request import UserCreate, Token, UserLogin
from services.user_service import create_user
from database import get_db
from auth import create_access_token, verify_password
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = create_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_login.username).first()
    if not user or not verify_password(user_login.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}