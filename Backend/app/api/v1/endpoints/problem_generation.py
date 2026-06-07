"""
AI-Powered Problem Generation Endpoints
Allows users to create problems using AI assistance
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.models import Problem, User
from app.schemas.problem_generation import (
    ProblemGenerationRequest,
    ProblemRefinementRequest,
    TestCaseGenerationRequest,
    ProblemSuggestionRequest,
    ProblemGenerationResponse,
    ProblemIdeaResponse,
    GeneratedProblemPreview
)
from app.core.security import get_current_user_id
from app.services.problem_generator import problem_generator

router = APIRouter(prefix="/ai-problems", tags=["AI Problem Generation"])


@router.post("/", response_model=ProblemGenerationResponse)
async def generate_problem(
    request: ProblemGenerationRequest,
    save: bool = True,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Generate a complete programming problem using AI
    
    - **description**: Describe what kind of problem you want
    - **difficulty**: beginner, intermediate, or advanced
    - **topic**: Programming topic
    - **provider**: LLM provider to use: 'gemini' or 'ollama'
    - **save**: If True, saves to database. If False, returns preview only.
    
    Example:
    ```json
    {
      "description": "Create a problem about finding the longest palindromic substring",
      "difficulty": "intermediate",
      "topic": "strings",
      "additional_requirements": "Should use dynamic programming",
      "provider": "gemini"
    }
    ```
    """
    
    provider = str(request.provider).lower()
    
    # Check provider availability
    available_providers = problem_generator.get_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    try:
        # Generate problem using AI with specified provider
        problem_data = await problem_generator.generate_problem(
            description=request.description,
            difficulty=request.difficulty,
            topic=request.topic,
            additional_requirements=request.additional_requirements,
            num_test_cases=request.num_test_cases,
            num_examples=request.num_examples,
            num_hints=request.num_hints,
            provider=provider
        )
        
        if not save:
            # Return preview only
            return ProblemGenerationResponse(
                success=True,
                message="Problem generated successfully (preview mode)",
                provider_used=provider,
                preview={
                    "title": problem_data["title"],
                    "description": problem_data["description"],
                    "difficulty": request.difficulty,
                    "topic": request.topic,
                    "num_test_cases": len(problem_data.get("test_cases", [])),
                    "num_examples": len(problem_data.get("examples", [])),
                    "num_hints": len(problem_data.get("hints", [])),
                    "starter_code": problem_data.get("starter_code", "")
                },
                problem=problem_data
            )
        
        # Save to database
        new_problem = Problem(
            title=problem_data["title"],
            description=problem_data["description"],
            difficulty=request.difficulty,
            topic=request.topic,
            constraints=problem_data.get("constraints"),
            examples=problem_data.get("examples", []),
            test_cases=problem_data.get("test_cases", []),
            starter_code=problem_data.get("starter_code"),
            solution_template=problem_data.get("solution_template"),
            evaluation_criteria=problem_data.get("evaluation_criteria", {}),
            time_limit=problem_data.get("time_limit", 5000),
            memory_limit=problem_data.get("memory_limit", 256),
            hints=problem_data.get("hints", []),
            learning_objectives=problem_data.get("learning_objectives", []),
            related_concepts=problem_data.get("related_concepts", []),
            created_by=user_id
        )
        
        db.add(new_problem)
        await db.commit()
        await db.refresh(new_problem)
        
        return ProblemGenerationResponse(
            success=True,
            message="Problem generated and saved successfully!",
            provider_used=provider,
            problem_id=new_problem.id,
            problem=problem_data
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating problem: {str(e)}"
        )


@router.post("/refine", response_model=ProblemGenerationResponse)
async def refine_problem(
    request: ProblemRefinementRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Refine an existing problem using AI
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    
    Example:
    ```json
    {
      "problem_id": 1,
      "refinement_request": "Make it harder by adding more edge cases and increase difficulty",
      "provider": "gemini"
    }
    ```
    """
    
    provider = str(request.provider).lower()
    
    # Check provider availability
    available_providers = problem_generator.get_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    # Get existing problem
    result = await db.execute(
        select(Problem).where(Problem.id == request.problem_id)
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Only allow creator or admin to refine
    if problem.created_by != user_id:
        # In production, check if user is admin
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only refine problems you created"
        )
    
    try:
        # Convert problem to dict
        existing_problem = {
            "title": problem.title,
            "description": problem.description,
            "difficulty": problem.difficulty.value,
            "topic": problem.topic,
            "constraints": problem.constraints,
            "examples": problem.examples,
            "test_cases": problem.test_cases,
            "starter_code": problem.starter_code,
            "solution_template": problem.solution_template,
            "evaluation_criteria": problem.evaluation_criteria,
            "hints": problem.hints,
            "learning_objectives": problem.learning_objectives,
            "related_concepts": problem.related_concepts
        }
        
        # Refine using AI with specified provider
        refined_data = await problem_generator.refine_problem(
            existing_problem=existing_problem,
            refinement_request=request.refinement_request,
            provider=provider
        )
        
        # Update problem in database
        problem.title = refined_data.get("title", problem.title)
        problem.description = refined_data.get("description", problem.description)
        problem.constraints = refined_data.get("constraints", problem.constraints)
        problem.examples = refined_data.get("examples", problem.examples)
        problem.test_cases = refined_data.get("test_cases", problem.test_cases)
        problem.starter_code = refined_data.get("starter_code", problem.starter_code)
        problem.solution_template = refined_data.get("solution_template", problem.solution_template)
        problem.hints = refined_data.get("hints", problem.hints)
        problem.learning_objectives = refined_data.get("learning_objectives", problem.learning_objectives)
        problem.related_concepts = refined_data.get("related_concepts", problem.related_concepts)
        
        await db.commit()
        await db.refresh(problem)
        
        return ProblemGenerationResponse(
            success=True,
            message="Problem refined successfully!",
            provider_used=provider,
            problem_id=problem.id,
            problem=refined_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refining problem: {str(e)}"
        )


@router.post("/test-cases/{problem_id}")
async def generate_additional_test_cases(
    problem_id: int,
    request: TestCaseGenerationRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Generate additional test cases for an existing problem
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    """
    
    provider = str(request.provider).lower()
    
    # Check provider availability
    available_providers = problem_generator.get_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    # Get problem
    result = await db.execute(
        select(Problem).where(Problem.id == problem_id)
    )
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    try:
        # Generate test cases using specified provider
        new_cases = await problem_generator.generate_test_cases(
            problem_description=problem.description,
            function_signature=problem.starter_code,
            num_cases=request.num_cases,
            provider=provider
        )
        
        # Add to existing test cases
        existing_cases = problem.test_cases or []
        
        # Update IDs to avoid conflicts
        next_id = len(existing_cases) + 1
        for case in new_cases:
            case["id"] = f"test_{next_id}"
            next_id += 1
        
        updated_cases = existing_cases + new_cases
        problem.test_cases = updated_cases
        
        await db.commit()
        
        return {
            "success": True,
            "message": f"Generated {len(new_cases)} new test cases",
            "provider_used": provider,
            "new_test_cases": new_cases,
            "total_test_cases": len(updated_cases)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test cases: {str(e)}"
        )


@router.post("/suggestions", response_model=List[ProblemIdeaResponse])
async def get_problem_suggestions(
    request: ProblemSuggestionRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Get AI-generated problem ideas/suggestions
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    
    Great for when users need inspiration!
    
    Example:
    ```json
    {
      "topic": "trees",
      "difficulty": "intermediate",
      "num_suggestions": 5,
      "provider": "gemini"
    }
    ```
    """
    
    provider = str(request.provider).lower()
    
    # Check provider availability
    available_providers = problem_generator.get_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    try:
        ideas = await problem_generator.suggest_problem_ideas(
            topic=request.topic,
            difficulty=request.difficulty,
            num_suggestions=request.num_suggestions,
            provider=provider
        )
        
        return ideas
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating suggestions: {str(e)}"
        )


@router.post("/from-suggestion")
async def create_problem_from_suggestion(
    title: str,
    brief_description: str,
    difficulty: str,
    topic: str,
    provider: str = "gemini",
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Create a full problem from a suggestion
    
    Takes a problem idea and generates the complete problem using specified provider
    
    Provider options: "gemini" or "ollama" (defaults to "gemini")
    """
    
    provider = provider.lower()
    
    # Check provider availability
    available_providers = problem_generator.get_available_providers()
    if not available_providers.get(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Provider '{provider}' not available. Available: {list(available_providers.keys())}"
        )
    
    try:
        # Generate full problem from the suggestion using specified provider
        problem_data = await problem_generator.generate_problem(
            description=f"{title}: {brief_description}",
            difficulty=difficulty,
            topic=topic,
            provider=provider
        )
        
        # Save to database
        new_problem = Problem(
            title=problem_data["title"],
            description=problem_data["description"],
            difficulty=difficulty,
            topic=topic,
            constraints=problem_data.get("constraints"),
            examples=problem_data.get("examples", []),
            test_cases=problem_data.get("test_cases", []),
            starter_code=problem_data.get("starter_code"),
            solution_template=problem_data.get("solution_template"),
            evaluation_criteria=problem_data.get("evaluation_criteria", {}),
            time_limit=problem_data.get("time_limit", 5000),
            memory_limit=problem_data.get("memory_limit", 256),
            hints=problem_data.get("hints", []),
            learning_objectives=problem_data.get("learning_objectives", []),
            related_concepts=problem_data.get("related_concepts", []),
            created_by=user_id
        )
        
        db.add(new_problem)
        await db.commit()
        await db.refresh(new_problem)
        
        return ProblemGenerationResponse(
            success=True,
            message="Problem created from suggestion!",
            provider_used=provider,
            problem_id=new_problem.id,
            problem=problem_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating problem: {str(e)}"
        )
