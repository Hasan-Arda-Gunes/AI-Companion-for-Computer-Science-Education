# Run the Full Stack with Docker (Development)

This project includes a root Docker Compose setup that starts:
- PostgreSQL database
- FastAPI backend
- Vite frontend

## Prerequisites
- Docker Desktop installed and running
- Ports available: 5173, 8000, 5432

## 1) Configure local `.env`
The root compose file reads database credentials from a root `.env` file.

Required keys:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

Optional keys:

- `SECRET_KEY`
- `GEMINI_API_KEY`

Example `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me
POSTGRES_DB=ai_tutor
SECRET_KEY=replace-with-a-strong-secret
GEMINI_API_KEY=
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
