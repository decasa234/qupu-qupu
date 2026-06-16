# Gamemode badge, streak page, mode-aware Home

**Date:** 2026-06-16 · **Branch:** `claude-mythos-optimization` · **Status:** Approved, awaiting plan
**Source:** Founder feedback (2026-06-16) on the member top bar + bottom bar.

## Goals (founder's words, distilled)

1. Add a left-most **gamemode badge** to the top bar showing the child's current mode (Duolingo's "country flag" idea). WMI → a "WMI" text chip; Video → a clapperboard icon.
2. The **fire/streak** stat becomes tappable → a dedicated **streak page** (calendar of active days).
3. The bottom-bar **Belajar** tab becomes **Home** (house icon) and shows *what the child is currently learning* — i.e. mode-aware.

## Decisions (from brainstorming)

- **Keep the Main tab** (Pilih Dunia world-chooser) as-is.
- **Home is mode-aware**: WMI → the skill tree (today's BelajarPath); Video → the video home.
- **Streak view = a calendar + stats page** (dedicated route).
- **Badge tap = quick toggle** WMI↔Video (one tap, Home updates instantly). The Main tab remains the full chooser, so no long-press is needed.
- **Daily-goal line** included on the streak page (a small "today" nudge).
- **Deferred** (explicitly out of scope here): "continue watching" for video (no watch-progress data today), a buy/equip-shield affordance on the streak page, and the campur reward-farmability fix.

## 1. `learnMode` state (backbone)

Add to `src/store/wmiStore.ts`, mirroring the `preferredLang` pattern exactly:

- `learnModeByChild: Record<string, 'wmi' | 'video'>` — persisted (added to `partialize`).
- `learnMode: 'wmi' | 'video'` — resolved mirror for the active child (not persisted). Default `'wmi'`.
- `setLearnMode(mode)` — sets `learnMode` and pins `learnModeByChild[activeChildKey]`.
- Resolve `learnMode: state.learnModeByChild[childId] ?? 'wmi'` inside both `syncChildGrade` and `adoptChildGrade` (same spot the lang is resolved).

A `toggleLearnMode()` convenience (flips wmi↔video via `setLearnMode`) is optional; the badge can compute the next value inline.

## 2. Top-bar mode badge

`src/components/app-shell/TopStatStrip.tsx` gains a left-pinned `ModeBadge`:

- Chip style: a **white rounded chip** (`bg-white`, `rounded-[12px]`, the same chiclet language as the in-button white icon chips) with **brand-blue** content, on the orange bar.
- `wmi` → bold "WMI" text; `video` → `fa-clapperboard` icon (same chip).
- `aria-label`: "Mode: WMI — ketuk untuk ganti ke Video" (and vice-versa).
- **onClick** = `setLearnMode(learnMode === 'wmi' ? 'video' : 'wmi')` (toggle in place; no navigation). A short `tapPop`/scale feedback on press.
- Layout: the strip becomes `flex items-center` with the badge pinned left and the existing three stat pills in a right-aligned group (keep their spacing). Keep `data-app-topbar` on the root (the focus-scroll math depends on it).

The badge reads `learnMode` from `wmiStore` (selector) — no new fetch.

## 3. Fire → streak page

- In `TopStatStrip`, the streak (fire) item becomes a `Link to="/streak"` (keep the flame + count + shield sub-pill rendering; just make it navigable). `aria-label`: "Lihat riwayat streak".
- New route `/streak` in `src/App.tsx`, inside `<AppShell>` under `ProtectedRoute` (same group as `/belajar`). Bottom tab highlight: add `/streak` to the **Profil** tab's `activePrefixes` (it's a stats surface, like `/dashboard`).

### Streak page (`src/pages/StreakPage.tsx`)

Mobile-first, qupu-ui styling, AppShell column. Data via existing endpoints — **no backend change**:

- `fetchGamificationSummary(childId)` → `streak` (current), `longestStreak`, `streakShields`.
- the existing dashboard fetch (`src/lib/dashboardData.ts`, the one the Statistik/Dashboard page uses) → `heatmap: number[]` (per-day activity counts, most-recent last) for the calendar.

Layout (top→bottom):
1. Header: back button (`navigate(-1)` / `/profil` fallback) + title "Streak".
2. Hero: big flame + current-streak number ("X hari beruntun"); a row of chips: longest streak (`fa-trophy`), shields owned (`fa-shield-halved`).
3. **Calendar/heatmap**: render the `heatmap` array as a grid of recent days aligned to weekday columns (index → date by offset from today; active day = count > 0, tinted by intensity, today ringed). Reuse the existing dashboard heatmap rendering approach (extract a small shared `ActivityCalendar` component if the Dashboard's heatmap is inline, so both surfaces share it).
4. A small **"Hari ini"** line: today's activity vs daily goal (from the dashboard view-model's goal/quest data) — a one-line "x/у hari ini" nudge. If the goal figure isn't cheaply available, show today's count only.
5. Loading skeleton + an error retry card (match the existing path/session patterns).

## 4. Bottom bar — Home (mode-aware)

`src/components/app-shell/BottomTabBar.tsx`:
- Tab 1: label **"Home"**, icon `fa-solid fa-house` (was "Belajar" / `fa-play`). Route stays `/belajar`; `activePrefixes` unchanged (`/belajar`, `/latihan/wmi/sesi`, `/latihan/wmi/tes`).

Home content is mode-aware. Add a thin `src/pages/HomeRoute.tsx` rendered at `/belajar`:
- `learnMode === 'wmi'` → `<BelajarPath/>` (unchanged skill tree).
- `learnMode === 'video'` → the **video home** (see §5).

`BelajarPath` itself is unchanged; `HomeRoute` is the new switch. The `/belajar` route in `App.tsx` renders `<HomeRoute/>` instead of `<BelajarPath/>`.

## 5. Video home

When `learnMode === 'video'`, Home renders the existing member video catalog (`src/pages/Videos.tsx`'s member view / `MemberVideos`) reused as the home — same component the Main→Video destination uses. No new "continue watching" (deferred). Heading copy may read as a home ("Video") rather than a catalog title. The standalone `/video` route stays (reached via Main).

## 6. Main tab — set mode on pick

`src/pages/MainCatalog.tsx`: each world card's tap calls `setLearnMode('wmi' | 'video')` before/at navigation (keep current destinations: WMI→`/wmi-arena`, Video→`/video`). So choosing a world in Main also updates the badge + Home. (Cards become buttons that set mode then `navigate`, or `Link`s with an `onClick` that sets mode.)

## 7. Out of scope

Continue-watching video progress (needs new tracking), buy/equip-shield UI on the streak page, the campur per-answer reward farmability fix, any change to WMI Arena (campur/ujian) or the exam/papers flow, and the question-language default (left as-is, EN-first).

## Verification

- `npm run check`, lint, targeted unit tests (wmiStore resolution).
- Webwright member journeys:
  1. Top bar shows the **WMI** badge; tap it → flips to **Video**, the Home tab now shows the video home; tap again → back to WMI skill tree.
  2. Tap the **fire** → `/streak` page shows current/longest streak, shields, and the activity calendar.
  3. Bottom tab 1 reads **Home** with a house icon; Main and Profil unchanged. Picking a world in Main updates the badge.
  4. `VITE_ADMIN_ONLY=true` build still gates everything; the streak route redirects when unauthenticated.
