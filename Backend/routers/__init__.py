from fastapi import APIRouter
from routers.endpoints import problems, chat

api_router = APIRouter()

api_router.include_router(problems.router)
api_router.include_router(chat.router)