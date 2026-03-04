from openai import AsyncOpenAI
from models.request.ai_request import AIRequest
from models.request.problem_request import ProblemRequest
from models.question import Question
from sqlalchemy.orm import Session
from models.user import User
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

    async def generate_description(self, ai_request: AIRequest):
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
        return description
    
    async def generate_problem(self, db: Session, current_user: User, problem_request: ProblemRequest):
        ai_request = AIRequest(prompt=f"Generate a {problem_request.topic} problem with {problem_request.difficulty} level difficulty for computer science students.")
        description = await self.generate_description(ai_request)
        new_question = Question(
            title=f"{problem_request.topic} Problem",
            description=description,
            difficulty=problem_request.difficulty,
            topic=problem_request.topic,
            label="AI",
            user_id=current_user.id  
        )
        db.add(new_question)
        db.commit()
        db.refresh(new_question)    

        return description



