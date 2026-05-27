---
date: 2026-05-27
topic: wmi-practice-area
status: design
---

# WMI Practice Area (Grade 0–3, Past Papers 2019–2026)

## Problem

QUPU has no "deep practice" surface today. The catalog is video-first (watch → embedded quiz). Members who want raw question practice — especially WMI-style olympiad problems that train *how to think*, not just recall — have nowhere to do that on the platform. WMI past papers (2019–2026) exist as English PDFs + answer-key PDFs but aren't ingested anywhere. Many Indonesian kids in the Grade 0–3 range can't yet read English fluently, and olympiad questions also assume math vocabulary ("perimeter", "digit sum", "vertex") that even Indonesian-only kids may not have learned.

## Goal

Ship a kid-driven WMI practice surface that:

1. Lets a child practice past-paper questions in two modes — **drill** (one question at a time, instant feedback) and **exam** (full paper, timed, scored at the end).
2. Presents every question in **English first** (as authored by WMI) with the **Indonesian translation hidden behind a per-question spoiler**.
3. Marks technical math terms inline; tapping/hovering one shows a small popover with a kid-friendly EN + ID definition.
4. Operates in the existing **child profile context** (same `ChildSwitcher` flow as Dashboard / Badges / Rapor) and persists attempts so the data is available for a future Rapor integration.

## Non-Goals (v1)

- AI question generation ("similar logic"). v2.
- Full worked-solution / step-by-step logic explanations. v2.
- Admin ingestion tool (PDF → questions). v2. v1 ships with 1–2 papers hand-seeded as JSON.
- Wiring WMI into the badge / quest / streak / achievement engines. v2 — design leaves clean attach points but does not fire `gamification.events` in v1.
- Per-question history surfaced anywhere outside the WMI area (no changes to Rapor / Dashboard / Trophy wall in v1).
- A public unauthenticated trial — practice is members-only and requires an active child profile.
- Generation, browse, or printing of papers as PDFs.
- Any grade above 3 or below 0; no semi-finals/finals distinction in routing — just a tag on the paper.
- Admin-editable glossary in v1 — glossary ships as committed seed data; growing it means editing the seed file.

## Architecture

### Data model (new tables, one migration: `db/migrations/0018_wmi_practice.sql`)

```sql
-- wmi_papers: one row per (year, grade, round). The catalog of past papers.
CREATE TABLE wmi_papers (
  id              uuid PRIMARY KEY,
  year            smallint NOT NULL CHECK (year BETWEEN 2019 AND 2099),
  grade           smallint NOT NULL CHECK (grade BETWEEN 0 AND 3),
  round           text     NOT NULL CHECK (round IN ('semifinal','final')),
  title           text     NOT NULL,                       -- "WMI 2024 Grade 1 Final"
  source_url      text,                                    -- optional link to original PDF
  recommended_duration_min smallint NOT NULL DEFAULT 60,
  question_count  smallint NOT NULL DEFAULT 0,             -- denormalized
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (year, grade, round)
);

-- wmi_questions: one row per question. English is the source of truth; Indonesian is the translation.
CREATE TABLE wmi_questions (
  id            uuid PRIMARY KEY,
  paper_id      uuid NOT NULL REFERENCES wmi_papers(id) ON DELETE CASCADE,
  number        smallint NOT NULL,                          -- 1..N within the paper
  body_en       text NOT NULL,                              -- markup: [[term-slug]] / [[term-slug|display]]
  body_id       text NOT NULL,                              -- Indonesian translation, same markup convention
  answer_type   text NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en    jsonb,                                      -- [{label:"A", text:"..."}, ...] NULL for fill_in
  choices_id    jsonb,                                      -- parallel ID translations
  answer        text NOT NULL,                              -- "C" or e.g. "12"
  figure_url    text,                                       -- path to figure image, nullable
  hint_en       text,                                       -- optional one-liner shown on incorrect
  hint_id       text,
  difficulty    smallint CHECK (difficulty BETWEEN 1 AND 3),-- nullable, for v2 generation
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (paper_id, number)
);

-- wmi_glossary_terms: math-vocabulary popovers tagged inline in question bodies.
CREATE TABLE wmi_glossary_terms (
  id             uuid PRIMARY KEY,
  slug           text NOT NULL UNIQUE,         -- 'perimeter', 'digit-sum', 'vertex'
  term_en        text NOT NULL,                -- display label
  term_id        text NOT NULL,                -- Indonesian label, e.g. 'keliling'
  definition_en  text NOT NULL,                -- kid-friendly, ≤ ~200 chars
  definition_id  text NOT NULL,
  example_en     text,
  example_id     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- wmi_exam_sessions: one row per attempted paper run in exam mode.
CREATE TABLE wmi_exam_sessions (
  id               uuid PRIMARY KEY,
  child_id         uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  paper_id         uuid NOT NULL REFERENCES wmi_papers(id),
  started_at       timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  duration_ms      int,
  correct_count    smallint,
  total_questions  smallint NOT NULL,
  abandoned        boolean NOT NULL DEFAULT false
);

-- wmi_attempts: one row per *submitted* answer. No row = unanswered/skipped.
-- Joins to a session for exam mode; session_id NULL for drill.
CREATE TABLE wmi_attempts (
  id                         uuid PRIMARY KEY,
  child_id                   uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id                uuid NOT NULL REFERENCES wmi_questions(id) ON DELETE CASCADE,
  mode                       text NOT NULL CHECK (mode IN ('drill','exam')),
  session_id                 uuid REFERENCES wmi_exam_sessions(id) ON DELETE CASCADE,
  selected_answer            text NOT NULL,                         -- the kid's actual submission
  is_correct                 boolean NOT NULL,
  time_taken_ms              int,
  revealed_id_translation    boolean NOT NULL DEFAULT false,        -- analytics: did kid peek at ID?
  looked_up_terms            text[] NOT NULL DEFAULT '{}',          -- glossary slugs tapped
  created_at                 timestamptz NOT NULL DEFAULT now()
);

-- Editing-in-place a wmi_questions row (e.g., correcting an answer key) is NOT
-- in scope for v1. Existing wmi_attempts retain their original is_correct.
-- Reseeding a paper upserts by (paper_id, number); attempts continue to point
-- at the same row id. If a question is genuinely removed, attempts cascade.

CREATE INDEX wmi_attempts_child_question_idx ON wmi_attempts(child_id, question_id);
CREATE INDEX wmi_attempts_session_idx ON wmi_attempts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX wmi_questions_paper_number_idx ON wmi_questions(paper_id, number);
CREATE UNIQUE INDEX wmi_attempts_exam_unique
  ON wmi_attempts(session_id, question_id)
  WHERE mode = 'exam' AND session_id IS NOT NULL;
```

**Why this shape**

- Papers as the primary unit because exam mode needs to load a coherent paper; drill mode samples across papers.
- `wmi_attempts` separate from existing `score_attempts` because `score_attempts` is video-scoped (FK to `videos`). Keeping WMI's analytics in its own table avoids polluting the video schema and matches how this codebase already separates achievement domains (gamification tables are also their own world).
- Glossary terms reference each other from `wmi_questions.body_en` / `body_id` via `[[slug]]` markup, not a join table. Markup keeps the rendering pure; the glossary table is loaded once into the client and term lookups are O(1) by slug.
- `revealed_id_translation` and `looked_up_terms` on attempts are deliberately captured to answer "is the spoiler/glossary actually being used?". v1 consumer: a documented SQL snippet in `db/seed/wmi/README.md` — `SELECT slug, COUNT(*) FROM wmi_attempts CROSS JOIN LATERAL unnest(looked_up_terms) AS slug GROUP BY slug ORDER BY 2 DESC` (and the equivalent for `revealed_id_translation`) — used by the team during paper authoring to spot common confusions. No v1 UI consumes them; they justify their place by making content authoring sharper, not by anticipating v2.
- The partial unique index on exam attempts lets `POST /attempts` upsert when a child changes their mind during an exam, while drill attempts (where `session_id IS NULL`) accumulate freely as separate rows via plain INSERT.
- `wmi_attempts.question_id ON DELETE CASCADE` means deleting a question (rare; questions are append-only in normal operation) drops attempts referencing it. Editing a question's content in place does not recompute existing attempts — see the inline schema comment.
- No badge-engine integration in v1: no `gamification.events` fire, no `user_badge_unlocks` write. The data model is clean for v2 to add a `wmi_badge_rules` table later without breaking changes.

`db/schema.sql` (used by fresh installs) is updated to include the same tables so a from-scratch bootstrap matches a migrated DB.

### API surface

Two new routers mounted in `api/app.ts`:

- `api/routes/wmi-public.ts` mounted at `/api/public/wmi` — unauthenticated, shared content (glossary, figures). Matches the existing `/api/public/*` convention.
- `api/routes/wmi-member.ts` mounted at `/api/me/wmi` — `authenticateToken`-gated, per-child practice. Matches the `/api/me/*` convention.

**Active-child resolution.** This codebase has no server-side "active child" state. Every `/api/me/*` route takes `childId` as an explicit required query/body param and enforces ownership inside the service layer via `assertChildOwnership(req.user.id, childId)` (see `api/services/member.ts:36-50`, mirrored from `api/routes/member.ts:26-28`). The WMI member router follows the same pattern exactly — every endpoint takes `childId` as a required param, and the service layer calls the same ownership helper before any read or write. The client (zustand `authStore` already tracks `activeChildId` for the parent) sends `childId` on every WMI request via the existing axios instance in `src/lib/api.ts`. There is no new auth machinery.

**Public router (`/api/public/wmi/*`)**
- `GET  /api/public/wmi/glossary` — all glossary terms (small payload; client caches for the session). Public because glossary content is platform-wide reference, not per-child.
- `GET  /api/public/wmi/figures/:filename` — serves PNG/JPG figure files from `db/seed/wmi/figures/` via Express. Explicit endpoint instead of relying on Vercel's static handler, because `vercel.json` rewrites `/(.*)` → `/index.html` for SPA fallback and the precedence of build-output files over that rewrite is not contractually guaranteed for nested paths. An Express handler under `/api/(.*)` is unambiguous. Implementation: `express.static(path.join(__dirname, '..', 'db', 'seed', 'wmi', 'figures'))` mounted at this prefix, with a strict allowlist of file extensions and a 404 on miss.

**Member router (`/api/me/wmi/*`)** — every endpoint requires `childId` (query for GET, body for POST/PATCH), validated with the same `Joi.string().uuid().required()` pattern as `childIdQuerySchema` in `api/routes/member.ts`. Every service-layer call begins with `await assertChildOwnership(req.user.id, childId)`.

- `GET  /api/me/wmi/papers?childId={uuid}&grade={0-3}` — list papers for the grade, joined with the child's per-paper aggregate (attempts, best_score). Returned via **one** SQL query using a LEFT JOIN against an aggregate CTE over `wmi_exam_sessions` keyed by `(child_id, paper_id)`, mirroring the pattern in `getMemberProgress` (`api/services/member.ts:299-329`). No N+1.
- `GET  /api/me/wmi/papers/:id?childId={uuid}` — full paper + all questions (body, choices, figure_url, hints). **Answer key omitted.**
- `GET  /api/me/wmi/drill/next?childId={uuid}&grade={0-3}` — one random question for the grade, uniformly sampled over questions the child hasn't submitted in the last 20 attempts; falls back to fully random if exhausted.
- `POST /api/me/wmi/attempts` — body `{ childId, question_id, mode, session_id?, selected_answer, time_taken_ms?, revealed_id_translation?, looked_up_terms? }`. Server computes `is_correct`, persists the row, returns `{ is_correct, correct_answer, hint_en, hint_id }`. **Drill** uses plain `INSERT`. **Exam** uses upsert (see SQL below).
- `POST /api/me/wmi/exam/sessions` — body `{ childId, paper_id }`. Inserts a `wmi_exam_sessions` row, returns `{ session_id, paper, questions[] }` (answer keys omitted).
- `GET  /api/me/wmi/exam/sessions/:id?childId={uuid}` — fetch a session. Service verifies `wmi_exam_sessions.child_id = childId` AND `childId` is owned by the requester — both checks, in that order. Used for refresh-resume and review.
- `PATCH /api/me/wmi/exam/sessions/:id/complete` — body `{ childId }`. Tallies attempts via `SELECT COUNT(*) FROM wmi_attempts WHERE session_id = $1 AND is_correct = true`. Writes `completed_at`/`duration_ms`/`correct_count`. Idempotent: if `completed_at` is already set, returns the existing summary without re-tallying.

**Exam-mode upsert SQL** (Postgres requires the `ON CONFLICT` predicate to exactly match the partial unique index predicate):

```sql
INSERT INTO wmi_attempts (
  id, child_id, question_id, mode, session_id,
  selected_answer, is_correct, time_taken_ms,
  revealed_id_translation, looked_up_terms
) VALUES ($1, $2, $3, 'exam', $4, $5, $6, $7, $8, $9)
ON CONFLICT (session_id, question_id)
  WHERE mode = 'exam' AND session_id IS NOT NULL
DO UPDATE SET
  selected_answer         = EXCLUDED.selected_answer,
  is_correct              = EXCLUDED.is_correct,
  time_taken_ms           = EXCLUDED.time_taken_ms,
  revealed_id_translation = EXCLUDED.revealed_id_translation,
  looked_up_terms         = EXCLUDED.looked_up_terms,
  created_at              = now();
```

Drill-mode insert is a separate code path: a plain `INSERT` with no `ON CONFLICT` clause (the partial unique index doesn't cover drill rows, so a single child can have many drill attempts for the same question).

Out of scope for v1: no admin endpoints; no `/me/wmi/progress` aggregate; no `score_attempts` write; no `gamification.events`.

### Frontend route table (`src/App.tsx`)

All under the existing `Layout`, all `ProtectedRoute`:

```
/latihan/wmi                              <WmiHub />
/latihan/wmi/drill                        <WmiDrill />      ?grade=0..3
/latihan/wmi/papers/:id                   <WmiPaperDetail />
/latihan/wmi/exam/:sessionId              <WmiExam />
/latihan/wmi/exam/:sessionId/review       <WmiExamReview />
```

**Note: deliberate departure from existing route naming.** All existing member routes are English (`/dashboard`, `/report`, `/badges`); in-page copy is Indonesian. Choosing `/latihan/wmi` for this area is a precedent break, made deliberately to (a) leave a clean namespace for future olympiads (`/latihan/imc`, etc.) and (b) make the URL itself feel native to the Indonesian-language site. Existing routes are not changed.

### Question rendering — glossary + translation spoiler

`WmiQuestionView` is the shared renderer used by Drill, Exam, and Review. Given a `question`:

1. **Figure** (if `figure_url` present) — centered, max-width ~320px, kid-friendly framing.
2. **English body** — `body_en` runs through `parseWmiMarkup()` (pure util in `src/lib/wmiMarkup.ts`) into tokens:
   - `[[perimeter]]` → `{type:'gloss', slug:'perimeter', display:'perimeter'}`
   - `[[perimeter|its outside edge]]` → `{type:'gloss', slug:'perimeter', display:'its outside edge'}`
   - everything else → `{type:'text', value:'...'}`
   Each gloss token renders as `<WmiGlossaryTerm slug>` with a kid-friendly visual cue (dotted underline + soft color from the QUPU palette). Tap/hover opens a popover with `term_en + definition_en` and, behind a small "ID" toggle, `term_id + definition_id`. Each tap adds the slug to a `Set<string>` of looked-up slugs for the current attempt.
3. **Translation spoiler** — `<WmiTranslationSpoiler>` shows a button "Lihat terjemahan Bahasa Indonesia ↓". On tap, expands inline to render `body_id` through the same parser (Indonesian glossary spans use `term_id` as display, same popover content). Opening it sets `revealedIdTranslation = true` for the current attempt. The spoiler also covers `choices_id` — one reveal expands both body and choices.
4. **Choices**:
   - `answer_type = 'multiple_choice'`: vertically stacked large-tap buttons (mobile-first), one per `choices_en[i]`. The label letter ("A"/"B"/"C"/...) is in a colored circle. Choice text is parsed through the same markup util so glossary terms inside a choice also work.
   - `answer_type = 'fill_in'`: one large numeric/text input + a "Periksa" button.

### Drill flow (`WmiDrill.tsx`)

1. Top strip: current grade chip + "Ganti grade" link back to the hub. Small streak counter (consecutive-correct in this session, in-memory only).
2. `<WmiQuestionView />` for the current question.
3. **Submission**:
   - `multiple_choice` — kid taps a choice → choice locks visually (tap = submit; no separate submit button — better for ages 5–9).
   - `fill_in` — kid types into the input, taps the "Periksa" button to submit (tap=submit is not viable when there's nothing to tap).
   Background `POST /attempts` with `mode:'drill'`, the selected answer, `time_taken_ms`, `revealed_id_translation`, `looked_up_terms`.
4. On response `{ is_correct, correct_answer, hint_en, hint_id }`:
   - **Correct**: green wash on the choice + brief `<Mascot>` win animation (existing component, reuse). `<WmiFeedbackPanel>` slides up with "Hebat!", optional `hint_en` (with spoiler for `hint_id`), and "Next →".
   - **Incorrect**: gentle red wash on the kid's choice + green wash on the correct one. Panel: "Belum tepat — coba lagi besok!" with the same hint layout.
5. "Next →" fires `GET /drill/next?grade=N` and resets state.
6. No timer. No exam-style scoring. Drill is the relaxed practice mode.

### Exam flow (`WmiExam.tsx`)

1. Top: paper title ("WMI 2024 Grade 1 Final"), `<WmiExamTimer />` counting down from `paper.recommended_duration_min`.
2. Progress: "Soal 3 dari 25" + tappable dot row for jump-to-question.
3. `<WmiQuestionView />` but with **no feedback panel** during the exam; answers commit silently. Each commit fires `POST /attempts` with `mode:'exam'` and `session_id`; the partial unique index ensures changing your mind overwrites.
4. Footer: ← Sebelumnya / Lanjut → / "Selesai" CTA on the last question. The kid can revisit any question while the timer runs.
5. Timer at 0 OR "Selesai" tapped → `PATCH /exam/sessions/:id/complete`. Server tallies attempts: `correct_count = COUNT(wmi_attempts WHERE session_id = :id AND is_correct = true)`. Questions with no `wmi_attempts` row for the session are implicitly unanswered and count as not-correct. Writes `completed_at`/`duration_ms`/`correct_count`, redirects to `/latihan/wmi/exam/:id/review`.
6. **Refresh-safe**: on mount, if `:sessionId` is found and `completed_at IS NULL`, the page rehydrates by fetching `GET /exam/sessions/:id` and resumes from the current question. If `completed_at` is set, hard-redirect to `/review`.

### Review flow (`WmiExamReview.tsx`)

1. Header: score badge ("17 / 25 — 68%"), duration, paper title, mascot.
2. Vertical list of `<WmiExamReviewItem>` — one per question — showing correctness icon (✓ green / ✗ red / – grey for skipped), kid's answer, correct answer, the question body (collapsed by default; tap to expand to see figure + glossary + spoiler), and `hint_en`/`hint_id` for incorrect ones.
3. CTAs: "Coba lagi" (starts a fresh `wmi_exam_sessions` row for the same paper) and "Kembali ke Latihan" (back to hub).

### Hub flow (`WmiHub.tsx`)

1. Friendly header with mascot: "Latihan WMI — pikirkan seperti juara olimpiade".
2. `<WmiGradeChips>` — Grade 0 / 1 / 2 / 3. **Default selection is Grade 0** in v1. The kid (or parent) explicitly picks a grade. No auto-mapping from the child's `age_group_id` is attempted — `age_groups` rows are seeded as age bins (`min_age`/`max_age`), not as olympiad grades, and the spec does not assume a mapping. The picked grade is remembered in `wmiStore` for the session.
3. Primary block: **"Mulai Drill"** big button → `/latihan/wmi/drill?grade=N`.
4. Secondary block: **"Latihan Soal Ujian"** — grid of `<WmiPaperCard>` for the selected grade. Each card shows year + round (Semifinal/Final), question count, the active child's best score on that paper (if any), and a "Mulai" button to `/latihan/wmi/papers/:id`.
5. Empty state per grade: friendly "Belum ada soal untuk grade ini" + mascot.

### Glossary lifecycle

- On first mount of any `/latihan/wmi/*` route, `wmiStore` fetches `/api/public/wmi/glossary` once and caches it for the session (this codebase does not use TanStack Query; zustand + an in-store `loadGlossary()` action matches the `authStore` pattern).
- Term lookup is a `Map<slug, GlossaryTerm>`.
- Unknown slugs in markup render as plain text (graceful degradation) and emit one dev-mode console warning.

### Navbar integration

`src/components/Navbar.tsx`: add one item — **"Latihan"** linking to `/latihan/wmi`, placed between "Video" and "Rapor" in the authenticated nav. No icon change to the bottom tab bar (if one exists) until planning inspects `Layout.tsx` — flagged as a planning detail.

### Content authoring workflow (v1, no admin UI)

A short `db/seed/wmi/README.md` accompanies the JSON files and documents:

- **Paper file shape** — `{ year, grade, round, title, source_url?, recommended_duration_min, questions: [ {number, body_en, body_id, answer_type, choices_en?, choices_id?, answer, figure_url?, hint_en?, hint_id?} ] }`.
- **Glossary file shape** — `[ { slug, term_en, term_id, definition_en, definition_id, example_en?, example_id? } ]`.
- **Markup** — `[[slug]]` or `[[slug|display]]` in any body / choice / hint string. Slugs must exist in `glossary.json` or load fails fast.
- **Figures** — drop PNG/JPG into `db/seed/wmi/figures/`; reference in question JSON via `figure_url: "/api/public/wmi/figures/<filename>"`. The Express handler at `/api/public/wmi/figures/:filename` reads from the same directory. No Vite `public/` copy step, no static-handler precedence to negotiate with `vercel.json` — the figure path is a normal API URL.
- **Adding a paper** — drop the JSON file in `db/seed/wmi/papers/`, run `npm run seed:wmi`. Upsert on `(year, grade, round)` and `(paper_id, number)` makes re-runs safe and idempotent.
- **`seed:wmi` script** — added to `package.json` as `"seed:wmi": "tsx db/seed/wmi/load.ts"`. The script reads `DATABASE_URL` from env, parses every `db/seed/wmi/papers/*.json` and `db/seed/wmi/glossary.json`, and upserts. Fails fast with a clear error if any `[[slug]]` in a paper body references a slug not in `glossary.json`.
- **Prod seeding workflow** — matches the existing manual-SQL bootstrap convention in CLAUDE.md. To update prod, the team runs `DATABASE_URL=…production… npm run seed:wmi` from a local checkout. Not wired into Vercel build. This is intentional v1 scope — prod content updates happen on a deliberate human-in-the-loop trigger, same as `db/schema.sql` and `db/migrations/` today. A CI-driven seed pipeline is out of scope.

### File plan

**New (`src/`)**
- `pages/WmiHub.tsx`, `pages/WmiDrill.tsx`, `pages/WmiPaperDetail.tsx`, `pages/WmiExam.tsx`, `pages/WmiExamReview.tsx`
- `components/wmi/` — `WmiGradeChips`, `WmiPaperCard`, `WmiQuestionView`, `WmiAnswerChoice`, `WmiFigure`, `WmiTranslationSpoiler`, `WmiGlossaryTerm`, `WmiGlossaryPopover`, `WmiFeedbackPanel`, `WmiExamTimer`, `WmiExamProgressBar`, `WmiExamReviewItem`
- `store/wmiStore.ts` — zustand slice (glossary cache + exam-session client state)
- `lib/wmiMarkup.ts` — pure body-string → token-array parser
- `lib/wmiApi.ts` — typed axios wrappers (every call attaches `childId` from `authStore`)
- `types/wmi.ts` — shared TypeScript types

**New (`api/`)**
- `routes/wmi-public.ts` — unauthenticated public router (glossary, figures), Joi-validated
- `routes/wmi-member.ts` — `authenticateToken`-gated member router (papers, drill, attempts, exam sessions), Joi-validated, every handler calls `assertChildOwnership` via the service layer
- `services/wmi/papers.ts`, `services/wmi/questions.ts`, `services/wmi/attempts.ts`, `services/wmi/sessions.ts`, `services/wmi/glossary.ts`

**New (`db/`)**
- `migrations/0018_wmi_practice.sql` — the tables from §Data model
- `seed/wmi/README.md` — content authoring guide + the analytics SQL snippets for `revealed_id_translation` / `looked_up_terms`
- `seed/wmi/glossary.json` — seed glossary
- `seed/wmi/papers/2024-grade-1-final.json` — sample paper
- `seed/wmi/papers/2024-grade-2-final.json` — sample paper
- `seed/wmi/load.ts` — Node script for upserting the JSON into the DB
- `seed/wmi/figures/` — figure PNG/JPGs referenced by `figure_url`

**Modified**
- `src/App.tsx` — register 5 new routes
- `src/components/Navbar.tsx` — add "Latihan" item
- `api/app.ts` — mount `/api/public/wmi` (wmi-public router) and `/api/me/wmi` (wmi-member router)
- `db/schema.sql` — include new tables for fresh installs (mirror migration)
- `package.json` — add `"seed:wmi": "tsx db/seed/wmi/load.ts"` script

**Deliberately not modified (v1)**
- `pages/Dashboard.tsx`, `pages/Report.tsx`, `pages/Badges.tsx` — no WMI surfacing
- `api/services/member.ts` `getMemberProgress` — no WMI fields in `/me/progress`
- `api/services/gamification/*` — no event fires
- `src/store/authStore.ts`, `api/middleware/auth.ts` — unchanged; the router reuses both as-is

## Components in isolation

Each new component owns one job:

- `WmiQuestionView` — pure render of a `question` plus a small `onAttempt(payload)` prop. No fetch, no routing. Drives the glossary store via the shared hook.
- `WmiGlossaryTerm` — `{ slug, display, onLookup(slug) }`. Looks up the term in the store and renders the popover trigger. Emits the lookup event so the parent can collect terms tapped for the current attempt.
- `WmiTranslationSpoiler` — `{ open, onOpen, children }`. The "open" event is the only side-effect surface; the parent owns `revealedIdTranslation` state.
- `WmiAnswerChoice` — `{ choice, state: 'idle' | 'selected' | 'correct' | 'wrong', onTap }`. Pure visual.
- `WmiFeedbackPanel` — `{ isCorrect, correctAnswer, hintEn?, hintId?, onNext }`. No fetch.
- `WmiExamTimer` — `{ deadline, onExpire }`. Self-contained countdown.
- `WmiExamProgressBar` — `{ current, total, onJump(n) }`.
- `WmiHub`, `WmiDrill`, `WmiPaperDetail`, `WmiExam`, `WmiExamReview` — thin pages: fetch + pass props.

## Error handling

| Surface | Failure | Behavior |
|---|---|---|
| Any WMI page | No active child profile selected | Reuse the existing `AuthCard` "Pilih profil anak dulu" pattern from Dashboard / Badges. Same component. |
| `WmiHub`, `WmiPaperDetail` | `GET /papers` fails | Red error card matching `Dashboard.tsx` pattern, "Coba lagi" retries. |
| `WmiDrill` | `GET /drill/next` returns no questions for grade | Empty-state with mascot: "Belum ada soal untuk grade ini" + CTA back to hub. |
| `WmiDrill` | `POST /attempts` fails after a tap | Choice un-locks, gentle toast "Gagal kirim — coba lagi", optimistic state rolled back, no streak increment. |
| `WmiExam` | `POST /attempts` fails mid-exam | Question marks as "Belum tersimpan" inline indicator, retry on next interaction. Server is the source of truth on `/complete`. |
| `WmiExam` | Tab refresh / accidental close | On mount, fetch `GET /exam/sessions/:id?childId=...`; if `completed_at IS NULL`, rehydrate and resume. If completed, hard-redirect to `/review`. The server-side timer is recomputed as `started_at + recommended_duration_min - now()` so the deadline survives refresh. |
| `WmiExam` | Parent switches to a different child profile mid-exam | The session URL belongs to the previous child. On mount, the server returns 403 (session's `child_id` does not match the supplied `childId`). The page renders a friendly "Sesi ujian ini milik profil anak yang lain" message + CTA back to hub. The original session is not auto-completed; it stays open for the original child to resume. |
| `WmiExam` / `WmiExamReview` | Logout mid-exam | In-flight `POST /attempts` get 401; client buffers them and discards on logout (the session row remains server-side and can be resumed after re-login). No partial completion is auto-triggered. |
| `WmiExam` | Timer hits 0 mid-question | Immediately submits whatever is currently answered (no penalty for unanswered), fires `PATCH /complete`, navigates to review. |
| `WmiQuestionView` | Glossary slug unknown | Render display text plain (no popover), single dev-mode console warning. Never throw. |
| `WmiQuestionView` | `figure_url` 404 | Fall back to a small placeholder, never block the question. |
| `WmiGlossaryPopover` | `/glossary` fetch fails on first mount | Render glossary spans as plain text; in-page banner "Glosarium belum dimuat — coba muat ulang" with retry. |
| `POST /attempts` exam mode | Race / duplicate POST | Partial unique index on `(session_id, question_id)` enforces single row; latest payload wins. |
| `PATCH /complete` called twice | Idempotency | If `completed_at` already set, return the existing summary (200); do not re-tally. |
| Seed loader (`seed:wmi`) | Same paper re-seeded | Upsert on `(year, grade, round)` and on `(paper_id, number)`; idempotent reruns. Missing glossary slug referenced in a paper body → fail fast with a clear error pointing to the offending file + slug. |

## Verification

No test runner is configured in this repo (per CLAUDE.md). Verification stays manual + typecheck, matching the dashboard-report-and-trophy-wall spec convention.

1. `npm run check` — extended types compile end-to-end.
2. `npm run lint` — flat config clean.
3. `npm run seed:wmi` against a local DB — one paper + glossary upserts cleanly and re-runs idempotently.
4. Manual smoke as an authenticated parent with one child profile:
   - **Hub**: switch grade chips, see paper cards, empty grades show empty state.
   - **Drill**: pick a grade, answer one correct + one incorrect; verify green/red wash, mascot, hint reveal, ID spoiler, glossary popover, streak counter.
   - **Exam**: start a paper, answer some, change one, refresh mid-exam (verify resume), let timer expire, land on review.
   - **Review**: scores match the kid's answers, hints visible on incorrect, "Coba lagi" starts a fresh session.
5. Mobile viewport check (375px, 768px) on Drill and Exam — primary target for ages 5–9 is a parent's phone.
6. Light-touch analytics check: confirm `revealed_id_translation` and `looked_up_terms` show up on attempts in the DB after a real session. Run the two README SQL snippets to confirm aggregation works; these are the v1 consumer for both columns.

## Sub-decisions

- **Tap = submit** in drill (no separate submit button) — better for ages 5–9 thumbs.
- **Route base `/latihan/wmi`** — Indonesian, namespaced for future olympiads.
- **Figure storage in-repo under `db/seed/wmi/figures/`**, served via the Express endpoint `/api/public/wmi/figures/:filename` — avoids any dependency on Vercel's static-handler precedence over the SPA rewrite. Move to Vercel Blob in v2 once content scales past a few MB.
- **Glossary loaded once per session** into zustand; not server-rendered, not paginated.
- **Exam mode upsert on `(session_id, question_id)`** — changing your mind overwrites.
- **No badge fire, no `score_attempts` write, no `gamification.events`** — clean v2 attach points reserved.
- **Glossary is seed-only in v1** — no admin UI.
- **No reading of WMI data into `/me/progress`** — separate aggregate via the per-paper card; Rapor integration is v2.

## Deferred / open items (for planning)

- **Exam-timer defaults per round.** Plan reads `recommended_duration_min` from the seed; value-per-paper is set during content authoring. Suggested defaults documented in the README (e.g., Finals 60 min, Semifinals 45 min for Grade 0–3).
- **Navbar placement at narrow viewports.** Planning must inspect `Layout.tsx` and the bottom tab bar (if any) before deciding whether "Latihan" is a top-level tab or a sub-link.
- **Translation source.** Spec assumes Indonesian translations exist *at the time the paper JSON is authored*. Whether translations are author-written or LLM-pre-translated-then-reviewed is a content-process question, not a code question. Recommended: LLM-pre-translate (the markup is preserved through translation easily) and human-review before committing.
- **Glossary growth.** Each new paper authored may surface new math vocabulary. Process: while authoring a paper's JSON, every `[[slug]]` whose slug isn't in `glossary.json` is added there too. Planning surfaces this as a checklist item in the README.
- **Public-without-login try.** Out of v1. Pattern is established if v2 wants it: a `/public/wmi/sample` route that serves a fixed set of demo questions.

### Resolved during office-hours review (not deferred)

- ~~Active-child resolution~~ — confirmed via `api/routes/member.ts` and `api/services/member.ts`: every endpoint takes `childId` as explicit param; the WMI router uses the same pattern (see "Active-child resolution" in the API surface section).
- ~~Grade → age_group default mapping~~ — dropped. Hub default is hardcoded "Grade 0"; kid/parent picks. The `age_groups` table is age-bin-shaped, not olympiad-grade-shaped, so the mapping was a false economy.
- ~~Figures served from `public/`~~ — dropped. Figures are served via the explicit Express endpoint `/api/public/wmi/figures/:filename`, removing any dependence on Vercel static-handler precedence over the SPA rewrite.

## Strategic risks (captured from office-hours review 2026-05-27)

The technical design is now buildable. These are *premise* risks the design does not refute — they require a separate decision from the team, not a code change.

1. **Unverified demand.** No QUPU user has been observed asking for WMI practice. The feature ships on a hypothesis ("Indonesian parents of math-precocious kids ages 5–9 will use this"). Cheapest test before the full v1 ships: a dashboard CTA / waitlist sign-up for 48h, or a 5-parent qualitative survey on what their kid is doing today for olympiad prep. If signal is weak, prefer a thinner wedge than v1.
2. **Wedge size.** Even with v1's "no admin tool, no LLM, no badges" cuts, this design is still 5 tables, 8 endpoints, 5 pages, 12 components, a custom markup language, and a seed pipeline. A truly minimal demand-probe is materially smaller (e.g., single hardcoded paper, drill only, no glossary, no spoiler, no exam — one page, zero migration). v1 is the right ambition *if* demand is established, and overbuilt *if* it isn't.
3. **Retention engine cut.** QUPU's retention is driven by quests / streaks / achievements / badges (the `api/services/gamification/*` engine and the `user_badge_unlocks` flow). v1 explicitly bypasses all of it. Kids may engage with WMI questions on novelty for a week, then leak back to videos (which still earn badges). Mitigation in v1 scope: a minimal `wmi_streak` indicator in `wmiStore` (already in scope) gives a small same-session loop. Mitigation deferred to v2: wire WMI completion into `gamification.events` so it counts toward quests/streaks/achievements.
4. **UX sophistication vs. age target.** The translation spoiler + glossary popover + multiple-choice + per-question feedback flow asks ages 5–9 to recognize and use ~4 distinct affordances. Pre-readers don't reliably understand "tap an underlined word for a definition." A paper-prototype session with one real 6-year-old (sitting silently while they try the flow) is the cheapest validation; should happen before the spec is implemented.
5. **Parent vs. kid as primary stakeholder.** The brainstorm settled on "kid alone, self-directed" early; the design follows from that. In practice, olympiad-level questions for ages 5–9 are co-piloted by a parent in almost every house. The design is mostly fine for co-pilot use, but: (a) the glossary may end up parent-aimed, not kid-aimed; (b) the spoiler-as-English-training claim is weakened — parents reading aloud will translate live, ignoring the spoiler entirely.

The design proceeds as-written only if the team accepts these premises. If any of them flip under scrutiny, the right next step is a narrower wedge (see "Alternatives the brainstorm closed too early" in the 2026-05-27 office-hours review) rather than the v1 in this doc.

## Next Steps

→ Invoke `superpowers:writing-plans` to produce a phased implementation plan covering: migration + schema mirror + seed loader (+ `seed:wmi` script); public router (glossary, figures) + member router (papers, drill, attempts, exam sessions); frontend store + markup util + question renderer; drill flow; exam flow + session resume + child-switch ownership check; review flow; hub + paper detail + navbar; manual verification.
