"""
Additional schemas for AI-powered problem generation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ProblemGenerationRequest(BaseModel):
    """Request to generate a problem using AI"""
    description: str = Field(
        ..., 
        description="Describe what kind of problem you want",
        examples=["Create a problem about finding duplicates in an array"]
    )
    difficulty: str = Field(
        ...,
        description="Difficulty level: beginner, intermediate, or advanced"
    )
    topic: str = Field(
        ...,
        description="Programming topic (arrays, linked_lists, trees, etc.)"
    )
    additional_requirements: Optional[str] = Field(
        None,
        description="Any specific requirements or constraints"
    )
    num_test_cases: int = Field(
        default=5,
        ge=3,
        le=10,
        description="Number of test cases to generate"
    )
    num_examples: int = Field(
        default=2,
        ge=1,
        le=5,
        description="Number of example inputs/outputs"
    )
    num_hints: int = Field(
        default=3,
        ge=1,
        le=5,
        description="Number of progressive hints"
    )


class ProblemRefinementRequest(BaseModel):
    """Request to refine an existing problem"""
    problem_id: int = Field(..., description="ID of the problem to refine")
    refinement_request: str = Field(
        ...,
        description="What to change or improve",
        examples=[
            "Make the problem harder by adding edge cases",
            "Simplify the description",
            "Add more examples"
        ]
    )


class TestCaseGenerationRequest(BaseModel):
    """Request to generate additional test cases"""
    problem_id: int = Field(..., description="ID of the problem")
    num_cases: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of test cases to generate"
    )


class ProblemSuggestionRequest(BaseModel):
    """Request for problem ideas"""
    topic: str = Field(..., description="Topic to get suggestions for")
    difficulty: str = Field(..., description="Difficulty level")
    num_suggestions: int = Field(
        default=5,
        ge=3,
        le=10,
        description="Number of suggestions to get"
    )


class ProblemIdeaResponse(BaseModel):
    """A suggested problem idea"""
    title: str
    brief_description: str
    key_concept: str


class ProblemGenerationResponse(BaseModel):
    """Response after generating a problem"""
    success: bool
    message: str
    problem_id: Optional[int] = None
    problem: Optional[Dict[str, Any]] = None
    preview: Optional[Dict[str, Any]] = None  # Preview without saving


class GeneratedProblemPreview(BaseModel):
    """Preview of generated problem before saving"""
    title: str
    description: str
    difficulty: str
    topic: str
    num_test_cases: int
    num_examples: int
    num_hints: int
    starter_code: str
