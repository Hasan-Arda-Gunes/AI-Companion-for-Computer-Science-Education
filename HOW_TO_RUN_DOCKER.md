# Run the Full Stack with Docker (Development)

This project includes a root Docker Compose setup that starts:
- PostgreSQL database
- FastAPI backend
- Vite frontend

## Prerequisites
- Docker Desktop installed and running
- Ports available: 5173, 8000, 5432

## 1) Set optional environment variables
From the project root, you can define these before running compose:

- `SECRET_KEY` (recommended)
- `GEMINI_API_KEY` (required only if you use AI endpoints)

PowerShell example:

```powershell
$env:SECRET_KEY="replace-with-a-strong-secret"
$env:GEMINI_API_KEY="your-gemini-api-key"
```

## 2) Start all services
From the project root:

```powershell
docker compose up --build
```

## 3) Open the apps
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/api/docs
- Backend health: http://localhost:8000/health

## 4) Stop services
In the same terminal:

```powershell
docker compose down
```

To also remove database volume data:

```powershell
docker compose down -v
```
