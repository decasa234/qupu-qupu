# Mythos P2 — Compounding Loop Depth + Hardening

**Date:** 2026-06-09 · **Branch:** `claude-mythos-optimization` (continues P0/P1) · **Status:** Building
**Source:** P2 table of `docs/audits/2026-06-09-e2e-gap-audit.md` + deferred review notes.

## P2.1 Mastery-scaled XP + tier-up bonuses (the founder's original "XP = growth" rule)
Flat +5 XP forever is farmable and anti-mastery. New economy (single source in `gamification/concept.ts`, used by BOTH drill and session paths):
- Per-correct XP scales DOWN with the concept's `best_tier` (read from `wmi_concept_progress` in the same tx): tier 0-1 → 5 XP, tier 2 → 4, tier 3 (Mahir) → 2, tier 4 (Dikuasai) → 1 (never zero — kindness floor). Coins follow the same curve (tier 0-1 → 1 coin, above → 1; coins stay flat — coins are the spend currency, XP is the growth signal).
- **Tier-up bonus**: the moment a concept crosses a tier, a one-time ledger-idempotent bonus (source `tier-up:<child>:<slug>:<tier>`): Berlatih +5, Mahir +20, Dikuasai +40 XP (+5/10 coins at Mahir/Dikuasai). Surfaced in the ceremony's growth beat ("+20 XP — Mahir!").
- Update stale "+5 XP" copy to "XP tiap jawaban benar — makin baru konsepnya, makin besar XP-nya" or dynamic.
- Tests: pure curve function + tier-up idempotency (skip-convention DB test).

## P2.2 Checkpoint chests + quest claim ritual + variable session drop
- **Chapter chests**: per (child, chapter): crossing 50% and 100% grown (grownCount/total) grants a chest — ledger-idempotent (`chest:<child>:<subjectKey>:<50|100>`), 50% → +15 coins, 100% → +40 coins +20 XP. Computed at session commit (cheap: garden math already in reach) and surfaced as a ceremony beat ("Peti Bab terbuka!") + a chest icon on the chapter card at thresholds.
- **Quest claim ritual**: quests stop auto-granting; completion marks `completed`; rewards grant on an explicit `POST /me/quests/:id/claim` (ledger-idempotent on the quest instance id; `claimed_at` stamped). DailyQuestsPanel: completed-unclaimed quests show a bouncing "Klaim" button → coin/XP fly + strip patch. Auto-grant removal must be backward-safe: instances completed BEFORE this change (already paid) are treated as claimed (backfill claimed_at where a ledger row exists — migration).
- **Variable session drop**: every completed session's ceremony ends with a tiny chest: random 2-6 coins (server-rolled at commit, stored in the result, ledger source = sessionId) — variable reward without punishing anyone.

## P2.3 Sibling leaderboard + Misi Keluarga (COPPA-safe, account-private)
- `GET /me/family/leaderboard?childId` → this account's children ranked by weekly XP (ledger sum, WIB week); render on Dashboard (and Me) as "Papan Keluarga" — only when ≥2 children; friendly framing (crown on leader, no shaming copy).
- **Misi Keluarga**: one weekly co-op quest per account (e.g. "Kumpulkan 300 XP bersama minggu ini") — new `family_quests` table (account-scoped, weekly window, target, progress = sum of children's weekly XP, reward: coins to EVERY child on completion, ledger-idempotent per child). Evaluated lazily on read + at session commit. Panel under the leaderboard.

## P2.4 Level unlocks + achievement extensions
- Avatar items gated by level: extend the avatar catalog (`AvatarEditor` source) with `minLevel` per icon/color (a few aspirational ones at levels 5/10/15/20); locked items show a lock + "Level N" chip. Profile level from the gamification store.
- Shop: 1-2 exclusive cosmetic SKUs gated by level (serve-side filter + UI lock state) — only if a deliverable cosmetic exists; otherwise gate avatar items only (do NOT reintroduce stub goods).
- Achievements: `streak_100`, `garden_10_mahir` (10 plants ≥Mahir), `first_gold_chapter` (a chapter 100% grown) — evaluator extensions + 0040 seeds.

## P2.5 Parent notification channel (Resend now, WhatsApp-ready)
- `api/services/notifications/`: provider abstraction (`sendParentNotification(parent, template, data)`), Resend email implementation (templates: Indonesian, kid-warm but parent-addressed); WhatsApp provider INTERFACE stubbed behind `WHATSAPP_PROVIDER`/env (Fonnte-shaped; not active without keys).
- Daily cron route (`GET /api/cron/notifications`, guarded by `CRON_SECRET` — follow the repo's existing cron auth convention if one exists): (a) **streak-at-risk**: children with `current_streak_days >= 3` whose last_activity_date == yesterday WIB and no activity today by send time → one email per parent ("Streak X hari [nama] tinggal beberapa jam lagi!"); (b) **weekly digest** (Mondays): per parent, last week's XP/sessions/concepts grown per child. Idempotent per (parent, type, WIB date) via a `notification_log` table (0040). Opt-out: `users.notify_email BOOLEAN DEFAULT TRUE` + a toggle on Me ("Email pengingat & rangkuman").
- `vercel.json` cron entry (daily, evening WIB).

## P2.6 Hardening + polish
- Rate-limit `/api/public/*` + `/api/meta` (reuse `api/lib/rateLimit.ts`, generous limits, per-IP) + short server-side cache where trivially safe.
- CORS: dev-reflect only when `NODE_ENV === 'development'` explicitly (not "not production").
- Assets: delete `public/hero-mascot_bak.png`; recompress oversized mascots (sips/ImageMagick if available — measure before/after; keep originals' dimensions sane); fix Fredoka double-load (link + @import); W7 reference explainer Baloo→Fredoka; update the global `qupu-ui` skill file (~/.claude/skills/qupu-ui/SKILL.md) Baloo→Fredoka note.
- CI: GitHub Actions workflow (check + lint + test, no DB) if `.github/workflows` absent.

## P2.7 Exam-stack UX
- Exam exit confirm + resume (open-session detection via `completed_at IS NULL` exists); restyle the legacy exam screens to the member brand kit (cards/pills/typography only — no flow redesign); **sticky language preference**: per-child `questionLang` persisted (wmi-prefs map) and honored as WmiQuestionView's initial lang everywhere (the per-question EN reset stays available via toggle; telemetry `revealed_id_translation` semantics preserved — record reveal only when the kid switches EN→ID on an EN-default question; if default is ID, no reveal event).

## Out of scope
Real WhatsApp sending (needs provider keys), public leagues/social graph, parent PIN (separate epic slice), per-problem timers (separate slice), cosmetics art production.

## Verification
Per-task gates; deep review of P2.1/P2.2/P2.5 backends; migration 0040 applied to LAN DB; final integration-review workflow; manual: session on a Dikuasai-heavy subsection earns visibly less XP than a fresh one + tier-up pops +20; quest claim flow; chest at 50%; leaderboard with 2 kids; cron dry-run.
