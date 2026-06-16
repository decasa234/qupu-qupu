import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-25F1A (2025 Grade 1 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q3 — how many of the story's numbers are odd. */
export const OddCount25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pick out every number in the story, then keep only the odd ones.', 'Ambil setiap bilangan dalam cerita, lalu simpan yang ganjil saja.'),
    items: [
      { text: t('Numbers: 7, 26, 19, 37, 8, 15, 40', 'Bilangan: 7, 26, 19, 37, 8, 15, 40'), ok: null },
      { text: t('Odd ones (end in 1,3,5,7,9): 7, 19, 37, 15', 'Yang ganjil (berakhir 1,3,5,7,9): 7, 19, 37, 15'), ok: null },
      { text: t('Count: 4', 'Hitung: 4'), ok: true },
    ],
    final: t('There are 4 odd numbers (A).', 'Ada 4 bilangan ganjil (A).'),
    aria: t('Of the seven numbers, four are odd: 7, 19, 37, 15.', 'Dari tujuh bilangan, empat ganjil: 7, 19, 37, 15.'),
  }
})

/** Q4 — middle of five expressions by result. */
export const MiddleExpr25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every result, sort largest to smallest, then take the middle one.', 'Hitung tiap hasil, urutkan terbesar ke terkecil, lalu ambil yang tengah.'),
    items: [
      { text: 'A 4+9=13, B 15−4=11, C 12+6=18, D 18−9=9, E 7+7=14', ok: null },
      { text: t('Sorted: 18, 14, 13, 11, 9', 'Terurut: 18, 14, 13, 11, 9'), ok: null },
      { text: t('The middle (3rd) is 13 = A', 'Yang tengah (ke-3) adalah 13 = A'), ok: true },
    ],
    final: t('The middle expression is 4 + 9 = 13 (A).', 'Perhitungan tengah adalah 4 + 9 = 13 (A).'),
    aria: t('Sorted, the middle result is 13, which is 4 plus 9.', 'Terurut, hasil tengah adalah 13, yaitu 4 tambah 9.'),
  }
})

/** Q9 — possible total for 5 flowers at $7 and $5. */
export const FlowerCost25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('If r of the 5 flowers are red, the cost is 7r + 5(5 − r) = 2r + 25.', 'Jika r dari 5 bunga merah, biayanya 7r + 5(5 − r) = 2r + 25.'),
    items: [
      { text: t('Possible totals: 25, 27, 29, 31, 33, 35 (always odd)', 'Total yang mungkin: 25, 27, 29, 31, 33, 35 (selalu ganjil)'), ok: null },
      { text: t('31 is in the list (r = 3)', '31 ada di daftar (r = 3)'), ok: true },
    ],
    final: t('She might pay 31 dollars (C).', 'Ia mungkin membayar 31 dolar (C).'),
    aria: t('The totals go up by two from 25, and 31 is one of them.', 'Total naik dua dari 25, dan 31 salah satunya.'),
  }
})

/** Q11 — largest minus smallest 2-digit number with digit-sum 8. */
export const DigitSumEight25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the 2-digit numbers whose digits add to 8, then subtract the extremes.', 'Daftar bilangan 2 angka yang angkanya berjumlah 8, lalu kurangkan ujung-ujungnya.'),
    items: [
      { text: '17, 26, 35, 44, 53, 62, 71, 80', ok: null },
      { text: t('Largest = 80, smallest = 17', 'Terbesar = 80, terkecil = 17'), ok: null },
      { text: '80 − 17 = 63', ok: true },
    ],
    final: t('The difference is 63 (E).', 'Selisihnya 63 (E).'),
    aria: t('Eighty minus seventeen is sixty-three.', 'Delapan puluh kurang tujuh belas adalah enam puluh tiga.'),
  }
})

/** Q18 — new bus passengers left standing. */
export const BusStanding25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only some of the 5 empty seats got filled — 2 are still empty afterward.', 'Hanya sebagian dari 5 kursi kosong yang terisi — 2 masih kosong setelahnya.'),
    items: [
      { text: t('Seats taken: 5 − 2 = 3 passengers sat down', 'Kursi terisi: 5 − 2 = 3 penumpang duduk'), ok: null },
      { text: t('Standing: 9 − 3 = 6', 'Berdiri: 9 − 3 = 6'), ok: true },
    ],
    final: t('6 of the new passengers are standing.', '6 penumpang baru berdiri.'),
    aria: t('Three of the nine sat down, so six are standing.', 'Tiga dari sembilan duduk, jadi enam berdiri.'),
  }
})

/** Q19 — change in "answered" over 20 minutes. */
export const AnsweredGap25G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write “answered” at both moments, then subtract to get the change.', 'Tulis “dijawab” di kedua waktu, lalu kurangkan untuk dapat perubahannya.'),
    items: [
      { text: t('Now: answered = (total + 4) ÷ 2', 'Sekarang: dijawab = (total + 4) ÷ 2'), ok: null },
      { text: t('20 min ago: answered = (total − 4) ÷ 2', '20 menit lalu: dijawab = (total − 4) ÷ 2'), ok: null },
      { text: t('Change = (total+4)/2 − (total−4)/2 = 8 ÷ 2 = 4', 'Perubahan = (total+4)/2 − (total−4)/2 = 8 ÷ 2 = 4'), ok: true },
    ],
    final: t('Andrew answered 4 problems in those 20 minutes.', 'Andrew menjawab 4 soal dalam 20 menit itu.'),
    aria: t('The answered count rose by four, no matter the total.', 'Jumlah yang dijawab naik empat, berapa pun totalnya.'),
  }
})
