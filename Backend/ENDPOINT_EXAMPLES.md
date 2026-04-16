# Example: Using Dual LLM Providers in Endpoints

This file shows how to update your existing FastAPI endpoints to support user selection of LLM providers.

## Basic Setup - No Changes Required

All existing code continues to work with default Gemini provider:

```python
# This still works - uses Gemini by default
from app.services.ai_service import ai_service

async def evaluate_submission(code: str, problem_id: str):
    feedback = await ai_service.evaluate_code(
        code=code,
        problem_description=problem,
        test_results=test_results,
        evaluation_criteria=criteria
        # provider defaults to "gemini"
    )
    return feedback
```

## Enhanced Setup - With Provider Selection

### Example 1: Code Evaluation Endpoint

**Before (Gemini only):**
```python
from fastapi import APIRouter
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/api/v1/submissions/{problem_id}/evaluate")
async def evaluate_code(problem_id: str, code: str):
    """Evaluate student code - uses Gemini only"""
    feedback = await ai_service.evaluate_code(
        code=code,
        problem_description=problem.description,
        test_results=test_results,
        evaluation_criteria={...}
    )
    return feedback
```

**After (Both Gemini & Ollama):**
```python
from fastapi import APIRouter, Query
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/api/v1/submissions/{problem_id}/evaluate")
async def evaluate_code(
    problem_id: str,
    code: str,
    provider: str = Query(
        "gemini",
        regex="^(gemini|ollama)$",
        description="LLM provider to use: 'gemini' or 'ollama'"
    )
):
    """
    Evaluate student code
    
    Query Parameters:
    - provider: Choose LLM provider ("gemini" or "ollama")
    """
    # Check provider availability
    available = ai_service.list_available_providers()
    if not available.get(provider, False):
        return {
            "error": f"{provider} provider not available",
            "available_providers": available
        }
    
    feedback = await ai_service.evaluate_code(
        code=code,
        problem_description=problem.description,
        test_results=test_results,
        evaluation_criteria={...},
        provider=provider  # Use selected provider
    )
    return feedback
```

### Example 2: Hint Generation Endpoint

**Before:**
```python
@router.post("/api/v1/problems/{problem_id}/hint")
async def get_hint(problem_id: str, level: int = 1):
    """Generate a hint for a problem"""
    hint = await ai_service.provide_hint(
        problem_description=problem.description,
        current_code=None,
        hint_level=level
    )
    return {"hint": hint}
```

**After:**
```python
@router.post("/api/v1/problems/{problem_id}/hint")
async def get_hint(
    problem_id: str,
    level: int = Query(1, ge=1, le=3),
    provider: str = Query("gemini", regex="^(gemini|ollama)$")
):
    """
    Generate a hint for a problem
    
    Query Parameters:
    - level: Hint level (1-3)
    - provider: LLM provider ("gemini" or "ollama")
    """
    try:
        hint = await ai_service.provide_hint(
            problem_description=problem.description,
            current_code=None,
            hint_level=level,
            provider=provider
        )
        return {"hint": hint, "provider": provider}
    except ValueError as e:
        return {"error": str(e), "available": ai_service.list_available_providers()}
```

### Example 3: Chat Assistance Endpoint

**Before:**
```python
@router.post("/api/v1/chat")
async def chat(message: str, session_id: str):
    """Chat with AI tutor"""
    response = await ai_service.chat_assistance(
        user_message=message
    )
    return {"response": response}
```

**After:**
```python
@router.post("/api/v1/chat")
async def chat(
    message: str,
    session_id: str,
    provider: str = Query("gemini", regex="^(gemini|ollama)$")
):
    """
    Chat with AI tutor
    
    Query Parameters:
    - provider: LLM provider ("gemini" or "ollama")
    """
    response = await ai_service.chat_assistance(
        user_message=message,
        provider=provider
    )
    return {
        "response": response,
        "provider_used": provider
    }
```

### Example 4: Full Setup with Request Models

```python
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.services.ai_service import ai_service

class CodeEvaluationRequest(BaseModel):
    code: str
    problem_id: str
    provider: str = "gemini"  # Default

router = APIRouter()

@router.post("/api/v1/evaluate")
async def evaluate(request: CodeEvaluationRequest):
    """
    Evaluate code with specified provider
    
    Request body:
    {
        "code": "...",
        "problem_id": "123",
        "provider": "gemini"  # or "ollama"
    }
    """
    # Validate provider
    available = ai_service.list_available_providers()
    if not available.get(request.provider):
        raise HTTPException(
            status_code=400,
            detail=f"Provider '{request.provider}' not available. Available: {list(available.keys())}"
        )
    
    # Get problem and test results...
    problem = get_problem(request.problem_id)
    test_results = run_tests(request.code, problem)
    
    # Evaluate
    feedback = await ai_service.evaluate_code(
        code=request.code,
        problem_description=problem.description,
        test_results=test_results,
        evaluation_criteria={...},
        provider=request.provider
    )
    
    return {
        "feedback": feedback,
        "provider_used": request.provider
    }
```

## Frontend Usage

### JavaScript/React Example

```javascript
// Using Gemini (default)
const response = await fetch('/api/v1/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: studentCode,
        problem_id: problemId
    })
});

// Using Ollama
const response = await fetch('/api/v1/evaluate?provider=ollama', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: studentCode,
        problem_id: problemId
    })
});

// Get available providers
const statusResponse = await fetch('/api/v1/providers');
const providers = await statusResponse.json();
console.log(providers); // { gemini: true, ollama: true }
```

## Provider Status Endpoint (Recommended)

Add an endpoint to check provider availability:

```python
@router.get("/api/v1/providers")
async def get_providers():
    """Get status of available LLM providers"""
    available = ai_service.list_available_providers()
    return {
        "providers": available,
        "default": "gemini",
        "recommended": "ollama" if available.get("ollama") else "gemini"
    }
```

Response example:
```json
{
    "providers": {
        "gemini": true,
        "ollama": true
    },
    "default": "gemini",
    "recommended": "ollama"
}
```

## Testing with cURL

```bash
# Check available providers
curl http://localhost:8000/api/v1/providers

# Evaluate with Gemini (default)
curl -X POST http://localhost:8000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"hello\")", "problem_id": "1"}'

# Evaluate with Ollama
curl -X POST "http://localhost:8000/api/v1/evaluate?provider=ollama" \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"hello\")", "problem_id": "1"}'

# Get hint with Gemini
curl -X POST "http://localhost:8000/api/v1/hint?level=1&provider=gemini" \
  -H "Content-Type: application/json" \
  -d '{"problem_id": "1"}'

# Get hint with Ollama
curl -X POST "http://localhost:8000/api/v1/hint?level=1&provider=ollama" \
  -H "Content-Type: application/json" \
  -d '{"problem_id": "1"}'
```

## Best Practices

1. **Always validate provider parameter**
   ```python
   if provider not in ["gemini", "ollama"]:
       raise ValueError(f"Invalid provider: {provider}")
   ```

2. **Check availability before using**
   ```python
   available = ai_service.list_available_providers()
   if not available.get(provider):
       return error_response(f"{provider} not available")
   ```

3. **Provide helpful defaults**
   ```python
   provider: str = Query(
       "gemini",
       description="LLM provider (default: gemini)"
   )
   ```

4. **Include provider in response**
   ```python
   return {
       "result": result,
       "provider_used": provider
   }
   ```

5. **Log provider usage** (for analytics)
   ```python
   logger.info(f"Using {provider} provider for evaluation")
   ```

## Summary

- ✅ Both Gemini and Ollama available simultaneously
- ✅ Users can choose via query parameter
- ✅ Backward compatible (Gemini is default)
- ✅ Graceful error handling if provider unavailable
- ✅ No breaking changes to existing code
