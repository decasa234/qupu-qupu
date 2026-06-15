import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-20P1A (2020 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination. Indonesian copy is taken from
// each question's hint_steps_id / breakdown, never invented.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 7 + 2 + 4 + 1 by making a ten first. */
export const MakeTenSum20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Group numbers that make a ten, then add the rest.', 'Kelompokkan bilangan yang jadi sepuluh, lalu tambahkan sisanya.'),
    items: [
      { text: t('7 + 2 + 1 = 10 makes a ten', '7 + 2 + 1 = 10 membuat sepuluh'), ok: null },
      { text: t('That leaves the 4: 10 + 4 = 14', 'Tersisa angka 4: 10 + 4 = 14'), ok: null },
      { text: t('Don’t miscount to 15 — adding one extra by slipping gives the wrong total', 'Jangan salah hitung jadi 15 — menambah satu lebih karena keliru memberi jumlah salah'), ok: false },
      { text: '7 + 2 + 4 + 1 = 14', ok: true },
    ],
    final: t('7 + 2 + 4 + 1 = 14 (A).', '7 + 2 + 4 + 1 = 14 (A).'),
    aria: t('Making a ten then adding four, the sum is 14.', 'Membuat sepuluh lalu menambah empat, jumlahnya 14.'),
  }
})

/** Q2 — 5 + ( ) = 13: missing part = whole − known part. */
export const MissingAddend20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the missing part by subtracting it from the total.', 'Cari bagian yang hilang dengan mengurangkan dari jumlahnya.'),
    items: [
      { text: t('A missing add-on means: take it away from the total', 'Penjumlah yang hilang berarti: kurangkan dari jumlahnya'), ok: null },
      { text: '( ) = 13 − 5 = 8', ok: null },
      { text: t('Don’t add: 5 + 13 = 18 — 13 is already the total, so subtract', 'Jangan menambah: 5 + 13 = 18 — 13 sudah jumlahnya, jadi harus dikurangi'), ok: false },
      { text: t('Check: 5 + 8 = 13', 'Cek: 5 + 8 = 13'), ok: true },
    ],
    final: t('The box is 8 (C).', 'Kotaknya adalah 8 (C).'),
    aria: t('Subtracting 5 from 13 gives 8.', 'Mengurangi 5 dari 13 menghasilkan 8.'),
  }
})

/** Q3 — pictograph: how many more blood-type-O students than type A. */
export const PictographDifference20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each icon is 1 student — count the O icons and the A icons, then compare by subtracting.', 'Setiap ikon = 1 siswa — hitung ikon O dan ikon A, lalu bandingkan dengan mengurangkan.'),
    items: [
      { text: t('The O row has more icons than the A row', 'Baris O punya lebih banyak ikon daripada baris A'), ok: null },
      { text: t('“How many more” means subtract: O count − A count', '“Berapa lebih banyak” berarti kurangkan: jumlah O − jumlah A'), ok: null },
      { text: t('Don’t answer 7 — that is the O count alone, not the difference', 'Jangan jawab 7 — itu jumlah O saja, bukan selisihnya'), ok: false },
      { text: t('O count − A count = 6', 'jumlah O − jumlah A = 6'), ok: true },
    ],
    final: t('O has 6 more students than A (B).', 'O punya 6 siswa lebih banyak daripada A (B).'),
    aria: t('Subtracting the type-A count from the type-O count gives 6.', 'Mengurangi jumlah golongan A dari jumlah golongan O menghasilkan 6.'),
  }
})

/** Q4 — which 2-digit figure is largest: compare tens first. */
export const LargestTwoDigit20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('For 2-digit numbers, the tens digit decides the size first.', 'Untuk bilangan dua angka, angka puluhan menentukan besarnya lebih dulu.'),
    items: [
      { text: t('Find the figure with the biggest tens digit', 'Cari gambar dengan angka puluhan terbesar'), ok: null },
      { text: t('If the tens are tied, the bigger ones digit wins', 'Jika puluhannya sama, angka satuan yang lebih besar menang'), ok: null },
      { text: t('Don’t be fooled by a big ones digit — a smaller tens digit still makes the number smaller', 'Jangan tertipu angka satuan besar — angka puluhan lebih kecil tetap membuat bilangannya lebih kecil'), ok: false },
      { text: t('Figure C has the biggest number', 'Gambar C punya bilangan terbesar'), ok: true },
    ],
    final: t('Figure C is the largest (C).', 'Gambar C yang paling besar (C).'),
    aria: t('Comparing tens digits first, Figure C holds the largest number.', 'Membandingkan angka puluhan dulu, Gambar C memuat bilangan terbesar.'),
  }
})

/** Q5 — 10 days after 8/25: count to end of August, then into September. */
export const DateRollover20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count to the end of August first, then into September.', 'Hitung sampai akhir Agustus dulu, lalu masuk September.'),
    items: [
      { text: t('From Aug 25 to the end of August: 31 − 25 = 6 days', 'Dari 25 Agustus ke akhir Agustus: 31 − 25 = 6 hari'), ok: null },
      { text: t('Those 6 use part of the 10: 10 − 6 = 4 days left', '6 hari itu memakai sebagian dari 10: 10 − 6 = 4 hari tersisa'), ok: null },
      { text: t('Don’t forget August’s 31st — skipping it would push you to 9/5', 'Jangan lupa tanggal 31 Agustus — melewatkannya akan mendorong ke 4/9 yang keliru jadi 5/9'), ok: false },
      { text: t('The 4 leftover days land on Sep 1, 2, 3, 4', '4 hari sisa jatuh di 1, 2, 3, 4 September'), ok: true },
    ],
    final: t('10 days after 8/25 is 9/4 (C).', '10 hari setelah 25/8 adalah 4/9 (C).'),
    aria: t('Six days finish August and four more reach September fourth.', 'Enam hari menyelesaikan Agustus dan empat lagi mencapai 4 September.'),
  }
})

/** Q7 — which number makes 75 < □ < 90 true: check each end. */
export const BetweenBounds20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The box must be bigger than 75 AND smaller than 90 — test each choice.', 'Kotak harus lebih besar dari 75 DAN lebih kecil dari 90 — uji tiap pilihan.'),
    items: [
      { text: t('48 is too small (not bigger than 75)', '48 terlalu kecil (tidak lebih dari 75)'), ok: false },
      { text: t('69 is too small (not bigger than 75)', '69 terlalu kecil (tidak lebih dari 75)'), ok: false },
      { text: t('93 is too big (not smaller than 90)', '93 terlalu besar (tidak kurang dari 90)'), ok: false },
      { text: t('81 sits between 75 and 90', '81 berada di antara 75 dan 90'), ok: true },
    ],
    final: t('81 fits 75 < □ < 90 (B).', '81 memenuhi 75 < □ < 90 (B).'),
    aria: t('Only 81 is both bigger than 75 and smaller than 90.', 'Hanya 81 yang lebih besar dari 75 sekaligus lebih kecil dari 90.'),
  }
})

/** Q10 — Gary is 4th with 6 behind: add the front group to the back. */
export const LineCount20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the front group (including Gary) to the people behind him.', 'Tambahkan kelompok depan (termasuk Gary) dengan orang di belakangnya.'),
    items: [
      { text: t('Gary being 4th means 4 people are in front, including Gary', 'Gary urutan ke-4 berarti ada 4 orang di depan, termasuk Gary'), ok: null },
      { text: t('There are 6 more people behind him', 'Ada 6 orang lagi di belakangnya'), ok: null },
      { text: t('Don’t answer 9 — that forgets to count Gary himself', 'Jangan jawab 9 — itu lupa menghitung Gary sendiri'), ok: false },
      { text: '4 + 6 = 10', ok: true },
    ],
    final: t('There are 10 people in line (A).', 'Ada 10 orang dalam antrean (A).'),
    aria: t('Four up to Gary plus six behind makes ten.', 'Empat sampai Gary plus enam di belakang menjadi sepuluh.'),
  }
})

/** Q11 — how many numbers hide in 3, 7, 11, 15, ..., 39, 43, 47: continue +4. */
export const SequenceGap20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The numbers go up by 4 each step — continue the pattern through the gap.', 'Bilangan naik 4 tiap langkah — lanjutkan polanya melewati yang kosong.'),
    items: [
      { text: t('Keep adding 4 after 15: 19, 23, 27, 31, 35, then 39', 'Terus tambah 4 setelah 15: 19, 23, 27, 31, 35, lalu 39'), ok: null },
      { text: t('The hidden numbers between 15 and 39 are 19, 23, 27, 31, 35', 'Bilangan tersembunyi antara 15 dan 39 adalah 19, 23, 27, 31, 35'), ok: null },
      { text: t('Don’t stop one early at 4 — there are 5 numbers in the gap', 'Jangan berhenti satu terlalu cepat di 4 — ada 5 bilangan di yang kosong'), ok: false },
      { text: t('That is 5 missing numbers', 'Itu 5 bilangan yang hilang'), ok: true },
    ],
    final: t('5 numbers are missing (B).', '5 bilangan yang hilang (B).'),
    aria: t('Continuing the plus-four pattern, five numbers fill the gap.', 'Melanjutkan pola tambah empat, lima bilangan mengisi yang kosong.'),
  }
})

/** Q12 — icon equations: solve one icon, substitute, then add to 10. */
export const IconEquations20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each icon is a hidden number — solve one icon, substitute, then add.', 'Setiap ikon mewakili bilangan tersembunyi — cari satu ikon, substitusikan, lalu jumlahkan.'),
    items: [
      { text: t('Use the simpler equation to find one icon’s value first', 'Pakai persamaan yang lebih mudah untuk cari nilai satu ikon dulu'), ok: null },
      { text: t('Put that value into the next equation to find the other icon', 'Masukkan nilai itu ke persamaan berikutnya untuk cari ikon lainnya'), ok: null },
      { text: t('Don’t stop at 8 — that uses only one equation and skips the second substitution', 'Jangan berhenti di 8 — itu memakai satu persamaan saja dan melewatkan substitusi kedua'), ok: false },
      { text: t('Add the requested icons together to get 10', 'Jumlahkan ikon yang diminta untuk mendapat 10'), ok: true },
    ],
    final: t('The requested sum of icons is 10 (B).', 'Jumlah ikon yang diminta adalah 10 (B).'),
    aria: t('Solving one icon and substituting, the requested sum is ten.', 'Mencari satu ikon dan mensubstitusi, jumlah yang diminta adalah sepuluh.'),
  }
})

/** Q13 — bus: 15 start, 7 off, 8 on: subtract leavers, then add joiners. */
export const BusPassengers20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract those who get off, then add those who get on, in order.', 'Kurangi yang turun, lalu tambah yang naik, secara berurutan.'),
    items: [
      { text: t('Start with 15 passengers', 'Mulai dengan 15 penumpang'), ok: null },
      { text: t('7 get off: 15 − 7 = 8', '7 turun: 15 − 7 = 8'), ok: null },
      { text: t('8 get on: 8 + 8 = 16', '8 naik: 8 + 8 = 16'), ok: null },
      { text: '15 − 7 + 8 = 16', ok: true },
    ],
    final: t('There are 16 passengers now (D).', 'Sekarang ada 16 penumpang (D).'),
    aria: t('Fifteen minus seven plus eight is sixteen.', 'Lima belas dikurangi tujuh ditambah delapan adalah enam belas.'),
  }
})

/** Q14 — basketball points: multiply count by value, then add. */
export const BasketballPoints20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply each shot count by its point value, then add the totals.', 'Kalikan banyaknya tembakan dengan nilai angkanya, lalu jumlahkan totalnya.'),
    items: [
      { text: t('Three-point shots: 2 × 3 = 6', 'Tembakan tiga angka: 2 × 3 = 6'), ok: null },
      { text: t('Two-point shots: 4 × 2 = 8', 'Tembakan dua angka: 4 × 2 = 8'), ok: null },
      { text: t('One-point shots: 3 × 1 = 3', 'Tembakan satu angka: 3 × 1 = 3'), ok: null },
      { text: '6 + 8 + 3 = 17', ok: true },
    ],
    final: t('James gets 17 points (B).', 'James memperoleh 17 angka (B).'),
    aria: t('Weighting each shot by its points, the total is seventeen.', 'Mengalikan tiap tembakan dengan nilainya, totalnya tujuh belas.'),
  }
})

/** Q15 — candies: find the total first, then subtract what's left. */
export const CandyTotal20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find how many candies Anna started with, then subtract what is left.', 'Cari permen awal Anna, lalu kurangi sisanya.'),
    items: [
      { text: t('5 eaten + 11 left = 16 to start', '5 dimakan + 11 sisa = 16 untuk mulai'), ok: null },
      { text: t('She always starts from 16 candies', 'Dia selalu mulai dari 16 permen'), ok: null },
      { text: t('Don’t reuse 11 — with 7 left you must recompute', 'Jangan memakai ulang 11 — dengan sisa 7 harus hitung ulang'), ok: false },
      { text: t('Now 7 are left: 16 − 7 = 9', 'Sekarang sisa 7: 16 − 7 = 9'), ok: true },
    ],
    final: t('□ = 9 (A).', '□ = 9 (A).'),
    aria: t('Starting from sixteen with seven left, she ate nine.', 'Mulai dari enam belas dengan sisa tujuh, dia makan sembilan.'),
  }
})

/** Q16 — 1 − 2 + 3 − ... + 9: pair the terms, then add the leftover. */
export const AlternatingSum20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair the terms — each pair is −1 — then add the leftover.', 'Pasangkan suku-sukunya — tiap pasangan −1 — lalu tambahkan sisanya.'),
    items: [
      { text: t('Make pairs: (1 − 2), (3 − 4), (5 − 6), (7 − 8)', 'Buat pasangan: (1 − 2), (3 − 4), (5 − 6), (7 − 8)'), ok: null },
      { text: t('Each pair is −1, and there are 4 pairs: 4 × (−1) = −4', 'Tiap pasangan −1, ada 4 pasangan: 4 × (−1) = −4'), ok: null },
      { text: t('Don’t miscount to 3 pairs — that wrongly gives 6', 'Jangan salah hitung jadi 3 pasangan — itu keliru jadi 6'), ok: false },
      { text: t('The 9 has no partner: −4 + 9 = 5', 'Angka 9 tak punya pasangan: −4 + 9 = 5'), ok: true },
    ],
    final: t('1 − 2 + 3 − 4 + 5 − 6 + 7 − 8 + 9 = 5 (B).', '1 − 2 + 3 − 4 + 5 − 6 + 7 − 8 + 9 = 5 (B).'),
    aria: t('Four pairs of minus one plus a leftover nine is five.', 'Empat pasangan minus satu plus sisa sembilan adalah lima.'),
  }
})

/** Q17 — storybook: add the known days, then subtract from the total. */
export const StorybookPages20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the first two days, then subtract from the whole book.', 'Jumlahkan dua hari pertama, lalu kurangi dari seluruh buku.'),
    items: [
      { text: t('Add the first two days: 13 + 9 = 22 pages read', 'Jumlahkan dua hari pertama: 13 + 9 = 22 halaman dibaca'), ok: null },
      { text: t('The whole book is 48 pages', 'Seluruh buku ada 48 halaman'), ok: null },
      { text: t('Don’t remove only one day — both day one and day two must be subtracted', 'Jangan kurangi satu hari saja — halaman hari satu dan hari dua keduanya harus dikurangi'), ok: false },
      { text: t('Day three is the rest: 48 − 22 = 26', 'Hari ketiga adalah sisanya: 48 − 22 = 26'), ok: true },
    ],
    final: t('Jenny reads 26 pages on day three (A).', 'Jenny membaca 26 halaman pada hari ketiga (A).'),
    aria: t('Twenty-two pages in two days leaves twenty-six for day three.', 'Dua puluh dua halaman dalam dua hari menyisakan dua puluh enam untuk hari ketiga.'),
  }
})

/** Q18 — four clocks ring at 12: closest current time to 12 rings first. */
export const ClockRingsFirst20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('All clocks ring at 12 — the one closest to 12 reaches it soonest.', 'Semua jam berbunyi pukul 12 — yang paling dekat ke 12 mencapainya paling cepat.'),
    items: [
      { text: t('The clock showing the time closest to 12 needs the least time to get there', 'Jam yang menunjukkan waktu paling dekat ke 12 butuh waktu paling sedikit'), ok: null },
      { text: t('Compare how far each clock’s hands are from 12', 'Bandingkan seberapa jauh jarum tiap jam dari 12'), ok: null },
      { text: t('Don’t pick the clock farthest from 12 — it takes the longest and rings last', 'Jangan pilih jam yang paling jauh dari 12 — itu butuh paling lama dan berbunyi terakhir'), ok: false },
      { text: t('Figure C is nearest to 12', 'Gambar C paling dekat ke 12'), ok: true },
    ],
    final: t('Figure C rings first (C).', 'Gambar C berbunyi lebih dulu (C).'),
    aria: t('The clock already nearest to twelve rings first, Figure C.', 'Jam yang sudah paling dekat ke dua belas berbunyi lebih dulu, Gambar C.'),
  }
})

/** Q20 — four boxed equations: solve each, then add the answers. */
export const FourBoxesSum20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve each equation, then add the four answers.', 'Selesaikan tiap persamaan, lalu jumlahkan keempat jawabannya.'),
    items: [
      { text: '( ) + 6 = 11 → 11 − 6 = 5', ok: null },
      { text: '8 + 5 = ( ) → 13', ok: null },
      { text: '( ) − 2 = 10 → 12   ( ) − 6 = 7 → 13', ok: null },
      { text: '5 + 13 + 12 + 13 = 43', ok: true },
    ],
    final: t('The four missing numbers add to 43 (D).', 'Keempat bilangan yang hilang berjumlah 43 (D).'),
    aria: t('Solving each box and adding gives forty-three.', 'Menyelesaikan tiap kotak lalu menjumlahkan menghasilkan empat puluh tiga.'),
  }
})

/** Q21 — pigeonhole: get more candies than colors to force a match. */
export const PigeonholeCandies20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Plan for the worst luck — every candy a new color until you must repeat.', 'Bayangkan paling sial — tiap permen warna baru sampai pasti ada yang sama.'),
    items: [
      { text: t('Only 7 colors, so 7 different-colored candies is the most without a match', 'Hanya ada 7 warna, jadi 7 permen beda warna adalah maksimum tanpa pasangan'), ok: null },
      { text: t('3 turns = 6 candies — could still be all different, no guaranteed match', '3 giliran = 6 permen — bisa semua beda, belum dijamin ada yang sama'), ok: false },
      { text: t('4 turns = 8 candies', '4 giliran = 8 permen'), ok: null },
      { text: t('8 candies among 7 colors must repeat a color', '8 permen di antara 7 warna pasti ada yang sama'), ok: true },
    ],
    final: t('You need 4 times to be sure (C).', 'Perlu 4 kali untuk memastikan (C).'),
    aria: t('Eight candies among seven colors force a match, so four turns are needed.', 'Delapan permen di antara tujuh warna memaksa ada yang sama, jadi perlu empat giliran.'),
  }
})

/** Q23 — place 0,1,2,3,7,8,9 once each across two equations; find the star. */
export const DigitPlacement20P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each digit 0,1,2,3,7,8,9 is used exactly once across both equations.', 'Tiap angka 0,1,2,3,7,8,9 dipakai tepat sekali di kedua persamaan.'),
    items: [
      { text: t('The first sum makes a 2-digit answer, so two single digits add past 9 (like 8 + 9 = 17)', 'Persamaan pertama berhasil 2 angka, jadi dua angka satuan dijumlah melewati 9 (seperti 8 + 9 = 17)'), ok: null },
      { text: t('Use the leftover digits to make the subtraction true', 'Pakai angka sisa untuk membuat pengurangannya benar'), ok: null },
      { text: t('Don’t guess 2 just because it is small — only one full placement works', 'Jangan menebak 2 hanya karena kecil — hanya satu penempatan penuh yang cocok'), ok: false },
      { text: t('The only fit leaves 7 as the star digit', 'Satu-satunya yang cocok menyisakan 7 sebagai angka bintang'), ok: true },
    ],
    final: t('The star is 7 (C).', 'Bintangnya 7 (C).'),
    aria: t('The unique placement of the seven digits makes the star equal seven.', 'Penempatan tunggal ketujuh angka membuat bintang sama dengan tujuh.'),
  }
})
