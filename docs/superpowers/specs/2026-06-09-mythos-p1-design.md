# Mythos P1 — Reward Ceremony, Streak Shield, Reliability Floor

**Date:** 2026-06-09 · **Branch:** `claude-mythos-optimization` (continues P0) · **Status:** Building
**Source:** P1 table of `docs/audits/2026-06-09-e2e-gap-audit.md` + integration-review notes.

## Wave 1 — the experience

### P1.1 Session-end reward ceremony
Duolingo never ends on a blank screen; QUPU computes everything (XP, coins, streak, quests, achievements, plant growth) and shows almost none of it at the moment that builds the habit.
- FE `WmiKonsepSessionResult` gains the fields the backend already returns (`completedQuests`, `unlockedAchievements`).
- New `KonsepCeremony` component replacing the flat session result screen: a staged sequence (auto-advancing ~700ms beats, tap to skip ahead): correct-count → XP count-up (+bonus) → coins → streak flame (current streak) → quest-completion rows → achievement unlocks → "concepts grown" plants (PlantIcon tier-up morph). Confetti once. All FA + brand kit; reuses `PostQuizRewardSummary` patterns where sensible.
- Chapter-test pass: backend mirrors `xp_earned`/`coins_earned` into the result; pass screen renders reward chips (mini-ceremony, not the full sequence).
- Latihan Campur drill path emits `KONSEP_QUESTION_ANSWERED` (per correct answer, via existing award path) so daily quests progress from the drill too — fixes "konsep trio can't progress from Campur".

### P1.2 "Pelindung Streak" (streak shield) — the keystone coin sink
- Schema (migration 0038): shield ownership on `gamification_profiles` (`streak_shields SMALLINT NOT NULL DEFAULT 0 CHECK (0..2)`) — simpler than generic inventory; cap 2.
- `streakUpdater`: on a would-be break (missed day(s)), consume shields to cover up to `min(missedDays, shields)` days; if fully covered the streak continues unbroken (ledger-style event row for audit); else existing break+`pre_break` recovery semantics apply.
- Shop: new SKU "Pelindung Streak" (suggested ~150 coins — implementer calibrates to ~3-4 days of active earning by reading actual income rates), purchase delivers `streak_shields+1` atomically (existing purchase path), cap enforced. Shop UI: shield shows owned count + works immediately; **stubbed undeliverable goods are hidden until deliverable** (keep rows in DB, filter serve).
- Surfacing: streak card/strip shows shield count (fa-shield icon); recovery modal unchanged (shield = proactive, recovery = reactive fallback).

### P1.3 Indonesian errors everywhere
- `src/lib/errorMessage.ts`: `toIndonesianErrorMessage(err, fallback)` — maps Axios/network/timeout/5xx/4xx to parent-friendly Indonesian; NEVER returns raw `err.message`. Replace the `err instanceof Error ? err.message : '...'` pattern at all member-facing sites (audit counted 14).
- Auth API: localize register/login route errors + Joi messages ("Invalid email or password" → "Email atau kata sandi salah", etc.); replace `Register.tsx`'s Indonesian string-match flow control with a stable error `code` field.
- Member routes' `sendError`-style raw `error.message` passthrough: allowlist known user-facing messages, generic Indonesian fallback otherwise.

## Wave 2 — the reliability floor

### P1.4 Code-splitting
`React.lazy` + Suspense (on-brand spinner fallback): admin subtree, marketing pages (`LatihanWmi`, `Harga`, legal), exam stack; dynamic-import the WMI concept illustration + explainer + paperQuestion registries (the ~1.6MB tail). Remove dead `recharts` dep. Target: member core chunk well under half the current 1.4MB; verify with build output.

### P1.5 Konsep commit idempotency + batching
- Client generates a `session_id` (uuid) at session start (persisted in the M7 snapshot); commit sends it.
- New `wmi_konsep_sessions` table (0038): `session_id UUID PK, child_id, subject_key, result JSONB, created_at`. Commit: if row exists → return stored result verbatim (no re-execution). Else run, store result, commit — same transaction.
- Batching: prefetch all answer instances in ONE query; insert the 20 attempts in ONE multi-VALUES statement; keep per-concept progress upserts + rewards (bounded); target <15 round-trips per commit (from ~140).

### P1.6 Error boundaries + funnel events
- Top-level `ErrorBoundary` (friendly Indonesian fallback + reload button) and a slot boundary around illustration/explainer renders (a bad illustration must not white-screen the question — fall back to no illustration).
- Pipe `window.onerror`/`unhandledrejection` + boundary catches into the existing consent-gated analytics (no new vendor). Member-funnel events: `session_start`, `session_commit`, `commit_failed`, `quest_completed_view`, `streak_recovered`.

### P1.7 Auth interceptor
401 → logout+redirect (as today); **403 rejects normally** (no session wipe).

## Wave 3 — polish

### P1.8 Me page: children management
Child switcher + "Tambah anak" on the Me page (modal reuse); fix the stale "ganti lewat switcher di navbar" empty-state copy (4 sites per audit).

### P1.9 Meta/OG
`index.html`: `lang="id"`, real `<title>` + description, OG/twitter cards, theme-color, manifest; lightweight `useDocumentTitle` on key routes (garden, session, dashboard, marketing, legal).

### P1.10 Stats hydration + daily goal
`useGamificationStats` self-hydrates (fetch `/me/gamification` when `stats === null && activeChildId`) so no surface shows "0" cold; dashboard daily-goal + heatmap count WMI attempts (not just video quizzes).

### P1.11 Tab/hub alignment
Verify LatihanHub CTAs post-P0 (its old primary went to the deleted drill route); point hub primary + dashboard hero at the garden; reconcile drill vs session reward grammar (drill keeps inline chips; session = ceremony; both fed by the same ledger).

## Out of scope (P2)
WhatsApp/parent notifications, checkpoint chests/gold plants, sibling leaderboard, level unlocks, mastery-scaled XP, cosmetics shop expansion, rate limiting, exam restyle.

## Verification
Per-task gates; deep review of P1.2/P1.5 backends; migration 0038 applied to LAN DB; final integration-review workflow over the whole branch; manual: full session → ceremony; buy shield → miss a day → streak survives; kill an illustration → question still renders.
