from openai import AsyncOpenAI
from models.request.ai_request import AIRequest
from models.response.problem import ProblemResponse
import os

class AIService:
    def __init__(self, api_key: str = None):
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("API_KEY"),
            default_headers={
                "HTTP-Referer": "http://localhost:8000", # Required for OpenRouter
                "X-Title": "AI Programming Tutor",       # Optional: Your App Name
            }
        )

    async def generate_problem_description(self, ai_request: AIRequest) -> ProblemResponse:
        """Generates a programming problem description based on the given prompt."""
        fallbacks = [
                "meta-llama/llama-3.3-70b-instruct:free", # Massive and smart
                "google/gemini-2.0-flash-001:free",       # Extremely fast
                "deepseek/deepseek-r1:free"               # High-level reasoning
            ]
        response = await self.client.chat.completions.create(
            model="qwen/qwen3-coder:free",
            
            extra_body={
                "models": fallbacks, # OpenRouter handles the fallback automatically
                "route": "fallback"   # Tells OpenRouter to prioritize your order
            },
            messages=[
                {"role": "system", "content": "You are a supportive CS Tutor."},
                {"role": "user", "content": ai_request.prompt}
            ]
        )
        description = response.choices[0].message.content.strip()
        return ProblemResponse(description=description)


