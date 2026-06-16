import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-20F1A — deduction chains for the pure-arithmetic Grade-1 questions.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q2 — vertical 13 − 7: subtract down to ten first. */
export const SubToTen20Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The minus sign means take away — break the 7 so you pass through ten.', 'Tanda minus berarti mengurangi — pecah angka 7 agar lewat sepuluh.'),
    items: [
      { text: t('13 + 7 = 20? No — minus means take away, not add', '13 + 7 = 20? Bukan — minus berarti mengurangi, bukan menambah'), ok: false },
      { text: t('Break 7 into 3 + 4. First: 13 − 3 = 10', 'Pecah 7 menjadi 3 + 4. Pertama: 13 − 3 = 10'), ok: null },
      { text: '10 − 4 = 6', ok: true },
    ],
    final: t('13 − 7 = 6 (D).', '13 − 7 = 6 (D).'),
    aria: t('Subtracting down to ten gives 13 minus 7 equals 6.', 'Mengurangi sampai sepuluh memberi 13 kurang 7 sama dengan 6.'),
  }
})

/** Q5 — count the even numbers among 22, 15, 3, 8, 47, 19, 33, 10, 42. */
export const EvenCount20Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only the ONES digit decides even or odd: even numbers end in 0, 2, 4, 6, or 8.', 'Hanya angka SATUAN yang menentukan genap atau ganjil: bilangan genap berakhiran 0, 2, 4, 6, atau 8.'),
    items: [
      { text: t('22, 8, 10, 42 end in 2, 8, 0, 2 → even', '22, 8, 10, 42 berakhiran 2, 8, 0, 2 → genap'), ok: true },
      { text: t('15, 3, 47, 19, 33 end in 5, 3, 7, 9, 3 → odd', '15, 3, 47, 19, 33 berakhiran 5, 3, 7, 9, 3 → ganjil'), ok: false },
      { text: t('Count the evens: 22, 8, 10, 42 — that is 4', 'Hitung yang genap: 22, 8, 10, 42 — ada 4'), ok: true },
    ],
    final: t('There are 4 even numbers (A).', 'Ada 4 bilangan genap (A).'),
    aria: t('Checking the ones digits, exactly four numbers are even.', 'Memeriksa angka satuan, tepat empat bilangan genap.'),
  }
})

/** Q11 — 10 − 8 + 6 □ = 16: compute the left side, then find the gap. */
export const BoxToSixteen20Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('First work out what the left side already makes, left to right.', 'Hitung dulu hasil sisi kiri, dari kiri ke kanan.'),
    items: [
      { text: '10 − 8 = 2', ok: null },
      { text: '2 + 6 = 8', ok: null },
      { text: t('We have 8 and need 16: the gap is 16 − 8 = 8', 'Kita punya 8 dan butuh 16: selisihnya 16 − 8 = 8'), ok: null },
      { text: t('Check: 10 − 8 + 6 + 8 = 16 ✓', 'Cek: 10 − 8 + 6 + 8 = 16 ✓'), ok: true },
    ],
    final: t('The box is + 8 (D).', 'Kotaknya + 8 (D).'),
    aria: t('The left side makes 8, so plus 8 reaches 16.', 'Sisi kiri menghasilkan 8, jadi tambah 8 mencapai 16.'),
  }
})

/** Q18 — 41 + 19 − 31 − 9: pair the numbers that subtract neatly. */
export const FriendlyPairs20Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Look for friendly pairs before computing left to right.', 'Cari pasangan yang cocok sebelum menghitung dari kiri ke kanan.'),
    items: [
      { text: t('Pair 41 with − 31: 41 − 31 = 10', 'Pasangkan 41 dengan − 31: 41 − 31 = 10'), ok: null },
      { text: t('Pair 19 with − 9: 19 − 9 = 10', 'Pasangkan 19 dengan − 9: 19 − 9 = 10'), ok: null },
      { text: '10 + 10 = 20', ok: true },
    ],
    final: t('41 + 19 − 31 − 9 = 20.', '41 + 19 − 31 − 9 = 20.'),
    aria: t('Pairing 41 with 31 and 19 with 9 gives 10 plus 10 equals 20.', 'Memasangkan 41 dengan 31 dan 19 dengan 9 memberi 10 tambah 10 sama dengan 20.'),
  }
})
