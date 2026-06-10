-- 0040_quest_claim_and_chests.sql — quest claim ritual backfill (Mythos P2.2)
--
-- Quests stop auto-granting: completing a quest now ONLY stamps
-- completed_at; the reward pays out on an explicit POST /me/quests/:id/claim
-- (DAILY_QUEST_XP ledger row keyed to the quest instance id — the SAME key
-- the old auto-grant used, so a historical row collides on the ledger UNIQUE
-- and can never double-pay).
--
-- Backfill: every instance completed BEFORE this change was auto-paid at
-- completion time, so it must NOT become claimable again. Stamp claimed_at
-- (status stays as-is — the read path treats claimed_at as the claim truth,
-- and 'completed' vs 'claimed' status both render as done).
--
-- No reward-type DDL needed: reward_ledger.reward_type is an unconstrained
-- VARCHAR(80), so the new CHAPTER_CHEST_XP / SESSION_DROP_COIN rows need no
-- schema change.
--
-- Idempotent: the WHERE clause only matches rows the backfill hasn't touched.

BEGIN;

UPDATE child_quest_instances
   SET claimed_at = COALESCE(completed_at, NOW()),
       updated_at = NOW()
 WHERE completed_at IS NOT NULL
   AND claimed_at IS NULL;

COMMIT;
