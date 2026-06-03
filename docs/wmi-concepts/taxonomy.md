# WMI Concept Taxonomy

The complete catalog of math-concept **archetypes** mined from every World Mathematics Invitational past paper in `wmiPastPaper/` — **2019–2025**, both Preliminary and Final rounds, Grades 00–03, Papers A (multiple-choice) and B (fill-in). Each archetype is a recurring, parameterizable question *shape*: one solution method with one parameter family, designed to become a `generate(rng)` + `render(params)` concept-generator module like the existing `story-sum`.

## At a glance

| | |
|---|--:|
| Questions catalogued | 1400 |
| Source units (year × round × grade) | 56 |
| Concept archetypes | 107 |
| — already built as modules | 9 |
| — in seed vocabulary, not yet built | 71 |
| — discovered during extraction (beyond seed) | 27 |
| — total build backlog | 98 |
| Multiple-choice / fill-in | 1110 / 290 |
| Image-dependent (tag-and-defer) | 837 (60%) |

| Domain | Questions | Archetypes |
|---|--:|--:|
| ARI — Arithmetic & Operations | 201 | 13 |
| NUM — Number Sense & Place Value | 159 | 15 |
| WORD — Word Problems | 118 | 10 |
| PAT — Patterns & Sequences | 163 | 5 |
| LOG — Logic & Reasoning | 237 | 19 |
| CNT — Counting & Combinatorics | 96 | 9 |
| GEO — Geometry & Spatial | 284 | 21 |
| MEA — Measurement & Time | 52 | 6 |
| DAT — Data, Tables & Classification | 90 | 9 |

## How to read an entry

Each archetype lists its **bilingual name**, grade span, answer type, source-question count, whether it needs an **illustration** (image-dependent — deferred for later), a **status** (`built` = already a module · `seed` = in the Phase-0 vocabulary · `new` = discovered during extraction), a one-line **solution method**, a **parameterization** block (what varies, with ranges/constraints — the spec for a future `paramsSchema`/`generate`), and a fully **bilingual example**.

## Companion files

- [`coverage-matrix.md`](./coverage-matrix.md) — archetype × grade frequency (build-priority signal).
- [`question-index.md`](./question-index.md) — every one of the 1400 questions → its archetype.
- [`questions.json`](./questions.json) — the raw per-question records.
- [`seed-taxonomy.md`](./seed-taxonomy.md) — the Phase-0 controlled vocabulary + extraction methodology.

---

## ARI — Arithmetic & Operations

### `arithmetic-expression-eval` — Evaluate an arithmetic expression / Hitung nilai ekspresi aritmetika
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 50 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Compute a single given expression (one or two operations, no precedence traps beyond left-to-right) and report or match its value; some variants ask the difference of two products.
- **Parameterization:** `op` ∈ {`+`,`−`,`×`} and `mode` ∈ {`single`,`repeated-add`,`product-diff`}; operands scale by grade: G0–G1 within 20 (e.g. `15−9`), G2 two-digit ± / small `×` (e.g. `15×6 − 15×4`), G3 sums like `68+58+48+38+28` or distributive `26×4+54×4+10×4`. FIXED: exact-arithmetic result, no remainders. `generate(rng)`: pick mode, draw operands in the grade band, derive `answer`; for multiple_choice build 3–4 distractors by ±1 carry/off-by-one errors.
- **Example (EN):** Compute 68 + 58 + 48 + 38 + 28. → **240**
- **Contoh (ID):** Hitunglah 68 + 58 + 48 + 38 + 28. → **240**
- **Sources:** 50 — e.g. 2019-FIN-G01-B-Q1, 2019-FIN-G02-A-Q6, 2019-FIN-G03-A-Q10, 2019-PRE-G01-A-Q1

### `missing-addend` — Find the missing number in an equation / Cari bilangan yang hilang dalam persamaan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 36 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Solve `( ) op known = result` (or a short story version) by inverse operation — subtract the known addend, or add back the subtrahend.
- **Parameterization:** `frame` ∈ {`bare`,`story`}, `op` ∈ {`+`,`−`} and `position` of the blank (left addend / sum side). Ranges by grade: G0–G1 within 20 (`( )+5=13`), G2 two-step story (`92−34+( )=87`), G3 three-digit (`( )+374=842`). Story entities bilingual: birds/burung, people-in-museum/orang di museum. FIXED: unique whole-number solution ≥ 0. `generate(rng)`: pick answer first, then build the equation so the blank is recoverable; MC distractors = forgetting to invert, or ±10.
- **Example (EN):** There are ( ) birds in the tree. 5 more birds fly in, and now there are 13 birds. ( ) = ? → **8**
- **Contoh (ID):** Ada ( ) ekor burung di pohon. 5 ekor burung lagi datang, sekarang ada 13 ekor burung. ( ) = ? → **8**
- **Sources:** 36 — e.g. 2019-FIN-G01-A-Q5, 2019-FIN-G02-A-Q3, 2022-PRE-G03-A-Q1, 2019-FIN-G00-A-Q11

### `which-expression-equals` — Pick the expression that equals a target / Pilih ekspresi yang sama dengan nilai target
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 27 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Evaluate each candidate expression and select the one matching the criterion: equals a target value, is the largest/smallest, or is the second largest.
- **Parameterization:** `criterion` ∈ {`equals-target`,`largest`,`smallest`,`second-largest`,`is-true`}; candidates by grade: G0–G1 single-step ±/equation-truth (`10−1`), G2 two-step (`52+14−38`), G3 mixed `×`/`÷` chains (`78÷6×3`). FIXED: exactly one correct option; 3–4 candidates total. `generate(rng)`: pick target/criterion, build one matching expression + 2–3 near-miss expressions whose values differ by small margins.
- **Example (EN):** Which expression equals 9? (a) 14+5  (b) 16−9  (c) 3+7  (d) 10−1 → **(d) 10−1**
- **Contoh (ID):** Ekspresi manakah yang bernilai 9? (a) 14+5  (b) 16−9  (c) 3+7  (d) 10−1 → **(d) 10−1**
- **Sources:** 27 — e.g. 2019-FIN-G01-A-Q7, 2019-FIN-G02-A-Q7, 2019-FIN-G03-A-Q6, 2021-FIN-G01-A-Q1

### `alternating-chain-eval` — Evaluate a +/− chain left to right / Hitung rantai tambah-kurang dari kiri ke kanan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 21 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Apply a sequence of additions and subtractions strictly left to right, accumulating a running total to the final value.
- **Parameterization:** `length` (number of operations, 3–8) and the sign pattern (alternating or mixed). Operand magnitude by grade: G0 within 20 (`9−3+4+2−5`), G1 two-digit (`41+19−31−9`), G2 (`85−49+13`), G3 three-digit (`971−354+28−10`). FIXED: every intermediate partial ≥ 0; no `×`/`÷`. `generate(rng)`: draw start value and each signed step keeping the running total non-negative; MC distractors = one sign flipped or one term dropped.
- **Example (EN):** Compute 971 − 354 + 28 − 10. → **635**
- **Contoh (ID):** Hitunglah 971 − 354 + 28 − 10. → **635**
- **Sources:** 21 — e.g. 2019-FIN-G00-B-Q1, 2020-FIN-G01-B-Q3, 2020-PRE-G02-A-Q1, 2019-FIN-G03-A-Q1

### `picture-addition` — Add quantities shown in a picture / Jumlahkan kuantitas yang ditunjukkan dalam gambar
- **Grades:** G0–G2 · **Answer:** multiple_choice · **Source questions:** 20 · **Illustration:** needed · **Status:** seed
- **Solution method:** Count two (or more) pictured groups of objects, add the counts, and pick the matching total (or the matching equation).
- **Parameterization:** two group counts `a`, `b` with `a+b` ≤ 25 (G0 ≤ 16, G2 up to ~22); `object` set bilingual: strawberries/stroberi, apples/apel, stars/bintang, fruit/buah. `output` ∈ {`pick-total`,`pick-correct-equation`}. FIXED: objects drawn as discrete countable icons; answer = `a+b`. `generate(rng)`: draw `a`,`b`, render the icon rows, MC distractors = `a+b±1` and `a×b` for the equation variant. `render(params)` emits an SVG/icon spec for the illustration.
- **Example (EN):** [9 stars] + [5 stars] = ( )  (a) 16  (b) 15  (c) 14 → **15** (per answer key)
- **Contoh (ID):** [9 bintang] + [5 bintang] = ( )  (a) 16  (b) 15  (c) 14 → **15** (sesuai kunci jawaban)
- **Sources:** 20 — e.g. 2019-FIN-G00-A-Q1, 2019-PRE-G00-A-Q1, 2019-PRE-G02-A-Q5, 2019-PRE-G01-A-Q8

### `operator-fill` — Fill in the missing operators / Isi operator yang hilang
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 17 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Choose the operator(s) (and sometimes the trailing term) for each box so the whole equation becomes true; test each operator combination against the target.
- **Parameterization:** `slots` = number of operator boxes (1–2), operator set {`+`,`−`} (G0–G1) or {`+`,`−`,`×`} (G2–G3). Operands sized to grade (`7 □ 1 □ 3 = 9`, `12 □ 6 □ 7 = 13`). FIXED: exactly one operator combination satisfies the equation; result is a whole number. `generate(rng)`: pick the true operator pattern, compute the result, then present all sign combinations as choices (e.g. `+,+ / −,− / +,− / −,+`).
- **Example (EN):** What symbols go in the boxes? 12 □ 6 □ 7 = 13  (a) +,+  (b) −,−  (c) +,−  (d) −,+ → **(d) −,+**
- **Contoh (ID):** Tanda apa yang harus diisi pada kotak? 12 □ 6 □ 7 = 13  (a) +,+  (b) −,−  (c) +,−  (d) −,+ → **(d) −,+**
- **Sources:** 17 — e.g. 2019-FIN-G01-A-Q14, 2023-FIN-G00-A-Q8, 2020-FIN-G01-A-Q11, 2022-PRE-G00-B-Q7

### `custom-operation` — Apply a newly-defined operation / Terapkan operasi yang baru didefinisikan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 16 · **Illustration:** needed · **Status:** seed
- **Solution method:** Infer the rule of a made-up symbol/operation from one or two worked examples, then apply that same rule to a new input.
- **Parameterization:** `ruleType` ∈ {`linear` (a☼b = sum a..(b−1) − b), `picture-value` (icon stands for a number), `box-operation` (f(x,y) from examples)}. Examples shown = 1–2; new input drawn within grade range. Symbol/icon set bilingual: soccer balls/bola sepak, squares/persegi. FIXED: rule is deterministic and recoverable from the given examples. `generate(rng)`: pick rule coefficients, render 1–2 worked examples, choose a fresh input, compute `answer`; MC distractors = applying the rule with one term omitted.
- **Example (EN):** A new operation: 1☼3 = 1+2−3 = 0 and 2☼5 = 2+3+4−5 = 4. Find 4☼9. → **21**
- **Contoh (ID):** Operasi baru: 1☼3 = 1+2−3 = 0 dan 2☼5 = 2+3+4−5 = 4. Hitunglah 4☼9. → **21**
- **Sources:** 16 — e.g. 2022-FIN-G01-B-Q5, 2019-PRE-G02-A-Q14, 2019-FIN-G00-A-Q5, 2022-PRE-G01-A-Q2

### `mistaken-digit-correction` — Recover the correct answer after a mistake / Temukan jawaban benar setelah ada kesalahan
- **Grades:** G2–G3 · **Answer:** both · **Source questions:** 7 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Given a wrong result caused by a stated error (misread operator, misread digit, transposed digits), reconstruct the intended computation and produce the correct value; one variant grades a finished answer sheet.
- **Parameterization:** `errorType` ∈ {`misread-operator` (× read as +), `misread-digit` (digit d→7), `digit-transposition`, `grade-sheet`}. Operands two-/three-digit, G2–G3. FIXED: the error and the wrong result fully determine the original problem; answer is a whole number. `generate(rng)`: build the true problem, apply the chosen corruption to get the stated wrong result, then ask for the true answer; MC distractors = the wrong result itself and near values.
- **Example (EN):** A problem is 43 × □. Jason mistakes "×" for "+" and gets 51. Find the correct answer. → **344**
- **Contoh (ID):** Soalnya adalah 43 × □. Jason salah membaca "×" sebagai "+" dan memperoleh 51. Tentukan jawaban yang benar. → **344**
- **Sources:** 7 — e.g. 2019-FIN-G03-A-Q13, 2019-PRE-G03-B-Q6, 2020-FIN-G03-B-Q3, 2024-PRE-G03-B-Q1

### `single-digit-addition` — Add two single-digit numbers / Jumlahkan dua bilangan satu angka
- **Grades:** G0 · **Answer:** multiple_choice · **Source questions:** 2 · **Illustration:** needed · **Status:** built
- **Solution method:** Add two single-digit addends; one variant asks the learner to match the result(s) to a picture showing that many objects.
- **Parameterization:** addends `a`, `b` ∈ 1–9, sum ≤ 18; `output` ∈ {`numeric`,`match-picture`}. Objects for the picture variant bilingual: dots/titik, fruit/buah. FIXED: both operands single-digit. `generate(rng)`: draw `a`,`b`, MC distractors = sum ±1.
- **Example (EN):** 3 + 8 = ( )  (a) 12  (b) 10  (c) 11 → **11**
- **Contoh (ID):** 3 + 8 = ( )  (a) 12  (b) 10  (c) 11 → **11**
- **Sources:** 2 — e.g. 2019-PRE-G00-A-Q2, 2023-PRE-G00-A-Q9

### `single-digit-subtraction` — Subtract within twenty / Pengurangan dalam dua puluh
- **Grades:** G0 · **Answer:** both · **Source questions:** 2 · **Illustration:** needed · **Status:** built
- **Solution method:** Subtract a single-digit number, possibly with borrowing across ten; one variant matches the result to a picture.
- **Parameterization:** minuend ≤ 20, subtrahend ∈ 1–9, difference ≥ 0; `output` ∈ {`numeric`,`match-picture`}. Objects bilingual: counters/manik, dots/titik. FIXED: non-negative single-digit-ish result. `generate(rng)`: draw difference and subtrahend, derive minuend; MC distractors = difference ±1.
- **Example (EN):** 13 − 7 = ___ → **6**
- **Contoh (ID):** 13 − 7 = ___ → **6**
- **Sources:** 2 — e.g. 2023-FIN-G00-B-Q1, 2022-FIN-G00-A-Q12

### `factor-tree-product` — Multiply leaves of a factor tree / Kalikan daun pada pohon faktor
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Read a tree/branch diagram where each node combines its children by multiplication, and compute the value at the marked node (★).
- **Parameterization:** tree `depth` (2–3) and leaf values (small whole numbers 2–9) so the marked node product stays ≤ ~250. FIXED: every internal node = product of its children; one node is asked. `generate(rng)`: build leaves, multiply up the tree, pick the target node value as `answer`; MC distractors = wrong node, or product missing one leaf. `render(params)` emits the tree diagram spec.
- **Example (EN):** In the tree, each node is the product of its children. Leaves under ★ are 4, 6, and 8 (★ = 4 × 6 × 8). ★ = ? → **192**
- **Contoh (ID):** Pada pohon, setiap simpul adalah hasil kali anak-anaknya. Daun di bawah ★ adalah 4, 6, dan 8 (★ = 4 × 6 × 8). ★ = ? → **192**
- **Sources:** 1 — 2019-FIN-G03-A-Q12

### `multiplication-small` — Single multiplication fact / Fakta perkalian sederhana
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** built
- **Solution method:** Recall or compute one times-table fact `a × b`.
- **Parameterization:** factors `a`, `b` ∈ 2–9 (single times-table range). FIXED: both factors single-digit. `generate(rng)`: draw `a`,`b`, MC distractors = adjacent multiples (`a×(b±1)`) and `a+b`.
- **Example (EN):** Compute 3 × 9 = ( )  (a) 28  (b) 27  (c) 18  (d) 21 → **27**
- **Contoh (ID):** Hitunglah 3 × 9 = ( )  (a) 28  (b) 27  (c) 18  (d) 21 → **27**
- **Sources:** 1 — 2019-PRE-G02-A-Q8

### `division-quotient-property` — Compare a property of several quotients / Bandingkan sifat dari beberapa hasil bagi
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Evaluate several division expressions, then select the one whose quotient satisfies a digit property (e.g. contains no digit 0).
- **Parameterization:** `property` ∈ {`no-zero-digit`,`largest`,`even`}; 4–5 candidate divisions with exact quotients, dividends two-/three-digit and divisors 2–9. FIXED: divisions are exact (no remainder); exactly one candidate matches. `generate(rng)`: build candidates, compute quotients, ensure a single match for the property; MC = the candidate expressions themselves.
- **Example (EN):** Compute each. Which quotient has no digit 0?  40÷4, 140÷7, 690÷3, 630÷5, 945÷9 → **630÷5 (=126)**
- **Contoh (ID):** Hitung tiap soal. Hasil bagi manakah yang tidak memuat angka 0?  40÷4, 140÷7, 690÷3, 630÷5, 945÷9 → **630÷5 (=126)**
- **Sources:** 1 — 2025-FIN-G03-A-Q2

## NUM — Number Sense & Place Value

### `reverse-arithmetic-puzzle` — Reverse Arithmetic Puzzle / Teka-teki Aritmetika Terbalik
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 27 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Work backward (undo each operation: a `+k` step is reversed by `-k`, a `-k` by `+k`) along a chain or single equation to recover the unknown starting value, then optionally compute a final answer.
- **Parameterization:** Params: `steps` (2–4 chained ops), each step `{op: +|-, k: 1–9}`, and a `final` result (G0–G1: 1–20; G2–G3: up to 100). For the box-equation variant, `boxValue` plus a fixed operand (e.g. `box - 45 = 38`). Entities for word-problem framing: candies/permen, marbles/kelereng, coins/koin. FIXED: the back-substitution rule and that exactly one unknown appears. Generate by picking the answer first, then applying the forward chain to derive the displayed final value.
- **Example (EN):** Start with a number. Add 7, then subtract 2, then add 1, then add 3 to get 15. What is the starting number? → **6**
- **Contoh (ID):** Mulai dari sebuah bilangan. Tambah 7, lalu kurangi 2, lalu tambah 1, lalu tambah 3 sehingga hasilnya 15. Berapa bilangan awalnya? → **6**
- **Sources:** 27 — 2022-FIN-G00-B-Q3, 2021-FIN-G02-A-Q12, 2020-PRE-G01-A-Q15, 2021-FIN-G02-A-Q7

### `compare-order-numbers` — Compare & Order Numbers / Membandingkan & Mengurutkan Bilangan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 26 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Compare numbers by magnitude — pick the largest/smallest, choose the correct `<`/`>`/`=` sign, or sort a small set ascending/descending and read off the requested position.
- **Parameterization:** Params: `mode` (`pick-largest` | `pick-smallest` | `choose-sign` | `order-set`), `count` (2–4 values), value range by grade (G0–G1: 1–99; G2: up to 999; G3 fractions optional). For `order-set`, `labels` A–D map to values and the answer is a letter-sequence. FIXED: standard numeric ordering. Generate distinct values, shuffle into choices; for `choose-sign` emit two operands and answer one of `<`/`>`/`=`.
- **Example (EN):** Arrange from smallest to largest: A=205, B=422, C=230, D=501. → **ACBD**
- **Contoh (ID):** Urutkan dari yang terkecil ke terbesar: A=205, B=422, C=230, D=501. → **ACBD**
- **Sources:** 26 — 2019-FIN-G01-A-Q2, 2020-FIN-G02-A-Q4, 2019-FIN-G00-A-Q4, 2020-PRE-G01-A-Q4

### `arrange-digits-to-form-number` — Arrange Digits to Form a Number / Menyusun Angka Menjadi Bilangan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 25 · **Illustration:** not needed · **Status:** seed
- **Solution method:** From a small set of distinct digits, enumerate the multi-digit numbers formed (no repeated digit), sort ascending, then return the smallest/largest, the k-th number, or the gap between two positions.
- **Parameterization:** Params: `digits` (set of 3–4 distinct digits, e.g. {1,2,3,4}), `length` (2 or 3), `query` (`smallest` | `largest` | `kth` with `k`, or `diff` of two positions). FIXED: distinct-digit constraint and ascending sort. Generate the full ordered list deterministically (12,13,14,21,23,24,…) and index it; exclude leading-zero forms when 0 is in the set.
- **Example (EN):** Use the digits 1, 2, 3, 4 to form 2-digit numbers whose two digits differ. List them in ascending order. What is the 5th number? → **23**
- **Contoh (ID):** Gunakan angka 1, 2, 3, 4 untuk membentuk bilangan dua angka yang kedua angkanya berbeda. Urutkan dari kecil ke besar. Bilangan ke-5 adalah? → **23**
- **Sources:** 25 — 2019-FIN-G01-B-Q5, 2019-FIN-G03-B-Q3, 2019-FIN-G02-A-Q2, 2019-PRE-G00-B-Q5

### `build-number-from-digit-clues` — Build a Number from Digit Clues / Membentuk Bilangan dari Petunjuk Angka
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 19 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Translate per-digit clues (range, a tens/units relation, parity, or a digit equation like B=3A) into constraints and either name the unique number that fits or count how many numbers fit.
- **Parameterization:** Params: `numLength` (2–4), `query` (`find-number` | `count`), and a `clues` list — `range:[lo,hi]`, `tensRule` (e.g. tens = m×units), `digitRelation` (e.g. units = k×tens), `parity`. Value ranges scale by grade (G1: 2-digit; G3: up to 7-digit). FIXED: digits are 0–9 and positions are place-valued. Generate by sampling a target number, then derive clues that hold for it; for `count`, sweep all candidates against the constraints.
- **Example (EN):** A 2-digit number lies between 50 and 90, and its tens digit is 3 times its units digit. What is the number? → **63**
- **Contoh (ID):** Sebuah bilangan dua angka berada di antara 50 dan 90, dan angka puluhannya 3 kali angka satuannya. Berapa bilangan itu? → **63**
- **Sources:** 19 — 2019-FIN-G01-A-Q12, 2021-FIN-G01-A-Q12, 2021-FIN-G03-A-Q2, 2019-FIN-G02-B-Q8

### `find-number-by-digit-sum` — Find a Number by Digit Sum / Mencari Bilangan dari Jumlah Angka
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 14 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Use a digit-sum target (often combined with a range and parity) to either pick the matching option, or find the largest/smallest such number, or count how many qualify.
- **Parameterization:** Params: `numLength` (2–4), `digitSum` (G1: 5–13; G3: up to 27), optional `range:[lo,hi]`, optional `parity`, `query` (`pick` | `largest-minus-smallest` | `count`). FIXED: digit sum = sum of decimal digits. Generate by choosing a digit-sum target, building the extremal numbers (largest packs big digits left), and constructing distractor options whose digit sums differ.
- **Example (EN):** A lucky number is an odd number between 15 and 71 whose digits add up to 10. Which could it be: 73, 29, 55, 64? → **55**
- **Contoh (ID):** Sebuah bilangan keberuntungan adalah bilangan ganjil antara 15 dan 71 yang jumlah angkanya 10. Mana yang mungkin: 73, 29, 55, 64? → **55**
- **Sources:** 14 — 2022-FIN-G01-A-Q6, 2024-PRE-G01-A-Q2, 2021-PRE-G03-A-Q13, 2022-PRE-G03-A-Q14

### `divisibility-multiple-property` — Divisibility & Multiples / Keterbagian & Kelipatan
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 10 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Test numbers against a divisibility/multiple rule — count how many are divisible by k, find which option is NOT a multiple, or find the smallest/largest number divisible by a given divisor (or set of divisors).
- **Parameterization:** Params: `divisor` (2–9, or a small set), `mode` (`count-divisible` | `which-not` | `make-divisible` (find x so n+x is a multiple) | `find-extreme`), candidate `numbers` list or `range`. Entities for word framing: candies/permen split among students/siswa, apples/apel among people/orang. FIXED: divisibility = zero remainder. Generate candidates with a controlled number of true multiples; for `make-divisible`, sample n and a multiple m, set x = m − n.
- **Example (EN):** The teacher has 42 candies. After getting some more, the candies can be shared equally among 9 students. How many more candies could be added: 17, 58, 4, 30? → **30**
- **Contoh (ID):** Guru memiliki 42 permen. Setelah ditambah beberapa permen, semuanya bisa dibagi rata kepada 9 siswa. Berapa permen yang ditambahkan: 17, 58, 4, 30? → **30**
- **Sources:** 10 — 2023-FIN-G02-A-Q3, 2020-PRE-G03-A-Q3, 2021-FIN-G02-A-Q5, 2023-FIN-G03-B-Q5

### `odd-even-reasoning` — Odd & Even Reasoning / Penalaran Ganjil & Genap
- **Grades:** G0–G2 · **Answer:** both · **Source questions:** 8 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Classify numbers as odd/even and aggregate — count the evens (or odds) in a list, or compute the difference between the sum of odds and the sum of evens.
- **Parameterization:** Params: `count` (5–10 numbers), value `range` (G0–G1: 1–50; G2: up to 99), `query` (`count-even` | `count-odd` | `sum-diff` | `count-odd-in-context`). The contextual variant pulls numbers from a short story (ages/umur, dates/tanggal, counts of students/siswa). FIXED: even = divisible by 2. Generate a list with a chosen odd/even split; for `sum-diff`, take the absolute difference of the two group sums.
- **Example (EN):** Given five numbers 34, 23, 11, 42, 17, find the difference between the sum of the odd numbers and the sum of the even numbers. → **25**
- **Contoh (ID):** Diberikan lima bilangan 34, 23, 11, 42, 17, cari selisih antara jumlah bilangan ganjil dan jumlah bilangan genap. → **25**
- **Sources:** 8 — 2020-PRE-G02-B-Q5, 2020-FIN-G01-A-Q5, 2025-FIN-G01-A-Q3, 2023-PRE-G00-B-Q3

### `digit-frequency` — Digit Frequency in a Range / Frekuensi Angka dalam Rentang
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 7 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Write out a range or stepped sequence of numbers, tally how many times a target digit (or each digit) appears, then report the count or rank (most/least/third-most/last to appear).
- **Parameterization:** Params: `range:[lo,hi]` (G1: within 1–100) or `start`+`step` for a counting sequence, `targetDigit` (0–9) for the count mode, or `query` (`count-of-digit` | `rank-digit` with rank, e.g. third-most | `last-appearing`). FIXED: digits counted across the standard decimal spellings. Generate by materializing the number list, building a 0–9 frequency table, then querying it.
- **Example (EN):** Write the numbers 100, 99, 98, …, 50 in reverse order. How many times is the digit 6 written? → **15**
- **Contoh (ID):** Tuliskan bilangan 100, 99, 98, …, 50 secara mundur. Berapa kali angka 6 dituliskan? → **15**
- **Sources:** 7 — 2019-FIN-G01-A-Q13, 2021-PRE-G01-B-Q5, 2024-FIN-G01-A-Q8, 2022-PRE-G01-A-Q10

### `more-or-less-by-k` — More or Less by k / Lebih atau Kurang Sebanyak k
- **Grades:** G1–G2 · **Answer:** multiple_choice · **Source questions:** 7 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Find the number that is k more (or k less) than a given base value via a single add or subtract — sometimes after first building the base from digit clues or a real-world frame (floors/lantai).
- **Parameterization:** Params: `base` (G1: 1–99; G2: up to 50 + offset), `k` (1–24), `direction` (`more` | `less`). Optional framing: `context` (elevator floors/lantai lift, or build base from tens/units clues). FIXED: answer = base ± k. Generate base and k, compute the answer, and make distractors by digit-swaps or near-misses (base, base±1, k itself).
- **Example (EN):** Which number is larger than 15 by 24? → **39**
- **Contoh (ID):** Bilangan mana yang lebih besar 24 dari 15? → **39**
- **Sources:** 7 — 2024-PRE-G02-A-Q3, 2024-PRE-G01-A-Q3, 2019-FIN-G01-A-Q9, 2024-FIN-G01-A-Q2

### `perfect-square-search` — Perfect Square Search / Mencari Bilangan Kuadrat Sempurna
- **Grades:** G2–G3 · **Answer:** both · **Source questions:** 5 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Recognize that "rows = columns" / "groups = items per group" / "candies each = number of students" means the total is a perfect square, then find the unique perfect square inside a stated range (or count perfect squares up to N).
- **Parameterization:** Params: `range:[lo,hi]` chosen so exactly one perfect square lies inside (G2: between 40–80; G3 may ask for a count up to N or extra digit conditions), `query` (`find-total` | `find-side` | `count-up-to`). Entities: candies/permen, apples/apel, children in a square formation/anak dalam formasi persegi. FIXED: total = side². Generate a side n, set the range to bracket n² uniquely, and optionally ask for n itself.
- **Example (EN):** A teacher buys candies so that the number each student gets equals the number of students. If he buys more than 50 and fewer than 80 candies, how many candies does he buy? → **64**
- **Contoh (ID):** Seorang guru membeli permen sehingga jumlah permen tiap siswa sama dengan jumlah siswa. Jika ia membeli lebih dari 50 dan kurang dari 80 permen, berapa permen yang ia beli? → **64**
- **Sources:** 5 — 2025-FIN-G02-A-Q6, 2021-PRE-G03-A-Q8, 2025-PRE-G02-A-Q5, 2022-FIN-G03-B-Q7

### `place-value` — Place Value / Nilai Tempat
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 4 · **Illustration:** not needed · **Status:** built
- **Solution method:** Read a specified digit position (tens/units/hundreds) of numbers — count how many numbers have a given digit in a given place, or apply place-value scaling (appending zeros multiplies by powers of 10).
- **Parameterization:** Params: `mode` (`count-by-place` | `name-digit` | `scale-by-zeros`), `place` (units/satuan, tens/puluhan, hundreds/ratusan), `targetDigit` (0–9), and a candidate list or `range`. FIXED: positional decimal value (ones, tens, hundreds…). Generate a list seeded so a controlled number of entries have `targetDigit` at `place`; distractors are off-by-one counts.
- **Example (EN):** Among 178, 94, 25, 107, 71, 746, 670, 351, 707, how many numbers have 7 as their tens digit? → **3**
- **Contoh (ID):** Di antara 178, 94, 25, 107, 71, 746, 670, 351, 707, ada berapa bilangan yang angka puluhannya 7? → **3**
- **Sources:** 4 — 2023-PRE-G02-A-Q3, 2024-FIN-G02-B-Q3, 2025-FIN-G01-A-Q8, 2019-PRE-G03-A-Q9

### `product-of-consecutive` — Product of Factors / Consecutive Numbers / Hasil Kali Faktor / Bilangan Berurutan
- **Grades:** G2–G3 · **Answer:** both · **Source questions:** 3 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Express a target number as a product of two (near-equal or constrained) factors, or as a product of consecutive integers, then return a derived quantity (the factor sum, a count of valid factors, or the qualifying number).
- **Parameterization:** Params: `mode` (`two-factor` (factor N into two factors meeting a digit/range constraint, e.g. both 2-digit) | `consecutive` (find product of `r` consecutive naturals satisfying a bound)), `target`/`bound`, `r` (2–3 for consecutive), `query` (`factor-sum` | `count` | `the-number`). FIXED: factors are positive integers. Generate from the factors outward (pick factors, multiply to get N) so the factorization is guaranteed.
- **Example (EN):** The product of two 2-digit numbers is 2021. Find the sum of these two numbers. → **90**
- **Contoh (ID):** Hasil kali dua bilangan dua angka adalah 2021. Cari jumlah kedua bilangan itu. → **90**
- **Sources:** 3 — 2021-FIN-G03-B-Q7, 2025-FIN-G03-B-Q1, 2020-PRE-G02-B-Q6

### `digit-sum` — Digit Sum of an Expression Result / Jumlah Angka dari Hasil Ekspresi
- **Grades:** G2–G3 · **Answer:** multiple_choice · **Source questions:** 2 · **Illustration:** not needed · **Status:** built
- **Solution method:** Evaluate each answer-choice expression, take the digit sum of each result, and pick the choice whose digit sum equals the stated target.
- **Parameterization:** Params: `targetDigitSum` (e.g. 10), `op` mix (×, ÷, +, − within grade limits — G2 single-digit ×, G3 2-digit ÷/×), and 4 candidate expressions of which exactly one hits the target. FIXED: digit sum = sum of decimal digits of the evaluated result. Generate one expression whose result has the target digit sum, plus distractor expressions whose results miss it.
- **Example (EN):** Find the expression whose result has digit sum 10: 5×9, 47+5, 32−3, 8×8. → **8×8** (=64, 6+4=10)
- **Contoh (ID):** Cari ekspresi yang hasilnya memiliki jumlah angka 10: 5×9, 47+5, 32−3, 8×8. → **8×8** (=64, 6+4=10)
- **Sources:** 2 — 2024-PRE-G02-A-Q2, 2024-PRE-G03-A-Q4

### `equivalent-fraction-fill` — Equivalent Fraction Fill-in / Mengisi Pecahan Senilai
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Scale a base fraction up/down to fill missing numerators/denominators in a chain of equivalent fractions, then combine the recovered values (e.g. add the missing numerator and denominator).
- **Parameterization:** Params: `baseFraction` (e.g. 3/4, in lowest terms), 2–3 equivalent forms each with one blank (numerator or denominator known), `query` (sum of the two blanks, or one blank). FIXED: cross-multiplication keeps the ratio constant. Generate by choosing the base ratio and multipliers, blanking one term per form.
- **Example (EN):** If 3/4 = ▽/32 = 15/◯ = 60/80, find ▽ + ◯. → **44** (▽=24, ◯=20)
- **Contoh (ID):** Jika 3/4 = ▽/32 = 15/◯ = 60/80, cari ▽ + ◯. → **44** (▽=24, ◯=20)
- **Sources:** 1 — 2019-FIN-G03-A-Q7

### `find-missing-number-in-set` — Find the Missing Number in a Set / Mencari Bilangan yang Hilang
- **Grades:** G0 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Given a full intended set (e.g. 1…N) partially placed in a grid with one cell blank, find the single value present in the set but absent from the grid.
- **Parameterization:** Params: `setRange:[1,N]` (G0: N=16 in a 4×4 grid), `gridShape` (rows×cols), `missingValue` (the one omitted entry). FIXED: each value 1…N appears exactly once except the missing one. Generate by laying 1…N into the grid, removing one cell, and asking for the removed value.
- **Example (EN):** The numbers 1–16 fill a 4×4 grid with one cell blank (rows: 5 11 15 9 / 16 1 7 4 / 3 6 _ 14 / 13 10 8 2). Which number is missing? → **12**
- **Contoh (ID):** Bilangan 1–16 mengisi kisi 4×4 dengan satu sel kosong (baris: 5 11 15 9 / 16 1 7 4 / 3 6 _ 14 / 13 10 8 2). Bilangan mana yang hilang? → **12**
- **Sources:** 1 — 2024-FIN-G00-B-Q5

## WORD — Word Problems

### `story-sum` — Add/Subtract Story Sum / Soal Cerita Tambah-Kurang
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 49 · **Illustration:** not needed · **Status:** built
- **Solution method:** Track a running total through a sequence of narrated add/subtract events (start → ±deltas → result), or work backward from a stated end-state to the original count.
- **Parameterization:** Params: `start` (10–60), an ordered list of 1–3 `events` each `{op: "+"|"-", amount: 1–20}` with the running total kept non-negative; `target` is either the final total (forward) or the start (backward, e.g. "originally?"). Entity set (EN/ID): passengers/penumpang on a bus/bis, pages/halaman of a book/buku, goats/kambing, candies/permen. FIXED: integer arithmetic, single answer; choices are target ±1/±2/±3 distractors when multiple_choice.
- **Example (EN):** There are 15 passengers on the bus. 7 get off, then 8 get on. How many passengers are on the bus now? → **16**
- **Contoh (ID):** Ada 15 penumpang di bis. 7 turun, lalu 8 naik. Berapa penumpang di bis sekarang? → **16**
- **Sources:** 49 — 2020-PRE-G01-A-Q13, 2020-PRE-G01-B-Q2, 2019-FIN-G02-B-Q3, 2019-FIN-G03-A-Q5

### `weight-balance-word` — Balance-Scale Equivalence / Kesetaraan Timbangan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 22 · **Illustration:** needed · **Status:** seed
- **Solution method:** Convert one or more pictured balance facts into equations relating object weights/counts, then substitute to solve for the unknown pan or the equivalent count.
- **Parameterization:** Params: an integer weight per object type (e.g. `circle` 10–60g), 1–2 balance facts as totals (e.g. 180g and 120g) or "objectA = k × objectB" multiplier chains (`k` 2–13). Entity set (EN/ID): peaches/persik, tennis balls/bola tenis, lamb-chicken-dog/domba-ayam-anjing, geometric shapes/bentuk geometri (○ △ □). FIXED: weights positive integers, exactly one unknown; image carries the actual pan contents.
- **Example (EN):** A lamb weighs 6 times a chicken and 3 times a dog. An elephant weighs 13 times a lamb. How many times the chicken does the elephant weigh? → **78**
- **Contoh (ID):** Seekor domba beratnya 6 kali ayam dan 3 kali anjing. Seekor gajah beratnya 13 kali domba. Berapa kali berat ayam itukah berat gajah? → **78**
- **Sources:** 22 — 2020-PRE-G03-A-Q7, 2019-FIN-G02-B-Q5, 2019-FIN-G01-A-Q11, 2020-FIN-G00-A-Q5

### `money-shopping-change` — Shopping Cost & Change / Belanja: Total dan Kembalian
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 16 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Compute total cost as a sum of `quantity × unit_price` terms, then either pay-minus-cost for change, or match a bill set summing to that change.
- **Parameterization:** Params: 1–3 items `{qty: 1–5, price: 3–40}`, optional `paid` (a round bill 50/100), and `mode` ∈ {total, change, infer-cost}. Entity set (EN/ID): coffee/kopi, hamburger/burger, water/air, snacks/camilan, stationery/alat tulis. Bill denominations: 20/10/5/1. FIXED: prices/qty positive integers, change = paid − total ≥ 0; multiple_choice distractors are near-misses or wrong bill sets.
- **Example (EN):** A coffee costs $15 and a hamburger costs $39. Dad buys 3 coffees and 5 hamburgers. How much does he pay? → **240**
- **Contoh (ID):** Sebuah kopi harganya $15 dan sebuah burger $39. Ayah membeli 3 kopi dan 5 burger. Berapa yang harus ia bayar? → **240**
- **Sources:** 16 — 2019-PRE-G03-A-Q10, 2023-FIN-G01-A-Q5, 2023-PRE-G01-A-Q14, 2022-PRE-G02-A-Q12

### `legs-items-rate` — Per-Unit Rate Total / Total dengan Laju per Satuan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 15 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Multiply a per-unit rate by a count for each category and sum, or apply a rate over a period/length (including gap-counting for items placed along a line/circle).
- **Parameterization:** Params: 1–3 categories `{rate: 1–10, count: 1–10}` summed, OR `{per_unit_rate, units}` where units = days (7), baskets, or gaps. Gap mode: `n` items along a line make `n−1` gaps, around a circle make `n` gaps. Entity set (EN/ID): basketball points/poin basket, apples-per-basket/apel per keranjang, hens & eggs/ayam & telur, streetlamps/lampu jalan, flags/bendera. FIXED: rates/counts positive integers; line vs circle fixes the gap formula.
- **Example (EN):** A farm has 19 chickens; 5 are roosters, the rest are hens. Each hen lays 1 egg a day. How many eggs in a week? → **98**
- **Contoh (ID):** Sebuah peternakan punya 19 ayam; 5 ekor jantan, sisanya betina. Tiap betina bertelur 1 telur sehari. Berapa telur dalam seminggu? → **98**
- **Sources:** 15 — 2025-PRE-G02-A-Q10, 2020-PRE-G01-A-Q14, 2020-FIN-G03-A-Q5, 2019-FIN-G02-B-Q4

### `money-coins-total` — Count Money Total / Menghitung Total Uang
- **Grades:** G1–G3 · **Answer:** multiple_choice · **Source questions:** 6 · **Illustration:** needed · **Status:** seed
- **Solution method:** Sum the value of a pictured mix of bills/coins (denomination × quantity), or count which option's bill set reaches a target sum.
- **Parameterization:** Params: a denomination set drawn from {100,50,20,10,5,1}, a `quantity` 0–5 per denomination, and `mode` ∈ {total, match-target}. For match-target, `target` is a round amount (e.g. 100) and one of 4–5 options sums to it. Entity set: US dollar bills/uang dolar AS, $10/$20/$50 coins/koin. FIXED: non-negative integer counts; image supplies the actual counts, distractors are off by one bill.
- **Example (EN):** Which option's bills sum to exactly $100? ($50 + $20 + $10 + $10 + $10) → **$50 + $20 + $10 + $10 + $10**
- **Contoh (ID):** Pilihan mana yang jumlah uangnya tepat $100? ($50 + $20 + $10 + $10 + $10) → **$50 + $20 + $10 + $10 + $10**
- **Sources:** 6 — 2022-PRE-G02-A-Q9, 2021-FIN-G02-A-Q11, 2021-FIN-G03-A-Q15, 2022-FIN-G01-A-Q1

### `distance-rate-time` — Distance, Rate & Time / Jarak, Laju, dan Waktu
- **Grades:** G2–G3 · **Answer:** both · **Source questions:** 4 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Apply distance = speed × time over the total elapsed time, adjusting for detours, or count gaps between evenly-spaced events (clock strikes, arcs of a loop) to convert duration to rate.
- **Parameterization:** Params: `speed` (30–60 m/min), `start_time`/`end_time` giving total minutes, optional `detour_minutes` (0–10) subtracted as a there-and-back, OR `strikes`/`events` (n) making n−1 gaps over a given duration. Entity set (EN/ID): walking to school/berjalan ke sekolah, clock strikes/dentang jam, roundabout arcs/lengkung bundaran. FIXED: positive integer speed/times; detour counted twice; gaps = events − 1.
- **Example (EN):** A clock takes 6 seconds to strike 4 times at 4 o'clock. How many seconds to strike 12 times at 12 o'clock? → **22**
- **Contoh (ID):** Sebuah jam butuh 6 detik untuk berdentang 4 kali pada pukul 4. Berapa detik untuk berdentang 12 kali pada pukul 12? → **22**
- **Sources:** 4 — 2019-PRE-G03-B-Q8, 2025-FIN-G03-A-Q5, 2025-FIN-G02-B-Q5, 2025-FIN-G03-A-Q8

### `budget-selection` — Most Within Budget / Pilihan Terbaik dalam Anggaran
- **Grades:** G2–G3 · **Answer:** multiple_choice · **Source questions:** 3 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Divide a fixed budget by a unit price for the max count, or pick the highest-priced (or item pair) option whose total still fits the budget / leaves a stated remainder.
- **Parameterization:** Params: `budget` (50–1000), `unit_price` (5–250), `people` (1–4) for per-head ticket cost, and `mode` ∈ {max-count, highest-affordable, leaves-remainder}. Entity set (EN/ID): pencils/pensil, train tickets/tiket kereta, snack items/jajanan. FIXED: budget and prices positive integers; max-count uses floor(budget/price); highest-affordable picks the largest price with price×people ≤ budget.
- **Example (EN):** A pencil costs $8. Dana has $100. How many pencils can she buy at most? → **12**
- **Contoh (ID):** Sebuah pensil harganya $8. Dana punya $100. Paling banyak berapa pensil yang bisa ia beli? → **12**
- **Sources:** 3 — 2021-PRE-G02-A-Q7, 2025-FIN-G03-A-Q9, 2024-FIN-G02-A-Q7

### `net-progress-cycles` — Net-Gain Climb Cycles / Siklus Maju-Mundur Bersih
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Each cycle yields a net gain (up − down); find how many full cycles plus the final partial advance reach the target distance/height.
- **Parameterization:** Params: `up` (3–6), `down` (1–4) with up > down, and `target` (a final advance amount, e.g. 50) reached on the last up-move. Entity set (EN/ID): climbing stairs/menaiki tangga, a snail in a well/siput di sumur. FIXED: up > down so net progress is positive; the answer is total ground covered for one level = derived from cycle count and net gain.
- **Example (EN):** Amy climbs 5 steps up then 4 steps down, repeating. On her final move she goes 50 steps up to reach the second floor. How many steps are in one level? → **14**
- **Contoh (ID):** Amy naik 5 anak tangga lalu turun 4, berulang. Pada gerakan terakhir ia naik 50 anak tangga untuk mencapai lantai dua. Berapa anak tangga dalam satu lantai? → **14**
- **Sources:** 1 — 2019-PRE-G02-B-Q9

### `rope-wraps-ratio` — Rope-Wrap Ratio / Rasio Lilitan Tali
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Derive the circumference ratio of two pillars from how many times one rope wraps each, then scale a second rope's wrap count by that ratio.
- **Parameterization:** Params: rope-1 wraps on pillar A `wA` (2–5) and on pillar B `wB` (giving ratio A:B), and rope-2's wraps on one pillar `m` (4–12) to convert. Entity set (EN/ID): thick & thin pillars/tiang tebal & tipis, poles/tonggak. FIXED: ratio derived as wA:wB from equal rope length; converted count must be a whole number (choose params so it divides).
- **Example (EN):** A rope wraps pillar A 4 times and pillar B 8 times. Another rope wraps pillar B 10 times. How many times does it wrap pillar A? → **5**
- **Contoh (ID):** Sebuah tali melilit tiang A 4 kali dan tiang B 8 kali. Tali lain melilit tiang B 10 kali. Berapa kali ia melilit tiang A? → **5**
- **Sources:** 1 — 2021-FIN-G02-A-Q10

### `lacking-money-shared` — Combined Shortfall / Kekurangan Uang Gabungan
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Two people each lack some amount for one item; their combined money exactly buys it, so the price = sum of shortfalls and each person's money = price − their own shortfall.
- **Parameterization:** Params: shortfall for person A `lackA` and person B `lackB` (each $0.50–$10, optionally with cents in 0.50 steps); `price = lackA + lackB`. Entity set (EN/ID): a cake/kue at a bakery/toko roti, a toy/mainan. FIXED: 1 dollar = 100 cents; combined money exactly equals price; answer = price − lack of the asked person.
- **Example (EN):** Jessica and Cindy want the same cake. Jessica lacks $4.50 and Cindy lacks $8. Together they have exactly enough. How much money does Jessica bring? → **$8**
- **Contoh (ID):** Jessica dan Cindy ingin kue yang sama. Jessica kurang $4,50 dan Cindy kurang $8. Bersama uang mereka pas cukup. Berapa uang yang dibawa Jessica? → **$8**
- **Sources:** 1 — 2024-FIN-G01-A-Q6

## PAT — Patterns & Sequences

### `pattern-next` — Number Sequence: Find the Missing/Next Term / Barisan Bilangan: Cari Suku yang Hilang/Berikutnya
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 53 · **Illustration:** not needed · **Status:** built
- **Solution method:** Identify the constant step (common difference) of an arithmetic sequence, then walk forward/backward from a known term to fill a marked blank (often labelled ★) or count how many terms fill a gap.
- **Parameterization:** Params — `start` (10–500), `step` (±2..±20, multiples avoiding 1), `length` (5–8 terms), `targetIndex` (the ★ position, 2..length-1), and `mode` (`find-term` | `count-gap`). Sequence is FIXED as arithmetic (constant step); only one cell is queried. For decreasing variants set `step` negative (e.g. 441→431→…). Distractors = correct ± one step, or off-by-one index. For `count-gap`, ask how many terms lie between two given terms. Maps to a zod schema with `start`/`step`/`length`/`targetIndex`/`mode`, `generate(rng)` rolling those, and `render(params)` building the arrow chain with blanks.
- **Example (EN):** Think and find ★: 56 → 60 → ( ) → ( ) → ( ★ ) → ( ) → 80. What is ★? ① 70 ② 73 ③ 76 ④ 72 → **④ 72**
- **Contoh (ID):** Pikirkan dan temukan ★: 56 → 60 → ( ) → ( ) → ( ★ ) → ( ) → 80. Berapakah ★? ① 70 ② 73 ③ 76 ④ 72 → **④ 72**
- **Sources:** 53 — e.g. 2019-FIN-G00-A-Q8, 2019-FIN-G01-A-Q3, 2019-FIN-G02-A-Q1, 2020-PRE-G01-A-Q11

### `visual-pattern-next` — Continue the Picture/Icon Pattern / Lanjutkan Pola Gambar/Ikon
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 53 · **Illustration:** needed · **Status:** seed
- **Solution method:** Detect the repeating cycle of icons/colours/shapes in the shown row, then project to the queried position (next cell or the Nth figure counting from ★) and select the matching picture.
- **Parameterization:** Params — `motifSet` (icons drawn from EN/ID-labelled set: circle/lingkaran, square/persegi, triangle/segitiga, star/bintang, diamond/wajik), `cycleLength` (2–4), `cycleArrangement` (the repeating order), `shownLength` (4–8 cells), and `queryMode` (`next` | `nth-from-star` with `n` 5–12). Repetition rule is FIXED (strict cycle); rendered choices are the icon glyphs. Distractors = other cycle members. Maps to zod `motifs[]`/`cycleLength`/`shownLength`/`queryMode`/`n`, `generate(rng)` choosing motif order, `render(params)` emitting the icon row plus image-style options.
- **Example (EN):** ◯ △ □ ◯ △ □ ◯ △ ? — which icon comes next? ① ◯ ② △ ③ □ → **③ □**
- **Contoh (ID):** ◯ △ □ ◯ △ □ ◯ △ ? — ikon mana yang muncul berikutnya? ① ◯ ② △ ③ □ → **③ □**
- **Sources:** 53 — e.g. 2019-PRE-G00-A-Q9, 2019-FIN-G02-A-Q5, 2019-PRE-G03-A-Q11, 2020-FIN-G00-A-Q12

### `shape-transformation-rule` — Apply the Shape Transformation Rule / Terapkan Aturan Transformasi Bentuk
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 34 · **Illustration:** needed · **Status:** seed
- **Solution method:** Infer a transformation rule from a worked example (one shape/grid mapped to a result), then apply the same rule to the queried input and pick (or state) the resulting figure.
- **Parameterization:** Params — `transform` (`rotate` 90/180/270, `reflect` horizontal/vertical, `recolor` swap, `recombine` two shapes → one), `inputShape` (from set: triangle/segitiga, square/persegi, trapezoid/trapesium, circle/lingkaran, plus 4×4 vs 2×2 grid layouts), `answerMode` (`multiple_choice` figures | `fill_in` count). Rule consistency is FIXED: example and query share the same transform. Distractors = wrong rotation angle, wrong reflection axis, un-transformed input. Maps to zod `transform`/`inputShape`/`gridSize`/`answerMode`, `generate(rng)`, and `render(params)` producing example→result and the query.
- **Example (EN):** Example: △ pointing up → △ pointing down (a 180° flip). Apply the same rule: ▷ pointing right → ? ① ◁ left ② ▷ right ③ △ up ④ ▽ down → **① ◁ left**
- **Contoh (ID):** Contoh: △ menghadap atas → △ menghadap bawah (putaran 180°). Terapkan aturan yang sama: ▷ menghadap kanan → ? ① ◁ kiri ② ▷ kanan ③ △ atas ④ ▽ bawah → **① ◁ kiri**
- **Sources:** 34 — e.g. 2019-FIN-G00-A-Q14, 2019-PRE-G02-A-Q6, 2021-PRE-G03-A-Q14, 2020-FIN-G01-B-Q2

### `number-pyramid` — Number Pyramid / Relationship Grid / Piramida Bilangan / Kisi Hubungan Angka
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 15 · **Illustration:** needed · **Status:** seed
- **Solution method:** Each cell equals the sum of the two cells directly below it; fill upward from the given base row until the marked top/middle cell (often ★) is reached.
- **Parameterization:** Params — `rows` (3–4), `baseValues` (each 1–15), and `target` (the queried cell, usually apex or a middle cell). Rule is FIXED as sum-of-two-below; only the base row varies. Optionally a `mode` switch to a connected relationship-grid where adjacent cells differ/sum by a stated rule. Distractors = apex ± a base value, or swapped addition order. Maps to zod `rows`/`baseValues[]`/`targetIndex`, `generate(rng)` rolling the base, `render(params)` drawing the stacked rows with one cell blanked.
- **Example (EN):** In this pyramid each cell is the sum of the two below it. Base row: 5, 7, 2. What is the top cell ★? ① 18 ② 19 ③ 20 ④ 21 → **② 19**
- **Contoh (ID):** Pada piramida ini setiap kotak adalah jumlah dua kotak di bawahnya. Baris bawah: 5, 7, 2. Berapa kotak puncak ★? ① 18 ② 19 ③ 20 ④ 21 → **② 19**
- **Sources:** 15 — e.g. 2021-PRE-G00-B-Q8, 2023-PRE-G00-B-Q4, 2019-PRE-G02-B-Q8, 2022-FIN-G01-A-Q15

### `block-transformation-sequence` — Growing Block/Triangle Pattern / Pola Blok-Segitiga yang Bertambah
- **Grades:** G0, G2–G3 · **Answer:** both · **Source questions:** 8 · **Illustration:** needed · **Status:** seed
- **Solution method:** Read the growth rule from the first few stages of a figure (blocks/triangles added per stage), then continue the sequence to the queried stage and count the elements (or find when a stated condition is met).
- **Parameterization:** Params — `unit` (triangle/segitiga, square/persegi, matchstick/korek), `growthRule` (per-stage increment such as +consecutive-odd for triangular numbers, or linear `a*n+b`), `queryStage` (n = 4–10), and `mode` (`count-at-stage` | `stage-for-condition`, e.g. when white-grey difference = 10). Growth law is FIXED within an item; the queried stage/condition varies. Distractors = adjacent-stage counts. Maps to zod `unit`/`growthRule`/`queryStage`/`mode`, `generate(rng)`, `render(params)` drawing stages 1–3 then "?".
- **Example (EN):** Triangles grow by stage: stage 1 has 1, stage 2 has 3, stage 3 has 6, … (add 1 more each stage). How many small triangles are in stage 7? ① 21 ② 50 ③ 28 ④ 36 → **③ 28**
- **Contoh (ID):** Segitiga bertambah tiap tahap: tahap 1 ada 1, tahap 2 ada 3, tahap 3 ada 6, … (bertambah 1 lebih banyak tiap tahap). Berapa segitiga kecil pada tahap 7? ① 21 ② 50 ③ 28 ④ 36 → **③ 28**
- **Sources:** 8 — e.g. 2019-FIN-G02-A-Q13, 2020-PRE-G03-B-Q2, 2023-PRE-G00-B-Q10, 2023-FIN-G02-B-Q6

## LOG — Logic & Reasoning

### `grid-number-constraint` — Grid Number Constraint / Kendala Angka pada Petak
- **Grades:** G0–G3 · **Answer:** fill_in · **Source questions:** 68 · **Illustration:** needed · **Status:** seed
- **Solution method:** Fill blank cells of an N×N grid so each row and column obeys its clue (Latin-square uniqueness 1..N, plus a per-line sum/difference or a directional "visible/distinct count"); then read the requested digits ABCD.
- **Parameterization:** `n` (3 or 4); `mode` ∈ {sum-grid, latin-unique, skyscraper}; for sum-grid pick row/col sums consistent with a hidden solution; for latin/skyscraper pick a random valid Latin square then derive clues and blank K cells (K in 4..7); `readCells` = which cells form the answer string (default top row → ABCD). FIXED: square grid, digits 1..n, uniqueness per row/column. generate(rng) samples a solved grid first, then erases cells and emits clues so the puzzle is guaranteed unique; render(params) draws the grid with edge clue labels.
- **Example (EN):** Fill 1–4 in each cell so every row and column has different numbers; the corner clue "6+" means that cage sums to 6. Find the 4-digit number ABCD (top row). → **2134**
- **Contoh (ID):** Isi 1–4 di setiap petak agar setiap baris dan kolom berisi angka berbeda; petunjuk "6+" berarti jumlah dalam bingkai itu adalah 6. Tentukan bilangan 4 digit ABCD (baris atas). → **2134**
- **Sources:** 68 — e.g. 2019-FIN-G01-B-Q9, 2019-FIN-G02-B-Q10, 2019-FIN-G03-B-Q10, 2019-FIN-G00-B-Q5, 2020-FIN-G00-B-Q5

### `cryptarithm` — Symbol/Digit Arithmetic Puzzle / Teka-teki Aritmetika Simbol
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 34 · **Illustration:** needed · **Status:** seed
- **Solution method:** Each symbol (shape, icon, or hidden digit) stands for an unknown value; recover the values from a small set of equations or a vertical add/subtract/multiply layout, then report the requested digit, sum, or full product.
- **Parameterization:** `mode` ∈ {symbol-system, vertical-op}; for symbol-system choose 2–3 distinct symbols with integer values (range 1..20, all distinct) and emit 2 linear equations whose solution is unique; for vertical-op choose an operation (`+`/`−`/`×`) and operands, then mask 1–3 digits and ask for a masked digit, the operand, or the product. Entity symbols: ◇/△/★/○/▢ or icons (smiley/folder, apel "apple"/anggur "grapes"). FIXED: integer solutions, unique answer. generate(rng) picks values, builds the masked layout, verifies solvability; render(params) lays out equations or a vertical column.
- **Example (EN):** Two shapes stand for numbers: ◇+◇=14 and ◇+△=11. Find ◇ and △. → **◇=7, △=4**
- **Contoh (ID):** Dua bentuk mewakili angka: ◇+◇=14 dan ◇+△=11. Tentukan ◇ dan △. → **◇=7, △=4**
- **Sources:** 34 — e.g. 2019-PRE-G00-B-Q8, 2020-FIN-G01-B-Q8, 2019-FIN-G02-A-Q15, 2021-PRE-G00-A-Q12, 2019-FIN-G03-B-Q7

### `which-might-be` — Which Value Satisfies / Nilai Mana yang Memenuhi
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 26 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Evaluate a comparison/inequality (or exchange-equivalence) condition and pick (or compute) the value that satisfies it — smallest value above a bound, an expression below a cap, or the extreme of an allowed range.
- **Parameterization:** `mode` ∈ {min-above, fits-cap, extreme-range}; choose base `a` (1..30), bound `k`, and inequality direction; for fits-cap supply 3–4 candidate expressions (e.g. `3+4`, `1+5`, `6+2`) of which exactly one passes; for extreme-range derive max−min of an array configuration. FIXED: single correct option, integer comparisons. generate(rng) picks the bound, builds distractors that all fail, and marks the unique pass; render(params) writes the inequality and option list.
- **Example (EN):** Given 16 + ( ) > 30, what is the smallest whole number that fits in ( )? → **15**
- **Contoh (ID):** Diketahui 16 + ( ) > 30. Berapa bilangan bulat terkecil yang dapat mengisi ( )? → **15**
- **Sources:** 26 — e.g. 2019-PRE-G01-B-Q2, 2020-PRE-G00-A-Q6, 2019-PRE-G00-B-Q9, 2019-PRE-G03-B-Q9, 2020-FIN-G01-B-Q1

### `order-from-statements` — Order from Statements / Urutan dari Pernyataan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 18 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Combine pairwise comparison clues (heavier/lighter, larger/smaller, "A>B") into one consistent total order, then output the full ranking or a queried position.
- **Parameterization:** `n` entities (3..5); pick a hidden permutation, then emit a minimal consistent set of pairwise comparisons (`A>B`, balance/seesaw, or "larger than" arrows); `query` ∈ {full-order, position-of-X, who-is-kth}. Entity sets: letters A–E; animals (cat/dog/rabbit ↔ kucing/anjing/kelinci); items by weight. FIXED: clues force one unique order. generate(rng) shuffles a permutation, derives clues, checks uniqueness; render(params) lists the clues and (for MC) generates ordering options.
- **Example (EN):** Four boxes A, B, C, D weigh different amounts. Given A>D, D>C, and C>B, arrange them from heaviest to lightest. → **A>D>C>B**
- **Contoh (ID):** Empat kotak A, B, C, D memiliki berat berbeda. Diketahui A>D, D>C, dan C>B, urutkan dari yang terberat ke teringan. → **A>D>C>B**
- **Sources:** 18 — e.g. 2021-PRE-G00-A-Q15, 2019-PRE-G01-B-Q10, 2019-FIN-G02-A-Q14, 2020-PRE-G01-B-Q7, 2022-FIN-G00-B-Q4

### `assignment-cycle` — Repeating Count-Off Cycle / Siklus Berhitung Berulang
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 17 · **Illustration:** needed · **Status:** seed
- **Solution method:** A fixed-period label sequence repeats over N positions; use modular arithmetic (position mod period) to find the label/symbol at a target position, or count how many positions get a given label.
- **Parameterization:** `period` p (2..4), `total` N (10..40), `labels` (numbers 1..p, names A/B/C, or symbols □ ▽ ○ ★); `query` ∈ {label-at-N, count-of-label, count-even-said-by-X, count-remaining-after-removal}. FIXED: cycle is strictly periodic, deterministic. generate(rng) picks p, N, labels, query; the answer is computed by `(N-1) mod p` or counting arithmetic-progression hits; render(params) describes the count-off rule or draws the repeating symbol strip.
- **Example (EN):** Find the 32nd shape in the repeating pattern □ ▽ ○ ★ □ ▽ ○ ★ … → **★**
- **Contoh (ID):** Tentukan bentuk ke-32 pada pola berulang □ ▽ ○ ★ □ ▽ ○ ★ … → **★**
- **Sources:** 17 — e.g. 2019-FIN-G03-A-Q9, 2019-PRE-G01-A-Q15, 2021-PRE-G02-A-Q13, 2019-PRE-G00-B-Q7, 2022-FIN-G01-B-Q8

### `sum-partition-split` — Equal-Sum Partition / Pembagian Jumlah Sama
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 14 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Split a set of numbered items into equal-sum groups (2 or 3 parts), or select a subset/consecutive run meeting a target sum; deduce the missing member of a partition from the equal-sum constraint.
- **Parameterization:** `mode` ∈ {equal-2-split, equal-3-split, target-subset, count-disjoint-triples}; `values` (small multiset whose total is divisible by the part count), `target` for subset modes; for split modes one item is revealed and the queried item is deduced. FIXED: a valid equal partition exists and is determined. generate(rng) builds a multiset with the divisibility property, fixes the solution, then reveals one cell and queries another (or asks the missing card / the target subset); render(params) lists the cards or numbered grid.
- **Example (EN):** Six cards (2, 3, 4, 5, 6, 7) are dealt to three people so each person's two cards have the same total. If Danny holds the card 4, what is his other card? → **8** would be invalid, so his other card is **5** (4+5=9, matching 2+7 and 3+6).
- **Contoh (ID):** Enam kartu (2, 3, 4, 5, 6, 7) dibagikan ke tiga orang sehingga jumlah dua kartu tiap orang sama. Jika Danny memegang kartu 4, berapa kartu lainnya? → **5** (4+5=9, sama dengan 2+7 dan 3+6).
- **Sources:** 14 — e.g. 2020-PRE-G02-A-Q15, 2019-PRE-G00-B-Q4, 2022-PRE-G01-B-Q10, 2024-PRE-G01-B-Q7, 2023-FIN-G02-B-Q7

### `position-in-line` — Position in a Line / Posisi dalam Barisan
- **Grades:** G1–G2 · **Answer:** both · **Source questions:** 12 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Convert front/back counts into absolute positions on a 1-D line; total = position + people behind, or total = front-position + back-position − 1; for "middle" use total = 2·mid − 1.
- **Parameterization:** `mode` ∈ {total-from-pos+behind, total-from-front+back, middle-total, gap-between-two, before-after-move}; choose position(s) (1..30) and counts so the answer is a positive integer; entity = generic "people/students/animals" (orang/siswa/hewan), names (Gary/Bob ↔ Gary/Budi). FIXED: single straight line, 1-indexed. generate(rng) picks the mode and consistent numbers; render(params) writes the line word problem.
- **Example (EN):** There is a long line at the bus stop. Gary is 4th, and there are 6 people behind him. How many people are in line? → **10**
- **Contoh (ID):** Ada antrean panjang di halte bus. Gary berada di urutan ke-4, dan ada 6 orang di belakangnya. Berapa banyak orang dalam antrean? → **10**
- **Sources:** 12 — e.g. 2020-PRE-G01-A-Q10, 2021-FIN-G02-A-Q8, 2021-FIN-G01-A-Q11, 2021-FIN-G01-A-Q6, 2021-FIN-G01-B-Q5

### `venn-set-membership` — Venn Set Membership / Keanggotaan Himpunan Venn
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 11 · **Illustration:** needed · **Status:** seed
- **Solution method:** Use overlapping-set regions (or complement-counting "not-X" totals) to count or sum items in a queried region, or solve for region values from given region sums.
- **Parameterization:** `mode` ∈ {count-in-region, sum-in-region, solve-region-value, complement-total}; `sets` (2 or 3 circles), per-region counts/values, `query` region (e.g. "in circle but not square", "circle-only"). For complement-total pick category totals `T−black`, `T−white`, etc. and solve `kT − T·… = Σ`. FIXED: regions partition cleanly, integer answer. generate(rng) assigns region values, picks the queried region; render(params) draws the Venn diagram with labeled regions (or, for complement mode, a text word problem).
- **Example (EN):** The school buys masks of four colors. 153 are not black, 125 are not white, 138 are not blue, and 30 are green. How many masks in total? → **193**
- **Contoh (ID):** Sekolah membeli masker empat warna. 153 bukan hitam, 125 bukan putih, 138 bukan biru, dan 30 berwarna hijau. Berapa total masker? → **193**
- **Sources:** 11 — e.g. 2021-PRE-G03-B-Q9, 2020-FIN-G01-B-Q5, 2022-FIN-G01-A-Q4, 2022-PRE-G01-B-Q5, 2022-PRE-G02-B-Q4

### `symbol-value-equation` — Symbol-Value Substitution / Substitusi Nilai Simbol
- **Grades:** G0–G2 · **Answer:** both · **Source questions:** 9 · **Illustration:** not needed · **Status:** new
- **Solution method:** Solve a short chain or small system where each symbol/box equals a number; substitute solved values forward to evaluate the requested target expression.
- **Parameterization:** `mode` ∈ {chain-substitution, two-symbol-system, factor-fill}; pick 1–2 symbol values (1..20), build equations whose substitution gives a unique target; for factor-fill choose product equalities like `□×4 = 24`. Symbols: △/★/◇/○ or named icons (apel/anggur). FIXED: integer values, deterministic forward substitution. generate(rng) picks values, forms equations, computes the queried sum/value; render(params) prints the equation list and the target line.
- **Example (EN):** Suppose 9×◇=72 and ◇×★=24. Find ★. → **3**
- **Contoh (ID):** Misalkan 9×◇=72 dan ◇×★=24. Tentukan ★. → **3**
- **Sources:** 9 — e.g. 2019-PRE-G02-B-Q4, 2019-PRE-G02-B-Q2, 2020-PRE-G01-A-Q12, 2019-FIN-G01-B-Q3, 2020-PRE-G00-A-Q14

### `range-count-evaluate` — Evaluate & Classify by Range / Hitung & Kelompokkan menurut Rentang
- **Grades:** G0–G2 · **Answer:** both · **Source questions:** 7 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Evaluate each given arithmetic expression (or enumerate integers), then count/select those whose value falls in a target range or satisfies a digit condition.
- **Parameterization:** `mode` ∈ {count-in-range, pick-in-range, classify-above-below, count-integers-with-units}; supply a list of expressions (sums/differences/products with operands 1..9 or two-digit) and a range `(lo, hi)` or threshold; exactly the intended subset qualifies. FIXED: integer evaluation, one correct count/option. generate(rng) builds expressions, computes values, sizes the qualifying subset; render(params) lists the expressions and the range condition.
- **Example (EN):** Liu's magic key opens a lock whose number is larger than 10 and smaller than 15. How many of these locks can he open? Locks: 6+5, 14−4, 18−6, 7+9, 15−3−3, 4+6+4 → **3**
- **Contoh (ID):** Kunci ajaib Liu membuka gembok yang angkanya lebih besar dari 10 dan lebih kecil dari 15. Berapa gembok yang bisa ia buka? Gembok: 6+5, 14−4, 18−6, 7+9, 15−3−3, 4+6+4 → **3**
- **Sources:** 7 — e.g. 2022-FIN-G01-A-Q13, 2020-FIN-G02-A-Q9, 2020-PRE-G02-A-Q4, 2023-FIN-G01-A-Q8, 2025-PRE-G00-A-Q9

### `target-hit-equal-sum` — Target-Hit Scoring / Penjumlahan Skor Sasaran
- **Grades:** G0–G2 · **Answer:** both · **Source questions:** 7 · **Illustration:** needed · **Status:** seed
- **Solution method:** Each board region/square has a point value; sum the values of the hits described (specific squares, "three largest odd", or ring multipliers) — or deduce a region value from two given totals — then compare or report the score.
- **Parameterization:** `mode` ∈ {sum-selected-squares, deduce-ring-value, compare-players}; `board` = 3×3 grid 1..9 or concentric rings (inner/middle/outer values e.g. 10/5/1); `selection` rule (named squares, largest-k-odd, multiplier arrow tripling one hit). FIXED: each hit maps to one value, additive scoring. generate(rng) lays out the board, chooses hits, computes totals; render(params) draws the grid/rings and states the hit rule.
- **Example (EN):** On the 1–9 square grid (rows 123 / 456 / 789), Mary hits the three largest odd numbers and her sister hits the top-left and bottom-left squares. Find the total of all numbers hit. → **29**
- **Contoh (ID):** Pada papan kotak 1–9 (baris 123 / 456 / 789), Mary mengenai tiga bilangan ganjil terbesar dan adiknya mengenai kotak kiri-atas dan kiri-bawah. Tentukan jumlah semua angka yang terkena. → **29**
- **Sources:** 7 — e.g. 2022-PRE-G01-B-Q3, 2022-PRE-G00-A-Q13, 2020-PRE-G02-B-Q3, 2022-FIN-G02-A-Q11, 2025-PRE-G01-A-Q15

### `which-cannot-be` — Which Cannot Be / Mana yang Tidak Mungkin
- **Grades:** G1–G3 · **Answer:** multiple_choice · **Source questions:** 6 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Characterize the set of achievable values from a generating rule (linear form a+k·d, odd cross-total 2k−1, divisibility/remainder, or reachable framed-date sums), then pick the option that does NOT belong to that set.
- **Parameterization:** `mode` ∈ {coin-total, cross-total, divisibility-remainder, framed-date-sum}; pick rule params (e.g. 10 coins of {1,5}, total = 10+4·n; or "÷3 exact and ≡3 mod 4"), generate ~4 valid options plus exactly one impostor that breaks the rule. FIXED: one option is unreachable, all others reachable. generate(rng) enumerates the reachable set, samples valid distractors and one outsider; render(params) writes the rule and option list, marking the outsider as the answer.
- **Example (EN):** Tim has 10 coins, each a 5-dollar or 1-dollar coin. Which of these cannot be the total money Tim has: 38, 18, 14, 24, 50? → **24**
- **Contoh (ID):** Tim punya 10 koin, masing-masing koin 5-dolar atau 1-dolar. Mana yang tidak mungkin menjadi total uang Tim: 38, 18, 14, 24, 50? → **24**
- **Sources:** 6 — e.g. 2024-FIN-G01-A-Q12, 2021-FIN-G02-A-Q3, 2024-PRE-G03-A-Q11, 2022-PRE-G03-B-Q5, 2020-PRE-G03-B-Q10

### `code-deduction` — Secret-Code Deduction / Deduksi Kode Rahasia
- **Grades:** G1, G3 · **Answer:** fill_in · **Source questions:** 2 · **Illustration:** needed · **Status:** new
- **Solution method:** From several guess rows, each tagged with feedback ("k digits correct", "correct and in the right place", "none correct"), eliminate possibilities until exactly one secret number remains, then output it.
- **Parameterization:** `length` L (3 digits), `guesses` (4–5 candidate numbers), per-guess `feedback` (count correct, count correctly-placed); choose a hidden secret first, then craft guesses whose feedback uniquely pins it. FIXED: digits 0–9, unique secret consistent with all clues. generate(rng) samples a secret, builds guesses, computes their feedback, and verifies no other number fits; render(params) lists guesses with their textual clues.
- **Example (EN):** Crack the 3-digit code. Guess 521: "1 number correct and in the right place." Guess 745: "1 number correct." Guess 273: "2 numbers correct." Guess 168: "no numbers correct." Guess 952: "1 number correct." → **527**
- **Contoh (ID):** Pecahkan kode 3 digit. Tebakan 521: "1 angka benar dan di posisi yang tepat." Tebakan 745: "1 angka benar." Tebakan 273: "2 angka benar." Tebakan 168: "tidak ada angka benar." Tebakan 952: "1 angka benar." → **527**
- **Sources:** 2 — e.g. 2019-FIN-G01-B-Q8, 2019-FIN-G03-B-Q6

### `equation-substitution-solve` — Chained Equation Solve / Penyelesaian Persamaan Berantai
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Solve the latter equation for one symbol, substitute into the linking equation, and solve for the requested symbol via proportional/multiplicative reasoning.
- **Parameterization:** two symbols □ and ○ linked by `□×a = ○×b` and `○×c = m×n`; pick coefficients (a,b,c) and product m·n so both symbols are positive integers; `query` = □ (or ○). FIXED: integer solutions, two-step substitution. generate(rng) picks ○ first, derives the product, then sets □ from the cross-multiplication; render(params) prints the two equations and the target. Distractors are near-miss integers.
- **Example (EN):** If □×4 = ○×3 and ○×7 = 112×3, find □. → **36**
- **Contoh (ID):** Jika □×4 = ○×3 dan ○×7 = 112×3, tentukan □. → **36**
- **Sources:** 1 — e.g. 2019-FIN-G03-A-Q15

### `system-pairwise-sums` — Pairwise-Sum System / Sistem Jumlah Berpasangan
- **Grades:** G3 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Given the three pairwise sums of three unknown quantities, add all three to get twice the grand total, halve it, then subtract the opposite pair-sum to isolate the requested quantity.
- **Parameterization:** three unknowns (R, B, Y) with chosen positive-integer values; emit the three pairwise sums R+B, B+Y, Y+R; `query` = one unknown. Entity sets: balloon colors (red/blue/yellow ↔ merah/biru/kuning), or fruits/animals. FIXED: three quantities, all three pair-sums given, integer answer (sum of all three even). generate(rng) picks the three values so the total is integral; render(params) writes the word problem.
- **Example (EN):** A store has 121 red-and-blue balloons, 104 blue-and-yellow balloons, and 129 yellow-and-red balloons (each count is the sum of that color pair). How many red balloons are there? → **73**
- **Contoh (ID):** Sebuah toko memiliki 121 balon merah-dan-biru, 104 balon biru-dan-kuning, dan 129 balon kuning-dan-merah (tiap angka adalah jumlah pasangan warna itu). Berapa banyak balon merah? → **73**
- **Sources:** 1 — e.g. 2019-FIN-G03-B-Q5

### `digit-fill-equation` — Digit Placement Equation / Persamaan Penempatan Digit
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Place each digit from a given pool into the equation boxes without repetition so the chained equation holds, then read the queried box (★).
- **Parameterization:** `digitPool` (a fixed set, e.g. {0,1,2,3,7,8,9}); an equation template with boxes (e.g. `□+□ = □□`, `□−□ = □★`); choose a valid assignment first, then ask for one box's digit. FIXED: each pool digit used at most once, equation must hold exactly. generate(rng) searches valid placements, picks one, queries a box, and builds plausible digit distractors; render(params) draws the boxed equation and the digit pool.
- **Example (EN):** Place 0, 1, 2, 3, 7, 8, 9 into the boxes without repetition so the equation holds: □+□ = □□, □−□ = □★. Find ★. → **7**
- **Contoh (ID):** Tempatkan 0, 1, 2, 3, 7, 8, 9 ke dalam kotak tanpa pengulangan agar persamaan berlaku: □+□ = □□, □−□ = □★. Tentukan ★. → **7**
- **Sources:** 1 — e.g. 2020-PRE-G01-B-Q8

### `flowchart-trace-eval` — Flowchart Trace & Evaluate / Telusuri & Evaluasi Diagram Alir
- **Grades:** G2 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Feed the given inputs through the flowchart, evaluate the decision branch (the condition is true or false), apply the chosen formula, and output the result.
- **Parameterization:** `inputs` (A, B in 1..100), `condition` (e.g. `A+B>k`), `trueExpr` / `falseExpr` (e.g. `A+B` vs `B−A`); choose inputs so exactly one branch fires and the output is a clean non-negative integer. FIXED: single decision node, deterministic output. generate(rng) picks A, B, threshold and both branch expressions; render(params) draws the input → decision → output flowchart.
- **Example (EN):** Follow the flowchart. Input A=65, B=80. If A+B>150 then C=A+B, else C=B−A. Output C. → **15**
- **Contoh (ID):** Ikuti diagram alir. Masukan A=65, B=80. Jika A+B>150 maka C=A+B, jika tidak C=B−A. Keluarkan C. → **15**
- **Sources:** 1 — e.g. 2022-FIN-G02-B-Q1

### `shape-overlay-max-sum` — Shape-Overlay Max Sum / Jumlah Maksimum Tumpang Bentuk
- **Grades:** G2 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Slide and rotate a fixed polyomino piece over a number grid; over every legal placement and orientation, sum the covered cells and report the maximum total.
- **Parameterization:** `grid` (m×n of small integers, e.g. 4×4 values 1..20), `piece` (a polyomino covering c cells, e.g. T-tetromino, c=4), `orientations` (the piece's rotations). FIXED: piece shape and cell count, must lie fully inside grid. generate(rng) fills the grid, enumerates all placements×rotations, takes the max; render(params) draws the grid and the piece. Answer is the max sum.
- **Example (EN):** Rotate the T-shaped 4-cell piece freely and place it on the number grid. Find the maximum sum of the four covered squares. → **148**
- **Contoh (ID):** Putar potongan berbentuk T (4 sel) sebebasnya dan letakkan pada petak angka. Tentukan jumlah maksimum dari empat kotak yang tertutup. → **148**
- **Sources:** 1 — e.g. 2022-FIN-G02-B-Q10

### `card-match-deduction` — Card-Match Deduction / Deduksi Pencocokan Kartu
- **Grades:** G2 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Trace the turn-by-turn card-passing game (a player draws from a neighbor; equal-numbered pairs are discarded) from the shown starting hands to determine how many cards a named player holds at the end.
- **Parameterization:** `players` (4), `startingHands` (a deck plus one extra "Jack" so exactly one card is unmatchable), `passOrder` (each takes from the next neighbor), `query` = a named player's final count. FIXED: matched pairs always discarded, one odd card remains. generate(rng) deals hands with a deterministic pairing structure, simulates passes, reads the queried final count; render(params) shows each player's starting hand.
- **Example (EN):** A deck plus one extra Jack is dealt to 4 players. On each turn a player draws one card from the neighbor beside them; if the drawn card matches a held card by number, both are discarded. From the shown hands, how many cards does Danny have at the end? → **5**
- **Contoh (ID):** Satu set kartu ditambah satu Jack ekstra dibagikan ke 4 pemain. Tiap giliran, seorang pemain mengambil satu kartu dari tetangga di sebelahnya; jika kartu yang diambil cocok angkanya dengan kartu yang dipegang, keduanya dibuang. Dari tangan yang ditunjukkan, berapa kartu yang dimiliki Danny di akhir? → **5**
- **Sources:** 1 — e.g. 2022-FIN-G02-B-Q6

## CNT — Counting & Combinatorics

### `count-objects` — Count the objects / Hitung jumlah benda
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 46 · **Illustration:** needed · **Status:** built
- **Solution method:** Count (or, at higher grades, estimate) the number of pictured items of one kind and report the total.
- **Parameterization:** VARY the entity (bananas/pisang, roses/mawar, cylinders/silinder, letters like `h`) and its true count `n`; for exact mode `n ∈ 5..20` (G0–G1), for estimate mode round counts `n ∈ {20,30,50,70}` (G2–G3). Distractors are `n±1` (exact) or neighbouring round numbers (estimate). FIXED: single-kind tally, one figure, four MC options. Maps to `paramsSchema { entity, count, mode }` + `generate(rng)` choosing entity+count + `render(params)` emitting prompt + render-spec for the figure.
- **Example (EN):** Look at the picture. How many bananas are there? → **17**
- **Contoh (ID):** Lihat gambar. Ada berapa banyak pisang? → **17**
- **Sources:** 46 — e.g. 2020-PRE-G00-A-Q1, 2019-FIN-G01-A-Q1, 2020-FIN-G02-A-Q10, 2019-PRE-G01-A-Q10

### `count-shapes-in-figure` — Count shapes of all sizes / Hitung bangun datar segala ukuran
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 25 · **Illustration:** needed · **Status:** seed
- **Solution method:** Enumerate every instance of one shape type (triangles or squares) in a subdivided figure, counting composite/overlapping shapes of all sizes, not just the smallest cells.
- **Parameterization:** VARY shape type (`triangle`/segitiga, `square`/persegi) and the subdivision template that fixes the answer `n` (e.g. a 3×3 grid of unit squares yields 14 squares; a subdivided trapezoid yields 8–10 triangles); `n ∈ 8..18`. Answer type both (fill_in for G1–G3, MC with distractors `n±1, n+2` for G0). FIXED: one shape kind per item, count includes composites. Maps to `paramsSchema { shapeType, templateId }` + `generate(rng)` picking a precomputed template whose count is known + `render(params)` drawing the figure.
- **Example (EN):** As in the figure on the right, how many squares of different sizes are there? → **14**
- **Contoh (ID):** Seperti pada gambar di kanan, ada berapa banyak persegi dengan berbagai ukuran? → **14**
- **Sources:** 25 — e.g. 2019-FIN-G01-B-Q2, 2019-FIN-G02-B-Q2, 2019-PRE-G00-B-Q10, 2019-PRE-G01-B-Q6

### `combination-product-sum` — Pick numbers to hit a target / Pilih bilangan untuk capai target
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 10 · **Illustration:** not needed · **Status:** seed
- **Solution method:** From a given set of numbers, search subsets/pairs satisfying an arithmetic target (sum, product, or sum-of-dots) and report either how many qualify or a derived value.
- **Parameterization:** VARY the number set `S` (5–9 cards, values 1..30), the subset size `k` (2, 3, or 6), and the target `T` plus the output mode (count-of-ways, difference of the matching pair, or concatenate matches small-to-large). G1 uses `k=2..3` with small sums (`T≤20`); G2–G3 use `k=6, T≈62` or dice-triples summing to 10. FIXED: exhaustive subset search over a finite set, unordered combinations counted once. Maps to `paramsSchema { numbers, k, target, mode }` + `generate(rng)` rejection-sampling a set with a known answer count + `render(params)`.
- **Example (EN):** From the cards 1, 2, 3, 6, 7, 12, 14, 20, 26, take 6 cards whose sum is 62. How many ways are there? → **4**
- **Contoh (ID):** Dari kartu 1, 2, 3, 6, 7, 12, 14, 20, 26, ambil 6 kartu yang jumlahnya 62. Ada berapa cara? → **4**
- **Sources:** 10 — e.g. 2020-FIN-G02-B-Q9, 2020-FIN-G03-B-Q6, 2019-PRE-G01-A-Q9, 2023-FIN-G02-A-Q8

### `minimum-swaps-sort` — Fewest adjacent swaps to sort / Tukar terdekat paling sedikit untuk urut
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 7 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Count the inversions in the starting sequence — the minimum number of adjacent swaps that sorts it into ascending order.
- **Parameterization:** VARY the permutation length `L ∈ 6..10` and the shuffled start order (a permutation of `1..L`); the answer is its inversion count, kept in `4..12`. Themes: numbered flags/bendera, number cards/kartu angka. Answer type both (MC with distractors `ans±1, ans±2` for G1–G2, fill_in for some G1–G3). FIXED: only adjacent swaps allowed, target is ascending order. Maps to `paramsSchema { theme, order }` + `generate(rng)` sampling a permutation then computing inversions + `render(params)`.
- **Example (EN):** Number cards read 2 1 5 4 3 6. Each step swaps only two adjacent cards. What is the least number of swaps to arrange them in ascending order? → **5**
- **Contoh (ID):** Kartu angka tersusun 2 1 5 4 3 6. Setiap langkah hanya menukar dua kartu yang bersebelahan. Paling sedikit berapa kali tukar agar tersusun naik? → **5**
- **Sources:** 7 — e.g. 2023-PRE-G01-B-Q7, 2024-PRE-G01-B-Q5, 2024-PRE-G02-B-Q6, 2023-PRE-G02-B-Q5

### `how-many-ways-subsequence` — Count arrangements with a constraint / Hitung susunan dengan syarat
- **Grades:** G3 · **Answer:** both · **Source questions:** 3 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Count constrained selections/arrangements — order-preserving subsequences spelling a word, constrained-digit numbers, or pairwise round-robin matchups — via the multiplication/combination principle.
- **Parameterization:** VARY the sub-type: (a) subsequences of a fixed string spelling a 3-letter word (e.g. W-M-I in WORLDMATHEMATICSINVITATIONAL → 8); (b) k-digit numbers from a digit set with a parity/no-repeat rule (digits from {5,6,7,8}, even, no repeat → 12); (c) round-robin games among `m` teams = C(m,2) (4 teams → 6). FIXED: each answer is a deterministic count from the given constraint. Maps to `paramsSchema { variant, payload }` + `generate(rng)` choosing a variant with known answer + `render(params)`.
- **Example (EN):** How many different 3-digit even numbers can be formed using the digits 5, 6, 7, 8 without repetition? → **12**
- **Contoh (ID):** Ada berapa bilangan tiga angka genap berbeda yang dapat dibentuk dari angka 5, 6, 7, 8 tanpa pengulangan? → **12**
- **Sources:** 3 — e.g. 2019-PRE-G03-B-Q3, 2025-FIN-G03-B-Q7, 2025-PRE-G03-A-Q8

### `remove-to-keep-one-kind` — Remove all but one kind / Buang sampai sisa satu jenis
- **Grades:** G1–G2 · **Answer:** multiple_choice · **Source questions:** 2 · **Illustration:** needed · **Status:** seed
- **Solution method:** To keep only one kind, keep the most numerous kind and remove the rest, so the answer is (total) − (largest single count).
- **Parameterization:** VARY the kinds (4–6 fruits: apple/apel, banana/pisang, orange/jeruk, grape/anggur, pear/pir, strawberry/stroberi) and each kind's count (`2..6`); answer = total − max, kept in `5..13`. Distractors are `ans±1, ans±2`. FIXED: keep exactly the single largest group, picture supplies the counts. Maps to `paramsSchema { counts: Record<fruit, number> }` + `generate(rng)` assigning counts + `render(params)` drawing the fruit rows.
- **Example (EN):** There are 4 kinds of fruit shown (5 apples, 3 bananas, 2 oranges, 1 pear). If only one kind is kept, at least how many fruits must be taken away? → **6**
- **Contoh (ID):** Ada 4 jenis buah pada gambar (5 apel, 3 pisang, 2 jeruk, 1 pir). Jika hanya satu jenis yang disisakan, paling sedikit berapa buah yang harus dibuang? → **6**
- **Sources:** 2 — 2024-PRE-G01-B-Q3, 2024-PRE-G02-B-Q3

### `count-compositions` — Count ordered sums / Hitung jumlah berurutan
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Count all ways to write a target as an ordered sum of positive integers (including the single-term sum), giving 2^(N−1) compositions of N.
- **Parameterization:** VARY the target `N ∈ 4..7`; the answer is `2^(N-1)` (N=6 → 32 in full convention, but the WMI sample uses an unordered/limited scheme giving 10, so the template stores a fixed `(N, scheme, answer)` table). Provide a worked example for the smaller value. MC distractors `ans±1, ans±2`. FIXED: ordered partitions of N, example shown. Maps to `paramsSchema { target, scheme }` + `generate(rng)` selecting a `(target,scheme)` whose count is precomputed + `render(params)`.
- **Example (EN):** 4 can be written as 1+3, 1+1+2, 2+2, 1+1+1+1, 4. Following the same scheme, in how many ways can 6 be written? → **10**
- **Contoh (ID):** 4 dapat ditulis sebagai 1+3, 1+1+2, 2+2, 1+1+1+1, 4. Dengan cara yang sama, ada berapa cara menuliskan 6? → **10**
- **Sources:** 1 — 2019-PRE-G02-B-Q7

### `count-paths-number-grid` — Count counting-paths through a grid / Hitung lintasan menghitung pada kisi
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Count the distinct paths that step through cells 1,2,…,K moving only horizontally or vertically between consecutive numbers, then exclude the one example path shown.
- **Parameterization:** VARY the grid layout and the number range `K` (here 1..10) that fixes the total path count `P`; the answer is `P − 1` (other ways besides the shown example). MC distractors are neighbours of the answer (`ans±1, ans±2`). FIXED: orthogonal steps only, consecutive-number ordering, one path excluded. Maps to `paramsSchema { layoutId }` + `generate(rng)` choosing a layout whose path count is precomputed + `render(params)` drawing the numbered grid plus the example path.
- **Example (EN):** Count from 1, 2, 3, …, 10 moving only vertically or horizontally between consecutive numbers. The figure shows one such way; how many other ways are there? → **7**
- **Contoh (ID):** Hitung dari 1, 2, 3, …, 10 dengan hanya bergerak tegak atau mendatar antar bilangan berurutan. Gambar menunjukkan satu cara; ada berapa cara lainnya? → **7**
- **Sources:** 1 — 2020-PRE-G01-B-Q10

### `pigeonhole-guarantee` — Pigeonhole worst-case guarantee / Jaminan terburuk asas sarang merpati
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Apply worst-case (pigeonhole) reasoning: with `C` colors and `m` items drawn per try, find the fewest tries that force a matching set.
- **Parameterization:** VARY the number of colors/kinds `C ∈ 5..10`, items drawn per attempt `m ∈ {2}`, and goal "2 of the same color"; answer = `C + 1` (one extra try after the worst case of all-different). Context: candies/permen, marbles/kelereng. MC distractors `ans±1, ans−2`. FIXED: worst-case guarantee, draw-then-check. Maps to `paramsSchema { colors, drawSize }` + `generate(rng)` picking `colors` + `render(params)`.
- **Example (EN):** A jar holds candies of 7 different colors. Taking 2 candies each time with eyes closed, at least how many times are needed to be sure of getting 2 candies of the same color? → **4**
- **Contoh (ID):** Sebuah toples berisi permen dengan 7 warna berbeda. Mengambil 2 permen setiap kali dengan mata tertutup, paling sedikit berapa kali agar pasti mendapat 2 permen berwarna sama? → **4**
- **Sources:** 1 — 2020-PRE-G01-B-Q6

## GEO — Geometry & Spatial

### `perimeter-area-composed` — Composed Figures on a Unit Grid / Bangun Gabungan pada Petak Satuan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 52 · **Illustration:** needed · **Status:** seed
- **Solution method:** Given a unit-square value (area or side), count the unit squares (or unit edges) in a composed figure and multiply/add to get the target area, perimeter, or count.
- **Parameterization:** VARIES — `mode` (`area` | `unit-squares` | `matchstick-count`); `unitValue` (1–5); grid figure as a set of filled cells on a `rows×cols` grid (rows,cols 2–5), `shadedCount` derived from the cell set; for matchstick mode `nShapes` (2–6 squares/triangles) with shared-edge minimization. FIXED — squares are unit-equal; "highest enclosing/least count" wording. Entity: `square / persegi`, `matchstick / batang korek api`. Maps to a paramsSchema with a `cells: [r,c][]` array + `unitValue`, generate places cells & computes answer, render draws the grid.
- **Example (EN):** The area of each small square is 1 cm². The shaded region covers 10 small squares. Find the area of the shaded region in cm². → **10**
- **Contoh (ID):** Luas setiap persegi kecil adalah 1 cm². Daerah berarsir menutupi 10 persegi kecil. Tentukan luas daerah berarsir dalam cm². → **10**
- **Sources:** 52 — e.g. 2019-FIN-G03-A-Q11, 2021-PRE-G00-B-Q10, 2021-PRE-G01-A-Q14, 2025-PRE-G01-A-Q13

### `same-figure-identify` — Identify the Matching Figure / Mengenali Gambar yang Sama
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 33 · **Illustration:** needed · **Status:** seed
- **Solution method:** Compare a reference figure against several option figures (possibly rotated) and pick the one that is identical (or the one that is NOT identical), by matching counts/positions of sub-parts.
- **Parameterization:** VARIES — `targetKind` (`match` | `odd-one-out`); reference figure built from a small feature vector (e.g. circle counts top/bottom 1–4, cube-stack arrangement, umbrella spokes 4–8); `nOptions` (3–4); allowed transform = rotation only (no flip); one option is the true match, distractors differ by one feature. FIXED — answer is a figure index. Entity sets: `ship / kapal`, `umbrella / payung`, `cube structure / susunan kubus`, `house / rumah`. Maps to schema with `reference` feature object + `options: feature[]`, generate perturbs one feature per distractor.
- **Example (EN):** The picture shows the top view of an umbrella with 6 spokes. Which option below shows a different umbrella? → **D**
- **Contoh (ID):** Gambar menunjukkan tampak atas sebuah payung dengan 6 jari-jari. Pilihan mana di bawah ini yang menunjukkan payung yang berbeda? → **D**
- **Sources:** 33 — e.g. 2019-FIN-G00-A-Q6, 2021-PRE-G02-B-Q5, 2019-PRE-G03-B-Q5, 2020-FIN-G01-A-Q14

### `piece-assembly` — Assemble the Pieces / Menyusun Potongan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 30 · **Illustration:** needed · **Status:** seed
- **Solution method:** Mentally place a set of polyomino-style pieces (rotation only, no flip) into a target outline, then answer which piece covers a marked cell, which piece is a valid cut part, or how many distinct tilings exist.
- **Parameterization:** VARIES — `mode` (`which-piece-holds-marker` | `count-distinct-tilings`); target shape as a cell set on a `rows×cols` grid (e.g. 3×3); piece inventory (e.g. one 1×1 + four 2×1 dominoes); marker cell `[r,c]`; `allowFlip = false`. FIXED — rotations counted as same for tiling counts. Entity: `piece / potongan`, marker `dot / titik`, `flower / bunga`. Maps to schema with `pieces` and `target` cell sets + optional `marker`; generate solves placement, render draws target + candidate pieces.
- **Example (EN):** How many different 3×3 squares can be formed with one 1×1 square and four 2×1 rectangles? (Squares that look the same after rotation count as one.) → **6**
- **Contoh (ID):** Ada berapa banyak persegi 3×3 berbeda yang dapat dibentuk dari satu persegi 1×1 dan empat persegi panjang 2×1? (Persegi yang tampak sama setelah diputar dianggap satu.) → **6**
- **Sources:** 30 — e.g. 2022-FIN-G03-B-Q5, 2019-PRE-G02-B-Q10, 2019-PRE-G01-B-Q9, 2019-FIN-G00-A-Q10

### `block-count-3d` — Count the Stacked Cubes / Menghitung Kubus Bertumpuk
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 26 · **Illustration:** needed · **Status:** seed
- **Solution method:** Read an isometric cube stack, count all cubes including hidden ones, then either report the total or compute how many more are needed to complete a full a×a×a cube.
- **Parameterization:** VARIES — `mode` (`count-total` | `cubes-to-complete` | `which-pile-has-N`); stack defined as a heightmap over a `w×d` base (1–3 each, heights 1–3); for completion mode `cubeSize` (2 or 3) and answer = `cubeSize³ − total`; for which-pile mode `nOptions` 4 with one totaling the target. FIXED — cubes are unit, gravity-stacked (no floating). Entity: `cube / kubus`. Maps to schema with `heightmap: number[][]`; generate computes total, render draws the isometric pile.
- **Example (EN):** Some cubes are piled as shown. The pile contains 10 cubes. At least how many more cubes are needed to make a 3×3×3 cube? → **17**
- **Contoh (ID):** Beberapa kubus ditumpuk seperti pada gambar. Tumpukan berisi 10 kubus. Paling sedikit berapa kubus lagi yang diperlukan untuk membentuk kubus 3×3×3? → **17**
- **Sources:** 26 — e.g. 2019-FIN-G00-A-Q9, 2020-PRE-G01-A-Q6, 2021-FIN-G02-B-Q3, 2020-PRE-G03-B-Q5

### `length-segment-compare` — Compare / Read Lengths / Membandingkan dan Membaca Panjang
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 24 · **Illustration:** needed · **Status:** seed
- **Solution method:** Either read a length off a ruler/number line (length = end − start) or count grid steps / unit segments between two points, then compare or report it.
- **Parameterization:** VARIES — `mode` (`read-ruler` | `count-grid-steps` | `rank-lengths`); for ruler: object start (0–4) and end (3–10), answer = end − start; for grid steps: A and B cells on a grid, answer = Manhattan steps along marked path; for rank: 3–4 segment lengths, pick longest/second-longest. FIXED — units are whole numbers, ruler may not start at 0. Entity: `pencil / pensil`, `paperclip / penjepit kertas`, `route / rute`. Maps to schema with `mode` + numeric fields; generate computes the difference/count.
- **Example (EN):** Look at the figure. The pencil starts at 2 cm and ends at 7 cm on the ruler. How long is the pencil in cm? → **5**
- **Contoh (ID):** Perhatikan gambar. Pensil mulai dari 2 cm dan berakhir di 7 cm pada penggaris. Berapa panjang pensil dalam cm? → **5**
- **Sources:** 24 — e.g. 2020-PRE-G02-A-Q7, 2023-PRE-G00-A-Q3, 2019-PRE-G00-A-Q13, 2021-PRE-G03-B-Q3

### `move-rule-traversal` — Follow the Move Rule / Mengikuti Aturan Gerak
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 23 · **Illustration:** needed · **Status:** seed
- **Solution method:** Start from a given cell on a labelled grid and apply a sequence of directional moves (arrows, knight jumps, or visit-each-once rule) to find the landing cell's value, an order number, or a sum along the path.
- **Parameterization:** VARIES — `mode` (`arrow-sequence` | `knight-tour-order` | `visit-all-sum`); grid `rows×cols` (4–6) filled with icons/numbers; start cell `[r,c]`; move sequence (4–8 of ↑↓←→) or knight moves; for sum mode the path numbers add up. FIXED — moves stay in-bounds; one valid destination. Entity sets: `apple / apel`, `banana / pisang`, `strawberry / stroberi`, `carrot / wortel`, `rabbit / kelinci`, `horse / kuda`. Maps to schema with `grid`, `start`, `moves[]`; generate walks the path and reads the answer.
- **Example (EN):** A face starts at the top-left cell of a 6×6 fruit grid. Follow the arrows →↓↓→↑→→. Which fruit does it land on: apple, banana, or strawberry? → **strawberry**
- **Contoh (ID):** Sebuah wajah mulai dari sel kiri-atas pada petak buah 6×6. Ikuti panah →↓↓→↑→→. Buah apa yang dicapai: apel, pisang, atau stroberi? → **stroberi**
- **Sources:** 23 — e.g. 2019-FIN-G00-A-Q13, 2019-PRE-G02-A-Q3, 2022-FIN-G01-B-Q7, 2021-FIN-G03-B-Q9

### `maze-path-shortest` — Shortest / Counted Path Through a Maze / Lintasan Terpendek pada Labirin
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 21 · **Illustration:** needed · **Status:** seed
- **Solution method:** Trace paths through a maze, street grid, or tangled-string layout to find the shortest route (sum edge lengths), count items collected along the only/optimal path, or count how many distinct routes exist.
- **Parameterization:** VARIES — `mode` (`shortest-length` | `count-items-on-path` | `count-routes`); for shortest: weighted graph of nodes (3–6) with edge meters (5–30), answer = min total; for routes: lattice `w×h` (2–4) home→school with no backtracking, answer = C(w+h, w); for items: maze with K item icons on the traversed path. FIXED — no backtracking where stated. Entity sets: `home / rumah`, `school / sekolah`, `banana / pisang`, `monkey / monyet`. Maps to schema with a graph or lattice spec; generate runs BFS/Dijkstra or binomial count.
- **Example (EN):** A street map is a 3-by-2 grid of blocks. John walks from home to school along the streets without backtracking. How many different routes are there? → **10**
- **Contoh (ID):** Peta jalan berbentuk petak 3 kali 2 blok. John berjalan dari rumah ke sekolah menyusuri jalan tanpa berbalik arah. Ada berapa banyak rute berbeda? → **10**
- **Sources:** 21 — e.g. 2021-FIN-G03-B-Q4, 2021-PRE-G01-A-Q12, 2023-FIN-G02-B-Q10, 2020-FIN-G00-B-Q4

### `direction-orientation` — Facing & Direction / Arah dan Hadap
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 14 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Fix a person's facing from a stated cue (what is behind/in front), then derive a relative or compass direction (their left/right, or another person facing them) by 90° rotation logic.
- **Parameterization:** VARIES — `mode` (`compass-relative` | `face-to-face` | `which-number-on-side`); `facing` (N/S/E/W); query side (`left` | `right` | `back`); for face-to-face, second person faces opposite; for number layout, four numbers around the person with one parity cue fixing the facing. FIXED — standard compass, left = 90° CCW of facing. Entity sets: `blackboard / papan tulis`, `teacher / guru`, `North/South/East/West = Utara/Selatan/Timur/Barat`. Maps to schema with `facing` + `query`; generate rotates direction enum.
- **Example (EN):** The blackboard is in the east of the classroom. Teacher Sandra faces the students with the blackboard behind her. What direction is on her left? → **South**
- **Contoh (ID):** Papan tulis berada di sebelah timur kelas. Bu Sandra menghadap murid-murid dengan papan tulis di belakangnya. Arah apa yang ada di sebelah kirinya? → **Selatan**
- **Sources:** 14 — e.g. 2024-FIN-G03-A-Q3, 2024-PRE-G01-A-Q9, 2020-PRE-G02-A-Q8, 2023-FIN-G00-A-Q6

### `dice-net-fold` — Fold the Cube Net / Melipat Jaring-jaring Kubus
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 13 · **Illustration:** needed · **Status:** seed
- **Solution method:** Mentally fold a labelled cross/T net into a cube, then either pick the matching 3D cube, evaluate a sum of named faces, or identify which extra square must be removed for the net to be valid.
- **Parameterization:** VARIES — `mode` (`match-cube` | `face-sum` | `remove-extra-square`); net shape chosen from valid hexomino nets; face labels = numbers 1–6 placed on the six net cells; for sum mode a face sequence selects 4 faces to add. FIXED — exactly six faces fold into one cube; rotation only. Entity: `face / sisi`, `dot / titik`, `cube / kubus`. Maps to schema with `net: {cell:[r,c], value}[]`; generate verifies foldability and computes the sum.
- **Example (EN):** A cube net has faces numbered 1–6. After folding, which sum of four faces is correct: 2 + 3 + 4 + 6? → **2 + 3 + 4 + 6**
- **Contoh (ID):** Sebuah jaring-jaring kubus memiliki sisi bernomor 1–6. Setelah dilipat, jumlah empat sisi mana yang benar: 2 + 3 + 4 + 6? → **2 + 3 + 4 + 6**
- **Sources:** 13 — e.g. 2019-PRE-G01-B-Q4, 2022-FIN-G03-A-Q11, 2024-FIN-G01-A-Q5, 2021-PRE-G00-B-Q5

### `path-optimize-value` — Optimize Value Along a Path / Mengoptimalkan Nilai Sepanjang Lintasan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 12 · **Illustration:** needed · **Status:** seed
- **Solution method:** Find a path through a grid or weighted network that optimizes an accumulated value — cheapest fare, sum of move-numbers on a visit-each-once route, or which listed route count is wrong.
- **Parameterization:** VARIES — `mode` (`cheapest-network` | `visit-all-sum` | `wrong-route-count` | `line-hit-count`); weighted graph (nodes 4–6, edge cost 10–80) answer = min cost; visit-all grid avoiding `stones`, answer = sum of move numbers; line-hit grid where a straight arrow breaks balloons, answer = survivors. FIXED — every non-stone cell visited once in sum mode. Entity sets: `metro station / stasiun MRT`, `carrot / wortel`, `rabbit / kelinci`, `balloon / balon`, `tree / pohon`. Maps to schema with graph/grid spec; generate computes optimum.
- **Example (EN):** A rabbit must pass every square once except the stone squares, numbering them 1,2,3,4 in order to reach the carrot. Find the sum of the numbers on its way. → **32**
- **Contoh (ID):** Seekor kelinci harus melewati setiap petak satu kali kecuali petak berbatu, memberi nomor 1,2,3,4 berurutan untuk mencapai wortel. Tentukan jumlah angka di sepanjang jalannya. → **32**
- **Sources:** 12 — e.g. 2021-FIN-G01-B-Q10, 2021-FIN-G02-B-Q9, 2023-FIN-G03-A-Q8, 2021-FIN-G01-B-Q3

### `fold-result-count` — Fold-and-Cut Result / Hasil Lipat-dan-Gunting
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 8 · **Illustration:** needed · **Status:** seed
- **Solution method:** Fold a square sheet one or more times along given lines, optionally cut a hole, then determine the unfolded appearance, the resulting outline, or the top-to-bottom stacking order of labelled parts.
- **Parameterization:** VARIES — `mode` (`unfold-holes` | `resulting-shape` | `stacking-order`); `foldLines` (1–2: vertical and/or horizontal); for holes, cut position(s) reflected across each fold; for stacking order, four numbered quadrants whose layer order is read after two folds. FIXED — folds halve the sheet; cuts mirror across fold axes. Entity: `paper / kertas`, `fold / lipatan`, `hole / lubang`. Maps to schema with `foldLines[]` + `cuts[]`; generate reflects cuts and emits the unfolded pattern or order.
- **Example (EN):** A square paper has four numbered parts. Fold it in half vertically, then in half horizontally. List the four numbers from the top layer to the bottom layer. → **3124**
- **Contoh (ID):** Selembar kertas persegi memiliki empat bagian bernomor. Lipat menjadi dua secara vertikal, lalu menjadi dua secara horizontal. Tuliskan keempat angka dari lapisan teratas ke terbawah. → **3124**
- **Sources:** 8 — e.g. 2023-FIN-G01-B-Q3, 2024-FIN-G00-A-Q11, 2021-PRE-G01-B-Q2, 2024-PRE-G03-A-Q8

### `dice-opposite-faces` — Opposite Faces Sum to 7 / Sisi Berhadapan Berjumlah 7
- **Grades:** G1–G3 · **Answer:** both · **Source questions:** 7 · **Illustration:** needed · **Status:** seed
- **Solution method:** Use the rule that opposite faces of a die sum to 7 (or a constant): from visible top/side pips deduce the hidden/down faces and total them, or solve two visibility-sum equations for the bottom face.
- **Parameterization:** VARIES — `mode` (`sum-down-faces` | `deduce-bottom` | `unreachable-sums`); `oppositeSum` (7 by default); `nDice` (1–4); visible faces per die (top/front/right pips 1–6); for deduce-bottom, two equations (top+front+right, top+back+left) given. FIXED — opposite pairs sum to `oppositeSum`; bottom = 7 − top. Entity: `die / dadu`, `face / sisi`. Maps to schema with per-die visible-pip object + `oppositeSum`; generate applies the complement arithmetic.
- **Example (EN):** Numbers 1–6 are on a die; opposite faces sum to 7. On the table, top+front+right = 14 and top+back+left = 12. What number is on the bottom face touching the table? → **1**
- **Contoh (ID):** Angka 1–6 ada pada sebuah dadu; sisi yang berhadapan berjumlah 7. Di atas meja, atas+depan+kanan = 14 dan atas+belakang+kiri = 12. Angka berapa pada sisi bawah yang menyentuh meja? → **1**
- **Sources:** 7 — e.g. 2025-FIN-G03-A-Q12, 2020-PRE-G01-B-Q9, 2019-FIN-G03-B-Q8, 2021-PRE-G03-B-Q7

### `symmetry-count` — Count Symmetry / Menghitung Simetri
- **Grades:** G2–G3 · **Answer:** both · **Source questions:** 5 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Count items having a stated symmetry property — letters with a vertical line of symmetry, figures split into equal halves, or the number of ways to shade cells so a figure stays line-symmetric.
- **Parameterization:** VARIES — `mode` (`letters-vertical-symmetry` | `count-equal-divided` | `ways-keep-symmetry`); for letters, a word from a curated set whose symmetric letters are known (A,H,I,M,O,T,U,V,W,X,Y); for ways mode, a small triangle grid with K pre-shaded and 2 more to add. FIXED — vertical mirror axis; rotated-equal configs counted once. Entity: `letter / huruf`, `triangle / segitiga`, `square / persegi`. Maps to schema with `word` or grid + shaded set; generate enumerates symmetric completions.
- **Example (EN):** In the word "SCHOOL", how many letters have a vertical line of symmetry? → **2**
- **Contoh (ID):** Pada kata "SCHOOL", ada berapa huruf yang memiliki sumbu simetri vertikal? → **2**
- **Sources:** 5 — e.g. 2020-FIN-G02-A-Q2, 2024-FIN-G03-A-Q12, 2021-PRE-G03-B-Q8, 2025-FIN-G03-B-Q2

### `shape-perimeter-square` — Perimeter of a Square / Keliling Persegi
- **Grades:** G2–G3 · **Answer:** multiple_choice · **Source questions:** 3 · **Illustration:** not needed · **Status:** built
- **Solution method:** Apply perimeter = 4 × side (and side = perimeter ÷ 4) for squares, optionally comparing against another shape's perimeter or accounting for leftover rope.
- **Parameterization:** VARIES — `mode` (`side-to-perimeter` | `perimeter-to-side` | `compare-shapes`); `side` (3–50) or total rope `length` (50–200) with leftover (0–40); compare-mode pairs a square (side 3–8) against a triangle (side 3–8). FIXED — perimeter formula 4×side; regular shapes only. Entity: `square / persegi`, `rope / tali`, `thread / benang`. Maps to schema with `mode` + numeric fields; generate computes perimeter/side and the difference for compare-mode.
- **Example (EN):** A 192 m rope is used to form a square, with 24 m of rope left over. Find the side length of the square in m. → **42**
- **Contoh (ID):** Tali sepanjang 192 m digunakan untuk membentuk sebuah persegi, dengan sisa tali 24 m. Tentukan panjang sisi persegi itu dalam m. → **42**
- **Sources:** 3 — e.g. 2019-FIN-G03-A-Q4, 2021-PRE-G03-A-Q6, 2020-PRE-G02-A-Q3

### `spinning-states` — Spinning / Rolling States / Keadaan Berputar dan Menggelinding
- **Grades:** G0, G2–G3 · **Answer:** multiple_choice · **Source questions:** 3 · **Illustration:** needed · **Status:** seed
- **Solution method:** Given a disc/wheel/coin and a rotation cue, determine which option shows a possible (or impossible) appearance during spinning, reasoning about how marked positions move under rotation.
- **Parameterization:** VARIES — `targetKind` (`correct-state` | `impossible-state`); object type (`disc` | `coin` | `belt-wheel`); markers as colored positions around a circle (2–4); rotation step in degrees (90/120/180); for two-coin case, two discs spun at equal speed. FIXED — equal rotation speed; markers keep relative order under rotation. Entity: `disc / cakram`, `coin / koin`, `wheel / roda`. Maps to schema with marker positions + rotation; generate rotates positions and flags impossible options.
- **Example (EN):** Edwards spins two identical coins at the same speed simultaneously. Which option will NOT happen during the spinning? → **D**
- **Contoh (ID):** Edwards memutar dua koin yang identik dengan kecepatan sama secara bersamaan. Pilihan mana yang TIDAK akan terjadi selama proses berputar? → **D**
- **Sources:** 3 — e.g. 2025-FIN-G03-A-Q13, 2024-FIN-G00-A-Q12, 2019-PRE-G02-A-Q11

### `block-stability` — Block Stability / Kestabilan Tumpukan Balok
- **Grades:** G1–G2 · **Answer:** both · **Source questions:** 3 · **Illustration:** needed · **Status:** seed
- **Solution method:** Judge which stacked-block arrangement is most likely to topple (worst base/centre-of-mass support), or maximize tower height under a stacking rule (e.g. nothing may sit on a sphere).
- **Parameterization:** VARIES — `mode` (`which-falls` | `max-height`); for which-falls, `nOptions` 4 each a stack with an overhang/offset descriptor; for max-height, a repeating block sequence (`cube / kubus`, `cylinder / silinder`, `sphere / bola`) with the rule "nothing stacks on a sphere", answer = longest legal run. FIXED — gravity rules; sphere is a dead-end top. Entity sets: `cube / kubus`, `cylinder / silinder`, `sphere / bola`. Maps to schema with stack descriptors or the cyclic sequence; generate scores stability or simulates the height rule.
- **Example (EN):** Blocks come in the repeating order cube, cylinder, sphere, … Anything may sit on a cube or cylinder but nothing may sit on a sphere. Stacking as high as possible, how many blocks are used at most? → **8**
- **Contoh (ID):** Balok datang dengan urutan berulang kubus, silinder, bola, … Apa pun boleh diletakkan di atas kubus atau silinder tetapi tidak boleh di atas bola. Bila ditumpuk setinggi mungkin, paling banyak berapa balok yang dipakai? → **8**
- **Sources:** 3 — e.g. 2024-FIN-G01-B-Q7, 2024-PRE-G01-A-Q7, 2024-PRE-G02-A-Q7

### `fraction-of-region` — Fraction of a Region / Pecahan dari Suatu Daerah
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 2 · **Illustration:** needed · **Status:** new
- **Solution method:** Count shaded equal parts over total equal parts of a divided region to express the shaded portion as a fraction, or pick the figure whose shaded area equals a target fraction.
- **Parameterization:** VARIES — `mode` (`read-fraction` | `match-figure`); region divided into `total` equal parts (denominators 2,3,9 from samples; allow 2–12), `shaded` parts (1..total−1); answer fraction `shaded/total` in lowest terms; for match-figure, a target fraction and 4 candidate partitions. FIXED — all parts equal area. Entity: `bar / batang`, `shaded region / daerah berarsir`. Maps to schema with `total` + `shaded`; generate reduces the fraction, render draws the partitioned bar.
- **Example (EN):** A bar is divided into 9 equal parts and 5 of them are shaded. What fraction does the shaded region represent? → **5/9**
- **Contoh (ID):** Sebuah batang dibagi menjadi 9 bagian sama besar dan 5 di antaranya diarsir. Pecahan berapa yang dinyatakan oleh daerah berarsir? → **5/9**
- **Sources:** 2 — e.g. 2023-PRE-G03-A-Q4, 2019-FIN-G03-A-Q2

### `dial-lock-read` — Read the Dial Lock / Membaca Kunci Putar
- **Grades:** G1–G2 · **Answer:** fill_in · **Source questions:** 2 · **Illustration:** needed · **Status:** new
- **Solution method:** Trace a dial hand's successive clockwise/counter-clockwise rotations across a 0–9 ring, reading off the digit at each stop to spell the multi-digit code.
- **Parameterization:** VARIES — `digits` count (`codeLen` 4–5); per-step rotation `direction` (`cw` | `ccw`) and `steps` (0–9) over a 10-position ring labelled 0–9; starting position (0–9). FIXED — ring has digits 0–9 evenly spaced; landing digit per step forms the code. Entity: `dial / cakram angka`, `hand / jarum`, `password / kata sandi`. Maps to schema with `start` + `moves: {dir, steps}[]`; generate walks the ring modulo 10 to produce the code string.
- **Example (EN):** A dial lock's hand starts at 0 and turns to spell a 5-digit password by successive clockwise/counter-clockwise turns. Reading the stops gives the code. Find the password. → **93128**
- **Contoh (ID):** Jarum sebuah kunci putar mulai dari 0 dan berputar untuk mengeja kata sandi 5 digit melalui putaran searah/berlawanan jarum jam berturut-turut. Membaca tiap perhentian memberi kodenya. Tentukan kata sandinya. → **93128**
- **Sources:** 2 — e.g. 2022-FIN-G01-B-Q6, 2022-FIN-G02-B-Q5

### `line-of-sight-hit` — Line-of-Sight Hits / Sasaran pada Garis Pandang
- **Grades:** G0 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Project straight arrow lines across a layout of targets and mark/count which targets lie on the line(s); a target on two lines scores double.
- **Parameterization:** VARIES — `nTargets` (5–9) placed at grid points; `nArrows` (1–2) each a straight ray (horizontal/diagonal) defined by origin + direction; answer = count (or set) of targets on a line, with overlap on both lines highlighted. FIXED — rays are straight; a target counts if its point lies on the ray. Entity: `balloon / balon`, `arrow / panah`. Maps to schema with `targets:[r,c][]` + `arrows:{from,dir}[]`; generate tests point-on-line membership.
- **Example (EN):** Seven balloons are arranged in a pattern and two arrows fly in straight lines. How many balloons are pierced by both arrows? → **2**
- **Contoh (ID):** Tujuh balon disusun dalam suatu pola dan dua panah melesat dalam garis lurus. Berapa banyak balon yang tertembus oleh kedua panah? → **2**
- **Sources:** 1 — e.g. 2019-FIN-G00-B-Q2

### `projection-view-3d` — 2D View of a 3D Solid / Tampak 2D dari Bangun 3D
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Look at a stacked-cube solid from a stated arrow direction and pick the 2D silhouette (the set of visible unit squares projected onto that plane).
- **Parameterization:** VARIES — solid as a heightmap over a `w×d` base (1–3 each, heights 1–3); `viewDir` (front | side | top); `nOptions` 4 silhouettes with one correct projection; distractors are rotated/altered silhouettes. FIXED — projection collapses the chosen axis to max extent. Entity: `cube / kubus`, `view / tampak`. Maps to schema with `heightmap` + `viewDir`; generate computes the true silhouette and builds distractor outlines.
- **Example (EN):** Looking at the stacked cubes from the direction of the arrow, which 2D figure will you see? → **the L-shaped five-square silhouette**
- **Contoh (ID):** Melihat susunan kubus dari arah panah, gambar 2D mana yang akan kamu lihat? → **siluet lima persegi berbentuk huruf L**
- **Sources:** 1 — e.g. 2019-PRE-G02-A-Q12

### `layered-sheets-order` — Order of Layered Sheets / Urutan Lembar Bertumpuk
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** From a top-down view of overlapping numbered sheets, work out which sheet sits at a given depth from the bottom by reading which sheets are covered by which.
- **Parameterization:** VARIES — `nSheets` (4–7) each a numbered rectangle with a stacking order; query `depth` (e.g. "3rd from the bottom"); overlaps determined by which sheet hides which in the top view. FIXED — opaque sheets; one consistent stacking order. Entity: `paper / kertas`, `sheet / lembar`. Maps to schema with `order: number[]` (bottom→top) + `query`; generate returns the sheet at the requested depth.
- **Example (EN):** Look from the top at the overlapping numbered papers. Which number is on the third piece of paper from the bottom? → **6**
- **Contoh (ID):** Lihat dari atas tumpukan kertas bernomor yang saling menumpuk. Angka berapa yang ada pada lembar kertas ketiga dari bawah? → **6**
- **Sources:** 1 — e.g. 2022-FIN-G02-A-Q3

## MEA — Measurement & Time

### `clock-time-after` — Elapsed clock time / Waktu jam setelah berlalu
- **Grades:** G1–G3 · **Answer:** multiple_choice · **Source questions:** 26 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Add a duration in minutes to a start time, carrying minutes into hours when minutes ≥ 60 (`endMin = startMin + add`; carry 60 → +1 hr).
- **Parameterization:** Params: `startHour` 6–11, `startMin` 0–59, `addMin` 10–55. FIXED: 12-hour clock, a.m. context, minute carry. Distractors: swap hour/min digits, forget the carry, add to the wrong field. Entity set of named travelers — EN `["Vivian","Jenny","Tom","Mia"]` / ID `["Vivian","Jenny","Tom","Mia"]` — plus a destination noun (`school`/`sekolah`, `library`/`perpustakaan`). Render formats both as `H:MM` zero-padded.
- **Example (EN):** Vivian leaves home for school at 7:42 a.m. She arrives 35 minutes later. What time does she arrive? → **8:17**
- **Contoh (ID):** Vivian berangkat dari rumah ke sekolah pukul 7:42 pagi. Ia tiba 35 menit kemudian. Pukul berapa ia tiba? → **8:17**
- **Sources:** 26 — e.g. 2020-FIN-G03-A-Q9, 2020-PRE-G03-A-Q10, 2020-FIN-G02-A-Q11, 2019-FIN-G02-A-Q8

### `length-sum-compare` — Length sum & comparison / Penjumlahan & perbandingan panjang
- **Grades:** G1–G3 · **Answer:** multiple_choice · **Source questions:** 11 · **Illustration:** needed · **Status:** seed
- **Solution method:** Read two or more measured lengths, then combine by sum (with overlap subtraction) or take longest − shortest; ordering variant sorts the values.
- **Parameterization:** Mode `"overlap" | "difference"`. Overlap: two equal ribbons `len` 40–80 cm joined with `overlap` 10–30 cm → `2*len − overlap`. Difference: `longest`/`shortest` 2–8 grid units → `longest − shortest`. FIXED: same unit within a problem. Entity set of measured objects — EN `["ribbon","rope","stick","string"]` / ID `["pita","tali","tongkat","benang"]`. Distractors: `2*len` (forget overlap), `len+overlap`, off-by-one units.
- **Example (EN):** Two ribbons are each 64 cm long. They are joined with an 18 cm overlap. How long is the new ribbon? → **110 cm**
- **Contoh (ID):** Dua pita masing-masing panjangnya 64 cm. Keduanya disambung dengan tumpang-tindih 18 cm. Berapa panjang pita baru? → **110 cm**
- **Sources:** 11 — e.g. 2021-PRE-G03-A-Q12, 2020-PRE-G01-A-Q9, 2021-FIN-G01-A-Q10, 2023-PRE-G02-A-Q7

### `unit-conversion` — Unit conversion & combine / Konversi & gabung satuan
- **Grades:** G2–G3 · **Answer:** multiple_choice · **Source questions:** 6 · **Illustration:** not needed · **Status:** seed
- **Solution method:** Convert mixed/compound measures to one base unit (m→cm, L→ml, min→hr), then combine via the embedded sum or multiplication and read off the value.
- **Parameterization:** Dimension `"length" | "volume" | "time"` with factors FIXED (1 m = 100 cm, 1 L = 1000 ml, 1 hr = 60 min). Length: `meters` 1–4 + `cm` 0–90 → cm. Volume: bottle `L` 1 + `ml` 0–500, `bottles` 2–4, `packs` 2–3 → total ml. Time: `perItem` 3–6 min × `count` 100–250 → hours. Distractors: wrong factor (×10), drop the remainder, mix units. Entity nouns bilingual — `juice`/`jus`, `blackboard`/`papan tulis`, `cigarettes`/`rokok`.
- **Example (EN):** Mom buys 3 packs of juice; each pack has 4 bottles and each bottle holds 1 L 50 ml. How many ml of juice in total? → **12600 ml**
- **Contoh (ID):** Ibu membeli 3 dus jus; tiap dus berisi 4 botol dan tiap botol 1 L 50 ml. Berapa ml jus seluruhnya? → **12600 ml**
- **Sources:** 6 — e.g. 2023-PRE-G03-A-Q6, 2019-FIN-G02-A-Q12, 2022-PRE-G03-A-Q2, 2024-FIN-G03-A-Q7

### `clock-hand-rotation` — Clock-face transformation / Transformasi tampilan jam
- **Grades:** G0–G2 · **Answer:** multiple_choice · **Source questions:** 6 · **Illustration:** needed · **Status:** seed
- **Solution method:** Given a clock/dial appearance and a transform (mirror, rotation, or advance), pick the option whose hand positions match the transformed face.
- **Parameterization:** Transform `"mirror" | "rotate"`. Base time `hour` 1–12, `min` ∈ {0,30}. Mirror: reflected reading = `(12 − hour)` adjusted, ask which is closest to a target hour. Rotate: advance dial by `seats`/`steps` and pick new layout. FIXED: 4–5 image options (answer + distractors are clock-face figures). Because options are pictures, render emits the correct-face spec plus distractor specs; bilingual prompt strings only. Entity: clock or Ferris-wheel dial (`jam` / `bianglala`).
- **Example (EN):** The clocks below are seen in a mirror. Which time is closest to 9 o'clock? → **clock A**
- **Contoh (ID):** Jam-jam di bawah terlihat di cermin. Waktu mana yang paling dekat dengan pukul 9? → **jam A**
- **Sources:** 6 — e.g. 2025-PRE-G02-A-Q14, 2024-FIN-G00-A-Q13, 2020-FIN-G02-A-Q7, 2024-PRE-G00-B-Q6

### `clock-read-time` — Read the clock / Membaca jam
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 2 · **Illustration:** needed · **Status:** new
- **Solution method:** Read the hour and minute hands off a single analog clock face and choose the matching `H:MM` label.
- **Parameterization:** Params: `hour` 1–12, `min` ∈ {0,30} (G1 keeps half-hours), optional `pm` flag for 13:xx style labels. FIXED: one clock figure shown, four `H:MM` text options. Render produces the correct face spec + three distractors (hour ±1, minute 0↔30, hour/minute hands swapped). Bilingual prompt only; numeric answer label identical across languages.
- **Example (EN):** Look at the clock on the right. What time is it? → **12:30**
- **Contoh (ID):** Lihat jam di sebelah kanan. Pukul berapa sekarang? → **12:30**
- **Sources:** 2 — 2019-FIN-G01-A-Q6, 2020-PRE-G01-B-Q3

### `calendar-day-count` — Calendar day count / Menghitung jumlah hari
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Given how many times each weekday occurs in a month, sum the counts (`Σ weekday-occurrences`) to get the number of days, using the constraint that two adjacent weekdays appear 5 times and the rest 4.
- **Parameterization:** Params: `fiveCountDays` = the 2–3 weekdays occurring 5 times (a contiguous block, e.g. Sat+Sun), remaining 4–5 weekdays occur 4 times. Total = `5*|fiveCountDays| + 4*(7−|fiveCountDays|)`, constrained to a valid month length 28–31. FIXED: 7 weekdays, answers near {28,29,30,31}. Entity: a named child noticing the calendar — EN `["Penny","Liam","Nora"]` / ID `["Penny","Liam","Nora"]`. Weekday names bilingual (`Saturday`/`Sabtu`, `Sunday`/`Minggu`, etc.).
- **Example (EN):** Penny sees that both Saturdays and Sundays occur 5 times this month, while Monday–Friday each occur 4 times. How many days are in this month? → **30**
- **Contoh (ID):** Penny melihat bahwa Sabtu dan Minggu sama-sama muncul 5 kali bulan ini, sedangkan Senin–Jumat masing-masing 4 kali. Berapa jumlah hari bulan ini? → **30**
- **Sources:** 1 — 2021-FIN-G02-A-Q4

## DAT — Data, Tables & Classification

### `table-grid-position` — Read a value at a grid position / Membaca nilai pada posisi kisi
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 34 · **Illustration:** needed · **Status:** seed
- **Solution method:** Treat the grid as a hundred-chart fragment where rows step by +10 and columns by +1; locate the marked cell (★ / arrow / labelled region) and read or compute its value from a known anchor cell.
- **Parameterization:** Params: `topLeft` (anchor value, 10–80), grid `rows`×`cols` (3–6 each), and the `target` cell coordinates `(r,c)`; value at `(r,c)` = `topLeft + 10*r + c`. FIXED: step pattern (rows +10, columns +1, like a 100-chart) and the read-the-marked-cell task. A few variants subtract two marked cells (e.g. calendar Sat − Wed). Render as a text grid with most cells blank and one cell marked `★`; distractors are off-by-one/off-by-ten neighbours.
- **Example (EN):** In the number grid the top-left cell is 24 and each row goes down by 10, each column right by 1. What number is at the ★ (row 5, column 4)? → **67**
- **Contoh (ID):** Pada kisi angka, sel kiri-atas adalah 24, setiap baris turun 10 dan setiap kolom ke kanan naik 1. Berapa angka pada ★ (baris ke-5, kolom ke-4)? → **67**
- **Sources:** 34 — e.g. 2019-FIN-G01-A-Q10, 2019-PRE-G00-A-Q11, 2021-PRE-G01-A-Q6, 2019-PRE-G02-A-Q9

### `compare-counts-figure` — Count and compare items in a figure / Menghitung dan membandingkan benda pada gambar
- **Grades:** G0–G3 · **Answer:** multiple_choice · **Source questions:** 18 · **Illustration:** needed · **Status:** seed
- **Solution method:** Tally each category of pictured items, then pick the chart/option whose category counts match the tallies (or pick the largest region for a spinner).
- **Parameterization:** Params: a set of `categories` (2–4 from shapes/animals — circle/lingkaran, square/persegi, triangle/segitiga, star/bintang) each with a `count` (1–10). Build the correct bar/tally chart, then generate 3 distractors that each perturb exactly one category count by ±1–2. FIXED: count-then-match-chart structure; one option is exactly correct. The answer key is the matching chart label (A–D).
- **Example (EN):** The picture has 10 circles, 8 squares, 4 triangles, and 6 lines. Which bar chart is correct? → **circle=10, square=8, triangle=4, line=6**
- **Contoh (ID):** Gambar berisi 10 lingkaran, 8 persegi, 4 segitiga, dan 6 garis. Diagram batang mana yang benar? → **lingkaran=10, persegi=8, segitiga=4, garis=6**
- **Sources:** 18 — e.g. 2019-FIN-G01-A-Q15, 2019-FIN-G02-A-Q4, 2022-PRE-G02-A-Q7, 2020-PRE-G00-A-Q5

### `ratio-pictograph` — Read a pictograph with a unit value / Membaca piktograf dengan nilai satuan
- **Grades:** G0–G3 · **Answer:** both · **Source questions:** 16 · **Illustration:** needed · **Status:** seed
- **Solution method:** Each icon equals a fixed unit value; multiply icons by the unit per category, then answer the prompt (difference between two categories, or how many categories exceed a threshold).
- **Parameterization:** Params: `unitValue` (1 or 3), `categories` (2–4 named — blood types A/B/O/AB, or zoos/kebun binatang) with `iconCounts` (1–6 each), a `task` (`difference` of two named categories | `countAbove` a threshold). Values = `iconCounts * unitValue`. FIXED: icon-equals-unit rule stated in the prompt; arithmetic is subtraction or threshold-counting. Distractors are near-miss totals.
- **Example (EN):** Each icon represents 1 student. Type O has 7 icons and type A has 3 icons. How many more students have type O than type A? → **4**
- **Contoh (ID):** Setiap ikon mewakili 1 siswa. Golongan O punya 7 ikon dan golongan A punya 3 ikon. Berapa lebih banyak siswa bergolongan O daripada A? → **4**
- **Sources:** 16 — e.g. 2020-PRE-G01-A-Q3, 2020-PRE-G03-A-Q14, 2021-FIN-G00-B-Q10, 2022-FIN-G01-A-Q5

### `odd-one-out` — Find the item that does not belong / Mencari benda yang tidak sekelompok
- **Grades:** G0–G1 · **Answer:** both · **Source questions:** 14 · **Illustration:** needed · **Status:** seed
- **Solution method:** All but one item share a single classifying property (shape, count of dots, arithmetic pattern); identify the property and select the item that breaks it.
- **Parameterization:** Params: a `rule` (shared classifying property) and 4–5 `items` where one is the intruder. Number-based variant: a sequence with common difference `d` (2–5) plus one inserted intruder term to delete (text-solvable). Picture variant: items share shape/dot-count, one differs. FIXED: exactly one odd item; answer is that item/value. Number variant renders fully in text.
- **Example (EN):** From 1, 5, 6, 9, 13, 17, 21, delete one number so the rest form a regular sequence. Which number? → **6**
- **Contoh (ID):** Dari 1, 5, 6, 9, 13, 17, 21, hapus satu angka agar sisanya membentuk barisan teratur. Angka mana? → **6**
- **Sources:** 14 — e.g. 2019-FIN-G01-B-Q6, 2024-FIN-G01-A-Q14, 2020-FIN-G00-A-Q4, 2022-FIN-G01-A-Q7

### `page-numbering` — Two-sided page / sheet reasoning / Penalaran halaman dua sisi
- **Grades:** G1–G2 · **Answer:** multiple_choice · **Source questions:** 4 · **Illustration:** needed · **Status:** seed
- **Solution method:** Use that one sheet carries two consecutive pages (front+back), facing pages are even-left / odd-right, and a facing-pair sum is always odd; apply to find a valid sum, an unused sheet's page-sum, or the minimum sheets covering given torn pages.
- **Parameterization:** Params: `task` (`validSum` | `unusedSheetSum` | `minSheets`), `totalSheets` (4–6) or a list of `tornPages`. For `unusedSheetSum`, one sheet's two page numbers `p` and `p+1` give sum `2p+1`. FIXED: 2 pages per sheet, consecutive numbering from page 1. Distractors include even sums (impossible for facing pairs) and off-by-one totals.
- **Example (EN):** Eric finds that pages 8, 9, 70, 113, and 114 were torn out. Each sheet holds 2 consecutive pages. What is the minimum number of sheets torn? → **4**
- **Contoh (ID):** Eric menemukan halaman 8, 9, 70, 113, dan 114 telah robek. Setiap lembar memuat 2 halaman berurutan. Berapa jumlah lembar minimum yang robek? → **4**
- **Sources:** 4 — e.g. 2025-FIN-G02-A-Q10, 2024-PRE-G01-A-Q15, 2024-PRE-G02-A-Q15, 2022-PRE-G01-B-Q9

### `consecutive-identical-runs` — Outline straight runs of identical icons / Menandai deret ikon yang sama
- **Grades:** G0 · **Answer:** fill_in · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Scan a grid of icons along rows, columns, and diagonals for maximal straight runs of the same icon; report the longest run length (scoring rewards longer runs).
- **Parameterization:** Params: grid `rows`×`cols` (5–8 each), an `iconSet` (3–4 icons — balloon/balon, pineapple/nanas, heart/hati, tree/pohon) placed so at least one straight run of length `targetLen` (3–8) exists; the answer is the longest run length (count-objects secondary). FIXED: straight-line (row/col/diagonal) same-icon runs only.
- **Example (EN):** In the icon grid, what is the length of the longest straight run (row, column, or diagonal) of identical icons? → **4**
- **Contoh (ID):** Pada kisi ikon, berapa panjang deret lurus terpanjang (baris, kolom, atau diagonal) dari ikon yang sama? → **4**
- **Sources:** 1 — e.g. 2019-FIN-G00-B-Q10

### `identify-figure-by-description` — Pick the figure matching a description / Memilih gambar sesuai deskripsi
- **Grades:** G1 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** Parse a spatial/containment description (inner shape, outer shape, colours) and select the one option image whose arrangement satisfies every stated attribute.
- **Parameterization:** Params: `innerShape` + `innerColor` and `outerShape` + `outerColor` (shapes: circle/lingkaran, square/persegi, triangle/segitiga; colours: white/putih, gray/abu-abu) and the relation `inside`. Generate the correct figure plus 3 distractors that swap one attribute (colour, shape, or inside/outside). FIXED: single containment relation; answer is the matching figure label (A–D).
- **Example (EN):** Which figure shows a white circle inside a gray square? → **the option with a white circle inside a gray square (B)**
- **Contoh (ID):** Gambar mana yang menunjukkan lingkaran putih di dalam persegi abu-abu? → **opsi dengan lingkaran putih di dalam persegi abu-abu (B)**
- **Sources:** 1 — e.g. 2019-FIN-G01-A-Q8

### `chart-trend-extreme` — Find the most/least variable series / Mencari deret paling berubah
- **Grades:** G3 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** needed · **Status:** new
- **Solution method:** For each labelled series read its data values, compute the spread (max − min) per series, and choose the one with the greatest (or smallest) variation.
- **Parameterization:** Params: `series` (3–4 cities/labels), `periods` (4 seasons — spring/musim semi, summer/musim panas, autumn/musim gugur, winter/musim dingin), and a `values` table (each 0–40°C) engineered so exactly one series has the largest range. FIXED: read-table-then-compare-range; answer is the series label. The values render as a text table even if shown as a line chart.
- **Example (EN):** The table gives 4 cities' seasonal temperatures. City C ranges 5°C to 35°C; the others vary less. Which city has the most distinct variation? → **C**
- **Contoh (ID):** Tabel memberi suhu musiman 4 kota. Kota C berkisar 5°C sampai 35°C; lainnya lebih kecil. Kota mana yang variasinya paling jelas? → **C**
- **Sources:** 1 — e.g. 2019-FIN-G03-A-Q3

### `letter-frequency-count` — Most frequent letter across words / Huruf yang paling sering muncul
- **Grades:** G2 · **Answer:** multiple_choice · **Source questions:** 1 · **Illustration:** not needed · **Status:** new
- **Solution method:** Tally each candidate letter's occurrences across the given word list and select the letter with the highest total count.
- **Parameterization:** Params: a `wordList` (5–7 common words — APPLE, PENCIL, ERASER, AIRPLANE, ELEPHANT, BANANA, PIG) and 4 candidate `letters`; answer is the letter with the maximum frequency across the list. FIXED: count-letters-then-pick-max; words given as plain text so fully text-solvable. Distractors are letters with near-equal but lower totals.
- **Example (EN):** Across APPLE, PENCIL, ERASER, AIRPLANE, ELEPHANT, BANANA, PIG, which letter appears most often? → **A**
- **Contoh (ID):** Di antara APPLE, PENCIL, ERASER, AIRPLANE, ELEPHANT, BANANA, PIG, huruf mana yang paling sering muncul? → **A**
- **Sources:** 1 — e.g. 2021-FIN-G02-A-Q13
