from fastapi import APIRouter

from app.api.v1 import auth, dashboard, gym, meals, profile, recipes, weight

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(meals.router, prefix="/meals", tags=["meals"])
api_router.include_router(gym.router, prefix="/gym", tags=["gym"])
api_router.include_router(weight.router, prefix="/weight", tags=["weight"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
