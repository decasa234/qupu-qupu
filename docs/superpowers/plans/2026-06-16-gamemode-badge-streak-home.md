# Gamemode badge, streak page, mode-aware Home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-bar WMI/Video gamemode badge (tap to toggle), make the fire stat open a streak calendar page, and turn the bottom "Belajar" tab into a mode-aware "Home".

**Architecture:** A new per-child `learnMode` value in `wmiStore` (mirrors the existing `preferredLang` pattern) drives three surfaces — a badge in `TopStatStrip`, a mode-aware `MemberHome` wrapper mounted at `/belajar`, and the Main world-cards that set the mode. A new `/streak` page reuses the existing `GET /me/dashboard` view model (streak/longestStreak/streakShields/heatmap/todayIdx) and the existing `Heatmap` primitive — no backend change.

**Tech Stack:** React 18 + React Router 7 + Zustand (persist) + Tailwind; Vitest (node default, opt into jsdom per-file).

**Spec:** `docs/superpowers/specs/2026-06-16-gamemode-badge-streak-home-design.md`

---

## File structure

- **Modify** `src/store/wmiStore.ts` — add `learnMode` state, `setLearnMode`, per-child resolution + persistence.
- **Create** `src/store/wmiStore.test.ts` — unit test for `learnMode` resolution (jsdom).
- **Modify** `src/components/app-shell/TopStatStrip.tsx` — left mode badge (toggles); fire stat becomes a `/streak` link.
- **Create** `src/pages/StreakPage.tsx` — streak calendar + stats.
- **Modify** `src/App.tsx` — add `/streak` route; point `/belajar` at the new `MemberHome`.
- **Create** `src/pages/MemberHome.tsx` — renders `BelajarPath` (wmi) or `MemberVideos` (video) by `learnMode`.
- **Modify** `src/components/app-shell/BottomTabBar.tsx` — tab 1 → "Home"/`fa-house`; add `/streak` to Profil's active prefixes.
- **Modify** `src/pages/MainCatalog.tsx` — world cards set `learnMode` on tap.

---

## Task 1: `learnMode` state in wmiStore

**Files:**
- Modify: `src/store/wmiStore.ts`
- Create: `src/store/wmiStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/wmiStore.test.ts`:

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest'
import { useWmiStore } from './wmiStore'

describe('wmiStore learnMode', () => {
  beforeEach(() => {
    useWmiStore.setState({ activeChildKey: null, learnMode: 'wmi', learnModeByChild: {} })
  })

  test('defaults to wmi, pins per child, resolves on sync', () => {
    useWmiStore.getState().syncChildGrade('childA', 1)
    expect(useWmiStore.getState().learnMode).toBe('wmi')

    useWmiStore.getState().setLearnMode('video')
    expect(useWmiStore.getState().learnMode).toBe('video')

    // a fresh child resolves to the default
    useWmiStore.getState().syncChildGrade('childB', 1)
    expect(useWmiStore.getState().learnMode).toBe('wmi')

    // returning to childA restores its pinned mode
    useWmiStore.getState().syncChildGrade('childA', 1)
    expect(useWmiStore.getState().learnMode).toBe('video')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/store/wmiStore.test.ts`
Expected: FAIL — `setLearnMode is not a function` / `learnMode` undefined.

- [ ] **Step 3: Implement `learnMode` in the store**

In `src/store/wmiStore.ts`, add to the `WmiState` interface (next to `preferredLang`):

```ts
  // Per-child current gamemode (WMI vs Video) — persisted. Default 'wmi'.
  learnModeByChild: Record<string, 'wmi' | 'video'>
  // Resolved gamemode for the active child (mirror, not persisted).
  learnMode: 'wmi' | 'video'
  setLearnMode: (mode: 'wmi' | 'video') => void
```

Add to the initial state object (next to `preferredLang: 'en',`):

```ts
      learnModeByChild: {},
      learnMode: 'wmi',
```

Add the setter (next to `setPreferredLang`):

```ts
      setLearnMode: (mode) =>
        set((state) =>
          state.activeChildKey
            ? {
                learnMode: mode,
                learnModeByChild: { ...state.learnModeByChild, [state.activeChildKey]: mode },
              }
            : { learnMode: mode },
        ),
```

In **both** `syncChildGrade` and `adoptChildGrade`, add this line alongside the existing `preferredLang:` resolution:

```ts
          learnMode: state.learnModeByChild[childId] ?? 'wmi',
```

In `partialize`, add `learnModeByChild`:

```ts
      partialize: (state) => ({
        gradeByChild: state.gradeByChild,
        lastSubjectKeyByChild: state.lastSubjectKeyByChild,
        langByChild: state.langByChild,
        learnModeByChild: state.learnModeByChild,
      }),
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/store/wmiStore.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Typecheck + commit**

```bash
npm run check
git add src/store/wmiStore.ts src/store/wmiStore.test.ts
git commit -m "feat(store): per-child learnMode (WMI/Video) state"
```

---

## Task 2: Top-bar mode badge + fire → streak link

**Files:**
- Modify: `src/components/app-shell/TopStatStrip.tsx`

- [ ] **Step 1: Read `learnMode` + `setLearnMode` and add the badge import**

At the top of `TopStatStrip.tsx`, add the store import:

```ts
import { useWmiStore } from '../../store/wmiStore'
```

Inside the component, after the existing `const activeChildId = ...` line, add:

```ts
  const learnMode = useWmiStore((s) => s.learnMode)
  const setLearnMode = useWmiStore((s) => s.setLearnMode)
```

- [ ] **Step 2: Restructure the strip — badge left, stats grouped, fire → /streak**

Replace the returned markup's inner row (the `<div className="mx-auto flex w-full max-w-lg items-center justify-around px-3 py-2">…</div>`) with:

```tsx
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-3 py-2">
        {/* Gamemode badge — tap toggles WMI <-> Video; Main is still the full chooser. */}
        <button
          type="button"
          onClick={() => setLearnMode(learnMode === 'wmi' ? 'video' : 'wmi')}
          aria-label={
            learnMode === 'wmi'
              ? 'Mode WMI — ketuk untuk ganti ke Video'
              : 'Mode Video — ketuk untuk ganti ke WMI'
          }
          className="flex h-8 flex-shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-white px-2.5 font-display text-sm font-black text-qupu-brand-blue shadow-[0_2px_0_0_#C46123] transition-transform active:translate-y-0.5"
        >
          {learnMode === 'wmi' ? (
            <span>WMI</span>
          ) : (
            <i className="fa-solid fa-clapperboard text-base" aria-hidden="true" />
          )}
        </button>

        <div className="flex flex-1 items-center justify-around">
          <Link
            to="/streak"
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-transform active:translate-y-0.5"
            aria-label={`${streak} hari streak${shields > 0 ? `, ${shields} pelindung streak` : ''} — lihat riwayat`}
          >
            <i className="fa-solid fa-fire text-base text-qupu-brand-yellow" aria-hidden="true" />
            <span className="font-display text-sm font-extrabold text-white">{streak}</span>
            {shields > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white">
                <i className="fa-solid fa-shield-halved text-[9px] text-qupu-brand-yellow" aria-hidden="true" />
                {shields}
              </span>
            )}
          </Link>
          <Pill icon="fa-solid fa-coins" value={coins} to="/shop" label={`${coins} koin — buka toko`} />
          <Pill icon="fa-solid fa-star" value={`Lv ${level}`} to="/profil" label={`Level ${level} — lihat profil`} />
        </div>
      </div>
```

(`Link` is already imported. The `Pill` helper and `streak`/`shields`/`coins`/`level` locals are unchanged.)

- [ ] **Step 3: Typecheck + lint**

Run: `npm run check && npx eslint src/components/app-shell/TopStatStrip.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/app-shell/TopStatStrip.tsx
git commit -m "feat(app-shell): top-bar gamemode badge + fire links to streak page"
```

---

## Task 3: Streak page + route

**Files:**
- Create: `src/pages/StreakPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the streak page**

Create `src/pages/StreakPage.tsx`:

```tsx
// src/pages/StreakPage.tsx
//
// /streak — opened from the top-bar fire. Reuses the existing dashboard view
// model (GET /me/dashboard) for streak / longest / shields / heatmap, and the
// existing Heatmap primitive for the activity calendar. No backend change.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import Heatmap, { HeatmapLegend } from '../components/dashboard/primitives/Heatmap'
import { useAuthStore } from '../store/authStore'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function StreakPage() {
  useDocumentTitle('Streak')
  const activeChildId = useAuthStore((s) => s.activeChildId)
  const navigate = useNavigate()
  const [vm, setVm] = useState<DashboardViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!activeChildId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    api
      .get('/me/dashboard', { params: { childId: activeChildId } })
      .then((res) => {
        if (cancelled) return
        setVm(dashboardFromApi(res.data.data as DashboardApiResponse))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeChildId, tick])

  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[460px] pb-8">
      <div className="mb-3 flex items-center gap-3 px-1 pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl font-black leading-none text-qupu-brand-blue">Streak</h1>
      </div>

      {loading ? (
        <div className="mt-4 space-y-4" aria-hidden="true">
          <div className="h-32 animate-pulse rounded-[1.75rem] bg-qupu-peach/40" />
          <div className="h-40 animate-pulse rounded-[1.75rem] bg-qupu-peach/40" />
        </div>
      ) : error || !vm ? (
        <div className="mt-4 rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <p className="text-sm font-bold text-qupu-brand-blue">Gagal memuat streak. Periksa koneksimu.</p>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Hero */}
          <div className="rounded-[1.75rem] bg-gradient-to-br from-qupu-brand-orange to-[#D66B23] p-6 text-center text-white shadow-[0_6px_0_0_#FFD3B1]">
            <i className="fa-solid fa-fire text-4xl" aria-hidden="true" />
            <div className="mt-2 font-display text-5xl font-black leading-none">{vm.streak}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85">hari beruntun</p>
            <div className="mt-4 flex justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-sm font-black">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                {vm.longestStreak} terpanjang
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-sm font-black">
                <i className="fa-solid fa-shield-halved text-qupu-brand-yellow" aria-hidden="true" />
                {vm.streakShields} pelindung
              </span>
            </div>
          </div>

          {/* Today nudge */}
          <div className="rounded-[1.5rem] bg-white p-4 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-sm font-bold text-qupu-brand-blue">
              {vm.heatmap[vm.todayIdx] > 0 ? (
                <>
                  <i className="fa-solid fa-circle-check me-1.5 text-[#58A700]" aria-hidden="true" />
                  Sudah belajar hari ini!
                </>
              ) : (
                <>
                  <i className="fa-solid fa-seedling me-1.5 text-qupu-brand-orange" aria-hidden="true" />
                  Belum belajar hari ini — jaga streak-mu!
                </>
              )}
            </p>
          </div>

          {/* Calendar / heatmap */}
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              Aktivitas
            </p>
            <h2 className="mt-0.5 font-display text-lg font-black text-qupu-brand-blue">4 minggu terakhir</h2>
            <div className="mt-4">
              <Heatmap data={vm.heatmap} todayIdx={vm.todayIdx} />
              <HeatmapLegend />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add the route**

In `src/App.tsx`, add the import near the other page imports:

```ts
import StreakPage from './pages/StreakPage'
```

Inside the AppShell `<Route>` group (next to `<Route path="profil" …>`), add:

```tsx
            <Route path="streak" element={<StreakPage />} />
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run check && npx eslint src/pages/StreakPage.tsx src/App.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/StreakPage.tsx src/App.tsx
git commit -m "feat(streak): streak calendar + stats page at /streak"
```

---

## Task 4: Bottom bar — "Home" tab + streak active-prefix

**Files:**
- Modify: `src/components/app-shell/BottomTabBar.tsx`

- [ ] **Step 1: Relabel tab 1 and re-icon it**

In the `TABS` array, change the first entry from:

```ts
  {
    to: '/belajar',
    label: 'Belajar',
    icon: 'fa-solid fa-play',
    activePrefixes: ['/belajar', '/latihan/wmi/sesi', '/latihan/wmi/tes'],
  },
```

to:

```ts
  {
    to: '/belajar',
    label: 'Home',
    icon: 'fa-solid fa-house',
    activePrefixes: ['/belajar', '/latihan/wmi/sesi', '/latihan/wmi/tes'],
  },
```

- [ ] **Step 2: Add `/streak` to the Profil tab's active prefixes**

In the Profil tab entry, change `activePrefixes` from:

```ts
    activePrefixes: ['/profil', '/badges', '/shop', '/dashboard', '/report'],
```

to:

```ts
    activePrefixes: ['/profil', '/badges', '/shop', '/dashboard', '/report', '/streak'],
```

- [ ] **Step 3: Typecheck + commit**

```bash
npm run check
git add src/components/app-shell/BottomTabBar.tsx
git commit -m "feat(app-shell): rename Belajar tab to Home; streak under Profil"
```

---

## Task 5: Mode-aware Home wrapper

**Files:**
- Create: `src/pages/MemberHome.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the wrapper**

Create `src/pages/MemberHome.tsx`:

```tsx
// src/pages/MemberHome.tsx
//
// The bottom-bar "Home" tab (route /belajar). Renders the current gamemode's
// home: WMI -> the skill tree (BelajarPath), Video -> the video catalog/home
// (MemberVideos). Mode comes from wmiStore.learnMode (toggled by the top-bar
// badge or set by the Main world-chooser).
import { useWmiStore } from '../store/wmiStore'
import BelajarPath from './BelajarPath'
import MemberVideos from './MemberVideos'

export default function MemberHome() {
  const learnMode = useWmiStore((s) => s.learnMode)
  return learnMode === 'video' ? <MemberVideos /> : <BelajarPath />
}
```

- [ ] **Step 2: Point `/belajar` at MemberHome**

In `src/App.tsx`:
- Add the import: `import MemberHome from './pages/MemberHome'`
- Change the route element from `<Route path="belajar" element={<BelajarPathPage />} />` to `<Route path="belajar" element={<MemberHome />} />`
- Remove the now-unused `import BelajarPathPage from './pages/BelajarPath'` line (MemberHome imports BelajarPath itself).

- [ ] **Step 3: Typecheck + lint (catches the unused import)**

Run: `npm run check && npx eslint src/pages/MemberHome.tsx src/App.tsx`
Expected: no errors (no "BelajarPathPage is defined but never used").

- [ ] **Step 4: Commit**

```bash
git add src/pages/MemberHome.tsx src/App.tsx
git commit -m "feat(home): mode-aware Home (WMI skill tree / Video) at /belajar"
```

---

## Task 6: Main world-cards set the mode

**Files:**
- Modify: `src/pages/MainCatalog.tsx`

- [ ] **Step 1: Tag each world with its mode and set it on tap**

Add the store import at the top:

```ts
import { useWmiStore } from '../store/wmiStore'
```

Change the `WORLDS` constant to include a `mode`:

```ts
const WORLDS = [
  { to: '/wmi-arena', mode: 'wmi' as const, icon: 'fa-solid fa-trophy', title: 'WMI', accent: '#F59E0B' },
  { to: '/video', mode: 'video' as const, icon: 'fa-solid fa-clapperboard', title: 'Video', accent: '#6366F1' },
]
```

Inside the component, read the setter:

```ts
  const setLearnMode = useWmiStore((s) => s.setLearnMode)
```

On the world `<Link>`, add an `onClick` that sets the mode (the Link still navigates):

```tsx
          <Link
            key={world.to}
            to={world.to}
            onClick={() => setLearnMode(world.mode)}
            className="flex flex-1 items-center gap-4 rounded-[2rem] bg-white p-6 ring-2 ring-[#FFE3CC] [box-shadow:0_6px_0_#FFD3B1] transition-transform hover:-translate-y-1 active:translate-y-0.5 active:[box-shadow:0_2px_0_#FFD3B1]"
          >
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npm run check && npx eslint src/pages/MainCatalog.tsx
git add src/pages/MainCatalog.tsx
git commit -m "feat(main): selecting a world sets the gamemode"
```

---

## Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck, lint, unit tests**

Run: `npm run check && npm run lint && npx vitest run src/store/wmiStore.test.ts`
Expected: typecheck clean, no new lint errors, wmiStore test passes.

- [ ] **Step 2: Build (normal + admin-flag)**

Run: `npm run build && VITE_ADMIN_ONLY=true npm run build`
Expected: both succeed.

- [ ] **Step 3: Browser journeys (webwright, phone viewport, test account `webwright-test@example.com` / `UjiCoba123!`)**

Verify and screenshot each:
1. Top bar shows a white **WMI** badge at the left. Tap it → becomes the **clapperboard (Video)** badge and the Home tab content switches to the video catalog; tap again → back to **WMI** and the skill tree.
2. Tap the **fire** → lands on `/streak`; the page shows current streak, longest, shields, the activity calendar, and the "today" line. Back button returns.
3. Bottom tab 1 reads **Home** with a house icon; Main and Profil unchanged.
4. On **Main (Pilih Dunia)**, tapping the **Video** card sets the badge to Video; tapping **WMI** sets it back.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "test(gamemode): verification fixes"
```

---

## Notes / out of scope (do NOT build here)

- No "continue watching" for video (no watch-progress data exists).
- No buy/equip-shield UI on the streak page (display shields only).
- No change to the campur reward farmability, WMI Arena/exam, or the question-language default (stays EN-first per current `wmiStore`).
