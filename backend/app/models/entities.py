from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    university: Mapped[str] = mapped_column(String(160), nullable=False)
    student_id: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="tenant", nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    preferences: Mapped["UserPreference | None"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    properties: Mapped[list["Property"]] = relationship(back_populates="landlord", cascade="all, delete-orphan")
    flatmate_profile: Mapped["FlatmateProfile | None"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_properties: Mapped[list["SavedProperty"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    visits: Mapped[list["Visit"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sent_messages: Mapped[list["Message"]] = relationship(back_populates="sender")


class UserPreference(TimestampMixin, Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    budget_max: Mapped[int] = mapped_column(Integer, default=15000, nullable=False)
    room_type: Mapped[str] = mapped_column(String(80), default="Any", nullable=False)
    area: Mapped[str] = mapped_column(String(120), default="Any", nullable=False)
    furnished: Mapped[str] = mapped_column(String(80), default="Any", nullable=False)

    user: Mapped[User] = relationship(back_populates="preferences")


class Property(TimestampMixin, Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    landlord_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False)
    area: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    university: Mapped[str] = mapped_column(String(160), nullable=False)
    distance_km: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    rent: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    deposit: Mapped[int] = mapped_column(Integer, nullable=False)
    room_type: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    furnished: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    roommates: Mapped[int] = mapped_column(Integer, nullable=False)
    move_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amenities: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    images: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    landlord: Mapped[User] = relationship(back_populates="properties")
    saved_by: Mapped[list["SavedProperty"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    visits: Mapped[list["Visit"]] = relationship(back_populates="property", cascade="all, delete-orphan")


class FlatmateProfile(TimestampMixin, Base):
    __tablename__ = "flatmate_profiles"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    university: Mapped[str] = mapped_column(String(160), nullable=False)
    course: Mapped[str] = mapped_column(String(160), nullable=False)
    about: Mapped[str] = mapped_column(Text, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    budget_min: Mapped[int] = mapped_column(Integer, nullable=False)
    budget_max: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_areas: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    sleep_schedule: Mapped[str] = mapped_column(String(100), nullable=False)
    study_style: Mapped[str] = mapped_column(String(120), nullable=False)
    lifestyle: Mapped[str] = mapped_column(String(120), nullable=False)
    food_preference: Mapped[str] = mapped_column(String(80), nullable=False)
    compatibility_score: Mapped[int] = mapped_column(Integer, nullable=False)
    profile_image: Mapped[str] = mapped_column(String(500), nullable=False)
    match_breakdown: Mapped[dict[str, int]] = mapped_column(JSON, nullable=False)

    user: Mapped[User | None] = relationship(back_populates="flatmate_profile")


class SavedProperty(Base):
    __tablename__ = "saved_properties"
    __table_args__ = (UniqueConstraint("user_id", "property_id", name="uq_saved_property"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="saved_properties")
    property: Mapped[Property] = relationship(back_populates="saved_by")


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    visit_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False)

    user: Mapped[User] = relationship(back_populates="visits")
    property: Mapped[Property] = relationship(back_populates="visits")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    participants: Mapped[list["ConversationParticipant"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    conversation: Mapped[Conversation] = relationship(back_populates="participants")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    conversation: Mapped[Conversation] = relationship(back_populates="messages")
    sender: Mapped[User] = relationship(back_populates="sent_messages")
