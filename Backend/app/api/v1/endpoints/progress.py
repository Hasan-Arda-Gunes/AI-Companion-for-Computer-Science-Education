"""
User progress and analytics endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.models import UserProgress, Problem, Submission, LearningSession
from app.schemas.schemas import UserProgressResponse, UserStatistics
from app.core.security import get_current_user_id

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/", response_model=List[UserProgressResponse])
async def get_my_progress(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all progress records for current user"""
    
    result = await db.execute(
        select(UserProgress, Problem).join(
            Problem, UserProgress.problem_id == Problem.id
        ).where(UserProgress.user_id == user_id)
    )
    
    progress_data = []
    for progress, problem in result.all():
        progress_data.append(UserProgressResponse(
            problem_id=problem.id,
            problem_title=problem.title,
            difficulty=problem.difficulty,
            is_completed=progress.is_completed,
            best_score=progress.best_score,
            attempts=progress.attempts,
            total_time_spent=progress.total_time_spent,
            completed_at=progress.completed_at
        ))
    
    return progress_data


@router.get("/statistics", response_model=UserStatistics)
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get comprehensive statistics for current user"""
    
    # Total problems attempted
    result = await db.execute(
        select(func.count(UserProgress.id)).where(UserProgress.user_id == user_id)
    )
    total_attempted = result.scalar() or 0
    
    # Total problems completed
    result = await db.execute(
        select(func.count(UserProgress.id)).where(
            and_(
                UserProgress.user_id == user_id,
                UserProgress.is_completed == True
            )
        )
    )
    total_completed = result.scalar() or 0
    
    # Average score
    result = await db.execute(
        select(func.avg(UserProgress.best_score)).where(
            UserProgress.user_id == user_id
        )
    )
    avg_score = result.scalar() or 0.0
    
    # Total time spent
    result = await db.execute(
        select(func.sum(LearningSession.time_spent)).where(
            LearningSession.user_id == user_id
        )
    )
    total_time = result.scalar() or 0
    
    # Problems by difficulty
    result = await db.execute(
        select(Problem.difficulty, func.count(UserProgress.id)).join(
            UserProgress, Problem.id == UserProgress.problem_id
        ).where(
            UserProgress.user_id == user_id
        ).group_by(Problem.difficulty)
    )
    problems_by_difficulty = {
        str(difficulty): count for difficulty, count in result.all()
    }
    
    # Problems by topic
    result = await db.execute(
        select(Problem.topic, func.count(UserProgress.id)).join(
            UserProgress, Problem.id == UserProgress.problem_id
        ).where(
            UserProgress.user_id == user_id
        ).group_by(Problem.topic)
    )
    problems_by_topic = {
        topic: count for topic, count in result.all()
    }
    
    # Recent activity (last 10 submissions)
    result = await db.execute(
        select(Submission, Problem).join(
            Problem, Submission.problem_id == Problem.id
        ).where(
            Submission.user_id == user_id
        ).order_by(Submission.submitted_at.desc()).limit(10)
    )
    
    recent_activity = []
    for submission, problem in result.all():
        recent_activity.append({
            "problem_title": problem.title,
            "score": submission.score,
            "status": str(submission.status.value) if submission.status else "pending",
            "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
        })
    
    return UserStatistics(
        total_problems_attempted=total_attempted,
        total_problems_completed=total_completed,
        average_score=float(avg_score),
        total_time_spent=total_time,
        problems_by_difficulty=problems_by_difficulty,
        problems_by_topic=problems_by_topic,
        recent_activity=recent_activity
    )


@router.get("/problem/{problem_id}")
async def get_problem_progress(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get detailed progress for a specific problem"""
    
    # Get progress record
    result = await db.execute(
        select(UserProgress).where(
            and_(
                UserProgress.user_id == user_id,
                UserProgress.problem_id == problem_id
            )
        )
    )
    progress = result.scalar_one_or_none()
    
    # Get all submissions
    result = await db.execute(
        select(Submission).where(
            and_(
                Submission.user_id == user_id,
                Submission.problem_id == problem_id
            )
        ).order_by(Submission.submitted_at.desc())
    )
    submissions = result.scalars().all()
    
    # Get all sessions
    result = await db.execute(
        select(LearningSession).where(
            and_(
                LearningSession.user_id == user_id,
                LearningSession.problem_id == problem_id
            )
        ).order_by(LearningSession.started_at.desc())
    )
    sessions = result.scalars().all()
    
    return {
        "progress": progress,
        "submission_count": len(submissions),
        "best_submission": max(submissions, key=lambda s: s.score or 0) if submissions else None,
        "session_count": len(sessions),
        "total_time_spent": sum(s.time_spent or 0 for s in sessions)
    }


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get leaderboard (top users by problems completed)"""
    
    result = await db.execute(
        select(
            UserProgress.user_id,
            func.count(UserProgress.id).label('completed_count'),
            func.avg(UserProgress.best_score).label('avg_score')
        ).where(
            UserProgress.is_completed == True
        ).group_by(
            UserProgress.user_id
        ).order_by(
            func.count(UserProgress.id).desc(),
            func.avg(UserProgress.best_score).desc()
        ).limit(limit)
    )
    
    leaderboard = []
    for user_id, completed, avg_score in result.all():
        # Get user info
        from app.models.models import User
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        
        if user:
            leaderboard.append({
                "rank": len(leaderboard) + 1,
                "username": user.username,
                "problems_completed": completed,
                "average_score": float(avg_score or 0)
            })
    
    return leaderboard
