# Competition Paper Extraction — Progress Ledger

**Goal (user):** populate all papers — first iteration. **Scope chosen: grade 1–4 only**
(QUPU is a grade 1–3 app); grade 5–12 + no-source shells intentionally skipped.

## FINAL STATUS — grade-1–4 first iteration COMPLETE ✅
**115 / 162 shells populated · 2,668 questions · in DB (seeded).** Every in-scope
grade-1–4 paper is done. The 47 empty shells are out-of-scope by design (IOB k5–k12+TK,
SIMOC G5–G10, SASMO G5–G6, TIMO P5, and the brands' higher divisions).

| Brand | In-scope done | Notes |
|---|---|---|
| ikmc | 10/10 | answer keys (PDF) — authoritative |
| seamo | 14/14 | keys embedded last page — authoritative |
| seamo-x | 8/8 | keys embedded — authoritative; all open-answer (fill_in) |
| simoc | 6/6 (G1×3 + 2019 G2–G4) | answer keys — authoritative |
| sasmo | 6/6 (2019 G2–G4 + 2020 G2–G4) | full worked solutions in PDFs — authoritative |
| timo | 4/4 (P1–P4) | booklet answer keys — authoritative (see TIMO year note) |
| iob | 16/16 (Kelas 1–4 × prelim1/2/3+final) | bilingual EN+ID; keys in PDFs (15/16) |
| hkimo | 20/20 (Primary 1–3) | **NO keys → answers AI-SOLVED** (verify) |
| osn | 31/31 (SD) | mixed: 2021-Nas + 2025 Prov/Kab/Semi keyed; **rest AI-SOLVED** (verify) |

## What "first iteration" delivered (per question)
- `body_en` + `body_id` (bilingual), `choices_en/id`, `answer`, `answer_type`.
- **Deferred to later iterations:** `breakdown`, `hint_steps`, and all visuals
  (`figure_url` is `null`; figures redrawn as SVG in a visual pass). This pass was
  IMPORT only.

## ⚠️ Answer quality — needs a verification pass
- **Authoritative** (from official key/solutions): IKMC, SEAMO, SEAMO-X, SIMOC, SASMO,
  TIMO, IOB (15/16), OSN {2021 Nasional 1–4, 2025 Provinsi/Kabupaten/SemiFinal}.
- **AI-SOLVED — verify before trusting answers:** **HKIMO (all 20)**, **OSN most rounds**
  (Kabupaten/Kecamatan/Provinsi/Nasional without pembahasan), IOB-PRE2-K1, and the
  `fill_in` sections of IOB K3/K4. Questions are transcribed accurately; only the
  *answers* are model-derived and flagged. Many individual low-confidence Qs are noted
  in the per-batch commit messages.

## ⚠️ Truncated source PDFs (re-source to complete)
- HKIMO-18-P1 (20/25), HKIMO-21-P1 (**7/20**, broken scan), HKIMO-24-P1 (17/25),
  HKIMO-24-P2 (18/25), HKIMO-25-P1 (22/25); SEAMO-19-B (20/25, Section C missing).
  All renumbered contiguous; partial papers, flagged.

## ⚠️ Metadata note
- **TIMO** shells are labelled year **2022** but the bundles contained no 2022 Heat
  paper — the most recent (2020–2021 Heat) was extracted into them. Consider relabelling
  the TIMO shells/year to 2021.

## Tooling
- **Pipeline used:** direct vision extraction — a subagent reads each PDF (the Read tool
  renders pages) and writes the seed JSON. No OCR step; disk-free; better than OCR for
  math+figures. Reusable brief: `IMPORT-BRIEF.md`.
- **OCR tool (PaddleOCR PP-StructureV3):** `tools/ocr/pdf_to_md.py` — PDF → `full.md` +
  `imgs/`. Was disk-blocked earlier (models ~2–3 GB); now usable (disk freed). Not on the
  critical path since extraction was done via vision; available for future re-OCR.
- DB: LAN Postgres @192.168.20.101 (intermittently off-LAN this session; seed files are
  the source of truth, DB re-seeded via `npm run seed:wmi`).

## Next iterations (not done yet)
1. **Verification pass** on the AI-solved answers (HKIMO, OSN) — source official keys or
   re-solve with a stronger model + adversarial check.
2. **Enrichment**: author `breakdown` + `hint_steps` per question (reuse WMI template pool).
3. **Visual pass**: redraw figures as SVG illustrations + animated explainers (the
   `qupu-math-problem-creation` / `wmi-paper-conversion` skills).
4. Re-source the truncated PDFs above.
