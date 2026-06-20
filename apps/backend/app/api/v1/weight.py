from datetime import date

from fastapi import APIRouter

from app.schemas.dto import WeightLogDto, WeightLogRequest
from app.services.demo_data import demo_weight_trend

router = APIRouter()


@router.get("", response_model=list[WeightLogDto])
def weights() -> list[WeightLogDto]:
    return [WeightLogDto(**item) for item in demo_weight_trend()]


@router.post("", response_model=WeightLogDto)
def add_weight(payload: WeightLogRequest) -> WeightLogDto:
    return WeightLogDto(weight_kg=payload.weight_kg, logged_on=payload.logged_on or date.today())
