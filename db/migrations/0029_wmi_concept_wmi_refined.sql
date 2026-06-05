-- "WMI Refined" flag on concept reviews: marks concepts whose question
-- wording + breakdown + hint_steps have been polished to WMI/olympiad style.
-- Independent of the review status (a concept can be approved AND refined).
ALTER TABLE wmi_concept_reviews
  ADD COLUMN IF NOT EXISTS wmi_refined BOOLEAN NOT NULL DEFAULT FALSE;
