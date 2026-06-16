import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-22P2A (2022 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 35 + 56 − 19 left to right. */
export const AddSubtractChain22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right: add first, then subtract.', 'Kerjakan dari kiri ke kanan: jumlahkan dulu, lalu kurangi.'),
    items: [
      { text: t('Add the first two: 35 + 56 = 91', 'Jumlahkan dua yang pertama: 35 + 56 = 91'), ok: null },
      { text: t('Now take away 19: 91 − 19 = 72', 'Sekarang kurangi 19: 91 − 19 = 72'), ok: null },
      { text: t('Don’t add the 19: that gives 82, which overshoots', 'Jangan menambah 19: itu jadi 82, yang melebihi'), ok: false },
      { text: '35 + 56 − 19 = 72', ok: true },
    ],
    final: t('35 + 56 − 19 = 72 (B).', '35 + 56 − 19 = 72 (B).'),
    aria: t('Adding 35 and 56 then subtracting 19 gives 72.', 'Menjumlahkan 35 dan 56 lalu mengurangi 19 menghasilkan 72.'),
  }
})

/** Q2 — order three products triangle 7×8, circle 6×9, square 5×8 big to small. */
export const ProductOrder22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute each product, then rank them from big to small.', 'Hitung tiap hasil kali, lalu urutkan dari besar ke kecil.'),
    items: [
      { text: t('Triangle: 7 × 8 = 56', 'Segitiga: 7 × 8 = 56'), ok: null },
      { text: t('Circle: 6 × 9 = 54. Square: 5 × 8 = 40', 'Lingkaran: 6 × 9 = 54. Persegi: 5 × 8 = 40'), ok: null },
      { text: t('Don’t assume circle is biggest just because 9 is the biggest factor — 56 beats 54', 'Jangan kira lingkaran terbesar hanya karena 9 faktor terbesar — 56 mengalahkan 54'), ok: false },
      { text: t('56 > 54 > 40, so triangle > circle > square', '56 > 54 > 40, jadi segitiga > lingkaran > persegi'), ok: true },
    ],
    final: t('triangle > circle > square (C).', 'segitiga > lingkaran > persegi (C).'),
    aria: t('The products 56, 54 and 40 rank triangle, circle, square.', 'Hasil kali 56, 54, dan 40 mengurutkan segitiga, lingkaran, persegi.'),
  }
})

/** Q3 — 93 − ( ) = 46: missing subtrahend = whole − result. */
export const MissingSubtrahend22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The blank is how much we take from 93 to land on 46.', 'Kotak kosong adalah berapa yang dikurangkan dari 93 agar jadi 46.'),
    items: [
      { text: t('So the blank is 93 − 46', 'Jadi kotak kosong itu 93 − 46'), ok: null },
      { text: '93 − 46 = 47', ok: null },
      { text: t('A careless 93 − 46 gives 57 — line up the digits and borrow to get 47', 'Kalau ceroboh 93 − 46 jadi 57 — susun angkanya dan pinjam agar dapat 47'), ok: false },
      { text: t('The missing number is 47', 'Bilangan yang hilang adalah 47'), ok: true },
    ],
    final: t('The blank is 47 (A).', 'Kotak kosong itu 47 (A).'),
    aria: t('Subtracting 46 from 93 gives the missing 47.', 'Mengurangi 46 dari 93 memberi 47 yang hilang.'),
  }
})

/** Q4 — park at 11:00, return 7 hours later. */
export const ClockAddHours22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Start at 11:00 and count on 7 hours.', 'Mulai dari pukul 11:00 lalu hitung maju 7 jam.'),
    items: [
      { text: t('11 + 7 = 18', '11 + 7 = 18'), ok: null },
      { text: t('18:00 is the same as 6:00 in the evening', 'Pukul 18:00 sama dengan pukul 6:00 sore'), ok: null },
      { text: t('Don’t answer 11:00 — that is the start time, not 7 hours later', 'Jangan jawab 11:00 — itu waktu mulai, bukan 7 jam kemudian'), ok: false },
      { text: t('She goes back at 6:00', 'Ia kembali pukul 6:00'), ok: true },
    ],
    final: t('She returns at 6:00 (A).', 'Ia kembali pukul 6:00 (A).'),
    aria: t('Seven hours after eleven o’clock is six o’clock.', 'Tujuh jam setelah pukul sebelas adalah pukul enam.'),
  }
})

/** Q5 — order four sticks longest to shortest after converting to cm. */
export const StickOrder22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Convert every length to cm first, then sort longest to shortest.', 'Ubah semua panjang ke cm dulu, lalu urutkan terpanjang ke terpendek.'),
    items: [
      { text: t('B = 1 m 60 cm = 160 cm, D = 3 m = 300 cm', 'B = 1 m 60 cm = 160 cm, D = 3 m = 300 cm'), ok: null },
      { text: t('Now in cm: A 242, B 160, C 57, D 300', 'Sekarang dalam cm: A 242, B 160, C 57, D 300'), ok: null },
      { text: t('Don’t read B’s “1 m 60” as bigger than A’s 242 — in cm B is only 160 (that wrong order is DBAC)', 'Jangan baca “1 m 60” pada B lebih besar dari 242 pada A — dalam cm B hanya 160 (urutan keliru itu DBAC)'), ok: false },
      { text: t('300 > 242 > 160 > 57, so the order is D, A, B, C', '300 > 242 > 160 > 57, jadi urutannya D, A, B, C'), ok: true },
    ],
    final: t('Longest to shortest is DABC (C).', 'Terpanjang ke terpendek adalah DABC (C).'),
    aria: t('In centimetres the order is 300, 242, 160, 57 — DABC.', 'Dalam sentimeter urutannya 300, 242, 160, 57 — DABC.'),
  }
})

/** Q6 — arithmetic sequence 438, ( ), star, 474, 486; find star. */
export const SequenceStep22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the constant step from two known neighbours, then count back.', 'Cari beda tetap dari dua tetangga yang diketahui, lalu mundur.'),
    items: [
      { text: t('From 474 to 486 is +12, so the step is 12', 'Dari 474 ke 486 adalah +12, jadi bedanya 12'), ok: null },
      { text: t('Star sits one step before 474: 474 − 12', 'Bintang satu langkah sebelum 474: 474 − 12'), ok: null },
      { text: t('Don’t halve the step to get 456 — the difference is a full 12, not 6', 'Jangan setengahkan langkah jadi 456 — bedanya penuh 12, bukan 6'), ok: false },
      { text: t('474 − 12 = 462, so star = 462', '474 − 12 = 462, jadi bintang = 462'), ok: true },
    ],
    final: t('star = 462 (D).', 'bintang = 462 (D).'),
    aria: t('Stepping back 12 from 474 gives star equals 462.', 'Mundur 12 dari 474 memberi bintang sama dengan 462.'),
  }
})

/** Q8 — corn 23, radish 23−5, eggplant 23+11; longest minus shortest. */
export const VegetableDiff22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find all three lengths, then subtract the shortest from the longest.', 'Cari ketiga panjangnya, lalu kurangi yang terpendek dari yang terpanjang.'),
    items: [
      { text: t('Corn is 23 cm; radish is 5 cm shorter: 23 − 5 = 18 cm', 'Jagung 23 cm; lobak 5 cm lebih pendek: 23 − 5 = 18 cm'), ok: null },
      { text: t('Eggplant is 11 cm longer than corn: 23 + 11 = 34 cm', 'Terung 11 cm lebih panjang dari jagung: 23 + 11 = 34 cm'), ok: null },
      { text: t('Don’t answer 12 from a slip on corn vs radish — the real gap is eggplant 34 minus radish 18', 'Jangan jawab 12 dari keliru jagung vs lobak — selisih sebenarnya terung 34 dikurangi lobak 18'), ok: false },
      { text: t('Longest 34 − shortest 18 = 16 cm', 'Terpanjang 34 − terpendek 18 = 16 cm'), ok: true },
    ],
    final: t('The difference is 16 cm (B).', 'Selisihnya 16 cm (B).'),
    aria: t('Eggplant 34 minus radish 18 is a 16 cm difference.', 'Terung 34 dikurangi lobak 18 adalah selisih 16 cm.'),
  }
})

/** Q9 — which option of bills totals exactly $100. */
export const HundredBills22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add each option’s bills and look for exactly 100.', 'Jumlahkan uang tiap pilihan dan cari yang tepat 100.'),
    items: [
      { text: t('Option C: 50 + 20 + 20 + 20 = 110 overshoots 100', 'Pilihan C: 50 + 20 + 20 + 20 = 110 melebihi 100'), ok: false },
      { text: t('Option D: 50 + 20 = 70', 'Pilihan D: 50 + 20 = 70'), ok: null },
      { text: t('70 + 10 + 10 + 10 = 100', '70 + 10 + 10 + 10 = 100'), ok: null },
      { text: t('Option D makes exactly $100', 'Pilihan D tepat $100'), ok: true },
    ],
    final: t('Option D totals exactly $100 (D).', 'Pilihan D totalnya tepat $100 (D).'),
    aria: t('Fifty plus twenty plus three tens is one hundred dollars.', 'Lima puluh tambah dua puluh tambah tiga puluhan adalah seratus dolar.'),
  }
})

/** Q10 — 7 packs of 6 cards plus 5 starting cards. */
export const CardPacks22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply the packs out, then add the cards Ash started with.', 'Kalikan bungkusnya, lalu tambah kartu awal Ash.'),
    items: [
      { text: t('7 packs of 6 cards: 7 × 6 = 42 new cards', '7 bungkus berisi 6 kartu: 7 × 6 = 42 kartu baru'), ok: null },
      { text: t('Ash already had 5 cards', 'Ash sudah punya 5 kartu'), ok: null },
      { text: t('Don’t stop at 42 — that forgets the 5 he already had', 'Jangan berhenti di 42 — itu lupa 5 kartu yang sudah dimiliki'), ok: false },
      { text: '5 + 42 = 47', ok: true },
    ],
    final: t('Ash now has 47 cards (A).', 'Ash sekarang punya 47 kartu (A).'),
    aria: t('Forty-two new cards plus five gives forty-seven.', 'Empat puluh dua kartu baru tambah lima jadi empat puluh tujuh.'),
  }
})

/** Q12 — bottles bought with $50 at weekday vs weekend price; difference. */
export const JuiceBottles22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Divide $50 by each price, rounding down, then compare.', 'Bagi $50 dengan tiap harga, bulatkan ke bawah, lalu bandingkan.'),
    items: [
      { text: t('Weekday price 9: 50 ÷ 9 = 5 bottles (45 spent)', 'Harga hari kerja 9: 50 ÷ 9 = 5 botol (terpakai 45)'), ok: null },
      { text: t('Weekend price 9 − 3 = 6: 50 ÷ 6 = 8 bottles (48 spent)', 'Harga akhir pekan 9 − 3 = 6: 50 ÷ 6 = 8 botol (terpakai 48)'), ok: null },
      { text: t('Don’t round up to 9 weekend bottles — the leftover money won’t buy a whole extra one (that wrong gap is 4)', 'Jangan bulatkan ke atas jadi 9 botol — sisa uang tak cukup beli satu lagi (selisih keliru itu 4)'), ok: false },
      { text: '8 − 5 = 3', ok: true },
    ],
    final: t('3 more bottles on the weekend (C).', '3 botol lebih banyak pada akhir pekan (C).'),
    aria: t('Eight weekend bottles minus five weekday bottles is three more.', 'Delapan botol akhir pekan dikurangi lima botol hari kerja adalah tiga lebih banyak.'),
  }
})

/** Q13 — two largest even 2-digit numbers from cards, then difference. */
export const LargestEvenDiff22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build the largest even 2-digit number, then do it again with the leftovers.', 'Bangun bilangan genap dua angka terbesar, lalu ulangi dengan sisanya.'),
    items: [
      { text: t('Largest even from 7,2,5,3,0,8: 8 in front, 2 at the end = 82', 'Genap terbesar dari 7,2,5,3,0,8: 8 di depan, 2 di belakang = 82'), ok: null },
      { text: t('From the leftover 7,5,3,0 the largest even is 70', 'Dari sisa 7,5,3,0 genap terbesar adalah 70'), ok: null },
      { text: t('Don’t reuse cards — the second number can only use the four left over', 'Jangan pakai ulang kartu — bilangan kedua hanya memakai empat kartu sisa'), ok: false },
      { text: '82 − 70 = 12', ok: true },
    ],
    final: t('The difference is 12 (C).', 'Selisihnya 12 (C).'),
    aria: t('Eighty-two minus seventy is a difference of twelve.', 'Delapan puluh dua dikurangi tujuh puluh adalah selisih dua belas.'),
  }
})

/** Q14 — game show eliminations; find the Musical chairs round. */
export const GameShowEliminate22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count total eliminated, then subtract the rounds you know.', 'Hitung total tersingkir, lalu kurangi babak yang diketahui.'),
    items: [
      { text: t('84 started, 11 passed, so 84 − 11 = 73 were eliminated', '84 ikut, 11 lolos, jadi 84 − 11 = 73 tersingkir'), ok: null },
      { text: t('“Four times more” than 9 means 9 + 4 × 9 = 45 in Hopscotch — not just 36', '“Empat kali lebih banyak” dari 9 berarti 9 + 4 × 9 = 45 di Hopscotch — bukan 36 saja'), ok: false },
      { text: t('Red light green light removed 9', 'Red light green light menyingkirkan 9'), ok: null },
      { text: t('Musical chairs: 73 − 9 − 45 = 19', 'Musical chairs: 73 − 9 − 45 = 19'), ok: true },
    ],
    final: t('Musical chairs eliminated 19 (D).', 'Musical chairs menyingkirkan 19 (D).'),
    aria: t('From 73 total out, minus 9 and 45, the middle round is 19.', 'Dari 73 total keluar, dikurangi 9 dan 45, babak tengah adalah 19.'),
  }
})

/** Q15 — count straight lines of four matching marks in the 4×4 grid. */
export const GridLines22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Tag each number by its times-table, then scan for four matching marks in a line.', 'Beri tanda tiap angka menurut perkaliannya, lalu pindai empat tanda sama dalam satu garis.'),
    items: [
      { text: t('Top row 15,10,40,25 are all multiples of 5 — one line', 'Baris atas 15,10,40,25 semua kelipatan 5 — satu garis'), ok: null },
      { text: t('First column 15,27,6,12 are all multiples of 3 — one line', 'Kolom pertama 15,27,6,12 semua kelipatan 3 — satu garis'), ok: null },
      { text: t('Third column 40,64,24,16 are all multiples of 8 — one line', 'Kolom ketiga 40,64,24,16 semua kelipatan 8 — satu garis'), ok: null },
      { text: t('Don’t stop at 3 — the main diagonal 15,9,24,21 are all multiples of 3, making 4 lines', 'Jangan berhenti di 3 — diagonal utama 15,9,24,21 semua kelipatan 3, jadi 4 garis'), ok: true },
    ],
    final: t('4 straight lines can be drawn (C).', '4 garis lurus dapat ditarik (C).'),
    aria: t('Two lines of threes, one of fives and one of eights make four.', 'Dua garis kelipatan tiga, satu kelipatan lima, dan satu kelipatan delapan jadi empat.'),
  }
})

/** Q16 — 199 + 67 + 9 − 56 using round-and-adjust. */
export const RoundAdjustChain22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Round 199 to 200 to add easily, then adjust and subtract.', 'Bulatkan 199 ke 200 agar mudah menambah, lalu sesuaikan dan kurangi.'),
    items: [
      { text: t('Treat 199 as 200 − 1: 200 + 67 + 9 = 276', 'Anggap 199 sebagai 200 − 1: 200 + 67 + 9 = 276'), ok: null },
      { text: t('Take back the extra 1: 276 − 1 = 275', 'Kembalikan 1 tambahan: 276 − 1 = 275'), ok: null },
      { text: t('Don’t forget to adjust the rounding — skipping it leaves 229', 'Jangan lupa menyesuaikan pembulatan — kalau dilewat hasilnya 229'), ok: false },
      { text: '275 − 56 = 219', ok: true },
    ],
    final: t('199 + 67 + 9 − 56 = 219 (A).', '199 + 67 + 9 − 56 = 219 (A).'),
    aria: t('Two hundred seventy-five minus fifty-six gives two hundred nineteen.', 'Dua ratus tujuh puluh lima dikurangi lima puluh enam menghasilkan dua ratus sembilan belas.'),
  }
})

/** Q18 — Mondays in November sum to 58; what day is Nov 11? */
export const MondaySum22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write the four Mondays in terms of the first, solve, then place Nov 11.', 'Tulis empat Senin dari Senin pertama, selesaikan, lalu tentukan 11 November.'),
    items: [
      { text: t('Mondays are d, d+7, d+14, d+21, summing to 4d + 42 = 58', 'Hari Senin adalah d, d+7, d+14, d+21, berjumlah 4d + 42 = 58'), ok: null },
      { text: t('4d = 16, so d = 4 — the first Monday is November 4', '4d = 16, jadi d = 4 — Senin pertama adalah 4 November'), ok: null },
      { text: t('Nov 11 = 4 + 7 is exactly one week later, so it stays a Monday — don’t shift to Sunday', '11 November = 4 + 7 tepat satu minggu kemudian, jadi tetap Senin — jangan geser ke Minggu'), ok: false },
      { text: t('One week after a Monday is again Monday', 'Satu minggu setelah Senin adalah Senin lagi'), ok: true },
    ],
    final: t('November 11 is a Monday (B).', '11 November adalah hari Senin (B).'),
    aria: t('The first Monday is the 4th, so the 11th is a Monday too.', 'Senin pertama tanggal 4, jadi tanggal 11 juga Senin.'),
  }
})

/** Q24 — solve three shape equations, then circle × triangle + square. */
export const ShapeEquations22P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve each shape from its own equation, then substitute into the expression.', 'Cari tiap bangun dari persamaannya, lalu substitusi ke ekspresinya.'),
    items: [
      { text: t('square × square × square = 27, and 3 × 3 × 3 = 27, so square = 3', 'persegi × persegi × persegi = 27, dan 3 × 3 × 3 = 27, jadi persegi = 3'), ok: null },
      { text: t('circle + circle + circle = 21, so circle = 7; 2 triangles + 7 = 15, so triangle = 4', 'lingkaran + lingkaran + lingkaran = 21, jadi lingkaran = 7; 2 segitiga + 7 = 15, jadi segitiga = 4'), ok: null },
      { text: t('Multiply before adding — don’t group it as 7 × (4 + 3) = 49 or get 45', 'Kalikan sebelum menambah — jangan kelompokkan jadi 7 × (4 + 3) = 49 atau dapat 45'), ok: false },
      { text: t('circle × triangle + square = 7 × 4 + 3 = 28 + 3 = 31', 'lingkaran × segitiga + persegi = 7 × 4 + 3 = 28 + 3 = 31'), ok: true },
    ],
    final: t('circle × triangle + square = 31 (C).', 'lingkaran × segitiga + persegi = 31 (C).'),
    aria: t('Seven times four plus three is thirty-one.', 'Tujuh kali empat tambah tiga adalah tiga puluh satu.'),
  }
})
