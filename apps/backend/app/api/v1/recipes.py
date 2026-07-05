from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Meal, MealPlan, Recipe, User
from app.schemas.dto import MealDto, RecipeDetailDto, RecipeDto

router = APIRouter()


def recipe_to_dto(recipe: Recipe, planned_meals_count: int = 0) -> RecipeDto:
    return RecipeDto(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        main_ingredients=recipe.main_ingredients,
        instructions=recipe.instructions,
        video_url=recipe.video_url,
        source=recipe.source,
        planned_meals_count=planned_meals_count,
    )


def meal_to_dto(meal: Meal) -> MealDto:
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
        completed=False,
    )


@router.get("", response_model=list[RecipeDto])
def list_recipes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RecipeDto]:
    rows = db.execute(
        select(Recipe, func.count(Meal.id).label("planned_meals_count"))
        .join(Meal, Meal.recipe_id == Recipe.id)
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(MealPlan.user_id == user.id)
        .group_by(Recipe.id)
        .order_by(Recipe.title.asc())
    ).all()
    return [recipe_to_dto(recipe, count) for recipe, count in rows]


@router.get("/{recipe_id}", response_model=RecipeDetailDto)
def get_recipe(
    recipe_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecipeDetailDto:
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    meals = db.scalars(
        select(Meal)
        .join(MealPlan, MealPlan.id == Meal.meal_plan_id)
        .where(
            MealPlan.user_id == user.id,
            Meal.recipe_id == recipe.id,
        )
        .order_by(Meal.planned_on.asc(), Meal.scheduled_time.asc())
    ).all()
    if not meals:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not in your plan")

    dto = recipe_to_dto(recipe, len(meals))
    return RecipeDetailDto(
        **dto.model_dump(),
        used_in_meals=[meal_to_dto(meal) for meal in meals],
    )
