from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Conversation, ConversationParticipant, FlatmateProfile, Message, Property, SavedProperty, User, UserPreference, Visit
from app.schemas.api import ConversationResponse, MessageCreate, MessageResponse, PreferencesPayload, PreferencesResponse, PropertyResponse, VisitCreate, VisitResponse
from app.security import get_current_user

router = APIRouter(prefix="/api/me", tags=["user actions"])


@router.get("/saved-properties", response_model=list[PropertyResponse])
def saved_properties(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Property]:
    return list(db.scalars(select(Property).join(SavedProperty).where(SavedProperty.user_id == user.id)).all())


@router.post("/saved-properties/{property_id}", status_code=status.HTTP_201_CREATED)
def save_property(property_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    if not db.get(Property, property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    if db.get(SavedProperty, (user.id, property_id)):
        return {"status": "already_saved"}
    db.add(SavedProperty(user_id=user.id, property_id=property_id))
    db.commit()
    return {"status": "saved"}


@router.delete("/saved-properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_property(property_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    saved = db.get(SavedProperty, (user.id, property_id))
    if saved:
        db.delete(saved)
        db.commit()


@router.get("/preferences", response_model=PreferencesResponse)
def read_preferences(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserPreference:
    preferences = db.scalar(select(UserPreference).where(UserPreference.user_id == user.id))
    if not preferences:
        preferences = UserPreference(user_id=user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    return preferences


@router.put("/preferences", response_model=PreferencesResponse)
def update_preferences(payload: PreferencesPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserPreference:
    preferences = db.scalar(select(UserPreference).where(UserPreference.user_id == user.id))
    if not preferences:
        preferences = UserPreference(user_id=user.id)
        db.add(preferences)
    for key, value in payload.model_dump().items():
        setattr(preferences, key, value)
    db.commit()
    db.refresh(preferences)
    return preferences


@router.post("/visits", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def create_visit(property_id: str, payload: VisitCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Visit:
    if not db.get(Property, property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    visit = Visit(id=f"v-{uuid4().hex[:12]}", user_id=user.id, property_id=property_id, visit_date=payload.visit_date, visit_time=payload.visit_time)
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


@router.get("/visits", response_model=list[VisitResponse])
def list_visits(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Visit]:
    return list(db.scalars(select(Visit).where(Visit.user_id == user.id).order_by(Visit.visit_date, Visit.visit_time)).all())


@router.post("/conversations/{other_user_id}", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def connect(other_user_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ConversationResponse:
    if other_user_id == user.id or not db.get(User, other_user_id):
        raise HTTPException(status_code=404, detail="User to connect with was not found")
    candidate_ids = {user.id, other_user_id}
    existing = db.execute(select(Conversation).options(joinedload(Conversation.participants), joinedload(Conversation.messages))).unique().scalars().all()
    for conversation in existing:
        if {participant.user_id for participant in conversation.participants} == candidate_ids:
            return ConversationResponse(id=conversation.id, participant_ids=list(candidate_ids), messages=[MessageResponse.model_validate(message) for message in conversation.messages], created_at=conversation.created_at, updated_at=conversation.updated_at)
    conversation = Conversation(id=f"c-{uuid4().hex[:12]}")
    conversation.participants = [ConversationParticipant(user_id=user.id), ConversationParticipant(user_id=other_user_id)]
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return ConversationResponse(id=conversation.id, participant_ids=list(candidate_ids), messages=[], created_at=conversation.created_at, updated_at=conversation.updated_at)


@router.post("/conversations/flatmate/{flatmate_id}", response_model=ConversationResponse)
def connect_flatmate(flatmate_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ConversationResponse:
    profile = db.get(FlatmateProfile, flatmate_id)
    if not profile or not profile.user_id:
        raise HTTPException(status_code=404, detail="Flatmate cannot be connected yet")
    return connect(profile.user_id, user, db)


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ConversationResponse]:
    conversations = db.scalars(select(Conversation).join(ConversationParticipant).where(ConversationParticipant.user_id == user.id).options(joinedload(Conversation.participants), joinedload(Conversation.messages))).unique().all()
    return [ConversationResponse(id=item.id, participant_ids=[participant.user_id for participant in item.participants], messages=[MessageResponse.model_validate(message) for message in item.messages], created_at=item.created_at, updated_at=item.updated_at) for item in conversations]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: str, payload: MessageCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Message:
    conversation = db.get(Conversation, conversation_id)
    if not conversation or not any(participant.user_id == user.id for participant in conversation.participants):
        raise HTTPException(status_code=404, detail="Conversation not found")
    message = Message(id=f"m-{uuid4().hex[:12]}", conversation_id=conversation_id, sender_id=user.id, body=payload.body)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
