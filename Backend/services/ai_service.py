from openai import AsyncOpenAI
from models.request.ai_request import AIRequest
from models.response.ai_response import AIResponse
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

    async def generate_description(self, ai_request: AIRequest) -> AIResponse:
        response = await self.client.chat.completions.create(
            model="stepfun/step-3.5-flash:free",
            messages=[
                {
                    "role": "user",
                    "content": ai_request.prompt
                }
            ]
        )
        description = response.choices[0].message.content.strip()
        return AIResponse(description=description)


