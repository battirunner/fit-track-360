from fastapi import APIRouter

from app.schemas.dto import MealDto, MealLogRequest
from app.services.demo_data import TODAY_MEALS

router = APIRouter()


@router.get("/today", response_model=list[MealDto])
def today_meals() -> list[MealDto]:
    return [MealDto(**meal) for meal in TODAY_MEALS]


@router.get("/month")
def monthly_meals() -> dict[str, object]:
    return {"compliance": 82, "completed": 64, "planned": 78}


@router.post("/log")
def log_meal(payload: MealLogRequest) -> dict[str, object]:
    return {"status": "logged", "meal_type": payload.meal_type, "completed": payload.completed}
