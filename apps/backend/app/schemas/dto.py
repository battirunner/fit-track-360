from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    height_cm: float | None = None
    goal_weight_kg: float | None = None


class MealDto(BaseModel):
    id: UUID | str
    meal_type: str
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    scheduled_time: time | str | None = None
    completed: bool = False


class MealLogRequest(BaseModel):
    meal_id: UUID | None = None
    meal_type: str
    logged_name: str | None = None
    completed: bool = True


class GymSessionDto(BaseModel):
    id: UUID | str
    checked_in_at: datetime | str
    checked_out_at: datetime | str | None = None
    notes: str | None = None


class WeightLogRequest(BaseModel):
    weight_kg: float
    logged_on: date | None = None
    notes: str | None = None


class WeightLogDto(BaseModel):
    logged_on: date | str
    weight_kg: float


class DashboardSummary(BaseModel):
    user: str
    meals_completed: int
    meals_total: int
    water_ml: int
    water_goal_ml: int
    gym_status: str
    latest_weight_kg: float
    monthly_score: int
    weight_trend: list[WeightLogDto]
