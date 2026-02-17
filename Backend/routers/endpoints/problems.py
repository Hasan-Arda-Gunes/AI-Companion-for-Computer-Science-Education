from fastapi import APIRouter
from models.request.ai_request import AIRequest
from models.response.problem import ProblemResponse
from services.ai_service import AIService

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.post("/generate", response_model=ProblemResponse)
async def generate_problem(ai_request: AIRequest):
    """Endpoint to generate a programming problem description based on the given prompt."""
    ai_service = AIService()
    problem_response = await ai_service.generate_problem_description(ai_request)
    return problem_response