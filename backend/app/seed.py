from datetime import date, time
import os
import secrets
from uuid import uuid4

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Conversation, ConversationParticipant, FlatmateProfile, Message, Property, User, UserPreference, Visit
from app.security import hash_password, verify_password

IMAGE = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"

PROPERTY_SEEDS = [
    ("demo-101", "Modern 2BHK Near Alliance University", "BTM Layout, Bengaluru", "BTM Layout", "Alliance University", 1.2, 12000, 36000, "2 Bedrooms", "Furnished", 2, "2026-10-05", "Bright two-bedroom apartment designed for students.", ["Wi-Fi", "Laundry", "Study Desk", "AC", "Security"], ["Verified Listing", "Student Friendly"]),
    ("demo-102", "Sunrise Studio Close to Campus", "Koramangala, Bengaluru", "Koramangala", "Christ University", 0.9, 9500, 28500, "Single Room", "Semi-Furnished", 1, "2026-09-28", "Compact room with natural light and campus access.", ["Wi-Fi", "Water", "Cooking", "Study Chair"], ["Popular", "Quiet Zone"]),
    ("demo-103", "Campus Nest Shared Flat", "Indiranagar, Bengaluru", "Indiranagar", "JAIN University", 2.3, 14500, 43500, "3 Bedrooms", "Fully Furnished", 3, "2026-10-12", "Balanced shared flat with desk areas and kitchen access.", ["Wi-Fi", "AC", "Kitchen", "Laundry"], ["Shared Living"]),
    ("demo-104", "Lakeside Studio for Quiet Study", "HSR Layout, Bengaluru", "HSR Layout", "NSIT", 3.1, 11000, 33000, "Studio", "Furnished", 1, "2026-10-18", "Quiet workspace with reliable utilities.", ["Wi-Fi", "Desk", "AC", "Balcony"], ["Best for Study"]),
    ("demo-105", "Civic Corner Apartment", "Whitefield, Bengaluru", "Whitefield", "VIT University", 4.2, 13800, 41400, "2 Bedrooms", "Furnished", 2, "2026-09-30", "Modern apartment balancing comfort and commuting ease.", ["Wi-Fi", "Power Backup", "AC", "Parking"], ["Verified Listing"]),
    ("demo-106", "Rooftop Student Homes", "Yelahanka, Bengaluru", "Yelahanka", "BMS College", 2.7, 8800, 26400, "Single Room", "Unfurnished", 1, "2026-10-10", "Budget-friendly room in a lively student block.", ["Water", "Power Backup", "Internet Access"], ["Budget Friendly"]),
]

FLATMATE_SEEDS = [
    ("demo-f-101", "Rahul", "Alliance University", "BCA Student", 20, 8000, 12000, "Quiet environment", "Balanced", "Vegetarian", 92, ["BTM Layout", "Koramangala"], "11 PM – 7 AM"),
    ("demo-f-102", "Ananya", "Christ University", "BBA Student", 21, 10000, 14000, "Group study sometimes", "Social", "Non-vegetarian", 89, ["Indiranagar", "Koramangala"], "12 AM – 8 AM"),
    ("demo-f-103", "Karthik", "JAIN University", "Computer Science", 22, 9000, 13000, "Deep focus blocks", "Moderate", "Vegetarian", 90, ["Whitefield", "HSR Layout"], "10:30 PM – 6:30 AM"),
    ("demo-f-104", "Sneha", "BMS College", "Psychology Student", 20, 7000, 11000, "Calm and structured", "Quiet", "Vegetarian", 94, ["Yelahanka", "Indiranagar"], "11 PM – 7 AM"),
]


def seed_database() -> None:
    db = SessionLocal()
    try:
        username = os.getenv("SEED_TENANT_USERNAME", "syahrul").strip().lower()
        tenant_password = os.getenv("SEED_TENANT_PASSWORD")
        if not username or "@" in username:
            raise RuntimeError("SEED_TENANT_USERNAME must be a non-empty username")
        if not tenant_password:
            raise RuntimeError("SEED_TENANT_PASSWORD must be set when DEMO_MODE is enabled")
        landlord = db.scalar(select(User).where(User.email == "landlord@flatfinder.local"))
        if not landlord:
            landlord = User(id="seed-landlord", full_name="FlatFinder Landlord", email="landlord@flatfinder.local", password_hash=hash_password(secrets.token_urlsafe(32)), university="FlatFinder", role="landlord", verified=True)
            db.add(landlord)
        tenant_email = f"{username}@flatfinder.local"
        tenant = db.scalar(select(User).where(User.email == tenant_email))
        if not tenant:
            tenant = User(id=f"seed-{uuid4().hex}", full_name=username.capitalize(), email=tenant_email, password_hash=hash_password(tenant_password), university="Alliance University", student_id="AU-SY-001", role="tenant", verified=True)
            db.add(tenant)
        elif not verify_password(tenant_password, tenant.password_hash):
            tenant.password_hash = hash_password(tenant_password)
        db.flush()
        if not db.scalar(select(UserPreference).where(UserPreference.user_id == tenant.id)):
            db.add(UserPreference(user_id=tenant.id))
        for item in PROPERTY_SEEDS:
            if not db.get(Property, item[0]):
                db.add(Property(id=item[0], landlord_id=landlord.id, name=item[1], location=item[2], area=item[3], university=item[4], distance_km=item[5], rent=item[6], deposit=item[7], room_type=item[8], furnished=item[9], roommates=item[10], move_in_date=date.fromisoformat(item[11]), description=item[12], amenities=item[13], images=[IMAGE], tags=item[14], verified=item[0] != "demo-106"))
        for item in FLATMATE_SEEDS:
            flatmate_user = db.scalar(select(User).where(User.email == f"{item[0]}@flatfinder.local"))
            if not flatmate_user:
                flatmate_user = User(id=f"seed-{item[0]}", full_name=item[1], email=f"{item[0]}@flatfinder.local", password_hash=hash_password(secrets.token_urlsafe(32)), university=item[2], role="tenant", verified=True)
                db.add(flatmate_user)
                db.flush()
            profile = db.get(FlatmateProfile, item[0])
            if not profile:
                profile = FlatmateProfile(id=item[0], name=item[1], university=item[2], course=item[3], about=f"{item[1]} prefers a respectful and student-friendly shared home.", age=item[4], budget_min=item[5], budget_max=item[6], study_style=item[7], lifestyle=item[8], food_preference=item[9], compatibility_score=item[10], preferred_areas=item[11], sleep_schedule=item[12], profile_image=IMAGE, match_breakdown={"budget": item[10], "location": item[10] - 2, "lifestyle": item[10], "sleep": item[10] - 3, "study": item[10]}, user_id=flatmate_user.id)
                db.add(profile)
            elif profile.user_id is None:
                profile.user_id = flatmate_user.id
        if not db.get(Visit, "v-1"):
            db.add(Visit(id="v-1", user_id=tenant.id, property_id="demo-101", visit_date=date(2026, 9, 30), visit_time=time(11, 0), status="Confirmed"))
        if not db.get(Visit, "v-2"):
            db.add(Visit(id="v-2", user_id=tenant.id, property_id="demo-102", visit_date=date(2026, 10, 2), visit_time=time(16, 30), status="Pending"))
        if not db.get(Visit, "v-3"):
            db.add(Visit(id="v-3", user_id=tenant.id, property_id="demo-103", visit_date=date(2026, 10, 5), visit_time=time(9, 0), status="Confirmed"))
        conversation = db.get(Conversation, "c-demo")
        if not conversation:
            conversation = Conversation(id="c-demo")
            conversation.participants = [ConversationParticipant(user_id=tenant.id), ConversationParticipant(user_id=landlord.id)]
            conversation.messages = [
                Message(id="m-1", sender_id=landlord.id, body=f"Hi {username.capitalize()}, I saw your profile and your budget matches well."),
                Message(id="m-2", sender_id=tenant.id, body="Perfect! Is the room still available for this month?"),
                Message(id="m-3", sender_id=landlord.id, body="Yes, it is. Want to schedule a visit?"),
            ]
            db.add(conversation)
        db.commit()
    finally:
        db.close()
