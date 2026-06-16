import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-19P1A (2019 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 15 − 9 by subtracting down to ten first. */
export const SubtractToTen19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract down to ten first, then take away the rest.', 'Kurangi sampai sepuluh dulu, lalu kurangi sisanya.'),
    items: [
      { text: t('Take 5 away to land on 10: 15 − 5 = 10', 'Kurangi 5 dulu sampai di 10: 15 − 5 = 10'), ok: null },
      { text: t('Still 4 left to take away: 10 − 4 = 6', 'Masih sisa 4 yang dikurangkan: 10 − 4 = 6'), ok: null },
      { text: t('Don’t over-subtract to 5 — after 15 − 5 = 10 there are 4 left, not 5', 'Jangan kelebihan mengurangi jadi 5 — setelah 15 − 5 = 10 sisa 4, bukan 5'), ok: false },
      { text: '15 − 9 = 6', ok: true },
    ],
    final: t('15 − 9 = 6 (B).', '15 − 9 = 6 (B).'),
    aria: t('Subtracting to ten then four more, 15 minus 9 is 6.', 'Mengurangi sampai sepuluh lalu empat lagi, 15 dikurangi 9 adalah 6.'),
  }
})

/** Q2 — ( ) + 7 = 20: undo the addition by subtracting. */
export const MissingAddend19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Undo the addition by subtracting back from 20.', 'Balik penjumlahan dengan mundur dari 20.'),
    items: [
      { text: t('Something + 7 = 20, so work backwards', 'Suatu bilangan + 7 = 20, jadi kerjakan mundur'), ok: null },
      { text: '20 − 7 = 13', ok: null },
      { text: t('Don’t add: 16 + 7 = 23 overshoots past 20', 'Jangan menambah: 16 + 7 = 23 melebihi 20'), ok: false },
      { text: t('Check: 13 + 7 = 20', 'Cek: 13 + 7 = 20'), ok: true },
    ],
    final: t('The box is 13 (A).', 'Kotaknya 13 (A).'),
    aria: t('Subtracting 7 from 20 gives 13.', 'Mengurangi 7 dari 20 menghasilkan 13.'),
  }
})

/** Q7 — number stairs, complete the bottom row 1, 2, 9, ? */
export const NumberStairs19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Follow the staircase pattern down to the last tile.', 'Ikuti pola tangga sampai ubin terakhir.'),
    items: [
      { text: t('Each step down adds one more tile to the row', 'Setiap turun satu anak tangga menambah satu ubin'), ok: null },
      { text: t('Read the bottom row in order: 1, 2, 9, then the box', 'Baca baris bawah berurutan: 1, 2, 9, lalu kotaknya'), ok: null },
      { text: t('Don’t sum neighbours: 2 + 9 = 11 — the stairs follow position, not addition', 'Jangan menjumlahkan tetangga: 2 + 9 = 11 — tangga ikut posisi, bukan penjumlahan'), ok: false },
      { text: t('The pattern fills the missing tile with 9', 'Pola mengisi ubin yang hilang dengan 9'), ok: true },
    ],
    final: t('The number in the box is 9 (C).', 'Angka di kotak itu 9 (C).'),
    aria: t('Following the staircase pattern, the missing tile is 9.', 'Mengikuti pola tangga, ubin yang hilang adalah 9.'),
  }
})

/** Q15 — A, B, C count 1–40; how many even numbers does C say? */
export const CountOffEvens19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('C is third in line, so C says every multiple of 3 — then keep the even ones.', 'C urutan ketiga, jadi C mengucap setiap kelipatan 3 — lalu ambil yang genap.'),
    items: [
      { text: t('C’s numbers up to 40: 3, 6, 9, …, 39', 'Bilangan C sampai 40: 3, 6, 9, …, 39'), ok: null },
      { text: t('Keep the even ones: 6, 12, 18, 24, 30, 36', 'Ambil yang genap: 6, 12, 18, 24, 30, 36'), ok: null },
      { text: t('Don’t add 40 or 42 — C’s last number is only 39 (that would wrongly give 7)', 'Jangan tambahkan 40 atau 42 — bilangan terakhir C hanya 39 (itu keliru jadi 7)'), ok: false },
      { text: t('That is 6 even numbers', 'Itu 6 bilangan genap'), ok: true },
    ],
    final: t('C says 6 even numbers (C).', 'C mengucap 6 bilangan genap (C).'),
    aria: t('Among C’s multiples of three up to forty, six are even.', 'Di antara kelipatan tiga milik C sampai empat puluh, enam genap.'),
  }
})

/** Q16 — compute 12 + 15 − 9 left to right. */
export const AddSubtract19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right: add first, then subtract.', 'Kerjakan dari kiri ke kanan: jumlahkan dulu, lalu kurangi.'),
    items: [
      { text: '12 + 15 = 27', ok: null },
      { text: '27 − 9 = 18', ok: null },
      { text: t('Don’t add the 9: 12 + 15 + 9 = 36 is wrong', 'Jangan menambah 9: 12 + 15 + 9 = 36 salah'), ok: false },
      { text: '12 + 15 − 9 = 18', ok: true },
    ],
    final: t('12 + 15 − 9 = 18 (C).', '12 + 15 − 9 = 18 (C).'),
    aria: t('Adding 12 and 15 then subtracting 9 gives 18.', 'Menjumlahkan 12 dan 15 lalu mengurangi 9 menghasilkan 18.'),
  }
})

/** Q17 — smallest whole number with 16 + ( ) > 30. */
export const MinOverThreshold19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the equal case first, then step up by one.', 'Cari kasus sama dulu, lalu naik satu.'),
    items: [
      { text: t('What makes exactly 30? 30 − 16 = 14', 'Apa yang membuat tepat 30? 30 − 16 = 14'), ok: null },
      { text: t('14 makes 16 + 14 = 30 — but > means more than, so 30 is not allowed', '14 membuat 16 + 14 = 30 — tapi > berarti lebih dari, jadi 30 tidak boleh'), ok: false },
      { text: t('The next whole number 15: 16 + 15 = 31 > 30', 'Bilangan bulat berikutnya 15: 16 + 15 = 31 > 30'), ok: true },
    ],
    final: t('The smallest number that goes over 30 is 15 (B).', 'Bilangan terkecil yang melewati 30 adalah 15 (B).'),
    aria: t('Fourteen ties at thirty, so the smallest number over thirty is fifteen.', 'Empat belas hanya seri di tiga puluh, jadi terkecil yang melebihi adalah lima belas.'),
  }
})

/** Q22 — 3 stars = 12 and diamond + star = 12; find diamond and star. */
export const StarDiamond19P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the single-shape clue first, then substitute.', 'Pecahkan petunjuk satu bentuk dulu, lalu masukkan.'),
    items: [
      { text: t('Three stars make 12, so star = 12 ÷ 3 = 4', 'Tiga bintang sama dengan 12, jadi bintang = 12 ÷ 3 = 4'), ok: null },
      { text: t('star = 3 fails: 3 + 3 + 3 = 9, not 12', 'bintang = 3 gagal: 3 + 3 + 3 = 9, bukan 12'), ok: false },
      { text: t('Use diamond + star = 12 with star = 4: diamond = 12 − 4 = 8', 'Pakai belah ketupat + bintang = 12 dengan bintang = 4: belah ketupat = 12 − 4 = 8'), ok: null },
      { text: t('diamond = 8 and star = 4', 'belah ketupat = 8 dan bintang = 4'), ok: true },
    ],
    final: t('diamond = 8, star = 4 (B).', 'belah ketupat = 8, bintang = 4 (B).'),
    aria: t('Each star is four, so the diamond is eight.', 'Tiap bintang empat, jadi belah ketupat delapan.'),
  }
})
