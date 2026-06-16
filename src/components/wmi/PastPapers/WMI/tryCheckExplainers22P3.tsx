import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-22P3A (2022 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination. Built faithfully from each
// question's hint_steps + breakdown (strategy / quantities / trap).

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — ( ) + 374 = 842: undo the addition by subtracting. */
export const MissingAddend22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Missing addend = total minus the known part.', 'Bilangan yang hilang = total dikurangi bagian yang diketahui.'),
    items: [
      { text: t('A missing addend means we subtract: 842 − 374', 'Mencari bilangan yang dijumlahkan berarti kita mengurangi: 842 − 374'), ok: null },
      { text: '842 − 374 = 468', ok: null },
      { text: t('Don’t mis-borrow: 566 + 374 = 940, not 842', 'Jangan salah meminjam: 566 + 374 = 940, bukan 842'), ok: false },
      { text: t('Check: 468 + 374 = 842', 'Periksa: 468 + 374 = 842'), ok: true },
    ],
    final: t('The box is 468 (D).', 'Isi kotaknya 468 (D).'),
    aria: t('Subtracting 374 from 842 gives 468.', 'Mengurangi 374 dari 842 menghasilkan 468.'),
  }
})

/** Q2 — yellow rope between red (45 cm) and blue (1 m 23 cm). */
export const RopeRange22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Convert to one unit, then check the range.', 'Samakan satuan, lalu periksa rentangnya.'),
    items: [
      { text: t('In cm: red = 45 cm, blue = 1 m 23 cm = 123 cm', 'Dalam cm: merah = 45 cm, biru = 1 m 23 cm = 123 cm'), ok: null },
      { text: t('Yellow must be more than 45 cm and less than 123 cm', 'Tali kuning harus lebih dari 45 cm dan kurang dari 123 cm'), ok: null },
      { text: t('200 cm is longer than blue (123 cm) — breaks the rule', '200 cm lebih panjang dari biru (123 cm) — melanggar aturan'), ok: false },
      { text: t('121 cm: 45 < 121 < 123 — it fits', '121 cm: 45 < 121 < 123 — pas'), ok: true },
    ],
    final: t('The yellow rope could be 121 cm (D).', 'Tali kuning bisa 121 cm (D).'),
    aria: t('Only 121 cm lands strictly between 45 cm and 123 cm.', 'Hanya 121 cm yang berada tepat di antara 45 cm dan 123 cm.'),
  }
})

/** Q4 — 1 clover (4 leaves) + shamrocks (3 leaves) make 100 leaves. */
export const CloverLeaves22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Remove the special item first, then divide evenly.', 'Singkirkan benda istimewa dulu, lalu bagi rata.'),
    items: [
      { text: t('Set aside the 1 clover (4 leaves): 100 − 4 = 96 leaves', 'Pisahkan 1 semanggi (4 daun): 100 − 4 = 96 daun'), ok: null },
      { text: t('Those 96 leaves are all from 3-leaf shamrocks: 96 ÷ 3 = 32', '96 daun itu semua dari shamrock berdaun 3: 96 ÷ 3 = 32'), ok: null },
      { text: t('Don’t do 100 ÷ 3 ≈ 33 — that forgets to remove the clover', 'Jangan 100 ÷ 3 ≈ 33 — itu lupa mengeluarkan semanggi'), ok: false },
      { text: t('So Anna picked 32 shamrocks', 'Jadi Anna memetik 32 shamrock'), ok: true },
    ],
    final: t('Anna had picked 32 shamrocks (C).', 'Anna sudah memetik 32 shamrock (C).'),
    aria: t('Taking out the four clover leaves then dividing by three gives 32 shamrocks.', 'Mengeluarkan empat daun semanggi lalu membagi tiga menghasilkan 32 shamrock.'),
  }
})

/** Q6 — saving on 7 sweaters, old 105, sale 61. */
export const SweaterSaving22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Saving per item first, then multiply by the count.', 'Hemat per barang dulu, lalu kalikan dengan jumlahnya.'),
    items: [
      { text: t('Saving on one sweater: 105 − 61 = 44', 'Hemat satu sweater: 105 − 61 = 44'), ok: null },
      { text: t('Don’t use 34 per sweater: 34 × 7 = 238 — the gap is 44, not 34', 'Jangan pakai 34 per sweater: 34 × 7 = 238 — selisihnya 44, bukan 34'), ok: false },
      { text: '44 × 7 = 280 + 28 = 308', ok: null },
      { text: t('So Tony saves 308 dollars', 'Jadi Tony hemat 308 dolar'), ok: true },
    ],
    final: t('Tony saves 308 dollars (D).', 'Tony hemat 308 dolar (D).'),
    aria: t('Saving 44 per sweater times seven is 308.', 'Hemat 44 per sweater dikali tujuh adalah 308.'),
  }
})

/** Q8 — bigger = 6 × smaller + 2; one number is 68, both even. */
export const EvenPairRule22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Try both roles, then keep only the even result.', 'Coba kedua peran, lalu pakai hasil yang genap saja.'),
    items: [
      { text: t('If 68 is the smaller: bigger = 6 × 68 + 2 = 410', 'Jika 68 yang lebih kecil: lebih besar = 6 × 68 + 2 = 410'), ok: null },
      { text: t('If 68 is the bigger: smaller = (68 − 2) ÷ 6 = 11', 'Jika 68 yang lebih besar: lebih kecil = (68 − 2) ÷ 6 = 11'), ok: null },
      { text: t('11 is odd, but both numbers must be even — reject it', '11 ganjil, padahal kedua bilangan harus genap — coret'), ok: false },
      { text: t('Only 410 works', 'Hanya 410 yang berlaku'), ok: true },
    ],
    final: t('The other number is 410 (C).', 'Bilangan lainnya 410 (C).'),
    aria: t('Only the even result survives, so the other number is 410.', 'Hanya hasil genap yang bertahan, jadi bilangan lainnya 410.'),
  }
})

/** Q11 — biggest minus smallest 3-digit number from 7, 2, 1, 4, 0. */
export const DigitDifference22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Big digits in front for the max; smallest non-zero lead for the min.', 'Angka besar di depan untuk maksimum; angka kecil bukan nol di depan untuk minimum.'),
    items: [
      { text: t('Largest: biggest digits first → 742', 'Terbesar: angka terbesar di depan → 742'), ok: null },
      { text: t('A number can’t start with 0, so 024 is not allowed; smallest is 102', 'Bilangan tidak boleh diawali 0, jadi 024 tidak boleh; terkecil 102'), ok: false },
      { text: '742 − 102 = 640', ok: null },
      { text: t('So the difference is 640', 'Jadi selisihnya 640'), ok: true },
    ],
    final: t('The difference is 640 (A).', 'Selisihnya 640 (A).'),
    aria: t('742 minus 102 is 640.', '742 dikurangi 102 adalah 640.'),
  }
})

/** Q12 — 456 total; find Musical-chairs eliminations. */
export const GameShowRounds22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total minus all the known groups gives the unknown one.', 'Total dikurangi semua kelompok yang diketahui memberi kelompok yang tak diketahui.'),
    items: [
      { text: t('Hopscotch is half more than 138: 138 + 69 = 207', 'Engklek setengah lebih banyak dari 138: 138 + 69 = 207'), ok: null },
      { text: t('Don’t forget the 11 who passed must be subtracted too', 'Jangan lupa 11 yang lolos juga harus dikurangkan'), ok: false },
      { text: t('Musical chairs = 456 − 138 − 207 − 11', 'Kursi musik = 456 − 138 − 207 − 11'), ok: null },
      { text: '456 − 138 − 207 − 11 = 100', ok: true },
    ],
    final: t('100 people were eliminated in Musical chairs (A).', '100 orang tereliminasi di Kursi musik (A).'),
    aria: t('Subtracting all the known groups from 456 leaves 100.', 'Mengurangi semua kelompok yang diketahui dari 456 menyisakan 100.'),
  }
})

/** Q13 — 4□ × 6 = 2○2; find M + m of (□ + ○). */
export const CryptarithmPair22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the units digit to find □, then list every case.', 'Pakai angka satuan untuk mencari □, lalu daftar setiap kasus.'),
    items: [
      { text: t('The product ends in 2, so □ × 6 ends in 2 → □ = 2 or □ = 7', 'Hasil kali berakhir 2, jadi □ × 6 berakhir 2 → □ = 2 atau □ = 7'), ok: null },
      { text: t('□ = 2: 42 × 6 = 252, ○ = 5, so □ + ○ = 7', '□ = 2: 42 × 6 = 252, ○ = 5, jadi □ + ○ = 7'), ok: null },
      { text: t('□ = 7: 47 × 6 = 282, ○ = 8, so □ + ○ = 15', '□ = 7: 47 × 6 = 282, ○ = 8, jadi □ + ○ = 15'), ok: null },
      { text: 'M = 15, m = 7 → M + m = 22', ok: true },
    ],
    final: t('M + m = 22 (C).', 'M + m = 22 (C).'),
    aria: t('The two valid cases give sums 7 and 15, so M plus m is 22.', 'Dua kasus sah memberi jumlah 7 dan 15, jadi M tambah m adalah 22.'),
  }
})

/** Q14 — 4-digit, digit sum 24, hundreds+units = 3 × (thousands+tens). */
export const DigitGroups22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group the digits, solve A + 3A = 24, then count.', 'Kelompokkan angka, selesaikan A + 3A = 24, lalu hitung.'),
    items: [
      { text: t('Let A = thousands+tens, B = hundreds+units: A + B = 24, B = 3A → A = 6, B = 18', 'Misal A = ribuan+puluhan, B = ratusan+satuan: A + B = 24, B = 3A → A = 6, B = 18'), ok: null },
      { text: t('hundreds+units = 18 means both are 9 — only 1 way', 'ratusan+satuan = 18 berarti keduanya 9 — hanya 1 cara'), ok: null },
      { text: t('Thousands can’t be 0, so (0,6) is out — that wrong count gives 9', 'Ribuan tidak boleh 0, jadi (0,6) coret — hitungan salah itu jadi 9'), ok: false },
      { text: t('thousands+tens = 6: (1,5)(2,4)(3,3)(4,2)(5,1)(6,0) → 6 numbers', 'ribuan+puluhan = 6: (1,5)(2,4)(3,3)(4,2)(5,1)(6,0) → 6 bilangan'), ok: true },
    ],
    final: t('There are 6 such 4-digit numbers (B).', 'Ada 6 bilangan 4 angka seperti itu (B).'),
    aria: t('After fixing the digit groups, six valid numbers remain.', 'Setelah menetapkan kelompok angka, tersisa enam bilangan yang sah.'),
  }
})

/** Q15 — 5×5 grid, count winning lines of ÷3, ÷5, ÷8 symbols. */
export const SymbolLines22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Tag every cell, then scan rows, columns, and diagonals.', 'Tandai tiap sel, lalu pindai baris, kolom, dan diagonal.'),
    items: [
      { text: t('All-○ (÷3) lines: row 2, column 1, and both diagonals = 4', 'Garis semua-○ (÷3): baris 2, kolom 1, dan kedua diagonal = 4'), ok: null },
      { text: t('All-□ (÷5) lines: row 1 and column 5 = 2', 'Garis semua-□ (÷5): baris 1 dan kolom 5 = 2'), ok: null },
      { text: t('Don’t miss a diagonal — counting only 6 drops one all-○ diagonal', 'Jangan lewatkan satu diagonal — menghitung 6 saja menjatuhkan satu diagonal semua-○'), ok: false },
      { text: t('All-△ (÷8) line: row 3 = 1, so 4 + 2 + 1 = 7', 'Garis semua-△ (÷8): baris 3 = 1, jadi 4 + 2 + 1 = 7'), ok: true },
    ],
    final: t('7 straight lines in total (C).', '7 garis lurus seluruhnya (C).'),
    aria: t('Four divide-by-three lines, two divide-by-five, one divide-by-eight make seven.', 'Empat garis kelipatan tiga, dua kelipatan lima, satu kelipatan delapan jadi tujuh.'),
  }
})

/** Q16 — 202 ÷ 2 + 20 × 22 with order of operations. */
export const OrderOfOps22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Order of operations: × and ÷ before +.', 'Urutan operasi: × dan ÷ sebelum +.'),
    items: [
      { text: '202 ÷ 2 = 101', ok: null },
      { text: '20 × 22 = 440', ok: null },
      { text: t('Don’t slip to 202 ÷ 2 = 102 — that wrongly gives 544', 'Jangan keliru 202 ÷ 2 = 102 — itu salah jadi 544'), ok: false },
      { text: '101 + 440 = 541', ok: true },
    ],
    final: t('202 ÷ 2 + 20 × 22 = 541 (C).', '202 ÷ 2 + 20 × 22 = 541 (C).'),
    aria: t('101 plus 440 is 541.', '101 ditambah 440 adalah 541.'),
  }
})

/** Q19 — symbol puzzle: ○ + ○ + ○ = 111, etc.; find ○ × △ + □. */
export const SymbolPuzzle22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve each symbol first, then substitute.', 'Selesaikan tiap simbol dulu, lalu substitusi.'),
    items: [
      { text: '○ + ○ + ○ = 111 → ○ = 37', ok: null },
      { text: t('△ + ○ + △ = 55 → 2△ = 55 − 37 = 18, so △ = 9', '△ + ○ + △ = 55 → 2△ = 55 − 37 = 18, jadi △ = 9'), ok: null },
      { text: t('□ × □ × □ = 343 → □ = 7 (since 7 × 7 × 7 = 343)', '□ × □ × □ = 343 → □ = 7 (karena 7 × 7 × 7 = 343)'), ok: null },
      { text: '○ × △ + □ = 37 × 9 + 7 = 340', ok: true },
    ],
    final: t('○ × △ + □ = 340 (A).', '○ × △ + □ = 340 (A).'),
    aria: t('With circle 37, triangle 9, square 7, the value is 340.', 'Dengan lingkaran 37, segitiga 9, persegi 7, nilainya 340.'),
  }
})

/** Q20 — fewest balls to guarantee a pair summing to 20. */
export const PigeonholeBalls22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pigeonhole: build the biggest safe set, then add one.', 'Pigeonhole: bentuk himpunan aman terbesar, lalu tambah satu.'),
    items: [
      { text: t('Pairs that add to 20: (1,19)…(9,11) — 9 pairs', 'Pasangan yang berjumlah 20: (1,19)…(9,11) — 9 pasangan'), ok: null },
      { text: t('Balls 10 and 20 have no partner', 'Bola 10 dan 20 tidak punya pasangan'), ok: null },
      { text: t('11 balls can still dodge a pair (one per pair + 10 + 20)', '11 bola masih bisa menghindari pasangan (satu per pasangan + 10 + 20)'), ok: false },
      { text: t('One more ball forces a pair: 11 + 1 = 12', 'Satu bola lagi memaksa pasangan: 11 + 1 = 12'), ok: true },
    ],
    final: t('At least 12 balls guarantee it (A).', 'Paling sedikit 12 bola menjamin (A).'),
    aria: t('Eleven balls can avoid a pair, so twelve are needed to force one.', 'Sebelas bola bisa menghindari pasangan, jadi butuh dua belas untuk memaksanya.'),
  }
})

/** Q23 — last two digits after operating on 2022 100 times. */
export const RepeatingCycle22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Track the last two digits and find the repeating cycle.', 'Ikuti dua angka terakhir dan cari siklus yang berulang.'),
    items: [
      { text: '22→44, 44→76, 76→56, 56→36, 36→16, 16→96, 96→76…', ok: null },
      { text: t('From step 2 it loops 76, 56, 36, 16, 96 — length 5', 'Mulai langkah 2 ia berputar 76, 56, 36, 16, 96 — panjang 5'), ok: null },
      { text: t('Step 100 lands on 16 in the cycle', 'Langkah ke-100 jatuh di 16 dalam siklus'), ok: null },
      { text: t('Sum of those digits: 1 + 6 = 7', 'Jumlah angka itu: 1 + 6 = 7'), ok: true },
    ],
    final: t('The sum of the last two digits is 7 (A).', 'Jumlah dua angka terakhir adalah 7 (A).'),
    aria: t('Step one hundred ends in 16, so the digit sum is 7.', 'Langkah ke-seratus berakhir 16, jadi jumlah angkanya 7.'),
  }
})

/** Q25 — 1–4 Sudoku with corner forbidden values; sum the shaded cells. */
export const SudokuShaded22P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Eliminate forbidden values, then fill the forced cells.', 'Coret nilai terlarang, lalu isi sel yang terpaksa.'),
    items: [
      { text: t('Each corner note lists numbers a cell can’t be — cross them out', 'Tiap catatan pojok memberi angka yang tidak boleh — coret itu'), ok: null },
      { text: t('Use the rule that 1–4 never repeat in a row, column, or thick box', 'Pakai aturan bahwa 1–4 tak pernah berulang dalam baris, kolom, atau kotak tebal'), ok: null },
      { text: t('Work cell by cell until the whole 4×4 grid is solved', 'Kerjakan sel demi sel sampai seluruh kisi 4×4 terselesaikan'), ok: null },
      { text: t('Add the shaded cells: they total 15', 'Jumlahkan sel yang diarsir: totalnya 15'), ok: true },
    ],
    final: t('The shaded cells sum to 15 (D).', 'Sel-sel yang diarsir berjumlah 15 (D).'),
    aria: t('Solving the grid then adding the shaded cells gives 15.', 'Menyelesaikan kisi lalu menjumlahkan sel yang diarsir menghasilkan 15.'),
  }
})
