# Quick Start Guide - AI Programming Tutor Backend

## 🚀 Get Started in 5 Minutes

### Option 1: Using Docker (Recommended)

1. **Prerequisites**: Install Docker and Docker Compose

2. **Set up environment**:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Start everything**:
```bash
docker-compose up
```

4. **Access the API**:
- API: http://localhost:8000
- Documentation: http://localhost:8000/api/docs

### Option 2: Local Development

1. **Prerequisites**: Python 3.10+, PostgreSQL 14+

2. **Install dependencies**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up database**:
```bash
createdb ai_tutor
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings:
# - DATABASE_URL
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - GEMINI_API_KEY
```

5. **Seed sample problems** (optional):
```bash
python seed_problems.py
```

6. **Run the server**:
```bash
python main.py
```

## 📝 First API Calls

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### 3. List Problems
```bash
curl -X GET "http://localhost:8000/api/v1/problems/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Start a Learning Session
```bash
curl -X POST "http://localhost:8000/api/v1/sessions/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"problem_id": 1}'
```

### 5. Submit Code
```bash
curl -X POST "http://localhost:8000/api/v1/submissions/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "code": "def two_sum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i",
    "language": "python",
    "session_id": 1
  }'
```

### 6. Get AI Hint
```bash
curl -X POST "http://localhost:8000/api/v1/ai/hint" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "session_id": 1,
    "hint_level": 1
  }'
```

## 🎯 Next Steps

1. **Explore the API**: Visit http://localhost:8000/api/docs for interactive documentation
2. **Create Custom Problems**: Use the `/api/v1/problems/` endpoint
3. **Build a Frontend**: Connect your React/Vue/Angular app
4. **Customize AI Feedback**: Modify `app/services/ai_service.py`
5. **Add More Languages**: Extend `app/services/code_executor.py`

## 🔧 Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `psql -l`

### AI Service Error
- Verify GEMINI_API_KEY is set correctly
- Check API key has credits
- Ensure internet connectivity

### Port Already in Use
- Change port in docker-compose.yml or main.py
- Stop other services using port 8000

## 📚 Learn More

- Read the full [README.md](README.md)
- Check the [API Documentation](http://localhost:8000/api/docs)
- Explore the code structure in `app/`

## 💬 Need Help?

- Check existing issues on GitHub
- Review the API documentation
- Examine the example problems in `seed_problems.py`
