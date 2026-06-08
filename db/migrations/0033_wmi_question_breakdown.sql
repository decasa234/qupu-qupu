-- Authored problem breakdown (question-designer output) for paper questions.
-- Holds a Breakdown object (highlights / quantities / strategy / trap / answer)
-- rendered by WmiAuthoredBreakdown. Nullable; mirrors hint_steps_*.
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS breakdown JSONB;
