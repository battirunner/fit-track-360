export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  meal_plan_id?: string | null;
  planned_on?: string | null;
  meal_type: MealType | string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  scheduled_time?: string | null;
  notes?: string | null;
  completed: boolean;
};

export type MealPlan = {
  id: string;
  title: string;
  description?: string | null;
  starts_on: string;
  ends_on?: string | null;
  target_calories_min?: number | null;
  target_calories_max?: number | null;
  target_protein_min?: number | null;
  target_protein_max?: number | null;
  water_goal_ml: number;
  gym_days_per_week?: number | null;
  notes?: string | null;
  meals_count: number;
};

export type MealPlanDay = {
  planned_on: string;
  calories?: number | null;
  protein_g?: number | null;
  preparation?: string | null;
  water_guidance?: string | null;
  notes?: string | null;
};

export type MealPlanDetail = MealPlan & {
  days: MealPlanDay[];
  meals: Meal[];
};

export type WeightLog = {
  logged_on: string;
  weight_kg: number;
};

export type DashboardSummary = {
  user: string;
  meals_completed: number;
  meals_total: number;
  water_ml: number;
  water_goal_ml: number;
  gym_status: "not_checked_in" | "checked_in" | "completed" | string;
  latest_weight_kg: number;
  monthly_score: number;
  weight_trend: WeightLog[];
};
