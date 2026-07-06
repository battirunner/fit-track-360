ALTER TABLE meal_logs
  ADD COLUMN IF NOT EXISTS logged_on DATE;

UPDATE meal_logs
SET logged_on = (logged_at AT TIME ZONE 'Asia/Tokyo')::date
WHERE logged_on IS NULL;

ALTER TABLE meal_logs
  ALTER COLUMN logged_on SET DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS ix_meal_logs_user_logged_on
  ON meal_logs (user_id, logged_on);
