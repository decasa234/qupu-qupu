# Admin "WMI Drill" Review Page — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)

## Goal

Add an admin control-panel page to **browse the imported WMI papers and review/flag
each one** (status + notes), mirroring the existing WMI Concepts admin page. Group
both WMI tools under one **WMI** sidebar section.

## Context

- The admin panel (`src/components/AdminLayout.tsx`, flat `NAV` array) has a
  `WMI Concepts` page (`src/pages/admin/AdminWmiConcepts.tsx`): a three-zone
  **list → preview → review** UI. It reads `wmiAdminApi` and stores one review row
  per concept in `wmi_concept_reviews` (`concept_slug` PK, `status`, `notes`,
  `reviewed_by`, `updated_at`).
- The WMI papers/questions imported in the past-paper slice (2019 Final G1–G3) have
  **no admin UI** — they're seed-file content with member-facing read endpoints only
  (`api/services/wmi/papers.ts`, `api/routes/wmi-member.ts`).
- Admin WMI endpoints live in `api/routes/wmi-admin.ts` (already admin-gated) and
  currently cover only concepts.

## Decisions (locked with user)

1. **Capability:** browse + review/flag. The page previews paper questions and lets
   an admin set a review status + notes. Content itself is **read-only** (no editing
   of questions/papers).
2. **Navigation:** group `WMI Concepts` + `WMI Drill` under one **WMI** section in
   the sidebar (a group header with two child links). The existing Concepts page and
   route are unchanged — only regrouped visually.
3. **Review unit:** **per paper** — one status + notes per paper, the faithful mirror
   of the per-concept Concepts page (`paper ↔ concept`, `questions ↔ samples`).

## Mirror mapping

| Concepts page | Drill page |
|---|---|
| concept (slug) | paper (id) |
| samples of a concept | questions of a paper |
| `wmi_concept_reviews` | `wmi_paper_reviews` |
| concept list (left) | paper list (left) |
| sample preview (center) | question preview (center) |
| status chips + notes + Save | status chips + notes + Save |

## Components

### 1. Data — new table `wmi_paper_reviews`

Migration `db/migrations/0031_wmi_paper_reviews.sql` (next free number after `0030`;
renumber if a parallel branch lands `0031` first) + mirror in `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS wmi_paper_reviews (
  paper_id    UUID PRIMARY KEY REFERENCES wmi_papers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','needs_changes')),
  notes       TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Mirrors `wmi_concept_reviews` minus `wmi_refined`, keyed by `paper_id` with a cascade
delete so a removed paper drops its review.

### 2. Backend — admin paper-review service + endpoints

New `api/services/wmi/paperReviews.ts`:
- `listPapersForAdmin()` → all papers (all grades), each with its review `status`
  via `LEFT JOIN wmi_paper_reviews` (`COALESCE(r.status,'pending')`). Returns
  `id, year, grade, round, variant, title, question_count, status`, ordered
  `year DESC, grade ASC, round ASC`.
- `getPaperReview(paperId)` → the review row or `null`.
- `upsertPaperReview(paperId, status, notes, reviewedBy)` → upsert by `paper_id`,
  `updated_at = NOW()`, returns the row.
- `listAdminPaperQuestions(paperId)` → the paper's questions **including `answer`**
  (admins need the answer to QA), ordered by `number`. (A thin admin variant of the
  existing `listWmiQuestionsForPaper`, which deliberately omits `answer` for members.)

New endpoints in `api/routes/wmi-admin.ts` (same router/guards as the concept ones):
- `GET  /papers` → `{ papers: [...] }` from `listPapersForAdmin()`.
- `GET  /papers/:id/questions` → `{ paper, questions }` (paper row + admin questions);
  404 if the paper id is unknown.
- `GET  /papers/:id/review` → `{ review }`, defaulting to
  `{ paper_id, status:'pending', notes:'', reviewed_by:null, updated_at:null }` when
  absent — exactly like the concept review GET.
- `PUT  /papers/:id/review` → validates `{ status: pending|approved|needs_changes,
  notes: string<=5000 }` (the existing `reviewSchema`), calls `upsertPaperReview(...,
  req.user.email)`, returns `{ review }`. Mirrors the concept review PUT.

Paper id is validated as a UUID; unknown id → 404.

### 3. Frontend

- `src/lib/wmiAdminApi.ts` — add `AdminPaperSummary`, `AdminPaperQuestion` (a
  `WmiQuestion` plus `answer: string`), `PaperReview` types and
  `fetchPaperList()`, `fetchPaperQuestions(paperId)`, `fetchPaperReview(paperId)`,
  `savePaperReview(paperId, status, notes)` — mirroring the concept functions.
- `src/pages/admin/AdminWmiDrill.tsx` — mirrors `AdminWmiConcepts` structure and
  styling (reuse `AdminPageHeader`, `Panel`, `SectionHeading`, `Button`, `Textarea`,
  the `STATUS_ORDER`/`STATUS_META` chips):
  - Left: paper list (label `"<year> Grade <grade> <Round>"`, a status dot, question
    count). Selecting a paper loads its questions + its review.
  - Center: page through the paper's questions with `WmiQuestionView`, showing the
    `answer` (admin QA). Prev/next + an index indicator.
  - Right/below: review panel — the same status chips + notes `Textarea` + Save
    button, calling `savePaperReview`. On save, refresh the list status.
- `src/App.tsx` — add route `path="wmi-drill" element={<AdminWmiDrillPage />}` next to
  `wmi-concepts`, with the import.

### 4. Sidebar grouping

Restructure `AdminLayout`'s `NAV` to support a group entry, e.g.
`{ group: 'WMI', children: [Concepts, Drill] }`, while other items stay flat. Render
a small uppercase "WMI" group label with its two child `NavLink`s indented beneath.
Keep the existing styling tokens; the active-state logic is unchanged per link.

## Data flow

```
wmi_papers / wmi_questions / wmi_paper_reviews
        │  (admin service: list + questions[+answer] + review)
        ▼
GET/PUT /api/admin/wmi/papers…   (admin-gated)
        │
        ▼
wmiAdminApi  →  AdminWmiDrill (list → preview → review)
```

## Testing

- **Backend:** a service test for `wmi_paper_reviews` (`upsertPaperReview` then
  `getPaperReview` returns the saved status/notes; a second upsert updates in place)
  run against the LAN DB; `listPapersForAdmin()` returns the seeded 2019 papers each
  with a `status`. (Same DB-backed verification style used for the import slice.)
- **Frontend:** `npm run check` (0 errors) + `npm run lint` (no new errors).
- **Manual spot-check:** open `/admin/wmi-drill`, pick a 2019 paper, page through its
  questions (answers visible, figures render), set status → "approved" + a note, Save,
  reload → the status dot and panel persist; confirm the sidebar shows the grouped WMI
  section with both Concepts and Drill.

## Out of scope

- Editing question/paper content (read-only).
- Per-question review (per-paper only).
- Grade 0 papers (deferred in the import slice; nothing here depends on them).
- Any change to the member-facing drill/exam flow.
