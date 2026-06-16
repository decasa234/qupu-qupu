import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24P2A (2024 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 20 + 2 - 4 left to right. */
export const LeftToRight24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one step at a time.', 'Kerjakan dari kiri ke kanan, satu langkah sekali.'),
    items: [
      { text: '20 + 2 = 22', ok: null },
      { text: '22 - 4 = 18', ok: null },
      { text: t('Don’t add the 4: 20 + 2 + 4 = 24 — the 4 is taken away, not added', 'Jangan menambah 4: 20 + 2 + 4 = 24 — angka 4 dikurangi, bukan ditambah'), ok: false },
      { text: '20 + 2 - 4 = 18', ok: true },
    ],
    final: t('20 + 2 - 4 = 18 (C).', '20 + 2 - 4 = 18 (C).'),
    aria: t('Adding 2 to 20 then subtracting 4 gives 18.', 'Menambah 2 ke 20 lalu mengurangi 4 menghasilkan 18.'),
  }
})

/** Q2 — which calculation gives a result whose digit sum is 10? */
export const DigitSumTen24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute each result, then add its two digits and look for 10.', 'Hitung tiap hasil, lalu jumlahkan dua angkanya dan cari yang 10.'),
    items: [
      { text: '5 × 9 = 45 → 4 + 5 = 9', ok: false },
      { text: '47 + 5 = 52 → 5 + 2 = 7', ok: false },
      { text: t('32 - 3 = 29 → 2 + 9 = 11, close to 10 but not 10', '32 - 3 = 29 → 2 + 9 = 11, dekat 10 tapi bukan 10'), ok: false },
      { text: '8 × 8 = 64 → 6 + 4 = 10', ok: true },
    ],
    final: t('Only 8 × 8 = 64 has digit sum 10 (D).', 'Hanya 8 × 8 = 64 yang jumlah angkanya 10 (D).'),
    aria: t('Of the four results, only 64 has a digit sum of 10.', 'Dari empat hasil, hanya 64 yang jumlah angkanya 10.'),
  }
})

/** Q3 — which number is larger than 15 by 24? */
export const LargerBy24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('"Larger than 15 by 24" means start at 15 and add 24.', '"Lebih besar 24 dari 15" berarti mulai dari 15 lalu tambah 24.'),
    items: [
      { text: t('"Larger by" means add, not find the gap', '"Lebih besar" berarti tambah, bukan cari selisih'), ok: null },
      { text: t('Don’t subtract: 24 - 15 = 9 is the gap, not the number', 'Jangan mengurangi: 24 - 15 = 9 itu selisih, bukan bilangannya'), ok: false },
      { text: '15 + 24 = 39', ok: true },
    ],
    final: t('The number is 39 (D).', 'Bilangannya 39 (D).'),
    aria: t('Adding 24 to 15 gives 39.', 'Menambah 24 ke 15 menghasilkan 39.'),
  }
})

/** Q5 — which "a > b > c" chain is fully true? */
export const TrueChain24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both ">" signs in the chosen line must be true.', 'Kedua tanda ">" pada baris terpilih harus benar.'),
    items: [
      { text: t('61 > 46 > 64: 46 > 64 is false', '61 > 46 > 64: 46 > 64 salah'), ok: false },
      { text: t('41 > 46 > 14: 41 > 46 is false', '41 > 46 > 14: 41 > 46 salah'), ok: false },
      { text: t('16 > 14 > 61: 14 > 61 is false', '16 > 14 > 61: 14 > 61 salah'), ok: false },
      { text: t('46 > 41 > 16: 46 > 41 true and 41 > 16 true', '46 > 41 > 16: 46 > 41 benar dan 41 > 16 benar'), ok: true },
    ],
    final: t('Only 46 > 41 > 16 is fully correct (D).', 'Hanya 46 > 41 > 16 yang benar seluruhnya (D).'),
    aria: t('Testing each line, only 46 > 41 > 16 has both comparisons true.', 'Menguji tiap baris, hanya 46 > 41 > 16 yang kedua perbandingannya benar.'),
  }
})

/** Q6 — grid: which digit is left-of-and-below 2? */
export const GridLeftBelow24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Step down from 2 first, then step one cell to the left.', 'Turun dulu dari 2, lalu geser satu sel ke kiri.'),
    items: [
      { text: t('The 2 sits in the middle of Row 2', 'Angka 2 ada di tengah Baris 2'), ok: null },
      { text: t('Below 2 is Row 3 middle, which holds 7', 'Di bawah 2 adalah Baris 3 tengah, yaitu 7'), ok: null },
      { text: t('Don’t take 0: it is left of 2 in the SAME row, but we must go below first', 'Jangan ambil 0: itu di kiri 2 pada baris SAMA, padahal harus turun dulu'), ok: false },
      { text: t('Left of that 7 is 4', 'Di kiri 7 itu adalah 4'), ok: true },
    ],
    final: t('The digit left-of-and-below 2 is 4 (B).', 'Angka kiri-dan-bawah dari 2 adalah 4 (B).'),
    aria: t('Going below 2 to 7, then left, lands on 4.', 'Turun dari 2 ke 7, lalu ke kiri, jatuh pada 4.'),
  }
})

/** Q7 — which set of blocks is most likely to fall? */
export const BlocksFall24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A tower stays up when its weight is balanced over its base.', 'Menara berdiri kalau beratnya seimbang di atas alasnya.'),
    items: [
      { text: t('Look for the stack whose top hangs furthest past the base', 'Cari tumpukan yang puncaknya paling jauh menjorok dari alas'), ok: null },
      { text: t('A neatly stacked tower (D) looks tall but is balanced, so it stays up', 'Menara yang tersusun rapi (D) tampak tinggi tapi seimbang, jadi tetap berdiri'), ok: false },
      { text: t('Option A is the most lopsided, its top sticks out past the bottom', 'Pilihan A paling timpang, puncaknya keluar melewati bagian bawah'), ok: true },
    ],
    final: t('The lopsided stack A is most likely to fall (A).', 'Tumpukan timpang A paling mungkin jatuh (A).'),
    aria: t('The most lopsided stack, A, is the one most likely to fall.', 'Tumpukan paling timpang, A, yang paling mungkin jatuh.'),
  }
})

/** Q8 — coffee + cookies = 20; only cookies leaves 5; how much more are cookies? */
export const CookiesCoffee24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each price, then take the difference.', 'Cari tiap harga, lalu ambil selisihnya.'),
    items: [
      { text: t('Buying only cookies leaves 5 from 20, so cookies = 20 - 5 = 15', 'Beli kue saja menyisakan 5 dari 20, jadi kue = 20 - 5 = 15'), ok: null },
      { text: t('Coffee + cookies = 20, so coffee = 20 - 15 = 5', 'Kopi + kue = 20, jadi kopi = 20 - 15 = 5'), ok: null },
      { text: t('Don’t stop at 15 — that is the cookies’ price, not how much MORE', 'Jangan berhenti di 15 — itu harga kue, bukan selisih lebih mahalnya'), ok: false },
      { text: t('Cookies cost 15 - 5 = 10 more than coffee', 'Kue lebih mahal 15 - 5 = 10 dari kopi'), ok: true },
    ],
    final: t('Cookies are 10 dollars more than coffee (D).', 'Kue 10 dolar lebih mahal dari kopi (D).'),
    aria: t('Cookies cost 15 and coffee 5, so cookies are 10 more.', 'Kue seharga 15 dan kopi 5, jadi kue lebih mahal 10.'),
  }
})

/** Q10 — clock shows 9 o'clock; what time 2 hours later? */
export const ClockTwoHours24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Read the hour first, then count 2 hours forward.', 'Baca jamnya dulu, lalu hitung maju 2 jam.'),
    items: [
      { text: t('Long hand on 12, short hand on 9 means 9 o’clock', 'Jarum panjang di 12, jarum pendek di 9 berarti pukul 9'), ok: null },
      { text: t('Don’t answer 2 — that is just the hours added, not the new time', 'Jangan jawab 2 — itu hanya jam yang ditambahkan, bukan waktu baru'), ok: false },
      { text: '9 + 2 = 11', ok: true },
    ],
    final: t('2 hours later it is 11 o’clock (B).', '2 jam kemudian pukul 11 (B).'),
    aria: t('Starting at 9 o’clock and adding 2 hours gives 11 o’clock.', 'Mulai pukul 9 dan menambah 2 jam menjadi pukul 11.'),
  }
})

/** Q11 — Otani hits 3 and 9; Acuna hits one digit twice with equal total. */
export const BaseballEqualSum24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find Otani’s total first, then split it equally for Acuna.', 'Cari total Otani dulu, lalu bagi rata untuk Acuna.'),
    items: [
      { text: t('Below 1 is 3 and right of 8 is 9, so Otani’s total is 3 + 9 = 12', 'Di bawah 1 adalah 3 dan di kanan 8 adalah 9, jadi total Otani 3 + 9 = 12'), ok: null },
      { text: t('Acuna hit the same digit twice, so that digit doubled must be 12', 'Acuna mengenai angka sama dua kali, jadi angka itu dikali dua harus 12'), ok: null },
      { text: t('Don’t pick 3 — that is Otani’s hit, and 3 + 3 = 6, far from 12', 'Jangan pilih 3 — itu kenaan Otani, dan 3 + 3 = 6, jauh dari 12'), ok: false },
      { text: t('12 ÷ 2 = 6, so Acuna hit 6', '12 ÷ 2 = 6, jadi Acuna mengenai 6'), ok: true },
    ],
    final: t('Acuna hit the 6 (C).', 'Acuna mengenai angka 6 (C).'),
    aria: t('Otani’s total is 12, so Acuna’s repeated digit is 6.', 'Total Otani 12, jadi angka berulang Acuna adalah 6.'),
  }
})

/** Q12 — fill +/- in 33 □ 8 □ 4 □ 21 = 0. */
export const SignsToZero24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('See whether the numbers after 33 add up to 33 itself.', 'Lihat apakah bilangan setelah 33 berjumlah sama dengan 33.'),
    items: [
      { text: '8 + 4 + 21 = 33', ok: null },
      { text: t('They match 33 exactly, so subtracting all three lands on 0', 'Pas sama dengan 33, jadi mengurangi ketiganya jatuh ke 0'), ok: null },
      { text: t('Don’t use +, -, +: 33 + 8 - 4 + 21 = 58, not 0', 'Jangan pakai +, -, +: 33 + 8 - 4 + 21 = 58, bukan 0'), ok: false },
      { text: '33 - 8 - 4 - 21 = 0', ok: true },
    ],
    final: t('The signs are -, -, - (D).', 'Tandanya -, -, - (D).'),
    aria: t('Since 8 + 4 + 21 equals 33, subtracting all three from 33 gives 0.', 'Karena 8 + 4 + 21 sama dengan 33, mengurangi ketiganya dari 33 memberi 0.'),
  }
})

/** Q13 — three different odd numbers sum to 17; which difference is impossible? */
export const OddDifference24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build sets of three different odds adding to 17 and list which gaps appear.', 'Bangun himpunan tiga ganjil berbeda berjumlah 17 dan daftar selisih yang muncul.'),
    items: [
      { text: t('1 + 3 + 13 = 17 → gap 13 - 1 = 12; even 12 IS possible', '1 + 3 + 13 = 17 → selisih 13 - 1 = 12; jadi 12 BISA'), ok: false },
      { text: t('1 + 5 + 11 gives gap 10; 1 + 7 + 9 gives gap 8; 3 + 5 + 9 gives gap 6', '1 + 5 + 11 selisih 10; 1 + 7 + 9 selisih 8; 3 + 5 + 9 selisih 6'), ok: false },
      { text: t('A gap of 4 needs them close, like 5 + 5 + 7 — but that repeats 5, not allowed', 'Selisih 4 butuh berdekatan, seperti 5 + 5 + 7 — tapi itu mengulang 5, tidak boleh'), ok: true },
    ],
    final: t('Only 4 can never be the difference (A).', 'Hanya 4 yang tidak mungkin jadi selisihnya (A).'),
    aria: t('Gaps 6, 8, 10, 12 are all reachable, but 4 is impossible.', 'Selisih 6, 8, 10, 12 semua bisa, tapi 4 mustahil.'),
  }
})

/** Q16 — compute 65 - 54 + 45 - 34 by pairing. */
export const PairSubtraction24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group into easy pairs first.', 'Kelompokkan jadi pasangan mudah dulu.'),
    items: [
      { text: '65 - 54 = 11', ok: null },
      { text: '45 - 34 = 11', ok: null },
      { text: t('Don’t round to 20 — each pair is 11, so the total is 22', 'Jangan bulatkan ke 20 — tiap pasangan 11, jadi totalnya 22'), ok: false },
      { text: '11 + 11 = 22', ok: true },
    ],
    final: t('65 - 54 + 45 - 34 = 22 (D).', '65 - 54 + 45 - 34 = 22 (D).'),
    aria: t('Each pair makes 11, so the sum is 22.', 'Tiap pasangan bernilai 11, jadi jumlahnya 22.'),
  }
})

/** Q21 — fewest adjacent swaps to sort 2 1 5 4 3 6 0 7 8 9. */
export const MinSwaps24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Fewest adjacent swaps equals the number of out-of-order pairs (inversions).', 'Tukar bersebelahan tersedikit sama dengan banyaknya pasangan terbalik (inversi).'),
    items: [
      { text: t('Count bigger-before-smaller pairs: 2 before 1 and 0 (2); 1 before 0 (1)', 'Hitung pasangan besar-sebelum-kecil: 2 sebelum 1 dan 0 (2); 1 sebelum 0 (1)'), ok: null },
      { text: t('5 before 4, 3, 0 (3); 4 before 3, 0 (2); 3 before 0 (1); 6 before 0 (1)', '5 sebelum 4, 3, 0 (3); 4 sebelum 3, 0 (2); 3 sebelum 0 (1); 6 sebelum 0 (1)'), ok: null },
      { text: t('Don’t stop at 8 — that forgets how far 0 must travel left', 'Jangan berhenti di 8 — itu lupa seberapa jauh 0 harus ke kiri'), ok: false },
      { text: '2 + 1 + 3 + 2 + 1 + 1 = 10', ok: true },
    ],
    final: t('At least 10 swaps are needed (B).', 'Diperlukan paling sedikit 10 tukar (B).'),
    aria: t('There are 10 inversions, so 10 adjacent swaps are needed.', 'Ada 10 inversi, jadi diperlukan 10 tukar bersebelahan.'),
  }
})

/** Q24 — student 35's group after pulling girls (units digit 0) into A. */
export const GroupCycle24P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Remove the girls first, then cycle the boys through A, B, C, D, E.', 'Singkirkan perempuan dulu, lalu putar laki-laki melalui A, B, C, D, E.'),
    items: [
      { text: t('35 ends in 5, not 0, so 35 is a boy and joins the cycle', '35 berakhiran 5, bukan 0, jadi 35 laki-laki dan ikut putaran'), ok: null },
      { text: t('Girls 10, 20, 30 skip the cycle, so 35 is the 35 - 3 = 32nd boy', 'Perempuan 10, 20, 30 melewati putaran, jadi 35 adalah laki-laki ke-35 - 3 = 32'), ok: null },
      { text: t('Don’t cycle all 35 (35 = 7×5 → A) — the 3 girls aren’t in the boys’ cycle', 'Jangan putar semua 35 (35 = 7×5 → A) — 3 perempuan tidak ikut putaran laki-laki'), ok: false },
      { text: t('32 = 6 cycles of 5 (30 boys) plus 2, so the 32nd boy lands on the 2nd letter, B', '32 = 6 putaran dari 5 (30 laki-laki) ditambah 2, jadi laki-laki ke-32 di huruf ke-2, B'), ok: true },
    ],
    final: t('Student 35 is in group B (B).', 'Siswa 35 ada di kelompok B (B).'),
    aria: t('As the 32nd boy, student 35 lands on the 2nd cycle letter, B.', 'Sebagai laki-laki ke-32, siswa 35 jatuh pada huruf putaran ke-2, B.'),
  }
})
