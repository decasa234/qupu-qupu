# Paper import brief (first-iteration / vision extraction)

Reusable instructions for extracting ONE competition paper into its seed JSON by
**reading the PDF directly** (the Read tool renders each page — read EVERY page).
This is the IMPORT pass: bilingual question text + choices + answer only.

## Per-dispatch parameters (the controller fills these)
- `BRAND`, `YEAR`, `LEVEL`, `ROUND`, `CODE` (e.g. ikmc / 2019 / preecolier / contest / IKMC-19-PE)
- `QUESTION_PDF` — absolute path, read all pages
- `ANSWER_SOURCE` — an answer-key PDF path (find the right level's column) OR the literal `SOLVE` (no key: solve each yourself and verify; flag low confidence)
- `SEED_FILE` — `db/seed/<brand>/papers/<year>-<round>-<level>[-<variant>].json` (a shell with `"questions": []`)

## Do
1. Read all pages of `QUESTION_PDF`. Read `ANSWER_SOURCE` (if a PDF) and locate this level's answers.
2. EDIT `SEED_FILE`: keep its header fields, replace `"questions": []` with the questions array.
3. Per question (continuous `number` 1..N, paper order):
   - `body_en`: faithful English transcription of the stem. Do NOT describe figures inside the body; for a figure-based stem transcribe only the words.
   - `body_id`: natural kid-level Indonesian translation (identical numbers/symbols).
   - `answer_type`: `"multiple_choice"` (with `choices_en`/`choices_id`, labels A.. , 4 or 5 options) OR `"fill_in"` (no choices; `answer` is the value).
   - `answer`: from `ANSWER_SOURCE`. MCQ → a single letter A–E. fill_in → the exact value. NEVER guess; if SOLVE, solve + double-check.
   - `figure_url`: `null` (figures are redrawn in a later visual pass).
   - When option art is image-only (shapes/diagrams, not text), put a short placeholder `{"label":"A","text":"(figure A)"}` and FLAG that question number.
   - Do NOT author `breakdown` or `hint_steps` (separate enrichment pass).
4. The file must stay valid JSON.

## Verify before reporting
- Contiguous numbering 1..N; answer count == question count; MCQ answers ∈ A–E and match the key; fill_in answers non-empty.
- `cd <worktree> && npm run wmi:validate 2>&1 | grep -iE '<seed-file-name>|All papers valid|✗'` → must show ✓ for this file. Fix until valid.

## Report (≤12 lines)
question count; flagged figure-dependent question numbers; validate result; any answer-key mismatch or low-confidence questions (so the human can spot-check). This is vision transcription — surface uncertainty, don't hide it.
