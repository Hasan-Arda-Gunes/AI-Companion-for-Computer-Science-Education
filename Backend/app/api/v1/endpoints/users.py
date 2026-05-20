"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserUpdate
from app.core.security import get_current_user_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by username
    
    Args:
        username: The username to search for
        
    Returns:
        User details if found
        
    Raises:
        HTTPException 404: User not found
    """
    result = await db.execute(
        select(User).where(User.username == username)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with username '{username}' not found"
        )
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by ID
    
    Args:
        user_id: The user ID to search for
        
    Returns:
        User details if found
        
    Raises:
        HTTPException 404: User not found
    """
    user = await db.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    return user


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List all users with optional filtering
    
    Args:
        skip: Number of users to skip (pagination)
        limit: Number of users to return (max 100)
        role: Filter by role (student or teacher)
        
    Returns:
        List of users
    """
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.get("/search/by-partial-username", response_model=List[UserResponse])
async def search_users_by_partial_username(
    username_part: str = Query(..., min_length=1, description="Partial username to search for"),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Search users by partial username match (case-insensitive)
    
    Args:
        username_part: Part of the username to search for
        limit: Maximum number of results to return (max 100)
        
    Returns:
        List of users matching the partial username
    """
    result = await db.execute(
        select(User)
        .where(User.username.ilike(f"%{username_part}%"))
        .limit(limit)
    )
    users = result.scalars().all()
    
    return users


@router.get("/search/by-email", response_model=UserResponse)
async def search_user_by_email(
    email: str = Query(..., description="Email address to search for"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search user by email address
    
    Args:
        email: The email to search for
        
    Returns:
        User details if found
        
    Raises:
        HTTPException 404: User not found
    """
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{email}' not found"
        )
    
    return user

