import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-25P1A (2025 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination, ✓ marks the keyed answer.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — which expression does NOT equal 8? Compute each and compare to 8. */
export const NotEightExpression25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute each choice and find the one that is not 8.', 'Hitung tiap pilihan dan cari yang hasilnya bukan 8.'),
    items: [
      { text: t('4 + 4 = 8, 1 + 7 = 8, 5 + 3 = 8 — all make 8', '4 + 4 = 8, 1 + 7 = 8, 5 + 3 = 8 — semua jadi 8'), ok: null },
      { text: t('16 − 8 = 8 too — looks big but it still equals 8', '16 − 8 = 8 juga — terlihat besar tapi tetap 8'), ok: false },
      { text: t('12 − 7 = 5, not 8', '12 − 7 = 5, bukan 8'), ok: true },
    ],
    final: t('The one that is NOT 8 is 12 − 7 (E).', 'Yang hasilnya BUKAN 8 adalah 12 − 7 (E).'),
    aria: t('Checking each choice, only 12 minus 7 is not 8.', 'Memeriksa tiap pilihan, hanya 12 dikurangi 7 yang bukan 8.'),
  }
})

/** Q5 — sum of the two digits adjacent to 5 in 6 0 3 2 5 7 8. */
export const NeighboursOfFive25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the 5, then add the digit on each side of it.', 'Temukan angka 5, lalu jumlahkan angka di tiap sisinya.'),
    items: [
      { text: t('In 6 0 3 2 5 7 8, the 5 sits between 2 (left) and 7 (right)', 'Dalam 6 0 3 2 5 7 8, angka 5 berada di antara 2 (kiri) dan 7 (kanan)'), ok: null },
      { text: t('Don’t use only 7 — that ignores the left neighbour 2', 'Jangan pakai hanya 7 — itu mengabaikan tetangga kiri 2'), ok: false },
      { text: t('Add both neighbours: 2 + 7 = 9', 'Jumlahkan kedua tetangga: 2 + 7 = 9'), ok: true },
    ],
    final: t('The sum of the two neighbours is 9 (B).', 'Jumlah kedua tetangga adalah 9 (B).'),
    aria: t('Adding the neighbours 2 and 7 of the digit 5 gives 9.', 'Menjumlahkan tetangga 2 dan 7 dari angka 5 menghasilkan 9.'),
  }
})

/** Q7 — Macus 8th from front of 12; 3 more join the back; place from the back? */
export const QueuePosition25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The new people join behind Macus, so his place from the front stays the same.', 'Orang baru ikut di belakang Macus, jadi urutannya dari depan tetap.'),
    items: [
      { text: t('3 join the back: 12 + 3 = 15 people, and Macus is still 8th from the front', '3 ikut di belakang: 12 + 3 = 15 orang, dan Macus tetap urutan ke-8 dari depan'), ok: null },
      { text: t('People behind him: 15 − 8 = 7', 'Orang di belakangnya: 15 − 8 = 7'), ok: null },
      { text: t('Don’t stop at 7 — that forgets to count Macus himself', 'Jangan berhenti di 7 — itu lupa menghitung Macus sendiri'), ok: false },
      { text: t('From the back, add Macus: 7 + 1 = 8', 'Dari belakang, tambah Macus: 7 + 1 = 8'), ok: true },
    ],
    final: t('Counting from the back, Macus is 8th (C).', 'Dihitung dari belakang, Macus urutan ke-8 (C).'),
    aria: t('With seven people behind him plus himself, Macus is eighth from the back.', 'Dengan tujuh orang di belakangnya plus dirinya, Macus urutan ke-delapan dari belakang.'),
  }
})

/** Q8 — sort 9,13,6,20,16,10,8 largest→smallest; the middle card. */
export const MiddleCard25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Sort the 7 cards largest to smallest, then take the middle one.', 'Urutkan 7 kartu dari terbesar ke terkecil, lalu ambil yang di tengah.'),
    items: [
      { text: t('In order: 20, 16, 13, 10, 9, 8, 6', 'Berurutan: 20, 16, 13, 10, 9, 8, 6'), ok: null },
      { text: t('7 cards, so the middle is the 4th — 3 on each side', '7 kartu, jadi tengahnya kartu ke-4 — 3 di tiap sisi'), ok: null },
      { text: t('Don’t pick 13 without sorting — once sorted the 4th card is 10', 'Jangan pilih 13 tanpa mengurutkan — setelah diurutkan kartu ke-4 adalah 10'), ok: false },
      { text: t('Count to the 4th: 20, 16, 13, 10', 'Hitung sampai ke-4: 20, 16, 13, 10'), ok: true },
    ],
    final: t('The middle card is 10 (E).', 'Kartu tengahnya adalah 10 (E).'),
    aria: t('After sorting, the fourth of seven cards is 10.', 'Setelah diurutkan, kartu ke-empat dari tujuh adalah 10.'),
  }
})

/** Q9 — small = large − 20, large = 50; find large + small. */
export const SumOfTwoNumbers25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the small number first, then add both together.', 'Cari bilangan kecil dulu, lalu jumlahkan keduanya.'),
    items: [
      { text: t('The large number is 50', 'Bilangan besar adalah 50'), ok: null },
      { text: t('The small number is 20 less: 50 − 20 = 30', 'Bilangan kecil 20 lebih kecil: 50 − 20 = 30'), ok: null },
      { text: t('Don’t add 20 itself: 50 + 20 = 70 uses the gap, not the small number', 'Jangan menambah 20 itu sendiri: 50 + 20 = 70 memakai selisihnya, bukan bilangan kecil'), ok: false },
      { text: t('Add both numbers: 50 + 30 = 80', 'Jumlahkan kedua bilangan: 50 + 30 = 80'), ok: true },
    ],
    final: t('The sum is 80 (C).', 'Jumlahnya adalah 80 (C).'),
    aria: t('The small number is 30, so 50 plus 30 is 80.', 'Bilangan kecil adalah 30, jadi 50 ditambah 30 adalah 80.'),
  }
})

/** Q10 — 2 boys×2 + 3 girls×3 candies; pick the bag with exactly the total. */
export const CandyBag25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the candies each group needs, then add to find the total.', 'Hitung permen yang dibutuhkan tiap kelompok, lalu jumlahkan untuk total.'),
    items: [
      { text: t('Boys: 2 boys × 2 candies = 4', 'Anak laki-laki: 2 anak × 2 permen = 4'), ok: null },
      { text: t('Girls: 3 girls × 3 candies = 9', 'Anak perempuan: 3 anak × 3 permen = 9'), ok: null },
      { text: t('Don’t just count children: 2 + 3 = 5, or 5 + 5 = 10 — each child needs its own amount', 'Jangan hanya menghitung anak: 2 + 3 = 5, atau 5 + 5 = 10 — tiap anak butuh jatahnya sendiri'), ok: false },
      { text: t('Add both groups: 4 + 9 = 13 candies needed', 'Jumlahkan kedua kelompok: 4 + 9 = 13 permen yang dibutuhkan'), ok: true },
    ],
    final: t('Pick the bag with exactly 13 candies (B).', 'Pilih kantong yang berisi tepat 13 permen (B).'),
    aria: t('Four candies for the boys plus nine for the girls is thirteen.', 'Empat permen untuk anak laki-laki plus sembilan untuk anak perempuan adalah tiga belas.'),
  }
})

/** Q12 — Dad 40, Mom 37; when sum is 91, Dad's age. */
export const DadAge25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Their ages grow together, so split the total increase between the two.', 'Usia mereka bertambah bersama, jadi bagi total kenaikan ke dua orang.'),
    items: [
      { text: t('Now their ages add to 40 + 37 = 77', 'Sekarang usia mereka berjumlah 40 + 37 = 77'), ok: null },
      { text: t('The total must reach 91, so 91 − 77 = 14 more years in all', 'Totalnya harus jadi 91, jadi 91 − 77 = 14 tahun lagi seluruhnya'), ok: null },
      { text: t('Don’t add all 14 to Dad (40 + 14 = 54) — Mom ages too', 'Jangan tambahkan 14 semua ke Ayah (40 + 14 = 54) — Ibu juga bertambah usia'), ok: false },
      { text: t('Each gains 14 ÷ 2 = 7 years, so Dad is 40 + 7 = 47', 'Tiap orang naik 14 ÷ 2 = 7 tahun, jadi Ayah 40 + 7 = 47'), ok: true },
    ],
    final: t('Dad will be 47 (D).', 'Usia Ayah akan 47 (D).'),
    aria: t('Splitting the fourteen-year increase, Dad gains seven years to reach 47.', 'Membagi kenaikan empat belas tahun, Ayah bertambah tujuh tahun menjadi 47.'),
  }
})

/** Q14 — rows 5,13,6 made equal; chairs moved from row 2 to row 1. */
export const ChairsToRowOne25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the fair share per row first, then fill only what row 1 is missing.', 'Cari jatah adil tiap baris dulu, lalu tutup hanya kekurangan baris 1.'),
    items: [
      { text: t('All chairs: 5 + 13 + 6 = 24, shared over 3 rows: 24 ÷ 3 = 8 each', 'Semua kursi: 5 + 13 + 6 = 24, dibagi 3 baris: 24 ÷ 3 = 8 tiap baris'), ok: null },
      { text: t('Row 1 has 5 but needs 8, so it is short 8 − 5 = 3', 'Baris 1 punya 5 tapi butuh 8, jadi kurang 8 − 5 = 3'), ok: null },
      { text: t('Don’t move all of row 2’s extra (13 − 8 = 5) — row 1 only needs 3', 'Jangan pindahkan semua kelebihan baris 2 (13 − 8 = 5) — baris 1 hanya butuh 3'), ok: false },
      { text: t('Move 3 chairs from row 2 to row 1', 'Pindahkan 3 kursi dari baris 2 ke baris 1'), ok: true },
    ],
    final: t('3 chairs move from row 2 to row 1 (A).', '3 kursi dipindahkan dari baris 2 ke baris 1 (A).'),
    aria: t('Each row should hold eight, so row one needs three more chairs.', 'Tiap baris harus berisi delapan, jadi baris satu butuh tiga kursi lagi.'),
  }
})

/** Q17 — balance the seesaw: 3+4+7 on one side, which trio matches? */
export const BalanceSeesaw25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A balanced seesaw means both sides total the same.', 'Jungkat-jungkit seimbang berarti kedua sisi punya total sama.'),
    items: [
      { text: t('One side is 3 + 4 + 7 = 14, so the other trio must also make 14', 'Satu sisi 3 + 4 + 7 = 14, jadi tiga angka di sisi lain juga harus 14'), ok: null },
      { text: t('2 + 5 + 6 = 13 — one short of 14', '2 + 5 + 6 = 13 — kurang satu dari 14'), ok: false },
      { text: t('1 + 5 + 8 = 14 — that balances it', '1 + 5 + 8 = 14 — itu menyeimbangkannya'), ok: true },
    ],
    final: t('The balancing trio is 1, 5, 8 (E).', 'Tiga angka yang menyeimbangkan adalah 1, 5, 8 (E).'),
    aria: t('One side totals fourteen, and 1 plus 5 plus 8 also makes fourteen.', 'Satu sisi berjumlah empat belas, dan 1 tambah 5 tambah 8 juga empat belas.'),
  }
})

/** Q21 — pair 5..10 into three equal differences; what is star? */
export const EqualDifferences25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Split 5, 6, 7, 8, 9, 10 into three subtraction pairs that all give the same answer.', 'Bagi 5, 6, 7, 8, 9, 10 jadi tiga pasang pengurangan yang hasilnya sama.'),
    items: [
      { text: t('Difference 1 works: 6 − 5 = 8 − 7 = 10 − 9 = 1', 'Selisih 1 berhasil: 6 − 5 = 8 − 7 = 10 − 9 = 1'), ok: null },
      { text: t('Difference 3 works too: 8 − 5 = 9 − 6 = 10 − 7 = 3', 'Selisih 3 juga berhasil: 8 − 5 = 9 − 6 = 10 − 7 = 3'), ok: null },
      { text: t('Don’t stop at just 1 — 3 also works, so a single value is wrong', 'Jangan berhenti di 1 saja — 3 juga berhasil, jadi satu nilai saja salah'), ok: false },
      { text: t('Both 1 and 3 work, so star is 1 or 3', 'Baik 1 maupun 3 berhasil, jadi bintang adalah 1 atau 3'), ok: true },
    ],
    final: t('Star can be 1 or 3 (E).', 'Bintang bisa 1 atau 3 (E).'),
    aria: t('Both difference one and difference three pair the six numbers, so star is one or three.', 'Selisih satu dan selisih tiga sama-sama memasangkan keenam bilangan, jadi bintang adalah satu atau tiga.'),
  }
})

/** Q23 — even tens digit, odd ones digit, digit sum ≤ 6: how many 2-digit numbers? */
export const EvenTensOddOnes25P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List even-tens, odd-ones numbers whose digits add to 6 or less.', 'Daftar bilangan puluhan genap, satuan ganjil yang jumlah angkanya 6 atau kurang.'),
    items: [
      { text: t('Tens digit is even and not 0: 2, 4, or 6; ones digit is odd: 1, 3, or 5', 'Puluhan genap dan bukan 0: 2, 4, atau 6; satuan ganjil: 1, 3, atau 5'), ok: null },
      { text: t('21 (2+1=3), 23 (2+3=5), 41 (4+1=5) all keep the sum ≤ 6', '21 (2+1=3), 23 (2+3=5), 41 (4+1=5) semua berjumlah ≤ 6'), ok: null },
      { text: t('Don’t include 25 (2+5=7), 43 (4+3=7) or any 6_ — those exceed 6', 'Jangan masukkan 25 (2+5=7), 43 (4+3=7) atau 6_ apa pun — itu melebihi 6'), ok: false },
      { text: t('Only 21, 23, 41 work — that is 3 numbers', 'Hanya 21, 23, 41 yang berhasil — itu 3 bilangan'), ok: true },
    ],
    final: t('There are 3 such 2-digit numbers (C).', 'Ada 3 bilangan dua digit seperti itu (C).'),
    aria: t('Only 21, 23, and 41 fit, giving three numbers.', 'Hanya 21, 23, dan 41 yang cocok, menghasilkan tiga bilangan.'),
  }
})
