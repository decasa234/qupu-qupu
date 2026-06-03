ALTER TABLE wmi_concept_instances
  ADD COLUMN IF NOT EXISTS hint_steps_en JSONB,
  ADD COLUMN IF NOT EXISTS hint_steps_id JSONB;
