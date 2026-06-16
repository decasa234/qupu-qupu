import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-22P1A (2022 Grade 1 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q2 — 6 + 8 by making a ten. */
export const MakeTenAdd22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Make a ten first, then add the rest.', 'Buat sepuluh dulu, lalu tambahkan sisanya.'),
    items: [
      { text: t('We need 6 + 8. Take 2 from the 6 to fill the 8: 8 + 2 = 10', 'Kita perlu 6 + 8. Ambil 2 dari 6 untuk melengkapi 8: 8 + 2 = 10'), ok: null },
      { text: t('That leaves 4 from the 6, so 10 + 4 = 14', 'Sisa 4 dari 6, jadi 10 + 4 = 14'), ok: null },
      { text: t('Don’t use 7: 15 is one too many — that would be 7 + 8, not 6 + 8', 'Jangan pakai 7: 15 kelebihan satu — itu 7 + 8, bukan 6 + 8'), ok: false },
      { text: '6 + 8 = 14', ok: true },
    ],
    final: t('6 + 8 = 14 (B).', '6 + 8 = 14 (B).'),
    aria: t('Making a ten then adding four, 6 plus 8 is 14.', 'Membuat sepuluh lalu menambah empat, 6 ditambah 8 adalah 14.'),
  }
})

/** Q3 — pick the sentence that adds the shown 5 and 3. */
export const MatchSentence22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use both numbers the picture shows, then check the total.', 'Pakai kedua bilangan yang ditunjukkan gambar, lalu periksa totalnya.'),
    items: [
      { text: t('The picture gives 5 and 3, so the sentence must use both', 'Gambar memberi 5 dan 3, jadi kalimat harus memakai keduanya'), ok: null },
      { text: t('Don’t use 3 + 3: it ignores the 5 and only makes 6, not 8', 'Jangan pakai 3 + 3: ini mengabaikan 5 dan hanya menghasilkan 6, bukan 8'), ok: false },
      { text: '5 + 3 = 8', ok: null },
      { text: t('The sentence using 5 and 3 with total 8 is 5 + 3 = 8', 'Kalimat yang memakai 5 dan 3 dengan total 8 adalah 5 + 3 = 8'), ok: true },
    ],
    final: t('5 + 3 = 8 (C).', '5 + 3 = 8 (C).'),
    aria: t('The sentence using both 5 and 3 to make 8 is 5 plus 3 equals 8.', 'Kalimat yang memakai 5 dan 3 menjadi 8 adalah 5 ditambah 3 sama dengan 8.'),
  }
})

/** Q5 — which clock reads closest to 12:15. */
export const ClockQuarterPast22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Read the minute hand first, then the hour hand.', 'Baca jarum menit dulu, lalu jarum jam.'),
    items: [
      { text: t('At 12:15 the long hand points at 3, because 15 minutes is a quarter past', 'Pada 12:15 jarum panjang menunjuk ke 3, karena 15 menit adalah seperempat lewat'), ok: null },
      { text: t('The short hand sits just a little past the 12', 'Jarum pendek berada sedikit lewat dari 12'), ok: null },
      { text: t('Don’t pick a clock with the long hand on 12 — that reads 12:00, not 12:15', 'Jangan pilih jam dengan jarum panjang di 12 — itu berbunyi 12:00, bukan 12:15'), ok: false },
      { text: t('The clock with the long hand on 3 and short hand just past 12 is Figure D', 'Jam dengan jarum panjang di 3 dan jarum pendek sedikit lewat 12 adalah Gambar D'), ok: true },
    ],
    final: t('The clock closest to 12:15 is Figure D (D).', 'Jam paling dekat 12:15 adalah Gambar D (D).'),
    aria: t('The clock with the long hand on three and the hour hand just past twelve shows 12:15.', 'Jam dengan jarum panjang di tiga dan jarum jam sedikit lewat dua belas menunjukkan 12:15.'),
  }
})

/** Q6 — □ + 4 + 4 = 16: combine knowns, then subtract. */
export const MissingAddendBox22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Add the known parts first, then subtract them from the total.', 'Jumlahkan bagian yang diketahui dulu, lalu kurangi dari total.'),
    items: [
      { text: t('Add the two 4s: 4 + 4 = 8', 'Jumlahkan dua angka 4: 4 + 4 = 8'), ok: null },
      { text: t('Now the box plus 8 must make 16: 16 − 8 = 8', 'Sekarang kotak ditambah 8 harus jadi 16: 16 − 8 = 8'), ok: null },
      { text: t('Don’t just take away one 4 — using 4 cancels only one of them, not both', 'Jangan hanya mengurangi satu angka 4 — memakai 4 hanya membatalkan satu, bukan keduanya'), ok: false },
      { text: t('The box is 8: 8 + 4 + 4 = 16', 'Kotaknya 8: 8 + 4 + 4 = 16'), ok: true },
    ],
    final: t('The box is 8 (D).', 'Kotaknya 8 (D).'),
    aria: t('The two fours make eight, so the box is sixteen minus eight, which is eight.', 'Dua angka empat membuat delapan, jadi kotaknya enam belas dikurangi delapan, yaitu delapan.'),
  }
})

/** Q9 — 20 days after March 21 lands on whose birthday. */
export const DaysForwardBirthday22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count to the end of the month first, then into the next.', 'Hitung sampai akhir bulan dulu, lalu masuk bulan berikutnya.'),
    items: [
      { text: t('March has 31 days, so from March 21 there are 10 days left to March 31', 'Maret punya 31 hari, jadi dari 21 Maret tersisa 10 hari untuk sampai 31 Maret'), ok: null },
      { text: t('That uses 10 of the 20 days; 20 − 10 = 10 days still to count into April', 'Itu memakai 10 dari 20 hari; 20 − 10 = 10 hari lagi untuk dihitung ke April'), ok: null },
      { text: t('Don’t stop at March 31 (Bella) — 20 days carries past the end of March', 'Jangan berhenti di 31 Maret (Bella) — 20 hari melewati akhir Maret'), ok: false },
      { text: t('10 days into April lands on April 10 — Dan’s birthday', '10 hari ke April jatuh pada 10 April — ulang tahun Dan'), ok: true },
    ],
    final: t('We celebrate Dan (D).', 'Kita rayakan Dan (D).'),
    aria: t('Counting twenty days from March twenty-first reaches April tenth, which is Dan.', 'Menghitung dua puluh hari dari 21 Maret mencapai 10 April, yaitu Dan.'),
  }
})

/** Q10 — counting by 3s from 29, which digit debuts latest. */
export const LatestDigitDebut22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the sequence and mark each digit’s first appearance.', 'Tulis barisannya dan tandai kemunculan pertama tiap angka.'),
    items: [
      { text: t('Count by 3 from 29: 29, 32, 35, 38, 41, 44, 47, 50, 53, 56…', 'Hitung kelipatan 3 dari 29: 29, 32, 35, 38, 41, 44, 47, 50, 53, 56…'), ok: null },
      { text: t('First appearances: 2 and 9 at 29, 3 at 32, 5 at 35, 8 at 38, 4 and 1 at 41, 7 at 47', 'Kemunculan pertama: 2 dan 9 di 29, 3 di 32, 5 di 35, 8 di 38, 4 dan 1 di 41, 7 di 47'), ok: null },
      { text: t('Don’t stop at 0: it first appears at 50, but 6 appears even later (at 56)', 'Jangan berhenti di 0: pertama muncul di 50, tetapi 6 muncul lebih lambat lagi (di 56)'), ok: false },
      { text: t('6 first appears at 56 — the last new digit to show up', '6 pertama muncul di 56 — angka baru paling akhir yang muncul'), ok: true },
    ],
    final: t('The digit that shows up the latest is 6 (A).', 'Angka yang muncul paling akhir adalah 6 (A).'),
    aria: t('Counting by threes from twenty-nine, the digit six debuts last, at fifty-six.', 'Menghitung kelipatan tiga dari dua puluh sembilan, angka enam muncul paling akhir, di lima puluh enam.'),
  }
})

/** Q12 — makes = shots − misses, then compare. */
export const BasketballMakes22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract the misses to get the makes, then compare.', 'Kurangi yang meleset untuk mendapat yang masuk, lalu bandingkan.'),
    items: [
      { text: t('Durant made 14 − 9 = 5 shots', 'Durant memasukkan 14 − 9 = 5 lemparan'), ok: null },
      { text: t('Ervin made 12 − 6 = 6 shots', 'Ervin memasukkan 12 − 6 = 6 lemparan'), ok: null },
      { text: t('Don’t pick Durant — he shot more balls but missed more, so he made fewer', 'Jangan pilih Durant — ia melempar lebih banyak tapi juga lebih banyak meleset, jadi yang masuk lebih sedikit'), ok: false },
      { text: t('6 is more than 5, and 6 − 5 = 1, so Ervin scored 1 more', '6 lebih dari 5, dan 6 − 5 = 1, jadi Ervin unggul 1'), ok: true },
    ],
    final: t('Ervin scored 1 more (A).', 'Ervin unggul 1 lemparan (A).'),
    aria: t('Ervin made six and Durant made five, so Ervin scored one more.', 'Ervin memasukkan enam dan Durant lima, jadi Ervin unggul satu.'),
  }
})

/** Q13 — Cathy between Bob (14) and Andy (27) but closer to Bob. */
export const RowPositionCathy22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find the middle, then pick a spot nearer to it.', 'Cari posisi tengah, lalu pilih tempat yang lebih dekat ke sana.'),
    items: [
      { text: t('With 27 in a row, the center is the 14th, so Bob is at 14 and Andy (last) is at 27', 'Dengan 27 dalam barisan, tengahnya ke-14, jadi Bob di 14 dan Andy (paling belakang) di 27'), ok: null },
      { text: t('Cathy is between 14 and 27 but closer to Bob, so her spot is below the midpoint 20', 'Cathy di antara 14 dan 27 tapi lebih dekat ke Bob, jadi posisinya di bawah titik tengah 20'), ok: null },
      { text: t('Don’t pick 21 — it sits past the midpoint, nearer Andy, breaking “closer to Bob”', 'Jangan pilih 21 — itu di luar titik tengah, lebih dekat ke Andy, melanggar “lebih dekat ke Bob”'), ok: false },
      { text: t('18 fits: 18 − 14 = 4 is less than 27 − 18 = 9', '18 cocok: 18 − 14 = 4 lebih kecil dari 27 − 18 = 9'), ok: true },
    ],
    final: t('Cathy can be in position 18 (B).', 'Cathy bisa di urutan 18 (B).'),
    aria: t('Bob is at fourteen and Andy at twenty-seven, so a spot closer to Bob is eighteen.', 'Bob di empat belas dan Andy di dua puluh tujuh, jadi tempat lebih dekat ke Bob adalah delapan belas.'),
  }
})

/** Q16 — 15 + 7 + 8 + 3 + 2 by pairing into tens. */
export const PairToTensSum22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair numbers into tens, then add what is left.', 'Pasangkan bilangan jadi puluhan, lalu tambahkan sisanya.'),
    items: [
      { text: t('Pair into tens: 7 + 3 = 10 and 8 + 2 = 10', 'Pasangkan jadi puluhan: 7 + 3 = 10 dan 8 + 2 = 10'), ok: null },
      { text: t('That is 10 + 10 = 20 from the small numbers, plus the 15: 20 + 15 = 35', 'Itu 10 + 10 = 20 dari bilangan kecil, ditambah 15: 20 + 15 = 35'), ok: null },
      { text: t('Don’t drop the 3 — leaving it out (15 + 7 + 8 + 2) only gives 32', 'Jangan melewatkan 3 — meninggalkannya (15 + 7 + 8 + 2) hanya menghasilkan 32'), ok: false },
      { text: '15 + 7 + 8 + 3 + 2 = 35', ok: true },
    ],
    final: t('15 + 7 + 8 + 3 + 2 = 35 (D).', '15 + 7 + 8 + 3 + 2 = 35 (D).'),
    aria: t('Pairing sevens and eights into tens then adding fifteen gives thirty-five.', 'Memasangkan menjadi puluhan lalu menambah lima belas menghasilkan tiga puluh lima.'),
  }
})

/** Q18 — three largest odds + the two left squares of a 1–9 grid. */
export const NineSquareSum22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List each player’s squares, then add all the numbers.', 'Tulis kotak tiap pemain, lalu jumlahkan semua bilangan.'),
    items: [
      { text: t('The three largest odd numbers from 1 to 9 are 9, 7, 5, which add to 21 (Mary)', 'Tiga bilangan ganjil terbesar dari 1 sampai 9 adalah 9, 7, 5, berjumlah 21 (Mary)'), ok: null },
      { text: t('The squares run 1–9 in order, so top-left is 1 and bottom-left is 7 (sister)', 'Kotak bernomor 1–9 berurutan, jadi kiri atas adalah 1 dan kiri bawah adalah 7 (adik)'), ok: null },
      { text: t('Don’t mis-number a corner (e.g. 9 for bottom-left) — that over-counts to 31', 'Jangan salah menomori pojok (mis. 9 untuk kiri bawah) — itu membuat jumlah jadi 31'), ok: false },
      { text: t('Add all the hits: 21 + 1 + 7 = 29', 'Jumlahkan semua: 21 + 1 + 7 = 29'), ok: true },
    ],
    final: t('The sum of the numbers they hit is 29 (A).', 'Jumlah bilangan yang mereka kenai adalah 29 (A).'),
    aria: t('Mary hits nine, seven, five and the sister hits one and seven, summing to twenty-nine.', 'Mary mengenai sembilan, tujuh, lima dan adiknya satu dan tujuh, berjumlah dua puluh sembilan.'),
  }
})

/** Q24 — book spread sum: left even + next odd = odd; only 85 works. */
export const BookSpreadParity22P1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use the odd/even page parity to test each sum.', 'Gunakan paritas ganjil/genap halaman untuk menguji tiap jumlah.'),
    items: [
      { text: t('Page 1 is on the right, so right pages are odd and left pages are even', 'Halaman 1 di kanan, jadi halaman kanan ganjil dan halaman kiri genap'), ok: null },
      { text: t('An open book is a left page plus the next page on the right: even + the next odd = odd', 'Buku terbuka adalah halaman kiri ditambah halaman berikutnya di kanan: genap + ganjil berikutnya = ganjil'), ok: null },
      { text: t('Don’t pick 64 — it is even, but a spread sum is always odd, so it cannot happen', 'Jangan pilih 64 — itu genap, tetapi jumlah bentangan selalu ganjil, jadi tidak mungkin'), ok: false },
      { text: t('85 works: a real spread like 42 + 43 = 85', '85 cocok: bentangan asli seperti 42 + 43 = 85'), ok: true },
    ],
    final: t('The sum that can be correct is 85 (D).', 'Jumlah yang bisa benar adalah 85 (D).'),
    aria: t('A left even page plus the next odd page is always odd, and forty-two plus forty-three is eighty-five.', 'Halaman kiri genap ditambah halaman ganjil berikutnya selalu ganjil, dan 42 ditambah 43 adalah 85.'),
  }
})
