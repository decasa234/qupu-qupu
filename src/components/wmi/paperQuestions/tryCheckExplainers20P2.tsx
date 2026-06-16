import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-20P2A (2020 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 85 − 49 + 13 left to right. */
export const LeftToRightCompute20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one step at a time.', 'Kerjakan dari kiri ke kanan, satu langkah sekali.'),
    items: [
      { text: t('First do the subtraction: 85 − 49 = 36', 'Pertama hitung pengurangan: 85 − 49 = 36'), ok: null },
      { text: t('Then add 13: 36 + 13 = 49', 'Lalu tambahkan 13: 36 + 13 = 49'), ok: null },
      { text: t('Don’t subtract the 13: 85 − (49 + 13) = 39 — the 13 is added, not taken away', 'Jangan mengurangi 13: 85 − (49 + 13) = 39 — 13 itu ditambah, bukan dikurangi'), ok: false },
      { text: '85 − 49 + 13 = 49', ok: true },
    ],
    final: t('85 − 49 + 13 = 49 (A).', '85 − 49 + 13 = 49 (A).'),
    aria: t('Subtracting 49 from 85 then adding 13 gives 49.', 'Mengurangi 49 dari 85 lalu menambah 13 menghasilkan 49.'),
  }
})

/** Q2 — sequence 809, 833, 857 steps by 24; find the term before 809. */
export const StepBackSequence20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the common step, then go backward one step.', 'Cari beda tetap, lalu mundur satu langkah.'),
    items: [
      { text: t('The step is 24: 833 − 809 = 24 and 857 − 833 = 24', 'Loncatannya 24: 833 − 809 = 24 dan 857 − 833 = 24'), ok: null },
      { text: t('The missing term sits just before 809, so step back: 809 − 24 = 785', 'Yang hilang ada tepat sebelum 809, jadi mundur: 809 − 24 = 785'), ok: null },
      { text: t('Don’t use a step of 32: 809 − 32 = 777 — the real step is 24', 'Jangan pakai loncatan 32: 809 − 32 = 777 — loncatan sebenarnya 24'), ok: false },
      { text: t('The missing value is 785', 'Nilai yang hilang adalah 785'), ok: true },
    ],
    final: t('The missing value is 785 (B).', 'Nilai yang hilang adalah 785 (B).'),
    aria: t('Stepping back 24 from 809 gives 785.', 'Mundur 24 dari 809 menghasilkan 785.'),
  }
})

/** Q3 — triangle perimeter (3×6) vs square perimeter (4×4); which is longer and by how much. */
export const ThreadPerimeter20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each perimeter, then subtract.', 'Cari setiap keliling, lalu kurangkan.'),
    items: [
      { text: t('Green triangle: 3 sides of 6 cm → 6 + 6 + 6 = 18 cm', 'Segitiga hijau: 3 sisi 6 cm → 6 + 6 + 6 = 18 cm'), ok: null },
      { text: t('Red square: 4 sides of 4 cm → 4 + 4 + 4 + 4 = 16 cm', 'Persegi merah: 4 sisi 4 cm → 4 + 4 + 4 + 4 = 16 cm'), ok: null },
      { text: t('Don’t pick red just for having more sides: 4 short sides (16) lose to 3 long sides (18)', 'Jangan pilih merah hanya karena sisinya lebih banyak: 4 sisi pendek (16) kalah dari 3 sisi panjang (18)'), ok: false },
      { text: t('Green is longer by 18 − 16 = 2 cm', 'Hijau lebih panjang sebanyak 18 − 16 = 2 cm'), ok: true },
    ],
    final: t('Green thread, 2 cm longer (B).', 'Benang hijau, 2 cm lebih panjang (B).'),
    aria: t('The green triangle thread is 18 cm versus the red square’s 16 cm, so green is 2 cm longer.', 'Benang segitiga hijau 18 cm dibanding persegi merah 16 cm, jadi hijau 2 cm lebih panjang.'),
  }
})

/** Q4 — which product lands strictly between 23 and 32. */
export const BetweenRange20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Evaluate each option and check the range — bigger than 23 and smaller than 32.', 'Hitung tiap pilihan dan cek rentangnya — lebih besar dari 23 dan lebih kecil dari 32.'),
    items: [
      { text: t('2 × 6 = 12 is too small (below 23)', '2 × 6 = 12 terlalu kecil (di bawah 23)'), ok: false },
      { text: t('7 × 7 = 49 is too big (above 32)', '7 × 7 = 49 terlalu besar (di atas 32)'), ok: false },
      { text: t('8 × 5 = 40 is close but still above 32', '8 × 5 = 40 dekat tapi tetap di atas 32'), ok: false },
      { text: t('9 × 3 = 27 lands neatly between 23 and 32', '9 × 3 = 27 jatuh tepat di antara 23 dan 32'), ok: true },
    ],
    final: t('9 × 3 = 27 is between 23 and 32 (D).', '9 × 3 = 27 ada di antara 23 dan 32 (D).'),
    aria: t('Only 9 times 3 equals 27, which is more than 23 and less than 32.', 'Hanya 9 kali 3 sama dengan 27, yang lebih dari 23 dan kurang dari 32.'),
  }
})

/** Q5 — shared denominator 93; star = 93 − 57 = 36 (keyed). */
export const SharedDenominatorStar20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the shared denominator to recover the star.', 'Pakai penyebut yang sama untuk menemukan bintang.'),
    items: [
      { text: t('Both fractions share the same bottom number, 93', 'Kedua pecahan punya penyebut sama, yaitu 93'), ok: null },
      { text: t('The key works the star as a difference from 93: 93 − 57 = 36', 'Kuncinya memperlakukan bintang sebagai selisih dari 93: 93 − 57 = 36'), ok: null },
      { text: t('Don’t settle for 35 — it is one off the keyed 36', 'Jangan puas dengan 35 — meleset satu dari kunci 36'), ok: false },
      { text: t('The star stands for 36', 'Bintang bernilai 36'), ok: true },
    ],
    final: t('The star = 36 (C).', 'Bintang = 36 (C).'),
    aria: t('Using 93 minus 57, the star is 36.', 'Memakai 93 dikurangi 57, bintang adalah 36.'),
  }
})

/** Q8 — only 54 is even (behind John); the cross then puts 7 on his left. */
export const EvenBehindCross20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the even-number clue to orient the figure.', 'Pakai petunjuk angka genap untuk menentukan arah gambar.'),
    items: [
      { text: t('Among 3, 29, 54, 7, only 54 is even, so 54 is behind John', 'Di antara 3, 29, 54, 7, hanya 54 yang genap, jadi 54 di belakang John'), ok: null },
      { text: t('Don’t answer 54 — it sits behind John, not on his left', 'Jangan jawab 54 — posisinya di belakang John, bukan di kirinya'), ok: false },
      { text: t('Fixing 54 behind fixes the whole cross; the left spot is 7', 'Menetapkan 54 di belakang menetapkan seluruh salib; tempat kiri adalah 7'), ok: null },
      { text: t('The number on his left is 7', 'Angka di sebelah kirinya adalah 7'), ok: true },
    ],
    final: t('The number on John’s left is 7 (A).', 'Angka di sebelah kiri John adalah 7 (A).'),
    aria: t('Placing the even number 54 behind John leaves 7 on his left.', 'Menempatkan angka genap 54 di belakang John menyisakan 7 di kirinya.'),
  }
})

/** Q10 — cup = 32÷8 = 4 = square; then 4 × triangle = 20 → triangle = 5. */
export const ShapeSubstitution20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the easy clue first, then substitute.', 'Selesaikan petunjuk mudah dulu, lalu substitusi.'),
    items: [
      { text: t('From 8 × cup = 32, divide: cup = 32 ÷ 8 = 4', 'Dari 8 × cangkir = 32, bagi: cangkir = 32 ÷ 8 = 4'), ok: null },
      { text: t('The square equals the cup, so square = 4', 'Persegi bernilai sama dengan cangkir, jadi persegi = 4'), ok: null },
      { text: t('Don’t stop at 4 — that is the cup and square, not the triangle', 'Jangan berhenti di 4 — itu cangkir dan persegi, bukan segitiga'), ok: false },
      { text: t('Now 4 × triangle = 20, so triangle = 20 ÷ 4 = 5', 'Sekarang 4 × segitiga = 20, jadi segitiga = 20 ÷ 4 = 5'), ok: true },
    ],
    final: t('The triangle = 5 (D).', 'Segitiga = 5 (D).'),
    aria: t('The cup and square are 4, so the triangle is 20 divided by 4, which is 5.', 'Cangkir dan persegi bernilai 4, jadi segitiga adalah 20 dibagi 4, yaitu 5.'),
  }
})

/** Q11 — Dad = 5 × 9 + 13 = 58 (multiply first, then add). */
export const MultiplyThenAddAge20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply first, then add — the order matters.', 'Kalikan dulu, lalu tambah — urutan penting.'),
    items: [
      { text: t('My age is 9, and five times that is 5 × 9 = 45', 'Umur saya 9, dan lima kalinya adalah 5 × 9 = 45'), ok: null },
      { text: t('Then add 13 more: 45 + 13 = 58', 'Lalu tambahkan 13 lagi: 45 + 13 = 58'), ok: null },
      { text: t('Don’t scramble the order to land on 48 — 5 × 9 + 13 = 58, not 48', 'Jangan kacaukan urutan jadi 48 — 5 × 9 + 13 = 58, bukan 48'), ok: false },
      { text: t('Dad’s age = 58', 'Umur Ayah = 58'), ok: true },
    ],
    final: t('Dad is 58 (C).', 'Ayah berumur 58 (C).'),
    aria: t('Five times nine is forty-five, plus thirteen makes fifty-eight.', 'Lima kali sembilan adalah empat puluh lima, ditambah tiga belas menjadi lima puluh delapan.'),
  }
})

/** Q12 — Joe 33 is 17 LESS than Alan → Alan 50; total 33 + 50 = 83. */
export const LessThanTotal20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the unknown amount, then add both.', 'Cari jumlah yang belum diketahui, lalu jumlahkan keduanya.'),
    items: [
      { text: t('Joe has 33, and that is 17 LESS than Alan, so Alan has more: 33 + 17 = 50', 'Joe punya 33, dan itu 17 LEBIH SEDIKIT dari Alan, jadi Alan punya lebih: 33 + 17 = 50'), ok: null },
      { text: t('Don’t stop at 50 — that is only Alan’s total, not both', 'Jangan berhenti di 50 — itu hanya total Alan, bukan keduanya'), ok: false },
      { text: t('Total = Joe + Alan = 33 + 50 = 83', 'Total = Joe + Alan = 33 + 50 = 83'), ok: null },
      { text: t('Together they pick 83', 'Bersama mereka memetik 83'), ok: true },
    ],
    final: t('They pick 83 watermelons in total (D).', 'Mereka memetik 83 semangka seluruhnya (D).'),
    aria: t('Alan picks 50 and Joe 33, so together they pick 83.', 'Alan memetik 50 dan Joe 33, jadi bersama mereka memetik 83.'),
  }
})

/** Q13 — all-three = 87, apple+banana = 43 → strawberry 44; banana 12, apple 31; apple+strawberry = 75. */
export const FruitPairTotal20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract a known pair from the all-three total.', 'Kurangkan pasangan diketahui dari total ketiganya.'),
    items: [
      { text: t('All three: apple + banana + strawberry = 87', 'Ketiganya: apel + pisang + stroberi = 87'), ok: null },
      { text: t('Apple + banana = 43, so strawberry = 87 − 43 = 44', 'Apel + pisang = 43, jadi stroberi = 87 − 43 = 44'), ok: null },
      { text: t('Banana + strawberry = 56 gives banana = 56 − 44 = 12, so apple = 43 − 12 = 31', 'Pisang + stroberi = 56 memberi pisang = 56 − 44 = 12, jadi apel = 43 − 12 = 31'), ok: null },
      { text: t('apple + strawberry = 31 + 44 = 75 (not 76 — that is a slip)', 'apel + stroberi = 31 + 44 = 75 (bukan 76 — itu salah hitung)'), ok: true },
    ],
    final: t('apple + strawberry = 75 (B).', 'apel + stroberi = 75 (B).'),
    aria: t('Apple is 31 and strawberry is 44, so their sum is 75.', 'Apel 31 dan stroberi 44, jadi jumlahnya 75.'),
  }
})

/** Q14 — tally ages; age 5 tallest with 4, total 14; dot plot B matches. */
export const DotPlotTally20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Tally each value, then match the dot heights.', 'Hitung tiap nilai, lalu cocokkan tinggi titiknya.'),
    items: [
      { text: t('Tally each age: 3 → 2, 5 → 4, 6 → 3, 7 → 3, 8 → 2', 'Hitung tiap umur: 3 → 2, 5 → 4, 6 → 3, 7 → 3, 8 → 2'), ok: null },
      { text: t('Total dots: 2 + 4 + 3 + 3 + 2 = 14, matching 14 children', 'Total titik: 2 + 4 + 3 + 3 + 2 = 14, sesuai 14 anak'), ok: null },
      { text: t('Don’t pick a plot that makes age 6 or 7 tallest — age 5 has the most with 4 dots', 'Jangan pilih diagram yang membuat umur 6 atau 7 paling tinggi — umur 5 yang terbanyak dengan 4 titik'), ok: false },
      { text: t('Dot plot B shows exactly these counts', 'Dot plot B menunjukkan persis jumlah ini'), ok: true },
    ],
    final: t('Dot plot B is correct (B).', 'Dot plot B benar (B).'),
    aria: t('Age five has the most children at four, and only plot B matches every tally.', 'Umur lima punya anak terbanyak yaitu empat, dan hanya diagram B yang cocok dengan setiap hitungan.'),
  }
})

/** Q15 — total 45, share 15; Danny has 4, other = 15 − 4 = 11. */
export const EqualShareCards20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the equal share, then fill in Danny’s pair.', 'Cari bagian yang sama, lalu lengkapi pasangan Danny.'),
    items: [
      { text: t('Add all six cards: 4 + 6 + 12 + 9 + 3 + 11 = 45', 'Jumlahkan keenam kartu: 4 + 6 + 12 + 9 + 3 + 11 = 45'), ok: null },
      { text: t('Split into 3 equal shares: 45 ÷ 3 = 15 each', 'Bagi jadi 3 bagian sama: 45 ÷ 3 = 15 tiap orang'), ok: null },
      { text: t('Don’t pair 4 with 12: 4 + 12 = 16 is more than the share of 15', 'Jangan pasangkan 4 dengan 12: 4 + 12 = 16 lebih dari bagian 15'), ok: false },
      { text: t('Danny has 4, so his other card is 15 − 4 = 11', 'Danny punya 4, jadi kartu lainnya 15 − 4 = 11'), ok: true },
    ],
    final: t('Danny’s other number is 11 (D).', 'Angka lain Danny adalah 11 (D).'),
    aria: t('Each share is 15, so Danny’s second card after the 4 is 11.', 'Tiap bagian 15, jadi kartu kedua Danny setelah 4 adalah 11.'),
  }
})

/** Q16 — pair 21+29, 22+28, 23+27 = three 50s; +25 = 175. */
export const PairToFifties20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair from the ends to make easy round sums.', 'Pasangkan dari ujung untuk membuat jumlah bulat yang mudah.'),
    items: [
      { text: t('Pair the ends into 50s: 21 + 29 = 50, 22 + 28 = 50, 23 + 27 = 50', 'Pasangkan ujung-ujungnya jadi 50: 21 + 29 = 50, 22 + 28 = 50, 23 + 27 = 50'), ok: null },
      { text: t('Three 50s: 50 + 50 + 50 = 150', 'Tiga buah 50: 50 + 50 + 50 = 150'), ok: null },
      { text: t('Notice 24 and 26 are skipped, so this isn’t 9 numbers averaging 25 (that wrong path gives 225)', 'Perhatikan 24 dan 26 dilewati, jadi ini bukan 9 bilangan rata-rata 25 (jalan salah itu memberi 225)'), ok: false },
      { text: t('Add the leftover middle 25: 150 + 25 = 175', 'Tambahkan sisa tengah 25: 150 + 25 = 175'), ok: true },
    ],
    final: t('The sum is 175 (C).', 'Jumlahnya 175 (C).'),
    aria: t('Three pairs of fifty make 150, plus the lone middle 25 gives 175.', 'Tiga pasang lima puluh menjadi 150, ditambah 25 di tengah menghasilkan 175.'),
  }
})

/** Q17 — "repeat n times" rule: first blank 3, second blank 5. */
export const RepeatNTimes20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Spot the rule: each number n is repeated n times.', 'Temukan aturannya: setiap bilangan n diulang n kali.'),
    items: [
      { text: t('One 1, two 2s, three 3s, four 4s, five 5s', 'Satu 1, dua 2, tiga 3, empat 4, lima 5'), ok: null },
      { text: t('The run of 3s is 3, 3, ( ) — it still needs a third 3, so the first blank is 3', 'Deretan 3 adalah 3, 3, ( ) — masih butuh 3 yang ketiga, jadi kotak pertama 3'), ok: null },
      { text: t('Don’t jump to 4, 4 — that skips the third 3 the run still needs', 'Jangan loncat ke 4, 4 — itu melewati 3 ketiga yang masih dibutuhkan'), ok: false },
      { text: t('The run of 5s needs five 5s, so the second blank is 5 → 3 and 5', 'Deretan 5 butuh lima buah 5, jadi kotak kedua 5 → 3 dan 5'), ok: true },
    ],
    final: t('The blanks are 3 and 5 (D).', 'Isinya 3 dan 5 (D).'),
    aria: t('Completing the three 3s and the five 5s fills the blanks with 3 and 5.', 'Melengkapi tiga 3 dan lima 5 mengisi kotak dengan 3 dan 5.'),
  }
})

/** Q19 — distinct gaps among marks {0,1,3,10}: {1,2,3,7,9,10} → 6. */
export const DistinctGaps20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List every pair gap, then count the distinct values.', 'Daftar jarak tiap pasang, lalu hitung nilai berbeda.'),
    items: [
      { text: t('A length is the gap between two marks of 0, 1, 3, 10', 'Sebuah panjang adalah jarak antara dua tanda dari 0, 1, 3, 10'), ok: null },
      { text: t('The gaps: 1−0=1, 3−0=3, 10−0=10, 3−1=2, 10−1=9, 10−3=7', 'Jaraknya: 1−0=1, 3−0=3, 10−0=10, 3−1=2, 10−1=9, 10−3=7'), ok: null },
      { text: t('Don’t just count the 4 marks — the question asks for the gaps between pairs', 'Jangan sekadar menghitung 4 tanda — pertanyaannya minta jarak antar pasang'), ok: false },
      { text: t('Distinct values 1, 2, 3, 7, 9, 10 — all six are different', 'Nilai berbeda 1, 2, 3, 7, 9, 10 — keenamnya berbeda'), ok: true },
    ],
    final: t('6 different lengths can be measured (C).', '6 panjang berbeda dapat diukur (C).'),
    aria: t('Every pair of the four marks gives a distinct gap, so six lengths are possible.', 'Setiap pasang dari empat tanda memberi jarak berbeda, jadi enam panjang mungkin.'),
  }
})

/** Q20 — sum of odds (51) and evens (76); difference 76 − 51 = 25. */
export const OddEvenDifference20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group by odd/even, sum each, then subtract.', 'Kelompokkan ganjil/genap, jumlahkan, lalu kurangkan.'),
    items: [
      { text: t('Odd numbers are 23, 11, 17; even numbers are 34, 42', 'Bilangan ganjil 23, 11, 17; bilangan genap 34, 42'), ok: null },
      { text: t('Sum of odds: 23 + 11 + 17 = 51', 'Jumlah ganjil: 23 + 11 + 17 = 51'), ok: null },
      { text: t('Sum of evens: 34 + 42 = 76', 'Jumlah genap: 34 + 42 = 76'), ok: null },
      { text: t('Difference: 76 − 51 = 25', 'Selisih: 76 − 51 = 25'), ok: true },
    ],
    final: t('The difference is 25 (A).', 'Selisihnya 25 (A).'),
    aria: t('The evens sum to 76 and the odds to 51, a difference of 25.', 'Genap berjumlah 76 dan ganjil 51, selisih 25.'),
  }
})

/** Q21 — (square−6)(triangle−6)=100, both 2-digit so factors ≥4; pairs 25×4 and 20×5 → 2 squares. */
export const TwoDigitFactorPairs20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Factor 100, then keep only 2-digit results.', 'Faktorkan 100, lalu simpan hanya hasil dua angka.'),
    items: [
      { text: t('Let a = square − 6 and b = triangle − 6, so a × b = 100 with a > b', 'Misalkan a = persegi − 6 dan b = segitiga − 6, sehingga a × b = 100 dengan a > b'), ok: null },
      { text: t('Both numbers are 2-digit (at least 10), so a and b must be at least 4', 'Kedua bilangan dua angka (minimal 10), jadi a dan b minimal 4'), ok: null },
      { text: t('Don’t count pairs like 50×2 or 100×1 — they make triangle one-digit', 'Jangan hitung pasangan seperti 50×2 atau 100×1 — itu membuat segitiga satu angka'), ok: false },
      { text: t('Only 25×4 (square=31) and 20×5 (square=26) survive → 2 values', 'Hanya 25×4 (persegi=31) dan 20×5 (persegi=26) bertahan → 2 nilai'), ok: true },
    ],
    final: t('There are 2 possible values for the square (A).', 'Ada 2 nilai yang mungkin untuk persegi (A).'),
    aria: t('Only the factor pairs 25 times 4 and 20 times 5 keep both numbers two-digit, giving 2 squares.', 'Hanya pasangan faktor 25 kali 4 dan 20 kali 5 yang menjaga keduanya dua angka, memberi 2 nilai persegi.'),
  }
})

/** Q22 — count coin combos for 100 by number of 50s: 1 + 3 + 6 = 10. */
export const CoinCombinations20P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Organize by how many big 50-coins, then count the rest.', 'Atur berdasarkan banyak koin 50, lalu hitung sisanya.'),
    items: [
      { text: t('With two 50s: just 50 + 50, that is 1 way', 'Dengan dua koin 50: cukup 50 + 50, itu 1 cara'), ok: null },
      { text: t('With one 50: fill 50 from 10s and 20s → (5,0), (3,1), (1,2) = 3 ways', 'Dengan satu koin 50: lengkapi 50 dari koin 10 dan 20 → (5,0), (3,1), (1,2) = 3 cara'), ok: null },
      { text: t('With no 50: fill 100 from 10s and 20s, b = 0..5 = 6 ways', 'Tanpa koin 50: lengkapi 100 dari koin 10 dan 20, b = 0..5 = 6 cara'), ok: null },
      { text: t('Total = 1 + 3 + 6 = 10 ways (don’t miss the 50+50 way, which would drop it to 9)', 'Total = 1 + 3 + 6 = 10 cara (jangan lewatkan cara 50+50, yang membuatnya jadi 9)'), ok: true },
    ],
    final: t('There are 10 ways to make 100 dollars (C).', 'Ada 10 cara untuk membentuk 100 dolar (C).'),
    aria: t('Counting by the number of fifty-coins gives one plus three plus six, which is ten ways.', 'Menghitung berdasarkan banyak koin lima puluh memberi satu tambah tiga tambah enam, yaitu sepuluh cara.'),
  }
})
