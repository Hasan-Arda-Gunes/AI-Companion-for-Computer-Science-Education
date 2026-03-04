from fastapi import APIRouter, Depends
from models.request.ai_request import AIRequest
from models.request.problem_request import ProblemRequest
from models.response.ai_response import AIResponse
from services.ai_service import AIService
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session

from models.user import User

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.post("/generate", response_model=AIResponse)
async def generate_problem(problem_request: ProblemRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Endpoint to generate a programming problem description based on the given prompt."""
    ai_service = AIService()
    problem_response = AIResponse(description=await ai_service.generate_problem(db, current_user, problem_request))
    return problem_response