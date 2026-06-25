# OCR results (MinerU markdown)

MinerU PDF→markdown OCR of the competition past papers in
`../competition-papers/`. Reorganised from the raw `MinerU_Batch_Export_*` dumps into:

```
ocr-res/<competition>/<category>/<grade>/<paper>.md
```

- **competition** — `hkimo` · `ikmc` · `osn` · `sasmo` · `seamo` · `seamo-x` · `simoc` · `timo`
- **category** (the round/stage):
  - HKIMO → `heat` · `semifinal`
  - OSN → `kabupaten` · `kecamatan` · `provinsi` · `nasional`
  - single-round competitions (IKMC, SASMO, SEAMO, SEAMO-X, SIMOC) → `contest`
  - TIMO → `bundle` (each file is a 2020–2022 multi-round booklet)
- **grade**:
  - HKIMO/TIMO → `primary-1` … `primary-5`
  - IKMC → `preecolier` (Class 1–2) · `ecolier` (Class 3–4) · `answer-key`
  - OSN → `sd`
  - SASMO → `g2` … `g6`; SIMOC → `g1` … `g10-jc` · `answer-key`
  - SEAMO / SEAMO-X → `paper-a` (Grades 1–2) · `paper-b` (Grades 3–4)
- **file** — `<year>.md`, with a suffix for variants/keys: e.g. `2016-solutions.md`,
  `2021-1.md` … `2021-4.md`, `2024-teori1.md`, `2025-final.md`, `2019-2020.md` (SASMO
  bundle covering both years), `answer-key.md`.

## Figures
Each paper's figure crops live in a co-located `<paper>.imgs/` folder (e.g.
`ikmc/contest/preecolier/2019.imgs/001.jpg`), and the markdown links point at those
relative paths. They were downloaded from MinerU's temporary CDN
(`cdn-mineru.openxlab.org.cn`) so the folder is now self-contained — 2,679 images, ~44 MB.

## ⚠️ Caveats
- **A few files are not exam questions:** `osn/nasional/sd/2021-1.md` is a Google-Drive
  links index (the real 2021 Nasional questions/solutions are in `2021-2/-3/-4.md`);
  `hkimo/heat/primary-1/2021.md` is a broken/truncated scan (~7 questions).

The extracted, structured questions (used by the app) live in `db/seed/<brand>/papers/`;
this folder is the OCR source/reference only.
