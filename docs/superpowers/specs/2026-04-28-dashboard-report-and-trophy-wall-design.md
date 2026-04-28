---
date: 2026-04-28
topic: dashboard-report-and-trophy-wall
status: design
---

# Dashboard Refresh + Rapor Anak + Trophy-Wall Badges

## Problem

The member-facing surfaces show counts, not insight. Parents open `/dashboard` and see four KPI cards (attempts, average, videos completed, total badges) plus two list cards (Recent attempts, Best per video) and a Badge-per-subject widget. Nothing answers the parent's actual first question: **"where is my kid strong, where is my kid weak?"** There is also no formal report surface a parent can print or showcase.

## Goal

Three coordinated changes shipped together:

1. **Dashboard refresh** — slim layout. Hero becomes a per-subject mastery panel (coverage + score) with a prominent **See Report** call-to-action. Drop the `Best per video` and `Badge per subject` cards from this page; their data lives more naturally on the Report and Trophy-Wall surfaces respectively.
2. **Rapor (See Report) page** — a new printable, all-time report card per child. Formal A4 portrait layout, predikat per subject (SANGAT BAIK / BAIK / CUKUP / KURANG / BELUM MULAI), per-subject video breakdown, auto-generated catatan, parent-signature line. Browser print → save-as-PDF; no PDF library.
3. **Badges page rewrite** — kid-facing trophy wall. Subject-tinted shelves of round trophy medallions, locked badges shown faded with the source-video name as a hint.

## Non-Goals

- Custom date-range or semester filters on the rapor. v1 is all-time only (period start = earliest `score_attempts.created_at` for the child, falling back to `children.created_at`; period end = now).
- Server-rendered PDF. Browser print only.
- Share-to-WhatsApp / share-image generation.
- Streak / effort / attendance metrics.
- Badge-detail modal on the trophy wall — a tapped trophy navigates to its source video.
- Linking the rapor route from the Navbar — entry point is the dashboard CTA only.
- Changes to admin pages or to the score-submission / badge-unlock business rules.

## Architecture

### Data — extend `GET /api/me/progress`

The endpoint stays at one round-trip per child. Append three new fields to the response, derived in `api/services/member.ts` `getMemberProgress`:

```ts
{
  // ...existing summary, recentAttempts, videoProgress, subjectTotals, child
  periodStart: string  // ISO — earliest score_attempts.created_at for child, else children.created_at
  periodEnd: string    // ISO — now()
  subjectStats: Array<{
    id: string
    name: string
    slug: string
    colorHex: string
    totalVideosAvailable: number   // published videos matching child's age_group, joined to this subject
    videosAttempted: number        // distinct videos with score_attempts for this child
    averageBestScore: number | null   // avg of best score_percentage per attempted video; null when videosAttempted = 0
    badgesEarned: number           // SUM(user_badge_unlocks.badge_count) for this child × subject
    badgesAvailable: number        // SUM(video_badge_rules.badge_count) across totalVideosAvailable's videos
    predikat: 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'KURANG' | 'BELUM_MULAI'
    videos: Array<{                // rincian for rapor; ordered latestAttemptAt DESC
      videoId: string
      videoSlug: string
      videoTitle: string
      bestScore: number
      bestCorrectAnswers: number
      totalQuestions: number
      badgeCount: number
      latestAttemptAt: string
    }>
  }>
}
```

**Coverage filter** — `totalVideosAvailable` filters published videos by `child.age_group_id`. If the child's `age_group_id` is null, count all published videos for that subject (matches the existing public catalog behaviour: nothing is hidden by age when age is unknown).

**Predikat thresholds** (server-side, on `averageBestScore`):

| `averageBestScore` | predikat |
|---|---|
| `null` (videosAttempted = 0) | `BELUM_MULAI` |
| `< 55` | `KURANG` |
| `55 – 69.99` | `CUKUP` |
| `70 – 84.99` | `BAIK` |
| `≥ 85` | `SANGAT_BAIK` |

Predikat is computed server-side so the rapor and dashboard cannot disagree.

After this PR no consumer reads the existing `subjectTotals` field — Dashboard drops the Badge-per-subject card, the Trophy Wall reads `/me/badges`, and the rapor uses the richer `subjectStats`. Drop `subjectTotals` from the `/me/progress` response and from `MemberProgress` in the same change.

### Frontend route table (`src/App.tsx`)

Add `/report` as a `ProtectedRoute` (no admin gate; same auth surface as `/dashboard`). Render `<ReportPage />`. Unknown paths still redirect to `/`.

### Frontend file plan

**New:**

- `src/pages/Report.tsx` — rapor page. Reads `/me/progress` for the active child, composes the rapor sections, applies print CSS.
- `src/components/dashboard/SubjectMasteryCard.tsx` — hero card on Dashboard. Renders the subjectStats list with two stacked bars per subject (coverage % and averageBestScore %) plus the prominent **Lihat rapor lengkap →** button linking to `/report`.
- `src/components/dashboard/RecentAttemptsCompact.tsx` — extracted slim version of the existing recent-attempts list (no Best-per-video block).
- `src/components/report/RaporHeader.tsx` — child name, age group, period, QUPU brand.
- `src/components/report/RaporSummary.tsx` — 4-KPI strip (mirrors dashboard so the rapor stands alone).
- `src/components/report/RaporSubjectTable.tsx` — table: subject / coverage / rata skor / badge / predikat.
- `src/components/report/RaporVideoBreakdown.tsx` — per-subject collapsible rincian (default open in print, closed on screen).
- `src/components/report/RaporNote.tsx` — auto catatan paragraph.
- `src/components/report/RaporFooter.tsx` — print date, qupu.id, signature line.
- `src/components/report/PrintButton.tsx` — calls `window.print()`.
- `src/components/badges/TrophyShelf.tsx` — one shelf per subject; tinted with the subject colour.
- `src/components/badges/BadgeMedallion.tsx` — earned (gradient + drop shadow + name) or locked (grey dashed + 🔒 + video name).
- `src/lib/predikat.ts` — pure helpers: `predikatLabel(p)` (id-ID strings + chip colour), `subjectAutoNote(subjectStats)` (top subject + weakest non-empty + suggested empty subject).
- `src/styles/print.css` — `@page { size: A4 portrait; margin: 14mm; }`, hides Navbar/Footer/Tabbar via existing layout class hooks, forces colour-printing (`-webkit-print-color-adjust: exact; print-color-adjust: exact;`), expands `<details>`.

**Modified:**

- `src/pages/Dashboard.tsx` — slim to: `<KPIStrip />` (existing 4-card row, kept) + `<SubjectMasteryCard />` (new hero) + `<RecentAttemptsCompact />` + existing **Profil aktif** card. Remove the `Best per video` card and the `Badge per subject` card. Replace the old hero "Progres belajar Andi…" block with the mastery hero — keep the dashed-orange shell + 4 stars to retain the QUPU look.
- `src/pages/Badges.tsx` — full rewrite around `TrophyShelf`. Reuses the existing `/me/badges` endpoint; no API change for v1. The hero header shows "Hebat, {name}!" + total badges + 3 latest medallions.
- `src/types/index.ts` — extend `MemberProgress` with `periodStart`, `periodEnd`, `subjectStats`. Add `Predikat` union type and `SubjectStat` interface.
- `api/services/member.ts` — `getMemberProgress` extended with the new aggregations (a single additional query joined with the existing transaction client).
- `src/main.tsx` — add `import './styles/print.css'` next to the existing `./index.css` import.
- `src/App.tsx` — register `/report` route.

**Deliberately not modified:**

- `src/components/Navbar.tsx` — no rapor link; the dashboard CTA is the only way in.
- `api/routes/member.ts` — no new route; data is bolted onto the existing endpoint.
- `db/schema.sql`, migrations — no schema change. Predikat is computed; nothing is persisted.

### Auto catatan logic (`src/lib/predikat.ts`)

Pure function, deterministic, runs on the rapor page from `subjectStats`:

1. **Lead with strength** — pick the subject with the highest `averageBestScore` among those where `videosAttempted ≥ 1`. Cite name, score, badge count.
2. **Effort line** — if `summary.attemptsCount ≥ 5`, mention consistency ("Konsistensi belajar terjaga"). Otherwise encourage ("Mari tambah latihan lagi").
3. **Suggestion** — pick the subject with `predikat = 'BELUM_MULAI'` that has the most `totalVideosAvailable`; if none, pick the lowest non-empty `averageBestScore`. Suggest exploring it.

If the child has zero attempts overall, render a fixed encouragement line and skip steps 1–3.

### Print pipeline

- The rapor page is a normal route. The `<PrintButton>` triggers `window.print()`.
- `print.css` is gated by `@media print`:
  - Hide `header[data-app-nav]`, `footer[data-app-footer]`, the bottom tabbar, and any `[data-print-hide]` regions.
  - Force `body` background to white, drop the cream/gradient.
  - Force `<details>` open via `details:not([open]) > summary ~ * { display: block !important; }` plus hide the summary marker.
  - Set `@page` size and margins as above; force colour-print so subject chips and predikat colours survive.
- Browser save-as-PDF is documented inline on the page ("Tekan Ctrl/Cmd+P, pilih 'Simpan sebagai PDF'").

### Trophy wall data dependencies

The trophy-wall rewrite uses the same `/me/badges` endpoint (`SubjectBadgeGroup[]`). The locked-badge "hint" text is the source video title — the existing `unlocks[]` shape gives this for earned badges, and locked badges per-subject can be derived from the subject's `videos` list via the existing `videos.length - unlocks.length` gap if we add the published videos for the subject to the response.

**Decision:** for v1, the trophy wall renders only earned medallions plus a single "🔒 X badge lagi menunggu" tile per subject (count = `subject.totalBadges - sum(unlocks.badgeCount)`). Naming each locked badge requires expanding the `/me/badges` response, which we defer; the count tile keeps scope tight without losing the "more to earn" signal.

## Components in isolation

Each new component owns one job:

- `SubjectMasteryCard` — given `subjectStats`, render the hero. No data fetching, no routing logic beyond the CTA `<Link>`.
- `RaporSubjectTable` — pure render of an array; sorts client-side; no fetch.
- `RaporNote` — `subjectAutoNote(stats)` → string → render.
- `BadgeMedallion` — `{ state: 'earned' | 'locked', label, colorHex, href? }` props only.
- `TrophyShelf` — receives one `SubjectBadgeGroup`; lays out the medallion grid + predikat chip.

The Report and Badges pages stay thin: fetch + pass props.

## Error handling

- `/me/progress` failure on the Report page → same red error card the Dashboard uses today.
- No active child → reuse the existing `AuthCard` "Pilih profil anak dulu" pattern from Dashboard / Badges.
- Empty subjects (no available videos for the age group) — the rapor table omits them; mastery hero omits them; an empty trophy wall shows "Belum ada subject yang tersedia di usia {ageGroup}".

## Testing

No test runner is configured in this repo (per `CLAUDE.md`). Verification will be manual:

1. `npm run check` — typecheck the extended types end-to-end.
2. Manual smoke against a seeded DB:
   - Child with zero attempts → all subjects `BELUM_MULAI`, encouragement note.
   - Child mid-progress → mixed predikat, sensible coverage bars.
   - Child with attempts in one subject only → top-strength note + suggestion for an unstarted subject.
3. Print preview the rapor in Chrome — confirm A4 portrait, no nav/footer leak, predikat chips keep colour, video breakdown expanded.
4. Mobile viewport check on dashboard mastery hero (375px, 768px, ≥1280px).
