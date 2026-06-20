from datetime import date, datetime, time, timedelta

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

TODAY_MEALS = [
    {
        "id": "00000000-0000-0000-0000-000000000201",
        "meal_type": "breakfast",
        "name": "Greek yogurt, oats, berries",
        "calories": 430,
        "protein_g": 32,
        "carbs_g": 52,
        "fat_g": 10,
        "scheduled_time": time(8, 0),
        "completed": True,
    },
    {
        "id": "00000000-0000-0000-0000-000000000202",
        "meal_type": "lunch",
        "name": "Chicken rice bowl",
        "calories": 620,
        "protein_g": 48,
        "carbs_g": 68,
        "fat_g": 16,
        "scheduled_time": time(13, 0),
        "completed": False,
    },
    {
        "id": "00000000-0000-0000-0000-000000000203",
        "meal_type": "dinner",
        "name": "Salmon, potatoes, greens",
        "calories": 590,
        "protein_g": 42,
        "carbs_g": 46,
        "fat_g": 22,
        "scheduled_time": time(19, 30),
        "completed": False,
    },
]


def demo_weight_trend() -> list[dict[str, object]]:
    return [
        {"logged_on": date.today() - timedelta(days=6), "weight_kg": 78.4},
        {"logged_on": date.today() - timedelta(days=4), "weight_kg": 77.9},
        {"logged_on": date.today() - timedelta(days=2), "weight_kg": 77.5},
        {"logged_on": date.today(), "weight_kg": 77.2},
    ]


def demo_dashboard() -> dict[str, object]:
    return {
        "user": "Demo Athlete",
        "meals_completed": 1,
        "meals_total": 3,
        "water_ml": 1250,
        "water_goal_ml": 3000,
        "gym_status": "not_checked_in",
        "latest_weight_kg": 77.2,
        "monthly_score": 78,
        "weight_trend": demo_weight_trend(),
    }


def demo_gym_session() -> dict[str, object]:
    return {
        "id": "demo-session",
        "checked_in_at": datetime.now().isoformat(),
        "checked_out_at": None,
        "notes": "Demo check-in",
    }
