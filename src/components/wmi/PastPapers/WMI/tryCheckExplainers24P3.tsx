import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-24P3A (2024 Grade 3 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination, blue rows are neutral facts.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q2 — which '>' chain of 4-digit numbers is fully correct? */
export const CompareChains24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare digit by digit from the left — a chain is correct only if every ">" holds.', 'Bandingkan digit demi digit dari kiri — rantai benar hanya jika setiap ">" benar.'),
    items: [
      { text: t('A: 2614 > 2461 is true, but 2461 > 2641 is false (2461 < 2641)', 'A: 2614 > 2461 benar, tapi 2461 > 2641 salah (2461 < 2641)'), ok: false },
      { text: t('B: 4162 > 4621 is already false', 'B: 4162 > 4621 sudah salah'), ok: false },
      { text: t('C: 1624 > 1426 is true, but 1426 > 1462 is false (1426 < 1462)', 'C: 1624 > 1426 benar, tapi 1426 > 1462 salah (1426 < 1462)'), ok: false },
      { text: t('Every chain breaks, so none of them is correct: D', 'Semua rantai gagal, jadi tidak ada yang benar: D'), ok: true },
    ],
    final: t('None of the chains hold, so the answer is "None of these" (D).', 'Tidak ada rantai yang benar, jadi jawabannya "Tidak ada yang benar" (D).'),
    aria: t('Each chain has a false comparison, so none of them is correct.', 'Tiap rantai punya perbandingan salah, jadi tidak ada yang benar.'),
  }
})

/** Q4 — which expression's result has digits that sum to 10? */
export const DigitSumTen24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute each result, then add up its digits and look for 10.', 'Hitung tiap hasil, lalu jumlahkan digitnya dan cari yang 10.'),
    items: [
      { text: t('A: 32 × 4 = 128 → 1 + 2 + 8 = 11', 'A: 32 × 4 = 128 → 1 + 2 + 8 = 11'), ok: false },
      { text: t('B: 94 ÷ 2 = 47 → 4 + 7 = 11', 'B: 94 ÷ 2 = 47 → 4 + 7 = 11'), ok: false },
      { text: t('C: 27 × 3 = 81 → 8 + 1 = 9', 'C: 27 × 3 = 81 → 8 + 1 = 9'), ok: false },
      { text: t('D: 57 ÷ 3 = 19 → 1 + 9 = 10', 'D: 57 ÷ 3 = 19 → 1 + 9 = 10'), ok: true },
    ],
    final: t('Only 57 ÷ 3 = 19 has digits summing to 10 (D).', 'Hanya 57 ÷ 3 = 19 yang jumlah digitnya 10 (D).'),
    aria: t('Adding the digits of each result, only 19 sums to 10.', 'Menjumlahkan digit tiap hasil, hanya 19 yang jumlahnya 10.'),
  }
})

/** Q5 — square = 315 + 248, circle = 891 − 677; find square − circle. */
export const SquareMinusCircle24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve each shape first, then subtract the circle from the square.', 'Selesaikan tiap bangun dulu, lalu kurangkan lingkaran dari kotak.'),
    items: [
      { text: t('Square: 315 + 248 = 563', 'Kotak: 315 + 248 = 563'), ok: null },
      { text: t('Circle: 891 − 677 = 214', 'Lingkaran: 891 − 677 = 214'), ok: null },
      { text: t('Don’t use 227 for the circle: 563 − 227 = 336 is wrong, the circle is 214', 'Jangan pakai 227 untuk lingkaran: 563 − 227 = 336 salah, lingkaran itu 214'), ok: false },
      { text: '563 − 214 = 349', ok: true },
    ],
    final: t('The square minus the circle is 349 (C).', 'Kotak dikurangi lingkaran adalah 349 (C).'),
    aria: t('Square 563 minus circle 214 is 349.', 'Kotak 563 dikurangi lingkaran 214 adalah 349.'),
  }
})

/** Q6 — 3:33 shows all-same digits; minutes until the next all-same display. */
export const ClockAllSame24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the next time all three digits match, then count the gap.', 'Cari waktu berikutnya ketiga digit sama, lalu hitung jaraknya.'),
    items: [
      { text: t('3:33 shows three identical 3s; the next all-same display is 4:44', '3:33 menampilkan tiga angka 3; tampilan sama berikutnya adalah 4:44'), ok: null },
      { text: t('3:33 to 4:00 is 27 minutes', '3:33 ke 4:00 ada 27 menit'), ok: null },
      { text: t('4:00 to 4:44 is 44 minutes', '4:00 ke 4:44 ada 44 menit'), ok: null },
      { text: '27 + 44 = 71', ok: true },
    ],
    final: t('The next all-same display, 4:44, is 71 minutes later (C).', 'Tampilan sama berikutnya, 4:44, datang 71 menit kemudian (C).'),
    aria: t('From 3:33 to the next all-same time 4:44 is 71 minutes.', 'Dari 3:33 ke waktu sama berikutnya 4:44 adalah 71 menit.'),
  }
})

/** Q7 — max balanced groups of 6 (3 boys + 3 girls) from 38 boys, 28 girls. */
export const BalancedGroups24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each balanced group of 6 needs 3 boys and 3 girls — the scarcer side limits the count.', 'Tiap kelompok seimbang 6 orang butuh 3 laki-laki dan 3 perempuan — sisi yang lebih langka membatasi jumlahnya.'),
    items: [
      { text: t('Boys allow 38 ÷ 3 = 12 groups (2 left over)', 'Laki-laki memungkinkan 38 ÷ 3 = 12 kelompok (sisa 2)'), ok: null },
      { text: t('Girls allow 28 ÷ 3 = 9 groups (1 left over)', 'Perempuan memungkinkan 28 ÷ 3 = 9 kelompok (sisa 1)'), ok: null },
      { text: t('Don’t use 66 ÷ 6 = 11 — that ignores the 3-boys-3-girls rule', 'Jangan pakai 66 ÷ 6 = 11 — itu mengabaikan syarat 3 laki-laki 3 perempuan'), ok: false },
      { text: t('The smaller limit wins: at most 9 balanced groups', 'Batas lebih kecil menang: paling banyak 9 kelompok seimbang'), ok: true },
    ],
    final: t('At most 9 balanced groups can be formed (D).', 'Paling banyak 9 kelompok seimbang dapat dibentuk (D).'),
    aria: t('Girls limit the count to nine balanced groups.', 'Perempuan membatasi jumlah jadi sembilan kelompok seimbang.'),
  }
})

/** Q9 — fill >, <, or = in three comparison lines, top to bottom. */
export const FillSigns24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute both sides of every line, then read the signs top to bottom.', 'Hitung kedua sisi tiap baris, lalu baca tandanya dari atas ke bawah.'),
    items: [
      { text: t('Line 1: 372 + 25 = 397 vs 464 − 85 = 379 → >', 'Baris 1: 372 + 25 = 397 vs 464 − 85 = 379 → >'), ok: null },
      { text: t('Line 2: 78 × 6 = 468 vs 505 − 99 = 406 → >', 'Baris 2: 78 × 6 = 468 vs 505 − 99 = 406 → >'), ok: null },
      { text: t('Line 3: 3 h 20 min = 180 + 20 = 200 min vs 200 min → =', 'Baris 3: 3 jam 20 menit = 180 + 20 = 200 menit vs 200 menit → ='), ok: null },
      { text: t('So the signs are > , > , =', 'Jadi tandanya > , > , ='), ok: true },
    ],
    final: t('The signs read > , > , = (B).', 'Tandanya terbaca > , > , = (B).'),
    aria: t('The three lines give greater, greater, equal.', 'Ketiga baris memberi lebih besar, lebih besar, sama.'),
  }
})

/** Q10 — Jimmy's back faces north; which direction is Nancy's left? */
export const FacingLeft24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out who faces where, then read off the left hand.', 'Cari tahu siapa menghadap ke mana, lalu baca arah tangan kiri.'),
    items: [
      { text: t('Jimmy’s back faces north, so Jimmy faces south', 'Punggung Jimmy menghadap utara, jadi Jimmy menghadap selatan'), ok: null },
      { text: t('Nancy faces Jimmy, so Nancy faces north', 'Nancy menghadap Jimmy, jadi Nancy menghadap utara'), ok: null },
      { text: t('Don’t say east — that is Nancy’s right, not her left', 'Jangan bilang timur — itu sisi kanan Nancy, bukan kiri'), ok: false },
      { text: t('Facing north, Nancy’s left points west', 'Menghadap utara, sisi kiri Nancy menunjuk barat'), ok: true },
    ],
    final: t('Nancy’s left is west (B).', 'Sisi kiri Nancy adalah barat (B).'),
    aria: t('Facing north, Nancy’s left hand points west.', 'Menghadap utara, tangan kiri Nancy menunjuk barat.'),
  }
})

/** Q11 — which 2-digit count fails: multiple of 3 AND remainder 3 mod 4? */
export const BallCount24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The count must be a multiple of 3 and leave remainder 3 when divided by 4.', 'Jumlahnya harus kelipatan 3 dan bersisa 3 saat dibagi 4.'),
    items: [
      { text: t('All five are multiples of 3, so check remainder ÷ 4', 'Kelimanya kelipatan 3, jadi cek sisa ÷ 4'), ok: null },
      { text: t('51 → 3, 15 → 3, 75 → 3, 99 → 3 — all leave 3', '51 → 3, 15 → 3, 75 → 3, 99 → 3 — semua bersisa 3'), ok: null },
      { text: t('69 ÷ 4 leaves 1, not 3 — it breaks the second rule', '69 ÷ 4 bersisa 1, bukan 3 — melanggar aturan kedua'), ok: true },
    ],
    final: t('69 cannot be the number of balls (D).', '69 tidak mungkin jumlah bolanya (D).'),
    aria: t('Only 69 fails the remainder-3 rule, so it cannot be the count.', 'Hanya 69 yang gagal aturan sisa-3, jadi tak mungkin jumlahnya.'),
  }
})

/** Q13 — 288 pts = 4 rubies = 9 sapphires; cost of 1 ruby + 1 sapphire. */
export const GemPoints24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each gem’s unit price, then add one of each.', 'Cari harga tiap permata, lalu jumlahkan masing-masing satu.'),
    items: [
      { text: t('1 ruby = 288 ÷ 4 = 72 points', '1 rubi = 288 ÷ 4 = 72 poin'), ok: null },
      { text: t('1 sapphire = 288 ÷ 9 = 32 points', '1 safir = 288 ÷ 9 = 32 poin'), ok: null },
      { text: t('Don’t take two rubies: 72 × 2 = 144 answers the wrong question', 'Jangan ambil dua rubi: 72 × 2 = 144 menjawab soal yang salah'), ok: false },
      { text: '72 + 32 = 104', ok: true },
    ],
    final: t('1 ruby and 1 sapphire cost 104 points (A).', '1 rubi dan 1 safir berharga 104 poin (A).'),
    aria: t('A ruby is 72 and a sapphire is 32, so together they cost 104 points.', 'Satu rubi 72 dan satu safir 32, jadi bersama-sama 104 poin.'),
  }
})

/** Q14 — repeating circle,square,square,triangle; max squares with 10 triangles. */
export const PatternSquares24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count whole blocks, then push the tail for the maximum.', 'Hitung blok penuh, lalu dorong ekornya untuk maksimum.'),
    items: [
      { text: t('One block (circle, square, square, triangle) has 2 squares per triangle', 'Satu blok (lingkaran, persegi, persegi, segitiga) punya 2 persegi per segitiga'), ok: null },
      { text: t('10 triangles = 10 full blocks = 10 × 2 = 20 squares', '10 segitiga = 10 blok penuh = 10 × 2 = 20 persegi'), ok: null },
      { text: t('Don’t stop at 20 — "at most" lets two more squares follow the last triangle', 'Jangan berhenti di 20 — "paling banyak" membolehkan dua persegi lagi setelah segitiga terakhir'), ok: false },
      { text: t('Add the tail circle, square, square: 20 + 2 = 22', 'Tambahkan ekor lingkaran, persegi, persegi: 20 + 2 = 22'), ok: true },
    ],
    final: t('At most 22 squares appear (E).', 'Paling banyak muncul 22 persegi (E).'),
    aria: t('Twenty squares in ten blocks plus two trailing squares makes 22.', 'Dua puluh persegi dalam sepuluh blok ditambah dua persegi ekor jadi 22.'),
  }
})

/** Q15 — trains every 25 min; wait from 9:03 to the next departure. */
export const SubwayWait24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the interval, then step forward to the next train after 9:03.', 'Cari selang, lalu maju ke kereta berikutnya sesudah 9:03.'),
    items: [
      { text: t('1st (5:50) to 3rd (6:40) is 50 min over 2 gaps, so each gap is 50 ÷ 2 = 25 min', 'Kereta ke-1 (5:50) ke ke-3 (6:40) ada 50 menit dalam 2 selang, jadi tiap selang 50 ÷ 2 = 25 menit'), ok: null },
      { text: t('Trains leave 5:50, 6:15, 6:40, … up to 8:45, then 9:10', 'Kereta berangkat 5:50, 6:15, 6:40, … sampai 8:45, lalu 9:10'), ok: null },
      { text: t('9:10 is the next departure after 9:03', '9:10 keberangkatan berikutnya sesudah 9:03'), ok: null },
      { text: t('Wait = 9:10 − 9:03 = 7 minutes', 'Tunggu = 9:10 − 9:03 = 7 menit'), ok: true },
    ],
    final: t('Paul waits at least 7 minutes (E).', 'Paul menunggu paling sedikit 7 menit (E).'),
    aria: t('The next train at 9:10 means a 7-minute wait from 9:03.', 'Kereta berikutnya pukul 9:10 berarti menunggu 7 menit dari 9:03.'),
  }
})

/** Q16 — 2024 − 202 − 24 mis-copied as 1808 (+10); which 2 went wrong? */
export const WrongDigit24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the size of the error, then ask which 2 carries that place value.', 'Cari besar kesalahan, lalu tanyakan angka 2 mana yang menyandang nilai tempat itu.'),
    items: [
      { text: t('Correct: 2024 − 202 − 24 = 1798, but Max got 1808 — that is +10', 'Benar: 2024 − 202 − 24 = 1798, tapi Max dapat 1808 — yaitu +10'), ok: null },
      { text: t('Don’t pick C: it is a hundreds 2, changing it shifts by hundreds, not 10', 'Jangan pilih C: itu angka 2 ratusan, mengubahnya menggeser ratusan, bukan 10'), ok: false },
      { text: t('B (tens 2 of 2024) → write 3 makes 2034, +10 → 1808', 'B (angka 2 puluhan pada 2024) → tulis 3 jadi 2034, +10 → 1808'), ok: null },
      { text: t('E (tens 2 of 24) → write 1 subtracts 10 less, also +10 → 1808; so B or E', 'E (angka 2 puluhan pada 24) → tulis 1 mengurangi 10 lebih sedikit, juga +10 → 1808; jadi B atau E'), ok: true },
    ],
    final: t('Either B or E could be the wrong 2 (E).', 'Baik B maupun E bisa menjadi angka 2 yang salah (E).'),
    aria: t('A 10 error means the tens-place 2 in 2024 or 24 was miscopied, so B or E.', 'Kesalahan 10 berarti angka 2 puluhan pada 2024 atau 24 yang salah, jadi B atau E.'),
  }
})

/** Q20 — 144 chocolates; after the magic all equal X; most − fewest. */
export const ChocolateSpread24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Call the equal amount X, write each student in terms of X, then solve.', 'Sebut jumlah sama itu X, tulis tiap siswa dalam bentuk X, lalu selesaikan.'),
    items: [
      { text: t('student1 = X − 3, student2 = X + 3, student3 = X ÷ 3, student4 = 3X', 'siswa1 = X − 3, siswa2 = X + 3, siswa3 = X ÷ 3, siswa4 = 3X'), ok: null },
      { text: t('Sum is 144: (X − 3) + (X + 3) + X/3 + 3X = 16X/3 = 144, so X = 27', 'Jumlahnya 144: (X − 3) + (X + 3) + X/3 + 3X = 16X/3 = 144, jadi X = 27'), ok: null },
      { text: t('Real amounts: 24, 30, 9, 81 chocolates', 'Jumlah asli: 24, 30, 9, 81 cokelat'), ok: null },
      { text: t('Most − fewest = 81 − 9 = 72', 'Terbanyak − tersedikit = 81 − 9 = 72'), ok: true },
    ],
    final: t('The most-to-fewest gap is 72 chocolates (B).', 'Selisih terbanyak-tersedikit adalah 72 cokelat (B).'),
    aria: t('Solving for X gives real amounts 9 and 81, a spread of 72.', 'Menyelesaikan X memberi jumlah asli 9 dan 81, selisih 72.'),
  }
})

/** Q21 — sum = AA, product = BBB; largest diff − smallest diff. */
export const RepdigitPairs24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Search pairs whose sum is a repdigit AA and product a repdigit BBB, then compare differences.', 'Cari pasangan dengan jumlah angka kembar AA dan hasil kali angka kembar BBB, lalu bandingkan selisihnya.'),
    items: [
      { text: t('Sum AA is one of 11…99; product BBB is one of 111…999', 'Jumlah AA salah satu dari 11…99; hasil kali BBB salah satu dari 111…999'), ok: null },
      { text: t('37 + 18 = 55 and 37 × 18 = 666 → difference 19 (smallest, circle)', '37 + 18 = 55 dan 37 × 18 = 666 → selisih 19 (terkecil, lingkaran)'), ok: null },
      { text: t('74 + 3 = 77 and 74 × 3 = 222 → difference 71 (largest, square)', '74 + 3 = 77 dan 74 × 3 = 222 → selisih 71 (terbesar, kotak)'), ok: null },
      { text: t('square − circle = 71 − 19 = 52', 'kotak − lingkaran = 71 − 19 = 52'), ok: true },
    ],
    final: t('The square minus the circle is 52 (D).', 'Kotak dikurangi lingkaran adalah 52 (D).'),
    aria: t('The biggest difference 71 minus the smallest 19 is 52.', 'Selisih terbesar 71 dikurangi terkecil 19 adalah 52.'),
  }
})

/** Q22 — logic clues place 15,18,22,27 on Curry, Tompson, Green, Paul. */
export const BasketballScores24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pin the forced clues first, then Curry takes what is left.', 'Pasang petunjuk terpaksa dulu, lalu Curry mengambil sisanya.'),
    items: [
      { text: t('Scores are 15, 18, 22, 27; Paul > 20 means Paul is 22 or 27', 'Skornya 15, 18, 22, 27; Paul > 20 berarti Paul 22 atau 27'), ok: null },
      { text: t('Green > Paul, so Paul isn’t the top 27 → Paul = 22, Green = 27', 'Green > Paul, jadi Paul bukan 27 tertinggi → Paul = 22, Green = 27'), ok: null },
      { text: t('Tompson isn’t the fewest, so of the leftover 15 and 18, Tompson = 18 (not 15)', 'Tompson bukan tersedikit, jadi dari sisa 15 dan 18, Tompson = 18 (bukan 15)'), ok: false },
      { text: t('Curry gets the leftover 15 points', 'Curry mendapat sisa 15 poin'), ok: true },
    ],
    final: t('Curry got 15 points (D).', 'Curry mendapat 15 poin (D).'),
    aria: t('After placing the others, Curry is left with 15 points.', 'Setelah menempatkan yang lain, Curry tersisa 15 poin.'),
  }
})

/** Q24 — wipe fewest digits of 1122323124211 to leave a palindrome. */
export const PalindromeWipe24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep the longest palindrome, erase the rest.', 'Simpan palindrom terpanjang, hapus sisanya.'),
    items: [
      { text: t('A palindrome reads the same both ways; the number has 13 digits', 'Palindrom dibaca sama dari dua arah; bilangannya 13 digit'), ok: null },
      { text: t('The longest palindrome you can keep inside it is 11 digits long', 'Palindrom terpanjang yang bisa disimpan di dalamnya adalah 11 digit'), ok: null },
      { text: t('Don’t erase 3 — keeping only 10 digits is more than needed', 'Jangan hapus 3 — menyisakan hanya 10 digit lebih dari perlu'), ok: false },
      { text: t('Digits to wipe = 13 − 11 = 2', 'Digit yang dihapus = 13 − 11 = 2'), ok: true },
    ],
    final: t('Betty needs to erase only 2 digits (A).', 'Betty cukup menghapus 2 digit (A).'),
    aria: t('Keeping an 11-digit palindrome out of 13 means wiping just 2 digits.', 'Menyimpan palindrom 11 digit dari 13 berarti menghapus 2 digit.'),
  }
})

/** Q25 — 4×4 sudoku; largest sum of the two "?" cells. */
export const SudokuMaxSum24P3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each cell holds 1–4, so push both "?" cells to their max if the rules allow.', 'Tiap sel berisi 1–4, jadi dorong kedua sel "?" ke maksimum jika aturan membolehkan.'),
    items: [
      { text: t('A single cell can be at most 4', 'Satu sel paling besar 4'), ok: null },
      { text: t('Don’t settle for 4 + 3 = 7 — that assumes both cells can’t be 4', 'Jangan puas dengan 4 + 3 = 7 — itu mengira kedua sel tak bisa sama-sama 4'), ok: false },
      { text: t('Solving the rows, columns, and frames lets both "?" cells be 4', 'Menyelesaikan baris, kolom, dan bingkai membolehkan kedua sel "?" bernilai 4'), ok: null },
      { text: '4 + 4 = 8', ok: true },
    ],
    final: t('The largest possible sum is 8 (E).', 'Jumlah terbesar yang mungkin adalah 8 (E).'),
    aria: t('Both marked cells can legally be 4, so their largest sum is 8.', 'Kedua sel bertanda boleh bernilai 4, jadi jumlah terbesarnya 8.'),
  }
})
