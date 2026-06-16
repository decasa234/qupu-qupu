import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-25F3A (2025 Grade 3 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 5202 − 2025. */
export const Subtract25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Line up the digits and subtract, borrowing across the zero.', 'Susun angka dan kurangkan, meminjam melewati nol.'),
    items: [
      { text: '5202 − 2025', ok: null },
      { text: '= 3177', ok: true },
    ],
    final: t('5202 − 2025 = 3177 (B).', '5202 − 2025 = 3177 (B).'),
    aria: t('Five thousand two hundred two minus 2025 is 3177.', 'Lima ribu dua ratus dua kurang 2025 adalah 3177.'),
  }
})

/** Q2 — which quotient has no digit 0. */
export const DivNoZero25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every quotient, then check its digits for a 0.', 'Hitung tiap hasil bagi, lalu periksa angkanya untuk 0.'),
    items: [
      { text: 'A: 40 ÷ 4 = 10', ok: false },
      { text: 'B: 140 ÷ 7 = 20', ok: false },
      { text: 'C: 690 ÷ 3 = 230', ok: false },
      { text: 'E: 945 ÷ 9 = 105', ok: false },
      { text: t('D: 630 ÷ 5 = 126 — no 0', 'D: 630 ÷ 5 = 126 — tanpa 0'), ok: true },
    ],
    final: t('Only 630 ÷ 5 = 126 has no 0 (D).', 'Hanya 630 ÷ 5 = 126 yang tanpa 0 (D).'),
    aria: t('Of the five quotients, only 126 has no zero digit.', 'Dari lima hasil bagi, hanya 126 yang tanpa angka nol.'),
  }
})

/** Q3 — weight of one milk bottle. */
export const MilkWeight25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Convert to grams, take away the sugar, then share equally.', 'Ubah ke gram, kurangi gula, lalu bagi rata.'),
    items: [
      { text: t('5 kg = 5000 g', '5 kg = 5000 g'), ok: null },
      { text: t('Minus the sugar: 5000 − 200 = 4800 g for 6 bottles', 'Kurangi gula: 5000 − 200 = 4800 g untuk 6 botol'), ok: null },
      { text: '4800 ÷ 6 = 800 g', ok: true },
    ],
    final: t('Each bottle of milk weighs 800 g (C).', 'Tiap botol susu beratnya 800 g (C).'),
    aria: t('After the sugar, 4800 grams over six bottles is 800 each.', 'Setelah gula, 4800 gram dibagi enam botol adalah 800 tiap botol.'),
  }
})

/** Q5 — Julia's round trip cancels; find the distance. */
export const RoundTrip25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Walking out and back home cancels — only the final straight walk covers real distance.', 'Jalan keluar dan pulang saling meniadakan — hanya jalan lurus terakhir yang menempuh jarak nyata.'),
    items: [
      { text: t('Total time 8:00 → 8:20 = 20 minutes', 'Total waktu 8:00 → 8:20 = 20 menit'), ok: null },
      { text: t('Out 6 + back 6 = 12 minutes (returns to the start)', 'Keluar 6 + pulang 6 = 12 menit (kembali ke awal)'), ok: null },
      { text: t('Straight walk: 20 − 12 = 8 min → 45 × 8 = 360 m', 'Jalan lurus: 20 − 12 = 8 menit → 45 × 8 = 360 m'), ok: true },
    ],
    final: t('Home to school is 360 m (D).', 'Rumah ke sekolah 360 m (D).'),
    aria: t('Eight real minutes at 45 metres a minute is 360 metres.', 'Delapan menit nyata dengan 45 meter per menit adalah 360 meter.'),
  }
})

/** Q6 — Black Friday savings on 3 loaves. */
export const BlackFriday25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the normal total with the deal price.', 'Bandingkan total normal dengan harga diskon.'),
    items: [
      { text: t('Normal: 3 × 337 = 1011', 'Normal: 3 × 337 = 1011'), ok: null },
      { text: t('Deal: 889', 'Diskon: 889'), ok: null },
      { text: '1011 − 889 = 122', ok: true },
    ],
    final: t('Amir saves 122 dollars (A).', 'Amir hemat 122 dolar (A).'),
    aria: t('A thousand eleven minus 889 saves 122.', 'Seribu sebelas kurang 889 menghemat 122.'),
  }
})

/** Q7 — undo the two misreads by place value. */
export const MisreadSum25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Undo each misread by its place value — one made the sum too big, one too small.', 'Batalkan tiap salah baca menurut nilai tempat — satu membuat jumlah terlalu besar, satu terlalu kecil.'),
    items: [
      { text: t('Units 3 read as 8 → sum is 5 too big', 'Satuan 3 dibaca 8 → jumlah 5 terlalu besar'), ok: null },
      { text: t('Hundreds 8 read as 6 → sum is 200 too small', 'Ratusan 8 dibaca 6 → jumlah 200 terlalu kecil'), ok: null },
      { text: t('Correct = 2025 − 5 + 200 = 2220', 'Benar = 2025 − 5 + 200 = 2220'), ok: true },
    ],
    final: t('The correct sum is 2220 (C).', 'Jumlah yang benar adalah 2220 (C).'),
    aria: t('Removing the extra 5 and adding the missing 200 gives 2220.', 'Membuang kelebihan 5 dan menambah 200 yang hilang memberi 2220.'),
  }
})

/** Q9 — priciest ticket within budget for 4 people. */
export const TicketBudget25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('4 people, so 4 × price ≤ 980, meaning price ≤ 245. Pick the priciest seat that fits.', '4 orang, jadi 4 × harga ≤ 980, berarti harga ≤ 245. Pilih kursi termahal yang muat.'),
    items: [
      { text: t('$435 → 4 × 435 = 1740 — busts the budget', '$435 → 4 × 435 = 1740 — lewat anggaran'), ok: false },
      { text: t('$317 → 4 × 317 = 1268 — still too much', '$317 → 4 × 317 = 1268 — masih kelebihan'), ok: false },
      { text: t('$224 → 4 × 224 = 896 ✓ — the highest that fits', '$224 → 4 × 224 = 896 ✓ — tertinggi yang muat'), ok: true },
    ],
    final: t('They should choose the $224 seats (C).', 'Mereka sebaiknya pilih kursi $224 (C).'),
    aria: t('The priciest seat whose four tickets fit 980 is 224.', 'Kursi termahal yang empat tiketnya muat 980 adalah 224.'),
  }
})

/** Q12 — die bottom face from two corner sums. */
export const DieBottom25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Opposite faces sum to 7, so back = 7 − front and left = 7 − right.', 'Sisi berhadapan berjumlah 7, jadi belakang = 7 − depan dan kiri = 7 − kanan.'),
    items: [
      { text: t('Jose: top + (7−front) + (7−right) = top + 14 − (front+right) = 12', 'Jose: atas + (7−depan) + (7−kanan) = atas + 14 − (depan+kanan) = 12'), ok: null },
      { text: t('Raja: top + front + right = 14, so front + right = 14 − top', 'Raja: atas + depan + kanan = 14, jadi depan + kanan = 14 − atas'), ok: null },
      { text: t('Substitute: top + 14 − (14 − top) = 12 → 2·top = 12 → top = 6', 'Substitusi: atas + 14 − (14 − atas) = 12 → 2·atas = 12 → atas = 6'), ok: null },
      { text: t('Bottom = 7 − 6 = 1', 'Bawah = 7 − 6 = 1'), ok: true },
    ],
    final: t('The bottom face is 1 (A).', 'Sisi bawah adalah 1 (A).'),
    aria: t('The top works out to 6, so the bottom is 1.', 'Sisi atas ternyata 6, jadi bawah adalah 1.'),
  }
})

/** Q15 — ball not taken (taken total is a multiple of 3). */
export const BallShare25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All six balls total 119. The five taken sum to Bella + 2·Bella = 3 × Bella — a multiple of 3.', 'Keenam bola berjumlah 119. Lima yang diambil berjumlah Bella + 2·Bella = 3 × Bella — kelipatan 3.'),
    items: [
      { text: t('So 119 − (leftover) must be divisible by 3', 'Jadi 119 − (sisa) harus habis dibagi 3'), ok: null },
      { text: t('Only leaving 20 works: 119 − 20 = 99 = 3 × 33', 'Hanya menyisakan 20 yang cocok: 119 − 20 = 99 = 3 × 33'), ok: null },
      { text: t('Check: Bella 33 (15+18), Erin 66 (16+19+31)', 'Cek: Bella 33 (15+18), Erin 66 (16+19+31)'), ok: true },
    ],
    final: t('The ball not taken is 20 (B).', 'Bola yang tak diambil adalah 20 (B).'),
    aria: t('Leaving out 20 makes the taken total 99, which splits 33 and 66.', 'Menyisakan 20 membuat total diambil 99, yang terbagi 33 dan 66.'),
  }
})

/** Q16 — first year after 2025 = product of 3 consecutive naturals. */
export const ConsecProduct25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Look for n × (n+1) × (n+2) just above 2025.', 'Cari n × (n+1) × (n+2) tepat di atas 2025.'),
    items: [
      { text: t('11 × 12 × 13 = 1716 — too small', '11 × 12 × 13 = 1716 — terlalu kecil'), ok: false },
      { text: t('12 × 13 × 14 = 2184 — just above 2025', '12 × 13 × 14 = 2184 — tepat di atas 2025'), ok: true },
    ],
    final: t('The first such year is 2184.', 'Tahun pertama seperti itu adalah 2184.'),
    aria: t('Twelve times thirteen times fourteen is 2184, the first past 2025.', 'Dua belas kali tiga belas kali empat belas adalah 2184, pertama melewati 2025.'),
  }
})

/** Q18 — four-factor sets of 2025; m + n. */
export const FactorSets25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('2025 = 3⁴ × 5². List every set of 4 different factors whose product is 2025.', '2025 = 3⁴ × 5². Daftar tiap himpunan 4 faktor berbeda yang hasil kalinya 2025.'),
    items: [
      { text: '{1,3,5,135}, {1,3,9,75}, {1,3,15,45}, {1,3,25,27}, {1,5,9,45}, {1,5,15,27}, {3,5,9,15}', ok: null },
      { text: t('Their sums 144, 88, 64, 56, 60, 48, 32 are 7 different values → m = 7', 'Jumlahnya 144, 88, 64, 56, 60, 48, 32 adalah 7 nilai berbeda → m = 7'), ok: null },
      { text: t('Smallest sum n = 32 (3+5+9+15) → m + n = 7 + 32 = 39', 'Jumlah terkecil n = 32 (3+5+9+15) → m + n = 7 + 32 = 39'), ok: true },
    ],
    final: t('m + n = 39.', 'm + n = 39.'),
    aria: t('Seven sets, smallest sum 32, so m plus n is 39.', 'Tujuh himpunan, jumlah terkecil 32, jadi m tambah n adalah 39.'),
  }
})

/** Q20 — chain of 2-digit multiples of 7; third largest. */
export const SevenChain25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Chain digits so every neighbouring pair is a 2-digit multiple of 7, with all digits different.', 'Rangkai angka sehingga tiap pasangan tetangga kelipatan 7 dua angka, dengan semua angka berbeda.'),
    items: [
      { text: t('The longest chains are 5 digits: 98421, 91428, 28491, 21498', 'Rantai terpanjang 5 angka: 98421, 91428, 28491, 21498'), ok: null },
      { text: t('Ranked largest first: 98421, 91428, 28491, …', 'Diurutkan terbesar dulu: 98421, 91428, 28491, …'), ok: null },
      { text: t('The 3rd largest is 28491', 'Terbesar ke-3 adalah 28491'), ok: true },
    ],
    final: t('The third largest such number is 28491.', 'Bilangan terbesar ketiga seperti itu adalah 28491.'),
    aria: t('After 98421 and 91428, the third largest chain is 28491.', 'Setelah 98421 dan 91428, rantai terbesar ketiga adalah 28491.'),
  }
})

/** Q21 — one "+" in 123…9899 for the minimum sum; last three digits. */
export const SplitSum25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Writing 1–99 gives a 189-digit string; one "+" splits it into A + B. Balance near the middle to minimize.', 'Menulis 1–99 memberi string 189 angka; satu "+" membaginya A + B. Seimbangkan dekat tengah untuk minimum.'),
    items: [
      { text: t('Best cut: after the 95th digit, so A ends …512 and B ends …899', 'Potongan terbaik: setelah angka ke-95, jadi A berakhir …512 dan B berakhir …899'), ok: null },
      { text: t('Add the last digits: 2+9 → 1, 5+9+1 → 5, 1+8+1 → 0', 'Jumlahkan angka terakhir: 2+9 → 1, 5+9+1 → 5, 1+8+1 → 0'), ok: null },
      { text: t('The last three digits are 051', 'Tiga angka terakhir adalah 051'), ok: true },
    ],
    final: t('The minimal sum ends in 051.', 'Jumlah minimum berakhir 051.'),
    aria: t('Carrying through the last three columns gives 051.', 'Menyimpan melalui tiga kolom terakhir memberi 051.'),
  }
})

/** Q22 — count W·M·I subsequences. */
export const Subsequence25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep W, M, I in left-to-right order and count the W→M→I picks.', 'Jaga W, M, I urut kiri ke kanan dan hitung pilihan W→M→I.'),
    items: [
      { text: t('There is one W (at the start), before both M’s in MATHEMATICS', 'Ada satu W (di awal), sebelum kedua M di MATHEMATICS'), ok: null },
      { text: t('Each M has all 4 later I’s after it: 4 + 4', 'Tiap M punya semua 4 I setelahnya: 4 + 4'), ok: null },
      { text: '4 + 4 = 8', ok: true },
    ],
    final: t('There are 8 ways to take W, M, I.', 'Ada 8 cara mengambil W, M, I.'),
    aria: t('One W and two M’s, each with four I’s after, give eight ways.', 'Satu W dan dua M, masing-masing dengan empat I setelahnya, memberi delapan cara.'),
  }
})

/** Q23 — cryptarithm 13TH + WMI + MATH = THAI; max THAI. */
export const Cryptarithm25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('For the biggest THAI aim for T = 9 (a result in the 9-thousands), which needs a large M.', 'Untuk THAI terbesar targetkan T = 9 (hasil di ribuan 9), yang butuh M besar.'),
    items: [
      { text: t('Testing the largest case M = 7, the carries force H = 5, A = 6, I = 8, W = 4', 'Menguji kasus terbesar M = 7, simpanan memaksa H = 5, A = 6, I = 8, W = 4'), ok: null },
      { text: t('Check: 1395 + 478 + 7695 = 9568, all digits different and non-zero', 'Cek: 1395 + 478 + 7695 = 9568, semua angka berbeda dan bukan nol'), ok: true },
    ],
    final: t('The largest THAI is 9568.', 'THAI terbesar adalah 9568.'),
    aria: t('With T nine and M seven, the sum 9568 is the largest valid THAI.', 'Dengan T sembilan dan M tujuh, jumlah 9568 adalah THAI sah terbesar.'),
  }
})

/** Q24 — smallest square > 2025 with a 0, a 5, and two 2's. */
export const SquareDigits25G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('We need a perfect square above 2025 whose digits include a 0, a 5, and two 2’s.', 'Kita butuh kuadrat sempurna di atas 2025 yang angkanya memuat 0, 5, dan dua 2.'),
    items: [
      { text: t('No 4-digit square fits — it would have to rearrange 0,2,2,5, and none of those are squares', 'Tak ada kuadrat 4 angka yang cocok — harus menyusun ulang 0,2,2,5, dan tak satu pun kuadrat'), ok: null },
      { text: t('Scan up: 46²=2116, 47²=2209, … none qualify', 'Telusuri ke atas: 46²=2116, 47²=2209, … tak ada yang memenuhi'), ok: null },
      { text: t('145² = 21025 has digits 2,1,0,2,5 — one 0, one 5, two 2’s ✓', '145² = 21025 punya angka 2,1,0,2,5 — satu 0, satu 5, dua 2 ✓'), ok: true },
    ],
    final: t('The smallest such square is 21025.', 'Kuadrat terkecil seperti itu adalah 21025.'),
    aria: t('145 squared, 21025, is the smallest qualifying square above 2025.', '145 kuadrat, 21025, adalah kuadrat memenuhi terkecil di atas 2025.'),
  }
})
