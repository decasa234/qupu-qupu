# Track Frontend + Theme Packs (Plan 2 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Child-facing UI for the track engine built in Plan 1: a theme-driven track map (units → concept nodes → gates), the lesson play screen with labeled recall questions and level-up results, and the gate play screen — reachable by direct URL only (no child-visible links until Plan 3's cutover).

**Architecture:** New sibling components under `src/components/wmi/track/` copy-adapt the polished garden path visuals (PathNode/PathTrail) but read all stage art from a 6-stage **theme pack** registry instead of `PLANT_STAGES`. The old garden stays byte-untouched (coexistence; the copies retire it at Plan-3 cutover). Data flows through new typed wrappers in `src/lib/wmiApi.ts` hitting the Plan-1 endpoints; static track structure (names, spine order) comes from the browser-safe registry import, per-child state from `GET /me/wmi/tracks/:trackId`.

**Tech Stack:** React 18 + Tailwind (existing arbitrary-value design system), React Router 7, axios instance `src/lib/api.ts`, vitest for pure logic.

## Global Constraints

- Do NOT modify: `src/components/wmi/path/*`, `src/pages/BelajarPath.tsx`, `src/components/wmi/plantStages.ts`, or any api/ file — Plan 2 is frontend-only, and the live garden must stay untouched (spec coexistence).
- Visual language (copy exactly from the existing path components): white cards `ring-2 ring-[#FFE3CC]` + `shadow-[0_5px_0_0_#FFD3B1]`; orange CTAs `bg-qupu-brand-orange shadow-[0_4px_0_0_#C46123]` with `tap-press active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]`; Fredoka via `font-display`; Font Awesome icons only (no emoji, no new icon libs beyond the existing lucide exception in BottomTabBar).
- Node anatomy MUST match `src/components/wmi/path/PathNode.tsx`'s current system: static solid side rim (color from theme stage `rimHex`) as its own layer, face sinks partially on press (`tap-press`), segment-arc progress ring sized so button+rim sit inside, donut spotlight (`0 0 0 5px #F0853A` box-shadow) + breathing glow (`animate-breathe`) + checkpoint flag + MULAI/TES BAB chips.
- Theme packs define **6 stage visuals (levels 0–5)**; spec: forest extends today's five with one intermediate tree stage.
- Recall questions show a visible chip labeled `Ulangan` with `fa-solid fa-clock-rotate-left`.
- Server payload shapes (Plan 1, verbatim): track state `{ trackId, theme, status, units: [{ key, nameId, colorHex, iconKey, unlocked, nodes: [{kind:'concept', slug, nameId, level, gold} | {kind:'gate', key, problemRef, requires, unlocked, cleared}] }] }`; lesson build `{ questions: [{instanceId, conceptSlug, level, recall, bodyId, bodyEn, answerType, choicesId, choicesEn}] }`; lesson commit `{ focusCorrect, passed, levelBefore, levelAfter }`; gate get `{ unlocked, cleared, question|null }`; gate submit `{ correct, cleared }`.
- Routes: map = `/belajar/track/:trackId` (chrome visible, inside AppShell); lesson = `/latihan/track/:trackId/sesi/:focusSlug` and gate = `/latihan/track/:trackId/gerbang/:gateKey` (both must hide chrome → add ONE regex `/^\/latihan\/track\//` to `PLAY_ROUTES` in `src/components/AppShell.tsx` — this is the single allowed AppShell edit).
- `npm run check` clean per task; run only touched vitest files per task; the tree carries unrelated uncommitted work — `git add` ONLY task files, never `-A`.

---

### Task 1: Frontend types + API wrappers

**Files:**
- Modify: `src/types/wmi.ts` (append track types)
- Modify: `src/lib/wmiApi.ts` (append five wrappers)

**Interfaces:**
- Produces (used by every later task):

```ts
// src/types/wmi.ts (append)
export interface TrackConceptNodeState {
  kind: 'concept'; slug: string; nameId: string; level: number; gold: boolean
}
export interface TrackGateNodeState {
  kind: 'gate'; key: string; problemRef: string; requires: string[]; unlocked: boolean; cleared: boolean
}
export type TrackNodeState = TrackConceptNodeState | TrackGateNodeState
export interface TrackUnitState {
  key: string; nameId: string; colorHex: string; iconKey: string; unlocked: boolean; nodes: TrackNodeState[]
}
export interface TrackState {
  trackId: string; theme: string; status: string; units: TrackUnitState[]
}
export interface TrackLessonQuestion {
  instanceId: string; conceptSlug: string; level: number; recall: boolean
  bodyId: string; bodyEn: string; answerType: 'multiple_choice' | 'fill_in'
  choicesId: WmiChoice[] | null; choicesEn: WmiChoice[] | null
}
export interface TrackLessonResult {
  focusCorrect: number; passed: boolean; levelBefore: number; levelAfter: number
}
export interface TrackGateView {
  unlocked: boolean; cleared: boolean
  question: { bodyId: string; bodyEn: string; answerType: string; choicesId: WmiChoice[] | null; choicesEn: WmiChoice[] | null } | null
}
```

```ts
// src/lib/wmiApi.ts (append; unwrap() already exists in the file — reuse it)
export async function fetchTrackState(childId: string, trackId: string): Promise<TrackState>
export async function buildTrackLesson(childId: string, trackId: string, focusSlug: string): Promise<{ questions: TrackLessonQuestion[] }>
export async function commitTrackLesson(childId: string, trackId: string, focusSlug: string, answers: Array<{ instanceId: string; selectedAnswer: string; recall: boolean }>): Promise<TrackLessonResult>
export async function fetchTrackGate(childId: string, trackId: string, gateKey: string): Promise<TrackGateView>
export async function submitTrackGate(childId: string, trackId: string, gateKey: string, selectedAnswer: string): Promise<{ correct: boolean; cleared: boolean }>
```

- [ ] **Step 1:** Open `src/lib/wmiApi.ts`, confirm the local response-unwrap helper's exact name/shape (it wraps `{ success, data }`), then append the five wrappers calling: `GET /me/wmi/tracks/${trackId}?childId=`, `POST /me/wmi/tracks/${trackId}/lessons` `{childId, focusSlug}`, `POST .../lessons/commit` `{childId, focusSlug, answers}`, `GET .../gates/${gateKey}?childId=`, `POST .../gates/${gateKey}/submit` `{childId, selectedAnswer}` — mirroring the file's existing function style exactly. Append the types to `src/types/wmi.ts` (reuse the existing `WmiChoice` type in that file).
- [ ] **Step 2:** `npm run check` → clean.
- [ ] **Step 3:** Commit:

```bash
git add src/types/wmi.ts src/lib/wmiApi.ts
git commit -m "feat(track-ui): track state/lesson/gate API wrappers + types"
```

---

### Task 2: Theme pack registry (forest, 6 stages)

**Files:**
- Create: `src/components/wmi/track/themes.ts`
- Test: `src/components/wmi/track/themes.test.ts`

**Interfaces:**
- Produces:

```ts
export interface TrackStage {
  icon: string        // FA suffix, e.g. 'fa-tree'
  iconPrefix: string  // 'fa-solid'
  bg: string
  fg: string
  rimHex: string      // solid side-rim color (darker shade of bg)
  labelId: string
  /** Render the three-tree forest face instead of a single icon. */
  forest?: boolean
}
export interface TrackThemePack {
  key: string
  /** Exactly 6 stages, index = level 0..5 (5 = gold). */
  stages: readonly [TrackStage, TrackStage, TrackStage, TrackStage, TrackStage, TrackStage]
  trailColor: string       // path stroke, e.g. '#FFD3B1'
  mapNameId: string        // copy token, e.g. 'Kebun'
}
export function getThemePack(key: string): TrackThemePack  // falls back to forest
```

- [ ] **Step 1: Failing test** (`themes.test.ts`): `getThemePack('forest')` returns 6 stages; stage 5 has `forest: true` and gold bg `#ffdd55`; stage 0 icon `fa-egg`; unknown key falls back to forest; every stage has non-empty `rimHex`.
- [ ] **Step 2:** Implement. Forest pack values — levels 0–3 copy today's `PLANT_STAGES` 0–3 exactly (egg `#EFE6D6`/`#C0A98A`/rim `#D9CCB4` "Belum dimulai"; seedling `#E4F3D6`/`#5A8A2E`/`#C4DCA8` "Baru belajar"; leaf `#BCE39A`/`#3F7A18`/`#9AC276` "Berlatih"; tree `#58A700`/`#FFFFFF`/`#3F7A18` "Mahir"); **level 4 is the new intermediate stage**: big tree `fa-tree`, bg `#3F7A18`, fg `#FFFFFF`, rim `#2E5B10`, labelId `'Rimbun'`; level 5 gold: `fa-tree`, bg `#ffdd55`, fg `#30598A`, rim `#E3B93E`, labelId `'Dikuasai'`, `forest: true`. `trailColor: '#FFD3B1'`, `mapNameId: 'Kebun'`. Do NOT import `plantStages.ts` — the pack owns its values (garden stays independent).
- [ ] **Step 3:** `npx vitest run src/components/wmi/track/themes.test.ts` → PASS; `npm run check`.
- [ ] **Step 4:** Commit: `git add src/components/wmi/track/ && git commit -m "feat(track-ui): theme pack registry with 6-stage forest pack"`

---

### Task 3: TrackNode + TrackTrail components

**Files:**
- Create: `src/components/wmi/track/TrackNode.tsx`
- Create: `src/components/wmi/track/TrackTrail.tsx`
- Test: `src/components/wmi/track/trackLayout.test.ts` (pure spine-layout math only)

**Interfaces:**
- Consumes: `TrackStage`/`TrackThemePack` (Task 2); `TrackUnitState`/`TrackNodeState` (Task 1).
- Produces:

```ts
// TrackNode.tsx
interface TrackNodeProps {
  node: TrackNodeState
  stage: TrackStage            // resolved stage for concept nodes (theme.stages[level])
  spotlit: boolean             // donut + glow + MULAI chip
  checkpoint: boolean          // static checkered flag
  onClick: () => void
  anchorRef?: Ref<HTMLButtonElement>
}
export default function TrackNode(props: TrackNodeProps): JSX.Element

// TrackTrail.tsx
interface TrackTrailProps {
  units: TrackUnitState[]
  theme: TrackThemePack
  /** slug of the selected concept or `gate:${key}` — spotlight override */
  selectedKey: string | null
  /** slug of the recommended next concept (first non-gold in an unlocked unit) */
  checkpointSlug: string | null
  onConcept: (node: TrackConceptNodeState, unit: TrackUnitState) => void
  onGate: (node: TrackGateNodeState, unit: TrackUnitState) => void
  currentRef?: Ref<HTMLButtonElement>
}
export default function TrackTrail(props: TrackTrailProps): JSX.Element
export function pickCheckpoint(units: TrackUnitState[]): string | null
```

- [ ] **Step 1:** Read `src/components/wmi/path/PathNode.tsx` and `PathTrail.tsx` end-to-end first. TrackNode is a copy-adaptation with these mappings — everything else (rim layer + groupShift centering, tap-press, arc geometry constants SEG/SEG_GAP/ARC_R=46/ARC_C, pads 13/7/5, donut box-shadow `0 0 0 5px #F0853A`, breathing glow `-inset-[5px] ring-[6px] animate-breathe`, checkpoint flag, chip styling) is copied VERBATIM:
  - Stage art from `props.stage` (bg/fg/icon/rimHex) instead of `PLANT_STAGES[tier]`; `forest: true` renders the three-tree face (copy that JSX, fg from stage).
  - Arcs show `level` of 5 segments filled (level 0–5; at 5 the node is gold — no arcs, same as mastered today: gold nodes get no ring wrapper background, just the disc + twinkle stars).
  - Concept locked state = parent unit `unlocked === false` → gray disc + lock icon + rim `#D8D2C2` (copy).
  - Gate nodes: white flag disc when `unlocked && !cleared`; gold crown disc when `cleared`; gray flag when locked — chips `Tes Bab` (`#30598A` unlocked / `#C3CAD6` locked) — copy the boss branches.
  - Spotlit: donut + glow + `Mulai` chip + rim depth 6/pad 7/press 3px — copy.
- [ ] **Step 2:** TrackTrail copy-adapts PathTrail: same `ROW_H = 104`, `PAD_TOP = 10`, `PAD_BOT = 28`, `nodeOffsets` zigzag (import from `src/components/wmi/path/pathLayout.ts` — pure, import allowed; do not modify it), chapter tint section `${unit.colorHex}12`, banner (icon tile, name, progress bar = gold-count/total, fraction), SVG spline with `theme.trailColor`, dashed when unit locked. `pickCheckpoint`: first unlocked unit's first concept with `level < 5`, else null. Banner has no breakdown-sheet tap in Plan 2 (plain div, not a button).
- [ ] **Step 3:** Pure test `trackLayout.test.ts`: `pickCheckpoint` — picks first non-gold concept in an unlocked unit; skips locked units; null when everything gold.
- [ ] **Step 4:** `npx vitest run src/components/wmi/track/trackLayout.test.ts` → PASS; `npm run check`; `npx eslint src/components/wmi/track` clean.
- [ ] **Step 5:** Commit: `git add src/components/wmi/track/ && git commit -m "feat(track-ui): theme-driven TrackNode + TrackTrail"`

---

### Task 4: Track map page + route

**Files:**
- Create: `src/pages/TrackMap.tsx`
- Modify: `src/App.tsx` (one route line inside the AppShell member group)

**Interfaces:**
- Consumes: `fetchTrackState` (T1), `TrackTrail`/`pickCheckpoint`/`getThemePack` (T2/T3).

- [ ] **Step 1:** `TrackMap.tsx` — mirror `BelajarPath.tsx`'s page skeleton WITHOUT its sheets/FABs/celebrations (Plan 2 keeps the map lean): `useParams().trackId`, activeChild guard ("Pilih profil anak dulu."), fetch on `[activeChildId, trackId]` with the same loading-skeleton and error-retry blocks (copy those two JSX blocks verbatim, they are house style), then `<TrackTrail>` with `theme=getThemePack(state.theme)`. Node taps: concept → navigate(`/latihan/track/${trackId}/sesi/${node.slug}`) when its unit is unlocked; gate → navigate(`/latihan/track/${trackId}/gerbang/${node.key}`) when `node.unlocked || node.cleared`. Spotlight = checkpoint slug (no sheets in Plan 2 → selection == checkpoint). Show a small `status` pill (`draft`/`review`) at the top when `state.status !== 'published'` so testers always see they're on an unpublished track: cream chip, `fa-flask` icon.
- [ ] **Step 2:** Route in `src/App.tsx`: find the member route group rendering inside `<AppShell />` (where `belajar`/`main`/`profil` live) and add `<Route path="belajar/track/:trackId" element={<TrackMapPage />} />` with a lazy import matching the file's existing lazy-boundary conventions (read how BelajarPath/MemberHome are imported — some member core is eager; follow the nearest sibling's pattern).
- [ ] **Step 3:** `npm run check`; `npx eslint src/pages/TrackMap.tsx` clean.
- [ ] **Step 4:** Commit: `git add src/pages/TrackMap.tsx src/App.tsx && git commit -m "feat(track-ui): track map page at /belajar/track/:trackId"`

---

### Task 5: Lesson play page (recall chips, one-miss result)

**Files:**
- Create: `src/pages/TrackLesson.tsx`
- Modify: `src/App.tsx` (route), `src/components/AppShell.tsx` (ONE line: add `/^\/latihan\/track\//` to `PLAY_ROUTES`)

**Interfaces:**
- Consumes: `buildTrackLesson`/`commitTrackLesson` (T1), `getThemePack` (T2), existing `WmiAnswerChoice`, `KonsepConfetti`, `ConfirmModal`, `BackButton`.

- [ ] **Step 1:** `TrackLesson.tsx` — session flow modeled on `src/pages/WmiChapterTest.tsx` (read it first; same header row: close + green gradient progress bar + `n / total` Fredoka counter; same exit-confirm ConfirmModal; same question-card chrome `rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]`):
  - On mount: `buildTrackLesson(childId, trackId, focusSlug)`; loading skeleton + ErrorRetry per house pattern.
  - One question at a time; multiple choice via `WmiAnswerChoice` (store `ch.text` as the answer like WmiChapterTest does); fill-in via the same pill input.
  - **Recall chip**: when `question.recall`, render above the question text: `<span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[0.6875rem] font-black text-[#30598A]"><i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />Ulangan</span>` plus `aria-label` noting it is a recall question.
  - Last question's CTA `Selesai` → `commitTrackLesson(...)` with all answers `{instanceId, selectedAnswer, recall}`.
  - Result screen (ceremony-style card copied from WmiChapterTest's result): confetti when `result.passed`; `passed && levelAfter > levelBefore` → headline `Naik ke Level ${levelAfter}!` and the theme stage icon for `levelAfter` in the medallion (stage from `getThemePack('forest')` — Plan 2 hardcodes forest lookup by the track's theme via location state or a second `fetchTrackState`; simplest: pass `theme` through router state from TrackMap and default to forest); `levelAfter === 5` → headline `Emas! ${focus} dikuasai`; failed → `Belum lulus — maksimal 1 salah` with retry + back buttons. Back CTA: `Kembali ke Peta` → `/belajar/track/${trackId}`.
- [ ] **Step 2:** Routes: `<Route path="latihan/track/:trackId/sesi/:focusSlug" element={<TrackLessonPage />} />` in the same member group; add the single PLAY_ROUTES regex to AppShell (verify chrome hides by the regex matching `/latihan/track/...`).
- [ ] **Step 3:** `npm run check`; eslint clean on new/changed files.
- [ ] **Step 4:** Commit: `git add src/pages/TrackLesson.tsx src/App.tsx src/components/AppShell.tsx && git commit -m "feat(track-ui): lesson play page with recall chips + level-up result"`

---

### Task 6: Gate play page

**Files:**
- Create: `src/pages/TrackGate.tsx`
- Modify: `src/App.tsx` (route)

**Interfaces:**
- Consumes: `fetchTrackGate`/`submitTrackGate` (T1), `WmiAnswerChoice`, `KonsepConfetti`, `BackButton`.

- [ ] **Step 1:** `TrackGate.tsx` — single-question flow with the same session header (no progress bar; label `Tes Bab`): fetch gate; `!unlocked` → locked card ("Kuasi semua konsepnya dulu!" + back CTA); question card renders `bodyId` + choices/fill-in; submit → `submitTrackGate`; result: correct → confetti + gold crown medallion `Gerbang terbuka!` + `Kembali ke Peta`; wrong → rose medallion `Belum tepat — coba lagi!` with retry (refetch to allow resubmission) + back. `cleared` on load → show the already-cleared state directly (gold, no question).
- [ ] **Step 2:** Route `latihan/track/:trackId/gerbang/:gateKey` (PLAY_ROUTES regex from Task 5 already covers it).
- [ ] **Step 3:** `npm run check`; eslint clean.
- [ ] **Step 4:** Commit: `git add src/pages/TrackGate.tsx src/App.tsx && git commit -m "feat(track-ui): gate play page"`

---

### Task 7: Verification (controller-run)

- [ ] `npm run check`, `npm test`, `npx eslint` on all Plan-2 files → clean.
- [ ] Browser verification with the session's preview-harness pattern (controller runs it): stub `api.get/post` for track endpoints, mount TrackMap/TrackLesson/TrackGate, screenshot: map (6-stage nodes incl. new level-4 stage + gate states), lesson (recall chip visible), results (level-up + gold + fail), gate (locked/cleared). Remove harness afterward.
- [ ] No commit unless stragglers surface.

## Self-Review

- **Spec coverage (Plan-2 slice):** theme packs 6 stages ✓ (T2); trail/node theme-driven ✓ (T3); map ✓ (T4); lesson with labeled recall + level-up ✓ (T5); gates ✓ (T6); coexistence (garden untouched) enforced by Global Constraints; review-status VISIBILITY gating stays Plan 3 (map shows a status pill instead — deliberate, recorded).
- **Placeholders:** steps reference reading named existing files for idioms (actions, not gaps); all copy strings and classes specified.
- **Type consistency:** T1 names (`fetchTrackState`, `TrackLessonQuestion.recall`, `TrackGateView.question`) match usage in T4–T6; `TrackStage.rimHex/forest` (T2) match T3's rendering contract.
