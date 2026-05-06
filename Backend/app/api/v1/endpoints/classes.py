"""
Class management endpoints for teachers
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.db.database import get_db
from app.models.models import User, UserRole, Classroom, ClassMembership
from app.schemas.schemas import (
    ClassCreate,
    ClassResponse,
    ClassDetailResponse,
    ClassStudentAddRequest,
    ClassMembershipResponse,
    UserSummary,
)
from app.core.security import get_current_user_id

router = APIRouter(prefix="/classes", tags=["Classes"])


async def _get_current_user_or_404(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


async def _get_teacher_class_or_404(db: AsyncSession, class_id: int, teacher_id: int) -> Classroom:
    result = await db.execute(
        select(Classroom).where(
            Classroom.id == class_id,
            Classroom.teacher_id == teacher_id,
            Classroom.is_active == True
        )
    )
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    return classroom


async def _ensure_teacher(db: AsyncSession, user_id: int) -> User:
    user = await _get_current_user_or_404(db, user_id)
    if user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can manage classes"
        )
    return user


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a class (teachers only)."""
    await _ensure_teacher(db, user_id)

    classroom = Classroom(
        name=class_data.name,
        description=class_data.description,
        teacher_id=user_id,
        is_active=True
    )
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)

    return ClassResponse(
        id=classroom.id,
        name=classroom.name,
        description=classroom.description,
        teacher_id=classroom.teacher_id,
        is_active=classroom.is_active,
        created_at=classroom.created_at,
        updated_at=classroom.updated_at,
        student_count=0,
    )


@router.get("/", response_model=List[ClassResponse])
async def list_my_classes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """List classes for the current user.

    Teachers see the classes they own. Students see the classes they are
    enrolled in.
    """
    user = await _get_current_user_or_404(db, user_id)

    if user.role == UserRole.TEACHER:
        result = await db.execute(
            select(Classroom).where(
                Classroom.teacher_id == user_id,
                Classroom.is_active == True
            )
        )
    else:
        result = await db.execute(
            select(Classroom)
            .join(ClassMembership, ClassMembership.class_id == Classroom.id)
            .where(
                ClassMembership.student_id == user_id,
                Classroom.is_active == True
            )
        )

    classes = result.scalars().all()

    response: List[ClassResponse] = []
    for classroom in classes:
        count_result = await db.execute(
            select(func.count(ClassMembership.id)).where(
                ClassMembership.class_id == classroom.id
            )
        )
        student_count = count_result.scalar() or 0
        response.append(
            ClassResponse(
                id=classroom.id,
                name=classroom.name,
                description=classroom.description,
                teacher_id=classroom.teacher_id,
                is_active=classroom.is_active,
                created_at=classroom.created_at,
                updated_at=classroom.updated_at,
                student_count=student_count,
            )
        )

    return response


@router.get("/{class_id}", response_model=ClassDetailResponse)
async def get_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get class details including enrolled students."""
    classroom = await _get_teacher_class_or_404(db, class_id, user_id)

    result = await db.execute(
        select(ClassMembership, User).join(
            User, User.id == ClassMembership.student_id
        ).where(
            ClassMembership.class_id == class_id
        )
    )
    rows = result.all()

    students = [
        UserSummary(
            id=student.id,
            email=student.email,
            username=student.username,
            full_name=student.full_name,
            role=student.role,
        )
        for _, student in rows
    ]

    return ClassDetailResponse(
        id=classroom.id,
        name=classroom.name,
        description=classroom.description,
        teacher_id=classroom.teacher_id,
        is_active=classroom.is_active,
        created_at=classroom.created_at,
        updated_at=classroom.updated_at,
        student_count=len(students),
        students=students,
    )


@router.post("/{class_id}/students", response_model=ClassMembershipResponse, status_code=status.HTTP_201_CREATED)
async def add_student_to_class(
    class_id: int,
    payload: ClassStudentAddRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Add a student to a teacher-owned class."""
    await _get_teacher_class_or_404(db, class_id, user_id)

    student_result = await db.execute(select(User).where(User.id == payload.student_id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only users with student role can be added to a class"
        )

    existing_result = await db.execute(
        select(ClassMembership).where(
            ClassMembership.class_id == class_id,
            ClassMembership.student_id == payload.student_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this class"
        )

    membership = ClassMembership(class_id=class_id, student_id=payload.student_id)
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    return ClassMembershipResponse(
        class_id=class_id,
        student=UserSummary(
            id=student.id,
            email=student.email,
            username=student.username,
            full_name=student.full_name,
            role=student.role,
        ),
        added_at=membership.added_at,
    )


@router.delete("/{class_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_student_from_class(
    class_id: int,
    student_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Remove a student from a teacher-owned class."""
    await _get_teacher_class_or_404(db, class_id, user_id)

    result = await db.execute(
        select(ClassMembership).where(
            ClassMembership.class_id == class_id,
            ClassMembership.student_id == student_id
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not enrolled in this class"
        )

    await db.delete(membership)
    await db.commit()


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Soft-delete a class and keep historical data."""
    classroom = await _get_teacher_class_or_404(db, class_id, user_id)
    classroom.is_active = False
    await db.commit()
