# Dashboard Refresh + Rapor + Trophy Wall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slim the member dashboard around a per-subject mastery hero, add a printable all-time rapor at `/report`, and rewrite the `/badges` page as a kid-facing trophy wall — all in one PR off the spec at `docs/superpowers/specs/2026-04-28-dashboard-report-and-trophy-wall-design.md`.

**Architecture:** Single round-trip extension to `GET /api/me/progress` adds `subjectStats`, `periodStart`, `periodEnd` and drops the now-unused `subjectTotals`. Frontend ships three coordinated changes: thin `Dashboard.tsx` composed from new components, new `Report.tsx` route at `/report` with print-CSS A4 layout, and a full rewrite of `Badges.tsx` to a trophy-wall layout. No DB migrations.

**Tech Stack:** Express + pg (CommonJS-style ESM with `.js` import suffixes), React 18 + Vite + Tailwind + React Router 7, Joi for input validation, zustand for client auth state. `npm run check` is the typecheck gate. No test runner — verification is typecheck + manual smoke per task.

**Test note:** This repo has no test runner. The TDD pattern adapts to: write the change, run `npm run check` and confirm it passes, hit the affected route manually (curl for API, browser for UI), then commit. Each task ends with these verification steps.

---

## File Map

**New files:**
- `src/lib/predikat.ts` — pure helpers `predikatLabel(p)`, `subjectAutoNote(stats, summary)`.
- `src/styles/print.css` — `@media print` rules + `@page` size.
- `src/components/dashboard/SubjectMasteryCard.tsx`
- `src/components/dashboard/RecentAttemptsCompact.tsx`
- `src/components/badges/BadgeMedallion.tsx`
- `src/components/badges/TrophyShelf.tsx`
- `src/components/report/RaporHeader.tsx`
- `src/components/report/RaporSummary.tsx`
- `src/components/report/RaporSubjectTable.tsx`
- `src/components/report/RaporVideoBreakdown.tsx`
- `src/components/report/RaporNote.tsx`
- `src/components/report/RaporFooter.tsx`
- `src/components/report/PrintButton.tsx`
- `src/pages/Report.tsx`

**Modified:**
- `api/services/member.ts` — extend `getMemberProgress` with `subjectStats`, `periodStart`, `periodEnd`; remove `subjectTotals` mapping in the final task.
- `src/types/index.ts` — add `Predikat`, `SubjectStat`; extend `MemberProgress`; remove `SubjectBadgeTotal` reference in the final task.
- `src/pages/Dashboard.tsx` — slim to `KPI strip + SubjectMasteryCard + RecentAttemptsCompact + Profile`.
- `src/pages/Badges.tsx` — rewrite around `TrophyShelf`.
- `src/App.tsx` — register `/report` ProtectedRoute.
- `src/main.tsx` — `import './styles/print.css'`.

---

## Task 1: Extend `getMemberProgress` with `subjectStats` + period

**Files:**
- Modify: `api/services/member.ts:164-343` (add new aggregations + period to the return)
- Inspect: `db/schema.sql` (read-only; confirms columns referenced)

- [ ] **Step 1: Add the period query inside `withTransaction`**

In `api/services/member.ts`, inside `getMemberProgress`'s `withTransaction` block, add this query alongside the existing `Promise.all`:

```ts
const periodRow = await queryOne<{ period_start: string }>(
  `
    SELECT COALESCE(MIN(sa.created_at), c.created_at) AS period_start
    FROM children c
    LEFT JOIN score_attempts sa ON sa.child_id = c.id
    WHERE c.id = $1
    GROUP BY c.created_at
  `,
  [childId],
  client,
)
```

- [ ] **Step 2: Add the `subjectStats` aggregation query**

Right after `subjectTotals` is fetched, add:

```ts
const subjectStatRows = await query<{
  subject_id: string
  subject_name: string
  subject_slug: string
  subject_color_hex: string
  total_videos_available: string
  videos_attempted: string
  average_best_score: string | null
  badges_earned: string
  badges_available: string
}>(
  `
    WITH child_age AS (
      SELECT age_group_id FROM children WHERE id = $1
    ),
    available_videos AS (
      SELECT v.id AS video_id, v.subject_id
      FROM videos v, child_age
      WHERE v.is_published = TRUE
        AND (child_age.age_group_id IS NULL OR v.age_group_id = child_age.age_group_id)
    ),
    best_per_video AS (
      SELECT sa.video_id, MAX(sa.score_percentage) AS best_score
      FROM score_attempts sa
      WHERE sa.child_id = $1
      GROUP BY sa.video_id
    ),
    badges_avail_per_subject AS (
      SELECT av.subject_id, COALESCE(SUM(vbr.badge_count), 0) AS badges_available
      FROM available_videos av
      LEFT JOIN video_badge_rules vbr ON vbr.video_id = av.video_id
      GROUP BY av.subject_id
    )
    SELECT
      s.id AS subject_id,
      s.name AS subject_name,
      s.slug AS subject_slug,
      s.color_hex AS subject_color_hex,
      COUNT(DISTINCT av.video_id) AS total_videos_available,
      COUNT(DISTINCT bpv.video_id) AS videos_attempted,
      AVG(bpv.best_score) AS average_best_score,
      COALESCE(SUM(ubu.badge_count), 0) AS badges_earned,
      COALESCE(MAX(bas.badges_available), 0) AS badges_available
    FROM subjects s
    LEFT JOIN available_videos av ON av.subject_id = s.id
    LEFT JOIN best_per_video bpv ON bpv.video_id = av.video_id
    LEFT JOIN user_badge_unlocks ubu ON ubu.video_id = av.video_id AND ubu.child_id = $1
    LEFT JOIN badges_avail_per_subject bas ON bas.subject_id = s.id
    GROUP BY s.id, s.name, s.slug, s.color_hex
    ORDER BY s.name ASC
  `,
  [childId],
  client,
)
```

- [ ] **Step 3: Add a server-side `predikat` helper at the top of `api/services/member.ts`**

Below the `ProgressRow` interface:

```ts
type Predikat = 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'KURANG' | 'BELUM_MULAI'

function computePredikat(videosAttempted: number, averageBestScore: number | null): Predikat {
  if (videosAttempted === 0 || averageBestScore === null) return 'BELUM_MULAI'
  if (averageBestScore >= 85) return 'SANGAT_BAIK'
  if (averageBestScore >= 70) return 'BAIK'
  if (averageBestScore >= 55) return 'CUKUP'
  return 'KURANG'
}
```

- [ ] **Step 4: Build the `subjectStats` array, including per-subject `videos`**

Inside `getMemberProgress` after the queries finish, before the `return` statement, derive the per-subject video lists from the existing `videoProgress` array (already keyed by subject):

```ts
const videosBySubjectId = new Map<string, typeof videoProgress>()
for (const v of videoProgress) {
  const list = videosBySubjectId.get(v.subject_id) ?? []
  list.push(v)
  videosBySubjectId.set(v.subject_id, list)
}

const subjectStats = subjectStatRows.map((row) => {
  const videosAttempted = Number(row.videos_attempted)
  const averageBestScore =
    row.average_best_score === null
      ? null
      : Number(Number(row.average_best_score).toFixed(1))
  return {
    id: row.subject_id,
    name: row.subject_name,
    slug: row.subject_slug,
    colorHex: row.subject_color_hex,
    totalVideosAvailable: Number(row.total_videos_available),
    videosAttempted,
    averageBestScore,
    badgesEarned: Number(row.badges_earned),
    badgesAvailable: Number(row.badges_available),
    predikat: computePredikat(videosAttempted, averageBestScore),
    videos: (videosBySubjectId.get(row.subject_id) ?? []).map((v) => ({
      videoId: v.video_id,
      videoSlug: v.video_slug,
      videoTitle: v.video_title,
      bestScore: Number(v.best_score),
      bestCorrectAnswers: v.best_correct_answers,
      totalQuestions: v.total_questions ?? 0,
      badgeCount: Number(v.badge_count ?? 0),
      latestAttemptAt: v.latest_attempt_at,
    })),
  }
})
```

If `total_questions` is not selected by the existing `videoProgress` query (line 212 area in `member.ts`), add `v.number_of_questions AS total_questions` to that SELECT and to its row type. Required for the rapor's "X/Y benar" rendering.

- [ ] **Step 5: Append `periodStart`, `periodEnd`, `subjectStats` to the returned object**

Locate the `return { summary, recentAttempts, videoProgress, subjectTotals, child }` block and add the three new fields, keeping `subjectTotals` for now (removed in Task 13):

```ts
return {
  summary: { /* unchanged */ },
  recentAttempts: /* unchanged */,
  videoProgress: /* unchanged */,
  subjectTotals: /* unchanged */,
  subjectStats,
  periodStart: periodRow?.period_start ?? new Date().toISOString(),
  periodEnd: new Date().toISOString(),
  child: /* unchanged */,
}
```

- [ ] **Step 6: Typecheck**

```bash
npm run check
```

Expected: pass with zero errors. Fix any reported type mismatches (e.g., the `videoProgress` row type may need `total_questions` added).

- [ ] **Step 7: Manual smoke**

Start the dev server (`npm run dev`), log in as a member with at least one child and one attempt, then in DevTools:

```js
fetch('/api/me/progress?childId=<UUID>', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } })
  .then(r => r.json()).then(d => console.log(d.data.subjectStats, d.data.periodStart, d.data.periodEnd))
```

Expected: `subjectStats` is an array of objects with the fields from the spec, `predikat` is one of the five enum values, `periodStart` is ISO timestamp.

- [ ] **Step 8: Commit**

```bash
git add api/services/member.ts
git commit -m "feat(api): add subjectStats and period to /me/progress"
```

---

## Task 2: Add `Predikat`, `SubjectStat`, extend `MemberProgress` types

**Files:**
- Modify: `src/types/index.ts:148-159`

- [ ] **Step 1: Add new types and extend `MemberProgress`**

Append above the `MemberProgress` declaration:

```ts
export type Predikat = 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'KURANG' | 'BELUM_MULAI'

export interface SubjectStatVideo {
  videoId: string
  videoSlug: string
  videoTitle: string
  bestScore: number
  bestCorrectAnswers: number
  totalQuestions: number
  badgeCount: number
  latestAttemptAt: string
}

export interface SubjectStat {
  id: string
  name: string
  slug: string
  colorHex: string
  totalVideosAvailable: number
  videosAttempted: number
  averageBestScore: number | null
  badgesEarned: number
  badgesAvailable: number
  predikat: Predikat
  videos: SubjectStatVideo[]
}
```

In the `MemberProgress` interface, add:

```ts
subjectStats: SubjectStat[]
periodStart: string
periodEnd: string
```

Keep `subjectTotals` for now.

- [ ] **Step 2: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add SubjectStat, Predikat, period to MemberProgress"
```

---

## Task 3: `src/lib/predikat.ts` — pure helpers

**Files:**
- Create: `src/lib/predikat.ts`

- [ ] **Step 1: Write the helper file**

```ts
import type { Predikat, SubjectStat } from '../types'

export function predikatLabel(p: Predikat): { label: string; bgClass: string; textClass: string } {
  switch (p) {
    case 'SANGAT_BAIK':
      return { label: 'Sangat Baik', bgClass: 'bg-emerald-500', textClass: 'text-white' }
    case 'BAIK':
      return { label: 'Baik', bgClass: 'bg-blue-500', textClass: 'text-white' }
    case 'CUKUP':
      return { label: 'Cukup', bgClass: 'bg-amber-500', textClass: 'text-white' }
    case 'KURANG':
      return { label: 'Kurang', bgClass: 'bg-red-500', textClass: 'text-white' }
    case 'BELUM_MULAI':
    default:
      return { label: 'Belum Mulai', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
  }
}

export function subjectAutoNote(
  stats: SubjectStat[],
  summary: { attemptsCount: number; videosCompleted: number },
  childName: string,
): string {
  if (summary.attemptsCount === 0) {
    return `Mari bantu ${childName} mulai belajar dengan QUPU. Pilih satu video di halaman Video untuk mengumpulkan badge pertama.`
  }

  const attempted = stats.filter((s) => s.videosAttempted > 0 && s.averageBestScore !== null)
  const strongest = [...attempted].sort(
    (a, b) => (b.averageBestScore ?? 0) - (a.averageBestScore ?? 0),
  )[0]

  const unstartedBySize = [...stats]
    .filter((s) => s.predikat === 'BELUM_MULAI' && s.totalVideosAvailable > 0)
    .sort((a, b) => b.totalVideosAvailable - a.totalVideosAvailable)
  const weakestAttempted = [...attempted].sort(
    (a, b) => (a.averageBestScore ?? 0) - (b.averageBestScore ?? 0),
  )[0]
  const suggestion = unstartedBySize[0] ?? weakestAttempted

  const effortLine =
    summary.attemptsCount >= 5
      ? 'Konsistensi belajar terjaga.'
      : 'Mari tambah latihan lagi agar semakin mahir.'

  const strengthLine = strongest
    ? `${childName} menunjukkan keunggulan di ${strongest.name} dengan rata-rata ${strongest.averageBestScore}% dan ${strongest.badgesEarned} badge.`
    : `${childName} sudah mulai mengerjakan ${summary.videosCompleted} video.`

  const suggestionLine =
    suggestion && suggestion.id !== strongest?.id
      ? `Disarankan menambah eksplorasi di ${suggestion.name} agar cakupan lebih merata.`
      : ''

  return [strengthLine, effortLine, suggestionLine].filter(Boolean).join(' ')
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/predikat.ts
git commit -m "feat(lib): predikat label + auto-note helpers"
```

---

## Task 4: `src/styles/print.css` + wire it from `main.tsx`

**Files:**
- Create: `src/styles/print.css`
- Modify: `src/main.tsx:5`

- [ ] **Step 1: Write `print.css`**

```css
@media print {
  @page {
    size: A4 portrait;
    margin: 14mm;
  }

  html,
  body {
    background: #ffffff !important;
    color: #1F3A8A !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-print-hide],
  header[data-app-nav],
  footer[data-app-footer],
  nav[data-app-tabbar] {
    display: none !important;
  }

  details:not([open]) > summary ~ * {
    display: block !important;
  }
  details > summary {
    list-style: none;
  }
  details > summary::-webkit-details-marker {
    display: none;
  }

  .print-page-break {
    break-after: page;
  }
}
```

- [ ] **Step 2: Import the stylesheet from `main.tsx`**

In `src/main.tsx`, add a new import line below `import './index.css'`:

```ts
import './index.css'
import './styles/print.css'
```

- [ ] **Step 3: Add `data-app-nav` / `data-app-footer` / `data-app-tabbar` markers**

Open `src/components/Layout.tsx`, `src/components/Navbar.tsx`, and the footer / mobile tabbar components used in the member layout. Add `data-app-nav` to the navbar's outer `<header>`, `data-app-footer` to the footer's outer `<footer>`, and `data-app-tabbar` to any persistent mobile tabbar `<nav>`. If a component has no clear root element matching the desired `<header>`/`<footer>`/`<nav>`, wrap or annotate the existing root.

- [ ] **Step 4: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/styles/print.css src/main.tsx src/components/Layout.tsx src/components/Navbar.tsx
git commit -m "feat(style): print.css and data-app-* hooks for rapor"
```

(Adjust the `git add` list to whatever components received the markers.)

---

## Task 5: `SubjectMasteryCard` component

**Files:**
- Create: `src/components/dashboard/SubjectMasteryCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Link } from 'react-router-dom'
import type { SubjectStat } from '../../types'
import { predikatLabel } from '../../lib/predikat'

interface Props {
  stats: SubjectStat[]
  childName: string
}

export default function SubjectMasteryCard({ stats, childName }: Props) {
  const hasAny = stats.some((s) => s.totalVideosAvailable > 0)

  return (
    <div className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Subject mastery
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Performa {childName} per subject
          </h2>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
        >
          Lihat rapor lengkap
          <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
        </Link>
      </div>

      {!hasAny ? (
        <p className="mt-5 text-sm font-medium text-qupu-muted">
          Belum ada subject yang tersedia untuk usia ini. Hubungi admin atau cek halaman Video.
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {stats
            .filter((s) => s.totalVideosAvailable > 0)
            .map((s) => {
              const coverage =
                s.totalVideosAvailable === 0
                  ? 0
                  : Math.round((s.videosAttempted / s.totalVideosAvailable) * 100)
              const score = s.averageBestScore ?? 0
              const chip = predikatLabel(s.predikat)
              return (
                <div key={s.id} className="rounded-[1.25rem] bg-qupu-shell px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: s.colorHex }}
                      />
                      <span className="font-display text-base font-extrabold text-qupu-brand-blue">
                        {s.name}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${chip.bgClass} ${chip.textClass}`}
                    >
                      {chip.label}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Bar
                      label={`Coverage ${s.videosAttempted}/${s.totalVideosAvailable}`}
                      value={coverage}
                      fillClass="bg-qupu-brand-blue"
                      trackClass="bg-qupu-brand-blue/15"
                    />
                    <Bar
                      label={
                        s.videosAttempted === 0
                          ? 'Skor —'
                          : `Skor rata-rata ${s.averageBestScore}%`
                      }
                      value={score}
                      fillClass="bg-qupu-brand-orange"
                      trackClass="bg-qupu-brand-orange/20"
                    />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

function Bar({
  label,
  value,
  fillClass,
  trackClass,
}: {
  label: string
  value: number
  fillClass: string
  trackClass: string
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-qupu-muted">{label}</div>
      <div className={`mt-1 h-2 w-full rounded-full ${trackClass}`}>
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/SubjectMasteryCard.tsx
git commit -m "feat(dashboard): SubjectMasteryCard hero component"
```

---

## Task 6: `RecentAttemptsCompact` component (extracted)

**Files:**
- Create: `src/components/dashboard/RecentAttemptsCompact.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Link } from 'react-router-dom'
import type { RecentAttempt } from '../../types'
import { formatDateLabel } from '../../lib/youtube'

interface Props {
  attempts: RecentAttempt[]
  childName: string
}

export default function RecentAttemptsCompact({ attempts, childName }: Props) {
  return (
    <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
            Aktivitas terbaru
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Recent attempts
          </h2>
        </div>
        <Link
          to="/badges"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Trophy wall
          <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
        </Link>
      </div>

      {attempts.length === 0 ? (
        <p className="mt-5 text-sm font-medium text-qupu-muted">
          Belum ada attempt tersimpan untuk {childName}. Buka halaman Video dan pilih kuis.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {attempts.slice(0, 5).map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-bold text-qupu-brand-blue">{attempt.videoTitle}</div>
                <div className="text-xs font-medium text-qupu-muted">
                  {attempt.correctAnswers}/{attempt.totalQuestions} benar •{' '}
                  {formatDateLabel(attempt.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                  style={{ backgroundColor: attempt.subjectColorHex }}
                >
                  {attempt.subjectName}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-orange shadow-soft">
                  {attempt.scorePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
npm run check
git add src/components/dashboard/RecentAttemptsCompact.tsx
git commit -m "feat(dashboard): RecentAttemptsCompact component"
```

---

## Task 7: Slim `Dashboard.tsx`

**Files:**
- Modify: `src/pages/Dashboard.tsx` (full replace of the rendered JSX block)

- [ ] **Step 1: Replace the rendered JSX with the slim layout**

Open `src/pages/Dashboard.tsx`. Keep the imports for `useEffect`, `useState`, `Link`, `api`, `useAuthStore`, `AuthCard`, `Reveal`, `SkeletonCard`, `MemberProgress`, and the `SUMMARY_ICONS`. Replace the imports of `formatDateLabel` and `BadgeCurve` with imports of the two new components, then replace the entire `return (...)` of the main render branch (after the loading / no-child / error guards) with:

```tsx
import SubjectMasteryCard from '../components/dashboard/SubjectMasteryCard'
import RecentAttemptsCompact from '../components/dashboard/RecentAttemptsCompact'

// ...the loading / no-child / error guards stay unchanged...

return (
  <div className="space-y-8">
    <Reveal>
      <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
        <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
        <i className="fa-solid fa-star pointer-events-none absolute right-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
        <i className="fa-solid fa-star pointer-events-none absolute left-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
        <i className="fa-solid fa-star pointer-events-none absolute right-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              <span
                className="h-6 w-6 rounded-full border-2 border-white shadow-soft"
                style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
              />
              Dashboard {activeChild.name}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
              Progres belajar {activeChild.name} di QUPU.
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
              Pantau performa per subject, lihat rapor lengkap, lalu lanjutkan ke tantangan berikutnya. Ganti profil di navbar untuk lihat progres anak lainnya.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard icon={SUMMARY_ICONS.attempts} title="Attempt tersimpan" value={progress.summary.attemptsCount} />
            <SummaryCard icon={SUMMARY_ICONS.average} title="Rata-rata skor" value={`${progress.summary.averageScore}%`} />
            <SummaryCard icon={SUMMARY_ICONS.videos} title="Video selesai" value={progress.summary.videosCompleted} />
            <SummaryCard icon={SUMMARY_ICONS.badges} title="Total badge" value={progress.summary.badgesTotal} />
          </div>
        </div>
      </section>
    </Reveal>

    <Reveal delay={0.05}>
      <SubjectMasteryCard stats={progress.subjectStats} childName={activeChild.name} />
    </Reveal>

    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Reveal delay={0.1}>
        <RecentAttemptsCompact attempts={progress.recentAttempts} childName={activeChild.name} />
      </Reveal>

      <Reveal delay={0.15}>
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full border-4 border-white shadow-soft"
              style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                Profil aktif
              </div>
              <div className="font-display text-3xl font-bold text-qupu-brand-blue">{activeChild.name}</div>
            </div>
          </div>

          <div className="mt-5 text-sm font-medium text-qupu-muted">
            Ingin lihat progres anak lain? Ganti profil dari switcher di navbar.
          </div>
        </div>
      </Reveal>
    </section>
  </div>
)
```

- [ ] **Step 2: Remove `BadgeCurve` and `formatDateLabel` imports if no longer used in this file**

Delete the imports if the slim layout no longer references them.

- [ ] **Step 3: Typecheck**

```bash
npm run check
```

Expected: pass. The `subjectStats` field now exists on `MemberProgress` (Task 2).

- [ ] **Step 4: Manual smoke**

`npm run dev`, open `/dashboard` as a member with attempts. Confirm:
- Hero text + 4 KPI cards still visible.
- Subject mastery card renders with one row per subject (with available videos), two bars per row, predikat chip on the right.
- "Lihat rapor lengkap" button is present (links to `/report`, will 404 until Task 9).
- Recent attempts card shows compact rows.
- Profile card on the right column.
- Best-per-video card and Badge-per-subject card are gone.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dashboard): slim layout with SubjectMasteryCard hero"
```

---

## Task 8: Add `/report` route

**Files:**
- Modify: `src/App.tsx:5-110`

- [ ] **Step 1: Add the import + route**

Add `import ReportPage from './pages/Report'` near the other page imports. Add the route block inside the existing member-protected area, between the `dashboard` and `badges` routes:

```tsx
<Route
  path="report"
  element={
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Create a stub `Report.tsx` so the route resolves**

```tsx
// src/pages/Report.tsx
export default function ReportPage() {
  return <div className="rounded-3xl bg-white p-6">Rapor — coming next.</div>
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
npm run check
git add src/App.tsx src/pages/Report.tsx
git commit -m "feat(routes): /report ProtectedRoute stub"
```

---

## Task 9: Rapor sub-components + filled-out `Report.tsx`

**Files:**
- Create: `src/components/report/RaporHeader.tsx`
- Create: `src/components/report/RaporSummary.tsx`
- Create: `src/components/report/RaporSubjectTable.tsx`
- Create: `src/components/report/RaporVideoBreakdown.tsx`
- Create: `src/components/report/RaporNote.tsx`
- Create: `src/components/report/RaporFooter.tsx`
- Create: `src/components/report/PrintButton.tsx`
- Modify: `src/pages/Report.tsx` (replace stub from Task 8)

- [ ] **Step 1: `RaporHeader.tsx`**

```tsx
interface Props {
  childName: string
  ageGroupName: string | null
  periodStart: string
  periodEnd: string
  avatarColor: string | null
}

function fmt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RaporHeader({ childName, ageGroupName, periodStart, periodEnd, avatarColor }: Props) {
  return (
    <header className="flex items-start justify-between gap-4 border-b-[3px] border-qupu-brand-blue pb-3">
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
          Rapor Belajar QUPU
        </div>
        <div className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">{childName}</div>
        <div className="mt-1 text-xs text-qupu-muted">
          {ageGroupName ? `Kelompok usia: ${ageGroupName} · ` : ''}Periode: {fmt(periodStart)} → {fmt(periodEnd)}
        </div>
      </div>
      <div className="text-right">
        <div
          className="inline-block h-12 w-12 rounded-full border-[3px] border-white"
          style={{ boxShadow: '0 0 0 2px #1F3A8A', backgroundColor: avatarColor ?? '#FB923C' }}
        />
        <div className="mt-1 text-[10px] font-extrabold text-qupu-muted">QUPU.ID</div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: `RaporSummary.tsx`**

```tsx
import type { ProgressSummary } from '../../types'

export default function RaporSummary({ summary }: { summary: ProgressSummary }) {
  const cells = [
    { label: 'Attempt', value: summary.attemptsCount },
    { label: 'Rata Skor', value: `${summary.averageScore}%` },
    { label: 'Video Selesai', value: summary.videosCompleted },
    { label: 'Total Badge', value: summary.badgesTotal },
  ]
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg bg-qupu-shell px-3 py-2">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-qupu-brand-orange">
            {c.label}
          </div>
          <div className="font-display text-xl font-extrabold text-qupu-brand-blue">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: `RaporSubjectTable.tsx`**

```tsx
import type { SubjectStat } from '../../types'
import { predikatLabel } from '../../lib/predikat'

export default function RaporSubjectTable({ stats }: { stats: SubjectStat[] }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-qupu-brand-blue/10">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_1.1fr] bg-qupu-brand-blue px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
        <div>Subject</div>
        <div>Coverage</div>
        <div>Rata Skor</div>
        <div>Badge</div>
        <div>Predikat</div>
      </div>
      {stats.map((s) => {
        const chip = predikatLabel(s.predikat)
        return (
          <div
            key={s.id}
            className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_1.1fr] items-center border-b border-qupu-brand-blue/10 px-3 py-2 text-xs text-qupu-brand-blue last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: s.colorHex }} />
              <span className="font-extrabold">{s.name}</span>
            </div>
            <div>{s.videosAttempted} / {s.totalVideosAvailable} video</div>
            <div className="font-extrabold">
              {s.averageBestScore === null ? '—' : `${s.averageBestScore}%`}
            </div>
            <div>{s.badgesEarned}×</div>
            <div>
              <span
                className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] ${chip.bgClass} ${chip.textClass}`}
              >
                {chip.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: `RaporVideoBreakdown.tsx`**

```tsx
import type { SubjectStat } from '../../types'

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RaporVideoBreakdown({ stats }: { stats: SubjectStat[] }) {
  const withVideos = stats.filter((s) => s.videos.length > 0)
  if (withVideos.length === 0) return null
  return (
    <div className="mt-3 space-y-2">
      {withVideos.map((s) => (
        <details
          key={s.id}
          className="rounded-lg bg-qupu-shell p-3 [&[open]>summary>span:last-child]:rotate-90"
          open
        >
          <summary className="flex cursor-pointer items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em]">
            <span style={{ color: s.colorHex }}>{s.name}</span>
            <span className="text-qupu-muted transition-transform">▶</span>
          </summary>
          <ul className="mt-2 space-y-1 text-[11px] text-qupu-brand-blue">
            {s.videos.map((v) => (
              <li key={v.videoId}>
                • {v.videoTitle} — Skor terbaik <strong>{v.bestScore}%</strong> ·{' '}
                {v.badgeCount}× badge · {fmt(v.latestAttemptAt)}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: `RaporNote.tsx`**

```tsx
import type { ProgressSummary, SubjectStat } from '../../types'
import { subjectAutoNote } from '../../lib/predikat'

interface Props {
  stats: SubjectStat[]
  summary: ProgressSummary
  childName: string
}

export default function RaporNote({ stats, summary, childName }: Props) {
  const text = subjectAutoNote(stats, summary, childName)
  return (
    <div className="mt-3 rounded-lg border-[1.5px] border-dashed border-qupu-brand-orange bg-white px-3 py-2 text-[11px] leading-relaxed text-qupu-brand-blue">
      {text}
    </div>
  )
}
```

- [ ] **Step 6: `RaporFooter.tsx`**

```tsx
function today(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RaporFooter() {
  return (
    <footer className="mt-5 flex items-end justify-between gap-3">
      <div className="text-[9px] text-qupu-muted">Dicetak {today()} · qupu.id/dashboard</div>
      <div className="text-center">
        <div className="w-32 border-t border-qupu-brand-blue pt-0.5 text-[10px] text-qupu-muted">
          Tanda tangan orang tua
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: `PrintButton.tsx`**

```tsx
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print-hide
      className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
    >
      <i className="fa-solid fa-print" aria-hidden="true" />
      Cetak / Simpan PDF
    </button>
  )
}
```

- [ ] **Step 8: Replace `Report.tsx` stub with the full page**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import SkeletonCard from '../components/SkeletonCard'
import RaporHeader from '../components/report/RaporHeader'
import RaporSummary from '../components/report/RaporSummary'
import RaporSubjectTable from '../components/report/RaporSubjectTable'
import RaporVideoBreakdown from '../components/report/RaporVideoBreakdown'
import RaporNote from '../components/report/RaporNote'
import RaporFooter from '../components/report/RaporFooter'
import PrintButton from '../components/report/PrintButton'
import type { MemberProgress } from '../types'

export default function ReportPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((c) => c.id === activeChildId) ?? null
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ageGroupName, setAgeGroupName] = useState<string | null>(null)

  useEffect(() => {
    if (!activeChildId) {
      setProgress(null)
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [{ data: progressRes }, { data: metaRes }] = await Promise.all([
          api.get('/me/progress', { params: { childId: activeChildId } }),
          api.get('/public/meta'),
        ])
        const data = progressRes.data as MemberProgress
        setProgress(data)
        const ageGroups: Array<{ id: string; name: string }> = metaRes.data?.ageGroups ?? []
        setAgeGroupName(
          ageGroups.find((g) => g.id === data.child?.ageGroupId)?.name ?? null,
        )
      } catch (loadError) {
        console.error('Failed to load report:', loadError)
        setError('Gagal memuat rapor.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [activeChildId])

  if (!activeChildId || !activeChild) {
    return (
      <AuthCard
        mascotSrc="/hero-mascot.png"
        eyebrow="Rapor"
        title="Pilih profil anak dulu"
        subtitle="Rapor dibuat per anak. Pilih profil dari switcher di navbar."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
        >
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) return <SkeletonCard />
  if (error || !progress) {
    return (
      <div className="rounded-3xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error || 'Gagal memuat rapor.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3" data-print-hide>
        <Link to="/dashboard" className="text-sm font-bold text-qupu-brand-blue underline">
          ← Kembali ke dashboard
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-soft print:p-0 print:shadow-none">
        <RaporHeader
          childName={activeChild.name}
          ageGroupName={ageGroupName}
          periodStart={progress.periodStart}
          periodEnd={progress.periodEnd}
          avatarColor={activeChild.avatarColor}
        />
        <RaporSummary summary={progress.summary} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Penilaian per mata pelajaran
        </h3>
        <RaporSubjectTable stats={progress.subjectStats} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Rincian video per subject
        </h3>
        <RaporVideoBreakdown stats={progress.subjectStats} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Catatan QUPU
        </h3>
        <RaporNote
          stats={progress.subjectStats}
          summary={progress.summary}
          childName={activeChild.name}
        />

        <RaporFooter />
      </article>
    </div>
  )
}
```

- [ ] **Step 9: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 10: Manual smoke**

`npm run dev`, log in, click "Lihat rapor lengkap" on `/dashboard`. Confirm:
- Page renders with header, KPIs, subject table, video breakdown, note, footer.
- Predikat chips show correct color per `predikat`.
- "Cetak / Simpan PDF" button opens browser print dialog.
- In print preview: navbar/footer/tabbar are hidden, page is A4 portrait, video breakdown details are open.

- [ ] **Step 11: Commit**

```bash
git add src/components/report src/pages/Report.tsx
git commit -m "feat(report): rapor page with print-CSS A4 layout"
```

---

## Task 10: `BadgeMedallion` component

**Files:**
- Create: `src/components/badges/BadgeMedallion.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Link } from 'react-router-dom'

interface EarnedProps {
  state: 'earned'
  label: string
  colorHex: string
  href: string
  badgeCount: number
}

interface LockedProps {
  state: 'locked'
  label: string
}

type Props = EarnedProps | LockedProps

export default function BadgeMedallion(props: Props) {
  if (props.state === 'locked') {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-dashed border-slate-300 bg-slate-100 text-slate-400">
          <i className="fa-solid fa-lock" aria-hidden="true" />
        </div>
        <div className="mt-1 truncate text-[10px] font-bold text-slate-400">{props.label}</div>
      </div>
    )
  }
  return (
    <Link to={props.href} className="text-center transition-transform hover:-translate-y-1">
      <div
        className="mx-auto h-12 w-12 rounded-full border-[3px] border-white shadow-[0_4px_0_#FFD3B1]"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${props.colorHex}33, ${props.colorHex})`,
        }}
        aria-label={props.label}
      />
      <div className="mt-1 truncate text-[10px] font-bold text-qupu-brand-blue">
        {props.label}
        {props.badgeCount > 1 ? ` (${props.badgeCount}×)` : ''}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
npm run check
git add src/components/badges/BadgeMedallion.tsx
git commit -m "feat(badges): BadgeMedallion earned/locked states"
```

---

## Task 11: `TrophyShelf` component

**Files:**
- Create: `src/components/badges/TrophyShelf.tsx`

- [ ] **Step 1: Inspect the existing `SubjectBadgeGroup` shape**

Open `src/types/index.ts` lines 161–177 to confirm the `SubjectBadgeGroup` fields. Note: this type has `unlocks` (earned) but no list of locked badges with names. The shelf renders earned medallions + a single "🔒 N badge lagi" placeholder per shelf based on `(totalBadges - sum(unlocks.badgeCount))`.

- [ ] **Step 2: Write the component**

```tsx
import type { SubjectBadgeGroup } from '../../types'
import BadgeMedallion from './BadgeMedallion'

const PREDIKAT_FROM_RATIO = (earned: number, total: number) => {
  if (total === 0) return { label: 'Belum Ada', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
  const ratio = earned / total
  if (ratio >= 0.75) return { label: 'Sangat Baik', bgClass: 'bg-emerald-500', textClass: 'text-white' }
  if (ratio >= 0.5) return { label: 'Baik', bgClass: 'bg-blue-500', textClass: 'text-white' }
  if (ratio >= 0.25) return { label: 'Cukup', bgClass: 'bg-amber-500', textClass: 'text-white' }
  if (ratio > 0) return { label: 'Mulai', bgClass: 'bg-orange-500', textClass: 'text-white' }
  return { label: 'Belum Mulai', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
}

export default function TrophyShelf({ group }: { group: SubjectBadgeGroup }) {
  const earnedCount = group.unlocks.reduce((acc, u) => acc + u.badgeCount, 0)
  const lockedCount = Math.max(0, group.totalBadges - earnedCount)
  const chip = PREDIKAT_FROM_RATIO(earnedCount, group.totalBadges)

  return (
    <section
      className="rounded-2xl border-[3px] bg-white p-3 shadow-[5px_6px_0_0_#FFD3B1]"
      style={{ borderColor: group.colorHex }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded" style={{ backgroundColor: group.colorHex }} />
          <span className="font-display text-base font-extrabold text-qupu-brand-blue">
            {group.name}
          </span>
          <span className="text-[10px] font-bold text-qupu-muted">
            {earnedCount} / {group.totalBadges} badge
          </span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ${chip.bgClass} ${chip.textClass}`}>
          {chip.label}
        </span>
      </div>

      {group.unlocks.length === 0 && lockedCount === 0 ? (
        <p className="mt-3 text-xs font-medium text-qupu-muted">
          Belum ada video di subject ini. Cek halaman Video untuk yang baru.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {group.unlocks.map((u) => (
            <BadgeMedallion
              key={u.videoId}
              state="earned"
              label={u.videoTitle}
              colorHex={group.colorHex}
              href={`/videos/${u.videoSlug}`}
              badgeCount={u.badgeCount}
            />
          ))}
          {lockedCount > 0 ? (
            <BadgeMedallion state="locked" label={`+${lockedCount} badge lagi`} />
          ) : null}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
npm run check
git add src/components/badges/TrophyShelf.tsx
git commit -m "feat(badges): TrophyShelf component"
```

---

## Task 12: Rewrite `Badges.tsx` to trophy wall

**Files:**
- Modify: `src/pages/Badges.tsx` (replace render block)

- [ ] **Step 1: Replace the render block**

Keep the `useEffect` data fetch and the `useAuthStore` / loading / error / no-active-child guards. Replace the rendered content with:

```tsx
import TrophyShelf from '../components/badges/TrophyShelf'

// existing imports + guards remain

return (
  <div className="space-y-6">
    <Reveal>
      <header className="rounded-3xl border-[3px] border-qupu-cream bg-qupu-brand-blue p-5 text-white shadow-[6px_8px_0_0_#FFD3B1]">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
              Ruang trofi
            </div>
            <div className="mt-1 font-display text-3xl font-extrabold">Hebat, {activeChild.name}!</div>
            <div className="mt-1 text-xs text-qupu-cream">
              {totalBadges} badge dari {groupsWithAny.length} subject · keep going!
            </div>
          </div>
          <div className="flex gap-2">
            {latestThree.map((u) => (
              <Link
                key={`${u.subjectId}-${u.videoId}`}
                to={`/videos/${u.videoSlug}`}
                className="h-11 w-11 rounded-full border-[3px] border-white"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${u.subjectColor}33, ${u.subjectColor})`,
                }}
                aria-label={u.videoTitle}
              />
            ))}
          </div>
        </div>
      </header>
    </Reveal>

    {groups.length === 0 ? (
      <p className="rounded-3xl bg-white p-6 text-sm font-medium text-qupu-muted shadow-soft">
        Belum ada subject yang tersedia. Cek halaman Video.
      </p>
    ) : (
      <div className="grid gap-3">
        {groups.map((group) => (
          <Reveal key={group.id} delay={0.05}>
            <TrophyShelf group={group} />
          </Reveal>
        ))}
      </div>
    )}
  </div>
)
```

- [ ] **Step 2: Add the `totalBadges` / `groupsWithAny` / `latestThree` derivations above the return**

```tsx
const totalBadges = groups.reduce(
  (acc, g) => acc + g.unlocks.reduce((a, u) => a + u.badgeCount, 0),
  0,
)
const groupsWithAny = groups.filter((g) => g.unlocks.length > 0)
const latestThree = groups
  .flatMap((g) =>
    g.unlocks.map((u) => ({
      subjectId: g.id,
      subjectColor: g.colorHex,
      videoId: u.videoId,
      videoSlug: u.videoSlug,
      videoTitle: u.videoTitle,
      unlockedAt: u.unlockedAt,
    })),
  )
  .sort((a, b) => (a.unlockedAt < b.unlockedAt ? 1 : -1))
  .slice(0, 3)
```

- [ ] **Step 3: Remove unused imports (e.g., `BADGE_PREVIEW_LIMIT`, `BadgeCurve`, `formatDateLabel`) once they no longer appear in the file.**

- [ ] **Step 4: Typecheck**

```bash
npm run check
```

Expected: pass.

- [ ] **Step 5: Manual smoke**

`/badges` shows blue hero with name + total + 3 latest medallions, then one shelf per subject. Earned badges link to their video. Locked placeholder reads "+N badge lagi".

- [ ] **Step 6: Commit**

```bash
git add src/pages/Badges.tsx
git commit -m "feat(badges): rewrite Badges page as trophy wall"
```

---

## Task 13: Drop `subjectTotals` from API response and types

**Files:**
- Modify: `api/services/member.ts` (drop the `subjectTotals` query and field)
- Modify: `src/types/index.ts:148-159` (drop `subjectTotals`, drop the `SubjectBadgeTotal` interface if it has no other consumer)

- [ ] **Step 1: Confirm no remaining consumers**

```bash
grep -rn "subjectTotals" src api
```

Expected output: only references inside `api/services/member.ts` and `src/types/index.ts`. If anything else shows up, fix the consumer first.

- [ ] **Step 2: Remove the `subjectTotals` query from `getMemberProgress`**

Delete the `const subjectTotals = await query<...>(...)` block (lines ~267-291 in `api/services/member.ts`) and the corresponding `subjectTotals: subjectTotals.map(...)` mapping in the return.

- [ ] **Step 3: Remove `subjectTotals` from `MemberProgress` and delete `SubjectBadgeTotal`**

```bash
grep -rn "SubjectBadgeTotal" src api
```

If only `src/types/index.ts` uses it, delete the interface. Otherwise leave it.

- [ ] **Step 4: Typecheck + manual smoke + commit**

```bash
npm run check
```

Expected: pass.

Manual smoke: reload `/dashboard`, `/report`, `/badges` — all three pages still render correctly.

```bash
git add api/services/member.ts src/types/index.ts
git commit -m "refactor(api): drop unused subjectTotals from /me/progress"
```

---

## Self-Review Notes

**Spec coverage:**
- Dashboard refresh → Tasks 5, 6, 7.
- Rapor page + print → Tasks 4, 8, 9.
- Trophy wall → Tasks 10, 11, 12.
- Data extension → Tasks 1, 2.
- Predikat helpers + auto note → Tasks 1 (server) and 3 (client).
- subjectTotals removal → Task 13.

**Outstanding consideration:** the spec calls for predikat to be computed server-side so the rapor and dashboard cannot disagree. The client also has `predikatLabel` (display only, not classification) — that's a label-mapping function, not a recompute. No drift risk.

**Type consistency check:**
- `SubjectStat` (Task 2) used in `SubjectMasteryCard` (Task 5), `RaporSubjectTable` (Task 9), `RaporVideoBreakdown` (Task 9), `RaporNote` (Task 9), `subjectAutoNote` (Task 3). Same shape across all.
- `Predikat` enum same in `api/services/member.ts` (Task 1) and `src/types/index.ts` (Task 2).
- `videoProgress` row type in Task 1 must include `total_questions`; flagged inline in Task 1 Step 4.
