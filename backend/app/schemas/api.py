from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str
    password: str = Field(min_length=8)
    university: str
    student_id: str | None = None
    role: Literal["tenant", "landlord"] = "tenant"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: str
    university: str
    student_id: str | None
    role: str
    verified: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PropertyBase(BaseModel):
    name: str
    location: str
    area: str
    university: str
    distance_km: float
    rent: int
    deposit: int
    room_type: str
    furnished: str
    roommates: int
    move_in_date: date
    description: str
    amenities: list[str] = []
    images: list[str] = []
    tags: list[str] = []
    verified: bool = False


class PropertyCreate(PropertyBase):
    id: str | None = None


class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    landlord_id: str
    created_at: datetime
    updated_at: datetime


class FlatmateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str | None
    name: str
    university: str
    course: str
    about: str
    age: int
    budget_min: int
    budget_max: int
    preferred_areas: list[str]
    sleep_schedule: str
    study_style: str
    lifestyle: str
    food_preference: str
    compatibility_score: int
    profile_image: str
    match_breakdown: dict[str, int]


class PreferencesPayload(BaseModel):
    budget_max: int = 15000
    room_type: str = "Any"
    area: str = "Any"
    furnished: str = "Any"


class PreferencesResponse(PreferencesPayload):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: str


class VisitCreate(BaseModel):
    visit_date: date
    visit_time: time


class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    property_id: str
    visit_date: date
    visit_time: time
    status: str
    created_at: datetime


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    sender_id: str
    body: str
    created_at: datetime


class ConversationResponse(BaseModel):
    id: str
    participant_ids: list[str]
    messages: list[MessageResponse]
    created_at: datetime
    updated_at: datetime
