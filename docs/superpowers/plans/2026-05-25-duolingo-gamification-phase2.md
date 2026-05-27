# Duolingo-level Gamification — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Duolingo-feeling gamified profile on `/dashboard`, a new `/shop` with rigid coin-based purchases of mock digital products, and inventory on `/me`, wrapped in a mobile-first app-shell chrome.

**Architecture:** New `<AppShell>` wraps member routes (`/dashboard`, `/shop`, `/badges`, `/report`, `/me`) with a sticky top stat strip + bottom tab bar; standard `<Layout>` is suppressed there. Slim `/dashboard` = profile hero + mission strip + shop teaser; detailed sections move to `/report`. New `shop_items` + `child_inventory` tables back a `purchaseItem(childId, itemId)` service whose race-safety comes from `INSERT … ON CONFLICT DO NOTHING` (idempotency) + conditional debit `UPDATE … WHERE coin_balance >= price` (no overdraw) + `CHECK (coin_balance >= 0)` belt-and-braces, all inside `withTransaction`.

**Tech Stack:** React 18 + Vite + Tailwind + React Router 7 (frontend); Express + Postgres (`pg`) + Joi validation (backend); Vitest + `qupu_test` DB for integration tests.

**Spec:** `docs/superpowers/specs/2026-05-25-duolingo-gamification-phase2-design.md`

**Conventions (from project rules / memory):**
- No emojis anywhere — use Font Awesome 6 (`fa-solid fa-*`).
- Mobile-first app-feel on member surfaces.
- Stage files explicitly by name on commit (no `git add -A` / `git add .`).
- Tests skip unless `TEST_DATABASE_URL` is set. Never run them against `qupu` dev DB.
- Imports inside `api/` use `.js` extensions on TS files (ESM-style).

---

## Phasing summary

| Phase | What ships | Tasks |
|---|---|---|
| **A** | AppShell chrome + slim Home + `/me` shell + `/shop` stub + `/report` expanded | A1–A12 |
| **B** | Migration 0019, shop services, purchase API, 6 integration tests | B1–B9 |
| **C** | Real `/shop` page: catalog grid, bottom sheet, purchase celebration | C1–C7 |
| **D** | Inventory grid + item sheet on `/me` | D1–D3 |

Phases ship in order. Each ends with a verification + commit. Frontend phases verify via `npm run check` + `npm run lint` + manual mobile-viewport check (no Jest/RTL infra in this repo). Backend phase verifies via `npm test`.

---

## File structure (decomposition map)

### Phase A — frontend reorganisation
| File | Action | Responsibility |
|---|---|---|
| `src/hooks/useGamificationStats.ts` | CREATE | Read streak/coins/level from cached dashboard data; expose a `refresh()` callback for purchase/score events |
| `src/components/app-shell/TopStatStrip.tsx` | CREATE | Sticky top bar with 3 stats + drawer triggers |
| `src/components/app-shell/BottomTabBar.tsx` | CREATE | 5 tabs: Home / Video / Toko / Badge / Profil |
| `src/components/AppShell.tsx` | CREATE | Composes TopStatStrip + `<Outlet/>` + BottomTabBar; full-height mobile shell |
| `src/components/dashboard/MissionStrip.tsx` | CREATE | Replaces `DashboardQuests`: chunky-first / dimmed-rest layout with coin + XP rewards |
| `src/components/dashboard/ShopTeaser.tsx` | CREATE | Affordable items teaser card on Home |
| `src/pages/Shop.tsx` | CREATE (stub) | Placeholder page rendered until Phase C |
| `src/pages/Me.tsx` | CREATE (shell) | Profil tab destination: child switcher + settings + inventory placeholder |
| `src/components/dashboard/DashboardQuests.tsx` | DELETE | Superseded by `MissionStrip` |
| `src/components/dashboard/DashboardEmptyState.tsx` | DELETE | Unified into slim Home |
| `src/pages/Dashboard.tsx` | MODIFY | Slim down: profile hero + MissionStrip + ShopTeaser only |
| `src/pages/Report.tsx` | MODIFY | Expand to host moved Subjects/KPIs/Activity/Recommended/Attempts |
| `src/App.tsx` | MODIFY | Member route group wraps `<AppShell>` instead of `<Layout>` |

### Phase B — shop backend
| File | Action | Responsibility |
|---|---|---|
| `db/migrations/0019_shop.sql` | CREATE | `shop_items` + `child_inventory` tables + seed 10 items |
| `db/schema.sql` | MODIFY | Mirror the migration |
| `api/services/shop/types.ts` | CREATE | Shared TS types (`ShopItem`, `PurchaseResult`, error class) |
| `api/services/shop/catalog.ts` | CREATE | `listItemsForChild(childId)` |
| `api/services/shop/purchase.ts` | CREATE | The rigid `purchaseItem(childId, itemId)` algorithm |
| `api/services/shop/inventory.ts` | CREATE | `listInventory(childId)` |
| `api/services/gamification/ledger.ts` | MODIFY | Add `'SHOP_PURCHASE'` to `RewardType` union |
| `api/routes/shop.ts` | CREATE | Mounts the 3 endpoints with Joi validation |
| `api/app.ts` | MODIFY | Wire `app.use('/api/shop', shopRoutes)` and `app.use('/api/me/inventory', inventoryRoutes)` (or share the shop router) |
| `api/__tests__/shop/purchase.test.ts` | CREATE | 6 integration tests (happy / insufficient / idempotent / race-same / race-cross / CHECK) |

### Phase C — shop UI
| File | Action | Responsibility |
|---|---|---|
| `src/lib/shopApi.ts` | CREATE | Typed axios wrappers for `/api/shop/items`, `/api/shop/purchase`, `/api/me/inventory` |
| `src/components/shop/BottomSheet.tsx` | CREATE | Reusable bottom sheet primitive (drag handle, backdrop, slide animation) |
| `src/components/shop/ShopItemCard.tsx` | CREATE | Catalog tile with owned / affordable badges |
| `src/components/shop/PurchaseSheet.tsx` | CREATE | Bottom sheet with item detail + confirm dialog + buy |
| `src/components/shop/PurchaseCelebration.tsx` | CREATE | Full-screen overlay with canvas confetti + spring scale-up |
| `src/pages/Shop.tsx` | MODIFY (replace stub) | Real catalog page: header band + filter chips + grid |

### Phase D — inventory
| File | Action | Responsibility |
|---|---|---|
| `src/components/me/InventoryGrid.tsx` | CREATE | Owned items grid with tap → sheet |
| `src/components/me/InventoryItemSheet.tsx` | CREATE | "Item ready soon" placeholder sheet |
| `src/pages/Me.tsx` | MODIFY | Wire `InventoryGrid` in `#koleksi` section |

---

# Phase A — AppShell + slim Home

## Task A1: `useGamificationStats` hook

**Files:**
- Create: `src/hooks/useGamificationStats.ts`

- [ ] **Step 1: Create the hook**

```ts
// src/hooks/useGamificationStats.ts
//
// Reads gamification stats (streak / coins / level) from the dashboard
// payload shared via React state. Components in <AppShell> subscribe via
// useGamificationStats() to render the top stat strip without each one
// fetching independently. The actual fetch happens in Dashboard.tsx (and
// after-purchase / after-score events trigger a refresh via the same hook).
import { create } from 'zustand'

export interface GamificationStats {
  streak: number
  coinBalance: number
  level: number
  tierName: string
  xp: number
  xpToNext: number
}

interface StatsState {
  stats: GamificationStats | null
  setStats: (s: GamificationStats) => void
  patchCoinBalance: (newBalance: number) => void
}

export const useGamificationStats = create<StatsState>((set) => ({
  stats: null,
  setStats: (s) => set({ stats: s }),
  patchCoinBalance: (newBalance) =>
    set((state) =>
      state.stats ? { stats: { ...state.stats, coinBalance: newBalance } } : state,
    ),
}))
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS (zustand is already a dependency — verify with `grep zustand package.json`).

- [ ] **Step 3: Commit**

```
git add src/hooks/useGamificationStats.ts
git commit -m "feat(gamification): add shared stats store for app-shell"
```

---

## Task A2: `TopStatStrip` component

**Files:**
- Create: `src/components/app-shell/TopStatStrip.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/app-shell/TopStatStrip.tsx
//
// Sticky chrome at the top of every <AppShell> route. Reads stats from
// useGamificationStats; renders three pills. No internal data fetch —
// the hook is populated by Dashboard.tsx and refreshed by purchase /
// score-submit events elsewhere.
import { useGamificationStats } from '../../hooks/useGamificationStats'

export default function TopStatStrip() {
  const stats = useGamificationStats((s) => s.stats)
  const streak = stats?.streak ?? 0
  const coins = stats?.coinBalance ?? 0
  const level = stats?.level ?? 1

  return (
    <div className="sticky top-0 z-30 flex items-center justify-around border-b-[3px] border-qupu-peach bg-white px-3 py-2">
      <Pill icon="fa-solid fa-fire" color="text-qupu-brand-orange" value={streak} />
      <Pill icon="fa-solid fa-coins" color="text-qupu-brand-yellow" value={coins} />
      <Pill icon="fa-solid fa-star" color="text-qupu-brand-blue" value={`Lv ${level}`} />
    </div>
  )
}

function Pill({ icon, color, value }: { icon: string; color: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 font-display text-sm font-extrabold text-qupu-brand-blue">
      <i className={`${icon} ${color} text-base`} aria-hidden="true" />
      <span>{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/app-shell/TopStatStrip.tsx
git commit -m "feat(app-shell): add TopStatStrip chrome component"
```

---

## Task A3: `BottomTabBar` component

**Files:**
- Create: `src/components/app-shell/BottomTabBar.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/app-shell/BottomTabBar.tsx
//
// Sticky bottom nav for <AppShell>. Five tabs. Active state is matched
// by route prefix so /badges and /badges/whatever both light up the Badge tab.
import { NavLink } from 'react-router-dom'

interface TabDef {
  to: string
  label: string
  icon: string
}

const TABS: TabDef[] = [
  { to: '/dashboard', label: 'Home',  icon: 'fa-solid fa-house' },
  { to: '/videos',    label: 'Video', icon: 'fa-solid fa-circle-play' },
  { to: '/shop',      label: 'Toko',  icon: 'fa-solid fa-bag-shopping' },
  { to: '/badges',    label: 'Badge', icon: 'fa-solid fa-medal' },
  { to: '/me',        label: 'Profil', icon: 'fa-solid fa-user' },
]

export default function BottomTabBar() {
  return (
    <nav
      className="sticky bottom-0 z-30 flex justify-around border-t-[3px] border-qupu-peach bg-white pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
              isActive ? 'text-qupu-brand-orange' : 'text-qupu-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-base ${
                  isActive ? 'bg-qupu-peach text-qupu-brand-orange' : 'text-qupu-muted'
                }`}
                aria-hidden="true"
              >
                <i className={tab.icon} />
              </span>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/app-shell/BottomTabBar.tsx
git commit -m "feat(app-shell): add BottomTabBar chrome component"
```

---

## Task A4: `AppShell` wrapper component

**Files:**
- Create: `src/components/AppShell.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/AppShell.tsx
//
// Member-route chrome. Replaces <Layout> for /dashboard /shop /badges
// /report /me. Mobile-first phone-shell layout: sticky top stats, scrollable
// body, sticky bottom nav. Survives at any width — desktop polish (left rail)
// is deliberately deferred.
import { Outlet } from 'react-router-dom'
import TopStatStrip from './app-shell/TopStatStrip'
import BottomTabBar from './app-shell/BottomTabBar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-qupu-shell">
      <TopStatStrip />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4 sm:max-w-lg">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/AppShell.tsx
git commit -m "feat(app-shell): add AppShell wrapper for member routes"
```

---

## Task A5: Page stubs (`Shop.tsx`, `Me.tsx`)

**Files:**
- Create: `src/pages/Shop.tsx`
- Create: `src/pages/Me.tsx`

- [ ] **Step 1: Create `Shop.tsx` stub**

```tsx
// src/pages/Shop.tsx
//
// Stub for Phase A. Real catalog + bottom-sheet purchase flow ships in
// Phase C. Lives in AppShell so navigating to /shop already shows the
// correct chrome and confirms routing works.
export default function ShopPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] border-[3px] border-dashed border-qupu-brand-blue/30 bg-white p-8 text-center shadow-[5px_6px_0_0_#FFD3B1]">
      <i className="fa-solid fa-bag-shopping text-4xl text-qupu-brand-orange" aria-hidden="true" />
      <h2 className="font-display text-2xl font-extrabold text-qupu-brand-blue">Toko segera hadir</h2>
      <p className="text-sm font-medium text-qupu-muted">Kami sedang menyiapkan paket worksheet & e-book pertama untukmu.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `Me.tsx` shell**

```tsx
// src/pages/Me.tsx
//
// Profil tab destination. Phase A: child switcher + settings shortcut +
// inventory placeholder. Phase D wires the real InventoryGrid into
// the #koleksi section.
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function MePage() {
  const { user } = useAuthStore()

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Akun</div>
        <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">{user?.name ?? 'Profil'}</h2>
        <p className="mt-1 text-xs font-medium text-qupu-muted">{user?.email}</p>
      </section>

      <section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
        <p className="mt-2 text-sm font-medium text-qupu-muted">
          Belum ada item. Selesaikan misi dan tukar koinmu di toko.
        </p>
        <Link
          to="/shop"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Buka toko
        </Link>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```
git add src/pages/Shop.tsx src/pages/Me.tsx
git commit -m "feat(routes): add /shop and /me page stubs"
```

---

## Task A6: Refactor `App.tsx` routing — member routes adopt AppShell

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the route table**

Open `src/App.tsx` and replace the `<Routes>` block (currently lines 78–135 — verify before editing) with this structure. Imports at the top must also gain `AppShell`, `ShopPage`, `MePage`.

```tsx
import AppShell from './components/AppShell'
import ShopPage from './pages/Shop'
import MePage from './pages/Me'
// ...existing imports...

// Inside <Router>:
<Routes>
  {/* Marketing + auth + video + onboarding — keep marketing Layout */}
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="videos" element={<VideosPage />} />
    <Route path="videos/:slug" element={<VideoDetailPage />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route
      path="onboarding/child"
      element={
        <ProtectedRoute>
          <OnboardingChild />
        </ProtectedRoute>
      }
    />
  </Route>

  {/* Member routes — wrapped in AppShell (sticky stat strip + bottom nav) */}
  <Route
    element={
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<DashboardRouter />} />
    <Route path="report" element={<ReportPage />} />
    <Route path="badges" element={<BadgesPage />} />
    <Route path="shop" element={<ShopPage />} />
    <Route path="me" element={<MePage />} />
  </Route>

  {/* Admin — untouched */}
  <Route
    path="/admin"
    element={
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    }
  >
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboardPage />} />
    <Route path="videos" element={<AdminVideosPage />} />
    <Route path="videos/import" element={<AdminImportVideosPage />} />
    <Route path="subjects" element={<AdminSubjectsPage />} />
    <Route path="age-groups" element={<AdminAgeGroupsPage />} />
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="analytics" element={<AdminAnalyticsPage />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Verify lint**

```
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Start dev server and smoke**

```
npm run dev
```

Open `http://localhost:5173/dashboard` in a phone-sized viewport (DevTools device emulation, e.g. iPhone 14). Expect: top stat strip, page content, bottom tab bar. Tap bar should switch between tabs. `/me` should show the placeholder shell.

- [ ] **Step 5: Commit**

```
git add src/App.tsx
git commit -m "feat(routes): wrap member routes in AppShell"
```

---

## Task A7: Build `MissionStrip` (replaces `DashboardQuests`)

**Files:**
- Create: `src/components/dashboard/MissionStrip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/dashboard/MissionStrip.tsx
//
// "Misi hari ini" — 3 daily quests. Slot 1 (first not-yet-completed) renders
// as a chunky card with a Start CTA, visible coin + XP rewards, progress bar.
// Slots 2 + 3 render as dimmed mini-cards. When all three are completed,
// shows a single "done for today" card.
import { Link } from 'react-router-dom'
import type { DashboardQuest } from '../../lib/dashboardData'

interface Props {
  quests: DashboardQuest[]
  childName: string
}

function isOpen(q: DashboardQuest): boolean {
  return q.status === 'active'
}

export default function MissionStrip({ quests, childName }: Props) {
  if (quests.length === 0) {
    return (
      <section className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-blue/30 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
        <i className="fa-solid fa-bullseye text-3xl text-qupu-brand-orange" aria-hidden="true" />
        <h3 className="mt-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          Mulai 1 quiz untuk membuka misi
        </h3>
        <p className="mt-1 text-sm font-medium text-qupu-muted">
          {childName} dapat 3 misi harian setelah quiz pertama.
        </p>
        <Link
          to="/videos"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-play" aria-hidden="true" /> Pilih video
        </Link>
      </section>
    )
  }

  const active = quests.find(isOpen) ?? null
  const others = quests.filter((q) => q.id !== active?.id)
  const allDone = active === null

  return (
    <section className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Misi hari ini
      </div>

      {allDone ? (
        <div className="rounded-[2rem] border-[3px] border-emerald-400/70 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
          <i className="fa-solid fa-circle-check text-3xl text-emerald-500" aria-hidden="true" />
          <h3 className="mt-2 font-display text-lg font-extrabold text-qupu-brand-blue">
            Semua misi selesai — kembali besok!
          </h3>
        </div>
      ) : (
        <ActiveCard quest={active!} />
      )}

      {others.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {others.slice(0, 2).map((q) => (
            <MiniCard key={q.id} quest={q} />
          ))}
        </div>
      )}
    </section>
  )
}

function ActiveCard({ quest }: { quest: DashboardQuest }) {
  const pct = Math.min(100, Math.round((quest.progressValue / Math.max(1, quest.targetValue)) * 100))
  return (
    <article className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-gradient-to-br from-white to-qupu-peach/30 p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> +{quest.coinReward ?? 0} ·
          <i className="fa-solid fa-bolt" aria-hidden="true" /> +{quest.xpReward} XP
        </span>
        <span className="font-display text-xs font-extrabold text-qupu-muted">
          {quest.progressValue} / {quest.targetValue}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-extrabold text-qupu-brand-blue">{quest.title}</h3>
      <p className="mt-1 text-sm font-medium text-qupu-muted">{quest.description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-qupu-brand-orange" style={{ width: `${pct}%` }} />
      </div>
      <Link
        to="/videos"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
      >
        <i className="fa-solid fa-play" aria-hidden="true" /> Mulai sekarang
      </Link>
    </article>
  )
}

function MiniCard({ quest }: { quest: DashboardQuest }) {
  const completed = quest.status !== 'active'
  return (
    <article
      className={`rounded-[1.25rem] border-2 border-qupu-peach bg-white/85 p-3 text-xs ${
        completed ? 'opacity-60' : 'opacity-80'
      }`}
    >
      <strong className="block font-display text-sm text-qupu-brand-blue">{quest.title}</strong>
      <div className="mt-1 text-qupu-muted">
        {quest.progressValue} / {quest.targetValue}
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-qupu-brand-yellow">
        <i className="fa-solid fa-coins" aria-hidden="true" /> +{quest.coinReward ?? 0}
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Extend `DashboardQuest` type to include `coinReward`**

Open `src/lib/dashboardData.ts`. Find the `DashboardQuest` interface (around line 64). Add `coinReward: number` after `xpReward: number`:

```ts
export interface DashboardQuest {
  id: string
  code: string
  title: string
  description: string
  questType: string
  progressValue: number
  targetValue: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  xpReward: number
  coinReward: number   // ← added: surfaced from quest_templates.coin_reward
}
```

- [ ] **Step 3: Surface `coinReward` from the dashboard API**

Open `api/services/dashboard.ts`. Find the quests query/projection. The `quest_templates.coin_reward` column exists from migration 0018. Add `coinReward: Number(row.coin_reward)` to the quest mapping. Example diff (verify exact location):

```ts
quests: questRows.map((row) => ({
  id: row.id,
  code: row.code,
  title: row.title,
  description: row.description,
  questType: row.quest_type,
  progressValue: Number(row.progress_value),
  targetValue: Number(row.target_value),
  status: row.status,
  xpReward: Number(row.xp_reward),
  coinReward: Number(row.coin_reward),
})),
```

Make sure the SQL `SELECT` includes `qt.coin_reward AS coin_reward`.

- [ ] **Step 4: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```
git add src/components/dashboard/MissionStrip.tsx src/lib/dashboardData.ts api/services/dashboard.ts
git commit -m "feat(dashboard): add MissionStrip with coin rewards"
```

---

## Task A8: Build `ShopTeaser` component

**Files:**
- Create: `src/components/dashboard/ShopTeaser.tsx`
- Modify: `src/lib/dashboardData.ts` (add optional `shopTeaserItems` to view model — or skip if Phase A doesn't fetch yet)

For Phase A, render the teaser without affordable-items query (just a CTA card). The affordable-items version is wired up in Phase C after the shop API exists.

- [ ] **Step 1: Create the component**

```tsx
// src/components/dashboard/ShopTeaser.tsx
//
// Compact yellow card on Home pointing to /shop. Phase A renders a CTA
// only — Phase C adds 1–3 affordable item thumbnails once the shop API
// exists.
import { Link } from 'react-router-dom'

interface Props {
  coinBalance: number
}

export default function ShopTeaser({ coinBalance }: Props) {
  return (
    <Link
      to="/shop"
      className="flex items-center gap-3 rounded-[2rem] bg-qupu-brand-yellow p-4 shadow-[5px_6px_0_0_#FFD3B1] transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-qupu-brand-orange">
        <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <h3 className="font-display text-base font-extrabold text-qupu-brand-blue">Toko QUPU</h3>
        <p className="text-xs font-medium text-qupu-brand-blue/70">
          Tukar koinmu jadi paket worksheet & e-book ({coinBalance} koin)
        </p>
      </div>
      <span className="rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-yellow">
        Lihat <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </span>
    </Link>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/dashboard/ShopTeaser.tsx
git commit -m "feat(dashboard): add ShopTeaser CTA card"
```

---

## Task A9: Slim down `Dashboard.tsx`

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace render with slim version**

Open `src/pages/Dashboard.tsx`. Keep the data fetch + auth guards intact (lines 24–98 in current file — verify before editing). Replace the final return (currently the multi-section block at lines 110–146) and update imports:

```tsx
// Imports — replace dashboard component imports with the slim three:
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import { logSessionEvent } from '../lib/sessionLogger'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import AuthCard from '../components/AuthCard'
import SkeletonCard from '../components/SkeletonCard'
import MissionStrip from '../components/dashboard/MissionStrip'
import ShopTeaser from '../components/dashboard/ShopTeaser'

// In the load() callback, after setVm(...), publish to the stats store:
useGamificationStats.getState().setStats({
  streak: vm.streak,
  coinBalance: vm.coinBalance,
  level: vm.level,
  tierName: vm.tierName,
  xp: vm.xp,
  xpToNext: vm.xpToNext,
})
```

Final return body (replaces the multi-section block):

```tsx
return (
  <div className="flex flex-col gap-4">
    {/* Profile hero */}
    <section className="rounded-[2rem] bg-gradient-to-br from-qupu-brand-blue to-[#2c3f74] p-5 text-white shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-qupu-peach text-2xl text-qupu-brand-blue">
          <i className="fa-solid fa-user-astronaut" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
            {vm.tierName}
          </div>
          <h2 className="font-display text-xl font-extrabold">Hai, {vm.child.name}!</h2>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-qupu-brand-yellow"
              style={{ width: `${Math.min(100, Math.round((vm.xp / Math.max(1, vm.xpToNext)) * 100))}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] font-medium text-white/70">
            {vm.xp} / {vm.xpToNext} XP · Level {vm.level}
          </div>
        </div>
      </div>
    </section>

    <MissionStrip quests={vm.quests} childName={vm.child.name} />
    <ShopTeaser coinBalance={vm.coinBalance} />

    <Link
      to="/report"
      className="self-start text-xs font-bold uppercase tracking-[0.18em] text-qupu-brand-orange underline-offset-4 hover:underline"
    >
      Lihat rapor lengkap →
    </Link>
  </div>
)
```

The "no active child" branch (currently lines 67–85) stays the same. The empty-zero-activity branch (lines 102–108) can be removed since the slim landing reads sensibly for new users — verify the brand-new flow renders OK in Step 3 below.

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Smoke check in browser**

Restart `npm run dev` if not running. Open `/dashboard` on a phone viewport. Expect: profile hero, mission strip (3 cards or empty CTA), shop teaser, "Lihat rapor →" link. No KPI strip, no Subjects card, no Recommended, no Attempts/Badges grid.

- [ ] **Step 4: Commit**

```
git add src/pages/Dashboard.tsx
git commit -m "refactor(dashboard): slim landing to profile + missions + shop teaser"
```

---

## Task A10: Expand `Report.tsx` to host moved sections

**Files:**
- Modify: `src/pages/Report.tsx`

- [ ] **Step 1: Read the current Report.tsx**

```
cat src/pages/Report.tsx
```

The current page renders a focused performance report. We'll append the moved sections under it (KPIs, Activity, Subjects, Recommended, Attempts).

- [ ] **Step 2: Import the dashboard section components and the dashboard view model fetch**

The existing Report likely already fetches its own data. We need the dashboard payload too — either by sharing the existing `/api/me/dashboard` call or refactoring. Cheapest path for v1: also fetch `/api/me/dashboard` on Report mount and pass `vm.subjects / vm.attempts / vm.kpis / vm.recommended / vm.heatmap` to the dashboard section components.

Add to Report.tsx (preserving the existing report code):

```tsx
import DashboardKpis from '../components/dashboard/DashboardKpis'
import DashboardActivity from '../components/dashboard/DashboardActivity'
import DashboardSubjects from '../components/dashboard/DashboardSubjects'
import DashboardRecommended from '../components/dashboard/DashboardRecommended'
import DashboardAttempts from '../components/dashboard/DashboardAttempts'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'

// Inside the component, add a second effect that fetches the dashboard
// payload (separate from the report's own data load):
const [vm, setVm] = useState<DashboardViewModel | null>(null)
useEffect(() => {
  if (!activeChildId) return
  let cancelled = false
  ;(async () => {
    try {
      const response = await api.get('/me/dashboard', { params: { childId: activeChildId } })
      if (cancelled) return
      setVm(dashboardFromApi(response.data.data as DashboardApiResponse))
    } catch (err) {
      console.error('Failed to load dashboard sections for report:', err)
    }
  })()
  return () => { cancelled = true }
}, [activeChildId])

// Render appended after the existing report content:
{vm && (
  <>
    <DashboardKpis tiles={vm.kpis} />
    <section className="grid gap-6 lg:grid-cols-2">
      <DashboardActivity vm={vm} />
      <DashboardSubjects subjects={vm.subjects} childName={vm.child.name} />
    </section>
    <DashboardRecommended items={vm.recommended} childName={vm.child.name} />
    <DashboardAttempts attempts={vm.attempts} childName={vm.child.name} />
  </>
)}
```

- [ ] **Step 3: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 4: Smoke**

Open `/report` on a phone viewport. Expect: existing report on top, KPI strip, activity + subjects grid, recommended carousel, attempts list. All should render under the AppShell chrome.

- [ ] **Step 5: Commit**

```
git add src/pages/Report.tsx
git commit -m "feat(report): host KPIs/activity/subjects/recommended/attempts"
```

---

## Task A11: Delete superseded components

**Files:**
- Delete: `src/components/dashboard/DashboardQuests.tsx`
- Delete: `src/components/dashboard/DashboardEmptyState.tsx`

- [ ] **Step 1: Verify no remaining imports**

```
grep -rn "DashboardQuests\|DashboardEmptyState" src/ api/
```

Expected: no matches (or only the imports inside the files about to be deleted).

- [ ] **Step 2: Delete**

```
rm src/components/dashboard/DashboardQuests.tsx src/components/dashboard/DashboardEmptyState.tsx
```

- [ ] **Step 3: Verify typecheck + lint**

```
npm run check && npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```
git add -u src/components/dashboard/DashboardQuests.tsx src/components/dashboard/DashboardEmptyState.tsx
git commit -m "chore(dashboard): remove superseded DashboardQuests + EmptyState"
```

---

## Task A12: Phase A integration smoke

- [ ] **Step 1: Full check + lint + build**

```
npm run check && npm run lint && npm run build
```

Expected: PASS.

- [ ] **Step 2: Manual phone-viewport walkthrough**

Restart dev server. In a 390×844 viewport:
1. Log in as a member (non-admin).
2. Land on `/dashboard` → profile hero, mission strip (or empty CTA), shop teaser, link to report.
3. Top stat strip shows streak/coins/level. Bottom tab bar has 5 tabs.
4. Tap each tab → routes change, chrome stays.
5. `/shop` shows the stub. `/me` shows the placeholder shell.
6. `/report` shows the moved sections.
7. `/badges` still works (no changes).
8. Log in as admin → `/admin/*` is unaffected.

Capture any issues; fix and re-commit before moving to Phase B.

---

# Phase B — Shop backend (migration + service + tests)

## Task B1: Migration `0019_shop.sql` + schema mirror

**Files:**
- Create: `db/migrations/0019_shop.sql`
- Modify: `db/schema.sql`

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0019_shop.sql
--
-- Phase 2 shop: items catalog + per-child inventory.
--
-- shop_items: the catalog. Mock digital products (worksheet / ebook /
-- coloring / sticker / audio). is_active soft-deletes without
-- breaking purchased rows (RESTRICT below).
--
-- child_inventory: idempotency of (child_id, shop_item_id) IS the
-- purchase guard. coin_balance debit happens atomically against
-- gamification_profiles (CHECK >= 0 from migration 0018).
--
-- See docs/superpowers/specs/2026-05-25-duolingo-gamification-phase2-design.md

CREATE TABLE IF NOT EXISTS shop_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('worksheet','ebook','coloring','sticker','audio')),
  coin_price    INT  NOT NULL CHECK (coin_price > 0),
  thumbnail_url TEXT,
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shop_items_active_sort
  ON shop_items (is_active, sort_order) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS child_inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id)    ON DELETE CASCADE,
  shop_item_id  UUID NOT NULL REFERENCES shop_items(id)  ON DELETE RESTRICT,
  coins_spent   INT  NOT NULL CHECK (coins_spent >= 0),
  acquired_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, shop_item_id)
);
CREATE INDEX IF NOT EXISTS idx_child_inventory_child
  ON child_inventory (child_id, acquired_at DESC);

-- Seed 10 placeholder items. Slugs are stable so re-runs of the seed
-- file in dev are idempotent.
INSERT INTO shop_items (slug, name, description, kind, coin_price, sort_order) VALUES
  ('worksheet-aksara-1',   'Paket Aksara 1',     'Lembar latihan menulis huruf A–M.',           'worksheet', 100, 10),
  ('worksheet-aksara-2',   'Paket Aksara 2',     'Lembar latihan menulis huruf N–Z.',           'worksheet', 100, 11),
  ('worksheet-angka-1',    'Paket Angka 1',      'Latihan menulis dan menghitung 1–20.',        'worksheet', 100, 12),
  ('worksheet-angka-2',    'Paket Angka 2',      'Soal cerita penjumlahan untuk pemula.',       'worksheet', 100, 13),
  ('ebook-petualangan',    'Cerita Petualangan', 'E-book cerita pendek bergambar.',             'ebook',     200, 20),
  ('ebook-sains',          'Sains Seru',         'E-book pengantar konsep sains untuk anak.',   'ebook',     200, 21),
  ('ebook-dongeng',        'Kumpulan Dongeng',   'Lima dongeng pilihan dengan ilustrasi.',      'ebook',     200, 22),
  ('coloring-hewan',       'Mewarnai: Hewan',    'Buku mewarnai bertema hewan kebun binatang.', 'coloring',  150, 30),
  ('coloring-kendaraan',   'Mewarnai: Kendaraan','Buku mewarnai bertema kendaraan.',            'coloring',  150, 31),
  ('sticker-mascot',       'Stiker Mascot',      'Paket stiker tokoh QUPU.',                    'sticker',    50, 40),
  ('sticker-musim',        'Stiker Musim',       'Paket stiker bertema empat musim.',           'sticker',    50, 41),
  ('audio-cerita',         'Audio: Dongeng',     'Audio dongeng 10 menit untuk pengantar tidur.','audio',    300, 50)
ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 2: Mirror into `db/schema.sql`**

Append the same `CREATE TABLE`, `CREATE INDEX`, and `INSERT` statements to the end of `db/schema.sql` (without the `IF NOT EXISTS` guards if the rest of `schema.sql` uses plain `CREATE` — match the existing convention by inspecting nearby DDL).

- [ ] **Step 3: Apply to dev DB**

The project rule says `DATABASE_URL` has special chars — use discrete psql flags. Parse the connection string by hand (`host`, `port`, `user`, `dbname` from the URL; `PGPASSWORD` separately):

```
PGPASSWORD='<pwd>' psql -h <host> -p <port> -U <user> -d qupu -f db/migrations/0019_shop.sql
```

Expected: `CREATE TABLE`, `CREATE INDEX`, `INSERT 0 12` (or `0 0` if previously run).

- [ ] **Step 4: Apply to test DB**

```
PGPASSWORD='<pwd>' psql -h <host> -p <port> -U <user> -d qupu_test -f db/migrations/0019_shop.sql
```

Expected same.

- [ ] **Step 5: Commit**

```
git add db/migrations/0019_shop.sql db/schema.sql
git commit -m "feat(db): add shop_items + child_inventory tables"
```

---

## Task B2: Shop service types

**Files:**
- Create: `api/services/shop/types.ts`

- [ ] **Step 1: Create file**

```ts
// api/services/shop/types.ts
//
// Shared TS types for the shop service + route layer.

export type ShopItemKind = 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'

export interface ShopItem {
  id: string
  slug: string
  name: string
  description: string
  kind: ShopItemKind
  coinPrice: number
  thumbnailUrl: string | null
  sortOrder: number
}

export interface ShopItemForChild extends ShopItem {
  owned: boolean
  affordable: boolean
}

export interface InventoryItem {
  inventoryId: string
  itemId: string
  name: string
  kind: ShopItemKind
  thumbnailUrl: string | null
  acquiredAt: string // ISO
}

export type PurchaseResult =
  | { status: 'purchased'; balance: number; inventoryId: string; item: ShopItem }
  | { status: 'already_owned'; balance: number; item: ShopItem }
  | { status: 'insufficient_funds'; balance: number; price: number }
  | { status: 'not_found' }
  | { status: 'not_available' }

// Sentinel error used to force a withTransaction rollback while still
// carrying the structured data the route handler returns to the client.
export class InsufficientFundsError extends Error {
  constructor(public price: number, public currentBalance: number) {
    super('insufficient funds')
  }
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add api/services/shop/types.ts
git commit -m "feat(shop): add shared service types"
```

---

## Task B3: Add `SHOP_PURCHASE` to RewardType

**Files:**
- Modify: `api/services/gamification/ledger.ts`

- [ ] **Step 1: Extend the union**

Open `api/services/gamification/ledger.ts`. Find the `RewardType` union (around line 13). Add `| 'SHOP_PURCHASE'` at the end:

```ts
export type RewardType =
  | 'QUIZ_COMPLETION_XP'
  | 'SCORE_IMPROVED_XP'
  | 'HIGH_SCORE_XP'
  | 'PERFECT_SCORE_XP'
  | 'DAILY_QUEST_XP'
  | 'ACHIEVEMENT_XP'
  | 'STREAK_BONUS_XP'
  | 'SHOP_PURCHASE'
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add api/services/gamification/ledger.ts
git commit -m "feat(gamification): add SHOP_PURCHASE reward type"
```

---

## Task B4: Catalog + inventory read services

**Files:**
- Create: `api/services/shop/catalog.ts`
- Create: `api/services/shop/inventory.ts`

- [ ] **Step 1: Create `catalog.ts`**

```ts
// api/services/shop/catalog.ts
//
// listItemsForChild: every active shop item, plus per-child owned and
// affordable flags. One round-trip — joins inventory + the child's
// coin_balance in a single SELECT.

import { query, queryOne } from '../../db.js'
import type { ShopItemForChild } from './types.js'

interface Row {
  id: string
  slug: string
  name: string
  description: string
  kind: 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'
  coin_price: number
  thumbnail_url: string | null
  sort_order: number
  owned: boolean
}

export async function listItemsForChild(childId: string): Promise<ShopItemForChild[]> {
  const balanceRow = await queryOne<{ coin_balance: number }>(
    `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  const balance = Number(balanceRow?.coin_balance ?? 0)

  const rows = await query<Row>(
    `SELECT si.id, si.slug, si.name, si.description, si.kind,
            si.coin_price, si.thumbnail_url, si.sort_order,
            (ci.id IS NOT NULL) AS owned
       FROM shop_items si
       LEFT JOIN child_inventory ci
         ON ci.shop_item_id = si.id AND ci.child_id = $1
       WHERE si.is_active = TRUE
       ORDER BY si.sort_order, si.name`,
    [childId],
  )

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind,
    coinPrice: Number(r.coin_price),
    thumbnailUrl: r.thumbnail_url,
    sortOrder: Number(r.sort_order),
    owned: r.owned,
    affordable: balance >= Number(r.coin_price),
  }))
}
```

- [ ] **Step 2: Create `inventory.ts`**

```ts
// api/services/shop/inventory.ts
//
// listInventory: items the child owns, newest-first. No pagination — v1
// inventories are small (<20 items expected).

import { query } from '../../db.js'
import type { InventoryItem } from './types.js'

interface Row {
  inventory_id: string
  item_id: string
  name: string
  kind: 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'
  thumbnail_url: string | null
  acquired_at: Date
}

export async function listInventory(childId: string): Promise<InventoryItem[]> {
  const rows = await query<Row>(
    `SELECT ci.id          AS inventory_id,
            si.id          AS item_id,
            si.name,
            si.kind,
            si.thumbnail_url,
            ci.acquired_at
       FROM child_inventory ci
       JOIN shop_items si ON si.id = ci.shop_item_id
       WHERE ci.child_id = $1
       ORDER BY ci.acquired_at DESC`,
    [childId],
  )
  return rows.map((r) => ({
    inventoryId: r.inventory_id,
    itemId: r.item_id,
    name: r.name,
    kind: r.kind,
    thumbnailUrl: r.thumbnail_url,
    acquiredAt: r.acquired_at.toISOString(),
  }))
}
```

- [ ] **Step 3: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```
git add api/services/shop/catalog.ts api/services/shop/inventory.ts
git commit -m "feat(shop): add catalog + inventory read services"
```

---

## Task B5: Purchase service (the rigid algorithm)

**Files:**
- Create: `api/services/shop/purchase.ts`

- [ ] **Step 1: Create the service**

```ts
// api/services/shop/purchase.ts
//
// Atomic, race-safe purchase. Five steps inside withTransaction:
//   1. SELECT shop_items FOR UPDATE — locks the row so price can't change
//      mid-purchase. Validates active.
//   2. INSERT child_inventory ON CONFLICT DO NOTHING RETURNING id —
//      UNIQUE(child_id, shop_item_id) makes (kid, item) the natural
//      idempotency key. If RETURNING is empty, the kid already owns this
//      item — short-circuit with already_owned + current balance.
//   3. UPDATE gamification_profiles SET coin_balance -= price
//        WHERE coin_balance >= price RETURNING coin_balance.
//      If RETURNING is empty, balance dipped below price under us —
//      throw InsufficientFundsError so withTransaction rolls back the
//      inventory insert.
//   4. appendLedger SHOP_PURCHASE with negative coin_delta, idempotent
//      on the new inventory row id.
//   5. Return purchased.

import { queryOne, withTransaction } from '../../db.js'
import { appendLedger } from '../gamification/ledger.js'
import { InsufficientFundsError, type PurchaseResult, type ShopItem } from './types.js'

interface ItemRow {
  id: string
  slug: string
  name: string
  description: string
  kind: 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'
  coin_price: number
  thumbnail_url: string | null
  sort_order: number
  is_active: boolean
}

function mapItem(r: ItemRow): ShopItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind,
    coinPrice: Number(r.coin_price),
    thumbnailUrl: r.thumbnail_url,
    sortOrder: Number(r.sort_order),
  }
}

export async function purchaseItem(
  childId: string,
  itemId: string,
): Promise<PurchaseResult> {
  try {
    return await withTransaction(async (client) => {
      // 1. Lock the item row + read current price.
      const item = await queryOne<ItemRow>(
        `SELECT id, slug, name, description, kind, coin_price,
                thumbnail_url, sort_order, is_active
           FROM shop_items WHERE id = $1 FOR UPDATE`,
        [itemId],
        client,
      )
      if (!item) return { status: 'not_found' }
      if (!item.is_active) return { status: 'not_available' }
      const mapped = mapItem(item)

      // 2. Idempotency-checked insert.
      const inv = await queryOne<{ id: string }>(
        `INSERT INTO child_inventory (child_id, shop_item_id, coins_spent)
           VALUES ($1, $2, $3)
           ON CONFLICT (child_id, shop_item_id) DO NOTHING
           RETURNING id`,
        [childId, itemId, mapped.coinPrice],
        client,
      )

      if (!inv) {
        // Already owned. Fetch current balance so the client can refresh UI.
        const bal = await queryOne<{ coin_balance: number }>(
          `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
          [childId],
          client,
        )
        return { status: 'already_owned', balance: Number(bal?.coin_balance ?? 0), item: mapped }
      }

      // 3. Conditional debit.
      const debit = await queryOne<{ coin_balance: number }>(
        `UPDATE gamification_profiles
            SET coin_balance = coin_balance - $1, updated_at = NOW()
            WHERE child_id = $2 AND coin_balance >= $1
            RETURNING coin_balance`,
        [mapped.coinPrice, childId],
        client,
      )

      if (!debit) {
        const bal = await queryOne<{ coin_balance: number }>(
          `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
          [childId],
          client,
        )
        throw new InsufficientFundsError(mapped.coinPrice, Number(bal?.coin_balance ?? 0))
      }

      // 4. Append ledger (idempotent on inventory id).
      await appendLedger(client, {
        childId,
        rewardType: 'SHOP_PURCHASE',
        sourceType: 'child_inventory',
        sourceId: inv.id,
        xpDelta: 0,
        coinDelta: -mapped.coinPrice,
        metadata: { itemSlug: mapped.slug, itemName: mapped.name, itemKind: mapped.kind },
      })

      return {
        status: 'purchased',
        balance: Number(debit.coin_balance),
        inventoryId: inv.id,
        item: mapped,
      }
    })
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      return { status: 'insufficient_funds', balance: err.currentBalance, price: err.price }
    }
    throw err
  }
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add api/services/shop/purchase.ts
git commit -m "feat(shop): add rigid purchaseItem service"
```

---

## Task B6: Integration tests (the 6 from the spec)

**Files:**
- Create: `api/__tests__/shop/purchase.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// api/__tests__/shop/purchase.test.ts
//
// Race-safe coin-spending tests. Skips unless TEST_DATABASE_URL is set
// (see api/__tests__/setup.ts). Reuses createFixtures() to build a
// parent + child + age group + subject + video graph.

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne, withTransaction } from '../../db.js'
import { purchaseItem } from '../../services/shop/purchase.js'
import { ensureProfile, updateProfileWithDelta } from '../../services/gamification/profileUpdater.js'
import { wibDateString } from '../../lib/wib.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

async function seedItem(price: number): Promise<string> {
  const slug = `test-item-${randomUUID().slice(0, 8)}`
  const row = await queryOne<{ id: string }>(
    `INSERT INTO shop_items (slug, name, description, kind, coin_price)
       VALUES ($1, $2, $3, 'worksheet', $4) RETURNING id`,
    [slug, `Test Item ${slug}`, 'A test item.', price],
  )
  return row!.id
}

async function setBalance(childId: string, balance: number): Promise<void> {
  const today = wibDateString(new Date())
  await ensureProfile(childId)
  // Drop balance to zero first (cannot set negative), then add the desired
  // amount via the atomic helper so we exercise the same code path.
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE gamification_profiles SET coin_balance = 0 WHERE child_id = $1`,
      [childId],
    )
  })
  if (balance > 0) {
    await updateProfileWithDelta({ childId, xpDelta: 0, coinDelta: balance, activityDate: today })
  }
}

async function fetchBalance(childId: string): Promise<number> {
  const row = await queryOne<{ coin_balance: number }>(
    `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  return Number(row?.coin_balance ?? 0)
}

async function countLedger(childId: string, sourceId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE' AND source_id = $2`,
    [childId, sourceId],
  )
  return Number(rows[0]?.count ?? 0)
}

describe.skipIf(!RUN)('shop purchase', () => {
  let fx: Fixtures
  const itemIds: string[] = []

  beforeEach(async () => {
    fx = await createFixtures()
  })

  afterEach(async () => {
    await cleanupFixtures(fx)
    if (itemIds.length > 0) {
      await query(`DELETE FROM shop_items WHERE id = ANY($1::uuid[])`, [itemIds])
      itemIds.length = 0
    }
  })

  afterAll(async () => {
    await pool.end()
  })

  it('happy path: kid with enough coins purchases an item', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 200)

    const result = await purchaseItem(fx.childId, itemId)
    expect(result.status).toBe('purchased')
    if (result.status !== 'purchased') return
    expect(result.balance).toBe(100)
    expect(result.item.coinPrice).toBe(100)

    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(1)
    expect(await countLedger(fx.childId, result.inventoryId)).toBe(1)
    expect(await fetchBalance(fx.childId)).toBe(100)
  })

  it('insufficient funds leaves balance and inventory untouched', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 50)

    const result = await purchaseItem(fx.childId, itemId)
    expect(result.status).toBe('insufficient_funds')
    if (result.status === 'insufficient_funds') {
      expect(result.balance).toBe(50)
      expect(result.price).toBe(100)
    }

    expect(await fetchBalance(fx.childId)).toBe(50)
    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(0)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(0)
  })

  it('idempotency: same purchase twice → already_owned, single debit', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 300)

    const first = await purchaseItem(fx.childId, itemId)
    expect(first.status).toBe('purchased')

    const second = await purchaseItem(fx.childId, itemId)
    expect(second.status).toBe('already_owned')

    expect(await fetchBalance(fx.childId)).toBe(200)
    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(1)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(1)
  })

  it('race safety (same item): 10 parallel purchases → 1 purchased, 9 already_owned, single debit', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 300)

    const results = await Promise.all(
      Array.from({ length: 10 }, () => purchaseItem(fx.childId, itemId)),
    )
    const purchased = results.filter((r) => r.status === 'purchased').length
    const owned = results.filter((r) => r.status === 'already_owned').length
    expect(purchased).toBe(1)
    expect(owned).toBe(9)
    expect(await fetchBalance(fx.childId)).toBe(200)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(1)
  })

  it('race safety (cross-product): kid with just enough for 4 of 5 items', async () => {
    const ids = await Promise.all([
      seedItem(100), seedItem(100), seedItem(100), seedItem(100), seedItem(100),
    ])
    ids.forEach((id) => itemIds.push(id))
    await setBalance(fx.childId, 400) // exactly 4 affordable

    const results = await Promise.all(ids.map((id) => purchaseItem(fx.childId, id)))
    const purchased = results.filter((r) => r.status === 'purchased').length
    const insufficient = results.filter((r) => r.status === 'insufficient_funds').length
    expect(purchased).toBe(4)
    expect(insufficient).toBe(1)
    expect(await fetchBalance(fx.childId)).toBe(0)

    const ledgerRows = await query<{ coin_delta: number }>(
      `SELECT coin_delta FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    const sumDebits = ledgerRows.reduce((acc, r) => acc + Number(r.coin_delta), 0)
    expect(sumDebits).toBe(-400)
  })

  it('CHECK belt-and-braces: direct UPDATE to negative balance errors', async () => {
    await setBalance(fx.childId, 50)
    await expect(
      query(`UPDATE gamification_profiles SET coin_balance = -1 WHERE child_id = $1`, [fx.childId]),
    ).rejects.toThrow(/coin_balance/i)
  })
})
```

- [ ] **Step 2: Run the suite against the test DB**

```
TEST_DATABASE_URL='postgres://<user>:<pwd>@<host>:<port>/qupu_test' npm test -- api/__tests__/shop/purchase.test.ts
```

Expected: 6 passed.

If any test fails, fix the underlying service (not the test) and re-run. Common gotcha: the CHECK constraint test will only error if migration 0018 was applied to `qupu_test` — confirm with `\d gamification_profiles` if needed.

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```
TEST_DATABASE_URL='postgres://<user>:<pwd>@<host>:<port>/qupu_test' npm test
```

Expected: existing 10 coin/XP tests still pass + the new 6 pass = 16 passing.

- [ ] **Step 4: Commit**

```
git add api/__tests__/shop/purchase.test.ts
git commit -m "test(shop): rigid purchase suite (happy + insufficient + idempotent + race)"
```

---

## Task B7: Shop route handler

**Files:**
- Create: `api/routes/shop.ts`

- [ ] **Step 1: Create the route module**

```ts
// api/routes/shop.ts
//
// Three endpoints:
//   GET  /api/shop/items?childId=X
//   POST /api/shop/purchase   body { childId, itemId }
//   GET  /api/me/inventory?childId=X
//
// All require authentication; childId must belong to the authenticated
// user. Validation via Joi.

import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'
import { queryOne } from '../db.js'
import { listItemsForChild } from '../services/shop/catalog.js'
import { listInventory } from '../services/shop/inventory.js'
import { purchaseItem } from '../services/shop/purchase.js'

const router = Router()
router.use(authenticateToken)

const childIdQuery = Joi.object({ childId: Joi.string().uuid().required() })

async function assertChildBelongsToUser(childId: string, userId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM children WHERE id = $1 AND parent_user_id = $2`,
    [childId, userId],
  )
  return Boolean(row)
}

router.get('/items', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = childIdQuery.validate(req.query)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const childId = value.childId as string
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const items = await listItemsForChild(childId)
  res.json({ success: true, data: { items } })
})

const purchaseBody = Joi.object({
  childId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
})

router.post('/purchase', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = purchaseBody.validate(req.body)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const { childId, itemId } = value as { childId: string; itemId: string }
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const result = await purchaseItem(childId, itemId)
  switch (result.status) {
    case 'purchased':
    case 'already_owned':
      res.json({ success: true, data: result }); return
    case 'insufficient_funds':
      res.status(400).json({ success: false, error: 'Insufficient coins', data: result }); return
    case 'not_found':
      res.status(404).json({ success: false, error: 'Item not found' }); return
    case 'not_available':
      res.status(404).json({ success: false, error: 'Item not available' }); return
  }
})

export const inventoryRouter = Router()
inventoryRouter.use(authenticateToken)
inventoryRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = childIdQuery.validate(req.query)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const childId = value.childId as string
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const items = await listInventory(childId)
  res.json({ success: true, data: { items } })
})

export default router
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add api/routes/shop.ts
git commit -m "feat(shop): add /api/shop and /api/me/inventory routes"
```

---

## Task B8: Mount routes in `api/app.ts`

**Files:**
- Modify: `api/app.ts`

- [ ] **Step 1: Add the import and mounts**

Open `api/app.ts`. Add the import near the other route imports (after line 15):

```ts
import shopRoutes, { inventoryRouter as inventoryRoutes } from './routes/shop.js'
```

Add the mounts before `memberRoutes` (the order matters because `/api/me/inventory` must register before the catch-all `/api/me`):

```ts
app.use('/api/shop', shopRoutes)
app.use('/api/me/inventory', inventoryRoutes)
```

So the routes block (around lines 50–58 today) becomes:

```ts
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/meta', metaRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/shop', shopRoutes)                  // ← new
app.use('/api/me/dashboard', dashboardRoutes)
app.use('/api/me/inventory', inventoryRoutes)     // ← new
app.use('/api/me/children', childrenRoutes)
app.use('/api/me', memberRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Smoke via dev server**

```
npm run dev
```

In another shell, with a valid JWT (`AUTH=...` exported), curl the three endpoints with a real `childId`:

```
curl -H "Authorization: Bearer $AUTH" "http://localhost:3001/api/shop/items?childId=$CHILD"
curl -H "Authorization: Bearer $AUTH" -H 'Content-Type: application/json' -X POST \
     -d "{\"childId\":\"$CHILD\",\"itemId\":\"$ITEM\"}" \
     http://localhost:3001/api/shop/purchase
curl -H "Authorization: Bearer $AUTH" "http://localhost:3001/api/me/inventory?childId=$CHILD"
```

Expected: 200 with `{ success: true, data: ... }` for the GETs; 200 with `status: 'purchased'` for the POST (assuming sufficient balance).

- [ ] **Step 4: Commit**

```
git add api/app.ts
git commit -m "feat(api): mount /api/shop and /api/me/inventory"
```

---

## Task B9: Phase B verification

- [ ] **Step 1: Re-run the full test suite**

```
TEST_DATABASE_URL='postgres://<user>:<pwd>@<host>:<port>/qupu_test' npm test
```

Expected: 16 passing (10 existing + 6 new).

- [ ] **Step 2: Re-run typecheck + lint + build**

```
npm run check && npm run lint && npm run build
```

Expected: PASS.

---

# Phase C — Shop UI

## Task C1: `shopApi.ts` typed wrappers

**Files:**
- Create: `src/lib/shopApi.ts`

- [ ] **Step 1: Create**

```ts
// src/lib/shopApi.ts
//
// Typed axios wrappers for the shop endpoints. Re-exports the union types
// from the backend service so the UI can pattern-match on result.status
// without redefining shapes.

import api from './api'

export type ShopItemKind = 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'

export interface ShopItem {
  id: string
  slug: string
  name: string
  description: string
  kind: ShopItemKind
  coinPrice: number
  thumbnailUrl: string | null
  sortOrder: number
}

export interface ShopItemForChild extends ShopItem {
  owned: boolean
  affordable: boolean
}

export interface InventoryItem {
  inventoryId: string
  itemId: string
  name: string
  kind: ShopItemKind
  thumbnailUrl: string | null
  acquiredAt: string
}

export type PurchaseResult =
  | { status: 'purchased'; balance: number; inventoryId: string; item: ShopItem }
  | { status: 'already_owned'; balance: number; item: ShopItem }
  | { status: 'insufficient_funds'; balance: number; price: number }
  | { status: 'not_found' }
  | { status: 'not_available' }

export async function fetchShopItems(childId: string): Promise<ShopItemForChild[]> {
  const res = await api.get('/shop/items', { params: { childId } })
  return res.data.data.items as ShopItemForChild[]
}

export async function purchaseShopItem(childId: string, itemId: string): Promise<PurchaseResult> {
  try {
    const res = await api.post('/shop/purchase', { childId, itemId })
    return res.data.data as PurchaseResult
  } catch (err: unknown) {
    // 400 insufficient_funds returns the structured payload too.
    if (
      typeof err === 'object' && err !== null && 'response' in err &&
      typeof (err as { response?: { data?: { data?: { status?: string } } } }).response?.data?.data?.status === 'string'
    ) {
      return (err as { response: { data: { data: PurchaseResult } } }).response.data.data
    }
    throw err
  }
}

export async function fetchInventory(childId: string): Promise<InventoryItem[]> {
  const res = await api.get('/me/inventory', { params: { childId } })
  return res.data.data.items as InventoryItem[]
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/lib/shopApi.ts
git commit -m "feat(shop): add typed shop API wrappers"
```

---

## Task C2: `BottomSheet` primitive

**Files:**
- Create: `src/components/shop/BottomSheet.tsx`

- [ ] **Step 1: Create the primitive**

```tsx
// src/components/shop/BottomSheet.tsx
//
// Mobile-first bottom sheet primitive. Backdrop click + Escape close.
// No drag-to-dismiss in v1 — keeps the kid from accidentally dropping
// it mid-purchase. Animation via CSS transitions on transform.
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-qupu-peach" aria-hidden="true" />
        <div className="px-5 pb-6">{children}</div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/shop/BottomSheet.tsx
git commit -m "feat(shop): add BottomSheet primitive"
```

---

## Task C3: `ShopItemCard`

**Files:**
- Create: `src/components/shop/ShopItemCard.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/shop/ShopItemCard.tsx
//
// Catalog tile. Renders thumbnail (or a coloured placeholder if missing),
// name, price chip, and an overlay badge for owned / unaffordable items.
import type { ShopItemForChild } from '../../lib/shopApi'

interface Props {
  item: ShopItemForChild
  balance: number
  onTap: () => void
}

const KIND_TINT: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'bg-qupu-brand-yellow',
  ebook:     'bg-qupu-brand-blue text-white',
  coloring:  'bg-qupu-peach',
  sticker:   'bg-emerald-300',
  audio:     'bg-rose-300',
}

export default function ShopItemCard({ item, balance, onTap }: Props) {
  const shortBy = item.coinPrice - balance
  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-peach bg-white text-left shadow-[5px_6px_0_0_#FFD3B1] transition-transform active:scale-[0.98]"
    >
      <div className={`flex h-28 items-center justify-center ${KIND_TINT[item.kind]}`}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className="fa-solid fa-image text-3xl opacity-70" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="line-clamp-1 font-display text-sm font-extrabold text-qupu-brand-blue">{item.name}</div>
        <div className="inline-flex items-center gap-1 self-start rounded-full bg-qupu-brand-yellow px-2 py-0.5 text-[11px] font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> {item.coinPrice}
        </div>
      </div>
      {item.owned && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
          <i className="fa-solid fa-check" aria-hidden="true" /> Dimiliki
        </span>
      )}
      {!item.owned && !item.affordable && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue/85 px-2 py-0.5 text-[10px] font-extrabold text-white">
          Butuh {shortBy} lagi
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/shop/ShopItemCard.tsx
git commit -m "feat(shop): add ShopItemCard catalog tile"
```

---

## Task C4: `PurchaseSheet`

**Files:**
- Create: `src/components/shop/PurchaseSheet.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/shop/PurchaseSheet.tsx
//
// Bottom sheet for: tap a card → see item detail → confirm → buy.
// Confirm dialog is a second tap inside the same sheet (not a separate
// modal) to keep it phone-native. CTA is disabled when unaffordable.
import { useState } from 'react'
import BottomSheet from './BottomSheet'
import type { PurchaseResult, ShopItemForChild } from '../../lib/shopApi'
import { purchaseShopItem } from '../../lib/shopApi'

interface Props {
  open: boolean
  onClose: () => void
  item: ShopItemForChild | null
  childId: string
  balance: number
  onPurchased: (result: PurchaseResult) => void
}

export default function PurchaseSheet({ open, onClose, item, childId, balance, onPurchased }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!item) return null
  const affordable = balance >= item.coinPrice
  const owned = item.owned

  async function handleBuy() {
    if (!item) return
    setSubmitting(true)
    try {
      const result = await purchaseShopItem(childId, item.id)
      onPurchased(result)
    } finally {
      setSubmitting(false)
      setConfirming(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={() => { setConfirming(false); onClose() }}>
      <div className="space-y-3">
        <div className="flex h-40 items-center justify-center rounded-[1.25rem] bg-qupu-shell">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
          ) : (
            <i className="fa-solid fa-image text-5xl text-qupu-muted" aria-hidden="true" />
          )}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-qupu-brand-orange">{item.kind}</div>
        <h2 className="font-display text-xl font-extrabold text-qupu-brand-blue">{item.name}</h2>
        <p className="text-sm font-medium text-qupu-muted">{item.description}</p>
        <div className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> {item.coinPrice} koin
        </div>

        {owned ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
          >
            <i className="fa-solid fa-check" aria-hidden="true" /> Sudah ada di inventaris
          </button>
        ) : !affordable ? (
          <button
            type="button"
            disabled
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-muted/40 px-6 py-3 font-display text-base font-extrabold text-white"
          >
            Butuh {item.coinPrice - balance} koin lagi
          </button>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
          >
            <i className="fa-solid fa-coins" aria-hidden="true" /> Beli — {item.coinPrice} koin
          </button>
        ) : (
          <div className="mt-2 space-y-2 rounded-[1.25rem] bg-qupu-shell p-3">
            <p className="text-center text-sm font-bold text-qupu-brand-blue">
              Tukar {item.coinPrice} koin untuk {item.name}?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold text-qupu-brand-blue"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBuy}
                disabled={submitting}
                className="flex-1 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white disabled:opacity-60"
              >
                {submitting ? 'Memproses…' : 'Ya, tukar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/shop/PurchaseSheet.tsx
git commit -m "feat(shop): add PurchaseSheet with confirm + buy"
```

---

## Task C5: `PurchaseCelebration`

**Files:**
- Create: `src/components/shop/PurchaseCelebration.tsx`

- [ ] **Step 1: Create the celebration overlay**

```tsx
// src/components/shop/PurchaseCelebration.tsx
//
// Full-screen overlay shown after a successful purchase. Pure CSS confetti
// (no emoji glyphs per project rule) + scale-up spring on the item card.
// Auto-dismisses after 2.5s or on tap.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { ShopItem } from '../../lib/shopApi'

interface Props {
  item: ShopItem
  onDismiss: () => void
}

const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 90) % 700}ms`,
  color: ['#F0853A', '#FFB400', '#1d2a4d', '#58CC02'][i % 4],
}))

export default function PurchaseCelebration({ item, onDismiss }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 2500)
    return () => window.clearTimeout(t)
  }, [onDismiss])

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-qupu-brand-blue/90 px-6 text-center text-white"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute top-0 h-2 w-2 animate-[fall_1.6s_ease-in_forwards] rounded-sm"
            style={{ left: c.left, backgroundColor: c.color, animationDelay: c.delay }}
          />
        ))}
      </div>
      <i className="fa-solid fa-gift text-6xl text-qupu-brand-yellow" aria-hidden="true" />
      <h2 className="font-display text-3xl font-extrabold">Hore!</h2>
      <p className="font-display text-xl font-extrabold">
        Kamu dapat <span className="text-qupu-brand-yellow">{item.name}</span>
      </p>
      <p className="text-sm font-medium opacity-80">Tersimpan di inventaris kamu</p>
      <Link
        to="/me#koleksi"
        className="z-10 mt-2 inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-5 py-2 font-display text-sm font-extrabold text-qupu-brand-blue"
        onClick={(e) => { e.stopPropagation() }}
      >
        Lihat inventaris <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </Link>
    </button>
  )
}
```

- [ ] **Step 2: Add the `fall` keyframe to global CSS**

Open `src/index.css` (or whichever file holds Tailwind base + custom keyframes). Append:

```css
@keyframes fall {
  0%   { transform: translate3d(0, -10vh, 0) rotate(0deg);   opacity: 1; }
  100% { transform: translate3d(0, 110vh, 0) rotate(540deg); opacity: 0.6; }
}
```

- [ ] **Step 3: Verify typecheck + lint**

```
npm run check && npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```
git add src/components/shop/PurchaseCelebration.tsx src/index.css
git commit -m "feat(shop): add PurchaseCelebration overlay"
```

---

## Task C6: Real `/shop` page

**Files:**
- Modify: `src/pages/Shop.tsx`

- [ ] **Step 1: Replace the stub with the real catalog page**

```tsx
// src/pages/Shop.tsx
//
// Real catalog (replaces Phase A stub). Header band with balance + filter
// chips + inventory shortcut. Grid of ShopItemCard. Tap → PurchaseSheet.
// Successful purchase → PurchaseCelebration + refresh list + sync stat strip.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { fetchShopItems, type ShopItemForChild, type PurchaseResult } from '../lib/shopApi'
import ShopItemCard from '../components/shop/ShopItemCard'
import PurchaseSheet from '../components/shop/PurchaseSheet'
import PurchaseCelebration from '../components/shop/PurchaseCelebration'
import SkeletonCard from '../components/SkeletonCard'

const KINDS = ['Semua', 'worksheet', 'ebook', 'coloring', 'sticker', 'audio'] as const
type Filter = typeof KINDS[number]

export default function ShopPage() {
  const { activeChildId } = useAuthStore()
  const stats = useGamificationStats((s) => s.stats)
  const patchCoinBalance = useGamificationStats((s) => s.patchCoinBalance)
  const balance = stats?.coinBalance ?? 0

  const [items, setItems] = useState<ShopItemForChild[] | null>(null)
  const [filter, setFilter] = useState<Filter>('Semua')
  const [sheetItem, setSheetItem] = useState<ShopItemForChild | null>(null)
  const [celebrate, setCelebrate] = useState<PurchaseResult | null>(null)

  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    fetchShopItems(activeChildId).then((data) => { if (!cancelled) setItems(data) })
    return () => { cancelled = true }
  }, [activeChildId])

  const filtered = useMemo(() => {
    if (!items) return []
    return filter === 'Semua' ? items : items.filter((i) => i.kind === filter)
  }, [items, filter])

  function handlePurchased(result: PurchaseResult) {
    if (!activeChildId) return
    if (result.status === 'purchased') {
      patchCoinBalance(result.balance)
      setCelebrate(result)
      fetchShopItems(activeChildId).then(setItems) // refresh owned flags
      setSheetItem(null)
    } else if (result.status === 'already_owned') {
      patchCoinBalance(result.balance)
      setSheetItem(null)
    } else if (result.status === 'insufficient_funds') {
      patchCoinBalance(result.balance)
      // sheet stays open; CTA will re-render as disabled after the next fetch
      fetchShopItems(activeChildId).then(setItems)
    }
  }

  if (!activeChildId) {
    return (
      <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu.</p>
    )
  }

  if (items === null) return <SkeletonCard />

  return (
    <div className="flex flex-col gap-4">
      <section className="sticky top-12 z-20 -mx-4 bg-qupu-shell px-4 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-xl font-extrabold text-qupu-brand-blue">Toko QUPU</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue">
              <i className="fa-solid fa-coins" aria-hidden="true" /> {balance}
            </span>
            <Link
              to="/me#koleksi"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue"
            >
              <i className="fa-solid fa-box-archive" aria-hidden="true" /> Inventaris
            </Link>
          </div>
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-display text-[11px] font-extrabold uppercase ${
                filter === k ? 'bg-qupu-brand-blue text-white' : 'bg-white text-qupu-brand-blue'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm font-medium text-qupu-muted">Tidak ada item di kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => (
            <ShopItemCard key={item.id} item={item} balance={balance} onTap={() => setSheetItem(item)} />
          ))}
        </div>
      )}

      <PurchaseSheet
        open={sheetItem !== null}
        onClose={() => setSheetItem(null)}
        item={sheetItem}
        childId={activeChildId}
        balance={balance}
        onPurchased={handlePurchased}
      />

      {celebrate?.status === 'purchased' && (
        <PurchaseCelebration item={celebrate.item} onDismiss={() => setCelebrate(null)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck + lint**

```
npm run check && npm run lint
```

Expected: PASS.

- [ ] **Step 3: Smoke**

Start `npm run dev`. Open `/shop` on a phone viewport. Expect: catalog grid with placeholder items, filter chips, balance pill. Tap an affordable item → bottom sheet opens → Buy → confirm → celebration animation → balance updates in top stat strip.

- [ ] **Step 4: Commit**

```
git add src/pages/Shop.tsx
git commit -m "feat(shop): real catalog page with bottom-sheet purchase flow"
```

---

## Task C7: Wire `ShopTeaser` to show affordable items (Phase A → Phase C upgrade)

**Files:**
- Modify: `src/components/dashboard/ShopTeaser.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Extend `ShopTeaser` to accept and render 1–3 thumbnails**

```tsx
// src/components/dashboard/ShopTeaser.tsx (v2)
import { Link } from 'react-router-dom'
import type { ShopItemForChild } from '../../lib/shopApi'

interface Props {
  coinBalance: number
  affordableItems: ShopItemForChild[] // sorted by price asc, first 3
}

export default function ShopTeaser({ coinBalance, affordableItems }: Props) {
  return (
    <Link
      to="/shop"
      className="flex flex-col gap-3 rounded-[2rem] bg-qupu-brand-yellow p-4 shadow-[5px_6px_0_0_#FFD3B1] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-qupu-brand-orange">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-base font-extrabold text-qupu-brand-blue">Toko QUPU</h3>
          <p className="text-xs font-medium text-qupu-brand-blue/70">
            {affordableItems.length > 0
              ? `${affordableItems.length} item siap dibeli (${coinBalance} koin)`
              : `Sedikit lagi untuk item pertama! (${coinBalance} koin)`}
          </p>
        </div>
        <span className="rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-yellow">
          Lihat <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </span>
      </div>
      {affordableItems.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {affordableItems.map((it) => (
            <div key={it.id} className="flex w-20 flex-shrink-0 flex-col items-center rounded-2xl bg-white p-2 text-center">
              <i className="fa-solid fa-image text-2xl text-qupu-muted" aria-hidden="true" />
              <div className="mt-1 line-clamp-1 w-full text-[10px] font-extrabold text-qupu-brand-blue">{it.name}</div>
              <div className="text-[10px] font-bold text-qupu-brand-orange">{it.coinPrice} koin</div>
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Fetch affordable items in `Dashboard.tsx`**

In `src/pages/Dashboard.tsx`, after the existing dashboard load, add a second small effect:

```ts
import { fetchShopItems } from '../lib/shopApi'
import type { ShopItemForChild } from '../lib/shopApi'

const [affordable, setAffordable] = useState<ShopItemForChild[]>([])
useEffect(() => {
  if (!activeChildId) return
  let cancelled = false
  fetchShopItems(activeChildId)
    .then((items) => {
      if (cancelled) return
      const list = items
        .filter((i) => !i.owned && i.affordable)
        .sort((a, b) => a.coinPrice - b.coinPrice)
        .slice(0, 3)
      setAffordable(list)
    })
    .catch(() => { /* shop endpoint failure must not break dashboard */ })
  return () => { cancelled = true }
}, [activeChildId])
```

And pass it: `<ShopTeaser coinBalance={vm.coinBalance} affordableItems={affordable} />`.

- [ ] **Step 3: Verify typecheck + smoke**

```
npm run check
npm run dev
```

Expect: dashboard's shop teaser now shows up to 3 affordable item chips.

- [ ] **Step 4: Commit**

```
git add src/components/dashboard/ShopTeaser.tsx src/pages/Dashboard.tsx
git commit -m "feat(dashboard): show affordable items in ShopTeaser"
```

---

# Phase D — Inventory on `/me`

## Task D1: `InventoryItemSheet`

**Files:**
- Create: `src/components/me/InventoryItemSheet.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/me/InventoryItemSheet.tsx
//
// Tap on an owned item shows this sheet. v1: "ready soon" placeholder
// because actual digital file delivery is stubbed for Phase 2.
import BottomSheet from '../shop/BottomSheet'
import type { InventoryItem } from '../../lib/shopApi'

interface Props {
  open: boolean
  onClose: () => void
  item: InventoryItem | null
}

export default function InventoryItemSheet({ open, onClose, item }: Props) {
  if (!item) return null
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex h-40 items-center justify-center rounded-[1.25rem] bg-qupu-shell">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
          ) : (
            <i className="fa-solid fa-image text-5xl text-qupu-muted" aria-hidden="true" />
          )}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-qupu-brand-orange">{item.kind}</div>
        <h2 className="font-display text-xl font-extrabold text-qupu-brand-blue">{item.name}</h2>
        <div className="flex items-center gap-2 rounded-[1.25rem] bg-qupu-shell p-3 text-sm font-bold text-qupu-brand-blue">
          <i className="fa-solid fa-clock text-qupu-brand-orange" aria-hidden="true" />
          Item kamu siap diunduh sebentar lagi.
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
        >
          Tutup
        </button>
      </div>
    </BottomSheet>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/me/InventoryItemSheet.tsx
git commit -m "feat(me): add InventoryItemSheet placeholder"
```

---

## Task D2: `InventoryGrid`

**Files:**
- Create: `src/components/me/InventoryGrid.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/me/InventoryGrid.tsx
//
// Owned-items grid on /me. Newest first. Tap → InventoryItemSheet.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchInventory, type InventoryItem } from '../../lib/shopApi'
import InventoryItemSheet from './InventoryItemSheet'

interface Props {
  childId: string
}

export default function InventoryGrid({ childId }: Props) {
  const [items, setItems] = useState<InventoryItem[] | null>(null)
  const [active, setActive] = useState<InventoryItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchInventory(childId).then((data) => { if (!cancelled) setItems(data) })
    return () => { cancelled = true }
  }, [childId])

  if (items === null) {
    return <p className="text-sm font-medium text-qupu-muted">Memuat koleksi…</p>
  }

  if (items.length === 0) {
    return (
      <>
        <p className="text-sm font-medium text-qupu-muted">
          Belum ada item. Selesaikan misi dan tukar koinmu di toko.
        </p>
        <Link
          to="/shop"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Buka toko
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <button
            key={it.inventoryId}
            type="button"
            onClick={() => setActive(it)}
            className="flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-peach bg-white text-left shadow-[5px_6px_0_0_#FFD3B1]"
          >
            <div className="flex h-24 items-center justify-center bg-qupu-shell">
              {it.thumbnailUrl ? (
                <img src={it.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-3xl text-qupu-muted" aria-hidden="true" />
              )}
            </div>
            <div className="p-2">
              <div className="line-clamp-1 font-display text-sm font-extrabold text-qupu-brand-blue">{it.name}</div>
              <div className="text-[10px] font-medium text-qupu-muted">
                {new Date(it.acquiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </button>
        ))}
      </div>
      <InventoryItemSheet open={active !== null} onClose={() => setActive(null)} item={active} />
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```
git add src/components/me/InventoryGrid.tsx
git commit -m "feat(me): add InventoryGrid component"
```

---

## Task D3: Wire `InventoryGrid` into `/me`

**Files:**
- Modify: `src/pages/Me.tsx`

- [ ] **Step 1: Replace the placeholder in the `#koleksi` section**

Open `src/pages/Me.tsx`. Replace the `<section id="koleksi">` body with the real grid. Add the import and pull `activeChildId` from the auth store.

```tsx
import { useAuthStore } from '../store/authStore'
import InventoryGrid from '../components/me/InventoryGrid'

// inside the component:
const { user, activeChildId } = useAuthStore()

// replace the #koleksi <section>:
<section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
  <h2 className="mt-1 font-display text-lg font-extrabold text-qupu-brand-blue">Item yang sudah dimiliki</h2>
  <div className="mt-3">
    {activeChildId ? (
      <InventoryGrid childId={activeChildId} />
    ) : (
      <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu untuk melihat koleksi.</p>
    )}
  </div>
</section>
```

- [ ] **Step 2: Verify typecheck + smoke**

```
npm run check
npm run dev
```

Buy an item on `/shop` → celebration → tap "Lihat inventaris" → land on `/me#koleksi` → see the item in the grid.

- [ ] **Step 3: Commit**

```
git add src/pages/Me.tsx
git commit -m "feat(me): wire InventoryGrid into Profil page"
```

---

## Final verification (all phases)

- [ ] **Step 1: Full typecheck + lint + build**

```
npm run check && npm run lint && npm run build
```

Expected: PASS.

- [ ] **Step 2: Full test suite**

```
TEST_DATABASE_URL='postgres://<user>:<pwd>@<host>:<port>/qupu_test' npm test
```

Expected: 16 passing.

- [ ] **Step 3: End-to-end manual walkthrough (phone viewport)**

1. Log in as a parent → onboard a kid if none → land on `/dashboard`.
2. See profile hero, mission strip with chunky first card showing coin + XP rewards, shop teaser ("Sedikit lagi…" or affordable items chips).
3. Tap Video tab → `/videos` (chrome changes — accepted v1.1 follow-up).
4. Pick a video → complete a quiz → return to dashboard → coin balance updated in top strip.
5. Tap Toko → see catalog, filter by category, see balance, see Inventaris pill.
6. Tap an affordable item → bottom sheet opens → Beli → confirm "Ya, tukar" → celebration plays → top strip balance drops.
7. Celebration "Lihat inventaris" → land on `/me#koleksi` → see the bought item.
8. Re-tap same item in shop → bottom sheet shows "Sudah ada di inventaris".
9. Tap an unaffordable item → bottom sheet shows disabled CTA "Butuh N koin lagi".
10. Tap Profil tab → see account + inventory grid.

If any step misfires, file and fix before declaring done.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-25-duolingo-gamification-phase2.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a long plan with 30+ tasks across 4 phases.

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch with checkpoints for review.

Which approach?
