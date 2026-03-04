from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.request.user_request import UserCreate
from models.user import User
from auth import hash_password

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user_data: UserCreate) -> User:
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise ValueError("Username already taken")
    
    hashed_pwd = hash_password(user_data.password)

    new_user = User(
        username=user_data.username,
        hashed_password=hashed_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user