# WMI Seed Content

Hand-authored past-paper JSON and glossary content that `npm run seed:wmi`
upserts into the WMI tables. No admin UI in v1; adding a paper means dropping a
JSON file here and re-running the script.

## Files

- `glossary.json`: array of glossary terms.
- `papers/<year>-grade-<n>-<round>.json`: one file per paper.
- `figures/`: PNG/JPG figures referenced from `figure_url` in question JSON.

## Markup

Use `[[slug]]` or `[[slug|display]]` inside question, choice, or hint strings.
Every slug must exist in `glossary.json` or the seed fails before DB writes.

## Analytics

Most-tapped glossary terms:

```sql
SELECT slug, COUNT(*) AS taps
FROM wmi_attempts CROSS JOIN LATERAL unnest(looked_up_terms) AS slug
GROUP BY slug ORDER BY taps DESC LIMIT 20;
```

Translation-reveal rate per question:

```sql
SELECT q.paper_id, q.number,
  SUM(CASE WHEN a.revealed_id_translation THEN 1 ELSE 0 END)::numeric / COUNT(*) AS reveal_rate
FROM wmi_attempts a JOIN wmi_questions q ON q.id = a.question_id
GROUP BY q.paper_id, q.number ORDER BY reveal_rate DESC;
```

## Importing real past papers (`wmiPastPaper/`)

Each source set is a folder pair: `<Year> WMI <Round> G0N Paper <A|B>/` (questions)
and `<Year> WMI <Round> G0N Answer Key/` (answers). Each folder has `full.md`
(markdown, bilingual English + Chinese), `images/` (figures), and JSON metadata.

**"Paper A" and "Paper B" are the two SECTIONS of one exam, not variants.**
Paper A = the multiple-choice "Logical Reasoning" section; Paper B = the fill-in
"Applications" section; the single Answer Key folder covers both. Merge them into
**one** `papers/<year>-<round>-g<grade>.json` with continuous numbering: Paper A
questions first (`multiple_choice`), then Paper B questions (`fill_in`). The
`variant` field stays `"A"` on every paper (the column exists for possible future
real variants; we don't surface it). Lower grades vary — follow the ACTUAL
question/answer counts per grade (e.g. G0 uses 3 picture-choices ①②③, not A–D —
see the deferred-G0 note at the end).

**Procedure per exam (merging both section folders):**

1. **Answers.** Run the answer-key parser on the answer-key `full.md` to get the
   number→answer maps (Reasoning A–D; Applications numeric):

   ```bash
   npx tsx -e "import('node:fs').then(async fs=>{const {parseAnswerKey}=await import('./api/services/wmi/paperImport/answerKey.ts');console.log(JSON.stringify(parseAnswerKey(fs.readFileSync(process.argv[1],'utf8')),null,1))})" "wmiPastPaper/2019 WMI Final G01 Answer Key/full.md"
   ```

2. **Questions.** Read BOTH section files: `... Paper A/full.md` (the
   multiple-choice section) and `... Paper B/full.md` (the fill-in section). For
   each question emit a `PaperQuestion`:
   - **Renumber continuously across both files:** Paper A → `number` 1..M
     (`answer_type: "multiple_choice"`); Paper B → `number` M+1.. (`answer_type:
     "fill_in"`), where M is Paper A's actual question count (typically 15).
   - `body_en` = the English stem, cleaned of OCR noise. **Drop the duplicated
     Chinese lines.** **Plain text only — no `[[ ]]` glossary markup.**
   - `body_id` = a natural Indonesian translation of the stem.
   - For MC, `choices_en` = the `(A)`–`(D)` options as `{label,text}`;
     `choices_id` = translated options (numbers/symbols stay the same).
   - `answer` = from step 1 (`"B"` for MC at that number; the numeric string for
     fill-in). The count of answers must equal the count of questions.
   - **Figure:** if the question shows `![](images/<hash>.<ext>)`, set
     `figure_url` to `/api/public/wmi/figures/` + `figureName(meta, number, ext)`
     and copy the image (step 3). Use the `<details>natural_image</details>`
     alt-text only to understand the figure, never as body text.
   - Omit `hint_en`/`hint_id`/`difficulty` (past papers have none).

3. **Figures.** For each figure, copy it to `figures/` under its stable name:

   ```bash
   npx tsx -e "import('node:fs').then(fs=>fs.copyFileSync(process.argv[1],process.argv[2]))" "wmiPastPaper/2019 WMI Final G01 Paper A/images/<hash>.jpg" "db/seed/wmi/figures/2019-final-g1-a-q1.jpg"
   ```
   (figure filenames keep the `-a-` infix from `figureName(meta, …)` with `variant: "A"` — that's fine; they're opaque keys.)

4. **Paper header:** `year`, `grade` (G00→0…G03→3), `round` (Prelim→`semifinal`,
   Final→`final`), `variant: "A"`, `recommended_duration_min` (from the paper
   if stated, else 60), `title` = `WMI <year> Grade <grade> <Round>`.

### Deferred: Grade 0 (G00)

G0 papers use 3 picture-choices labelled ①②③ (not A–D) and are heavily
figure-driven with irregular numbering. They need the validator relaxed to accept
3-option MC (labels A–C) before import. Deferred from the first slice (G1–G3).

5. **Validate:** `npm run wmi:validate` until the paper reports `✓`.

### Worked example (2019 Final G1 Paper A, question 1)

Source `full.md`:

```
1) Count. How many h 's are there?
![](images/53947e6a...jpg)
(A) 44  (B) 48  (C) 52  (D) 54
```

Answer key: Reasoning #1 = `B`. Emitted JSON:

```json
{
  "number": 1,
  "body_en": "Count. How many h's are there?",
  "body_id": "Hitunglah. Ada berapa banyak huruf h?",
  "answer_type": "multiple_choice",
  "choices_en": [
    { "label": "A", "text": "44" }, { "label": "B", "text": "48" },
    { "label": "C", "text": "52" }, { "label": "D", "text": "54" }
  ],
  "choices_id": [
    { "label": "A", "text": "44" }, { "label": "B", "text": "48" },
    { "label": "C", "text": "52" }, { "label": "D", "text": "54" }
  ],
  "answer": "B",
  "figure_url": "/api/public/wmi/figures/2019-final-g1-a-q1.jpg"
}
```

(and the image is copied to `db/seed/wmi/figures/2019-final-g1-a-q1.jpg`.)
