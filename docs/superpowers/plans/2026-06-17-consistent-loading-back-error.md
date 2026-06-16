# Consistent loading / back / error states — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the back/exit control, loading state, and error card across all member + parent pages via three shared primitives.

**Architecture:** Create `BackButton`, `Skeleton`, `ErrorRetry` in `src/components/`, then replace the ad-hoc equivalents page by page (member + parent only; admin untouched). Skeleton-first (no spinners).

**Tech Stack:** React 18 + React Router 7 + Tailwind. No test runner for presentational components — verify via `npm run check`, lint, build, and webwright.

**Spec:** `docs/superpowers/specs/2026-06-17-consistent-loading-back-error-design.md`

**CRITICAL for every page task:** only replace controls that are genuinely *navigation back/exit* controls. Many `fa-xmark` icons are NOT back buttons — answer correct/wrong marks, `WmiDots` glyphs, search-clear buttons, answer-feedback icons. Read each control's handler before swapping; leave non-navigation icons alone. When a page's existing back target differs from what's written here, keep the page's existing target.

---

## Task 1: Create the three shared primitives

**Files:**
- Create: `src/components/BackButton.tsx`
- Create: `src/components/Skeleton.tsx`
- Create: `src/components/ErrorRetry.tsx`

- [ ] **Step 1: Create `src/components/BackButton.tsx`**

```tsx
// src/components/BackButton.tsx
//
// The one back/exit control for member + parent pages. Used in a header row:
//   <BackButton to="/main" /> <h1>Title</h1>
// variant 'back' = round arrow-left, navigate(-1) with a route fallback when
// there's no history (deep link / notification). variant 'close' = round X for
// exiting a flow/session; live sessions pass their own quit-confirm via onClick.
import { useLocation, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  variant?: 'back' | 'close'
  to?: string
  onClick?: () => void
  label?: string
  className?: string
}

export default function BackButton({
  variant = 'back',
  to,
  onClick,
  label,
  className,
}: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handle = () => {
    if (onClick) {
      onClick()
      return
    }
    if (variant === 'close') {
      navigate(to ?? '/belajar')
      return
    }
    if (location.key === 'default') navigate(to ?? '/belajar')
    else navigate(-1)
  }

  const icon = variant === 'close' ? 'fa-xmark' : 'fa-arrow-left'
  const aria = label ?? (variant === 'close' ? 'Keluar' : 'Kembali')

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={aria}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5${
        className ? ` ${className}` : ''
      }`}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/Skeleton.tsx`**

```tsx
// src/components/Skeleton.tsx
//
// Skeleton-first loading placeholder. One consistent fill + pulse + radius for
// every member/parent loading state. Size/shape via className (e.g. "h-32",
// "h-16 w-16 rounded-full").
interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[1.25rem] bg-qupu-peach/50${className ? ` ${className}` : ''}`}
    />
  )
}
```

- [ ] **Step 3: Create `src/components/ErrorRetry.tsx`**

```tsx
// src/components/ErrorRetry.tsx
//
// The one error+retry card for member/parent pages.
interface ErrorRetryProps {
  message?: string
  onRetry: () => void
  retryLabel?: string
  className?: string
}

export default function ErrorRetry({
  message = 'Gagal memuat. Periksa koneksimu.',
  onRetry,
  retryLabel = 'Coba lagi',
  className,
}: ErrorRetryProps) {
  return (
    <div
      className={`rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]${
        className ? ` ${className}` : ''
      }`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
        <i className="fa-solid fa-circle-exclamation text-xl" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-semibold text-qupu-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
      >
        <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        {retryLabel}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm run check && npx eslint src/components/BackButton.tsx src/components/Skeleton.tsx src/components/ErrorRetry.tsx`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/BackButton.tsx src/components/Skeleton.tsx src/components/ErrorRetry.tsx
git commit -m "feat(ui): shared BackButton, Skeleton, ErrorRetry primitives"
```

---

## Task 2: StreakPage — adopt the primitives (reference page)

Do this first as the reference: StreakPage already has the canonical markup, so swapping it in proves the components are drop-in.

**Files:** Modify `src/pages/StreakPage.tsx`

- [ ] **Step 1: Read `src/pages/StreakPage.tsx`.** Add imports:
```ts
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
```
Remove the now-unused `useLocation`/`useNavigate` imports ONLY if nothing else uses them after the swap (the back button moves into BackButton). Keep `useNavigate` if other code uses it; otherwise remove.

- [ ] **Step 2: Replace the header back `<button …aria-label="Kembali"…>` with:**
```tsx
        <BackButton variant="back" to="/profil" />
```

- [ ] **Step 3: Replace the loading block** (`<div className="mt-4 space-y-4" aria-hidden="true"> <div className="h-32 …"/> <div className="h-40 …"/> </div>`) with two `<Skeleton>`:
```tsx
        <div className="mt-4 space-y-4">
          <Skeleton className="h-32 rounded-[1.75rem]" />
          <Skeleton className="h-40 rounded-[1.75rem]" />
        </div>
```

- [ ] **Step 4: Replace the error block** (the `Gagal memuat streak…` card with the Coba lagi button) with:
```tsx
        <div className="mt-4">
          <ErrorRetry message="Gagal memuat streak. Periksa koneksimu." onRetry={() => setTick((t) => t + 1)} />
        </div>
```

- [ ] **Step 5: Verify + commit**
```bash
npm run check && npx eslint src/pages/StreakPage.tsx
git add src/pages/StreakPage.tsx
git commit -m "refactor(streak): use shared BackButton/Skeleton/ErrorRetry"
```

---

## Task 3: WMI live sessions — Session, Drill, Chapter Test

**Files:** Modify `src/pages/WmiKonsepSession.tsx`, `src/pages/WmiKonsepDrill.tsx`, `src/pages/WmiChapterTest.tsx`

For each file: add `import BackButton from '../components/BackButton'` (and `Skeleton`/`ErrorRetry` where the page has those states). Read the file first to locate each control + its handler.

- [ ] **Step 1: WmiKonsepSession.tsx**
  - Header exit X (`aria-label="Keluar"`, calls `handleQuit`) → `<BackButton variant="close" onClick={handleQuit} />` (keep the surrounding header row + progress bar).
  - Garden-load spinner (`Memuat sesi…`, the `animate-spin` border circle) → a skeleton layout, e.g.:
    ```tsx
    <div className="mx-auto w-full max-w-[460px] p-6">
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="mt-6 h-64 rounded-[1.5rem]" />
    </div>
    ```
  - `gardenError` state card → `<ErrorRetry message={gardenError} onRetry={() => setFetchTickOrReload} />` — use the page's existing retry mechanism; if the garden error path has no retry (it navigates to /belajar), keep its existing "Kembali ke Kebun" CTA as-is (terminal state, not a retry). Do NOT change the commit-conflict terminal screen.
  - The inline question-error retry (`Gagal memuat soal…` with `Coba lagi` calling `fetchQuestion`) → `<ErrorRetry message="Gagal memuat soal. Periksa koneksimu." onRetry={() => void fetchQuestion(currentPlanItem)} />`.
  - The `QuestionSkeleton` helper's `animate-pulse … bg-qupu-cream` blocks → use `<Skeleton>` for each block (same shape).

- [ ] **Step 2: WmiKonsepDrill.tsx**
  - Header `Keluar` X (calls `handleBack`) → `<BackButton variant="close" onClick={handleBack} />` (it currently sits in a `mb-3 flex` row; keep the row + the progress bar beside it).
  - The error card (`{error}` + Coba lagi calling `loadQuestion`) → `<ErrorRetry message={error} onRetry={() => void loadQuestion()} />`.
  - `QuestionSkeleton` blocks → `<Skeleton>`.

- [ ] **Step 3: WmiChapterTest.tsx**
  - The `Keluar` text button (`<button onClick={() => navigate('/belajar')}…><i fa-xmark/> Keluar</button>`) → `<BackButton variant="close" onClick={() => navigate('/belajar')} />`.
  - Any loading block → `<Skeleton>`; any error+retry → `<ErrorRetry>` (read the file; only if present).

- [ ] **Step 4: Verify + commit**
```bash
npm run check && npx eslint src/pages/WmiKonsepSession.tsx src/pages/WmiKonsepDrill.tsx src/pages/WmiChapterTest.tsx
git add src/pages/WmiKonsepSession.tsx src/pages/WmiKonsepDrill.tsx src/pages/WmiChapterTest.tsx
git commit -m "refactor(wmi-session): shared BackButton/Skeleton/ErrorRetry"
```

---

## Task 4: WMI arena / papers / exam

**Files:** Modify `src/pages/WmiArena.tsx`, `src/pages/WmiPapers.tsx`, `src/pages/WmiPaperDetail.tsx`, `src/pages/WmiExam.tsx`, `src/pages/WmiExamReview.tsx`

For each: add the relevant imports; read the file to locate the back/exit control + loading + error.

- [ ] **Step 1: WmiArena.tsx** — inline "Kembali" link (`fa-arrow-left`) → `<BackButton variant="back" to="/main" />` (in the header row before the title).
- [ ] **Step 2: WmiPapers.tsx** — back link → `<BackButton variant="back" to="/wmi-arena" />`; loading → `<Skeleton>`; error+retry → `<ErrorRetry>`.
- [ ] **Step 3: WmiPaperDetail.tsx** — back link → `<BackButton variant="back" to="/latihan/wmi/ujian" />`; loading → `<Skeleton>`; error → `<ErrorRetry>`.
- [ ] **Step 4: WmiExam.tsx** — exit X → `<BackButton variant="close" onClick={…existing exit handler…} />` (keep its exit/confirm logic); loading → `<Skeleton>`.
- [ ] **Step 5: WmiExamReview.tsx** — back link → `<BackButton variant="back" to="/latihan/wmi/ujian" />` (or the page's existing target); loading → `<Skeleton>`.
- [ ] **Step 6: Verify + commit**
```bash
npm run check && npx eslint src/pages/WmiArena.tsx src/pages/WmiPapers.tsx src/pages/WmiPaperDetail.tsx src/pages/WmiExam.tsx src/pages/WmiExamReview.tsx
git add src/pages/WmiArena.tsx src/pages/WmiPapers.tsx src/pages/WmiPaperDetail.tsx src/pages/WmiExam.tsx src/pages/WmiExamReview.tsx
git commit -m "refactor(wmi-arena): shared BackButton/Skeleton/ErrorRetry"
```

---

## Task 5: Video group — MemberVideos, VideoDetail, Quiz

**Files:** Modify `src/pages/MemberVideos.tsx`, `src/pages/VideoDetail.tsx`, `src/pages/Quiz.tsx`

- [ ] **Step 1: MemberVideos.tsx** — read carefully: the `fa-xmark` at ~line 189 is likely a SEARCH-CLEAR, not a back button — do NOT replace it. Add a `<BackButton>` only if there is a genuine back/exit control. Convert any loading placeholders → `<Skeleton>`.
- [ ] **Step 2: VideoDetail.tsx** — back control → `<BackButton variant="back" to="/video" />`; loading → `<Skeleton>`.
- [ ] **Step 3: Quiz.tsx** — back link (`fa-arrow-left`, ~line 528) → `<BackButton variant="back" to="/video" />`. NOTE: the `fa-xmark` answer marks in Quiz are NOT controls — leave them. The existing `handleBack` (location.key guard, navigates `/video`) is replaced by BackButton's own logic; pass `to="/video"`. Loading → `<Skeleton>`; error+retry → `<ErrorRetry>`.
- [ ] **Step 4: Verify + commit**
```bash
npm run check && npx eslint src/pages/MemberVideos.tsx src/pages/VideoDetail.tsx src/pages/Quiz.tsx
git add src/pages/MemberVideos.tsx src/pages/VideoDetail.tsx src/pages/Quiz.tsx
git commit -m "refactor(video): shared BackButton/Skeleton/ErrorRetry"
```

---

## Task 6: Stats / shop / parent — Report, Shop, Badges, ParentDashboard

**Files:** Modify `src/pages/Report.tsx`, `src/pages/Shop.tsx`, `src/pages/Badges.tsx`, `src/pages/parent/ParentDashboard.tsx`

- [ ] **Step 1: Report.tsx** — back link → `<BackButton variant="back" />` (no `to` needed if it's reached from /parent — keep its current target as `to` if it has one). Loading → `<Skeleton>`; error → `<ErrorRetry>`. NOTE: Report renders both standalone and embedded (an `embedded` prop hides chrome) — only show the BackButton in the standalone (non-embedded) branch, matching current behavior.
- [ ] **Step 2: Shop.tsx** — loading → `<Skeleton>`; error+retry → `<ErrorRetry>`; back control if present → `<BackButton>`.
- [ ] **Step 3: Badges.tsx** — loading → `<Skeleton>`; error → `<ErrorRetry>`; back control if present → `<BackButton>`.
- [ ] **Step 4: ParentDashboard.tsx** — its back/arrow (`fa-arrow-left text-[10px]`) → `<BackButton variant="back" />` keeping its existing exit target/handler (it may re-lock the PIN on leave — preserve that via `onClick`). Loading → `<Skeleton>`. Do NOT alter the PIN gate.
- [ ] **Step 5: Verify + commit**
```bash
npm run check && npx eslint src/pages/Report.tsx src/pages/Shop.tsx src/pages/Badges.tsx src/pages/parent/ParentDashboard.tsx
git add src/pages/Report.tsx src/pages/Shop.tsx src/pages/Badges.tsx src/pages/parent/ParentDashboard.tsx
git commit -m "refactor(stats/parent): shared BackButton/Skeleton/ErrorRetry"
```

---

## Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1:** `npm run check && npm run lint` — typecheck clean; no NEW lint errors in touched files (pre-existing warnings elsewhere are fine).
- [ ] **Step 2:** `npm run build && VITE_ADMIN_ONLY=true npm run build` — both succeed.
- [ ] **Step 3: Webwright spot-checks** (phone viewport, `webwright-test@example.com` / `UjiCoba123!`):
  - From the WMI session (tap a node → Mulai), the exit control is the round X; tapping it exits.
  - `/streak`, a paper detail, a video detail, the shop: the back control is the identical round arrow button; tapping returns; a deep-link load (navigate straight to the URL) falls back to a route (not a dead tap).
  - Each page's loading state shows skeletons (no spinner).
  - Confirm no `fa-xmark` answer-mark / search-clear was turned into a navigation button (sessions still mark answers, video search still clears).
- [ ] **Step 4:** Final code-review subagent over the whole diff; fix any findings.

---

## Notes / out of scope

Admin pages; bottom-sheet close buttons (already shared); marketing/auth pages (Home/Login/Register); any behavior change beyond standardizing visuals + the back-navigation fallback. Do not convert non-navigation `fa-xmark` icons (answer marks, `WmiDots`, search-clear, feedback) into BackButtons.
