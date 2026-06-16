// Try-check explainers for WMI-21F3A (2021 G3 final) text questions.

import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 3273 + 1258 − 2021. */
export const Compute21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('One addition, then one subtraction — line up the place values.', 'Satu penjumlahan, lalu satu pengurangan — sejajarkan nilai tempatnya.'),
    items: [
      { text: '3273 + 1258 = 4531', ok: null },
      { text: '4531 − 2021 = 2510', ok: true },
    ],
    final: t('3273 + 1258 − 2021 = 2510 (C).', '3273 + 1258 − 2021 = 2510 (C).'),
    aria: t('Adding then subtracting gives two thousand five hundred ten.', 'Menjumlah lalu mengurang memberi dua ribu lima ratus sepuluh.'),
  }
})

/** Q2 — digits A, B in 98A75B6 with B = 3A, A odd. */
export const DigitsAB21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('B = 3 × A must still be ONE digit, and A must be odd — try each A.', 'B = 3 × A harus tetap SATU angka, dan A harus ganjil — coba tiap A.'),
    items: [
      { text: t('3 × A ≤ 9 → A can only be 1, 2, or 3', '3 × A ≤ 9 → A hanya bisa 1, 2, atau 3'), ok: null },
      { text: t('A = 1 (odd) → B = 3 → 9817536-style number works', 'A = 1 (ganjil) → B = 3 → bilangannya sah'), ok: true },
      { text: t('A = 2 → even, not allowed', 'A = 2 → genap, tidak boleh'), ok: false },
      { text: t('A = 3 (odd) → B = 9 → works', 'A = 3 (ganjil) → B = 9 → sah'), ok: true },
      { text: t('A = 5 → B = 15: two digits, impossible', 'A = 5 → B = 15: dua angka, mustahil'), ok: false },
    ],
    final: t('Exactly 2 such numbers (B).', 'Tepat 2 bilangan seperti itu (B).'),
    aria: t('Only A equals one and A equals three work, so there are two numbers.', 'Hanya A sama dengan satu dan tiga yang berhasil, jadi ada dua bilangan.'),
  }
})

/** Q3 — 96×9 − 32×9 = 64×9. */
export const FactorNine21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Don’t compute A — both terms share a factor 9.', 'Tak perlu menghitung A — kedua suku punya faktor 9.'),
    items: [
      { text: t('96 × 9 − A = 96 × 9 − 32 × 9', '96 × 9 − A = 96 × 9 − 32 × 9'), ok: null },
      { text: '(96 − 32) × 9 = 64 × 9', ok: null },
      { text: '64 × 9 = 640 − 64 = 576', ok: true },
    ],
    final: t('96 × 9 − A = 576 (C).', '96 × 9 − A = 576 (C).'),
    aria: t('Factoring out nine gives sixty-four times nine, which is five hundred seventy-six.', 'Mengeluarkan faktor sembilan memberi enam puluh empat kali sembilan, yaitu lima ratus tujuh puluh enam.'),
  }
})

/** Q4 — 27 bags × 9 chocolates ÷ 3. */
export const Bundles21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only the chocolates get bundled — the candies are a distraction.', 'Hanya cokelat yang diikat — permen cuma pengecoh.'),
    items: [
      { text: t('Chocolates: 27 × 9 = 243', 'Cokelat: 27 × 9 = 243'), ok: null },
      { text: t('Bundles: 243 ÷ 3 = 81', 'Ikat: 243 ÷ 3 = 81'), ok: true },
      { text: t('Shortcut: 9 per bag = 3 bundles per bag → 27 × 3 = 81 ✓', 'Cara cepat: 9 per bungkus = 3 ikat per bungkus → 27 × 3 = 81 ✓'), ok: null },
    ],
    final: t('81 bundles of chocolates (C).', '81 ikat cokelat (C).'),
    aria: t('Two hundred forty-three chocolates make eighty-one bundles of three.', 'Dua ratus empat puluh tiga cokelat menjadi delapan puluh satu ikat berisi tiga.'),
  }
})

/** Q8 — 7:30 + 1 h 45 min + 40 min. */
export const ClockTrip21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the travel time, then the stay — bridge each full hour.', 'Tambahkan waktu perjalanan, lalu lama di bank — seberangi tiap jam bulat.'),
    items: [
      { text: t('7:30 + 1 hour = 8:30', '07.30 + 1 jam = 08.30'), ok: null },
      { text: t('8:30 + 30 min = 9:00, + 15 min = 9:15 — she arrives', '08.30 + 30 menit = 09.00, + 15 menit = 09.15 — ia tiba'), ok: null },
      { text: t('9:15 + 40 min = 9:55 — she leaves', '09.15 + 40 menit = 09.55 — ia pulang'), ok: true },
    ],
    final: t('She leaves the bank at 9:55 (D).', 'Ia meninggalkan bank pukul 09.55 (D).'),
    aria: t('Seven thirty plus one hour forty-five is nine fifteen; forty minutes later is nine fifty-five.', 'Tujuh tiga puluh tambah satu jam empat puluh lima adalah sembilan lima belas; empat puluh menit kemudian sembilan lima puluh lima.'),
  }
})

/** Q9 — starfish = 7, seahorse = 336 ÷ 7. */
export const Starfish21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the easy equation first to unlock the hard one.', 'Pecahkan persamaan mudah dulu untuk membuka yang sulit.'),
    items: [
      { text: t('★ + ★ + ★ = 21 → ★ = 21 ÷ 3 = 7', '★ + ★ + ★ = 21 → ★ = 21 ÷ 3 = 7'), ok: null },
      { text: t('seahorse = 336 ÷ 7 = 48', 'kuda laut = 336 ÷ 7 = 48'), ok: null },
      { text: t('check: 7 × 48 = 336 ✓', 'periksa: 7 × 48 = 336 ✓'), ok: true },
    ],
    final: t('The seahorse stands for 48 (D).', 'Kuda laut mewakili 48 (D).'),
    aria: t('The starfish is seven, so the seahorse is three hundred thirty-six divided by seven, forty-eight.', 'Bintang laut tujuh, jadi kuda laut adalah tiga ratus tiga puluh enam dibagi tujuh, empat puluh delapan.'),
  }
})

/** Q10 — measure everyone from Mike. */
export const Archery21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Put everyone on one number line, measured from Mike.', 'Letakkan semua orang pada satu garis bilangan, diukur dari Mike.'),
    items: [
      { text: t('Jerry = Mike + 123', 'Jerry = Mike + 123'), ok: null },
      { text: t('“Mike is 115 fewer than Nancy” flips to: Nancy = Mike + 115', '“Mike 115 lebih sedikit dari Nancy” dibalik: Nancy = Mike + 115'), ok: null },
      { text: t('So Jerry is 1st and Nancy is 2nd — Vincent’s 108 can’t split them', 'Jadi Jerry ke-1 dan Nancy ke-2 — 108 milik Vincent tak bisa menyela'), ok: null },
      { text: t('Gap = (Mike + 123) − (Mike + 115) = 8', 'Selisih = (Mike + 123) − (Mike + 115) = 8'), ok: true },
    ],
    final: t('The top two differ by 8 points (B).', 'Dua teratas berselisih 8 poin (B).'),
    aria: t('Jerry is one hundred twenty-three above Mike and Nancy one hundred fifteen, so the gap is eight.', 'Jerry seratus dua puluh tiga di atas Mike dan Nancy seratus lima belas, jadi selisihnya delapan.'),
  }
})

/** Q14 — snake deal A B C D D C B A. */
export const SnakeDeal21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The deal snakes down the line and back: one cycle is 8 cards.', 'Pembagian berkelok maju lalu balik: satu siklus 8 kartu.'),
    items: [
      { text: t('Cycle: A B C D D C B A — Ben holds positions 2 and 7', 'Siklus: A B C D D C B A — Ben di posisi 2 dan 7'), ok: null },
      { text: t('Cycle 1: Ben’s cards are #2 and #7', 'Siklus 1: kartu Ben #2 dan #7'), ok: null },
      { text: t('Cycle 2: 8 + 2 = #10 and 8 + 7 = #15', 'Siklus 2: 8 + 2 = #10 dan 8 + 7 = #15'), ok: null },
      { text: t('Cycle 3: 16 + 2 = #18 and 16 + 7 = #23', 'Siklus 3: 16 + 2 = #18 dan 16 + 7 = #23'), ok: null },
      { text: t('His 6th card is card #23', 'Kartu ke-6 miliknya adalah kartu #23'), ok: true },
    ],
    final: t('23 cards have been dealt (B).', 'Sudah 23 kartu dibagikan (B).'),
    aria: t('Ben receives cards two, seven, ten, fifteen, eighteen and twenty-three; the sixth is twenty-three.', 'Ben menerima kartu dua, tujuh, sepuluh, lima belas, delapan belas, dan dua puluh tiga; yang keenam adalah dua puluh tiga.'),
  }
})

/** Q16 — 77 + 77÷7 + 7×77 − 7. */
export const SevenChain21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Settle every ÷ and × first, only then sweep + and −.', 'Selesaikan semua ÷ dan × dulu, baru sapu + dan −.'),
    items: [
      { text: '77 ÷ 7 = 11', ok: null },
      { text: '7 × 77 = 539', ok: null },
      { text: t('Line becomes 77 + 11 + 539 − 7', 'Barisnya menjadi 77 + 11 + 539 − 7'), ok: null },
      { text: '77 + 11 = 88 → 88 + 539 = 627 → 627 − 7 = 620', ok: true },
    ],
    final: '= 620',
    aria: t('Doing multiplication and division first gives six hundred twenty.', 'Mengerjakan kali dan bagi dulu memberi enam ratus dua puluh.'),
  }
})

/** Q17 — (2+4+…+98) ÷ 25. */
export const EvenSum21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The top is every even number from 2 to 98 — factor out the 2.', 'Pembilangnya semua bilangan genap dari 2 sampai 98 — keluarkan faktor 2.'),
    items: [
      { text: '2 + 4 + … + 98 = 2 × (1 + 2 + … + 49)', ok: null },
      { text: '1 + 2 + … + 49 = 49 × 50 ÷ 2 = 1225', ok: null },
      { text: t('Top = 2 × 1225 = 2450; bottom = 9+7+5+3+1 = 25', 'Pembilang = 2 × 1225 = 2450; penyebut = 9+7+5+3+1 = 25'), ok: null },
      { text: '2450 ÷ 25 = 98', ok: true },
    ],
    final: '= 98',
    aria: t('Two thousand four hundred fifty divided by twenty-five equals ninety-eight.', 'Dua ribu empat ratus lima puluh dibagi dua puluh lima sama dengan sembilan puluh delapan.'),
  }
})

/** Q22 — factor 2021 near its square root. */
export const Factor202121G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Two 2-digit factors must hug √2021 ≈ 45 — test pairs around it.', 'Dua faktor dua-angka pasti dekat √2021 ≈ 45 — uji pasangan di sekitarnya.'),
    items: [
      { text: t('45 × 45 = 2025 — too big by 4', '45 × 45 = 2025 — kelebihan 4'), ok: false },
      { text: '44 × 46 = 2024', ok: false },
      { text: t('43 × 47 = 2021 (ends in 1: 3 × 7 = 21 fits)', '43 × 47 = 2021 (berakhiran 1: 3 × 7 = 21 cocok)'), ok: true },
      { text: '43 + 47 = 90', ok: null },
    ],
    final: t('The sum is 90.', 'Jumlahnya 90.'),
    aria: t('Forty-three times forty-seven is two thousand twenty-one; their sum is ninety.', 'Empat puluh tiga kali empat puluh tujuh adalah dua ribu dua puluh satu; jumlahnya sembilan puluh.'),
  }
})

/** Q23 — A, 2A, 3A using digits 1–9 once. */
export const TripleABC21G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('3A must stay 3-digit, so 123 ≤ A ≤ 329. Sweep from each end.', '3A harus tetap tiga angka, jadi 123 ≤ A ≤ 329. Telusuri dari kedua ujung.'),
    items: [
      { text: t('Largest: 329 → 658, 987 — the 9s and 8s repeat', 'Terbesar: 329 → 658, 987 — angka 9 dan 8 berulang'), ok: false },
      { text: t('328 → 656, 984 — the 6 repeats', '328 → 656, 984 — angka 6 berulang'), ok: false },
      { text: t('327 → 654, 981 — uses 1–9 exactly once → M = 327', '327 → 654, 981 — memakai 1–9 tepat sekali → M = 327'), ok: true },
      { text: t('Smallest: 123 → 246, 369 — 2, 3, 6 repeat', 'Terkecil: 123 → 246, 369 — 2, 3, 6 berulang'), ok: false },
      { text: t('124 … 191 all repeat a digit or need a 0 (checked one by one)', '124 … 191 semuanya mengulang angka atau butuh 0 (dicek satu per satu)'), ok: false },
      { text: t('192 → 384, 576 — uses 1–9 exactly once → m = 192', '192 → 384, 576 — memakai 1–9 tepat sekali → m = 192'), ok: true },
      { text: 'M + m = 327 + 192 = 519', ok: null },
    ],
    final: t('M + m = 519.', 'M + m = 519.'),
    aria: t('The largest A is three hundred twenty-seven, the smallest one hundred ninety-two; their sum is five hundred nineteen.', 'A terbesar tiga ratus dua puluh tujuh, terkecil seratus sembilan puluh dua; jumlahnya lima ratus sembilan belas.'),
  }
})
