# Dual LLM Provider Endpoint Integration - Complete ✅

All API endpoints and related schemas have been successfully updated to support dual LLM provider selection (Gemini and Ollama).

## Summary of Changes

### 1. Schema Updates (`app/schemas/schemas.py`)

**Added/Updated:**
- ✅ `SubmissionCreate`: Added `provider: LLMProvider = LLMProvider.GEMINI` field
- ✅ `SubmissionResponse`: Added `provider_used: Optional[str] = None` field

**Already Updated Previously:**
- ✅ `LLMProvider` enum with GEMINI and OLLAMA values
- ✅ `ChatMessage` with provider field
- ✅ `ChatResponse` with provider_used field
- ✅ `HintRequest` with provider field
- ✅ `HintResponse` with provider_used field

### 2. Database Model Updates (`app/models/models.py`)

**Submission Model:**
- ✅ Added `provider_used = Column(String(50), default="gemini")` field to track which provider was used for AI feedback

### 3. Endpoint Updates

#### AI Assistance Endpoints (`app/api/v1/endpoints/ai_assistance.py`)

**✅ POST `/api/v1/ai/hint`**
- Accepts `provider` in request body (defaults to "gemini")
- Validates provider availability before processing
- Returns `HintResponse` with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai/chat`**
- Accepts `provider` in message body (defaults to "gemini")
- Validates provider availability before processing
- Returns `ChatResponse` with `provider_used` field
- Tracks provider in session interactions
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai/explain-error`**
- Accepts `provider` as query parameter (defaults to "gemini")
- Validates provider availability before processing
- Returns explanation response with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

**✅ NEW GET `/api/v1/ai/providers`**
- Returns list of available providers and their status
- Response includes:
  - `providers`: Dict with provider names and availability status
  - `available_count`: Number of available providers
  - `timestamp`: Request timestamp in ISO format
- No authentication required
- Useful for frontend to show provider options to users

#### Code Submission Endpoints (`app/api/v1/endpoints/submissions.py`)

**✅ POST `/api/v1/submissions`**
- Accepts `provider` in `SubmissionCreate` body (defaults to "gemini")
- Validates provider availability
- Passes provider to background evaluation task
- Evaluation uses specified provider for AI feedback

**✅ Background Task `evaluate_submission_background`**
- Now accepts `provider` parameter
- Passes provider to `ai_service.evaluate_code()` call
- Stores `provider_used` in submission record for audit trail

### 4. Service Layer (Already Updated - Reference)

**AI Service (`app/services/ai_service.py`):**
- ✅ All methods support `provider` parameter:
  - `evaluate_code(provider="gemini")`
  - `provide_hint(provider="gemini")`
  - `chat_assistance(provider="gemini")`
  - `list_available_providers()` - returns provider availability status

**Provider Manager (`app/services/llm_provider.py`):**
- ✅ `GeminiProvider` class - wraps Google Gemini API
- ✅ `OllamaProvider` class - wraps Ollama local LLM
- ✅ `LLMProviderManager` singleton - manages availability and provider selection

## API Usage Examples

### Get Available Providers
```bash
curl -X GET "http://localhost:8000/api/v1/ai/providers"
```

Response:
```json
{
  "providers": {
    "gemini": true,
    "ollama": false
  },
  "available_count": 1,
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

### Submit Code with Ollama Provider
```bash
curl -X POST "http://localhost:8000/api/v1/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "code": "print(\"hello\")",
    "language": "python",
    "session_id": 1,
    "provider": "ollama"
  }'
```

### Get Hint with Gemini
```bash
curl -X POST "http://localhost:8000/api/v1/ai/hint" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "session_id": 1,
    "hint_level": 2,
    "provider": "gemini"
  }'
```

### Chat with Ollama
```bash
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "message": "How do I debug this?",
    "provider": "ollama"
  }'
```

### Explain Error with Gemini
```bash
curl -X POST "http://localhost:8000/api/v1/ai/explain-error?provider=gemini" \
  -H "Content-Type: application/json" \
  -d '{
    "error_message": "NameError: name x is not defined",
    "code": "print(x)"
  }'
```

## Error Handling

### Provider Unavailable (503)
```json
{
  "detail": "Provider 'ollama' not available. Available: ['gemini']"
}
```

### Service Error (500)
```json
{
  "detail": "Error: Connection failed to Ollama service"
}
```

## Backward Compatibility

✅ All endpoints default to **"gemini"** provider if not specified, ensuring backward compatibility with existing clients.

## Features Enabled

1. **User Choice** - Users can select which LLM provider to use for each request
2. **Provider Status** - New endpoint allows checking available providers
3. **Audit Trail** - All submissions track which provider was used for feedback
4. **Error Handling** - Clear error messages when provider is unavailable
5. **Validation** - Provider availability validated before processing
6. **Graceful Degradation** - Falls back to available provider or returns 503 error

## Testing Checklist

- [ ] Test GET `/api/v1/ai/providers` - returns provider status
- [ ] Test POST `/api/v1/ai/hint` with provider="gemini"
- [ ] Test POST `/api/v1/ai/hint` with provider="ollama"
- [ ] Test POST `/api/v1/ai/chat` with provider="gemini"
- [ ] Test POST `/api/v1/ai/chat` with provider="ollama"
- [ ] Test POST `/api/v1/ai/explain-error` with provider="gemini"
- [ ] Test POST `/api/v1/ai/explain-error` with provider="ollama"
- [ ] Test POST `/api/v1/submissions` with provider="gemini"
- [ ] Test POST `/api/v1/submissions` with provider="ollama"
- [ ] Test 503 error when unavailable provider requested
- [ ] Test default provider (gemini) when not specified
- [ ] Verify provider_used field in responses
- [ ] Verify provider_used field stored in database

## Database Migration

If deploying to production, run Alembic migration to add `provider_used` column:
```bash
alembic revision --autogenerate -m "Add provider_used to submissions"
alembic upgrade head
```

## Next Steps

1. ✅ All endpoints updated with provider support
2. ✅ Schema validation for provider field
3. ✅ Provider availability checks
4. ✅ Error handling for unavailable providers
5. ⏳ Frontend integration to show provider selector
6. ⏳ Testing with both providers
7. ⏳ Performance benchmarking between providers
8. ⏳ User preferences for default provider (optional)

## File Summary

Modified Files:
- `app/schemas/schemas.py` - Added provider fields to schemas
- `app/models/models.py` - Added provider_used column to Submission model
- `app/api/v1/endpoints/submissions.py` - Updated submission endpoint and background task
- `app/api/v1/endpoints/ai_assistance.py` - Added provider endpoint

Reference (Previously Modified):
- `app/services/llm_provider.py` - Provider implementations
- `app/services/ai_service.py` - Service with provider support
- `requirements.txt` - Added ollama dependency
- `app/core/config.py` - Configuration for both providers
