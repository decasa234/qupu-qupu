# Multi-Olympiad Admin Drills — Design

- **Date:** 2026-06-17
- **Branch:** `claude-mythos-optimization`
- **Status:** Approved design → ready for implementation plan
- **Scope owner:** admin side of the drills/papers area only

## 1. Context & current state

After the `feat/wmi-concept-taxonomy` merge, the admin drills page is **already
multi-brand under the hood**:

- **Registry** `api/services/wmi/olympiads/registry.ts` defines brands (`wmi`, `sasmo`)
  with `slug`, `prefix`, `nameEn/nameId`, `rounds[]`, `levels[]`, `variants?`,
  `defaultDurationMin`, and `formatCode()`. Helpers: `getBrand`, `listBrands`,
  `generatePaperCode`, `generateQuestionCode`. Imported on both client and server
  (`.js` extension convention).
- **Schema** `wmi_papers` is brand-aware (migration `0035_papers_multi_brand`): columns
  `brand`, `level_code`, `level_sort`, nullable `grade` (WMI bridge), `round`, `variant`,
  unique `(brand, year, level_code, round, variant)`, brand indexes. No CHECK on round/variant.
- **Admin UI** `src/pages/admin/AdminWmiDrill.tsx` has brand tabs, registry-driven
  level/round filters, paper list grouped by `level_code` (sorted by `level_sort`), paper
  detail + review + per-question quick-fix.
- **Admin API** `/api/admin/wmi/papers` (`api/routes/wmi-admin.ts`,
  `api/services/wmi/paperReviews.ts`) lists papers across **all** brands — no hardcoded `wmi`.

It *looks* WMI-only because: (1) only WMI papers exist in the DB, so only the WMI tab
renders (tabs are derived from brands that have papers); (2) SEAMO/IKMC/TIMO/OSN/HKIMO
are not in the registry; (3) there is **no runtime create/import** — papers enter only via
the build-time seed loader `db/seed/wmi/load.ts`.

## 2. Goal / Non-goals

**Goal:** Make the admin drills page genuinely multi-olympiad by (a) registering all six
olympiads, (b) seeding a **paper "shell"** (metadata + code, no questions yet) for every
real paper already collected in `docs/reference/competition-papers/`, and (c) surfacing all
olympiads + their shells in the admin UI so questions can be filled in incrementally.

**Non-goals (this spec):**
- Actual **question extraction** into the shells (separate workstream — see §6).
- Any **member-facing** change. Member papers stay WMI-only (the existing
  `WHERE brand='wmi'` in `api/services/wmi/papers.ts` is left as-is) so members never see
  empty papers.
- Runtime CRUD/import UI for papers (user chose the seed-based route).

## 3. Key decisions (confirmed)

| # | Decision | Choice |
|---|---|---|
| Q1 | How papers enter | **Seed the paper shells first with codes; extract questions later** |
| Q2 | Olympiad scope | **Register all 6; fill papers incrementally** (pilot one brand end-to-end first) |
| T1 | SEAMO X | **Its own brand `seamo-x`** (cleaner codes; it is a distinct contest) |
| T2 | "Needs extraction" state | **`question_count = 0` + a UI badge** — no new status column |

## 4. Architecture

### 4.1 Olympiad registry expansion

Add eight brands to `registry.ts` (`wmi`, `sasmo` already exist): `seamo`, `seamo-x`,
`ikmc`, `timo`, `osn`, `hkimo`, `iob`, `simoc`. Level/round schemes derive from the real
papers. Exact codes/durations are finalized against the PDFs during implementation; first
pass:

| Brand | Levels (code) | Rounds (code) | Variants | `formatCode` example | Dur |
|---|---|---|---|---|--:|
| `seamo` | A,B,C,K (… D–F) | contest (`''`) | — | `SEAMO-19-A` | 90 |
| `seamo-x` | A,B,C | contest | — | `SEAMOX-22-A` | 90 |
| `ikmc` | preecolier(PE),ecolier(EC),benjamin(BE)… | contest | — | `IKMC-23-PE` | 120 |
| `timo` | p1…p6 (P1…P6) | prelim(PRE),heat(H),final(F) | — | `TIMO-21-P1H` | 90 |
| `osn` | sd(SD) (… smp,sma) | kecamatan(KEC),kabupaten(KAB),provinsi(PROV),nasional(NAS) | nasional sub-papers via `variant` | `OSN-24-SD-PROV` | 150 |
| `hkimo` | p1…p6 (P1…P6) | heat(H),semifinal(SF),final(F) | — | `HKIMO-23-P1H` | 90 |
| `iob` | tk(TK), k1…k12 (K1…K12) | prelim1(P1),prelim2(P2),prelim3(P3),final(F) | — | `IOB-{YY}-K1-P1` | TBD |
| `simoc` | g1…g10 (G1…G10), jc(JC) | contest | — | `SIMOC-19-G2` | TBD |

Notes:
- `level.grade` is set where a level maps to a single grade (IOB Kelas N → grade N, SIMOC
  Grade N → grade N); left null for multi-grade levels (e.g. SEAMO A = grades 1–2, IKMC
  Pre-Ecolier = classes 1–2). IOB `TK` = kindergarten (grade 0/null).
- OSN national sub-papers (teori1/teori2/eksperimen/semifinal/final) are carried in the
  `variant` field to avoid round explosion.
- **IOB is full name "Indonesian Olympiad Battle (Matematika)" and is bilingual** — each
  paper exists as an EN and an ID PDF, which map to ONE paper's `body_en`/`body_id` (not two
  papers). It is **season-based ("Season 1")** not year-based; store the season's calendar
  year in `year` (confirm from `_extras/Detail Kompetisi.pdf`) and note "Season 1" in the title.
- **SIMOC** = Singapore International Math Olympiad Challenge.

### 4.2 Paper "shell" model

A shell is a normal `wmi_papers` row with:
- `brand`, `year`, `level_code`, `level_sort`, `round`, `variant`, `title`,
  `recommended_duration_min` from the registry/source;
- `question_count = 0` (the "needs extraction" signal — decision T2);
- `source_url` = the **relative archive path** to the source PDF
  (`docs/reference/competition-papers/<brand>/…`), so later extraction knows the source;
- zero `wmi_questions` rows.

No schema migration is required — all needed columns exist (0035).

### 4.3 Seed pipeline generalization

- Generalize `db/seed/wmi/load.ts` → a **brand-generic** loader (e.g. `db/seed/olympiads/load.ts`)
  that reads shell files from `db/seed/olympiads/<brand>/papers/*.json`, upserts on
  `(brand, year, level_code, round, variant)`, and **allows an empty `questions` array**
  (relax the validator's "must have N questions" rule for shells; full validation still
  applies once questions are added).
- A small **generator script** (`db/seed/olympiads/generate-shells.ts`) reads the source
  archives + the registry and emits the shell JSONs, so we don't hand-author ~150 files. It
  is re-runnable and encodes the archive→shell mapping (§5) incl. the wrinkles. **Two source
  roots:**
  1. `docs/reference/competition-papers/` (in-repo) → SEAMO, SEAMO-X, IKMC, TIMO, OSN, HKIMO.
  2. The network share `/Volumes/qupusmb/PastPapers/` (machine-local, not committed) →
     SASMO, IOB, SIMOC. For **IOB**, parse the provided `_index.csv` (`exam,grade,language,
     filepath,google_drive_id`) — it is the cleanest mapping and gives a portable
     `google_drive_id` to use as the shell's source reference. **Filter noise**: drop
     `*.pdf_` and `*.pdf-<uuid>` artifact files.
- **Source reference per shell:** `source_url` holds a stable pointer for later extraction —
  the in-repo relative path, the IOB `google_drive_id`, or a share-relative path. (The share
  itself is not portable/committed; only the pointer is stored.) For SASMO prefer the in-repo
  `docs/reference/competition-papers/sasmo/` set (G2–G6) over the share (only G2–G3).
- Keep the existing WMI seed files working (the loader stays backward-compatible; WMI papers
  with real questions load exactly as before).

### 4.4 Admin drills page changes (small)

`src/pages/admin/AdminWmiDrill.tsx`:
1. **Tabs from `listBrands()`** (registry) instead of only brands-with-papers → all six
   olympiads always visible. Show a per-tab count of papers / "0".
2. **Empty-state badge** "Belum ada soal · perlu ekstraksi" on any paper row/detail where
   `question_count === 0`.
3. **(Optional) filter toggle** "Hanya perlu ekstraksi" to view the extraction backlog.
4. Remove/repurpose the disabled "add new brand" placeholder (brands are registry-driven).

`api/services/wmi/paperReviews.ts`: include a derived `needs_extraction = question_count === 0`
boolean in `AdminPaperSummary` (optional convenience; UI can also compute it).

## 5. Shell catalog (archive → shells)

Generated by the script in §4.3. Approximate volume (~150+ shells):

| Brand | Shells | Mapping / wrinkle |
|---|--:|---|
| SASMO | ~10 | `sasmo/past-papers/`: split the `2019-2020` bundle into per-year shells (2019 G2–6, 2020 G2–6) |
| SEAMO | ~14 | Paper A & B, 2016–2022 (solutions PDFs are sources, not separate shells) |
| SEAMO X | ~8 | brand `seamo-x`: A & B for 2020/2022/2023/2024 |
| IKMC | 10 | Pre-Ecolier + Ecolier × 2019–2023 (answer-key PDFs feed extraction, not shells) |
| TIMO | ~10 | P1–P5 booklets each bundle prelim+heat across 2 years → split per (level, year, round); exact split finalized at authoring |
| OSN | ~31 | one shell per file (year + round, level SD) |
| HKIMO | 20 | `hkimo/primary-{1,2,3}/`: one shell per file (year, level, round heat/semifinal) |
| IOB | ~52 | share `IOB Season 1` via `_index.csv`: (TK + Kelas 1–12) × (Prelim 1–3 + Final); EN+ID = one paper (two language sources). Confirm season year |
| SIMOC | ~13 | share: SIMOC 2019 (G2–G10/JC) + Grade-1 2021–2023; one shell per (year, grade) |

SASMO shells come from the in-repo archive (G2–G6, 2019 & 2020), not the sparser share copy.
WMI shells are unchanged (real WMI papers already seeded).

## 6. "Extract questions later" (deferred — separate spec)

Each shell is a ready target: it has a stable code and a `source_url` PDF. Later extraction
fills `wmi_questions` for a given paper code (via the `wmi-paper-conversion` skill / OCR /
manual authoring), one paper at a time, and bumps `question_count`. The admin review +
quick-fix flow then applies. The extraction mechanism is **out of scope here**; this spec only
guarantees the catalog + codes + sources exist.

## 7. Out of scope (intentional)

- Member-facing multi-olympiad browsing (member stays WMI-only).
- Question extraction (separate workstream).
- Runtime paper CRUD/import UI.
- Per-brand narrative branding (colors, descriptions) beyond registry structure.

## 8. Files to change

- `api/services/wmi/olympiads/registry.ts` — add 8 brand entries (seamo, seamo-x, ikmc,
  timo, osn, hkimo, iob, simoc) (+ update `registry.test.ts` with code expectations).
- `db/seed/olympiads/load.ts` (generalized from `db/seed/wmi/load.ts`) — multi-brand,
  shell-aware (empty questions allowed), idempotent upsert.
- `db/seed/olympiads/generate-shells.ts` — new generator (archive + registry → shell JSONs).
- `db/seed/olympiads/<brand>/papers/*.json` — generated shell files.
- `src/pages/admin/AdminWmiDrill.tsx` — registry-driven tabs, empty badge, optional filter.
- `api/services/wmi/paperReviews.ts` — optional `needs_extraction` flag in summary DTO.
- **No DB migration** (schema already supports it).
- **No member-side change.**

## 9. Risks / open items

- **TIMO granularity:** booklets bundle multiple papers; the generator must split them
  (or seed one shell per booklet initially and split during extraction). Resolve at authoring.
- **OSN national sub-papers:** teori/eksperimen/semifinal/final via `variant` — confirm the
  variant values when authoring shells.
- **SASMO bundled file:** the in-repo `2019-2020` PDF covers two years; ensure no duplicate
  2020 shell (take 2019 from the bundle, 2020 from the 2020-only file).
- **IOB season vs year:** IOB is "Season 1", not a calendar year; `year` is NOT NULL with a
  1990–2099 CHECK, so confirm the season's real year from `_extras/Detail Kompetisi.pdf` and
  store it (keep "Season 1" in the title). Duration / question count also TBD from that doc.
- **IOB bilingual:** EN + ID PDFs are the SAME paper → one shell, two language sources
  (`body_en`/`body_id` at extraction). Do not create two shells per (grade, round).
- **Share noise:** `/Volumes/qupusmb/PastPapers` has artifact dupes — SASMO `*.pdf-<uuid>`
  and IOB `*.pdf_`; the generator must filter to canonical PDFs (or trust IOB `_index.csv`).
- **Share is machine-local:** not committed; only `source_url` pointers (drive id / relative
  path) are stored. Generating IOB/SIMOC/SASMO shells requires the share mounted.
- **Registry codes** must round-trip uniquely; covered by `registry.test.ts`.
- Empty (0-question) papers appearing in admin must NOT leak to members — guaranteed by the
  untouched `WHERE brand='wmi'` member filter.

## 10. Validation

- `registry.test.ts`: assert `generatePaperCode` outputs for each new brand match the table
  in §4.1, and that `listBrands()` returns all six.
- Seed loader: dry-run the generator → load shells into a scratch DB → assert row counts per
  brand, unique codes, `question_count = 0`, idempotent re-run (no dupes).
- Admin UI (manual/QA): all six brand tabs render; selecting an empty brand shows its shells
  with the "perlu ekstraksi" badge; existing WMI papers still show questions + review.
- `npm run check` clean.

## 11. Suggested build order (pilot-first)

**First-build priority (confirmed): the share's three brands — IOB, SASMO, SIMOC — first
(registry + shells + admin UI), then the rest (SEAMO, SEAMO-X, IKMC, TIMO, OSN, HKIMO).**


1. Registry: add the 6 brands + tests.
2. Generalize the seed loader (shell-aware) — keep WMI loading green.
3. Generator + **pilot one brand end-to-end** → load → see it in the admin page. Pilot
   candidates: **SIMOC** (simplest: one file = one paper, per-grade) or **IOB** (richest:
   structured `_index.csv` with grade/round/lang/drive_id — but resolve the season→year first).
   **IKMC** is the cleanest in-repo alternative (no share needed).
4. Admin UI: registry-driven tabs + empty badge (+ optional filter).
5. Generate remaining brands' shells (the rest of: SASMO, SEAMO, SEAMO-X, IKMC, TIMO, OSN,
   HKIMO, IOB, SIMOC).
