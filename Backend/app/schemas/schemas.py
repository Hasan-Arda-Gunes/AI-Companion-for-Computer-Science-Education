"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    CORRECT = "correct"
    INCORRECT = "incorrect"
    PARTIAL = "partial"
    ERROR = "error"


class LLMProvider(str, Enum):
    GEMINI = "gemini"
    OLLAMA = "ollama"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserSummary(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Problem Schemas
class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: DifficultyLevel
    topic: str


class ProblemCreate(ProblemBase):
    class_id: Optional[int] = None  # Optional: if set, only students in this class can see it
    constraints: Optional[Dict[str, Any]] = None
    examples: List[Dict[str, Any]]
    test_cases: List[Dict[str, Any]]
    starter_code: Optional[str] = None
    solution_template: Optional[str] = None
    evaluation_criteria: Dict[str, Any]
    time_limit: int = 5000  # ms
    memory_limit: int = 256  # MB
    hints: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None
    related_concepts: Optional[List[str]] = None


class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    topic: Optional[str] = None
    class_id: Optional[int] = None
    constraints: Optional[Dict[str, Any]] = None
    examples: Optional[List[Dict[str, Any]]] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    starter_code: Optional[str] = None
    is_active: Optional[bool] = None


class ProblemResponse(ProblemBase):
    id: int
    constraints: Optional[Dict[str, Any]]
    examples: List[Dict[str, Any]]
    test_cases: List[Dict[str, Any]]
    starter_code: Optional[str]
    hints: Optional[List[str]]
    learning_objectives: Optional[List[str]]
    related_concepts: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProblemListResponse(BaseModel):
    problems: List[ProblemResponse]
    total: int
    page: int
    page_size: int


# Submission Schemas
class SubmissionCreate(BaseModel):
    problem_id: int
    code: str
    language: str = "python"
    session_id: Optional[int] = None
    provider: str = "gemini"  # Default to Gemini


class TestCaseResult(BaseModel):
    test_id: str
    passed: bool
    expected: Any
    actual: Any
    error: Optional[str] = None


class AIFeedback(BaseModel):
    overall_assessment: str
    correctness_score: float  # 0-100
    quality_score: float  # 0-100
    efficiency_score: float  # 0-100
    strengths: List[str]
    issues: List[Dict[str, str]]  # {"type": "logic_error", "description": "..."}
    suggestions: List[str]
    next_steps: List[str]


class SubmissionResponse(BaseModel):
    id: int
    problem_id: int
    code: str
    language: str
    status: SubmissionStatus
    score: Optional[float]
    test_results: Optional[List[TestCaseResult]]
    execution_time: Optional[float]
    memory_used: Optional[float]
    ai_feedback: Optional[AIFeedback]
    submitted_at: datetime
    evaluated_at: Optional[datetime]
    provider_used: Optional[str] = None  # Track which LLM provider was used for feedback
    
    class Config:
        from_attributes = True


# Learning Session Schemas
class SessionCreate(BaseModel):
    problem_id: int


class SessionResponse(BaseModel):
    id: int
    problem_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    is_completed: bool
    attempts_count: int
    time_spent: Optional[int]
    final_score: Optional[float]
    
    class Config:
        from_attributes = True


# AI Interaction Schemas
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    provider: str = "gemini"  # Default to Gemini


class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
    related_concepts: Optional[List[str]] = None
    provider_used: str = "gemini"


class HintRequest(BaseModel):
    problem_id: int
    session_id: int
    current_code: Optional[str] = None
    hint_level: int = 1  # Progressive hints
    provider: str = "gemini"  # Default to Gemini


class HintResponse(BaseModel):
    hint: str
    hint_level: int
    remaining_hints: int
    provider_used: str = "gemini"


# Class management schemas
class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None


class ClassCreate(ClassBase):
    pass


class ClassResponse(ClassBase):
    id: int
    teacher_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    student_count: int = 0

    class Config:
        from_attributes = True


class ClassDetailResponse(ClassResponse):
    students: List[UserSummary] = []


class ClassStudentAddRequest(BaseModel):
    student_id: int


class ClassMembershipResponse(BaseModel):
    class_id: int
    student: UserSummary
    added_at: datetime

    class Config:
        from_attributes = True


# Progress Schemas
class UserProgressResponse(BaseModel):
    problem_id: int
    problem_title: str
    difficulty: DifficultyLevel
    is_completed: bool
    best_score: Optional[float]
    attempts: int
    total_time_spent: Optional[int]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserStatistics(BaseModel):
    total_problems_attempted: int
    total_problems_completed: int
    average_score: float
    total_time_spent: int  # seconds
    problems_by_difficulty: Dict[str, int]
    problems_by_topic: Dict[str, int]
    recent_activity: List[Dict[str, Any]]


# Code Execution Schemas
class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    test_input: Optional[str] = None
    timeout: int = 30


class CodeExecutionResult(BaseModel):
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    memory_used: Optional[float] = None
