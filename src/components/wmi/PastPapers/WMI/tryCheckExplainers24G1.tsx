import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F1A (2024 Grade 1 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — which expression equals 15. */
export const EqualsFifteen24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every expression and look for 15.', 'Hitung setiap perhitungan dan cari yang hasilnya 15.'),
    items: [
      { text: 'A: 11 + 7 = 18', ok: false },
      { text: 'B: 20 − 2 = 18', ok: false },
      { text: 'C: 18 − 4 = 14', ok: false },
      { text: 'E: 9 − 6 = 3', ok: false },
      { text: 'D: 7 + 8 = 15', ok: true },
    ],
    final: t('Only 7 + 8 equals 15 (D).', 'Hanya 7 + 8 yang sama dengan 15 (D).'),
    aria: t('Checking each, only 7 plus 8 equals 15.', 'Memeriksa tiap pilihan, hanya 7 tambah 8 sama dengan 15.'),
  }
})

/** Q2 — build 78, add 4. */
export const BuildAdd24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build the number from its digits, then add 4.', 'Bangun bilangannya dari angka-angkanya, lalu tambah 4.'),
    items: [
      { text: t('Ones 8, tens 7 → the number is 78', 'Satuan 8, puluhan 7 → bilangannya 78'), ok: null },
      { text: '78 + 4 = 82', ok: true },
    ],
    final: t('The number 4 greater is 82 (B).', 'Bilangan yang 4 lebih besar adalah 82 (B).'),
    aria: t('Seventy-eight plus four is eighty-two.', 'Tujuh puluh delapan tambah empat adalah delapan puluh dua.'),
  }
})

/** Q4 — cups without a handle. */
export const CupsHandle24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total the cups first, then take away the ones with a handle.', 'Totalkan cangkir dulu, lalu kurangi yang punya pegangan.'),
    items: [
      { text: t('All cups: 14 patterned + 6 plain = 20', 'Semua cangkir: 14 bermotif + 6 polos = 20'), ok: null },
      { text: t('8 have a handle: 20 − 8 = 12', '8 punya pegangan: 20 − 8 = 12'), ok: true },
    ],
    final: t('12 cups have no handle (D).', '12 cangkir tanpa pegangan (D).'),
    aria: t('Of 20 cups, 8 have handles, so 12 do not.', 'Dari 20 cangkir, 8 berpegangan, jadi 12 tidak.'),
  }
})

/** Q6 — two shortfalls add to the cake price. */
export const CakeShortfall24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Their money together exactly buys one cake — so the two shortfalls add up to the price.', 'Uang mereka digabung tepat membeli satu kue — jadi dua kekurangan dijumlahkan menjadi harganya.'),
    items: [
      { text: t('Jessica is short $4.50, Cindy is short $8', 'Jessica kurang $4,50, Cindy kurang $8'), ok: null },
      { text: t('Price = 4.50 + 8 = 12.50', 'Harga = 4,50 + 8 = 12,50'), ok: null },
      { text: t('Jessica has price − 4.50 = 12.50 − 4.50 = 8', 'Jessica punya harga − 4,50 = 12,50 − 4,50 = 8'), ok: true },
    ],
    final: t('Jessica has 8 dollars (C).', 'Jessica punya 8 dolar (C).'),
    aria: t('The cake costs 12.50, and Jessica is 4.50 short, so she has 8 dollars.', 'Kue seharga 12,50, dan Jessica kurang 4,50, jadi ia punya 8 dolar.'),
  }
})

/** Q7 — number from two clues, then digit sum. */
export const TwoClues24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Translate both clues into numbers, then add the digits.', 'Terjemahkan kedua petunjuk menjadi bilangan, lalu jumlahkan angkanya.'),
    items: [
      { text: t('Smallest 2-digit number = 10; largest 1-digit even number = 8', 'Bilangan 2 angka terkecil = 10; bilangan genap 1 angka terbesar = 8'), ok: null },
      { text: t('number − 10 = 8 → number = 18', 'bilangan − 10 = 8 → bilangan = 18'), ok: null },
      { text: t('Digit sum: 1 + 8 = 9', 'Jumlah angka: 1 + 8 = 9'), ok: true },
    ],
    final: t('The digit sum is 9 (A).', 'Jumlah angkanya 9 (A).'),
    aria: t('The number is 18, whose digits add to 9.', 'Bilangannya 18, yang angkanya berjumlah 9.'),
  }
})

/** Q8 — third-most digit among evens 20–50. */
export const DigitTally24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write the even numbers 20, 22, …, 50 and tally every digit, then rank them.', 'Tulis bilangan genap 20, 22, …, 50 dan hitung tiap angka, lalu urutkan.'),
    items: [
      { text: t('2 and 4 each appear 8 times — the most', '2 dan 4 masing-masing muncul 8 kali — terbanyak'), ok: null },
      { text: t('The next is 3, appearing 5 times', 'Berikutnya 3, muncul 5 kali'), ok: null },
      { text: t('So the third-most digit is 3', 'Jadi angka terbanyak ke-3 adalah 3'), ok: true },
    ],
    final: t('The third-most often digit is 3 (E).', 'Angka terbanyak ketiga adalah 3 (E).'),
    aria: t('Twos and fours appear most; three is next, the third-most.', 'Dua dan empat paling banyak; tiga berikutnya, terbanyak ketiga.'),
  }
})

/** Q9 — three buses, find Bus 3. */
export const BusCarry24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find Bus 2 first, then use it to find Bus 3.', 'Cari Bus 2 dulu, lalu pakai untuk cari Bus 3.'),
    items: [
      { text: t('Bus 1 + Bus 2 = 35, Bus 1 = 7 → Bus 2 = 28', 'Bus 1 + Bus 2 = 35, Bus 1 = 7 → Bus 2 = 28'), ok: null },
      { text: 'Bus 2 + Bus 3 = 52 → Bus 3 = 52 − 28 = 24', ok: true },
    ],
    final: t('Bus 3 can carry 24 people (B).', 'Bus 3 dapat mengangkut 24 orang (B).'),
    aria: t('Bus two carries 28, so bus three carries 24.', 'Bus dua mengangkut 28, jadi bus tiga mengangkut 24.'),
  }
})

/** Q12 — 10 coins of $5/$1; which total is impossible. */
export const CoinTotals24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('With 10 coins, if n are $5 coins the total is 5n + (10 − n) = 4n + 10.', 'Dengan 10 koin, jika n koin $5 maka totalnya 5n + (10 − n) = 4n + 10.'),
    items: [
      { text: t('Every total has the form 4n + 10', 'Setiap total berbentuk 4n + 10'), ok: null },
      { text: t('Possible: 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50', 'Mungkin: 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50'), ok: null },
      { text: t('24 needs 4n + 10 = 24 → n = 3.5 — impossible', '24 perlu 4n + 10 = 24 → n = 3,5 — mustahil'), ok: true },
    ],
    final: t('24 cannot be the total (D).', '24 tak mungkin menjadi total (D).'),
    aria: t('Totals jump by four from ten, so 24 is impossible.', 'Total melompat empat dari sepuluh, jadi 24 mustahil.'),
  }
})

/** Q19 — chocolates left after giving some away. */
export const ChocoLeft24G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract each colour separately, then add the leftovers.', 'Kurangi tiap warna terpisah, lalu jumlahkan sisanya.'),
    items: [
      { text: t('Black left: 15 − 8 = 7', 'Hitam tersisa: 15 − 8 = 7'), ok: null },
      { text: t('White left: 19 − 6 = 13', 'Putih tersisa: 19 − 6 = 13'), ok: null },
      { text: '7 + 13 = 20', ok: true },
    ],
    final: t('20 chocolates are left.', '20 cokelat tersisa.'),
    aria: t('Seven black and thirteen white remain, twenty in all.', 'Tujuh hitam dan tiga belas putih tersisa, dua puluh seluruhnya.'),
  }
})
