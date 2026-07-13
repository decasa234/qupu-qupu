-- 0049: protect member history from hard video deletes + exam-session index.
--
-- score_attempts / user_badge_unlocks were ON DELETE CASCADE, so a hard
-- DELETE of a video silently destroyed kids' attempt history and badges
-- while their reward_ledger XP survived — dashboards stopped reconciling.
-- RESTRICT makes such a delete fail loudly; videos with history must go
-- through the soft-delete path (videos.deleted_at) instead.

ALTER TABLE score_attempts
  DROP CONSTRAINT score_attempts_video_id_fkey,
  ADD CONSTRAINT score_attempts_video_id_fkey
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE RESTRICT;

ALTER TABLE user_badge_unlocks
  DROP CONSTRAINT user_badge_unlocks_video_id_fkey,
  ADD CONSTRAINT user_badge_unlocks_video_id_fkey
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE RESTRICT;

-- Serves the per-paper best-score join, the resume lookup, and the abandon
-- update, which otherwise seq-scan a table that grows one row per exam.
CREATE INDEX IF NOT EXISTS idx_wmi_exam_sessions_child_paper
  ON wmi_exam_sessions (child_id, paper_id);
