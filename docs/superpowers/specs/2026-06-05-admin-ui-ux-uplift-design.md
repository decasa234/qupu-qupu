# Admin UI/UX Uplift — Design

**Date:** 2026-06-05
**Branch:** `feat/ui-ux-enhancements`
**Status:** Awaiting review
**Audit evidence:** `outputs/admin-ui-audit/FINDINGS.md` + `outputs/admin-ui-audit/final_runs/run_1/screenshots/` (18 PNGs, desktop 1280 + mobile 390, captured via webwright/Playwright Firefox against the live admin).

## 1. Goal

Raise the overall UI/UX quality of the QUPU admin panel to a "UX uplift" level:
fix the things that are broken or clipped, make every surface usable on a phone,
make the Videos catalog scale, move the heaviest form into a focused surface,
and apply visual polish — all **within the established warm-branded utilitarian
admin register** (`src/components/admin/ui.tsx` + `admin-*` tokens). This is not
a re-skin and explicitly does **not** pull the kid/parent "app-feel" into admin.

## 2. Confirmed decisions

| Decision | Choice |
|----------|--------|
| Ambition | UX uplift (fix + the two biggest UX reworks) |
| Focus depth | All four: mobile correctness, Videos at scale, editing ergonomics, visual polish |
| Video editor surface | **Right-side drawer** with sticky Save/Cancel; full-screen sheet on mobile |
| Videos catalog rows | **Rich cards** (keep thumbnails/metadata) + a sticky search/sort/filter toolbar + pagination |
| Design register | Keep warm-utilitarian; extend `ui.tsx`, don't replace it |
| Videos data path | Client-side toolbar/pagination over the already-loaded list (≈62 items); server-side paging is a documented later extension |

## 3. Foundation — shared kit additions (`src/components/admin/ui.tsx`)

These primitives are built first; the four workstreams compose them.

### 3.1 `DataList<T>` — responsive table/cards
One primitive that renders a real table on desktop and auto-collapses to stacked
cards on mobile. This is the structural fix for the Users mobile overflow (P1)
and the pattern every list/table adopts.

```tsx
type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  // mobile: which columns become the card title / subtitle / meta / actions
  role?: 'title' | 'subtitle' | 'meta' | 'actions'
  align?: 'left' | 'right'
  className?: string        // desktop <td>/<th> width/visibility
  hideBelow?: 'sm' | 'md'   // drop noisy columns on small screens
}
function DataList<T>(props: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode         // EmptyState when rows is empty
  loading?: boolean         // renders Skeleton rows
}): JSX.Element
```
- Desktop: `<table>` with header row, hover state, subtle row dividers.
- Mobile (`< sm`): each row becomes a `Panel`-style card using the `role`-tagged
  columns (title + subtitle + meta line + an actions row) so **actions are never
  clipped**.

### 3.2 `PageScaffold` — consistent page composition
Wraps each admin page: standard header (eyebrow + title + description + optional
right-aligned primary action), correct max-width, and a min-height so
low-density pages (Import, Users, Age-Groups) don't float in a beige void (P4).
Generalizes today's `AdminPageHeader`.

```tsx
function PageScaffold(props: {
  eyebrow: string            // e.g. "Admin · Users"
  title: string
  description?: string
  actions?: ReactNode        // top-right buttons
  children: ReactNode
}): JSX.Element
```
Low-density pages get `min-h` content and may center a narrower column so a small
form/list reads as deliberate rather than stranded.

### 3.3 `Toolbar` — search + filters + sort
Sticky control strip used by Videos (and Users search migrates onto it).

```tsx
function Toolbar(props: {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string }
  filters?: ReactNode        // SegmentedControl chips + Select dropdowns
  sort?: ReactNode           // Select
  trailing?: ReactNode       // result count / density toggle
}): JSX.Element
```

### 3.4 `Drawer` — right-side panel
Slide-in panel anchored right, with a header, scrollable body, and a **sticky
footer** for primary/secondary actions. `< sm` it presents as a full-screen
sheet. Closes on overlay click / Esc; traps focus; restores focus on close.

```tsx
function Drawer(props: {
  open: boolean
  onClose: () => void
  title: ReactNode
  footer?: ReactNode         // sticky action row
  children: ReactNode
  width?: 'md' | 'lg'        // lg for the video editor
}): JSX.Element
```

### 3.5 Token / polish pass
- **Color-for-status:** a single `statusTone(status)` mapping →
  draft = neutral/amber, published = success/green, needs-review = brand,
  used by `Tag` across Videos, Users, WMI. Stops every badge looking the same.
- Tighten the type/space scale: fewer ALL-CAPS tracked micro-labels at body
  size; reserve them for true section eyebrows. Slightly larger base text /
  contrast for dense lists.
- Table rows: hover + subtle divider via `DataList`.
- Skeletons: every page that fetches uses the existing `Skeleton` while loading.

## 4. Workstream 1 — Mobile correctness

- **Users (`src/pages/admin/AdminUsers.tsx`):** migrate the hand-rolled table to
  `DataList`. Columns: User (title+subtitle email), Role (`Tag` with status
  tone), Auth, Daftar (date, `hideBelow="sm"`), Aksi (Promote/Demote/Hapus,
  `role: 'actions'`). Search moves into `Toolbar`. Fixes P1.
- **Stat grids (Dashboard + Analytics):** stat cards go to a **2-column grid on
  mobile** (`grid-cols-2`) instead of one full-width block each, so a phone shows
  4 KPIs in a glance instead of one-per-screen (P6). `StatCard` gets a compact
  density that the 2-col mobile layout uses.
- **WMI Concepts (`src/pages/admin/AdminWmiConcepts.tsx`):** give the 3-pane tool
  a real mobile flow — list view by default; tapping a concept slides to the
  review pane with a back affordance (single-column, view-switched), instead of
  silently dropping the review pane (P9). Desktop 3-pane unchanged.

## 5. Workstream 2 — Videos at scale (`src/pages/AdminVideos.tsx`)

Keep the **rich card** rows (thumbnail + title + status + subject/age/soal/ranges
+ Edit/Hapus) but put them under a sticky `Toolbar`:
- **Search** (title / youtube id) — client-side over the loaded list.
- **Status** filter — reuse existing `SegmentedControl` (Semua / Draft / Diterbitkan).
- **Subject** + **Age group** dropdowns (`Select`, sourced from `PublicMeta`).
- **Sort** — Terbaru diperbarui (default) / Judul A–Z / Status / Kelengkapan
  (draft-completeness).
- **Pagination** + page-size (`24/page` default) at the bottom; result count in
  the toolbar trailing slot.
All client-side over the already-fetched `listAdminVideos()` result. If the
catalog later outgrows a single fetch, extend `listAdminVideos()` +
`GET /api/admin/videos` with `page/search/sort` params (out of scope now;
the public `listVideos` already shows the server-side shape). Fixes P2.

## 6. Workstream 3 — Editing ergonomics (`src/components/admin/VideoEditor.tsx`)

- Render `VideoEditor` inside the new `Drawer` (width `lg`) launched from a row's
  Edit button **and** from "Tambah video", instead of expanding inline in the
  list. The catalog keeps its scroll position behind the drawer. Fixes P3.
- Regroup the form into labelled sections inside the drawer body:
  1. **Identitas** — title, slug, YouTube URL (+ Pull), thumbnail.
  2. **Klasifikasi** — subject, age group, jumlah soal, difficulty.
  3. **Badge ranges** — roomier `BadgeRangeEditor` (`src/components/admin/BadgeRangeEditor.tsx`):
     clearer min/max/badge columns, add/remove affordances, inline validation,
     the existing `BadgeCurve` preview.
  4. **Publikasi** — Publish + Featured toggles with helper text.
- Sticky drawer footer: `Batal` + `Update video` / `Buat video`; the publish-gate
  validation messaging surfaces near the action, not buried mid-form.
- No change to the PUT contract or `normalizeVideoInput` — purely presentational
  reorganization of the same fields.

## 7. Workstream 4 — Polish & targeted fixes

- **Headers:** every admin page uses `PageScaffold`; primary action consistently
  top-right.
- **Status color:** apply `statusTone` everywhere a status `Tag` renders.
- **P5 — daily traffic chart (`AdminAnalytics.tsx`):** the hand-rolled CSS bars
  aren't broken — sparse data (≈7 page-views) makes them read as empty. Improve
  the low-data visualization: taller min bar, a baseline/gridline, axis max
  label, and a clearer "low traffic" hint when totals are tiny. Keep it
  dependency-free (no recharts).
- **P7 — consent banner leak:** `CookieConsentBanner` (mounted app-wide at
  `src/App.tsx:115`) returns `null` on admin routes (`pathname.startsWith('/admin')`).

## 8. File map

**New**
- `src/components/admin/DataList.tsx` (or added to `ui.tsx`) — responsive table/cards.
- `src/components/admin/Drawer.tsx` — right-side drawer / mobile sheet.
- `src/components/admin/Toolbar.tsx` — search/filter/sort strip.
- `src/components/admin/PageScaffold.tsx` — page header + composition wrapper.

**Changed**
- `src/components/admin/ui.tsx` — `statusTone`, token/spacing pass, `StatCard` compact density.
- `src/pages/AdminVideos.tsx` — toolbar + pagination; editor launches in `Drawer`.
- `src/components/admin/VideoEditor.tsx` — sectioned layout for the drawer.
- `src/components/admin/BadgeRangeEditor.tsx` — roomier editing.
- `src/pages/admin/AdminUsers.tsx` — `DataList` + toolbar search.
- `src/pages/admin/AdminDashboard.tsx`, `AdminAnalytics.tsx` — 2-col mobile stat grid; chart low-data fix.
- `src/pages/admin/AdminWmiConcepts.tsx` — mobile list→detail flow.
- `src/pages/admin/AdminSubjects.tsx`, `AdminAgeGroups.tsx` — adopt `PageScaffold` (min-height/composition).
- `src/components/CookieConsentBanner.tsx` — hide on `/admin`.
- `src/components/AdminLayout.tsx` — minor (only if PageScaffold needs a hook).

## 9. Non-goals (out of scope this pass)

- Server-side admin video pagination/search (client-side now; documented extension).
- Introducing a chart library (recharts stays unused for this).
- Any change to auth, API contracts, services, or DB schema.
- Member/kid-facing surfaces.
- A full visual redesign / new design language.

## 10. Risks & validation

- **Risk:** `DataList` over-abstraction. Mitigation: ship it driven by the two
  concrete consumers (Users, and optionally future tables); keep the API minimal.
- **Risk:** Drawer focus-trap/scroll-lock regressions. Mitigation: standard
  overlay patterns; verify keyboard + Esc + focus restore.
- **Validation:** re-run the webwright capture script
  (`outputs/admin-ui-audit/final_runs/run_1/final_script.py`) after each
  workstream and diff desktop+mobile screenshots against the baseline; confirm
  P1 (Users actions reachable on mobile), P4 (no beige void), P6 (2-col stats),
  P7 (no consent banner in admin) visually.

## 11. Sequencing

1. Foundation primitives (DataList, Drawer, Toolbar, PageScaffold, statusTone/tokens).
2. Quick wins: P7 consent gate, P5 chart, P4 PageScaffold adoption, P6 mobile stat grid.
3. Workstream 1: Users → DataList.
4. Workstream 2: Videos toolbar + pagination.
5. Workstream 3: Video editor → Drawer + sectioning + BadgeRangeEditor.
6. Workstream 1 tail: WMI mobile flow.
7. Full webwright re-capture + visual diff.
