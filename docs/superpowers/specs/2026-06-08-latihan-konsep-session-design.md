# Latihan Konsep — 20-Problem Session Redesign

**Date:** 2026-06-08
**Slice:** member-experience epic — Latihan Konsep flow
**Status:** Approved, building
**Branch:** `feat/ui-ux-enhancements`

## Problem

Today, Latihan Konsep lets a kid tap one concept and drill it forever, crediting comprehension + XP on every answer. We want a focused, motivating **session**: tap a subsection → do 20 problems across that subsection's concepts, weighted toward what they're weak at, and only "bank" the growth if they finish.

## Decisions (approved)

- **Garden is the entry.** Within a subsection the kid **cannot pick individual concepts**. Concepts render as **seeds that grow**; the **subsection card starts the session**. Tapping a plant opens an **info modal** (concept progress + a tip) — not a solo drill.
- **Session = 20 problems** drawn from the subsection's concepts:
  - **Weighted toward less-proficient concepts** (a mastered concept appears less).
  - **No same concept twice in a row** (when the subsection has >1 concept).
  - Each problem shows a **concept showcase** (live plant + concept name + tags + mini growth bar) and an **X/20 progress bar**.
  - Correct answer → confetti, **which clears after it plays**.
- **All-or-nothing.** Answers are **graded for feedback but not credited**. Comprehension + XP **commit atomically only when all 20 are done**. Quit before 20 → **nothing saved**, session lost (no resume).
- **Latihan Campur** (random across all concepts, immediate credit) stays unchanged.

## Architecture

No new tables. Two backend endpoints + a client-orchestrated session.

### Backend (`api/`)
New `api/services/wmi/concepts/session.ts`:
- **`gradeConceptAnswer(parentUserId, childId, conceptInstanceId, selectedAnswer)`** → `{ is_correct, correct_answer, hint_en, hint_id, hint_steps_en, hint_steps_id }`. Ownership check; fetch the instance's answer + hints; grade via `isCorrectAnswer`. **No DB writes, no XP, no comprehension.** (Live per-problem feedback only.)
- **`commitKonsepSession(parentUserId, childId, subjectKey, answers)`** where `answers` is exactly **20** `{ conceptInstanceId, selectedAnswer }`. In ONE `withTransaction`:
  - Ownership check; reject if `answers.length !== SESSION_SIZE (20)`.
  - For each answer: fetch the instance (`answer`, `concept_slug`); verify the concept belongs to `subjectKey` (skip/ignore off-subject ids — defensive); grade; `INSERT wmi_attempts (mode='concept')`; `upsertConceptProgress(client, childId, conceptSlug, isCorrect)`; `awardConceptReward(client, …)` for the XP/coins/streak economy (correct only, same as a normal attempt).
  - Accumulate and return a summary: `{ correct, total, xpEarned, coinsEarned, conceptsGrown: [{ slug, name_id, fromTier, toTier }], level, tierName, levelUp, coinBalance, streak }`.
  - This is exactly "20 normal concept attempts, deferred to commit-time and atomic" — reuses existing `upsertConceptProgress` + `awardConceptReward`, so gamification behavior is unchanged, just deferred.

Routes in `api/routes/wmi-member.ts`:
- `POST /me/wmi/konsep/grade` (Joi: childId uuid, concept_instance_id uuid, selected_answer 1–200).
- `POST /me/wmi/konsep/commit` (Joi: childId uuid, subject_key valid(...SUBJECTS), answers array length 20 of {concept_instance_id uuid, selected_answer 1–200}).

### Frontend (`src/`)
- **Session orchestration is client-side** (so it's naturally ephemeral — quit = state dropped). The session page:
  1. Derives `grade` from the `subjectKey` prefix (`g1-`/`g2-`/`g3-`), `fetchGarden(childId, grade)`, finds the chapter by `subjectKey` → its concepts (slug, name, tier, pct, tags).
  2. Builds a **weighted plan of 20 concept picks**: `weight = max(1, 100 - pct)` (less proficient → more likely), disallowing the same concept as the immediately previous pick (when >1 concept).
  3. For each pick: `fetchConceptNext(childId, grade, slug)` → an instance; render question + showcase; on answer `gradeConceptAnswer(...)` → feedback (confetti on correct, clears); buffer `{conceptInstanceId, selectedAnswer}`; advance progress.
  4. On the 20th: `commitKonsepSession(childId, subjectKey, buffer)` → show a **reward summary** (XP, concepts grown, level-up). Quit → navigate away, buffer discarded, nothing committed.
- New page `src/pages/WmiKonsepSession.tsx`, route `/latihan/wmi/sesi/:subjectKey`.
- New `src/components/wmi/ConceptInfoModal.tsx` (plant info: name, plant stage, comprehension % bar, "X dikerjakan · Y benar", a tip; close only).
- New `src/components/wmi/KonsepSessionShowcase.tsx` (the concept showcase band: live plant + eyebrow "Sedang menumbuhkan" + concept name + tag chips + mini growth bar) + the X/20 progress bar.
- Update `src/components/wmi/ChapterGarden.tsx`: subsection card → `onStartSession(subjectKey)`; plant → `onConceptInfo(concept)` (open modal) instead of navigating; render concepts as seeds growing (no per-plant LANJUT; a subsection-level "Mulai/Lanjut" affordance).
- Update `src/pages/WmiHub.tsx`: hold modal state; `onConceptInfo` opens `ConceptInfoModal`; `onStartSession` navigates to the session route. Secondary "Latihan Campur" unchanged.
- Fix `src/components/wmi/KonsepConfetti.tsx`: **self-clear** — unmount/hide the pieces after the animation completes (~2s), so the sprinkle doesn't linger.
- API client (`src/lib/wmiApi.ts`): `gradeConceptAnswer`, `commitKonsepSession`. Types in `src/types/wmi.ts`.
- Tips for the modal: reuse the concept's hint (the procedural concept `render()` exposes `hint_id`/`hint_steps_id`); the modal shows a representative tip. (Fetch one instance for the concept to get a hint, or store a static per-concept tip. v1: fetch one instance via `fetchConceptNext` and show its `hint_id`.)

## Out of scope
- The EXP redesign ("no XP once proficient", time/difficulty-scaled rewards) — separate slice; commit uses the current flat economy for now.
- Tagging the paper questions; tag-filter UI.
- Making Latihan Campur a session.

## Risks / notes
- **Subsections with 1 concept** (e.g. `g1-pecahan`): no-back-to-back is impossible; allow repeats then.
- **Cheating surface**: the grade endpoint reveals the answer, and commit re-grades the submitted answers — a kid could grade-then-commit known answers. Acceptable (same property as today's per-attempt flow; low stakes).
- **Commit cost**: 20 attempts in one transaction — bounded and fine.
- "Two same problems can't occur one after another" interpreted as **no same concept consecutively** (instance variety is already handled by `konsep/next` serve logic).

## Success criteria
- Tapping a subsection starts a 20-problem session with an X/20 bar and per-problem concept showcase.
- Concepts are weighted toward weaker ones; the same concept never appears back-to-back (when the subsection has >1).
- Confetti plays on correct then clears.
- Finishing 20 banks comprehension + XP (reward summary); quitting earlier saves nothing.
- Tapping a plant shows the info modal (progress + tip), never a solo drill.
- `npm run check`, `npm run lint`, `npm test`, `npm run build` all green.
