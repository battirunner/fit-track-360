import type { DashboardSummary, Meal, WeightLog } from "@fittrack/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 20 }
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const fallbackSummary: DashboardSummary = {
  user: "Demo Athlete",
  meals_completed: 1,
  meals_total: 3,
  water_ml: 1250,
  water_goal_ml: 3000,
  gym_status: "not_checked_in",
  latest_weight_kg: 77.2,
  monthly_score: 78,
  weight_trend: [
    { logged_on: "Mon", weight_kg: 78.4 },
    { logged_on: "Wed", weight_kg: 77.9 },
    { logged_on: "Fri", weight_kg: 77.5 },
    { logged_on: "Today", weight_kg: 77.2 }
  ]
};

export const fallbackMeals: Meal[] = [
  {
    id: "breakfast",
    meal_type: "breakfast",
    name: "Greek yogurt, oats, berries",
    calories: 430,
    protein_g: 32,
    carbs_g: 52,
    fat_g: 10,
    scheduled_time: "08:00",
    completed: true
  },
  {
    id: "lunch",
    meal_type: "lunch",
    name: "Chicken rice bowl",
    calories: 620,
    protein_g: 48,
    carbs_g: 68,
    fat_g: 16,
    scheduled_time: "13:00",
    completed: false
  },
  {
    id: "dinner",
    meal_type: "dinner",
    name: "Salmon, potatoes, greens",
    calories: 590,
    protein_g: 42,
    carbs_g: 46,
    fat_g: 22,
    scheduled_time: "19:30",
    completed: false
  }
];

export function getDashboardSummary() {
  return getJson<DashboardSummary>("/api/v1/dashboard/summary", fallbackSummary);
}

export function getTodayMeals() {
  return getJson<Meal[]>("/api/v1/meals/today", fallbackMeals);
}

export function getWeightLogs() {
  return getJson<WeightLog[]>("/api/v1/weight", fallbackSummary.weight_trend);
}
