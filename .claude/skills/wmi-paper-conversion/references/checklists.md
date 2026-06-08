# WMI Paper Conversion — Quality Gates & Verification

Re-read during Phase 1 (the answer gate) and Phase 5 (all gates).

## Gate 1 · Layout-QA (both dimensions)

**Reconstruction — the figure matches the source:**
- The SVG reproduces the source figure's shapes, counts, positions, and labels.
- The numbers shown in the figure equal the question's `quantities` / `answer`.
- When the OCR figure is ambiguous, the reconstruction must be the **unique**
  assignment consistent with the answer (see the recovery note atop
  `src/components/wmi/paperQuestions/ShapeEquationIllustration.tsx`).

**On-screen — it renders cleanly:**
- The viewBox has headroom on all four sides — no arc/stroke bleeds past an edge.
  (Q23: the lock shackle arced to `y=-2`, above the viewBox top, and was clipped
  flat by `overflow-hidden`; fixed with a negative-min-y viewBox in
  `LockCodeIllustration.tsx`.)
- Content is centered, not hugging a reserved-but-empty column. (Q18: the equations
  hugged the left because the badge column only the explainer uses was reserved;
  fixed by centering the equation block when no badges show.)
- Border/padding is consistent with sibling illustrations
  (`my-4 … rounded-lg border-2 border-qupu-cream-dark bg-white p-2`).
- It renders cleanly in BOTH the question card and the explainer — they share the
  figure component.

## Gate 2 · Answer-correctness
- Independently solve each question; reconcile with the parsed answer-key value.
- The count of answers must equal the count of questions.
- Figure-dependent answers must follow from the reconstructed figure.
- Any mismatch → stop and surface to the user; do not guess.

## Gate 3 · Step-quality
- Aim for 3–5 short, grade-appropriate `hint_steps_en/id`.
- The arithmetic reconciles with `quantities`, and the final line states the
  `answer`.

## Gate 4 · Breakdown schema
Fields (type `Breakdown` in `api/services/wmi/concepts/types.ts`, mirrored to
`src/types/wmi.ts`; worked examples in `db/seed/wmi/papers/2019-final-g1.json`):
`needsVisual`, `highlights[{category, phrase_en, phrase_id, note_en, note_id}]`,
`quantities[{label_en, label_id, value}]`,
`strategy{name_en, name_id, conceptSlug?}`,
`trap{wrong, why_en, why_id} | null`, `answer{form, unit, value}`,
`vocab?: string[]` (optional glossary chips).

- `category` ∈ `fact` | `condition` | `question`.
- Every `phrase_en/id` is an **exact substring of the display body** — the text
  after `stripSectionLabels(body)` AND resolving glossary `[[slug|label]]`→`label`.
  Verify the display text with:
  ```
  parseWmiMarkup(stripSectionLabels(body)).map(s => s.text).join('')
  ```
  (helpers: `src/lib/wmiMarkup.ts` + `src/lib/wmiBreakdown.ts`).
- `trap` is `null` unless a genuine tempting wrong answer exists.
- For multiple-choice questions, `answer.form: 'choice'` and `answer.value` is the
  choice label (e.g. `"B"`).

## Verification commands
Run from the repo root. DB-touching commands use `dangerouslyDisableSandbox: true`
(LAN Postgres).

- **Typecheck:** `npm run check`
- **Lint:** `npm run lint` — 0 errors; `react-refresh/only-export-components`
  warnings are expected and OK.
- **SSR smoke** — render the new illustration + explainer to `<svg>` in en+id. Create
  `__smoke.tsx` at the repo root (so `react-dom` and the `@/` alias resolve) with the
  content below, run `npx tsx __smoke.tsx`, then delete it. Expected: four `true` lines
  (for an explainer-only question with no `Illustration`, drop the `Illustration` import
  and its two lines, and expect two).
  ```ts
  import { renderToStaticMarkup } from 'react-dom/server'
  import { createElement as h } from 'react'
  import Illustration from '@/components/wmi/paperQuestions/<Thing>Illustration'
  import Explainer from '@/components/wmi/paperQuestions/<Thing>Explainer'
  const p = { correctAnswer: '', params: {} } as any
  for (const lang of ['en', 'id'] as const) {
    console.log('illus', lang, renderToStaticMarkup(h(Illustration)).includes('<svg'))
    console.log('expl ', lang, renderToStaticMarkup(h(Explainer, { ...p, lang })).includes('<svg'))
  }
  ```
- **Reseed + smoke:** `npm run seed:wmi`, then confirm the question's
  `breakdown` / `hint_steps` are present and well-formed.
- **Paper validation:** `npm run wmi:validate` → ✓.
