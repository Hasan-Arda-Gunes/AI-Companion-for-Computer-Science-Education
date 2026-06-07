"""
Code Execution Service - Safely execute student code and run test cases
"""
import subprocess
import tempfile
import os
import json
import shutil
import sys
import re
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
    
    def _get_java_command(self) -> Tuple[str, str]:
        """Resolve javac and java commands across platforms.
        
        Returns:
            Tuple of (javac_command, java_command)
        
        Raises:
            RuntimeError if Java is not available
        """
        javac_cmd = shutil.which("javac")
        java_cmd = shutil.which("java")
        
        if not javac_cmd or not java_cmd:
            raise RuntimeError(
                "Java compiler (javac) or runtime (java) not found. "
                "Inside Docker container: Java is now included in the Dockerfile. "
                "Rebuild Docker with: docker-compose down && docker-compose up -d --build\n"
                "Locally: Install JDK from https://adoptium.net (Java 17 LTS recommended)"
            )
            
        return javac_cmd, java_cmd
    
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
    
    def execute_java(
        self,
        code: str,
        test_input: Optional[str] = None,
        timeout: Optional[int] = None,
        temp_dir: Optional[str] = None
    ) -> CodeExecutionResult:
        """
        Execute Java code safely
        
        Args:
            code: Java code to execute
            test_input: Optional stdin input
            timeout: Execution timeout in seconds
            temp_dir: Optional temporary directory for compilation
            
        Returns:
            CodeExecutionResult with output or error
        """
        
        timeout = timeout or self.timeout
        temp_file: Optional[str] = None
        temp_dir_path: Optional[str] = None
        
        try:
            # Get Java commands (may raise RuntimeError if not available)
            javac_cmd, java_cmd = self._get_java_command()
            
            # Create temporary directory for Java compilation
            temp_dir_path = temp_dir or tempfile.mkdtemp()
            
            # Extract or infer main class name
            main_class = self._extract_java_main_class(code)
            
            # Write Java file
            java_file_path = os.path.join(temp_dir_path, f"{main_class}.java")
            with open(java_file_path, 'w') as f:
                f.write(code)
            
            # Compile Java code
            compile_result = subprocess.run(
                [javac_cmd, java_file_path],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=temp_dir_path
            )
            
            if compile_result.returncode != 0:
                return CodeExecutionResult(
                    success=False,
                    error=f"Compilation error: {compile_result.stderr}"
                )
            
            start_time = time.time()
            
            # Execute compiled Java code
            result = subprocess.run(
                [java_cmd, "-cp", temp_dir_path, main_class],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=temp_dir_path
            )
            
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            
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
            return CodeExecutionResult(
                success=False,
                error=f"Code execution timed out after {timeout} seconds"
            )
        except RuntimeError as e:
            return CodeExecutionResult(
                success=False,
                error=str(e)
            )
        except Exception as e:
            return CodeExecutionResult(
                success=False,
                error=f"Execution error: {str(e)}"
            )
        finally:
            # Clean up temporary directory if we created it
            if temp_dir_path and temp_dir is None and os.path.exists(temp_dir_path):
                shutil.rmtree(temp_dir_path)
    
    def _extract_java_main_class(self, code: str) -> str:
        """
        Extract main class name from Java code
        
        Prefers the class that contains the main method if found.
        Otherwise returns the first public class or any class.
        """
        # First, try to find the class that has the main method
        main_class_match = re.search(
            r'class\s+(\w+)\s*\{[^}]*?public\s+static\s+void\s+main',
            code,
            re.DOTALL
        )
        if main_class_match:
            return main_class_match.group(1)
        
        # Fallback: find first public class
        match = re.search(r'public\s+class\s+(\w+)', code)
        if match:
            return match.group(1)
        
        # Fallback: find any class definition
        match = re.search(r'class\s+(\w+)', code)
        if match:
            return match.group(1)
        
        # Default fallback
        return "Main"
    
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
            language: Programming language ("python" or "java")
            
        Returns:
            Tuple of (test_results, total_time, all_passed)
        """
        
        language = language.lower()
        if language not in ("python", "java"):
            raise ValueError("Only Python and Java are currently supported")
        
        results = []
        total_time = 0.0
        all_passed = True
        
        # For Java, create a shared temp directory for all test cases
        temp_dir = None
        if language == "java":
            temp_dir = tempfile.mkdtemp()
        
        try:
            for i, test_case in enumerate(test_cases):
                test_id = test_case.get('id', f'test_{i+1}')
                test_input = test_case.get('input', '')
                expected_output = test_case.get('expected_output', '')
                
                # Prepare code with test input
                test_code = self._prepare_test_code(code, test_input, test_case, language)
                
                # Execute based on language
                if language == "python":
                    exec_result = self.execute_python(test_code)
                else:  # java
                    exec_result = self.execute_java(test_code, temp_dir=temp_dir)
                
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
        finally:
            # Clean up Java temp directory
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
        
        return results, total_time, all_passed
    
    def _prepare_test_code(
        self,
        code: str,
        test_input: Any,
        test_case: Dict[str, Any],
        language: str = "python"
    ) -> str:
        """
        Prepare code for testing by adding test harness
        
        This wraps student code to provide inputs and capture outputs
        """
        
        if language.lower() == "java":
            return self._prepare_java_test_code(code, test_input, test_case)
        else:
            return self._prepare_python_test_code(code, test_input, test_case)
    
    def _prepare_python_test_code(
        self,
        code: str,
        test_input: Any,
        test_case: Dict[str, Any]
    ) -> str:
        """Prepare Python code for testing"""
        
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
    
    def _prepare_java_test_code(
        self,
        code: str,
        test_input: Any,
        test_case: Dict[str, Any]
    ) -> str:
        """Prepare Java code for testing with test harness"""
        
        function_name = test_case.get('function_name')
        
        # Check if code already has a class definition
        has_class = re.search(r'(public\s+)?class\s+\w+', code)
        has_main = 'public static void main' in code or 'public static void main(String[] args)' in code
        
        if not has_class and not has_main:
            # User provided just a method - wrap it in a Solution class
            java_code = f"""import java.util.Arrays;

class Solution {{
    {code}
}}

class TestRunner {{
    public static void main(String[] args) throws Exception {{
        Solution instance = new Solution();
        try {{
            Object result = instance.{function_name}({self._java_array_input(test_input)});
            System.out.println(formatOutput(result));
        }} catch (Exception e) {{
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }}
    }}
    
    static String formatOutput(Object obj) {{
        if (obj == null) {{
            return "null";
        }}
        if (obj instanceof int[]) {{
            return Arrays.toString((int[]) obj);
        }} else if (obj instanceof double[]) {{
            return Arrays.toString((double[]) obj);
        }} else if (obj instanceof long[]) {{
            return Arrays.toString((long[]) obj);
        }} else if (obj instanceof float[]) {{
            return Arrays.toString((float[]) obj);
        }} else if (obj instanceof boolean[]) {{
            return Arrays.toString((boolean[]) obj);
        }} else if (obj instanceof byte[]) {{
            return Arrays.toString((byte[]) obj);
        }} else if (obj instanceof char[]) {{
            return Arrays.toString((char[]) obj);
        }} else if (obj instanceof short[]) {{
            return Arrays.toString((short[]) obj);
        }} else if (obj instanceof Object[]) {{
            return Arrays.deepToString((Object[]) obj);
        }}
        return obj.toString();
    }}
}}
"""
        elif has_main:
            # Code already has main method, use as-is
            java_code = code
        else:
            # Code has a class but no main - wrap with test runner
            class_name = re.search(r'(public\s+)?class\s+(\w+)', code)
            class_name = class_name.group(2) if class_name else 'Solution'
            
            # Remove 'public' from the user's class to avoid file naming conflicts
            modified_code = re.sub(r'public\s+class\s+', 'class ', code)
            
            java_code = f"""import java.util.Arrays;

{modified_code}

class TestRunner {{
    public static void main(String[] args) throws Exception {{
        {class_name} instance = new {class_name}();
        try {{
            Object result = instance.{function_name}({self._java_array_input(test_input)});
            System.out.println(formatOutput(result));
        }} catch (Exception e) {{
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }}
    }}
    
    static String formatOutput(Object obj) {{
        if (obj == null) {{
            return "null";
        }}
        if (obj instanceof int[]) {{
            return Arrays.toString((int[]) obj);
        }} else if (obj instanceof double[]) {{
            return Arrays.toString((double[]) obj);
        }} else if (obj instanceof long[]) {{
            return Arrays.toString((long[]) obj);
        }} else if (obj instanceof float[]) {{
            return Arrays.toString((float[]) obj);
        }} else if (obj instanceof boolean[]) {{
            return Arrays.toString((boolean[]) obj);
        }} else if (obj instanceof byte[]) {{
            return Arrays.toString((byte[]) obj);
        }} else if (obj instanceof char[]) {{
            return Arrays.toString((char[]) obj);
        }} else if (obj instanceof short[]) {{
            return Arrays.toString((short[]) obj);
        }} else if (obj instanceof Object[]) {{
            return Arrays.deepToString((Object[]) obj);
        }}
        return obj.toString();
    }}
}}
"""
        
        return java_code
    
    def _java_array_input(self, test_input: Any) -> str:
        """Convert test input to Java array/parameter syntax, supporting multiple types"""
        
        if not isinstance(test_input, list):
            # Scalar value
            if isinstance(test_input, str):
                return f'"{test_input}"'
            elif isinstance(test_input, bool):
                return str(test_input).lower()
            else:
                return str(test_input)
        
        # Empty list
        if len(test_input) == 0:
            return "new int[]{}"
        
        # Check if this is multiple parameters (list of lists) or a single array
        first_element = test_input[0]
        
        if isinstance(first_element, list):
            # Multiple parameters - each element is an array
            params = []
            for param in test_input:
                if isinstance(param, list):
                    array_type = self._detect_array_type(param)
                    items = [self._convert_java_value(item) for item in param]
                    params.append(f"new {array_type}[]{{" + ", ".join(items) + "}")
                else:
                    params.append(self._convert_java_value(param))
            return ", ".join(params)
        else:
            # Single array parameter
            array_type = self._detect_array_type(test_input)
            items = [self._convert_java_value(item) for item in test_input]
            return f"new {array_type}[]{{" + ", ".join(items) + "}"
    
    def _detect_array_type(self, arr: list) -> str:
        """Detect the Java type of an array from Python data"""
        if not arr:
            return "int"  # Default to int for empty arrays
        
        first_element = arr[0]
        
        if isinstance(first_element, bool):
            return "boolean"
        elif isinstance(first_element, str):
            return "String"
        elif isinstance(first_element, float):
            return "double"
        elif isinstance(first_element, int):
            return "int"
        else:
            return "Object"  # Fallback for complex types
    
    def _convert_java_value(self, value: Any) -> str:
        """Convert a single Python value to Java syntax"""
        if isinstance(value, str):
            return f'"{value}"'
        elif isinstance(value, bool):
            return str(value).lower()
        elif isinstance(value, (int, float)):
            return str(value)
        else:
            return str(value)
    
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
