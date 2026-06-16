import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19P2A (2019 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 63 − 25: take away the tens, then the ones. */
export const SubtractTwoSteps19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Take away 25 in two easy steps: tens first, then ones.', 'Kurangi 25 dalam dua langkah mudah: puluhan dulu, lalu satuan.'),
    items: [
      { text: t('First take away 20: 63 − 20 = 43', 'Kurangi 20 dulu: 63 − 20 = 43'), ok: null },
      { text: t('Then take away the other 5: 43 − 5 = 38', 'Lalu kurangi 5 sisanya: 43 − 5 = 38'), ok: null },
      { text: t('Don’t forget to borrow: 42 (from 63 − 21) skips the borrow the ones digit needs', 'Jangan lupa meminjam: 42 (dari 63 − 21) melewatkan pinjaman yang dibutuhkan satuan'), ok: false },
      { text: '63 − 25 = 38', ok: true },
    ],
    final: t('63 − 25 = 38 (B).', '63 − 25 = 38 (B).'),
    aria: t('Subtracting twenty then five, 63 minus 25 is 38.', 'Mengurangi dua puluh lalu lima, 63 dikurangi 25 adalah 38.'),
  }
})

/** Q2 — ( ) − 29 = 57: undo the subtraction by adding 29 back. */
export const UndoSubtraction19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Something minus 29 leaves 57 — undo it by adding 29 back.', 'Suatu bilangan dikurangi 29 menjadi 57 — batalkan dengan menambahkan 29 lagi.'),
    items: [
      { text: t('Add the tens: 57 + 20 = 77', 'Tambahkan puluhannya: 57 + 20 = 77'), ok: null },
      { text: t('Add the ones: 77 + 9 = 86', 'Tambahkan satuannya: 77 + 9 = 86'), ok: null },
      { text: t('Don’t subtract: 57 − 29 = 38, but the missing number is bigger than 57', 'Jangan mengurangi: 57 − 29 = 38, padahal bilangan yang dicari lebih besar dari 57'), ok: false },
      { text: t('Check: 86 − 29 = 57', 'Cek: 86 − 29 = 57'), ok: true },
    ],
    final: t('The box is 86 (D).', 'Kotaknya 86 (D).'),
    aria: t('Adding 29 back onto 57 gives 86.', 'Menambahkan 29 kembali ke 57 menghasilkan 86.'),
  }
})

/** Q4 — 3-digit number: hundreds 4, tens = 4 − 3, even. */
export const EvenDigitNumber19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pin down each digit, then check the rules.', 'Tentukan tiap angka, lalu periksa aturannya.'),
    items: [
      { text: t('Hundreds digit is 4, tens is 3 less: 4 − 3 = 1, so it starts 41_', 'Angka ratusan 4, puluhan 3 kurang: 4 − 3 = 1, jadi diawali 41_'), ok: null },
      { text: t('It must be even, so the last digit is 0, 2, 4, 6, or 8', 'Harus genap, jadi angka terakhir 0, 2, 4, 6, atau 8'), ok: null },
      { text: t('419 has the right 41_ but 9 is odd — not even', '419 punya awalan 41_ yang benar tapi 9 ganjil — bukan genap'), ok: false },
      { text: t('418 starts 41 and ends in an even 8', '418 diawali 41 dan berakhir genap 8'), ok: true },
    ],
    final: t('The number is 418 (C).', 'Bilangannya 418 (C).'),
    aria: t('Starting 41 and ending even, the number is 418.', 'Diawali 41 dan berakhir genap, bilangannya 418.'),
  }
})

/** Q8 — 3 × 9 by repeated addition. */
export const ThreeTimesNine19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('3 × 9 means three nines added: 9 + 9 + 9.', '3 × 9 berarti tiga buah sembilan dijumlahkan: 9 + 9 + 9.'),
    items: [
      { text: '9 + 9 = 18', ok: null },
      { text: '18 + 9 = 27', ok: null },
      { text: t('21 is 3 × 7 — that is the wrong nine-times fact', '21 itu 3 × 7 — itu fakta perkalian yang salah'), ok: false },
      { text: '3 × 9 = 27', ok: true },
    ],
    final: t('3 × 9 = 27 (B).', '3 × 9 = 27 (B).'),
    aria: t('Adding three nines, 3 times 9 is 27.', 'Menjumlahkan tiga sembilan, 3 kali 9 adalah 27.'),
  }
})

/** Q9 — table lookup then multiply: (r1,c1)=7, (r2,c3)=6. */
export const LookupMultiply19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Look up each shaded cell’s value, then multiply them.', 'Cari nilai tiap sel arsiran, lalu kalikan keduanya.'),
    items: [
      { text: t('Row 1, column 1 holds the value 7', 'Baris 1 kolom 1 bernilai 7'), ok: null },
      { text: t('Row 2, column 3 holds the value 6', 'Baris 2 kolom 3 bernilai 6'), ok: null },
      { text: t('24 is the worked example (8 × 3), not these new cells', '24 adalah jawaban contoh (8 × 3), bukan untuk sel yang baru'), ok: false },
      { text: '7 × 6 = 42', ok: true },
    ],
    final: t('The product is 42 (A).', 'Hasil kalinya 42 (A).'),
    aria: t('Multiplying the looked-up 7 and 6 gives 42.', 'Mengalikan 7 dan 6 yang ditemukan menghasilkan 42.'),
  }
})

/** Q10 — three numbers sum 19; second = first − 1; first = 2 × third. */
export const ThreeNumbers19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build everything from the third number, then check the sum.', 'Susun semuanya dari bilangan ketiga, lalu periksa jumlahnya.'),
    items: [
      { text: t('Try third = 4: first = 2 × 4 = 8, second = 8 − 1 = 7', 'Coba ketiga = 4: pertama = 2 × 4 = 8, kedua = 8 − 1 = 7'), ok: null },
      { text: t('Check the sum: 8 + 7 + 4 = 19 ✓', 'Periksa jumlahnya: 8 + 7 + 4 = 19 ✓'), ok: null },
      { text: t('8 is the FIRST number — the question asks for the second', '8 adalah bilangan PERTAMA — soal meminta bilangan kedua'), ok: false },
      { text: t('The second number is 7', 'Bilangan kedua adalah 7'), ok: true },
    ],
    final: t('The second number is 7 (D).', 'Bilangan kedua adalah 7 (D).'),
    aria: t('Building from the third number, the second number is 7.', 'Membangun dari bilangan ketiga, bilangan kedua adalah 7.'),
  }
})

/** Q13 — quiz: 8 per right, −2 per wrong, 10 problems, score 50. */
export const QuizPenalty19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pretend Mary got all 10 right, then count the loss per mistake.', 'Bayangkan Mary benar semua 10, lalu hitung kerugian tiap kesalahan.'),
    items: [
      { text: t('All correct: 10 × 8 = 80, but she has 50, so 80 − 50 = 30 lost', 'Benar semua: 10 × 8 = 80, tapi dia punya 50, jadi 80 − 50 = 30 hilang'), ok: null },
      { text: t('Each wrong costs 8 not earned PLUS 2 taken away = 10', 'Tiap salah merugikan 8 yang tak didapat DITAMBAH 2 yang dikurangi = 10'), ok: null },
      { text: t('Counting only the −2 penalty makes each wrong seem cheaper → too many', 'Menghitung hanya potongan −2 membuat tiap salah tampak lebih murah → terlalu banyak'), ok: false },
      { text: '30 ÷ 10 = 3', ok: true },
    ],
    final: t('Mary wrote 3 wrong answers (B).', 'Mary menulis 3 jawaban salah (B).'),
    aria: t('Thirty points lost at ten per wrong is three wrong answers.', 'Tiga puluh poin hilang dengan sepuluh per salah adalah tiga jawaban salah.'),
  }
})

/** Q14 — house rule: triangle + box = circle × circle; find A. */
export const HouseRule19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the rule from a full house, then apply it.', 'Temukan aturan dari rumah lengkap, lalu terapkan.'),
    items: [
      { text: t('House 1: 2 × 9 = 18, and 8 + 10 = 18 — so triangle + box = circles multiplied', 'Rumah 1: 2 × 9 = 18, dan 8 + 10 = 18 — jadi segitiga + kotak = hasil kali lingkaran'), ok: null },
      { text: t('House 3: 7 × 4 = 28, box = 20, so A = 28 − 20', 'Rumah 3: 7 × 4 = 28, kotak = 20, jadi A = 28 − 20'), ok: null },
      { text: t('28 is just the circles multiplied — A is that minus the box 20', '28 hanya hasil kali lingkaran — A adalah itu dikurangi kotak 20'), ok: false },
      { text: '28 − 20 = 8', ok: true },
    ],
    final: t('A = 8 (D).', 'A = 8 (D).'),
    aria: t('The circles multiply to 28 minus the box 20 gives A equals 8.', 'Hasil kali lingkaran 28 dikurangi kotak 20 menghasilkan A sama dengan 8.'),
  }
})

/** Q15 — chain the "right of" clues, find the middle trophy. */
export const TrophyOrder19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each clue puts one trophy right of another — chain them into a row.', 'Tiap petunjuk menaruh satu piala di kanan yang lain — rangkai menjadi baris.'),
    items: [
      { text: t('A right of B, D right of A, C right of D, E right of C', 'A di kanan B, D di kanan A, C di kanan D, E di kanan C'), ok: null },
      { text: t('Left to right: B, A, D, C, E', 'Kiri ke kanan: B, A, D, C, E'), ok: null },
      { text: t('C is the 4th, not the 3rd — just right of the middle, not on it', 'C adalah ke-4, bukan ke-3 — tepat di kanan tengah, bukan di tengah'), ok: false },
      { text: t('The middle of five is the 3rd: D', 'Tengah dari lima adalah yang ke-3: D'), ok: true },
    ],
    final: t('D is in the middle (D).', 'D berada di tengah (D).'),
    aria: t('Chaining the clues to B A D C E, the middle trophy is D.', 'Merangkai petunjuk menjadi B A D C E, piala tengah adalah D.'),
  }
})

/** Q16 — 202 > [] > 186: which choice fits both bounds. */
export const BetweenBounds19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The box must be smaller than 202 AND bigger than 186.', 'Kotaknya harus lebih kecil dari 202 DAN lebih besar dari 186.'),
    items: [
      { text: t('212 is bigger than 202 — 202 > 212 is false', '212 lebih besar dari 202 — 202 > 212 salah'), ok: false },
      { text: t('185 and 168 are smaller than 186 — too small', '185 dan 168 lebih kecil dari 186 — terlalu kecil'), ok: false },
      { text: t('198 sits between 186 and 202', '198 berada di antara 186 dan 202'), ok: true },
    ],
    final: t('The box is 198 (B).', 'Kotaknya 198 (B).'),
    aria: t('Only 198 lands between 186 and 202.', 'Hanya 198 yang berada di antara 186 dan 202.'),
  }
})

/** Q17 — 24 = 3 × 8 = [] × 4: divide to undo the multiplication. */
export const MissingFactor19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Every part equals 24, so [] × 4 must equal 24 too.', 'Setiap bagian bernilai 24, jadi [] × 4 juga harus 24.'),
    items: [
      { text: t('4 times what makes 24? That is 24 ÷ 4', '4 dikali berapa menjadi 24? Itu 24 ÷ 4'), ok: null },
      { text: t('9 × 4 = 36 is too big — the product must stay 24', '9 × 4 = 36 terlalu besar — hasil kalinya harus tetap 24'), ok: false },
      { text: '24 ÷ 4 = 6, and 6 × 4 = 24', ok: true },
    ],
    final: t('The box is 6 (D).', 'Kotaknya 6 (D).'),
    aria: t('Dividing 24 by 4 gives the missing factor 6.', 'Membagi 24 dengan 4 memberi faktor yang hilang, 6.'),
  }
})

/** Q18 — 53 − ( ) > 26: biggest box that keeps it above 26. */
export const MaxBox19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Push the box as high as it can go while 53 − box stays above 26.', 'Naikkan kotak setinggi mungkin selama 53 − kotak tetap di atas 26.'),
    items: [
      { text: t('Try 26: 53 − 26 = 27, and 27 > 26 ✓', 'Coba 26: 53 − 26 = 27, dan 27 > 26 ✓'), ok: null },
      { text: t('Try 27: 53 − 27 = 26, which is NOT bigger than 26 ✗', 'Coba 27: 53 − 27 = 26, yang TIDAK lebih besar dari 26 ✗'), ok: false },
      { text: t('25 works too (53 − 25 = 28), but it is not the biggest', '25 juga berhasil (53 − 25 = 28), tapi bukan yang terbesar'), ok: false },
      { text: t('The biggest box that still works is 26', 'Kotak terbesar yang masih berhasil adalah 26'), ok: true },
    ],
    final: t('The maximum value is 26 (A).', 'Nilai maksimumnya 26 (A).'),
    aria: t('Twenty-six is the largest box keeping 53 minus it above 26.', 'Dua puluh enam adalah kotak terbesar yang menjaga 53 dikurangi itu di atas 26.'),
  }
})

/** Q19 — 9 × diamond = 72, diamond × star = 24: chain through diamond. */
export const ChainSymbols19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the diamond first, then use it to find the star.', 'Selesaikan wajik dulu, lalu pakai untuk mencari bintang.'),
    items: [
      { text: t('9 × diamond = 72, so diamond = 72 ÷ 9 = 8', '9 × wajik = 72, jadi wajik = 72 ÷ 9 = 8'), ok: null },
      { text: t('Put 8 into the second fact: 8 × star = 24', 'Masukkan 8 ke fakta kedua: 8 × bintang = 24'), ok: null },
      { text: t('Dividing 24 by the wrong number (24 ÷ 6) gives 4 — use the real diamond, 8', 'Membagi 24 dengan angka salah (24 ÷ 6) memberi 4 — pakai wajik yang benar, 8'), ok: false },
      { text: '24 ÷ 8 = 3', ok: true },
    ],
    final: t('The star is 3 (B).', 'Bintang adalah 3 (B).'),
    aria: t('The diamond is 8, so the star is 24 divided by 8, which is 3.', 'Wajik adalah 8, jadi bintang 24 dibagi 8, yaitu 3.'),
  }
})

/** Q20 — trade circles for triangles, cancel, find diamond. */
export const TradeAndCancel19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A triangle is two circles, so trade the circles for triangles, then cancel.', 'Satu segitiga adalah dua lingkaran, jadi tukar lingkaran jadi segitiga, lalu hapus.'),
    items: [
      { text: t('4 circles = 2 triangles, so the left side is 2 diamonds + 3 triangles', '4 lingkaran = 2 segitiga, jadi sisi kiri 2 wajik + 3 segitiga'), ok: null },
      { text: t('2 diamonds + 3 triangles = 3 triangles + 10 — cancel the 3 triangles', '2 wajik + 3 segitiga = 3 segitiga + 10 — hapus 3 segitiga'), ok: null },
      { text: t('Forgetting 4 circles = 2 triangles leaves them uncancelled and gives too small a diamond', 'Lupa 4 lingkaran = 2 segitiga membuat segitiga tak terhapus dan memberi wajik yang terlalu kecil'), ok: false },
      { text: t('2 diamonds = 10, so one diamond = 10 ÷ 2 = 5', '2 wajik = 10, jadi satu wajik = 10 ÷ 2 = 5'), ok: true },
    ],
    final: t('The diamond is 5 (D).', 'Wajik adalah 5 (D).'),
    aria: t('Trading circles for triangles and cancelling leaves two diamonds equal ten, so one diamond is five.', 'Menukar lingkaran jadi segitiga dan menghapus menyisakan dua wajik sama dengan sepuluh, jadi satu wajik lima.'),
  }
})

/** Q22 — count partitions of 6 into two or more parts. */
export const PartitionsOfSix19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the splits by the biggest part first, so you never repeat a set.', 'Daftar pemecahan berdasar bagian terbesar dulu, agar tak mengulang himpunan.'),
    items: [
      { text: t('From 5: 5+1. From 4: 4+2, 4+1+1', 'Mulai 5: 5+1. Mulai 4: 4+2, 4+1+1'), ok: null },
      { text: t('From 3: 3+3, 3+2+1, 3+1+1+1. From 2: 2+2+2, 2+2+1+1, 2+1+1+1+1. From 1: 1+1+1+1+1+1', 'Mulai 3: 3+3, 3+2+1, 3+1+1+1. Mulai 2: 2+2+2, 2+2+1+1, 2+1+1+1+1. Mulai 1: 1+1+1+1+1+1'), ok: null },
      { text: t('Don’t count 6 by itself — the rule needs two or more parts (that would wrongly give 11)', 'Jangan menghitung 6 sendirian — aturan butuh dua bagian atau lebih (itu keliru jadi 11)'), ok: false },
      { text: '1 + 2 + 3 + 3 + 1 = 10', ok: true },
    ],
    final: t('There are 10 ways (C).', 'Ada 10 cara (C).'),
    aria: t('Listing splits of six into two or more parts gives ten ways.', 'Mendaftar pemecahan enam menjadi dua bagian atau lebih memberi sepuluh cara.'),
  }
})

/** Q24 — 5 up / 4 down rounds, 50 up-steps total, find stairs per level. */
export const StairClimb19P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Net each round, but the last climb up has no descent.', 'Hitung bersih tiap putaran, tapi pendakian terakhir tidak turun lagi.'),
    items: [
      { text: t('Each climb is 5 up, so 50 up-steps total means 10 climbs', 'Tiap naik 5, jadi 50 anak tangga naik berarti 10 kali naik'), ok: null },
      { text: t('First 9 rounds net 5 − 4 = 1 each: 9 rounds = 9 steps higher', '9 putaran pertama bersih 5 − 4 = 1 tiap kali: 9 putaran = 9 anak tangga naik'), ok: null },
      { text: t('9 forgets the final 5-step climb that has no descent', '9 lupa pendakian terakhir 5 langkah yang tanpa turun'), ok: false },
      { text: t('The last climb of 5 lands on the floor: 9 + 5 = 14', 'Pendakian terakhir 5 mendarat di lantai: 9 + 5 = 14'), ok: true },
    ],
    final: t('There are 14 stairs to one level (B).', 'Ada 14 anak tangga untuk satu lantai (B).'),
    aria: t('Nine net steps plus the final five-step climb make fourteen stairs.', 'Sembilan langkah bersih plus pendakian terakhir lima langkah menjadi empat belas anak tangga.'),
  }
})
