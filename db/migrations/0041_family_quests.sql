-- 0041_family_quests.sql — "Misi Keluarga" weekly co-op quest (Mythos P2.3)
--
-- One quest per ACCOUNT (parent user) per WIB week (week_start = the WIB
-- Monday, api/lib/wib.ts wibWeek). Created lazily on the family-quest read
-- when the account has >= 2 children; progress is the SUM of every child's
-- reward_ledger xp_delta inside the week — no progress column needed.
--
-- Completion/payout (api/services/gamification/familyQuest.ts) is evaluated
-- lazily on read AND at konsep session commit. rewarded_at is the race gate:
-- it is stamped via UPDATE ... WHERE rewarded_at IS NULL RETURNING, so only
-- one transaction ever pays out — and each child's payout ledger row is
-- keyed deterministicUuid('family-quest:<questId>:<childId>') as
-- belt-and-suspenders (reward_type FAMILY_QUEST_COIN; reward_type is an
-- unconstrained VARCHAR(80), so no DDL is needed for it).
--
-- Idempotent: CREATE TABLE IF NOT EXISTS only.

BEGIN;

CREATE TABLE IF NOT EXISTS family_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_xp INT NOT NULL,
  reward_coins INT NOT NULL,
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

COMMIT;
