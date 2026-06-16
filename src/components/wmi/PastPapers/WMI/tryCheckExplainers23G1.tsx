import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-23F1A (2023 Grade 1 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q14 — which odd matchstick number becomes even by moving one stick. */
export const MatchstickMove23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All five numbers (81, 25, 47, 59, 65) are odd. Moving exactly one matchstick changes a digit — we want an even result.', 'Kelima bilangan (81, 25, 47, 59, 65) ganjil. Memindahkan tepat satu korek mengubah angka — kita ingin hasil genap.'),
    items: [
      { text: t('Look at 59: the 9 is one stick away from a 0 (move its middle stick to the bottom-left)', 'Lihat 59: angka 9 hanya satu korek dari 0 (pindahkan korek tengahnya ke kiri-bawah)'), ok: null },
      { text: t('That turns 59 into 50 — an even number', 'Itu mengubah 59 menjadi 50 — bilangan genap'), ok: true },
    ],
    final: t('Number D (59) becomes 50 (D).', 'Bilangan D (59) menjadi 50 (D).'),
    aria: t('Moving one stick turns the 9 of 59 into a 0, making 50, which is even.', 'Memindahkan satu korek mengubah 9 pada 59 menjadi 0, membuat 50, yang genap.'),
  }
})

/** Q2 — smallest of five expressions. */
export const SmallestExpr23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every expression, then pick the smallest result.', 'Hitung setiap perhitungan, lalu pilih hasil terkecil.'),
    items: [
      { text: 'B: 6 + 6 − 2 = 10', ok: false },
      { text: 'C: 10 − 3 + 7 = 14', ok: false },
      { text: 'E: 4 + 6 + 2 = 12', ok: false },
      { text: t('D: 14 − 4 − 3 = 7 — small, but not the smallest', 'D: 14 − 4 − 3 = 7 — kecil, tapi bukan terkecil'), ok: false },
      { text: t('A: 8 + 7 − 10 = 5 — the smallest!', 'A: 8 + 7 − 10 = 5 — paling kecil!'), ok: true },
    ],
    final: t('A gives the smallest result, 5 (A).', 'A memberi hasil terkecil, 5 (A).'),
    aria: t('Of all five, 8 plus 7 minus 10 equals 5, the smallest.', 'Dari kelima, 8 tambah 7 kurang 10 sama dengan 5, yang terkecil.'),
  }
})

/** Q4 — apple baskets equalise after moving 8. */
export const AppleBaskets23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work forward to the equal amount, then undo the move to find the start.', 'Maju ke jumlah yang sama, lalu balikkan perpindahan untuk cari awalnya.'),
    items: [
      { text: t('Move 8 out of basket 1: 32 − 8 = 24', 'Pindahkan 8 dari keranjang 1: 32 − 8 = 24'), ok: null },
      { text: t('Now both are equal, so basket 2 also has 24', 'Sekarang keduanya sama, jadi keranjang 2 juga 24'), ok: null },
      { text: t('Basket 2 gained those 8, so it began with 24 − 8 = 16', 'Keranjang 2 menerima 8 itu, jadi semula 24 − 8 = 16'), ok: true },
    ],
    final: t('The second basket started with 16 apples (C).', 'Keranjang kedua semula berisi 16 apel (C).'),
    aria: t('Both end at 24, and basket two gained 8, so it began with 16.', 'Keduanya berakhir 24, dan keranjang dua menerima 8, jadi mulai dari 16.'),
  }
})

/** Q5 — change from $50 after spending 9 + 14. */
export const ChangeMoney23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the change first, then match it to an option.', 'Cari kembaliannya dulu, lalu cocokkan dengan pilihan.'),
    items: [
      { text: t('Dad spends 9 + 14 = 23', 'Ayah membayar 9 + 14 = 23'), ok: null },
      { text: t('Change from $50: 50 − 23 = 27', 'Kembalian dari $50: 50 − 23 = 27'), ok: null },
      { text: t('Which option makes 27? $20 + $5 + $1 + $1 = 27', 'Pilihan mana yang 27? $20 + $5 + $1 + $1 = 27'), ok: true },
    ],
    final: t('The change is $27, which is option C.', 'Kembaliannya $27, yaitu pilihan C.'),
    aria: t('Spending 23 from 50 leaves 27, matching twenty plus five plus one plus one.', 'Membayar 23 dari 50 menyisakan 27, cocok dengan dua puluh plus lima plus satu plus satu.'),
  }
})

/** Q7 — balloon trade: 5 red for 3 yellow. */
export const BalloonTrade23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count each person after the swap, then compare.', 'Hitung tiap orang setelah pertukaran, lalu bandingkan.'),
    items: [
      { text: t('Mary gives 5, gets 3: 14 − 5 + 3 = 12', 'Mary memberi 5, menerima 3: 14 − 5 + 3 = 12'), ok: null },
      { text: t('Denny gives 3, gets 5: 9 − 3 + 5 = 11', 'Denny memberi 3, menerima 5: 9 − 3 + 5 = 11'), ok: null },
      { text: t('12 > 11 → Mary has 1 more', '12 > 11 → Mary punya 1 lebih banyak'), ok: true },
    ],
    final: t('Mary has 1 more balloon (A).', 'Mary punya 1 balon lebih banyak (A).'),
    aria: t('After the trade Mary has 12 and Denny 11, so Mary leads by one.', 'Setelah tukar Mary punya 12 dan Denny 11, jadi Mary unggul satu.'),
  }
})

/** Q8 — whole numbers between 20 and 80 ending in 3. */
export const UnitsDigit23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the numbers ending in 3 that are above 20 and below 80.', 'Daftar bilangan berakhiran 3 yang di atas 20 dan di bawah 80.'),
    items: [
      { text: '23, 33, 43, 53, 63, 73', ok: null },
      { text: t('Not 13 (below 20) and not 83 (above 80)', 'Bukan 13 (di bawah 20) dan bukan 83 (di atas 80)'), ok: null },
      { text: t('Count them: 6', 'Hitung: 6'), ok: true },
    ],
    final: t('There are 6 such numbers (C).', 'Ada 6 bilangan seperti itu (C).'),
    aria: t('From 23 up to 73 there are six numbers ending in 3.', 'Dari 23 sampai 73 ada enam bilangan berakhiran 3.'),
  }
})

/** Q9 — fill +/− so 9 □ 4 = 6 □ 3 □ 2. */
export const SignFill23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both sides must be equal. Choose a left value, then match the right side to it.', 'Kedua sisi harus sama. Pilih nilai kiri, lalu cocokkan sisi kanan.'),
    items: [
      { text: t('Try the left side 9 − 4 = 5', 'Coba sisi kiri 9 − 4 = 5'), ok: null },
      { text: t('Make the right side 5 too: 6 − 3 + 2 = 5 ✓', 'Buat sisi kanan juga 5: 6 − 3 + 2 = 5 ✓'), ok: null },
      { text: t('Signs left to right: −, −, +', 'Tanda dari kiri ke kanan: −, −, +'), ok: true },
    ],
    final: t('The signs are −, −, + (E).', 'Tandanya −, −, + (E).'),
    aria: t('Nine minus four is five, and six minus three plus two is five too.', 'Sembilan kurang empat adalah lima, dan enam kurang tiga tambah dua juga lima.'),
  }
})

/** Q15 — repeating colours every 4; 25th and 50th students. */
export const ColorCycle23G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The colours repeat every 4. Divide the position by 4 and use the remainder.', 'Warna berulang tiap 4. Bagi posisi dengan 4 dan pakai sisanya.'),
    items: [
      { text: t('Cycle: red(1), blue(2), yellow(3), green(4)', 'Siklus: merah(1), biru(2), kuning(3), hijau(4)'), ok: null },
      { text: t('25 ÷ 4 = 6 remainder 1 → 1st colour = red', '25 ÷ 4 = 6 sisa 1 → warna ke-1 = merah'), ok: null },
      { text: t('50 ÷ 4 = 12 remainder 2 → 2nd colour = blue', '50 ÷ 4 = 12 sisa 2 → warna ke-2 = biru'), ok: true },
    ],
    final: t('The 25th gets red and the 50th gets blue (C).', 'Ke-25 mendapat merah dan ke-50 mendapat biru (C).'),
    aria: t('Remainder one is red, remainder two is blue, so red then blue.', 'Sisa satu adalah merah, sisa dua adalah biru, jadi merah lalu biru.'),
  }
})
