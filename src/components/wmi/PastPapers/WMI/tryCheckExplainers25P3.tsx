import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-25P3A (2025 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination, blue rows are neutral facts.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 462 + 2025 + 538 + 985 by pairing into round sums. */
export const PairRoundSums25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair the numbers into round sums first, then add the parts.', 'Pasangkan bilangan menjadi jumlah bulat dulu, lalu jumlahkan bagiannya.'),
    items: [
      { text: t('Look for a friendly pair: 462 + 538 = 1000', 'Cari pasangan yang ramah: 462 + 538 = 1000'), ok: null },
      { text: '2025 + 985 = 3010', ok: null },
      { text: t('Don’t stop at 3010 — that forgets the 462 + 538 = 1000 pair', 'Jangan berhenti di 3010 — itu lupa pasangan 462 + 538 = 1000'), ok: false },
      { text: '1000 + 3010 = 4010', ok: true },
    ],
    final: t('462 + 2025 + 538 + 985 = 4010 (B).', '462 + 2025 + 538 + 985 = 4010 (B).'),
    aria: t('Pairing 462 with 538 to make 1000 then adding 3010 gives 4010.', 'Memasangkan 462 dengan 538 menjadi 1000 lalu menambah 3010 menghasilkan 4010.'),
  }
})

/** Q2 — how many 1-digit □ make 259 × □ a 4-digit even number? */
export const EvenFourDigitProduct25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Filter the digits by both rules: the product must reach 1000 and be even.', 'Saring angka dengan kedua syarat: hasil kali harus mencapai 1000 dan genap.'),
    items: [
      { text: t('For 4 digits, 259 × □ ≥ 1000, so □ ≥ 4 (259 × 4 = 1036)', 'Agar 4 angka, 259 × □ ≥ 1000, jadi □ ≥ 4 (259 × 4 = 1036)'), ok: null },
      { text: t('So □ can be 4, 5, 6, 7, 8, or 9', 'Jadi □ bisa 4, 5, 6, 7, 8, atau 9'), ok: null },
      { text: t('Don’t keep 2 — it is even, but 259 × 2 = 518 is only 3 digits', 'Jangan ambil 2 — genap, tapi 259 × 2 = 518 hanya 3 angka'), ok: false },
      { text: t('For an even product, □ must be even: 4, 6, 8 → 3 digits', 'Agar hasil genap, □ harus genap: 4, 6, 8 → 3 angka'), ok: true },
    ],
    final: t('3 different digits work (C).', 'Ada 3 angka berbeda yang cocok (C).'),
    aria: t('Only even digits 4, 6, 8 give a 4-digit even product, so 3 digits work.', 'Hanya angka genap 4, 6, 8 memberi hasil genap empat angka, jadi 3 angka cocok.'),
  }
})

/** Q3 — sum of smallest 3-digit odd and largest 2-digit number is divisible by? */
export const SumDivisible25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build the sum first, then test each divisor.', 'Bentuk jumlahnya dulu, lalu uji tiap pembagi.'),
    items: [
      { text: t('Smallest 3-digit odd number is 101 (100 is even)', 'Bilangan ganjil tiga angka terkecil 101 (100 genap)'), ok: null },
      { text: t('Largest 2-digit number is 99, so 101 + 99 = 200', 'Bilangan dua angka terbesar 99, jadi 101 + 99 = 200'), ok: null },
      { text: t('Don’t pick 6 — 200 is even but 200 ÷ 6 is not whole', 'Jangan pilih 6 — 200 genap tapi 200 ÷ 6 tidak bulat'), ok: false },
      { text: '200 ÷ 8 = 25', ok: true },
    ],
    final: t('200 is divisible by 8 (D).', '200 habis dibagi 8 (D).'),
    aria: t('101 plus 99 is 200, which divides evenly by 8.', '101 ditambah 99 adalah 200, yang habis dibagi 8.'),
  }
})

/** Q5 — 4 workers, 18 kg/hour each, 8 am to 1 pm. */
export const TeaPickTotal25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply rate × hours × workers.', 'Kalikan laju × jam × pekerja.'),
    items: [
      { text: t('From 8 am to 1 pm is 5 hours', 'Dari pukul 8 pagi sampai 1 siang adalah 5 jam'), ok: null },
      { text: t('One worker picks 18 × 5 = 90 kg', 'Satu pekerja memetik 18 × 5 = 90 kg'), ok: null },
      { text: t('Don’t count only 4 hours: 18 × 4 × 4 = 288 misses the 5th hour', 'Jangan hitung hanya 4 jam: 18 × 4 × 4 = 288 melewatkan jam ke-5'), ok: false },
      { text: t('Four workers pick 90 × 4 = 360 kg', 'Empat pekerja memetik 90 × 4 = 360 kg'), ok: true },
    ],
    final: t('They pick 360 kg in total (B).', 'Mereka memetik 360 kg seluruhnya (B).'),
    aria: t('Five hours at 18 kg for four workers is 360 kg.', 'Lima jam dengan 18 kg untuk empat pekerja adalah 360 kg.'),
  }
})

/** Q6 — watch flat, 4 faces west; which number faces south? */
export const WatchFacesSouth25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('On a clock the numbers are evenly spaced — each compass quarter is 3 clock-hours apart.', 'Pada jam angka berjarak rata — setiap seperempat mata angin berjarak 3 angka jam.'),
    items: [
      { text: t('4 faces west; the numbers run 12, 1, 2, 3, … clockwise', '4 menghadap barat; angka berurutan 12, 1, 2, 3, … searah jarum jam'), ok: null },
      { text: t('Don’t turn the wrong way to 7 — that faces north, opposite of south', 'Jangan berputar salah arah ke 7 — itu menghadap utara, lawan selatan'), ok: false },
      { text: t('South is 3 hours before 4 on the dial, which is 1', 'Selatan 3 jam sebelum angka 4 pada muka jam, yaitu 1'), ok: true },
    ],
    final: t('1 faces south (A).', 'Angka 1 menghadap selatan (A).'),
    aria: t('With 4 facing west, the number 1 faces south.', 'Dengan 4 menghadap barat, angka 1 menghadap selatan.'),
  }
})

/** Q7 — 178 cm rope: rectangle 22×9, square from the rest; find the side. */
export const RopeSquareSide25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract the rope used by the rectangle, then divide the rest by 4.', 'Kurangi tali yang dipakai persegi panjang, lalu bagi sisanya dengan 4.'),
    items: [
      { text: t('Rectangle perimeter: 2 × (22 + 9) = 62 cm', 'Keliling persegi panjang: 2 × (22 + 9) = 62 cm'), ok: null },
      { text: t('Rope left for the square: 178 − 62 = 116 cm', 'Sisa tali untuk persegi: 178 − 62 = 116 cm'), ok: null },
      { text: t('Don’t stop at 31 — that is just 22 + 9, half the rectangle’s perimeter', 'Jangan berhenti di 31 — itu hanya 22 + 9, setengah keliling persegi panjang'), ok: false },
      { text: t('A square has 4 equal sides: 116 ÷ 4 = 29 cm', 'Persegi punya 4 sisi sama: 116 ÷ 4 = 29 cm'), ok: true },
    ],
    final: t('The side of the square is 29 cm (E).', 'Sisi persegi adalah 29 cm (E).'),
    aria: t('After the rectangle uses 62 cm, the leftover 116 cm makes a square with side 29 cm.', 'Setelah persegi panjang memakai 62 cm, sisa 116 cm membentuk persegi bersisi 29 cm.'),
  }
})

/** Q8 — 36 teams into 9 groups; games per group when every pair plays once. */
export const GamesPerGroup25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the teams per group, then count every distinct pair.', 'Cari tim per grup, lalu hitung setiap pasangan berbeda.'),
    items: [
      { text: t('Each group has 36 ÷ 9 = 4 teams', 'Setiap grup punya 36 ÷ 9 = 4 tim'), ok: null },
      { text: t('Handshake count for 4 teams: 3 + 2 + 1', 'Hitungan jabat tangan untuk 4 tim: 3 + 2 + 1'), ok: null },
      { text: t('Don’t double-count to 12 (4 × 3) — each game is shared by two teams', 'Jangan menghitung ganda jadi 12 (4 × 3) — tiap pertandingan dibagi dua tim'), ok: false },
      { text: '3 + 2 + 1 = 6', ok: true },
    ],
    final: t('Each group plays 6 games (B).', 'Setiap grup bermain 6 pertandingan (B).'),
    aria: t('With 4 teams per group, three plus two plus one is 6 games.', 'Dengan 4 tim per grup, tiga tambah dua tambah satu adalah 6 pertandingan.'),
  }
})

/** Q10 — 8 boxes, remove 30 each; remaining 8 boxes equal original 5 boxes. */
export const AppleBoxesTotal25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The amount removed equals 3 boxes — use that to find one box, then all eight.', 'Jumlah yang diambil sama dengan 3 kotak — pakai itu untuk cari satu kotak, lalu kedelapan.'),
    items: [
      { text: t('Removing 30 from each of 8 boxes takes out 8 × 30 = 240 apples', 'Mengambil 30 dari tiap 8 kotak menghilangkan 8 × 30 = 240 apel'), ok: null },
      { text: t('8 boxes shrank to equal 5 boxes, so the 240 removed = 3 boxes', '8 kotak menyusut menyamai 5 kotak, jadi 240 yang diambil = 3 kotak'), ok: null },
      { text: t('One box: 240 ÷ 3 = 80 apples', 'Satu kotak: 240 ÷ 3 = 80 apel'), ok: null },
      { text: t('Don’t stop at 400 = 5 × 80 — that is what remains, not the original 8 boxes', 'Jangan berhenti di 400 = 5 × 80 — itu yang tersisa, bukan 8 kotak semula'), ok: false },
      { text: t('Originally 8 × 80 = 640 apples', 'Semula 8 × 80 = 640 apel'), ok: true },
    ],
    final: t('There are 640 apples originally (C).', 'Semula ada 640 apel (C).'),
    aria: t('The 240 removed equal 3 boxes, so each box holds 80 and the 8 boxes hold 640.', '240 yang diambil sama dengan 3 kotak, jadi tiap kotak 80 dan 8 kotak berisi 640.'),
  }
})

/** Q11 — compute 78 + 55 + 69 + 83 − 24 − 48 − 23. */
export const GroupAddSubtract25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group the adds and the subtracts, then take the difference.', 'Kelompokkan penjumlahan dan pengurangan, lalu cari selisihnya.'),
    items: [
      { text: '78 + 55 + 69 + 83 = 285', ok: null },
      { text: '24 + 48 + 23 = 95', ok: null },
      { text: t('Don’t slip to 200 — careful totals are 285 and 95', 'Jangan keliru jadi 200 — total cermatnya 285 dan 95'), ok: false },
      { text: '285 − 95 = 190', ok: true },
    ],
    final: t('78 + 55 + 69 + 83 − 24 − 48 − 23 = 190 (B).', '78 + 55 + 69 + 83 − 24 − 48 − 23 = 190 (B).'),
    aria: t('Positives total 285, subtracted total 95, so the answer is 190.', 'Positif berjumlah 285, yang dikurangkan 95, jadi jawabannya 190.'),
  }
})

/** Q12 — difference of counts of simplest proper fractions with digit-sum 20 vs 25. */
export const FractionCountDiff25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count coprime numerators below half the sum for each total, then subtract.', 'Hitung pembilang relatif prima di bawah setengah jumlah untuk tiap total, lalu kurangkan.'),
    items: [
      { text: t('Sum 20: numerators under 10 with no factor shared with 20 → 1, 3, 7, 9 → 4', 'Jumlah 20: pembilang di bawah 10 tanpa faktor sama dengan 20 → 1, 3, 7, 9 → 4'), ok: null },
      { text: t('Sum 25: numerators under 12.5 with no factor shared with 25 → 1,2,3,4,6,7,8,9,11,12 → 10', 'Jumlah 25: pembilang di bawah 12,5 tanpa faktor sama dengan 25 → 1,2,3,4,6,7,8,9,11,12 → 10'), ok: null },
      { text: t('Don’t stop at 10 — that is only the count for sum 25, not the difference', 'Jangan berhenti di 10 — itu hanya banyaknya untuk jumlah 25, bukan selisihnya'), ok: false },
      { text: '10 − 4 = 6', ok: true },
    ],
    final: t('The difference of the counts is 6 (D).', 'Selisih kedua banyaknya adalah 6 (D).'),
    aria: t('Four fractions for sum 20 and ten for sum 25 differ by 6.', 'Empat pecahan untuk jumlah 20 dan sepuluh untuk jumlah 25 berselisih 6.'),
  }
})

/** Q13 — logs in layers 2, 3, 4, …, 12 (11 layers). */
export const LogStackTotal25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add 1 to 12, then remove the missing 1 since the stack starts at 2.', 'Jumlahkan 1 sampai 12, lalu buang 1 yang hilang karena tumpukan mulai dari 2.'),
    items: [
      { text: t('The layers run 2, 3, 4, …, 12 — that is 1 to 12 without the 1', 'Lapisan 2, 3, 4, …, 12 — yaitu 1 sampai 12 tanpa 1'), ok: null },
      { text: '1 + 2 + … + 12 = 12 × 13 ÷ 2 = 78', ok: null },
      { text: t('Don’t leave it at 78 — the stack starts at 2, so the 1 is not there', 'Jangan biarkan 78 — tumpukan mulai dari 2, jadi 1 tidak ada'), ok: false },
      { text: '78 − 1 = 77', ok: true },
    ],
    final: t('There are 77 logs (A).', 'Ada 77 batang kayu (A).'),
    aria: t('One to twelve is 78, minus the missing 1 leaves 77 logs.', 'Satu sampai dua belas adalah 78, dikurangi 1 yang hilang menyisakan 77 batang.'),
  }
})

/** Q16 — last earlier year where units digit = sum of other digits + 1. */
export const YearDigitRule25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Search backward and test the rule each year: units = (other digits) + 1.', 'Cari mundur dan uji aturan tiap tahun: satuan = (angka lain) + 1.'),
    items: [
      { text: t('2025 fits: 2 + 0 + 2 = 4, and the units digit 5 = 4 + 1', '2025 cocok: 2 + 0 + 2 = 4, dan angka satuan 5 = 4 + 1'), ok: null },
      { text: t('Don’t jump to 2010 — its digits sum to 3 but the units digit 0 ≠ 4', 'Jangan loncat ke 2010 — jumlah angkanya 3 tapi satuan 0 ≠ 4'), ok: false },
      { text: t('2014 fits: 2 + 0 + 1 = 3, and the units digit 4 = 3 + 1', '2014 cocok: 2 + 0 + 1 = 3, dan angka satuan 4 = 3 + 1'), ok: null },
      { text: '2025 − 2014 = 11', ok: true },
    ],
    final: t('The last matching year was 11 years ago (C).', 'Tahun cocok terakhir adalah 11 tahun yang lalu (C).'),
    aria: t('The previous year obeying the digit rule is 2014, which is 11 years before 2025.', 'Tahun sebelumnya yang menaati aturan angka adalah 2014, yaitu 11 tahun sebelum 2025.'),
  }
})

/** Q17 — bottom-right sequence 8, 26, 52, ? with growing gaps. */
export const GrowingGapSequence25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Track the differences of the bottom-right numbers, and the differences of those differences.', 'Lacak selisih angka kanan-bawah, lalu selisih dari selisih itu.'),
    items: [
      { text: t('Bottom-right across the squares: 8, 26, 52, ?', 'Kanan-bawah di seluruh persegi: 8, 26, 52, ?'), ok: null },
      { text: t('Gaps grow by 8: 26 − 8 = 18, then 52 − 26 = 26', 'Selisih bertambah 8: 26 − 8 = 18, lalu 52 − 26 = 26'), ok: null },
      { text: t('Don’t add a constant 26 again (52 + 26 = 78) — the gap grows to 34', 'Jangan menambah 26 lagi (52 + 26 = 78) — selisihnya tumbuh jadi 34'), ok: false },
      { text: t('Next gap is 26 + 8 = 34, so ? = 52 + 34 = 86', 'Selisih berikutnya 26 + 8 = 34, jadi ? = 52 + 34 = 86'), ok: true },
    ],
    final: t('The missing number is 86 (D).', 'Bilangan yang hilang adalah 86 (D).'),
    aria: t('The gaps grow by 8, so after 52 the next number is 86.', 'Selisih bertambah 8, jadi setelah 52 bilangan berikutnya 86.'),
  }
})

/** Q20 — how many 2-digit numbers equal a sum of 4 consecutive positive integers. */
export const ConsecutiveSumCount25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write the sum as 4n + 6 and bound it to the 2-digit range.', 'Tulis jumlah sebagai 4n + 6 lalu batasi ke rentang dua angka.'),
    items: [
      { text: t('Four consecutive from n add to 4n + 6', 'Empat berurutan mulai n berjumlah 4n + 6'), ok: null },
      { text: t('Need a 2-digit value: 10 ≤ 4n + 6 ≤ 99, so 1 ≤ n ≤ 23', 'Perlu nilai dua angka: 10 ≤ 4n + 6 ≤ 99, jadi 1 ≤ n ≤ 23'), ok: null },
      { text: t('Don’t over-count to 25 — n = 24 gives 102, past 99', 'Jangan berlebih jadi 25 — n = 24 memberi 102, melebihi 99'), ok: false },
      { text: t('n runs from 1 to 23 → 23 different numbers', 'n dari 1 sampai 23 → 23 bilangan berbeda'), ok: true },
    ],
    final: t('23 two-digit numbers can be written this way (E).', '23 bilangan dua angka dapat ditulis begini (E).'),
    aria: t('The sum 4n plus 6 is 2-digit for n from 1 to 23, giving 23 numbers.', 'Jumlah 4n tambah 6 dua angka untuk n dari 1 sampai 23, memberi 23 bilangan.'),
  }
})

/** Q21 — subtract odds leaves 29, subtract evens leaves 11; digit sum of A. */
export const SubtractRunsDigitSum25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Odd sums are perfect squares, even sums are m(m+1); match them to find A.', 'Jumlah ganjil itu kuadrat sempurna, jumlah genap itu m(m+1); cocokkan untuk cari A.'),
    items: [
      { text: t('Odds 1+3+…+(2k−1) = k², so A = k² + 29', 'Ganjil 1+3+…+(2k−1) = k², jadi A = k² + 29'), ok: null },
      { text: t('Evens 2+4+…+2m = m(m+1), so A = m(m+1) + 11', 'Genap 2+4+…+2m = m(m+1), jadi A = m(m+1) + 11'), ok: null },
      { text: t('Match: k² + 18 = m(m+1); m = 18 gives 342, so k² = 324 = 18², and A = 353', 'Cocokkan: k² + 18 = m(m+1); m = 18 memberi 342, jadi k² = 324 = 18², dan A = 353'), ok: null },
      { text: t('Digits of 353: 3 + 5 + 3 = 11', 'Angka 353: 3 + 5 + 3 = 11'), ok: true },
    ],
    final: t('The digit sum of A = 353 is 11 (A).', 'Jumlah angka A = 353 adalah 11 (A).'),
    aria: t('Matching square and m times m plus one gives A equal to 353, whose digits add to 11.', 'Mencocokkan kuadrat dan m kali m tambah satu memberi A sama dengan 353, yang angkanya berjumlah 11.'),
  }
})

/** Q23 — place digits 0,1,2,3,4,5,7 in □□ + □ = □ × □ = □□; find the result. */
export const DigitEquationResult25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Guess the shared 2-digit result, then place the remaining digits.', 'Tebak hasil dua angka bersama, lalu pasang angka sisa.'),
    items: [
      { text: t('All three parts equal the same 2-digit result, using 2 of the 7 digits', 'Ketiga bagian sama dengan hasil dua angka yang sama, memakai 2 dari 7 angka'), ok: null },
      { text: t('Try result 20 (digits 2, 0): then 4 × 5 = 20 uses 4 and 5', 'Coba hasil 20 (angka 2, 0): lalu 4 × 5 = 20 memakai 4 dan 5'), ok: null },
      { text: t('Don’t try 12 = 3 × 4 — the leftover digits can’t make □□ + □ = 12 without reuse', 'Jangan coba 12 = 3 × 4 — angka sisa tak bisa membuat □□ + □ = 12 tanpa diulang'), ok: false },
      { text: t('Leftover 1, 3, 7 make 13 + 7 = 20, so every digit is used once', 'Sisa 1, 3, 7 membentuk 13 + 7 = 20, jadi setiap angka dipakai sekali'), ok: true },
    ],
    final: t('The result of the equation is 20 (C).', 'Nilai persamaan ini adalah 20 (C).'),
    aria: t('With 4 times 5 and 13 plus 7 both making 20, the equation result is 20.', 'Dengan 4 kali 5 dan 13 tambah 7 sama-sama 20, hasil persamaannya 20.'),
  }
})

/** Q24 — 3×3 grid clues for 5 and 6; minimum neighbour-sum for 7. */
export const GridNeighbourMin25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Place to satisfy the two clues, then put 7 where its neighbours are smallest.', 'Tempatkan untuk memenuhi dua petunjuk, lalu letakkan 7 di tetangga terkecil.'),
    items: [
      { text: t('Fill 4–9 so 5’s neighbours add to 10 and 6’s neighbours add to 12', 'Isi 4–9 agar tetangga 5 berjumlah 10 dan tetangga 6 berjumlah 12'), ok: null },
      { text: t('A cell’s spot fixes its neighbour count: centre 4, edge 3, corner 2', 'Letak sel menentukan banyak tetangganya: tengah 4, tepi 3, pojok 2'), ok: null },
      { text: t('Don’t answer 14 — it ignores the two clues that lock the layout', 'Jangan menjawab 14 — itu mengabaikan dua petunjuk yang mengunci tata letak'), ok: false },
      { text: t('Among valid grids, the smallest neighbour-sum 7 can reach is 23', 'Di antara kisi yang sah, jumlah tetangga 7 terkecil yang dapat dicapai 23'), ok: true },
    ],
    final: t('The minimum neighbour-sum for 7 is 23 (B).', 'Jumlah tetangga minimum untuk 7 adalah 23 (B).'),
    aria: t('Once 5 and 6 obey their clues, the smallest neighbour-sum 7 can reach is 23.', 'Setelah 5 dan 6 menaati petunjuknya, jumlah tetangga terkecil 7 adalah 23.'),
  }
})

/** Q25 — fewest pair-moves to turn 5 4 3 2 1 into 1 2 3 4 5. */
export const PairMovesMin25P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Plan the pair-slides so each move places more cards in order.', 'Rencanakan geseran pasangan agar tiap perpindahan menempatkan kartu berurutan.'),
    items: [
      { text: t('Each move relocates 2 adjacent cards together, keeping their order', 'Tiap perpindahan memindahkan 2 kartu berdampingan bersama, menjaga urutan'), ok: null },
      { text: t('Slide the right pairs to rebuild 1 2 3 4 5 from 5 4 3 2 1', 'Geser pasangan yang tepat untuk menyusun 1 2 3 4 5 dari 5 4 3 2 1'), ok: null },
      { text: t('Don’t move one card at a time (that needs 6) — moving 2 together is faster', 'Jangan memindah satu kartu tiap kali (perlu 6) — memindah 2 bersama lebih cepat'), ok: false },
      { text: t('Carefully chosen, just 3 pair-moves finish the reordering', 'Dengan pilihan cermat, hanya 3 perpindahan pasangan menyelesaikannya'), ok: true },
    ],
    final: t('The minimum number of moves is 3 (A).', 'Banyaknya perpindahan minimum adalah 3 (A).'),
    aria: t('Moving 2 adjacent cards at a time, three moves turn 5 4 3 2 1 into 1 2 3 4 5.', 'Memindahkan 2 kartu berdampingan tiap kali, tiga perpindahan mengubah 5 4 3 2 1 menjadi 1 2 3 4 5.'),
  }
})
