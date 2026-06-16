import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-20P3A (2020 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination, and the keyed trap is woven in.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 937 − 459 − 27 one step at a time. */
export const SubtractTwoSteps20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract one step at a time, left to right.', 'Kurangi satu langkah demi satu langkah, dari kiri ke kanan.'),
    items: [
      { text: '937 − 459 = 478', ok: null },
      { text: t('Don’t stop at 478 — you still have to take away the 27', 'Jangan berhenti di 478 — kamu masih harus mengurangi 27'), ok: false },
      { text: '478 − 27 = 451', ok: null },
      { text: '937 − 459 − 27 = 451', ok: true },
    ],
    final: t('937 − 459 − 27 = 451 (A).', '937 − 459 − 27 = 451 (A).'),
    aria: t('Subtracting 459 then 27 from 937 leaves 451.', 'Mengurangi 459 lalu 27 dari 937 menyisakan 451.'),
  }
})

/** Q2 — which fraction is largest, comparing each to one half. */
export const LargestFraction20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare each fraction to one half (1/2).', 'Bandingkan setiap pecahan dengan setengah (1/2).'),
    items: [
      { text: t('2/5 and 4/9 are each less than half — too small', '2/5 dan 4/9 masing-masing kurang dari setengah — terlalu kecil'), ok: false },
      { text: t('1/2 looks big, but 2/3 is even bigger than a half', '1/2 terlihat besar, tetapi 2/3 lebih besar dari setengah'), ok: false },
      { text: t('2/3 is more than half, and it beats 1/2 itself', '2/3 lebih dari setengah, dan mengalahkan 1/2 sendiri'), ok: null },
      { text: t('2/3 is the largest fraction', '2/3 adalah pecahan terbesar'), ok: true },
    ],
    final: t('The largest fraction is 2/3 (B).', 'Pecahan terbesar adalah 2/3 (B).'),
    aria: t('Comparing each fraction to one half, two thirds is the largest.', 'Membandingkan setiap pecahan dengan setengah, dua per tiga paling besar.'),
  }
})

/** Q3 — how many of the eight numbers are divisible by 4. */
export const DivisibleByFour20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Check divisibility by 4 one number at a time — no remainder allowed.', 'Periksa keterbagian oleh 4 satu bilangan demi satu — tidak boleh bersisa.'),
    items: [
      { text: t('80, 52, 56, 68, 76 all split evenly into fours', '80, 52, 56, 68, 76 semua terbagi rata oleh 4'), ok: null },
      { text: t('35 and 37 are odd, so they fail', '35 dan 37 ganjil, jadi gagal'), ok: false },
      { text: t('94 is even but 94 / 4 = 23 remainder 2, so it does not count', '94 genap tetapi 94 / 4 = 23 sisa 2, jadi tidak dihitung'), ok: false },
      { text: t('That leaves 5 numbers divisible by 4', 'Tersisa 5 bilangan yang habis dibagi 4'), ok: true },
    ],
    final: t('5 numbers are divisible by 4 (C).', '5 bilangan habis dibagi 4 (C).'),
    aria: t('Five of the eight numbers divide evenly by four.', 'Lima dari delapan bilangan habis dibagi empat.'),
  }
})

/** Q7 — chain the lamb-to-chicken and elephant-to-lamb ratios. */
export const RatioChain20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Chain the ratios by multiplying.', 'Rangkai perbandingan dengan mengalikan.'),
    items: [
      { text: t('1 lamb weighs the same as 6 chickens', '1 domba seberat 6 ayam'), ok: null },
      { text: t('1 elephant weighs 13 lambs', '1 gajah seberat 13 domba'), ok: null },
      { text: t('Don’t use 13 × 3 = 39 — the 3 is the dog ratio, not chickens', 'Jangan pakai 13 × 3 = 39 — angka 3 adalah perbandingan anjing, bukan ayam'), ok: false },
      { text: '13 × 6 = 78', ok: true },
    ],
    final: t('The elephant is 78 times a chicken (B).', 'Gajah itu 78 kali berat ayam (B).'),
    aria: t('Thirteen lambs times six chickens each makes the elephant 78 chickens.', 'Tiga belas domba dikali enam ayam tiap domba membuat gajah seberat 78 ayam.'),
  }
})

/** Q8 — perimeter of a rectangle made of three 7 cm squares in a row. */
export const ThreeSquaresPerimeter20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the length and width, then perimeter = 2 × (L + W).', 'Cari panjang dan lebar, lalu keliling = 2 × (P + L).'),
    items: [
      { text: t('Three squares in a row: length 3 × 7 = 21 cm, width 7 cm', 'Tiga persegi berderet: panjang 3 × 7 = 21 cm, lebar 7 cm'), ok: null },
      { text: t('Don’t add three full perimeters (3 × 28 = 84) — the joined edges are inside', 'Jangan menjumlahkan tiga keliling penuh (3 × 28 = 84) — sisi yang bersambung ada di dalam'), ok: false },
      { text: t('Perimeter = 2 × (21 + 7) = 2 × 28 = 56 cm', 'Keliling = 2 × (21 + 7) = 2 × 28 = 56 cm'), ok: null },
      { text: t('The perimeter is 56 cm', 'Kelilingnya 56 cm'), ok: true },
    ],
    final: t('The perimeter is 56 cm (C).', 'Kelilingnya 56 cm (C).'),
    aria: t('A rectangle 21 by 7 cm has a perimeter of 56 cm.', 'Persegi panjang 21 kali 7 cm memiliki keliling 56 cm.'),
  }
})

/** Q9 — add only the train and on-foot bars. */
export const TrainOrFoot20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pick only the two named bars and add them.', 'Ambil hanya dua batang yang disebut lalu jumlahkan.'),
    items: [
      { text: t('On foot is 40 and by train is 20', 'Jalan kaki 40 dan naik kereta 20'), ok: null },
      { text: t('Don’t add a wrong bar like the bus (35) — only train and foot are asked', 'Jangan tambahkan batang yang salah seperti bus (35) — hanya kereta dan jalan kaki yang ditanya'), ok: false },
      { text: '40 + 20 = 60', ok: null },
      { text: t('So 60 students go by train or on foot', 'Jadi 60 siswa pergi dengan kereta atau jalan kaki'), ok: true },
    ],
    final: t('60 students go by train or on foot (B).', '60 siswa pergi dengan kereta atau jalan kaki (B).'),
    aria: t('Forty walkers plus twenty train riders make 60 students.', 'Empat puluh pejalan kaki ditambah dua puluh penumpang kereta jadi 60 siswa.'),
  }
})

/** Q10 — time elapsed from 9:43 to 11:11. */
export const TimeElapsed20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add full hours first, then count the leftover minutes.', 'Tambah jam penuh dulu, lalu hitung sisa menit.'),
    items: [
      { text: t('From 9:43 add 1 hour to reach 10:43', 'Dari 9:43 tambah 1 jam menjadi 10:43'), ok: null },
      { text: t('Don’t call it 2 hours — 9 to 11 looks like 2, but 9:43 to 10:43 is only 1 hour', 'Jangan sebut 2 jam — 9 ke 11 terlihat 2, tetapi 9:43 ke 10:43 hanya 1 jam'), ok: false },
      { text: t('From 10:43 to 11:11 is 17 + 11 = 28 minutes', 'Dari 10:43 ke 11:11 adalah 17 + 11 = 28 menit'), ok: null },
      { text: t('Total time is 1 hr 28 min', 'Total waktunya 1 jam 28 menit'), ok: true },
    ],
    final: t('1 hr 28 min had passed (A).', 'Telah berlalu 1 jam 28 menit (A).'),
    aria: t('From 9:43 to 11:11 is one hour and 28 minutes.', 'Dari 9:43 ke 11:11 adalah satu jam 28 menit.'),
  }
})

/** Q12 — cryptarithm 4A + 39C = D60; find A + B + C + D. */
export const CryptarithmSum20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the addition column by column using the carries.', 'Selesaikan penjumlahan kolom demi kolom dengan simpanan.'),
    items: [
      { text: t('Each hidden letter is a single nonzero digit from 1 to 9', 'Setiap huruf tersembunyi adalah satu angka bukan nol dari 1 sampai 9'), ok: null },
      { text: t('The sum D60 ends in 60, and working from the units column the carries fix every digit', 'Hasil D60 berakhir 60, dan dari kolom satuan simpanan menetapkan setiap angka'), ok: null },
      { text: t('Don’t drop a carry digit (that wrongly gives 14) — every letter must be added in', 'Jangan menghilangkan angka simpanan (itu keliru jadi 14) — setiap huruf harus dijumlahkan'), ok: false },
      { text: 'A + B + C + D = 24', ok: true },
    ],
    final: t('A + B + C + D = 24 (D).', 'A + B + C + D = 24 (D).'),
    aria: t('Solving the addition column by column, the four digits add to 24.', 'Menyelesaikan penjumlahan kolom demi kolom, keempat angka berjumlah 24.'),
  }
})

/** Q13 — find B from C/9 = B/4, then A from A×5 = B×12. */
export const SolveForA20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find B from the second equation, then A from the first.', 'Cari B dari persamaan kedua, lalu A dari yang pertama.'),
    items: [
      { text: t('Use C = 45 in C / 9 = B / 4: 45 / 9 = 5, so B = 5 × 4 = 20', 'Pakai C = 45 di C / 9 = B / 4: 45 / 9 = 5, jadi B = 5 × 4 = 20'), ok: null },
      { text: t('Don’t mix up which side carries the ×12 — B must be 20 first', 'Jangan salah menempatkan ×12 — B harus 20 dulu'), ok: false },
      { text: 'A × 5 = 20 × 12 = 240, so A = 240 / 5 = 48', ok: null },
      { text: 'A = 48', ok: true },
    ],
    final: t('A = 48 (D).', 'A = 48 (D).'),
    aria: t('B is 20, so A times 5 is 240 and A is 48.', 'B adalah 20, jadi A kali 5 adalah 240 dan A adalah 48.'),
  }
})

/** Q15 — leftover chocolate (700 − 544), then bags of 6. */
export const ChocolateBags20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract first to find the leftover, then divide.', 'Kurangi dulu untuk mencari sisanya, lalu bagi.'),
    items: [
      { text: '700 − 544 = 156', ok: null },
      { text: t('Don’t divide the wrong amount — only 156 / 6 counts (a slip gives 36)', 'Jangan membagi jumlah yang salah — hanya 156 / 6 yang dihitung (keliru jadi 36)'), ok: false },
      { text: '156 / 6 = 26', ok: null },
      { text: t('So there are 26 bags', 'Jadi ada 26 kantong'), ok: true },
    ],
    final: t('There are 26 bags (B).', 'Ada 26 kantong (B).'),
    aria: t('156 leftover chocolates packed six to a bag make 26 bags.', '156 cokelat sisa dikemas enam per kantong menjadi 26 kantong.'),
  }
})

/** Q16 — compute 71 × 12 − 7 × 71 by factoring out 71. */
export const FactorOut20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both parts share 71, so factor it out.', 'Kedua bagian punya 71, jadi keluarkan.'),
    items: [
      { text: '71 × 12 − 7 × 71 = 71 × (12 − 7)', ok: null },
      { text: t('Don’t take away too little — the whole 7 × 71 = 497 must go (wrong slip gives 395)', 'Jangan mengurangi terlalu sedikit — seluruh 7 × 71 = 497 harus dikurangi (keliru jadi 395)'), ok: false },
      { text: '12 − 7 = 5, so 71 × 5 = 355', ok: null },
      { text: '71 × 12 − 7 × 71 = 355', ok: true },
    ],
    final: t('71 × 12 − 7 × 71 = 355 (A).', '71 × 12 − 7 × 71 = 355 (A).'),
    aria: t('Factoring out 71 leaves 71 times 5, which is 355.', 'Mengeluarkan 71 menyisakan 71 kali 5, yaitu 355.'),
  }
})

/** Q18 — Square = 1541/3 = 744, then Circle = 797 − Square. */
export const ShapeEquations20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find one Square first, then subtract from 797.', 'Cari satu Persegi dulu, lalu kurangi dari 797.'),
    items: [
      { text: t('Three equal Squares make 1541, so one Square = 1541 / 3 = 744', 'Tiga Persegi yang sama membentuk 1541, jadi satu Persegi = 1541 / 3 = 744'), ok: null },
      { text: t('Don’t stop at 744 — that is one Square, not the Circle being asked for', 'Jangan berhenti di 744 — itu satu Persegi, bukan Lingkaran yang ditanya'), ok: false },
      { text: t('Circle + Square = 797, so Circle = 797 − 744 = 53', 'Lingkaran + Persegi = 797, jadi Lingkaran = 797 − 744 = 53'), ok: null },
      { text: t('The Circle is 53', 'Lingkaran adalah 53'), ok: true },
    ],
    final: t('The Circle is 53 (C).', 'Lingkaran adalah 53 (C).'),
    aria: t('Each Square is 744, so the Circle is 797 minus 744, which is 53.', 'Tiap Persegi 744, jadi Lingkaran adalah 797 dikurangi 744, yaitu 53.'),
  }
})

/** Q19 — smallest A + B×3 over factor pairs of 80. */
export const MinFactorExpression20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Try every factor pair of 80, keeping B small because it is tripled.', 'Coba tiap pasangan faktor 80, jaga B kecil karena dikali tiga.'),
    items: [
      { text: t('A × B = 80, and B is multiplied by 3, so a small B helps', 'A × B = 80, dan B dikali 3, jadi B kecil membantu'), ok: null },
      { text: 'A = 20, B = 4: 20 + 4 × 3 = 32', ok: false },
      { text: t('Don’t pick 30 — no factor pair of 80 actually reaches it', 'Jangan pilih 30 — tidak ada pasangan faktor 80 yang mencapainya'), ok: false },
      { text: 'A = 16, B = 5: 16 + 5 × 3 = 16 + 15 = 31', ok: true },
    ],
    final: t('The smallest value is 31 (C).', 'Nilai terkecilnya 31 (C).'),
    aria: t('With A 16 and B 5, A plus three times B is 31, the smallest.', 'Dengan A 16 dan B 5, A ditambah tiga kali B adalah 31, yang terkecil.'),
  }
})

/** Q21 — weighted average of two unequal height groups. */
export const WeightedAverage20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total each group, add them, then divide by everyone.', 'Totalkan tiap kelompok, jumlahkan, lalu bagi dengan semuanya.'),
    items: [
      { text: t('First 18 students: 18 × 163 = 2934 cm; other 12: 12 × 148 = 1776 cm', '18 siswa pertama: 18 × 163 = 2934 cm; 12 lainnya: 12 × 148 = 1776 cm'), ok: null },
      { text: t('Don’t just average 163 and 148 to 155 — the groups are unequal, so it must be weighted', 'Jangan hanya merata-rata 163 dan 148 jadi 155 — kelompoknya tidak sama, jadi harus ditimbang'), ok: false },
      { text: t('Whole class = 2934 + 1776 = 4710 cm, divided by 30', 'Seluruh kelas = 2934 + 1776 = 4710 cm, dibagi 30'), ok: null },
      { text: '4710 / 30 = 157 cm', ok: true },
    ],
    final: t('The average height is 157 cm (B).', 'Rata-rata tingginya 157 cm (B).'),
    aria: t('The weighted average of the two height groups is 157 cm.', 'Rata-rata tertimbang dari dua kelompok tinggi adalah 157 cm.'),
  }
})

/** Q22 — count two-digit numbers NOT divisible by 3. */
export const NotDivisibleByThree20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count all the two-digit numbers, then subtract the ones divisible by 3.', 'Hitung semua bilangan dua angka, lalu kurangi yang habis dibagi 3.'),
    items: [
      { text: t('7 choices for the tens, 6 left for the units: 7 × 6 = 42 numbers', '7 pilihan untuk puluhan, 6 sisa untuk satuan: 7 × 6 = 42 bilangan'), ok: null },
      { text: t('A number is divisible by 3 when its two digits add to a multiple of 3 — counting gives 14 of them (swaps like 12 and 21 both count)', 'Sebuah bilangan habis dibagi 3 jika jumlah dua angkanya kelipatan 3 — menghitungnya memberi 14 (tukaran seperti 12 dan 21 keduanya dihitung)'), ok: null },
      { text: t('Don’t forget those swaps — leaving them out wrongly gives 32', 'Jangan lupakan tukaran itu — meninggalkannya keliru jadi 32'), ok: false },
      { text: '42 − 14 = 28', ok: true },
    ],
    final: t('28 numbers are not divisible by 3 (B).', '28 bilangan tidak habis dibagi 3 (B).'),
    aria: t('Of 42 two-digit numbers, 14 are divisible by three, leaving 28 that are not.', 'Dari 42 bilangan dua angka, 14 habis dibagi tiga, menyisakan 28 yang tidak.'),
  }
})

/** Q24 — A star 15 = sum of 15 consecutive numbers from A = 150. */
export const ConsecutiveSum20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Write the sum as 15A + 105, then solve.', 'Tulis jumlahnya sebagai 15A + 105, lalu selesaikan.'),
    items: [
      { text: t('A star 15 adds 15 numbers in a row from A: A, A+1, …, A+14', 'A bintang 15 menjumlahkan 15 bilangan berurutan dari A: A, A+1, …, A+14'), ok: null },
      { text: t('That sum is 15 copies of A plus 0+1+…+14 = 15A + 105', 'Jumlah itu adalah 15 kali A ditambah 0+1+…+14 = 15A + 105'), ok: null },
      { text: t('Don’t just do 150 / 15 = 10 — that ignores the +105 from the rising terms', 'Jangan hanya 150 / 15 = 10 — itu mengabaikan +105 dari suku yang naik'), ok: false },
      { text: t('15A + 105 = 150, so 15A = 45 and A = 3', '15A + 105 = 150, jadi 15A = 45 dan A = 3'), ok: true },
    ],
    final: t('A = 3 (A).', 'A = 3 (A).'),
    aria: t('Fifteen consecutive numbers from A sum to 15A plus 105, so A is 3.', 'Lima belas bilangan berurutan dari A berjumlah 15A ditambah 105, jadi A adalah 3.'),
  }
})

/** Q25 — which set of four numbers CANNOT make 24. */
export const CannotMake24_20P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find a way to hit 24 for the easy sets; the leftover set is the answer.', 'Temukan cara mencapai 24 untuk kelompok mudah; kelompok sisa adalah jawabannya.'),
    items: [
      { text: t('8, 8, 1, 7: 8 + 8 + 1 + 7 = 24, that works', '8, 8, 1, 7: 8 + 8 + 1 + 7 = 24, berhasil'), ok: false },
      { text: t('2, 4, 5, 8: a valid combo reaches 24', '2, 4, 5, 8: ada kombinasi sah yang mencapai 24'), ok: false },
      { text: t('3, 8, 9, 9 looks awkward, but 3 × 8 + 9 − 9 = 24, so it does work', '3, 8, 9, 9 terlihat sulit, tetapi 3 × 8 + 9 − 9 = 24, jadi berhasil'), ok: false },
      { text: t('4, 4, 6, 6 cannot be arranged to give 24', '4, 4, 6, 6 tidak bisa disusun menghasilkan 24'), ok: true },
    ],
    final: t('The set that cannot make 24 is 4, 4, 6, 6 (C).', 'Kelompok yang tidak dapat menghasilkan 24 adalah 4, 4, 6, 6 (C).'),
    aria: t('The only set that cannot reach 24 is four, four, six, six.', 'Satu-satunya kelompok yang tidak bisa mencapai 24 adalah empat, empat, enam, enam.'),
  }
})
