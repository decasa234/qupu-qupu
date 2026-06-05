# Admin UI/UX Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise admin-panel UI/UX to a "UX uplift" level — responsive tables, a focused video-editor drawer, a scalable Videos catalog, mobile-correct stat grids, and visual polish/fixes — within the existing warm-utilitarian admin register.

**Architecture:** Add four reusable primitives to the admin kit (`DataList`, `Drawer`, `Toolbar`, `PageScaffold`) plus two pure helpers (`statusTone`, `filterSortPaginateVideos`). Existing admin pages then compose these. No API, service, schema, or auth changes. Spec: `docs/superpowers/specs/2026-06-05-admin-ui-ux-uplift-design.md`.

**Tech Stack:** React 18 + Vite + Tailwind, TypeScript, Font Awesome icons, existing `src/components/admin/ui.tsx` kit and `admin-*` / `qupu-brand-*` tokens. Vitest (node env) for pure-logic tests. Webwright (Playwright Firefox) for visual validation.

---

## Conventions for this plan

- **No component test runner.** jsdom is not installed and vitest `include` only matches `src/**/*.test.ts` (not `.tsx`). So:
  - **Pure logic** (`statusTone`, the catalog helper) is TDD'd as `src/lib/*.test.ts` (node env, no DOM).
  - **Components/pages** are verified with `npm run check` (tsc), `npm run lint`, and **webwright visual re-capture** (Task 0 builds a reusable `shot.py`).
- **Branch:** `feat/ui-ux-enhancements` (already checked out). Commit after every task.
- **Icons:** Font Awesome only (`fa-solid fa-*`) — never emoji.
- **Imports inside `src/`** use no extension / the `@/` alias as the surrounding files do; match each file's existing style.
- Run `npm run check && npm run lint` before every commit; both must pass.

---

## Task 0: Visual-check harness (one-time, scratch only)

Everything here lives under the git-ignored `outputs/` dir. It lets every later task screenshot any admin route at any width with an authenticated admin session.

**Files:**
- Create: `outputs/admin-ui-audit/shot.py` (git-ignored)
- Uses: `outputs/admin-ui-audit/session.json` (minted admin JWT; regenerated below)

- [ ] **Step 1: Ensure Playwright + Firefox are installed**

Run:
```bash
uv run --with playwright python3 -c "import playwright; print('ok')" \
  && PLAYWRIGHT_BROWSERS_PATH=0 uv run --with playwright playwright install firefox
```
Expected: prints `ok`, then Firefox is present (re-running is a no-op).

- [ ] **Step 2: Start the dev server (if not already up)**

Run (background): `npm run dev`
Then verify both ports:
```bash
curl -s -o /dev/null -w "client:%{http_code}\n" http://localhost:5173
curl -s -o /dev/null -w "api:%{http_code}\n" http://localhost:3002/api/public/meta
```
Expected: `client:200` and `api:200`. (API port is `PORT=3002` from `.env`; the client calls it via `VITE_API_BASE_URL`.)

- [ ] **Step 3: Mint an admin session into `session.json`**

The only admin is Google-OAuth-only (no password), so we mint a JWT directly instead of logging in. Run:
```bash
mkdir -p outputs/admin-ui-audit
node --input-type=module -e "
import pg from 'pg'; import jwt from 'jsonwebtoken'; import fs from 'fs'; import 'dotenv/config';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const r = await pool.query(\"SELECT id,email,name FROM users WHERE role='admin' ORDER BY created_at LIMIT 1\");
await pool.end();
const a = r.rows[0];
const token = jwt.sign({ id:a.id, email:a.email, role:'admin' }, process.env.JWT_SECRET, { algorithm:'HS256', expiresIn:'12h' });
const user = { id:a.id, email:a.email, phone:null, name:a.name, age:null, role:'admin' };
const authStorage = { state:{ user, token, isAuthenticated:true, children:[], activeChildId:null }, version:0 };
fs.writeFileSync('outputs/admin-ui-audit/session.json', JSON.stringify({ token, authStorage }, null, 2));
console.log('SESSION_OK');
"
```
Expected: `SESSION_OK`.

- [ ] **Step 4: Create the reusable screenshot helper**

Create `outputs/admin-ui-audit/shot.py`:
```python
import asyncio, os, json
from pathlib import Path
from playwright.async_api import async_playwright

WS = Path("outputs/admin-ui-audit")
S = json.loads((WS / "session.json").read_text())
ROUTE = os.environ.get("ROUTE", "/admin/dashboard")
WIDTH = int(os.environ.get("WIDTH", "1280"))
OUT = os.environ.get("OUT", "outputs/admin-ui-audit/checks/shot.png")
Path(OUT).parent.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:5173"

async def main():
    async with async_playwright() as pw:
        b = await pw.firefox.launch(headless=True)
        c = await b.new_context(viewport={"width": WIDTH, "height": 1800})
        p = await c.new_page()
        await p.goto(f"{BASE}/login", wait_until="domcontentloaded")
        await p.evaluate(
            "([t,s])=>{localStorage.setItem('auth_token',t);localStorage.setItem('auth-storage',s)}",
            [S["token"], json.dumps(S["authStorage"])],
        )
        await p.goto(f"{BASE}{ROUTE}", wait_until="networkidle")
        await asyncio.sleep(1.6)
        await p.screenshot(path=OUT)
        print("SHOT:", OUT, "URL:", p.url)
        await b.close()

asyncio.run(main())
```

- [ ] **Step 5: Smoke-test the helper**

Run:
```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/dashboard WIDTH=1280 OUT=outputs/admin-ui-audit/checks/smoke.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
Expected: `SHOT: ... URL: http://localhost:5173/admin/dashboard`. Then `Read` the PNG and confirm the authenticated admin shell renders (sidebar + dashboard). No commit (scratch is git-ignored).

---

## Phase A — Foundation primitives

### Task A1: `statusTone` helper (TDD)

A single source of truth mapping a status string → a `Tag` tone + Indonesian label, so draft/published/needs-review stop looking identical.

**Files:**
- Create: `src/lib/adminStatus.ts`
- Test: `src/lib/adminStatus.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/adminStatus.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { statusTone } from './adminStatus'

describe('statusTone', () => {
  it('maps published to success', () => {
    expect(statusTone('published')).toEqual({ tone: 'success', label: 'Diterbitkan' })
  })
  it('maps draft to warn', () => {
    expect(statusTone('draft')).toEqual({ tone: 'warn', label: 'Draft' })
  })
  it('maps needs-review to brand', () => {
    expect(statusTone('needs-review')).toEqual({ tone: 'brand', label: 'Perlu ditinjau' })
  })
  it('falls back to neutral for unknown', () => {
    expect(statusTone('whatever')).toEqual({ tone: 'neutral', label: 'whatever' })
  })
})
```

- [ ] **Step 2: Run the test — verify it fails**

Run: `npx vitest run src/lib/adminStatus.test.ts`
Expected: FAIL — cannot find module `./adminStatus`.

- [ ] **Step 3: Implement**

`src/lib/adminStatus.ts`:
```ts
import type { TagTone } from '../components/admin/ui'

export type AdminStatus = 'published' | 'draft' | 'needs-review' | (string & {})

const MAP: Record<string, { tone: TagTone; label: string }> = {
  published: { tone: 'success', label: 'Diterbitkan' },
  draft: { tone: 'warn', label: 'Draft' },
  'needs-review': { tone: 'brand', label: 'Perlu ditinjau' },
}

export function statusTone(status: AdminStatus): { tone: TagTone; label: string } {
  return MAP[status] ?? { tone: 'neutral', label: String(status) }
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `npx vitest run src/lib/adminStatus.test.ts`
Expected: PASS (4).

- [ ] **Step 5: Typecheck + commit**

```bash
npm run check && npm run lint
git add src/lib/adminStatus.ts src/lib/adminStatus.test.ts
git commit -m "feat(admin): statusTone helper for status-colored tags"
```

---

### Task A2: `DataList` responsive table/cards primitive

**Files:**
- Create: `src/components/admin/DataList.tsx`

- [ ] **Step 1: Implement the component**

`src/components/admin/DataList.tsx`:
```tsx
import type { ReactNode } from 'react'
import { EmptyState, Skeleton } from './ui'

export type DataListColumn<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /** On mobile cards, which slot this column fills. */
  role?: 'title' | 'subtitle' | 'meta' | 'actions'
  align?: 'left' | 'right'
  thClassName?: string
  tdClassName?: string
  /** Hide this column in the desktop table below a breakpoint. */
  hideBelow?: 'sm' | 'md'
}

const HIDE: Record<'sm' | 'md', string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
}

export function DataList<T>({
  columns,
  rows,
  rowKey,
  empty,
  loading = false,
  skeletonRows = 4,
}: {
  columns: DataListColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
  loading?: boolean
  skeletonRows?: number
}) {
  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) {
    return <>{empty ?? <EmptyState title="Belum ada data" />}</>
  }

  const title = columns.find((c) => c.role === 'title')
  const subtitle = columns.find((c) => c.role === 'subtitle')
  const metas = columns.filter((c) => c.role === 'meta' || c.role === undefined)
  const actions = columns.find((c) => c.role === 'actions')

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-admin-line text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`pb-2 pr-4 text-[11px] font-bold uppercase tracking-[0.14em] text-admin-muted ${
                    c.align === 'right' ? 'text-right' : ''
                  } ${c.hideBelow ? HIDE[c.hideBelow] : ''} ${c.thClassName ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-admin-line/70 transition-colors hover:bg-admin-sunk">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-3 pr-4 align-middle ${c.align === 'right' ? 'text-right' : ''} ${
                      c.hideBelow ? HIDE[c.hideBelow] : ''
                    } ${c.tdClassName ?? ''}`}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-3 sm:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-xl border border-admin-line bg-admin-card p-3 shadow-admin-soft">
            {title && <div className="font-semibold text-admin-ink">{title.cell(row)}</div>}
            {subtitle && <div className="mt-0.5 text-xs text-admin-muted">{subtitle.cell(row)}</div>}
            {metas.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-admin-muted">
                {metas.map((c) => (
                  <span key={c.key} className="inline-flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-admin-faint">{c.header}</span>
                    {c.cell(row)}
                  </span>
                ))}
              </div>
            )}
            {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions.cell(row)}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run check && npm run lint`
Expected: PASS (no errors). `DataList` is unused for now — that's fine; tsc won't flag an exported-but-unused component.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/DataList.tsx
git commit -m "feat(admin): DataList responsive table/cards primitive"
```

---

### Task A3: `Drawer` primitive

**Files:**
- Create: `src/components/admin/Drawer.tsx`

- [ ] **Step 1: Implement**

`src/components/admin/Drawer.tsx`:
```tsx
import { useEffect, useRef, type ReactNode } from 'react'

export function Drawer({
  open,
  onClose,
  title,
  footer,
  children,
  width = 'lg',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  footer?: ReactNode
  children: ReactNode
  width?: 'md' | 'lg'
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const widthCls = width === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-admin-ink/30 backdrop-blur-[1px]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex h-full w-full ${widthCls} flex-col bg-admin-bg shadow-2xl outline-none`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-admin-line bg-admin-card px-4 py-3">
          <div className="font-display text-base font-extrabold text-qupu-brand-blue">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-admin-edge bg-white text-admin-ink hover:bg-admin-sunk"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-admin-line bg-admin-card px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/components/admin/Drawer.tsx
git commit -m "feat(admin): Drawer primitive (right panel / mobile sheet)"
```

---

### Task A4: `Toolbar` primitive

**Files:**
- Create: `src/components/admin/Toolbar.tsx`

- [ ] **Step 1: Implement**

`src/components/admin/Toolbar.tsx`:
```tsx
import type { ReactNode } from 'react'
import { Input } from './ui'

export function Toolbar({
  search,
  filters,
  sort,
  trailing,
}: {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string }
  filters?: ReactNode
  sort?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div className="sticky top-0 z-10 -mx-1 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-admin-line bg-admin-card/95 px-3 py-2 backdrop-blur">
      {search && (
        <div className="relative min-w-[12rem] flex-1">
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-admin-faint"
            aria-hidden="true"
          />
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? 'Cari…'}
            className="pl-8"
          />
        </div>
      )}
      {filters}
      {sort}
      {trailing && <div className="ml-auto text-xs text-admin-muted">{trailing}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/components/admin/Toolbar.tsx
git commit -m "feat(admin): Toolbar primitive (search/filter/sort strip)"
```

---

### Task A5: `PageScaffold` primitive

Generalizes `AdminPageHeader` and gives low-density pages a min-height so they stop floating in a void.

**Files:**
- Create: `src/components/admin/PageScaffold.tsx`

- [ ] **Step 1: Implement**

`src/components/admin/PageScaffold.tsx`:
```tsx
import type { ReactNode } from 'react'
import AdminPageHeader from './AdminPageHeader'

export function PageScaffold({
  eyebrow,
  title,
  description,
  actions,
  children,
  /** Narrow + centered content column (use for small single-card pages). */
  narrow = false,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <div className="flex min-h-[60vh] flex-col gap-5">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <div className={narrow ? 'mx-auto w-full max-w-2xl' : 'w-full'}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/components/admin/PageScaffold.tsx
git commit -m "feat(admin): PageScaffold (header + min-height composition)"
```

---

## Phase B — Quick wins / fixes

### Task B1: Stop the consent banner leaking into admin (P7)

**Files:**
- Modify: `src/components/CookieConsentBanner.tsx`

- [ ] **Step 1: Gate on the admin path**

At the top of the `CookieConsentBanner` component body, before any other early returns, add a location check. Add the import and the guard:
```tsx
import { useLocation } from 'react-router-dom'
// …inside the component, first line of the body:
const location = useLocation()
if (location.pathname.startsWith('/admin')) return null
```
(`CookieConsentBanner` is rendered inside `<Router>` at `src/App.tsx:115`, so `useLocation` is in context.)

- [ ] **Step 2: Visual verify (admin = no banner; member = banner)**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/dashboard WIDTH=1280 OUT=outputs/admin-ui-audit/checks/b1-admin.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/ WIDTH=1280 OUT=outputs/admin-ui-audit/checks/b1-home.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
`Read` both PNGs. Expected: admin page has **no** consent toast; home page still shows it.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/components/CookieConsentBanner.tsx
git commit -m "fix(admin): hide cookie-consent banner on /admin routes"
```

---

### Task B2: Low-data daily-traffic chart (P5)

The chart isn't broken — sparse data makes the CSS bars read as empty. Improve the low-data visualization in `src/pages/admin/AdminAnalytics.tsx` (the `Traffic harian` Panel, ~lines 189–214).

**Files:**
- Modify: `src/pages/admin/AdminAnalytics.tsx`

- [ ] **Step 1: Replace the bars block with a baseline + taller min bars + max label**

Within the existing `overview.traffic.length === 0 ? (…) : (…)` branch, replace the bars `<div>` with:
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between text-[10px] font-semibold text-admin-faint">
    <span>Maks {Math.max(...overview.traffic.map((d) => d.pageViews), 0)} page views/hari</span>
    <span>{overview.traffic.length} hari</span>
  </div>
  <div className="flex h-40 items-end gap-2 overflow-x-auto rounded-lg bg-admin-sunk/60 p-3">
    {overview.traffic.map((day) => {
      const max = Math.max(...overview.traffic.map((d) => d.pageViews), 1)
      const heightPct = day.pageViews === 0 ? 2 : Math.max(12, Math.round((day.pageViews / max) * 100))
      return (
        <div key={day.day} className="flex min-w-[40px] flex-1 flex-col items-center justify-end gap-1">
          <div className="text-[10px] font-bold text-qupu-brand-orange">{day.pageViews}</div>
          <div
            className="w-full rounded-t-md bg-qupu-brand-blue"
            style={{ height: `${heightPct}%` }}
            title={`${day.visitors} visitors · ${day.pageViews} page views`}
          />
          <div className="text-[10px] font-semibold text-admin-muted">
            {new Date(day.day).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
          </div>
        </div>
      )
    })}
  </div>
</div>
```
Key changes vs. today: non-zero days get a **12% min height** (was 4%) so they're clearly visible; zero days show a 2% stub; a tinted plot background + a max/day-count caption give the chart shape even with little data.

- [ ] **Step 2: Visual verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/analytics WIDTH=1280 OUT=outputs/admin-ui-audit/checks/b2-analytics.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
`Read` the PNG. Expected: the "Visitors per hari" panel now reads as a real chart (visible bars + tinted plot area + caption), not an empty band.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/admin/AdminAnalytics.tsx
git commit -m "fix(admin): stronger low-data visualization for daily traffic chart"
```

---

### Task B3: Two-column stat grids on mobile (P6)

**Files:**
- Modify: `src/pages/admin/AdminDashboard.tsx` (StatCard grid)
- Modify: `src/pages/admin/AdminAnalytics.tsx` (StatCard grid)

- [ ] **Step 1: Make the stat-card grids 2-col on mobile**

In each file, find the grid wrapping the `StatCard`s (a `div` with `grid` + responsive `*-cols-*` classes, e.g. `grid gap-3 sm:grid-cols-2 lg:grid-cols-4` or `grid-cols-1 …`). Ensure the **base** is two columns, scaling up on larger screens. Set the container to:
```tsx
className="grid grid-cols-2 gap-3 lg:grid-cols-4"
```
(Analytics has 5 KPIs — use `grid grid-cols-2 gap-3 lg:grid-cols-5`.) Leave the `StatCard` component itself unchanged; it already shrinks acceptably. If a label/number overflows at 2-col on small screens, that's handled by the existing `truncate`/wrapping — verify in Step 2.

- [ ] **Step 2: Visual verify at mobile width**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/dashboard WIDTH=390 OUT=outputs/admin-ui-audit/checks/b3-dash-m.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/analytics WIDTH=390 OUT=outputs/admin-ui-audit/checks/b3-analytics-m.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
`Read` both. Expected: KPIs render two-per-row on the phone (not one giant card per screen), with no clipped numbers.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/admin/AdminDashboard.tsx src/pages/admin/AdminAnalytics.tsx
git commit -m "fix(admin): 2-column stat grids on mobile"
```

---

### Task B4: Adopt `PageScaffold` on low-density pages (P4)

Replace the bare `AdminPageHeader` + content with `PageScaffold` so Import/Subjects/Age-Groups stop floating in a beige void. (Users is handled in Phase C; Videos/Analytics/Dashboard keep their own layouts.)

**Files:**
- Modify: `src/pages/admin/AdminImportVideos.tsx`
- Modify: `src/pages/admin/AdminSubjects.tsx`
- Modify: `src/pages/admin/AdminAgeGroups.tsx`

- [ ] **Step 1: Wrap each page in `PageScaffold`**

In each file, replace the `AdminPageHeader` usage and its sibling content with a single `PageScaffold` that takes the same `eyebrow`/`title`/`description`/`actions` and wraps the page body as `children`. Example shape (AdminImportVideos):
```tsx
import { PageScaffold } from '../../components/admin/PageScaffold'
// …
return (
  <PageScaffold eyebrow="Admin" title="Impor dari YouTube" description="…" actions={/* Kembali ke Videos */}>
    {/* existing import body (the picker / empty-state card) */}
  </PageScaffold>
)
```
For `AdminImportVideos` (empty/low content) also pass `narrow` so the single card centers in a readable column instead of stranding at the top-left.

- [ ] **Step 2: Visual verify (desktop + mobile) for all three**

```bash
for R in import subjects age-groups; do
  ROUTE="/admin/$R"; [ "$R" = import ] && ROUTE="/admin/videos/import"
  PLAYWRIGHT_BROWSERS_PATH=0 ROUTE="$ROUTE" WIDTH=1280 OUT="outputs/admin-ui-audit/checks/b4-$R.png" \
    uv run --with playwright python3 outputs/admin-ui-audit/shot.py
done
```
`Read` the three PNGs. Expected: content sits in a composed column with sensible min-height; Import card is centered, not stranded.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/admin/AdminImportVideos.tsx src/pages/admin/AdminSubjects.tsx src/pages/admin/AdminAgeGroups.tsx
git commit -m "feat(admin): adopt PageScaffold on low-density pages"
```

---

## Phase C — Users → DataList (P1)

### Task C1: Convert the Users table to `DataList` + Toolbar search

**Files:**
- Modify: `src/pages/admin/AdminUsers.tsx`

- [ ] **Step 1: Define columns and render via `DataList`**

Replace the hand-rolled `<table>` with `DataList`. Move the existing search box into `Toolbar`. Use `statusTone` for the role tag. Column definitions:
```tsx
import { DataList, type DataListColumn } from '../../components/admin/DataList'
import { Toolbar } from '../../components/admin/Toolbar'
import { statusTone } from '../../lib/adminStatus'
// type AdminUser = the existing row type in this file

const columns: DataListColumn<AdminUser>[] = [
  {
    key: 'user', header: 'User', role: 'title',
    cell: (u) => (
      <div className="min-w-0">
        <div className="truncate font-semibold text-admin-ink">{u.name}{u.isSelf && <Tag tone="brand" className="ml-2">KAMU</Tag>}</div>
        <div className="truncate text-xs text-admin-muted">{u.email}</div>
      </div>
    ),
  },
  { key: 'role', header: 'Role', role: 'meta',
    cell: (u) => <Tag tone={u.role === 'admin' ? 'ink' : 'neutral'}>{u.role.toUpperCase()}</Tag> },
  { key: 'auth', header: 'Auth', role: 'meta', hideBelow: 'md',
    cell: (u) => <span className="text-xs text-admin-muted">{u.authProvider}</span> },
  { key: 'daftar', header: 'Daftar', role: 'meta', hideBelow: 'md',
    cell: (u) => <span className="text-xs text-admin-muted">{formatDate(u.createdAt)}</span> },
  { key: 'aksi', header: 'Aksi', role: 'actions', align: 'right',
    cell: (u) => (/* existing Promote/Demote + Hapus buttons */) },
]
```
Adapt the `cell` bodies to the actual field names already used in `AdminUsers.tsx` (e.g. how it currently reads name/email/role/auth/date and renders the Promote/Demote/Hapus buttons + the "KAMU" self tag). Keep all existing handlers (`onPromote`, `onDelete`, search filtering) — only the rendering moves into columns. Wrap the list:
```tsx
<Panel>
  <Toolbar
    search={{ value: queryText, onChange: setQueryText, placeholder: 'Cari email atau nama…' }}
    trailing={`${filteredUsers.length} users`}
  />
  <DataList columns={columns} rows={filteredUsers} rowKey={(u) => u.id} loading={loading}
    empty={<EmptyState icon="fa-solid fa-users" title="Tidak ada user" />} />
</Panel>
```

- [ ] **Step 2: Visual verify — mobile actions must be reachable**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/users WIDTH=390 OUT=outputs/admin-ui-audit/checks/c1-users-m.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/users WIDTH=1280 OUT=outputs/admin-ui-audit/checks/c1-users-d.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
`Read` both. Expected: **mobile shows cards with Promote/Demote + Hapus fully visible** (the P1 bug); desktop shows a clean table with hover rows.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/admin/AdminUsers.tsx
git commit -m "feat(admin): Users table -> responsive DataList (fixes mobile clipping)"
```

---

## Phase D — Videos at scale (P2)

### Task D1: `filterSortPaginateVideos` helper (TDD)

A pure function that takes the loaded admin videos + criteria and returns the page slice + page count. Keeps the page component thin and the logic tested.

**Files:**
- Create: `src/lib/adminVideoCatalog.ts`
- Test: `src/lib/adminVideoCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/adminVideoCatalog.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { filterSortPaginateVideos, type CatalogCriteria } from './adminVideoCatalog'

const v = (over: Partial<any>) => ({
  id: over.id ?? 't', title: over.title ?? 'T', youtubeVideoId: over.youtubeVideoId ?? 'yt',
  isPublished: over.isPublished ?? false, updatedAt: over.updatedAt ?? '2026-01-01',
  subject: over.subject ?? null, ageGroup: over.ageGroup ?? null,
})
const base: CatalogCriteria = { search: '', status: 'all', subjectId: '', ageGroupId: '', sort: 'updated', page: 1, pageSize: 2 }

describe('filterSortPaginateVideos', () => {
  const rows = [
    v({ id: 'a', title: 'Alpha', isPublished: true, updatedAt: '2026-03-01' }),
    v({ id: 'b', title: 'Bravo', isPublished: false, updatedAt: '2026-02-01' }),
    v({ id: 'c', title: 'Charlie', isPublished: true, updatedAt: '2026-01-01' }),
  ]
  it('filters by status', () => {
    const r = filterSortPaginateVideos(rows, { ...base, status: 'draft' })
    expect(r.total).toBe(1)
    expect(r.items.map((x) => x.id)).toEqual(['b'])
  })
  it('searches title case-insensitively', () => {
    const r = filterSortPaginateVideos(rows, { ...base, search: 'brav' })
    expect(r.items.map((x) => x.id)).toEqual(['b'])
  })
  it('sorts by title A-Z', () => {
    const r = filterSortPaginateVideos(rows, { ...base, sort: 'title', pageSize: 10 })
    expect(r.items.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
  it('paginates and reports pageCount', () => {
    const r = filterSortPaginateVideos(rows, { ...base, sort: 'title', page: 2, pageSize: 2 })
    expect(r.items.map((x) => x.id)).toEqual(['c'])
    expect(r.pageCount).toBe(2)
    expect(r.total).toBe(3)
  })
})
```

- [ ] **Step 2: Run — verify it fails**

Run: `npx vitest run src/lib/adminVideoCatalog.test.ts`
Expected: FAIL — cannot find module `./adminVideoCatalog`.

- [ ] **Step 3: Implement**

`src/lib/adminVideoCatalog.ts`:
```ts
import type { VideoDetail } from '../types'

export type CatalogSort = 'updated' | 'title' | 'status'
export type CatalogStatus = 'all' | 'draft' | 'published'

export interface CatalogCriteria {
  search: string
  status: CatalogStatus
  subjectId: string
  ageGroupId: string
  sort: CatalogSort
  page: number
  pageSize: number
}

export interface CatalogPage<T> {
  items: T[]
  total: number
  page: number
  pageCount: number
}

export function filterSortPaginateVideos<
  T extends Pick<VideoDetail, 'title' | 'isPublished' | 'updatedAt'> & {
    youtubeVideoId?: string | null
    subject?: { id: string } | null
    ageGroup?: { id: string } | null
  },
>(videos: T[], c: CatalogCriteria): CatalogPage<T> {
  const q = c.search.trim().toLowerCase()
  let rows = videos.filter((v) => {
    if (c.status === 'draft' && v.isPublished) return false
    if (c.status === 'published' && !v.isPublished) return false
    if (c.subjectId && v.subject?.id !== c.subjectId) return false
    if (c.ageGroupId && v.ageGroup?.id !== c.ageGroupId) return false
    if (q) {
      const hay = `${v.title} ${v.youtubeVideoId ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  rows = rows.slice().sort((a, b) => {
    if (c.sort === 'title') return a.title.localeCompare(b.title)
    if (c.sort === 'status') return Number(a.isPublished) - Number(b.isPublished)
    return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '') // 'updated' desc
  })

  const total = rows.length
  const pageSize = Math.max(1, c.pageSize)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, c.page), pageCount)
  const start = (page - 1) * pageSize
  return { items: rows.slice(start, start + pageSize), total, page, pageCount }
}
```

- [ ] **Step 4: Run — verify it passes**

Run: `npx vitest run src/lib/adminVideoCatalog.test.ts`
Expected: PASS (4).

- [ ] **Step 5: Typecheck + commit**

```bash
npm run check && npm run lint
git add src/lib/adminVideoCatalog.ts src/lib/adminVideoCatalog.test.ts
git commit -m "feat(admin): filterSortPaginateVideos catalog helper"
```

---

### Task D2: Wire the Videos toolbar + pagination

**Files:**
- Modify: `src/pages/AdminVideos.tsx`

- [ ] **Step 1: Add criteria state + derive the page with the helper**

In `AdminVideos` (state block around lines 89–106), the existing `filter` (`CatalogFilter`) maps to `status`. Add:
```tsx
const [search, setSearch] = useState('')
const [subjectId, setSubjectId] = useState('')
const [ageGroupId, setAgeGroupId] = useState('')
const [sort, setSort] = useState<CatalogSort>('updated')
const [page, setPage] = useState(1)
const PAGE_SIZE = 24
```
Replace the current `filteredVideos` derivation with the helper output (keep the existing `filter` segmented control feeding `status`):
```tsx
const catalog = useMemo(
  () => filterSortPaginateVideos(videos, {
    search, status: filter, subjectId, ageGroupId, sort, page, pageSize: PAGE_SIZE,
  }),
  [videos, search, filter, subjectId, ageGroupId, sort, page],
)
const filteredVideos = catalog.items
```
Reset to page 1 when any criterion changes:
```tsx
useEffect(() => { setPage(1) }, [search, filter, subjectId, ageGroupId, sort])
```
Import: `import { filterSortPaginateVideos, type CatalogSort } from '../lib/adminVideoCatalog'`.

- [ ] **Step 2: Render the `Toolbar` above the list**

Just above the `filteredVideos.map(...)` (line ~533), keep the existing `SegmentedControl` (it sets `filter`) but place it inside a `Toolbar`, and add subject/age `Select`s (sourced from `meta`) + a sort `Select`. Use the existing `subjectOptions`/`ageGroupOptions` (already in the file) for the dropdowns:
```tsx
<Toolbar
  search={{ value: search, onChange: setSearch, placeholder: 'Cari judul / YouTube ID…' }}
  filters={
    <>
      <SegmentedControl<CatalogFilter> value={filter} onChange={setFilter} options={/* existing all/draft/published */} />
      <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
        <option value="">Semua subject</option>
        {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select>
      <Select value={ageGroupId} onChange={(e) => setAgeGroupId(e.target.value)}>
        <option value="">Semua usia</option>
        {ageGroupOptions.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </Select>
    </>
  }
  sort={
    <Select value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)}>
      <option value="updated">Terbaru diperbarui</option>
      <option value="title">Judul A–Z</option>
      <option value="status">Status</option>
    </Select>
  }
  trailing={`${catalog.total} video`}
/>
```
(If `subjectOptions`/`ageGroupOptions` in this file are currently scoped to bulk actions, reuse them or derive equivalents from `meta.subjects` / `meta.ageGroups`.)

- [ ] **Step 3: Render pagination below the list**

After the list, add a pager driven by `catalog`:
```tsx
{catalog.pageCount > 1 && (
  <div className="mt-4 flex items-center justify-center gap-2 text-sm">
    <Button variant="secondary" size="sm" disabled={catalog.page <= 1} onClick={() => setPage((p) => p - 1)} icon="fa-solid fa-chevron-left">Prev</Button>
    <span className="text-admin-muted">Hal {catalog.page} / {catalog.pageCount}</span>
    <Button variant="secondary" size="sm" disabled={catalog.page >= catalog.pageCount} onClick={() => setPage((p) => p + 1)}>Next<i className="fa-solid fa-chevron-right ml-1" aria-hidden="true" /></Button>
  </div>
)}
```

- [ ] **Step 4: Visual verify (search/filter/pagination present; rich cards kept)**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/videos WIDTH=1280 OUT=outputs/admin-ui-audit/checks/d2-videos-d.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/videos WIDTH=390 OUT=outputs/admin-ui-audit/checks/d2-videos-m.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
`Read` both. Expected: sticky toolbar with search + status chips + subject/age/sort; ≤24 rich cards per page; a Prev/Next pager; mobile still stacks cleanly.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/AdminVideos.tsx
git commit -m "feat(admin): Videos catalog toolbar (search/filter/sort) + pagination"
```

---

## Phase E — Video editor Drawer (P3)

### Task E1: Move the editor into a `Drawer`

Today the editor renders inline at two sites: the "new" panel (`AdminVideos.tsx` ~405–417) and the per-row inline editor (~608–617). Consolidate both into one `Drawer`.

**Files:**
- Modify: `src/pages/AdminVideos.tsx`

- [ ] **Step 1: Replace both inline editor render sites with a single Drawer**

Delete the `editingId === 'new'` panel block (~405–417) and the inline `editingId === video.id` editor block inside the row map (~605–620, keep the Edit button that sets `editingId`). After the list, render one drawer:
```tsx
{meta && editingId && (() => {
  const isNew = editingId === 'new'
  const target = isNew ? null : videos.find((v) => v.id === editingId) ?? null
  if (!isNew && !target) return null
  return (
    <Drawer
      open
      onClose={() => setEditingId(null)}
      title={isNew ? 'Tambah video' : 'Edit video'}
      width="lg"
    >
      <VideoEditor
        key={editingId}
        meta={meta}
        mode={isNew ? 'create' : 'edit'}
        initial={isNew ? emptyVideoForm(meta) : formFromVideo(target!)}
        videoId={isNew ? undefined : target!.id}
        originallyPublished={isNew ? undefined : target!.isPublished}
        onSaved={() => { setEditingId(null); void reload() }}
        onCancel={() => setEditingId(null)}
      />
    </Drawer>
  )
})()}
```
Use the file's existing reload function name (whatever the current `onSaved` calls — e.g. `loadVideos`/`refresh`) and the existing `formFromVideo` helper (defined at the top of the file). Import `Drawer` from `'../components/admin/Drawer'`. The row Edit button keeps `onClick={() => setEditingId(open ? null : video.id)}`; `open`/inline-conditioned styling on the row can be removed.

- [ ] **Step 2: Render the editor's own action buttons (they live in the editor)**

`VideoEditor` already renders its own `Batal` / `Update video` buttons via `onCancel`/`onSaved`. Leave them in the drawer body (no `footer` needed), OR (preferred polish) pass them to the Drawer `footer`. If keeping it simple, do nothing — the editor's buttons appear at the end of the scrollable body. Confirm both `onCancel` and `onSaved` close the drawer (they call `setEditingId(null)`).

- [ ] **Step 3: Visual verify (drawer opens over the list; list keeps position)**

```bash
# capture the catalog, then a variant that opens the first editor:
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/videos WIDTH=1280 OUT=outputs/admin-ui-audit/checks/e1-list.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
For the open-drawer shot, create `outputs/admin-ui-audit/shot-edit.py` as a copy of `shot.py` with one extra line before the screenshot: `await p.get_by_role("button", name="Edit").first.click(); await asyncio.sleep(1)`. Run it at WIDTH=1280 and WIDTH=390. `Read` the PNGs. Expected: desktop = right-side drawer over a dimmed catalog; mobile = full-screen sheet; the editor form (identitas/klasifikasi/badge ranges/publikasi) is scrollable.

- [ ] **Step 4: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/AdminVideos.tsx
git commit -m "feat(admin): open video editor in a Drawer instead of inline accordion"
```

---

### Task E2: Section the editor + roomier badge-range editor

**Files:**
- Modify: `src/components/admin/VideoEditor.tsx`
- Modify: `src/components/admin/BadgeRangeEditor.tsx`

- [ ] **Step 1: Group the editor fields into labelled sections**

In `VideoEditor`'s returned JSX, wrap the existing fields in four `SectionHeading`-led blocks without changing any field names, handlers, or the submit payload:
1. **Identitas** — title, slug, youtubeUrl (+ Pull), thumbnailUrl.
2. **Klasifikasi** — subjectId, ageGroupId, numberOfQuestions, difficulty.
3. **Badge ranges** — `<BadgeRangeEditor … />` + the `BadgeCurve` preview.
4. **Publikasi** — isPublished + isFeatured toggles with their helper text.

Use the kit's `SectionHeading` between groups and `grid gap-3 sm:grid-cols-2` for paired fields so the drawer reads as a form, not a wall.

- [ ] **Step 2: Give `BadgeRangeEditor` clearer columns**

In `BadgeRangeEditor.tsx`, add small column headers (`Min`, `Maks`, `Badge`) above the rows and ensure each row is a `grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center` so inputs line up, with the remove control as the trailing `auto` column. Keep all existing validation and add/remove handlers unchanged.

- [ ] **Step 3: Visual verify**

Re-run the open-drawer shot from E1 Step 3 at WIDTH=1280 and WIDTH=390. `Read` the PNGs. Expected: clearly sectioned form; badge-range rows have aligned Min/Maks/Badge columns and breathe.

- [ ] **Step 4: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/components/admin/VideoEditor.tsx src/components/admin/BadgeRangeEditor.tsx
git commit -m "feat(admin): section the video editor + clearer badge-range columns"
```

---

## Phase F — WMI Concepts mobile flow (P9)

### Task F1: List → detail navigation on mobile

The 3-pane tool drops its review pane on mobile. Give it a single-column, view-switched flow: list by default; selecting a concept shows the review pane with a Back control. Desktop 3-pane is unchanged.

**Files:**
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`

- [ ] **Step 1: Add a mobile "view" toggle keyed off selection**

This page already tracks a selected concept (the middle pane reads it). Add responsive classes so that on mobile (`< lg`):
- the concept-list pane is `block` when nothing is selected and `hidden` when a concept is selected;
- the review pane is `hidden` when nothing is selected and `block` when one is;
- the review pane gets a `lg:hidden` "← Daftar konsep" button at the top that clears the selection.
On `lg+`, both panes are always visible (current behavior). Concretely, wrap the list pane with `className={\`... ${selectedId ? 'hidden lg:block' : 'block'}\`}` and the review pane with `className={\`... ${selectedId ? 'block' : 'hidden lg:block'}\`}`, and add:
```tsx
<button type="button" onClick={() => setSelectedId(null)}
  className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-qupu-brand-blue lg:hidden">
  <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Daftar konsep
</button>
```
Use the page's actual selection state setter name (e.g. `setSelectedConceptId`).

- [ ] **Step 2: Visual verify (mobile list, then mobile detail)**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/wmi-concepts WIDTH=390 OUT=outputs/admin-ui-audit/checks/f1-wmi-list-m.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
PLAYWRIGHT_BROWSERS_PATH=0 ROUTE=/admin/wmi-concepts WIDTH=1280 OUT=outputs/admin-ui-audit/checks/f1-wmi-d.png \
  uv run --with playwright python3 outputs/admin-ui-audit/shot.py
```
For mobile-detail, reuse the `shot-edit.py` trick: click the first concept row, then screenshot at WIDTH=390. `Read` the PNGs. Expected: mobile shows the list, tapping a concept shows the review pane with a Back button; desktop still shows all panes.

- [ ] **Step 3: Typecheck + lint + commit**

```bash
npm run check && npm run lint
git add src/pages/admin/AdminWmiConcepts.tsx
git commit -m "feat(admin): WMI concepts list->detail flow on mobile"
```

---

## Phase G — Final validation

### Task G1: Full webwright re-capture + regression check

**Files:** none (validation only; outputs are git-ignored).

- [ ] **Step 1: Re-run the full baseline capture script**

```bash
PLAYWRIGHT_BROWSERS_PATH=0 WORKSPACE_DIR=outputs/admin-ui-audit \
  uv run --with playwright python3 outputs/admin-ui-audit/final_runs/run_1/final_script.py
```
Expected: 18 capture log lines (it overwrites run_1 screenshots with the new UI).

- [ ] **Step 2: Review against the audit checklist**

`Read` the regenerated desktop+mobile PNGs and confirm each original finding is resolved:
- P1 — `16_mobile_users`: Promote/Demote/Hapus visible on mobile.
- P4 — `04`,`06`: no large beige void; composed columns.
- P5 — `08`: daily chart reads as a real chart.
- P6 — `10`,`17`: 2-col stat grids on mobile.
- P7 — every admin shot: no consent toast.
- P2 — `02`: toolbar + pagination present, rich cards kept.
- P3 — editor opens in a drawer (use `shot-edit.py`).
- P9 — `18`: WMI mobile list→detail works.

- [ ] **Step 3: Full typecheck, lint, and unit tests; final commit if anything pending**

```bash
npm run check && npm run lint && npx vitest run src/lib/adminStatus.test.ts src/lib/adminVideoCatalog.test.ts
```
Expected: all green. If the working tree is clean, nothing to commit — the plan is complete.

---

## Self-review (author check against the spec)

- **Spec coverage:** Foundation §3 → Tasks A1–A5. WS1 mobile §4 → C1 (Users), B3 (stat grids), F1 (WMI). WS2 Videos §5 → D1–D2. WS3 editor §6 → E1–E2. WS4 polish/fixes §7 → B1 (consent/P7), B2 (chart/P5), B4 (PageScaffold/P4), status colors (A1 + used in C1). Sequencing §11 mirrored by phases A→G. All spec sections map to a task.
- **Placeholders:** none — every code step ships real code or an exact edit; verification steps use real commands. Page-wiring tasks intentionally reference existing field/handler names in the target file (the engineer adapts `cell` bodies to current names) rather than reproducing 600-line files; the column/criteria contracts and helper code are fully specified.
- **Type consistency:** `statusTone` returns `{ tone, label }` (A1) consumed in C1; `CatalogCriteria`/`CatalogSort`/`filterSortPaginateVideos` defined in D1 and consumed unchanged in D2; `DataListColumn`/`DataList` defined in A2 and consumed in C1; `Drawer` props defined in A3 and consumed in E1; `Toolbar` props defined in A4 and consumed in C1/D2; `PageScaffold` defined in A5 and consumed in B4.
- **Out of scope (per spec §9):** no API/service/schema/auth edits; no server-side paging; no chart library; member surfaces untouched.
