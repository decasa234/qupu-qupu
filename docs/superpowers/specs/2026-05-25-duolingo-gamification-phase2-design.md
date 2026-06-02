# QUPU V2 — Game-loop + Orange Repaint + Landing Merge Design

**Date:** 2026-05-28
**Status:** Approved direction, ready for implementation plan revision
**Author:** Vico (with Claude)
**Prior state:** Duolingo Phase 2 v1 shipped: AppShell, slim Home, shop/inventory foundations, bottom tabs, stat strip.

## Context

V1 got the app closer to a Duolingo-like kid experience, but four things still feel wrong:

1. The 3-quest mission strip feels heavy and spreadsheet-like.
2. The primary practice CTA still sends the kid to `/videos`, which forces browsing instead of starting the recommended activity.
3. Logged-in and logged-out experiences feel like two separate products because `/` remains marketing-first after login.
4. The UI still uses orange as an accent instead of the dominant brand surface.

V2 is a refinement, not a rewrite. Keep the V1 app shell, shop, inventory, badges, report, and backend transaction work. Change the home loop, routing, and visual hierarchy.

## Goals

- Make the member Home feel like a simple game loop: claim, check streak, practice.
- Replace the heavy quest-strip feeling with three action cards.
- Route practice directly to a QUPU-recommended video.
- Make logged-in `/` resolve to the member Home, not marketing.
- Make member surfaces orange-dominant while keeping white chrome for legibility.
- Preserve V1 progress and avoid new backend complexity unless required for recommended practice routing.

## Non-goals

- No new quest engine.
- No new economy rules.
- No paid-product delivery.
- No admin UI for shop items.
- No redesign of admin routes.
- No full redesign of the marketing landing for logged-out visitors.

## Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Quest model | Collapse visible Home loop to 3 action cards: Login Bonus, Streak, Practice. |
| 2 | Visual direction | Orange is the page base for member Home/AppShell; cards sit on cream/yellow/blue. |
| 3 | Primary CTA | Practice card is the hero CTA and routes directly to a recommended video detail page. |
| 4 | Logged-in `/` | Logged-in users navigating to `/` redirect to `/dashboard`. Logged-out users keep marketing Home. |
| 5 | Existing quests | Do not delete backend quest logic. Hide/reframe it behind the simpler action cards. |
| 6 | Chrome | Keep top stat strip and bottom tabs white for contrast and scannability. |
| 7 | Shop | Keep shop teaser as a slim secondary card under the three actions. |
| 8 | Icons | Font Awesome only. No emoji glyphs. |

## System overview

### Routes

- `/`:
  - Logged out: marketing Home under `<Layout>`.
  - Logged in member: redirect to `/dashboard`.
  - Logged in admin: existing admin dashboard redirect behavior remains via `/dashboard` routing.
- `/dashboard`: orange-dominant member Home inside `<AppShell>`.
- `/videos/:slug`: target for recommended practice. V2 may still use marketing Layout if porting video chrome is out of scope.
- `/shop`, `/badges`, `/report`, `/me`: remain inside `<AppShell>`.

### Member Home layout

Home is a short stacked phone-first page:

1. Profile hero.
2. Section label: `Aksi Hari Ini`.
3. Login Bonus card.
4. Streak card.
5. Practice hero card.
6. Slim shop teaser.

This matches the visual mockup in `.superpowers/brainstorm/55346-1779877641/content/home-v2-mockup.html`.

## App-shell visual repaint

`<AppShell>` changes from cream/shell page background to brand orange (`#F0853A`) for member-route body backgrounds where appropriate.

Keep:
- Top stat strip white with peach bottom border.
- Bottom tab bar white with peach top border.
- Phone-first max-width content.

Change:
- AppShell main page background to orange for member pages.
- Home cards use cream/yellow/blue contrast against orange.
- Section labels on orange background use white text with subtle shadow.

Guardrail: routes with dense reading content (`/report`, `/badges`) may keep inner white/cream panels, but the surrounding shell should feel orange-first.

## Home action cards

### 1. Profile hero

Dark-blue gradient card:
- Avatar icon (`fa-solid fa-user-astronaut`).
- Tier label.
- Greeting: `Hai, {childName}!`.
- XP progress bar.
- `xp / xpToNext XP · Level {level}`.

### 2. Login Bonus card

Purpose: make the first daily action feel like claiming a prize, not completing a task.

Visual:
- Cream card.
- Gift icon block.
- Title: `Hadiah Login`.
- Subtitle: `Buka kotak hari ini, kembali besok untuk lebih!`.
- Reward pill: `fa-solid fa-coins +5`.
- CTA: `Klaim`.

Behavior:
- V2 can be UI-only if no login-bonus backend exists yet.
- If a claim endpoint already exists later, wire it to a one-time-per-day reward.
- If not claimable, show the same card as a playful daily presence cue without mutating coins.

### 3. Streak card

Purpose: make streak visible but not dominant.

Visual:
- Cream card.
- Fire icon block.
- Title: `Streak: {n} hari`.
- Subtitle: `Pertahankan dengan latihan hari ini!`.
- CTA: `Lihat`.

Behavior:
- Tap opens existing stat detail if present, or routes to `/report` anchored to activity/streak detail.
- No new streak backend.

### 4. Practice card

Purpose: the main action of the app.

Visual:
- Yellow card (`#FFB400`) with blue shadow.
- Blue icon block with yellow play icon.
- Title: `Latihan Hari Ini`.
- Subtitle: recommended video title, e.g. `Tebak Gambar — Hewan Kebun Binatang`.
- CTA: `Mulai`.

Behavior:
- Tap routes directly to `/videos/{recommended.slug}`.
- Do not route to `/videos` unless no recommendation exists.
- Fallback if recommendation is missing: route to `/videos` with copy `Pilih video latihan`.

## Recommended practice selection

Use existing dashboard data first.

Preferred data source:
- `DashboardViewModel.recommended[0]` if present.

Fallback order:
1. First personalized recommendation from dashboard payload.
2. First featured/public video loaded by existing public videos API.
3. `/videos` catalog as last resort.

Do not add a new recommendation service unless current data cannot produce a stable slug.

## Shop teaser

Keep the slim teaser below the three action cards:

- Dark-blue compact card.
- Yellow bag icon block.
- Title: `Toko QUPU`.
- Subtitle from affordable item count if available: `{n} item bisa dibeli sekarang`.
- CTA: `Lihat` → `/shop`.

The teaser is secondary. It must not compete visually with Practice.

## Data/API impact

Expected minimal backend change:

- No schema changes required for V2 Home.
- No new shop changes required.
- No new quest logic required.

Frontend changes may need:

- Expose recommended video slug/title from existing `DashboardViewModel.recommended` if not already typed.
- Add a small helper to pick `recommendedPractice` from dashboard/public video data.
- Update App routing so `/` redirects authenticated users.

## Implementation phasing

### Phase V2-A — Routing merge

- Update `src/App.tsx` index route behavior:
  - unauthenticated → `<Home />`
  - authenticated → `<Navigate to="/dashboard" replace />`
- Keep `/dashboard` admin redirect behavior intact through `DashboardRouter`.
- Verify logged-out marketing and logged-in redirect.

### Phase V2-B — Orange shell repaint

- Update `src/components/AppShell.tsx` background to brand orange.
- Keep stat strip and tab bar white.
- Check `/dashboard`, `/shop`, `/badges`, `/report`, `/me` for contrast regressions.

### Phase V2-C — Home action cards

- Replace `MissionStrip` usage on `/dashboard` with a 3-card action stack.
- Either create `src/components/dashboard/HomeActionCards.tsx` or split into `LoginBonusCard`, `StreakCard`, `PracticeCard` if the file grows.
- Practice card uses recommended video slug/title.
- Keep `MissionStrip` file only if still referenced elsewhere; otherwise delete it.

### Phase V2-D — Visual QA

- Run `npm run check` and `npm run lint`.
- Start `npm run dev`.
- In a 390px-wide viewport, verify:
  - logged-out `/` shows marketing Home.
  - logged-in `/` lands on `/dashboard`.
  - dashboard is orange-dominant.
  - Practice routes directly to a video detail page.
  - bottom tabs remain legible.
  - `/badges`, `/report`, `/shop`, `/me` remain readable after orange shell change.

## Open risks

- **Login Bonus may imply real coin mutation.** If no endpoint exists, copy must not promise irreversible reward state unless we implement it.
- **Orange background can reduce readability on dense pages.** Keep dense content in white/cream cards.
- **Recommended practice may be empty for new users.** Fallback to public/featured video, then catalog.
- **Video route chrome inconsistency remains.** Direct practice may still jump from AppShell to marketing Layout if `/videos/:slug` stays outside member chrome. Accept for this V2 unless it feels jarring in QA.

## Definition of done

- Logged-in `/` redirects to `/dashboard`.
- Dashboard visually matches the V2 mockup direction: orange base, white chrome, cream/yellow action cards.
- Dashboard shows exactly the simplified daily loop: Login Bonus, Streak, Practice, plus slim shop teaser.
- Practice CTA opens a specific recommended video detail page when one exists.
- `npm run check` and `npm run lint` pass.
- Manual mobile browser QA passes for dashboard and member tabs.

## References

- Visual mockup: `.superpowers/brainstorm/55346-1779877641/content/home-v2-mockup.html`
- Memory: `/Users/vics/.claude/projects/-Users-vics-Development-Project-qupu-website/memory/feedback_mobile_first_app_feel.md`
- Memory: `/Users/vics/.claude/projects/-Users-vics-Development-Project-qupu-website/memory/feedback_no_emojis_use_icons.md`
