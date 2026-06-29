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

export type GroceryListItem = {
  ingredient_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
};

export type GroceryList = {
  plan_id: string;
  start_on: string;
  end_on: string;
  items: GroceryListItem[];
};

export type WeightLog = {
  logged_on: string;
  weight_kg: number;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  age?: number | null;
  sex?: string | null;
  height_cm?: number | null;
  goal_weight_kg?: number | null;
  activity_level?: string | null;
  medical_notes?: string | null;
};

export type BodyMeasurement = {
  id: string;
  measured_on: string;
  weight_kg?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  hip_cm?: number | null;
  arm_cm?: number | null;
  thigh_cm?: number | null;
  body_fat_percent?: number | null;
  notes?: string | null;
};

export type BloodPressureLog = {
  id: string;
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  notes?: string | null;
};

export type BloodPressureAverage = {
  systolic?: number | null;
  diastolic?: number | null;
  pulse?: number | null;
  count: number;
};

export type ProfileOverview = {
  user: UserProfile;
  latest_measurement?: BodyMeasurement | null;
  measurements: BodyMeasurement[];
  blood_pressure_logs: BloodPressureLog[];
  blood_pressure_average_last_7_days: BloodPressureAverage;
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
