-- Optional ordered solution steps per paper question (mirrors concept hint_steps).
-- Stored as JSONB string arrays, like choices_en/id. Idempotent.
BEGIN;
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS hint_steps_en JSONB;
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS hint_steps_id JSONB;
COMMIT;
