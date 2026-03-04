from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAlchemyEnum
from database import Base
from sqlalchemy.orm import relationship

class Label(str, SQLAlchemyEnum):
    AI = "AI"
    MANUEL = "Manuel"

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(10000), nullable=False)
    difficulty = Column(String(50), nullable=False)
    topic = Column(String(100), nullable=False)
    label = Column(SQLAlchemyEnum("AI", "Manuel", name="label_enum"), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="questions")