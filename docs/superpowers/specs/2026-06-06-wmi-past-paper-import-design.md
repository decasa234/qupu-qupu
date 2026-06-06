# WMI Past-Paper Import Pipeline — Design

**Date:** 2026-06-06
**Status:** Approved (pending spec review)

## Goal

Turn the real WMI past papers sitting on disk (`wmiPastPaper/`) into the app's
existing practice-paper format so students can practice **real exams**. Deliver
one validated vertical slice first (2019 Final, grades G00–G03, Paper A), then
batch the remaining sets with the same converter.

## Why this is high-impact

- The concept/explainer library is essentially complete (72 approved / 1 pending).
- The papers feature is fully built (table, questions, API, frontend) but the DB
  holds **one** paper (2024 G1). Meanwhile **168 folders** of real WMI papers
  (2019–2025, Prelim + Final, G00–G03, Paper A/B + answer keys) sit unused on disk.
- Real past exams are the strongest differentiator for serious students/parents,
  and the consuming feature already exists — so the marginal work is "produce
  content in the existing contract," not "build a feature."

## Key insight / architecture

The DB-insert side is **already done**:

- `db/seed/wmi/load.ts` ingests paper JSON files from `db/seed/wmi/papers/` (shape
  `PaperFile`) and figures from `db/seed/wmi/figures/`.
- `api/routes/wmi-public.ts` serves figures at `GET /api/public/wmi/figures/:filename`
  from `db/seed/wmi/figures/`.
- `api/services/wmi/papers.ts` + `WmiPapers`/`WmiPaperDetail` render them.

So this project is a **build-time converter** that emits the existing `PaperFile`
JSON contract plus copied figures. Output is committed static seed data (exactly
like today's `2024-grade-1-final.json`). **No runtime LLM call and no new runtime
dependency** — the LLM is used once, during implementation, to produce the JSON,
which is then committed and loaded deterministically.

### Source format (per folder)

Each `wmiPastPaper/<set>/` is a MinerU-style PDF extraction containing:

- `full.md` — the questions as markdown: bilingual (English + Traditional Chinese,
  the Chinese often duplicated as an OCR artifact), inline figures
  `![](images/<hash>.jpg)`, and AI alt-text in `<details><summary>natural_image</summary>…</details>`.
- `images/` — the extracted figure images.
- structured JSON (`content_list*.json`, `model.json`, `layout.json`) and `origin.pdf`
  (available if richer structure is needed; `full.md` is the primary source).

Each paper has **two sections**: **Logical Reasoning** (multiple-choice A–D,
numbered 1–15) and **Applications** (fill-in numeric, numbered 1–10). The matching
`… Answer Key` folder's `full.md` holds the answers as HTML `<table>`s, one row of
numbers and one row of answers, per section.

### Target contract (existing, do not redesign)

`PaperFile` (from `db/seed/wmi/load.ts`):

```
{ year, grade, round: 'semifinal'|'final', title, source_url?,
  recommended_duration_min, questions: PaperQuestion[] }

PaperQuestion = { number, body_en, body_id,
  answer_type: 'multiple_choice'|'fill_in',
  choices_en?: {label,text}[], choices_id?: {label,text}[],
  answer, figure_url?, hint_en?, hint_id?, difficulty? }
```

`wmi_questions.body_*` may contain `[[glossary-slug]]` / `[[slug|text]]` markup, and
`load.ts` **validates referenced slugs against `glossary.json`** — so extracted
text must be **plain** (no invented markup).

## Decisions (locked)

1. **Extraction = LLM-assisted, build-time.** Robust to the OCR mess and bilingual
   split; emits committed JSON. Validated + spot-checked, not trusted blindly.
2. **Vertical slice first** — 2019 Final, G00–G03, Paper A (4 papers, ~100 questions).
   Prove the pipeline end-to-end before batching ~112 papers.
3. **Translate to Indonesian** — `body_id`/`choices_id`/`hint_id` are real
   Indonesian translations (consistent with QUPU's audience).
4. **Add a `variant` column** for Paper A/B (schema can't otherwise hold both).
5. **Continuous numbering** across the two sections (Reasoning 1–15 → 1–15,
   Applications 1–10 → 16–25) rather than adding a `section` column — no schema
   churn, the UI already keys on `number`. (A `section` column is a possible later
   enhancement; YAGNI now.)
6. **Round mapping:** Prelim → `semifinal`, Final → `final`.

## Components

### 1. Schema migration

- New migration `db/migrations/0030_wmi_paper_variant.sql` (next free number after
  `0029`; renumber if a parallel branch lands a `0030` first):
  - `ALTER TABLE wmi_papers ADD COLUMN variant TEXT NOT NULL DEFAULT 'A' CHECK (variant IN ('A','B'));`
  - Drop `wmi_papers_year_grade_round_unique`; add `UNIQUE (year, grade, round, variant)`.
- Mirror the change in `db/schema.sql` (fresh installs include it).
- Thread `variant` through: `PaperFile`/`load.ts` (insert + upsert key), the
  `papers.ts` service (`listWmiPapers`, `getWmiPaperDetail`), the API response
  shape, and the title/label in `WmiPapers`/`WmiPaperDetail` (e.g. "Paper A").

### 2. Extraction (build-time)

For each source set, produce one `PaperFile` JSON (`db/seed/wmi/papers/2019-final-g1-a.json`):

- Parse the paper `full.md`: split the two sections; per question capture the
  English stem, the (A)–(D) choices (Reasoning), and any inline figure.
- Renumber continuously: Reasoning → 1–15 (`multiple_choice`), Applications →
  16–25 (`fill_in`).
- Clean OCR noise; drop the duplicated Chinese lines. `body_en` from English;
  `body_id` = Indonesian translation; `choices_id` translated. Plain text only.
- Figures: copy the referenced `images/<hash>.jpg` into `db/seed/wmi/figures/`
  with a stable name `<year>-<round>-g<grade>-<variant>-q<number>.<ext>`; set
  `figure_url = /api/public/wmi/figures/<name>`.
- Answers: deterministic parse of the answer-key HTML tables → map (section,
  number) → answer; inject `answer` per question (`A`–`D` for MC, the numeric
  string for fill-in).
- `round` per the folder; `recommended_duration_min` from the paper's stated time
  else 60; `title` e.g. `WMI 2019 Grade 1 Final — Paper A`.

### 3. Validation script

`db/seed/wmi/validate.ts` (or a `--check` mode of the loader), per paper:

- question count matches the answer key (15 + 10 = 25 expected; report deviations);
- every `multiple_choice` has exactly 4 choices and `answer ∈ {A,B,C,D}`;
- every `fill_in` has a non-empty `answer`;
- every `figure_url` resolves to a file in `db/seed/wmi/figures/`;
- `number`s are contiguous and unique.

Fails loudly with a per-paper report; flags low-confidence questions for human
spot-check. This is the automated quality gate before load.

### 4. Load + verify

Run `load.ts`; open `WmiPapers`/`WmiPaperDetail` for the slice; confirm figures,
choices, answers, and EN/ID rendering. Spot-check one paper per grade.

## Data flow

```
wmiPastPaper/<set>/full.md + <set> Answer Key/full.md + images/
        │  (build-time extraction + answer-key parse + figure copy)
        ▼
db/seed/wmi/papers/2019-final-g1-a.json   +   db/seed/wmi/figures/*.png
        │  (validate.ts gate)
        ▼
db/seed/wmi/load.ts  →  wmi_papers / wmi_questions  →  papers API  →  app
```

## Scope

- **This plan:** schema migration + converter + validation + the **2019 Final
  G00–G03 Paper A** slice (4 papers), loaded and verified in the app.
- **Follow-on (same converter, later plan):** batch the remaining sets year by
  year (2019–2025, Prelim + Final, all grades, Paper A + B), validating each batch.

## Testing

- Validation script (counts, choice/answer integrity, figure resolution, numbering)
  is the primary automated gate.
- A loader test: `load.ts` ingests the slice JSON without error and the rows match
  the JSON.
- Manual spot-check: one paper per grade rendered in the running app.

## Risks / mitigations

- **OCR / extraction errors** → validation script + per-paper human spot-check;
  the slice is small enough to eyeball fully.
- **Format drift across years** → vertical slice proves one year first; batching
  later surfaces drift per-year with the validator as the gate.
- **Translation quality** → spot-check during slice review; translations are
  static and editable post-hoc.
- **Figure name collisions** → stable deterministic naming keyed by
  year/round/grade/variant/number.

## Out of scope

- No runtime LLM service. No re-architecture of the papers feature, API, or UI
  beyond threading `variant`. No `section` column. No batching of all 112 papers
  in this plan (follow-on).
