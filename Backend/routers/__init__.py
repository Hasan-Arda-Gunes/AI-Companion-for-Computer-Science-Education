from fastapi import APIRouter
from routers.endpoints import problems, chat, auth_router

api_router = APIRouter()

api_router.include_router(problems.router)
api_router.include_router(chat.router)
api_router.include_router(auth_router.router)
