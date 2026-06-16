# Admin Review — AI↔Human Synergy (Papers & Concepts)

- **Date:** 2026-06-17
- **Status:** Approved design (brainstorming) → ready for implementation plan
- **Branch context:** `feat/wmi-concept-taxonomy`
- **Related:** `2026-06-07-admin-wmi-drill-review-design.md`, `2026-06-15-wmi-paper-full-review-design.md`, the `qupu-math-problem-creation` skill (four-role method)
- **Wireframes:** `.superpowers/brainstorm/<session>/content/{concept-page,paper-page,queue}.html` (gitignored)

## Problem / Context

The admin has two review surfaces:

- **`src/pages/admin/AdminWmiConcepts.tsx`** — concept proofreading. Concepts are generated **live by code** (generators + illustration + explainer + steps); metadata lives in `taxonomy.ts`. There is no stored content text to edit.
- **`src/pages/admin/AdminWmiDrill.tsx`** — paper review. Paper questions are **stored rows** in `wmi_questions` (body, answer, choices, hints, `hint_steps`, `breakdown`, `visual`).

Today each surface stores exactly **one verdict + one free-text notes blob** per item (`wmi_concept_reviews` keyed by slug, `wmi_paper_reviews` keyed by paper_id — both: `status ∈ {pending,approved,needs_changes}`, `notes`, `reviewed_by`, `updated_at`). The content is AI-generated/enriched, but there is:

- no way to flag a problem on a **specific part** of a question/concept,
- no **stateful** issue the human and the AI can both work,
- no **machine-readable channel** for Claude Code to pick up flagged problems and report fixes back.

Reviewing is coarse and the human↔AI handoff is ad hoc.

## Goals

1. **Per-part review** — flag a problem on a specific part (stem, answer, choices, breakdown, illustration, steps, animation, trap, meta).
2. **Fix-loop queue** — a stateful issue with a lifecycle both human and AI work, with a clear "fixed → re-review" signal back to the human.
3. **AI visibility** — see what is flagged, what Claude is working on / has fixed, and what is missing or not-AI-actionable, at a glance.
4. **Faster triage** — jump to next unreviewed / next with open issues, keyboard-driven, with bulk batch handoff to Claude.
5. **Hybrid fix paths** — in-app quick-fix for simple paper text; Claude Code for everything structured or generated.

## Non-goals

- **No server-side LLM / in-app autonomous AI fixing.** No API keys, no per-request cost. Claude acts via Claude Code sessions that read the queue. (User chose "Hybrid": structured issues Claude consumes + lightweight in-app edits.)
- **No merge of the two pages** into a single workbench. They stay separate but share this data model (a future unified workbench can be built on the same `wmi_review_issues` table without rework).
- **No change to the existing verdict semantics** beyond making the 3-way verdict a *suggested* roll-up the human still confirms.

## Data model

One new table. Existing `wmi_paper_reviews` / `wmi_concept_reviews` are unchanged (they remain the item-level verdict + summary notes).

Migration: **`db/migrations/0036_wmi_review_issues.sql`** (next sequential number; latest existing is `0035`). Also add to `db/schema.sql`.

```sql
CREATE TABLE IF NOT EXISTS wmi_review_issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   TEXT NOT NULL CHECK (target_type IN ('paper','paper_question','concept')),
  paper_id      UUID REFERENCES wmi_papers(id)    ON DELETE CASCADE,   -- paper, paper_question
  question_id   UUID REFERENCES wmi_questions(id) ON DELETE CASCADE,   -- paper_question
  concept_slug  TEXT,                                                  -- concept (no FK; mirrors wmi_concept_reviews)
  part          TEXT NOT NULL CHECK (part IN
                  ('stem','answer','choices','hint','breakdown','illustration',
                   'steps','animation','trap','meta','other')),
  severity      TEXT NOT NULL DEFAULT 'warning'
                  CHECK (severity IN ('blocker','warning','nit')),
  title         TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','in_progress','fixed','verified','wont_fix')),
  ai_actionable BOOLEAN NOT NULL DEFAULT TRUE,
  fix_note      TEXT,
  created_by    TEXT,
  resolved_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  -- shape guards: the right target columns are set for each target_type
  CHECK (
    (target_type = 'concept'        AND concept_slug IS NOT NULL AND paper_id IS NULL AND question_id IS NULL) OR
    (target_type = 'paper'          AND paper_id IS NOT NULL     AND question_id IS NULL AND concept_slug IS NULL) OR
    (target_type = 'paper_question' AND paper_id IS NOT NULL     AND question_id IS NOT NULL AND concept_slug IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_wmi_issues_status_ai   ON wmi_review_issues (status, ai_actionable);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_paper       ON wmi_review_issues (paper_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_question    ON wmi_review_issues (question_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_concept     ON wmi_review_issues (concept_slug);
```

### Part taxonomy

The clickable parts of a question/concept, and how each is fixed:

| part | meaning | paper fix path | concept fix path |
|---|---|---|---|
| `stem` | question text EN/ID | ✎ quick-fix | Claude (generator) |
| `answer` | correct answer | ✎ quick-fix | Claude (generator) |
| `choices` | MC option labels | ✎ quick-fix | Claude (generator) |
| `hint` *(stored on question as `hint_en/id`)* | single-line hint | ✎ quick-fix | Claude (generator) |
| `breakdown` | color-coded highlights (JSON) | Claude | Claude |
| `illustration` | in-card figure | Claude (visual params) | Claude (component) |
| `steps` | `hint_steps` array | Claude | Claude (explainer) |
| `animation` | explainer | Claude | Claude (explainer) |
| `trap` | trap note | Claude | Claude |
| `meta` | difficulty / strand / grade / name / tags | Claude (`taxonomy.ts`) or in-app where stored | Claude (`taxonomy.ts`) |
| `other` | catch-all | — | — |

> Note: `hint` is its own enum value (it maps to the question's stored `hint_en`/`hint_id`). `other` is a catch-all so rare cases never need a migration.

### Lifecycle (the shared state machine)

```
open ──claim──▶ in_progress ──apply fix──▶ fixed ──human confirms──▶ verified ✅
  ▲                                          │
  └──────────────── reopen (regression) ─────┘
open / in_progress ──can't / shouldn't fix──▶ wont_fix (with reason) ✅
```

- **open** — flagged, unclaimed.
- **in_progress** — Claude Code or the human is actively working it (`resolved_by` not yet set).
- **fixed** — change applied, `fix_note` written, `resolved_by` set (e.g. `claude-code`), **awaiting human re-review**. This drives the loop back to the human.
- **verified** — human confirmed; closed.
- **wont_fix** — intentionally skipped (e.g. "figure missing, needs original PDF"), with a reason in `fix_note`; closed.

### Verdict roll-up (suggested, human-confirmed)

The existing 3-way verdict stays human-controlled but is *suggested* from issues:

- any `open`/`in_progress` **blocker** → suggest **needs_changes**;
- all issues `verified`/`wont_fix` (and the human approves) → eligible for **approved**;
- otherwise unchanged.

The UI shows the suggestion; the human clicks to set it.

## API

New `api/services/wmi/reviewIssues.ts` (SQL + rules) and routes mounted under the existing admin router (`authenticateToken + requireAdmin`). Validate with Joi.

```
GET   /api/admin/wmi/issues
        ?status=&ai_actionable=&target_type=&concept_slug=&paper_id=&question_id=&part=&severity=
        → list (used by the per-item panels, the Review Queue, and Claude Code)
POST  /api/admin/wmi/issues
        body: { target_type, paper_id?, question_id?, concept_slug?, part, severity?, title, detail?, ai_actionable? }
        → creates an 'open' issue (created_by = req.user.email)
PATCH /api/admin/wmi/issues/:id
        body: { status?, fix_note?, severity?, ai_actionable?, title?, detail? }
        → transitions / edits; sets resolved_by + resolved_at when moving to fixed/verified/wont_fix
```

**`ai_actionable` defaults:** `TRUE` for concept parts and paper structured parts; the human flips it to `FALSE` for issues that need an external asset or original PDF (these stay human-only and are visually distinct so they never sit in Claude's queue).

## The AI loop (the "synergy")

No server-side AI. The channel is **structured issues + a copy-to-clipboard handoff** that the human pastes into a Claude Code session (like the one that produced this spec). User confirmed this mechanism over autonomous polling.

**Copy-for-Claude** serializes selected open `ai_actionable` issues into a clean markdown block:

- target identity (concept `slug` / paper code + question number),
- `part`, `severity`, `title`, `detail`,
- file pointers derivable from the target: concept `slug` → generator / `getIllustration` / `getExplainer` registries; paper `question_id` → DB row.

Available **per item** (one concept/paper) and **bulk** (multi-select in the Review Queue → hand Claude a whole batch).

**Claude Code workflow:** read open `ai_actionable` issues (via the copied block or `GET /issues`) → `PATCH` to `in_progress` → edit code/data → `PATCH` to `fixed` with a `fix_note` and `resolved_by = 'claude-code'` → the item surfaces "fixed — awaiting re-review" for the human to **verify**.

## Fix paths by type (the papers/concepts asymmetry)

| | Paper question | Concept |
|---|---|---|
| Simple text (typo in hint, wrong label/answer) | **In-app quick-fix**: inline editor edits the `wmi_questions` row → Save → issue → `verified`. No Claude. | Not possible (generated). → Claude. |
| Structured (breakdown JSON, `hint_steps`, visual params, illustration, animation, generator logic) | Claude Code | Claude Code (generator / explainer / illustration / `taxonomy.ts`) |

Quick-fix is intentionally limited to **simple text fields** (`stem` EN/ID, `answer`, `choices` labels, `hint`); structured JSON routes to Claude because hand-editing it in a textarea is error-prone.

## UI surfaces

### Concept review page (`AdminWmiConcepts.tsx`, enhanced)

- **Sidebar:** today's strand→topic tree + per-concept badges: open-issue count + "fix awaiting re-review" dot.
- **Header:** existing id/name/capability chips + suggested-verdict pill + **Copy issues for Claude** button + verdict control.
- **Issues panel (stacked directly under the header):** per-issue part tag, severity dot, title, status chip, contextual actions (Claim / Verify / Reopen); `fixed` issues show Claude's `fix_note` inline; **+ Flag issue**.
- **Preview sections** (Question / Answer / Steps / Animation / Trap) each gain a **⚑ flag** to file an issue on that exact part.

### Paper review page (`AdminWmiDrill.tsx`, enhanced)

- **Sidebar:** existing brand tabs + filters + paper list, plus per-paper open-issue badge + re-review dot.
- **Question-by-question:** existing Prev/`n/total`/Next + **"next Q with open issues"** jump.
- **Per-part actions on the current question:** simple text parts get **⚑ flag + ✎ quick-fix**; structured parts get **⚑ flag → Claude**.
- **Quick-fix editor:** inline EN/ID (and answer/hint) editor → Save writes the `wmi_questions` row and marks the issue `verified`.
- **Issues panel:** scoped **on this question** vs **in this paper**, toggleable.

### Review Queue (new view)

- **Route:** `/admin/wmi/review` (a new admin route; also linkable as a tab from both pages).
- Cross-item list of all issues with filters: target type · status · **AI-actionable only** · severity · strand/brand.
- Summary counts (open / in-progress / fixed-awaiting / AI-actionable / needs-external-asset).
- **Pinned "Fixed by Claude — awaiting your re-review"** section with Verify / Reopen + `fix_note`.
- **Open issues with multi-select** → **Copy selected for Claude**, bulk Claim, bulk Won't-fix.

### Triage & keyboard (both pages + queue)

`j/k` navigate · `f` flag part · `e` quick-fix (paper) · `v` verify · `c` copy-for-Claude. Jumps: next-unreviewed / next-with-open-issues / next-paper.

## Phasing (each phase independently shippable)

- **Phase 1 — Issues core:** `0036` migration + `schema.sql`; `services/wmi/reviewIssues.ts` + the 3 endpoints; client API in `wmiAdminApi.ts`; per-part ⚑ flag + per-item Issues panel + lifecycle chips + suggested verdict on **both** pages. → *per-part review* + the basic loop.
- **Phase 2 — AI handoff + paper quick-fix:** Copy-for-Claude (item + bulk); the Review Queue view + route; paper inline quick-fix editor (simple fields → `wmi_questions`); `ai_actionable` defaults/toggle; document the Claude `PATCH`-to-`fixed` flow (and reference it from the `qupu-math-problem-creation` skill). → *fix-loop queue* + *hybrid*.
- **Phase 3 — Triage + visibility:** keyboard nav; next-* jumps; sidebar badges + re-review dots; pinned re-review section in the queue. → *faster triage* + *AI visibility*.

## Testing / validation

No test runner is configured. Validate via:
- `npm run check` (typecheck) after each phase.
- Manual admin walkthrough: flag → (Claude fix or quick-fix) → re-review → verify, on one concept and one paper question.
- A focused unit for `reviewIssues` transition rules can be added if/when a harness exists (mirrors the existing `registry.test.ts` style).
- Apply the migration in numeric order; fresh `schema.sql` installs include it.

## Risks / open questions

- **Verdict roll-up** must never auto-change the saved verdict — only suggest. Keep human-confirmed.
- **Concept slug stability:** issues keyed by `concept_slug` could orphan if a slug is renamed in `taxonomy.ts`. Treat renames as a data migration (update issues' `concept_slug`). Low frequency.
- **`ai_actionable = false` issues** must be visually distinct so they don't pollute Claude's queue or the "AI-actionable only" filter.
- **Queue scale** is fine at current volume (tens–hundreds of issues); revisit pagination only if it grows large.
