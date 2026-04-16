"""
AI Problem Generator Service
Generates complete programming problems using dual LLM providers (Gemini and Ollama)
"""
import json
from typing import Dict, List, Any, Optional
from app.services.ai_service import ai_service


class ProblemGeneratorService:
    """Service for AI-powered problem generation with multi-provider support"""
    
    def get_available_providers(self) -> Dict[str, bool]:
        """Get dict of available providers and their status"""
        return ai_service.list_available_providers()
    
    async def _generate_text(self, prompt: str, provider: str = "gemini") -> str:
        """Generate text using specified LLM provider"""
        try:
            response = await ai_service.chat_assistance(
                user_message=prompt,
                problem_context=None,
                current_code=None,
                provider=provider
            )
            if response:
                return response.strip()
            raise ValueError("Empty response from AI service")
        except Exception as e:
            raise ValueError(f"Error generating text with {provider}: {str(e)}")
    
    async def generate_problem(
        self,
        description: str,
        difficulty: str,
        topic: str,
        additional_requirements: Optional[str] = None,
        num_test_cases: int = 5,
        num_examples: int = 2,
        num_hints: int = 3,
        provider: str = "gemini"
    ) -> Dict[str, Any]:
        """
        Generate a complete programming problem from a description
        
        Args:
            description: User's description of what problem they want
            difficulty: beginner, intermediate, or advanced
            topic: Programming topic (arrays, linked_lists, etc.)
            additional_requirements: Any specific requirements
            num_test_cases: Number of test cases to generate
            num_examples: Number of example inputs/outputs
            num_hints: Number of progressive hints
            provider: LLM provider to use (gemini or ollama)
            
        Returns:
            Complete problem structure ready to be saved to database
        """
        
        prompt = f"""You are an expert computer science educator creating programming problems.

Generate a complete, well-structured programming problem based on this request:

**User Request:**
{description}

**Requirements:**
- Difficulty Level: {difficulty}
- Topic: {topic}
- Number of test cases: {num_test_cases}
- Number of examples: {num_examples}
- Number of hints: {num_hints}
"""

        if additional_requirements:
            prompt += f"\n**Additional Requirements:**\n{additional_requirements}\n"

        prompt += """

Generate a JSON object with this EXACT structure:

{
  "title": "Clear, concise problem title",
  "description": "Detailed problem description with context, requirements, and constraints. Use markdown formatting.",
  "constraints": {
    "input_constraints": "Description of input limits",
    "time_complexity_target": "Expected time complexity (e.g., O(n))",
    "space_complexity_target": "Expected space complexity"
  },
  "examples": [
    {
      "input": "Example input (use actual values)",
      "expected_output": "Expected output",
      "explanation": "Why this output is correct"
    }
  ],
  "test_cases": [
    {
      "id": "test_1",
      "input": ["input parameters as list"],
      "expected_output": "expected result",
      "function_name": "function_name_to_test"
    }
  ],
  "starter_code": "Python function template with docstring and parameters",
  "solution_template": "A correct reference solution (for validation purposes)",
  "evaluation_criteria": {
    "check_correctness": true,
    "check_efficiency": true,
    "check_style": true,
    "expected_time_complexity": "O(n)",
    "expected_space_complexity": "O(1)"
  },
  "hints": [
    "First hint - gentle nudge about approach",
    "Second hint - more specific guidance",
    "Third hint - detailed approach without full solution"
  ],
  "learning_objectives": [
    "What students should learn from this problem"
  ],
  "related_concepts": [
    "Related CS concepts and topics"
  ],
  "time_limit": 5000,
  "memory_limit": 256
}

IMPORTANT GUIDELINES:
1. Make the problem clear, unambiguous, and educational
2. Include diverse test cases (edge cases, normal cases, boundary cases)
3. Ensure test cases actually test the problem correctly
4. Write clean, well-documented starter code
5. Make hints progressive (don't give away solution in first hint)
6. Align difficulty with the specified level
7. Make examples clear and instructive
8. Use appropriate input/output formats for the topic

Generate ONLY the JSON object, no additional text or markdown formatting.
"""

        try:
            problem_text = await self._generate_text(prompt, provider)
            
            # Remove markdown code fences if present
            if problem_text.startswith("```"):
                lines = problem_text.split("\n")
                problem_text = "\n".join(lines[1:-1])
            if problem_text.startswith("json"):
                problem_text = problem_text[4:].strip()
            
            problem_data = json.loads(problem_text)
            
            # Validate required fields
            required_fields = [
                "title", "description", "examples", "test_cases",
                "starter_code", "evaluation_criteria"
            ]
            for field in required_fields:
                if field not in problem_data:
                    raise ValueError(f"Generated problem missing required field: {field}")
            
            return problem_data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error generating problem: {str(e)}")
    
    async def refine_problem(
        self,
        existing_problem: Dict[str, Any],
        refinement_request: str,
        provider: str = "gemini"
    ) -> Dict[str, Any]:
        """
        Refine an existing problem based on user feedback
        
        Args:
            existing_problem: Current problem structure
            refinement_request: What to change/improve
            provider: LLM provider to use (gemini or ollama)
            
        Returns:
            Updated problem structure
        """
        
        prompt = f"""You are refining a programming problem based on user feedback.

**Current Problem:**
```json
{json.dumps(existing_problem, indent=2)}
```

**Refinement Request:**
{refinement_request}

Please modify the problem according to the request and return the COMPLETE updated problem in the same JSON format. Make sure to maintain all required fields and keep the problem consistent.

Return ONLY the JSON object, no additional text.
"""

        try:
            problem_text = await self._generate_text(prompt, provider)
            
            # Clean up response
            if problem_text.startswith("```"):
                lines = problem_text.split("\n")
                problem_text = "\n".join(lines[1:-1])
            if problem_text.startswith("json"):
                problem_text = problem_text[4:].strip()
            
            refined_problem = json.loads(problem_text)
            return refined_problem
            
        except Exception as e:
            raise ValueError(f"Error refining problem: {str(e)}")
    
    async def generate_test_cases(
        self,
        problem_description: str,
        function_signature: str,
        num_cases: int = 5,
        provider: str = "gemini"
    ) -> List[Dict[str, Any]]:
        """
        Generate additional test cases for an existing problem
        
        Args:
            problem_description: Description of the problem
            function_signature: Function signature/template
            num_cases: Number of test cases to generate
            provider: LLM provider to use (gemini or ollama)
            
        Returns:
            List of test cases
        """
        
        prompt = f"""Generate {num_cases} diverse test cases for this programming problem.

**Problem:**
{problem_description}

**Function Signature:**
{function_signature}

Generate a JSON array of test cases covering:
1. Normal cases
2. Edge cases (empty input, single element, etc.)
3. Boundary cases (min/max values)
4. Special cases specific to this problem

Format:
[
  {{
    "id": "test_1",
    "description": "What this test case checks",
    "input": ["param1_value", "param2_value"],
    "expected_output": "expected_result",
    "function_name": "function_name"
  }}
]

Return ONLY the JSON array, no additional text.
"""

        try:
            cases_text = await self._generate_text(prompt, provider)
            
            # Clean up
            if cases_text.startswith("```"):
                lines = cases_text.split("\n")
                cases_text = "\n".join(lines[1:-1])
            if cases_text.startswith("json"):
                cases_text = cases_text[4:].strip()
            
            test_cases = json.loads(cases_text)
            return test_cases
            
        except Exception as e:
            raise ValueError(f"Error generating test cases: {str(e)}")
    
    async def suggest_problem_ideas(
        self,
        topic: str,
        difficulty: str,
        num_suggestions: int = 5,
        provider: str = "gemini"
    ) -> List[Dict[str, str]]:
        """
        Get problem ideas/suggestions based on topic and difficulty
        
        Args:
            topic: Programming topic
            difficulty: Difficulty level
            num_suggestions: Number of ideas to generate
            provider: LLM provider to use (gemini or ollama)
            
        Returns:
            List of problem ideas with titles and brief descriptions
        """
        
        prompt = f"""Suggest {num_suggestions} creative programming problem ideas.

**Topic:** {topic}
**Difficulty:** {difficulty}

Generate diverse, interesting problems that teach important concepts.
Avoid overly common problems like "Two Sum" or "Reverse String" unless there's a unique twist.

Return a JSON array:
[
  {{
    "title": "Problem title",
    "brief_description": "One sentence description",
    "key_concept": "Main concept this teaches"
  }}
]

Return ONLY the JSON array, no additional text.
"""

        try:
            ideas_text = await self._generate_text(prompt, provider)
            
            # Clean up
            if ideas_text.startswith("```"):
                lines = ideas_text.split("\n")
                ideas_text = "\n".join(lines[1:-1])
            if ideas_text.startswith("json"):
                ideas_text = ideas_text[4:].strip()
            
            ideas = json.loads(ideas_text)
            return ideas
            
        except Exception as e:
            raise ValueError(f"Error generating ideas: {str(e)}")


# Global instance
problem_generator = ProblemGeneratorService()
        """
        Generate a complete programming problem from a description
        
        Args:
            description: User's description of what problem they want
            difficulty: beginner, intermediate, or advanced
            topic: Programming topic (arrays, linked_lists, etc.)
            additional_requirements: Any specific requirements
            num_test_cases: Number of test cases to generate
            num_examples: Number of example inputs/outputs
            num_hints: Number of progressive hints
            
        Returns:
            Complete problem structure ready to be saved to database
        """
        
        prompt = f"""You are an expert computer science educator creating programming problems.

Generate a complete, well-structured programming problem based on this request:

**User Request:**
{description}

**Requirements:**
- Difficulty Level: {difficulty}
- Topic: {topic}
- Number of test cases: {num_test_cases}
- Number of examples: {num_examples}
- Number of hints: {num_hints}
"""

        if additional_requirements:
            prompt += f"\n**Additional Requirements:**\n{additional_requirements}\n"

        prompt += """

Generate a JSON object with this EXACT structure:

{
  "title": "Clear, concise problem title",
  "description": "Detailed problem description with context, requirements, and constraints. Use markdown formatting.",
  "constraints": {
    "input_constraints": "Description of input limits",
    "time_complexity_target": "Expected time complexity (e.g., O(n))",
    "space_complexity_target": "Expected space complexity"
  },
  "examples": [
    {
      "input": "Example input (use actual values)",
      "expected_output": "Expected output",
      "explanation": "Why this output is correct"
    }
  ],
  "test_cases": [
    {
      "id": "test_1",
      "input": ["input parameters as list"],
      "expected_output": "expected result",
      "function_name": "function_name_to_test"
    }
  ],
  "starter_code": "Python function template with docstring and parameters",
  "solution_template": "A correct reference solution (for validation purposes)",
  "evaluation_criteria": {
    "check_correctness": true,
    "check_efficiency": true,
    "check_style": true,
    "expected_time_complexity": "O(n)",
    "expected_space_complexity": "O(1)"
  },
  "hints": [
    "First hint - gentle nudge about approach",
    "Second hint - more specific guidance",
    "Third hint - detailed approach without full solution"
  ],
  "learning_objectives": [
    "What students should learn from this problem"
  ],
  "related_concepts": [
    "Related CS concepts and topics"
  ],
  "time_limit": 5000,
  "memory_limit": 256
}

IMPORTANT GUIDELINES:
1. Make the problem clear, unambiguous, and educational
2. Include diverse test cases (edge cases, normal cases, boundary cases)
3. Ensure test cases actually test the problem correctly
4. Write clean, well-documented starter code
5. Make hints progressive (don't give away solution in first hint)
6. Align difficulty with the specified level
7. Make examples clear and instructive
8. Use appropriate input/output formats for the topic

Generate ONLY the JSON object, no additional text or markdown formatting.
"""

        try:
            problem_text = self._generate_text(
                prompt=prompt,
                max_tokens=4000,
                temperature=0.8,
            )
            
            # Remove markdown code fences if present
            if problem_text.startswith("```"):
                lines = problem_text.split("\n")
                problem_text = "\n".join(lines[1:-1])
            if problem_text.startswith("json"):
                problem_text = problem_text[4:].strip()
            
            problem_data = json.loads(problem_text)
            
            # Validate required fields
            required_fields = [
                "title", "description", "examples", "test_cases",
                "starter_code", "evaluation_criteria"
            ]
            for field in required_fields:
                if field not in problem_data:
                    raise ValueError(f"Generated problem missing required field: {field}")
            
            return problem_data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error generating problem: {str(e)}")
    
    async def refine_problem(
        self,
        existing_problem: Dict[str, Any],
        refinement_request: str
    ) -> Dict[str, Any]:
        """
        Refine an existing problem based on user feedback
        
        Args:
            existing_problem: Current problem structure
            refinement_request: What to change/improve
            
        Returns:
            Updated problem structure
        """
        
        prompt = f"""You are refining a programming problem based on user feedback.

**Current Problem:**
```json
{json.dumps(existing_problem, indent=2)}
```

**Refinement Request:**
{refinement_request}

Please modify the problem according to the request and return the COMPLETE updated problem in the same JSON format. Make sure to maintain all required fields and keep the problem consistent.

Return ONLY the JSON object, no additional text.
"""

        try:
            problem_text = self._generate_text(
                prompt=prompt,
                max_tokens=4000,
                temperature=0.7,
            )
            
            # Clean up response
            if problem_text.startswith("```"):
                lines = problem_text.split("\n")
                problem_text = "\n".join(lines[1:-1])
            if problem_text.startswith("json"):
                problem_text = problem_text[4:].strip()
            
            refined_problem = json.loads(problem_text)
            return refined_problem
            
        except Exception as e:
            raise ValueError(f"Error refining problem: {str(e)}")
    
    async def generate_test_cases(
        self,
        problem_description: str,
        function_signature: str,
        num_cases: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate additional test cases for an existing problem
        
        Args:
            problem_description: Description of the problem
            function_signature: Function signature/template
            num_cases: Number of test cases to generate
            
        Returns:
            List of test cases
        """
        
        prompt = f"""Generate {num_cases} diverse test cases for this programming problem.

**Problem:**
{problem_description}

**Function Signature:**
{function_signature}

Generate a JSON array of test cases covering:
1. Normal cases
2. Edge cases (empty input, single element, etc.)
3. Boundary cases (min/max values)
4. Special cases specific to this problem

Format:
[
  {{
    "id": "test_1",
    "description": "What this test case checks",
    "input": ["param1_value", "param2_value"],
    "expected_output": "expected_result",
    "function_name": "function_name"
  }}
]

Return ONLY the JSON array, no additional text.
"""

        try:
            cases_text = self._generate_text(
                prompt=prompt,
                max_tokens=2000,
                temperature=0.7,
            )
            
            # Clean up
            if cases_text.startswith("```"):
                lines = cases_text.split("\n")
                cases_text = "\n".join(lines[1:-1])
            if cases_text.startswith("json"):
                cases_text = cases_text[4:].strip()
            
            test_cases = json.loads(cases_text)
            return test_cases
            
        except Exception as e:
            raise ValueError(f"Error generating test cases: {str(e)}")
    
    async def suggest_problem_ideas(
        self,
        topic: str,
        difficulty: str,
        num_suggestions: int = 5
    ) -> List[Dict[str, str]]:
        """
        Get problem ideas/suggestions based on topic and difficulty
        
        Args:
            topic: Programming topic
            difficulty: Difficulty level
            num_suggestions: Number of ideas to generate
            
        Returns:
            List of problem ideas with titles and brief descriptions
        """
        
        prompt = f"""Suggest {num_suggestions} creative programming problem ideas.

**Topic:** {topic}
**Difficulty:** {difficulty}

Generate diverse, interesting problems that teach important concepts.
Avoid overly common problems like "Two Sum" or "Reverse String" unless there's a unique twist.

Return a JSON array:
[
  {{
    "title": "Problem title",
    "brief_description": "One sentence description",
    "key_concept": "Main concept this teaches"
  }}
]

Return ONLY the JSON array, no additional text.
"""

        try:
            ideas_text = self._generate_text(
                prompt=prompt,
                max_tokens=1500,
                temperature=0.9,
            )
            
            # Clean up
            if ideas_text.startswith("```"):
                lines = ideas_text.split("\n")
                ideas_text = "\n".join(lines[1:-1])
            if ideas_text.startswith("json"):
                ideas_text = ideas_text[4:].strip()
            
            ideas = json.loads(ideas_text)
            return ideas
            
        except Exception as e:
            raise ValueError(f"Error generating ideas: {str(e)}")


# Global instance
problem_generator = ProblemGeneratorService()
