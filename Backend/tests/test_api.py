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
    # Register and login first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "username": "creator",
            "password": "password123"
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
    data = response.json()
    assert "problems" in data
    assert "total" in data
    assert isinstance(data["problems"], list)


@pytest.mark.anyio
async def test_unauthorized_access(client):
    """Test that endpoints require authentication"""
    response = await client.get("/api/v1/problems/")
    assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
