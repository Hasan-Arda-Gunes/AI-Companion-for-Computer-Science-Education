from pydantic import BaseModel

class ProblemResponse(BaseModel):
    description: str