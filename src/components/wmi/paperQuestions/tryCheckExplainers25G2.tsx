import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-25F2A (2025 Grade 2 Final) — deduction-chain explainers for the
// non-figure questions. Q13 (shape P/Q/R tiling) is NOT here: its answer
// depends on piece-counts that live only in the figure, so it cannot be
// derived from the text alone.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — middle of five numbers when sorted. */
export const SortMiddle25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Sort the five numbers smallest first, then take the 3rd (the middle).', 'Urutkan kelima bilangan dari terkecil, lalu ambil yang ke-3 (tengah).'),
    items: [
      { text: '582 < 2025 < 2058 < 2508 < 5802', ok: null },
      { text: t('582 is the only 3-digit number (smallest); 5802 is biggest', '582 satu-satunya bilangan 3 angka (terkecil); 5802 terbesar'), ok: null },
      { text: t('The middle (3rd) is 2058', 'Yang tengah (ke-3) adalah 2058'), ok: true },
    ],
    final: t('The middle number is 2058 (A).', 'Bilangan tengah adalah 2058 (A).'),
    aria: t('Sorted, the third of five numbers is 2058.', 'Terurut, bilangan ketiga dari lima adalah 2058.'),
  }
})

/** Q3 — direction from Pinky back to the fountain. */
export const Direction25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Put the fountain at (0, 0) and track Pinky on a grid.', 'Letakkan air mancur di (0, 0) dan lacak Pinky di petak.'),
    items: [
      { text: t('Start 40 m west → (−40, 0)', 'Mulai 40 m barat → (−40, 0)'), ok: null },
      { text: t('North 30, east 70 → (30, 30)', 'Utara 30, timur 70 → (30, 30)'), ok: null },
      { text: t('The fountain is 30 m west and 30 m south of her → South West', 'Air mancur 30 m barat dan 30 m selatan darinya → Barat Daya'), ok: true },
    ],
    final: t('The fountain is to her South West (C). Facing north doesn’t change that.', 'Air mancur di Barat Daya darinya (C). Menghadap utara tak mengubahnya.'),
    aria: t('Pinky ends at (30, 30), so the fountain at the origin is south-west of her.', 'Pinky berakhir di (30, 30), jadi air mancur di pusat ada di barat daya darinya.'),
  }
})

/** Q4 — sum of three consecutive evens is 7□; largest □. */
export const ConsecEven25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Three consecutive even numbers add to 3 × the middle one — always a multiple of 6.', 'Tiga genap berurutan berjumlah 3 × bilangan tengah — selalu kelipatan 6.'),
    items: [
      { text: t('Multiples of 6 in the 70s: 72 and 78', 'Kelipatan 6 di 70-an: 72 dan 78'), ok: null },
      { text: t('78 has the bigger box digit: 24 + 26 + 28 = 78', '78 punya angka kotak lebih besar: 24 + 26 + 28 = 78'), ok: true },
    ],
    final: t('The largest box digit is 8 (D).', 'Angka kotak terbesar adalah 8 (D).'),
    aria: t('The biggest multiple of six in the seventies is 78, so the box is 8.', 'Kelipatan enam terbesar di 70-an adalah 78, jadi kotaknya 8.'),
  }
})

/** Q6 — candies = students², strictly between 50 and 80. */
export const SquareCandy25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each student gets as many candies as there are students, so the total is students × students — a square number.', 'Tiap siswa menerima permen sebanyak jumlah siswa, jadi totalnya siswa × siswa — bilangan kuadrat.'),
    items: [
      { text: '7×7 = 49 (too small), 8×8 = 64, 9×9 = 81 (too big)', ok: null },
      { text: t('Only 64 is more than 50 and less than 80', 'Hanya 64 yang lebih dari 50 dan kurang dari 80'), ok: true },
    ],
    final: t('He buys 64 candies (D).', 'Ia membeli 64 permen (D).'),
    aria: t('The only square strictly between 50 and 80 is 64.', 'Satu-satunya kuadrat tepat antara 50 dan 80 adalah 64.'),
  }
})

/** Q7 — facing the ship's back, which way is right. */
export const ShipDirection25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The ship sails south, so its front faces south and its back faces north.', 'Kapal berlayar ke selatan, jadi depannya menghadap selatan dan belakangnya utara.'),
    items: [
      { text: t('Rose faces the back → she faces north', 'Rose menghadap belakang → ia menghadap utara'), ok: null },
      { text: t('Facing north, your right hand points east', 'Menghadap utara, tangan kananmu menunjuk timur'), ok: true },
    ],
    final: t('To her right is East (A).', 'Di sebelah kanannya adalah Timur (A).'),
    aria: t('Facing north, east is on the right.', 'Menghadap utara, timur di sebelah kanan.'),
  }
})

/** Q9 — numbers smaller than Rita's lucky number. */
export const LuckyNumber25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the 2-digit numbers with tens > units: tens 1 gives 1, …, tens 9 gives 9.', 'Hitung bilangan 2 angka dengan puluhan > satuan: puluhan 1 ada 1, …, puluhan 9 ada 9.'),
    items: [
      { text: t('Total = 1 + 2 + … + 9 = 45', 'Total = 1 + 2 + … + 9 = 45'), ok: null },
      { text: t('Remove the lucky one and the 22 above it: 45 − 1 − 22 = 22', 'Buang yang beruntung dan 22 di atasnya: 45 − 1 − 22 = 22'), ok: true },
    ],
    final: t('22 numbers are smaller than the lucky number (E).', '22 bilangan lebih kecil dari angka keberuntungan (E).'),
    aria: t('Of 45 numbers, after the lucky one and 22 above, 22 are below.', 'Dari 45 bilangan, setelah yang beruntung dan 22 di atas, 22 di bawah.'),
  }
})

/** Q10 — minimum sheets torn (2 pages per sheet). */
export const TornPages25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('One sheet holds two page numbers: (2n−1) and 2n. Group the torn pages onto sheets.', 'Satu lembar memuat dua nomor halaman: (2n−1) dan 2n. Kelompokkan halaman yang robek ke lembar.'),
    items: [
      { text: t('8 → sheet 4 (7,8); 9 → sheet 5 (9,10) — two different sheets', '8 → lembar 4 (7,8); 9 → lembar 5 (9,10) — dua lembar berbeda'), ok: null },
      { text: t('70 → sheet 35 (69,70); 113 and 114 share sheet 57', '70 → lembar 35 (69,70); 113 dan 114 berbagi lembar 57'), ok: null },
      { text: t('Sheets 4, 5, 35, 57 → 4 sheets', 'Lembar 4, 5, 35, 57 → 4 lembar'), ok: true },
    ],
    final: t('At least 4 sheets were torn (B).', 'Minimal 4 lembar yang robek (B).'),
    aria: t('The torn pages sit on four different sheets.', 'Halaman robek ada di empat lembar berbeda.'),
  }
})

/** Q12 — fill 1–5 so one week after DD/M is D/M. */
export const DateBoxes25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Adding 7 days must jump into the next month, so the start is near a month’s end.', 'Menambah 7 hari harus melompat ke bulan berikutnya, jadi awalnya dekat akhir bulan.'),
    items: [
      { text: t('Try 25/3: 25 March + 7 days = 1 April = 1/4', 'Coba 25/3: 25 Maret + 7 hari = 1 April = 1/4'), ok: null },
      { text: t('Boxes left to right: 2, 5, 3, 1, 4 — all of 1–5', 'Kotak kiri ke kanan: 2, 5, 3, 1, 4 — semua 1–5'), ok: true },
    ],
    final: t('The order is 25314 (B).', 'Urutannya 25314 (B).'),
    aria: t('25 March plus a week is 1 April, giving the digits 2, 5, 3, 1, 4.', '25 Maret tambah seminggu adalah 1 April, memberi angka 2, 5, 3, 1, 4.'),
  }
})

/** Q14 — remove 3 digits from 328417 for the smallest number; sum removed. */
export const GreedyRemove25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep 3 of the 6 digits in order to make the smallest number.', 'Sisakan 3 dari 6 angka berurutan untuk bilangan terkecil.'),
    items: [
      { text: t('1st kept: smallest of 3,2,8,4 (with room after) = 2', 'Disimpan ke-1: terkecil dari 3,2,8,4 (masih cukup setelahnya) = 2'), ok: null },
      { text: t('2nd: smallest of 8,4,1 = 1; 3rd: 7 → 217', 'Ke-2: terkecil dari 8,4,1 = 1; ke-3: 7 → 217'), ok: null },
      { text: t('Removed 3, 8, 4 → 3 + 8 + 4 = 15', 'Dihapus 3, 8, 4 → 3 + 8 + 4 = 15'), ok: true },
    ],
    final: t('The removed digits add to 15 (E).', 'Angka yang dihapus berjumlah 15 (E).'),
    aria: t('The smallest number is 217, so the removed digits 3, 8, 4 add to 15.', 'Bilangan terkecil 217, jadi angka dihapus 3, 8, 4 berjumlah 15.'),
  }
})

/** Q16 — subtract 8 from 2025 until digit-sum is 9 again. */
export const SubtractEight25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only multiples of 9 can have digit-sum 9. Step down by 8 and watch the digit sums.', 'Hanya kelipatan 9 yang bisa berjumlah digit 9. Turun 8 dan amati jumlah digitnya.'),
    items: [
      { text: t('The multiples-of-9 we land on (1953, 1881, …) all have digit-sum 18', 'Kelipatan 9 yang kita capai (1953, 1881, …) semua berjumlah digit 18'), ok: null },
      { text: t('2025 − 63 × 8 = 1521', '2025 − 63 × 8 = 1521'), ok: null },
      { text: '1 + 5 + 2 + 1 = 9', ok: true },
    ],
    final: t('The first number with digit-sum 9 is 1521.', 'Bilangan pertama berjumlah digit 9 adalah 1521.'),
    aria: t('After many steps of 8, 1521 is the first with digits adding to 9.', 'Setelah banyak langkah 8, 1521 yang pertama berjumlah digit 9.'),
  }
})

/** Q18 — eight values are 1–8; find the largest base □. */
export const ShapeSums25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All eight values are 1 to 8, so they add to 36.', 'Kedelapan nilai adalah 1 sampai 8, jadi berjumlah 36.'),
    items: [
      { text: t('The four sums together = 2 × (the four base shapes)', 'Keempat penjumlahan = 2 × (empat bentuk dasar)'), ok: null },
      { text: t('So base + 2×base = 36 → the bases add to 12', 'Jadi dasar + 2×dasar = 36 → dasar berjumlah 12'), ok: null },
      { text: t('Four different numbers summing 12 with □ largest: 1, 2, 3, 6 → □ = 6', 'Empat angka berbeda berjumlah 12 dengan □ terbesar: 1, 2, 3, 6 → □ = 6'), ok: true },
    ],
    final: t('The box is 6. (Check: 6+1, 6+2, 3+1, 3+2 = 7, 8, 4, 5 — all new.)', 'Kotaknya 6. (Cek: 6+1, 6+2, 3+1, 3+2 = 7, 8, 4, 5 — semua baru.)'),
    aria: t('The four base shapes are 1, 2, 3, 6, so the box, the largest, is 6.', 'Empat bentuk dasar adalah 1, 2, 3, 6, jadi kotaknya, terbesar, adalah 6.'),
  }
})

/** Q21 — appending 25 raises the value by 200500. */
export const AppendDigits25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Writing 25 to the right of N makes it 100 × N + 25.', 'Menulis 25 di kanan N membuatnya 100 × N + 25.'),
    items: [
      { text: t('Increase = 100N + 25 − N = 99N + 25', 'Pertambahan = 100N + 25 − N = 99N + 25'), ok: null },
      { text: t('99N + 25 = 200500 → 99N = 200475', '99N + 25 = 200500 → 99N = 200475'), ok: null },
      { text: '200475 ÷ 99 = 2025', ok: true },
    ],
    final: t('The original number is 2025.', 'Bilangan aslinya adalah 2025.'),
    aria: t('Solving 99N plus 25 equals 200500 gives N equals 2025.', 'Menyelesaikan 99N tambah 25 sama dengan 200500 memberi N sama dengan 2025.'),
  }
})

/** Q22 — 2-digit even number from divisibility clues. */
export const ModClues25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('n+1, n+2, n+3 are divisible by 3, 4, 5. Each clue really says n − 2 is divisible by that number.', 'n+1, n+2, n+3 habis dibagi 3, 4, 5. Tiap petunjuk sebenarnya berkata n − 2 habis dibagi bilangan itu.'),
    items: [
      { text: t('So n − 2 is a multiple of 3, 4, and 5 together → a multiple of 60', 'Jadi n − 2 kelipatan 3, 4, dan 5 sekaligus → kelipatan 60'), ok: null },
      { text: t('The 2-digit choice: n − 2 = 60 → n = 62 (even ✓)', 'Pilihan 2 angka: n − 2 = 60 → n = 62 (genap ✓)'), ok: true },
    ],
    final: t('The number is 62.', 'Bilangannya adalah 62.'),
    aria: t('Since n minus 2 is a multiple of 60, n is 62.', 'Karena n kurang 2 kelipatan 60, n adalah 62.'),
  }
})

/** Q25 — add 1 to three of {2,0,2,5} until all equal; min moves. */
export const BalanceNumbers25G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each move adds 1 to three numbers, so the total grows by 3 each time.', 'Tiap langkah menambah 1 ke tiga bilangan, jadi total bertambah 3 tiap kali.'),
    items: [
      { text: t('After k moves the total is 9 + 3k, and all-equal needs 4v = 9 + 3k', 'Setelah k langkah total 9 + 3k, dan semua-sama butuh 4v = 9 + 3k'), ok: null },
      { text: t('The 0 must climb by v, gaining ≤ 1 per move, so v ≤ k', 'Angka 0 harus naik sebesar v, +1 per langkah, jadi v ≤ k'), ok: null },
      { text: t('v = 9 with k = 9 works (gaps 7, 9, 7, 4 are all ≤ 9)', 'v = 9 dengan k = 9 berhasil (selisih 7, 9, 7, 4 semua ≤ 9)'), ok: true },
    ],
    final: t('It takes 9 moves.', 'Diperlukan 9 langkah.'),
    aria: t('Nine moves bring every number up to nine.', 'Sembilan langkah membawa tiap bilangan menjadi sembilan.'),
  }
})
