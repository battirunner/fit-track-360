from fastapi import APIRouter

from app.schemas.dto import DashboardSummary
from app.services.demo_data import demo_dashboard

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def summary() -> DashboardSummary:
    return DashboardSummary(**demo_dashboard())


@router.get("/monthly")
def monthly() -> dict[str, object]:
    return {
        "meal_compliance": 82,
        "gym_attendance": 14,
        "water_average_ml": 2380,
        "weight_change_kg": -1.2,
        "score": 78,
    }
