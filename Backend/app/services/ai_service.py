"""
AI Service - Handles all LLM interactions for code evaluation and feedback
"""
import json
import logging
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from app.core.config import settings
from app.schemas.schemas import AIFeedback, TestCaseResult


logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered code evaluation and feedback"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.LLM_MODEL

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON object from model output, handling markdown fences."""
        cleaned = text.strip()

        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\\s*", "", cleaned)
            cleaned = re.sub(r"\\s*```$", "", cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: extract first JSON-like object
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def _generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Generate text from Gemini and normalize empty responses."""
        model = genai.GenerativeModel(
            model_name=self.model,
            system_instruction=system_prompt,
        )

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens or settings.LLM_MAX_TOKENS,
                temperature=settings.LLM_TEMPERATURE if temperature is None else temperature,
            ),
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        finish_reason = "unknown"
        if getattr(response, "candidates", None):
            candidate = response.candidates[0]
            finish_reason = str(getattr(candidate, "finish_reason", "unknown"))

        prompt_feedback = str(getattr(response, "prompt_feedback", "none"))
        raise ValueError(
            f"Gemini returned empty response (finish_reason={finish_reason}, prompt_feedback={prompt_feedback})"
        )

    def _safe_error_message(self, err: Exception) -> str:
        """Return a concise, user-safe error summary."""
        message = str(err).strip() or "unknown error"
        if len(message) > 220:
            message = message[:220] + "..."
        return message
    
    async def evaluate_code(
        self,
        code: str,
        problem_description: str,
        test_results: List[TestCaseResult],
        evaluation_criteria: Dict[str, Any],
        language: str = "python"
    ) -> AIFeedback:
        """
        Comprehensive code evaluation using Gemini
        
        Args:
            code: Student's submitted code
            problem_description: The problem statement
            test_results: Results from running test cases
            evaluation_criteria: What to evaluate (correctness, style, efficiency)
            language: Programming language
            
        Returns:
            AIFeedback with detailed analysis
        """
        
        # Calculate test pass rate
        total_tests = len(test_results)
        passed_tests = sum(1 for t in test_results if t.passed)
        test_pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Build evaluation prompt
        prompt = f"""You are an expert programming instructor evaluating a student's code submission.

PROBLEM DESCRIPTION:
{problem_description}

STUDENT'S CODE ({language}):
```{language}
{code}
```

TEST RESULTS:
- Total tests: {total_tests}
- Passed: {passed_tests}
- Failed: {total_tests - passed_tests}
- Pass rate: {test_pass_rate:.1f}%

Test case details:
{json.dumps([{
    'test_id': tr.test_id,
    'passed': tr.passed,
    'expected': tr.expected,
    'actual': tr.actual,
    'error': tr.error
} for tr in test_results], indent=2)}

EVALUATION CRITERIA:
{json.dumps(evaluation_criteria, indent=2)}

Please provide a comprehensive evaluation in the following JSON format:
{{
    "overall_assessment": "A brief 2-3 sentence summary of the submission",
    "correctness_score": 0-100,
    "quality_score": 0-100,
    "efficiency_score": 0-100,
    "strengths": ["strength1", "strength2", ...],
    "issues": [
        {{"type": "logic_error|syntax_error|style_issue|efficiency_issue", "description": "detailed description"}},
        ...
    ],
    "suggestions": ["specific suggestion 1", "specific suggestion 2", ...],
    "next_steps": ["what the student should focus on next"]
}}

Guidelines:
1. Be encouraging and constructive
2. Identify both what works well and what needs improvement
3. Provide specific, actionable feedback
4. Explain WHY something is an issue, not just WHAT is wrong
5. Suggest concrete next steps for improvement
6. Consider code style, readability, and best practices
7. Evaluate algorithmic efficiency if relevant

Respond ONLY with valid JSON, no additional text."""

        try:
            feedback_text = self._generate_text(
                prompt=prompt,
                max_tokens=settings.LLM_MAX_TOKENS,
                temperature=settings.LLM_TEMPERATURE,
            )
            feedback_data = self._extract_json(feedback_text)
            
            return AIFeedback(**feedback_data)
            
        except Exception as e:
            logger.exception("Error in AI evaluation")
            # Return fallback feedback
            return AIFeedback(
                overall_assessment=f"Test pass rate: {test_pass_rate:.1f}%. Error in detailed AI evaluation.",
                correctness_score=test_pass_rate,
                quality_score=50.0,
                efficiency_score=50.0,
                strengths=["Code submitted successfully"],
                issues=[{"type": "evaluation_error", "description": "AI evaluation encountered an error"}],
                suggestions=["Review test case failures and try again"],
                next_steps=["Fix failing test cases"]
            )
    
    async def provide_hint(
        self,
        problem_description: str,
        current_code: Optional[str],
        hint_level: int,
        previous_hints: List[str] = None
    ) -> str:
        """
        Generate progressive hints for a problem
        
        Args:
            problem_description: The problem statement
            current_code: Student's current attempt (if any)
            hint_level: 1 (gentle) to 3 (more specific)
            previous_hints: Previously given hints
            
        Returns:
            A hint appropriate for the level
        """
        
        hint_guidance = {
            1: "Give a gentle nudge in the right direction without revealing the solution. Focus on the approach or concept.",
            2: "Provide more specific guidance about the algorithm or data structure to use, but don't give code.",
            3: "Give a detailed hint that outlines the solution approach step-by-step, but still let the student implement it."
        }
        
        prompt = f"""You are a helpful programming tutor. A student is working on this problem:

PROBLEM:
{problem_description}
"""
        
        if current_code:
            prompt += f"""

STUDENT'S CURRENT CODE:
```python
{current_code}
```
"""
        
        if previous_hints:
            prompt += f"""

PREVIOUS HINTS GIVEN:
{chr(10).join(f'{i+1}. {h}' for i, h in enumerate(previous_hints))}
"""
        
        prompt += f"""

Provide a hint at level {hint_level} (1-3, where 1 is gentle and 3 is detailed).
Hint guidance: {hint_guidance[hint_level]}

Important:
- Be encouraging and supportive
- Don't give away the complete solution
- Help the student learn by guiding their thinking
- If they have code, acknowledge what they've done right
- Ask guiding questions when appropriate

Provide just the hint text, no extra formatting."""

        try:
            hint_text = self._generate_text(
                prompt=prompt,
                max_tokens=1000,
                temperature=0.7,
            )
            return hint_text
            
        except Exception as e:
            logger.exception("Error generating hint")
            error_summary = self._safe_error_message(e)
            return f"Hint service is temporarily unavailable. Gemini error: {error_summary}"
    
    async def chat_assistance(
        self,
        user_message: str,
        problem_context: Optional[str] = None,
        current_code: Optional[str] = None,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Provide conversational AI assistance
        
        Args:
            user_message: Student's question
            problem_context: Current problem being worked on
            current_code: Student's current code
            conversation_history: Previous messages in this conversation
            
        Returns:
            AI assistant's response
        """
        
        system_prompt = """You are an encouraging and knowledgeable programming tutor. Your role is to:
1. Help students understand programming concepts
2. Guide them to solutions without giving complete answers
3. Encourage problem-solving and critical thinking
4. Provide clear explanations appropriate for beginners
5. Be patient and supportive

Important guidelines:
- Don't write complete solutions unless explicitly asked
- Use Socratic method - ask guiding questions
- Explain concepts clearly with examples
- Acknowledge frustration and encourage persistence
- Celebrate progress and learning moments"""

        # Build current message with context
        current_message = user_message
        
        if problem_context or current_code:
            current_message = f"""Context:
"""
            if problem_context:
                current_message += f"Problem: {problem_context}\n\n"
            if current_code:
                current_message += f"Current code:\n```python\n{current_code}\n```\n\n"
            current_message += f"Question: {user_message}"
        
        history_text = ""
        if conversation_history:
            history_text = "Conversation history:\n" + "\n".join(
                f"{m.get('role', 'user')}: {m.get('content', '')}" for m in conversation_history
            ) + "\n\n"

        full_prompt = f"""{history_text}{current_message}"""
        
        try:
            reply_text = self._generate_text(
                prompt=full_prompt,
                system_prompt=system_prompt,
                max_tokens=2000,
                temperature=0.8,
            )
            return reply_text
            
        except Exception as e:
            logger.exception("Error in chat assistance")
            return "I'm having trouble connecting right now. Could you try rephrasing your question?"


# Global AI service instance
ai_service = AIService()
