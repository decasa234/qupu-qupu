# Latihan WMI Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, logged-out marketing surface for Latihan WMI — a Home promo band, a dedicated `/wmi` page with a no-login interactive concept demo, honest trust signals, and a Free-tier pricing section — plus dormant `users.plan` data scaffolding.

**Architecture:** Approach A (decoupled marketing layer). New components under `src/components/wmi/marketing/` + a new public page `src/pages/LatihanWmi.tsx`, all reusing the existing self-contained `WmiExplainer` for the demo. Two new Home bands. One new public GET endpoint for true content-coverage stats, and a dormant `plan` column surfaced read-only in `/api/users/me`. The member app (`/latihan/wmi*`) is untouched.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind + React Router 7 (`@/*` → `src/*`), Express + `pg` (ESM-style `.js` import specifiers in `api/`), Postgres.

> **Testing note:** This repo has **no test runner** (per CLAUDE.md). Do **not** add one. The automated gate for every task is `npm run check` (tsc `--noEmit`) and, where noted, `npm run lint`. Behavior is verified manually (dev server / webwright) as called out in the relevant tasks. Spec: `docs/superpowers/specs/2026-06-08-latihan-wmi-landing-design.md`.

> **Source-of-truth note (verbatim, already verified against the codebase):**
> - `WmiExplainer` props: `{ slug?, explainer?, params: unknown, correctAnswer: string, lang?: 'en'|'id' }` (default export, `src/components/wmi/WmiExplainer.tsx`). It renders the explainer + Replay + step controls internally and is self-contained.
> - `getCachedPublic<T>(url, config?, ttlMs=60000): Promise<T>` from `@/lib/api` (axios `baseURL` already includes `/api`; pass paths like `/public/wmi-stats`).
> - `Reveal` default export from `@/components/Reveal`, props `{ children, delay?: number, className?: string }`.
> - Brand classes: `font-display` (Baloo 2), `qupu-brand-blue #30598A`, `qupu-brand-orange #f0853a`, `qupu-brand-yellow #ffdd55`, `qupu-cream #FFF2DF`, `qupu-peach #FFD3B1`, `qupu-muted #475569`. Hard shadows via arbitrary values e.g. `shadow-[6px_8px_0_0_#FFD3B1]`. **Font Awesome 6 only, never emoji.**
> - db helpers: `query<T>(sql, params=[], executor?)`, `queryOne<T>(...)` from `../db.js`.

---

## Task 1: Add dormant `users.plan` column (migration + schema)

**Files:**
- Create: `db/migrations/0034_user_plan.sql`
- Modify: `db/schema.sql:22-38` (the `CREATE TABLE ... users` block)

- [ ] **Step 1: Create the migration**

Create `db/migrations/0034_user_plan.sql`:

```sql
-- Dormant subscription-plan hook on users. V1 ships only 'free'; no gating logic
-- consumes this column yet. Idempotent.
BEGIN;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free','premium','pro'));
COMMIT;
```

- [ ] **Step 2: Mirror the column into the fresh-install schema**

In `db/schema.sql`, inside the `users` table (after the `role` line, line 31), add the `plan` column so fresh installs match. Change:

```sql
  role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
```

to:

```sql
  role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
```

- [ ] **Step 3: Apply the migration to your dev DB**

Run (requires `DATABASE_URL` in your env / `.env`):

```bash
psql "$DATABASE_URL" -f db/migrations/0034_user_plan.sql
```

Expected: `BEGIN` / `ALTER TABLE` / `COMMIT`. Then verify:

```bash
psql "$DATABASE_URL" -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='users' AND column_name='plan';"
```

Expected: one row, `plan | text | 'free'::text`.

- [ ] **Step 4: Typecheck (no TS impact, sanity only)**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/0034_user_plan.sql db/schema.sql
git commit -m "feat(db): add dormant users.plan column (free default, no gating)"
```

---

## Task 2: Surface `plan` read-only in `/api/users/me` + client User type

**Files:**
- Modify: `api/routes/users.ts` (the `GET /me` handler — SELECT list + inline result type)
- Modify: `src/types/index.ts:3-11` (the `User` interface)

- [ ] **Step 1: Add `plan` to the `/me` query and its inline type**

In `api/routes/users.ts`, find the `GET /me` handler. Update the inline type and the SELECT to include `plan`. Change:

```ts
    const user = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number
      role: string
      age_group_id: string | null
    }>(
      `
        SELECT id, email, phone, name, age, role, age_group_id
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    )
```

to:

```ts
    const user = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number
      role: string
      age_group_id: string | null
      plan: string
    }>(
      `
        SELECT id, email, phone, name, age, role, age_group_id, plan
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    )
```

- [ ] **Step 2: Add `plan` to the client `User` type**

In `src/types/index.ts`, change:

```ts
export interface User {
  id: string
  email: string
  phone: string | null
  name: string
  age: number | null
  age_group_id?: string | null
  role: UserRole
}
```

to:

```ts
export interface User {
  id: string
  email: string
  phone: string | null
  name: string
  age: number | null
  age_group_id?: string | null
  role: UserRole
  plan?: 'free' | 'premium' | 'pro'
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 4: Commit**

```bash
git add api/routes/users.ts src/types/index.ts
git commit -m "feat(api): surface users.plan read-only in /api/users/me"
```

---

## Task 3: WMI public stats service + endpoint

**Files:**
- Create: `api/services/wmiStats.ts`
- Modify: `api/routes/public.ts` (add `GET /wmi-stats`)

- [ ] **Step 1: Create the stats service**

Create `api/services/wmiStats.ts`:

```ts
import { queryOne } from '../db.js'

export interface WmiPublicStats {
  concepts: number
  papers: number
  videos: number
  gradeMin: number | null
  gradeMax: number | null
}

export async function getWmiPublicStats(): Promise<WmiPublicStats> {
  const row = await queryOne<{
    concepts: number
    papers: number
    videos: number
    grade_min: number | null
    grade_max: number | null
  }>(
    `
      SELECT
        (SELECT COUNT(*)::int FROM wmi_concepts WHERE enabled = TRUE) AS concepts,
        (SELECT COUNT(*)::int FROM wmi_papers)                        AS papers,
        (SELECT COUNT(*)::int FROM videos
           WHERE is_published = TRUE AND deleted_at IS NULL)          AS videos,
        (SELECT MIN(grade)::int FROM wmi_papers)                      AS grade_min,
        (SELECT MAX(grade)::int FROM wmi_papers)                      AS grade_max
    `,
    [],
  )

  return {
    concepts: row?.concepts ?? 0,
    papers: row?.papers ?? 0,
    videos: row?.videos ?? 0,
    gradeMin: row?.grade_min ?? null,
    gradeMax: row?.grade_max ?? null,
  }
}
```

- [ ] **Step 2: Add the public endpoint**

In `api/routes/public.ts`, add an import at the top (next to the other service imports):

```ts
import { getWmiPublicStats } from '../services/wmiStats.js'
```

Then add this handler (mirror the existing `/meta` handler's try/catch + `{ success, data }` shape):

```ts
router.get('/wmi-stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getWmiPublicStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Public wmi-stats error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})
```

(`Request`/`Response` are already imported in `public.ts`; if the existing handler uses `req`, keep its import — here the param is unused so it's `_req`.)

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 4: Manual verify the endpoint**

Start the API (`npm run server:dev`) in one terminal, then:

```bash
curl -s http://localhost:3001/api/public/wmi-stats | head -c 400; echo
```

Expected: `{"success":true,"data":{"concepts":<n>,"papers":<n>,"videos":<n>,"gradeMin":<n|null>,"gradeMax":<n|null>}}`. If you get a 500, check the column names against your DB (`wmi_concepts.enabled`, `wmi_papers.grade`, `videos.is_published`/`deleted_at`) and adjust the SQL.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmiStats.ts api/routes/public.ts
git commit -m "feat(api): add GET /api/public/wmi-stats (true content-coverage counts)"
```

---

## Task 4: Marketing data module

**Files:**
- Create: `src/data/wmiMarketing.ts`

- [ ] **Step 1: Create the data module**

Create `src/data/wmiMarketing.ts` (instance params are verbatim, schema-valid copies of real generator data — `money-shopping-change` answer `20`; `dice-net-fold` net 0 is the valid 1-4-1 net, answer `A`):

```ts
// Editable marketing content for the public "Latihan WMI" surface.
// Pure presentational data — no network, no secrets.

export interface DemoConcept {
  slug: string
  label: string // Indonesian tab label
  params: unknown // schema-valid instance for the explainer
  correctAnswer: string // required by WmiExplainer; some explainers ignore it
  caption: string // one-line Indonesian caption under the demo
}

export const DEMO_CONCEPTS: DemoConcept[] = [
  {
    slug: 'money-shopping-change',
    label: 'Belanja & Kembalian',
    params: { cost: 30, pay: 50, name: 'Budi', item_en: 'book', item_id: 'buku' },
    correctAnswer: '20',
    caption: 'Anak belajar menghitung kembalian langkah demi langkah — bukan menghafal.',
  },
  {
    slug: 'dice-net-fold',
    label: 'Lipat Dadu',
    params: {
      nets: [
        [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 2]],
        [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
        [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
      ],
      validIndex: 0,
    },
    correctAnswer: 'A',
    caption: 'Anak membayangkan jaring-jaring terlipat menjadi kubus — melatih nalar ruang.',
  },
]

export const FREE_TIER = {
  name: 'Mulai Gratis',
  price: 'Rp 0',
  note: 'Selamanya untuk fitur inti',
  features: [
    'Semua video edukatif QUPU',
    'Latihan WMI: konsep, drill & ujian',
    'XP, badge & progres anak',
    'Untuk anak Kelas 0–3',
  ],
  cta: 'Daftar Gratis',
}

// Future tiers/features — teased only, not sold in V1. Rename freely.
export const COMING_SOON: string[] = [
  'Laporan kemajuan mendalam',
  'Kelas untuk guru & sekolah',
  'Bimbingan personal',
]

export interface FounderInfo {
  name: string
  role: string
  story: string
  photoUrl?: string
}

// PLACEHOLDER — replace with the real founder/educator story before launch.
export const FOUNDER: FounderInfo = {
  name: '[Nama Pendiri]',
  role: '[Pendidik & Pendiri QUPU]',
  story:
    'PLACEHOLDER: ceritakan kenapa QUPU dibuat, latar belakang pendidik, dan kenapa konsep ' +
    'olimpiade WMI penting untuk anak. Ganti teks ini sebelum peluncuran.',
}

export interface Testimonial {
  quote: string
  author: string
  role: string
}

// Ships EMPTY in V1 — WmiTestimonials renders nothing until real quotes exist.
export const TESTIMONIALS: Testimonial[] = []
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/data/wmiMarketing.ts
git commit -m "feat(wmi): marketing data module (demo concepts, pricing, founder, testimonials)"
```

---

## Task 5: `WmiConceptDemo` — no-login interactive demo

**Files:**
- Create: `src/components/wmi/marketing/WmiConceptDemo.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/marketing/WmiConceptDemo.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import WmiExplainer from '../WmiExplainer'
import { DEMO_CONCEPTS } from '@/data/wmiMarketing'

export default function WmiConceptDemo() {
  const [active, setActive] = useState(0)
  const concept = DEMO_CONCEPTS[active]

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg font-extrabold text-qupu-brand-blue">Coba sekarang</div>
          <div className="text-xs font-semibold text-qupu-muted">Tanpa daftar · gratis</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_CONCEPTS.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? 'rounded-full bg-qupu-brand-blue px-3 py-1.5 font-display text-xs font-extrabold text-white'
                  : 'rounded-full border-2 border-qupu-peach bg-white px-3 py-1.5 font-display text-xs font-extrabold text-qupu-brand-blue/70 transition hover:-translate-y-0.5'
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* key per concept forces a fresh explainer (restart) when switching tabs */}
      <WmiExplainer
        key={concept.slug}
        slug={concept.slug}
        params={concept.params}
        correctAnswer={concept.correctAnswer}
        lang="id"
      />

      <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-qupu-muted">
        {concept.caption}
      </p>

      <div className="mt-4 flex justify-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
        >
          <i className="fa-solid fa-user-plus" aria-hidden="true" />
          Daftar Gratis untuk lanjut
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/marketing/WmiConceptDemo.tsx
git commit -m "feat(wmi): WmiConceptDemo — no-login tabbed concept demo"
```

---

## Task 6: `WmiTrustStats` — true content-coverage stats (graceful)

**Files:**
- Create: `src/components/wmi/marketing/WmiTrustStats.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/marketing/WmiTrustStats.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { getCachedPublic } from '@/lib/api'

interface WmiStats {
  concepts: number
  papers: number
  videos: number
  gradeMin: number | null
  gradeMax: number | null
}

export default function WmiTrustStats() {
  const [stats, setStats] = useState<WmiStats | null>(null)

  useEffect(() => {
    let alive = true
    getCachedPublic<{ success: boolean; data: WmiStats }>('/public/wmi-stats')
      .then((res) => {
        if (alive) setStats(res.data)
      })
      .catch((error) => {
        console.error('Failed to load WMI stats:', error)
      })
    return () => {
      alive = false
    }
  }, [])

  // Graceful: render nothing while loading or if the endpoint failed.
  if (!stats) return null

  const grades =
    stats.gradeMin != null && stats.gradeMax != null
      ? `Kelas ${stats.gradeMin}–${stats.gradeMax}`
      : 'Kelas 0–3'

  const items = [
    { icon: 'fa-solid fa-lightbulb', value: `${stats.concepts}+`, label: 'Konsep interaktif' },
    { icon: 'fa-solid fa-file-lines', value: `${stats.papers}`, label: 'Soal ujian asli' },
    { icon: 'fa-brands fa-youtube', value: `${stats.videos}`, label: 'Video edukatif' },
    { icon: 'fa-solid fa-child-reaching', value: grades, label: 'Cakupan kelas' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-[1.5rem] border-[3px] border-qupu-peach bg-white p-5 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
        >
          <i className={`${it.icon} text-2xl text-qupu-brand-orange`} aria-hidden="true" />
          <div className="mt-2 font-display text-2xl font-extrabold text-qupu-brand-blue">{it.value}</div>
          <div className="mt-0.5 text-xs font-semibold text-qupu-muted">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/marketing/WmiTrustStats.tsx
git commit -m "feat(wmi): WmiTrustStats — true content-coverage stat strip"
```

---

## Task 7: `WmiPricingSection` — Free tier + "Segera" strip (layout C)

**Files:**
- Create: `src/components/wmi/marketing/WmiPricingSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/marketing/WmiPricingSection.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { FREE_TIER, COMING_SOON } from '@/data/wmiMarketing'

export default function WmiPricingSection() {
  return (
    <section id="harga" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Harga</h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted sm:text-base">
          Mulai gratis hari ini. Fitur premium menyusul.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-white p-6 shadow-[0_8px_0_0_#f0853a] sm:p-8">
          <div className="flex items-center justify-between">
            <div className="font-display text-xl font-extrabold text-qupu-brand-blue">{FREE_TIER.name}</div>
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
              Aktif
            </span>
          </div>
          <div className="mt-2 font-display text-4xl font-extrabold text-qupu-brand-orange">{FREE_TIER.price}</div>
          <div className="text-xs font-semibold text-qupu-muted">{FREE_TIER.note}</div>

          <ul className="mt-5 space-y-2.5">
            {FREE_TIER.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm font-semibold text-qupu-brand-blue/90">
                <i className="fa-solid fa-circle-check mt-0.5 text-green-500" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            {FREE_TIER.cta}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-muted">Segera hadir</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {COMING_SOON.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-qupu-peach bg-qupu-cream px-3 py-1.5 text-xs font-bold text-qupu-muted"
              >
                <i className="fa-solid fa-lock text-[10px]" aria-hidden="true" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/marketing/WmiPricingSection.tsx
git commit -m "feat(wmi): WmiPricingSection — Free tier + coming-soon strip"
```

---

## Task 8: `WmiTestimonials` — dormant (renders null when empty)

**Files:**
- Create: `src/components/wmi/marketing/WmiTestimonials.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/marketing/WmiTestimonials.tsx`:

```tsx
import { TESTIMONIALS } from '@/data/wmiMarketing'

export default function WmiTestimonials() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl">
      <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
        Kata Orang Tua
      </h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className="rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
          >
            <blockquote className="text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 text-xs font-bold text-qupu-muted">
              {t.author} · {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/marketing/WmiTestimonials.tsx
git commit -m "feat(wmi): WmiTestimonials — dormant component (empty in V1)"
```

---

## Task 9: `LatihanWmiSection` — Home promo band

**Files:**
- Create: `src/components/wmi/marketing/LatihanWmiSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/wmi/marketing/LatihanWmiSection.tsx`:

```tsx
import { Link } from 'react-router-dom'

const BULLETS = [
  'Konsep WMI asli untuk anak Kelas 0–3',
  'Belajar langkah demi langkah, bukan menghafal',
  'XP, badge & confetti — anak ketagihan belajar',
]

export default function LatihanWmiSection() {
  return (
    <section
      id="wmi"
      className="scroll-mt-24 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
            <i className="fa-solid fa-medal" aria-hidden="true" />
            Baru · Latihan WMI
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Olimpiade matematika, dimainkan seperti game
          </h2>
          <ul className="space-y-2">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm font-semibold sm:text-base">
                <i className="fa-solid fa-circle-check mt-0.5 text-qupu-brand-yellow" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link
              to="/wmi"
              className="inline-flex items-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
            >
              Coba Latihan WMI
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Link
          to="/wmi"
          className="group relative block rounded-[2rem] bg-qupu-cream p-3 shadow-[6px_8px_0_0_#234a73]"
        >
          <div className="flex h-40 items-center justify-center gap-5 rounded-[1.5rem] bg-white text-4xl text-qupu-brand-blue">
            <i className="fa-solid fa-dice" aria-hidden="true" />
            <i className="fa-solid fa-coins" aria-hidden="true" />
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-qupu-brand-blue px-4 py-1.5 font-display text-xs font-extrabold text-white">
            <i className="fa-solid fa-play mr-1.5" aria-hidden="true" />
            Main demo
          </span>
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/wmi/marketing/LatihanWmiSection.tsx
git commit -m "feat(wmi): LatihanWmiSection — Home promo band linking to /wmi"
```

---

## Task 10: `LatihanWmiPage` — the dedicated `/wmi` page

**Files:**
- Create: `src/pages/LatihanWmi.tsx`

This composes the 9 bands (Reveal wrappers mirror Home). Hero → demo → Apa itu WMI → Cara belajar → stats → founder → testimonials → pricing → closing CTA.

- [ ] **Step 1: Create the page**

Create `src/pages/LatihanWmi.tsx`:

```tsx
import { Link } from 'react-router-dom'
import Reveal from '@/components/Reveal'
import WmiConceptDemo from '@/components/wmi/marketing/WmiConceptDemo'
import WmiTrustStats from '@/components/wmi/marketing/WmiTrustStats'
import WmiPricingSection from '@/components/wmi/marketing/WmiPricingSection'
import WmiTestimonials from '@/components/wmi/marketing/WmiTestimonials'
import { FOUNDER } from '@/data/wmiMarketing'

const LEARN_STEPS = [
  {
    icon: 'fa-solid fa-lightbulb',
    bg: 'bg-qupu-brand-yellow',
    title: 'Konsep',
    desc: 'Pelajari satu konsep WMI lewat animasi langkah demi langkah.',
  },
  {
    icon: 'fa-solid fa-dumbbell',
    bg: 'bg-qupu-brand-blue',
    title: 'Drill',
    desc: 'Latihan soal asli, sebanyak yang anak mau — sambil kumpulkan XP.',
  },
  {
    icon: 'fa-solid fa-trophy',
    bg: 'bg-qupu-brand-orange',
    title: 'Ujian',
    desc: 'Coba paket ujian WMI sungguhan dan raih badge.',
  },
]

const WHY = [
  { icon: 'fa-solid fa-earth-asia', text: 'WMI (World Mathematics Invitation) adalah kompetisi matematika internasional untuk anak.' },
  { icon: 'fa-solid fa-brain', text: 'Melatih nalar & pemecahan masalah — bukan menghafal rumus.' },
  { icon: 'fa-solid fa-child-reaching', text: 'Dirancang untuk anak Kelas 0–3, dengan bahasa & visual yang ramah anak.' },
]

export default function LatihanWmiPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1 · Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFF6E5] via-[#FFE8C9] to-[#FFD8A8] px-6 py-12 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-brand-orange shadow-sm">
          <i className="fa-solid fa-medal" aria-hidden="true" />
          Latihan WMI
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight text-qupu-brand-blue sm:text-5xl">
          Olimpiade matematika, dimainkan seperti game
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-relaxed text-qupu-brand-blue/80 sm:text-base">
          Anak belajar konsep olimpiade matematika WMI lewat animasi seru — paham caranya, bukan sekadar hafal.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            Daftar Gratis
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white/80 px-6 py-[10px] font-display text-base font-extrabold text-qupu-brand-blue transition-all hover:-translate-y-0.5 hover:bg-qupu-brand-blue hover:text-white"
          >
            <i className="fa-solid fa-play" aria-hidden="true" />
            Main Demo
          </a>
        </div>
      </section>

      {/* 2 · Live demo */}
      <Reveal delay={0.05}>
        <section id="demo" className="scroll-mt-24">
          <WmiConceptDemo />
        </section>
      </Reveal>

      {/* 3 · Apa itu WMI? */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Apa itu WMI?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.text}
                className="rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
              >
                <i className={`${w.icon} text-3xl text-qupu-brand-orange`} aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{w.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4 · Cara belajarnya */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-[2.5rem] bg-qupu-cream px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10">
          <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Cara belajarnya
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm font-semibold text-qupu-muted">
            Tiga langkah seru — semuanya pakai XP, badge, dan confetti.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {LEARN_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-[1.75rem] border-[3px] border-white bg-white p-6 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.10)]"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
                  Langkah {i + 1}
                </span>
                <span className={`mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md ${s.bg}`}>
                  <i className={`${s.icon} text-2xl`} aria-hidden="true" />
                </span>
                <div className="mt-4 font-display text-lg font-extrabold text-qupu-brand-blue">{s.title}</div>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-qupu-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 5 · Angka QUPU (true stats) */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
            Yang sudah siap untuk anak
          </h2>
          <div className="mt-6">
            <WmiTrustStats />
          </div>
        </section>
      </Reveal>

      {/* 6 · Cerita pendiri (placeholder) */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-3xl rounded-[2rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)] sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-qupu-cream text-3xl text-qupu-brand-blue">
              <i className="fa-solid fa-chalkboard-user" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{FOUNDER.name}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-qupu-brand-orange">{FOUNDER.role}</div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{FOUNDER.story}</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 7 · Testimonials (dormant; renders null in V1) */}
      <Reveal delay={0.05}>
        <WmiTestimonials />
      </Reveal>

      {/* 8 · Pricing */}
      <Reveal delay={0.05}>
        <WmiPricingSection />
      </Reveal>

      {/* 9 · Closing CTA */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-12 text-center text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Jadi salah satu keluarga pertama</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
            Coba Latihan WMI gratis hari ini. Tidak perlu kartu kredit.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-7 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            Daftar Gratis
          </Link>
        </section>
      </Reveal>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: exits 0, no output. (The page isn't routed yet — that's Task 11. Typecheck still validates it.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/LatihanWmi.tsx
git commit -m "feat(wmi): LatihanWmiPage — dedicated /wmi parent-conversion page"
```

---

## Task 11: Wire route, nav link, and Home inserts

**Files:**
- Modify: `src/App.tsx` (import + public route)
- Modify: `src/components/Navbar.tsx:51-55` (`NAV_ITEMS_PARENT`)
- Modify: `src/pages/Home.tsx` (import + two `<Reveal>` inserts)

- [ ] **Step 1: Import and route the page in `src/App.tsx`**

Add the import alongside the other page imports (e.g. right after `import VideosPage from './pages/Videos'`):

```ts
import LatihanWmiPage from './pages/LatihanWmi'
```

In the public `<Route path="/" element={<Layout />}>` block, add the route after the `videos/:slug` line:

```jsx
  <Route path="videos/:slug" element={<VideoDetailPage />} />
  <Route path="wmi" element={<LatihanWmiPage />} />
```

- [ ] **Step 2: Add the public nav link in `src/components/Navbar.tsx`**

Change:

```ts
const NAV_ITEMS_PARENT: NavItem[] = [
  { label: 'Beranda', to: '/' },
  { label: 'Kategori', to: '/#kategori' },
  { label: 'Video', to: '/videos' },
]
```

to:

```ts
const NAV_ITEMS_PARENT: NavItem[] = [
  { label: 'Beranda', to: '/' },
  { label: 'Latihan WMI', to: '/wmi' },
  { label: 'Kategori', to: '/#kategori' },
  { label: 'Video', to: '/videos' },
]
```

(Desktop + mobile both map this array, so one entry covers both.)

- [ ] **Step 3: Insert the two bands in `src/pages/Home.tsx`**

Add the imports near the top (with the other component imports, after the `Reveal` import on line 11):

```ts
import LatihanWmiSection from '../components/wmi/marketing/LatihanWmiSection'
import WmiPricingSection from '../components/wmi/marketing/WmiPricingSection'
```

In the main `return` stack, insert the WMI promo band **after** `<ScoreBadgeCtaSection />` and the pricing band **after** `<StatsBannerSection />`. Change:

```jsx
      <Reveal delay={0.05}>
        <ScoreBadgeCtaSection />
      </Reveal>
      <Reveal delay={0.05}>
        <VideosSection videos={videos} />
      </Reveal>
      <Reveal delay={0.05}>
        <StatsBannerSection />
      </Reveal>
      <Reveal delay={0.05}>
        <SubscribeCtaSection />
      </Reveal>
```

to:

```jsx
      <Reveal delay={0.05}>
        <ScoreBadgeCtaSection />
      </Reveal>
      <Reveal delay={0.05}>
        <LatihanWmiSection />
      </Reveal>
      <Reveal delay={0.05}>
        <VideosSection videos={videos} />
      </Reveal>
      <Reveal delay={0.05}>
        <StatsBannerSection />
      </Reveal>
      <Reveal delay={0.05}>
        <WmiPricingSection />
      </Reveal>
      <Reveal delay={0.05}>
        <SubscribeCtaSection />
      </Reveal>
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run check && npm run lint`
Expected: both exit 0 (lint may print warnings but must not error).

- [ ] **Step 5: Manual smoke test (logged out)**

Run `npm run dev`. In a logged-out browser:
- Visit `/` → confirm the **Latihan WMI** promo band appears after the Score & Badge journey, and the **Harga** band appears near the bottom. Nav shows "Latihan WMI".
- Click "Coba Latihan WMI" / nav "Latihan WMI" → lands on `/wmi`.
- On `/wmi`: the demo plays; switch tabs (Belanja & Kembalian ↔ Lipat Dadu) and confirm each explainer renders and restarts; "Daftar Gratis" buttons go to `/register`; the stat strip shows numbers (start `npm run server:dev` too so `/api/public/wmi-stats` resolves).
- "Main Demo" / `#demo` and "Harga" / `#harga` anchors scroll correctly.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/Navbar.tsx src/pages/Home.tsx
git commit -m "feat(wmi): wire /wmi route, nav link, and Home WMI + pricing bands"
```

---

## Task 12: Full verification & member-app regression check

**Files:** none (verification only)

- [ ] **Step 1: Typecheck, lint, production build**

```bash
npm run check && npm run lint && npm run build
```
Expected: all exit 0; `vite build` completes without errors.

- [ ] **Step 2: Confirm `/api/users/me` returns `plan`**

With the API running and a valid member token:

```bash
curl -s http://localhost:3001/api/users/me -H "Authorization: Bearer <token>" | head -c 400; echo
```
Expected: JSON includes `"plan":"free"`.

- [ ] **Step 3: Member-app regression (must be unchanged)**

Log in as a member and open `/latihan/wmi`, `/latihan/wmi/konsep`, and a drill. Confirm behavior is identical to before (the new marketing code shares only the read-only `WmiExplainer` and registry — no member files were modified).

- [ ] **Step 4: Responsive check**

On `/` and `/wmi`, verify mobile layout (~375px) for the promo band, demo, stat grid, and pricing card — no overflow, tap targets reachable.

- [ ] **Step 5: Final commit (if any tweaks were needed)**

```bash
git add -A
git commit -m "chore(wmi): verification fixes for Latihan WMI landing" || echo "nothing to commit"
```

---

## Self-Review — spec coverage map

| Spec requirement | Task |
|---|---|
| Home promo band (`#wmi`, after Score & Badge) | 9, 11 |
| Dedicated `/wmi` page, 9 bands, demo at #2 | 10, 11 |
| No-login live demo reusing real explainers | 4, 5 |
| Pricing layout C on Home + `/wmi`, no standalone route | 7, 11 |
| Dormant `users.plan` scaffolding, surfaced in `/me`, no gating | 1, 2 |
| True content-coverage stats endpoint + graceful UI | 3, 6 |
| Honest trust: real-olympiad framing + founder placeholder + true stats + "be first" CTA | 10 |
| Testimonials built but hidden (empty) | 8, 10 |
| Public nav "Latihan WMI" | 11 |
| Indonesian copy, Font Awesome (no emoji), QUPU brand, mobile-first | all UI tasks, 12 |
| Member app `/latihan/wmi*` unchanged | 12 (regression check) |
| Verification (typecheck/lint/build + manual) | 12 |

**Deferred-by-design (not gaps):** real founder copy, real testimonials, final tier/feature names — all editable in `src/data/wmiMarketing.ts` post-V1.
