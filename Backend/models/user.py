from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    questions = relationship("Question", back_populates="user")