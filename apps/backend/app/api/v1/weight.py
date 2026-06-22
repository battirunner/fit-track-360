from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User, WeightLog
from app.schemas.dto import WeightLogDto, WeightLogRequest

router = APIRouter()


@router.get("", response_model=list[WeightLogDto])
def weights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[WeightLogDto]:
    rows = db.scalars(
        select(WeightLog)
        .where(WeightLog.user_id == user.id)
        .order_by(WeightLog.logged_on.asc())
        .limit(90)
    ).all()
    return [WeightLogDto(logged_on=row.logged_on, weight_kg=float(row.weight_kg)) for row in rows]


@router.post("", response_model=WeightLogDto)
def add_weight(
    payload: WeightLogRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeightLogDto:
    logged_on = payload.logged_on or date.today()
    statement = (
        insert(WeightLog)
        .values(
            user_id=user.id,
            weight_kg=payload.weight_kg,
            logged_on=logged_on,
            notes=payload.notes,
        )
        .on_conflict_do_update(
            index_elements=[WeightLog.user_id, WeightLog.logged_on],
            set_={"weight_kg": payload.weight_kg, "notes": payload.notes},
        )
    )
    db.execute(statement)
    db.commit()
    return WeightLogDto(weight_kg=payload.weight_kg, logged_on=logged_on)
