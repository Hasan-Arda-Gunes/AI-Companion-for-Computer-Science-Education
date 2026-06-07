"""
AI assistance endpoints - hints, chat, feedback
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Problem, LearningSession, AIInteraction
from app.schemas.schemas import (
    HintRequest,
    HintResponse,
    ChatMessage,
    ChatResponse
)
from app.core.security import get_current_user_id
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Assistance"])


@router.post("/hint", response_model=HintResponse)
async def get_hint(
    hint_request: HintRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get a progressive hint for a problem
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    """
    
    # Verify problem exists
    result = await db.execute(
        select(Problem).where(Problem.id == hint_request.problem_id)
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Get session
    result = await db.execute(
        select(LearningSession).where(LearningSession.id == hint_request.session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session or session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Check if max hints reached
    hints_used = session.hints_used or []
    if len(hints_used) >= settings.MAX_HINTS_PER_PROBLEM:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum hints ({settings.MAX_HINTS_PER_PROBLEM}) already used"
        )
    
    # Get previous hints
    previous_hints = []
    if problem.hints and isinstance(problem.hints, list):
        previous_hints = [problem.hints[i] for i in range(min(len(hints_used), len(problem.hints)))]
    
    # Get provider from request
    provider = str(hint_request.provider).lower()
    
    # Check provider availability
    available_providers = ai_service.list_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    # Generate hint
    try:
        hint_text = await ai_service.provide_hint(
            problem_description=problem.description,
            current_code=hint_request.current_code,
            hint_level=hint_request.hint_level,
            previous_hints=previous_hints,
            provider=provider
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating hint: {str(e)}"
        )
    
    # Update session
    hints_used.append({
        "level": hint_request.hint_level,
        "hint": hint_text,
        "provider": provider,
        "timestamp": str(datetime.utcnow())
    })
    session.hints_used = hints_used
    await db.commit()
    
    # Log interaction
    interaction = AIInteraction(
        user_id=user_id,
        session_id=session.id,
        interaction_type="hint",
        user_message=f"Hint level {hint_request.hint_level}",
        ai_response=hint_text,
        context={"problem_id": hint_request.problem_id, "provider": provider}
    )
    db.add(interaction)
    await db.commit()
    
    return HintResponse(
        hint=hint_text,
        hint_level=hint_request.hint_level,
        remaining_hints=settings.MAX_HINTS_PER_PROBLEM - len(hints_used),
        provider_used=provider
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    problem_id: Optional[int] = None,
    session_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Chat with AI assistant for help
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    """
    
    problem_context = None
    current_code = None
    conversation_history = []
    
    # Get provider from request
    provider = str(message.provider).lower()
    
    # Check provider availability
    available_providers = ai_service.list_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    # Get problem context if provided
    if problem_id:
        result = await db.execute(
            select(Problem).where(Problem.id == problem_id)
        )
        problem = result.scalar_one_or_none()
        if problem:
            problem_context = f"{problem.title}\n\n{problem.description}"
    
    # Get session context if provided
    if session_id:
        result = await db.execute(
            select(LearningSession).where(
                LearningSession.id == session_id,
                LearningSession.user_id == user_id
            )
        )
        session = result.scalar_one_or_none()
        
        if session and session.ai_interactions:
            # Get last few interactions
            conversation_history = session.ai_interactions[-5:]  # Last 5 messages
        
        # Get code from context
        if message.context and "current_code" in message.context:
            current_code = message.context["current_code"]
    
    # Get AI response
    try:
        response_text = await ai_service.chat_assistance(
            user_message=message.message,
            problem_context=problem_context,
            current_code=current_code,
            conversation_history=conversation_history,
            provider=provider
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting chat response: {str(e)}"
        )
    
    # Update session with interaction
    if session_id:
        result = await db.execute(
            select(LearningSession).where(LearningSession.id == session_id)
        )
        session = result.scalar_one_or_none()
        
        if session:
            interactions = session.ai_interactions or []
            interactions.append({
                "role": "user",
                "content": message.message,
                "provider": provider,
                "timestamp": str(datetime.utcnow())
            })
            interactions.append({
                "role": "assistant",
                "content": response_text,
                "provider": provider,
                "timestamp": str(datetime.utcnow())
            })
            session.ai_interactions = interactions
            await db.commit()
    
    # Log interaction
    interaction = AIInteraction(
        user_id=user_id,
        session_id=session_id,
        interaction_type="chat",
        user_message=message.message,
        ai_response=response_text,
        context={"provider": provider, **(message.context or {})}
    )
    db.add(interaction)
    await db.commit()
    
    return ChatResponse(
        response=response_text,
        suggestions=None,
        related_concepts=None,
        provider_used=provider
    )


@router.post("/explain-error")
async def explain_error(
    error_message: str,
    code: str,
    provider: str = "gemini",
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get explanation for an error message
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    """
    
    provider = provider.lower()
    
    # Check provider availability
    available_providers = ai_service.list_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )

    prompt = f"""A student encountered this error while coding:

Error: {error_message}

Their code:
```python
{code}
```

Please explain:
1. What this error means in simple terms
2. Why it occurred
3. How to fix it

Be encouraging and educational."""

    try:
        explanation = await ai_service.chat_assistance(
            user_message=prompt,
            problem_context=None,
            current_code=code,
            provider=provider
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining error: {str(e)}"
        )
    
    # Log interaction
    interaction = AIInteraction(
        user_id=user_id,
        session_id=None,
        interaction_type="error_explanation",
        user_message=error_message,
        ai_response=explanation,
        context={"provider": provider}
    )
    db.add(interaction)
    await db.commit()
    
    return {
        "explanation": explanation,
        "provider_used": provider
    }


@router.get("/providers")
async def get_available_providers():
    """Get list of available AI providers and their status"""
    
    available_providers = ai_service.list_available_providers()
    
    return {
        "providers": available_providers,
        "available_count": sum(1 for v in available_providers.values() if v),
        "timestamp": datetime.utcnow().isoformat()
    }


from datetime import datetime
