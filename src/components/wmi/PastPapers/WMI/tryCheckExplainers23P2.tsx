import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-23P2A (2023 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 555 − 19 − 311: subtract one number at a time, left to right. */
export const SubtractLeftToRight23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract one number at a time, left to right.', 'Kurangi satu per satu, dari kiri ke kanan.'),
    items: [
      { text: t('Take away the small number first: 555 − 19 = 536.', 'Kurangi bilangan kecil dulu: 555 − 19 = 536.'), ok: null },
      { text: t('Now take away 311: 536 − 311 = 225.', 'Sekarang kurangi 311: 536 − 311 = 225.'), ok: null },
      { text: t('Careless borrow gives 235 — but 536 − 311 = 225, not 235.', 'Pinjaman ceroboh memberi 235 — padahal 536 − 311 = 225, bukan 235.'), ok: false },
      { text: '555 − 19 − 311 = 225', ok: true },
    ],
    final: t('555 − 19 − 311 = 225 (B).', '555 − 19 − 311 = 225 (B).'),
    aria: t('Subtracting 19 then 311 from 555 leaves 225.', 'Mengurangi 19 lalu 311 dari 555 menyisakan 225.'),
  }
})

/** Q3 — how many of the numbers have 7 as their tens digit. */
export const TensDigitSeven23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The tens digit is the second digit from the right — check only that place.', 'Nilai tempat puluhan adalah angka kedua dari kanan — periksa hanya tempat itu.'),
    items: [
      { text: t('178 → 7, 71 → 7, 670 → 7 have a 7 in the tens place.', '178 → 7, 71 → 7, 670 → 7 punya 7 di puluhan.'), ok: null },
      { text: t('94, 25, 107, 746, 351, 707 do not — their tens digit is not 7.', '94, 25, 107, 746, 351, 707 tidak — puluhannya bukan 7.'), ok: null },
      { text: t('Don’t count 107, 746, 707 just for containing a 7 — that wrongly gives 5.', 'Jangan hitung 107, 746, 707 hanya karena memuat 7 — itu keliru jadi 5.'), ok: false },
      { text: t('So 3 numbers have 7 as the tens digit.', 'Jadi ada 3 bilangan dengan angka 7 di puluhan.'), ok: true },
    ],
    final: t('3 numbers have a 7 in the tens place (A).', 'Ada 3 bilangan dengan 7 di puluhan (A).'),
    aria: t('Only 178, 71 and 670 have 7 in the tens place, so the count is 3.', 'Hanya 178, 71 dan 670 yang punya 7 di puluhan, jadi jumlahnya 3.'),
  }
})

/** Q6 — 3×6 is smaller than 7×6 by ( ) 6's, and that is ( ). */
export const SixesGap23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiplication is repeated groups of 6 — compare three 6’s with seven 6’s.', 'Perkalian adalah kelompok 6 yang berulang — bandingkan tiga angka 6 dengan tujuh angka 6.'),
    items: [
      { text: t('7 × 6 means seven 6’s; 3 × 6 means three 6’s.', '7 × 6 berarti tujuh angka 6; 3 × 6 berarti tiga angka 6.'), ok: null },
      { text: t('The difference is 7 − 3 = 4 sixes, so the first ( ) is 4.', 'Selisihnya 7 − 3 = 4 buah angka 6, jadi ( ) pertama adalah 4.'), ok: null },
      { text: t('4, 16 has the count right but 4 × 6 = 24, not 16.', '4, 16 benar jumlahnya tapi 4 × 6 = 24, bukan 16.'), ok: false },
      { text: t('Four 6’s is 4 × 6 = 24, so the answer is 4, 24.', 'Empat angka 6 adalah 4 × 6 = 24, jadi jawabannya 4, 24.'), ok: true },
    ],
    final: t('The blanks are 4 and 24 (B).', 'Kedua ( ) adalah 4 dan 24 (B).'),
    aria: t('Seven sixes minus three sixes is four sixes, which is 24.', 'Tujuh angka 6 dikurangi tiga angka 6 adalah empat angka 6, yaitu 24.'),
  }
})

/** Q8 — 27 × □ = 81 + 108 + 54: add then undo the multiply. */
export const SolveBoxMultiply23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Simplify the side you can, then undo the multiply with a divide.', 'Sederhanakan ruas yang bisa, lalu balik perkalian dengan pembagian.'),
    items: [
      { text: t('Add the right side first: 81 + 108 + 54 = 243.', 'Jumlahkan ruas kanan dulu: 81 + 108 + 54 = 243.'), ok: null },
      { text: t('Now 27 × □ = 243, so divide: 243 ÷ 27 = 9.', 'Sekarang 27 × □ = 243, jadi bagi: 243 ÷ 27 = 9.'), ok: null },
      { text: t('□ = 8 is too small: 27 × 8 = 216, not 243.', '□ = 8 terlalu kecil: 27 × 8 = 216, bukan 243.'), ok: false },
      { text: t('Check: 27 × 9 = 243, so □ = 9.', 'Cek: 27 × 9 = 243, jadi □ = 9.'), ok: true },
    ],
    final: t('□ = 9 (A).', '□ = 9 (A).'),
    aria: t('The right side totals 243 and 243 divided by 27 is 9.', 'Ruas kanan berjumlah 243 dan 243 dibagi 27 adalah 9.'),
  }
})

/** Q9 — pile of 5 boxes vs a 200 cm cabinet: difference in cm. */
export const BoxPileGap23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply to get the pile, then subtract to compare.', 'Kalikan untuk tumpukan, lalu kurangi untuk membandingkan.'),
    items: [
      { text: t('Find the pile height: 5 boxes × 21 cm = 105 cm.', 'Cari tinggi tumpukan: 5 kotak × 21 cm = 105 cm.'), ok: null },
      { text: t('The cabinet is taller at 200 cm.', 'Lemari lebih tinggi, yaitu 200 cm.'), ok: null },
      { text: t('105 is only the pile’s height — the question asks how much shorter it is.', '105 hanya tinggi tumpukan — pertanyaannya berapa lebih pendek.'), ok: false },
      { text: t('Difference = 200 − 105 = 95 cm.', 'Selisih = 200 − 105 = 95 cm.'), ok: true },
    ],
    final: t('The gap is 95 cm (D).', 'Selisihnya 95 cm (D).'),
    aria: t('Five boxes make 105 cm and 200 minus 105 is 95.', 'Lima kotak setinggi 105 cm dan 200 dikurangi 105 adalah 95.'),
  }
})

/** Q10 — which MF player scores the fewest goals. */
export const FewestMfGoals23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Filter to the MF players only, then pick the smallest goal total.', 'Saring hanya pemain MF, lalu pilih jumlah gol terkecil.'),
    items: [
      { text: t('Only Clay, Denny, and Evan are MF; ignore the CF players.', 'Hanya Clay, Denny, dan Evan yang MF; abaikan pemain CF.'), ok: null },
      { text: t('Beck plays CF, not MF, so he is not even in the comparison.', 'Beck bermain CF, bukan MF, jadi tidak masuk perbandingan.'), ok: false },
      { text: t('Read each MF total: Denny has the smallest of the three.', 'Baca tiap jumlah MF: Denny terkecil di antara ketiganya.'), ok: null },
      { text: t('So the MF player with the fewest goals is Denny.', 'Jadi pemain MF dengan gol paling sedikit adalah Denny.'), ok: true },
    ],
    final: t('Denny scores the fewest among the MF players (C).', 'Denny mencetak gol paling sedikit di antara pemain MF (C).'),
    aria: t('Among the midfielders Clay, Denny and Evan, Denny scores the fewest goals.', 'Di antara gelandang Clay, Denny dan Evan, Denny mencetak gol paling sedikit.'),
  }
})

/** Q11 — 3-digit numbers over 450 from cards 0, 2, 4, 5 (no repeats). */
export const ThreeDigitOver450_23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Split by the hundreds digit, then list carefully — no card repeats.', 'Pisahkan berdasarkan angka ratusan, lalu susun dengan teliti — kartu tak berulang.'),
    items: [
      { text: t('To pass 450 the first digit must be 4 or 5.', 'Agar melewati 450, angka pertama harus 4 atau 5.'), ok: null },
      { text: t('Starting with 5: 502, 504, 520, 524, 540, 542 — that is 6.', 'Mulai dengan 5: 502, 504, 520, 524, 540, 542 — yaitu 6.'), ok: null },
      { text: t('Starting with 4, only 452 beats 450 — don’t count 420 or 425, they are below 450.', 'Mulai dengan 4, hanya 452 yang melebihi 450 — jangan hitung 420 atau 425, di bawah 450.'), ok: false },
      { text: t('Total = 6 + 1 = 7 numbers.', 'Total = 6 + 1 = 7 bilangan.'), ok: true },
    ],
    final: t('There are 7 such numbers (A).', 'Ada 7 bilangan seperti itu (A).'),
    aria: t('Six numbers start with 5 and only 452 starts with 4, giving 7.', 'Enam bilangan mulai dengan 5 dan hanya 452 mulai dengan 4, jadi 7.'),
  }
})

/** Q13 — which option can be replaced by "<". */
export const ReplaceWithLess23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out both sides of each option, then find where left is truly less than right.', 'Hitung kedua ruas tiap pilihan, lalu cari di mana kiri benar-benar lebih kecil dari kanan.'),
    items: [
      { text: t('A: 78 − 45 = 33, equals 33 — that is “=”, not “<”.', 'A: 78 − 45 = 33, sama dengan 33 — itu “=”, bukan “<”.'), ok: false },
      { text: t('B: 18 ÷ 2 = 9 vs 8 — 9 is bigger, not less.', 'B: 18 ÷ 2 = 9 vs 8 — 9 lebih besar, bukan lebih kecil.'), ok: false },
      { text: t('D: 37 vs 100 − 69 = 31 — 37 is bigger, not less.', 'D: 37 vs 100 − 69 = 31 — 37 lebih besar, bukan lebih kecil.'), ok: false },
      { text: t('C: 36 × 4 = 144 and 85 + 80 = 165, so 144 < 165.', 'C: 36 × 4 = 144 dan 85 + 80 = 165, jadi 144 < 165.'), ok: true },
    ],
    final: t('Only option C makes “<” true (C).', 'Hanya pilihan C yang membuat “<” benar (C).'),
    aria: t('Checking each option, only 144 is less than 165 in option C.', 'Memeriksa tiap pilihan, hanya 144 yang lebih kecil dari 165 pada pilihan C.'),
  }
})

/** Q14 — overlap of Kevin's add-3 list and John's multiples-of-5 list. */
export const SharedCounts23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the numbers that appear in both lists — the overlap of two patterns.', 'Cari bilangan yang muncul di kedua daftar — irisan dua pola.'),
    items: [
      { text: t('Kevin says 13, 16, 19, 22, … (add 3 each time).', 'Kevin menyebut 13, 16, 19, 22, … (tambah 3 tiap kali).'), ok: null },
      { text: t('John says 95, 90, 85, 80, … (multiples of 5 down to 0).', 'John menyebut 95, 90, 85, 80, … (kelipatan 5 turun ke 0).'), ok: null },
      { text: t('Don’t include 95 — it is not in Kevin’s add-3 list, so 6 is wrong.', 'Jangan masukkan 95 — tidak ada di deret tambah-3 Kevin, jadi 6 salah.'), ok: false },
      { text: t('Shared numbers are 25, 40, 55, 70, 85 — that is 5.', 'Bilangan bersama adalah 25, 40, 55, 70, 85 — yaitu 5.'), ok: true },
    ],
    final: t('They count 5 numbers in common (B).', 'Ada 5 bilangan yang sama (B).'),
    aria: t('The numbers in both lists are 25, 40, 55, 70 and 85, so five are shared.', 'Bilangan di kedua daftar adalah 25, 40, 55, 70 dan 85, jadi lima yang sama.'),
  }
})

/** Q15 — repeating block ▲▲⬠⬠▲, fill the blank. */
export const RepeatingShapeBlock23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Spot the repeating unit ▲▲⬠⬠▲ — the third block shows ▲__⬠▲ with two shapes hidden.', 'Temukan satuan berulang ▲▲⬠⬠▲ — blok ketiga tampak ▲__⬠▲ dengan dua bentuk tersembunyi.'),
    items: [
      { text: t('The repeating block is triangle, triangle, pentagon, pentagon, triangle.', 'Blok berulangnya segitiga, segitiga, segilima, segilima, segitiga.'), ok: null },
      { text: t('The third block shows ▲__⬠▲, so its 2nd and 3rd shapes are the hidden ones.', 'Blok ketiga tampak ▲__⬠▲, jadi bentuk ke-2 dan ke-3nya yang tersembunyi.'), ok: null },
      { text: t('Not triangle, triangle — that would be the block’s 1st and 2nd shapes, but the first ▲ is already shown.', 'Bukan segitiga, segitiga — itu bentuk ke-1 dan ke-2 blok, padahal ▲ pertama sudah terlihat.'), ok: false },
      { text: t('In ▲▲⬠⬠▲ the 2nd shape is ▲ and the 3rd is ⬠ — triangle, pentagon.', 'Pada ▲▲⬠⬠▲ bentuk ke-2 adalah ▲ dan ke-3 adalah ⬠ — segitiga, segilima.'), ok: true },
    ],
    final: t('The blank is filled by triangle, pentagon (D).', 'Bagian kosong diisi segitiga, segilima (D).'),
    aria: t('Continuing the repeating block, the blank is triangle then pentagon.', 'Melanjutkan blok berulang, bagian kosong adalah segitiga lalu segilima.'),
  }
})

/** Q16 — re-grade Jenny and Tom, total their points. */
export const TestScoreTotal23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Re-check every equation, then total both scores at 10 points each correct.', 'Periksa ulang tiap persamaan, lalu jumlahkan kedua skor, 10 poin tiap yang benar.'),
    items: [
      { text: t('Jenny is right on (1)(3)(5)(7)(8)(9) — 6 correct = 60 points.', 'Jenny benar pada (1)(3)(5)(7)(8)(9) — 6 benar = 60 poin.'), ok: null },
      { text: t('Tom is right on (1)(3)(6)(10) — 4 correct = 40 points.', 'Tom benar pada (1)(3)(6)(10) — 4 benar = 40 poin.'), ok: null },
      { text: t('Don’t over-credit Tom: 4×8=48 and 17×6=106 are wrong, so 90 is too high.', 'Jangan beri Tom terlalu banyak: 4×8=48 dan 17×6=106 salah, jadi 90 terlalu tinggi.'), ok: false },
      { text: '60 + 40 = 100', ok: true },
    ],
    final: t('The sum of their points is 100 (C).', 'Jumlah poin mereka adalah 100 (C).'),
    aria: t('Jenny scores 60 and Tom 40, so together they score 100.', 'Jenny dapat 60 dan Tom 40, jadi bersama 100.'),
  }
})

/** Q19 — sum of the first 9 odd numbers (pieces taken). */
export const OddTakesSum23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add all 9 takes — the first nine odd numbers — by pairing from the ends.', 'Jumlahkan ke-9 pengambilan — sembilan bilangan ganjil pertama — dengan memasangkan dari ujung.'),
    items: [
      { text: t('The takes are 1, 3, 5, 7, 9, 11, 13, 15, 17 (each 2 more).', 'Pengambilannya 1, 3, 5, 7, 9, 11, 13, 15, 17 (tiap kali 2 lebih).'), ok: null },
      { text: t('Pair from the ends: 1+17, 3+15, 5+13, 7+11 each make 18.', 'Pasangkan dari ujung: 1+17, 3+15, 5+13, 7+11 masing-masing 18.'), ok: null },
      { text: t('That is 4 pairs of 18 = 72, plus the middle 9 = 81 — careless counting gives 85.', 'Itu 4 pasang 18 = 72, ditambah angka tengah 9 = 81 — menghitung ceroboh memberi 85.'), ok: false },
      { text: t('Total = 72 + 9 = 81 pieces.', 'Total = 72 + 9 = 81 bidak.'), ok: true },
    ],
    final: t('There are 81 pieces in the box (B).', 'Ada 81 bidak dalam kotak (B).'),
    aria: t('Four pairs of eighteen plus nine is 81 pieces.', 'Empat pasang delapan belas ditambah sembilan adalah 81 bidak.'),
  }
})

/** Q20 — minimum adjacent swaps = number of out-of-order pairs. */
export const FlagSwaps23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count every out-of-order pair — each adjacent swap fixes exactly one.', 'Hitung tiap pasangan salah urut — tiap tukar bersebelahan memperbaiki tepat satu.'),
    items: [
      { text: t('In 5, 3, 4, 1, 6, 2 find every bigger-before-smaller pair.', 'Pada 5, 3, 4, 1, 6, 2 cari tiap pasangan besar-sebelum-kecil.'), ok: null },
      { text: t('5 before 3,4,1,2 (4); 3 before 1,2 (2); 4 before 1,2 (2); 6 before 2 (1).', '5 di depan 3,4,1,2 (4); 3 di depan 1,2 (2); 4 di depan 1,2 (2); 6 di depan 2 (1).'), ok: null },
      { text: t('Don’t stop at 8 — that misses one pair; the careful count is 9.', 'Jangan berhenti di 8 — itu melewatkan satu pasang; hitungan teliti adalah 9.'), ok: false },
      { text: '4 + 2 + 2 + 1 = 9', ok: true },
    ],
    final: t('9 adjacent swaps are needed (C).', 'Perlu 9 penukaran bersebelahan (C).'),
    aria: t('There are nine out-of-order pairs, so nine swaps are needed.', 'Ada sembilan pasang salah urut, jadi perlu sembilan penukaran.'),
  }
})

/** Q21 — 2-digit numbers equal to twice the product of their digits. */
export const TwiceDigitProduct23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Test candidates against value = 2 × (tens digit × ones digit).', 'Uji kandidat terhadap nilai = 2 × (angka puluhan × angka satuan).'),
    items: [
      { text: t('A 2-digit number must equal 2 × tens × ones.', 'Bilangan 2 angka harus sama dengan 2 × puluhan × satuan.'), ok: null },
      { text: t('Try 36: digits 3 and 6, product 18, and twice 18 is 36 — it matches.', 'Coba 36: angka 3 dan 6, hasil kali 18, dua kali 18 adalah 36 — cocok.'), ok: null },
      { text: t('Don’t answer 0 — that assumes none work, but 36 does.', 'Jangan jawab 0 — itu menganggap tidak ada, padahal 36 cocok.'), ok: false },
      { text: t('No other 2-digit number works, so there is exactly 1.', 'Tidak ada bilangan 2 angka lain yang cocok, jadi tepat ada 1.'), ok: true },
    ],
    final: t('Exactly 1 such number exists (B).', 'Tepat ada 1 bilangan seperti itu (B).'),
    aria: t('Only 36 equals twice the product of its digits, so the count is one.', 'Hanya 36 yang sama dengan dua kali hasil kali angkanya, jadi jumlahnya satu.'),
  }
})

/** Q23 — cryptarithm □□□ + □□ + □△ = △△△: solve column by column. */
export const SquareTriangleSum23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve □□□ + □□ + □△ = △△△ column by column, starting from the ones.', 'Pecahkan □□□ + □□ + □△ = △△△ kolom demi kolom, mulai dari satuan.'),
    items: [
      { text: t('Ones column: □ + □ + △ must end in △, so □ + □ ends in 0 → □ = 5 (carry 1).', 'Kolom satuan: □ + □ + △ harus berakhiran △, jadi □ + □ berakhiran 0 → □ = 5 (simpan 1).'), ok: null },
      { text: t('Tens column: 5 + 5 + 5 + 1 = 16, so △ = 6 (carry 1); hundreds: 5 + 1 = 6 = △ ✓.', 'Kolom puluhan: 5 + 5 + 5 + 1 = 16, jadi △ = 6 (simpan 1); ratusan: 5 + 1 = 6 = △ ✓.'), ok: null },
      { text: t('Not □ = 6, △ = 5 (that would give 21): 666 + 66 + 65 = 797, not 555.', 'Bukan □ = 6, △ = 5 (yang memberi 21): 666 + 66 + 65 = 797, bukan 555.'), ok: false },
      { text: t('Check: 555 + 55 + 56 = 666, so □ + △ + △ + △ = 5 + 6 + 6 + 6 = 23.', 'Cek: 555 + 55 + 56 = 666, jadi □ + △ + △ + △ = 5 + 6 + 6 + 6 = 23.'), ok: true },
    ],
    final: t('□ + △ + △ + △ = 23 (D).', '□ + △ + △ + △ = 23 (D).'),
    aria: t('The ones column forces the square digit 5 and the triangle digit 6, giving 5 plus three sixes equals 23.', 'Kolom satuan memaksa □ = 5 dan △ = 6, sehingga 5 ditambah tiga angka 6 sama dengan 23.'),
  }
})

/** Q22 — grid path sums, difference between maximum M and minimum m. */
export const PathSumGap23P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the greediest path and the cheapest path, then take the difference.', 'Cari jalur terbesar dan jalur terkecil, lalu ambil selisihnya.'),
    items: [
      { text: t('Every path goes from the bottom-left 5 to the top-right 5, only right or up.', 'Tiap jalur dari angka 5 kiri-bawah ke angka 5 kanan-atas, hanya ke kanan atau ke atas.'), ok: null },
      { text: t('Path through the biggest numbers gives the maximum sum M = 27.', 'Jalur lewat bilangan terbesar memberi jumlah terbesar M = 27.'), ok: null },
      { text: t('Path through the smallest numbers gives the minimum sum m = 21 — a worse path wrongly gives 7.', 'Jalur lewat bilangan terkecil memberi jumlah terkecil m = 21 — jalur kurang tepat keliru memberi 7.'), ok: false },
      { text: t('Difference M − m = 27 − 21 = 6.', 'Selisihnya M − m = 27 − 21 = 6.'), ok: true },
    ],
    final: t('M − m = 6 (C).', 'M − m = 6 (C).'),
    aria: t('The biggest path sums to 27 and the smallest to 21, so the difference is 6.', 'Jalur terbesar berjumlah 27 dan terkecil 21, jadi selisihnya 6.'),
  }
})
