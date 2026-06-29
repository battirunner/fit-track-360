ALTER TABLE users
  ADD COLUMN IF NOT EXISTS age INT,
  ADD COLUMN IF NOT EXISTS sex TEXT,
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS medical_notes TEXT;

CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_on DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5, 2),
  waist_cm NUMERIC(5, 2),
  chest_cm NUMERIC(5, 2),
  hip_cm NUMERIC(5, 2),
  arm_cm NUMERIC(5, 2),
  thigh_cm NUMERIC(5, 2),
  body_fat_percent NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_body_measurements_user_date
  ON body_measurements (user_id, measured_on DESC);

CREATE TABLE IF NOT EXISTS blood_pressure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  systolic INT NOT NULL,
  diastolic INT NOT NULL,
  pulse INT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS ix_blood_pressure_logs_user_time
  ON blood_pressure_logs (user_id, measured_at DESC);
