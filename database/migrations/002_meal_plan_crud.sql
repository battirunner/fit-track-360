ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS target_calories_min INT,
  ADD COLUMN IF NOT EXISTS target_calories_max INT,
  ADD COLUMN IF NOT EXISTS target_protein_min INT,
  ADD COLUMN IF NOT EXISTS target_protein_max INT,
  ADD COLUMN IF NOT EXISTS water_goal_ml INT NOT NULL DEFAULT 3000,
  ADD COLUMN IF NOT EXISTS gym_days_per_week INT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

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

ALTER TABLE meals
  ADD COLUMN IF NOT EXISTS planned_on DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE meals
SET planned_on = meal_plans.starts_on
FROM meal_plans
WHERE meals.meal_plan_id = meal_plans.id
  AND meals.planned_on IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_meals_plan_date_type
  ON meals (meal_plan_id, planned_on, meal_type);
