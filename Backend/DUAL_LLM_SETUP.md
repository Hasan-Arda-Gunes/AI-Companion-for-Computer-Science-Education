# Dual LLM Provider Support - Gemini & Ollama

This backend now supports **both Google Gemini and Ollama simultaneously**, allowing users to choose which model to use for each request!

## Key Features

✅ **Both models available at the same time**  
✅ **User can choose which provider to use**  
✅ **Fallback to available provider if one is not configured**  
✅ **Automatic provider initialization and health checks**  
✅ **Zero breaking changes to existing code** (defaults to Gemini)  

## Setup

### Option 1: Using Gemini Only (Default)

```bash
# Set environment variable
export GEMINI_API_KEY=your-api-key-here
# Get key from: https://aistudio.google.com/app/apikey

# Run backend
python main.py
```

### Option 2: Using Ollama Only (Local)

```bash
# 1. Install and start Ollama (https://ollama.ai)
ollama serve

# 2. Download a model
ollama pull llama2

# 3. Configure environment
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama2

# 4. Run backend
python main.py
```

### Option 3: Using Both Models (Recommended!)

```bash
# 1. Install Ollama and download a model
ollama serve
ollama pull llama2

# 2. Set environment variables for both
export GEMINI_API_KEY=your-api-key-here
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama2

# 3. Run backend
python main.py
```

## Using the Dual Models

### In Your API Endpoints

All AI service methods now accept an optional `provider` parameter:

```python
from app.services.ai_service import ai_service

# Use Gemini (default)
feedback = await ai_service.evaluate_code(
    code=student_code,
    problem_description=problem,
    test_results=test_results,
    evaluation_criteria=criteria
)

# Use Ollama
feedback = await ai_service.evaluate_code(
    code=student_code,
    problem_description=problem,
    test_results=test_results,
    evaluation_criteria=criteria,
    provider="ollama"  # Specify provider
)

# Get a hint with Gemini
hint = await ai_service.provide_hint(
    problem_description=problem,
    current_code=code,
    hint_level=1
)

# Get a hint with Ollama
hint = await ai_service.provide_hint(
    problem_description=problem,
    current_code=code,
    hint_level=1,
    provider="ollama"  # Specify provider
)

# Chat assistance with Gemini
response = await ai_service.chat_assistance(
    user_message="How do I solve this?",
    problem_context=problem
)

# Chat assistance with Ollama
response = await ai_service.chat_assistance(
    user_message="How do I solve this?",
    problem_context=problem,
    provider="ollama"  # Specify provider
)
```

### Check Available Providers

```python
from app.services.ai_service import ai_service

# Get status of all providers
status = ai_service.list_available_providers()
print(status)
# Output: {'gemini': True, 'ollama': True}

# Or check the provider manager directly
from app.services.llm_provider import provider_manager

available = provider_manager.list_available_providers()
print(available)
```

### In Your Frontend/REST Endpoints

Update your API endpoints to accept a `provider` query parameter:

```python
from fastapi import APIRouter, Query
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/api/v1/evaluate")
async def evaluate_submission(
    code: str,
    problem_id: str,
    provider: str = Query("gemini", regex="^(gemini|ollama)$")
):
    """Evaluate code using specified provider"""
    feedback = await ai_service.evaluate_code(
        code=code,
        problem_description=...,
        test_results=...,
        evaluation_criteria=...,
        provider=provider
    )
    return feedback

@router.post("/api/v1/hints")
async def get_hint(
    problem_id: str,
    hint_level: int = 1,
    provider: str = Query("gemini", regex="^(gemini|ollama)$")
):
    """Get hint using specified provider"""
    hint = await ai_service.provide_hint(
        problem_description=...,
        current_code=...,
        hint_level=hint_level,
        provider=provider
    )
    return {"hint": hint}

@router.post("/api/v1/chat")
async def chat_with_ai(
    message: str,
    provider: str = Query("gemini", regex="^(gemini|ollama)$")
):
    """Chat with AI using specified provider"""
    response = await ai_service.chat_assistance(
        user_message=message,
        provider=provider
    )
    return {"response": response}
```

## Configuration

### Environment Variables

```bash
# Gemini Configuration
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-2.5-flash

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Common LLM Settings
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.7
```

### In .env File

```env
# Gemini Settings
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# Ollama Settings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Common settings
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.7
```

## Model Recommendations

### Gemini
- **Speed**: Very fast
- **Quality**: Excellent
- **Cost**: Paid API (free tier available)
- **Best for**: Production, high quality

### Ollama - Lightweight Options
| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| orca-mini | 1.3GB | ⚡⚡⚡ | Good |
| phi | 1.6GB | ⚡⚡⚡ | Good |

### Ollama - Balanced Options (Recommended)
| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| mistral | 4.1GB | ⚡⚡ | Excellent |
| llama2 | 3.8GB | ⚡⚡ | Good |
| neural-chat | 4.7GB | ⚡ | Excellent |

### Ollama - High Quality Options
| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| wizard-vicuna | 13GB | ⚡ | Excellent |

## Architecture

```
AIService
├── provider_manager: LLMProviderManager
│   ├── gemini: GeminiProvider (if API key configured)
│   └── ollama: OllamaProvider (if Ollama running)
│
├── evaluate_code(provider="gemini")
├── provide_hint(provider="gemini")
├── chat_assistance(provider="gemini")
└── list_available_providers()

LLMProviderManager
├── get_provider(name) → Returns provider or raises error
├── list_available_providers() → Dict of status
└── is_available(name) → bool
```

## Error Handling

If a provider is not available, the system will:

1. **During initialization**: Log a warning, mark provider as unavailable
2. **During request**: Raise `ValueError` with helpful message
3. **In code**: Can check availability before using

```python
from app.services.llm_provider import provider_manager

# Check before using
if provider_manager.is_available("ollama"):
    provider = "ollama"
else:
    provider = "gemini"

feedback = await ai_service.evaluate_code(..., provider=provider)
```

## Troubleshooting

### "Ollama provider not available"
- Make sure Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL matches where Ollama is running
- Try: `curl http://localhost:11434/api/tags`

### "Model not found" in Ollama
- List models: `ollama list`
- Download model: `ollama pull mistral`
- Update OLLAMA_MODEL env var

### "GEMINI_API_KEY not set"
- Get API key from: https://aistudio.google.com/app/apikey
- Set environment variable: `export GEMINI_API_KEY=your-key`

### Provider selection not working
- Verify provider parameter spelling: must be exactly `"gemini"` or `"ollama"`
- Check provider availability: `ai_service.list_available_providers()`
- Check backend logs for provider initialization messages

## Files Modified

1. **requirements.txt** - Added `ollama==0.3.2`
2. **app/core/config.py** - Added Gemini & Ollama settings
3. **app/services/ai_service.py** - Multi-provider support
4. **app/services/llm_provider.py** (NEW) - Provider implementations

## Backward Compatibility

✅ Existing code works unchanged  
✅ Default provider is Gemini (no breaking changes)  
✅ Methods work with or without provider parameter  
✅ All existing API endpoints continue to work  

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment variables
3. Update your endpoints to accept `provider` parameter (optional)
4. Test with both providers!

## Example: Complete Setup

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Download model
ollama pull mistral

# Terminal 3: Configure and run backend
export GEMINI_API_KEY=your-api-key
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=mistral
cd Backend && python main.py
```

Now you have both Gemini and Ollama available! 🎉
