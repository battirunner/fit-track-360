from datetime import datetime

from fastapi import APIRouter

from app.schemas.dto import GymSessionDto
from app.services.demo_data import demo_gym_session

router = APIRouter()


@router.post("/checkin", response_model=GymSessionDto)
def checkin() -> GymSessionDto:
    return GymSessionDto(**demo_gym_session())


@router.post("/checkout", response_model=GymSessionDto)
def checkout() -> GymSessionDto:
    session = demo_gym_session()
    session["checked_out_at"] = datetime.now().isoformat()
    session["notes"] = "Demo workout completed"
    return GymSessionDto(**session)
