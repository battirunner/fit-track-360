# FitTrack V1 Setup

FitTrack is a PWA-style fitness tracker with a Next.js frontend, FastAPI backend, PostgreSQL database, and Docker Compose deployment.

## Docker

```powershell
Copy-Item .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Native Development

### Backend with uv

Install `uv` first if it is not available:

```powershell
pip install uv
```

Then run the API:

```powershell
cd apps/backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Initialize the database without needing `psql`:

```powershell
cd apps/backend
make db-create
make db-init
make db-seed
```

`make db-reset` drops and recreates the `public` schema, then loads the seed data. Use it only when you want to wipe local data.

On Windows without Make installed, use:

```powershell
cd apps/backend
.\dev.ps1
```

If Make is installed, use:

```powershell
cd apps/backend
make dev
```

For local native backend development, set `DATABASE_URL` to a reachable PostgreSQL database.

### Frontend

```powershell
cd apps/frontend
npm install
npm run dev
```

## Demo Login

The seed file creates:

- Email: `demo@fittrack.dev`
- Password: `password123`
