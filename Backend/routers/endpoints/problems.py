from fastapi import APIRouter
from models.request.ai_request import AIRequest
from models.request.problem_request import ProblemRequest
from models.response.ai_response import AIResponse
from services.ai_service import AIService

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.post("/generate", response_model=AIResponse)
async def generate_problem(problem_request: ProblemRequest):
    """Endpoint to generate a programming problem description based on the given prompt."""
    ai_service = AIService()
    ai_request = AIRequest(prompt=f"Generate a {problem_request.topic} problem with {problem_request.difficulty} level difficulty for computer science students.")
    problem_response = await ai_service.generate_description(ai_request)
    return problem_response