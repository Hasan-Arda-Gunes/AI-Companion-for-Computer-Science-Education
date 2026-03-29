"""
Code submission and evaluation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.models import (
    Submission,
    Problem,
    LearningSession,
    UserProgress,
    SubmissionStatus
)
from app.schemas.schemas import (
    SubmissionCreate,
    SubmissionResponse,
    TestCaseResult
)
from app.core.security import get_current_user_id
from app.services.code_executor import code_executor
from app.services.ai_service import ai_service

router = APIRouter(prefix="/submissions", tags=["Submissions"])


async def evaluate_submission_background(
    submission_id: int,
    code: str,
    problem_id: int,
    language: str,
    db_url: str
):
    """Background task to evaluate a submission"""
    
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    # Create new DB session for background task
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        try:
            # Get problem
            result = await db.execute(select(Problem).where(Problem.id == problem_id))
            problem = result.scalar_one_or_none()
            
            if not problem:
                return
            
            # Run test cases
            test_results, execution_time, all_passed = code_executor.run_test_cases(
                code=code,
                test_cases=problem.test_cases,
                language=language
            )
            
            # Calculate score
            passed_count = sum(1 for t in test_results if t.passed)
            total_count = len(test_results)
            score = (passed_count / total_count * 100) if total_count > 0 else 0
            
            # Determine status
            if all_passed:
                submission_status = SubmissionStatus.CORRECT
            elif passed_count > 0:
                submission_status = SubmissionStatus.PARTIAL
            else:
                submission_status = SubmissionStatus.INCORRECT
            
            # Get AI feedback
            ai_feedback = await ai_service.evaluate_code(
                code=code,
                problem_description=problem.description,
                test_results=test_results,
                evaluation_criteria=problem.evaluation_criteria,
                language=language
            )
            
            # Update submission
            result = await db.execute(select(Submission).where(Submission.id == submission_id))
            submission = result.scalar_one_or_none()
            
            if submission:
                submission.status = submission_status
                submission.score = score
                submission.test_results = [t.model_dump() for t in test_results]
                submission.execution_time = execution_time
                submission.ai_feedback = ai_feedback.model_dump()
                submission.evaluated_at = datetime.utcnow()
                
                await db.commit()
                
                # Update user progress
                await update_user_progress(
                    db=db,
                    user_id=submission.user_id,
                    problem_id=problem_id,
                    score=score,
                    completed=(submission_status == SubmissionStatus.CORRECT)
                )
            
        except Exception as e:
            print(f"Error in background evaluation: {str(e)}")
            # Update submission with error status
            result = await db.execute(select(Submission).where(Submission.id == submission_id))
            submission = result.scalar_one_or_none()
            if submission:
                submission.status = SubmissionStatus.ERROR
                submission.ai_feedback = {
                    "overall_assessment": f"Evaluation error: {str(e)}",
                    "correctness_score": 0,
                    "quality_score": 0,
                    "efficiency_score": 0,
                    "strengths": [],
                    "issues": [{"type": "system_error", "description": str(e)}],
                    "suggestions": [],
                    "next_steps": []
                }
                await db.commit()


async def update_user_progress(
    db: AsyncSession,
    user_id: int,
    problem_id: int,
    score: float,
    completed: bool
):
    """Update or create user progress record"""
    
    # Check if progress record exists
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.problem_id == problem_id
        )
    )
    progress = result.scalar_one_or_none()
    
    if progress:
        # Update existing
        progress.attempts += 1
        if score > (progress.best_score or 0):
            progress.best_score = score
        if completed and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = datetime.utcnow()
    else:
        # Create new
        progress = UserProgress(
            user_id=user_id,
            problem_id=problem_id,
            best_score=score,
            attempts=1,
            is_completed=completed,
            completed_at=datetime.utcnow() if completed else None
        )
        db.add(progress)
    
    await db.commit()


@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_code(
    submission_data: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Submit code for evaluation"""
    
    # Verify problem exists
    result = await db.execute(
        select(Problem).where(
            Problem.id == submission_data.problem_id,
            Problem.is_active == True
        )
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Check code length
    if len(submission_data.code) > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code is too long (max 50000 characters)"
        )
    
    # Create submission record
    new_submission = Submission(
        user_id=user_id,
        problem_id=submission_data.problem_id,
        session_id=submission_data.session_id,
        code=submission_data.code,
        language=submission_data.language,
        status=SubmissionStatus.PENDING
    )
    
    db.add(new_submission)
    await db.commit()
    await db.refresh(new_submission)
    
    # Update session attempts count
    if submission_data.session_id:
        result = await db.execute(
            select(LearningSession).where(LearningSession.id == submission_data.session_id)
        )
        session = result.scalar_one_or_none()
        if session:
            session.attempts_count += 1
            await db.commit()
    
    # Evaluate in background
    from app.core.config import settings
    background_tasks.add_task(
        evaluate_submission_background,
        submission_id=new_submission.id,
        code=submission_data.code,
        problem_id=submission_data.problem_id,
        language=submission_data.language,
        db_url=settings.DATABASE_URL
    )
    
    return new_submission


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get submission details"""
    
    result = await db.execute(
        select(Submission).where(
            Submission.id == submission_id,
            Submission.user_id == user_id
        )
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return submission


@router.get("/problem/{problem_id}", response_model=List[SubmissionResponse])
async def get_problem_submissions(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get all submissions for a problem by current user"""
    
    result = await db.execute(
        select(Submission).where(
            Submission.problem_id == problem_id,
            Submission.user_id == user_id
        ).order_by(desc(Submission.submitted_at))
    )
    submissions = result.scalars().all()
    
    return submissions


@router.get("/", response_model=List[SubmissionResponse])
async def get_my_submissions(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get recent submissions for current user"""
    
    result = await db.execute(
        select(Submission).where(
            Submission.user_id == user_id
        ).order_by(desc(Submission.submitted_at)).limit(limit)
    )
    submissions = result.scalars().all()
    
    return submissions
