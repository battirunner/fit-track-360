export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  meal_type: MealType | string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  scheduled_time?: string | null;
  completed: boolean;
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
