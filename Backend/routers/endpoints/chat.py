from fastapi import APIRouter
from models.request.ai_request import AIRequest
from models.response.ai_response import AIResponse
from services.ai_service import AIService

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/send", response_model=AIResponse)
async def send_message(chat_request: AIRequest):
    """Endpoint to generate a response to a chat message."""
    ai_service = AIService()
    ai_response = AIResponse(description=await ai_service.generate_description(chat_request))
    return ai_response