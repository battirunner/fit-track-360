from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.models.entities import User
from app.schemas.dto import AuthResponse, LoginRequest, RegisterRequest, UserProfile
from app.services.demo_data import DEMO_USER_ID

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        user = db.scalar(select(User).where(User.email == payload.email))
    except SQLAlchemyError:
        user = None

    if user and verify_password(payload.password, user.password_hash):
        return AuthResponse(access_token=create_access_token(str(user.id)))

    if payload.email == "demo@fittrack.dev" and payload.password == "password123":
        return AuthResponse(access_token=create_access_token(DEMO_USER_ID))

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=UserProfile)
def me(user: User = Depends(get_current_user)) -> UserProfile:
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        age=user.age,
        sex=user.sex,
        height_cm=float(user.height_cm) if user.height_cm is not None else None,
        goal_weight_kg=float(user.goal_weight_kg) if user.goal_weight_kg is not None else None,
        activity_level=user.activity_level,
        medical_notes=user.medical_notes,
    )
