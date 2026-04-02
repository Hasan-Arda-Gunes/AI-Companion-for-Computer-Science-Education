# AI Programming Tutor - Backend

An AI-powered programming education system that provides intelligent feedback and assessment for computer science students learning programming and data structures.

## 🌟 Features

### Core Functionality
- **Problem Management**: Create and manage programming problems with test cases
- **Code Submission & Evaluation**: Automated testing with AI-powered feedback
- **Real-time AI Assistance**: 
  - Progressive hints system
  - Chat-based help
  - Error explanation
- **Learning Sessions**: Track student problem-solving journey
- **Progress Tracking**: Comprehensive analytics and statistics
- **Authentication**: Secure JWT-based authentication

### AI-Powered Features
- ✅ Automated code correctness evaluation
- 📊 Code quality and style analysis
- 🎯 Efficiency assessment
- 💡 Specific, actionable feedback
- 🔍 Issue identification with explanations
- 📈 Personalized learning suggestions

## 🏗️ Architecture

### Technology Stack
- **Framework**: FastAPI (async Python web framework)
- **Database**: PostgreSQL with SQLAlchemy (async ORM)
- **AI/LLM**: Google Gemini (for code evaluation and assistance)
- **Authentication**: JWT with OAuth2
- **Code Execution**: Sandboxed Python execution

### Project Structure
```
ai-programming-tutor-backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py              # Authentication
│   │       │   ├── problems.py          # Problem CRUD
│   │       │   ├── submissions.py       # Code submission
│   │       │   ├── ai_assistance.py     # AI help
│   │       │   ├── sessions.py          # Learning sessions
│   │       │   └── progress.py          # Analytics
│   │       └── __init__.py
│   ├── core/
│   │   ├── config.py                    # Configuration
│   │   └── security.py                  # Auth utilities
│   ├── db/
│   │   └── database.py                  # DB connection
│   ├── models/
│   │   └── models.py                    # SQLAlchemy models
│   ├── schemas/
│   │   └── schemas.py                   # Pydantic schemas
│   └── services/
│       ├── ai_service.py                # LLM integration
│       └── code_executor.py             # Code execution
├── main.py                              # Application entry
├── requirements.txt                     # Dependencies
└── .env.example                         # Environment template
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-programming-tutor-backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (generate a strong random key)
- `GEMINI_API_KEY`: Your Gemini API key

5. **Set up database**
```bash
# Create database
createdb ai_tutor

# The application will auto-create tables on first run
```

6. **Run the application**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user

### Problems
- `GET /api/v1/problems/` - List problems (with filters)
- `GET /api/v1/problems/{id}` - Get problem details
- `POST /api/v1/problems/` - Create problem
- `PUT /api/v1/problems/{id}` - Update problem
- `DELETE /api/v1/problems/{id}` - Delete problem

### Submissions
- `POST /api/v1/submissions/` - Submit code
- `GET /api/v1/submissions/{id}` - Get submission
- `GET /api/v1/submissions/problem/{id}` - Get all submissions for problem

### AI Assistance
- `POST /api/v1/ai/hint` - Get progressive hint
- `POST /api/v1/ai/chat` - Chat with AI assistant
- `POST /api/v1/ai/explain-error` - Explain error message

### Sessions
- `POST /api/v1/sessions/` - Start learning session
- `GET /api/v1/sessions/{id}` - Get session
- `PUT /api/v1/sessions/{id}/complete` - Complete session

### Progress
- `GET /api/v1/progress/` - Get user progress
- `GET /api/v1/progress/statistics` - Get statistics
- `GET /api/v1/progress/problem/{id}` - Problem-specific progress
- `GET /api/v1/progress/leaderboard` - Get leaderboard

## 💡 Usage Examples

### Register a User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "student1",
    "password": "securepassword123",
    "full_name": "Student One"
  }'
```

### Submit Code
```bash
curl -X POST "http://localhost:8000/api/v1/submissions/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "code": "def solution(arr):\n    return sorted(arr)",
    "language": "python"
  }'
```

### Get AI Hint
```bash
curl -X POST "http://localhost:8000/api/v1/ai/hint" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "session_id": 1,
    "hint_level": 1
  }'
```

## 🔧 Configuration

### Code Execution Security
The system uses subprocess-based sandboxing for code execution:
- Timeout limits (configurable)
- Memory limits
- Isolated environment
- No network access from student code

### AI Evaluation Criteria
Customize evaluation in problem creation:
```json
{
  "evaluation_criteria": {
    "check_correctness": true,
    "check_efficiency": true,
    "check_style": true,
    "check_edge_cases": true,
    "language_specific_best_practices": true
  }
}
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 🔐 Security Considerations

1. **Authentication**: JWT-based with bcrypt password hashing
2. **Code Execution**: Sandboxed with resource limits
3. **Input Validation**: Pydantic schemas for all requests
4. **SQL Injection**: Protected by SQLAlchemy ORM
5. **CORS**: Configurable allowed origins
6. **Rate Limiting**: (TODO: Implement in production)

## 📈 Performance Optimization

- Async/await throughout for I/O operations
- Background task processing for code evaluation
- Database query optimization with proper indexes
- Connection pooling for database

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
# Dockerfile example
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
- Set `RELOAD=false`
- Use strong `SECRET_KEY`
- Configure proper `DATABASE_URL`
- Set up HTTPS/SSL
- Configure logging

### Recommended Stack
- **Web Server**: Nginx (reverse proxy)
- **App Server**: Uvicorn with Gunicorn
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis (for sessions/rate limiting)
- **Monitoring**: Sentry, Prometheus

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact: [your-email]

## 🗺️ Roadmap

- [ ] Support for more programming languages (Java, C++, JavaScript)
- [ ] Real-time collaboration features
- [ ] Visual debugger integration
- [ ] Peer code review system
- [ ] Gamification elements
- [ ] Mobile app support
- [ ] Integration with popular IDEs
- [ ] Advanced analytics dashboard
- [ ] Custom problem creation UI
- [ ] Automated difficulty adjustment

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
