WITH demo_user AS (
  SELECT id AS user_id
  FROM users
  WHERE email = 'demo@fittrack.dev'
),
plan_upsert AS (
  INSERT INTO meal_plans (
    id,
    user_id,
    title,
    description,
    starts_on,
    ends_on,
    target_calories_min,
    target_calories_max,
    target_protein_min,
    target_protein_max,
    water_goal_ml,
    gym_days_per_week,
    notes
  )
  SELECT
    '00000000-0000-0000-0000-000000000401',
    user_id,
    'July 2026 Diet Plan V2',
    'Male, 34 years. Height: 163 cm. Start weight: 70 kg. Goal: 63-65 kg.',
    DATE '2026-07-01',
    DATE '2026-07-31',
    1850,
    1950,
    140,
    150,
    3000,
    4,
    'Weekly grocery list: Chicken Breast 2.8kg; Salmon 600g; Tuna 4 cans; Eggs 24; Greek Yogurt 1.8kg; Milk 2L; Oats 500g; Rice 1.5kg; Bananas 7; Apples 5; Oranges 3; Broccoli 600g; Mixed Vegetables 2kg. Expected progress: start 70kg, end of July target 68.5-69kg. Track weight, water intake, meal adherence, gym attendance, steps. If weight does not decrease after 14 days, reduce rice by 30g per lunch.'
  FROM demo_user
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    starts_on = EXCLUDED.starts_on,
    ends_on = EXCLUDED.ends_on,
    target_calories_min = EXCLUDED.target_calories_min,
    target_calories_max = EXCLUDED.target_calories_max,
    target_protein_min = EXCLUDED.target_protein_min,
    target_protein_max = EXCLUDED.target_protein_max,
    water_goal_ml = EXCLUDED.water_goal_ml,
    gym_days_per_week = EXCLUDED.gym_days_per_week,
    notes = EXCLUDED.notes
  RETURNING id
),
days AS (
  SELECT
    '00000000-0000-0000-0000-000000000401'::uuid AS meal_plan_id,
    day::date AS planned_on,
    mod((day::date - DATE '2026-07-01')::int, 7) + 1 AS cycle_day
  FROM generate_series(DATE '2026-07-01', DATE '2026-07-31', INTERVAL '1 day') AS day
),
day_upsert AS (
  INSERT INTO meal_plan_days (
    meal_plan_id,
    planned_on,
    calories,
    protein_g,
    preparation,
    water_guidance
  )
  SELECT
    meal_plan_id,
    planned_on,
    CASE cycle_day
      WHEN 1 THEN 1900
      WHEN 2 THEN 1850
      WHEN 3 THEN 1880
      WHEN 4 THEN 1950
      WHEN 5 THEN 1900
      WHEN 6 THEN 1950
      ELSE 1850
    END,
    CASE cycle_day
      WHEN 1 THEN 145
      WHEN 2 THEN 150
      WHEN 3 THEN 145
      WHEN 4 THEN 145
      WHEN 5 THEN 140
      WHEN 6 THEN 150
      ELSE 145
    END,
    'Meal prep chicken/rice twice weekly. Grill chicken with salt, pepper, paprika. Steam vegetables. Bake salmon at 200C for 15 minutes.',
    '3L minimum: 1L morning, 1L afternoon, 1L evening.'
  FROM days
  ON CONFLICT (meal_plan_id, planned_on) DO UPDATE SET
    calories = EXCLUDED.calories,
    protein_g = EXCLUDED.protein_g,
    preparation = EXCLUDED.preparation,
    water_guidance = EXCLUDED.water_guidance
  RETURNING id
),
meal_source AS (
  SELECT
    meal_plan_id,
    planned_on,
    meal_type,
    name,
    scheduled_time,
    calories,
    protein_g
  FROM days
  CROSS JOIN LATERAL (
    VALUES
      (
        'breakfast',
        CASE cycle_day
          WHEN 1 THEN 'Oats 60g + Milk 250ml + Banana 120g'
          WHEN 2 THEN '3 Eggs + Whole Wheat Bread 60g'
          WHEN 3 THEN 'Oats 60g + Milk 250ml'
          WHEN 4 THEN '4 Eggs + Vegetables'
          WHEN 5 THEN 'Yogurt 250g + Oats 50g'
          WHEN 6 THEN 'Oats 60g + Milk 250ml'
          ELSE '3 Eggs + Bread 60g'
        END,
        TIME '08:00',
        450,
        35
      ),
      (
        'lunch',
        CASE cycle_day
          WHEN 1 THEN 'Chicken 200g + Rice 150g + Broccoli 100g'
          WHEN 2 THEN 'Chicken 220g + Rice 130g + Salad'
          WHEN 3 THEN 'Tuna 150g + Rice 150g + Vegetables'
          WHEN 4 THEN 'Chicken Curry 220g + Rice 150g'
          WHEN 5 THEN 'Chicken 200g + Rice 150g'
          WHEN 6 THEN 'Chicken 220g + Rice 180g'
          ELSE 'Chicken 200g + Rice 150g'
        END,
        TIME '13:00',
        650,
        55
      ),
      (
        'snack',
        CASE cycle_day
          WHEN 1 THEN 'Greek Yogurt 200g + Apple'
          WHEN 2 THEN 'Yogurt 200g'
          WHEN 3 THEN '2 Eggs + Orange'
          WHEN 4 THEN 'Banana'
          WHEN 5 THEN 'Apple + 2 Eggs'
          WHEN 6 THEN 'Yogurt 200g'
          ELSE 'Yogurt 200g'
        END,
        TIME '16:30',
        250,
        20
      ),
      (
        'dinner',
        CASE cycle_day
          WHEN 1 THEN 'Salmon 180g + Vegetables 250g'
          WHEN 2 THEN 'Chicken Stir Fry 200g + Vegetables'
          WHEN 3 THEN 'Chicken 220g + Salad'
          WHEN 4 THEN 'Salmon 200g + Broccoli'
          WHEN 5 THEN 'Beef 150g + Vegetables'
          WHEN 6 THEN 'Chicken 200g + Vegetables'
          ELSE 'Tuna 150g + Salad'
        END,
        TIME '19:30',
        550,
        35
      )
  ) meal(meal_type, name, scheduled_time, calories, protein_g)
)
INSERT INTO meals (
  meal_plan_id,
  planned_on,
  meal_type,
  name,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  scheduled_time,
  notes
)
SELECT
  meal_plan_id,
  planned_on,
  meal_type,
  name,
  calories,
  protein_g,
  0,
  0,
  scheduled_time,
  'Seeded from July_2026_Diet_Plan_V2.docx'
FROM meal_source
ON CONFLICT (meal_plan_id, planned_on, meal_type) DO UPDATE SET
  name = EXCLUDED.name,
  calories = EXCLUDED.calories,
  protein_g = EXCLUDED.protein_g,
  carbs_g = EXCLUDED.carbs_g,
  fat_g = EXCLUDED.fat_g,
  scheduled_time = EXCLUDED.scheduled_time,
  notes = EXCLUDED.notes;

INSERT INTO ingredients (name, category, default_unit)
VALUES
  ('Apple', 'fruit', 'piece'),
  ('Banana', 'fruit', 'piece'),
  ('Beef', 'protein', 'g'),
  ('Bread', 'grain', 'g'),
  ('Broccoli', 'vegetable', 'g'),
  ('Chicken', 'protein', 'g'),
  ('Curry Sauce', 'pantry', 'serving'),
  ('Eggs', 'protein', 'piece'),
  ('Greek Yogurt', 'dairy', 'g'),
  ('Milk', 'dairy', 'ml'),
  ('Oats', 'grain', 'g'),
  ('Orange', 'fruit', 'piece'),
  ('Rice', 'grain', 'g'),
  ('Salad', 'vegetable', 'serving'),
  ('Salmon', 'protein', 'g'),
  ('Tuna', 'protein', 'g'),
  ('Vegetables', 'vegetable', 'g'),
  ('Yogurt', 'dairy', 'g')
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  default_unit = EXCLUDED.default_unit;

WITH days AS (
  SELECT
    day::date AS planned_on,
    mod((day::date - DATE '2026-07-01')::int, 7) + 1 AS cycle_day
  FROM generate_series(DATE '2026-07-01', DATE '2026-07-31', INTERVAL '1 day') AS day
),
ingredient_source AS (
  SELECT planned_on, meal_type, ingredient_name, quantity, unit
  FROM days
  CROSS JOIN LATERAL (
    VALUES
      ('breakfast', 'Oats', CASE WHEN cycle_day IN (1, 3, 6) THEN 60 WHEN cycle_day = 5 THEN 50 END::numeric, 'g'),
      ('breakfast', 'Milk', CASE WHEN cycle_day IN (1, 3, 6) THEN 250 END::numeric, 'ml'),
      ('breakfast', 'Banana', CASE WHEN cycle_day = 1 THEN 120 END::numeric, 'g'),
      ('breakfast', 'Eggs', CASE WHEN cycle_day IN (2, 7) THEN 3 WHEN cycle_day = 4 THEN 4 END::numeric, 'piece'),
      ('breakfast', 'Bread', CASE WHEN cycle_day IN (2, 7) THEN 60 END::numeric, 'g'),
      ('breakfast', 'Vegetables', CASE WHEN cycle_day = 4 THEN 150 END::numeric, 'g'),
      ('breakfast', 'Yogurt', CASE WHEN cycle_day = 5 THEN 250 END::numeric, 'g'),
      ('lunch', 'Chicken', CASE WHEN cycle_day IN (1, 5, 7) THEN 200 WHEN cycle_day IN (2, 4, 6) THEN 220 END::numeric, 'g'),
      ('lunch', 'Rice', CASE WHEN cycle_day IN (1, 3, 4, 5, 7) THEN 150 WHEN cycle_day = 2 THEN 130 WHEN cycle_day = 6 THEN 180 END::numeric, 'g'),
      ('lunch', 'Broccoli', CASE WHEN cycle_day = 1 THEN 100 END::numeric, 'g'),
      ('lunch', 'Salad', CASE WHEN cycle_day = 2 THEN 1 END::numeric, 'serving'),
      ('lunch', 'Tuna', CASE WHEN cycle_day = 3 THEN 150 END::numeric, 'g'),
      ('lunch', 'Vegetables', CASE WHEN cycle_day = 3 THEN 200 END::numeric, 'g'),
      ('lunch', 'Curry Sauce', CASE WHEN cycle_day = 4 THEN 1 END::numeric, 'serving'),
      ('snack', 'Greek Yogurt', CASE WHEN cycle_day = 1 THEN 200 END::numeric, 'g'),
      ('snack', 'Apple', CASE WHEN cycle_day IN (1, 5) THEN 1 END::numeric, 'piece'),
      ('snack', 'Yogurt', CASE WHEN cycle_day IN (2, 6, 7) THEN 200 END::numeric, 'g'),
      ('snack', 'Eggs', CASE WHEN cycle_day IN (3, 5) THEN 2 END::numeric, 'piece'),
      ('snack', 'Orange', CASE WHEN cycle_day = 3 THEN 1 END::numeric, 'piece'),
      ('snack', 'Banana', CASE WHEN cycle_day = 4 THEN 1 END::numeric, 'piece'),
      ('dinner', 'Salmon', CASE WHEN cycle_day = 1 THEN 180 WHEN cycle_day = 4 THEN 200 END::numeric, 'g'),
      ('dinner', 'Vegetables', CASE WHEN cycle_day IN (1, 2, 5, 6) THEN 250 END::numeric, 'g'),
      ('dinner', 'Chicken', CASE WHEN cycle_day = 2 THEN 200 WHEN cycle_day = 3 THEN 220 WHEN cycle_day = 6 THEN 200 END::numeric, 'g'),
      ('dinner', 'Salad', CASE WHEN cycle_day IN (3, 7) THEN 1 END::numeric, 'serving'),
      ('dinner', 'Broccoli', CASE WHEN cycle_day = 4 THEN 150 END::numeric, 'g'),
      ('dinner', 'Beef', CASE WHEN cycle_day = 5 THEN 150 END::numeric, 'g'),
      ('dinner', 'Tuna', CASE WHEN cycle_day = 7 THEN 150 END::numeric, 'g')
  ) item(meal_type, ingredient_name, quantity, unit)
  WHERE quantity IS NOT NULL
)
INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit)
SELECT
  meals.id,
  ingredients.id,
  ingredient_source.quantity,
  ingredient_source.unit
FROM ingredient_source
JOIN meals
  ON meals.meal_plan_id = '00000000-0000-0000-0000-000000000401'
  AND meals.planned_on = ingredient_source.planned_on
  AND meals.meal_type = ingredient_source.meal_type
JOIN ingredients
  ON ingredients.name = ingredient_source.ingredient_name
ON CONFLICT (meal_id, ingredient_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit;
