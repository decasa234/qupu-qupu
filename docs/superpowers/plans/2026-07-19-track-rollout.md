# Track Rollout Hardening (Plan 3 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the two recorded Plan-1 obligations (track `status` gating on every endpoint; lesson session binding/replay protection), add reward parity (lessons + gates grant XP/coins through the existing gamification stack), and ship the dark cutover machinery (`/belajar` serves the track UI for a grade once its track is `published`).

**Architecture:** Status visibility is a pure helper enforced in the routes; session binding is a new `wmi_track_lessons` one-shot table threaded through build→commit; rewards mirror `chapterTest.ts`'s gamification block with deterministic ledger source ids (idempotent by construction); cutover is a pure registry lookup consumed by `MemberHome`. The pilot track moves `draft → review` so admins keep a way to play it.

**Tech Stack:** unchanged (Express/Joi/pg, React, vitest).

## Global Constraints

- Same house rules as Plans 1–2: `.js` import specifiers in api/; tracks/ modules browser-safe; routes thin, SQL in services; pg suites skip without `TEST_DATABASE_URL`; `git add` ONLY task files; `npm run check` clean per task.
- Spec visibility rules verbatim: `draft` → invisible (404 via the existing `'Track not found'` sentinel — hide existence); `review` → admins only; `published` → everyone.
- Reward idempotency: every grant goes through `appendLedger` with a DETERMINISTIC source id so replays/retries no-op (mirror `api/services/gamification/chapterChest.ts`'s documented idempotency pattern and `chapterTest.ts`'s usage).
- Lesson pass reward constants (new, named in `tracks/ladder.ts`): `LESSON_PASS_XP = 10`, `LESSON_PASS_COINS = 2` — granted once per (child, concept, cleared level); replaying a level or replaying gold grants nothing.
- Gate rewards: identical mechanism AND amounts to the existing chapter test's first-pass grant (read `chapterTest.ts` for its exact XP/coin constants and call order — do not invent numbers).
- Do not modify `garden.ts`/`session.ts`/old-garden UI. `MemberHome.tsx` and `TrackMap.tsx` are the only old-frontend touchpoints, per Task 6.

---

### Task 1: Status visibility gating + pilot to `review`

**Files:**
- Modify: `api/services/wmi/tracks/ladder.ts` (add pure `canViewTrack`)
- Modify: `api/routes/wmi-member.ts` (guard all 5 track endpoints)
- Modify: `api/services/wmi/tracks/wmi-grade-1.ts` (`status: 'review'`)
- Test: extend `api/services/wmi/tracks/ladder.test.ts`

**Interfaces:** `export function canViewTrack(status: 'draft' | 'review' | 'published', role: string | undefined): boolean` — `published` → true; `review` → `role === 'admin'`; `draft` → false.

- [ ] Pure test first: the six (status × role) combinations incl. undefined role.
- [ ] Implement `canViewTrack` in `ladder.ts` (stays browser-safe — takes plain strings).
- [ ] In `wmi-member.ts`, each of the 5 track handlers resolves the track via `getTrack(req.params.trackId)` BEFORE calling the service; when missing OR `!canViewTrack(track.status, req.user?.role)` → respond with the existing `'Track not found'` 404 sentinel path (same shape the services already produce; do not leak that the track exists). Keep the services unchanged (defense stays in one place — the routes — since all five go through them).
- [ ] Flip the pilot to `status: 'review'` and update `registry.test.ts`'s status assertion.
- [ ] `npx vitest run api/services/wmi/tracks` PASS; `npm run check`. Commit: `feat(tracks): status visibility gating (draft hidden, review admin-only)`

---

### Task 2: Migration 0052 — lesson sessions table

**Files:**
- Create: `db/migrations/0052_track_lessons.sql`
- Modify: `db/schema.sql` (append same DDL)

```sql
-- db/migrations/0052_track_lessons.sql
-- One-shot lesson sessions (Plan 3): commitLesson must reference a lesson
-- built by buildLesson; committing marks it consumed, killing replay and
-- instance-substitution grinding.
CREATE TABLE IF NOT EXISTS wmi_track_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id      TEXT NOT NULL,
  focus_slug    TEXT NOT NULL,
  focus_level   SMALLINT NOT NULL CHECK (focus_level BETWEEN 1 AND 5),
  instance_ids  UUID[] NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS wmi_track_lessons_child_idx
  ON wmi_track_lessons (child_id, created_at DESC);
```

- [ ] Append the same block to `db/schema.sql` under `-- Track lessons (migration 0052)`.
- [ ] Commit: `feat(db): wmi_track_lessons one-shot lesson sessions`

---

### Task 3: Lesson binding — build persists, commit validates + one-shot

**Files:**
- Modify: `api/services/wmi/tracks/lesson.ts`
- Modify: `api/routes/wmi-member.ts` (commit schema gains `lessonId`)
- Modify: `api/lib/publicError.ts` (sentinels `'Lesson not found'` 404, `'Lesson already committed'` 409, `'Lesson answers mismatch'` 400)
- Test: extend `api/__tests__/trackLesson.test.ts`

**Interfaces (changed):** `buildLesson(...)` now returns `{ lessonId: string; questions: LessonQuestion[] }` (INSERT into `wmi_track_lessons` with the served instance ids + focus level, same transaction-free flow as today). `commitLesson(parentUserId, childId, trackId, focusSlug, lessonId, answers)` — inside the existing transaction: `SELECT ... FOR UPDATE` the lesson row; throw `'Lesson not found'` when missing or child/track/focus mismatch; `'Lesson already committed'` when `committed_at IS NOT NULL`; `'Lesson answers mismatch'` when the submitted instanceId multiset ⊄ the stored `instance_ids` or any id repeats; stamp `committed_at = NOW()` before returning. The focus level used for the level-up write comes from the stored `focus_level` (not recomputed), so two racing commits of two different lessons can't double-bump — second one is judged against the fresh `FOR UPDATE` progress read exactly as today, and its stored level cap (`min(GOLD_LEVEL, levelBefore + 1)`) already makes over-bumping impossible.

- [ ] Extend the pg test: build returns lessonId; commit with wrong lessonId → 404 sentinel message; commit twice → second throws `'Lesson already committed'`; commit with an instanceId not served → `'Lesson answers mismatch'`; happy path unchanged assertions still pass.
- [ ] Implement; route commit Joi schema gains `lessonId: Joi.string().uuid().required()`.
- [ ] `npm run check`; pg suite live if a disposable Postgres is feasible (prior tasks' initdb pattern). Commit: `feat(tracks): one-shot lesson sessions kill replay + instance substitution`

---

### Task 4: Reward parity — lessons + gates pay out

**Files:**
- Modify: `api/services/wmi/tracks/ladder.ts` (constants `LESSON_PASS_XP = 10`, `LESSON_PASS_COINS = 2`)
- Modify: `api/services/wmi/tracks/lesson.ts`, `api/services/wmi/tracks/gates.ts`
- Test: extend `api/__tests__/trackLesson.test.ts`, `api/__tests__/trackGates.test.ts`

- [ ] READ `api/services/wmi/concepts/chapterTest.ts` end-to-end first — its submit path is the model: `ensureProfile` → `appendLedger` (xp + coins rows) → `updateProfileWithDelta` → `updateStreakForActivity` → `ensureTodaysQuests` + `evaluateForEvent` → `evaluateAchievements` → `emitEvent`. Mirror that exact call order and transaction placement.
- [ ] Lesson commit: when `passed && levelAfter > levelBefore` (a genuinely new level — replays and gold replays grant nothing), grant `LESSON_PASS_XP`/`LESSON_PASS_COINS` with deterministic source id `track-lesson:<childId>:<focusSlug>:L<levelAfter>` (source type: follow the ledger's existing source-type conventions — read `ledger.ts`). Return `{ ..., xpEarned, coinsEarned }` (0 when no grant).
- [ ] Gate submit: on first clear (the `ON CONFLICT DO NOTHING` insert actually inserted — use `RETURNING` to detect), grant the SAME amounts the chapter test grants on first pass, source id `track-gate:<childId>:<trackId>:<gateKey>`. Return `{ correct, cleared, xpEarned, coinsEarned }`.
- [ ] pg tests: pass grants once (ledger row counts), replay grants 0; gate first clear grants, re-clear grants 0.
- [ ] `npm run check`. Commit: `feat(tracks): XP/coin rewards for lesson level-ups and gate clears`

---

### Task 5: Frontend — lessonId threading + reward display + stat refresh

**Files:**
- Modify: `src/lib/wmiApi.ts`, `src/types/wmi.ts` (build returns lessonId; commit takes lessonId; results gain xpEarned/coinsEarned)
- Modify: `src/pages/TrackLesson.tsx`, `src/pages/TrackGate.tsx`

- [ ] Thread `lessonId` build→commit in `TrackLesson.tsx`.
- [ ] On both result screens: when `xpEarned > 0 || coinsEarned > 0`, show the house reward chips (copy the navy `+N XP` / amber `+N koin` pill block from `WmiChapterTest.tsx`'s result) and refresh the top stat strip exactly the way `WmiChapterTest.tsx` does on a pass (`fetchGamificationSummary` → `useGamificationStats.getState().setStats(...)` — copy that block verbatim including its child-stamping).
- [ ] `npm run check`; eslint clean. Commit: `feat(track-ui): lesson session ids + reward chips + stat refresh`

---

### Task 6: Cutover machinery (dark)

**Files:**
- Modify: `api/services/wmi/tracks/registry.ts` (pure `getPublishedTrack`)
- Modify: `src/pages/TrackMap.tsx` (accept optional `trackId` prop, param fallback)
- Modify: `src/pages/MemberHome.tsx`

**Interfaces:** `export function getPublishedTrack(mode: TrackMode, grade: number): TrackDef | undefined` — first track in `TRACKS` with matching mode+grade AND `status === 'published'`.

- [ ] Pure test in `registry.test.ts`: returns undefined while the pilot is `review`; returns it when a test-constructed published copy is checked (test the predicate via a local TrackDef array refactor — export a `findPublishedTrack(tracks, mode, grade)` helper the public function delegates to, and test THAT with fixtures).
- [ ] `TrackMap.tsx`: `function TrackMap({ trackId: trackIdProp }: { trackId?: string })` → `const trackId = trackIdProp ?? useParams().trackId` (keep hook-order safe: always call useParams).
- [ ] `MemberHome.tsx`: resolve the child's effective WMI grade the same way `BelajarPath.tsx` does (read its `pinnedGrade ?? selectedGrade` + clamp block and reuse the same stores); `learnMode === 'video'` → MemberVideos (unchanged); else `getPublishedTrack('wmi', grade)` → `<TrackMap trackId={track.id} />` when found, else `<BelajarPath />`. With nothing published, behavior is byte-identical today — the machinery ships dark.
- [ ] `npm run check`; eslint. Commit: `feat(track-ui): dark cutover — published tracks take over the Home tab per grade`

---

### Task 7: Verification (controller-run)

- [ ] `npm run check`, `npm test`, eslint on all Plan-3 files.
- [ ] Browser harness: status pill now says `review`; lesson result shows reward chips; MemberHome still renders the garden (nothing published).
- [ ] Final whole-branch review (fable) over Plans 1–3 obligations: both Plan-1 obligations must be verifiably closed.

## Self-Review

- Obligation coverage: status gating → T1; session binding → T2+T3; reward parity → T4+T5; cutover → T6; migration semantics already lazy (`effectiveLevel`) — documented, no data job. Placeholders: none (chapter-test constants deliberately read-from-source, an action). Type consistency: `lessonId` threading named identically across T3/T5; reward fields `xpEarned`/`coinsEarned` across T4/T5.
