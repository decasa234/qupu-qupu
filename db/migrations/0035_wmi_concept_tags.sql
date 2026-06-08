-- 0035_wmi_concept_tags.sql — topic tags on concepts (many-to-many, controlled vocab)
ALTER TABLE wmi_concepts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::text[];
CREATE INDEX IF NOT EXISTS wmi_concepts_tags_gin ON wmi_concepts USING GIN (tags);
