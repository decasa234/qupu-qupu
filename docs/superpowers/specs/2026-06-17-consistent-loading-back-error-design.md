# Consistent loading / back button / error states across member + parent pages

**Date:** 2026-06-17 · **Branch:** `claude-mythos-optimization` · **Status:** Approved, awaiting plan
**Source:** Founder feedback (2026-06-17): "make loading screen, back button, etc consistent across all pages."

## Goal

Replace the ad-hoc, per-page loading states, back/exit controls, and error cards across the **member + parent** surfaces with three shared primitives so every page looks and behaves the same. Admin pages are explicitly out of scope (they use the separate slate/warm admin kit).

## Decisions (from brainstorming)

- **Scope:** member + parent pages only. Do NOT touch `src/pages/admin/*` or `src/components/admin/*`.
- **Back control:** one shared `<BackButton>` with two variants (`back`, `close`).
- **Loading:** skeleton-first — no spinners on member/parent surfaces. One shared `<Skeleton>` fill; convert remaining spinners to skeletons.
- **Errors:** one shared `<ErrorRetry>` card.

## 1. `src/components/BackButton.tsx`

A single round control used in a standard header row (`<BackButton …/> <h1>Title</h1>`).

```tsx
interface BackButtonProps {
  variant?: 'back' | 'close'   // default 'back'
  to?: string                  // fallback route (back) / target (close)
  onClick?: () => void         // overrides default action (e.g. session quit-confirm)
  label?: string               // overrides aria-label
  className?: string
}
```

- **Canonical style (both variants):** `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5`.
- **`back`** → `fa-solid fa-arrow-left`, aria-label "Kembali". Default action: `useNavigate()`; if `location.key === 'default'` (no history — deep link / notification) navigate to `to` (default `/belajar`), else `navigate(-1)`. An explicit `onClick` overrides this.
- **`close`** → `fa-solid fa-xmark`, aria-label "Keluar". Default action: `to ? navigate(to) : navigate(-1)`. Live-session pages pass `onClick` (their existing quit-confirm handler).
- Uses `react-router-dom` `useNavigate` + `useLocation` internally.

## 2. `src/components/Skeleton.tsx`

```tsx
function Skeleton({ className }: { className?: string }): JSX.Element
```

- Renders `<div aria-hidden="true" className={`animate-pulse rounded-[1.25rem] bg-qupu-peach/50 ${className ?? ''}`} />`. Size/radius overridden via `className` (e.g. `h-32`, `rounded-full h-16 w-16`).
- One consistent fill (`bg-qupu-peach/50`), pulse, and default radius for every loading placeholder.
- **Skeleton-first conversion:** every full-page/section loading state on member/parent surfaces uses `<Skeleton>` blocks. Convert spinners (the `animate-spin` border circle, e.g. WmiKonsepSession "Memuat sesi…") to skeleton layouts. Existing ad-hoc `animate-pulse … bg-qupu-cream/peach` blocks (BelajarPath trail, StreakPage, drill/session question cards) keep their SHAPE but render via `<Skeleton>` so the fill/pulse match.

## 3. `src/components/ErrorRetry.tsx`

```tsx
interface ErrorRetryProps {
  message?: string             // default 'Gagal memuat. Periksa koneksimu.'
  onRetry: () => void
  retryLabel?: string          // default 'Coba lagi'
  className?: string
}
```

- A centered card: warm icon medallion (`fa-solid fa-circle-exclamation`), the message, and an orange "Coba lagi" button (`bg-qupu-brand-orange … shadow-[0_4px_0_0_#C46123]` with a `fa-rotate-right` icon). Matches the existing StreakPage/BelajarPath error card markup. Replaces per-page error+retry blocks.

## 4. Application (member + parent pages)

Apply the three primitives in these files (replace the equivalent ad-hoc markup). Each `BackButton` keeps that page's current navigation target as its `to`/`onClick`:

- **WmiKonsepSession** — header `Keluar` X → `BackButton variant="close" onClick={handleQuit}`; the garden-load spinner → skeleton; error/garden-error → `ErrorRetry` (the terminal "Kembali ke Kebun" CTA in commit-conflict/garden-error stays a CTA, not the header control).
- **WmiKonsepDrill** — `Keluar` X → `BackButton variant="close" onClick={handleBack}`; error card → `ErrorRetry`; skeleton via `<Skeleton>`.
- **WmiChapterTest** — `Keluar` text button → `BackButton variant="close" onClick={() => navigate('/belajar')}`; loading → skeleton; error → `ErrorRetry`.
- **WmiArena** — inline "Kembali" link → `BackButton variant="back" to="/main"`.
- **WmiPapers** — back → `BackButton variant="back" to="/wmi-arena"`; loading → skeleton; error → `ErrorRetry`.
- **WmiPaperDetail** — back → `BackButton variant="back" to="/latihan/wmi/ujian"`; loading → skeleton; error → `ErrorRetry`.
- **WmiExam** — exit X → `BackButton variant="close"` with its existing exit handler; loading → skeleton.
- **WmiExamReview** — back → `BackButton variant="back"`; loading → skeleton.
- **Quiz** — back → `BackButton variant="back" to="/video"`; loading → skeleton; error → `ErrorRetry`.
- **MemberVideos** — back (if present) → `BackButton`; loading → skeleton.
- **VideoDetail** — back → `BackButton variant="back" to="/video"`; loading → skeleton.
- **Report** — back → `BackButton variant="back"`; loading → skeleton; error → `ErrorRetry`.
- **StreakPage** — already uses the canonical back button + skeleton; refactor to use `<BackButton>` / `<Skeleton>` / `<ErrorRetry>` so it shares the source.
- **Shop**, **Badges** — loading → skeleton; error → `ErrorRetry`; back if present.
- **ParentDashboard** — its back/arrow → `BackButton variant="back"` (or keep its PIN-aware exit as `onClick`); loading → skeleton.

**CRITICAL caveat for implementers:** only replace controls that are genuinely *navigation back/exit* controls. Many `fa-xmark` occurrences are NOT back buttons — e.g. answer correct/wrong marks, the `WmiDots` wrong glyph, search-clear buttons (MemberVideos), and answer-feedback icons. Verify each control's purpose by reading its handler before swapping. Leave non-navigation icons alone.

## Out of scope

Admin surfaces; the bottom-sheet close buttons (ConceptSheet/ChapterSheet/QuestsSheet already share the sheet pattern + drag-dismiss); marketing/auth pages (Home/Login/Register) which have their own chrome; any behavior change beyond standardizing the visuals + the back-navigation fallback.

## Verification

- `npm run check`, lint, build (normal + `VITE_ADMIN_ONLY`).
- Webwright spot-checks: from several member pages (session, papers, streak, video detail, shop) the back/exit control looks identical and navigates correctly (incl. a deep-link entry that falls back to a route, not a dead tap); each page's loading state shows skeletons (no spinner); an induced error shows the shared retry card.
