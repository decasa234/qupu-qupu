# QUPU V2 — Game-loop + Orange Repaint + Landing Merge Implementation Plan

> **For agentic workers:** Implement only this V2 refinement scope. Do not reopen the older Phase 2 backend/shop foundation work unless current code proves it is missing.

**Goal:** Refine the already-shipped member experience so Home becomes a simpler orange-dominant game loop with three action cards, direct recommended practice, and logged-in `/` redirecting into the member product.

**Architecture:** Keep the existing AppShell/top stat strip/bottom tabs/shop/inventory foundation. Update routing in `src/App.tsx`, repaint member shell surfaces orange-first, and replace the current dashboard mission presentation with a simpler action-card stack that uses existing dashboard data plus a recommended-practice helper.

**Tech Stack:** React 18 + Vite + Tailwind + React Router 7. Prefer existing dashboard payload and current frontend state. Avoid backend changes unless the dashboard payload cannot provide a stable recommended video slug/title.

**Spec:** `docs/superpowers/specs/2026-05-25-duolingo-gamification-phase2-design.md`

**Conventions:**
- No emojis — Font Awesome only.
- Mobile-first member surfaces.
- Keep changes tight. This is a refinement pass, not a subsystem rewrite.
- Verify UI in a real browser before reporting done.

---

## Phasing summary

| Phase | What ships | Tasks |
|---|---|---|
| A | Logged-in `/` route merge | A1 |
| B | Orange AppShell repaint | B1 |
| C | Dashboard action-card loop + direct practice | C1–C4 |
| D | Manual browser verification + cleanup | D1 |

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `src/App.tsx` | MODIFY | Redirect authenticated `/` traffic to `/dashboard` while preserving logged-out marketing Home |
| `src/components/AppShell.tsx` | MODIFY | Change member shell background/layout feel to orange-dominant |
| `src/pages/Dashboard.tsx` | MODIFY | Replace current mission-strip-led presentation with V2 action-card layout |
| `src/components/dashboard/ShopTeaser.tsx` | MODIFY | Match the slimmer mockup styling/content if needed |
| `src/lib/dashboardData.ts` | MODIFY | Add a small derived helper/type support for recommended practice if needed |
| `src/components/dashboard/MissionStrip.tsx` | MODIFY or DELETE | Remove from dashboard flow if superseded |
| `src/pages/Home.tsx` | LEAVE | Logged-out marketing Home remains intact |

Create new files only if the dashboard JSX would otherwise become messy:
- `src/components/dashboard/HomeActionCards.tsx`
- `src/components/dashboard/PracticeCard.tsx`
- `src/components/dashboard/LoginBonusCard.tsx`
- `src/components/dashboard/StreakCard.tsx`

Default preference: one new `HomeActionCards.tsx` file, not four tiny files.

---

# Phase A — Logged-in `/` route merge

## Task A1: Redirect authenticated `/` to `/dashboard`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update the index route under `<Layout>`**

Current state in `src/App.tsx` uses:

```tsx
<Route index element={<Home />} />
```

Replace it with an auth-aware gate component. Keep this minimal in `src/App.tsx`:

```tsx
function HomeRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <Home />
}
```

Then change the index route to:

```tsx
<Route index element={<HomeRoute />} />
```

This keeps:
- logged-out `/` → marketing Home
- logged-in member `/` → `/dashboard`
- logged-in admin `/` → `/dashboard` then existing `DashboardRouter` sends them to `/admin/dashboard`

- [ ] **Step 2: Verify typecheck**

```bash
npm run check
```

- [ ] **Step 3: Browser check**

Run the app and verify:
1. logged out: `/` still shows marketing Home
2. logged in member: `/` redirects to `/dashboard`
3. logged in admin: `/` redirects through to `/admin/dashboard`

---

# Phase B — Orange AppShell repaint

## Task B1: Repaint member shell background

**Files:**
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 1: Update AppShell background and content framing**

Current file uses a shell background and simple padded main area. Update it so the shell itself feels orange-dominant:

Target shape:
- root container background → `bg-qupu-brand-orange`
- keep `TopStatStrip` and `BottomTabBar` as white chrome
- content area stays centered/mobile-first
- allow inner pages to render their own white/cream cards without losing the orange shell feel

Recommended direction:

```tsx
<div className="flex min-h-screen flex-col bg-qupu-brand-orange">
  <TopStatStrip />
  <main className="flex w-full flex-1 flex-col px-4 py-4">
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-lg">
      <Outlet />
    </div>
  </main>
  <BottomTabBar />
</div>
```

Keep the exact sizing aligned with current page behavior if another shape fits better.

- [ ] **Step 2: Verify browser contrast on member pages**

Check `/dashboard`, `/shop`, `/badges`, `/report`, `/me` in mobile viewport. Confirm:
- stat strip still reads clearly
- bottom tab icons/text still read clearly
- dense pages remain legible because inner cards stay light

- [ ] **Step 3: Verify typecheck + lint**

```bash
npm run check && npm run lint
```

---

# Phase C — Dashboard action-card loop

## Task C1: Add a recommended-practice selector

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Optionally modify: `src/lib/dashboardData.ts`

- [ ] **Step 1: Inspect available recommendation data**

Use the existing `vm.recommended` first. The goal is to derive:
- `recommendedPracticeSlug`
- `recommendedPracticeTitle`

If `vm.recommended[0]` already includes `slug` and `title`, derive them in `Dashboard.tsx`.

If the type shape is awkward, add a small helper in `src/lib/dashboardData.ts` such as:

```ts
export function pickRecommendedPractice(vm: DashboardViewModel): {
  slug: string | null
  title: string
} {
  const first = vm.recommended[0]
  if (!first) return { slug: null, title: 'Pilih video latihan' }
  return {
    slug: first.slug,
    title: first.title,
  }
}
```

If there is no slug on the item type, use the field that current recommended cards use for video detail navigation.

- [ ] **Step 2: Define fallback behavior**

If no recommendation exists:
- CTA target → `/videos`
- subtitle/title copy → generic practice prompt

Do not add a backend endpoint for this unless the current payload cannot support any stable detail-page route.

---

## Task C2: Replace the mission-strip-led Home body with V2 cards

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Create optionally: `src/components/dashboard/HomeActionCards.tsx`

- [ ] **Step 1: Replace the `MissionStrip` section with the V2 structure**

Current dashboard already has:
- profile hero
- `MissionStrip`
- `ShopTeaser`

Replace the middle section with:
- `Aksi Hari Ini` label
- Login Bonus card
- Streak card
- Practice hero card
- slim shop teaser

Use the mockup at `.superpowers/brainstorm/55346-1779877641/content/home-v2-mockup.html` as the visual reference.

Recommended implementation: create one component that receives the few needed props:

```tsx
interface HomeActionCardsProps {
  streak: number
  coinBalance: number
  recommendedTitle: string
  recommendedHref: string
}
```

And render the three cards there.

### Card behavior requirements

**Login Bonus**
- CTA label: `Klaim`
- If no real claim backend exists, button can be presentational/non-mutating for this pass, but do not fake coin state changes.
- Reward pill: `+5`

**Streak**
- Title includes current streak days.
- CTA label: `Lihat`
- Route to `/report` unless there is an existing better streak-detail surface.

**Practice**
- Main hero card.
- CTA label: `Mulai`
- Route directly to `/videos/{slug}` when a recommendation exists.
- Route to `/videos` only as fallback.

- [ ] **Step 2: Preserve the profile hero and report link only if still useful**

The old `Lihat rapor lengkap →` link can remain if it still fits visually under the new card stack. Remove it if it adds clutter and `/report` remains reachable from tabs or streak CTA.

Favor the cleaner screen.

---

## Task C3: Adjust shop teaser styling to match V2 mockup

**Files:**
- Modify: `src/components/dashboard/ShopTeaser.tsx`

- [ ] **Step 1: Restyle from large CTA card to slim secondary teaser**

Target feel from the mockup:
- dark-blue compact card
- smaller yellow icon block
- short title/subtitle
- compact `Lihat` pill/button
- less visual weight than Practice

Keep current data behavior:
- still show affordable item count if already available
- still route to `/shop`

Do not add new fetching solely for this restyle.

---

## Task C4: Remove or retire MissionStrip from dashboard flow

**Files:**
- Modify or delete: `src/components/dashboard/MissionStrip.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Ensure dashboard no longer renders `MissionStrip`**

If `MissionStrip` is now unused anywhere, delete it.
If it is still reused elsewhere, leave the file but remove the dashboard import.

- [ ] **Step 2: Verify no dead imports remain**

```bash
npm run check && npm run lint
```

---

# Phase D — Verification

## Task D1: Full browser verification

- [ ] **Step 1: Start the app**

```bash
npm run dev
```

- [ ] **Step 2: Verify the flows in a phone-sized viewport**

Use a real browser and confirm:
1. logged out `/` → marketing Home
2. logged in `/` → `/dashboard`
3. dashboard has orange base and white chrome
4. dashboard shows profile hero + 3 action cards + slim shop teaser
5. practice CTA opens a specific video detail page when recommendation exists
6. if no recommendation exists, practice falls back safely to `/videos`
7. `/shop`, `/badges`, `/report`, `/me` still look acceptable under the orange shell
8. bottom tab bar remains legible and active state still works

- [ ] **Step 3: Run final checks**

```bash
npm run check && npm run lint
```

- [ ] **Step 4: If the orange repaint harms a dense page, constrain that page internally rather than backing out the shell**

Preferred fix order:
1. Add/keep white inner cards on the dense page
2. Adjust spacing/border contrast
3. Only narrow the shell repaint if readability still fails

---

## Definition of done

- Authenticated `/` redirects to `/dashboard`.
- Member Home matches the approved V2 direction: orange-dominant, simple game-loop cards, white chrome.
- Practice CTA opens a specific recommended video detail page when possible.
- Shop teaser remains secondary.
- No regressions on `/shop`, `/badges`, `/report`, `/me`.
- `npm run check` and `npm run lint` pass.
- Manual browser verification is complete.
