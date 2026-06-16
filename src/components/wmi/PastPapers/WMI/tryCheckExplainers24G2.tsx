import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F2A (2024 Grade 2 Final) — deduction-chain explainers for the
// non-figure questions. Q18 (□4+□4+□8+□9+□7 = 901 with appended zeros) is
// NOT here: as transcribed it has no solution, so it cannot be honestly
// derived — it awaits a corrected stem.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 7 × 9 − 7 equals which product. */
export const MatchProduct24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out the expression, then match it to a product.', 'Hitung perhitungannya, lalu cocokkan dengan hasil kali.'),
    items: [
      { text: '7 × 9 = 63, then 63 − 7 = 56', ok: null },
      { text: t('Taking one 7 from nine 7s leaves eight 7s: 7 × 8 = 56', 'Mengambil satu 7 dari sembilan 7 menyisakan delapan 7: 7 × 8 = 56'), ok: true },
    ],
    final: t('7 × 9 − 7 = 56 = 7 × 8 (D).', '7 × 9 − 7 = 56 = 7 × 8 (D).'),
    aria: t('Sixty-three minus seven is fifty-six, which is seven times eight.', 'Enam puluh tiga kurang tujuh adalah lima puluh enam, yaitu tujuh kali delapan.'),
  }
})

/** Q5 — trees planted vs planned difference. */
export const TreesPlan24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find both groups, add to the real total, then compare with the plan.', 'Cari kedua kelompok, jumlahkan ke total nyata, lalu bandingkan dengan rencana.'),
    items: [
      { text: t('Girls: 62 − 14 = 48', 'Perempuan: 62 − 14 = 48'), ok: null },
      { text: t('Planted in all: 62 + 48 = 110', 'Ditanam seluruhnya: 62 + 48 = 110'), ok: null },
      { text: t('Difference from plan: 226 − 110 = 116', 'Selisih dari rencana: 226 − 110 = 116'), ok: true },
    ],
    final: t('They fell short by 116 trees (B).', 'Mereka kurang 116 pohon (B).'),
    aria: t('They planted 110 of a planned 226, a difference of 116.', 'Mereka menanam 110 dari rencana 226, selisih 116.'),
  }
})

/** Q6 — late first train; gap to the on-time second train. */
export const TrainGap24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only the FIRST train is late; the second keeps its scheduled time.', 'Hanya kereta PERTAMA yang terlambat; kereta kedua tetap jadwalnya.'),
    items: [
      { text: t('Second train scheduled: 06:10 + 48 = 06:58', 'Kereta kedua terjadwal: 06:10 + 48 = 06:58'), ok: null },
      { text: t('First train today: 06:26', 'Kereta pertama hari ini: 06:26'), ok: null },
      { text: t('Gap: 06:58 − 06:26 = 32 minutes', 'Selisih: 06:58 − 06:26 = 32 menit'), ok: true },
    ],
    final: t('Today the gap is 32 minutes (C).', 'Hari ini selisihnya 32 menit (C).'),
    aria: t('The second train still leaves at 6:58, 32 minutes after the late 6:26.', 'Kereta kedua tetap berangkat 6:58, 32 menit setelah 6:26 yang terlambat.'),
  }
})

/** Q7 — which two items leave twenty-something change. */
export const TwoItems24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total her cash, then test each pair — the change must be twenty-something.', 'Totalkan uangnya, lalu uji tiap pasangan — kembalian harus dua puluhan.'),
    items: [
      { text: t('Cash: 2×30 + 2×5 + 4×1 = 74', 'Uang: 2×30 + 2×5 + 4×1 = 74'), ok: null },
      { text: t('Items ① + ④ = 25 + 19 = 44 → change 30 (thirty-something, no)', 'Barang ① + ④ = 25 + 19 = 44 → kembali 30 (tiga puluhan, tidak)'), ok: false },
      { text: t('Items ② + ③ = 38 + 15 = 53 → change 74 − 53 = 21 (twenty-something!)', 'Barang ② + ③ = 38 + 15 = 53 → kembali 74 − 53 = 21 (dua puluhan!)'), ok: true },
    ],
    final: t('She buys items ② and ③ (C).', 'Ia membeli barang ② dan ③ (C).'),
    aria: t('Items two and three cost 53, leaving 21, which is twenty-something.', 'Barang dua dan tiga seharga 53, menyisakan 21, yang dua puluhan.'),
  }
})

/** Q10 — squeeze Amy's total strictly between third and first. */
export const RankSqueeze24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find every total, then squeeze Amy strictly between third place and first place.', 'Cari semua total, lalu jepit Amy tepat di antara juara ketiga dan pertama.'),
    items: [
      { text: t('Ben (1st) = 52; Carol (3rd) = 14 + 17 + 19 = 50', 'Ben (ke-1) = 52; Carol (ke-3) = 14 + 17 + 19 = 50'), ok: null },
      { text: t('Amy is 2nd, so 50 < Amy < 52 → Amy = 51', 'Amy ke-2, jadi 50 < Amy < 52 → Amy = 51'), ok: null },
      { text: t('Amy so far 15 + 24 = 39 → Round 3 = 51 − 39 = 12', 'Amy sejauh ini 15 + 24 = 39 → Babak 3 = 51 − 39 = 12'), ok: true },
    ],
    final: t('Amy makes 12 shots in Round 3 (A).', 'Amy mencetak 12 di Babak 3 (A).'),
    aria: t('Amy must total 51, and she had 39, so Round 3 is 12.', 'Amy harus bertotal 51, dan ia punya 39, jadi Babak 3 adalah 12.'),
  }
})

/** Q11 — add the three weight statements. */
export const ThreeWeights24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write the three clues and ADD them — each weight then appears twice on the left.', 'Tulis ketiga petunjuk dan JUMLAHKAN — tiap berat lalu muncul dua kali di kiri.'),
    items: [
      { text: 'A+B = C+23, B+C = A+27, C+A = B+37', ok: null },
      { text: t('Add all: 2(A+B+C) = (A+B+C) + (23+27+37)', 'Jumlahkan: 2(A+B+C) = (A+B+C) + (23+27+37)'), ok: null },
      { text: t('So A+B+C = 23 + 27 + 37 = 87', 'Jadi A+B+C = 23 + 27 + 37 = 87'), ok: true },
    ],
    final: t('The three weights total 87 kg (B).', 'Ketiga berat berjumlah 87 kg (B).'),
    aria: t('Adding the three statements leaves the total equal to 23 plus 27 plus 37, 87.', 'Menjumlahkan tiga pernyataan menyisakan total sama dengan 23 tambah 27 tambah 37, 87.'),
  }
})

/** Q17 — greedy largest EVEN 5-digit from the odd-number string. */
export const GreedyEven24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep the biggest digits up front, but remember the number must be EVEN.', 'Simpan angka terbesar di depan, tapi ingat bilangannya harus GENAP.'),
    items: [
      { text: t('The only even digit in the string is 2, so it must END in a 2', 'Satu-satunya angka genap di deret adalah 2, jadi harus BERAKHIR dengan 2'), ok: null },
      { text: t('Greedily keep two 9s, then 5, then 7, then finish on a 2', 'Serakah simpan dua 9, lalu 5, lalu 7, lalu akhiri dengan 2'), ok: null },
      { text: t('Largest even number: 99572', 'Bilangan genap terbesar: 99572'), ok: true },
    ],
    final: t('The largest even 5-digit number is 99572.', 'Bilangan genap 5 angka terbesar adalah 99572.'),
    aria: t('Ending on the only even digit, a 2, the largest is 99572.', 'Berakhir pada satu-satunya angka genap, 2, yang terbesar adalah 99572.'),
  }
})

/** Q20 — largest ODD sum of five 2-digit numbers using 0–9. */
export const MaxOddSum24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Put the five biggest digits in the tens places for the largest sum.', 'Taruh lima angka terbesar di puluhan untuk jumlah terbesar.'),
    items: [
      { text: t('Tens 5,6,7,8,9 → 350; units 0,1,2,3,4 → +10 = 360', 'Puluhan 5,6,7,8,9 → 350; satuan 0,1,2,3,4 → +10 = 360'), ok: null },
      { text: t('But 360 is EVEN — lower it by the smallest odd amount', 'Tapi 360 GENAP — turunkan sekecil mungkin yang ganjil'), ok: null },
      { text: t('Swap a tens and units digit to drop 9: 360 − 9 = 351 (odd, largest)', 'Tukar puluhan dan satuan untuk turun 9: 360 − 9 = 351 (ganjil, terbesar)'), ok: true },
    ],
    final: t('The maximum odd sum is 351.', 'Jumlah ganjil maksimum adalah 351.'),
    aria: t('The biggest sum is 360 but even, so the largest odd sum is 351.', 'Jumlah terbesar 360 tapi genap, jadi jumlah ganjil terbesar 351.'),
  }
})

/** Q22 — rock-paper-scissors scoring; Jerry's rock throws. */
export const RockPaper24G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Split each player’s points into their five winning throws (rock 6, scissors 3, paper 7).', 'Pecah poin tiap pemain menjadi lima lemparan menang (batu 6, gunting 3, kertas 7).'),
    items: [
      { text: t('Jerry 32 = 6+6+6+7+7 → 3 rock-wins, 2 paper-wins', 'Jerry 32 = 6+6+6+7+7 → 3 menang batu, 2 menang kertas'), ok: null },
      { text: t('Tom 26 = 6+3+3+7+7 → 2 paper-wins (paper beats rock)', 'Tom 26 = 6+3+3+7+7 → 2 menang kertas (kertas kalahkan batu)'), ok: null },
      { text: t('Those 2 Tom paper-wins were Jerry throwing rock and losing', '2 menang kertas Tom adalah Jerry melempar batu dan kalah'), ok: null },
      { text: t('Jerry rock = 3 wins + 2 losses = 5', 'Jerry batu = 3 menang + 2 kalah = 5'), ok: true },
    ],
    final: t('Jerry threw rock 5 times.', 'Jerry melempar batu 5 kali.'),
    aria: t('Jerry won with rock three times and lost with rock twice, five in all.', 'Jerry menang dengan batu tiga kali dan kalah dengan batu dua kali, lima seluruhnya.'),
  }
})
