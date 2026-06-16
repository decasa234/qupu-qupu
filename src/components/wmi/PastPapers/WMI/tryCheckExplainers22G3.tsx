import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-22F3A (2022 Grade 3 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 20 × 22 − 202 + 2: multiply first, then left to right. */
export const Compute22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiplication comes first, then work left to right.', 'Perkalian dulu, lalu kerjakan dari kiri ke kanan.'),
    items: [
      { text: '20 × 22 = 440', ok: null },
      { text: '440 − 202 = 238', ok: null },
      { text: '238 + 2 = 240', ok: true },
    ],
    final: t('20 × 22 − 202 + 2 = 240 (A).', '20 × 22 − 202 + 2 = 240 (A).'),
    aria: t('Multiplying gives 440, then 238, then 240.', 'Perkalian memberi 440, lalu 238, lalu 240.'),
  }
})

/** Q6 — Remi's cakes: compare the two trips to find the unit price. */
export const CakeBudget22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the two trips. The gap in cakes and the gap in money reveal one cake’s price.', 'Bandingkan dua keadaan. Selisih kue dan selisih uang menyingkap harga satu kue.'),
    items: [
      { text: t('5 cakes → 25 left; 9 cakes → 15 short. That is 4 more cakes.', '5 kue → sisa 25; 9 kue → kurang 15. Itu 4 kue lebih banyak.'), ok: null },
      { text: t('Money used changes by 25 + 15 = 40, so 4 cakes cost 40 → one cake = 10', 'Uang berubah 25 + 15 = 40, jadi 4 kue = 40 → satu kue = 10'), ok: null },
      { text: t('Her money = 5 × 10 + 25 = 75', 'Uangnya = 5 × 10 + 25 = 75'), ok: null },
      { text: '75 ÷ 10 = 7', ok: true },
    ],
    final: t('Remi can buy at most 7 cakes (C).', 'Remi bisa membeli paling banyak 7 kue (C).'),
    aria: t('One cake costs ten, she has seventy-five, so she can buy seven.', 'Satu kue sepuluh, ia punya tujuh puluh lima, jadi bisa membeli tujuh.'),
  }
})

/** Q7 — equal spend 4044 total: 3 blouses vs 2 skirts, find the price gap. */
export const BlouseSkirt22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('They each spent the same, and 4044 in total — so split it in half first.', 'Mereka menghabiskan jumlah yang sama, total 4044 — jadi bagi dua dulu.'),
    items: [
      { text: t('Each person spent 4044 ÷ 2 = 2022', 'Tiap orang menghabiskan 4044 ÷ 2 = 2022'), ok: null },
      { text: t('3 blouses = 2022 → one blouse = 2022 ÷ 3 = 674', '3 blus = 2022 → satu blus = 2022 ÷ 3 = 674'), ok: null },
      { text: t('2 skirts = 2022 → one skirt = 2022 ÷ 2 = 1011', '2 rok = 2022 → satu rok = 2022 ÷ 2 = 1011'), ok: null },
      { text: '1011 − 674 = 337', ok: true },
    ],
    final: t('A blouse and a skirt differ by 337 dollars (A).', 'Selisih harga blus dan rok adalah 337 dolar (A).'),
    aria: t('A blouse is 674, a skirt is 1011, so the difference is 337.', 'Blus 674, rok 1011, jadi selisihnya 337.'),
  }
})

/** Q9 — 4-digit even numbers from {4,5,8,2} between 5400 and 8500. */
export const EvenCount22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Even means it ends in 2, 4, or 8 (never 5). Between 5400 and 8500 means it starts with 5 or 8.', 'Genap berarti berakhiran 2, 4, atau 8 (tak pernah 5). Antara 5400 dan 8500 berarti diawali 5 atau 8.'),
    items: [
      { text: t('Start with 5 (and ≥ 5400): 5428, 5482, 5824, 5842 → 4 numbers', 'Diawali 5 (dan ≥ 5400): 5428, 5482, 5824, 5842 → 4 bilangan'), ok: null },
      { text: t('Start with 8 (and ≤ 8500, still even): 8254, 8452 → 2 numbers', 'Diawali 8 (dan ≤ 8500, tetap genap): 8254, 8452 → 2 bilangan'), ok: null },
      { text: '4 + 2 = 6', ok: true },
    ],
    final: t('There are 6 such numbers (B).', 'Ada 6 bilangan seperti itu (B).'),
    aria: t('Four start with five and two start with eight, giving six even numbers.', 'Empat diawali lima dan dua diawali delapan, memberi enam bilangan genap.'),
  }
})

/** Q10 — Cathy's arrival: anchor to the on-time clock. */
export const MeetingTime22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('On time is 12:15 (Linda). Work out Roy first, then Cathy.', 'Tepat waktu adalah 12:15 (Linda). Cari Roy dulu, lalu Cathy.'),
    items: [
      { text: t('Roy is 20 min early: 12:15 − 20 = 11:55', 'Roy 20 menit lebih awal: 12:15 − 20 = 11:55'), ok: null },
      { text: t('¼ hour = 15 min, and Cathy comes 15 min after Roy', '¼ jam = 15 menit, dan Cathy datang 15 menit setelah Roy'), ok: null },
      { text: '11:55 + 15 = 12:10', ok: true },
    ],
    final: t('Cathy arrives at 12:10 (C).', 'Cathy tiba pukul 12:10 (C).'),
    aria: t('Roy at 11:55 plus fifteen minutes gives Cathy at 12:10.', 'Roy pukul 11:55 plus lima belas menit memberi Cathy 12:10.'),
  }
})

/** Q12 — Jurassic Park visitors over 3 days. */
export const Visitors22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each day’s visitors in turn, then add all three.', 'Cari pengunjung tiap hari berturut-turut, lalu jumlahkan ketiganya.'),
    items: [
      { text: t('Day 2: 422 − 257 = 165', 'Hari ke-2: 422 − 257 = 165'), ok: null },
      { text: t('Day 3: 3 × 165 = 495', 'Hari ke-3: 3 × 165 = 495'), ok: null },
      { text: t('Total: 422 + 165 + 495 = 1082', 'Total: 422 + 165 + 495 = 1082'), ok: true },
    ],
    final: t('1082 visitors over the three days (C).', '1082 pengunjung selama tiga hari (C).'),
    aria: t('Days are 422, 165, and 495, adding to 1082.', 'Harinya 422, 165, dan 495, berjumlah 1082.'),
  }
})

/** Q14 — difference sequence 20, 22, 2, 20, …; find the 30th term. */
export const DiffSeq22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('From the 3rd term on, each term = the larger minus the smaller of the two before it.', 'Mulai dari suku ke-3, tiap suku = yang besar dikurangi yang kecil dari dua sebelumnya.'),
    items: [
      { text: '20, 22, 2, 20, 18, 2, 16, 14, 2, 12, 10, 2, 8, 6, 2, 4, 2, 2, 0, …', ok: null },
      { text: t('From the 17th term it repeats every 3: 2, 2, 0', 'Mulai suku ke-17 berulang tiap 3: 2, 2, 0'), ok: null },
      { text: t('Term 30 is the 2nd item of a 2-2-0 block → 2', 'Suku ke-30 adalah item ke-2 dari blok 2-2-0 → 2'), ok: true },
    ],
    final: t('The 30th term is 2 (D).', 'Suku ke-30 adalah 2 (D).'),
    aria: t('The sequence settles into a repeating 2, 2, 0, and the 30th term is 2.', 'Barisan menetap berulang 2, 2, 0, dan suku ke-30 adalah 2.'),
  }
})

/** Q15 — 1×9+2=11, 12×9+3=111, … reach 111111. */
export const NinesPattern22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each line is (1, 12, 123, …) × 9 + (the next counting number), and the answer is a row of 1’s.', 'Tiap baris adalah (1, 12, 123, …) × 9 + (bilangan urut berikutnya), dan hasilnya deretan 1.'),
    items: [
      { text: '1×9+2 = 11, 12×9+3 = 111, 123×9+4 = 1111, …', ok: null },
      { text: t('111111 has six 1’s → the line is 12345 × 9 + 6', '111111 punya enam angka 1 → barisnya 12345 × 9 + 6'), ok: null },
      { text: t('So △ = 12345, ○ = 6 → △ + ○ = 12351', 'Jadi △ = 12345, ○ = 6 → △ + ○ = 12351'), ok: null },
      { text: t('Digit sum of 12351 = 1 + 2 + 3 + 5 + 1 = 12', 'Jumlah digit 12351 = 1 + 2 + 3 + 5 + 1 = 12'), ok: true },
    ],
    final: t('The digit sum of △ + ○ is 12 (B).', 'Jumlah digit △ + ○ adalah 12 (B).'),
    aria: t('The triangle is 12345 and the circle is 6, summing to 12351 with digit sum 12.', 'Segitiga 12345 dan lingkaran 6, berjumlah 12351 dengan jumlah digit 12.'),
  }
})

/** Q16 — next year using the digits 2, 2, 2, 0 after 2022. */
export const NextYear22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('2022 uses the digits 2, 2, 2, 0. Rearrange them into a year bigger than 2022.', '2022 memakai angka 2, 2, 2, 0. Susun ulang menjadi tahun yang lebih besar dari 2022.'),
    items: [
      { text: t('Years above 2022 (0 can’t lead): 2202 and 2220', 'Tahun di atas 2022 (0 tak boleh di depan): 2202 dan 2220'), ok: null },
      { text: t('The first one after 2022 is 2202', 'Yang pertama setelah 2022 adalah 2202'), ok: null },
      { text: '2202 − 2022 = 180', ok: true },
    ],
    final: t('The next such year is 2202, which is 180 years later.', 'Tahun berikutnya seperti itu adalah 2202, yaitu 180 tahun kemudian.'),
    aria: t('The next rearrangement above 2022 is 2202, 180 years later.', 'Susunan berikutnya di atas 2022 adalah 2202, 180 tahun kemudian.'),
  }
})

/** Q22 — 2022 doors toggled by divisors; perfect squares stay open. */
export const OpenDoors22G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Door d is changed once by every number that divides d — so once per divisor of d.', 'Pintu d diubah satu kali oleh tiap bilangan yang membagi d — jadi satu kali per pembagi d.'),
    items: [
      { text: t('A door ends OPEN only if toggled an odd number of times → d has an odd number of divisors', 'Pintu berakhir TERBUKA hanya jika dibalik ganjil kali → d punya banyak pembagi ganjil'), ok: null },
      { text: t('Only perfect squares have an odd number of divisors', 'Hanya bilangan kuadrat sempurna yang banyak pembaginya ganjil'), ok: null },
      { text: t('Squares up to 2022: 1², 2², …, 44² = 1936 (45² = 2025 is too big)', 'Kuadrat sampai 2022: 1², 2², …, 44² = 1936 (45² = 2025 terlalu besar)'), ok: null },
      { text: t('So 44 doors stay open', 'Jadi 44 pintu tetap terbuka'), ok: true },
    ],
    final: t('44 doors are open at the end.', '44 pintu terbuka pada akhirnya.'),
    aria: t('Only perfect-square doors stay open; there are 44 squares up to 2022.', 'Hanya pintu kuadrat sempurna yang tetap terbuka; ada 44 kuadrat sampai 2022.'),
  }
})
