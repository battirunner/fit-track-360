INSERT INTO users (id, email, password_hash, full_name, height_cm, goal_weight_kg)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@fittrack.dev',
  '$2b$12$k7GeSARqir3leS1VmHE80uoQjQIj208WSpc6JSXxfAd9pPro6pBwu',
  'Demo Athlete',
  175,
  72
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  height_cm = EXCLUDED.height_cm,
  goal_weight_kg = EXCLUDED.goal_weight_kg;

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
