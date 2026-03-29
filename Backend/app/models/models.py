"""
SQLAlchemy database models
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.database import Base


class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    CORRECT = "correct"
    INCORRECT = "incorrect"
    PARTIAL = "partial"
    ERROR = "error"


class User(Base):
    """User model for students"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    submissions = relationship("Submission", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    sessions = relationship("LearningSession", back_populates="user")


class Problem(Base):
    """Programming problem/question"""
    __tablename__ = "problems"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    topic = Column(String(100), index=True)
    
    # Problem specifications
    constraints = Column(JSON)  # Input constraints, limits
    examples = Column(JSON)  # Example inputs/outputs
    test_cases = Column(JSON)  # Hidden test cases
    starter_code = Column(Text)  # Template code for student
    solution_template = Column(Text)  # Reference solution
    
    # Evaluation criteria
    evaluation_criteria = Column(JSON)  # What to check: correctness, efficiency, style, etc.
    time_limit = Column(Integer)  # Execution time limit in ms
    memory_limit = Column(Integer)  # Memory limit in MB
    
    # Hints and learning support
    hints = Column(JSON)  # Progressive hints
    learning_objectives = Column(JSON)  # What student should learn
    related_concepts = Column(JSON)  # Related CS concepts
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    submissions = relationship("Submission", back_populates="problem")
    progress = relationship("UserProgress", back_populates="problem")


class Submission(Base):
    """Student code submission"""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("learning_sessions.id"))
    
    # Submission content
    code = Column(Text, nullable=False)
    language = Column(String(50), default="python")
    
    # Evaluation results
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING)
    score = Column(Float)  # 0-100
    test_results = Column(JSON)  # Results for each test case
    execution_time = Column(Float)  # ms
    memory_used = Column(Float)  # MB
    
    # AI Feedback
    ai_feedback = Column(JSON)  # Structured feedback from LLM
    correctness_analysis = Column(Text)
    quality_analysis = Column(Text)
    suggestions = Column(JSON)
    identified_issues = Column(JSON)
    
    # Metadata
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
    session = relationship("LearningSession", back_populates="submissions")


class LearningSession(Base):
    """A learning session tracking student's problem-solving journey"""
    __tablename__ = "learning_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    
    # Session data
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    
    # Interaction history
    hints_used = Column(JSON)  # Which hints were requested
    ai_interactions = Column(JSON)  # Chat history with AI
    attempts_count = Column(Integer, default=0)
    
    # Performance
    time_spent = Column(Integer)  # seconds
    final_score = Column(Float)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    problem = relationship("Problem")
    submissions = relationship("Submission", back_populates="session")


class UserProgress(Base):
    """Track user's overall progress"""
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    
    # Progress tracking
    is_completed = Column(Boolean, default=False)
    best_score = Column(Float)
    attempts = Column(Integer, default=0)
    first_attempt_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Analytics
    total_time_spent = Column(Integer)  # seconds
    hints_used_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="progress")
    problem = relationship("Problem", back_populates="progress")


class AIInteraction(Base):
    """Log AI interactions for analysis and improvement"""
    __tablename__ = "ai_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("learning_sessions.id"))
    
    # Interaction details
    interaction_type = Column(String(50))  # feedback, hint, chat, evaluation
    user_message = Column(Text)
    ai_response = Column(Text)
    context = Column(JSON)  # Additional context
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tokens_used = Column(Integer)
    response_time = Column(Float)  # ms
