"""
Example tests for the AI Programming Tutor API
Run with: pytest tests/
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from main import app
from app.db.database import Base, get_db
from app.core.config import settings


# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_tutor_test"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(TEST_DATABASE_URL)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def test_db(test_engine):
    """Create test database session"""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


@pytest.fixture
async def client(test_db):
    """Create test client"""
    
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


# Test cases
@pytest.mark.anyio
async def test_health_check(client):
    """Test health check endpoint"""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.anyio
async def test_register_user(client):
    """Test user registration"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data


@pytest.mark.anyio
async def test_login(client):
    """Test user login"""
    # First register
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "password123",
            "full_name": "Login User"
        }
    )
    
    # Then login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_create_problem(client):
    """Test problem creation"""
    # Register and login first (as teacher)
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "username": "creator",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Create problem
    response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Test Problem",
            "description": "This is a test problem",
            "difficulty": "beginner",
            "topic": "arrays",
            "examples": [{"input": [1, 2], "expected_output": 3}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [1, 2],
                    "expected_output": 3,
                    "function_name": "add"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Problem"
    assert data["difficulty"] == "beginner"


@pytest.mark.anyio
async def test_list_problems(client):
    """Test listing problems"""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "lister@example.com",
            "username": "lister",
            "password": "password123"
        }
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "lister@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # List problems
    response = await client.get(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200


# Role-based access control tests
@pytest.mark.anyio
async def test_register_teacher(client):
    """Test registering a user as a teacher"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher@example.com",
            "username": "teacher1",
            "password": "teacherpass123",
            "full_name": "Teacher User",
            "role": "teacher"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "teacher@example.com"
    assert data["role"] == "teacher"


@pytest.mark.anyio
async def test_register_student(client):
    """Test registering a user as a student (default)"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student1@example.com",
            "username": "student1",
            "password": "studentpass123",
            "full_name": "Student User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "student1@example.com"
    assert data["role"] == "student"


@pytest.mark.anyio
async def test_student_cannot_create_problem(client):
    """Test that students cannot create problems"""
    # Register as student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_fail@example.com",
            "username": "student_fail",
            "password": "password123",
            "role": "student"
        }
    )
    
    # Login as student
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_fail@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Try to create problem
    response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Unauthorized Problem",
            "description": "This should fail",
            "difficulty": "beginner",
            "topic": "arrays",
            "examples": [{"input": [1], "expected_output": 1}],
            "test_cases": [{"id": "test_1", "input": [1], "expected_output": 1}],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    assert response.status_code == 403
    assert "Only teachers can create problems" in response.json()["detail"]


@pytest.mark.anyio
async def test_teacher_can_create_problem(client):
    """Test that teachers can create problems"""
    # Register as teacher
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_success@example.com",
            "username": "teacher_success",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    # Login as teacher
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_success@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Create problem
    response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Valid Teacher Problem",
            "description": "Created by teacher",
            "difficulty": "intermediate",
            "topic": "loops",
            "examples": [{"input": 5, "expected_output": 15}],
            "test_cases": [{"id": "test_1", "input": 5, "expected_output": 15}],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Valid Teacher Problem"


# Authentication error tests
@pytest.mark.anyio
async def test_invalid_login(client):
    """Test login with invalid credentials"""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid@example.com",
            "username": "invaliduser",
            "password": "correctpassword123"
        }
    )
    
    # Try login with wrong password
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


@pytest.mark.anyio
async def test_duplicate_email(client):
    """Test registering with duplicate email"""
    # Register first user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user1",
            "password": "password123"
        }
    )
    
    # Try register with same email
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user2",
            "password": "password123"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


@pytest.mark.anyio
async def test_duplicate_username(client):
    """Test registering with duplicate username"""
    # Register first user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "email1@example.com",
            "username": "duplicate_user",
            "password": "password123"
        }
    )
    
    # Try register with same username
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "email2@example.com",
            "username": "duplicate_user",
            "password": "password123"
        }
    )
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


# Problem validation tests
@pytest.mark.anyio
async def test_missing_required_problem_fields(client):
    """Test creating problem with missing required fields"""
    # Register and login as teacher
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_valid@example.com",
            "username": "teacher_valid",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_valid@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Try create problem without required fields
    response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Incomplete Problem",
            "description": "Missing examples"
            # Missing examples and test_cases
        }
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.anyio
async def test_problem_with_all_difficulty_levels(client):
    """Test creating problems with all difficulty levels"""
    # Register as teacher
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "difficulty_teacher@example.com",
            "username": "difficulty_teacher",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "difficulty_teacher@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    difficulties = ["beginner", "intermediate", "advanced"]
    
    for difficulty in difficulties:
        response = await client.post(
            "/api/v1/problems/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": f"{difficulty.capitalize()} Problem",
                "description": f"A {difficulty} level problem",
                "difficulty": difficulty,
                "topic": "testing",
                "examples": [{"input": 1, "expected_output": 1}],
                "test_cases": [{"id": "test_1", "input": 1, "expected_output": 1}],
                "evaluation_criteria": {"check_correctness": True}
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["difficulty"] == difficulty


# Password validation tests
@pytest.mark.anyio
async def test_password_too_short(client):
    """Test registering with password that's too short"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "short@example.com",
            "username": "shortpass",
            "password": "short"  # Less than 8 characters
        }
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.anyio
async def test_invalid_email_format(client):
    """Test registering with invalid email"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "username": "nomail",
            "password": "password123"
        }
    )
    assert response.status_code == 422  # Validation error


# Unauthorized access tests
@pytest.mark.anyio
async def test_missing_auth_token(client):
    """Test accessing protected endpoint without token"""
    response = await client.get("/api/v1/problems/")
    assert response.status_code == 401  # Unauthorized (no token)


@pytest.mark.anyio
async def test_invalid_auth_token(client):
    """Test accessing with invalid token"""
    response = await client.get(
        "/api/v1/problems/",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    assert response.status_code == 401  # Unauthorized
    data = response.json()
    # Invalid token returns error detail, not problem list
    assert "detail" in data


@pytest.mark.anyio
async def test_unauthorized_access(client):
    """Test that endpoints require authentication"""
    response = await client.get("/api/v1/problems/")
    assert response.status_code == 401


# Code Execution Tests
@pytest.mark.anyio
async def test_submit_correct_code(client):
    """Test submitting code that passes all test cases"""
    # Register teacher and create problem
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_exec@example.com",
            "username": "teacher_exec",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_exec@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create a simple addition problem
    problem_response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "title": "Add Two Numbers",
            "description": "Add two numbers and return the sum",
            "difficulty": "beginner",
            "topic": "functions",
            "examples": [{"input": [1, 2], "expected_output": 3}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [1, 2],
                    "expected_output": 3,
                    "function_name": "add"
                },
                {
                    "id": "test_2",
                    "input": [5, 10],
                    "expected_output": 15,
                    "function_name": "add"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    problem_id = problem_response.json()["id"]
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_correct@example.com",
            "username": "student_correct",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_correct@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Submit correct code
    correct_code = """def add(a, b):
    return a + b
"""
    
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": problem_id,
            "code": correct_code,
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 201
    submission = submission_response.json()
    assert submission["problem_id"] == problem_id
    assert "id" in submission
    assert submission["status"] == "pending"  # Initially pending, evaluated in background


@pytest.mark.anyio
async def test_submit_incorrect_code(client):
    """Test submitting code that fails test cases"""
    # Register teacher and create problem
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_fail@example.com",
            "username": "teacher_fail",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_fail@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create problem
    problem_response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "title": "Multiply Numbers",
            "description": "Multiply two numbers",
            "difficulty": "beginner",
            "topic": "functions",
            "examples": [{"input": [2, 3], "expected_output": 6}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [2, 3],
                    "expected_output": 6,
                    "function_name": "multiply"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    problem_id = problem_response.json()["id"]
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_incorrect@example.com",
            "username": "student_incorrect",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_incorrect@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Submit incorrect code (adds instead of multiplies)
    incorrect_code = """def multiply(a, b):
    return a + b  # Wrong: should multiply
"""
    
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": problem_id,
            "code": incorrect_code,
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 201
    submission = submission_response.json()
    assert submission["problem_id"] == problem_id


@pytest.mark.anyio
async def test_submit_code_with_syntax_error(client):
    """Test submitting code with syntax errors"""
    # Register teacher and create problem
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_syntax@example.com",
            "username": "teacher_syntax",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_syntax@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create problem
    problem_response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "title": "Square Number",
            "description": "Square a number",
            "difficulty": "beginner",
            "topic": "functions",
            "examples": [{"input": [4], "expected_output": 16}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [4],
                    "expected_output": 16,
                    "function_name": "square"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    problem_id = problem_response.json()["id"]
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_syntax@example.com",
            "username": "student_syntax",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_syntax@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Submit code with syntax error
    syntax_error_code = """def square(n)  # Missing colon
    return n * n
"""
    
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": problem_id,
            "code": syntax_error_code,
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 201


@pytest.mark.anyio
async def test_submit_code_with_runtime_error(client):
    """Test submitting code that causes runtime errors"""
    # Register teacher and create problem
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_runtime@example.com",
            "username": "teacher_runtime",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_runtime@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create problem
    problem_response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "title": "Divide Numbers",
            "description": "Divide two numbers",
            "difficulty": "beginner",
            "topic": "functions",
            "examples": [{"input": [10, 2], "expected_output": 5}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [10, 2],
                    "expected_output": 5,
                    "function_name": "divide"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    problem_id = problem_response.json()["id"]
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_runtime@example.com",
            "username": "student_runtime",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_runtime@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Submit code with potential runtime error (division by zero not handled)
    runtime_error_code = """def divide(a, b):
    return a / b
"""
    
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": problem_id,
            "code": runtime_error_code,
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 201


@pytest.mark.anyio
async def test_code_submission_requires_valid_problem(client):
    """Test that code submission requires valid problem ID"""
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_invalid@example.com",
            "username": "student_invalid",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_invalid@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Try submit for non-existent problem
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": 99999,
            "code": "print('hello')",
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 404
    assert "Problem not found" in submission_response.json()["detail"]


@pytest.mark.anyio
async def test_code_submission_requires_authentication(client):
    """Test that code submission requires authentication"""
    submission_response = await client.post(
        "/api/v1/submissions/",
        json={
            "problem_id": 1,
            "code": "print('hello')",
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 401


@pytest.mark.anyio
async def test_student_can_submit_code(client):
    """Test that students can submit code"""
    # Register teacher and create problem
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_sub@example.com",
            "username": "teacher_sub",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_sub@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create problem
    problem_response = await client.post(
        "/api/v1/problems/",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={
            "title": "Hello World",
            "description": "Return hello world",
            "difficulty": "beginner",
            "topic": "basics",
            "examples": [{"input": [], "expected_output": "hello"}],
            "test_cases": [
                {
                    "id": "test_1",
                    "input": [],
                    "expected_output": "hello",
                    "function_name": "hello"
                }
            ],
            "evaluation_criteria": {"check_correctness": True}
        }
    )
    problem_id = problem_response.json()["id"]
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_sub@example.com",
            "username": "student_sub",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_sub@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Student submits code
    submission_response = await client.post(
        "/api/v1/submissions/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "problem_id": problem_id,
            "code": "def hello():\n    return 'hello'",
            "language": "python"
        }
    )
    
    assert submission_response.status_code == 201
    submission = submission_response.json()
    # Submission should have id and problem_id
    assert "id" in submission
    assert submission["problem_id"] == problem_id


@pytest.mark.anyio
async def test_code_submission_with_different_difficulties(client):
    """Test submitting code for problems with different difficulty levels"""
    # Register teacher
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher_diff@example.com",
            "username": "teacher_diff",
            "password": "password123",
            "role": "teacher"
        }
    )
    
    teacher_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher_diff@example.com",
            "password": "password123"
        }
    )
    teacher_token = teacher_login.json()["access_token"]
    
    # Create problems with different difficulties
    difficulties = ["beginner", "intermediate", "advanced"]
    problem_ids = []
    
    for difficulty in difficulties:
        problem_response = await client.post(
            "/api/v1/problems/",
            headers={"Authorization": f"Bearer {teacher_token}"},
            json={
                "title": f"{difficulty.capitalize()} Problem",
                "description": f"A {difficulty} problem",
                "difficulty": difficulty,
                "topic": "testing",
                "examples": [{"input": [1], "expected_output": "pass"}],
                "test_cases": [
                    {
                        "id": "test_1",
                        "input": [1],
                        "expected_output": "pass",
                        "function_name": "solve"
                    }
                ],
                "evaluation_criteria": {"check_correctness": True}
            }
        )
        problem_ids.append(problem_response.json()["id"])
    
    # Register student
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_diff@example.com",
            "username": "student_diff",
            "password": "password123",
            "role": "student"
        }
    )
    
    student_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student_diff@example.com",
            "password": "password123"
        }
    )
    student_token = student_login.json()["access_token"]
    
    # Submit code for each difficulty
    for problem_id in problem_ids:
        submission_response = await client.post(
            "/api/v1/submissions/",
            headers={"Authorization": f"Bearer {student_token}"},
            json={
                "problem_id": problem_id,
                "code": "def solve(x):\n    return 'pass'",
                "language": "python"
            }
        )
        
        assert submission_response.status_code == 201
        assert submission_response.json()["problem_id"] == problem_id


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
