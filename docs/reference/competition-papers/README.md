# Competition Past Papers — Source Archive

Source material for authoring **original** QUPU drills for the SASMO, SEAMO, IKMC, TIMO,
OSN, and HKIMO math olympiads (grades 1–4; JISMO pending). These are reference inputs for the
content pipeline — the same
way `qupu-math-problem-creation` / `wmi-paper-conversion` treat WMI papers. We **do not
republish** these papers; we use them as syllabus + difficulty + archetype references and
author our own parametric drills.

## ⚠️ Copyright / git note

Everything here is **free, publicly distributed** material — official sample papers, syllabi,
and **real full past papers** the organizers or public mirrors host openly (IKMC, OSN, TIMO,
plus free SASMO/SEAMO copies). **Paid** commercial archives (SAP/SIMCC books) are **not**
included, and nothing is sourced from paywalled/pirate re-uploads.

If this repo is or becomes public, **gitignore the `*.pdf` binaries** (keep the `.md`
summaries, which are factual topic lists). Decide before committing.

## Contents

### `sasmo/` — Singapore & Asian Schools Math Olympiad (organizer: SIMCC)
- `SASMO-sample-paper-and-syllabus.pdf` — official sample questions (Grades 2–12) + syllabus.
- `SYLLABUS.md` — extracted topic list + format + per-grade sample questions.
- Grade coverage: Grade 1 (added 2021) through Grade 12. Grades 1–3 are in scope.
- **`past-papers/` — REAL full papers WITH solutions, free & official:** SASMO **2019 & 2020**,
  Grades 2–6, hosted publicly on `simcc.org` (the `2019-SASMO-G*` files bundle both years).
  SASMO has **no Grade 1** (starts at Grade 2). 2021+ are paid / member-login-gated.
- Other (paid) sources: [SAP](https://sapgrp.com/), [interes](https://www.intereseducation.com/), [EduSupport](https://edusupportbook.com/).

### `seamo/` — Southeast Asian Mathematical Olympiad (Terry Chew Institute / TCIMO, pub. SAP)
Official free sample papers + syllabi, pulled from `seamo-official.org/resources`
(DigitalOcean Spaces CDN):
- `SEAMO-syllabus-{K,A,B,C}.pdf` + `SEAMO-sample-paper-{K,A,B,C}.pdf`
- Levels: **K** = Kindergarten 1&2 · **A** = Grades 1&2 · **B** = Grades 3&4 · **C** = Grades 5&6.
  For grades 1–3, the relevant levels are **A and B** (K optional).
- `SYLLABUS.md` — extracted Paper A (14 topics) + Paper B (18 topics) lists + format.
- **`past-papers/` — REAL full contest papers, free:** Paper A + Paper B for **2016–2022**
  (2016 incl. separate solutions) plus **SEAMO X** A/B for 2020/2022/2023/2024 — 24 PDFs,
  content-verified (© TCIMO). Sourced from a public Dropbox mirror (could disappear; we hold
  local copies). Official books with full worked solutions remain paid (SAP Paper A–F).

### `ikmc/`, `timo/`, `osn/`, `hkimo/` — REAL full papers (free), see below

### `jismo/` — Japan International Science & Maths Olympiad
- No free past papers were locatable (newest/smallest of the three; papers distributed via
  the official app / registration). See `jismo/README.md`.
- Official: https://www.jismo-educational.org/home · YouTube `@JISMOEDUCATIONAL`.

### `ikmc/` — International Kangaroo Mathematics Contest (KSF Pakistan)
**Real full past papers, free & official** (unlike SASMO/SEAMO above). Grades 1–4 =
Pre-Ecolier (Class 1–2) + Ecolier (Class 3–4), years **2019–2023**, plus answer keys.
15 PDFs, all content-verified. See `ikmc/README.md`. Source: https://ikmc.kangaroo.org.pk/past_papers/3162

### `timo/` — Thailand International Mathematical Olympiad (OCEC / FERMAT)
**Real, free.** Official all-groups sample (with answers) + FERMAT **Primary 1–5** booklets
(Preliminary + Heat/Final rounds, 2020–2022, bilingual EN/VI, with answer sheets). 6 PDFs.
See `timo/README.md`.

### `osn/` — Olimpiade Sains Nasional / KSN, Matematika SD (Indonesia)
**Real, free.** 31 papers, **2007–2025**, Kecamatan→Kabupaten→Provinsi→Nasional. Indonesian
national olympiad, elementary level (olympiad-hard ≈ grade 4–6). See `osn/README.md`.

### `hkimo/` — Hong Kong International Mathematical Olympiad (OCEC)
**Real, free, official.** Heat-round (+ some semifinal) papers for **Primary 1–3**, years
**2018–2025**, organized `primary-1/`, `primary-2/`, `primary-3/`. 20 PDFs. See `hkimo/README.md`.
Official source `hongkongimo.com` (predictable path
`…/uploads/2/8/9/2/28923219/hkimo_<year>_heat_round_<k|p1..p6>.pdf`) also has KG + P4–P6 and
Finals 2021–2025 if you want to extend.

## Provenance log
| File | Source URL | Access |
|---|---|---|
| sasmo/SASMO-sample-paper-and-syllabus.pdf | stemolympiad.in mirror of official SASMO sample+syllabus | free |
| seamo/SEAMO-syllabus-A.pdf | https://seamo.sgp1.digitaloceanspaces.com/images/resources/syllabus-A.pdf | free |
| seamo/SEAMO-syllabus-B.pdf | https://seamo.sgp1.digitaloceanspaces.com/images/resources/syllabus-B.pdf | free |
| seamo/SEAMO-syllabus-{K,C}.pdf | …/resources/syllabus-{K,C}.pdf | free |
| seamo/SEAMO-sample-paper-{K,A,B,C}.pdf | …/resources/paper-{K,A,B,C}.pdf | free |
| ikmc/IKMC-{2019..2023}-*.pdf | ikmc.kangaroo.org.pk/docs/{3308,3315,3319,3322,3326} → /uploads/ikmc/documents/*.pdf | free, official, full papers |
| sasmo/past-papers/SASMO-{2019-2020,2020}-G{2..6}.pdf | simcc.org/wp-content/uploads/2025/03/{2019,2020}-SASMO-G*.pdf | free, official, full papers + solutions |
| seamo/past-papers/SEAMO[-X]-*.pdf | public Dropbox mirror (rlkey ol3cbaijgy5g1q0z0qa2pk8n4) | free mirror, full papers |
| timo/TIMO-*.pdf | thaiimo.com sample + c1nguyendu.pgdcujut.edu.vn (FERMAT booklets) | free, full papers |
| osn/OSN-*.pdf | mathcyber1997.com / defantri.com / folderosn.com (Google Drive) | free mirror, full papers |
| hkimo/primary-{1,2,3}/*.pdf | hongkongimo.com/uploads/2/8/9/2/28923219/hkimo_*.pdf | free, official, full papers |
