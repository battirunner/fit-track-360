INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  age,
  sex,
  height_cm,
  goal_weight_kg,
  activity_level,
  medical_notes
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@fittrack.dev',
  '$2b$12$k7GeSARqir3leS1VmHE80uoQjQIj208WSpc6JSXxfAd9pPro6pBwu',
  'Demo Athlete',
  34,
  'male',
  175,
  72,
  'Gym 4 days/week',
  'No known medical notes.'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  age = EXCLUDED.age,
  sex = EXCLUDED.sex,
  height_cm = EXCLUDED.height_cm,
  goal_weight_kg = EXCLUDED.goal_weight_kg,
  activity_level = EXCLUDED.activity_level,
  medical_notes = EXCLUDED.medical_notes;

INSERT INTO body_measurements (
  id,
  user_id,
  measured_on,
  weight_kg,
  waist_cm,
  chest_cm,
  hip_cm,
  arm_cm,
  thigh_cm,
  body_fat_percent,
  notes
)
VALUES (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE,
  70,
  84,
  96,
  94,
  32,
  55,
  22,
  'Initial demo body measurement.'
)
ON CONFLICT (id) DO UPDATE SET
  measured_on = EXCLUDED.measured_on,
  weight_kg = EXCLUDED.weight_kg,
  waist_cm = EXCLUDED.waist_cm,
  chest_cm = EXCLUDED.chest_cm,
  hip_cm = EXCLUDED.hip_cm,
  arm_cm = EXCLUDED.arm_cm,
  thigh_cm = EXCLUDED.thigh_cm,
  body_fat_percent = EXCLUDED.body_fat_percent,
  notes = EXCLUDED.notes;

INSERT INTO blood_pressure_logs (id, user_id, measured_at, systolic, diastolic, pulse, notes)
VALUES
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', now() - INTERVAL '6 days', 122, 80, 72, 'Morning reading'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001', now() - INTERVAL '3 days', 120, 78, 70, 'Morning reading'),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000001', now() - INTERVAL '1 day', 118, 77, 69, 'Morning reading')
ON CONFLICT (id) DO UPDATE SET
  measured_at = EXCLUDED.measured_at,
  systolic = EXCLUDED.systolic,
  diastolic = EXCLUDED.diastolic,
  pulse = EXCLUDED.pulse,
  notes = EXCLUDED.notes;

INSERT INTO meal_plans (id, user_id, title, starts_on)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Balanced Cutting Plan',
  CURRENT_DATE
)
ON CONFLICT DO NOTHING;

INSERT INTO meals (id, meal_plan_id, meal_type, name, calories, protein_g, carbs_g, fat_g, scheduled_time)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'breakfast', 'Greek yogurt, oats, berries', 430, 32, 52, 10, '08:00'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'lunch', 'Chicken rice bowl', 620, 48, 68, 16, '13:00'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'dinner', 'Salmon, potatoes, greens', 590, 42, 46, 22, '19:30')
ON CONFLICT DO NOTHING;

INSERT INTO weight_logs (user_id, weight_kg, logged_on)
VALUES
  ('00000000-0000-0000-0000-000000000001', 78.4, CURRENT_DATE - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000001', 77.9, CURRENT_DATE - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000001', 77.5, CURRENT_DATE - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 77.2, CURRENT_DATE)
ON CONFLICT (user_id, logged_on) DO NOTHING;

INSERT INTO water_logs (id, user_id, amount_ml, logged_at)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 500, now() - INTERVAL '5 hours'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 750, now() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_settings (user_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id) DO NOTHING;
