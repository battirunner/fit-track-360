import type {
  DashboardSummary,
  GroceryList,
  Meal,
  MealPlan,
  MealPlanDetail,
  ProfileOverview,
  Recipe,
  RecipeDetail,
  WeightLog
} from "@fittrack/shared-types";

const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return CONFIGURED_API_BASE_URL;
  }

  try {
    const url = new URL(CONFIGURED_API_BASE_URL);
    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return CONFIGURED_API_BASE_URL;
  }

  return CONFIGURED_API_BASE_URL;
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
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

export async function postJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  token?: string
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof error.detail === "string" ? error.detail : "Request failed");
  }

  return (await response.json()) as TResponse;
}

export async function putJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  token?: string
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof error.detail === "string" ? error.detail : "Request failed");
  }

  return (await response.json()) as TResponse;
}

export async function deleteJson<TResponse>(path: string, token?: string): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof error.detail === "string" ? error.detail : "Request failed");
  }

  return (await response.json()) as TResponse;
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

export const fallbackProfile: ProfileOverview = {
  user: {
    id: "demo",
    email: "demo@fittrack.dev",
    full_name: "Demo Athlete",
    age: 34,
    sex: "male",
    height_cm: 175,
    goal_weight_kg: 72,
    activity_level: "Gym 4 days/week",
    medical_notes: "No known medical notes."
  },
  latest_measurement: {
    id: "measurement-demo",
    measured_on: new Date().toISOString().slice(0, 10),
    weight_kg: 70,
    waist_cm: 84,
    chest_cm: 96,
    hip_cm: 94,
    arm_cm: 32,
    thigh_cm: 55,
    body_fat_percent: 22,
    notes: "Initial demo body measurement."
  },
  measurements: [
    {
      id: "measurement-demo",
      measured_on: new Date().toISOString().slice(0, 10),
      weight_kg: 70,
      waist_cm: 84,
      chest_cm: 96,
      hip_cm: 94,
      arm_cm: 32,
      thigh_cm: 55,
      body_fat_percent: 22,
      notes: "Initial demo body measurement."
    }
  ],
  blood_pressure_logs: [
    {
      id: "bp-demo",
      measured_at: new Date().toISOString(),
      systolic: 120,
      diastolic: 78,
      pulse: 70,
      notes: "Morning reading"
    }
  ],
  blood_pressure_average_last_7_days: {
    systolic: 120,
    diastolic: 78,
    pulse: 70,
    count: 1
  }
};

export function getDashboardSummary() {
  return getJson<DashboardSummary>("/api/v1/dashboard/summary", fallbackSummary);
}

export function getTodayMeals() {
  return getJson<Meal[]>("/api/v1/meals/today", fallbackMeals);
}

export function getMealPlans() {
  return getJson<MealPlan[]>("/api/v1/meals/plans", []);
}

export function getMealPlan(planId: string) {
  return getJson<MealPlanDetail | null>(`/api/v1/meals/plans/${planId}`, null);
}

export function getGroceryList(planId: string, startOn: string, endOn: string) {
  const params = new URLSearchParams({ start_on: startOn, end_on: endOn });
  return getJson<GroceryList>(
    `/api/v1/meals/plans/${planId}/grocery-list?${params.toString()}`,
    { plan_id: planId, start_on: startOn, end_on: endOn, items: [] }
  );
}

export function getRecipes() {
  return getJson<Recipe[]>("/api/v1/recipes", []);
}

export function getRecipe(recipeId: string) {
  return getJson<RecipeDetail | null>(`/api/v1/recipes/${recipeId}`, null);
}

export function getWeightLogs() {
  return getJson<WeightLog[]>("/api/v1/weight", fallbackSummary.weight_trend);
}

export function getProfileOverview() {
  return getJson<ProfileOverview>("/api/v1/profile", fallbackProfile);
}

export function getMonthlyDashboard() {
  return getJson("/api/v1/dashboard/monthly", {
    meal_compliance: 0,
    gym_attendance: 0,
    water_average_ml: 0,
    weight_change_kg: 0,
    score: 0
  });
}
