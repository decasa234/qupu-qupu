# WMI Concept Taxonomy — Seed Vocabulary (Phase 0)

> The 9-domain grouping in this file reflects the original past-paper mining.
> The live concept taxonomy is the 6 olympiad strands — see
> `api/services/wmi/concepts/taxonomy.ts` and `taxonomy.md` › *Olympiad strand
> taxonomy (current)*.

**Date:** 2026-06-03
**Status:** Draft for review — anchors the Phase 1 fan-out
**Source sample:** 2019 Prelim G00 (A+B), 2022 Final G01 (A+B), 2024 Prelim G02 (A+B), 2025 Final G03 (A+B), plus 2024 Final G01 A.

This is the **controlled vocabulary** every Phase 1 agent classifies against. It exists so 56 independent agents converge on shared archetype labels instead of inventing 56 private vocabularies. Agents may **propose new archetypes** when nothing fits (rules below); Phase 2 canonicalizes.

---

## Citation id format

`{YEAR}-{PRE|FIN}-G{NN}-{A|B}-Q{n}` — e.g. `2024-FIN-G01-A-Q5`, `2019-PRE-G00-B-Q2`.

- `PRE` = Preliminary, `FIN` = Final.
- `G00`–`G03` = grade.
- `A` = Paper A (multiple-choice), `B` = Paper B (fill-in; may carry ①②③ choices in G00/G01).

## Per-question record schema (frozen)

```json
{
  "id": "2024-FIN-G01-A-Q5",
  "year": 2024, "round": "FIN", "grade": 1, "paper": "A", "qnum": 5,
  "body": "verbatim question text (OCR, lightly cleaned)",
  "choices": ["...", "..."] ,            // null for true fill-in
  "answer": "C",                          // letter (A) or exact value (B); null if unjoinable
  "answer_type": "multiple_choice",       // or "fill_in"
  "points": 6,                            // 6 / 8 / 10 — raw difficulty signal
  "image_dependent": true,                // can it be solved from text alone?
  "image_role": "shows the dice net to fold",  // short note when image_dependent
  "domain": "GEO",
  "archetype_slug": "dice-net-fold",
  "is_new_archetype": false,              // true if agent proposes a new slug
  "new_archetype_rationale": null,        // why nothing existing fit (when is_new_archetype)
  "notes": null                           // OCR ambiguity, multi-concept remarks, etc.
}
```

## Domains

| Code | Domain | EN / ID |
|---|---|---|
| ARI | Arithmetic & Operations | Aritmetika & Operasi |
| NUM | Number Sense & Place Value | Bilangan & Nilai Tempat |
| WORD | Word Problems | Soal Cerita |
| PAT | Patterns & Sequences | Pola & Barisan |
| LOG | Logic & Reasoning | Logika & Penalaran |
| CNT | Counting & Combinatorics | Pencacahan & Kombinatorika |
| GEO | Geometry & Spatial | Geometri & Spasial |
| MEA | Measurement & Time | Pengukuran & Waktu |
| DAT | Data, Tables & Classification | Data, Tabel & Klasifikasi |

Domain boundaries are guidelines; each question gets **one primary domain**. Conventions for ambiguous cases: mazes / path-finding / knight's-tour → **GEO** (spatial navigation); number-constraint grid puzzles (product/sum grids, operator-fill grids) → **LOG**; minimum-swaps / sorting → **CNT**; cryptarithms / alphametics → **LOG**.

---

## Seed archetype catalog

`✓` in **Exists** = already a built concept module. `IMG` in **Vis** = typically image-dependent (tag-and-defer).

### ARI — Arithmetic & Operations

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `arithmetic-expression-eval` | Evaluate an expression / Hitung ekspresi | | | `2025-FIN-G03-A-Q1`, `2024-PRE-G02-A-Q1` |
| `which-expression-equals` | Which expression equals a target / Ekspresi mana yang hasilnya … | | | `2024-FIN-G01-A-Q1` |
| `alternating-chain-eval` | Evaluate an add/subtract chain / Hitung rantai tambah-kurang | | | `2024-PRE-G02-B-Q1` |
| `operator-fill` | Fill in +/− to satisfy an equation / Isi tanda operasi | | | `2024-PRE-G02-A-Q12` |
| `custom-operation` | Apply a newly-defined operation / Operasi baru | | | `2022-FIN-G01-B-Q5` |
| `mistaken-digit-correction` | Correct a misread digit / Koreksi salah baca angka | | | `2025-FIN-G03-A-Q7` |
| `division-quotient-property` | Pick the quotient with a property / Sifat hasil bagi | | | `2025-FIN-G03-A-Q2` |
| `single-digit-addition` | Single-digit addition / Penjumlahan satu angka | | ✓ | seeded concept |
| `single-digit-subtraction` | Single-digit subtraction / Pengurangan satu angka | | ✓ | seeded concept |
| `multiplication-small` | Small multiplication / Perkalian kecil | | ✓ | seeded concept |
| `missing-addend` | Find the missing number in an equation / Cari bilangan yang hilang | | | `2019-PRE-G00-B-Q1`, `Q2` |
| `picture-addition` | Add pictured quantities / Penjumlahan dari gambar | IMG | | `2019-PRE-G00-A-Q1` |

### NUM — Number Sense & Place Value

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `digit-sum` | Sum of the digits of a number / Jumlah digit | | ✓ | seeded; `2024-PRE-G02-A-Q2` |
| `find-number-by-digit-sum` | Find a number with a given digit sum + constraints / Bilangan dengan jumlah digit tertentu | | | `2022-FIN-G01-A-Q6` |
| `build-number-from-digit-clues` | Build a number from positional digit clues / Susun bilangan dari petunjuk posisi | | | `2024-FIN-G01-A-Q2` |
| `compare-order-numbers` | Choose the correct ordering / Bandingkan & urutkan bilangan | | | `2024-PRE-G02-A-Q5` |
| `more-or-less-by-k` | A number larger/smaller than X by k / Lebih/kurang sekian dari X | | | `2024-PRE-G02-A-Q3` |
| `place-value` | Value of a digit by place / Nilai tempat | | ✓ | seeded concept |
| `reverse-arithmetic-puzzle` | Work backward through arithmetic clues / Teka-teki aritmetika terbalik | | | `2024-FIN-G01-A-Q7` |
| `arrange-digits-to-form-number` | Arrange numbers/digits into a target number / Susun digit menjadi bilangan | IMG | | `2022-FIN-G01-B-Q2`, `Q3` |
| `digit-frequency` | Which digit appears most when writing a range / Frekuensi digit | | | `2024-FIN-G01-A-Q8` |
| `divisibility-multiple-property` | Numbers satisfying a multiple/divisibility rule / Sifat kelipatan & pembagian | | | `2025-FIN-G03-B-Q5` |
| `perfect-square-search` | Find a perfect square with constraints / Cari bilangan kuadrat | | | `2025-FIN-G03-B-Q9` |
| `product-of-consecutive` | Number as product of consecutive integers / Hasil kali bilangan berurutan | | | `2025-FIN-G03-B-Q1` |
| `odd-even-reasoning` | Reason with odd/even constraints / Penalaran ganjil-genap | | | `2024-PRE-G02-A-Q13` |

### WORD — Word Problems

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `money-coins-total` | Total value of a coin/bill mix / Total nilai uang | IMG | | `2022-FIN-G01-A-Q1` |
| `money-shopping-change` | Cost / change / savings / Belanja, kembalian, hemat | | | `2024-PRE-G02-A-Q8`, `2025-FIN-G03-A-Q6` |
| `budget-selection` | Best choice within a budget / Pilihan terbaik sesuai anggaran | | | `2025-FIN-G03-A-Q9` |
| `lacking-money-shared` | Each lacks some; together buy one / Kekurangan uang bersama | | | `2024-FIN-G01-A-Q6` |
| `legs-items-rate` | Total from per-entity rates (legs/wheels) / Total dari laju per objek | | | `2022-FIN-G01-A-Q3` |
| `story-sum` | Multi-step add/subtract narrative / Soal cerita bertahap | | ✓ | seeded concept |
| `distance-rate-time` | Speed / time / distance / Jarak-kecepatan-waktu | | | `2025-FIN-G03-A-Q5`, `Q8` |
| `weight-balance-word` | Weight totals and shares / Berat & timbangan | | | `2025-FIN-G03-A-Q3` |

### PAT — Patterns & Sequences

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `pattern-next` | Next term in a numeric sequence / Suku berikutnya | | ✓ | seeded concept |
| `number-pyramid` | Each cell is the sum of the two below / Piramida bilangan | IMG | | `2024-FIN-G01-A-Q15`, `2024-PRE-G02-B-Q5` |
| `visual-pattern-next` | Next icon/shape in a visual sequence / Pola gambar berikutnya | IMG | | `2019-PRE-G00-A-Q9` |
| `shape-transformation-rule` | Apply a transformation shown by example / Aturan transformasi bentuk | IMG | | `2019-PRE-G00-A-Q5`, `Q6` |
| `block-transformation-sequence` | Continue a growing block pattern / Lanjutkan pola blok | IMG | | `2024-PRE-G02-B-Q7` |

### LOG — Logic & Reasoning

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `which-might-be` | Which option satisfies all constraints / Mana yang mungkin | | | `2022-FIN-G01-A-Q11` |
| `which-cannot-be` | Which value is impossible / Mana yang tidak mungkin | | | `2024-PRE-G02-A-Q13`, `2024-FIN-G01-A-Q12` |
| `order-from-statements` | Deduce an order from comparison statements / Urutan dari pernyataan | | | `2022-FIN-G01-A-Q14` |
| `venn-set-membership` | Count/sum numbers in set regions / Diagram Venn & himpunan | IMG | | `2024-FIN-G01-A-Q10`, `2022-FIN-G01-A-Q4` |
| `range-count-evaluate` | Count expressions whose value lies in a range / Hitung yang masuk rentang | | | `2022-FIN-G01-A-Q13` |
| `sum-partition-split` | Split a set by an equal/ratio sum condition / Pembagian jumlah | IMG | | `2025-FIN-G03-A-Q15`, `2024-PRE-G02-B-Q2` |
| `assignment-cycle` | Find the nth label in a repeating assignment / Pola penugasan berulang | | | `2024-PRE-G02-B-Q9` |
| `cryptarithm` | Letters stand for digits / Kriptaritma | IMG | | `2025-FIN-G03-B-Q8` |
| `grid-number-constraint` | Fill a grid to meet row/col product or sum / Teka-teki angka kisi | IMG | | `2025-FIN-G03-A-Q14` |
| `target-hit-equal-sum` | Dartboard/grid hits with an equal-sum rule / Lempar sasaran jumlah sama | | | `2024-PRE-G02-A-Q11` |
| `position-in-line` | People counted from front/back of a line / Posisi dalam barisan | | | `2022-FIN-G01-A-Q12`, `2024-PRE-G02-A-Q4` |

### CNT — Counting & Combinatorics

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `count-objects` | Count pictured objects / Hitung objek | IMG | ✓ | seeded concept |
| `count-shapes-in-figure` | Count triangles/parallelograms in a figure / Hitung bangun dalam gambar | IMG | | `2022-FIN-G01-B-Q4`, `2025-FIN-G03-B-Q4` |
| `how-many-ways-subsequence` | Ways to pick items preserving order / Banyak cara memilih berurutan | | | `2025-FIN-G03-B-Q7` |
| `combination-product-sum` | Sets of numbers with a product/sum target / Kombinasi hasil kali/jumlah | | | `2025-FIN-G03-B-Q3` |
| `minimum-swaps-sort` | Least adjacent swaps to sort / Tukar minimum untuk mengurutkan | IMG | | `2024-PRE-G02-B-Q6` |
| `remove-to-keep-one-kind` | Fewest removals to leave one kind / Sisakan satu jenis | IMG | | `2024-PRE-G02-B-Q3` |

### GEO — Geometry & Spatial

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `shape-perimeter-square` | Perimeter of a square / Keliling persegi | IMG | ✓ | seeded concept |
| `perimeter-area-composed` | Perimeter/area of combined or cut shapes / Keliling-luas bangun gabungan | IMG | | `2025-FIN-G03-A-Q4`, `2025-FIN-G03-B-Q10` |
| `dice-net-fold` | Fold a net into a cube/dice / Lipat jaring dadu | IMG | | `2024-FIN-G01-A-Q5` |
| `dice-opposite-faces` | Deduce opposite faces (sum 7) / Sisi berlawanan dadu | | | `2025-FIN-G03-A-Q12` |
| `block-count-3d` | Count cubes in a 3D stack / Hitung balok 3D | IMG | | `2022-FIN-G01-A-Q8`, `2022-FIN-G01-B-Q9` |
| `same-figure-identify` | Find the identical / rotated figure / Temukan bangun yang sama | IMG | | `2024-PRE-G02-B-Q4` |
| `fold-result-count` | Count shapes obtainable by folding / Hitung hasil lipatan | IMG | | `2025-FIN-G03-A-Q10` |
| `piece-assembly` | Which pieces form a target shape / Susun potongan jadi bangun | IMG | | `2025-FIN-G03-A-Q11`, `2022-FIN-G01-B-Q10` |
| `symmetry-count` | Count symmetric configurations / Hitung konfigurasi simetris | IMG | | `2025-FIN-G03-B-Q2` |
| `direction-orientation` | Relative facing / left-right direction / Arah & orientasi | | | `2024-PRE-G02-A-Q9` |
| `maze-path-shortest` | Shortest route / who arrives latest / Jalur terpendek | IMG | | `2024-FIN-G01-A-Q11` |
| `path-optimize-value` | Path through a grid optimizing a sum / Jalur dengan nilai optimal | IMG | | `2024-PRE-G02-B-Q10` |
| `move-rule-traversal` | Traverse a grid under a move rule (knight) / Lompatan aturan gerak | IMG | | `2022-FIN-G01-B-Q7` |
| `block-stability` | Which stack is most likely to fall / Tumpukan paling mungkin jatuh | IMG | | `2024-PRE-G02-A-Q7` |
| `spinning-states` | Which state cannot occur while spinning / Keadaan mustahil saat berputar | IMG | | `2025-FIN-G03-A-Q13` |
| `length-segment-compare` | Compare lengths of segments/paths / Bandingkan panjang ruas | IMG | | `2024-FIN-G01-A-Q3` |

### MEA — Measurement & Time

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `clock-time-after` | Time after a given interval / Waktu setelah selang | | | `2024-PRE-G02-A-Q10` |
| `clock-hand-rotation` | Clock appearance after rotation / Tampilan jam setelah berputar | IMG | | `2024-FIN-G01-A-Q13` |
| `length-sum-compare` | Total/compare lengths of objects / Jumlah & banding panjang | IMG | | `2024-PRE-G02-A-Q14` |
| `unit-conversion` | Convert between units (cm, g/kg, ¢/$) / Konversi satuan | | | embedded in `2025-FIN-G03-A-Q3` |

### DAT — Data, Tables & Classification

| slug | name_en / name_id | Vis | Exists | Example |
|---|---|---|---|---|
| `odd-one-out` | Which item is different / Mana yang berbeda | IMG | | `2022-FIN-G01-A-Q7`, `2024-FIN-G01-A-Q14` |
| `compare-counts-figure` | Which figure has more X than Y / Gambar dengan lebih banyak X | IMG | | `2022-FIN-G01-A-Q10` |
| `table-grid-position` | Read a value at a described grid position / Baca posisi pada tabel | IMG | | `2024-PRE-G02-A-Q6` |
| `ratio-pictograph` | Pick the picture matching ratio statements / Pilih gambar sesuai rasio | IMG | | `2022-FIN-G01-A-Q5` |
| `page-numbering` | Two-sided page-numbering deduction / Penomoran halaman bolak-balik | | | `2024-PRE-G02-A-Q15` |

---

## Classification rules for Phase 1 agents

1. **One primary archetype + one domain per question.** A WMI problem often touches several skills; pick the archetype matching its *dominant solution method*, and mention secondary skills in `notes`, not by double-filing.
2. **Reuse seed slugs whenever the solution method matches**, even if surface numbers/entities differ. Surface variation is expected — that's what parameterization captures.
3. **Propose a new archetype only when nothing fits.** Set `is_new_archetype: true`, give a kebab-case slug, an EN/ID name, and a one-line `new_archetype_rationale`. Don't fork an existing archetype just because the numbers changed.
4. **Join the answer from the Answer paper by question number.** Paper A → letter; Paper B → exact value. If the key is missing/garbled for a number, set `answer: null` and note it.
5. **Flag `image_dependent: true`** when the question can't be solved from text alone (diagram carries essential data). Add a short `image_role`. Use the `<details>` block descriptions in `full.md` as the image summary.
6. **Preserve the body verbatim** (light OCR cleanup only). Keep math as written. Don't "fix" answers.
7. **Account for every question.** If genuinely unclassifiable, file under domain `MISC`, slug `misc-unclassified`, with a reason in `notes` — never drop a question.

## Format quirks to expect

- Choice markers: `①②③` (G00, 3 options), `(A)–(D)` (4), `(A)–(E)` (5). Normalize `choices` to the list of option texts in order; record `answer` using the key's own marker.
- Paper A is multiple-choice; Paper B is fill-in, but **G00/G01 Paper B may still present ①②③ choices** — set `answer_type` from the actual question form, not the paper letter.
- OCR noise is common (garbled LaTeX, repeated fragments, mojibake, Chinese bilingual text). Classify on structure; lean on the answer key for exact numbers.
- Some papers open with a cover-image/boilerplate block — skip non-question content.
