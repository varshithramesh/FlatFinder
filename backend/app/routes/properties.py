from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Property, User
from app.schemas.api import PropertyCreate, PropertyResponse
from app.security import require_role

router = APIRouter(prefix="/api/properties", tags=["properties"])


def get_property(property_id: str, db: Session) -> Property:
    property = db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.get("", response_model=list[PropertyResponse])
def list_properties(budget_max: int | None = Query(default=None, ge=0), area: str | None = None, room_type: str | None = None, furnished: str | None = None, db: Session = Depends(get_db)) -> list[Property]:
    query = select(Property)
    if budget_max is not None:
        query = query.where(Property.rent <= budget_max)
    if area and area != "Any":
        query = query.where(Property.area == area)
    if room_type and room_type != "Any":
        query = query.where(Property.room_type == room_type)
    if furnished and furnished != "Any":
        query = query.where(Property.furnished == furnished)
    return list(db.scalars(query.order_by(Property.created_at.desc())).all())


@router.get("/{property_id}", response_model=PropertyResponse)
def read_property(property_id: str, db: Session = Depends(get_db)) -> Property:
    return get_property(property_id, db)


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db), landlord: User = Depends(require_role("landlord"))) -> Property:
    property_id = payload.id or f"p-{uuid4().hex[:12]}"
    if db.get(Property, property_id):
        raise HTTPException(status_code=409, detail="Property ID already exists")
    property = Property(**payload.model_dump(exclude={"id"}), id=property_id, landlord_id=landlord.id)
    db.add(property)
    db.commit()
    db.refresh(property)
    return property


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(property_id: str, payload: PropertyCreate, db: Session = Depends(get_db), landlord: User = Depends(require_role("landlord"))) -> Property:
    property = get_property(property_id, db)
    if property.landlord_id != landlord.id:
        raise HTTPException(status_code=403, detail="You can only manage your own properties")
    for key, value in payload.model_dump(exclude={"id"}).items():
        setattr(property, key, value)
    db.commit()
    db.refresh(property)
    return property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(property_id: str, db: Session = Depends(get_db), landlord: User = Depends(require_role("landlord"))) -> None:
    property = get_property(property_id, db)
    if property.landlord_id != landlord.id:
        raise HTTPException(status_code=403, detail="You can only manage your own properties")
    db.delete(property)
    db.commit()
