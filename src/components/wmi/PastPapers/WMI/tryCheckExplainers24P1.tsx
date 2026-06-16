import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24P1A (2024 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 2 + 0 + 2 − 4 left to right. */
export const LeftToRight24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work left to right, one step at a time.', 'Kerjakan dari kiri ke kanan, satu langkah demi satu langkah.'),
    items: [
      { text: '2 + 0 = 2, then 2 + 2 = 4', ok: null },
      { text: t('Don’t stop at 4 — that is only 2 + 0 + 2; you still have to subtract the last 4', 'Jangan berhenti di 4 — itu baru 2 + 0 + 2; kamu masih harus mengurangi 4 yang terakhir'), ok: false },
      { text: t('Now take away 4: 4 − 4 = 0', 'Sekarang kurangi 4: 4 − 4 = 0'), ok: null },
      { text: '2 + 0 + 2 − 4 = 0', ok: true },
    ],
    final: t('2 + 0 + 2 − 4 = 0 (A).', '2 + 0 + 2 − 4 = 0 (A).'),
    aria: t('Adding to four then subtracting four gives zero.', 'Menjumlahkan jadi empat lalu mengurangi empat menghasilkan nol.'),
  }
})

/** Q2 — which number has tens digit + units digit = 10? */
export const DigitSumTen24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the two digits of each choice and check for 10.', 'Jumlahkan angka tiap pilihan lalu cek apakah 10.'),
    items: [
      { text: t('66 makes 6 + 6 = 12, and 43 makes 4 + 3 = 7', '66 jadi 6 + 6 = 12, dan 43 jadi 4 + 3 = 7'), ok: false },
      { text: t('27 looks close because 2 + 7 = 9 — but 9 is not 10', '27 terlihat dekat karena 2 + 7 = 9 — tapi 9 bukan 10'), ok: false },
      { text: t('91 makes 9 + 1 = 10', '91 jadi 9 + 1 = 10'), ok: true },
    ],
    final: t('Only 91 has digits adding to 10 (D).', 'Hanya 91 yang angka-angkanya berjumlah 10 (D).'),
    aria: t('Nine plus one is ten, so 91 is the answer.', 'Sembilan tambah satu sama dengan sepuluh, jadi 91 jawabannya.'),
  }
})

/** Q3 — which number is larger than 3 by 13? */
export const LargerByThirteen24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Turn the words into 3 + 13.', 'Ubah kalimat menjadi 3 + 13.'),
    items: [
      { text: t('"Larger than 3 by 13" means start at 3 and add 13', '"Lebih besar 13 dari 3" berarti mulai dari 3 lalu tambah 13'), ok: null },
      { text: t('Don’t subtract: 13 − 3 = 10 — the question adds to 3, not subtracts', 'Jangan mengurangi: 13 − 3 = 10 — soalnya menambah ke 3, bukan mengurangi'), ok: false },
      { text: '3 + 13 = 16', ok: true },
    ],
    final: t('The number is 16 (B).', 'Bilangannya adalah 16 (B).'),
    aria: t('Starting at three and adding thirteen gives sixteen.', 'Mulai dari tiga lalu tambah tiga belas menghasilkan enam belas.'),
  }
})

/** Q5 — which row of > signs goes correctly big-to-small? */
export const GreaterThanOrder24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Read > as big-to-small and test each row.', 'Baca > sebagai besar-ke-kecil lalu uji tiap baris.'),
    items: [
      { text: t('16 > 14 > 21 fails — 21 is the biggest, not the smallest', '16 > 14 > 21 salah — 21 paling besar, bukan paling kecil'), ok: false },
      { text: t('21 > 26 > 14 fails — 26 in the middle is bigger than 21, so 21 > 26 is false', '21 > 26 > 14 salah — 26 di tengah lebih besar dari 21, jadi 21 > 26 salah'), ok: false },
      { text: t('24 > 21 > 16 — 24 is bigger than 21, and 21 is bigger than 16', '24 > 21 > 16 — 24 lebih besar dari 21, dan 21 lebih besar dari 16'), ok: true },
    ],
    final: t('24 > 21 > 16 is the correct order (D).', '24 > 21 > 16 adalah urutan yang benar (D).'),
    aria: t('Only twenty-four, twenty-one, sixteen truly goes from big to small.', 'Hanya dua puluh empat, dua puluh satu, enam belas yang benar-benar dari besar ke kecil.'),
  }
})

/** Q7 — which stack of blocks is most likely to fall? */
export const MostLikelyToFall24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the stack whose blocks hang furthest off the base.', 'Cari tumpukan yang baloknya paling menggantung dari alas.'),
    items: [
      { text: t('A tower stays up when its blocks sit balanced over the base', 'Menara tetap berdiri jika baloknya seimbang di atas alas'), ok: null },
      { text: t('Look for the stack that leans the most or has blocks hanging off the edge', 'Cari tumpukan yang paling miring atau ada balok yang menggantung di tepi'), ok: null },
      { text: t('Stack (A) is the most off-balance, so it is the one most likely to tip over', 'Tumpukan (A) paling tidak seimbang, jadi itu yang paling mungkin roboh'), ok: true },
    ],
    final: t('The most off-balance stack is (A).', 'Tumpukan paling tidak seimbang adalah (A).'),
    aria: t('The least balanced tower is the one most likely to fall, stack A.', 'Menara paling tidak seimbang adalah yang paling mungkin jatuh, yaitu tumpukan A.'),
  }
})

/** Q8 — paint MATHEMATIC one letter a day except Sunday, starting Wednesday. */
export const PaintLastLetter24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the painting days, skipping Sunday.', 'Daftar hari mewarnai, lewati Minggu.'),
    items: [
      { text: t('MATHEMATIC has 10 letters, so she paints on 10 painting-days', 'MATHEMATIC punya 10 huruf, jadi ia mewarnai pada 10 hari mewarnai'), ok: null },
      { text: t('Starting Wednesday: Wed, Thu, Fri, Sat are letters 1–4; she skips Sunday', 'Mulai Rabu: Rabu, Kamis, Jumat, Sabtu adalah huruf 1–4; ia melewati Minggu'), ok: null },
      { text: t('Friday would be right with only 9 letters or no skipped Sunday — but with 10 letters and a Sunday skip it lands one day later', 'Jumat benar jika hanya 9 huruf atau tanpa lewati Minggu — tapi dengan 10 huruf dan satu Minggu dilewati, jatuhnya sehari kemudian'), ok: false },
      { text: t('Next week Mon–Sat are letters 5–10, so the 10th letter lands on Saturday', 'Minggu berikutnya Senin–Sabtu adalah huruf 5–10, jadi huruf ke-10 jatuh pada Sabtu'), ok: true },
    ],
    final: t('She paints the last letter on Saturday (D).', 'Ia mewarnai huruf terakhir pada hari Sabtu (D).'),
    aria: t('Ten letters skipping Sundays from Wednesday ends on Saturday.', 'Sepuluh huruf melewati Minggu mulai Rabu berakhir pada Sabtu.'),
  }
})

/** Q9 — Jimmy and Nancy face to face; Jimmy's back faces north. */
export const NancyBackDirection24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Flip front and back, then flip again for facing partners.', 'Balik depan dan belakang, lalu balik lagi untuk yang berhadapan.'),
    items: [
      { text: t('Jimmy’s back faces north, so his face points the opposite way, south', 'Punggung Jimmy menghadap utara, jadi wajahnya menghadap arah sebaliknya, yaitu selatan'), ok: null },
      { text: t('They stand face to face, so Nancy’s face points the opposite of Jimmy’s: north', 'Mereka berhadapan, jadi wajah Nancy menghadap kebalikan wajah Jimmy: utara'), ok: null },
      { text: t('North is where Nancy’s face points — the question asks about her back, which is the opposite', 'Utara adalah arah wajah Nancy — soal menanyakan punggungnya, yang berlawanan'), ok: false },
      { text: t('If Nancy faces north, her back faces the opposite way, south', 'Jika wajah Nancy menghadap utara, punggungnya menghadap arah sebaliknya, selatan'), ok: true },
    ],
    final: t('Nancy’s back faces south (D).', 'Punggung Nancy menghadap selatan (D).'),
    aria: t('Facing Jimmy who looks south, Nancy looks north so her back faces south.', 'Menghadap Jimmy yang melihat selatan, Nancy melihat utara jadi punggungnya menghadap selatan.'),
  }
})

/** Q10 — clock reads 9 o'clock; what time 2 hours later? */
export const TwoHoursLater24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Read the hour, then add the hours that pass.', 'Baca jamnya, lalu tambahkan jam yang berlalu.'),
    items: [
      { text: t('Long hand on 12 and short hand on 9 means the time is 9 o’clock', 'Jarum panjang di 12 dan jarum pendek di 9 berarti pukul 9'), ok: null },
      { text: t('Don’t subtract: 9 − 2 = 7 — "later" means time moves forward, so you add', 'Jangan mengurangi: 9 − 2 = 7 — "kemudian" berarti waktu maju, jadi ditambah'), ok: false },
      { text: '9 + 2 = 11', ok: true },
    ],
    final: t('Two hours later it is 11 o’clock (B).', 'Dua jam kemudian pukul 11 (B).'),
    aria: t('Nine o’clock plus two hours is eleven o’clock.', 'Pukul sembilan ditambah dua jam menjadi pukul sebelas.'),
  }
})

/** Q16 — compute 45 + 25 − 35. */
export const AddSubtract24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the first two, then subtract.', 'Jumlahkan dua yang pertama, lalu kurangi.'),
    items: [
      { text: '45 + 25 = 70', ok: null },
      { text: t('Don’t subtract first: 25 − 35 leads to 15, which is wrong', 'Jangan mengurangi dulu: 25 − 35 menghasilkan 15, yang salah'), ok: false },
      { text: '70 − 35 = 35', ok: null },
      { text: '45 + 25 − 35 = 35', ok: true },
    ],
    final: t('45 + 25 − 35 = 35 (E).', '45 + 25 − 35 = 35 (E).'),
    aria: t('Adding to seventy then subtracting thirty-five gives thirty-five.', 'Menjumlahkan jadi tujuh puluh lalu mengurangi tiga puluh lima menghasilkan tiga puluh lima.'),
  }
})

/** Q20 — fewest adjacent swaps to sort 2 1 5 4 3 6 ascending. */
export const AdjacentSwaps24P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the inversions — each needs one adjacent swap.', 'Hitung pasangan terbalik — tiap pasangan butuh satu tukar bersebelahan.'),
    items: [
      { text: t('Goal order is 1 2 3 4 5 6; count pairs where a bigger number sits left of a smaller one', 'Urutan tujuan adalah 1 2 3 4 5 6; hitung pasangan dengan bilangan besar di kiri yang kecil'), ok: null },
      { text: t('Out-of-order pairs: 2-before-1, 5-before-4, 5-before-3, 4-before-3 — that is four', 'Pasangan terbalik: 2-sebelum-1, 5-sebelum-4, 5-sebelum-3, 4-sebelum-3 — itu empat'), ok: null },
      { text: t('3 misses one inversion — there are four such pairs, so three swaps is too few', '3 melewatkan satu pasangan terbalik — ada empat pasangan, jadi tiga tukar terlalu sedikit'), ok: false },
      { text: t('Each adjacent swap fixes exactly one pair, so 4 swaps are needed', 'Setiap tukar bersebelahan memperbaiki tepat satu pasangan, jadi perlu 4 kali tukar'), ok: true },
    ],
    final: t('At least 4 exchanges are required (B).', 'Paling sedikit 4 kali pertukaran diperlukan (B).'),
    aria: t('Four out-of-order pairs need four adjacent swaps to sort the cards.', 'Empat pasangan terbalik perlu empat tukar bersebelahan untuk mengurutkan kartu.'),
  }
})
