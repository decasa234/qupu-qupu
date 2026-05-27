-- WMI Concept Generator (v2).
-- Hybrid schema: new concept tables; reuse wmi_attempts with nullable concept_instance_id.

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_concepts (
  slug              TEXT PRIMARY KEY,
  name_en           TEXT NOT NULL,
  name_id           TEXT NOT NULL,
  description_id    TEXT,
  grades            SMALLINT[] NOT NULL,
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  param_overrides   JSONB,
  total_served      INT NOT NULL DEFAULT 0,
  total_upvotes     INT NOT NULL DEFAULT 0,
  total_downvotes   INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concepts_grades_valid CHECK (
    grades <@ ARRAY[0,1,2,3]::SMALLINT[] AND array_length(grades, 1) > 0
  )
);

CREATE TABLE IF NOT EXISTS wmi_concept_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_slug    TEXT NOT NULL REFERENCES wmi_concepts(slug) ON DELETE CASCADE,
  params          JSONB NOT NULL,
  body_en         TEXT NOT NULL,
  body_id         TEXT NOT NULL,
  answer_type     TEXT NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en      JSONB,
  choices_id      JSONB,
  answer          TEXT NOT NULL,
  hint_en         TEXT,
  hint_id         TEXT,
  served_count    INT NOT NULL DEFAULT 0,
  upvotes         INT NOT NULL DEFAULT 0,
  downvotes       INT NOT NULL DEFAULT 0,
  is_culled       BOOLEAN GENERATED ALWAYS AS (
    (upvotes + downvotes) >= 5
    AND downvotes::numeric / NULLIF(upvotes + downvotes, 0) > 0.5
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_instances_params_unique UNIQUE (concept_slug, params)
);

CREATE INDEX IF NOT EXISTS idx_wmi_concept_instances_serve
  ON wmi_concept_instances (concept_slug, is_culled, served_count)
  WHERE is_culled = FALSE;

CREATE TABLE IF NOT EXISTS wmi_concept_votes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  concept_instance_id UUID NOT NULL REFERENCES wmi_concept_instances(id) ON DELETE CASCADE,
  vote                SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  voted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_concept_votes_kid_instance_unique UNIQUE (child_id, concept_instance_id)
);

CREATE INDEX IF NOT EXISTS idx_wmi_concept_votes_instance
  ON wmi_concept_votes (concept_instance_id);

ALTER TABLE wmi_attempts ALTER COLUMN question_id DROP NOT NULL;

ALTER TABLE wmi_attempts
  ADD COLUMN IF NOT EXISTS concept_instance_id UUID REFERENCES wmi_concept_instances(id) ON DELETE CASCADE;

ALTER TABLE wmi_attempts DROP CONSTRAINT IF EXISTS wmi_attempts_mode_check;
ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_mode_check
  CHECK (mode IN ('drill','exam','concept'));

ALTER TABLE wmi_attempts DROP CONSTRAINT IF EXISTS wmi_attempts_exactly_one_target;
ALTER TABLE wmi_attempts ADD CONSTRAINT wmi_attempts_exactly_one_target
  CHECK (
    (question_id IS NOT NULL AND concept_instance_id IS NULL)
    OR (question_id IS NULL AND concept_instance_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_wmi_attempts_concept_instance
  ON wmi_attempts (concept_instance_id)
  WHERE concept_instance_id IS NOT NULL;

COMMIT;
