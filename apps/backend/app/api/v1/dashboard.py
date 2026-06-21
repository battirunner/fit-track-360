from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import GymSession, Meal, MealLog, MealPlan, User, WaterLog, WeightLog
from app.schemas.dto import DashboardSummary

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardSummary:
    today = date.today()
    meals_total = db.scalar(
        select(func.count(Meal.id))
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(
            MealPlan.user_id == user.id,
            Meal.planned_on == today,
        )
    ) or 0
    meals_completed = db.scalar(
        select(func.count(MealLog.id)).where(
            MealLog.user_id == user.id,
            MealLog.completed.is_(True),
            func.date(MealLog.logged_at) == today,
        )
    ) or 0
    water_ml = db.scalar(
        select(func.coalesce(func.sum(WaterLog.amount_ml), 0)).where(
            WaterLog.user_id == user.id,
            func.date(WaterLog.logged_at) == today,
        )
    ) or 0
    open_gym_session = db.scalar(
        select(GymSession.id).where(
            GymSession.user_id == user.id,
            GymSession.checked_out_at.is_(None),
        )
    )
    completed_gym_today = db.scalar(
        select(GymSession.id).where(
            GymSession.user_id == user.id,
            GymSession.checked_out_at.is_not(None),
            func.date(GymSession.checked_in_at) == today,
        )
    )
    latest_weight = db.scalar(
        select(WeightLog)
        .where(WeightLog.user_id == user.id)
        .order_by(WeightLog.logged_on.desc())
        .limit(1)
    )
    weight_trend_rows = db.scalars(
        select(WeightLog)
        .where(WeightLog.user_id == user.id, WeightLog.logged_on >= today - timedelta(days=30))
        .order_by(WeightLog.logged_on.asc())
    ).all()

    meal_score = round((meals_completed / meals_total) * 100) if meals_total else 0
    water_score = min(100, round((int(water_ml) / 3000) * 100))
    gym_score = 100 if completed_gym_today else 50 if open_gym_session else 0
    monthly_score = round((meal_score + water_score + gym_score) / 3)

    return DashboardSummary(
        user=user.full_name,
        meals_completed=meals_completed,
        meals_total=meals_total,
        water_ml=int(water_ml),
        water_goal_ml=3000,
        gym_status=(
            "checked_in"
            if open_gym_session
            else "completed"
            if completed_gym_today
            else "not_checked_in"
        ),
        latest_weight_kg=float(latest_weight.weight_kg) if latest_weight else 0,
        monthly_score=monthly_score,
        weight_trend=[
            {"logged_on": row.logged_on, "weight_kg": float(row.weight_kg)}
            for row in weight_trend_rows
        ],
    )


@router.get("/monthly")
def monthly(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    today = date.today()
    month_start = today.replace(day=1)
    meal_completed = db.scalar(
        select(func.count(MealLog.id)).where(
            MealLog.user_id == user.id,
            MealLog.completed.is_(True),
            func.date(MealLog.logged_at) >= month_start,
        )
    ) or 0
    gym_attendance = db.scalar(
        select(func.count(GymSession.id)).where(
            GymSession.user_id == user.id,
            func.date(GymSession.checked_in_at) >= month_start,
        )
    ) or 0
    water_average = db.scalar(
        select(func.coalesce(func.avg(WaterLog.amount_ml), 0)).where(
            WaterLog.user_id == user.id,
            func.date(WaterLog.logged_at) >= month_start,
        )
    ) or 0
    first_weight = db.scalar(
        select(WeightLog)
        .where(WeightLog.user_id == user.id, WeightLog.logged_on >= month_start)
        .order_by(WeightLog.logged_on.asc())
        .limit(1)
    )
    latest_weight = db.scalar(
        select(WeightLog)
        .where(WeightLog.user_id == user.id)
        .order_by(WeightLog.logged_on.desc())
        .limit(1)
    )
    weight_change = (
        float(latest_weight.weight_kg - first_weight.weight_kg)
        if latest_weight and first_weight
        else 0
    )
    return {
        "meal_compliance": meal_completed,
        "gym_attendance": gym_attendance,
        "water_average_ml": round(float(water_average)),
        "weight_change_kg": round(weight_change, 2),
        "score": 78,
    }
