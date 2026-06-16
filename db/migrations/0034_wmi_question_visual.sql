-- Reusable-explainer-pool binding: { "templateId": string, "params": object }
-- Mirrors the breakdown JSONB column; null for questions with no pooled template.
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS visual JSONB;
