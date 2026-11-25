from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.database import Base, DEMO_MODE, engine
from app import models
from app.seed import seed_database
from app.routes.auth import router as auth_router
from app.routes.flatmates import router as flatmates_router
from app.routes.health import router as health_router
from app.routes.properties import router as properties_router
from app.routes.user_actions import router as user_actions_router

app = FastAPI(title="FlatFinder API", version="1.0.0")
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(properties_router)
app.include_router(flatmates_router)
app.include_router(user_actions_router)


@app.on_event("startup")
def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)
    if DEMO_MODE:
        seed_database()


@app.get("/", response_model=None)
def read_root() -> dict[str, str] | FileResponse:
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {"message": "FlatFinder API is running"}


@app.get("/{path:path}", include_in_schema=False)
def serve_frontend(path: str) -> FileResponse:
    if path.startswith("api/") or not FRONTEND_DIST.is_dir():
        raise HTTPException(status_code=404, detail="Not found")

    frontend_root = FRONTEND_DIST.resolve()
    requested_file = (frontend_root / path).resolve()
    if frontend_root in requested_file.parents and requested_file.is_file():
        return FileResponse(requested_file)

    index_file = frontend_root / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")
