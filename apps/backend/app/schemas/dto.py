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
    age: int | None = None
    sex: str | None = None
    height_cm: float | None = None
    goal_weight_kg: float | None = None
    activity_level: str | None = None
    medical_notes: str | None = None


class ProfileUpdateRequest(BaseModel):
    full_name: str
    age: int | None = None
    sex: str | None = None
    height_cm: float | None = None
    goal_weight_kg: float | None = None
    activity_level: str | None = None
    medical_notes: str | None = None


class BodyMeasurementRequest(BaseModel):
    measured_on: date | None = None
    weight_kg: float | None = None
    waist_cm: float | None = None
    chest_cm: float | None = None
    hip_cm: float | None = None
    arm_cm: float | None = None
    thigh_cm: float | None = None
    body_fat_percent: float | None = None
    notes: str | None = None


class BodyMeasurementDto(BaseModel):
    id: UUID
    measured_on: date
    weight_kg: float | None = None
    waist_cm: float | None = None
    chest_cm: float | None = None
    hip_cm: float | None = None
    arm_cm: float | None = None
    thigh_cm: float | None = None
    body_fat_percent: float | None = None
    notes: str | None = None


class BloodPressureRequest(BaseModel):
    measured_at: datetime | None = None
    systolic: int
    diastolic: int
    pulse: int | None = None
    notes: str | None = None


class BloodPressureDto(BaseModel):
    id: UUID
    measured_at: datetime
    systolic: int
    diastolic: int
    pulse: int | None = None
    notes: str | None = None


class BloodPressureAverageDto(BaseModel):
    systolic: float | None = None
    diastolic: float | None = None
    pulse: float | None = None
    count: int = 0


class ProfileOverviewDto(BaseModel):
    user: UserProfile
    latest_measurement: BodyMeasurementDto | None = None
    measurements: list[BodyMeasurementDto] = []
    blood_pressure_logs: list[BloodPressureDto] = []
    blood_pressure_average_last_7_days: BloodPressureAverageDto


class MealDto(BaseModel):
    id: UUID | str
    meal_plan_id: UUID | str | None = None
    recipe_id: UUID | str | None = None
    planned_on: date | str | None = None
    meal_type: str
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    scheduled_time: time | str | None = None
    notes: str | None = None
    completed: bool = False


class MealUpsertRequest(BaseModel):
    planned_on: date | None = None
    meal_type: str
    name: str
    calories: int = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    scheduled_time: time | None = None
    notes: str | None = None


class MealPlanDayDto(BaseModel):
    planned_on: date
    calories: int | None = None
    protein_g: float | None = None
    preparation: str | None = None
    water_guidance: str | None = None
    notes: str | None = None


class MealPlanRequest(BaseModel):
    title: str
    description: str | None = None
    starts_on: date
    ends_on: date | None = None
    target_calories_min: int | None = None
    target_calories_max: int | None = None
    target_protein_min: int | None = None
    target_protein_max: int | None = None
    water_goal_ml: int = 3000
    gym_days_per_week: int | None = None
    notes: str | None = None


class MealPlanDto(MealPlanRequest):
    id: UUID
    meals_count: int = 0


class MealPlanDetailDto(MealPlanDto):
    days: list[MealPlanDayDto] = []
    meals: list[MealDto] = []


class GroceryListItemDto(BaseModel):
    ingredient_id: UUID
    name: str
    category: str
    quantity: float
    unit: str


class GroceryListDto(BaseModel):
    plan_id: UUID
    start_on: date
    end_on: date
    items: list[GroceryListItemDto]


class RecipeDto(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    main_ingredients: str | None = None
    instructions: str | None = None
    video_url: str | None = None
    source: str | None = None
    planned_meals_count: int = 0


class RecipeDetailDto(RecipeDto):
    used_in_meals: list[MealDto] = []


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
