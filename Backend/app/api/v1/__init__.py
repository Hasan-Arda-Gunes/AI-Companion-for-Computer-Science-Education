"""
API v1 router - combines all endpoint routers
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    problem_generation,
    problems,
    submissions,
    ai_assistance,
    sessions,
    progress
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(problem_generation.router)
api_router.include_router(problems.router)
api_router.include_router(submissions.router)
api_router.include_router(ai_assistance.router)
api_router.include_router(sessions.router)
api_router.include_router(progress.router)