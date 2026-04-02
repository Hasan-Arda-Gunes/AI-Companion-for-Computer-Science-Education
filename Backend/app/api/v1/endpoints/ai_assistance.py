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
    """Get a progressive hint for a problem"""
    
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
    
    # Generate hint
    hint_text = await ai_service.provide_hint(
        problem_description=problem.description,
        current_code=hint_request.current_code,
        hint_level=hint_request.hint_level,
        previous_hints=previous_hints
    )
    
    # Update session
    hints_used.append({
        "level": hint_request.hint_level,
        "hint": hint_text,
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
        context={"problem_id": hint_request.problem_id}
    )
    db.add(interaction)
    await db.commit()
    
    return HintResponse(
        hint=hint_text,
        hint_level=hint_request.hint_level,
        remaining_hints=settings.MAX_HINTS_PER_PROBLEM - len(hints_used)
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    problem_id: Optional[int] = None,
    session_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Chat with AI assistant for help"""
    
    problem_context = None
    current_code = None
    conversation_history = []
    
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
    response_text = await ai_service.chat_assistance(
        user_message=message.message,
        problem_context=problem_context,
        current_code=current_code,
        conversation_history=conversation_history
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
                "timestamp": str(datetime.utcnow())
            })
            interactions.append({
                "role": "assistant",
                "content": response_text,
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
        context=message.context or {}
    )
    db.add(interaction)
    await db.commit()
    
    return ChatResponse(
        response=response_text,
        suggestions=None,
        related_concepts=None
    )


@router.post("/explain-error")
async def explain_error(
    error_message: str,
    code: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get explanation for an error message"""
    
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

    explanation = await ai_service.chat_assistance(
        user_message=prompt,
        problem_context=None,
        current_code=code
    )
    
    return {"explanation": explanation}


from datetime import datetime
