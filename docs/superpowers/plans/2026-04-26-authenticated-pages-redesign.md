# Authenticated Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `/dashboard`, `/badges`, `/admin/videos` so they share the visual language already shipped on `/`, `/login`, `/register`, `/onboarding/child`, `/videos`, `/videos/:slug`.

**Architecture:** Pure UI restyle. No API or schema changes. Three new shared components (`PillField`, `SkeletonCard`, `Toggle`); page files re-rendered with the new token system (FontAwesome icons, dashed-orange hero borders, peach offset shadows, `text-qupu-brand-blue` headings, mascot accents). All token values are pulled from `tailwind.config.js` and the existing pages — no token additions.

**Tech Stack:** React 18 + TypeScript + React Router 7 + Tailwind 3, FontAwesome 6.5.2 (CDN, already loaded), framer-motion (already in `Reveal`).

**Verification:** This project has no test runner (per `CLAUDE.md`). Each task ends with `npm run check` + `npm run lint`. The final task runs `npm run build`.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/components/PillField.tsx` | Create | Shared rounded-full text input with icon and optional helper. Replaces inline copies in `Login.tsx`, `Register.tsx`, and the legacy `AdminInput` in `AdminVideos.tsx`. |
| `src/components/SkeletonCard.tsx` | Create | Brand-tokened loading placeholder (white card, dashed orange border, animate-pulse, peach offset shadow). Used by Dashboard and Badges loading states. |
| `src/components/Toggle.tsx` | Create | Pill-shaped on/off toggle with icon. Admin-only. Replaces the legacy `ToggleRow` in `AdminVideos.tsx`. |
| `src/pages/Login.tsx` | Modify | Drop local `PillField` definition; import from new shared component. |
| `src/pages/Register.tsx` | Modify | Drop local `PillField` definition; import from new shared component. |
| `src/pages/Dashboard.tsx` | Modify | Restyle to new tokens. Add mascot to header, FA icons to summary cards, AuthCard wrap on empty state, SkeletonCard on loading. |
| `src/pages/Badges.tsx` | Modify | Restyle to new tokens. Add mascot to header, FA icons throughout, Tier 3 yellow stars, AuthCard wrap on empty state, SkeletonCard on loading. |
| `src/pages/AdminVideos.tsx` | Modify | New hero header with mascot. Form card uses inner card token + section icons. Inputs use `PillField`; toggles use `Toggle`. Buttons use brand CTA shapes. List rows restyled. Toast banner restyled. |

---

## Token Reference (used throughout)

Engineers should copy these classnames verbatim — they match the public-pages redesign exactly.

- **Header (hero) card:** `relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10`
- **Inner content card:** `rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]`
- **Eyebrow text:** `text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange`
- **Page title:** `font-display text-4xl font-bold text-qupu-brand-blue` (sm: `text-5xl` if ample room)
- **Subtitle:** `mt-3 max-w-2xl text-base font-medium text-qupu-muted`
- **Navy CTA (primary):** `inline-flex items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60`
- **Orange CTA (primary alt):** `inline-flex items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0`
- **Outline orange CTA (secondary):** `inline-flex items-center justify-center gap-3 rounded-full border-[3px] border-qupu-brand-orange bg-transparent px-6 py-[10px] font-display text-base font-extrabold text-qupu-brand-orange transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-brand-orange hover:text-white`
- **Corner star (decoration):** `fa-solid fa-star pointer-events-none absolute … text-xl text-qupu-brand-yellow drop-shadow-sm` — place 4 inside hero card at `left-5 top-5`, `right-5 top-5`, `left-5 bottom-5`, `right-5 bottom-5`
- **Mascot peek (right column of hero):** `<img src="/achievement-left.png" … className="pointer-events-none absolute -right-6 -top-4 hidden h-40 w-auto select-none drop-shadow-[0_18px_30px_rgba(120,60,0,0.18)] sm:block lg:h-48" />` (asset varies per page)

---

## Task 1: Extract `PillField` to shared component

**Files:**
- Create: `src/components/PillField.tsx`
- Modify: `src/pages/Login.tsx` (lines ~107-143)
- Modify: `src/pages/Register.tsx` (lines ~113-149)

- [ ] **Step 1: Create the shared component**

Write `src/components/PillField.tsx`:

```tsx
type PillFieldProps = {
  label: string
  icon: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  helper?: string
  name?: string
  autoComplete?: string
}

export default function PillField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helper,
  name,
  autoComplete,
}: PillFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <i
          className={`${icon} pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted`}
          aria-hidden="true"
        />
        <input
          type={type}
          value={value}
          name={name}
          autoComplete={autoComplete}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </div>
      {helper && <div className="mt-2 text-xs font-semibold text-qupu-muted">{helper}</div>}
    </label>
  )
}
```

- [ ] **Step 2: Update `src/pages/Login.tsx`**

At the top of the file add the import:

```tsx
import PillField from '../components/PillField'
```

Delete the local `function PillField(...)` definition (last function in the file). The default-exported component already references `PillField` by name, so no other change is needed.

- [ ] **Step 3: Update `src/pages/Register.tsx`**

Same pattern as Login: add `import PillField from '../components/PillField'` at the top, delete the local `function PillField(...)` definition.

- [ ] **Step 4: Verify**

Run:
```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PillField.tsx src/pages/Login.tsx src/pages/Register.tsx
git commit -m "refactor: extract PillField to shared component"
```

---

## Task 2: Create `SkeletonCard`

**Files:**
- Create: `src/components/SkeletonCard.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/SkeletonCard.tsx`:

```tsx
type SkeletonCardProps = {
  className?: string
  height?: string
}

export default function SkeletonCard({
  className = '',
  height = 'h-96',
}: SkeletonCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/40 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] ${className}`}
    >
      <div className={`${height} w-full animate-pulse rounded-[2rem] bg-qupu-cream`} />
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/SkeletonCard.tsx
git commit -m "feat: add SkeletonCard loading placeholder"
```

---

## Task 3: Create `Toggle`

**Files:**
- Create: `src/components/Toggle.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/Toggle.tsx`:

```tsx
type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  iconOn: string
  iconOff: string
  helper?: string
}

export default function Toggle({
  label,
  checked,
  onChange,
  iconOn,
  iconOff,
  helper,
}: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] bg-qupu-shell px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            checked ? 'bg-qupu-brand-yellow text-qupu-brand-blue' : 'bg-white text-qupu-muted'
          }`}
        >
          <i className={`${checked ? iconOn : iconOff} text-base`} aria-hidden="true" />
        </span>
        <div>
          <div className="font-display text-base font-bold text-qupu-brand-blue">{label}</div>
          {helper && <div className="text-xs font-semibold text-qupu-muted">{helper}</div>}
        </div>
      </div>
      <span className="relative inline-flex h-7 w-12 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? 'bg-qupu-brand-orange' : 'bg-qupu-peach'
          }`}
        />
        <span
          className={`relative ml-1 inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Toggle.tsx
git commit -m "feat: add Toggle pill switch component"
```

---

## Task 4: Restyle Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx` (full rewrite)

Goal: replace lucide icons with FontAwesome, swap card tokens, wrap content in `<Reveal>`, add mascot to header, restyle empty state with `AuthCard`, replace loading skeleton with `SkeletonCard`.

- [ ] **Step 1: Rewrite `src/pages/Dashboard.tsx`**

Replace the entire file with:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import type { MemberProgress } from '../types'

const SUMMARY_ICONS = {
  attempts: 'fa-solid fa-list-check',
  average: 'fa-solid fa-percent',
  videos: 'fa-solid fa-circle-check',
  badges: 'fa-solid fa-medal',
} as const

export default function DashboardPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        const response = await api.get('/me/progress', {
          params: { childId: activeChildId },
        })
        setProgress(response.data.data as MemberProgress)
      } catch (loadError) {
        console.error('Failed to load dashboard:', loadError)
        setError('Gagal memuat dashboard.')
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
        eyebrow="Dashboard"
        title="Pilih profil anak dulu"
        subtitle="Gunakan switcher di navbar untuk menambahkan atau memilih profil anak. Setiap anak punya progres dan badge sendiri."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <i className="fa-solid fa-user-plus text-base text-qupu-brand-blue" aria-hidden="true" />
          </span>
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return <SkeletonCard />
  }

  if (error || !progress) {
    return (
      <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error || 'Gagal memuat dashboard.'}
      </div>
    )
  }

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
                Pantau video yang sudah dikerjakan, lihat badge terbaru, lalu lanjutkan ke tantangan berikutnya. Ganti profil di navbar untuk lihat progres anak lainnya.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryCard icon={SUMMARY_ICONS.attempts} title="Attempt tersimpan" value={progress.summary.attemptsCount} />
              <SummaryCard icon={SUMMARY_ICONS.average} title="Rata-rata skor" value={`${progress.summary.averageScore}%`} />
              <SummaryCard icon={SUMMARY_ICONS.videos} title="Video selesai" value={progress.summary.videosCompleted} />
              <SummaryCard icon={SUMMARY_ICONS.badges} title="Badge kebuka" value={progress.summary.badgesUnlocked} />
            </div>
          </div>
        </section>
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Reveal delay={0.05}>
            <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                    Aktivitas terbaru
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">Recent attempts</h2>
                </div>
                <Link
                  to="/badges"
                  className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
                >
                  Semua badge
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
                </Link>
              </div>

              {progress.recentAttempts.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">
                  Belum ada attempt tersimpan untuk {activeChild.name}. Buka halaman Video dan pilih kuis.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {progress.recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="rounded-[1.5rem] bg-qupu-shell px-5 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-bold text-qupu-brand-blue">{attempt.videoTitle}</div>
                          <div className="text-sm font-medium text-qupu-muted">
                            {attempt.correctAnswers}/{attempt.totalQuestions} benar • {formatDateLabel(attempt.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                            style={{ backgroundColor: attempt.subjectColorHex }}
                          >
                            {attempt.subjectName}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-orange shadow-soft">
                            {attempt.scorePercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                Best progress
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">Best per video</h2>
              {progress.videoProgress.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">
                  Belum ada video yang dikerjakan {activeChild.name}.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {progress.videoProgress.map((item) => (
                    <Link
                      key={item.videoId}
                      to={`/videos/${item.videoSlug}`}
                      className="cursor-pointer rounded-[1.5rem] border-2 border-transparent bg-qupu-shell px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-qupu-brand-orange/40"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-bold text-qupu-brand-blue">{item.videoTitle}</div>
                          <div className="text-sm font-medium text-qupu-muted">
                            Best score {item.bestScore}% • terakhir {formatDateLabel(item.latestAttemptAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.unlockedTier ? (
                            <span
                              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                              style={{ backgroundColor: item.unlockedTier.colorHex }}
                            >
                              {item.unlockedTier.familyName} • Tier {item.unlockedTier.tier}
                            </span>
                          ) : (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
                              belum unlock
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
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

              <div className="mt-5 rounded-[1.5rem] bg-qupu-shell px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-qupu-brand-orange shadow-soft">
                    <i className="fa-solid fa-award text-base" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold text-qupu-brand-blue">Tier 3 unlocks</div>
                    <div className="text-sm font-medium text-qupu-muted">
                      {activeChild.name} sudah membuka {progress.summary.tierThreeUnlocks} badge tertinggi.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm font-medium text-qupu-muted">
                Ingin lihat progres anak lain? Ganti profil dari switcher di navbar.
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: string
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.75rem] bg-qupu-shell px-5 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-qupu-brand-orange shadow-soft">
          <i className={`${icon} text-base`} aria-hidden="true" />
        </span>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{title}</div>
      </div>
      <div className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue">{value}</div>
    </div>
  )
}
```

Note: the new file no longer imports `lucide-react`. The lucide package stays in `package.json` because `Navbar.tsx` still uses it.

- [ ] **Step 2: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: redesign Dashboard with brand tokens and mascot header"
```

---

## Task 5: Restyle Badges

**Files:**
- Modify: `src/pages/Badges.tsx` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/Badges.tsx`**

Replace the entire file with:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import type { BadgeUnlockFamily } from '../types'

const TIER_ICON: Record<string, string> = {
  Sparkles: 'fa-solid fa-star',
  Star: 'fa-solid fa-trophy',
  Crown: 'fa-solid fa-crown',
}

export default function BadgesPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [families, setFamilies] = useState<BadgeUnlockFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeChildId) {
      setFamilies([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get('/me/badges', {
          params: { childId: activeChildId },
        })
        setFamilies(response.data.data.families ?? [])
      } catch (loadError) {
        console.error('Failed to load badges:', loadError)
        setError('Gagal memuat badge.')
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
        eyebrow="Badge"
        title="Pilih profil anak dulu"
        subtitle="Badge dikumpulkan per anak. Pilih profil dari switcher di navbar untuk lihat koleksi badge-nya."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <i className="fa-solid fa-user-plus text-base text-qupu-brand-orange" aria-hidden="true" />
          </span>
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return <SkeletonCard />
  }

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
                Badge {activeChild.name}
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
                Semua reward QUPU yang sudah {activeChild.name} buka.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
                Badge dikumpulkan per family. Tiap video bisa menaikkan tier kalau hasilnya lebih baik. Ganti profil di navbar untuk lihat koleksi anak lain.
              </p>
            </div>

            <div className="relative hidden h-44 lg:block">
              <img
                src="/achievement-right.png"
                alt=""
                draggable={false}
                className="pointer-events-none absolute -right-6 -top-4 h-48 w-auto select-none drop-shadow-[0_18px_30px_rgba(120,60,0,0.18)]"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">{error}</div>
      )}

      {families.length === 0 ? (
        <Reveal delay={0.05}>
          <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-10 text-center shadow-[5px_6px_0_0_#FFD3B1]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-medal text-xl" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-qupu-brand-blue">Belum ada badge</h2>
            <p className="mt-2 text-sm font-medium text-qupu-muted">
              {activeChild.name} belum membuka badge apa pun. Selesaikan kuis di halaman Video.
            </p>
            <Link
              to="/videos"
              className="mt-5 inline-flex items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <i className="fa-solid fa-compass text-base text-qupu-brand-orange" aria-hidden="true" />
              </span>
              Jelajahi video
            </Link>
          </section>
        </Reveal>
      ) : (
        <div className="grid gap-6">
          {families.map((family, familyIndex) => (
            <Reveal key={family.id} delay={0.05 + familyIndex * 0.05}>
              <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                      style={{ backgroundColor: family.colorHex }}
                    >
                      <i className="fa-solid fa-medal" aria-hidden="true" />
                      {family.name}
                    </div>
                    <h2 className="mt-3 font-display text-3xl font-bold text-qupu-brand-blue">
                      {family.unlocks.length} unlock tersimpan
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {family.unlocks.map((unlock) => {
                    const iconClass = TIER_ICON[unlock.iconName] ?? 'fa-solid fa-star'
                    const isTopTier = unlock.tier === 3

                    return (
                      <div
                        key={unlock.tierId + unlock.videoId}
                        className="relative rounded-[1.5rem] bg-qupu-shell px-5 py-4"
                      >
                        {isTopTier && (
                          <>
                            <i
                              className="fa-solid fa-star pointer-events-none absolute -left-2 -top-2 text-base text-qupu-brand-yellow drop-shadow-sm"
                              aria-hidden="true"
                            />
                            <i
                              className="fa-solid fa-star pointer-events-none absolute -right-2 -top-3 text-sm text-qupu-brand-yellow drop-shadow-sm"
                              aria-hidden="true"
                            />
                          </>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-soft"
                              style={{ backgroundColor: unlock.colorHex }}
                            >
                              <i className={`${iconClass} text-base`} aria-hidden="true" />
                            </span>
                            <div>
                              <div className="font-bold text-qupu-brand-blue">{unlock.videoTitle}</div>
                              <div className="text-sm font-medium text-qupu-muted">
                                Tier {unlock.tier} • {unlock.tierName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs font-medium text-qupu-muted">
                            <div className="uppercase tracking-[0.18em]">Unlock</div>
                            <div className="font-semibold text-qupu-brand-blue">{formatDateLabel(unlock.unlockedAt)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
```

The new file no longer imports `lucide-react`.

- [ ] **Step 2: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Badges.tsx
git commit -m "feat: redesign Badges page with mascot header and tier 3 stars"
```

---

## Task 6: AdminVideos header card and outer shells

**Files:**
- Modify: `src/pages/AdminVideos.tsx` (header section, container divs, loading skeleton)

This task only restyles the page-level shell. Inputs, toggles, buttons, and list rows are handled in Tasks 7 and 8 to keep diffs reviewable.

- [ ] **Step 1: Replace the lucide imports**

In `src/pages/AdminVideos.tsx`, replace:

```tsx
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
```

with:

```tsx
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
```

(Lucide icons will be removed in later tasks; remaining usages will become unused references. They'll be deleted in Tasks 7 and 8 as we touch each block.)

- [ ] **Step 2: Replace the page header section**

Find the existing header (around lines 168-177):

```tsx
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-6 shadow-soft sm:p-8">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Admin</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">
          Video catalog dan badge rule QUPU
        </h1>
        <p className="mt-3 max-w-2xl text-qupu-muted">
          Tambah video baru, edit metadata, dan atur tier badge per video tanpa menyentuh database manual.
        </p>
      </section>
```

Replace with:

```tsx
      <Reveal>
        <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
          <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute left-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                Admin · Videos
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
                Kelola video QUPU
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
                Tambah video baru, edit metadata, dan atur tier badge per video tanpa menyentuh database manual.
              </p>
            </div>

            <div className="relative hidden h-44 lg:block">
              <img
                src="/hero-mascot.png"
                alt=""
                draggable={false}
                className="pointer-events-none absolute -right-6 -top-4 h-48 w-auto select-none drop-shadow-[0_18px_30px_rgba(120,60,0,0.18)]"
              />
            </div>
          </div>
        </section>
      </Reveal>
```

- [ ] **Step 3: Restyle the editor outer card and "Form baru" button**

Find (around lines 180-196):

```tsx
        <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-qupu-orange">Editor</div>
              <h2 className="font-display text-3xl font-bold text-qupu-purple">
                {editingId ? 'Edit video' : 'Tambah video'}
              </h2>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 text-sm font-bold text-qupu-purple"
            >
              <Plus className="h-4 w-4" />
              Form baru
            </button>
          </div>
```

Replace with:

```tsx
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                Editor
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">
                {editingId ? 'Edit video' : 'Tambah video'}
              </h2>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-transparent px-4 py-[6px] font-display text-sm font-extrabold text-qupu-brand-orange transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-brand-orange hover:text-white"
            >
              <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
              Form baru
            </button>
          </div>
```

- [ ] **Step 4: Restyle the catalog outer card and skeleton**

Find (around lines 329-333):

```tsx
        <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
          <div className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-qupu-orange">Catalog</div>
          {loading ? (
            <div className="h-64 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
          ) : (
```

Replace with:

```tsx
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            <i className="fa-solid fa-rectangle-list" aria-hidden="true" />
            Catalog
          </div>
          {loading ? (
            <SkeletonCard height="h-64" />
          ) : (
```

- [ ] **Step 5: Verify**

```bash
npm run check && npm run lint
```
Expected: typecheck passes; lint may report unused `Pencil`, `Save`, `Trash2` imports — that's fine for now (Step 1 already removed them). If lint fails, double-check Step 1 was applied.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminVideos.tsx
git commit -m "feat: redesign AdminVideos hero header and outer cards"
```

---

## Task 7: AdminVideos inputs, badge rule rows, and toggles

**Files:**
- Modify: `src/pages/AdminVideos.tsx` (inputs, selects, badge rule editor, toggles)

This task swaps the legacy `AdminInput`, `AdminSelect`, and `ToggleRow` for the new shared components and restyles the badge rule editor.

- [ ] **Step 1: Add the new imports**

In `src/pages/AdminVideos.tsx`, after the existing component imports added in Task 6, add:

```tsx
import PillField from '../components/PillField'
import Toggle from '../components/Toggle'
```

- [ ] **Step 2: Replace `AdminInput` usages with `PillField`**

Find every `<AdminInput …/>` call in the file (there are about 9). Replace each with a `<PillField …/>` call using the same props plus an `icon` prop. Use these icon mappings:

| Field | Icon |
|---|---|
| Judul video | `fa-solid fa-film` |
| Slug | `fa-solid fa-link` |
| YouTube URL | `fa-brands fa-youtube` |
| Thumbnail URL | `fa-solid fa-image` |
| Jumlah soal | `fa-solid fa-list-ol` |
| Sort order | `fa-solid fa-sort` |
| Min benar / Max benar | `fa-solid fa-hashtag` |

Example — replace:

```tsx
            <AdminInput label="Judul video" value={form.title} onChange={(value) => setForm((state) => ({ ...state, title: value }))} />
```

with:

```tsx
            <PillField icon="fa-solid fa-film" label="Judul video" value={form.title} onChange={(value) => setForm((state) => ({ ...state, title: value }))} />
```

For the `helper` prop (Slug preview, Max benar tier 3 hint), pass it through unchanged — `PillField` accepts `helper`. For `type="number"` fields, pass `type="number"` through.

- [ ] **Step 3: Replace `AdminSelect` with a new inline pill select**

`PillField` is for text inputs only. Add a small new helper at the bottom of `src/pages/AdminVideos.tsx`, after the `ToggleRow` (which Task 7 Step 5 will delete) and after other helpers:

```tsx
function PillSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <i
          className={`${icon} pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted`}
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-chevron-down pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-qupu-muted"
          aria-hidden="true"
        />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}
```

Then replace every `<AdminSelect …/>` call with `<PillSelect …/>` plus the appropriate `icon`:

| Select | Icon |
|---|---|
| Subject | `fa-solid fa-book` |
| Age group | `fa-solid fa-children` |
| Difficulty | `fa-solid fa-gauge-high` |
| Badge family | `fa-solid fa-medal` |

Example — replace:

```tsx
              <AdminSelect
                label="Subject"
                value={form.subjectId}
                onChange={(value) => setForm((state) => ({ ...state, subjectId: value }))}
                options={subjectOptions.map((subject) => ({ value: subject.id, label: subject.name }))}
              />
```

with:

```tsx
              <PillSelect
                icon="fa-solid fa-book"
                label="Subject"
                value={form.subjectId}
                onChange={(value) => setForm((state) => ({ ...state, subjectId: value }))}
                options={subjectOptions.map((subject) => ({ value: subject.id, label: subject.name }))}
              />
```

- [ ] **Step 4: Restyle the description textarea**

Find:

```tsx
            <label className="block">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">Deskripsi</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none focus:border-qupu-orange"
              />
            </label>
```

Replace with:

```tsx
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Deskripsi</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
              />
            </label>
```

- [ ] **Step 5: Restyle the badge rule editor**

Find the `<div className="grid gap-4 rounded-[1.5rem] bg-qupu-shell p-4">` block (the badge rules editor). Replace the whole block with:

```tsx
            <div className="grid gap-4 rounded-[1.75rem] bg-qupu-shell p-5">
              <div className="flex items-center gap-2 font-display text-base font-extrabold text-qupu-brand-blue">
                <i className="fa-solid fa-medal text-qupu-brand-orange" aria-hidden="true" />
                Rule badge per tier
              </div>
              {form.badgeRules.map((rule, index) => {
                const tierColor =
                  rule.tier === 1
                    ? 'bg-qupu-brand-blue text-white'
                    : rule.tier === 2
                    ? 'bg-qupu-brand-orange text-white'
                    : 'bg-qupu-brand-yellow text-qupu-brand-blue'

                return (
                  <div
                    key={rule.tier}
                    className="grid items-end gap-3 rounded-[1.5rem] bg-white p-4 sm:grid-cols-[auto_1fr_1fr]"
                  >
                    <span
                      className={`inline-flex h-12 items-center justify-center rounded-full px-4 font-display text-sm font-extrabold uppercase tracking-[0.16em] ${tierColor}`}
                    >
                      Tier {rule.tier}
                    </span>
                    <PillField
                      icon="fa-solid fa-hashtag"
                      label="Min benar"
                      type="number"
                      value={String(rule.minCorrect)}
                      onChange={(value) =>
                        setForm((state) => ({
                          ...state,
                          badgeRules: state.badgeRules.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, minCorrect: Number(value) } : item,
                          ),
                        }))
                      }
                    />
                    <PillField
                      icon="fa-solid fa-hashtag"
                      label="Max benar"
                      type="number"
                      value={rule.maxCorrect === null ? '' : String(rule.maxCorrect)}
                      onChange={(value) =>
                        setForm((state) => ({
                          ...state,
                          badgeRules: state.badgeRules.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, maxCorrect: value === '' ? null : Number(value) }
                              : item,
                          ),
                        }))
                      }
                      helper={rule.tier === 3 ? 'Kosongkan untuk tier terakhir tanpa batas.' : undefined}
                    />
                  </div>
                )
              })}
            </div>
```

- [ ] **Step 6: Replace `ToggleRow` usages with the new `Toggle` component**

Find:

```tsx
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow
                label="Publish video"
                checked={form.isPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
              />
              <ToggleRow
                label="Featured di landing"
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
              />
            </div>
```

Replace with:

```tsx
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Publish video"
                helper="Tampil di katalog publik."
                checked={form.isPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
                iconOn="fa-solid fa-eye"
                iconOff="fa-solid fa-eye-slash"
              />
              <Toggle
                label="Featured di landing"
                helper="Muncul di home Video Terbaru."
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
                iconOn="fa-solid fa-star"
                iconOff="fa-regular fa-star"
              />
            </div>
```

- [ ] **Step 7: Delete the now-unused legacy helpers**

At the bottom of the file, delete the entire `function AdminInput(...)`, `function AdminSelect(...)`, and `function ToggleRow(...)` definitions.

- [ ] **Step 8: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass.

- [ ] **Step 9: Commit**

```bash
git add src/pages/AdminVideos.tsx
git commit -m "feat: restyle AdminVideos form inputs, badge rules, and toggles"
```

---

## Task 8: AdminVideos message banner, Save CTA, and catalog rows

**Files:**
- Modify: `src/pages/AdminVideos.tsx` (toast message, submit button, video list rows, action buttons)

- [ ] **Step 1: Replace the inline message banner**

Find:

```tsx
            {message && (
              <div className="rounded-[1.25rem] bg-qupu-cream px-4 py-3 text-sm font-semibold text-qupu-purple">
                {message}
              </div>
            )}
```

Replace with:

```tsx
            {message && (
              <div
                className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold ${
                  message.toLowerCase().startsWith('gagal')
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <i
                  className={`${
                    message.toLowerCase().startsWith('gagal')
                      ? 'fa-solid fa-triangle-exclamation'
                      : 'fa-solid fa-circle-check'
                  } text-base`}
                  aria-hidden="true"
                />
                {message}
              </div>
            )}
```

- [ ] **Step 2: Restyle the submit button**

Find:

```tsx
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-purple px-5 py-4 text-base font-bold text-white transition-colors hover:bg-qupu-purple-dark disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : editingId ? 'Update video' : 'Buat video'}
            </button>
```

Replace with:

```tsx
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <i className="fa-solid fa-floppy-disk text-base text-qupu-brand-blue" aria-hidden="true" />
              </span>
              {saving ? 'Menyimpan...' : editingId ? 'Update video' : 'Buat video'}
            </button>
```

- [ ] **Step 3: Restyle the catalog rows**

Find the `videos.map((video) => (...))` block (around lines 335-382) — the row rendering inside the catalog card. Replace the entire mapped element (the `<div key={video.id} className="rounded-[1.5rem] bg-qupu-shell p-4">…</div>`) with:

```tsx
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-[1.75rem] border-2 border-transparent bg-qupu-shell p-4 transition-colors hover:border-qupu-brand-orange/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-[1.25rem] border-2 border-qupu-peach">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                          <span
                            className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                              video.isPublished
                                ? 'bg-emerald-500 text-white'
                                : 'bg-qupu-muted text-white'
                            }`}
                          >
                            <i
                              className={
                                video.isPublished
                                  ? 'fa-solid fa-circle-check'
                                  : 'fa-solid fa-circle-pause'
                              }
                              aria-hidden="true"
                            />
                            {video.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                              style={{ backgroundColor: video.subject.colorHex }}
                            >
                              {video.subject.name}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-qupu-brand-blue">
                              {video.ageGroup.name}
                            </span>
                          </div>
                          <div className="mt-2 font-display text-base font-extrabold text-qupu-brand-blue">
                            {video.title}
                          </div>
                          <div className="mt-1 text-sm font-medium text-qupu-muted">
                            {video.badgeFamily.name} • {video.numberOfQuestions} soal
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(video)}
                          className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <i className="fa-solid fa-pencil text-xs" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(video.id)}
                          className="inline-flex items-center gap-2 rounded-full border-[3px] border-red-500 bg-transparent px-4 py-[6px] font-display text-sm font-extrabold text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white"
                        >
                          <i className="fa-solid fa-trash text-xs" aria-hidden="true" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
```

- [ ] **Step 4: Verify**

```bash
npm run check && npm run lint
```
Expected: both pass. The lucide imports were already removed in Task 6 Step 1, so no unused-imports warning should appear.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminVideos.tsx
git commit -m "feat: restyle AdminVideos message, submit button, and catalog rows"
```

---

## Task 9: End-to-end verification

**Files:** none modified.

- [ ] **Step 1: Typecheck**

Run:
```bash
npm run check
```
Expected: clean.

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: `ESLint: No issues found`.

- [ ] **Step 3: Production build**

Run:
```bash
npm run build
```
Expected: `vite build` finishes successfully; CSS and JS bundle sizes reported; no errors.

- [ ] **Step 4: Smoke walk (manual)**

Start the dev server:
```bash
npm run dev
```

Walk these pages, watching for visual regressions:
1. `/login` — PillField still works (was refactored in Task 1).
2. `/register` — PillField still works.
3. `/dashboard` — header card with mascot, summary tiles with FA icons, recent attempts and best-per-video panels render, profile sidebar shows tier 3 unlocks copy.
4. `/dashboard` (no active child) — empty state uses AuthCard with mascot.
5. `/badges` — header card with mascot, family cards render, Tier 3 unlocks show overlapping yellow stars.
6. `/badges` (no active child) — empty state uses AuthCard.
7. `/admin/videos` — hero header with mascot. Form: PillFields focus orange, PillSelects show chevron, badge rules show colored tier chips, toggles slide and swap icons. Save button uses navy CTA. Catalog rows show live/draft badge over thumbnail; Edit/Hapus pills work.

If any page fails to load, check the browser console for missing imports or runtime errors and fix before declaring success.

- [ ] **Step 5: No commit**

This task verifies; nothing to commit.

---

## Self-Review (controller)

**Spec coverage:**
- Token mapping (text, icons, header, inner card, eyebrow, etc.) — applied in every page restyle (Tasks 4, 5, 6).
- Per-page restyles (Dashboard, Badges, AdminVideos) — Tasks 4, 5, 6/7/8.
- `SkeletonCard` — Task 2, used by Dashboard (Task 4) and Badges (Task 5) and AdminVideos catalog (Task 6).
- `AuthCard` reuse for empty states — Task 4 (Dashboard) and Task 5 (Badges).
- `PillField` extraction — Task 1, also drives Login/Register imports.
- `Toggle` component — Task 3, used by AdminVideos (Task 7).
- AdminVideos toggles, badge rule color chips, message banner success/error, list row live/draft badge — Tasks 7 and 8.
- Verification — Task 9 covers `check` + `lint` + `build` + manual smoke.

**Placeholder scan:** No "TBD", "TODO", "implement later", or hand-wavy steps. Every code-changing step has the exact code or the exact replacement text. Empty-state copy is filled in. Toast banner heuristic ("starts with `gagal`") is concrete and matches the existing message strings (`Gagal menyimpan video.`, `Gagal menghapus video.`).

**Type consistency:** `PillField` props (`label`, `icon`, `value`, `onChange`, `placeholder`, `type`, `required`, `helper`) are used the same way in Tasks 1, 4, 7, and 8. `Toggle` props (`label`, `checked`, `onChange`, `iconOn`, `iconOff`, `helper`) are introduced in Task 3 and used identically in Task 7. `SkeletonCard` accepts `className` and `height`; default height `h-96` is used by Dashboard/Badges (Task 4, 5) and explicit `height="h-64"` is used by AdminVideos catalog (Task 6).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-26-authenticated-pages-redesign.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task with two-stage review (spec compliance + code quality). Same workflow used for the public-pages redesign.
2. **Inline Execution** — execute tasks in this session with checkpoints between each.

Which approach?
