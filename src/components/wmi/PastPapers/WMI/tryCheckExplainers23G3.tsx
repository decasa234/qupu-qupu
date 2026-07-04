import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-23F3A (2023 Grade 3 Final) — deduction-chain explainers for the
// non-figure questions. Q12 is blocked (missing calendar-shape figure) and is
// not here. Q14 (tribe bar-notation) was un-blocked once the OCR-dropped
// overbars were reconstructed: 5 2̄ 3 6̄ (=4824) − 3 4̄ 7̄ 1 (=2531) = 2293.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 10000 − 23 − 203 − 2023. */
export const SubtractMany23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add up everything being taken away, then subtract just once.', 'Jumlahkan semua yang dikurangkan, lalu kurangi sekali saja.'),
    items: [
      { text: '23 + 203 + 2023 = 2249', ok: null },
      { text: '10000 − 2249 = 7751', ok: true },
    ],
    final: t('The answer is 7751 (C).', 'Jawabannya 7751 (C).'),
    aria: t('The three numbers add to 2249, and 10000 minus 2249 is 7751.', 'Tiga bilangan berjumlah 2249, dan 10000 dikurangi 2249 adalah 7751.'),
  }
})

/** Q3 — milk over Mon–Fri in twelfths. */
export const MilkTotal23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count each day’s milk in twelfths, then add.', 'Hitung susu tiap hari dalam perdua belas, lalu jumlahkan.'),
    items: [
      { text: t('Mon, Wed, Fri: 3 × 1/12 = 3/12 L', 'Sen, Rab, Jum: 3 × 1/12 = 3/12 L'), ok: null },
      { text: t('Tue, Thu: 2 × 3/12 = 6/12 L', 'Sel, Kam: 2 × 3/12 = 6/12 L'), ok: null },
      { text: '3/12 + 6/12 = 9/12 L', ok: true },
    ],
    final: t('She drinks 9/12 L from Monday to Friday (E).', 'Ia minum 9/12 L dari Senin sampai Jumat (E).'),
    aria: t('Three twelfths plus six twelfths is nine twelfths.', 'Tiga perdua belas tambah enam perdua belas adalah sembilan perdua belas.'),
  }
})

/** Q6 — pages left after a week at 58/day. */
export const PagesLeft23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the daily rate, total this week, then subtract from 463.', 'Cari kecepatan harian, total minggu ini, lalu kurangi dari 463.'),
    items: [
      { text: t('Rate: 174 ÷ 3 = 58 pages a day', 'Kecepatan: 174 ÷ 3 = 58 halaman per hari'), ok: null },
      { text: t('4 more days: 4 × 58 = 232, so this week 174 + 232 = 406', '4 hari lagi: 4 × 58 = 232, jadi minggu ini 174 + 232 = 406'), ok: null },
      { text: '463 − 406 = 57', ok: true },
    ],
    final: t('57 pages are left for next week (A).', 'Tersisa 57 halaman untuk minggu depan (A).'),
    aria: t('At 58 a day he finishes 406, leaving 57 of 463.', 'Dengan 58 per hari ia menyelesaikan 406, menyisakan 57 dari 463.'),
  }
})

/** Q9 — 6-digit numbers, 9 in ten-thousands and 5 in hundreds; digit sum of M. */
export const DigitDiff23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep 9 in the ten-thousands place and 5 in the hundreds; arrange 0, 1, 3, 7 in the other spots.', 'Tetap 9 di puluhan ribu dan 5 di ratusan; susun 0, 1, 3, 7 di tempat lain.'),
    items: [
      { text: t('Largest: 793510', 'Terbesar: 793510'), ok: null },
      { text: t('Smallest (can’t start with 0): 190537', 'Terkecil (tak boleh diawali 0): 190537'), ok: null },
      { text: t('M = 793510 − 190537 = 602973; digit sum 6+0+2+9+7+3 = 27', 'M = 793510 − 190537 = 602973; jumlah angka 6+0+2+9+7+3 = 27'), ok: true },
    ],
    final: t('The digit sum of M is 27 (D).', 'Jumlah angka M adalah 27 (D).'),
    aria: t('The difference 602973 has digits adding to 27.', 'Selisih 602973 angkanya berjumlah 27.'),
  }
})

/** Q10 — swapped first two digits of the dividend; divisor 6. */
export const SwapDivide23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Rebuild the wrong dividend, un-swap the first two digits, then divide again.', 'Bangun ulang bilangan yang dibagi yang salah, kembalikan dua angka pertama, lalu bagi lagi.'),
    items: [
      { text: t('Wrong dividend = 576 × 6 = 3456', 'Yang dibagi (salah) = 576 × 6 = 3456'), ok: null },
      { text: t('Un-swap the first two digits: 3456 → 4356', 'Kembalikan dua angka pertama: 3456 → 4356'), ok: null },
      { text: '4356 ÷ 6 = 726', ok: true },
    ],
    final: t('The correct quotient is 726 (D).', 'Hasil bagi yang benar adalah 726 (D).'),
    aria: t('Un-swapping 3456 to 4356 and dividing by 6 gives 726.', 'Mengembalikan 3456 jadi 4356 dan membagi 6 memberi 726.'),
  }
})

/** Q14 — tribe bar-notation subtraction: 5 2̄ 3 6̄ − 3 4̄ 7̄ 1. */
export const TribeBars23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A barred digit counts as MINUS at its place value. Translate both tribe numerals first.', 'Angka bergaris dihitung MINUS pada nilai tempatnya. Terjemahkan dulu kedua bilangan suku.'),
    items: [
      { text: '5 2̄ 3 6̄ = 5000 − 200 + 30 − 6 = 4824', ok: null },
      { text: '3 4̄ 7̄ 1 = 3000 − 400 − 70 + 1 = 2531', ok: null },
      { text: '4824 − 2531 = 2293', ok: true },
    ],
    final: t('The result represents 2293 (B).', 'Hasilnya mewakili 2293 (B).'),
    aria: t('The first numeral is 4824 and the second is 2531; their difference is 2293.', 'Bilangan pertama 4824 dan kedua 2531; selisihnya 2293.'),
  }
})

/** Q16 — 2024 × 2421 − 2023 × 2420 by one-more expansion. */
export const ProductCancel23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write each big factor as “one more”, expand, and watch the huge product cancel.', 'Tulis tiap faktor besar sebagai “satu lebih”, kembangkan, dan lihat hasil kali besar saling meniadakan.'),
    items: [
      { text: '2024 = 2023 + 1, 2421 = 2420 + 1', ok: null },
      { text: '(2023+1)(2420+1) = 2023×2420 + 2023 + 2420 + 1', ok: null },
      { text: t('Subtract 2023×2420 — it cancels: 2023 + 2420 + 1 = 4444', 'Kurangi 2023×2420 — saling hapus: 2023 + 2420 + 1 = 4444'), ok: true },
    ],
    final: t('The result is 4444.', 'Hasilnya adalah 4444.'),
    aria: t('After the big product cancels, only 2023 plus 2420 plus 1 remains, which is 4444.', 'Setelah hasil kali besar saling hapus, hanya 2023 tambah 2420 tambah 1 tersisa, yaitu 4444.'),
  }
})

/** Q20 — four consecutive integers with divisibility 3,5,7,9; largest D. */
export const ConsecDiv23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Turn all four rules onto A: A÷3, (A+1)÷5, (A+2)÷7, (A+3)÷9 are all exact.', 'Alihkan keempat aturan ke A: A÷3, (A+1)÷5, (A+2)÷7, (A+3)÷9 semua tepat.'),
    items: [
      { text: t('Combining them, A repeats every 315: A = 159, 474, 789', 'Menggabungkannya, A berulang tiap 315: A = 159, 474, 789'), ok: null },
      { text: t('Largest A with D = A+3 still a 3-digit number is A = 789', 'A terbesar dengan D = A+3 masih 3 angka adalah A = 789'), ok: null },
      { text: 'D = 789 + 3 = 792', ok: true },
    ],
    final: t('The largest possible D is 792.', 'Nilai D terbesar yang mungkin adalah 792.'),
    aria: t('A is 789, so D, three more, is 792.', 'A adalah 789, jadi D, tiga lebih, adalah 792.'),
  }
})

/** Q21 — challenge game; failures cost double; abcd. */
export const ChallengeScore23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All-pass would be 50 + (1+…+9) = 95. Each fail costs twice its number.', 'Lolos semua memberi 50 + (1+…+9) = 95. Tiap gagal biayanya dua kali nomornya.'),
    items: [
      { text: t('He has 73 — a drop of 22, so the failed numbers sum to 22 ÷ 2 = 11', 'Ia punya 73 — turun 22, jadi nomor gagal berjumlah 22 ÷ 2 = 11'), ok: null },
      { text: t('Four different challenges from 1–9 adding to 11: only 1, 2, 3, 5', 'Empat tantangan berbeda 1–9 berjumlah 11: hanya 1, 2, 3, 5'), ok: true },
    ],
    final: t('From smallest to largest, abcd = 1235.', 'Dari terkecil ke terbesar, abcd = 1235.'),
    aria: t('The failed challenges sum to eleven, which must be one, two, three, five.', 'Tantangan gagal berjumlah sebelas, yang harus satu, dua, tiga, lima.'),
  }
})

/** Q24 — delete 100 of 111 digits from 1…60 for the largest 11-digit number. */
export const GreedyDelete23G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Writing 1 to 60 gives 111 digits; deleting 100 leaves 11. Make them as big as possible.', 'Menulis 1 sampai 60 memberi 111 angka; menghapus 100 menyisakan 11. Buat sebesar mungkin.'),
    items: [
      { text: t('Grab the biggest digit as early as you can, while leaving enough digits after it', 'Ambil angka terbesar sedini mungkin, selama masih cukup angka setelahnya'), ok: null },
      { text: t('The 9s in 9, 19, 29, 39, 49 give five leading 9s', 'Angka 9 dari 9, 19, 29, 39, 49 memberi lima angka 9 di depan'), ok: null },
      { text: t('Fill the last 6 places greedily: …785960 → 99999785960', 'Isi 6 tempat terakhir secara serakah: …785960 → 99999785960'), ok: true },
    ],
    final: t('The largest number that can remain is 99999785960.', 'Bilangan terbesar yang bisa tersisa adalah 99999785960.'),
    aria: t('Five leading nines then 785960 gives 99999785960.', 'Lima angka sembilan di depan lalu 785960 memberi 99999785960.'),
  }
})
