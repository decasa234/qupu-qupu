# Duolingo-level Gamification — Phase 2 Design

**Date:** 2026-05-25
**Status:** Approved (brainstorm)
**Author:** Vico (with Claude)
**Prior art:** [`2026-05-12-gamification-core-design.md`](./2026-05-12-gamification-core-design.md), eng-review MSI (2026-05-20), coins-earn-only v1 shipped 2026-05-22 (commits `25160bd`, `530f8fe`)

## Context

Phase 1 ("coins-earn-only v1") shipped a complete coin earning loop on top of the existing gamification engine: `gamification_profiles.coin_balance` with `CHECK (>= 0)`, append-only `reward_ledger` with idempotency, and atomic profile updates wired through `processScoreSubmission`. Each quiz completion earns +5 coins; each daily quest completion earns 10–20 coins. 10 integration tests pass against `qupu_test`. Coin balance flows to the dashboard via `vm.coinBalance`.

What Phase 1 deliberately deferred: anywhere to spend coins. The eng-review (D10) chose to ship earning first and demand-test before designing a spending surface.

Phase 2 reverses D10 and builds the full Duolingo-feeling loop: a gamified profile as the post-login landing, a daily mission strip that pushes the kid to start their first task, and a shop where coins purchase mock digital products. Member-facing surfaces are designed mobile-first to feel like a native game app, not a web app.

## Goals

- After login, the kid lands on a focused gamified profile that pushes the first task of the day.
- Every task (quiz + quest) visibly rewards coins.
- A shop page lets coins be spent on placeholder digital products that preview the future real-money catalog.
- Coin transactions are rigid: race-safe, idempotent, schema-enforced.
- Member-facing routes adopt an app-shell chrome (sticky top stat strip + bottom tab bar) so the experience feels like a phone game.

## Non-goals (Phase 2)

- Real-money payments / payment gateway integration.
- Actual digital file delivery — Phase 2 ships placeholder "coming soon" surfaces in inventory.
- Mascot avatar editor / outfit cosmetics / power-ups.
- Leaderboards, leagues, friends, social.
- Push notifications.
- Admin CRUD for shop catalog (new items go in via migrations in Phase 2; admin UI is a follow-up).
- Porting `/videos*` into the app-shell chrome (accepted v1.1 inconsistency).

## Decisions log (brainstorm answers)

| # | Question | Decision |
|---|---|---|
| 1 | What is a "task"? | Quizzes ARE tasks (already +5 coins each). Quests are bonus tasks on top (10–20 coins each). |
| 2 | Profile vs dashboard | Slim `/dashboard` to profile hero + mission strip + shop teaser. Move detailed stats to existing `/report` and `/badges`. |
| 3 | First-task push UX | Mission strip: 3 daily quests, first chunky/active with START button + visible coin/XP reward, others dimmed previews. |
| 4 | Chrome | Full app-shell: sticky top stat strip + bottom tab bar (Home / Video / Toko / Badge / Profil). Standard site header hidden on member routes. |
| 5 | Shop item kind | Mock digital products (worksheets, e-books, coloring books, sticker packs, audio stories). Doubles as preview of future paid catalog; file delivery stubbed for v1. |
| 6 | Purchase flow | Tap card → bottom sheet (details + price + Buy) → confirm dialog → server processes → unboxing celebration. |
| 7 | Empty mission strip | Unified promoted-CTA card so Home is never hollow. |
| 8 | Shop teaser content | Show 1–3 currently-affordable items, not a static "Buka toko" pill. |
| 9 | Tab count | Five tabs (Home / Video / Toko / Badge / Profil). |
| 10 | Stat strip refresh | Event-driven re-fetch after score submit / purchase. No websocket. |
| 11 | Unaffordable items in shop | Show with `Butuh N lagi` badge (aspirational), not hidden. |
| 12 | Confirm dialog after bottom sheet | Keep it. Under-13 users; accidental-spend complaints are real. |
| 13 | Inventory location | Single source of truth on `/me` (Profil tab). Shop has a quick-link pill. |

## System overview

**Surfaces changed/added (member-only):**

1. `/dashboard` → slim Home (profile hero + 3-quest mission strip + shop teaser).
2. **NEW** `/shop` — catalog of mock digital-product items.
3. **NEW** `/me` — Profil tab destination: child switcher + inventory grid + settings + logout.
4. **NEW** `<AppShell>` wraps `/dashboard`, `/shop`, `/badges`, `/report`, `/me`. Standard `<Layout>` is suppressed for these routes.
5. `/report` expands to host moved sections (KPIs, Activity, Subjects, Recommended, Attempts).

**Untouched:** `/`, `/login`, `/register`, `/videos*`, `/onboarding/child`, `/admin/*`.

**Net new backend:** `shop_items`, `child_inventory` tables (migration `0019_shop.sql`); `api/services/shop/{catalog,purchase,inventory}.ts`; `api/routes/shop.ts`.

## Section 2 — App-shell chrome

`<AppShell>` is a new React component that wraps member routes in place of `<Layout>`.

**Top sticky stat strip** (60–70px):
- `fa-solid fa-fire` streak (`current_streak_days`)
- `fa-solid fa-coins` coin balance
- `fa-solid fa-star` level + tier name
- Tap any stat → drawer with detail (level curve, recent ledger, streak history)
- Driven by `useGamificationStats()` hook subscribing to the cached `gamificationProfile` from `/api/me/dashboard`. Re-fetches event-driven after score submit or purchase. No polling, no websocket.

**Bottom tab bar** (60px, `env(safe-area-inset-bottom)` aware):
- Home → `/dashboard`
- Video → `/videos`
- Toko → `/shop`
- Badge → `/badges`
- Profil → `/me`

**Implementation:**
- `src/components/AppShell.tsx`. Pure layout — no data fetching beyond the stats hook.
- Routes adopt it via `App.tsx`: a member route group wraps in `<AppShell>` instead of `<Layout>`.
- `min-h-screen` body; stat strip `position: sticky; top: 0`; tab bar `position: sticky; bottom: 0`. On `≥lg` it stays as a phone layout for v1 (no desktop rail collapse).
- All icons via Font Awesome 6 (`fa-solid fa-house` etc) — no emoji glyphs.

## Section 3 — Home (`/dashboard`)

Stacked vertically:

**1. Profile hero** — chunky card. Avatar placeholder, greeting (`Hai, {childName}!`), tier name, level chip, XP progress bar with `xp / xpToNext`. All data already on existing `vm.level / tierName / xp / xpToNext`.

**2. Mission strip ("Misi hari ini")** — 3 daily quests laid out:
- Slot 1: FULL chunky card. Brand-orange border, big `fa-solid fa-play` + "Mulai sekarang" CTA, visible reward badge showing `fa-coins +N` and `fa-bolt +N XP`, progress bar.
- Slots 2 + 3: dimmed mini-cards (2-col grid), showing name + reward.
- START routes to the recommended video for that quest (`daily_subject_focus` → first recommendation in the personalised subject; everything else → top recommendation).
- When slot 1 completes, slot 2 promotes to active. When all three complete → single "Selesai untuk hari ini — kembali besok" card with a `fa-solid fa-circle-check` accent.

**3. Shop teaser** — compact yellow card. Title + balance pill + `Lihat →` button → `/shop`. Inline 1–3 thumbnails of items the kid can afford right now, OR "Sedikit lagi untuk item pertama!" if balance < cheapest active item.

**Empty state:** brand-new child (no activity) gets the same layout — profile shows level 1 / 0 XP, mission strip's first card is `Selesaikan 1 quiz` (already slot 1), shop teaser shows "Mulai quiz untuk dapat koin pertama". `DashboardEmptyState.tsx` is retired.

**Moves off `/dashboard`:** `DashboardKpis`, `DashboardActivity`, `DashboardSubjects`, `DashboardRecommended`, `DashboardAttempts` → `/report` (which expands to host them). `DashboardBadges` → already at `/badges`.

**Data:** existing `GET /api/me/dashboard` payload unchanged. Same payload also feeds `/report` so no extra round-trips.

## Section 4 — Shop (`/shop`)

**Header band** (sticky under stat strip): "Toko QUPU", balance pill (`fa-solid fa-coins` + "185"), filter chips (`Semua / Worksheet / E-book / Coloring / Sticker / Audio`), and an `Inventaris` quick-link pill (`fa-solid fa-box-archive`) → `/me#koleksi`.

**Catalog grid:** 2 cols mobile / 3 tablet / 4 desktop. Each `ShopItemCard`:
- Thumbnail (placeholder PNG)
- Item name (single-line ellipsis)
- Price chip (`fa-solid fa-coins` + "100")
- Badge overlay: `Dimiliki` (owned) or `Butuh N lagi` (unaffordable)
- Tap behaviour:
  - Affordable & not owned → open `PurchaseSheet`
  - Owned → bottom sheet with "Sudah ada di inventaris" + `Lihat inventaris →`
  - Unaffordable → bottom sheet with "Selesaikan quiz untuk koin" + `Mulai quiz →` (routes to Home)

**`PurchaseSheet` bottom sheet** (60–80% screen height, drag handle):
- Big item art, name, category chip
- Description (2–3 sentences)
- Price block
- Primary CTA: "Beli — 100 koin" (chunky orange, `fa-solid fa-coins` inline). Disabled if can't afford.
- CTA tap → tiny confirm dialog ("Tukar 100 koin untuk {item}?" — `Batal` / `Ya, tukar`).
- Confirm → `POST /api/shop/purchase`.

**`PurchaseCelebration`** (full-screen overlay on success):
- Confetti (canvas-based, no emoji) + item card scales up with spring physics
- Headline: "Hore! Kamu dapat **{item name}**"
- Subline: "Tersimpan di inventaris kamu"
- Auto-dismiss after 2.5s or tap-to-dismiss → back to shop, balance refreshed, item card flips to `Dimiliki`.

**Insufficient-funds UX guard:** the CTA is disabled with helpful subtext before the kid taps. Server-side rigidity is belt-and-braces for races, not the primary UX guard.

**Catalog seeding (v1):** ~10–12 items via the migration: 4 worksheet packs (100c), 3 e-books (200c), 2 coloring books (150c), 2 sticker packs (50c), 1 audio story (300c).

## Section 5 — Inventory (`/me`)

`/me` (Profil tab) is the single source of truth for owned items.

**Page layout** (inside `<AppShell>`):
- Top card: child switcher (existing). Switching child swaps the displayed inventory.
- "Koleksi saya" grid (anchor `#koleksi`): 2 cols mobile / 3+ desktop. Each tile: thumbnail, name, acquired date.
- Tap tile → bottom sheet: item art + name + description + "Item kamu siap diunduh sebentar lagi" placeholder (`fa-solid fa-clock`) + `Tutup`. No actual download in v1.
- Empty state: "Belum ada item. Selesaikan misi dan tukar koinmu di toko." + `Buka toko` button (`fa-solid fa-bag-shopping`).
- Below collection: parent settings shortcut + logout.

**Quick-link from shop:** `fa-solid fa-box-archive Inventaris` pill in shop header → `/me#koleksi`.

**Data:** `GET /api/me/inventory?childId=X` returns `[{ inventoryId, itemId, name, kind, thumbnailUrl, acquiredAt }]`, newest-first. The shop catalog endpoint already joins inventory to flag `owned: true`, so ownership logic isn't duplicated.

## Section 6 — Transaction rigidity (data model + service)

### Migration `db/migrations/0019_shop.sql` (mirrored into `db/schema.sql`)

```sql
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('worksheet','ebook','coloring','sticker','audio')),
  coin_price INT NOT NULL CHECK (coin_price > 0),
  thumbnail_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_items_active_sort
  ON shop_items (is_active, sort_order)
  WHERE is_active = TRUE;

CREATE TABLE child_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE RESTRICT,
  coins_spent INT NOT NULL CHECK (coins_spent >= 0),  -- snapshot at purchase
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, shop_item_id)                     -- one-time ownership
);
CREATE INDEX idx_child_inventory_child
  ON child_inventory (child_id, acquired_at DESC);

-- Seed 10–12 placeholder rows (worksheet/ebook/coloring/sticker/audio)
```

### Schema-enforced invariants

1. `coin_price > 0` — never sell a free item that would short-circuit rigidity tests.
2. `UNIQUE (child_id, shop_item_id)` — one-time ownership; also the idempotency key for retries.
3. `gamification_profiles.coin_balance >= 0` CHECK (from migration 0018) — last-line catch for any overdraw.
4. `coins_spent` snapshot in inventory — audit trail survives later price changes.
5. `ON DELETE RESTRICT` on `shop_items` from `child_inventory` — can't delete items that have been purchased.
6. `ON DELETE CASCADE` on `children` — deleting a child wipes their inventory (consistent with other child-scoped tables).

### Purchase service algorithm (`api/services/shop/purchase.ts`)

Inside `withTransaction`:

```
1. SELECT id, slug, name, description, kind, coin_price, is_active
   FROM shop_items WHERE id = $1 FOR UPDATE
     → not found       → return { status: 'not_found' }
     → !is_active       → return { status: 'not_available' }
     → got row with current price

2. INSERT INTO child_inventory (child_id, shop_item_id, coins_spent)
   VALUES ($childId, $itemId, $item.coin_price)
   ON CONFLICT (child_id, shop_item_id) DO NOTHING
   RETURNING id
     → empty? → already owned. COMMIT, return
                { status: 'already_owned', balance: <fetch>, item }
                (no double-debit)
     → got id? proceed

3. UPDATE gamification_profiles
      SET coin_balance = coin_balance - $item.coin_price,
          updated_at = NOW()
      WHERE child_id = $1 AND coin_balance >= $item.coin_price
      RETURNING coin_balance
     → empty? throw InsufficientFundsError(price, currentBalance)
              → withTransaction ROLLBACKs the inventory insert
     → row? proceed

4. appendLedger({
     rewardType:   'SHOP_PURCHASE',
     sourceType:   'child_inventory',
     sourceId:     <inventory.id>,
     xpDelta:      0,
     coinDelta:    -item.coin_price,
     metadata:     { itemSlug, itemName, itemKind }
   })  -- already idempotent on its UNIQUE key (migration 0012)

5. COMMIT, return
   { status: 'purchased', balance, inventoryId, item }
```

### Why this is race-safe

- **Two concurrent purchases of the same item by same kid:** only one INSERT survives the UNIQUE constraint; the other gets `already_owned` with no debit.
- **Concurrent purchase + quest-completion coin earn:** Postgres row-locks `gamification_profiles` during UPDATE. Conditional debit re-reads the latest committed balance. CHECK rejects any overdraw even if the WHERE were wrong.
- **Concurrent admin price edit:** `FOR UPDATE` on `shop_items` blocks the admin update until the in-flight purchase commits. The price the kid saw is the price they pay.
- **Network retry / double-tap on client:** the natural (child_id, shop_item_id) idempotency means a retry returns `already_owned` with the current balance. UI updates cleanly either way.

### API surface (mounted in `api/app.ts`)

- `GET  /api/shop/items?childId=X` → `{ items: [{ id, slug, name, description, kind, coinPrice, thumbnailUrl, owned, affordable }] }`. Auth required; child-belongs-to-user check.
- `POST /api/shop/purchase` body `{ childId, itemId }` → 200 `{ status: 'purchased'|'already_owned', balance, item, inventoryId? }` / 400 `{ status: 'insufficient_funds', balance, price }` / 404 `{ status: 'not_found'|'not_available' }`.
- `GET  /api/me/inventory?childId=X` → `{ items: [{ inventoryId, itemId, name, kind, thumbnailUrl, acquiredAt }] }` newest-first.

### Tests (`api/__tests__/shop/purchase.test.ts`, skipIf no `TEST_DATABASE_URL`)

1. **Happy path:** kid with 200c buys 100c item → balance=100, inventory row exists, exactly one ledger row appended, returns `purchased`.
2. **Insufficient funds:** kid with 50c attempts 100c item → returns `insufficient_funds`, balance unchanged, no inventory row, no ledger row.
3. **Idempotency:** same purchase fired twice in series → second returns `already_owned`, balance debited exactly once, exactly one inventory row, exactly one ledger row.
4. **Race safety (same item):** 10 parallel purchases of same item by same kid → exactly 1 `purchased`, 9 `already_owned`, balance debited exactly once.
5. **Race safety (cross-product):** 5 parallel purchases of 5 different items where the kid has just enough for 4 of them → 4 succeed, 1 returns `insufficient_funds`, balance reconciles with sum of ledger debits.
6. **CHECK belt-and-braces:** manual `UPDATE gamification_profiles SET coin_balance = -1` errors with constraint violation (sanity).

Tests reuse the existing vitest setup + `qupu_test` DB — no new infra.

## Section 7 — Implementation phasing

Each phase is one shippable commit/PR.

### Phase A — App-shell + slim Home (frontend-only)

- New `src/components/AppShell.tsx`.
- Refactor `src/App.tsx`: member routes (`/dashboard`, `/badges`, `/report`, `/shop`, `/me`) wrap in `<AppShell>` instead of `<Layout>`.
- `src/pages/Dashboard.tsx` slims to profile hero + mission strip + shop teaser.
- `src/pages/Report.tsx` expands to host moved sections (KPIs, Activity, Subjects, Recommended, Attempts).
- Remove `src/components/dashboard/DashboardEmptyState.tsx` (unified into slim landing).
- Rebuild `DashboardQuests` → `src/components/dashboard/MissionStrip.tsx` with chunky-first / dimmed-rest pattern; surface coin reward.
- New `src/components/dashboard/ShopTeaser.tsx`.
- New `src/pages/Me.tsx` — child switcher + inventory placeholder + settings + logout.
- Verifies: `npm run check`, `npm run lint`, mobile-viewport manual check.

### Phase B — Shop backend foundation

- Migration `db/migrations/0019_shop.sql` + mirrored `db/schema.sql` changes.
- `api/services/shop/catalog.ts` — `listItemsForChild(childId)`.
- `api/services/shop/purchase.ts` — rigid algorithm.
- `api/services/shop/inventory.ts` — `listInventory(childId)`.
- `api/routes/shop.ts` — mounts the three endpoints.
- `api/__tests__/shop/purchase.test.ts` — 6 tests.
- Verifies: `npm test`, schema apply on dev DB, manual curl of endpoints.

### Phase C — Shop page + bottom sheet + celebration

- `src/pages/Shop.tsx`.
- `src/components/shop/ShopItemCard.tsx`.
- `src/components/shop/PurchaseSheet.tsx`.
- `src/components/shop/PurchaseCelebration.tsx`.
- `src/lib/shopApi.ts` — typed wrappers.
- Verifies: end-to-end purchase flow on mobile viewport — happy path, already-owned, insufficient-funds disabled state.

### Phase D — Inventory section

- `src/components/me/InventoryGrid.tsx`.
- Wire shop celebration's `Lihat →` button to `/me#koleksi`.
- Verifies: purchase → see in inventory; switch child → see different inventory.

### Phase E — Polish: coin rewards on mission cards

- Tiny: add a `fa-solid fa-coins` + `+N` chip next to the existing `+N XP` chip on `MissionStrip` cards. Data already on `quest.coinReward`.

## Routing diff in `App.tsx`

- Member routes (`/dashboard`, `/badges`, `/report`, `/shop`, `/me`) — wrap in `<AppShell>` instead of `<Layout>`.
- Marketing routes (`/`, `/login`, `/register`, `/onboarding/child`) — stay under `<Layout>`.
- Admin routes (`/admin/*`) — stay under `<AdminLayout>`.
- `/videos`, `/videos/:slug` — stay under `<Layout>` for v1 (video player is full-bleed already; documented v1.1 follow-up to port).

## Open risks (not blockers)

- **`/report` becomes long.** Hosting all moved dashboard sections risks turning it into a dumping ground. Acceptable for v1 since parents read reports less often than kids open Home. Revisit if it gets cluttered.
- **Seed items have stub thumbnails.** v1 ships with simple colour-block PNG placeholders. Real product art is a future content task — doesn't block the loop.
- **`/videos` chrome inconsistency.** A kid bouncing `/shop` ↔ `/videos/abc` sees chrome change. Documented; v1.1 ports videos into `<AppShell>`.
- **Admin shop CRUD missing.** New items require a migration in v1. Admin UI is a follow-up. Acceptable since v1 catalog is small (~10–12 items).
- **Stat strip refresh signal coupling.** Event-driven re-fetch couples the shell to score-submit / purchase events. Cheap and accurate for v1; revisit if more coin sources arrive.

## Definition of done

- Phases A–E shipped on `master`.
- Migration 0019 applied to dev and test DBs; schema.sql mirrored.
- All 6 new shop tests + all 10 existing coin tests pass under `qupu_test`.
- Manual smoke on a phone-sized viewport: login → land on slim profile → see mission strip → tap first START → complete a quiz → return to dashboard → coin balance updated in stat strip → tap Toko → buy an affordable item → see celebration → land in inventory.

## References

- Prior brainstorm: [`2026-05-12-gamification-core-design.md`](./2026-05-12-gamification-core-design.md)
- Memory: [`feedback-mobile-first-app-feel`](/Users/vics/.claude/projects/-Users-vics-Development-Project-qupu-website/memory/feedback_mobile_first_app_feel.md)
- Memory: [`feedback-no-emojis-use-icons`](/Users/vics/.claude/projects/-Users-vics-Development-Project-qupu-website/memory/feedback_no_emojis_use_icons.md)
- Eng-review MSI (2026-05-20) — locked-in coin transaction pattern (insert-unlock-first ON CONFLICT + conditional debit + CHECK >= 0).
- `db/migrations/0018_coins.sql` — coin_balance column + CHECK.
- `api/services/gamification/{ledger,profileUpdater,questEvaluator,index}.ts` — Phase 1 wiring.
- `api/__tests__/gamification/{coins,xpRegression}.test.ts` — Phase 1 test patterns to mirror.
