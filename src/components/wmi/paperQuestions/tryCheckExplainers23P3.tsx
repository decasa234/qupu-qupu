import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-23P3A (2023 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 5925 − 4447 by subtracting the round part first. */
export const SubtractRoundFirst23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract the round part first, then take away the rest.', 'Kurangi bagian bulat dulu, lalu kurangi sisanya.'),
    items: [
      { text: t('Split it: 5925 − 4447 = 5925 − 4400 − 47', 'Pecah saja: 5925 − 4447 = 5925 − 4400 − 47'), ok: null },
      { text: '5925 − 4400 = 1525', ok: null },
      { text: t('Don’t skip the borrow: column-by-column without borrowing gives 1522', 'Jangan lupa meminjam: kurang per kolom tanpa meminjam memberi 1522'), ok: false },
      { text: '1525 − 47 = 1478', ok: true },
    ],
    final: t('5925 − 4447 = 1478 (C).', '5925 − 4447 = 1478 (C).'),
    aria: t('Subtracting 4400 then 47, 5925 minus 4447 is 1478.', 'Mengurangi 4400 lalu 47, 5925 dikurangi 4447 adalah 1478.'),
  }
})

/** Q2 — which sum lands strictly between 700 and 750. */
export const SumInRange23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add each pair and keep the one strictly between 700 and 750.', 'Hitung tiap pasang dan pilih yang tepat antara 700 dan 750.'),
    items: [
      { text: t('A: 488 + 141 = 629 (too small). C: 175 + 607 = 782 (too big)', 'A: 488 + 141 = 629 (terlalu kecil). C: 175 + 607 = 782 (terlalu besar)'), ok: false },
      { text: t('D: 463 + 291 = 754 — looks close but just over 750', 'D: 463 + 291 = 754 — kelihatan dekat tapi sedikit di atas 750'), ok: false },
      { text: 'B: 376 + 339 = 715', ok: null },
      { text: t('715 is between 700 and 750', '715 berada di antara 700 dan 750'), ok: true },
    ],
    final: t('376 + 339 = 715 fits (B).', '376 + 339 = 715 cocok (B).'),
    aria: t('Only 376 plus 339 equals 715, which sits between 700 and 750.', 'Hanya 376 ditambah 339 sama dengan 715, yang berada di antara 700 dan 750.'),
  }
})

/** Q3 — tens digit 8 and units 5 less, so the number ends in 83. */
export const DigitEndsIn83_23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build the last two digits, then match a choice.', 'Bentuk dua angka terakhir, lalu cocokkan pilihan.'),
    items: [
      { text: t('Tens digit is 8 and units = 8 − 5 = 3, so the number ends in 83', 'Angka puluhan 8 dan satuan = 8 − 5 = 3, jadi bilangan berakhiran 83'), ok: null },
      { text: t('8853 has an 8, but in the thousands place — its tens digit is 5, not 8', '8853 punya 8, tapi di tempat ribuan — angka puluhannya 5, bukan 8'), ok: false },
      { text: t('385 ends 85, 138 ends 38 — neither ends in 83', '385 berakhir 85, 138 berakhir 38 — tak ada yang berakhir 83'), ok: false },
      { text: t('2283 ends in 83', '2283 berakhir 83'), ok: true },
    ],
    final: t('2283 fits the rule (D).', '2283 memenuhi syarat (D).'),
    aria: t('Tens digit eight and units three means the number ends in 83, which is 2283.', 'Angka puluhan delapan dan satuan tiga berarti bilangan berakhiran 83, yaitu 2283.'),
  }
})

/** Q6 — 3 packs × 4 bottles × 1050 ml each. */
export const JuiceVolume23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Convert units, count the bottles, then multiply.', 'Ubah satuan, hitung botol, lalu kalikan.'),
    items: [
      { text: t('One bottle: 1 L 50 ml = 1000 + 50 = 1050 ml', 'Satu botol: 1 L 50 ml = 1000 + 50 = 1050 ml'), ok: null },
      { text: t('Bottles: 3 packs × 4 = 12 bottles', 'Botol: 3 kemasan × 4 = 12 botol'), ok: null },
      { text: t('Don’t read 1 L 50 ml as 1500 ml: 12 × 1500 = 18000 is wrong', 'Jangan baca 1 L 50 ml sebagai 1500 ml: 12 × 1500 = 18000 salah'), ok: false },
      { text: '12 × 1050 = 12600', ok: true },
    ],
    final: t('Mom bought 12600 ml (D).', 'Ibu membeli 12600 ml (D).'),
    aria: t('Twelve bottles of 1050 millilitres each total 12600 millilitres.', 'Dua belas botol masing-masing 1050 mililiter berjumlah 12600 mililiter.'),
  }
})

/** Q7 — split the cake 3 ways, subtract Jessie's share from 185. */
export const CakeShare23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Divide the cost, then subtract from what Jessie had.', 'Bagi biayanya, lalu kurangkan dari uang Jessie.'),
    items: [
      { text: t('Each pays 450 ÷ 3 = 150 dollars', 'Tiap orang membayar 450 ÷ 3 = 150 dolar'), ok: null },
      { text: t('Don’t miscompute the share as 135 — that wrongly leaves 45', 'Jangan keliru menghitung bagian sebagai 135 — itu keliru menyisakan 45'), ok: false },
      { text: '185 − 150 = 35', ok: null },
      { text: t('35 dollars left', 'sisa 35 dolar'), ok: true },
    ],
    final: t('Jessie has 35 dollars left (C).', 'Sisa uang Jessie 35 dolar (C).'),
    aria: t('Each pays 150 of the 450 cake, so Jessie keeps 185 minus 150, which is 35.', 'Tiap orang membayar 150 dari kue 450, jadi Jessie menyisakan 185 dikurangi 150, yaitu 35.'),
  }
})

/** Q10 — add fractions with the same denominator. */
export const AddEighths23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Same denominator — just add the top numbers.', 'Penyebut sama — cukup jumlahkan angka atas.'),
    items: [
      { text: t('Both are in eighths, so add the numerators', 'Keduanya dalam perdelapanan, jadi jumlahkan pembilang'), ok: null },
      { text: t('Don’t multiply 2 × 3 = 6/8 — the shares are added, not multiplied', 'Jangan mengalikan 2 × 3 = 6/8 — bagiannya dijumlahkan, bukan dikalikan'), ok: false },
      { text: '2/8 + 3/8 = (2 + 3)/8 = 5/8', ok: null },
      { text: t('Together they eat 5/8 of a box', 'Bersama mereka makan 5/8 kotak'), ok: true },
    ],
    final: t('2/8 + 3/8 = 5/8 (C).', '2/8 + 3/8 = 5/8 (C).'),
    aria: t('Adding two-eighths and three-eighths gives five-eighths.', 'Menjumlahkan dua-perdelapan dan tiga-perdelapan menghasilkan lima-perdelapan.'),
  }
})

/** Q11 — cryptarithm 1234 + 286□; sum of the four boxes. */
export const CryptarithmBoxes23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the units column to find the missing digit, then add all four boxes.', 'Gunakan kolom satuan untuk angka yang hilang, lalu jumlahkan keempat kotak.'),
    items: [
      { text: t('The result ends in 2, and 4 + 8 = 12 ends in 2, so the bottom box is 8', 'Hasilnya berakhir 2, dan 4 + 8 = 12 berakhir 2, jadi kotak bawahnya 8'), ok: null },
      { text: t('Add: 1234 + 2868 = 4102, so the result boxes are 4, 1, 0', 'Jumlahkan: 1234 + 2868 = 4102, jadi kotak hasilnya 4, 1, 0'), ok: null },
      { text: t('Don’t drop the 0 box: forgetting it gives only 12', 'Jangan lupa kotak 0: melupakannya hanya memberi 12'), ok: false },
      { text: '8 + 4 + 1 + 0 = 13', ok: true },
    ],
    final: t('The four boxes sum to 13 (A).', 'Keempat kotak berjumlah 13 (A).'),
    aria: t('The bottom box is 8 and the result boxes 4, 1, 0, summing to 13.', 'Kotak bawah 8 dan kotak hasil 4, 1, 0, berjumlah 13.'),
  }
})

/** Q12 — pack good apples in 8s, drop the remainder. */
export const AppleBoxes23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract the rotten ones, then divide and drop the remainder.', 'Kurangi yang busuk, lalu bagi dan buang sisanya.'),
    items: [
      { text: t('Good apples: 367 − 40 = 327', 'Apel bagus: 367 − 40 = 327'), ok: null },
      { text: '327 ÷ 8 = 40, remainder 7', ok: null },
      { text: t('Don’t round the leftover 7 up into an extra box — 7 can’t fill a box of 8, so it isn’t 41', 'Jangan membulatkan 7 sisa jadi kotak tambahan — 7 tak cukup mengisi kotak isi 8, jadi bukan 41'), ok: false },
      { text: t('At most 40 full boxes', 'Paling banyak 40 kotak penuh'), ok: true },
    ],
    final: t('40 boxes can be sold (B).', '40 kotak dapat dijual (B).'),
    aria: t('327 good apples make 40 full boxes of 8 with 7 left over.', '327 apel bagus menjadi 40 kotak penuh isi 8 dengan sisa 7.'),
  }
})

/** Q13 — count 100 minutes back from 8:50. */
export const WakeUpTime23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add up all the minutes, then count back from the deadline.', 'Jumlahkan semua menit, lalu hitung mundur dari batas waktu.'),
    items: [
      { text: t('Total time: 45 + 20 + 35 = 100 minutes = 1 h 40 min', 'Total waktu: 45 + 20 + 35 = 100 menit = 1 j 40 mnt'), ok: null },
      { text: t('Don’t count back only 1 h 20 min — that lands on 7:30', 'Jangan hitung mundur hanya 1 j 20 mnt — itu jatuh di 7:30'), ok: false },
      { text: t('8:50 − 1 hour = 7:50, then − 40 min = 7:10', '8:50 − 1 jam = 7:50, lalu − 40 menit = 7:10'), ok: null },
      { text: t('Get up by 7:10 at the latest', 'Bangun paling lambat pukul 7:10'), ok: true },
    ],
    final: t('Walker must get up by 7:10 (C).', 'Walker harus bangun pukul 7:10 (C).'),
    aria: t('100 minutes of prep counted back from 8:50 is 7:10.', '100 menit persiapan dihitung mundur dari 8:50 adalah 7:10.'),
  }
})

/** Q15 — pick the line chart matching 5, 2, 5, 0. */
export const LineChartMatch23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Match every data point; reject a chart on its first wrong value.', 'Cocokkan tiap titik data; tolak diagram begitu satu nilainya salah.'),
    items: [
      { text: t('The table reads Spring 5, Summer 2, Autumn 5, Winter 0', 'Tabel membaca Semi 5, Panas 2, Gugur 5, Dingin 0'), ok: null },
      { text: t('C swaps Summer and Autumn (5, 5, 2, 0) — wrong', 'C menukar Panas dan Gugur (5, 5, 2, 0) — salah'), ok: false },
      { text: t('B says Winter 2 and D says Winter 5 — one wrong point fails the whole chart', 'B menulis Dingin 2 dan D menulis Dingin 5 — satu titik salah menggugurkan seluruh diagram'), ok: false },
      { text: t('A reads 5, 2, 5, 0 exactly', 'A membaca 5, 2, 5, 0 persis'), ok: true },
    ],
    final: t('Chart A matches the table (A).', 'Diagram A cocok dengan tabel (A).'),
    aria: t('Only chart A shows Spring 5, Summer 2, Autumn 5, Winter 0.', 'Hanya diagram A yang menunjukkan Semi 5, Panas 2, Gugur 5, Dingin 0.'),
  }
})

/** Q17 — largest minus smallest 4-digit number from the cards. */
export const LargestMinusSmallest23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Build the biggest and smallest numbers, mind the leading-zero rule, then subtract.', 'Bentuk bilangan terbesar dan terkecil, perhatikan aturan tanpa awalan nol, lalu kurangkan.'),
    items: [
      { text: t('Largest: biggest digits first → 8653', 'Terbesar: angka besar dulu → 8653'), ok: null },
      { text: t('Don’t let 0 lead the smallest (0135) — a 4-digit number can’t start with 0, which wrongly gives 7628', 'Jangan biarkan 0 memimpin yang terkecil (0135) — bilangan 4 digit tak boleh diawali 0, yang keliru jadi 7628'), ok: false },
      { text: t('Smallest leads with 1: 1, 0, 3, 5 → 1035', 'Terkecil dipimpin 1: 1, 0, 3, 5 → 1035'), ok: null },
      { text: '8653 − 1035 = 7618', ok: true },
    ],
    final: t('The difference is 7618 (C).', 'Selisihnya 7618 (C).'),
    aria: t('Largest 8653 minus smallest 1035 is 7618.', 'Terbesar 8653 dikurangi terkecil 1035 adalah 7618.'),
  }
})

/** Q19 — colour-count chain, blue = 2 × red pins down red = 26. */
export const BallColourCount23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write each colour in terms of red, then solve for red.', 'Tulis tiap warna berdasarkan merah, lalu cari merah.'),
    items: [
      { text: t('Yellow = red + 12, and blue = yellow + 14 = red + 26', 'Kuning = merah + 12, dan biru = kuning + 14 = merah + 26'), ok: null },
      { text: t('Blue is also twice red, so red + 26 = 2 × red, giving red = 26', 'Biru juga dua kali merah, jadi merah + 26 = 2 × merah, sehingga merah = 26'), ok: null },
      { text: t('A wrong red value gives 112 instead — but blue = 2 × red forces red = 26', 'Nilai merah yang salah memberi 112 — tapi biru = 2 × merah memaksa merah = 26'), ok: false },
      { text: t('26 + 38 + 52 = 116', '26 + 38 + 52 = 116'), ok: true },
    ],
    final: t('There are 116 balls (D).', 'Ada 116 bola (D).'),
    aria: t('Red 26, yellow 38, blue 52 add to 116 balls.', 'Merah 26, kuning 38, biru 52 berjumlah 116 bola.'),
  }
})

/** Q20 — halve each perimeter, fit whole sides, digit sum of smallest x. */
export const RectanglePerimeter23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Halve each small perimeter, fit the grid with whole sides, then add the digits of the smallest big perimeter.', 'Bagi dua tiap keliling kecil, susun kisi dengan sisi bulat, lalu jumlahkan angka keliling besar terkecil.'),
    items: [
      { text: t('Half-perimeters (width + height): 10→5, 12→6, 16→8, 16→8', 'Setengah keliling (lebar + tinggi): 10→5, 12→6, 16→8, 16→8'), ok: null },
      { text: t('Fit them with whole-number sides as tightly as possible to minimise the big perimeter x', 'Susun dengan sisi bilangan bulat serapat mungkin untuk meminimalkan keliling besar x'), ok: null },
      { text: t('A loose layout gives a digit sum of 9 — but a tighter fit makes x smaller', 'Susunan longgar memberi jumlah angka 9 — tapi susunan lebih rapat membuat x lebih kecil'), ok: false },
      { text: t('The smallest x has digits summing to 7', 'Nilai x terkecil punya jumlah angka 7'), ok: true },
    ],
    final: t('The digit sum of x is 7 (B).', 'Jumlah angka x adalah 7 (B).'),
    aria: t('The tightest layout gives a smallest large perimeter whose digits sum to 7.', 'Susunan terapat memberi keliling besar terkecil yang jumlah angkanya 7.'),
  }
})

/** Q21 — takes cycle 1,2,3; take 100 grabs the 199th number. */
export const TakeAwayCycle23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group the takes into cycles of 6, count what is used, then take the next.', 'Kelompokkan pengambilan jadi siklus 6, hitung yang terpakai, lalu ambil berikutnya.'),
    items: [
      { text: t('The takes cycle 1, 2, 3 numbers, using 6 per cycle', 'Pengambilan berulang 1, 2, 3 bilangan, memakai 6 per siklus'), ok: null },
      { text: t('Takes 1–99 are 33 full cycles = 33 × 6 = 198 numbers used', 'Pengambilan 1–99 adalah 33 siklus penuh = 33 × 6 = 198 bilangan terpakai'), ok: null },
      { text: t('Take 100 starts a new cycle and grabs just 1 number — so it isn’t 200', 'Pengambilan ke-100 memulai siklus baru dan hanya mengambil 1 bilangan — jadi bukan 200'), ok: false },
      { text: t('It takes the next number, the 199th', 'Ia mengambil bilangan berikutnya, yang ke-199'), ok: true },
    ],
    final: t('Take 100 takes the number 199 (A).', 'Pengambilan ke-100 mengambil bilangan 199 (A).'),
    aria: t('After 198 numbers in 33 cycles, the 100th take grabs the 199th number.', 'Setelah 198 bilangan dalam 33 siklus, pengambilan ke-100 mengambil bilangan ke-199.'),
  }
})

/** Q22 — count 4-digit numbers fitting the five conditions. */
export const RiddleDigitCount23P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Force the 0 into a middle slot, match the equal-sum rule, then arrange.', 'Paksa 0 ke slot tengah, cocokkan aturan jumlah sama, lalu susun.'),
    items: [
      { text: t('Product 0 means one digit is 0; since middles are even and odds can’t be 0, the 0 sits in the middle', 'Hasil kali 0 berarti satu angka 0; karena tengah genap dan ganjil tak bisa 0, maka 0 di tengah'), ok: null },
      { text: t('Equal sums: 0 + even = odd + odd forces the even to be 8 and the odd pair {3, 5}', 'Jumlah sama: 0 + genap = ganjil + ganjil memaksa genap = 8 dan pasangan ganjil {3, 5}'), ok: null },
      { text: t('Don’t over-count arrangements that break the equal-sum rule — that wrongly gives 8', 'Jangan menghitung ganda susunan yang melanggar aturan jumlah sama — itu keliru jadi 8'), ok: false },
      { text: t('The set {3, 0, 8, 5} arranges into 3085, 3805, 5083, 5803 — 4 numbers', 'Himpunan {3, 0, 8, 5} disusun jadi 3085, 3805, 5083, 5803 — 4 bilangan'), ok: true },
    ],
    final: t('There are 4 correct answers (B).', 'Ada 4 jawaban benar (B).'),
    aria: t('Only the digits 3, 0, 8, 5 fit, giving exactly four valid numbers.', 'Hanya angka 3, 0, 8, 5 yang cocok, menghasilkan tepat empat bilangan valid.'),
  }
})
