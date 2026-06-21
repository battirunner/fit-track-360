from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import GymSession, User
from app.schemas.dto import GymSessionDto

router = APIRouter()


@router.post("/checkin", response_model=GymSessionDto)
def checkin(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GymSessionDto:
    open_session = db.scalar(
        select(GymSession)
        .where(GymSession.user_id == user.id, GymSession.checked_out_at.is_(None))
        .order_by(GymSession.checked_in_at.desc())
    )
    if open_session:
        return GymSessionDto(
            id=open_session.id,
            checked_in_at=open_session.checked_in_at,
            checked_out_at=open_session.checked_out_at,
            notes=open_session.notes,
        )

    session = GymSession(user_id=user.id, notes="Checked in")
    db.add(session)
    db.commit()
    db.refresh(session)
    return GymSessionDto(
        id=session.id,
        checked_in_at=session.checked_in_at,
        checked_out_at=session.checked_out_at,
        notes=session.notes,
    )


@router.post("/checkout", response_model=GymSessionDto)
def checkout(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GymSessionDto:
    session = db.scalar(
        select(GymSession)
        .where(GymSession.user_id == user.id, GymSession.checked_out_at.is_(None))
        .order_by(GymSession.checked_in_at.desc())
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No open gym session")

    session.checked_out_at = datetime.now()
    session.notes = "Workout completed"
    db.commit()
    db.refresh(session)
    return GymSessionDto(
        id=session.id,
        checked_in_at=session.checked_in_at,
        checked_out_at=session.checked_out_at,
        notes=session.notes,
    )
