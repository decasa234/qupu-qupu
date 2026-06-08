# Admin "WMI Drill" Review Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An admin page to browse the imported WMI papers and review/flag each one (status + notes), mirroring the WMI Concepts page, with both WMI tools grouped under one sidebar section.

**Architecture:** Mirror the existing concept-review feature for papers (`paper ↔ concept`, `questions ↔ samples`): a new `wmi_paper_reviews` table, a `paperReviews` service, admin endpoints in the existing `wmi-admin.ts` router, `wmiAdminApi` client functions, and an `AdminWmiDrill` page modelled on `AdminWmiConcepts`. Content is read-only; review is per paper.

**Tech Stack:** Express + `pg` (ESM, `.js`-suffixed relative imports under `api/`), React + Vite + Tailwind, `vitest`. Spec: `docs/superpowers/specs/2026-06-07-admin-wmi-drill-review-design.md`.

---

## Context the implementer must know

- **Admin router** `api/routes/wmi-admin.ts` is mounted at `/api/admin/wmi` (`api/app.ts`) and is admin-gated by `router.use(authenticateToken, requireAdmin)`. The client (`src/lib/wmiAdminApi.ts`) calls relative paths like `/admin/wmi/concepts` (the axios instance prepends `/api`).
- **DB helpers** (`api/db.ts`): `query<T>(sql, params)`, `queryOne<T>(sql, params)` — `T` must extend `QueryResultRow` (use `type` aliases, not `interface`, for row types — see `api/services/wmi/concepts/reviews.ts`).
- **Review pattern to mirror:** `api/services/wmi/concepts/reviews.ts` + the `/concepts/:slug/review` GET/PUT in `wmi-admin.ts` (shared `reviewSchema = { status, notes }`).
- **`npm run check`** = `tsc --noEmit` (includes `src` + `api`). **`npm run test`** = `vitest run` (include `api/**/*.test.ts`, `src/**/*.test.ts`). **`npm run lint`** = `eslint .`.
- **DB-backed tests** run only when `TEST_DATABASE_URL` is set and otherwise self-skip via `describe.skipIf(!RUN)` where `const RUN = Boolean(process.env.TEST_DATABASE_URL)` (see `api/__tests__/gamification/coins.test.ts`). Never point tests at the dev DB.
- **DB / network commands** (applying the migration, dev-DB smokes) must pass **`dangerouslyDisableSandbox: true`** to Bash — the sandbox blocks the LAN Postgres in `DATABASE_URL`.
- The dev DB already has the seeded 2019 papers (grades 1–3, round `final`, variant `A`, 25 questions each).
- Do **not** push until the final task; commit locally per task. Only touch the files listed in each task (a parallel session shares the tree).

## File structure

| File | Responsibility |
|---|---|
| `db/migrations/0031_wmi_paper_reviews.sql` | New `wmi_paper_reviews` table |
| `db/schema.sql` | Mirror the table for fresh installs |
| `api/services/wmi/paperReviews.ts` (+ `.test.ts`) | List papers w/ status, per-paper review get/upsert, admin questions-with-answer |
| `api/routes/wmi-admin.ts` | Add `/papers`, `/papers/:id/questions`, `/papers/:id/review` (GET/PUT) |
| `src/lib/wmiAdminApi.ts` | Client types + `fetchPaperList`/`fetchPaperQuestions`/`fetchPaperReview`/`savePaperReview` |
| `src/pages/admin/AdminWmiDrill.tsx` | The page (list → preview → review), modelled on `AdminWmiConcepts.tsx` |
| `src/App.tsx` | Route `wmi-drill` |
| `src/components/AdminLayout.tsx` | Group WMI Concepts + Drill under a "WMI" sidebar section |

---

### Task 1: Migration — `wmi_paper_reviews` table

**Files:**
- Create: `db/migrations/0031_wmi_paper_reviews.sql`
- Modify: `db/schema.sql`

- [ ] **Step 1: Write the migration**

Create `db/migrations/0031_wmi_paper_reviews.sql`:

```sql
-- Per-paper admin review verdict for imported WMI papers (mirror of
-- wmi_concept_reviews, keyed by paper). Cascade-deletes with its paper.
-- Idempotent; safe to re-run.
BEGIN;

CREATE TABLE IF NOT EXISTS wmi_paper_reviews (
  paper_id    UUID PRIMARY KEY REFERENCES wmi_papers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','needs_changes')),
  notes       TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
```

> If a parallel branch already added a `0031_*` migration, rename this to the next free number.

- [ ] **Step 2: Mirror in `db/schema.sql`**

Add the same `CREATE TABLE IF NOT EXISTS wmi_paper_reviews (...)` block to `db/schema.sql`, placed immediately after the `wmi_papers` table block (so it follows its referenced table). Use the exact column definitions above (without the `BEGIN`/`COMMIT`).

- [ ] **Step 3: Apply to the dev DB** (Bash with `dangerouslyDisableSandbox: true`)

```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const fs=await import('node:fs');const pg=(await import('pg')).default;const sql=fs.readFileSync('db/migrations/0031_wmi_paper_reviews.sql','utf8');const p=new pg.Pool({connectionString:process.env.DATABASE_URL});await p.query(sql);console.log('applied');await p.end()})"
```
Expected: prints `applied`.

- [ ] **Step 4: Verify** (Bash with `dangerouslyDisableSandbox: true`)

```bash
node --input-type=module -e "import('dotenv/config').then(async()=>{const pg=(await import('pg')).default;const p=new pg.Pool({connectionString:process.env.DATABASE_URL});const r=await p.query(\"SELECT to_regclass('public.wmi_paper_reviews') AS t\");console.log(r.rows[0]);await p.end()})"
```
Expected: `{ t: 'wmi_paper_reviews' }`.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/0031_wmi_paper_reviews.sql db/schema.sql
git commit -m "feat(wmi): add wmi_paper_reviews table"
```
End the commit body with:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 2: Backend service — `paperReviews.ts`

**Files:**
- Create: `api/services/wmi/paperReviews.ts`
- Create: `api/services/wmi/paperReviews.test.ts`

- [ ] **Step 1: Write the service**

Create `api/services/wmi/paperReviews.ts`:

```ts
import { query, queryOne } from '../../db.js'
import type { ReviewStatus } from './concepts/reviews.js'
import type { WmiChoice } from './papers.js'

export type AdminPaperSummary = {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  question_count: number
  status: ReviewStatus
}

export type PaperReview = {
  paper_id: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string
}

// Like the member question DTO but WITH the answer — admins need it to QA.
export type AdminPaperQuestion = {
  id: string
  paper_id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  difficulty: number | null
}

// All papers (every grade), each with its review status (default 'pending').
export async function listPapersForAdmin(): Promise<AdminPaperSummary[]> {
  return query<AdminPaperSummary>(
    `SELECT p.id, p.year, p.grade, p.round, p.variant, p.title, p.question_count,
            COALESCE(r.status, 'pending') AS status
     FROM wmi_papers p
     LEFT JOIN wmi_paper_reviews r ON r.paper_id = p.id
     ORDER BY p.year DESC, p.grade ASC, p.round ASC, p.variant ASC`,
  )
}

export async function listAdminPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  return query<AdminPaperQuestion>(
    `SELECT id, paper_id, number, body_en, body_id, answer_type, choices_en, choices_id,
            answer, figure_url, hint_en, hint_id, difficulty
     FROM wmi_questions
     WHERE paper_id = $1
     ORDER BY number ASC`,
    [paperId],
  )
}

export async function getPaperReview(paperId: string): Promise<PaperReview | null> {
  return queryOne<PaperReview>(
    `SELECT paper_id, status, notes, reviewed_by, updated_at
     FROM wmi_paper_reviews WHERE paper_id = $1`,
    [paperId],
  )
}

export async function upsertPaperReview(
  paperId: string,
  status: ReviewStatus,
  notes: string,
  reviewedBy: string | null,
): Promise<PaperReview> {
  const row = await queryOne<PaperReview>(
    `INSERT INTO wmi_paper_reviews (paper_id, status, notes, reviewed_by, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (paper_id) DO UPDATE
       SET status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           reviewed_by = EXCLUDED.reviewed_by,
           updated_at = NOW()
     RETURNING paper_id, status, notes, reviewed_by, updated_at`,
    [paperId, status, notes, reviewedBy],
  )
  return row as PaperReview
}
```

- [ ] **Step 2: Write the DB-backed test** (self-skips without `TEST_DATABASE_URL`)

Create `api/services/wmi/paperReviews.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { query, queryOne } from '../../db.js'
import { getPaperReview, upsertPaperReview, listPapersForAdmin } from './paperReviews.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('paperReviews', () => {
  let paperId: string

  beforeAll(async () => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO wmi_papers (year, grade, round, variant, title, recommended_duration_min, question_count)
       VALUES (2099, 0, 'final', 'A', 'TEST paper', 60, 0)
       RETURNING id`,
    )
    paperId = row!.id
  })

  afterAll(async () => {
    // Cascade also removes the review row.
    await query(`DELETE FROM wmi_papers WHERE id = $1`, [paperId])
  })

  it('starts with no review, then upserts and reads back', async () => {
    expect(await getPaperReview(paperId)).toBeNull()
    const r = await upsertPaperReview(paperId, 'approved', 'looks good', 'admin@test')
    expect(r.status).toBe('approved')
    expect(r.notes).toBe('looks good')
    expect((await getPaperReview(paperId))?.status).toBe('approved')
  })

  it('upserts in place (updates the same row)', async () => {
    const r2 = await upsertPaperReview(paperId, 'needs_changes', 'fix q1', 'admin@test')
    expect(r2.status).toBe('needs_changes')
    expect((await getPaperReview(paperId))?.notes).toBe('fix q1')
  })

  it('lists the paper with its current status', async () => {
    const mine = (await listPapersForAdmin()).find((p) => p.id === paperId)
    expect(mine?.status).toBe('needs_changes')
  })
})
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exits 0.

- [ ] **Step 4: Dev-DB smoke** (Bash with `dangerouslyDisableSandbox: true`)

Exercise the service against the real dev DB (a seeded 2019 paper), then clean up the review row it writes:

```bash
npx tsx -e "Promise.resolve().then(async()=>{const m=await import('./api/services/wmi/paperReviews.ts');const db=await import('./api/db.ts');const ps=await m.listPapersForAdmin();const p=ps.find(x=>x.year===2019);console.log('papers',ps.length,'pick',p.title,'status',p.status);const r=await m.upsertPaperReview(p.id,'approved','smoke',null);console.log('upsert',r.status);console.log('get',(await m.getPaperReview(p.id)).status);const qs=await m.listAdminPaperQuestions(p.id);console.log('questions',qs.length,'q1.answer',qs[0]?.answer);await db.query('DELETE FROM wmi_paper_reviews WHERE paper_id=\$1',[p.id]);console.log('cleaned');process.exit(0)})"
```
Expected: prints `papers <N> pick WMI 2019 Grade … status pending`, `upsert approved`, `get approved`, `questions 25 q1.answer …`, `cleaned`. (The cleanup leaves the paper with no review, as before.)

- [ ] **Step 5: Run the test suite** (confirms nothing breaks; the new test self-skips)

Run: `npm run test`
Expected: existing tests pass; `paperReviews.test.ts` is skipped (no `TEST_DATABASE_URL`).

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/paperReviews.ts api/services/wmi/paperReviews.test.ts
git commit -m "feat(wmi): paper review service (list/get/upsert + admin questions)"
```
End the commit body with the Co-Authored-By line.

---

### Task 3: Backend endpoints in `wmi-admin.ts`

**Files:**
- Modify: `api/routes/wmi-admin.ts`

- [ ] **Step 1: Add imports**

At the top of `api/routes/wmi-admin.ts`, add (next to the existing service imports):

```ts
import {
  getPaperReview,
  listAdminPaperQuestions,
  listPapersForAdmin,
  upsertPaperReview,
} from '../services/wmi/paperReviews.js'
```

- [ ] **Step 2: Add a UUID guard + the routes**

Add this block immediately before the final `export default router` line. It reuses the existing `reviewSchema` (already defined in this file for concepts):

```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

router.get('/papers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const papers = await listPapersForAdmin()
    res.json({ success: true, data: { papers } })
  } catch (e) {
    console.error('WMI admin papers error:', e)
    res.status(500).json({ success: false, error: 'Unable to load papers' })
  }
})

router.get('/papers/:id/questions', async (req: Request, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  try {
    const questions = await listAdminPaperQuestions(req.params.id)
    if (questions.length === 0) {
      res.status(404).json({ success: false, error: 'Paper not found' })
      return
    }
    res.json({ success: true, data: { questions } })
  } catch (e) {
    console.error('WMI admin paper questions error:', e)
    res.status(500).json({ success: false, error: 'Unable to load questions' })
  }
})

router.get('/papers/:id/review', async (req: Request, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  try {
    const review = await getPaperReview(req.params.id)
    res.json({
      success: true,
      data: {
        review:
          review ?? {
            paper_id: req.params.id,
            status: 'pending',
            notes: '',
            reviewed_by: null,
            updated_at: null,
          },
      },
    })
  } catch (e) {
    console.error('WMI admin paper review load error:', e)
    res.status(500).json({ success: false, error: 'Unable to load review' })
  }
})

router.put('/papers/:id/review', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  const { error, value } = reviewSchema.validate(req.body)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const review = await upsertPaperReview(
      req.params.id,
      value.status,
      value.notes,
      req.user?.email ?? null,
    )
    res.json({ success: true, data: { review } })
  } catch (e) {
    console.error('WMI admin paper review save error:', e)
    res.status(500).json({ success: false, error: 'Unable to save review' })
  }
})
```

> Note: `/papers/:id/questions` returns 404 when the paper has no questions; that's acceptable here since every real paper has questions. The `PUT` upsert will still create a review row even if the paper is empty, but that path isn't reachable from the UI (the list only shows real papers).

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exits 0. (`Request`, `Response`, `AuthRequest`, `Joi`, `reviewSchema` are already imported/defined in this file.)

- [ ] **Step 4: Commit**

```bash
git add api/routes/wmi-admin.ts
git commit -m "feat(wmi): admin endpoints for paper list, questions, and review"
```
End the commit body with the Co-Authored-By line.

---

### Task 4: Frontend API client

**Files:**
- Modify: `src/lib/wmiAdminApi.ts`

- [ ] **Step 1: Add types + functions**

Append to `src/lib/wmiAdminApi.ts` (it already imports `api` and `WmiChoice`, and exports `ReviewStatus`). Add:

```ts
export interface AdminPaperSummary {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  question_count: number
  status: ReviewStatus
}

export interface AdminPaperQuestion {
  id: string
  paper_id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  difficulty: number | null
}

export interface PaperReview {
  paper_id: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string | null
}

export async function fetchPaperList(): Promise<AdminPaperSummary[]> {
  const { data } = await api.get('/admin/wmi/papers')
  return data.data.papers
}

export async function fetchPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  const { data } = await api.get(`/admin/wmi/papers/${paperId}/questions`)
  return data.data.questions
}

export async function fetchPaperReview(paperId: string): Promise<PaperReview> {
  const { data } = await api.get(`/admin/wmi/papers/${paperId}/review`)
  return data.data.review
}

export async function savePaperReview(
  paperId: string,
  status: ReviewStatus,
  notes: string,
): Promise<PaperReview> {
  const { data } = await api.put(`/admin/wmi/papers/${paperId}/review`, { status, notes })
  return data.data.review
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/wmiAdminApi.ts
git commit -m "feat(wmi): admin API client for paper list/questions/review"
```
End the commit body with the Co-Authored-By line.

---

### Task 5: Frontend page `AdminWmiDrill.tsx` + route

**Files:**
- Create: `src/pages/admin/AdminWmiDrill.tsx`
- Modify: `src/App.tsx`

**Read `src/pages/admin/AdminWmiConcepts.tsx` first — model this page on it** (same imports of `AdminPageHeader`, `Panel`, `SectionHeading`, `Button`, `Input`, `Textarea`, the `STATUS_ORDER`/`STATUS_META` chip styling, and the three-zone `grid lg:grid-cols-[240px_minmax(0,1fr)]` layout). Substitutions: concept→paper, samples→questions. The page must:

- [ ] **Step 1: Build the page**

Create `src/pages/admin/AdminWmiDrill.tsx`. Behaviour:

- On mount, `fetchPaperList()` → `papers` state. Render the left sidebar as a list of papers grouped by grade (group header `Grade {g}`), each button labelled `{p.year} {p.round === 'final' ? 'Final' : 'Semifinal'}` with a `STATUS_META[p.status].dot` colour dot and a `{p.question_count}`-soal count. Selecting a paper sets `activePaperId`.
- When `activePaperId` changes: `fetchPaperQuestions(id)` → `questions` (track which paper they belong to, as AdminWmiConcepts does with `samplesSlug`, to avoid showing stale questions), reset the question index to 0, and `fetchPaperReview(id)` → seed `status`/`notes` state.
- Center: page through `questions[idx]` with `WmiQuestionView` (read-only preview). Pass `question={q}`, `label={`Soal ${q.number}`}`, `disabled`, `revealed`, and **no-op** handlers (`onPickChoice`, `onSubmitFillIn`, `onLookupTerm`, `onRevealTranslation` = a `const noop = () => {}`). Below the question, show the answer for QA in a labelled chip: `Answer: {q.answer}`. Add Prev / Next buttons and an `{idx + 1} / {questions.length}` indicator.
- Right/below (a `Panel` titled "Review"): the status chips (reuse the `STATUS_META` map + `STATUS_ORDER`), a `Textarea` bound to `notes`, and a `Button` "Save" calling `savePaperReview(activePaperId, status, notes)`; on success update the paper's `status` in the `papers` list so the dot refreshes, and disable Save while `!dirty` (dirty = `status !== review.status || notes !== review.notes`).
- Reuse `AdminPageHeader` with `eyebrow="Admin · WMI"`, `title="WMI Drill Papers"`, and a short description (e.g. "Imported WMI exam papers. Preview each question with its answer, and record a review verdict + notes per paper.").
- Handle the empty state (no papers) and load/save errors with the same simple error banners AdminWmiConcepts uses.

Import the API from `'../../lib/wmiAdminApi'`:
```ts
import {
  fetchPaperList, fetchPaperQuestions, fetchPaperReview, savePaperReview,
  type AdminPaperSummary, type AdminPaperQuestion, type PaperReview, type ReviewStatus,
} from '../../lib/wmiAdminApi'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import type { WmiQuestion } from '../../types/wmi'
```
`AdminPaperQuestion` is shape-compatible with `WmiQuestion` (it has all of `WmiQuestion`'s fields plus `answer`), so it can be passed directly to `WmiQuestionView`'s `question` prop.

- [ ] **Step 2: Add the route**

In `src/App.tsx`:
- Add the import near the other admin imports: `import AdminWmiDrillPage from './pages/admin/AdminWmiDrill'`
- Add a route immediately after the `wmi-concepts` route:
```tsx
          <Route path="wmi-drill" element={<AdminWmiDrillPage />} />
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run check` (exit 0) and `npm run lint` (no new errors; pre-existing `react-refresh/only-export-components` warnings in `src/components/admin` are OK).

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminWmiDrill.tsx src/App.tsx
git commit -m "feat(wmi): admin WMI Drill page (browse papers, preview questions, review)"
```
End the commit body with the Co-Authored-By line.

---

### Task 6: Group WMI items under a "WMI" sidebar section

**Files:**
- Modify: `src/components/AdminLayout.tsx`

- [ ] **Step 1: Restructure the NAV data**

In `src/components/AdminLayout.tsx`, replace the flat `NAV` array with a typed structure that supports a group. Replace:

```ts
const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/videos', label: 'Videos', icon: 'fa-solid fa-film' },
  { to: '/admin/subjects', label: 'Subjects', icon: 'fa-solid fa-shapes' },
  { to: '/admin/age-groups', label: 'Age Groups', icon: 'fa-solid fa-children' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
  { to: '/admin/wmi-concepts', label: 'WMI Concepts', icon: 'fa-solid fa-flask' },
]
```

with:

```ts
type NavLeaf = { to: string; label: string; icon: string }
type NavGroup = { group: string; children: NavLeaf[] }
type NavEntry = NavLeaf | NavGroup

const NAV: NavEntry[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/videos', label: 'Videos', icon: 'fa-solid fa-film' },
  { to: '/admin/subjects', label: 'Subjects', icon: 'fa-solid fa-shapes' },
  { to: '/admin/age-groups', label: 'Age Groups', icon: 'fa-solid fa-children' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
  {
    group: 'WMI',
    children: [
      { to: '/admin/wmi-concepts', label: 'Concepts', icon: 'fa-solid fa-flask' },
      { to: '/admin/wmi-drill', label: 'Drill', icon: 'fa-solid fa-file-pen' },
    ],
  },
]
```

- [ ] **Step 2: Render groups**

Replace the `navLinks` function body so it renders both leaves and groups. Extract the single-link markup into a helper so leaf and group children share it:

```tsx
  function navLinks(onNavigate?: () => void) {
    const leaf = (item: NavLeaf) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            isActive
              ? 'bg-qupu-brand-blue text-white'
              : 'text-admin-muted hover:bg-admin-sunk hover:text-admin-ink'
          }`
        }
      >
        <i className={`${item.icon} w-4 text-center text-sm`} aria-hidden="true" />
        {item.label}
      </NavLink>
    )
    return (
      <nav className="grid gap-0.5">
        {NAV.map((entry) =>
          'group' in entry ? (
            <div key={entry.group} className="mt-2">
              <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-admin-faint">
                {entry.group}
              </div>
              <div className="grid gap-0.5">{entry.children.map(leaf)}</div>
            </div>
          ) : (
            leaf(entry)
          ),
        )}
      </nav>
    )
  }
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run check` (exit 0) and `npm run lint` (no new errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminLayout.tsx
git commit -m "feat(wmi): group Concepts + Drill under a WMI sidebar section"
```
End the commit body with the Co-Authored-By line.

---

### Task 7: Verify end-to-end + push

**Files:** none (verification + push).

- [ ] **Step 1: Full gates**

Run: `npm run check` (exit 0), `npm run lint` (no new errors), `npm run test` (all pass; `paperReviews.test.ts` skipped without `TEST_DATABASE_URL`). Report totals.

- [ ] **Step 2: Manual app spot-check**

Run `npm run dev`. Sign in as admin (`shops@decasa.co.id`). Confirm:
- The sidebar shows a **WMI** group header with **Concepts** and **Drill** beneath it.
- `/admin/wmi-drill` lists the 2019 papers grouped by grade (1–3), each with a status dot + question count.
- Selecting a paper pages through its questions (figures render, the answer chip shows), Prev/Next works.
- Setting status → "approved" + a note → Save, then reselecting the paper (or reloading) shows the saved status (dot updates) and notes.
- `/admin/wmi-concepts` still works unchanged.

- [ ] **Step 3: Commit any fixups + push**

```bash
git add -A
git commit -m "chore(wmi): verify admin WMI Drill page end-to-end"   # only if there are fixups
git push
```
If `git push` is rejected (parallel session pushed), run `git pull --rebase` then `git push`; report conflicts (do NOT force-push).

---

## Self-review notes

- **Spec coverage:** `wmi_paper_reviews` table → Task 1; service (list/get/upsert/admin-questions) → Task 2; admin endpoints (list, questions-with-answer, review GET/PUT) → Task 3; client → Task 4; `AdminWmiDrill` page + route → Task 5; grouped WMI sidebar → Task 6; testing/verify → Tasks 2 & 7. All spec sections map to a task.
- **Read-only / per-paper / grouped-nav** decisions are all reflected (no question editing, one review per paper, sidebar group).
- **Type consistency:** `AdminPaperSummary`, `AdminPaperQuestion`, `PaperReview`, `ReviewStatus` are spelled identically in the service (Task 2) and client (Task 4); the endpoint shapes (`{ papers }`, `{ questions }`, `{ review }`) match what the client reads.
