from pydantic import BaseModel
import enum

class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class ProblemRequest(BaseModel):
    difficulty: DifficultyLevel
    topic: str