from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FlatmateProfile, User
from app.schemas.api import FlatmateResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/flatmates", tags=["flatmates"])


@router.get("", response_model=list[FlatmateResponse])
def list_flatmates(db: Session = Depends(get_db)) -> list[FlatmateProfile]:
    return list(db.scalars(select(FlatmateProfile).order_by(FlatmateProfile.compatibility_score.desc())).all())


@router.get("/{flatmate_id}", response_model=FlatmateResponse)
def read_flatmate(flatmate_id: str, db: Session = Depends(get_db)) -> FlatmateProfile:
    profile = db.get(FlatmateProfile, flatmate_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Flatmate profile not found")
    return profile
