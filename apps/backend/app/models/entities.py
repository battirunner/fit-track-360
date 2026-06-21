from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    full_name: Mapped[str] = mapped_column(String)
    height_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    goal_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text)
    starts_on: Mapped[date] = mapped_column(Date)
    ends_on: Mapped[date | None] = mapped_column(Date)
    target_calories_min: Mapped[int | None] = mapped_column(Integer)
    target_calories_max: Mapped[int | None] = mapped_column(Integer)
    target_protein_min: Mapped[int | None] = mapped_column(Integer)
    target_protein_max: Mapped[int | None] = mapped_column(Integer)
    water_goal_ml: Mapped[int] = mapped_column(Integer, default=3000)
    gym_days_per_week: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)


class MealPlanDay(Base):
    __tablename__ = "meal_plan_days"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    meal_plan_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("meal_plans.id"))
    planned_on: Mapped[date] = mapped_column(Date)
    calories: Mapped[int | None] = mapped_column(Integer)
    protein_g: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    preparation: Mapped[str | None] = mapped_column(Text)
    water_guidance: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    meal_plan_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("meal_plans.id"))
    planned_on: Mapped[date | None] = mapped_column(Date)
    meal_type: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    calories: Mapped[int] = mapped_column(Integer)
    protein_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    carbs_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    fat_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    scheduled_time: Mapped[time | None] = mapped_column(Time)
    notes: Mapped[str | None] = mapped_column(Text)


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("users.id"))
    meal_id: Mapped[UUID | None] = mapped_column(PgUUID(as_uuid=True), ForeignKey("meals.id"))
    meal_type: Mapped[str] = mapped_column(String)
    logged_name: Mapped[str | None] = mapped_column(String)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class GymSession(Base):
    __tablename__ = "gym_sessions"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("users.id"))
    checked_in_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    checked_out_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("users.id"))
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    logged_on: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)


class WaterLog(Base):
    __tablename__ = "water_logs"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("users.id"))
    amount_ml: Mapped[int] = mapped_column(Integer)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
