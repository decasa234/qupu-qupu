# Member UX Refinement — Skill-Tree Path, 3-Tab IA, Parent Dashboard

**Date:** 2026-06-12 · **Branch:** `claude-mythos-optimization` · **Status:** Approved, awaiting plan
**Source:** Founder walkthrough feedback (2026-06-12). One spec, one release; implementation sequenced structure-first (approach A).

## Goals (founder's words, distilled)

1. Grade must be set at onboarding **and persist server-side** (today it's localStorage-only — breaks across devices).
2. Kill information overload on kid pages: **icon + number + ≤3 words**; sentences only inside tap-to-open sheets.
3. Hard separation: **all settings live in a PIN-locked Parent Dashboard; PIN required on every entry.**
4. Kid UI should feel like a game (Duolingo-level).
5. Video and WMI are different topics → selectable side by side in a catalog page, not buried or tab-split.
6. Concepts = a dedicated learning page (the skill tree); drills live inside WMI.

## 1. Information architecture

Three kid tabs (BottomTabBar):

| Tab | Icon | Route | Content |
|---|---|---|---|
| Belajar | `fa-solid fa-play` | `/belajar` | Winding-path skill tree. Login lands here (`postLoginRoute`). |
| Main | `fa-solid fa-gamepad` | `/main` | World-chooser catalog: two big cards — WMI Arena and Video. |
| Profil | `fa-solid fa-user` | `/profil` | Kid-only profile (see §5). |

One level down from `/main`:
- **`/wmi-arena`** — competition prep: Latihan Campur drill entry + Ujian WMI (papers list → existing exam stack).
- **`/video`** — existing video catalog + quiz flow, unchanged content.

Removed/moved:
- **LatihanHub ("Main" catalog page) deleted** — replaced by the new `/main` world-chooser.
- **Dashboard (`/dashboard`) and Rapor (`/report`) leave the kid app** — their content moves into the Parent Dashboard. Kid chrome never links to them.
- **Me page's parent area** (ChildrenManager, Pengaturan card, email toggle, Ubah PIN, logout, account header) moves to `/parent`. **Logout exists only behind the PIN.**
- Badges stay kid-side, reached from Profil.
- Tes Bab leaves the WMI grouping — it becomes the boss node at the end of each chapter trail (§2).

Old routes (`/latihan/wmi`, `/latihan`, `/library`, `/me`, `/dashboard`, `/report`, `/latihan/wmi/*`) get `<Navigate replace>` redirects to their new homes. Exam/paper/tes sub-routes keep working under new parents.

## 2. Belajar — the skill tree (centerpiece)

**Layout.** One scrollable trail per grade (grade comes from the child profile, §6). Chapters render in unlock order as themed banner headers; each chapter's concept nodes zig-zag down the trail (alternating x-offsets, SVG path drawn behind); the chapter ends with a larger **boss node = Tes Bab** (castle/flag styling). Gating rules unchanged: boss victory (or ≥70% mean comprehension) opens the next chapter — same backend, new face.

**Nodes carry the plant metaphor** (tier from `wmi_concept_progress.best_tier`): empty dirt → sprout → growing plant → Mahir tree → gold Dikuasai tree. Current node pulses with a play overlay; locked nodes grey + padlock. **Zero text on the canvas.** Tapping a node opens a bottom sheet: concept name, plant, "Mulai" button — nothing else.

**Resume & declutter.** Auto-scroll to the current node on mount; a small floating "Lanjut" button replaces the resume-hero card. **Misi Hari Ini collapses to a single chest icon** in the header with a count badge when claimable; tap opens the quests sheet (existing DailyQuestsPanel content, claim flow unchanged). Grade chips removed from kid view — grade changes happen in the Parent Dashboard. Streak-recovery modal and coach-mark survive (coach-mark re-targets the current node).

**Per-node sessions.** Tapping a concept node starts a **10-question session: ~80% that concept, ~20% review** of earlier concepts in the chapter (weighted plan generator is client-side today; it gains a `focusSlug` mode and a size parameter). Commit pipeline, idempotency, ceremony, XP/quests/chests/economy: **unchanged**. Boss node launches the existing Tes Bab flow.

**Component sourcing:** 21st.dev was searched (2026-06-12) — no usable path/node component exists; the trail is hand-built (~150 lines: zigzag node offsets + SVG connector) with QUPU tokens per the `qupu-ui` skill. Re-check 21st.dev during implementation for small pieces (bottom sheet, FAB) only.

## 3. Main catalog + WMI Arena + Video

- **`/main`**: two large tappable world-cards (icon + one word + one tiny stat strip each): **WMI Arena** (`fa-trophy`, trophy/best-score hint) and **Video** (`fa-clapperboard`, watched count). Game-styled, fills the viewport, leaves room for a future third world.
- **`/wmi-arena`**: two entries — Latihan Campur (existing drill engine) and Ujian WMI (papers list → exam stack, P2 restyle already applied). No Tes Bab here.
- **`/video`**: existing MemberVideos + VideoDetail/Quiz flow; only the entry point moves.

## 4. Parent Dashboard (`/parent`)

- Entry: a small, deliberately un-game-like "Orang Tua" link on Profil.
- **PIN pad on every entry** — remove the sessionStorage unlock cache (`src/lib/parentUnlock.ts` semantics change); navigating away re-locks. Verify via existing `POST /users/me/pin/verify` (rate-limited 10/min). Parents without a PIN are prompted to create one (existing SetPinModal).
- **"Lupa PIN" gets UI**: password-account holders re-authenticate with their password to set a new PIN (API path already exists). Google-only accounts keep the v1 limitation (clear Indonesian message).
- Contents (parent-styled — calmer, text allowed, no kid tab bar):
  - **Profil Anak** — add/edit/switch children, including the new grade field.
  - **Rapor Belajar** — current Report page content.
  - **Statistik & Misi Harian** — current Dashboard page content.
  - **Pengaturan** — email reminder toggle (`notify_email`), Ubah PIN, account info (name/email), **Keluar**.

## 5. Declutter rules (Profil + sessions)

- **Kid Profil (`/profil`)**: avatar hero with level ring · 3-stat icon row (streak/XP/coins, numbers only) · horizontal badge shelf (links to Badges page) · compact family leaderboard/quest cards · inventory grid. Account header removed (lives in `/parent`).
- **Session/drill screens**: header reduces to progress dots + close; concept/tag labels removed from kid view; vote/feedback controls collapse behind a small flag icon; explainer stays behind its existing button; result remains the staged ceremony.
- Global rule for kid surfaces: **icon + number + ≤3 words**; longer copy only inside sheets/modals the kid explicitly opens.

## 6. Backend & data (intentionally small)

- **Migration 0046**: `children.grade SMALLINT CHECK (grade BETWEEN 1 AND 6)` NULL-able (legacy rows). Child create/update endpoints accept + validate it (Joi); onboarding wizard writes it (wizard UI already asks TK/Kelas 1–6; TK stores 1).
- `inferWmiGrade` prefers `child.grade` (clamped to WMI 1–3 like today's mapping), falls back to age-group inference; the localStorage pin (`gradeByChild`) demotes to a cache that the server value overwrites on load.
- PIN verify per-entry as §4. No other API changes. **No reward-economy, progression, or session-commit changes** beyond the client-side plan generator (`focusSlug`, size 10).
- Frontend: new route table + redirects; `postLoginRoute` → `/belajar` (members) — admin behavior untouched.

## Out of scope

Per-problem timers (old epic slice 3), cosmetics expansion, WhatsApp keys, public leagues, any admin-area changes, `VITE_ADMIN_ONLY` deployment behavior (unchanged — gate still wraps whatever routes exist).

## Verification

- `npm run check`, lint, full test suite (incl. DB integration suite against `qupu_test`), build.
- Webwright browser runs of the four core journeys:
  1. login → lands on `/belajar` → tap current node → 10-question session → ceremony → node plant grows.
  2. finish a chapter → boss Tes Bab node → pass → next chapter banner unlocks.
  3. `/main` → WMI Arena → Latihan Campur answers flow; `/main` → Video → quiz flow.
  4. Profil → "Orang Tua" → PIN required → grade edit on a child → garden re-fetches at new grade; leave `/parent`, re-enter → PIN required again.
- Old bookmarked routes redirect correctly; `VITE_ADMIN_ONLY=true` build still gates everything.
