import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-22F1A (2022 Grade 1 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q3 — total legs of 2 cats, 3 chickens, 1 spider (spider has 8). */
export const AnimalLegs22G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count each animal’s legs, then add the groups together.', 'Hitung kaki tiap hewan, lalu jumlahkan kelompoknya.'),
    items: [
      { text: t('2 cats × 4 legs = 8 legs', '2 kucing × 4 kaki = 8 kaki'), ok: null },
      { text: t('3 chickens × 2 legs = 6 legs', '3 ayam × 2 kaki = 6 kaki'), ok: null },
      { text: t('1 spider × 8 legs = 8 legs (a spider has 8, not 6!)', '1 laba-laba × 8 kaki = 8 kaki (laba-laba punya 8, bukan 6!)'), ok: null },
      { text: '8 + 6 + 8 = 22', ok: true },
    ],
    final: t('Altogether there are 22 legs (A).', 'Seluruhnya ada 22 kaki (A).'),
    aria: t('Eight cat legs plus six chicken legs plus eight spider legs is 22.', 'Delapan kaki kucing plus enam kaki ayam plus delapan kaki laba-laba adalah 22.'),
  }
})

/** Q6 — lucky number: odd, 15–71, digits add to 10. */
export const LuckyNumber22G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Test each choice against all three rules: odd, between 15 and 71, digits add to 10.', 'Uji tiap pilihan dengan ketiga aturan: ganjil, antara 15 dan 71, jumlah angka 10.'),
    items: [
      { text: t('64 is even — a lucky number must be odd', '64 genap — bilangan keberuntungan harus ganjil'), ok: false },
      { text: t('73 is bigger than 71 — out of range', '73 lebih besar dari 71 — di luar jangkauan'), ok: false },
      { text: t('29 is odd and in range, but 2 + 9 = 11, not 10', '29 ganjil dan dalam jangkauan, tapi 2 + 9 = 11, bukan 10'), ok: false },
      { text: t('55 is odd, in range, and 5 + 5 = 10', '55 ganjil, dalam jangkauan, dan 5 + 5 = 10'), ok: true },
    ],
    final: t('Only 55 fits every rule (C).', 'Hanya 55 yang memenuhi semua aturan (C).'),
    aria: t('Checking the rules, only 55 is odd, in range, and has digits adding to 10.', 'Memeriksa aturannya, hanya 55 yang ganjil, dalam jangkauan, dan jumlah angkanya 10.'),
  }
})

/** Q20 — new operation ☼: sum from a up to (b−1), then subtract b. Find 4 ☼ 9. */
export const CustomOp22G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the rule from the examples: add from the first number up to ONE BEFORE the second, then subtract the second.', 'Temukan aturannya dari contoh: jumlahkan dari bilangan pertama sampai SATU SEBELUM yang kedua, lalu kurangi yang kedua.'),
    items: [
      { text: t('Check 2 ☼ 5 = 2 + 3 + 4 − 5 = 4 ✓ (stop at 4, one before 5)', 'Cek 2 ☼ 5 = 2 + 3 + 4 − 5 = 4 ✓ (berhenti di 4, satu sebelum 5)'), ok: null },
      { text: t('So 4 ☼ 9 = 4 + 5 + 6 + 7 + 8 − 9 (stop at 8)', 'Jadi 4 ☼ 9 = 4 + 5 + 6 + 7 + 8 − 9 (berhenti di 8)'), ok: null },
      { text: '4 + 5 + 6 + 7 + 8 = 30', ok: null },
      { text: '30 − 9 = 21', ok: true },
    ],
    final: t('4 ☼ 9 = 21. Don’t add the 9 itself — the rule stops one number before it!', '4 ☼ 9 = 21. Jangan tambahkan 9-nya — aturannya berhenti satu bilangan sebelumnya!'),
    aria: t('Summing 4 through 8 gives 30, then subtracting 9 gives 21.', 'Menjumlahkan 4 sampai 8 memberi 30, lalu mengurangi 9 memberi 21.'),
  }
})
