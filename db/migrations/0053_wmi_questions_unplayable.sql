-- Mark past-paper questions a child cannot actually answer, so the drill stops
-- serving them.
--
-- Two kinds exist today:
--   * picture-option questions whose A-E option figures were never built (the
--     originals are lost), so every choice renders as an indistinguishable
--     placeholder like "(A)" / "Gambar A" — unpickable by anyone;
--   * questions the SOURCE PAPER got wrong, e.g. WMI 2023 Final G1 Q14, where
--     two of the printed options both satisfy the stated condition but only one
--     is the official key, so a child reasoning correctly can still be marked
--     wrong.
--
-- NULL means playable, which is the overwhelming majority, so no backfill is
-- needed. The text is the reason, shown to admins in the review UI — a bare
-- boolean would record that a question is hidden but not why, and these two
-- kinds need different fixes (build the figures vs. nothing we can do).
--
-- claireMock.ts already excluded the first kind with a placeholder-text
-- heuristic. That stays as a safety net; this column is the explicit record and
-- is what the drill path filters on.
ALTER TABLE wmi_questions
  ADD COLUMN IF NOT EXISTS unplayable_reason TEXT;

-- Partial index: the filter is `IS NULL` on nearly every row, so only the rare
-- non-null rows are worth indexing for the admin's "what is hidden" view.
CREATE INDEX IF NOT EXISTS idx_wmi_questions_unplayable
  ON wmi_questions(paper_id)
  WHERE unplayable_reason IS NOT NULL;
