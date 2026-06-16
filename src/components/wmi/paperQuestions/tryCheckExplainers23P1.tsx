import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-23P1A (2023 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination. Chains follow each question's
// hint_steps + breakdown faithfully and land on the keyed answer.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — order 55, 8, 29, 72 smallest to largest. */
export const OrderSmallToLarge23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare by place value: the one-digit number is smallest.', 'Bandingkan lewat nilai tempat: bilangan satu angka paling kecil.'),
    items: [
      { text: t('Smallest is the one-digit number: 8', 'Yang terkecil adalah bilangan satu angka: 8'), ok: null },
      { text: t('Then compare the two-digit ones by tens: 29, then 55, then 72', 'Lalu bandingkan yang dua angka lewat puluhannya: 29, lalu 55, lalu 72'), ok: null },
      { text: t('Don’t put 29 before 8 — 8 is smaller and must come first', 'Jangan menaruh 29 sebelum 8 — 8 lebih kecil dan harus duluan'), ok: false },
      { text: t('Lined up small to big: 8, 29, 55, 72', 'Diurutkan dari kecil ke besar: 8, 29, 55, 72'), ok: true },
    ],
    final: t('The order is 8, 29, 55, 72 (C).', 'Urutannya 8, 29, 55, 72 (C).'),
    aria: t('Sorting smallest to largest gives 8, 29, 55, 72.', 'Mengurutkan dari terkecil ke terbesar menghasilkan 8, 29, 55, 72.'),
  }
})

/** Q2 — which expression has the largest result? */
export const LargestSum23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute every sum, then pick the biggest total.', 'Hitung tiap penjumlahan, lalu pilih total terbesar.'),
    items: [
      { text: '30 + 4 = 34', ok: false },
      { text: '29 + 9 = 38', ok: false },
      { text: t('31 + 10 = 41 — looks big from the +10, but not the biggest', '31 + 10 = 41 — terlihat besar karena +10, tapi bukan yang terbesar'), ok: false },
      { text: '36 + 6 = 42', ok: true },
    ],
    final: t('36 + 6 = 42 is the largest (D).', '36 + 6 = 42 yang terbesar (D).'),
    aria: t('Adding each pair, 36 plus 6 gives the largest total, 42.', 'Menjumlahkan tiap pasangan, 36 tambah 6 memberi total terbesar, 42.'),
  }
})

/** Q3 — which pair has both numbers between 56 and 75? */
export const BothInRange23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both numbers must be bigger than 56 and smaller than 75 (57 to 74).', 'Kedua bilangan harus lebih besar dari 56 dan lebih kecil dari 75 (57 sampai 74).'),
    items: [
      { text: t('68, 47 → 68 fits but 47 is too small', '68, 47 → 68 muat tapi 47 terlalu kecil'), ok: false },
      { text: t('58, 82 → 82 is too big', '58, 82 → 82 terlalu besar'), ok: false },
      { text: t('51, 79 → 51 is too small', '51, 79 → 51 terlalu kecil'), ok: false },
      { text: t('60, 71 → both sit between 56 and 75', '60, 71 → keduanya ada di antara 56 dan 75'), ok: true },
    ],
    final: t('Only 60 and 71 both fit (B).', 'Hanya 60 dan 71 yang keduanya muat (B).'),
    aria: t('Testing both ends, only the pair 60 and 71 fits the range.', 'Menguji kedua ujung, hanya pasangan 60 dan 71 yang muat di rentang.'),
  }
})

/** Q4 — 30 minutes from now is 6:00; what time is it now? */
export const TimeBefore23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Now is 30 minutes before 6:00 — count backward in time.', 'Sekarang adalah 30 menit sebelum 6:00 — hitung mundur waktu.'),
    items: [
      { text: t('In 30 minutes it will be 6:00', 'Dalam 30 menit nanti akan pukul 6:00'), ok: null },
      { text: t('6:30 is 30 minutes AFTER six — but now comes before six', '6:30 itu 30 menit SETELAH pukul enam — padahal sekarang sebelum pukul enam'), ok: false },
      { text: t('6:00 minus 30 minutes is 5:30', '6:00 dikurangi 30 menit adalah 5:30'), ok: true },
    ],
    final: t('It is 5:30 now (D).', 'Sekarang pukul 5:30 (D).'),
    aria: t('Going back half an hour from six o’clock gives 5:30.', 'Mundur setengah jam dari pukul enam memberi 5:30.'),
  }
})

/** Q5 — odd, larger than 93, but not the largest 2-digit number. */
export const BoxRules23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Eliminate by each rule: bigger than 93, odd, and not the largest 2-digit number.', 'Coret berdasarkan tiap aturan: lebih dari 93, ganjil, dan bukan bilangan dua angka terbesar.'),
    items: [
      { text: t('87 → not bigger than 93', '87 → tidak lebih besar dari 93'), ok: false },
      { text: t('98 → even', '98 → genap'), ok: false },
      { text: t('99 → odd and above 93, but it IS the largest 2-digit number', '99 → ganjil dan di atas 93, tapi itu justru bilangan dua angka terbesar'), ok: false },
      { text: t('95 → odd, bigger than 93, and not 99', '95 → ganjil, lebih dari 93, dan bukan 99'), ok: true },
    ],
    final: t('Only 95 fits every rule (C).', 'Hanya 95 yang memenuhi tiap aturan (C).'),
    aria: t('After every rule, only 95 remains.', 'Setelah tiap aturan, hanya 95 yang tersisa.'),
  }
})

/** Q6 — sister is 6 younger than Jenny (22); how many years ago was she 8? */
export const YearsAgoAge23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the sister’s age now, then count back to 8.', 'Cari usia adik sekarang, lalu hitung mundur sampai 8.'),
    items: [
      { text: t('Sister’s age now: 22 − 6 = 16', 'Usia adik sekarang: 22 − 6 = 16'), ok: null },
      { text: t('Don’t use Jenny’s age: 22 − 8 = 14 is about Jenny, not the sister', 'Jangan pakai usia Jenny: 22 − 8 = 14 tentang Jenny, bukan adik'), ok: false },
      { text: t('Count back from 16 to 8: 16 − 8 = 8', 'Hitung mundur dari 16 ke 8: 16 − 8 = 8'), ok: true },
    ],
    final: t('8 years ago the sister was 8 (B).', '8 tahun yang lalu adik berusia 8 (B).'),
    aria: t('The sister is 16 now, so eight years ago she was eight.', 'Adik sekarang 16, jadi delapan tahun lalu ia berusia delapan.'),
  }
})

/** Q7 — which list has a different step than the others? */
export const OddPattern23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the step size of each list — three share one rule.', 'Bandingkan besar langkah tiap daftar — tiga berbagi satu aturan.'),
    items: [
      { text: t('11, 13, 15, 17, 19 → steps +2 (all odd, but still +2)', '11, 13, 15, 17, 19 → langkah +2 (semua ganjil, tapi tetap +2)'), ok: false },
      { text: t('57, 59, 61, 63, 65 → steps +2', '57, 59, 61, 63, 65 → langkah +2'), ok: false },
      { text: t('4, 6, 8, 10, 12 → steps +2', '4, 6, 8, 10, 12 → langkah +2'), ok: false },
      { text: t('42, 45, 48, 51, 54 → steps +3 — different', '42, 45, 48, 51, 54 → langkah +3 — berbeda'), ok: true },
    ],
    final: t('List A steps by 3, the odd one out (A).', 'Daftar A naik 3, yang berbeda (A).'),
    aria: t('A steps up by three while the others step by two.', 'A naik tiga sedangkan yang lain naik dua.'),
  }
})

/** Q8 — which MF player scores the fewest goals? */
export const FewestMfGoals23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Filter to the MF players first, then find the smallest goal count.', 'Saring dulu ke pemain MF, lalu cari jumlah gol terkecil.'),
    items: [
      { text: t('Keep only the MF players: Clay, Denny, Evan', 'Ambil hanya pemain MF: Clay, Denny, Evan'), ok: null },
      { text: t('Beck plays CF, not MF — can’t be the answer', 'Beck bermain CF, bukan MF — tidak bisa jadi jawaban'), ok: false },
      { text: t('Among Clay, Denny, Evan, the fewest goals is Denny', 'Di antara Clay, Denny, Evan, gol paling sedikit adalah Denny'), ok: true },
    ],
    final: t('Denny scores the fewest among the MFs (C).', 'Denny mencetak gol paling sedikit di antara MF (C).'),
    aria: t('Keeping only midfielders, Denny has the fewest goals.', 'Mengambil hanya gelandang, Denny golnya paling sedikit.'),
  }
})

/** Q9 — third card to the right of card 8 in 15, 8, 11, 3, 9, 20, 12. */
export const ThirdCardRight23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find card 8, then step three places to the right.', 'Cari kartu 8, lalu melangkah tiga tempat ke kanan.'),
    items: [
      { text: t('Card 8 is second from the left', 'Kartu 8 kedua dari kiri'), ok: null },
      { text: t('1st right is 11, 2nd right is 3', 'Kanan ke-1 adalah 11, kanan ke-2 adalah 3'), ok: null },
      { text: t('Don’t stop at the 2nd card 3 — we need the 3rd', 'Jangan berhenti di kartu ke-2 yaitu 3 — kita butuh yang ke-3'), ok: false },
      { text: t('3rd right is 9', 'Kanan ke-3 adalah 9'), ok: true },
    ],
    final: t('The third card to the right is 9 (A).', 'Kartu ketiga di kanan adalah 9 (A).'),
    aria: t('Stepping three cards right from 8 lands on 9.', 'Melangkah tiga kartu ke kanan dari 8 mendarat di 9.'),
  }
})

/** Q11 — Diamond + 10 + Diamond + 20 = 90; find Diamond. */
export const DiamondValue23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract the known numbers, then halve what remains.', 'Kurangi bilangan yang diketahui, lalu bagi dua sisanya.'),
    items: [
      { text: t('Add the plain numbers: 10 + 20 = 30', 'Jumlahkan bilangan biasa: 10 + 20 = 30'), ok: null },
      { text: t('Two Diamonds = 90 − 30 = 60', 'Dua Wajik = 90 − 30 = 60'), ok: null },
      { text: t('60 is two Diamonds together, not one', '60 itu dua Wajik sekaligus, bukan satu'), ok: false },
      { text: t('One Diamond = 60 ÷ 2 = 30', 'Satu Wajik = 60 ÷ 2 = 30'), ok: true },
    ],
    final: t('Diamond is 30 (B).', 'Wajik adalah 30 (B).'),
    aria: t('Two diamonds are sixty, so one diamond is thirty.', 'Dua wajik enam puluh, jadi satu wajik tiga puluh.'),
  }
})

/** Q12 — which row makes left < right? */
export const LessThanBox23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('“<” means the left side must be smaller — compute both sides.', '“<” berarti sisi kiri harus lebih kecil — hitung kedua sisi.'),
    items: [
      { text: t('20 − 5 vs 13 → 15 vs 13, left is bigger', '20 − 5 lawan 13 → 15 lawan 13, kiri lebih besar'), ok: false },
      { text: t('19 + 4 vs 15 + 7 → 23 vs 22, left is bigger', '19 + 4 lawan 15 + 7 → 23 lawan 22, kiri lebih besar'), ok: false },
      { text: t('17 vs 25 − 8 → 17 vs 17, equal (needs =, not <)', '17 lawan 25 − 8 → 17 lawan 17, sama (butuh =, bukan <)'), ok: false },
      { text: t('24 − 6 vs 15 + 6 → 18 vs 21, left is smaller', '24 − 6 lawan 15 + 6 → 18 lawan 21, kiri lebih kecil'), ok: true },
    ],
    final: t('Only C has left < right: 18 < 21 (C).', 'Hanya C yang kiri < kanan: 18 < 21 (C).'),
    aria: t('Computing both sides, only 18 is less than 21.', 'Menghitung kedua sisi, hanya 18 yang lebih kecil dari 21.'),
  }
})

/** Q13 — June 17 is Wednesday; O Wednesdays + [] Sundays in June. */
export const JuneWeekdays23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('June has 30 days; step by 7 to count each weekday.', 'Juni punya 30 hari; melangkah 7 untuk menghitung tiap hari.'),
    items: [
      { text: t('Wednesdays: 3, 10, 17, 24 → 4', 'Hari Rabu: 3, 10, 17, 24 → 4'), ok: null },
      { text: t('Sunday is 3 days before Wednesday, so June 14 is Sunday', 'Minggu jatuh 3 hari sebelum Rabu, jadi 14 Juni adalah Minggu'), ok: null },
      { text: t('Sundays: 7, 14, 21, 28 → 4', 'Hari Minggu: 7, 14, 21, 28 → 4'), ok: null },
      { text: t('O + [] = 4 + 4 = 8', 'O + [] = 4 + 4 = 8'), ok: true },
    ],
    final: t('There are 4 Wednesdays and 4 Sundays, so O + [] = 8 (B).', 'Ada 4 Rabu dan 4 Minggu, jadi O + [] = 8 (B).'),
    aria: t('Four Wednesdays plus four Sundays is eight.', 'Empat Rabu tambah empat Minggu adalah delapan.'),
  }
})

/** Q14 — paid $10 + $5 + $5, got back three $1's; price? */
export const StationeryPrice23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Price equals money paid minus the change.', 'Harga sama dengan uang dibayar dikurangi kembalian.'),
    items: [
      { text: t('Paid: $10 + $5 + $5 = $20', 'Dibayar: $10 + $5 + $5 = $20'), ok: null },
      { text: t('Change back: three $1’s = $3', 'Kembalian: tiga lembar $1 = $3'), ok: null },
      { text: t('Don’t add the change to the price — subtract it', 'Jangan menambahkan kembalian ke harga — kurangi'), ok: false },
      { text: t('Price = 20 − 3 = 17', 'Harga = 20 − 3 = 17'), ok: true },
    ],
    final: t('The stationery costs $17 (D).', 'Alat tulis itu seharga $17 (D).'),
    aria: t('Twenty dollars paid minus three dollars change is seventeen.', 'Dua puluh dolar dibayar dikurangi tiga dolar kembalian adalah tujuh belas.'),
  }
})

/** Q19 — 100 pearls; took 10, 10, 5; how many left? */
export const PearlsLeft23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total everything taken, then subtract once from 100.', 'Totalkan semua yang diambil, lalu kurangi sekali dari 100.'),
    items: [
      { text: t('Taken: 10 + 10 + 5 = 25', 'Diambil: 10 + 10 + 5 = 25'), ok: null },
      { text: t('Don’t forget a 10: that wrongly gives 100 − 15 = 85', 'Jangan lupa satu 10: itu keliru jadi 100 − 15 = 85'), ok: false },
      { text: t('100 − 25 = 75', '100 − 25 = 75'), ok: true },
    ],
    final: t('75 pearls are left (C).', '75 mutiara tersisa (C).'),
    aria: t('Removing twenty-five from a hundred leaves seventy-five.', 'Mengurangi dua puluh lima dari seratus menyisakan tujuh puluh lima.'),
  }
})

/** Q21 — 5 garages (3 type-1 or 5 type-2); 8 type-1, 18 type-2; left outside? */
export const GaragesLeftOutside23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Park the most cars: give the bigger-capacity type the garages first.', 'Parkir mobil sebanyak mungkin: beri garasi dulu ke jenis berkapasitas lebih besar.'),
    items: [
      { text: t('Splitting garages evenly leaves more cars outside', 'Membagi garasi rata menyisakan lebih banyak mobil di luar'), ok: false },
      { text: t('4 garages for type-2: 4 × 5 = 20 ≥ 18, all 18 park, 0 left', '4 garasi untuk jenis-2: 4 × 5 = 20 ≥ 18, semua 18 terparkir, sisa 0'), ok: null },
      { text: t('Last garage for type-1: 1 × 3 = 3, so 8 − 3 = 5 left', 'Garasi terakhir untuk jenis-1: 1 × 3 = 3, jadi 8 − 3 = 5 tersisa'), ok: null },
      { text: t('Left outside: 5 of type-1 and 0 of type-2', 'Tersisa di luar: 5 jenis-1 dan 0 jenis-2'), ok: true },
    ],
    final: t('5 of type-1 and 0 of type-2 are left outside (C).', '5 jenis-1 dan 0 jenis-2 tersisa di luar (C).'),
    aria: t('Using four garages for type two and one for type one leaves five and zero outside.', 'Memakai empat garasi untuk jenis dua dan satu untuk jenis satu menyisakan lima dan nol di luar.'),
  }
})

/** Q23 — grid path right/up from 5 to 5; find M − m. */
export const PathDifference23P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Every right/up path is the same length — find the greediest and stingiest sums.', 'Tiap jalur kanan/atas sama panjang — cari jumlah paling rakus dan paling hemat.'),
    items: [
      { text: t('Take the path through the biggest numbers: max sum M = 27', 'Ambil jalur lewat bilangan terbesar: jumlah terbesar M = 27'), ok: null },
      { text: t('Hug the 1’s for the smallest: min sum m = 21', 'Susuri angka 1 untuk yang terkecil: jumlah terkecil m = 21'), ok: null },
      { text: t('Only trying a couple of paths can mislead to 5', 'Mencoba hanya beberapa jalur bisa menyesatkan ke 5'), ok: false },
      { text: t('M − m = 27 − 21 = 6', 'M − m = 27 − 21 = 6'), ok: true },
    ],
    final: t('The difference M − m is 6 (D).', 'Selisih M − m adalah 6 (D).'),
    aria: t('The biggest path sum minus the smallest is twenty-seven minus twenty-one, which is six.', 'Jumlah jalur terbesar dikurangi terkecil adalah dua puluh tujuh dikurangi dua puluh satu, yaitu enam.'),
  }
})
