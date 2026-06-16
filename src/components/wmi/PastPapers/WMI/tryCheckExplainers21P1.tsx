import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-21P1A (2021 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 5 + 8 by making a ten first. */
export const MakeTenAdd21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Make a ten first, then add on what is left.', 'Buat sepuluh dulu, lalu tambahkan sisanya.'),
    items: [
      { text: t('8 needs 2 more to make ten, so borrow 2 from the 5: 8 + 2 = 10', '8 butuh 2 lagi jadi sepuluh, jadi pinjam 2 dari angka 5: 8 + 2 = 10'), ok: null },
      { text: t('That leaves 5 − 2 = 3, so 10 + 3 = 13', 'Sisa 5 − 2 = 3, jadi 10 + 3 = 13'), ok: null },
      { text: t('Don’t overshoot to 17 — that adds 4 too many past ten', 'Jangan kelebihan jadi 17 — itu menambah 4 lewat sepuluh'), ok: false },
      { text: '5 + 8 = 13', ok: true },
    ],
    final: t('5 + 8 = 13 (A).', '5 + 8 = 13 (A).'),
    aria: t('Making a ten then adding three, 5 plus 8 is 13.', 'Membuat sepuluh lalu menambah tiga, 5 ditambah 8 adalah 13.'),
  }
})

/** Q2 — 14 − ( ) = 6: undo the subtraction. */
export const MissingSubtrahend21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The blank is what we take from 14 to land on 6 — so subtract.', 'Isi kurung adalah yang dikurangkan dari 14 supaya hasilnya 6 — jadi kurangi.'),
    items: [
      { text: t('The blank = 14 − 6', 'Isi kurung = 14 − 6'), ok: null },
      { text: '14 − 6 = 8', ok: null },
      { text: t('Don’t add: 14 + 4 = 18 is going the wrong way', 'Jangan menjumlah: 14 + 4 = 18 arahnya salah'), ok: false },
      { text: t('Check: 14 − 8 = 6', 'Cek: 14 − 8 = 6'), ok: true },
    ],
    final: t('The blank is 8 (C).', 'Isi kurungnya 8 (C).'),
    aria: t('Subtracting 6 from 14 gives 8.', 'Mengurangi 6 dari 14 menghasilkan 8.'),
  }
})

/** Q4 — difference of largest and smallest among 8, 2, 11, 3, 9, 17. */
export const MaxMinDifference21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the biggest and smallest in the list, then subtract.', 'Cari yang terbesar dan terkecil di daftar, lalu kurangi.'),
    items: [
      { text: t('Largest is 17, smallest is 2', 'Terbesar 17, terkecil 2'), ok: null },
      { text: t('Difference means subtract: 17 − 2 = 15', 'Selisih berarti kurangi: 17 − 2 = 15'), ok: null },
      { text: t('Don’t use 11 as the largest: 11 − 2 = 9 is wrong, 17 is bigger', 'Jangan pakai 11 sebagai terbesar: 11 − 2 = 9 salah, 17 lebih besar'), ok: false },
      { text: '17 − 2 = 15', ok: true },
    ],
    final: t('The difference is 15 (C).', 'Selisihnya 15 (C).'),
    aria: t('Subtracting the smallest 2 from the largest 17 gives 15.', 'Mengurangi yang terkecil 2 dari yang terbesar 17 menghasilkan 15.'),
  }
})

/** Q5 — neighbours of a triangle sum to 16; the row counts 1,2,3,... */
export const TriangleNeighbours21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('2 sits between 1 and 3, so the row just counts up by one — a number’s neighbours are one less and one more.', '2 berada di antara 1 dan 3, jadi barisnya naik satu-satu — tetangga sebuah bilangan satu lebih kecil dan satu lebih besar.'),
    items: [
      { text: t('Neighbours add to (triangle − 1) + (triangle + 1) = twice the triangle', 'Tetangga berjumlah (segitiga − 1) + (segitiga + 1) = dua kali segitiga'), ok: null },
      { text: t('So 2 × triangle = 16', 'Jadi 2 × segitiga = 16'), ok: null },
      { text: t('Don’t forget to halve: 9 leaves the sum at 16 without dividing', 'Jangan lupa membagi dua: 9 membiarkan jumlah 16 tanpa dibagi'), ok: false },
      { text: t('triangle = 16 ÷ 2 = 8', 'segitiga = 16 ÷ 2 = 8'), ok: true },
    ],
    final: t('The triangle is 8 (B).', 'Segitiganya 8 (B).'),
    aria: t('The neighbours sum to twice the triangle, so 16 halved is 8.', 'Tetangga berjumlah dua kali segitiga, jadi 16 dibagi dua adalah 8.'),
  }
})

/** Q6 — calendar: square (Sat wk2) minus triangle (Wed wk1). */
export const CalendarDifference21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Step along the calendar one day at a time to find each date, then subtract.', 'Maju di kalender satu hari demi satu hari untuk menemukan tiap tanggal, lalu kurangi.'),
    items: [
      { text: t('Week 1: Monday is 5, so Wednesday is 5 + 2 = 7. Triangle = 7', 'Minggu 1: Senin = 5, jadi Rabu = 5 + 2 = 7. Segitiga = 7'), ok: null },
      { text: t('Week 2: Thursday is 15, so Saturday is 15 + 2 = 17. Square = 17', 'Minggu 2: Kamis = 15, jadi Sabtu = 15 + 2 = 17. Persegi = 17'), ok: null },
      { text: t('Don’t miscount the day gaps — that wrongly gives 12', 'Jangan salah menghitung jarak hari — itu keliru jadi 12'), ok: false },
      { text: t('Square − triangle = 17 − 7 = 10', 'Persegi − segitiga = 17 − 7 = 10'), ok: true },
    ],
    final: t('Square − triangle = 10 (B).', 'Persegi − segitiga = 10 (B).'),
    aria: t('The square is 17 and the triangle is 7, so the difference is 10.', 'Persegi 17 dan segitiga 7, jadi selisihnya 10.'),
  }
})

/** Q7 — table: how many fewer in Week 1 than Week 2 for the asked appliance. */
export const SalesGap21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Read the asked appliance’s column, then subtract Week 1 from the bigger Week 2.', 'Baca kolom peralatan yang ditanya, lalu kurangkan Minggu 1 dari Minggu 2 yang lebih besar.'),
    items: [
      { text: t('Its Week 1 sales were 5 and its Week 2 sales were 16', 'Penjualan Minggu 1-nya 5 dan Minggu 2-nya 16'), ok: null },
      { text: t('“How many fewer in Week 1” means Week 2 − Week 1: 16 − 5', '“Berapa lebih sedikit di Minggu 1” berarti Minggu 2 − Minggu 1: 16 − 5'), ok: null },
      { text: t('Don’t read the wrong row pair — that gives 6 instead', 'Jangan membaca pasangan baris yang salah — itu memberi 6'), ok: false },
      { text: '16 − 5 = 11', ok: true },
    ],
    final: t('11 fewer units in Week 1 (D).', '11 unit lebih sedikit di Minggu 1 (D).'),
    aria: t('The appliance jumps from 5 to 16, a gap of 11.', 'Peralatan itu naik dari 5 ke 16, selisihnya 11.'),
  }
})

/** Q8 — 58 < (box)6 < 72, units digit 6; find the box. */
export const InRangeUnitsSix21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the numbers ending in 6, then keep the one strictly between 58 and 72.', 'Daftar bilangan yang berakhir 6, lalu simpan yang ada di antara 58 dan 72.'),
    items: [
      { text: t('Candidates ending in 6: 56, 66, 76', 'Kandidat berakhir 6: 56, 66, 76'), ok: null },
      { text: t('56 is too small — it is not bigger than 58', '56 terlalu kecil — tidak lebih besar dari 58'), ok: false },
      { text: t('76 is too big — it is not smaller than 72', '76 terlalu besar — tidak lebih kecil dari 72'), ok: false },
      { text: t('Only 66 fits, so the box is 6', 'Hanya 66 yang cocok, jadi isi kotaknya 6'), ok: true },
    ],
    final: t('The box digit is 6 (B).', 'Angka kotaknya 6 (B).'),
    aria: t('Only 66 sits between 58 and 72, so the box is 6.', 'Hanya 66 yang ada di antara 58 dan 72, jadi kotaknya 6.'),
  }
})

/** Q9 — ages sum to 15 this year; the sum next year. */
export const AgesNextYear21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both people age one year, so the sum grows by two, not one.', 'Kedua orang bertambah satu tahun, jadi jumlahnya naik dua, bukan satu.'),
    items: [
      { text: t('Next year I am 1 older and my brother is 1 older too', 'Tahun depan saya bertambah 1 dan adik saya juga bertambah 1'), ok: null },
      { text: t('That adds 2 to the total: 15 + 2', 'Itu menambah 2 ke jumlahnya: 15 + 2'), ok: null },
      { text: t('Don’t add only 1: 16 forgets that BOTH of us get older', 'Jangan menambah hanya 1: 16 lupa bahwa KAMI berdua bertambah umur'), ok: false },
      { text: '15 + 2 = 17', ok: true },
    ],
    final: t('Next year the sum is 17 (D).', 'Tahun depan jumlahnya 17 (D).'),
    aria: t('Two people each age one year, so 15 becomes 17.', 'Dua orang masing-masing bertambah satu tahun, jadi 15 menjadi 17.'),
  }
})

/** Q11 — 2-digit number ≤ 20, units = tens + 2; find the units digit. */
export const UnitsDigitUnderTwenty21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pin the tens digit from the size limit, then build the units.', 'Kunci angka puluhan dari batas ukurannya, lalu cari satuannya.'),
    items: [
      { text: t('Not larger than 20 means the tens digit is 1 (the number is 10 to 20)', 'Tidak lebih dari 20 berarti angka puluhannya 1 (bilangannya 10 sampai 20)'), ok: null },
      { text: t('Units = tens + 2 = 1 + 2 = 3, making the number 13', 'Satuan = puluhan + 2 = 1 + 2 = 3, sehingga bilangannya 13'), ok: null },
      { text: t('Don’t pick 5: that needs tens 3, making 35, which is over 20', 'Jangan pilih 5: itu butuh puluhan 3, jadi 35, yang lebih dari 20'), ok: false },
      { text: t('13 is not larger than 20, so the units digit is 3', '13 tidak lebih dari 20, jadi angka satuannya 3'), ok: true },
    ],
    final: t('The units digit is 3 (B).', 'Angka satuannya 3 (B).'),
    aria: t('The number must be 13, so its units digit is 3.', 'Bilangannya pasti 13, jadi angka satuannya 3.'),
  }
})

/** Q14 — fewest matchsticks for 4 identical squares sharing sides. */
export const SharedSideSquares21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Like the 2 triangles sharing a side, line the squares up so neighbours share sides.', 'Seperti 2 segitiga yang berbagi sisi, susun persegi berderet agar tetangganya berbagi sisi.'),
    items: [
      { text: t('One square alone needs 4 sticks, so 4 separate squares need 16', 'Satu persegi sendiri butuh 4 batang, jadi 4 persegi terpisah butuh 16'), ok: null },
      { text: t('Stand them in a row so each pair shares one side — that saves 3 sticks', 'Susun sebaris agar tiap pasang berbagi satu sisi — itu menghemat 3 batang'), ok: null },
      { text: t('Don’t build them separately: 16 wastes the shared sides', 'Jangan membuatnya terpisah: 16 menyia-nyiakan sisi yang berbagi'), ok: false },
      { text: '16 − 3 = 12', ok: true },
    ],
    final: t('At least 12 matchsticks are needed (B).', 'Paling sedikit dibutuhkan 12 batang korek api (B).'),
    aria: t('Sharing three sides among four squares in a row needs only 12 sticks.', 'Berbagi tiga sisi di antara empat persegi sebaris hanya butuh 12 batang.'),
  }
})

/** Q15 — 6 different catches, none over 10, Tim the fewest; most Tim can have. */
export const MaximizeTheSmallest21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('To let Tim catch as many as possible, push the other five as high as they can go.', 'Agar Tim bisa sebanyak mungkin, buat lima teman lainnya setinggi mungkin.'),
    items: [
      { text: t('Six different catches, none over 10 — give the friends 10, 9, 8, 7, 6', 'Enam tangkapan berbeda, tidak ada di atas 10 — beri teman-teman 10, 9, 8, 7, 6'), ok: null },
      { text: t('Tim must be fewer than 6 and different from all', 'Tim harus kurang dari 6 dan berbeda dari semua'), ok: null },
      { text: t('Don’t stop at 4: the friends only need 6, 7, 8, 9, 10, so 5 stays open', 'Jangan berhenti di 4: teman-teman hanya perlu 6, 7, 8, 9, 10, jadi 5 masih kosong'), ok: false },
      { text: t('The largest Tim can take is 5', 'Paling besar yang bisa diambil Tim adalah 5'), ok: true },
    ],
    final: t('Tim catches at most 5 fish (D).', 'Tim paling banyak menangkap 5 ikan (D).'),
    aria: t('With friends at 10 down to 6, Tim can catch at most 5.', 'Dengan teman-teman 10 sampai 6, Tim paling banyak menangkap 5.'),
  }
})

/** Q18 — interleaved sequence 1,2,_,6,5,10,7,_,9; sum of the two blanks. */
export const InterleavedBlanks21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Unweave the two alternating sequences, find each blank, then add.', 'Pisahkan dua barisan yang berselang, temukan tiap blank, lalu jumlahkan.'),
    items: [
      { text: t('Odd spots 1, _, 5, 7, 9 are the odd numbers, so the first blank is 3', 'Posisi ganjil 1, _, 5, 7, 9 adalah bilangan ganjil, jadi blank pertama 3'), ok: null },
      { text: t('Even spots 2, 6, 10, _ go up by 4, so the second blank is 14', 'Posisi genap 2, 6, 10, _ naik 4-4, jadi blank kedua 14'), ok: null },
      { text: t('Don’t stop the +4 chain at 8: 3 + 8 = 11 misses the real 14', 'Jangan menghentikan deret +4 di 8: 3 + 8 = 11 melewatkan 14 yang benar'), ok: false },
      { text: '3 + 14 = 17', ok: true },
    ],
    final: t('The two blanks sum to 17 (B).', 'Jumlah dua blank adalah 17 (B).'),
    aria: t('The blanks are 3 and 14, so their sum is 17.', 'Blank-nya 3 dan 14, jadi jumlahnya 17.'),
  }
})

/** Q20 — how many times the digit 5 is written from 100 down to 1. */
export const CountDigitFive21P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the digit 5 by place value: the units place, then the tens place.', 'Hitung angka 5 per nilai tempat: posisi satuan, lalu posisi puluhan.'),
    items: [
      { text: t('5 in the units place: 5, 15, 25, …, 95 — that is 10 times', '5 di posisi satuan: 5, 15, 25, …, 95 — ada 10 kali'), ok: null },
      { text: t('5 in the tens place: 50, 51, …, 59 — that is 10 times', '5 di posisi puluhan: 50, 51, …, 59 — ada 10 kali'), ok: null },
      { text: t('Don’t count only the tens fives plus 55: that wrongly gives 11', 'Jangan menghitung hanya 5 di puluhan plus 55: itu keliru jadi 11'), ok: false },
      { text: '10 + 10 = 20', ok: true },
    ],
    final: t('The digit 5 is written 20 times (A).', 'Angka 5 ditulis 20 kali (A).'),
    aria: t('Ten fives in the units place and ten in the tens place make 20.', 'Sepuluh angka 5 di satuan dan sepuluh di puluhan menjadi 20.'),
  }
})
