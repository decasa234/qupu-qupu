---
title: SPA route scroll reset and fixed navbar clearance
date: 2026-04-26
category: ui-bugs
module: web-frontend-layout
problem_type: ui_bug
component: tooling
symptoms:
  - "Navigating from / (scrolled) to /videos preserved the previous scroll position instead of starting at top"
  - "Fixed navbar (~92px tall) sat ~20px above main content, leaving insufficient breathing room on every route"
root_cause: missing_workflow_step
resolution_type: code_fix
severity: low
related_components:
  - documentation
tags:
  - react-router
  - scroll-restoration
  - layout
  - tailwind
  - spa
  - fixed-header
  - full-bleed
---

# SPA route scroll reset and fixed navbar clearance

## Problem

In the QUPU SPA (React 18 + React Router 7), navigating between routes preserved the previous page's scroll position, so users landed mid-page on freshly-mounted routes. Compounding this, the fixed peach-pill navbar sat too close to `<main>`'s top padding (`pt-28`), leaving only ~20px of breathing room and making every page feel cramped under the header.

## Symptoms

- Scrolling to the "Videos" section on `/`, then clicking the navbar `Video` link, opened `/videos` already scrolled down — the page header rendered above the fold.
- Same issue on any in-app navigation that originated from a non-zero scroll offset (Home → Login, Dashboard → Badges, etc.).
- The fixed header (~92px from viewport top including its own top padding) visually collided with the first element of every route — titles, hero text, and cards looked tucked under the pill.
- Anchor navigation (e.g. `/#kategori`) was not yet broken, but any naive scroll-reset would have broken it because of the existing `scroll-behavior: smooth` + `scroll-padding-top: 7rem` rules in `src/index.css` that drive hash-anchor jumps.

## What Didn't Work

There was no global scroll-reset at all. React Router 7 does not restore or reset scroll by default in SPA mode, and the assumption was that the browser would handle it as on MPA navigations — it doesn't, because the document never unloads.

The only prior attempt at scroll control was narrow and predated recognizing the broader carryover issue: on 2026-04-25, a `window.scrollTo({ top: 0, behavior: 'smooth' })` was wired into `NavItemLink` for the **Beranda** link only, preventing default when already on `/`. That solved one UX polish case but did nothing for cross-route navigation. (session history)

Separately, `pt-28` (112px) was eyeballed against an earlier, shorter navbar on 2026-04-24 when the Layout shell was first introduced. Nobody re-measured after the navbar grew into its current peach-pill form, so the gap was technically positive but visually cramped. (session history)

## Solution

Add a `ScrollToTop` listener inside `Layout` and bump `<main>`'s top padding. In `src/components/Layout.tsx`:

```tsx
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-qupu-cream text-qupu-ink">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
```

Coupled change in `src/pages/Home.tsx` `HeroSection` — the full-bleed escape must match the new padding:

```
-mt-28 ... pt-32 sm:pt-36 lg:pt-40   →   -mt-36 ... pt-40 sm:pt-44 lg:pt-48
```

Shipped as commit `a7d3450 feat: scroll to top on route change and widen navbar gap`.

## Why This Works

- `useLocation()` returns a new object on every router navigation, so a `useEffect` keyed on `pathname` fires exactly once per route change — no manual subscription, no `history.listen`. It runs after React commits the new tree, which is when `window.scrollTo` is meaningful.
- `behavior: 'auto'` is intentional. Smooth-scrolling from a deep offset to top during a route transition is jarring and competes with the new page's mount animations; users expect a "fresh page" to already be at top, not animate there.
- The `if (hash) return` guard preserves in-page anchor jumps (e.g. `/#kategori` from the navbar). Without it, `ScrollToTop` would fire after the browser handled the hash and snap back to top, defeating the anchor — and undoing the `scroll-padding-top: 7rem` work in `index.css`. (session history) Edge case: navigating from `/#kategori` to `/#faq` (same pathname, different hash) intentionally skips the reset; the browser's anchor handler takes over.
- React Router 7 also ships `<ScrollRestoration />`, but it only works inside the data-router tree (`createBrowserRouter` + `RouterProvider`). This app mounts `<BrowserRouter>` + `<Routes>` in `src/App.tsx`, where `<ScrollRestoration />` would throw at runtime — so the manual `useEffect` + `useLocation` pattern is the correct choice today. If the app ever migrates to the data router, delete `ScrollToTop` and replace with `<ScrollRestoration getKey={(loc) => loc.pathname} />`.
- Safe under React 18 StrictMode double-invoke: `scrollTo` to a fixed offset is idempotent, and the hash guard short-circuits before any DOM read. Don't convert this to a relative `scrollBy` without revisiting that property.
- `<main>`'s `pt-36` (144px) gives ~52px clearance under the ~92px navbar. Full-bleed children that escape `max-w-7xl` via `-ml-[50vw] -mr-[50vw] w-screen` and want to start flush at the viewport top must negate that padding with `-mt-36`, then re-introduce their own internal `pt-*` for content spacing — otherwise the section either floats below the navbar (positive gap) or hides under it (over-negative).

## Prevention

- **Global scroll-reset lives in `Layout` only.** Do not add per-page scroll logic. If a route ever needs to preserve scroll (rare), opt out by reading `pathname` locally rather than removing the global handler. Per-link scroll handlers like the Beranda case in `Navbar.tsx` are still fine — they handle the "already on this route" edge case.
- **Padding/offset invariant for flush-to-top full-bleed sections.** `<main>`'s `pt-*` and any full-bleed child that intends to sit flush below the navbar must use the same Tailwind value as a `-mt-*`. Today that value is `36`. If you change `<main>`'s `pt-*`, grep for `-mt-36` and update every flush-to-top full-bleed section in lockstep. (Currently only `HeroSection`.)
- **Not all `-mt-*` must match `pt-*`.** `FeaturesSection` uses `-mt-32 sm:-mt-40 lg:-mt-48` to overlap the hero — that offset is a deliberate visual tuck, not a navbar-clearance value, and it's independent of the invariant above. (session history) Before changing any negative top margin, identify its intent: navbar-clearance (must match `<main>`) vs. visual overlap with another section (independent).
- **When adding a new flush-to-top full-bleed section,** copy the pattern from `HeroSection`: `-mt-36 -ml-[50vw] -mr-[50vw] w-screen` plus its own `pt-40 sm:pt-44 lg:pt-48` for internal content spacing.
- **When adding a new route, no scroll wiring is needed** — `Layout` covers it. Just verify any in-page anchors you link to still use a real `#hash` so the guard kicks in.
- **If the navbar's height changes,** treat `<main>`'s `pt-*`, every flush-to-top `-mt-*`, and `index.css`'s `scroll-padding-top` as one constant — re-measure the navbar footprint and update them together.
- **On migration to React Router's data router (`createBrowserRouter` + `RouterProvider`),** delete `ScrollToTop` from `Layout` and add `<ScrollRestoration />` inside the route tree. Otherwise both will fire and you'll get redundant scroll work.

## Related

- `src/components/Layout.tsx` — owner of `ScrollToTop` and `<main>` padding.
- `src/pages/Home.tsx` `HeroSection` — current canonical full-bleed section using the invariant.
- `src/index.css` — `scroll-behavior: smooth` and `scroll-padding-top: 7rem` for hash-anchor navigation; reason the `if (hash) return` guard exists.
- `src/components/Navbar.tsx` — per-link Beranda scroll-to-top handler (separate concern from route-change reset).
- `docs/superpowers/plans/2026-04-25-public-pages-redesign.md` — the redesign plan that introduced the full-bleed sections this learning constrains.
