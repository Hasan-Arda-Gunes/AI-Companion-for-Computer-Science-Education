from fastapi import APIRouter
from routers.endpoints import problems

api_router = APIRouter()

api_router.include_router(problems.router)