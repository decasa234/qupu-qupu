import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-21P3A (2021 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 612 + 289 − 75 left to right. */
export const AddThenSubtract21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one step at a time.', 'Kerjakan dari kiri ke kanan, satu langkah demi satu.'),
    items: [
      { text: t('Add the first two: 612 + 289 = 901', 'Tambahkan dua yang pertama: 612 + 289 = 901'), ok: null },
      { text: t('Don’t stop at 901 — that is only 612 + 289, you still must subtract 75', 'Jangan berhenti di 901 — itu hanya 612 + 289, kamu masih harus mengurangi 75'), ok: false },
      { text: t('Now take away 75: 901 − 75 = 826', 'Sekarang kurangi 75: 901 − 75 = 826'), ok: null },
      { text: '612 + 289 − 75 = 826', ok: true },
    ],
    final: t('612 + 289 − 75 = 826 (A).', '612 + 289 − 75 = 826 (A).'),
    aria: t('Adding 612 and 289 then subtracting 75 gives 826.', 'Menjumlahkan 612 dan 289 lalu mengurangi 75 menghasilkan 826.'),
  }
})

/** Q2 — ratio of 1 g sugar to 10 g water. */
export const SugarWaterRatio21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Ratio = first thing over second thing.', 'Perbandingan = hal pertama di atas hal kedua.'),
    items: [
      { text: t('The sugar weighs 1 gram and the water weighs 10 grams', 'Gula beratnya 1 gram dan air beratnya 10 gram'), ok: null },
      { text: t('Sugar compared to water means write sugar on top, water on the bottom', 'Gula dibanding air artinya tulis gula di atas, air di bawah'), ok: null },
      { text: t('Don’t use 1/11 — that compares sugar to the whole syrup (1 + 10), not sugar to water', 'Jangan pakai 1/11 — itu membandingkan gula dengan seluruh larutan (1 + 10), bukan gula dengan air'), ok: false },
      { text: t('That gives 1/10', 'Itu memberi 1/10'), ok: true },
    ],
    final: t('The proportion is 1/10 (C).', 'Perbandingannya adalah 1/10 (C).'),
    aria: t('Sugar over water is one over ten.', 'Gula di atas air adalah satu per sepuluh.'),
  }
})

/** Q3 — 3-digit number: hundreds 6 = twice tens, digits sum 13. */
export const PinTheDigits21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pin each digit from the clues.', 'Tetapkan setiap angka dari petunjuk.'),
    items: [
      { text: t('The hundreds digit is 6, and 6 is twice the tens digit, so the tens digit is 6 ÷ 2 = 3', 'Angka ratusan adalah 6, dan 6 itu dua kali angka puluhan, jadi angka puluhan = 6 ÷ 2 = 3'), ok: null },
      { text: t('Don’t read it as 693 — twice the tens digit equals 6, so tens must be 3, not 9', 'Jangan baca 693 — dua kali angka puluhan sama dengan 6, jadi puluhan harus 3, bukan 9'), ok: false },
      { text: t('So far 6 and 3 add to 9; all three digits add to 13, so the ones digit is 13 − 9 = 4', 'Sejauh ini 6 dan 3 jadi 9; ketiga angka berjumlah 13, jadi angka satuan = 13 − 9 = 4'), ok: null },
      { text: t('The number is 634', 'Bilangannya adalah 634'), ok: true },
    ],
    final: t('The number is 634 (B).', 'Bilangannya 634 (B).'),
    aria: t('With hundreds 6, tens 3, and ones 4, the number is 634.', 'Dengan ratusan 6, puluhan 3, dan satuan 4, bilangannya 634.'),
  }
})

/** Q4 — 42 ÷ 7 = box, then 78 ÷ box. */
export const HiddenBoxDivide21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the hidden number, then reuse it.', 'Temukan bilangan tersembunyi, lalu pakai lagi.'),
    items: [
      { text: t('First find the box: 42 ÷ 7 = 6', 'Cari isi kotak dulu: 42 ÷ 7 = 6'), ok: null },
      { text: t('Now the box is 6, so the second part is 78 ÷ 6', 'Sekarang kotak = 6, jadi bagian kedua adalah 78 ÷ 6'), ok: null },
      { text: t('Don’t skip the first step and divide by the wrong number (like 78 ÷ 4 ≈ 16)', 'Jangan lewati langkah pertama lalu membagi dengan bilangan salah (seperti 78 ÷ 4 ≈ 16)'), ok: false },
      { text: '78 ÷ 6 = 13', ok: true },
    ],
    final: t('The answer is 13 (C).', 'Jawabannya 13 (C).'),
    aria: t('The box is 6, so 78 divided by 6 is 13.', 'Kotaknya 6, jadi 78 dibagi 6 adalah 13.'),
  }
})

/** Q5 — which number is closest to 2? */
export const ClosestToTwo21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Measure the distance to 2, pick the smallest.', 'Ukur jarak ke 2, pilih yang terkecil.'),
    items: [
      { text: t('6/4 = 1 1/2, so it is 1/2 away; 1 1/2 is also 1/2 away', '6/4 = 1 1/2, jadi berjarak 1/2; 1 1/2 juga berjarak 1/2'), ok: null },
      { text: t('Don’t pick 2 3/4 — it is bigger than 2 but 3/4 away, the farthest of all', 'Jangan pilih 2 3/4 — lebih besar dari 2 tapi berjarak 3/4, paling jauh dari semua'), ok: false },
      { text: t('1 3/4 is only 1/4 away from 2 — the smallest gap', '1 3/4 hanya berjarak 1/4 dari 2 — selisih terkecil'), ok: true },
    ],
    final: t('1 3/4 is closest to 2 (B).', '1 3/4 paling dekat dengan 2 (B).'),
    aria: t('Of all the choices, 1 and three-quarters has the smallest gap to 2.', 'Dari semua pilihan, 1 tiga perempat punya selisih terkecil ke 2.'),
  }
})

/** Q6 — perimeter of a big square made of nine 3 cm squares. */
export const BigSquarePerimeter21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the big side first, then multiply by 4.', 'Cari sisi besar dulu, lalu kalikan 4.'),
    items: [
      { text: t('9 small squares make a 3-by-3 grid (3 along each side)', '9 persegi kecil membentuk susunan 3 kali 3 (3 di tiap sisi)'), ok: null },
      { text: t('Each side of the big square = 3 small squares × 3 cm = 9 cm', 'Tiap sisi persegi besar = 3 persegi kecil × 3 cm = 9 cm'), ok: null },
      { text: t('Don’t answer 81 — that is the area (9 × 9), not the distance around', 'Jangan jawab 81 — itu luas (9 × 9), bukan jarak keliling'), ok: false },
      { text: t('Perimeter = 4 × 9 = 36 cm', 'Keliling = 4 × 9 = 36 cm'), ok: true },
    ],
    final: t('The perimeter is 36 cm (B).', 'Kelilingnya 36 cm (B).'),
    aria: t('Each big side is 9 cm, so the perimeter is 4 times 9, which is 36.', 'Tiap sisi besar 9 cm, jadi kelilingnya 4 kali 9, yaitu 36.'),
  }
})

/** Q7 — how many 1-digit boxes make 21 × box a 3-digit number under 180? */
export const CountValidDigits21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Test each digit against both limits: at least 100, under 180.', 'Uji tiap angka terhadap kedua batas: paling sedikit 100, di bawah 180.'),
    items: [
      { text: t('21 × 5 = 105, 21 × 6 = 126, 21 × 7 = 147, 21 × 8 = 168 — all between 100 and 180', '21 × 5 = 105, 21 × 6 = 126, 21 × 7 = 147, 21 × 8 = 168 — semua antara 100 dan 180'), ok: null },
      { text: t('21 × 4 = 84 is only 2 digits, and 21 × 9 = 189 is too big', '21 × 4 = 84 hanya 2 angka, dan 21 × 9 = 189 terlalu besar'), ok: null },
      { text: t('Don’t answer 5 by counting the digit 4 — 84 is not a 3-digit number', 'Jangan jawab 5 dengan ikut menghitung angka 4 — 84 bukan bilangan 3 angka'), ok: false },
      { text: t('So the box can be 5, 6, 7, or 8 — that is 4 numbers', 'Jadi kotak bisa 5, 6, 7, atau 8 — yaitu 4 bilangan'), ok: true },
    ],
    final: t('There are 4 valid digits (C).', 'Ada 4 angka yang valid (C).'),
    aria: t('Only 5, 6, 7, and 8 keep the product a 3-digit number under 180, so four digits work.', 'Hanya 5, 6, 7, dan 8 yang menjaga hasil kali jadi bilangan 3 angka di bawah 180, jadi empat angka cocok.'),
  }
})

/** Q8 — square number between 30 and 40; how many per side? */
export const SquareChildren21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the square number in the range.', 'Cari bilangan kuadrat dalam rentang.'),
    items: [
      { text: t('A solid square means the total is a square number: side × side', 'Persegi penuh berarti totalnya bilangan kuadrat: sisi × sisi'), ok: null },
      { text: t('Squares near the range: 5 × 5 = 25, 6 × 6 = 36, 7 × 7 = 49', 'Kuadrat di sekitar rentang: 5 × 5 = 25, 6 × 6 = 36, 7 × 7 = 49'), ok: null },
      { text: t('Don’t answer 8 — 8 × 8 = 64 is far above 40', 'Jangan jawab 8 — 8 × 8 = 64 jauh di atas 40'), ok: false },
      { text: t('Only 36 is between 30 and 40, and 36 = 6 × 6, so 6 children per side', 'Hanya 36 yang di antara 30 dan 40, dan 36 = 6 × 6, jadi 6 anak per sisi'), ok: true },
    ],
    final: t('There are 6 children on each side (B).', 'Ada 6 anak di setiap sisi (B).'),
    aria: t('Thirty-six is the only square between 30 and 40, and it is 6 by 6.', 'Tiga puluh enam satu-satunya kuadrat di antara 30 dan 40, dan itu 6 kali 6.'),
  }
})

/** Q12 — two 64 cm ribbons joined with an 18 cm overlap. */
export const OverlapRibbon21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the parts, then remove the double-counted overlap.', 'Jumlahkan bagiannya, lalu buang tumpang tindih yang terhitung dua kali.'),
    items: [
      { text: t('Lay the two ribbons end to end: 64 + 64 = 128 cm', 'Susun kedua pita ujung ke ujung: 64 + 64 = 128 cm'), ok: null },
      { text: t('They overlap by 18 cm, so that part is counted twice', 'Keduanya bertumpang tindih 18 cm, jadi bagian itu terhitung dua kali'), ok: null },
      { text: t('Don’t subtract only part of the overlap (like 12) — remove the full 18 cm once', 'Jangan mengurangi sebagian tumpang tindih saja (seperti 12) — buang seluruh 18 cm sekali'), ok: false },
      { text: '128 − 18 = 110 cm', ok: true },
    ],
    final: t('The new ribbon is 110 cm long (D).', 'Pita baru panjangnya 110 cm (D).'),
    aria: t('Adding both ribbons and removing the 18 cm overlap once gives 110 cm.', 'Menjumlahkan kedua pita dan membuang tumpang tindih 18 cm sekali menghasilkan 110 cm.'),
  }
})

/** Q13 — difference of largest and smallest 3-digit numbers with digit sum 26. */
export const DigitSumDifference21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Arrange the same digits big-first and small-first.', 'Susun angka yang sama: depan besar lalu depan kecil.'),
    items: [
      { text: t('Digits add to 26, and 9 + 9 + 9 = 27, so the digits must be 9, 9, and 8', 'Jumlah angka 26, dan 9 + 9 + 9 = 27, jadi angkanya pasti 9, 9, dan 8'), ok: null },
      { text: t('Largest: front digits as big as possible — 998; smallest: front as small as possible — 899', 'Terbesar: angka depan sebesar mungkin — 998; terkecil: depan sekecil mungkin — 899'), ok: null },
      { text: t('Don’t answer 100 — it looks tidy but the real ends are 998 and 899', 'Jangan jawab 100 — tampak rapi tapi ujung sebenarnya 998 dan 899'), ok: false },
      { text: '998 − 899 = 99', ok: true },
    ],
    final: t('The difference is 99 (D).', 'Selisihnya 99 (D).'),
    aria: t('The largest is 998 and the smallest is 899, differing by 99.', 'Terbesar 998 dan terkecil 899, berselisih 99.'),
  }
})

/** Q15 — two Mondays in August whose dates sum to 38; Peter is the earlier. */
export const MondayDates21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the 7-day weekday gap, then split the sum.', 'Pakai selisih 7 hari, lalu bagi jumlahnya.'),
    items: [
      { text: t('Two Mondays in the same month are 7, 14, or 21 days apart', 'Dua hari Senin di bulan yang sama berjarak 7, 14, atau 21 hari'), ok: null },
      { text: t('With a 14-day gap: 2 × earlier = 38 − 14 = 24, so earlier = 12, and 12 and 26 add to 38', 'Dengan selisih 14: 2 × lebih awal = 38 − 14 = 24, jadi lebih awal = 12, dan 12 dan 26 berjumlah 38'), ok: null },
      { text: t('Don’t answer 13 — 13 and 25 are not both Mondays 14 days apart', 'Jangan jawab 13 — 13 dan 25 tidak sama-sama Senin berjarak 14 hari'), ok: false },
      { text: t('Peter is the earlier date: the 12th', 'Peter tanggal lebih awal: tanggal 12'), ok: true },
    ],
    final: t('Peter’s birthday is the 12th (D).', 'Ulang tahun Peter tanggal 12 (D).'),
    aria: t('The two Mondays 12 and 26 add to 38, so Peter is the 12th.', 'Kedua hari Senin 12 dan 26 berjumlah 38, jadi Peter tanggal 12.'),
  }
})

/** Q16 — compute 7 × 53 × 14 + 47 × 14 × 7 by factoring. */
export const FactorOutHundred21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Factor out the common part to make 100.', 'Keluarkan bagian bersama untuk membentuk 100.'),
    items: [
      { text: t('Both parts share 7 × 14, so pull it out: 7 × 14 × (53 + 47)', 'Kedua bagian punya 7 × 14, jadi keluarkan: 7 × 14 × (53 + 47)'), ok: null },
      { text: t('Add inside the brackets first: 53 + 47 = 100', 'Jumlahkan di dalam kurung dulu: 53 + 47 = 100'), ok: null },
      { text: t('Don’t answer 5300 — that is just 53 × 100, forgetting the full 7 × 14 = 98', 'Jangan jawab 5300 — itu hanya 53 × 100, lupa mengalikan 7 × 14 = 98 penuh'), ok: false },
      { text: t('7 × 14 = 98, and 98 × 100 = 9800', '7 × 14 = 98, dan 98 × 100 = 9800'), ok: true },
    ],
    final: t('The answer is 9800 (D).', 'Jawabannya 9800 (D).'),
    aria: t('Factoring out 7 times 14 leaves 98 times 100, which is 9800.', 'Mengeluarkan 7 kali 14 menyisakan 98 kali 100, yaitu 9800.'),
  }
})

/** Q17 — box × tri = 36, box ÷ tri = 4, find box + tri + tri. */
export const SquareTriangleSolve21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the ratio clue to substitute, then solve.', 'Pakai petunjuk perbandingan untuk substitusi, lalu selesaikan.'),
    items: [
      { text: t('▢ ÷ △ = 4 means ▢ is 4 times △', '▢ ÷ △ = 4 berarti ▢ adalah 4 kali △'), ok: null },
      { text: t('Put that into ▢ × △ = 36: (4 × △) × △ = 36, so △ × △ = 9 and △ = 3, then ▢ = 12', 'Masukkan ke ▢ × △ = 36: (4 × △) × △ = 36, jadi △ × △ = 9 dan △ = 3, lalu ▢ = 12'), ok: null },
      { text: t('Don’t answer 27 (= 12 + 12 + 3) — the question doubles △ (the 3), not ▢', 'Jangan jawab 27 (= 12 + 12 + 3) — soal menggandakan △ (yaitu 3), bukan ▢'), ok: false },
      { text: t('▢ + △ + △ = 12 + 3 + 3 = 18', '▢ + △ + △ = 12 + 3 + 3 = 18'), ok: true },
    ],
    final: t('▢ + △ + △ = 18 (B).', '▢ + △ + △ = 18 (B).'),
    aria: t('The triangle is 3 and the square is 12, so 12 plus 3 plus 3 is 18.', 'Segitiga 3 dan kotak 12, jadi 12 tambah 3 tambah 3 adalah 18.'),
  }
})

/** Q19 — which symbols complete 6 6 6 6 6 = 77? */
export const JoinDigitsSymbols21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Let digits join, then fit the sentence.', 'Biarkan angka menyatu, lalu cocokkan kalimatnya.'),
    items: [
      { text: t('77 is big, so let two 6s join to make 66', '77 itu besar, jadi biarkan dua angka 6 menyatu jadi 66'), ok: null },
      { text: t('Try 66 + 66 ÷ 6: first 66 ÷ 6 = 11, then 66 + 11 = 77', 'Coba 66 + 66 ÷ 6: dulu 66 ÷ 6 = 11, lalu 66 + 11 = 77'), ok: null },
      { text: t('Don’t pick +, +, ÷ — an extra + assumes more 6s must be separated, but 66 + 66 ÷ 6 already hits 77', 'Jangan pilih +, +, ÷ — + ekstra menganggap lebih banyak 6 harus dipisah, padahal 66 + 66 ÷ 6 sudah 77'), ok: false },
      { text: t('That uses only two symbols: +, ÷', 'Itu hanya pakai dua simbol: +, ÷'), ok: true },
    ],
    final: t('The symbols are +, ÷ (C).', 'Simbolnya +, ÷ (C).'),
    aria: t('66 plus 66 divided by 6 makes 77 using only a plus and a divide.', '66 tambah 66 dibagi 6 menghasilkan 77 hanya dengan tambah dan bagi.'),
  }
})

/** Q21 — flip each opponent's result to find Donald's points. */
export const DonaldPoints21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Flip each opponent’s result to fill Donald’s row.', 'Balik hasil tiap lawan untuk mengisi baris Donald.'),
    items: [
      { text: t('Joe’s × vs Donald means Donald beat Joe (5), and Mary’s × vs Donald means Donald beat Mary (5)', '× Joe lawan Donald berarti Donald kalahkan Joe (5), dan × Mary lawan Donald berarti Donald kalahkan Mary (5)'), ok: null },
      { text: t('Harris has 9 = win over Joe (5) + draw with Mary (3) + 1, so Harris lost to Donald — a third win (5)', 'Harris punya 9 = menang atas Joe (5) + seri dengan Mary (3) + 1, jadi Harris kalah dari Donald — menang ketiga (5)'), ok: null },
      { text: t('Don’t answer 13 (= 5 + 5 + 3) — Harris’s 9 forces Harris to have lost to Donald, so no draw', 'Jangan jawab 13 (= 5 + 5 + 3) — nilai 9 Harris memaksa Harris kalah dari Donald, jadi tidak ada seri'), ok: false },
      { text: t('Donald won all three: 5 + 5 + 5 = 15 points', 'Donald menang ketiganya: 5 + 5 + 5 = 15 poin'), ok: true },
    ],
    final: t('Donald gets 15 points (D).', 'Donald memperoleh 15 poin (D).'),
    aria: t('Donald beat all three opponents for 5 points each, totalling 15.', 'Donald mengalahkan ketiga lawan masing-masing 5 poin, total 15.'),
  }
})

/** Q24 — four colors, three "not" counts and 30 green; find the total. */
export const ComplementMasks21P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the complements, then untangle the double count.', 'Jumlahkan komplemennya, lalu uraikan hitungan ganda.'),
    items: [
      { text: t('With only 4 colors, “not black” (153) means white + blue + green, and the same for the others', 'Hanya 4 warna, jadi “bukan hitam” (153) berarti putih + biru + hijau, dan begitu pula yang lain'), ok: null },
      { text: t('Add the three “not” counts: 153 + 125 + 138 = 416 = 2 × Total + green', 'Jumlahkan ketiga “bukan”: 153 + 125 + 138 = 416 = 2 × Total + hijau'), ok: null },
      { text: t('Don’t answer 183 from a wrong subtraction — the clean relation is 2 × Total + 30 = 416', 'Jangan jawab 183 dari pengurangan yang keliru — hubungan benar adalah 2 × Total + 30 = 416'), ok: false },
      { text: t('Subtract the 30 green: 2 × Total = 386, so Total = 193', 'Kurangi 30 hijau: 2 × Total = 386, jadi Total = 193'), ok: true },
    ],
    final: t('The school buys 193 masks (B).', 'Sekolah membeli 193 masker (B).'),
    aria: t('The three not-counts add to 416, which is twice the total plus 30 green, giving 193.', 'Ketiga hitungan bukan berjumlah 416, yaitu dua kali total tambah 30 hijau, sehingga 193.'),
  }
})
