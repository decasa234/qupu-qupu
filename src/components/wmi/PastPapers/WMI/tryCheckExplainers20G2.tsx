import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-20F2A — deduction chains for the pure-arithmetic Grade-2 questions.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 42 + 36 + 5, worked left to right. */
export const ComputeChain20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add left to right — tens first, then ones.', 'Jumlahkan dari kiri ke kanan — puluhan dulu, lalu satuan.'),
    items: [
      { text: '42 + 36 = 78', ok: null },
      { text: '78 + 5 = 83', ok: true },
    ],
    final: t('42 + 36 + 5 = 83 (D).', '42 + 36 + 5 = 83 (D).'),
    aria: t('Adding left to right gives 83.', 'Dijumlahkan dari kiri ke kanan hasilnya 83.'),
  }
})

/** Q4 — order 205, 230, 422, 501 from smallest to largest. */
export const OrderNumbers20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the HUNDREDS digit first; only equal hundreds need a closer look.', 'Bandingkan angka RATUSAN dulu; hanya ratusan yang sama yang perlu dilihat lebih dekat.'),
    items: [
      { text: t('Hundreds: A=2, C=2, B=4, D=5 → A and C come first, then B, then D', 'Ratusan: A=2, C=2, B=4, D=5 → A dan C duluan, lalu B, lalu D'), ok: null },
      { text: t('A 205 vs C 230 — tens: 0 < 3 → A before C', 'A 205 vs C 230 — puluhan: 0 < 3 → A sebelum C'), ok: null },
      { text: t('Order: 205 < 230 < 422 < 501 → A, C, B, D', 'Urutan: 205 < 230 < 422 < 501 → A, C, B, D'), ok: true },
    ],
    final: t('Smallest to largest: ACBD (A).', 'Terkecil ke terbesar: ACBD (A).'),
    aria: t('Comparing hundreds then tens gives the order A C B D.', 'Membandingkan ratusan lalu puluhan memberi urutan A C B D.'),
  }
})

/** Q6 — ◻ − 31 = 64 − 20. */
export const MissingMinuend20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out the easy side first, then undo the subtraction.', 'Hitung sisi yang mudah dulu, lalu balikkan pengurangannya.'),
    items: [
      { text: t('Right side: 64 − 20 = 44', 'Sisi kanan: 64 − 20 = 44'), ok: null },
      { text: t('So ◻ − 31 = 44', 'Jadi ◻ − 31 = 44'), ok: null },
      { text: t('Taking away 31 left 44 → ◻ = 44 + 31 = 75', 'Setelah diambil 31 tersisa 44 → ◻ = 44 + 31 = 75'), ok: null },
      { text: t('Check: 75 − 31 = 44 ✓', 'Periksa: 75 − 31 = 44 ✓'), ok: true },
    ],
    final: t('◻ = 75 (C).', '◻ = 75 (C).'),
    aria: t('The right side is 44, so the box is 44 plus 31, which is 75.', 'Sisi kanan 44, jadi kotaknya 44 tambah 31, yaitu 75.'),
  }
})

/** Q9 — which product fits 40 < ◻ < 55? Try each. */
export const ProductRange20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The box must be MORE than 40 and LESS than 55. Try every choice!', 'Kotaknya harus LEBIH dari 40 dan KURANG dari 55. Coba semua pilihan!'),
    items: [
      { text: t('A: 9 × 7 = 63 — too big (63 > 55)', 'A: 9 × 7 = 63 — terlalu besar (63 > 55)'), ok: false },
      { text: t('B: 5 × 4 = 20 — too small (20 < 40)', 'B: 5 × 4 = 20 — terlalu kecil (20 < 40)'), ok: false },
      { text: t('C: 6 × 3 = 18 — too small (18 < 40)', 'C: 6 × 3 = 18 — terlalu kecil (18 < 40)'), ok: false },
      { text: t('D: 7 × 7 = 49 — and 40 < 49 < 55 ✓', 'D: 7 × 7 = 49 — dan 40 < 49 < 55 ✓'), ok: true },
    ],
    final: t('Only 7 × 7 = 49 fits between 40 and 55 (D).', 'Hanya 7 × 7 = 49 yang berada di antara 40 dan 55 (D).'),
    aria: t('Trying every choice, only 49 lies between 40 and 55.', 'Mencoba semua pilihan, hanya 49 yang ada di antara 40 dan 55.'),
  }
})

/** Q11 — 8 sections and 4 ticks of the minute hand. */
export const MinuteTicks20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('1 section = 5 minutes, 1 tick = 1 minute. Count each part.', '1 ruas = 5 menit, 1 garis kecil = 1 menit. Hitung tiap bagian.'),
    items: [
      { text: t('8 sections: 8 × 5 = 40 minutes', '8 ruas: 8 × 5 = 40 menit'), ok: null },
      { text: t('4 ticks: 4 × 1 = 4 minutes', '4 garis kecil: 4 × 1 = 4 menit'), ok: null },
      { text: t('Together: 40 + 4 = 44 minutes', 'Jumlahnya: 40 + 4 = 44 menit'), ok: true },
    ],
    final: t('It takes 44 minutes (C).', 'Lamanya 44 menit (C).'),
    aria: t('Eight sections is forty minutes and four ticks is four: forty-four.', 'Delapan ruas itu empat puluh menit dan empat garis itu empat: empat puluh empat.'),
  }
})

/** Q13 — find the 3-digit even number; check every clue on every choice. */
export const DigitClues20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Three clues: EVEN, tens = 3 × hundreds, tens + units > 10. Test each choice!', 'Tiga petunjuk: GENAP, puluhan = 3 × ratusan, puluhan + satuan > 10. Uji setiap pilihan!'),
    items: [
      { text: t('A 938: tens 3, hundreds 9 — but 3 ≠ 3 × 9', 'A 938: puluhan 3, ratusan 9 — tapi 3 ≠ 3 × 9'), ok: false },
      { text: t('B 390: 9 = 3 × 3 ✓ even ✓ — but 9 + 0 = 9, not more than 10', 'B 390: 9 = 3 × 3 ✓ genap ✓ — tapi 9 + 0 = 9, tidak lebih dari 10'), ok: false },
      { text: t('C 265: ends in 5 — not even', 'C 265: berakhiran 5 — bukan genap'), ok: false },
      { text: t('D 138: even ✓, 3 = 3 × 1 ✓, 3 + 8 = 11 > 10 ✓', 'D 138: genap ✓, 3 = 3 × 1 ✓, 3 + 8 = 11 > 10 ✓'), ok: true },
    ],
    final: t('Only 138 passes all three clues (D).', 'Hanya 138 yang lolos ketiga petunjuk (D).'),
    aria: t('Checking the clues one by one, only 138 fits.', 'Memeriksa petunjuk satu per satu, hanya 138 yang cocok.'),
  }
})

/** Q16 — 5 × 5 + 5 + 5 + 5 × 5: multiply BEFORE adding. */
export const OrderOps20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Rule: do the × parts FIRST, then add everything.', 'Aturan: kerjakan bagian × DULU, baru jumlahkan semuanya.'),
    items: [
      { text: '5 × 5 = 25', ok: null },
      { text: t('The other 5 × 5 = 25 too', '5 × 5 yang satunya = 25 juga'), ok: null },
      { text: t('Now add: 25 + 5 + 5 + 25', 'Sekarang jumlahkan: 25 + 5 + 5 + 25'), ok: null },
      { text: '25 + 5 + 5 + 25 = 60', ok: true },
    ],
    final: t('5 × 5 + 5 + 5 + 5 × 5 = 60. (Left-to-right without the rule gives the wrong answer!)', '5 × 5 + 5 + 5 + 5 × 5 = 60. (Mengerjakan dari kiri tanpa aturan memberi jawaban salah!)'),
    aria: t('Multiplying first gives twenty-five twice, then the sum is sixty.', 'Mengalikan dulu memberi dua puluh lima dua kali, lalu jumlahnya enam puluh.'),
  }
})

/** Q17 — largest/smallest 4-digit EVEN numbers from 0,1,2,5. */
export const EvenExtremes20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('EVEN means the LAST digit is 0 or 2. Build each number greedily, then check.', 'GENAP berarti angka TERAKHIR 0 atau 2. Susun tiap bilangan dengan rakus, lalu periksa.'),
    items: [
      { text: t('Largest: try 5210 — even ✓ (5201 is odd ✗)', 'Terbesar: coba 5210 — genap ✓ (5201 ganjil ✗)'), ok: true },
      { text: t('Smallest: cannot start with 0 → start with 1; try 1025 — odd ✗', 'Terkecil: tak boleh diawali 0 → mulai dengan 1; coba 1025 — ganjil ✗'), ok: false },
      { text: t('Next smallest: 1052 — even ✓', 'Berikutnya: 1052 — genap ✓'), ok: true },
      { text: t('Difference: 5210 − 1052 = 4158', 'Selisih: 5210 − 1052 = 4158'), ok: true },
    ],
    final: t('5210 − 1052 = 4158.', '5210 − 1052 = 4158.'),
    aria: t('The largest even number is 5210 and the smallest is 1052; the difference is 4158.', 'Bilangan genap terbesar 5210 dan terkecil 1052; selisihnya 4158.'),
  }
})

/** Q24 — choose 6 cards summing 62 ⇔ drop 3 cards summing 29. */
export const CardCombos20G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All 9 cards add to 91. Keeping 6 that sum 62 means DROPPING 3 that sum 91 − 62 = 29!', 'Kesembilan kartu berjumlah 91. Menyimpan 6 kartu berjumlah 62 berarti MEMBUANG 3 kartu berjumlah 91 − 62 = 29!'),
    items: [
      { text: t('Drop {26, 2, 1}: 26 + 2 + 1 = 29 ✓', 'Buang {26, 2, 1}: 26 + 2 + 1 = 29 ✓'), ok: true },
      { text: t('Drop {20, 6, 3}: 20 + 6 + 3 = 29 ✓', 'Buang {20, 6, 3}: 20 + 6 + 3 = 29 ✓'), ok: true },
      { text: t('Drop {20, 7, 2}: 20 + 7 + 2 = 29 ✓', 'Buang {20, 7, 2}: 20 + 7 + 2 = 29 ✓'), ok: true },
      { text: t('Drop {14, 12, 3}: 14 + 12 + 3 = 29 ✓', 'Buang {14, 12, 3}: 14 + 12 + 3 = 29 ✓'), ok: true },
      { text: t('No others: with 26 only 1+2 works; with 20 only 6+3 and 7+2; with 14 only 12+3; without big cards the three largest left are 12+7+6 = 25 < 29.', 'Tidak ada lagi: dengan 26 hanya 1+2; dengan 20 hanya 6+3 dan 7+2; dengan 14 hanya 12+3; tanpa kartu besar tiga terbesar sisanya 12+7+6 = 25 < 29.'), ok: null },
    ],
    final: t('4 ways.', '4 cara.'),
    aria: t('Dropping three cards that sum twenty-nine can be done in exactly four ways.', 'Membuang tiga kartu berjumlah dua puluh sembilan hanya bisa dengan empat cara.'),
  }
})
