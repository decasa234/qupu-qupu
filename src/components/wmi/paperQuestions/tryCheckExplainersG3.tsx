import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-19F3A — deduction chains for the pure-arithmetic Grade-3 questions.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 971 − 354 + 28 − 10, worked left to right. */
export const ComputeChainG3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('No × or ÷ here — just work left to right.', 'Tidak ada × atau ÷ — kerjakan saja dari kiri ke kanan.'),
    items: [
      { text: '971 − 354 = 617', ok: null },
      { text: '617 + 28 = 645', ok: null },
      { text: '645 − 10 = 635', ok: true },
    ],
    final: t('971 − 354 + 28 − 10 = 635 (C).', '971 − 354 + 28 − 10 = 635 (C).'),
    aria: t('Working left to right gives 635.', 'Dikerjakan dari kiri ke kanan hasilnya 635.'),
  }
})

/** Q5 — ages 7, 7, 11; count the sum year by year until it reaches 37. */
export const AgesSumG3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Now: Julia 7, Paul 7, William 11 → the sum is 7 + 7 + 11 = 25. Count year by year!', 'Sekarang: Julia 7, Paul 7, William 11 → jumlahnya 7 + 7 + 11 = 25. Hitung tahun demi tahun!'),
    items: [
      { text: t('After 1 year: 8 + 8 + 12 = 28', 'Setelah 1 tahun: 8 + 8 + 12 = 28'), ok: null },
      { text: t('After 2 years: 9 + 9 + 13 = 31', 'Setelah 2 tahun: 9 + 9 + 13 = 31'), ok: null },
      { text: t('After 3 years: 10 + 10 + 14 = 34', 'Setelah 3 tahun: 10 + 10 + 14 = 34'), ok: null },
      { text: t('After 4 years: 11 + 11 + 15 = 37', 'Setelah 4 tahun: 11 + 11 + 15 = 37'), ok: true },
    ],
    final: t('In 4 years (D). Shortcut: the sum grows by 3 each year, so (37 − 25) ÷ 3 = 4.', 'Dalam 4 tahun (D). Cara cepat: jumlahnya bertambah 3 tiap tahun, jadi (37 − 25) ÷ 3 = 4.'),
    aria: t('Counting year by year, the ages reach a sum of 37 after 4 years.', 'Menghitung tahun demi tahun, jumlah umur mencapai 37 setelah 4 tahun.'),
  }
})

/** Q13 — Jason mistook × for + and got 51; find the real product. */
export const MistakenSignG3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the MISTAKE to find ◻ first, then do the real problem.', 'Pakai KESALAHANNYA untuk menemukan ◻ dulu, lalu kerjakan soal aslinya.'),
    items: [
      { text: t('Jason computed 43 + ◻ = 51', 'Jason menghitung 43 + ◻ = 51'), ok: null },
      { text: '◻ = 51 − 43 = 8', ok: null },
      { text: t('The real problem is 43 × 8', 'Soal aslinya adalah 43 × 8'), ok: null },
      { text: '43 × 8 = 344', ok: true },
    ],
    final: t('The correct answer is 344 (A).', 'Jawaban yang benar adalah 344 (A).'),
    aria: t('The box is 8, so the real product is 344.', 'Kotaknya 8, jadi hasil kali sebenarnya 344.'),
  }
})

/** Q15 — ◻ × 4 = ◯ × 3 and ◯ × 7 = 112 × 3; find ◻. */
export const TwoEquationsG3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Start from the equation with only ONE unknown.', 'Mulai dari persamaan yang punya SATU bilangan tak diketahui.'),
    items: [
      { text: '◯ × 7 = 112 × 3 = 336', ok: null },
      { text: '◯ = 336 ÷ 7 = 48', ok: null },
      { text: '◻ × 4 = ◯ × 3 = 48 × 3 = 144', ok: null },
      { text: '◻ = 144 ÷ 4 = 36', ok: true },
    ],
    final: t('◻ = 36 (D).', '◻ = 36 (D).'),
    aria: t('Circle is 48, so square is 144 divided by 4, which is 36.', 'Lingkaran 48, jadi persegi 144 dibagi 4, yaitu 36.'),
  }
})

/** Q6 — second largest: estimate first, only compute the close race. */
export const SecondLargestResultG3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Faster than computing one by one: SIZE-check each choice first.', 'Lebih cepat daripada menghitung satu-satu: TAKSIR dulu ukuran tiap pilihan.'),
    items: [
      { text: t('A: × 2 × 5 is × 10 → 43 × 10 = 430. Hundreds — clearly the LARGEST.', 'A: × 2 × 5 sama dengan × 10 → 43 × 10 = 430. Ratusan — jelas yang TERBESAR.'), ok: null },
      { text: t('B: ÷ 7 then ÷ 3 shrinks 84 twice → only 4. Out of the race.', 'B: ÷ 7 lalu ÷ 3 mengecilkan 84 dua kali → cuma 4. Tersingkir.'), ok: false },
      { text: t('So 2nd place is C vs D — only these need computing: C = 88 ÷ 4 = 22, D = 13 × 3 = 39.', 'Jadi posisi ke-2 antara C dan D — hanya ini yang perlu dihitung: C = 88 ÷ 4 = 22, D = 13 × 3 = 39.'), ok: null },
      { text: t('39 > 22 → the second largest is D.', '39 > 22 → kedua terbesar adalah D.'), ok: true },
    ],
    final: t('Second largest: 78 ÷ 6 × 3 = 39 (D). Estimate sizes first — only the close race needs real computing.', 'Kedua terbesar: 78 ÷ 6 × 3 = 39 (D). Taksir dulu ukurannya — hanya yang bersaing ketat yang perlu dihitung sungguhan.'),
    aria: t('A is clearly largest and B tiny; comparing C and D, 39 is second largest.', 'A jelas terbesar dan B kecil; membandingkan C dan D, 39 kedua terbesar.'),
  }
})

