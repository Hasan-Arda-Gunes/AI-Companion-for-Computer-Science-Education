"""
Code Execution Service - Safely execute student code and run test cases
"""
import subprocess
import tempfile
import os
import json
import shutil
import sys
from typing import Dict, Any, List, Optional, Tuple
import time

from app.core.config import settings
from app.schemas.schemas import TestCaseResult, CodeExecutionResult


class TimeoutException(Exception):
    """Raised when code execution times out"""
    pass


def timeout_handler(signum, frame):
    """Signal handler for timeout"""
    raise TimeoutException("Code execution timed out")


class CodeExecutor:
    """Execute student code safely with resource limits"""
    
    def __init__(self):
        self.timeout = settings.CODE_EXECUTION_TIMEOUT
        self.max_memory = 256 * 1024 * 1024  # 256 MB in bytes

    def _get_python_command(self) -> List[str]:
        """Resolve a working Python command across platforms."""
        if sys.executable:
            return [sys.executable]

        # Fallbacks if interpreter path is unavailable for any reason.
        if shutil.which("python3"):
            return ["python3"]
        if shutil.which("python"):
            return ["python"]
        if os.name == "nt" and shutil.which("py"):
            return ["py", "-3"]

        # Let subprocess surface the command-not-found error text.
        return ["python"]
    
    def execute_python(
        self,
        code: str,
        test_input: Optional[str] = None,
        timeout: Optional[int] = None
    ) -> CodeExecutionResult:
        """
        Execute Python code safely
        
        Args:
            code: Python code to execute
            test_input: Optional stdin input
            timeout: Execution timeout in seconds
            
        Returns:
            CodeExecutionResult with output or error
        """
        
        timeout = timeout or self.timeout
        temp_file: Optional[str] = None
        
        try:
            # Create temporary file for code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            start_time = time.time()
            
            # Execute with subprocess
            result = subprocess.run(
                [*self._get_python_command(), temp_file],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=timeout,
                env={**os.environ, 'PYTHONPATH': ''}  # Isolated environment
            )
            
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            
            # Clean up
            os.unlink(temp_file)
            
            if result.returncode == 0:
                return CodeExecutionResult(
                    success=True,
                    output=result.stdout,
                    execution_time=execution_time
                )
            else:
                return CodeExecutionResult(
                    success=False,
                    error=result.stderr or "Runtime error",
                    execution_time=execution_time
                )
                
        except subprocess.TimeoutExpired:
            if temp_file and os.path.exists(temp_file):
                os.unlink(temp_file)
            return CodeExecutionResult(
                success=False,
                error=f"Code execution timed out after {timeout} seconds"
            )
        except Exception as e:
            if temp_file and os.path.exists(temp_file):
                os.unlink(temp_file)
            return CodeExecutionResult(
                success=False,
                error=f"Execution error: {str(e)}"
            )
    
    def run_test_cases(
        self,
        code: str,
        test_cases: List[Dict[str, Any]],
        language: str = "python"
    ) -> Tuple[List[TestCaseResult], float, bool]:
        """
        Run code against multiple test cases
        
        Args:
            code: Student's code
            test_cases: List of test cases with input/expected output
            language: Programming language
            
        Returns:
            Tuple of (test_results, total_time, all_passed)
        """
        
        if language != "python":
            raise ValueError("Only Python is currently supported")
        
        results = []
        total_time = 0.0
        all_passed = True
        
        for i, test_case in enumerate(test_cases):
            test_id = test_case.get('id', f'test_{i+1}')
            test_input = test_case.get('input', '')
            expected_output = test_case.get('expected_output', '')
            
            # Prepare code with test input
            test_code = self._prepare_test_code(code, test_input, test_case)
            
            # Execute
            exec_result = self.execute_python(test_code)
            
            if exec_result.execution_time:
                total_time += exec_result.execution_time
            
            # Check result
            if not exec_result.success:
                results.append(TestCaseResult(
                    test_id=test_id,
                    passed=False,
                    expected=expected_output,
                    actual=None,
                    error=exec_result.error
                ))
                all_passed = False
            else:
                actual_output = exec_result.output.strip()
                expected = str(expected_output).strip()
                passed = self._compare_outputs(actual_output, expected)
                
                results.append(TestCaseResult(
                    test_id=test_id,
                    passed=passed,
                    expected=expected_output,
                    actual=actual_output
                ))
                
                if not passed:
                    all_passed = False
        
        return results, total_time, all_passed
    
    def _prepare_test_code(
        self,
        code: str,
        test_input: Any,
        test_case: Dict[str, Any]
    ) -> str:
        """
        Prepare code for testing by adding test harness
        
        This wraps student code to provide inputs and capture outputs
        """
        
        # Extract function name if it's a function problem
        function_name = test_case.get('function_name')
        
        if function_name:
            # Function-based problem
            test_code = f"""{code}

# Test harness
if __name__ == "__main__":
    import json
    import inspect
    test_input = {json.dumps(test_input)}
    
    # Inspect function signature to determine how many parameters it expects
    sig = inspect.signature({function_name})
    num_params = len(sig.parameters)
    
    # Call function with appropriate unpacking
    if num_params == 1:
        # Single parameter function - pass test_input as-is
        result = {function_name}(test_input)
    elif isinstance(test_input, list):
        # Multiple parameters - unpack the list
        result = {function_name}(*test_input)
    else:
        # Single test_input value for multiple param function
        result = {function_name}(test_input)
    
    print(json.dumps(result))
"""
        else:
            # Script-based problem (uses stdin/stdout)
            test_code = code
        
        return test_code
    
    def _compare_outputs(self, actual: str, expected: str) -> bool:
        """
        Compare actual and expected outputs
        
        Handles different output formats flexibly
        """
        
        # Direct string comparison
        if actual == expected:
            return True
        
        # Try parsing as JSON for structural comparison
        try:
            actual_json = json.loads(actual)
            expected_json = json.loads(expected) if isinstance(expected, str) else expected
            return actual_json == expected_json
        except (json.JSONDecodeError, TypeError):
            pass
        
        # Try numeric comparison
        try:
            actual_num = float(actual)
            expected_num = float(expected)
            return abs(actual_num - expected_num) < 1e-6
        except (ValueError, TypeError):
            pass
        
        # Normalize whitespace and compare
        actual_normalized = ' '.join(actual.split())
        expected_normalized = ' '.join(str(expected).split())
        
        return actual_normalized == expected_normalized


# Global executor instance
code_executor = CodeExecutor()
