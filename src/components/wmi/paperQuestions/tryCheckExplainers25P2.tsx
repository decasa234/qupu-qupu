import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-25P2A (2025 Grade 2 Semifinal / prelim) — deduction-chain explainers for
// the non-figure questions. Every answer is derived on screen; ✗ rows show the
// rejected tries when the method is elimination.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — compute 82 − 20 − 25 by subtracting one number at a time. */
export const SubtractInOrder25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract one number at a time, left to right.', 'Kurangi satu per satu, dari kiri ke kanan.'),
    items: [
      { text: t('Take away the first number: 82 − 20 = 62', 'Kurangi bilangan pertama: 82 − 20 = 62'), ok: null },
      { text: t('Now take away the next one: 62 − 20 = 42, then 42 − 5 = 37', 'Sekarang kurangi berikutnya: 62 − 20 = 42, lalu 42 − 5 = 37'), ok: null },
      { text: t('Don’t let the tens slip — a careless mix-up gives 27, which is wrong', 'Jangan sampai puluhannya tertukar — kalau salah jadi 27, itu keliru'), ok: false },
      { text: '82 − 20 − 25 = 37', ok: true },
    ],
    final: t('82 − 20 − 25 = 37 (A).', '82 − 20 − 25 = 37 (A).'),
    aria: t('Subtracting 20 then 25 from 82 gives 37.', 'Mengurangi 20 lalu 25 dari 82 menghasilkan 37.'),
  }
})

/** Q4 — 487 − 43□: which digit makes the tens digit of the result 4? */
export const TensDigitDigit25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Test each digit and check the tens place of the result.', 'Coba tiap angka dan cek tempat puluhan hasilnya.'),
    items: [
      { text: t('Try □ = 8: 487 − 438 = 49, tens digit is 4 — works!', 'Coba □ = 8: 487 − 438 = 49, angka puluhannya 4 — cocok!'), ok: null },
      { text: t('Try □ = 9: 487 − 439 = 48, tens digit is 4 — works!', 'Coba □ = 9: 487 − 439 = 48, angka puluhannya 4 — cocok!'), ok: null },
      { text: t('Try □ = 7: 487 − 437 = 50, tens digit is 5 — so 7 must be dropped', 'Coba □ = 7: 487 − 437 = 50, angka puluhannya 5 — jadi 7 harus dibuang'), ok: false },
      { text: t('So □ can be 8 or 9', 'Jadi □ bisa 8 atau 9'), ok: true },
    ],
    final: t('□ can be 8 or 9 (D).', '□ bisa 8 atau 9 (D).'),
    aria: t('Only 8 and 9 make the tens digit of the difference four.', 'Hanya 8 dan 9 yang membuat angka puluhan selisihnya empat.'),
  }
})

/** Q5 — apples between 40 and 60 with equal groups of equal size (a square). */
export const SquareApples25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Groups equal to apples-per-group means the total is a number times itself (a square).', 'Banyak kelompok sama dengan apel per kelompok berarti totalnya bilangan dikali dirinya sendiri (bilangan kuadrat).'),
    items: [
      { text: t('Find a square number between 40 and 60', 'Cari bilangan kuadrat antara 40 dan 60'), ok: null },
      { text: t('6 × 6 = 36 is too small, 8 × 8 = 64 is too big', '6 × 6 = 36 terlalu kecil, 8 × 8 = 64 terlalu besar'), ok: null },
      { text: t('48 is in range but isn’t a number times itself, so it can’t make equal groups of equal size', '48 ada dalam rentang tapi bukan bilangan dikali dirinya sendiri, jadi tak bisa membentuk kelompok dan ukuran yang sama'), ok: false },
      { text: t('7 × 7 = 49 fits, so the box has 49 apples', '7 × 7 = 49 pas, jadi kotak berisi 49 apel'), ok: true },
    ],
    final: t('The box has 49 apples (C).', 'Kotak berisi 49 apel (C).'),
    aria: t('Forty-nine is the only square between forty and sixty.', 'Empat puluh sembilan satu-satunya kuadrat antara empat puluh dan enam puluh.'),
  }
})

/** Q6 — 5 Wednesdays in March; first and last day not Wednesday — find day 1. */
export const FiveWednesdays25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('March has 31 days = 4 full weeks + 3 extra days, so only the weekdays on days 1, 2, 3 happen 5 times.', 'Maret punya 31 hari = 4 minggu penuh + 3 hari tambahan, jadi hanya hari pada tanggal 1, 2, 3 yang muncul 5 kali.'),
    items: [
      { text: t('For Wednesday to be one of those, day 1 must be Mon, Tue, or Wed', 'Agar Rabu termasuk salah satunya, tanggal 1 haruslah Senin, Selasa, atau Rabu'), ok: null },
      { text: t('Day 1 isn’t Wednesday, so that start is out', 'Tanggal 1 bukan Rabu, jadi awal itu gugur'), ok: false },
      { text: t('If day 1 were Monday, day 31 would be Wednesday — but the last day must not be a Wednesday', 'Jika tanggal 1 Senin, tanggal 31 jadi Rabu — tapi hari terakhir tidak boleh Rabu'), ok: false },
      { text: t('So day 1 is Tuesday: days 1-2-3 are Tue-Wed-Thu and day 31 is Thursday', 'Jadi tanggal 1 Selasa: tanggal 1-2-3 adalah Selasa-Rabu-Kamis dan tanggal 31 adalah Kamis'), ok: true },
    ],
    final: t('The first day of March is Tuesday (B).', 'Hari pertama Maret adalah Selasa (B).'),
    aria: t('The first day of March is Tuesday.', 'Hari pertama Maret adalah Selasa.'),
  }
})

/** Q7 — return trip reverses the path and flips each direction. */
export const ReverseRoute25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Home-to-school goes southwest, then west, then southeast; going back, walk the same path but flip every direction.', 'Rumah ke sekolah: barat daya, lalu barat, lalu tenggara; saat kembali, lalui jalur yang sama tapi balik setiap arah.'),
    items: [
      { text: t('Southeast becomes northwest, west becomes east, southwest becomes northeast', 'Tenggara jadi barat laut, barat jadi timur, barat daya jadi timur laut'), ok: null },
      { text: t('A repeats the same directions as the outbound trip instead of flipping each one', 'A mengulang arah yang sama dengan perjalanan pergi, bukan membaliknya'), ok: false },
      { text: t('So school-to-home is northwest, then east, then northeast — the route in option C', 'Jadi sekolah ke rumah: barat laut, lalu timur, lalu timur laut — rute pada pilihan C'), ok: true },
    ],
    final: t('The return route is option C.', 'Rute pulang adalah pilihan C.'),
    aria: t('Reversing and flipping each leg gives the route in option C.', 'Membalik dan mengubah tiap ruas memberi rute pada pilihan C.'),
  }
})

/** Q8 — 50 first graders; S < 50 − S; find the largest S. */
export const SecondGraderMax25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Let the second graders be S; the difference is 50 − S, and the rule says S is less than 50 − S.', 'Misalkan siswa kelas dua S; selisihnya 50 − S, dan aturannya S lebih kecil dari 50 − S.'),
    items: [
      { text: t('Add S to both sides: S + S < 50, so 2 × S < 50, meaning S < 25', 'Tambahkan S ke kedua sisi: S + S < 50, jadi 2 × S < 50, artinya S < 25'), ok: null },
      { text: t('S = 25 fails: then the difference is also 25, and 25 is not less than 25', 'S = 25 gagal: selisihnya juga 25, dan 25 tidak lebih kecil dari 25'), ok: false },
      { text: t('The biggest whole number under 25 is 24', 'Bilangan bulat terbesar di bawah 25 adalah 24'), ok: true },
    ],
    final: t('The most second graders is 24 (E).', 'Siswa kelas dua paling banyak 24 (E).'),
    aria: t('Since S must be under 25, the most second graders is 24.', 'Karena S harus di bawah 25, siswa kelas dua paling banyak 24.'),
  }
})

/** Q9 — empty general seats: 624 − 58 = 566, then 566 − 498. */
export const EmptySeats25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Subtract premium first, then subtract the seated passengers.', 'Kurangi premium dulu, lalu kurangi penumpang yang duduk.'),
    items: [
      { text: t('First find the general seats: 624 − 58 = 566', 'Cari dulu kursi biasa: 624 − 58 = 566'), ok: null },
      { text: t('Then subtract the passengers already sitting: 566 − 498 = 68', 'Lalu kurangi penumpang yang sudah duduk: 566 − 498 = 68'), ok: null },
      { text: t('Don’t skip a step or mis-subtract — that slip gives 72', 'Jangan melewatkan langkah atau salah kurang — keliru itu memberi 72'), ok: false },
      { text: t('So 68 general seats are still empty', 'Jadi 68 kursi biasa masih kosong'), ok: true },
    ],
    final: t('68 general seats are empty (C).', '68 kursi biasa kosong (C).'),
    aria: t('After removing premium seats and seated passengers, 68 general seats are empty.', 'Setelah mengurangi kursi premium dan penumpang yang duduk, 68 kursi biasa kosong.'),
  }
})

/** Q10 — eggs in a week: 14 hens × 7 days. */
export const HensEggs25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Only hens lay eggs, so count the hens first, then multiply by 7 days.', 'Hanya betina yang bertelur, jadi hitung betinanya dulu, lalu kalikan 7 hari.'),
    items: [
      { text: t('Hens: 19 − 5 = 14', 'Betina: 19 − 5 = 14'), ok: null },
      { text: t('Each hen lays 1 egg a day, and a week is 7 days, so eggs = 14 × 7', 'Tiap betina bertelur 1 butir per hari, dan satu minggu 7 hari, jadi telur = 14 × 7'), ok: null },
      { text: t('Don’t use all 19 chickens: 16 × 7 = 112 counts too many hens', 'Jangan pakai semua 19 ayam: 16 × 7 = 112 menghitung terlalu banyak betina'), ok: false },
      { text: '14 × 7 = 98', ok: true },
    ],
    final: t('The farm collects 98 eggs in a week (C).', 'Peternakan mengumpulkan 98 telur dalam seminggu (C).'),
    aria: t('Fourteen hens laying daily for seven days give 98 eggs.', 'Empat belas betina bertelur tiap hari selama tujuh hari memberi 98 telur.'),
  }
})

/** Q11 — sum of first n odd numbers is n × n; here 9 terms. */
export const OddSquareSum25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The pattern: adding the first n odd numbers gives n × n.', 'Polanya: menjumlahkan n bilangan ganjil pertama menghasilkan n × n.'),
    items: [
      { text: t('Count the odd numbers: 1, 3, 5, 7, 9, 11, 13, 15, 17 — that’s 9 numbers', 'Hitung bilangan ganjilnya: 1, 3, 5, 7, 9, 11, 13, 15, 17 — ada 9 bilangan'), ok: null },
      { text: t('64 = 8 × 8 is the sum of only the first 8 odd numbers, but there are 9 terms here', '64 = 8 × 8 adalah jumlah 8 bilangan ganjil pertama saja, padahal ada 9 suku'), ok: false },
      { text: t('So the sum is 9 × 9 = 81', 'Jadi jumlahnya 9 × 9 = 81'), ok: true },
    ],
    final: t('The sum is 81 (E).', 'Jumlahnya 81 (E).'),
    aria: t('Nine odd numbers add up to nine times nine, which is 81.', 'Sembilan bilangan ganjil berjumlah sembilan kali sembilan, yaitu 81.'),
  }
})

/** Q12 — line up 4 animals; distance from leftmost to rightmost. */
export const AnimalLine25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pin one animal at 0 and place the rest on a number line.', 'Patok satu hewan di 0 dan letakkan sisanya pada garis bilangan.'),
    items: [
      { text: t('Tortoise at 0, rabbit 50 to its right, so rabbit = 50', 'Kura-kura di 0, kelinci 50 di kanannya, jadi kelinci = 50'), ok: null },
      { text: t('Rabbit is 20 right of the kitten, so kitten = 50 − 20 = 30; puppy is 30 right of kitten, so puppy = 30 + 30 = 60', 'Kelinci 20 di kanan anak kucing, jadi anak kucing = 50 − 20 = 30; anak anjing 30 di kanan anak kucing, jadi anak anjing = 30 + 30 = 60'), ok: null },
      { text: t('50 cm is just the tortoise-to-rabbit gap; the rightmost animal is the puppy at 60, not the rabbit', '50 cm hanya jarak kura-kura ke kelinci; hewan paling kanan anak anjing di 60, bukan kelinci'), ok: false },
      { text: t('Leftmost is the tortoise at 0, rightmost is the puppy at 60, so the distance is 60 cm', 'Paling kiri kura-kura di 0, paling kanan anak anjing di 60, jadi jaraknya 60 cm'), ok: true },
    ],
    final: t('The distance is 60 cm (C).', 'Jaraknya 60 cm (C).'),
    aria: t('On a number line the leftmost and rightmost animals are 60 cm apart.', 'Pada garis bilangan hewan paling kiri dan paling kanan berjarak 60 cm.'),
  }
})

/** Q13 — 31 bananas to 5 monkeys, distinct odd amounts; maximize the biggest. */
export const MaxBananaShare25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('To make one monkey’s share as big as possible, give the other 4 as little as possible.', 'Agar bagian satu monyet sebesar mungkin, beri 4 monyet lain sesedikit mungkin.'),
    items: [
      { text: t('The 4 smallest different odd numbers are 1, 3, 5, 7', '4 bilangan ganjil berbeda terkecil adalah 1, 3, 5, 7'), ok: null },
      { text: t('They add to 1 + 3 + 5 + 7 = 16', 'Jumlahnya 1 + 3 + 5 + 7 = 16'), ok: null },
      { text: t('9 comes from splitting 31 too evenly; push the other four down to 1, 3, 5, 7 first', '9 muncul jika 31 dibagi terlalu rata; tekan empat lainnya ke 1, 3, 5, 7 dulu'), ok: false },
      { text: t('The last monkey gets 31 − 16 = 15 bananas', 'Monyet terakhir mendapat 31 − 16 = 15 pisang'), ok: true },
    ],
    final: t('The most one monkey can get is 15 (B).', 'Pisang terbanyak satu monyet adalah 15 (B).'),
    aria: t('Giving the other four monkeys 1, 3, 5, 7 leaves 15 for the last.', 'Memberi empat monyet lain 1, 3, 5, 7 menyisakan 15 untuk yang terakhir.'),
  }
})

/** Q14 — mirrored clocks; unmirror and find the time closest to 9. */
export const MirrorClock25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A mirror flips a clock left-to-right, so undo the mirror on each clock by reflecting the hands back.', 'Cermin membalik jam dari kiri ke kanan, jadi batalkan efek cermin pada tiap jam dengan memantulkan kembali jarumnya.'),
    items: [
      { text: t('Reflect the hands back, then look for the real time nearest to exactly 9:00', 'Pantulkan jarumnya, lalu cari waktu asli yang paling dekat dengan tepat pukul 9:00'), ok: null },
      { text: t('C looks near 9 only if you read the mirror image directly — you must reflect the hands back first', 'C tampak dekat 9 hanya jika membaca bayangan cermin apa adanya — jarumnya harus dipantulkan dulu'), ok: false },
      { text: t('Clock A unmirrors to the time closest to 9 o’clock', 'Jam A setelah dipantulkan menjadi waktu paling dekat pukul 9'), ok: true },
    ],
    final: t('The clock closest to 9 o’clock is A.', 'Jam paling dekat pukul 9 adalah A.'),
    aria: t('After unmirroring, clock A is closest to nine o’clock.', 'Setelah dipantulkan, jam A paling dekat pukul sembilan.'),
  }
})

/** Q16 — three shapes from triple sums; read the 3-digit number in order. */
export const ShapeDigits25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Divide each total by 3, then read the digits in order.', 'Bagi tiap total dengan 3, lalu baca angkanya berurutan.'),
    items: [
      { text: t('Triangle × 3 = 24, so triangle = 8; circle × 3 = 12, so circle = 4; square × 3 = 21, so square = 7', 'Segitiga × 3 = 24, jadi segitiga = 8; lingkaran × 3 = 12, jadi lingkaran = 4; persegi × 3 = 21, jadi persegi = 7'), ok: null },
      { text: t('736 jumbles or mis-divides the values; the correct order is triangle 8, circle 4, square 7', '736 mengacaukan atau salah membagi nilainya; urutan benar segitiga 8, lingkaran 4, persegi 7'), ok: false },
      { text: t('Reading them in order gives the 3-digit number 847', 'Membacanya berurutan memberi bilangan 3 angka 847'), ok: true },
    ],
    final: t('The 3-digit number is 847 (A).', 'Bilangan 3 angkanya 847 (A).'),
    aria: t('The shapes are eight, four, seven, giving the number 847.', 'Bentuknya delapan, empat, tujuh, memberi bilangan 847.'),
  }
})

/** Q18 — pick 11 from 1..20; pigeonhole forces a pair summing to 21. */
export const PigeonholePairSum25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pair the numbers 1 to 20 so each pair adds to 21: (1,20), (2,19), …, (10,11).', 'Pasangkan bilangan 1 sampai 20 agar tiap pasangan berjumlah 21: (1,20), (2,19), …, (10,11).'),
    items: [
      { text: t('That makes exactly 10 such pairs', 'Itu menghasilkan tepat 10 pasangan'), ok: null },
      { text: t('If you pick 11 numbers but there are only 10 pairs, two of your numbers must share a pair', 'Jika memilih 11 bilangan padahal hanya ada 10 pasangan, dua bilangan pasti dari pasangan yang sama'), ok: null },
      { text: t('A sum of 22 isn’t forced — you could avoid it, but with only 10 pairs of sum 21 a sum of 21 cannot be dodged', 'Jumlah 22 tidak dipaksakan — bisa dihindari, tapi dengan hanya 10 pasangan berjumlah 21, jumlah 21 tak bisa dielakkan'), ok: false },
      { text: t('Those two add to 21, so a sum of 21 is guaranteed', 'Kedua bilangan itu berjumlah 21, jadi jumlah 21 pasti terjadi'), ok: true },
    ],
    final: t('The guaranteed sum is 21 (B).', 'Jumlah yang pasti adalah 21 (B).'),
    aria: t('By pigeonhole, two of the eleven numbers must add to 21.', 'Dengan sarang merpati, dua dari sebelas bilangan pasti berjumlah 21.'),
  }
})

/** Q20 — fill 2□2□ − □0□5 = 999; sum the four box digits. */
export const SubtractionBoxes25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Use top = bottom + 999 to pin the digits, then add them.', 'Gunakan atas = bawah + 999 untuk menentukan angka, lalu jumlahkan.'),
    items: [
      { text: t('The top is 2 _ 2 _, the bottom is _ 0 _ 5, and the difference is 999', 'Bilangan atas 2 _ 2 _, bawah _ 0 _ 5, dan selisihnya 999'), ok: null },
      { text: t('Testing makes 2024 − 1025 = 999 work, filling the boxes with 0, 4, 1, 2', 'Setelah dicoba, 2024 − 1025 = 999 cocok, mengisi kotak dengan 0, 4, 1, 2'), ok: null },
      { text: t('11 comes from guessing larger box digits; the only fit is 2024 − 1025', '11 muncul dari menebak angka kotak yang lebih besar; satu-satunya yang cocok 2024 − 1025'), ok: false },
      { text: t('Add the four box digits: 0 + 4 + 1 + 2 = 7', 'Jumlahkan keempat angka kotak: 0 + 4 + 1 + 2 = 7'), ok: true },
    ],
    final: t('The sum of the four box digits is 7 (C).', 'Jumlah keempat angka kotak adalah 7 (C).'),
    aria: t('The only fitting subtraction 2024 minus 1025 makes the box digits add to 7.', 'Satu-satunya pengurangan yang cocok 2024 dikurangi 1025 membuat angka kotak berjumlah 7.'),
  }
})

/** Q24 — 3×3 grid clues for 5 and 6; minimize the sum of 7's neighbours. */
export const GridNeighbourMin25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Place 4, 5, 6, 7, 8, 9 in the empty cells, keeping 3, 1, 2 fixed in their corners.', 'Letakkan 4, 5, 6, 7, 8, 9 di kotak kosong, dengan 3, 1, 2 tetap di sudutnya.'),
    items: [
      { text: t('Use “cells next to 5 add to 10” to limit where 5 can go', 'Pakai “kotak di sebelah 5 berjumlah 10” untuk membatasi letak 5'), ok: null },
      { text: t('Use “cells next to 6 add to 12” to limit where 6 can go', 'Pakai “kotak di sebelah 6 berjumlah 12” untuk membatasi letak 6'), ok: null },
      { text: t('14 ignores that 5’s and 6’s placements squeeze 7 toward the centre, where it has more and bigger neighbours', '14 mengabaikan bahwa letak 5 dan 6 mendesak 7 ke tengah, tempat tetangganya lebih banyak dan lebih besar'), ok: false },
      { text: t('Among all arrangements that fit both clues, the smallest sum of 7’s neighbours is 23', 'Di antara semua susunan yang memenuhi kedua petunjuk, jumlah tetangga 7 terkecil adalah 23'), ok: true },
    ],
    final: t('The minimum sum next to 7 is 23 (B).', 'Jumlah terkecil di sebelah 7 adalah 23 (B).'),
    aria: t('After both clues, the smallest sum of 7’s neighbours is 23.', 'Setelah kedua petunjuk, jumlah tetangga 7 terkecil adalah 23.'),
  }
})

/** Q25 — sort 5 4 3 2 1 to 1 2 3 4 5 by moving adjacent pairs; fewest moves. */
export const PairMoveSort25P2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Each move slides a pair of next-door cards somewhere else, keeping the pair’s order.', 'Tiap langkah menggeser sepasang kartu bersebelahan ke tempat lain, urutan pasangan tetap.'),
    items: [
      { text: t('Keep aiming the pair moves toward 1 2 3 4 5', 'Terus arahkan langkah pasangan menuju 1 2 3 4 5'), ok: null },
      { text: t('6 assumes you fix the cards two-at-a-time without reusing positions; clever overlapping moves do better', '6 mengira kartu dibetulkan dua-dua tanpa memanfaatkan posisi; langkah cerdik yang tumpang tindih lebih baik'), ok: false },
      { text: t('With clever pair moves you reach 1 2 3 4 5 in just 3 moves, and you can’t do it in fewer', 'Dengan langkah pasangan yang cerdik, 1 2 3 4 5 dicapai hanya dalam 3 langkah, dan tak bisa kurang'), ok: true },
    ],
    final: t('The minimum number of moves is 3 (A).', 'Jumlah langkah paling sedikit adalah 3 (A).'),
    aria: t('Clever overlapping pair-moves sort the cards in just three moves.', 'Langkah pasangan tumpang tindih yang cerdik mengurutkan kartu hanya dalam tiga langkah.'),
  }
})
