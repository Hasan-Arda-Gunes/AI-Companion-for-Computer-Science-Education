"""
Problem management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import Optional, List

from app.db.database import get_db
from app.models.models import Problem, User, UserProgress, UserRole, Classroom, ClassMembership
from app.schemas.schemas import (
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse,
    ProblemListResponse,
    DifficultyLevel
)
from app.core.security import get_current_user_id

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.post("/", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(
    problem_data: ProblemCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a new programming problem (teachers only)"""
    
    # Check if user is a teacher
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user or user.role.value != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create problems"
        )
    
    new_problem = Problem(
        title=problem_data.title,
        description=problem_data.description,
        difficulty=problem_data.difficulty,
        topic=problem_data.topic,
        constraints=problem_data.constraints,
        examples=problem_data.examples,
        test_cases=problem_data.test_cases,
        starter_code=problem_data.starter_code,
        solution_template=problem_data.solution_template,
        evaluation_criteria=problem_data.evaluation_criteria,
        time_limit=problem_data.time_limit,
        memory_limit=problem_data.memory_limit,
        hints=problem_data.hints,
        learning_objectives=problem_data.learning_objectives,
        related_concepts=problem_data.related_concepts,
        created_by=user_id,
        class_id=problem_data.class_id
    )
    
    db.add(new_problem)
    await db.commit()
    await db.refresh(new_problem)
    
    return new_problem


@router.get("/", response_model=ProblemListResponse)
async def list_problems(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    difficulty: Optional[DifficultyLevel] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get list of problems with filtering and pagination.
    
    - Teachers see only problems they created
    - Students see problems created by their teachers and their own AI-generated problems
    """
    
    # Get current user
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Build base query with active problems
    query = select(Problem).where(Problem.is_active == True)
    
    # Apply role-based filtering
    if user.role == UserRole.TEACHER:
        # Teachers see only their own problems
        query = query.where(Problem.created_by == user_id)
    else:
        # Students see:
        # 1. Problems they created themselves (AI-generated, no class_id)
        # 2. Problems assigned to classes they are enrolled in
        
        # Get class IDs that student is enrolled in
        student_class_query = select(ClassMembership.class_id).where(
            ClassMembership.student_id == user_id
        )
        
        student_class_result = await db.execute(student_class_query)
        class_ids = student_class_result.scalars().all()
        
        # Filter: (problems created by student with no class) OR (problems assigned to their classes)
        query = query.where(
            or_(
                and_(Problem.created_by == user_id, Problem.class_id == None),
                Problem.class_id.in_(class_ids) if class_ids else False
            )
        )
    
    # Apply additional filters
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
    
    if topic:
        query = query.where(Problem.topic == topic)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Problem.title.ilike(search_term)) |
            (Problem.description.ilike(search_term))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    problems = result.scalars().all()
    
    return ProblemListResponse(
        problems=problems,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get a specific problem by ID (creator or admin only)"""
    
    # Get problem
    result = await db.execute(
        select(Problem).where(
            Problem.id == problem_id,
            Problem.is_active == True
        )
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    return problem


@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: int,
    problem_data: ProblemUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Update a problem (creator or admin only)"""
    
    result = await db.execute(
        select(Problem).where(Problem.id == problem_id)
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Check authorization: creator or admin only
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    is_creator = problem.created_by == user_id
    is_admin = user and user.is_superuser
    
    if not (is_creator or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator or admin can update this problem"
        )
    
    # Update fields
    update_data = problem_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(problem, field, value)
    
    await db.commit()
    await db.refresh(problem)
    
    return problem


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Soft delete a problem (creator or admin only)"""
    
    result = await db.execute(
        select(Problem).where(Problem.id == problem_id)
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Check authorization: creator or admin only
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    is_creator = problem.created_by == user_id
    is_admin = user and user.is_superuser
    
    if not (is_creator or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator or admin can delete this problem"
        )
    
    problem.is_active = False
    await db.commit()


@router.get("/topics/list", response_model=List[str])
async def get_topics(db: AsyncSession = Depends(get_db)):
    """Get list of all available topics"""
    
    from app.core.config import settings
    return settings.TOPICS
