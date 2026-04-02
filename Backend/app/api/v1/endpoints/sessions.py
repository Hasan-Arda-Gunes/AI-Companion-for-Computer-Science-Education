"""
Learning session endpoints - track student problem-solving sessions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.models import LearningSession, Problem
from app.schemas.schemas import SessionCreate, SessionResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/sessions", tags=["Learning Sessions"])


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Start a new learning session for a problem"""
    
    # Verify problem exists
    result = await db.execute(
        select(Problem).where(
            Problem.id == session_data.problem_id,
            Problem.is_active == True
        )
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Create new session
    new_session = LearningSession(
        user_id=user_id,
        problem_id=session_data.problem_id,
        hints_used=[],
        ai_interactions=[],
        attempts_count=0
    )
    
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return new_session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get session details"""
    
    result = await db.execute(
        select(LearningSession).where(
            LearningSession.id == session_id,
            LearningSession.user_id == user_id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session


@router.put("/{session_id}/complete")
async def complete_session(
    session_id: int,
    final_score: float,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Mark a session as completed"""
    
    result = await db.execute(
        select(LearningSession).where(
            LearningSession.id == session_id,
            LearningSession.user_id == user_id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Calculate time spent
    time_spent = int((datetime.utcnow() - session.started_at).total_seconds())
    
    session.is_completed = True
    session.completed_at = datetime.utcnow()
    session.final_score = final_score
    session.time_spent = time_spent
    
    await db.commit()
    await db.refresh(session)
    
    return session


@router.get("/problem/{problem_id}", response_model=List[SessionResponse])
async def get_problem_sessions(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all sessions for a specific problem"""
    
    result = await db.execute(
        select(LearningSession).where(
            LearningSession.problem_id == problem_id,
            LearningSession.user_id == user_id
        ).order_by(desc(LearningSession.started_at))
    )
    sessions = result.scalars().all()
    
    return sessions


@router.get("/", response_model=List[SessionResponse])
async def get_my_sessions(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get recent sessions for current user"""
    
    result = await db.execute(
        select(LearningSession).where(
            LearningSession.user_id == user_id
        ).order_by(desc(LearningSession.started_at)).limit(limit)
    )
    sessions = result.scalars().all()
    
    return sessions
