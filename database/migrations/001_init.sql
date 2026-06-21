CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  height_cm NUMERIC(5, 2),
  goal_weight_kg NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_on DATE NOT NULL,
  ends_on DATE,
  target_calories_min INT,
  target_calories_max INT,
  target_protein_min INT,
  target_protein_max INT,
  water_goal_ml INT NOT NULL DEFAULT 3000,
  gym_days_per_week INT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  planned_on DATE NOT NULL,
  calories INT,
  protein_g NUMERIC(6, 2),
  preparation TEXT,
  water_guidance TEXT,
  notes TEXT,
  UNIQUE (meal_plan_id, planned_on)
);

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  planned_on DATE,
  meal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  calories INT NOT NULL,
  protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  scheduled_time TIME,
  notes TEXT,
  UNIQUE (meal_plan_id, planned_on, meal_type)
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL,
  logged_name TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  logged_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  UNIQUE (user_id, logged_on)
);

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  breakfast_enabled BOOLEAN NOT NULL DEFAULT true,
  lunch_enabled BOOLEAN NOT NULL DEFAULT true,
  dinner_enabled BOOLEAN NOT NULL DEFAULT true,
  gym_enabled BOOLEAN NOT NULL DEFAULT true,
  missing_log_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_review_enabled BOOLEAN NOT NULL DEFAULT true
);
