# Problem Generation Endpoint Provider Support - Complete ✅

All problem generation endpoints and the problem generator service have been updated to support dual LLM provider selection (Gemini and Ollama).

## Summary of Changes

### 1. Schema Updates (`app/schemas/problem_generation.py`)

**Request Schemas - Added provider field to all:**
- ✅ `ProblemGenerationRequest`: Added `provider: LLMProvider = LLMProvider.GEMINI`
- ✅ `ProblemRefinementRequest`: Added `provider: LLMProvider = LLMProvider.GEMINI`
- ✅ `TestCaseGenerationRequest`: Added `provider: LLMProvider = LLMProvider.GEMINI`
- ✅ `ProblemSuggestionRequest`: Added `provider: LLMProvider = LLMProvider.GEMINI`

**Response Schema - Added provider tracking:**
- ✅ `ProblemGenerationResponse`: Added `provider_used: Optional[str] = None`

### 2. Service Layer Updates (`app/services/problem_generator.py`)

**Major Refactoring:**
- ✅ Removed direct Gemini API calls (`google.generativeai`)
- ✅ Now uses `ai_service.chat_assistance()` for all LLM calls
- ✅ Added `get_available_providers()` method
- ✅ Added `provider: str = "gemini"` parameter to all methods:
  - `generate_problem(provider="gemini")`
  - `refine_problem(provider="gemini")`
  - `generate_test_cases(provider="gemini")`
  - `suggest_problem_ideas(provider="gemini")`
- ✅ New internal method: `_generate_text(prompt, provider)` - uses ai_service

**Benefits:**
- Unified LLM access through provider manager
- Automatic fallback handling
- Consistent error handling across all providers
- Easier to add new providers in future

### 3. Endpoint Updates (`app/api/v1/endpoints/problem_generation.py`)

**✅ POST `/api/v1/ai-problems/`** (Generate Problem)
- Accepts `provider` in request body (defaults to "gemini")
- Validates provider availability before processing
- Returns `ProblemGenerationResponse` with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai-problems/refine`** (Refine Problem)
- Accepts `provider` in request body (defaults to "gemini")
- Validates provider availability before processing
- Returns response with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai-problems/test-cases/{problem_id}`** (Generate Test Cases)
- Accepts `provider` in request body (defaults to "gemini")
- Validates provider availability before processing
- Returns response with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai-problems/suggestions`** (Get Problem Suggestions)
- Accepts `provider` in request body (defaults to "gemini")
- Validates provider availability before processing
- Error handling: HTTPException(503) if provider unavailable

**✅ POST `/api/v1/ai-problems/from-suggestion`** (Create from Suggestion)
- Accepts `provider` as query parameter (defaults to "gemini")
- Validates provider availability before processing
- Returns `ProblemGenerationResponse` with `provider_used` field
- Error handling: HTTPException(503) if provider unavailable

## API Usage Examples

### Generate Problem with Ollama
```bash
curl -X POST "http://localhost:8000/api/v1/ai-problems/" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a problem about finding the longest palindromic substring",
    "difficulty": "intermediate",
    "topic": "strings",
    "additional_requirements": "Should use dynamic programming",
    "provider": "ollama"
  }'
```

### Refine Problem with Gemini
```bash
curl -X POST "http://localhost:8000/api/v1/ai-problems/refine" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "refinement_request": "Make the problem harder",
    "provider": "gemini"
  }'
```

### Generate Test Cases with Ollama
```bash
curl -X POST "http://localhost:8000/api/v1/ai-problems/test-cases/1" \
  -H "Content-Type: application/json" \
  -d '{
    "num_cases": 5,
    "provider": "ollama"
  }'
```

### Get Problem Suggestions with Gemini
```bash
curl -X POST "http://localhost:8000/api/v1/ai-problems/suggestions" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "trees",
    "difficulty": "intermediate",
    "num_suggestions": 5,
    "provider": "gemini"
  }'
```

### Create Problem from Suggestion
```bash
curl -X POST "http://localhost:8000/api/v1/ai-problems/from-suggestion?provider=ollama" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tree Problem",
    "brief_description": "A challenging tree problem",
    "difficulty": "advanced",
    "topic": "trees"
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
  "detail": "Error generating problem: Connection failed to Ollama service"
}
```

## Backward Compatibility

✅ All endpoints default to **"gemini"** provider if not specified, ensuring backward compatibility with existing clients.

## Features Enabled

1. **User Choice** - Users can select which LLM provider to use for problem generation
2. **Provider Status** - `problem_generator.get_available_providers()` for checking availability
3. **Consistency** - All problem generation uses same provider manager as AI assistance
4. **Error Handling** - Clear error messages when provider is unavailable
5. **Validation** - Provider availability validated before processing
6. **Tracking** - `provider_used` included in all responses

## Service Architecture

**Old Architecture (Direct Gemini):**
```
endpoint → problem_generator → genai.GenerativeModel
```

**New Architecture (Multi-Provider):**
```
endpoint → problem_generator → ai_service → provider_manager → (Gemini | Ollama)
```

## Benefits

1. **Unified LLM Access** - Single point of provider management
2. **Extensibility** - Easy to add new providers (Claude, OpenAI, etc.)
3. **Consistency** - Problem generation uses same infrastructure as AI assistance
4. **Error Handling** - Centralized error handling through provider manager
5. **Monitoring** - Can track provider usage across all AI features
6. **Fallback** - Can implement automatic fallback to secondary provider

## Testing Checklist

- [ ] Test POST `/api/v1/ai-problems/` with provider="gemini"
- [ ] Test POST `/api/v1/ai-problems/` with provider="ollama"
- [ ] Test POST `/api/v1/ai-problems/refine` with provider="gemini"
- [ ] Test POST `/api/v1/ai-problems/refine` with provider="ollama"
- [ ] Test POST `/api/v1/ai-problems/test-cases/1` with provider="gemini"
- [ ] Test POST `/api/v1/ai-problems/test-cases/1` with provider="ollama"
- [ ] Test POST `/api/v1/ai-problems/suggestions` with provider="gemini"
- [ ] Test POST `/api/v1/ai-problems/suggestions` with provider="ollama"
- [ ] Test POST `/api/v1/ai-problems/from-suggestion` with provider="gemini"
- [ ] Test POST `/api/v1/ai-problems/from-suggestion` with provider="ollama"
- [ ] Test 503 error when unavailable provider requested
- [ ] Test default provider (gemini) when not specified
- [ ] Verify provider_used field in all responses

## File Summary

Modified Files:
- `app/schemas/problem_generation.py` - Added provider fields to all request schemas, added provider_used to response
- `app/services/problem_generator.py` - Complete refactor to use ai_service with provider parameter
- `app/api/v1/endpoints/problem_generation.py` - Updated all 5 endpoints with provider support, validation, and error handling

## Next Steps

1. ✅ All problem generation endpoints support provider selection
2. ✅ Service layer refactored to use unified provider manager
3. ✅ Error handling implemented for unavailable providers
4. ⏳ Testing with both providers
5. ⏳ Performance benchmarking (Gemini vs Ollama for problem generation)
6. ⏳ Frontend integration to show provider selector
7. ⏳ User preferences for default provider (optional)

## Architecture Summary

The problem generation system now uses the same provider abstraction as the AI assistance system:

```
┌─────────────────────────────────────────┐
│      Problem Generation Endpoints       │
├─────────────────────────────────────────┤
│ - Generate Problem                      │
│ - Refine Problem                        │
│ - Generate Test Cases                   │
│ - Suggest Problem Ideas                 │
│ - Create from Suggestion                │
└─────────────────────────────────────────┘
                    │
                    ↓
      ┌─────────────────────────┐
      │  problem_generator      │
      │  (Service)              │
      │                         │
      │ - get_available_providers
      │ - generate_problem      │
      │ - refine_problem        │
      │ - generate_test_cases   │
      │ - suggest_problem_ideas │
      └─────────────────────────┘
                    │
                    ↓
      ┌─────────────────────────┐
      │    ai_service           │
      │  (Unified LLM Access)   │
      │ chat_assistance()       │
      └─────────────────────────┘
                    │
                    ↓
      ┌─────────────────────────┐
      │  provider_manager       │
      │  (Singleton)            │
      │                         │
      │  ├─ Gemini Provider     │
      │  └─ Ollama Provider     │
      └─────────────────────────┘
```
