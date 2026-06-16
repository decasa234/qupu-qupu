import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-20F3A (2020 Grade 3 Final) — deduction-chain explainers for the
// questions whose reasoning is a short list of checked facts. Every answer is
// derived on screen; ✗ rows show the failed tries when the method is
// elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 456 − 89 + 321, left to right. */
export const ComputeChain20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one operation at a time.', 'Kerjakan dari kiri ke kanan, satu operasi tiap langkah.'),
    items: [
      { text: t('456 − 89: take 90, give back 1 → 366 + 1 = 367', '456 − 89: kurangi 90, kembalikan 1 → 366 + 1 = 367'), ok: null },
      { text: '367 + 321 = 688', ok: true },
    ],
    final: t('456 − 89 + 321 = 688 (B).', '456 − 89 + 321 = 688 (B).'),
    aria: t('Subtracting 89 gives 367, adding 321 gives 688.', 'Mengurangi 89 memberi 367, menambah 321 memberi 688.'),
  }
})

/** Q3 — which product is under 300? Compute all four. */
export const UnderThreeHundred20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The box must hold something LESS than 300 — work out every choice.', 'Kotaknya harus berisi yang KURANG dari 300 — hitung setiap pilihan.'),
    items: [
      { text: t('77 × 4 = 308 — over 300', '77 × 4 = 308 — lebih dari 300'), ok: false },
      { text: t('43 × 8 = 344 — over 300', '43 × 8 = 344 — lebih dari 300'), ok: false },
      { text: t('51 × 6 = 306 — barely over!', '51 × 6 = 306 — sedikit lewat!'), ok: false },
      { text: t('33 × 9 = 297 — under 300', '33 × 9 = 297 — kurang dari 300'), ok: true },
    ],
    final: t('Only 33 × 9 = 297 fits the box (D).', 'Hanya 33 × 9 = 297 yang muat di kotak (D).'),
    aria: t('Checking each product, only 33 times 9 equals 297 which is below 300.', 'Memeriksa tiap hasil kali, hanya 33 kali 9 sama dengan 297 yang di bawah 300.'),
  }
})

/** Q4 — smallest fraction: simplify, then compare. */
export const SmallestFraction20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Simplify each fraction first — two of them are in disguise.', 'Sederhanakan tiap pecahan dulu — dua di antaranya menyamar.'),
    items: [
      { text: t('12/27 = 4/9 (divide top and bottom by 3) — a twin of 4/9!', '12/27 = 4/9 (bagi atas dan bawah dengan 3) — kembaran 4/9!'), ok: null },
      { text: t('3/9 = 1/3 = 3/9 in ninths — compare: 3/9 < 4/9', '3/9 = 1/3 — bandingkan: 3/9 < 4/9'), ok: null },
      { text: t('4/5 is more than half — far bigger than 4/9', '4/5 lebih dari setengah — jauh lebih besar dari 4/9'), ok: false },
      { text: t('3/9 is below both 4/9 twins and below 4/5', '3/9 di bawah kedua kembaran 4/9 dan di bawah 4/5'), ok: true },
    ],
    final: t('The smallest fraction is 3/9 (D).', 'Pecahan terkecil adalah 3/9 (D).'),
    aria: t('After simplifying, three ninths is the smallest fraction.', 'Setelah disederhanakan, tiga persembilan adalah pecahan terkecil.'),
  }
})

/** Q6 — five successive odd numbers summing 745. */
export const OddRun20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Five evenly spaced numbers balance around the middle one.', 'Lima bilangan berjarak sama seimbang di sekitar bilangan tengah.'),
    items: [
      { text: t('Middle number = 745 ÷ 5 = 149', 'Bilangan tengah = 745 ÷ 5 = 149'), ok: null },
      { text: t('Odd neighbours step by 2: 145, 147, 149, 151, 153', 'Tetangga ganjil melompat 2: 145, 147, 149, 151, 153'), ok: null },
      { text: t('Check: 145 + 147 + 149 + 151 + 153 = 745 ✓', 'Cek: 145 + 147 + 149 + 151 + 153 = 745 ✓'), ok: null },
      { text: t('Largest = 149 + 4 = 153', 'Terbesar = 149 + 4 = 153'), ok: true },
    ],
    final: t('The largest odd number is 153 (C).', 'Bilangan ganjil terbesar adalah 153 (C).'),
    aria: t('The middle is 149, so the largest of the five odd numbers is 153.', 'Tengahnya 149, jadi yang terbesar dari lima bilangan ganjil itu 153.'),
  }
})

/** Q9 — 7:42 + 35 minutes, bridging the o'clock. */
export const ClockBridge20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Split the 35 minutes at 8:00 — the o’clock is a stepping stone.', 'Pecah 35 menit di pukul 08.00 — jam tepat jadi batu loncatan.'),
    items: [
      { text: t('7:42 → 8:00 takes 60 − 42 = 18 minutes', '07.42 → 08.00 butuh 60 − 42 = 18 menit'), ok: null },
      { text: t('Minutes left: 35 − 18 = 17', 'Sisa menit: 35 − 18 = 17'), ok: null },
      { text: t('8:00 + 17 minutes = 8:17', '08.00 + 17 menit = 08.17'), ok: true },
    ],
    final: t('Vivian arrives at 8:17 (C).', 'Vivian tiba pukul 08.17 (C).'),
    aria: t('Eighteen minutes reach eight o’clock, seventeen more give eight seventeen.', 'Delapan belas menit sampai pukul delapan, tujuh belas lagi memberi delapan tujuh belas.'),
  }
})

/** Q10 — square with the rectangle's perimeter. */
export const PerimeterSquare20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The bridge between the two shapes is the PERIMETER.', 'Jembatan antara dua bangun itu adalah KELILING.'),
    items: [
      { text: t('Rectangle perimeter: (13 + 7) × 2 = 40 cm', 'Keliling persegi panjang: (13 + 7) × 2 = 40 cm'), ok: null },
      { text: t('Square side: 40 ÷ 4 = 10 cm', 'Sisi persegi: 40 ÷ 4 = 10 cm'), ok: null },
      { text: t('Square area: 10 × 10 = 100 cm²', 'Luas persegi: 10 × 10 = 100 cm²'), ok: true },
    ],
    final: t('The square’s area is 100 cm² (B).', 'Luas perseginya 100 cm² (B).'),
    aria: t('Perimeter forty, side ten, area one hundred.', 'Keliling empat puluh, sisi sepuluh, luas seratus.'),
  }
})

/** Q11 — which equation is wrong? Compute both sides of each. */
export const WhichWrong20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute BOTH sides of every equation — remember × before +.', 'Hitung KEDUA ruas tiap persamaan — ingat × sebelum +.'),
    items: [
      { text: t('A: 6×9 = 54 and 9×6 = 54 — true (swap the factors)', 'A: 6×9 = 54 dan 9×6 = 54 — benar (faktor ditukar)'), ok: null },
      { text: t('B: (4×8)×2 = 64 and 4×(8×2) = 64 — true (regroup)', 'B: (4×8)×2 = 64 dan 4×(8×2) = 64 — benar (kelompok ulang)'), ok: null },
      { text: t('D: 20 − 5 = 15 and 5×3 = 15 — true (distribute)', 'D: 20 − 5 = 15 dan 5×3 = 15 — benar (distributif)'), ok: null },
      { text: t('C: 1 + 4×3 = 1 + 12 = 13, NOT 15', 'C: 1 + 4×3 = 1 + 12 = 13, BUKAN 15'), ok: true },
    ],
    final: t('C is the wrong one — multiplication comes first: 1 + 12 = 13 (C).', 'C yang salah — perkalian dulu: 1 + 12 = 13 (C).'),
    aria: t('Equations A, B and D hold; C gives thirteen, not fifteen.', 'Persamaan A, B, dan D benar; C menghasilkan tiga belas, bukan lima belas.'),
  }
})

/** Q12 — □ ÷ □ = □ from the list: the quotient must be listed too. */
export const DivisionList20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All three boxes — including the answer — must use listed numbers.', 'Ketiga kotak — termasuk hasilnya — harus memakai bilangan dari daftar.'),
    items: [
      { text: t('54 ÷ 6 = 9 — but 9 is not on the list', '54 ÷ 6 = 9 — tapi 9 tidak ada di daftar'), ok: false },
      { text: t('72 ÷ 8 = 9 — 9 again, not listed', '72 ÷ 8 = 9 — 9 lagi, tak ada di daftar'), ok: false },
      { text: t('91 ÷ 7 = 13 — 13 is not on the list', '91 ÷ 7 = 13 — 13 tidak ada di daftar'), ok: false },
      { text: t('48 ÷ 6 = 8 — 48, 6 AND 8 are all listed!', '48 ÷ 6 = 8 — 48, 6, DAN 8 semua ada di daftar!'), ok: true },
    ],
    final: t('48 ÷ 6 = 8 works, so 48 is used (C).', '48 ÷ 6 = 8 berhasil, jadi 48 yang terpakai (C).'),
    aria: t('Only forty-eight divided by six equals eight uses listed numbers throughout.', 'Hanya empat puluh delapan dibagi enam sama dengan delapan yang seluruhnya memakai bilangan dari daftar.'),
  }
})

/** Q15 — greedy smallest 5-digit subsequence of 7503375812. */
export const GreedyDigits20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep 5 of 7 5 0 3 3 7 5 8 1 2 in order. Pick each digit greedily — smallest allowed, never 0 first.', 'Sisakan 5 dari 7 5 0 3 3 7 5 8 1 2 secara berurutan. Pilih serakah — terkecil yang boleh, tak boleh 0 di depan.'),
    items: [
      { text: t('1st digit: 0 would lead — not allowed. Smallest non-zero early enough: 3 (4th digit)', 'Angka ke-1: 0 di depan — tak boleh. Bukan-nol terkecil yang cukup awal: 3 (angka ke-4)'), ok: null },
      { text: t('2nd digit: from 3 7 5 8 1 2, must leave 3 behind → pick 3', 'Angka ke-2: dari 3 7 5 8 1 2, harus menyisakan 3 → pilih 3'), ok: null },
      { text: t('3rd digit: from 7 5 8 1 2, must leave 2 behind → pick 5', 'Angka ke-3: dari 7 5 8 1 2, harus menyisakan 2 → pilih 5'), ok: null },
      { text: t('4th and 5th: 1 then 2 → the number is 33512', 'Angka ke-4 dan ke-5: 1 lalu 2 → bilangannya 33512'), ok: null },
      { text: t('Middle three digits: 3 + 5 + 1 = 9', 'Tiga angka tengah: 3 + 5 + 1 = 9'), ok: true },
    ],
    final: t('Minimum number 33512 → middle digits sum to 9 (B).', 'Bilangan terkecil 33512 → jumlah angka tengah 9 (B).'),
    aria: t('Greedy picking yields three three five one two, whose middle digits sum to nine.', 'Pemilihan serakah memberi tiga tiga lima satu dua, jumlah angka tengahnya sembilan.'),
  }
})

/** Q16 — six 99s and three 9s via round-and-fix. */
export const NinetyNines20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Every 99 is 100 − 1 and every 9 is 10 − 1 — round up, then give back.', 'Setiap 99 itu 100 − 1 dan setiap 9 itu 10 − 1 — bulatkan, lalu kembalikan.'),
    items: [
      { text: t('Six 99s: 6 × 100 − 6 = 600 − 6 = 594', 'Enam 99: 6 × 100 − 6 = 600 − 6 = 594'), ok: null },
      { text: t('Three 9s: 3 × 10 − 3 = 30 − 3 = 27', 'Tiga 9: 3 × 10 − 3 = 30 − 3 = 27'), ok: null },
      { text: '594 + 27 = 621', ok: true },
    ],
    final: t('The sum is 621.', 'Jumlahnya 621.'),
    aria: t('Six ninety-nines make five hundred ninety-four, plus twenty-seven gives six hundred twenty-one.', 'Enam sembilan puluh sembilan menjadi lima ratus sembilan puluh empat, plus dua puluh tujuh memberi enam ratus dua puluh satu.'),
  }
})

/** Q18 — two digit errors shift the subtraction result. */
export const DigitErrors20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Track what each 1 → 7 slip does to the answer of minuend − subtrahend.', 'Lacak akibat tiap salah tulis 1 → 7 pada hasil (yang dikurangi − pengurang).'),
    items: [
      { text: t('Minuend tens 1→7: minuend grew by 60 → answer UP 60', 'Puluhan yang dikurangi 1→7: bertambah 60 → hasil NAIK 60'), ok: null },
      { text: t('Subtrahend units 1→7: subtrahend grew by 6 → answer DOWN 6', 'Satuan pengurang 1→7: bertambah 6 → hasil TURUN 6'), ok: null },
      { text: t('Net shift: +60 − 6 = +54, so 380 is 54 too big', 'Pergeseran bersih: +60 − 6 = +54, jadi 380 kelebihan 54'), ok: null },
      { text: t('Original answer: 380 − 54 = 326', 'Jawaban asli: 380 − 54 = 326'), ok: true },
    ],
    final: t('The original answer is 326.', 'Jawaban aslinya 326.'),
    aria: t('The errors inflate the result by fifty-four, so the original is three hundred twenty-six.', 'Kesalahan itu menggelembungkan hasil sebesar lima puluh empat, jadi aslinya tiga ratus dua puluh enam.'),
  }
})

/** Q19 — △1□ × 5 = ☆□☆ cryptarithm, then 15 × 59. */
export const Cryptarithm20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('☆□☆ has 3 digits, so △1□ × 5 < 1000 → △ = 1, and 11□ × 5 = 5__ → ☆ = 5.', '☆□☆ punya 3 angka, jadi △1□ × 5 < 1000 → △ = 1, dan 11□ × 5 = 5__ → ☆ = 5.'),
    items: [
      { text: t('Result ends in ☆ = 5, so 5 × □ ends in 5 → □ is odd', 'Hasil berakhiran ☆ = 5, jadi 5 × □ berakhiran 5 → □ ganjil'), ok: null },
      { text: t('111 × 5 = 555 — middle 5, but □ = 1', '111 × 5 = 555 — tengah 5, padahal □ = 1'), ok: false },
      { text: t('113 × 5 = 565 — middle 6, but □ = 3', '113 × 5 = 565 — tengah 6, padahal □ = 3'), ok: false },
      { text: t('115 × 5 = 575 — middle 7, but □ = 5', '115 × 5 = 575 — tengah 7, padahal □ = 5'), ok: false },
      { text: t('117 × 5 = 585 — middle 8, but □ = 7', '117 × 5 = 585 — tengah 8, padahal □ = 7'), ok: false },
      { text: t('119 × 5 = 595 — middle 9 = □ ✓ shapes agree!', '119 × 5 = 595 — tengah 9 = □ ✓ semua bentuk cocok!'), ok: true },
      { text: t('So △=1, ☆=5, □=9: △☆ × ☆□ = 15 × 59 = 885', 'Jadi △=1, ☆=5, □=9: △☆ × ☆□ = 15 × 59 = 885'), ok: true },
    ],
    final: t('15 × 59 = 885.', '15 × 59 = 885.'),
    aria: t('Testing odd units digits, one hundred nineteen times five equals five ninety-five, so fifteen times fifty-nine is eight hundred eighty-five.', 'Menguji angka satuan ganjil, seratus sembilan belas kali lima sama dengan lima ratus sembilan puluh lima, jadi lima belas kali lima puluh sembilan adalah delapan ratus delapan puluh lima.'),
  }
})

/** Q24 — decode the figure password 79536 → 25108. */
export const PasswordFigures20G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each printed figure hides a digit. Let the four clues force them one by one.', 'Setiap lambang menyembunyikan satu angka. Biarkan empat petunjuk memaksanya satu per satu.'),
    items: [
      { text: t('⑤×⑤=⑤ (one digit): only 0 or 1 square to themselves', '⑤×⑤=⑤ (satu angka): hanya 0 atau 1 yang kuadratnya dirinya'), ok: null },
      { text: t('If ⑤ = 0, the last clue would make 0 = something — broken. So ⑤ = 1', 'Jika ⑤ = 0, petunjuk terakhir rusak. Jadi ⑤ = 1'), ok: null },
      { text: t('⑦×⑦×⑦=⑥ (one digit): 2×2×2 = 8 → ⑦ = 2, ⑥ = 8', '⑦×⑦×⑦=⑥ (satu angka): 2×2×2 = 8 → ⑦ = 2, ⑥ = 8'), ok: null },
      { text: t('③×⑦=③ means ③ × 2 = ③ → ③ = 0', '③×⑦=③ berarti ③ × 2 = ③ → ③ = 0'), ok: null },
      { text: t('(③+⑦+⑤)×⑨ = ⑤⑨: (0+2+1)×⑨ = 10+⑨ → 3⑨ = 10+⑨ → ⑨ = 5', '(③+⑦+⑤)×⑨ = ⑤⑨: (0+2+1)×⑨ = 10+⑨ → 3⑨ = 10+⑨ → ⑨ = 5'), ok: null },
      { text: t('Decode 7 9 5 3 6 → 2 5 1 0 8', 'Pecahkan 7 9 5 3 6 → 2 5 1 0 8'), ok: true },
    ],
    final: t('The password is 25108.', 'Kata sandinya 25108.'),
    aria: t('The clues force the figures to two, five, one, zero, eight.', 'Petunjuk memaksa lambang menjadi dua, lima, satu, nol, delapan.'),
  }
})

/** Q25 — three 3-digit numbers + one digit = 999, minimise the largest. */
export const SumTo999G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('999 needs each column to land on 9. Use the digits 0–9 once each (6 is already a tens digit).', '999 butuh tiap kolom mendarat di 9. Pakai angka 0–9 sekali (6 sudah jadi angka puluhan).'),
    items: [
      { text: t('No carrying into a 4th digit → the three hundreds digits sum to 9', 'Tak ada simpanan ke angka keempat → tiga angka ratusan berjumlah 9'), ok: null },
      { text: t('Smallest balanced choice: hundreds {2, 3, 4} — the largest number starts with 4', 'Pilihan seimbang terkecil: ratusan {2, 3, 4} — bilangan terbesar berawalan 4'), ok: null },
      { text: t('Column sums then force the two free tens digits to total 1 → they are 0 and 1', 'Jumlah kolom lalu memaksa dua puluhan bebas bertotal 1 → yaitu 0 dan 1'), ok: null },
      { text: t('Give the 0 to the 4-number: 40□, and the smallest free unit 5 → 405', 'Berikan 0 ke bilangan 4-ratusan: 40□, dan satuan bebas terkecil 5 → 405'), ok: null },
      { text: t('Check: 405 + 217 + 368 + 9 = 999, all ten digits used once', 'Cek: 405 + 217 + 368 + 9 = 999, sepuluh angka terpakai sekali'), ok: true },
    ],
    final: t('The smallest possible largest number is 405.', 'Bilangan terbesar yang sekecil mungkin adalah 405.'),
    aria: t('Hundreds two three four, tens zero one six, gives four hundred five as the minimal largest number.', 'Ratusan dua tiga empat, puluhan nol satu enam, memberi empat ratus lima sebagai bilangan terbesar minimal.'),
  }
})
