CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  default_unit TEXT NOT NULL DEFAULT 'g',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(8, 2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  UNIQUE (meal_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS ix_meal_ingredients_meal
  ON meal_ingredients (meal_id);

CREATE INDEX IF NOT EXISTS ix_meal_ingredients_ingredient
  ON meal_ingredients (ingredient_id);
