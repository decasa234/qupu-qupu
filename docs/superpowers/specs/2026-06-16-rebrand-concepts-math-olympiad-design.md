# Rebrand Concept/Umbrella Copy to "Math Olympiad" — Design Spec (Sub-project B)

**Date:** 2026-06-16
**Branch:** `feat/wmi-concept-taxonomy`
**Status:** Approved structure; pending spec review before planning.
**Parent decomposition:** `docs/superpowers/specs/2026-06-16-math-olympiad-concept-taxonomy-design.md` §12 (sub-project B).

## 1. Context

The product is a primarily-Indonesian math-olympiad prep app. "WMI" (World
Mathematics Invitation) currently appears in the UI in two distinct roles:

1. **Course / concept-practice branding** — the practice hub identity
   ("Latihan WMI", subtitle "World Mathematics Invitation") and the
   brand-agnostic generated-concept drill system.
2. **Past-papers / drill content** — real WMI exam papers ("Soal ujian WMI
   asli") and the WMI drill, which are genuinely WMI-branded.

The past-papers system is now multi-brand (WMI + SASMO), so blanket "WMI"
labeling of the umbrella is already inaccurate.

## 2. Goal

Make the **brand-agnostic concept system and the practice-hub umbrella**
brand-neutral, while **keeping "WMI" on the genuinely-WMI exam papers/drill
items**. Target term: Indonesian learner chrome → **"Olimpiade Matematika"**;
English admin chrome → **"Math Olympiad"**.

This is a **copy-only** change. No routes, no `wmi_*` DB tables/constraints, no
`/api/wmi*` routes, no file/component renames, no code identifiers — those stay
`wmi` (WMI is also a live paper brand). No data model, no logic.

### Non-goals
- Renaming routes/URLs (`/latihan/wmi` stays) or any code/DB identifier.
- Touching the concept taxonomy/tags (that was sub-project A).
- Raising problem difficulty (sub-project C).
- Making the papers section fully brand-aware per paper (a future learner-facing
  multi-brand surface); here we only stop calling the *umbrella* "WMI".

## 3. Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Split | Keep "WMI" on WMI drills/papers; neutralize the concept system. |
| Hub identity | The practice hub goes neutral ("Olimpiade Matematika"); "WMI" remains only on the WMI papers/drill items inside it. |
| Term | ID chrome → "Olimpiade Matematika"; EN (admin) chrome → "Math Olympiad". |
| Scope | User-facing copy strings only; code/routes/DB unchanged. |

## 4. Change set

### CHANGE → neutral

| File:line | Now | → New |
|---|---|---|
| `src/pages/LatihanHub.tsx:93` | `Latihan WMI` | `Olimpiade Matematika` |
| `src/pages/LatihanHub.tsx:94` | `World Mathematics Invitation` | `Latihan bergaya olimpiade internasional` |
| `src/pages/LatihanHub.tsx:64` | `…olimpiade matematika internasional (WMI).` | `…olimpiade matematika internasional.` (drop "(WMI)") |
| `src/pages/WmiHub.tsx:89` | `Latihan WMI` (h1, under "Kursus") | `Olimpiade Matematika` |
| `src/pages/WmiKonsepDrill.tsx:269` | `WMI · Konsep` (eyebrow) | `Olimpiade · Konsep` |
| `src/pages/Report.tsx:145` | `Latihan WMI (konsep)` | `Latihan Konsep` |
| `src/pages/admin/AdminWmiConcepts.tsx:234` | `eyebrow="Admin · WMI"` | `eyebrow="Admin · Konsep"` |
| `src/pages/admin/AdminWmiConcepts.tsx:235` | `title="WMI Concept Proofreading"` | `title="Math Olympiad Concept Proofreading"` |
| `src/pages/admin/AdminDashboard.tsx:88` | `WMI Concept Proofreading` (tile) | `Math Olympiad Concept Proofreading` |

### KEEP (genuinely WMI, or already neutral)

- `src/pages/WmiPapers.tsx:61` `WMI · Ujian` and `:64` `Soal ujian WMI asli.` — real WMI papers.
- `src/pages/WmiHub.tsx:189` `Soal ujian WMI asli per kelas.` — WMI papers section.
- `src/pages/WmiHub.tsx:130` `Soal ujian asli` and `:112` `Latihan Konsep` — already neutral.
- `src/pages/WmiKonsepDrill.tsx:270` `Latihan Konsep` (h1) — already neutral.
- `src/pages/admin/AdminWmiDrill.tsx:260-262` `Admin · WMI` / `WMI Drill Papers` / `Imported WMI exam papers…` — WMI drill.
- `src/components/AdminLayout.tsx:18` admin nav `group: 'WMI'` — spans WMI papers/drill + concept admin; internal.
- `src/pages/admin/AdminWmiConcepts.tsx:405` `title="WMI Refined"` — internal concept-quality jargon; unchanged (DB field is `wmi_refined`).
- `src/components/Navbar.tsx` `label: 'Latihan'` → `/latihan/wmi` — neutral label; route unchanged.
- `index.html` `<title>QUPU</title>` — not WMI; unchanged.

## 5. Architecture / files

Pure string edits in 6 files: `src/pages/LatihanHub.tsx`, `src/pages/WmiHub.tsx`,
`src/pages/WmiKonsepDrill.tsx`, `src/pages/Report.tsx`,
`src/pages/admin/AdminWmiConcepts.tsx`, `src/pages/admin/AdminDashboard.tsx`.
(6 files.) No new modules, no shared helper — the strings are one-offs per page
and a constant would add indirection without reuse value (YAGNI).

## 6. Verification

- `npm run check` (tsc) → exit 0.
- `npm run lint` → no new errors.
- Grep guards:
  - `git grep -n "World Mathematics Invitation" -- src/` → 0 hits.
  - `git grep -n "Latihan WMI" -- src/` → 0 hits in `.tsx` render output (the
    only remaining "Latihan WMI" may be in code comments, which are acceptable;
    confirm none in JSX text).
  - The KEEP list strings still present (spot-check `WMI · Ujian`,
    `WMI Drill Papers` remain).
- Manual smoke (optional): `npm run dev`, open the practice hub + concept drill +
  report; confirm the umbrella/concept copy reads "Olimpiade Matematika /
  Konsep" and the WMI papers/drill still say "WMI".

## 7. Out of scope (other sub-projects)
- Sub-project A — taxonomy/tags (done).
- Sub-project C — raising generated-problem difficulty.
- Future — learner-facing multi-brand papers surface (per-paper brand chips).

## 8. Open questions

None. Exact replacement wording (e.g. the `LatihanHub` subtitle) is the author's
proposal and is trivially adjustable during implementation/review.
