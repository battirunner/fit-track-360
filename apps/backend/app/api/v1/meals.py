from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import (
    Ingredient,
    Meal,
    MealIngredient,
    MealLog,
    MealPlan,
    MealPlanDay,
    User,
)
from app.schemas.dto import (
    GroceryListDto,
    GroceryListItemDto,
    MealDto,
    MealLogRequest,
    MealPlanDayDto,
    MealPlanDetailDto,
    MealPlanDto,
    MealPlanRequest,
    MealUpsertRequest,
)

router = APIRouter()


def _meal_to_dto(meal: Meal, completed: bool = False) -> MealDto:
    return MealDto(
        id=meal.id,
        meal_plan_id=meal.meal_plan_id,
        recipe_id=meal.recipe_id,
        planned_on=meal.planned_on,
        meal_type=meal.meal_type,
        name=meal.name,
        calories=meal.calories,
        protein_g=float(meal.protein_g),
        carbs_g=float(meal.carbs_g),
        fat_g=float(meal.fat_g),
        scheduled_time=meal.scheduled_time,
        notes=meal.notes,
        completed=completed,
    )


def _plan_to_dto(plan: MealPlan, meals_count: int = 0) -> MealPlanDto:
    return MealPlanDto(
        id=plan.id,
        title=plan.title,
        description=plan.description,
        starts_on=plan.starts_on,
        ends_on=plan.ends_on,
        target_calories_min=plan.target_calories_min,
        target_calories_max=plan.target_calories_max,
        target_protein_min=plan.target_protein_min,
        target_protein_max=plan.target_protein_max,
        water_goal_ml=plan.water_goal_ml,
        gym_days_per_week=plan.gym_days_per_week,
        notes=plan.notes,
        meals_count=meals_count,
    )


def _get_user_plan(db: Session, user: User, plan_id: UUID) -> MealPlan:
    plan = db.scalar(select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == user.id))
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    return plan


@router.get("/plans", response_model=list[MealPlanDto])
def list_plans(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MealPlanDto]:
    rows = db.execute(
        select(MealPlan, func.count(Meal.id))
        .outerjoin(Meal, Meal.meal_plan_id == MealPlan.id)
        .where(MealPlan.user_id == user.id)
        .group_by(MealPlan.id)
        .order_by(MealPlan.starts_on.desc())
    ).all()
    return [_plan_to_dto(plan, meals_count) for plan, meals_count in rows]


@router.post("/plans", response_model=MealPlanDto)
def create_plan(
    payload: MealPlanRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MealPlanDto:
    plan = MealPlan(user_id=user.id, **payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return _plan_to_dto(plan)


@router.get("/plans/{plan_id}", response_model=MealPlanDetailDto)
def get_plan(
    plan_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MealPlanDetailDto:
    plan = _get_user_plan(db, user, plan_id)
    meals = db.scalars(
        select(Meal)
        .where(Meal.meal_plan_id == plan.id)
        .order_by(Meal.planned_on.asc(), Meal.scheduled_time.asc())
    ).all()
    days = db.scalars(
        select(MealPlanDay)
        .where(MealPlanDay.meal_plan_id == plan.id)
        .order_by(MealPlanDay.planned_on.asc())
    ).all()
    plan_dto = _plan_to_dto(plan, len(meals))
    return MealPlanDetailDto(
        **plan_dto.model_dump(),
        days=[
            MealPlanDayDto(
                planned_on=day.planned_on,
                calories=day.calories,
                protein_g=float(day.protein_g) if day.protein_g is not None else None,
                preparation=day.preparation,
                water_guidance=day.water_guidance,
                notes=day.notes,
            )
            for day in days
        ],
        meals=[_meal_to_dto(meal) for meal in meals],
    )


@router.put("/plans/{plan_id}", response_model=MealPlanDto)
def update_plan(
    plan_id: UUID,
    payload: MealPlanRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MealPlanDto:
    plan = _get_user_plan(db, user, plan_id)
    for field, value in payload.model_dump().items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    meals_count = db.scalar(select(func.count(Meal.id)).where(Meal.meal_plan_id == plan.id)) or 0
    return _plan_to_dto(plan, meals_count)


@router.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    plan = _get_user_plan(db, user, plan_id)
    db.delete(plan)
    db.commit()
    return {"status": "deleted"}


@router.get("/plans/{plan_id}/grocery-list", response_model=GroceryListDto)
def get_grocery_list(
    plan_id: UUID,
    start_on: date | None = None,
    end_on: date | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GroceryListDto:
    plan = _get_user_plan(db, user, plan_id)
    range_start = start_on or plan.starts_on
    range_end = end_on or plan.ends_on or plan.starts_on
    if range_end < range_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_on must be on or after start_on",
        )

    rows = db.execute(
        select(
            Ingredient.id,
            Ingredient.name,
            Ingredient.category,
            MealIngredient.unit,
            func.sum(MealIngredient.quantity),
        )
        .join(MealIngredient, MealIngredient.ingredient_id == Ingredient.id)
        .join(Meal, Meal.id == MealIngredient.meal_id)
        .where(
            Meal.meal_plan_id == plan.id,
            Meal.planned_on >= range_start,
            Meal.planned_on <= range_end,
        )
        .group_by(Ingredient.id, Ingredient.name, Ingredient.category, MealIngredient.unit)
        .order_by(Ingredient.category.asc(), Ingredient.name.asc(), MealIngredient.unit.asc())
    ).all()

    return GroceryListDto(
        plan_id=plan.id,
        start_on=range_start,
        end_on=range_end,
        items=[
            GroceryListItemDto(
                ingredient_id=ingredient_id,
                name=name,
                category=category,
                unit=unit,
                quantity=float(quantity),
            )
            for ingredient_id, name, category, unit, quantity in rows
        ],
    )


@router.post("/plans/{plan_id}/meals", response_model=MealDto)
def create_plan_meal(
    plan_id: UUID,
    payload: MealUpsertRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MealDto:
    plan = _get_user_plan(db, user, plan_id)
    meal = Meal(meal_plan_id=plan.id, **payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return _meal_to_dto(meal)


@router.put("/plans/{plan_id}/meals/{meal_id}", response_model=MealDto)
def update_plan_meal(
    plan_id: UUID,
    meal_id: UUID,
    payload: MealUpsertRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MealDto:
    _get_user_plan(db, user, plan_id)
    meal = db.scalar(select(Meal).where(Meal.id == meal_id, Meal.meal_plan_id == plan_id))
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    for field, value in payload.model_dump().items():
        setattr(meal, field, value)
    db.commit()
    db.refresh(meal)
    return _meal_to_dto(meal)


@router.delete("/plans/{plan_id}/meals/{meal_id}")
def delete_plan_meal(
    plan_id: UUID,
    meal_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    _get_user_plan(db, user, plan_id)
    meal = db.scalar(select(Meal).where(Meal.id == meal_id, Meal.meal_plan_id == plan_id))
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"status": "deleted"}


@router.get("/by-date", response_model=list[MealDto])
def meals_by_date(
    planned_on: date | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MealDto]:
    target_date = planned_on or date.today()
    completed_meal_ids = set(
        db.scalars(
            select(MealLog.meal_id).where(
                MealLog.user_id == user.id,
                MealLog.completed.is_(True),
                MealLog.logged_on == target_date,
                MealLog.meal_id.is_not(None),
            )
        ).all()
    )
    meals = db.scalars(
        select(Meal)
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(
            MealPlan.user_id == user.id,
            Meal.planned_on == target_date,
        )
        .order_by(Meal.scheduled_time)
    ).all()
    return [_meal_to_dto(meal, meal.id in completed_meal_ids) for meal in meals]


@router.get("/today", response_model=list[MealDto])
def today_meals(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MealDto]:
    today = date.today()
    completed_meal_ids = set(
        db.scalars(
            select(MealLog.meal_id).where(
                MealLog.user_id == user.id,
                MealLog.completed.is_(True),
                MealLog.logged_on == today,
                MealLog.meal_id.is_not(None),
            )
        ).all()
    )

    meals = db.scalars(
        select(Meal)
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(
            MealPlan.user_id == user.id,
            Meal.planned_on == today,
        )
        .order_by(Meal.scheduled_time)
    ).all()

    return [_meal_to_dto(meal, meal.id in completed_meal_ids) for meal in meals]


@router.get("/month")
def monthly_meals(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    today = date.today()
    month_start = today.replace(day=1)
    completed = db.scalar(
        select(func.count(MealLog.id)).where(
            MealLog.user_id == user.id,
            MealLog.completed.is_(True),
            MealLog.logged_on >= month_start,
        )
    ) or 0
    planned = db.scalar(
        select(func.count(Meal.id))
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(
            MealPlan.user_id == user.id,
            Meal.planned_on >= month_start,
            Meal.planned_on <= today,
        )
    ) or 0
    compliance = round((completed / planned) * 100) if planned else 0
    return {"compliance": compliance, "completed": completed, "planned": planned}


@router.post("/log")
def log_meal(
    payload: MealLogRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    existing = None
    today = date.today()
    if payload.meal_id:
        existing = db.scalar(
            select(MealLog).where(
                and_(
                    MealLog.user_id == user.id,
                    MealLog.meal_id == payload.meal_id,
                    MealLog.logged_on == today,
                )
            )
        )

    if existing:
        existing.completed = payload.completed
        existing.logged_name = payload.logged_name
    else:
        db.add(
            MealLog(
                user_id=user.id,
                meal_id=payload.meal_id,
                meal_type=payload.meal_type,
                logged_name=payload.logged_name,
                logged_on=today,
                completed=payload.completed,
            )
        )

    db.commit()
    return {"status": "logged", "meal_type": payload.meal_type, "completed": payload.completed}
