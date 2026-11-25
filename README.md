# FlatFinder

FlatFinder is organized as a React/Vite frontend and FastAPI backend. It uses SQLite by default, so PostgreSQL is not required.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Backend

The backend uses the existing virtual environment in `backend/venv`.

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Swagger documentation is available at `http://127.0.0.1:8000/docs`.

Copy `backend/.env.example` to `backend/.env` for local development. The example enables `DEMO_MODE` and configures SQLite. If demo mode is enabled, an old PostgreSQL `DATABASE_URL` is ignored in favor of `SQLITE_DATABASE_PATH`. Keep the actual username and password in the ignored `.env` file.

## Deploy on Render

Deploy this repository using the included `render.yaml`. It builds the frontend into the backend image, serves both from one Render web service, and stores the SQLite database on a persistent disk mounted at `/var/data`.

For an existing Render service, set **Root Directory** to blank (the repository root) and **Dockerfile Path** to `Dockerfile`. The frontend and backend are sibling folders; setting the root directory to either one causes the Docker `COPY` steps to fail with “not found”.

Set `DEMO_MODE=true`, `SEED_TENANT_USERNAME=syahrul`, `SEED_TENANT_PASSWORD`, and `SQLITE_DATABASE_PATH=/var/data/flatfinder.db` in Render's Environment settings. Use the same private password configured locally; do not put it in tracked files. Mount a persistent disk at `/var/data`. The included blueprint configures these settings and generates `JWT_SECRET`. A persistent disk requires a Render plan that supports disks.

Keep `backend/.env` private; it is excluded from Git.
