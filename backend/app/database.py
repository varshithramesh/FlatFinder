import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "false").strip().lower() in {"1", "true", "yes", "on"}
DATABASE_URL = os.getenv("DATABASE_URL")
if DEMO_MODE and DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = None

if not DATABASE_URL:
    configured_path = os.getenv("SQLITE_DATABASE_PATH")
    database_path = Path(configured_path) if configured_path else Path(__file__).resolve().parents[1] / "data" / "flatfinder.db"
    database_path.parent.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{database_path.as_posix()}"
elif DATABASE_URL.startswith("sqlite"):
    sqlite_path = make_url(DATABASE_URL).database
    if sqlite_path and sqlite_path != ":memory:":
        Path(sqlite_path).expanduser().parent.mkdir(parents=True, exist_ok=True)

connect_args = {"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(connection, _record) -> None:
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
