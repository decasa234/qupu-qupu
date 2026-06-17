# Admin Review AI↔Human Synergy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a structured, stateful per-part issue layer over the WMI admin paper + concept review pages so the human and Claude Code can work one shared fix-loop queue, with in-app quick-fix for simple paper text and triage/visibility upgrades.

**Architecture:** One new table `wmi_review_issues` (issues are granular and stateful; the existing per-item verdict tables are untouched and become a *suggested* roll-up). A new backend service + 3 admin endpoints expose issues. Shared React modules (a client API+serializer, a `useReviewIssues` hook, an `IssuesPanel`, and a `FlagButton`) are reused by both existing pages and a new Review Queue page. The AI loop is a copy-to-clipboard markdown handoff the human pastes into a Claude Code session; Claude PATCHes issues to `fixed`.

**Tech Stack:** Postgres (raw SQL via `query`/`queryOne` from `api/db.ts`), Express + Joi (`api/routes/wmi-admin.ts`), React 18 + Vite + Tailwind (admin UI in `src/`), vitest (`npm run test`), typecheck `npm run check`.

**Spec:** `docs/superpowers/specs/2026-06-17-admin-review-ai-human-synergy-design.md`

**Conventions observed (follow exactly):**
- API responses: `res.json({ success: true, data: { ... } })`; errors `res.status(n).json({ success: false, error: 'msg' })`.
- `api/` imports use `.js` extensions even for `.ts` files.
- Admin routes already gated by `router.use(authenticateToken, requireAdmin)` in `wmi-admin.ts`; `req.user?.email` is the actor.
- DB tests use `const RUN = Boolean(process.env.TEST_DATABASE_URL)` + `describe.skipIf(!RUN)`. Pure-logic tests run unconditionally.
- Migrations are numeric; latest is `0035`, so new is `0036`. Also mirror the DDL into `db/schema.sql`.

---

## File Structure

**Backend**
- Create `db/migrations/0036_wmi_review_issues.sql` — the table + indexes.
- Modify `db/schema.sql` — add the same table near the other WMI review tables (~line 660).
- Create `api/services/wmi/reviewIssues.ts` — types, pure helpers (`suggestVerdict`, `resolutionFor`, `PAPER_QUICKFIX_PARTS`), and DB functions (`listIssues`, `createIssue`, `updateIssue`, `getIssueCountsByTarget`).
- Create `api/services/wmi/reviewIssues.test.ts` — pure-helper unit tests (no DB).
- Modify `api/routes/wmi-admin.ts` — add `GET/POST /issues`, `PATCH /issues/:id`, and (Phase 2) `PATCH /papers/:id/questions/:qid` quick-fix.

**Frontend (shared)**
- Create `src/lib/wmiReviewIssues.ts` — client types, API calls, and the pure `serializeIssuesForClaude`.
- Create `src/lib/wmiReviewIssues.test.ts` — serializer + `suggestVerdictClient` tests.
- Create `src/hooks/useReviewIssues.ts` — fetch/create/update issues for a target.
- Create `src/components/admin/review/IssuesPanel.tsx` — issue list + lifecycle actions + copy-for-Claude.
- Create `src/components/admin/review/FlagButton.tsx` — the ⚑ affordance + inline "new issue" form.

**Frontend (pages)**
- Modify `src/pages/admin/AdminWmiConcepts.tsx` — flags + IssuesPanel + suggested verdict + badges.
- Modify `src/pages/admin/AdminWmiDrill.tsx` — same + per-question scoping + quick-fix editor.
- Create `src/pages/admin/AdminWmiReviewQueue.tsx` — the cross-item queue (Phase 2).
- Modify `src/App.tsx` — add `/admin/wmi/review` route (Phase 2).

---

# PHASE 1 — Issues core

Delivers per-part flagging, the per-item Issues panel with the lifecycle state machine, and a suggested verdict, on **both** pages.

## Task 1: Database migration + schema

**Files:**
- Create: `db/migrations/0036_wmi_review_issues.sql`
- Modify: `db/schema.sql` (insert after the `wmi_concept_reviews` block, ~line 660)

- [ ] **Step 1: Write the migration**

```sql
-- 0036_wmi_review_issues.sql
-- Granular, stateful review issues layered over the per-item verdict tables.
-- Human flags a problem on a specific part; Claude Code (or the human) resolves it.
CREATE TABLE IF NOT EXISTS wmi_review_issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   TEXT NOT NULL CHECK (target_type IN ('paper','paper_question','concept')),
  paper_id      UUID REFERENCES wmi_papers(id)    ON DELETE CASCADE,
  question_id   UUID REFERENCES wmi_questions(id) ON DELETE CASCADE,
  concept_slug  TEXT,
  part          TEXT NOT NULL CHECK (part IN
                  ('stem','answer','choices','hint','breakdown','illustration',
                   'steps','animation','trap','meta','other')),
  severity      TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('blocker','warning','nit')),
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
  CHECK (
    (target_type = 'concept'        AND concept_slug IS NOT NULL AND paper_id IS NULL     AND question_id IS NULL) OR
    (target_type = 'paper'          AND paper_id IS NOT NULL     AND question_id IS NULL  AND concept_slug IS NULL) OR
    (target_type = 'paper_question' AND paper_id IS NOT NULL     AND question_id IS NOT NULL AND concept_slug IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_status_ai ON wmi_review_issues (status, ai_actionable);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_paper     ON wmi_review_issues (paper_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_question  ON wmi_review_issues (question_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_concept   ON wmi_review_issues (concept_slug);
```

- [ ] **Step 2: Mirror the same DDL into `db/schema.sql`** (copy the block above, minus the leading comment line, after the `wmi_concept_reviews` table).

- [ ] **Step 3: Apply the migration to your dev DB**

Run: `psql "$DATABASE_URL" -f db/migrations/0036_wmi_review_issues.sql`
Expected: `CREATE TABLE` then four `CREATE INDEX`.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0036_wmi_review_issues.sql db/schema.sql
git commit -m "feat(wmi-review): add wmi_review_issues table (0036)"
```

## Task 2: Backend service — pure helpers (TDD)

**Files:**
- Create: `api/services/wmi/reviewIssues.ts`
- Test: `api/services/wmi/reviewIssues.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// api/services/wmi/reviewIssues.test.ts
import { describe, it, expect } from 'vitest'
import { suggestVerdict, resolutionFor, PAPER_QUICKFIX_PARTS } from './reviewIssues.js'

describe('reviewIssues pure helpers', () => {
  it('suggestVerdict: no issues → pending', () => {
    expect(suggestVerdict([])).toBe('pending')
  })
  it('suggestVerdict: any non-closed issue → needs_changes', () => {
    expect(suggestVerdict([{ status: 'open', severity: 'nit' }])).toBe('needs_changes')
    expect(suggestVerdict([{ status: 'fixed', severity: 'warning' }])).toBe('needs_changes')
  })
  it('suggestVerdict: all closed → approved', () => {
    expect(suggestVerdict([
      { status: 'verified', severity: 'blocker' },
      { status: 'wont_fix', severity: 'warning' },
    ])).toBe('approved')
  })
  it('resolutionFor: terminal statuses set resolver + timestamp', () => {
    expect(resolutionFor('fixed', 'claude-code')).toEqual({ resolved_by: 'claude-code', setResolvedAt: true })
    expect(resolutionFor('verified', 'a@b.com')).toEqual({ resolved_by: 'a@b.com', setResolvedAt: true })
  })
  it('resolutionFor: open/in_progress clear resolver', () => {
    expect(resolutionFor('open', 'x')).toEqual({ resolved_by: null, setResolvedAt: false })
    expect(resolutionFor('in_progress', 'x')).toEqual({ resolved_by: null, setResolvedAt: false })
  })
  it('PAPER_QUICKFIX_PARTS are the simple text parts only', () => {
    expect(PAPER_QUICKFIX_PARTS).toEqual(['stem', 'answer', 'choices', 'hint'])
  })
})
```

- [ ] **Step 2: Run it; verify it fails**

Run: `npm run test -- reviewIssues`
Expected: FAIL — cannot find module `./reviewIssues.js` / exports undefined.

- [ ] **Step 3: Implement the service file (types + pure helpers + DB stubs filled in Task 3)**

```ts
// api/services/wmi/reviewIssues.ts
import { query, queryOne } from '../../db.js'
import type { ReviewStatus } from './concepts/reviews.js'

export const ISSUE_PARTS = [
  'stem','answer','choices','hint','breakdown','illustration',
  'steps','animation','trap','meta','other',
] as const
export type IssuePart = (typeof ISSUE_PARTS)[number]

export const ISSUE_STATUSES = ['open','in_progress','fixed','verified','wont_fix'] as const
export type IssueStatus = (typeof ISSUE_STATUSES)[number]

export const ISSUE_SEVERITIES = ['blocker','warning','nit'] as const
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number]

export type IssueTargetType = 'paper' | 'paper_question' | 'concept'

export type ReviewIssue = {
  id: string
  target_type: IssueTargetType
  paper_id: string | null
  question_id: string | null
  concept_slug: string | null
  part: IssuePart
  severity: IssueSeverity
  title: string
  detail: string
  status: IssueStatus
  ai_actionable: boolean
  fix_note: string | null
  created_by: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

// Simple text parts a paper question can be quick-fixed inline (everything else → Claude).
export const PAPER_QUICKFIX_PARTS: IssuePart[] = ['stem', 'answer', 'choices', 'hint']

// PURE — a status that means "resolved" (sets resolved_by + resolved_at).
export function resolutionFor(
  status: IssueStatus,
  actor: string | null,
): { resolved_by: string | null; setResolvedAt: boolean } {
  if (status === 'fixed' || status === 'verified' || status === 'wont_fix') {
    return { resolved_by: actor, setResolvedAt: true }
  }
  return { resolved_by: null, setResolvedAt: false }
}

// PURE — suggested (never auto-applied) item verdict from its issues.
export function suggestVerdict(
  issues: Pick<ReviewIssue, 'status' | 'severity'>[],
): ReviewStatus {
  if (issues.length === 0) return 'pending'
  const nonClosed = issues.filter((i) => i.status !== 'verified' && i.status !== 'wont_fix')
  if (nonClosed.length > 0) return 'needs_changes'
  return 'approved'
}
```

- [ ] **Step 4: Run the test; verify it passes**

Run: `npm run test -- reviewIssues`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: no errors (DB functions added next task; file compiles as-is).

- [ ] **Step 6: Commit**

```bash
git add api/services/wmi/reviewIssues.ts api/services/wmi/reviewIssues.test.ts
git commit -m "feat(wmi-review): reviewIssues types + pure helpers (TDD)"
```

## Task 3: Backend service — DB functions

**Files:**
- Modify: `api/services/wmi/reviewIssues.ts`

- [ ] **Step 1: Append DB functions to the service**

```ts
// --- DB access (append to api/services/wmi/reviewIssues.ts) ---

const SELECT = `
  id, target_type, paper_id, question_id, concept_slug, part, severity,
  title, detail, status, ai_actionable, fix_note, created_by, resolved_by,
  created_at, updated_at, resolved_at
`

export type IssueFilter = {
  status?: IssueStatus
  ai_actionable?: boolean
  target_type?: IssueTargetType
  concept_slug?: string
  paper_id?: string
  question_id?: string
  part?: IssuePart
  severity?: IssueSeverity
}

export async function listIssues(f: IssueFilter = {}): Promise<ReviewIssue[]> {
  const where: string[] = []
  const params: unknown[] = []
  const add = (clause: string, val: unknown) => { params.push(val); where.push(`${clause} $${params.length}`) }
  if (f.status) add('status =', f.status)
  if (f.ai_actionable !== undefined) add('ai_actionable =', f.ai_actionable)
  if (f.target_type) add('target_type =', f.target_type)
  if (f.concept_slug) add('concept_slug =', f.concept_slug)
  if (f.paper_id) add('paper_id =', f.paper_id)
  if (f.question_id) add('question_id =', f.question_id)
  if (f.part) add('part =', f.part)
  if (f.severity) add('severity =', f.severity)
  const sql = `SELECT ${SELECT} FROM wmi_review_issues
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY (status IN ('verified','wont_fix')) ASC, created_at DESC`
  return query<ReviewIssue>(sql, params)
}

export type NewIssue = {
  target_type: IssueTargetType
  paper_id?: string | null
  question_id?: string | null
  concept_slug?: string | null
  part: IssuePart
  severity?: IssueSeverity
  title: string
  detail?: string
  ai_actionable?: boolean
}

export async function createIssue(input: NewIssue, createdBy: string | null): Promise<ReviewIssue> {
  const row = await queryOne<ReviewIssue>(
    `INSERT INTO wmi_review_issues
       (target_type, paper_id, question_id, concept_slug, part, severity, title, detail, ai_actionable, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${SELECT}`,
    [
      input.target_type, input.paper_id ?? null, input.question_id ?? null, input.concept_slug ?? null,
      input.part, input.severity ?? 'warning', input.title, input.detail ?? '',
      input.ai_actionable ?? true, createdBy,
    ],
  )
  return row as ReviewIssue
}

export type IssuePatch = {
  status?: IssueStatus
  fix_note?: string
  severity?: IssueSeverity
  ai_actionable?: boolean
  title?: string
  detail?: string
}

export async function updateIssue(id: string, patch: IssuePatch, actor: string | null): Promise<ReviewIssue | null> {
  const sets: string[] = ['updated_at = NOW()']
  const params: unknown[] = []
  const set = (col: string, val: unknown) => { params.push(val); sets.push(`${col} = $${params.length}`) }
  if (patch.severity !== undefined) set('severity', patch.severity)
  if (patch.ai_actionable !== undefined) set('ai_actionable', patch.ai_actionable)
  if (patch.title !== undefined) set('title', patch.title)
  if (patch.detail !== undefined) set('detail', patch.detail)
  if (patch.fix_note !== undefined) set('fix_note', patch.fix_note)
  if (patch.status !== undefined) {
    set('status', patch.status)
    const r = resolutionFor(patch.status, actor)
    set('resolved_by', r.resolved_by)
    sets.push(`resolved_at = ${r.setResolvedAt ? 'NOW()' : 'NULL'}`)
  }
  params.push(id)
  const row = await queryOne<ReviewIssue>(
    `UPDATE wmi_review_issues SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${SELECT}`,
    params,
  )
  return row
}

// Open-issue counts per target, for sidebar badges. Returns maps keyed by concept_slug and paper_id.
export async function getOpenIssueCounts(): Promise<{ byConcept: Record<string, number>; byPaper: Record<string, number>; fixedByConcept: Record<string, number>; fixedByPaper: Record<string, number> }> {
  const rows = await query<{ concept_slug: string | null; paper_id: string | null; status: IssueStatus; n: string }>(
    `SELECT concept_slug, paper_id, status, COUNT(*)::int AS n
     FROM wmi_review_issues
     WHERE status IN ('open','in_progress','fixed')
     GROUP BY concept_slug, paper_id, status`,
  )
  const byConcept: Record<string, number> = {}, byPaper: Record<string, number> = {}
  const fixedByConcept: Record<string, number> = {}, fixedByPaper: Record<string, number> = {}
  for (const r of rows) {
    const n = Number(r.n)
    const open = r.status !== 'fixed'
    if (r.concept_slug) (open ? byConcept : fixedByConcept)[r.concept_slug] = ((open ? byConcept : fixedByConcept)[r.concept_slug] ?? 0) + n
    if (r.paper_id) (open ? byPaper : fixedByPaper)[r.paper_id] = ((open ? byPaper : fixedByPaper)[r.paper_id] ?? 0) + n
  }
  return { byConcept, byPaper, fixedByConcept, fixedByPaper }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add api/services/wmi/reviewIssues.ts
git commit -m "feat(wmi-review): reviewIssues DB access (list/create/update/counts)"
```

## Task 4: API endpoints

**Files:**
- Modify: `api/routes/wmi-admin.ts`

- [ ] **Step 1: Add imports** (top of file, after existing service imports)

```ts
import {
  ISSUE_PARTS, ISSUE_SEVERITIES, ISSUE_STATUSES,
  createIssue, listIssues, updateIssue, getOpenIssueCounts,
  type IssueFilter,
} from '../services/wmi/reviewIssues.js'
```

- [ ] **Step 2: Add Joi schemas + routes** (before `export default router`)

```ts
const issueCreateSchema = Joi.object({
  target_type: Joi.string().valid('paper', 'paper_question', 'concept').required(),
  paper_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  question_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  concept_slug: Joi.string().max(120).optional(),
  part: Joi.string().valid(...ISSUE_PARTS).required(),
  severity: Joi.string().valid(...ISSUE_SEVERITIES).default('warning'),
  title: Joi.string().min(1).max(300).required(),
  detail: Joi.string().allow('').max(8000).default(''),
  ai_actionable: Joi.boolean().default(true),
})

const issuePatchSchema = Joi.object({
  status: Joi.string().valid(...ISSUE_STATUSES),
  fix_note: Joi.string().allow('').max(8000),
  severity: Joi.string().valid(...ISSUE_SEVERITIES),
  ai_actionable: Joi.boolean(),
  title: Joi.string().min(1).max(300),
  detail: Joi.string().allow('').max(8000),
}).min(1)

const issueQuerySchema = Joi.object({
  status: Joi.string().valid(...ISSUE_STATUSES),
  ai_actionable: Joi.boolean(),
  target_type: Joi.string().valid('paper', 'paper_question', 'concept'),
  concept_slug: Joi.string().max(120),
  paper_id: Joi.string().guid({ version: 'uuidv4' }),
  question_id: Joi.string().guid({ version: 'uuidv4' }),
  part: Joi.string().valid(...ISSUE_PARTS),
  severity: Joi.string().valid(...ISSUE_SEVERITIES),
})

router.get('/issues', async (req: Request, res: Response): Promise<void> => {
  const { error, value } = issueQuerySchema.validate(req.query)
  if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
  try {
    const issues = await listIssues(value as IssueFilter)
    res.json({ success: true, data: { issues } })
  } catch (e) {
    console.error('WMI issues list error:', e)
    res.status(500).json({ success: false, error: 'Unable to load issues' })
  }
})

router.get('/issues/counts', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ success: true, data: await getOpenIssueCounts() })
  } catch (e) {
    console.error('WMI issue counts error:', e)
    res.status(500).json({ success: false, error: 'Unable to load issue counts' })
  }
})

router.post('/issues', async (req: AuthRequest, res: Response): Promise<void> => {
  const { error, value } = issueCreateSchema.validate(req.body)
  if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
  try {
    const issue = await createIssue(value, req.user?.email ?? null)
    res.status(201).json({ success: true, data: { issue } })
  } catch (e) {
    console.error('WMI issue create error:', e)
    res.status(500).json({ success: false, error: 'Unable to create issue' })
  }
})

router.patch('/issues/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) { res.status(404).json({ success: false, error: 'Issue not found' }); return }
  const { error, value } = issuePatchSchema.validate(req.body)
  if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
  try {
    const issue = await updateIssue(req.params.id, value, req.user?.email ?? null)
    if (!issue) { res.status(404).json({ success: false, error: 'Issue not found' }); return }
    res.json({ success: true, data: { issue } })
  } catch (e) {
    console.error('WMI issue update error:', e)
    res.status(500).json({ success: false, error: 'Unable to update issue' })
  }
})
```

- [ ] **Step 3: Typecheck + manual smoke**

Run: `npm run check`
Then with the dev server running, create one issue:
```bash
# replace TOKEN with an admin bearer token from the app
curl -s -X POST http://localhost:3001/api/admin/wmi/issues \
  -H "Authorization: Bearer TOKEN" -H 'Content-Type: application/json' \
  -d '{"target_type":"concept","concept_slug":"budget-selection","part":"steps","title":"Step 2 unclear"}' | jq
```
Expected: `{ success: true, data: { issue: { id, status: "open", ... } } }`.

- [ ] **Step 4: Commit**

```bash
git add api/routes/wmi-admin.ts
git commit -m "feat(wmi-review): admin issue endpoints (list/counts/create/patch)"
```

## Task 5: Frontend client module + serializer (TDD)

**Files:**
- Create: `src/lib/wmiReviewIssues.ts`
- Test: `src/lib/wmiReviewIssues.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/wmiReviewIssues.test.ts
import { describe, it, expect } from 'vitest'
import { serializeIssuesForClaude, type ReviewIssue } from './wmiReviewIssues'

const base: ReviewIssue = {
  id: '1', target_type: 'concept', paper_id: null, question_id: null, concept_slug: 'budget-selection',
  part: 'illustration', severity: 'blocker', title: 'Triangle overlaps label', detail: 'At large N the label clips.',
  status: 'open', ai_actionable: true, fix_note: null, created_by: 'a@b.com', resolved_by: null,
  created_at: '', updated_at: '', resolved_at: null,
}

describe('serializeIssuesForClaude', () => {
  it('renders a concept issue with slug, part, severity, detail', () => {
    const md = serializeIssuesForClaude([base])
    expect(md).toContain('concept `budget-selection`')
    expect(md).toContain('illustration')
    expect(md).toContain('blocker')
    expect(md).toContain('At large N the label clips.')
  })
  it('renders a paper-question issue with code + question number when provided', () => {
    const md = serializeIssuesForClaude([{ ...base, target_type: 'paper_question', concept_slug: null,
      paper_id: 'p1', question_id: 'q1', part: 'breakdown', title: 'Highlight wrong' }],
      { 'q1': { code: 'WMI-23F2A', number: 3 } })
    expect(md).toContain('WMI-23F2A')
    expect(md).toContain('Q3')
    expect(md).toContain('breakdown')
  })
  it('skips issues that are not ai_actionable', () => {
    const md = serializeIssuesForClaude([{ ...base, ai_actionable: false }])
    expect(md).not.toContain('Triangle overlaps')
  })
})
```

- [ ] **Step 2: Run it; verify it fails**

Run: `npm run test -- wmiReviewIssues`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the client module**

```ts
// src/lib/wmiReviewIssues.ts
import api from './api'

export type IssuePart =
  | 'stem' | 'answer' | 'choices' | 'hint' | 'breakdown' | 'illustration'
  | 'steps' | 'animation' | 'trap' | 'meta' | 'other'
export type IssueStatus = 'open' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix'
export type IssueSeverity = 'blocker' | 'warning' | 'nit'
export type IssueTargetType = 'paper' | 'paper_question' | 'concept'

export const PAPER_QUICKFIX_PARTS: IssuePart[] = ['stem', 'answer', 'choices', 'hint']

export interface ReviewIssue {
  id: string
  target_type: IssueTargetType
  paper_id: string | null
  question_id: string | null
  concept_slug: string | null
  part: IssuePart
  severity: IssueSeverity
  title: string
  detail: string
  status: IssueStatus
  ai_actionable: boolean
  fix_note: string | null
  created_by: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface IssueCounts {
  byConcept: Record<string, number>
  byPaper: Record<string, number>
  fixedByConcept: Record<string, number>
  fixedByPaper: Record<string, number>
}

export type IssueTarget =
  | { target_type: 'concept'; concept_slug: string }
  | { target_type: 'paper'; paper_id: string }
  | { target_type: 'paper_question'; paper_id: string; question_id: string }

type ListParams = Partial<{
  status: IssueStatus; ai_actionable: boolean; target_type: IssueTargetType
  concept_slug: string; paper_id: string; question_id: string; part: IssuePart; severity: IssueSeverity
}>

export async function listIssues(params: ListParams = {}): Promise<ReviewIssue[]> {
  const { data } = await api.get('/admin/wmi/issues', { params })
  return data.data.issues
}
export async function fetchIssueCounts(): Promise<IssueCounts> {
  const { data } = await api.get('/admin/wmi/issues/counts')
  return data.data
}
export async function createIssue(input: IssueTarget & {
  part: IssuePart; title: string; detail?: string; severity?: IssueSeverity; ai_actionable?: boolean
}): Promise<ReviewIssue> {
  const { data } = await api.post('/admin/wmi/issues', input)
  return data.data.issue
}
export async function patchIssue(id: string, patch: Partial<{
  status: IssueStatus; fix_note: string; severity: IssueSeverity; ai_actionable: boolean; title: string; detail: string
}>): Promise<ReviewIssue> {
  const { data } = await api.patch(`/admin/wmi/issues/${id}`, patch)
  return data.data.issue
}

// PURE — build a markdown block the human pastes into a Claude Code session.
// Only ai_actionable issues are included (human-only issues stay out of Claude's queue).
export function serializeIssuesForClaude(
  issues: ReviewIssue[],
  questionMeta: Record<string, { code?: string; number: number }> = {},
): string {
  const lines: string[] = ['# WMI review issues to fix', '']
  for (const i of issues) {
    if (!i.ai_actionable) continue
    let target: string
    if (i.target_type === 'concept') target = `concept \`${i.concept_slug}\``
    else if (i.target_type === 'paper_question') {
      const m = i.question_id ? questionMeta[i.question_id] : undefined
      target = `paper ${m?.code ?? i.paper_id}${m ? ` Q${m.number}` : ''}`
    } else target = `paper ${i.paper_id}`
    lines.push(`- [ ] **${target}** · part: \`${i.part}\` · ${i.severity}`)
    lines.push(`  - ${i.title}`)
    if (i.detail.trim()) lines.push(`  - ${i.detail.trim()}`)
    lines.push(`  - issue id: \`${i.id}\` (PATCH to status=fixed with a fix_note when done)`)
  }
  return lines.join('\n')
}
```

- [ ] **Step 4: Run the test; verify it passes**

Run: `npm run test -- wmiReviewIssues`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/wmiReviewIssues.ts src/lib/wmiReviewIssues.test.ts
git commit -m "feat(wmi-review): client issue API + copy-for-Claude serializer (TDD)"
```

## Task 6: `useReviewIssues` hook

**Files:**
- Create: `src/hooks/useReviewIssues.ts`

- [ ] **Step 1: Implement the hook**

```ts
// src/hooks/useReviewIssues.ts
import { useCallback, useEffect, useState } from 'react'
import {
  createIssue, listIssues, patchIssue,
  type IssueTarget, type ReviewIssue,
} from '../lib/wmiReviewIssues'

function targetKey(t: IssueTarget | null): string {
  if (!t) return ''
  if (t.target_type === 'concept') return `c:${t.concept_slug}`
  if (t.target_type === 'paper') return `p:${t.paper_id}`
  return `pq:${t.paper_id}:${t.question_id}`
}

// For papers we want ALL issues of the paper (so we can scope "this question" vs "whole paper"
// in the UI). For concepts we want the concept's issues.
export function useReviewIssues(target: IssueTarget | null) {
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const key = targetKey(target)

  const reload = useCallback(async () => {
    if (!target) { setIssues([]); return }
    setLoading(true); setError(null)
    try {
      const params = target.target_type === 'concept'
        ? { concept_slug: target.concept_slug }
        : { paper_id: target.paper_id }
      setIssues(await listIssues(params))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat issues')
    } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => { reload() }, [reload])

  const add = useCallback(async (input: Parameters<typeof createIssue>[0]) => {
    const created = await createIssue(input)
    setIssues((xs) => [created, ...xs])
    return created
  }, [])

  const update = useCallback(async (id: string, patch: Parameters<typeof patchIssue>[1]) => {
    const updated = await patchIssue(id, patch)
    setIssues((xs) => xs.map((x) => (x.id === id ? updated : x)))
    return updated
  }, [])

  return { issues, loading, error, reload, add, update }
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run check`
```bash
git add src/hooks/useReviewIssues.ts
git commit -m "feat(wmi-review): useReviewIssues hook"
```

## Task 7: `FlagButton` and `IssuesPanel` components

**Files:**
- Create: `src/components/admin/review/FlagButton.tsx`
- Create: `src/components/admin/review/IssuesPanel.tsx`

- [ ] **Step 1: Implement `FlagButton`** (the ⚑ affordance + inline new-issue form)

```tsx
// src/components/admin/review/FlagButton.tsx
import { useState } from 'react'
import { Button, Input, Select, Textarea } from '../ui'
import type { IssuePart, IssueSeverity } from '../../../lib/wmiReviewIssues'

export default function FlagButton({
  part, onCreate,
}: {
  part: IssuePart
  onCreate: (i: { part: IssuePart; title: string; detail: string; severity: IssueSeverity; ai_actionable: boolean }) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [severity, setSeverity] = useState<IssueSeverity>('warning')
  const [aiActionable, setAiActionable] = useState(true)
  const [saving, setSaving] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="rounded-md border border-qupu-brand-orange px-2 py-0.5 text-[10px] font-bold text-qupu-brand-orange hover:bg-orange-50">
        ⚑ flag {part}
      </button>
    )
  }
  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-qupu-brand-orange bg-orange-50/50 p-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`What's wrong with the ${part}?`} aria-label="Issue title" />
      <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} placeholder="Detail / suggested fix (Claude reads this)" />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} aria-label="Severity">
          <option value="blocker">Blocker</option>
          <option value="warning">Warning</option>
          <option value="nit">Nit</option>
        </Select>
        <label className="inline-flex items-center gap-1 font-semibold text-admin-muted">
          <input type="checkbox" checked={aiActionable} onChange={(e) => setAiActionable(e.target.checked)} />
          AI-actionable
        </label>
        <Button type="button" disabled={!title.trim() || saving} loading={saving}
          onClick={async () => {
            setSaving(true)
            try { await onCreate({ part, title: title.trim(), detail: detail.trim(), severity, ai_actionable: aiActionable }); setOpen(false); setTitle(''); setDetail('') }
            finally { setSaving(false) }
          }}>Add issue</Button>
        <button type="button" className="text-xs text-admin-faint" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `IssuesPanel`** (list + lifecycle actions + copy-for-Claude)

```tsx
// src/components/admin/review/IssuesPanel.tsx
import { Panel, SectionHeading } from '../ui'
import { serializeIssuesForClaude, type IssueStatus, type ReviewIssue } from '../../../lib/wmiReviewIssues'

const SEV_DOT: Record<string, string> = { blocker: 'bg-rose-600', warning: 'bg-amber-500', nit: 'bg-admin-edge' }
const STATUS_CHIP: Record<IssueStatus, { cls: string; label: string }> = {
  open: { cls: 'bg-rose-100 text-rose-700', label: 'open' },
  in_progress: { cls: 'bg-yellow-100 text-yellow-800', label: 'in progress' },
  fixed: { cls: 'bg-blue-100 text-blue-700', label: 'fixed — re-review' },
  verified: { cls: 'bg-emerald-100 text-emerald-700', label: 'verified' },
  wont_fix: { cls: 'bg-admin-sunk text-admin-muted', label: "won't fix" },
}

export default function IssuesPanel({
  issues, title = 'Issues', questionMeta = {}, onUpdate,
}: {
  issues: ReviewIssue[]
  title?: string
  questionMeta?: Record<string, { code?: string; number: number }>
  onUpdate: (id: string, patch: Partial<{ status: IssueStatus }>) => Promise<unknown>
}) {
  const open = issues.filter((i) => i.status !== 'verified' && i.status !== 'wont_fix')
  const copy = () => navigator.clipboard.writeText(serializeIssuesForClaude(issues, questionMeta))

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <SectionHeading>{title} · {open.length} open</SectionHeading>
        <button type="button" onClick={copy}
          className="rounded-md bg-qupu-brand-orange px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">
          📋 Copy issues for Claude
        </button>
      </div>
      {issues.length === 0 ? (
        <p className="mt-2 text-sm text-admin-faint">No issues filed. Use ⚑ on a part to flag one.</p>
      ) : (
        <ul className="mt-3 divide-y divide-admin-line">
          {issues.map((i) => {
            const chip = STATUS_CHIP[i.status]
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">{i.part}</span>
                <span className={`h-2 w-2 rounded-full ${SEV_DOT[i.severity]}`} title={i.severity} />
                <span className="min-w-0 flex-1 truncate" title={i.detail}>{i.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${chip.cls}`}>{chip.label}</span>
                {i.status === 'open' && (
                  <button type="button" className="text-xs font-semibold text-admin-muted hover:text-admin-ink" onClick={() => onUpdate(i.id, { status: 'in_progress' })}>Claim</button>
                )}
                {i.status === 'fixed' && (
                  <button type="button" className="text-xs font-semibold text-emerald-700" onClick={() => onUpdate(i.id, { status: 'verified' })}>Verify ✓</button>
                )}
                {(i.status === 'fixed' || i.status === 'verified') && (
                  <button type="button" className="text-xs font-semibold text-admin-faint hover:text-admin-ink" onClick={() => onUpdate(i.id, { status: 'open' })}>Reopen</button>
                )}
                {(i.status === 'open' || i.status === 'in_progress') && (
                  <button type="button" className="text-xs font-semibold text-admin-faint hover:text-admin-ink" onClick={() => onUpdate(i.id, { status: 'wont_fix' })}>Won't fix</button>
                )}
                {i.status === 'fixed' && i.fix_note && (
                  <span className="w-full pl-7 text-xs italic text-blue-700">fix: {i.fix_note}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npm run check` (confirm `Select`/`Textarea`/`Input`/`Button`/`Panel`/`SectionHeading` are exported from `src/components/admin/ui` — they are, per both admin pages).
```bash
git add src/components/admin/review/
git commit -m "feat(wmi-review): FlagButton + IssuesPanel components"
```

## Task 8: Wire issues into the Concept page

**Files:**
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`

- [ ] **Step 1: Add imports**

```tsx
import { useReviewIssues } from '../../hooks/useReviewIssues'
import IssuesPanel from '../../components/admin/review/IssuesPanel'
import FlagButton from '../../components/admin/review/FlagButton'
import { suggestVerdictClient } from '../../lib/wmiReviewIssues' // add this pure helper to the lib (below)
```

- [ ] **Step 2: Add `suggestVerdictClient` to `src/lib/wmiReviewIssues.ts`** (pure mirror of the server helper; append + extend the test)

```ts
// append to src/lib/wmiReviewIssues.ts
export function suggestVerdictClient(issues: ReviewIssue[]): 'pending' | 'approved' | 'needs_changes' {
  if (issues.length === 0) return 'pending'
  return issues.some((i) => i.status !== 'verified' && i.status !== 'wont_fix') ? 'needs_changes' : 'approved'
}
```
Add to `src/lib/wmiReviewIssues.test.ts`:
```ts
import { suggestVerdictClient } from './wmiReviewIssues'
it('suggestVerdictClient mirrors server rules', () => {
  expect(suggestVerdictClient([])).toBe('pending')
  expect(suggestVerdictClient([{ ...base, status: 'verified' }])).toBe('approved')
  expect(suggestVerdictClient([{ ...base, status: 'open' }])).toBe('needs_changes')
})
```
Run: `npm run test -- wmiReviewIssues` → PASS (4 tests).

- [ ] **Step 3: Hook into the component** (inside `AdminWmiConcepts`, after the `active` derivation ~line 224)

```tsx
const issueTarget = activeSlug ? { target_type: 'concept' as const, concept_slug: activeSlug } : null
const { issues, add: addIssue, update: updateIssue } = useReviewIssues(issueTarget)
const suggested = suggestVerdictClient(issues)
```

- [ ] **Step 4: Render the IssuesPanel** (immediately after the Review `<Section>` block, before "Sample navigation" ~line 511)

```tsx
{active && (
  <IssuesPanel
    issues={issues}
    title="Issues"
    onUpdate={(id, patch) => updateIssue(id, patch)}
  />
)}
```

- [ ] **Step 5: Add a FlagButton to each preview section header.** Change the local `Section` to optionally render a flag. Replace the `Section` usages for Question/Answer/Step-by-step/Animation to pass a `part`, and update `Section` to render `<FlagButton>` when `part` + `onFlag` are provided:

```tsx
function Section({ title, hint, part, onFlag, children }: {
  title: string; hint?: string
  part?: IssuePart
  onFlag?: (i: { part: IssuePart; title: string; detail: string; severity: IssueSeverity; ai_actionable: boolean }) => Promise<unknown>
  children: React.ReactNode
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-2">
        <SectionHeading>{title}</SectionHeading>
        {part && onFlag && <FlagButton part={part} onCreate={onFlag} />}
      </div>
      {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </Panel>
  )
}
```
Then pass `part`/`onFlag` to the sections, e.g. Question → `part="breakdown"` (or `"stem"`), Answer → `part="answer"`, Step-by-step → `part="steps"`, Animation → `part="animation"`, with `onFlag={(i) => addIssue({ target_type: 'concept', concept_slug: activeSlug!, ...i })}`. Add the `IssuePart`, `IssueSeverity` type imports.

- [ ] **Step 6: Show the suggested verdict** next to the existing verdict buttons in the Review section:
```tsx
{suggested !== status && (
  <span className="text-xs font-semibold text-admin-faint">suggested: {suggested.replace('_', ' ')}</span>
)}
```

- [ ] **Step 7: Typecheck, run the app, smoke test**

Run: `npm run check`
Manual: open `/admin/wmi/concepts`, flag the `steps` part, see it appear in the Issues panel; Claim → Won't fix transitions work.

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/AdminWmiConcepts.tsx src/lib/wmiReviewIssues.ts src/lib/wmiReviewIssues.test.ts
git commit -m "feat(wmi-review): per-part flags + issues panel on concept page"
```

## Task 9: Wire issues into the Paper page (flags + panel only; quick-fix is Phase 2)

**Files:**
- Modify: `src/pages/admin/AdminWmiDrill.tsx`

- [ ] **Step 1: Add imports** (mirror Task 8 Step 1, minus suggestVerdictClient if already global).

- [ ] **Step 2: Hook in** (after `currentQuestion` derivation ~line 254)

```tsx
const issueTarget = activePaperId ? { target_type: 'paper' as const, paper_id: activePaperId } : null
const { issues, add: addIssue, update: updateIssue } = useReviewIssues(issueTarget)
const questionMeta = useMemo(
  () => Object.fromEntries(questions.map((q) => [q.id, { code: q.code, number: q.number }])),
  [questions],
)
const thisQuestionIssues = useMemo(
  () => issues.filter((i) => i.question_id === currentQuestion?.id),
  [issues, currentQuestion],
)
```

- [ ] **Step 3: Render the IssuesPanel** under the question preview Panel (~line 547), scoped with a toggle. Add `const [scopeAll, setScopeAll] = useState(false)` near the other state, then:

```tsx
{activePaper && (
  <IssuesPanel
    issues={scopeAll ? issues : thisQuestionIssues}
    title={scopeAll ? `In this paper` : `On this question`}
    questionMeta={questionMeta}
    onUpdate={(id, patch) => updateIssue(id, patch)}
  />
)}
{activePaper && (
  <button type="button" className="text-xs font-semibold text-admin-muted" onClick={() => setScopeAll((v) => !v)}>
    {scopeAll ? 'Show this question only' : `Show all paper issues (${issues.length})`}
  </button>
)}
```

- [ ] **Step 4: Add a per-part flag row** under the question preview. After the `Answer:` line inside the question Panel, add:
```tsx
{currentQuestion && (
  <div className="mt-3 flex flex-wrap gap-2">
    {(['stem','answer','choices','hint','breakdown','steps','visual'] as IssuePart[]).map((part) => (
      <FlagButton key={part} part={part}
        onCreate={(i) => addIssue({ target_type: 'paper_question', paper_id: activePaperId!, question_id: currentQuestion.id, ...i })} />
    ))}
  </div>
)}
```
> Note: `'visual'` is not in the part enum; map it to `'illustration'` in the array, or add `'visual'` to the enum + DB CHECK + Joi list. Use `'illustration'` to avoid a migration.

- [ ] **Step 5: Typecheck + smoke + commit**

Run: `npm run check`; manual: flag `stem` on question 3, see it in "On this question", toggle to whole-paper scope.
```bash
git add src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(wmi-review): per-part flags + scoped issues panel on paper page"
```

**Phase 1 done** — per-part review + the lifecycle loop work on both pages. Run `npm run check` and `npm run test` clean before moving on.

---

# PHASE 2 — AI handoff + paper quick-fix + Review Queue

## Task 10: Paper question quick-fix endpoint

**Files:**
- Modify: `api/services/wmi/paperReviews.ts` (add `updateQuestionFields`)
- Modify: `api/routes/wmi-admin.ts` (add `PATCH /papers/:id/questions/:qid`)

- [ ] **Step 1: Add the service function**

```ts
// append to api/services/wmi/paperReviews.ts
export type QuestionTextPatch = Partial<{
  body_en: string; body_id: string; answer: string; hint_en: string | null; hint_id: string | null
}>

export async function updateQuestionFields(questionId: string, patch: QuestionTextPatch): Promise<boolean> {
  const cols: string[] = []; const params: unknown[] = []
  const set = (c: string, v: unknown) => { params.push(v); cols.push(`${c} = $${params.length}`) }
  if (patch.body_en !== undefined) set('body_en', patch.body_en)
  if (patch.body_id !== undefined) set('body_id', patch.body_id)
  if (patch.answer !== undefined) set('answer', patch.answer)
  if (patch.hint_en !== undefined) set('hint_en', patch.hint_en)
  if (patch.hint_id !== undefined) set('hint_id', patch.hint_id)
  if (cols.length === 0) return false
  params.push(questionId)
  const row = await queryOne<{ id: string }>(
    `UPDATE wmi_questions SET ${cols.join(', ')} WHERE id = $${params.length} RETURNING id`, params)
  return Boolean(row)
}
```

- [ ] **Step 2: Add the route** (in `wmi-admin.ts`, import `updateQuestionFields`)

```ts
const questionPatchSchema = Joi.object({
  body_en: Joi.string().min(1), body_id: Joi.string().min(1), answer: Joi.string().allow(''),
  hint_en: Joi.string().allow('', null), hint_id: Joi.string().allow('', null),
}).min(1)

router.patch('/papers/:id/questions/:qid', async (req: Request, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id) || !UUID_RE.test(req.params.qid)) {
    res.status(404).json({ success: false, error: 'Not found' }); return
  }
  const { error, value } = questionPatchSchema.validate(req.body)
  if (error) { res.status(400).json({ success: false, error: error.details[0].message }); return }
  try {
    const ok = await updateQuestionFields(req.params.qid, value)
    if (!ok) { res.status(404).json({ success: false, error: 'Question not found' }); return }
    res.json({ success: true, data: { ok: true } })
  } catch (e) {
    console.error('WMI question quick-fix error:', e)
    res.status(500).json({ success: false, error: 'Unable to update question' })
  }
})
```

- [ ] **Step 3: Client call** in `src/lib/wmiAdminApi.ts`:
```ts
export async function patchPaperQuestion(paperId: string, questionId: string,
  patch: Partial<{ body_en: string; body_id: string; answer: string; hint_en: string | null; hint_id: string | null }>): Promise<void> {
  await api.patch(`/admin/wmi/papers/${paperId}/questions/${questionId}`, patch)
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npm run check`
```bash
git add api/services/wmi/paperReviews.ts api/routes/wmi-admin.ts src/lib/wmiAdminApi.ts
git commit -m "feat(wmi-review): paper question quick-fix endpoint + client call"
```

## Task 11: Quick-fix editor in the paper page

**Files:**
- Modify: `src/pages/admin/AdminWmiDrill.tsx`

- [ ] **Step 1:** Add an inline editor for simple-text parts. After the per-part flag row, add a small editor toggled per simple part (`stem`/`answer`/`hint`). On Save, call `patchPaperQuestion`, refetch questions (`loadQuestions(activePaperId)`), and if an open issue exists for that part, `updateIssue(issue.id, { status: 'verified' })`.

```tsx
const [editPart, setEditPart] = useState<null | 'stem' | 'answer' | 'hint'>(null)
const [draft, setDraft] = useState<{ body_en: string; body_id: string; answer: string; hint_en: string; hint_id: string }>(
  { body_en: '', body_id: '', answer: '', hint_en: '', hint_id: '' })

// when opening the editor, seed from currentQuestion:
function openEdit(part: 'stem' | 'answer' | 'hint') {
  if (!currentQuestion) return
  setDraft({
    body_en: currentQuestion.body_en, body_id: currentQuestion.body_id, answer: currentQuestion.answer,
    hint_en: currentQuestion.hint_en ?? '', hint_id: currentQuestion.hint_id ?? '',
  })
  setEditPart(part)
}

async function saveEdit() {
  if (!currentQuestion || !activePaperId || !editPart) return
  const patch = editPart === 'stem' ? { body_en: draft.body_en, body_id: draft.body_id }
    : editPart === 'answer' ? { answer: draft.answer }
    : { hint_en: draft.hint_en, hint_id: draft.hint_id }
  await patchPaperQuestion(activePaperId, currentQuestion.id, patch)
  await loadQuestions(activePaperId)
  const openIssue = issues.find((i) => i.question_id === currentQuestion.id && i.part === editPart && i.status !== 'verified' && i.status !== 'wont_fix')
  if (openIssue) await updateIssue(openIssue.id, { status: 'verified' })
  setEditPart(null)
}
```
Render an editor block (Textareas for stem EN/ID, Input for answer, Textareas for hints) with Save/Cancel when `editPart` is set, and add `✎ quick-fix` buttons next to the `stem`/`answer`/`hint` flag buttons that call `openEdit(part)`. Import `patchPaperQuestion`.

- [ ] **Step 2: Typecheck + smoke + commit**

Run: `npm run check`; manual: quick-fix a stem typo → saves, re-renders, and verifies the matching issue.
```bash
git add src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(wmi-review): in-app quick-fix editor for simple paper text"
```

## Task 12: Review Queue page + route

**Files:**
- Create: `src/pages/admin/AdminWmiReviewQueue.tsx`
- Modify: `src/App.tsx` (add the admin route)

- [ ] **Step 1: Build the page** — fetch all issues with filters, render a "Fixed — awaiting re-review" pinned section and an "Open issues" list with multi-select + a bulk "Copy selected for Claude" button (uses `serializeIssuesForClaude`). Reuse `listIssues`/`patchIssue`. Filters: target type, status, ai_actionable, severity. Bulk verify and bulk wont_fix call `patchIssue` per selected id.

```tsx
// src/pages/admin/AdminWmiReviewQueue.tsx
import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Button, Panel } from '../../components/admin/ui'
import { listIssues, patchIssue, serializeIssuesForClaude, type ReviewIssue, type IssueStatus } from '../../lib/wmiReviewIssues'

export default function AdminWmiReviewQueue() {
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [aiOnly, setAiOnly] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const reload = () => listIssues(aiOnly ? { ai_actionable: true } : {}).then(setIssues)
  useEffect(() => { reload() }, [aiOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const fixed = useMemo(() => issues.filter((i) => i.status === 'fixed'), [issues])
  const open = useMemo(() => issues.filter((i) => i.status === 'open' || i.status === 'in_progress'), [issues])
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const copySelected = () => navigator.clipboard.writeText(
    serializeIssuesForClaude(issues.filter((i) => sel.has(i.id))))
  const bulk = async (status: IssueStatus) => { for (const id of sel) await patchIssue(id, { status }); setSel(new Set()); reload() }

  return (
    <div className="space-y-5">
      <AdminPageHeader eyebrow="Admin · WMI" title="Review Queue"
        description="Every open issue across concepts & papers — the shared work surface for you and Claude." />
      <label className="text-sm font-semibold"><input type="checkbox" checked={aiOnly} onChange={(e) => setAiOnly(e.target.checked)} /> AI-actionable only</label>

      {fixed.length > 0 && (
        <Panel>
          <h3 className="font-bold text-blue-700">Fixed by Claude — awaiting your re-review ({fixed.length})</h3>
          <ul className="mt-2 divide-y divide-admin-line">
            {fixed.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="font-mono text-[11px]">{i.target_type === 'concept' ? i.concept_slug : i.paper_id}</span>
                <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] text-white">{i.part}</span>
                <span className="flex-1 truncate">{i.title}</span>
                <Button onClick={async () => { await patchIssue(i.id, { status: 'verified' }); reload() }}>Verify ✓</Button>
                <button className="text-xs" onClick={async () => { await patchIssue(i.id, { status: 'open' }); reload() }}>Reopen</button>
                {i.fix_note && <span className="w-full pl-6 text-xs italic text-blue-700">fix: {i.fix_note}</span>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Open issues ({open.length})</h3>
          {sel.size > 0 && (
            <div className="flex gap-2">
              <Button onClick={copySelected}>📋 Copy selected for Claude ({sel.size})</Button>
              <button className="text-xs" onClick={() => bulk('in_progress')}>Claim</button>
              <button className="text-xs" onClick={() => bulk('wont_fix')}>Won't fix</button>
            </div>
          )}
        </div>
        <ul className="mt-2 divide-y divide-admin-line">
          {open.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
              <input type="checkbox" checked={sel.has(i.id)} onChange={() => toggle(i.id)} />
              <span className="font-mono text-[11px]">{i.target_type === 'concept' ? i.concept_slug : i.paper_id}</span>
              <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] text-white">{i.part}</span>
              <span className="flex-1 truncate" title={i.detail}>{i.title}</span>
              {!i.ai_actionable && <span className="rounded-full bg-admin-sunk px-2 text-[10px] text-admin-muted">not AI</span>}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
```

- [ ] **Step 2: Add the route** in `src/App.tsx` — import `AdminWmiReviewQueue` and add an `AdminRoute` for `/admin/wmi/review` next to the other admin routes (follow the existing `AdminRoute` wrapper pattern used for `/admin/videos`).

- [ ] **Step 3: Typecheck + smoke + commit**

Run: `npm run check`; manual: visit `/admin/wmi/review`, select two open issues, Copy for Claude, paste check.
```bash
git add src/pages/admin/AdminWmiReviewQueue.tsx src/App.tsx
git commit -m "feat(wmi-review): cross-item Review Queue page + route"
```

## Task 13: Document the Claude loop

**Files:**
- Modify: `.claude/skills/qupu-math-problem-creation/SKILL.md` (add a short "Review issue loop" section) and `CLAUDE.md` (one line under the WMI authoring section).

- [ ] **Step 1:** Add a paragraph: how Claude consumes the queue — `GET /api/admin/wmi/issues?status=open&ai_actionable=true&concept_slug=…|paper_id=…`, resolve files (concept slug → registries; paper question_id → DB row), apply the fix, then `PATCH /api/admin/wmi/issues/:id` to `in_progress` then `fixed` with a `fix_note`. The human verifies. Also: the human can paste the "Copy issues for Claude" block directly.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/qupu-math-problem-creation/SKILL.md CLAUDE.md
git commit -m "docs(wmi-review): document the Claude issue fix-loop"
```

**Phase 2 done** — the fix-loop queue, copy-for-Claude handoff, paper quick-fix, and the hybrid paths are live.

---

# PHASE 3 — Triage + visibility

## Task 14: Sidebar badges + re-review dots

**Files:**
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`, `src/pages/admin/AdminWmiDrill.tsx`

- [ ] **Step 1:** On each page, fetch counts once on mount via `fetchIssueCounts()` (from `wmiReviewIssues`), store `counts`. In the sidebar item render, show an orange open-issue badge when `counts.byConcept[slug] > 0` (concepts) / `counts.byPaper[id] > 0` (papers), and a blue "awaiting re-review" dot when `counts.fixedByConcept[slug] > 0` / `counts.fixedByPaper[id] > 0`.

```tsx
// near other state
const [counts, setCounts] = useState<IssueCounts>({ byConcept: {}, byPaper: {}, fixedByConcept: {}, fixedByPaper: {} })
useEffect(() => { fetchIssueCounts().then(setCounts).catch(() => {}) }, [])
// in the concept sidebar button (after the strand/grade spans):
{counts.byConcept[c.slug] > 0 && <span className="rounded-full bg-qupu-brand-orange px-1.5 text-[9px] font-bold text-white">{counts.byConcept[c.slug]}⚑</span>}
{counts.fixedByConcept[c.slug] > 0 && <span className="h-2 w-2 rounded-full bg-blue-600" title="fix awaiting re-review" />}
```
(Mirror with `byPaper`/`fixedByPaper` + `p.id` in the paper list.)

- [ ] **Step 2: Typecheck + commit**

```bash
git add src/pages/admin/AdminWmiConcepts.tsx src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(wmi-review): sidebar open-issue badges + re-review dots"
```

## Task 15: Keyboard nav + next-with-open-issues jumps

**Files:**
- Create: `src/hooks/useReviewKeyboard.ts`
- Modify: both pages

- [ ] **Step 1: Implement a small keyboard hook** that binds keys to callbacks and ignores events while typing in inputs/textareas.

```tsx
// src/hooks/useReviewKeyboard.ts
import { useEffect } from 'react'
export function useReviewKeyboard(map: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const fn = map[e.key]
      if (fn) { e.preventDefault(); fn() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [map])
}
```

- [ ] **Step 2: Wire it** on each page: `useReviewKeyboard({ j: next, k: prev, ... })`. On the paper page add "next Q with open issues" (advance `idx` to the next question whose id appears in `issues` with non-closed status). On both pages add a "next unreviewed" jump (next sidebar item with `status === 'pending'` or `counts` open > 0). Add visible footer hints mirroring the wireframe.

```tsx
// paper page helper
const nextQuestionWithIssues = () => {
  const ids = new Set(issues.filter((i) => i.status === 'open' || i.status === 'in_progress' || i.status === 'fixed').map((i) => i.question_id))
  const start = idx + 1
  const found = questions.findIndex((q, n) => n >= start && ids.has(q.id))
  if (found >= 0) setIdx(found)
}
```

- [ ] **Step 3: Typecheck + smoke + commit**

Run: `npm run check`; manual: j/k move, the next-with-issues jump lands on a flagged question, keys are ignored while typing in the notes box.
```bash
git add src/hooks/useReviewKeyboard.ts src/pages/admin/AdminWmiConcepts.tsx src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(wmi-review): keyboard nav + next-with-open-issues triage"
```

**Phase 3 done** — faster triage + at-a-glance AI visibility.

---

## Final verification (run after each phase, and at the end)

- [ ] `npm run check` — zero type errors.
- [ ] `npm run test` — green (pure-logic suites always run; DB suites skip without `TEST_DATABASE_URL`).
- [ ] `npm run lint` — clean.
- [ ] Manual loop end-to-end on one concept and one paper question: flag → (Claude fix via copied block, or quick-fix) → status `fixed`/`verified` → sidebar badge/dot updates → Review Queue reflects it.

## Self-review notes (author)

- **Spec coverage:** per-part flag (T8/T9), lifecycle + suggested verdict (T2/T7/T8), 3 endpoints (T4), copy-for-Claude item+bulk (T7/T12), Review Queue (T12), paper quick-fix simple-text-only (T10/T11), ai_actionable (T4 schema default + T12 filter), sidebar badges + re-review dots (T14), keyboard + jumps (T15), Claude loop docs (T13). All spec sections map to a task.
- **Decision locked:** `'visual'`/`'hint'` — `hint` is a real enum value (migration includes it); `visual` maps to `illustration` to avoid an extra enum value (noted in T9).
- **Type consistency:** `ReviewIssue`, `IssueStatus`, `IssuePart`, `IssueSeverity` defined once server-side (`reviewIssues.ts`) and mirrored once client-side (`wmiReviewIssues.ts`); `suggestVerdict` (server) / `suggestVerdictClient` (client) kept as separate names to avoid import confusion. Endpoint paths used in `wmiReviewIssues.ts` match the routes in T4.
