import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19P3A (2019 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 6040 → ( ) → 4060 → 3070 → 2080: find the rule, apply once. */
export const ArrowRule19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the rule from two known steps, then apply it once.', 'Temukan aturan dari dua langkah yang diketahui, lalu terapkan sekali.'),
    items: [
      { text: t('Known steps: 4060 → 3070 → 2080 — each takes 1000 off and adds 10', 'Langkah diketahui: 4060 → 3070 → 2080 — tiap kali kurangi 1000, tambah 10'), ok: null },
      { text: t('So every arrow is −990', 'Jadi tiap panah adalah −990'), ok: null },
      { text: t('5040 forgets the +10 to the tens — every step bumps the tens up too', '5040 lupa +10 pada puluhan — setiap langkah juga menaikkan puluhan'), ok: false },
      { text: '6040 − 990 = 5050', ok: true },
    ],
    final: t('( ) = 5050 (B).', '( ) = 5050 (B).'),
    aria: t('Each arrow subtracts 990, so 6040 minus 990 is 5050.', 'Tiap panah mengurangi 990, jadi 6040 dikurangi 990 adalah 5050.'),
  }
})

/** Q2 — compute 582 + 379 − 88. */
export const AddThenSubtract19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the first two, then subtract 88 in easy parts.', 'Jumlahkan dua yang pertama, lalu kurangi 88 bertahap.'),
    items: [
      { text: '582 + 379 = 961', ok: null },
      { text: t('961 is not the answer — the − 88 step still has to be done', '961 bukan jawabannya — langkah − 88 masih harus dikerjakan'), ok: false },
      { text: '961 − 80 = 881, 881 − 8 = 873', ok: null },
      { text: '582 + 379 − 88 = 873', ok: true },
    ],
    final: t('582 + 379 − 88 = 873 (A).', '582 + 379 − 88 = 873 (A).'),
    aria: t('Adding to 961 then subtracting 88 gives 873.', 'Menjumlahkan jadi 961 lalu mengurangi 88 menghasilkan 873.'),
  }
})

/** Q3 — which digit is in neither 46 × 9 nor 68 ÷ 4? */
export const MissingDigit19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out both results, list every digit, then find the missing one.', 'Hitung kedua hasil, daftar setiap angka, lalu cari yang hilang.'),
    items: [
      { text: '46 × 9 = 414, 68 ÷ 4 = 17', ok: null },
      { text: t('Digits used: 4, 1, 7', 'Angka yang dipakai: 4, 1, 7'), ok: null },
      { text: t('1 looks missing, but it is the tens digit of 17 — it does appear', '1 sepertinya hilang, tapi itu angka puluhan dari 17 — jadi muncul'), ok: false },
      { text: t('6 is in neither 414 nor 17', '6 tidak ada di 414 maupun 17'), ok: true },
    ],
    final: t('6 never appears (C).', '6 tak pernah muncul (C).'),
    aria: t('The digits 1, 4, 7 appear, so 6 is the missing one.', 'Angka 1, 4, 7 muncul, jadi 6 yang hilang.'),
  }
})

/** Q4 — how many digits □ make 70□9 > 7068? */
export const DigitInequality19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('70□9 and 7068 share the 70 in front, so the tens digit decides.', '70□9 dan 7068 sama pada 70 di depan, jadi angka puluhan yang menentukan.'),
    items: [
      { text: t('□ = 7, 8, 9 are already bigger', '□ = 7, 8, 9 sudah lebih besar'), ok: null },
      { text: t('□ = 6: compare units, 7069 vs 7068 and 9 > 8 — works too', '□ = 6: bandingkan satuan, 7069 vs 7068 dan 9 > 8 — cocok juga'), ok: null },
      { text: t('Don’t drop □ = 6: only □ ≤ 5 fail (that wrong path gives 3)', 'Jangan buang □ = 6: hanya □ ≤ 5 yang gagal (jalan keliru itu memberi 3)'), ok: false },
      { text: t('□ ∈ {6, 7, 8, 9} — that is 4 numbers', '□ ∈ {6, 7, 8, 9} — yaitu 4 bilangan'), ok: true },
    ],
    final: t('4 digits work (C).', '4 angka cocok (C).'),
    aria: t('The digits 6, 7, 8, 9 work, so there are four.', 'Angka 6, 7, 8, 9 cocok, jadi ada empat.'),
  }
})

/** Q7 — which shaded ribbon is exactly 2/7? */
export const Fraction19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('2/7 means 7 equal pieces with exactly 2 shaded.', '2/7 berarti 7 bagian sama dengan tepat 2 diarsir.'),
    items: [
      { text: t('First the ribbon must split into 7 equal parts', 'Pertama pita harus dibagi 7 bagian sama besar'), ok: null },
      { text: t('A picture with 2 shaded out of unequal pieces is not 2/7', 'Gambar dengan 2 diarsir dari bagian tak sama bukan 2/7'), ok: false },
      { text: t('Then exactly 2 of the 7 equal pieces are shaded', 'Lalu tepat 2 dari 7 bagian sama itu diarsir'), ok: null },
      { text: t('Choice C: 7 equal parts, 2 shaded', 'Pilihan C: 7 bagian sama, 2 diarsir'), ok: true },
    ],
    final: t('Choice C is exactly 2/7 (C).', 'Pilihan C tepat 2/7 (C).'),
    aria: t('Only the ribbon in seven equal parts with two shaded is two sevenths.', 'Hanya pita dengan tujuh bagian sama dan dua diarsir yang dua per tujuh.'),
  }
})

/** Q8 — rope 952 cm, cut 8 sections of 93 cm: what is left? */
export const RopeLeft19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply to total the cuts, then subtract from the whole.', 'Kalikan untuk total potongan, lalu kurangi dari seluruhnya.'),
    items: [
      { text: '8 × 93 = 720 + 24 = 744', ok: null },
      { text: '952 − 744 = 208', ok: null },
      { text: t('188 comes from a slip in 8 × 93 (using 764, not 744)', '188 muncul dari salah hitung 8 × 93 (memakai 764, bukan 744)'), ok: false },
      { text: t('Rope left = 208 cm', 'Tali tersisa = 208 cm'), ok: true },
    ],
    final: t('208 cm of rope is left (B).', 'Tersisa 208 cm tali (B).'),
    aria: t('Cutting 744 cm from 952 cm leaves 208 cm.', 'Memotong 744 cm dari 952 cm menyisakan 208 cm.'),
  }
})

/** Q9 — one day of a week as a fraction. */
export const DayOfWeek19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A fraction is part over whole: one day over the whole week.', 'Pecahan adalah bagian per keseluruhan: satu hari per satu minggu penuh.'),
    items: [
      { text: t('A week has 7 days, so the whole is 7', 'Satu minggu ada 7 hari, jadi keseluruhannya 7'), ok: null },
      { text: t('One day is 1 of those 7', 'Satu hari adalah 1 dari 7 itu'), ok: null },
      { text: t('1/30 is one day of a month, not a week', '1/30 adalah satu hari dari sebulan, bukan seminggu'), ok: false },
      { text: t('One day of a week = 1/7', 'Satu hari dari seminggu = 1/7'), ok: true },
    ],
    final: t('One day of a week is 1/7 (B).', 'Satu hari dari seminggu adalah 1/7 (B).'),
    aria: t('One day over seven days in a week is one seventh.', 'Satu hari per tujuh hari dalam seminggu adalah satu per tujuh.'),
  }
})

/** Q10 — 3 coffees at 15 + 5 burgers at 39, total cost. */
export const ShoppingTotal19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Cost each item group, then add the groups.', 'Hitung biaya tiap jenis, lalu jumlahkan.'),
    items: [
      { text: t('Coffee: 3 × 15 = 45', 'Kopi: 3 × 15 = 45'), ok: null },
      { text: t('Hamburgers: 5 × 39 = 195', 'Hamburger: 5 × 39 = 195'), ok: null },
      { text: t('Don’t swap the counts — match each price to its own quantity', 'Jangan tukar jumlahnya — cocokkan tiap harga dengan kuantitasnya'), ok: false },
      { text: '45 + 195 = 240', ok: true },
    ],
    final: t('Dad pays 240 dollars (D).', 'Ayah membayar 240 dolar (D).'),
    aria: t('45 for coffee plus 195 for burgers is 240.', '45 untuk kopi plus 195 untuk burger adalah 240.'),
  }
})

/** Q12 — compute 447 − 69 + 283 − 31 by grouping. */
export const GroupTerms19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group the plus terms and the minus terms.', 'Kelompokkan suku tambah dan suku kurang.'),
    items: [
      { text: '447 + 283 = 730', ok: null },
      { text: '69 + 31 = 100', ok: null },
      { text: t('694 treats every sign as plus — the − 31 must subtract', '694 menganggap semua tanda sebagai tambah — − 31 harus mengurangi'), ok: false },
      { text: '730 − 100 = 630', ok: true },
    ],
    final: t('447 − 69 + 283 − 31 = 630 (B).', '447 − 69 + 283 − 31 = 630 (B).'),
    aria: t('730 minus 100 is 630.', '730 dikurangi 100 adalah 630.'),
  }
})

/** Q14 — which fraction is largest: 12/26, 12/31, 17/26, 17/23? */
export const LargestFraction19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare by same-top and same-bottom shortcuts.', 'Bandingkan dengan trik pembilang-sama dan penyebut-sama.'),
    items: [
      { text: t('Same top, bigger bottom is smaller: 12/26 > 12/31', 'Pembilang sama, penyebut besar lebih kecil: 12/26 > 12/31'), ok: false },
      { text: t('Same bottom, bigger top is bigger: 17/26 > 12/26', 'Penyebut sama, pembilang besar lebih besar: 17/26 > 12/26'), ok: false },
      { text: t('17/26 has a bigger bottom than 17/23, so it is smaller', '17/26 penyebutnya lebih besar dari 17/23, jadi lebih kecil'), ok: false },
      { text: t('17/23: top 17, smallest bottom — the largest', '17/23: pembilang 17, penyebut terkecil — terbesar'), ok: true },
    ],
    final: t('17/23 is the largest (D).', '17/23 yang terbesar (D).'),
    aria: t('The biggest top over the smallest bottom, 17 over 23, is largest.', 'Pembilang terbesar atas penyebut terkecil, 17 per 23, yang terbesar.'),
  }
})

/** Q15 — ● = 274 + 116, ■ = 875 − 216, find ■ − 173 + ●. */
export const SymbolSubstitute19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Evaluate each symbol, then substitute and compute.', 'Hitung tiap simbol, lalu substitusi dan hitung.'),
    items: [
      { text: '● = 274 + 116 = 390', ok: null },
      { text: '■ = 875 − 216 = 659', ok: null },
      { text: t('1049 skips the − 173 entirely (659 + 390) — the 173 must still be subtracted', '1049 melewatkan − 173 sama sekali (659 + 390) — 173 masih harus dikurangkan'), ok: false },
      { text: '659 − 173 + 390 = 876', ok: true },
    ],
    final: t('( ) = 876 (A).', '( ) = 876 (A).'),
    aria: t('659 minus 173 plus 390 is 876.', '659 dikurangi 173 ditambah 390 adalah 876.'),
  }
})

/** Q16 — ○ = 7, □ + □ + ○ = 25, △ − □ − ○ = 10, find △ + ○ + □. */
export const ShapeEquations19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve one symbol at a time, then total.', 'Selesaikan satu simbol per langkah, lalu jumlahkan.'),
    items: [
      { text: t('□ + □ + 7 = 25 → 2□ = 18 → □ = 9', '□ + □ + 7 = 25 → 2□ = 18 → □ = 9'), ok: null },
      { text: t('△ − 9 − 7 = 10 → △ = 26', '△ − 9 − 7 = 10 → △ = 26'), ok: null },
      { text: t('36 adds the 10 from the third equation (26 + 10) instead of ○ + □ = 7 + 9', '36 menambah 10 dari persamaan ketiga (26 + 10), bukan ○ + □ = 7 + 9'), ok: false },
      { text: t('△ + ○ + □ = 26 + 7 + 9 = 42', '△ + ○ + □ = 26 + 7 + 9 = 42'), ok: true },
    ],
    final: t('△ + ○ + □ = 42 (B).', '△ + ○ + □ = 42 (B).'),
    aria: t('Square is 9, triangle is 26, so the sum is 42.', 'Kotak 9, segitiga 26, jadi jumlahnya 42.'),
  }
})

/** Q18 — how many 3-digit even numbers from 5, 6, 7, 8 (no repeat)? */
export const EvenNumbers19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Even forces the units digit first, then count the rest.', 'Genap menetapkan angka satuan dulu, lalu hitung sisanya.'),
    items: [
      { text: t('Units must be even: 6 or 8 — 2 choices', 'Satuan harus genap: 6 atau 8 — 2 pilihan'), ok: null },
      { text: t('Hundreds: 3 digits left; tens: 2 left', 'Ratusan: tersisa 3 angka; puluhan: tersisa 2'), ok: null },
      { text: t('6 fixes only one even units digit — both 6 and 8 are allowed', '6 hanya menetapkan satu satuan genap — 6 dan 8 sama-sama boleh'), ok: false },
      { text: '2 × 3 × 2 = 12', ok: true },
    ],
    final: t('12 different even numbers (C).', '12 bilangan genap berbeda (C).'),
    aria: t('Two units times three hundreds times two tens is twelve.', 'Dua satuan kali tiga ratusan kali dua puluhan adalah dua belas.'),
  }
})

/** Q19 — compute 3 + 4 + 5 + ⋯ + 26 by pairing ends. */
export const ConsecutiveSum19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair the ends: (first + last) × number of pairs.', 'Pasangkan ujung: (pertama + terakhir) × banyak pasangan.'),
    items: [
      { text: t('Terms from 3 to 26: 26 − 3 + 1 = 24', 'Suku dari 3 sampai 26: 26 − 3 + 1 = 24'), ok: null },
      { text: t('Each pair sums to 3 + 26 = 29; there are 12 pairs', 'Tiap pasangan berjumlah 3 + 26 = 29; ada 12 pasangan'), ok: null },
      { text: t('351 is 1 + 2 + ⋯ + 26 — this starts at 3, so drop the 1 + 2', '351 adalah 1 + 2 + ⋯ + 26 — ini mulai dari 3, jadi buang 1 + 2'), ok: false },
      { text: '29 × 12 = 348', ok: true },
    ],
    final: t('3 + 4 + ⋯ + 26 = 348 (C).', '3 + 4 + ⋯ + 26 = 348 (C).'),
    aria: t('Twelve pairs each summing to 29 give 348.', 'Dua belas pasangan masing-masing berjumlah 29 menghasilkan 348.'),
  }
})

/** Q21 — digit-error subtraction, true result from wrong 560. */
export const DigitError19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Track how each digit error shifts the result, then undo it.', 'Lacak bagaimana tiap kesalahan angka menggeser hasil, lalu batalkan.'),
    items: [
      { text: t('Minuend tens 7 not 1 → minuend 60 too big → result +60', 'Puluhan yang dikurangi 7 bukan 1 → 60 terlalu besar → hasil +60'), ok: null },
      { text: t('Subtrahend units 7 not 1 → subtrahend 6 too big → result −6', 'Satuan pengurang 7 bukan 1 → 6 terlalu besar → hasil −6'), ok: null },
      { text: t('566 only undoes the subtrahend error — the +60 shift is still in 560', '566 hanya membatalkan kesalahan pengurang — geseran +60 masih ada di 560'), ok: false },
      { text: t('Net +54, so true answer = 560 − 54 = 506', 'Bersih +54, jadi hasil sebenarnya = 560 − 54 = 506'), ok: true },
    ],
    final: t('The original answer is 506 (B).', 'Hasil sebenarnya adalah 506 (B).'),
    aria: t('Undoing a net error of 54 from 560 gives 506.', 'Membatalkan kesalahan bersih 54 dari 560 menghasilkan 506.'),
  }
})

/** Q22 — 6□4□ − 3□9 = □805, sum of the 4 boxes. */
export const ColumnPuzzle19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve digit by digit from the units, tracking borrows.', 'Selesaikan angka demi angka mulai satuan, mengikuti pinjaman.'),
    items: [
      { text: t('Result □805 must be 5805, so the lead □ = 5', 'Hasil □805 pasti 5805, jadi □ depan = 5'), ok: null },
      { text: t('Units 14 − 9 = 5 with a borrow → last □ = 4; tens → □ = 3; hundreds → □ = 1', 'Satuan 14 − 9 = 5 dengan pinjam → □ terakhir = 4; puluhan → □ = 3; ratusan → □ = 1'), ok: null },
      { text: t('15 ignores a borrow and reads a digit too high — check each column', '15 mengabaikan pinjaman dan membaca angka terlalu besar — periksa tiap kolom'), ok: false },
      { text: t('The four □ are 1, 4, 3, 5 → 1 + 4 + 3 + 5 = 13', 'Keempat □ adalah 1, 4, 3, 5 → 1 + 4 + 3 + 5 = 13'), ok: true },
    ],
    final: t('The sum of the 4 boxes is 13 (B).', 'Jumlah 4 kotak adalah 13 (B).'),
    aria: t('The four recovered digits 1, 4, 3, 5 sum to 13.', 'Keempat angka yang ditemukan 1, 4, 3, 5 berjumlah 13.'),
  }
})

/** Q23 — clock strikes: 4 strikes in 6 s, how long for 12 strikes? */
export const ClockStrikes19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the gaps between strikes, not the strikes.', 'Hitung jeda antar dentang, bukan dentangnya.'),
    items: [
      { text: t('4 strikes have 3 gaps; 6 s ÷ 3 = 2 s per gap', '4 dentang punya 3 jeda; 6 d ÷ 3 = 2 d per jeda'), ok: null },
      { text: t('12 strikes have 11 gaps', '12 dentang punya 11 jeda'), ok: null },
      { text: t('24 uses 12 × 2, but 12 strikes have only 11 gaps, not 12', '24 memakai 12 × 2, padahal 12 dentang hanya 11 jeda, bukan 12'), ok: false },
      { text: '11 × 2 = 22', ok: true },
    ],
    final: t('12 strikes take 22 seconds (C).', '12 dentang memakan 22 detik (C).'),
    aria: t('Eleven gaps at two seconds each is twenty-two seconds.', 'Sebelas jeda dua detik tiap jeda adalah dua puluh dua detik.'),
  }
})

/** Q24 — formation +14 (one row, one column): max minus min original people. */
export const Formation19P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Fix the sum first: a product is biggest when factors are close, smallest when far apart.', 'Tetapkan jumlahnya dulu: hasil kali terbesar saat faktor berdekatan, terkecil saat berjauhan.'),
    items: [
      { text: t('Adding a row and a column adds rows + cols + 1 = 14, so rows + cols = 13', 'Menambah satu baris dan kolom menambah baris + kolom + 1 = 14, jadi baris + kolom = 13'), ok: null },
      { text: t('Most: close factors 6 × 7 = 42; fewest: far apart 1 × 12 = 12', 'Terbanyak: faktor dekat 6 × 7 = 42; tersedikit: berjauhan 1 × 12 = 12'), ok: null },
      { text: t('36 forgets the +1 corner person (rows + cols = 14 → 49 − 13 = 36)', '36 lupa 1 orang di pojok (baris + kolom = 14 → 49 − 13 = 36)'), ok: false },
      { text: '42 − 12 = 30', ok: true },
    ],
    final: t('The difference is 30 (B).', 'Selisihnya adalah 30 (B).'),
    aria: t('Largest 42 minus smallest 12 is 30.', 'Terbesar 42 dikurangi terkecil 12 adalah 30.'),
  }
})
