import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-22F2A (2022 Grade 2 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q2 — 81 − 22 − 39 + 7, left to right. */
export const Compute22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one step at a time.', 'Kerjakan dari kiri ke kanan, satu langkah tiap kali.'),
    items: [
      { text: '81 − 22 = 59', ok: null },
      { text: '59 − 39 = 20', ok: null },
      { text: '20 + 7 = 27', ok: true },
    ],
    final: t('81 − 22 − 39 + 7 = 27 (D).', '81 − 22 − 39 + 7 = 27 (D).'),
    aria: t('Going left to right gives 59, then 20, then 27.', 'Dari kiri ke kanan memberi 59, lalu 20, lalu 27.'),
  }
})

/** Q4 — 7 + 5 = 12 chocolates shared by 3; Burt gives his excess over the fair share. */
export const ShareCandy22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the equal share first, then see how many extra Burt is holding.', 'Cari bagian yang sama dulu, lalu lihat berapa kelebihan yang dipegang Burt.'),
    items: [
      { text: t('All chocolates: 7 + 5 = 12', 'Semua cokelat: 7 + 5 = 12'), ok: null },
      { text: t('Three people share equally: 12 ÷ 3 = 4 each', 'Tiga orang berbagi sama: 12 ÷ 3 = 4 tiap orang'), ok: null },
      { text: t('Burt has 7, keeps 4, so gives away 7 − 4 = 3', 'Burt punya 7, menyimpan 4, jadi memberi 7 − 4 = 3'), ok: true },
    ],
    final: t('Burt gives Sara 3 chocolates (B).', 'Burt memberi Sara 3 cokelat (B).'),
    aria: t('A fair share is 4, and Burt has 7, so he gives away 3.', 'Bagian adilnya 4, dan Burt punya 7, jadi ia memberi 3.'),
  }
})

/** Q6 — 60 days after Saturday: reduce mod 7. */
export const Birthday22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Days of the week repeat every 7. Strip off whole weeks first.', 'Hari berulang tiap 7. Buang minggu-minggu penuh dulu.'),
    items: [
      { text: t('Mom’s birthday is Saturday', 'Ulang tahun Ibu hari Sabtu'), ok: null },
      { text: t('60 days = 56 + 4, and 56 days = exactly 8 weeks', '60 hari = 56 + 4, dan 56 hari = tepat 8 minggu'), ok: null },
      { text: t('Only the extra 4 days matter: Sat → Sun → Mon → Tue → Wed', 'Hanya 4 hari sisa yang penting: Sab → Min → Sen → Sel → Rab'), ok: true },
    ],
    final: t('Dad’s birthday is on a Wednesday (C).', 'Ulang tahun Ayah jatuh pada hari Rabu (C).'),
    aria: t('Sixty days is eight weeks and four days; four days after Saturday is Wednesday.', 'Enam puluh hari adalah delapan minggu dan empat hari; empat hari setelah Sabtu adalah Rabu.'),
  }
})

/** Q7 — sprout doubles from 3 cm; first day over 100 cm. */
export const DoubleTree22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('One metre is 100 cm. Double the height each day until it passes 100.', 'Satu meter adalah 100 cm. Gandakan tingginya tiap hari sampai melewati 100.'),
    items: [
      { text: t('Days 1–5: 3, 6, 12, 24, 48 cm — all under 100', 'Hari 1–5: 3, 6, 12, 24, 48 cm — semua di bawah 100'), ok: null },
      { text: t('Day 6: 96 cm — still under 100', 'Hari ke-6: 96 cm — masih di bawah 100'), ok: false },
      { text: t('Day 7: 192 cm — over 100 at last!', 'Hari ke-7: 192 cm — akhirnya lebih dari 100!'), ok: true },
    ],
    final: t('It first passes 1 m on day 7 (B).', 'Pertama kali melewati 1 m pada hari ke-7 (B).'),
    aria: t('Day six is ninety-six centimetres, day seven is one hundred ninety-two, the first over a metre.', 'Hari keenam 96 sentimeter, hari ketujuh 192, pertama yang melewati satu meter.'),
  }
})

/** Q9 — 12+23+34+□ = 43+32+21: balance the sides. */
export const BalanceEq22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both sides must be equal. Add up the side you fully know.', 'Kedua ruas harus sama. Jumlahkan ruas yang sudah diketahui penuh.'),
    items: [
      { text: '43 + 32 + 21 = 96', ok: null },
      { text: '12 + 23 + 34 = 69', ok: null },
      { text: '□ = 96 − 69 = 27', ok: true },
    ],
    final: t('The missing number is 27 (D).', 'Bilangan yang hilang adalah 27 (D).'),
    aria: t('The right side is 96, the known left side is 69, so the box is 27.', 'Ruas kanan 96, ruas kiri yang diketahui 69, jadi kotaknya 27.'),
  }
})

/** Q13 — two 3-digit numbers from {9,6,4,0,2,3}, sum closest to 500; digit sum of total. */
export const CardsClosest22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both numbers use all six cards once. The two hundreds digits decide the size — and 0 can’t lead.', 'Kedua bilangan memakai semua enam kartu sekali. Dua digit ratusan menentukan ukuran — dan 0 tak boleh di depan.'),
    items: [
      { text: t('Smallest usable hundreds digits are 2 and 3 → hundreds part = 100 × (2+3) = 500', 'Digit ratusan terkecil yang bisa dipakai adalah 2 dan 3 → bagian ratusan = 100 × (2+3) = 500'), ok: null },
      { text: t('That’s already at 500, so make the leftovers {0, 4, 6, 9} add as little as possible', 'Itu sudah 500, jadi buat sisa {0, 4, 6, 9} menambah sesedikit mungkin'), ok: null },
      { text: t('Small in the tens, big in the ones: 10×(0+4) + (6+9) = 40 + 15 = 55', 'Kecil di puluhan, besar di satuan: 10×(0+4) + (6+9) = 40 + 15 = 55'), ok: null },
      { text: t('Closest total: 206 + 349 = 555 (nothing lands between 500 and 555)', 'Total terdekat: 206 + 349 = 555 (tak ada di antara 500 dan 555)'), ok: true },
    ],
    final: t('The closest total is 555; its digit sum is 5 + 5 + 5 = 15 (C).', 'Total terdekat adalah 555; jumlah digitnya 5 + 5 + 5 = 15 (C).'),
    aria: t('Hundreds two and three force 500, the rest add 55, giving 555 with digit sum 15.', 'Ratusan dua dan tiga memaksa 500, sisanya menambah 55, memberi 555 dengan jumlah digit 15.'),
  }
})

/** Q14 — 102 herbivorous eggs, 5×17 hatch; how many unhatched. */
export const DinoEggs22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the herbivorous eggs first, then take away the ones that hatched.', 'Cari telur herbivora dulu, lalu kurangi yang menetas.'),
    items: [
      { text: t('Herbivorous eggs: 150 − 48 = 102', 'Telur herbivora: 150 − 48 = 102'), ok: null },
      { text: t('Hatched herbivorous: 5 × 17 = 85', 'Herbivora yang menetas: 5 × 17 = 85'), ok: null },
      { text: '102 − 85 = 17', ok: true },
    ],
    final: t('17 herbivorous eggs are still unhatched (A).', '17 telur herbivora belum menetas (A).'),
    aria: t('Of 102 herbivorous eggs, 85 hatch, leaving 17.', 'Dari 102 telur herbivora, 85 menetas, sisa 17.'),
  }
})

/** Q22 — 6-ball, 12 kg color mixes; three distinct mixes use all colors; Carter's red. */
export const BallShare22G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each person’s 6 balls weigh 12 kg. With blue = 3, red = 2, green = 1 kg, that needs 2·blue + red = 6.', 'Tiap orang punya 6 bola seberat 12 kg. Dengan biru = 3, merah = 2, hijau = 1 kg, itu butuh 2·biru + merah = 6.'),
    items: [
      { text: t('Possible mixes (blue, red, green): (0,6,0), (1,4,1), (2,2,2), (3,0,3)', 'Kemungkinan campuran (biru, merah, hijau): (0,6,0), (1,4,1), (2,2,2), (3,0,3)'), ok: null },
      { text: t('Three DIFFERENT mixes must use all 6 of each colour: (1,4,1)+(2,2,2)+(3,0,3)', 'Tiga campuran BERBEDA harus memakai semua 6 tiap warna: (1,4,1)+(2,2,2)+(3,0,3)'), ok: null },
      { text: t('Check colours: blue 1+2+3 = 6, red 4+2+0 = 6, green 1+2+3 = 6 ✓', 'Cek warna: biru 1+2+3 = 6, merah 4+2+0 = 6, hijau 1+2+3 = 6 ✓'), ok: null },
      { text: t('Carter holds the (1,4,1) mix → 4 red balls', 'Carter memegang campuran (1,4,1) → 4 bola merah'), ok: true },
    ],
    final: t('Carter gets 4 red balls.', 'Carter mendapat 4 bola merah.'),
    aria: t('The three distinct equal-weight mixes are (1,4,1), (2,2,2), (3,0,3); Carter has four red.', 'Tiga campuran setara yang berbeda adalah (1,4,1), (2,2,2), (3,0,3); Carter punya empat merah.'),
  }
})
