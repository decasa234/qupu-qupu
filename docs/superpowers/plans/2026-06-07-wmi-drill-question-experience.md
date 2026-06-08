# WMI Drill Question Experience (Concept-parity) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give WMI Drill (mock-exam) questions a toggleable "Q" breakdown and a post-answer step-by-step (like WMI Concept), and switch WMI-19F1 Q1 to a spaced/tilted star illustration with a fitting question.

**Architecture:** Add a `hint_steps` field to paper questions (migration → loader → DTOs → frontend types) and render the breakdown toggle (self-managed when the host doesn't control it) + a post-answer `WmiSteps` list in the single `WmiQuestionView`. Rename the candy visual components to stars (wider spacing + per-item tilt) and re-point the per-question registry.

**Tech Stack:** Express + `pg` (ESM, `.js`-suffixed relative imports under `api/`), React + Vite + Tailwind + framer-motion, `vitest`. Spec: `docs/superpowers/specs/2026-06-07-wmi-drill-question-experience-design.md`.

---

## Context the implementer must know

- **`npm run check`** = `tsc --noEmit`. **`npm run test`** = `vitest run` (`api/**/*.test.ts`, `src/**/*.test.ts`). **`npm run lint`** = `eslint .` (a few pre-existing `react-refresh/only-export-components` warnings are OK — introduce no errors).
- **`api/` ESM:** relative imports use a `.js` suffix. **`src/` imports** have NO extension.
- **DB / network commands** (apply migration, reseed, smoke) need **`dangerouslyDisableSandbox: true`** (LAN Postgres in `DATABASE_URL`). Reseed with `npm run seed:wmi`.
- The dev DB has the seeded 2019 papers; WMI-19F1 = 2019 Grade 1 Final; its Q1 already resolves the custom illustration via `code` `WMI-19F1-Q1`.
- **`hint_steps` are stored as JSONB string arrays** (like `choices_en/id`). The loader already serializes JSONB columns with `JSON.stringify(...)`.
- **`WmiQuestionView`** already (from prior work) renders `{Illustration ? <Illustration/> : <WmiFigure/>}` and a post-answer `{revealed && QuestionExplainer && <WmiExplainer .../>}` block. It imports `WmiBreakdownToggle` and `WmiBreakdownView`. The breakdown toggle currently renders only when `onToggleBreakdown` is passed; `breakdownActive` (prop) drives the body view. It already uses `useState` (for `lang` and `localFill`).
- Do NOT push until the final task; commit per task. Touch only the listed files.

## File structure

| File | Responsibility |
|---|---|
| `db/migrations/0032_wmi_question_hint_steps.sql` + `db/schema.sql` | Add `hint_steps_en/id` JSONB to `wmi_questions` |
| `db/seed/wmi/load.ts` | `PaperQuestion.hint_steps_*` + insert |
| `db/seed/wmi/papers/2019-final-g1.json` | Q1 reword + `hint_steps` |
| `api/services/wmi/papers.ts` | `WmiQuestionDto.hint_steps_*` + SELECTs |
| `api/services/wmi/paperReviews.ts` | `AdminPaperQuestion.hint_steps_*` + SELECT |
| `src/types/wmi.ts`, `src/lib/wmiAdminApi.ts` | frontend `hint_steps_*` |
| `src/components/wmi/WmiSteps.tsx` | numbered step-by-step list |
| `src/components/wmi/WmiQuestionView.tsx` | self-managed "Q" toggle + post-answer steps |
| `src/components/wmi/paperQuestions/starVisual.tsx` (was candyVisual) | Star primitive + spaced/tilted layout |
| `…/StarRowsIllustration.tsx`, `…/StarCountExplainer.tsx`, `…/starCountSteps.ts(+test)` | renamed star visual |
| `src/components/wmi/paperQuestions/registry.ts` | point Q1 at star components |

---

### Task 1: Migration — `hint_steps` columns on `wmi_questions`

**Files:** Create `db/migrations/0032_wmi_question_hint_steps.sql`; Modify `db/schema.sql`.

- [ ] **Step 1: Migration**

Create `db/migrations/0032_wmi_question_hint_steps.sql`:
```sql
-- Optional ordered solution steps per paper question (mirrors concept hint_steps).
-- Stored as JSONB string arrays, like choices_en/id. Idempotent.
BEGIN;
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS hint_steps_en JSONB;
ALTER TABLE wmi_questions ADD COLUMN IF NOT EXISTS hint_steps_id JSONB;
COMMIT;
```
(If a `0032_*` migration already exists from a parallel branch, use the next free number.)

- [ ] **Step 2: Mirror in `db/schema.sql`**

In `db/schema.sql`, in the `CREATE TABLE IF NOT EXISTS wmi_questions (...)` block, add the two columns right after the existing `hint_id TEXT,` line:
```sql
  hint_steps_en JSONB,
  hint_steps_id JSONB,
```

- [ ] **Step 3: Apply** (Bash, `dangerouslyDisableSandbox: true`)
```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const fs=await import('node:fs');const pg=(await import('pg')).default;const sql=fs.readFileSync('db/migrations/0032_wmi_question_hint_steps.sql','utf8');const p=new pg.Pool({connectionString:process.env.DATABASE_URL});await p.query(sql);console.log('applied');await p.end()})"
```
Expected: `applied`.

- [ ] **Step 4: Verify** (Bash, `dangerouslyDisableSandbox: true`)
```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const pg=(await import('pg')).default;const p=new pg.Pool({connectionString:process.env.DATABASE_URL});const r=await p.query(\"SELECT column_name FROM information_schema.columns WHERE table_name='wmi_questions' AND column_name LIKE 'hint_steps_%' ORDER BY column_name\");console.log(r.rows.map(x=>x.column_name));await p.end()})"
```
Expected: `[ 'hint_steps_en', 'hint_steps_id' ]`.

- [ ] **Step 5: Commit**
```bash
git add db/migrations/0032_wmi_question_hint_steps.sql db/schema.sql
git commit -m "feat(wmi): add hint_steps columns to wmi_questions"
```
End every commit body with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 2: Loader + seed Q1 (reword + hint_steps)

**Files:** Modify `db/seed/wmi/load.ts`, `db/seed/wmi/papers/2019-final-g1.json`.

- [ ] **Step 1: Loader carries hint_steps**

In `db/seed/wmi/load.ts`, the `PaperFile`/`PaperQuestion` types are imported from `../../api/services/wmi/paperImport/types.js`. Add `hint_steps_en?: string[]` and `hint_steps_id?: string[]` to `PaperQuestion` in **`api/services/wmi/paperImport/types.ts`** (after `hint_id?`):
```ts
  hint_en?: string
  hint_id?: string
  hint_steps_en?: string[]
  hint_steps_id?: string[]
  difficulty?: number
```
In `db/seed/wmi/load.ts`, the `wmi_questions` INSERT must include the two columns. Change the column list, the `VALUES` placeholders, the `ON CONFLICT DO UPDATE SET`, and the params array to add `hint_steps_en` and `hint_steps_id` (serialize like choices):
- column list: add `hint_steps_en, hint_steps_id` (e.g. after `hint_id,`).
- VALUES: add two placeholders.
- DO UPDATE SET: add `hint_steps_en = EXCLUDED.hint_steps_en, hint_steps_id = EXCLUDED.hint_steps_id,`.
- params: add `question.hint_steps_en ? JSON.stringify(question.hint_steps_en) : null,` and the `_id` equivalent, in the matching positions.

- [ ] **Step 2: Reword Q1 + add hint_steps**

In `db/seed/wmi/papers/2019-final-g1.json`, find the question with `"number": 1`. Set:
```json
      "body_en": "How many stars are there?",
      "body_id": "Ada berapa banyak bintang?",
```
and add (keep `answer`, `choices_*`, `figure_url`, `code` etc. untouched):
```json
      "hint_steps_en": [
        "The stars are in rows of 22, 22, and 4.",
        "22 + 22 = 44.",
        "44 + 4 = 48.",
        "So there are 48 stars."
      ],
      "hint_steps_id": [
        "Bintang tersusun dalam baris 22, 22, dan 4.",
        "22 + 22 = 44.",
        "44 + 4 = 48.",
        "Jadi ada 48 bintang."
      ]
```

- [ ] **Step 3: Typecheck + reseed** (Bash, `dangerouslyDisableSandbox: true` for the seed)

`npm run check` → exit 0. Then `npm run seed:wmi` → expect it re-seeds the 2019 papers + 2024 sample with `Done.` (no error).

- [ ] **Step 4: Verify Q1 in DB** (Bash, `dangerouslyDisableSandbox: true`)
```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const pg=(await import('pg')).default;const p=new pg.Pool({connectionString:process.env.DATABASE_URL});const r=await p.query(\"SELECT q.body_en, q.hint_steps_en FROM wmi_questions q JOIN wmi_papers pp ON pp.id=q.paper_id WHERE pp.year=2019 AND pp.grade=1 AND q.number=1\");console.log(r.rows[0]);await p.end()})"
```
Expected: `body_en` = `How many stars are there?` and `hint_steps_en` an array of 4 strings.

- [ ] **Step 5: Commit**
```bash
git add api/services/wmi/paperImport/types.ts db/seed/wmi/load.ts db/seed/wmi/papers/2019-final-g1.json
git commit -m "feat(wmi): seed hint_steps + star wording for WMI-19F1 Q1"
```

---

### Task 3: Backend DTOs carry `hint_steps`

**Files:** Modify `api/services/wmi/papers.ts`, `api/services/wmi/paperReviews.ts`.

- [ ] **Step 1: `WmiQuestionDto`**

In `api/services/wmi/papers.ts`, add to `WmiQuestionDto` (after `difficulty: number | null`):
```ts
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
```
(Keep `code?` after these or before — order doesn't matter.)

- [ ] **Step 2: SELECT the columns in both member reads**

In `listWmiQuestionsForPaper`, add `q.hint_steps_en, q.hint_steps_id` to the SELECT column list (alongside the other `q.*` columns). In `getWmiDrillQuestion`, add `q.hint_steps_en, q.hint_steps_id` to BOTH SELECT lists. `normalizeQuestion` spreads the row, so the new fields flow through automatically.

- [ ] **Step 3: `AdminPaperQuestion`**

In `api/services/wmi/paperReviews.ts`, add to `AdminPaperQuestion` (after `difficulty`):
```ts
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
```
Add `q.hint_steps_en, q.hint_steps_id` to the `listAdminPaperQuestions` SELECT.

- [ ] **Step 4: Typecheck + dev-DB smoke** (Bash, `dangerouslyDisableSandbox: true`)

`npm run check` → exit 0. Then:
```bash
npx tsx -e "Promise.resolve().then(async()=>{const pr=await import('./api/services/wmi/paperReviews.ts');const ps=await pr.listPapersForAdmin();const p=ps.find(x=>x.year===2019&&x.grade===1);const qs=await pr.listAdminPaperQuestions(p.id);console.log('q1',qs[0].body_en,'| steps',qs[0].hint_steps_en?.length);process.exit(0)})"
```
Expected: `q1 How many stars are there? | steps 4`.

- [ ] **Step 5: Commit**
```bash
git add api/services/wmi/papers.ts api/services/wmi/paperReviews.ts
git commit -m "feat(wmi): hint_steps on question DTOs"
```

---

### Task 4: Frontend types carry `hint_steps`

**Files:** Modify `src/types/wmi.ts`, `src/lib/wmiAdminApi.ts`.

- [ ] **Step 1:** In `src/types/wmi.ts` `WmiQuestion`, add after `code?: string`:
```ts
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
```
- [ ] **Step 2:** In `src/lib/wmiAdminApi.ts` `AdminPaperQuestion`, add after `code?: string`:
```ts
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
```
- [ ] **Step 3: Typecheck + commit**

`npm run check` → exit 0.
```bash
git add src/types/wmi.ts src/lib/wmiAdminApi.ts
git commit -m "feat(wmi): hint_steps on frontend question types"
```

---

### Task 5: `WmiSteps` + `WmiQuestionView` (self-managed breakdown + post-answer steps)

**Files:** Create `src/components/wmi/WmiSteps.tsx`; Modify `src/components/wmi/WmiQuestionView.tsx`.

- [ ] **Step 1: `WmiSteps` component**

Create `src/components/wmi/WmiSteps.tsx`:
```tsx
export default function WmiSteps({ steps, lang }: { steps: string[]; lang: 'en' | 'id' }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-qupu-cream-dark bg-qupu-cream/30 p-4">
      <div className="mb-2 text-sm font-bold text-qupu-brand-blue">
        {lang === 'id' ? 'Langkah-langkah' : 'Step-by-step'}
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm font-semibold text-gray-800">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}
```

- [ ] **Step 2: Self-managed breakdown + steps in `WmiQuestionView`**

In `src/components/wmi/WmiQuestionView.tsx`:

(a) Add the import near the others: `import WmiSteps from './WmiSteps'`. Ensure `useState` is imported (it already is).

(b) In the component body (near where `Illustration`/`QuestionExplainer` are derived), add:
```ts
  const [internalBreakdown, setInternalBreakdown] = useState(false)
  const breakdownControlled = onToggleBreakdown != null
  const bdActive = breakdownControlled ? breakdownActive : internalBreakdown
  const handleBreakdownToggle = breakdownControlled ? onToggleBreakdown : () => setInternalBreakdown((v) => !v)
  const stepList = lang === 'id' ? question.hint_steps_id : question.hint_steps_en
```

(c) Replace the conditional toggle block:
```tsx
        {onToggleBreakdown && (
          <WmiBreakdownToggle active={breakdownActive} onToggle={onToggleBreakdown} />
        )}
```
with an always-rendered toggle:
```tsx
        <WmiBreakdownToggle active={bdActive} onToggle={handleBreakdownToggle} />
```

(d) Change the body conditional from `breakdownActive` to `bdActive`:
```tsx
        {bdActive ? (
          <WmiBreakdownView text={body} lang={lang} onLookup={onLookupTerm} />
        ) : (
```

(e) Add the steps block in the post-answer area, immediately BEFORE the existing `{revealed && QuestionExplainer && (...)}` animation block:
```tsx
      {revealed && stepList && stepList.length > 0 && <WmiSteps steps={stepList} lang={lang} />}
```

- [ ] **Step 3: Typecheck + lint**

`npm run check` → exit 0. `npm run lint` → no new errors. Note: the admin Concepts page passes `onToggleBreakdown` (controlled) → unchanged; paper/other questions now get a self-managed "Q" toggle.

- [ ] **Step 4: Commit**
```bash
git add src/components/wmi/WmiSteps.tsx src/components/wmi/WmiQuestionView.tsx
git commit -m "feat(wmi): Q breakdown toggle + post-answer step-by-step in WmiQuestionView"
```

---

### Task 6: Stars (rename candy → star, spaced + tilted)

**Files:** rename within `src/components/wmi/paperQuestions/`:
- `candyVisual.tsx` → `starVisual.tsx`
- `CandyRowsIllustration.tsx` → `StarRowsIllustration.tsx`
- `CandyCountExplainer.tsx` → `StarCountExplainer.tsx`
- `candyCountSteps.ts` → `starCountSteps.ts`; `candyCountSteps.test.ts` → `starCountSteps.test.ts`
- Modify `registry.ts`.

Use `git mv` for renames so history is preserved.

- [ ] **Step 1: `starVisual.tsx`** (replace the candy primitive with a star; wider gap; per-item tilt)

`git mv src/components/wmi/paperQuestions/candyVisual.tsx src/components/wmi/paperQuestions/starVisual.tsx`, then replace its contents with:
```tsx
export const STAR_ROWS = [22, 22, 4] as const
export const STAR_TOTAL = STAR_ROWS.reduce((s, n) => s + n, 0) // 48

const COLORS = ['#F59E0B', '#2f6df0', '#EC4899', '#10B981', '#A855F7']
const PAD_X = 24
const GAP = 24
const R = 9
const ROW_Y = [46, 96, 146]
export const VIEW_W = PAD_X * 2 + (Math.max(...STAR_ROWS) - 1) * GAP + R * 2
export const VIEW_H = 192

export interface StarPos {
  row: number
  cx: number
  cy: number
  color: string
  tilt: number
}

export function starPositions(rows: readonly number[] = STAR_ROWS): StarPos[] {
  const out: StarPos[] = []
  let n = 0
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      out.push({
        row,
        cx: PAD_X + R + i * GAP,
        cy: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1],
        color: COLORS[n % COLORS.length],
        tilt: ((n * 41) % 25) - 12, // deterministic −12..12°
      })
      n++
    }
  })
  return out
}

function starPoints(cx: number, cy: number, r: number): string {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// A 5-point star, optionally tilted.
export function Star({ cx, cy, color, tilt = 0, opacity = 1 }: { cx: number; cy: number; color: string; tilt?: number; opacity?: number }) {
  return (
    <g opacity={opacity} transform={`rotate(${tilt} ${cx} ${cy})`}>
      <polygon points={starPoints(cx, cy, R)} fill={color} />
    </g>
  )
}
```

- [ ] **Step 2: `StarRowsIllustration.tsx`**

`git mv …/CandyRowsIllustration.tsx …/StarRowsIllustration.tsx`, then replace with:
```tsx
import { Star, starPositions, STAR_TOTAL, STAR_ROWS, VIEW_W, VIEW_H } from './starVisual'

export default function StarRowsIllustration() {
  const positions = starPositions()
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`${STAR_TOTAL} stars in rows of ${STAR_ROWS.join(', ')}`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 520, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {positions.map((p, i) => (
          <Star key={i} cx={p.cx} cy={p.cy} color={p.color} tilt={p.tilt} />
        ))}
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: `starCountSteps.ts` + test**

`git mv …/candyCountSteps.ts …/starCountSteps.ts` and `git mv …/candyCountSteps.test.ts …/starCountSteps.test.ts`. In `starCountSteps.ts` replace the contents with (same logic, "stars" wording, imports from `./starVisual`):
```ts
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { STAR_ROWS, STAR_TOTAL } from './starVisual'

export type StarPhase = 'show' | 'row' | 'result'

export interface StarStep {
  phase: StarPhase
  row: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface StarStoryboard {
  rows: number[]
  total: number
  steps: StarStep[]
  finalIndex: number
}

export function buildStarCountSteps(lang: Lang): StarStoryboard {
  const rows = [...STAR_ROWS]
  const total = STAR_TOTAL
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StarStep[] = [
    { phase: 'show', row: null, running: 0, hold: 1500, result: false, caption: t('How many stars are there?', 'Ada berapa banyak bintang? Hitung!') },
  ]
  let running = 0
  rows.forEach((count, i) => {
    running += count
    steps.push({
      phase: 'row',
      row: i,
      running,
      hold: 1700,
      result: false,
      caption: t(`Row ${i + 1}: ${count}. Total so far ${running}.`, `Baris ${i + 1}: ${count}. Sejauh ini ${running}.`),
    })
  })
  steps.push({
    phase: 'result',
    row: null,
    running: total,
    hold: 0,
    result: true,
    caption: t(`${rows.join(' + ')} = ${total} stars.`, `${rows.join(' + ')} = ${total} bintang.`),
  })

  return { rows, total, steps, finalIndex: steps.length - 1 }
}
```
Update `starCountSteps.test.ts` to import `buildStarCountSteps` from `./starCountSteps` and assert the same (running totals `[22,44,48]`, phases, result caption contains `22 + 22 + 4 = 48`, and the result caption contains `stars`; Indonesian `show` caption contains `hitung`).

- [ ] **Step 4: `StarCountExplainer.tsx`**

`git mv …/CandyCountExplainer.tsx …/StarCountExplainer.tsx`, then replace with:
```tsx
import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Star, starPositions, VIEW_W, VIEW_H } from './starVisual'
import { buildStarCountSteps } from './starCountSteps'

const GREEN = '#10B981'

export default function StarCountExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStarCountSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const positions = useMemo(() => starPositions(), [])

  const ariaLabel =
    lang === 'id'
      ? `Hitung bintang baris demi baris: ${story.rows.join(' + ')} = ${story.total}.`
      : `Count the stars row by row: ${story.rows.join(' + ')} = ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
          {positions.map((p, i) => {
            const dim = beat.row !== null && p.row !== beat.row
            const counted = beat.phase === 'result' || (beat.row !== null && p.row <= beat.row)
            return <Star key={i} cx={p.cx} cy={p.cy} color={counted || beat.phase === 'show' ? p.color : '#cbd5e1'} tilt={p.tilt} opacity={dim ? 0.3 : 1} />
          })}
        </svg>

        {beat.running > 0 && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : '#2f6df0' }}>
            {beat.phase === 'result' ? `${story.rows.join(' + ')} = ${story.total}` : beat.running}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Re-point the registry**

In `src/components/wmi/paperQuestions/registry.ts`, change the two candy imports to:
```ts
import StarRowsIllustration from './StarRowsIllustration'
import StarCountExplainer from './StarCountExplainer'
```
and the entry to:
```ts
const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1-Q1': { Illustration: StarRowsIllustration, Explainer: StarCountExplainer },
}
```

- [ ] **Step 6: Tests + SSR smoke**

Run `npx vitest run src/components/wmi/paperQuestions/` (registry + starCountSteps pass). Then SSR smoke:
```bash
cat > _smoke_star.tsx <<'EOF'
import { renderToString } from 'react-dom/server'
import { createElement as h } from 'react'
import StarCountExplainer from './src/components/wmi/paperQuestions/StarCountExplainer'
import StarRowsIllustration from './src/components/wmi/paperQuestions/StarRowsIllustration'
import { buildStarCountSteps } from './src/components/wmi/paperQuestions/starCountSteps'
const sb = buildStarCountSteps('en')
for (let step = 0; step <= sb.finalIndex; step++)
  for (const lang of ['en','id'] as const) {
    const html = renderToString(h(StarCountExplainer, { params: {}, correctAnswer: '48', lang, step, playing: false }))
    if (!html || !html.includes('<polygon')) throw new Error(`star explainer step ${step} ${lang} missing polygons`)
  }
const ill = renderToString(h(StarRowsIllustration, {}))
if ((ill.match(/<polygon/g) || []).length !== 48) throw new Error('illustration should draw 48 star polygons')
console.log('SMOKE OK — star explainer all beats en/id; illustration draws 48 stars')
EOF
npx tsx _smoke_star.tsx 2>&1 | tail -3 && rm -f _smoke_star.tsx
```
Expected: `SMOKE OK — star explainer all beats en/id; illustration draws 48 stars`.

- [ ] **Step 7: Typecheck + lint + commit**

`npm run check` → exit 0. `npm run lint` → no new errors. Confirm no stale references remain: `grep -rIn "candy\|Candy" src/components/wmi/paperQuestions` returns nothing.
```bash
git add -A src/components/wmi/paperQuestions/
git commit -m "feat(wmi): switch WMI-19F1 Q1 visual to spaced, tilted stars"
```

---

### Task 7: Verify end-to-end + push

**Files:** none.

- [ ] **Step 1: Full gates** — `npm run check` (0), `npm run lint` (no errors), `npm run test` (all pass; report totals).

- [ ] **Step 2: Manual app spot-check** — `npm run dev`, admin (`shops@decasa.co.id`): open `/admin/wmi-drill` → 2019 Grade 1 → Q1. Confirm: the **stars** illustration (spaced, slightly tilted) replaces the scan; the question reads **"How many stars are there?"**; a **"Q"** toggle appears top-right and toggling shows the breakdown; and (admin preview renders revealed) the **Step-by-step** list + the star counting animation show. Then the member exam-review for the same paper: same behavior; during the live mock exam (not revealed) the steps stay hidden but "Q" still toggles. Other questions unchanged.

- [ ] **Step 3: Commit any fixups + push**
```bash
git add -A
git commit -m "chore(wmi): verify WMI Drill question experience end-to-end"   # only if fixups
git push
```
If `git push` is rejected (parallel session), `git pull --rebase` then `git push`; report conflicts (no force-push).

---

## Self-review notes

- **Spec coverage:** stars visual + reword (Tasks 2, 6); `hint_steps` mechanism (Tasks 1–4); breakdown toggle self-managed + post-answer steps in `WmiQuestionView` (Task 5); member+admin via the single component; verify/push (Task 7). All spec sections map to a task.
- **Gating:** "Q" toggle is always rendered & self-managed (toggle anytime); `WmiSteps` only renders when `revealed && stepList?.length` (post-answer). Matches the mock-exam decision.
- **Type consistency:** `hint_steps_en/id` is `string[] | null` on the DTOs (papers.ts, paperReviews.ts) and `string[] | null` (optional) on the frontend types; `PaperQuestion.hint_steps_*` is `string[]`; `WmiSteps` takes `steps: string[]`; the star module exports `STAR_ROWS/STAR_TOTAL/starPositions/Star/VIEW_W/VIEW_H` and `buildStarCountSteps`, referenced consistently by the illustration, explainer, and registry.
- **No candy leftovers:** Task 6 Step 7 greps to confirm.
