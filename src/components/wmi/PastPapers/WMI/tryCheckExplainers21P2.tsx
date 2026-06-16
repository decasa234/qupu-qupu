import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-21P2A (2021 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 42 − ( ) = 27: turn the subtraction around to find the box. */
export const MissingSubtrahend21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Turn the subtraction around: the box is what we take from 42 to leave 27.', 'Balik pengurangan: kotak itu yang dikurangkan dari 42 sampai tersisa 27.'),
    items: [
      { text: t('Something taken from 42 leaves 27, so the box is 42 − 27', 'Sesuatu dikurangkan dari 42 menyisakan 27, jadi kotak = 42 − 27'), ok: null },
      { text: '42 − 27 = 15', ok: null },
      { text: t('Don’t skip the borrow: a sloppy 42 − 27 gives 16, which is wrong', 'Jangan lupa meminjam: 42 − 27 asal-asalan jadi 16, itu salah'), ok: false },
      { text: t('Check: 42 − 15 = 27', 'Cek: 42 − 15 = 27'), ok: true },
    ],
    final: t('The box is 15 (B).', 'Kotaknya 15 (B).'),
    aria: t('Subtracting 27 from 42 gives 15.', 'Mengurangi 27 dari 42 menghasilkan 15.'),
  }
})

/** Q2 — 37 + 14 + 23: pair the numbers that make a round ten first. */
export const PairToRoundTen21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair the friendly numbers that make a round ten first.', 'Pasangkan bilangan yang menjadi puluhan bulat dulu.'),
    items: [
      { text: '37 + 23 = 60', ok: null },
      { text: '60 + 14 = 74', ok: null },
      { text: t('Don’t miscount the tens (3 + 1 + 2 = 6 tens, not 7) — that gives 84', 'Jangan salah menjumlah puluhan (3 + 1 + 2 = 6 puluhan, bukan 7) — itu jadi 84'), ok: false },
      { text: '37 + 14 + 23 = 74', ok: true },
    ],
    final: t('37 + 14 + 23 = 74 (A).', '37 + 14 + 23 = 74 (A).'),
    aria: t('Pairing 37 and 23 to make 60 then adding 14 gives 74.', 'Memasangkan 37 dan 23 menjadi 60 lalu menambah 14 menghasilkan 74.'),
  }
})

/** Q3 — which choice equals 18? Work out each one. */
export const EqualsEighteen21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every choice and look for 18.', 'Hitung setiap pilihan dan cari yang hasilnya 18.'),
    items: [
      { text: '3 × 7 = 21', ok: false },
      { text: '4 × 4 = 16', ok: false },
      { text: t('9 + 8 = 17 — one short of 18, close but not equal', '9 + 8 = 17 — kurang satu dari 18, dekat tapi tidak sama'), ok: false },
      { text: '24 − 6 = 18', ok: true },
    ],
    final: t('Only 24 − 6 equals 18 (D).', 'Hanya 24 − 6 yang sama dengan 18 (D).'),
    aria: t('Checking each choice, 24 minus 6 equals 18.', 'Memeriksa tiap pilihan, 24 dikurangi 6 sama dengan 18.'),
  }
})

/** Q4 — age gap stays the same, so last year is still 28. */
export const AgeGapUnchanged21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('An age gap never changes as years pass — both people age together.', 'Selisih umur tidak berubah seiring waktu — keduanya bertambah umur bersama.'),
    items: [
      { text: t('This year the gap is 28 years', 'Tahun ini selisihnya 28 tahun'), ok: null },
      { text: t('Last year both Ada and her father were one year younger', 'Tahun lalu Ada dan ayahnya sama-sama satu tahun lebih muda'), ok: null },
      { text: t('Don’t subtract 1 for "last year": both age, so the gap is not 27', 'Jangan mengurangi 1 untuk "tahun lalu": keduanya bertambah umur, jadi bukan 27'), ok: false },
      { text: t('The gap last year is still 28 years', 'Selisih tahun lalu tetap 28 tahun'), ok: true },
    ],
    final: t('Ada was 28 years younger (A).', 'Ada 28 tahun lebih muda (A).'),
    aria: t('Because both people age, the gap stays 28 years.', 'Karena keduanya bertambah umur, selisihnya tetap 28 tahun.'),
  }
})

/** Q5 — minute hand half circle: halve the 60 minutes of a full turn. */
export const HalfCircleMinutes21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Halve the time the minute hand needs for one full turn.', 'Bagi dua waktu satu putaran penuh jarum menit.'),
    items: [
      { text: t('A full circle of the minute hand takes 60 minutes', 'Satu putaran penuh jarum menit memakan 60 menit'), ok: null },
      { text: t('Half a circle is half of 60', 'Setengah lingkaran adalah setengah dari 60'), ok: null },
      { text: t('Don’t use 6: that is the minutes to pass one number, not half the clock', 'Jangan pakai 6: itu menit untuk melewati satu angka, bukan setengah jam'), ok: false },
      { text: '60 ÷ 2 = 30', ok: true },
    ],
    final: t('Half a circle takes 30 minutes (D).', 'Setengah lingkaran perlu 30 menit (D).'),
    aria: t('Half of 60 minutes is 30 minutes.', 'Setengah dari 60 menit adalah 30 menit.'),
  }
})

/** Q6 — which does NOT equal seven 4s (= 28)? */
export const OddOneNot28_21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the total of seven 4s once, then spot the choice that misses it.', 'Cari total tujuh angka 4 sekali, lalu temukan pilihan yang meleset.'),
    items: [
      { text: t('Seven 4s: 4 × 7 = 28 — the target', 'Tujuh angka 4: 4 × 7 = 28 — targetnya'), ok: null },
      { text: t('4 × 7 = 28 — same, so not the odd one', '4 × 7 = 28 — sama, jadi bukan yang berbeda'), ok: false },
      { text: t('20 + 8 = 28 and 7 + 7 + 7 + 7 = 28 — both same', '20 + 8 = 28 dan 7 + 7 + 7 + 7 = 28 — keduanya sama'), ok: false },
      { text: t('30 − 4 = 26, not 28 — the odd one out', '30 − 4 = 26, bukan 28 — yang berbeda'), ok: true },
    ],
    final: t('30 − 4 does not match (C).', '30 − 4 tidak sama (C).'),
    aria: t('The seven 4s make 28, but 30 minus 4 is 26, the odd one out.', 'Tujuh angka 4 berjumlah 28, tapi 30 dikurangi 4 adalah 26, yang berbeda.'),
  }
})

/** Q7 — pencils at 8 each with 100: divide and keep whole pencils. */
export const MostPencils21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Divide the money into groups of 8 and keep only whole pencils.', 'Bagi uang ke dalam kelompok 8 dan ambil pensil utuh saja.'),
    items: [
      { text: '8 × 12 = 96 ≤ 100', ok: null },
      { text: t('8 × 13 = 104 > 100 — too much, she can’t afford the 13th', '8 × 13 = 104 > 100 — terlalu banyak, dia tak mampu beli yang ke-13'), ok: false },
      { text: t('96 fits, with 4 dollars left over', '96 muat, sisa 4 dolar'), ok: null },
      { text: t('So she can buy at most 12 pencils', 'Jadi dia paling banyak beli 12 pensil'), ok: true },
    ],
    final: t('At most 12 pencils (B).', 'Paling banyak 12 pensil (B).'),
    aria: t('Twelve pencils cost 96, but thirteen cost 104 over 100, so the answer is 12.', 'Dua belas pensil seharga 96, tapi tiga belas seharga 104 melebihi 100, jadi jawabannya 12.'),
  }
})

/** Q8 — units = hundreds + 8, smallest hundreds is 1, so units = 9. */
export const UnitsDigitChain21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Chain the gaps up from the smallest digit: tens = hundreds + 5, units = tens + 3.', 'Rantai selisihnya dari angka terkecil: puluhan = ratusan + 5, satuan = puluhan + 3.'),
    items: [
      { text: t('units = hundreds + 5 + 3 = hundreds + 8', 'satuan = ratusan + 5 + 3 = ratusan + 8'), ok: null },
      { text: t('Don’t let hundreds be 0 (then units = 8): a 3-digit number can’t start with 0', 'Jangan biarkan ratusan = 0 (lalu satuan = 8): bilangan 3 digit tak boleh diawali 0'), ok: false },
      { text: t('Smallest allowed hundreds is 1, so units = 1 + 8 = 9', 'Ratusan terkecil yang boleh adalah 1, jadi satuan = 1 + 8 = 9'), ok: true },
    ],
    final: t('The units digit is 9 (A).', 'Angka satuannya 9 (A).'),
    aria: t('Since units is hundreds plus 8 and hundreds is at least 1, the units digit is 9.', 'Karena satuan = ratusan + 8 dan ratusan minimal 1, angka satuannya 9.'),
  }
})

/** Q9 — two circles crossing at two points make 4 regions. */
export const TwoCirclesRegions21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Overlap the circles so they cross at two points to make the most parts.', 'Tumpangkan lingkaran agar berpotongan di dua titik untuk bagian terbanyak.'),
    items: [
      { text: t('One circle alone makes 2 parts: inside and outside', 'Satu lingkaran membuat 2 bagian: dalam dan luar'), ok: null },
      { text: t('Don’t just touch or keep them apart — that gives only 3 parts', 'Jangan cuma bersinggungan atau terpisah — itu hanya 3 bagian'), ok: false },
      { text: t('Cross the second circle through the first at two points', 'Potong lingkaran kedua dengan yang pertama di dua titik'), ok: null },
      { text: t('Those crossings cut the picture into 4 parts', 'Titik potong itu membelah gambar jadi 4 bagian'), ok: true },
    ],
    final: t('At most 4 parts (B).', 'Paling banyak 4 bagian (B).'),
    aria: t('Two circles crossing at two points divide the plane into four parts.', 'Dua lingkaran yang berpotongan di dua titik membagi bidang jadi empat bagian.'),
  }
})

/** Q11 — buy 4 get 1 free, paid 12 → 3 free → 15 total. */
export const BuyFourGetOne21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the free clothes first, then add them to what was paid.', 'Hitung baju gratisnya dulu, lalu tambahkan ke yang dibayar.'),
    items: [
      { text: t('12 paid clothes is 3 groups of 4', '12 baju dibayar adalah 3 kelompok berisi 4'), ok: null },
      { text: t('Each group of 4 earns 1 free: 3 groups → 3 free', 'Tiap kelompok 4 dapat 1 gratis: 3 kelompok → 3 gratis'), ok: null },
      { text: t('Don’t add only 1 free — that gives 13; 12 paid earns 3 free', 'Jangan menambah 1 gratis saja — itu jadi 13; 12 dibayar dapat 3 gratis'), ok: false },
      { text: '12 + 3 = 15', ok: true },
    ],
    final: t('Mom gets 15 clothes (C).', 'Ibu mendapat 15 baju (C).'),
    aria: t('Twelve paid clothes earn three free, making fifteen.', 'Dua belas baju dibayar dapat tiga gratis, jadi lima belas.'),
  }
})

/** Q12 — segment: whole minus the two known parts gives the missing part. */
export const SegmentMissingPart21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The three parts make the whole 50 cm — whole minus known parts gives the box.', 'Ketiga bagian membentuk seluruh 50 cm — total dikurangi bagian diketahui memberi kotak.'),
    items: [
      { text: t('Add the two known parts: 23 + 14 = 37', 'Jumlahkan dua bagian yang diketahui: 23 + 14 = 37'), ok: null },
      { text: t('Don’t mis-add to get 15 — 23 + 14 is 37, not 35', 'Jangan salah jumlah jadi 15 — 23 + 14 adalah 37, bukan 35'), ok: false },
      { text: '50 − 37 = 13', ok: null },
      { text: t('So the box part is 13 cm', 'Jadi bagian kotak adalah 13 cm'), ok: true },
    ],
    final: t('The box is 13 cm (B).', 'Kotaknya 13 cm (B).'),
    aria: t('Fifty minus the known 37 cm leaves 13 cm.', 'Lima puluh dikurangi 37 cm yang diketahui menyisakan 13 cm.'),
  }
})

/** Q13 — 17 count off 1,2; odd spots (say 1) stay → 9 left. */
export const CountOffStay21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Odd spots say 1 and stay; even spots say 2 and leave — count the odd spots.', 'Posisi ganjil menyebut 1 dan tinggal; genap menyebut 2 dan keluar — hitung yang ganjil.'),
    items: [
      { text: t('Odd positions up to 17: 1, 3, 5, 7, 9, 11, 13, 15, 17', 'Posisi ganjil sampai 17: 1, 3, 5, 7, 9, 11, 13, 15, 17'), ok: null },
      { text: t('That is 9 people who say 1', 'Yaitu 9 orang yang menyebut 1'), ok: null },
      { text: t('Don’t answer 8 — that is the count who say 2 and LEAVE', 'Jangan jawab 8 — itu jumlah yang menyebut 2 dan KELUAR'), ok: false },
      { text: t('The 9 who say 1 stay', '9 orang yang menyebut 1 tetap tinggal'), ok: true },
    ],
    final: t('9 people are left (D).', '9 orang tersisa (D).'),
    aria: t('Nine people are in odd spots saying one, so nine stay.', 'Sembilan orang di posisi ganjil menyebut satu, jadi sembilan tetap tinggal.'),
  }
})

/** Q15 — second hand passes 3 once per minute over 30 minutes. */
export const SecondHandPasses21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Once per minute, times the number of minutes in the span.', 'Sekali per menit, dikali jumlah menit dalam rentang.'),
    items: [
      { text: t('The second hand makes a full turn every minute, passing 3 once each minute', 'Jarum detik berputar penuh tiap menit, melewati angka 3 sekali per menit'), ok: null },
      { text: t('10:00 to 10:30 is 30 minutes', '10:00 sampai 10:30 ada 30 menit'), ok: null },
      { text: t('Don’t answer 60 — that confuses seconds with passes; it is once a minute', 'Jangan jawab 60 — itu mengacaukan detik dengan lewatan; sekali per menit'), ok: false },
      { text: '1 × 30 = 30', ok: true },
    ],
    final: t('The second hand points at 3 thirty times (C).', 'Jarum detik menunjuk angka 3 sebanyak 30 kali (C).'),
    aria: t('Once a minute for thirty minutes is thirty times.', 'Sekali per menit selama tiga puluh menit adalah tiga puluh kali.'),
  }
})

/** Q18 — keep one digit per number for a product nearest 100, add the deleted ones. */
export const DeleteDigitsNear100_21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep one digit per number to land nearest 100, then add the deleted digits.', 'Sisakan satu angka per bilangan agar dekat 100, lalu jumlahkan angka yang dihapus.'),
    items: [
      { text: t('Keep 3, 8, 4: 3 × 8 × 4 = 96, closest to 100', 'Sisakan 3, 8, 4: 3 × 8 × 4 = 96, paling dekat 100'), ok: null },
      { text: t('Don’t keep 2 × 8 × 4 = 64 (delete 3,1,1, sum 5) — 96 is closer to 100', 'Jangan sisakan 2 × 8 × 4 = 64 (hapus 3,1,1, jumlah 5) — 96 lebih dekat ke 100'), ok: false },
      { text: t('Deleted digits: 2 from 23, 1 from 18, 1 from 14', 'Angka dihapus: 2 dari 23, 1 dari 18, 1 dari 14'), ok: null },
      { text: '2 + 1 + 1 = 4', ok: true },
    ],
    final: t('The deleted digits sum to 4 (A).', 'Jumlah angka yang dihapus adalah 4 (A).'),
    aria: t('Keeping 3 times 8 times 4 nearest 100, the deleted digits sum to 4.', 'Menyisakan 3 kali 8 kali 4 paling dekat 100, jumlah angka yang dihapus adalah 4.'),
  }
})

/** Q24 — animal clues: koala 8, hippo 4, lion 5, so hippo + lion = 9. */
export const AnimalValues21P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the easy clue first, then substitute step by step.', 'Pecahkan petunjuk termudah dulu, lalu substitusi bertahap.'),
    items: [
      { text: t('Four koalas make 32, so koala = 32 ÷ 4 = 8', 'Empat koala berjumlah 32, jadi koala = 32 ÷ 4 = 8'), ok: null },
      { text: t('hippo + koala = 12, so hippo = 12 − 8 = 4', 'kuda nil + koala = 12, jadi kuda nil = 12 − 8 = 4'), ok: null },
      { text: t('4 × lion × lion = 100, so lion × lion = 25 and lion = 5', '4 × singa × singa = 100, jadi singa × singa = 25 dan singa = 5'), ok: null },
      { text: t('Don’t stop at koala = 8 — the question wants hippo + lion = 4 + 5 = 9', 'Jangan berhenti di koala = 8 — pertanyaannya kuda nil + singa = 4 + 5 = 9'), ok: true },
    ],
    final: t('hippo + lion = 9 (C).', 'kuda nil + singa = 9 (C).'),
    aria: t('Koala is 8, hippo is 4, lion is 5, so hippo plus lion is 9.', 'Koala 8, kuda nil 4, singa 5, jadi kuda nil tambah singa adalah 9.'),
  }
})
