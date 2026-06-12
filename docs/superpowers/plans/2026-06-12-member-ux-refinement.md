# Member UX Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the kid app into 3 tabs (Belajar skill-tree / Main world-chooser / kid-only Profil), move every setting into a PIN-on-every-entry Parent Dashboard, persist child grade server-side, and apply the icon-first declutter rule.

**Architecture:** Spec: `docs/superpowers/specs/2026-06-12-member-ux-refinement-design.md`. Structure-first sequencing: backend grade (T1–T2) → route/tab skeleton (T3) → new pages (T4–T7) → declutter (T8) → verification (T9). No reward-economy or session-commit changes; the only engine change is the client-side session plan generator.

**Tech Stack:** React 18 + Vite + Tailwind (qupu-ui tokens, Fredoka, FA icons — NO emoji, NO shadcn), Express + Joi + pg, vitest. Member UI copy in Indonesian.

**Conventions that bind every task:**
- `api/` imports use `.js` extensions. SQL lives in services, not routes.
- Use the `qupu-ui` skill's visual language for all kid surfaces (ring `#FFE3CC`, hard shadow `#FFD3B1`, rounded-2rem, `font-display`).
- Member-facing errors via `toIndonesianErrorMessage`; never raw `err.message`.
- DB integration tests follow the existing `api/__tests__/` skip-convention (they skip without `TEST_DATABASE_URL`); run with `--hookTimeout 120000 --no-file-parallelism`.
- Commit after each task with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Migration 0046 — `children.grade` + API support

**Files:**
- Create: `db/migrations/0046_child_grade.sql`
- Modify: `db/schema.sql` (children table), `api/routes/children.ts`, `api/services/children.ts`, `src/types/index.ts` (Child)
- Test: `api/__tests__/children.grade.test.ts`

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/0046_child_grade.sql
-- School grade chosen at onboarding (0 = TK, 1-6 = SD Kelas 1-6).
-- Nullable: legacy rows keep NULL and fall back to age-group inference.
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS grade SMALLINT
  CHECK (grade IS NULL OR (grade >= 0 AND grade <= 6));
```

Mirror the same column into the `children` CREATE TABLE in `db/schema.sql` (fresh installs include all migrations).

- [ ] **Step 2: Write the failing DB test**

```ts
// api/__tests__/children.grade.test.ts — follow the existing harness pattern
// (see api/__tests__/gamification/familyQuest.test.ts for app+token setup).
it('stores and returns grade on create/update', async () => {
  const created = await asParent.post('/api/children').send({ name: 'Adik', grade: 2 })
  expect(created.status).toBe(201)
  expect(created.body.data.child.grade).toBe(2)
  const updated = await asParent
    .patch(`/api/children/${created.body.data.child.id}`)
    .send({ grade: 3 })
  expect(updated.body.data.child.grade).toBe(3)
})
it('rejects out-of-range grade', async () => {
  const res = await asParent.post('/api/children').send({ name: 'X', grade: 9 })
  expect(res.status).toBe(400)
})
```

- [ ] **Step 3: Run it — expect FAIL** (`grade` ignored / undefined in response).

- [ ] **Step 4: Implement**

`api/routes/children.ts` — add to BOTH schemas:
```ts
grade: Joi.number().integer().min(0).max(6).allow(null).optional(),
```

`api/services/children.ts` — add `grade` to `ChildRow` (`grade: number | null`), `Child` (`grade: number | null`), `CHILD_COLUMNS` (`, grade`), `mapChild` (`grade: row.grade === null ? null : Number(row.grade)`), the INSERT (new column + `input.grade ?? null`), and the dynamic UPDATE block:
```ts
if (input.grade !== undefined) {
  params.push(input.grade)
  sets.push(`grade = $${params.length}`)
}
```
Extend both input types with `grade?: number | null`.

`src/types/index.ts` — add `grade: number | null` to the FE `Child` interface.

- [ ] **Step 5: Apply migration to LAN `qupu` AND `qupu_test`** (PG* env-var pattern from `docs` / memory — the DATABASE_URL password contains `@`, so parse it via a node one-liner, never `psql "$URL"`).

- [ ] **Step 6: Run the test — expect PASS.** Run `npm run check`. Commit.

---

### Task 2: Onboarding writes grade; `inferWmiGrade` prefers it

**Files:**
- Modify: `src/components/onboarding/ChildOnboardingWizard.tsx`, `src/lib/childGrade.ts`, `src/components/me/ChildrenManager.tsx` (grade display only for now — editing UI lands in Task 7)
- Test: `src/lib/childGrade.test.ts` (extend)

- [ ] **Step 1: Extend `childGrade.test.ts`** with failing cases:

```ts
it('prefers the server-persisted grade over age-group inference', () => {
  expect(inferWmiGrade({ ageGroupId: null, grade: 3 }, [])).toBe(3)
  expect(inferWmiGrade({ ageGroupId: null, grade: 5 }, [])).toBe(3) // clamped
  expect(inferWmiGrade({ ageGroupId: null, grade: 0 }, [])).toBe(1) // TK
})
it('falls back to inference when grade is null', () => {
  expect(inferWmiGrade({ ageGroupId: null, grade: null }, [])).toBe(1)
})
```

- [ ] **Step 2: Run — expect FAIL** (type error / wrong value).

- [ ] **Step 3: Implement.** Change the signature's pick to `Pick<Child, 'ageGroupId' | 'grade'>` and prepend:

```ts
const persisted = child?.grade
if (typeof persisted === 'number') return clampToWmiGrade(persisted)
```

(The existing inference body stays as fallback.) The `gradeByChild` localStorage pin in `wmiStore` is now a cache: in `AppShell`'s sync effect nothing changes — `syncChildGrade(activeChildId, inferWmiGrade(child, ageGroups))` already resolves pin-first; ALSO call `pinGradeForChild(activeChildId, inferred)` when `child.grade` is a number so the server value overwrites a stale pin:

```ts
// AppShell sync effect, after computing inferred:
if (typeof child?.grade === 'number') pinGradeForChild(activeChildId, inferred)
syncChildGrade(activeChildId, inferred)
```

- [ ] **Step 4: Wizard sends grade.** In `ChildOnboardingWizard.tsx`, `GRADE_OPTIONS` already carry the school grade implicitly (`tk`,`sd1`…`sd6`). Add `schoolGrade` to each option (`tk: 0`, `sd1: 1` … `sd6: 6`) and include `grade: selectedOption.schoolGrade` in the `POST /api/children` payload alongside `ageGroupId`.

- [ ] **Step 5: Run unit tests (`npx vitest run src/lib/childGrade.test.ts`), `npm run check`, lint. Commit.**

---

### Task 3: Route restructure — 3 tabs, redirects, post-login landing

**Files:**
- Modify: `src/App.tsx`, `src/components/app-shell/BottomTabBar.tsx`, `src/lib/postLoginRoute.ts` (+ its test)

- [ ] **Step 1: Update `postLoginRoute.test.ts`** expectations: members with ≥1 child land on `/belajar` (admins `/admin/dashboard`, no-child `/onboard/child` unchanged). Run — FAIL.

- [ ] **Step 2: `postLoginRoute.ts`** — change the member return to `/belajar`. Run — PASS.

- [ ] **Step 3: New route table in `App.tsx`** (inside the AppShell group). Final kid routes:

```tsx
<Route path="belajar" element={<BelajarPath />} />            {/* Task 5; until then alias WmiHubPage */}
<Route path="main" element={<MainCatalog />} />               {/* Task 4 */}
<Route path="wmi-arena" element={<WmiArena />} />             {/* Task 4 */}
<Route path="video" element={<MemberVideosPage />} />
<Route path="profil" element={<MePage />} />
<Route path="badges" element={<BadgesPage />} />
<Route path="shop" element={<ShopPage />} />
<Route path="quiz/:slug" element={<QuizPage />} />
<Route path="latihan/wmi/ujian" element={suspended(<WmiPapersPage />)} />
<Route path="latihan/wmi/papers/:id" element={suspended(<WmiPaperDetailPage />)} />
<Route path="latihan/wmi/exam/:sessionId" element={suspended(<WmiExamPage />)} />
<Route path="latihan/wmi/exam/:sessionId/review" element={suspended(<WmiExamReviewPage />)} />
<Route path="latihan/wmi/tes/:subjectKey" element={<WmiChapterTest />} />
<Route path="latihan/wmi/sesi/:subjectKey" element={<WmiKonsepSession />} />
```

Redirects (old → new), same group:
```tsx
<Route path="latihan/wmi" element={<Navigate to="/belajar" replace />} />
<Route path="latihan" element={<Navigate to="/main" replace />} />
<Route path="latihan/wmi/konsep" element={<Navigate to="/wmi-arena" replace />} />
<Route path="library" element={<Navigate to="/video" replace />} />
<Route path="me" element={<Navigate to="/profil" replace />} />
<Route path="dashboard" element={<Navigate to="/parent" replace />} />
<Route path="report" element={<Navigate to="/parent" replace />} />
```
Keep `WmiKonsepDrill` mounted at `/wmi-arena/campur` (moved from `latihan/wmi/konsep`). `/parent` is added in Task 7 — until then point the two redirects at `/profil` and flip them in Task 7. Delete the `DashboardRouter` admin special-case only if `/dashboard` no longer renders DashboardPage (it redirects), and keep `HomeRoute`/`AdminOnlyGate` logic untouched.

- [ ] **Step 4: `BottomTabBar.tsx`** — three tabs:

```ts
const TABS = [
  { to: '/belajar', label: 'Belajar', icon: 'fa-solid fa-play' },
  { to: '/main',    label: 'Main',    icon: 'fa-solid fa-gamepad',
    activePrefixes: ['/main', '/wmi-arena', '/video', '/quiz', '/latihan'] },
  { to: '/profil',  label: 'Profil',  icon: 'fa-solid fa-user',
    activePrefixes: ['/profil', '/badges', '/shop'] },
]
```

- [ ] **Step 5: `npm run check` + lint + `npx vitest run src/lib` + manually click through dev server (old URLs redirect). Commit.**

---

### Task 4: `/main` world-chooser + `/wmi-arena`; delete LatihanHub

**Files:**
- Create: `src/pages/MainCatalog.tsx`, `src/pages/WmiArena.tsx`
- Delete: `src/pages/LatihanHub.tsx`
- Modify: `src/App.tsx` (imports), any `Link to="/latihan"` references (`grep -rn '"/latihan"' src/`)

- [ ] **Step 1: `MainCatalog.tsx`** — full-viewport column of two world cards (`useDocumentTitle('Main')`). Each card: big icon medallion, one-word title, tiny stat chip, hard-shadow brand card, whole card is a `<Link>`:

```tsx
const WORLDS = [
  { to: '/wmi-arena', icon: 'fa-solid fa-trophy',      title: 'WMI',   accent: '#F59E0B' },
  { to: '/video',     icon: 'fa-solid fa-clapperboard', title: 'Video', accent: '#6366F1' },
]
```
Stat chips: WMI card shows exam-papers-attempted count if cheaply available from existing `fetchConceptProgress`/papers API; otherwise omit the chip (do NOT add a new endpoint). Video card: watched count from existing dashboard data only if already exposed via a public/me endpoint — same rule.

- [ ] **Step 2: `WmiArena.tsx`** — two entry cards: **Latihan Campur** → `/wmi-arena/campur` (`fa-solid fa-shuffle`) and **Ujian WMI** → `/latihan/wmi/ujian` (`fa-solid fa-medal`). No Tes Bab. Header: title + back. Icon + ≤3 words per card.

- [ ] **Step 3: Delete `LatihanHub.tsx`,** fix all imports/links, run `grep -rn "LatihanHub\|to=\"/latihan\"" src/` → only redirect rows remain.

- [ ] **Step 4: check + lint + click-through (Main tab → both worlds → drill loads, papers load). Commit.**

---

### Task 5: Belajar skill tree (centerpiece)

**Files:**
- Create: `src/pages/BelajarPath.tsx`, `src/components/wmi/path/PathTrail.tsx`, `src/components/wmi/path/PathNode.tsx`, `src/components/wmi/path/ConceptSheet.tsx`, `src/components/wmi/path/QuestsSheet.tsx`
- Modify: `src/App.tsx` (point `/belajar` at BelajarPath), `src/components/onboarding/GardenCoachMark.tsx` (re-target)
- Delete (after parity): `src/pages/WmiHub.tsx`, `src/components/wmi/ChapterGarden.tsx` usage from member surface
- Test: `src/components/wmi/path/pathLayout.test.ts` (pure layout fn)

Data: existing `fetchGarden(childId, grade)` → `WmiGarden` (chapters with `unlocked`, concepts with `pct`/`tier`/`slug`). NO new endpoints.

- [ ] **Step 1: Pure layout function + test first.** `pathLayout.ts` in the same folder:

```ts
export interface PathPoint { x: number; y: number }
// Zigzag x-offsets in a 0..1 lane, one row per node, chapter banners get their own rows.
export function nodeOffsets(count: number): PathPoint[] {
  const LANE = [0.5, 0.22, 0.5, 0.78] // gentle S-curve repeating
  return Array.from({ length: count }, (_, i) => ({ x: LANE[i % LANE.length], y: i }))
}
```
Test: offsets alternate, stay within [0.2, 0.8], length matches.

- [ ] **Step 2: `PathNode.tsx`.** Props: `{ state: 'locked'|'current'|'done', tier: 0|1|2|3|4, isBoss: boolean, onClick }`. Renders a circular button (56px; boss 72px):
  - locked → grey, `fa-solid fa-lock`;
  - current → brand-orange ring pulse (`animate-pulse` halo div), `fa-solid fa-play` overlay badge;
  - done → plant icon by tier reusing the garden's tier→icon mapping (extract the existing PlantIcon mapping from ChapterGarden into `src/components/wmi/plantTier.ts` and import from both during the transition);
  - boss → `fa-solid fa-flag-checkered` (locked/current) or `fa-solid fa-crown` gold when passed.
  Hard-shadow brand styling; NO text.

- [ ] **Step 3: `PathTrail.tsx`.** Props: `{ garden: WmiGarden, onNode(concept, chapter), onBoss(chapter) }`. For each chapter in order: a banner row (chapter title + tiny progress fraction — the ONLY text on the canvas, ≤3 words), then its concept nodes positioned by `nodeOffsets` (row height ~96px; `left: x*100%` within the 460px column), then the boss node. Behind nodes, one SVG `<path>` per chapter drawn through the node centers (quadratic segments, stroke `#FFD3B1`, width 8, dashed for locked chapters). Current node = first non-Mahir concept in the first unlocked-incomplete chapter (mirror `pickResumeChapter` logic from WmiHub — port it, don't rewrite).

- [ ] **Step 4: `ConceptSheet.tsx`** — bottom sheet (fixed bottom, slide-up, backdrop): plant icon at tier, concept name, tier label chip, single "Mulai" button → `navigate('/latihan/wmi/sesi/'+chapter.subjectKey+'?fokus='+concept.slug)`. Boss tap → `navigate('/latihan/wmi/tes/'+chapter.subjectKey)` directly (existing confirm screen lives there).

- [ ] **Step 5: `QuestsSheet.tsx`** — wraps the existing `DailyQuestsPanel` content in the same bottom-sheet chrome. Header of BelajarPath gets the chest button: `fa-solid fa-treasure-chest` is NOT in FA6 free — use `fa-solid fa-gift`; red count badge = claimable quests (data already in the panel's hook; lift the count via a small exported hook or props callback).

- [ ] **Step 6: `BelajarPath.tsx`** — assemble: fetch garden for `effectiveGrade` (same clamp as WmiHub — port `clampGardenGrade`), auto-scroll to current node on mount (`ref.scrollIntoView({ block: 'center' })`), floating "Lanjut" FAB (bottom-right above tab bar, `fa-solid fa-play` + "Lanjut") that scrolls/opens the current node's sheet. Preserve: `StreakRecoveryModal` + `useStreakRecoveryPrompt` (gate on no open sheet), `GardenCoachMark` (target the current node, only when `grownTotal === 0`), loadError retry card, `useDocumentTitle('Belajar')`. NO grade chips, NO resume hero, NO inline quests panel.

- [ ] **Step 7: Swap `/belajar` to BelajarPath; delete `WmiHub.tsx`** and `grep -rn "WmiHub" src/` → zero hits. If `ChapterGarden` becomes unreferenced, delete it too (plant mapping now lives in `plantTier.ts`).

- [ ] **Step 8: vitest (layout + existing suites), check, lint, manual: path renders all 3 grades' gardens, locked chapters grey, sheet opens, quest sheet opens with claim flow intact. Commit.**

---

### Task 6: Per-node sessions (focused plan) + boss wiring

**Files:**
- Modify: `src/pages/WmiKonsepSession.tsx`, `src/lib/konsepSessionStorage.ts` (snapshot carries plan already — verify size-agnostic)
- Test: extract `buildPlan` to `src/lib/konsepPlan.ts` + `src/lib/konsepPlan.test.ts`

- [ ] **Step 1: Extract + extend the plan builder.** New `src/lib/konsepPlan.ts`:

```ts
import type { WmiGardenConcept } from '../types/wmi'

export const SESSION_SIZE = 20
export const FOCUS_SESSION_SIZE = 10
const FOCUS_SHARE = 0.8

export function buildPlan(
  concepts: WmiGardenConcept[],
  opts?: { focusSlug?: string; size?: number },
): WmiGardenConcept[] {
  const size = opts?.size ?? SESSION_SIZE
  const focus = opts?.focusSlug ? concepts.find((c) => c.slug === opts.focusSlug) : undefined
  if (!focus) return weightedPlan(concepts, size)        // existing behavior, verbatim
  const focusCount = Math.max(1, Math.round(size * FOCUS_SHARE))
  const others = concepts.filter((c) => c.slug !== focus.slug)
  const review = others.length ? weightedPlan(others, size - focusCount) : []
  // Interleave: focus-heavy but never >3 consecutive repeats of the same slug.
  return interleave(Array(focusCount).fill(focus), review)
}
```
`weightedPlan` = the current `buildPlan` body (no-repeat-adjacent weighting). `interleave` spreads review items evenly through the focus run. Tests: size 10 default for focus mode caller, 8/2 split, single-concept chapter → all focus, no slug appears >3× consecutively when review exists, no-focus call identical in distribution shape to old behavior (length + members).

- [ ] **Step 2: Run plan tests — FAIL → implement → PASS.**

- [ ] **Step 3: Wire the query param.** In `WmiKonsepSession.tsx`: read `fokus` via `useSearchParams`; when present call `buildPlan(chapter.concepts, { focusSlug, size: FOCUS_SESSION_SIZE })`, else exactly as today. Replace the module-level `SESSION_SIZE` uses with `plan.length` (progress bar at line ~523, the answers-guard `answers.length >= plan.length`, commit trigger). The sessionStorage snapshot already persists the plan array — resume of a 10-question session must work unchanged; extend a `konsepSessionStorage.test.ts` case with a 10-length plan.

- [ ] **Step 4: Commit path unchanged** — `commitKonsepSession` takes the answers array as-is (server folds whatever arrives; 10 answers = legal). Verify no server-side `=== 20` assumption: `grep -n "20" api/services/wmi/concepts/session.ts` and confirm only batching, no size checks. The ceremony reads counts from the result — no change.

- [ ] **Step 5: check + lint + vitest + one full focused session against dev DB (plant grows, ceremony plays, replay-safe). Commit.**

---

### Task 7: Parent Dashboard `/parent` + kid-only Profil

**Files:**
- Create: `src/pages/parent/ParentDashboard.tsx`, `src/pages/parent/ParentHome.tsx` (menu), `src/components/parent/PinEntryGate.tsx`, `src/components/parent/ForgotPinModal.tsx`
- Modify: `src/App.tsx` (route + flip `/dashboard`,`/report` redirects to `/parent`), `src/pages/Me.tsx` (strip parent area), `src/lib/parentUnlock.ts` (delete or gut), `src/components/me/ChildrenManager.tsx` (grade editing), `src/components/parent/ParentGate.tsx` (superseded — delete after Me is stripped)
- Reuse: `src/pages/Dashboard.tsx` + `src/pages/Report.tsx` rendered INSIDE the parent shell (import as sections, do not fork their logic)

- [ ] **Step 1: `PinEntryGate.tsx`** — full-screen gate using the existing `PinPad`: on mount, if `user.pinSet === false` show `SetPinModal` (create-first flow); else PIN pad → `POST /users/me/pin/verify`; wrong PIN shakes (PinPad built-in); "Lupa PIN" link → `ForgotPinModal`. **No persistence of unlock anywhere** — unlocked state is React state inside the `/parent` route element; navigating away unmounts it = re-lock. Delete `markParentUnlocked`/`isParentUnlocked` usages (`grep -rn "parentUnlock" src/`); the SetPinModal-at-signin `onSuccess` in AppShell simply drops its `markParentUnlocked` call.

- [ ] **Step 2: `ForgotPinModal.tsx`** — password-account flow: password input → `POST /users/me/pin` with `{ pin, password }` (endpoint already accepts a password credential; verify exact field name in `api/routes/users.ts` and reuse). Google-only accounts (no password): show the existing Indonesian limitation copy instead of the form (detect via the error code the endpoint returns; surface, don't guess client-side).

- [ ] **Step 3: `ParentDashboard.tsx`** — route element for `/parent/*`: holds `unlocked` state; renders `PinEntryGate` until verified, then a parent-styled shell: calmer palette (slate-on-cream, normal text density allowed), top bar with "Kembali ke aplikasi anak" back link, **no kid BottomTabBar** (mount `/parent` OUTSIDE the AppShell route group in App.tsx — sibling of `/onboard/child`, inside ProtectedRoute). Sections via internal tabs or stacked cards (`ParentHome.tsx` menu → sections):
  1. **Profil Anak** — `ChildrenManager` (moved here) + add **Kelas** selector per child (TK/Kelas 1–6 chips writing `grade` via `PATCH /api/children/:id`; on save, if the edited child is active, call `pinGradeForChild` + `syncChildGrade` so the garden refetches at the new grade).
  2. **Rapor Belajar** — render the existing `ReportPage` component.
  3. **Statistik & Misi Harian** — render the existing `DashboardPage` component.
  4. **Pengaturan** — email-reminder toggle (move from Me), "Ubah PIN" (SetPinModal change-mode), account info (name/email read-only + existing edit if present), **Keluar** (logout + navigate `/login`).

- [ ] **Step 4: Strip `Me.tsx` to kid-only Profil** (declutter per spec §5): avatar hero + level ring (`AvatarEditor`, `LevelDetail`), 3-stat icon row (streak/XP/coins from `useGamificationStats` — numbers only), horizontal badge shelf linking to `/badges`, `FamilyLeaderboard` + `FamilyQuestCard` compact, `InventoryGrid`. Remove: account header, ChildrenManager, Pengaturan card, logout, ParentGate. Add the small "Orang Tua" entry: a muted row at the very bottom — `fa-solid fa-user-shield` + "Orang Tua" → `/parent`. Delete `ParentGate.tsx` when unreferenced.

- [ ] **Step 5: Flip the `/dashboard` and `/report` redirects to `/parent`.** `grep -rn '"/dashboard"\|"/report"\|"/me"' src/` and update all remaining links (e.g. TopStatStrip, ceremony CTAs) to their new homes (`/profil`, `/parent`).

- [ ] **Step 6: check + lint + manual: enter `/parent` → PIN every time (leave & return → PIN again); wrong PIN shake + rate limit message; Lupa PIN with password works; grade edit refetches garden; kid Profil has no settings, no logout. Commit.**

---

### Task 8: Session-screen declutter

**Files:**
- Modify: `src/pages/WmiKonsepSession.tsx`, `src/pages/WmiKonsepDrill.tsx` (shared bits), `src/components/wmi/WmiVoteButtons.tsx` call sites

- [ ] **Step 1:** Header on both screens reduces to: progress dots (`WmiDots`) + close (`fa-solid fa-xmark`) button. Remove concept/tag label chips from the kid question view (`tagLabel` usages on these two pages only — the admin drill page keeps them).

- [ ] **Step 2:** Collapse `WmiVoteButtons` behind a small `fa-solid fa-flag` icon button (corner of the feedback panel); tapping reveals the vote row inline. Explainer stays behind its existing button.

- [ ] **Step 3:** check + lint + play one session + one drill run; verify vote still submits and telemetry events unchanged. Commit.

---

### Task 9: Verification sweep

- [ ] **Step 1:** `npm run check` && `npm run lint` && `npx vitest run` (unit) — all green.
- [ ] **Step 2:** DB integration suite against `qupu_test`: `TEST_DATABASE_URL=... npx vitest run api/__tests__ --hookTimeout 120000 --no-file-parallelism` — all green.
- [ ] **Step 3:** `npm run build` — chunks healthy (member core stays lazy-split; no recharts regression).
- [ ] **Step 4:** Webwright journeys (per spec §Verification): (1) login → `/belajar` → node → 10-q session → ceremony → plant tier-up; (2) boss Tes Bab unlock flow; (3) `/main` → WMI Arena drill, `/main` → Video quiz; (4) Profil → Orang Tua → PIN-every-entry + grade edit refetch. Save evidence under `final_runs/`.
- [ ] **Step 5:** Old-route redirects (`/latihan/wmi`, `/library`, `/me`, `/dashboard`, `/report`, `/latihan`) land correctly; `VITE_ADMIN_ONLY=true npm run build` still produces the gated app.
- [ ] **Step 6:** Commit any fixes; final integration review (adversarial reviewer pass over the whole diff) before declaring done.
