from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import BloodPressureLog, BodyMeasurement, User
from app.schemas.dto import (
    BloodPressureAverageDto,
    BloodPressureDto,
    BloodPressureRequest,
    BodyMeasurementDto,
    BodyMeasurementRequest,
    ProfileOverviewDto,
    ProfileUpdateRequest,
    UserProfile,
)

router = APIRouter()


def to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


def user_to_dto(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        age=user.age,
        sex=user.sex,
        height_cm=to_float(user.height_cm),
        goal_weight_kg=to_float(user.goal_weight_kg),
        activity_level=user.activity_level,
        medical_notes=user.medical_notes,
    )


def measurement_to_dto(row: BodyMeasurement) -> BodyMeasurementDto:
    return BodyMeasurementDto(
        id=row.id,
        measured_on=row.measured_on,
        weight_kg=to_float(row.weight_kg),
        waist_cm=to_float(row.waist_cm),
        chest_cm=to_float(row.chest_cm),
        hip_cm=to_float(row.hip_cm),
        arm_cm=to_float(row.arm_cm),
        thigh_cm=to_float(row.thigh_cm),
        body_fat_percent=to_float(row.body_fat_percent),
        notes=row.notes,
    )


def blood_pressure_to_dto(row: BloodPressureLog) -> BloodPressureDto:
    return BloodPressureDto(
        id=row.id,
        measured_at=row.measured_at,
        systolic=row.systolic,
        diastolic=row.diastolic,
        pulse=row.pulse,
        notes=row.notes,
    )


def get_measurement_or_404(
    measurement_id: UUID,
    user: User,
    db: Session,
) -> BodyMeasurement:
    measurement = db.scalar(
        select(BodyMeasurement).where(
            BodyMeasurement.id == measurement_id,
            BodyMeasurement.user_id == user.id,
        )
    )
    if not measurement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")
    return measurement


def get_blood_pressure_or_404(
    log_id: UUID,
    user: User,
    db: Session,
) -> BloodPressureLog:
    log = db.scalar(
        select(BloodPressureLog).where(
            BloodPressureLog.id == log_id,
            BloodPressureLog.user_id == user.id,
        )
    )
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood pressure log not found",
        )
    return log


def build_overview(user: User, db: Session) -> ProfileOverviewDto:
    measurements = db.scalars(
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == user.id)
        .order_by(BodyMeasurement.measured_on.desc(), BodyMeasurement.created_at.desc())
        .limit(20)
    ).all()
    blood_pressure_logs = db.scalars(
        select(BloodPressureLog)
        .where(BloodPressureLog.user_id == user.id)
        .order_by(BloodPressureLog.measured_at.desc())
        .limit(20)
    ).all()

    week_start = datetime.now(UTC) - timedelta(days=7)
    average = db.execute(
        select(
            func.avg(BloodPressureLog.systolic),
            func.avg(BloodPressureLog.diastolic),
            func.avg(BloodPressureLog.pulse),
            func.count(BloodPressureLog.id),
        ).where(
            BloodPressureLog.user_id == user.id,
            BloodPressureLog.measured_at >= week_start,
        )
    ).one()

    return ProfileOverviewDto(
        user=user_to_dto(user),
        latest_measurement=measurement_to_dto(measurements[0]) if measurements else None,
        measurements=[measurement_to_dto(row) for row in measurements],
        blood_pressure_logs=[blood_pressure_to_dto(row) for row in blood_pressure_logs],
        blood_pressure_average_last_7_days=BloodPressureAverageDto(
            systolic=round(float(average[0]), 1) if average[0] is not None else None,
            diastolic=round(float(average[1]), 1) if average[1] is not None else None,
            pulse=round(float(average[2]), 1) if average[2] is not None else None,
            count=average[3],
        ),
    )


@router.get("", response_model=ProfileOverviewDto)
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOverviewDto:
    return build_overview(user, db)


@router.put("", response_model=ProfileOverviewDto)
def update_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOverviewDto:
    user.full_name = payload.full_name
    user.age = payload.age
    user.sex = payload.sex
    user.height_cm = payload.height_cm
    user.goal_weight_kg = payload.goal_weight_kg
    user.activity_level = payload.activity_level
    user.medical_notes = payload.medical_notes
    db.commit()
    db.refresh(user)
    return build_overview(user, db)


@router.delete("", response_model=ProfileOverviewDto)
def clear_optional_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOverviewDto:
    user.age = None
    user.sex = None
    user.height_cm = None
    user.goal_weight_kg = None
    user.activity_level = None
    user.medical_notes = None
    db.commit()
    db.refresh(user)
    return build_overview(user, db)


@router.post("/measurements", response_model=BodyMeasurementDto)
def create_measurement(
    payload: BodyMeasurementRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurementDto:
    row = BodyMeasurement(
        user_id=user.id,
        measured_on=payload.measured_on or date.today(),
        weight_kg=payload.weight_kg,
        waist_cm=payload.waist_cm,
        chest_cm=payload.chest_cm,
        hip_cm=payload.hip_cm,
        arm_cm=payload.arm_cm,
        thigh_cm=payload.thigh_cm,
        body_fat_percent=payload.body_fat_percent,
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return measurement_to_dto(row)


@router.put("/measurements/{measurement_id}", response_model=BodyMeasurementDto)
def update_measurement(
    measurement_id: UUID,
    payload: BodyMeasurementRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurementDto:
    row = get_measurement_or_404(measurement_id, user, db)
    row.measured_on = payload.measured_on or row.measured_on
    row.weight_kg = payload.weight_kg
    row.waist_cm = payload.waist_cm
    row.chest_cm = payload.chest_cm
    row.hip_cm = payload.hip_cm
    row.arm_cm = payload.arm_cm
    row.thigh_cm = payload.thigh_cm
    row.body_fat_percent = payload.body_fat_percent
    row.notes = payload.notes
    db.commit()
    db.refresh(row)
    return measurement_to_dto(row)


@router.delete("/measurements/{measurement_id}")
def delete_measurement(
    measurement_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    row = get_measurement_or_404(measurement_id, user, db)
    db.delete(row)
    db.commit()
    return {"deleted": True}


@router.post("/blood-pressure", response_model=BloodPressureDto)
def create_blood_pressure(
    payload: BloodPressureRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BloodPressureDto:
    row = BloodPressureLog(
        user_id=user.id,
        measured_at=payload.measured_at or datetime.now(UTC),
        systolic=payload.systolic,
        diastolic=payload.diastolic,
        pulse=payload.pulse,
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return blood_pressure_to_dto(row)


@router.put("/blood-pressure/{log_id}", response_model=BloodPressureDto)
def update_blood_pressure(
    log_id: UUID,
    payload: BloodPressureRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BloodPressureDto:
    row = get_blood_pressure_or_404(log_id, user, db)
    row.measured_at = payload.measured_at or row.measured_at
    row.systolic = payload.systolic
    row.diastolic = payload.diastolic
    row.pulse = payload.pulse
    row.notes = payload.notes
    db.commit()
    db.refresh(row)
    return blood_pressure_to_dto(row)


@router.delete("/blood-pressure/{log_id}")
def delete_blood_pressure(
    log_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    row = get_blood_pressure_or_404(log_id, user, db)
    db.delete(row)
    db.commit()
    return {"deleted": True}
