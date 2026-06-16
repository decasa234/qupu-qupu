import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F3A (2024 Grade 3 Final) — deduction-chain explainers for the
// non-figure questions. Q16's stem box-layout is mistyped (□□ ÷ □□) but the
// intended division 936 ÷ 4 = 234 is solvable, so it is animated here.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q8 — which composite figure has perimeter = 2 × area. */
export const PerimeterArea24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('We need the perimeter ◇ to be exactly 2 × the area △. Count both for each figure.', 'Kita butuh keliling ◇ tepat 2 × luas △. Hitung keduanya untuk tiap gambar.'),
    items: [
      { text: t('Option C is a 2 × 2 square: area = 4 unit squares', 'Pilihan C adalah persegi 2 × 2: luas = 4 petak'), ok: null },
      { text: t('Its perimeter = 8, and 8 = 2 × 4 ✓', 'Kelilingnya = 8, dan 8 = 2 × 4 ✓'), ok: true },
    ],
    final: t('Only option C has ◇ = 2△ (C).', 'Hanya pilihan C yang ◇ = 2△ (C).'),
    aria: t('A two-by-two square has area four and perimeter eight, and eight is twice four.', 'Persegi dua kali dua punya luas empat dan keliling delapan, dan delapan dua kali empat.'),
  }
})

/** Q1 — which quotient contains a 0. */
export const DivZero24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every quotient, then scan for the digit 0.', 'Hitung tiap hasil bagi, lalu cari angka 0.'),
    items: [
      { text: 'A: 224 ÷ 4 = 56', ok: false },
      { text: 'B: 200 ÷ 8 = 25', ok: false },
      { text: 'C: 378 ÷ 7 = 54', ok: false },
      { text: 'D: 408 ÷ 6 = 68', ok: false },
      { text: t('E: 525 ÷ 5 = 105 — has a 0', 'E: 525 ÷ 5 = 105 — ada 0'), ok: true },
    ],
    final: t('Only 525 ÷ 5 = 105 contains a 0 (E).', 'Hanya 525 ÷ 5 = 105 yang memuat 0 (E).'),
    aria: t('Of the five quotients, only 105 has a zero digit.', 'Dari lima hasil bagi, hanya 105 yang punya angka nol.'),
  }
})

/** Q5 — large buses first, then small buses. */
export const BusFill24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Seat the big buses first, subtract, then divide the rest by 7.', 'Isi bus besar dulu, kurangi, lalu bagi sisanya dengan 7.'),
    items: [
      { text: t('Large buses: 6 × 45 = 270 seated', 'Bus besar: 6 × 45 = 270 terisi'), ok: null },
      { text: t('Left over: 312 − 270 = 42', 'Tersisa: 312 − 270 = 42'), ok: null },
      { text: t('Small buses: 42 ÷ 7 = 6 (no remainder)', 'Bus kecil: 42 ÷ 7 = 6 (tanpa sisa)'), ok: true },
    ],
    final: t('6 small buses are needed (A).', 'Diperlukan 6 bus kecil (A).'),
    aria: t('After the big buses take 270, the other 42 need six small buses.', 'Setelah bus besar membawa 270, sisa 42 butuh enam bus kecil.'),
  }
})

/** Q7 — minutes lost to hours. */
export const CigaretteTime24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Multiply for the total minutes, then divide by 60 for hours.', 'Kalikan untuk total menit, lalu bagi 60 untuk jam.'),
    items: [
      { text: t('Minutes lost: 204 × 5 = 1020', 'Menit hilang: 204 × 5 = 1020'), ok: null },
      { text: '1020 ÷ 60 = 17', ok: true },
    ],
    final: t('His life is shortened by 17 hours (A).', 'Hidupnya diperpendek 17 jam (A).'),
    aria: t('A thousand twenty minutes is seventeen hours.', 'Seribu dua puluh menit adalah tujuh belas jam.'),
  }
})

/** Q11 — 1 entrée and 2 of 4 sides. */
export const MealCombos24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Pick the entrée, then pick 2 sides out of 4, and multiply.', 'Pilih hidangan utama, lalu pilih 2 lauk dari 4, dan kalikan.'),
    items: [
      { text: t('Entrée: 2 ways (Rice or Dumpling)', 'Utama: 2 cara (Nasi atau Pangsit)'), ok: null },
      { text: t('2 sides from 4: 6 pairs (CS, CB, CT, SB, ST, BT)', '2 lauk dari 4: 6 pasang (CS, CB, CT, SB, ST, BT)'), ok: null },
      { text: '2 × 6 = 12', ok: true },
    ],
    final: t('Lee can make 12 combinations (C).', 'Lee bisa membuat 12 kombinasi (C).'),
    aria: t('Two entrées times six side-pairs is twelve meals.', 'Dua hidangan utama kali enam pasang lauk adalah dua belas menu.'),
  }
})

/** Q13 — column cryptarithm; □ + ○ × △. */
export const ColumnCrypto24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve the units column first, then carry upward to fix each shape.', 'Selesaikan kolom satuan dulu, lalu naik dengan simpanan untuk tetapkan tiap bentuk.'),
    items: [
      { text: t('Units: △+△+△ must end in 4 → 3 × 8 = 24 → △ = 8 (carry 2)', 'Satuan: △+△+△ harus berakhir 4 → 3 × 8 = 24 → △ = 8 (simpan 2)'), ok: null },
      { text: t('The two □ hundreds force □ = 5', 'Dua ratusan □ memaksa □ = 5'), ok: null },
      { text: '548 + 588 + 888 = 2024 → ○ = 4', ok: null },
      { text: t('□ + ○ × △ = 5 + 4 × 8 = 37 (multiply first!)', '□ + ○ × △ = 5 + 4 × 8 = 37 (kalikan dulu!)'), ok: true },
    ],
    final: t('□ + ○ × △ = 37 (C).', '□ + ○ × △ = 37 (C).'),
    aria: t('The shapes are 5, 4, 8, so 5 plus 4 times 8 is 37.', 'Bentuknya 5, 4, 8, jadi 5 tambah 4 kali 8 adalah 37.'),
  }
})

/** Q16 — biggest exact quotient from 3, 4, 6, 9 (intended 936 ÷ 4). */
export const MaxQuotient24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('For the biggest quotient, use the smallest digit as the divisor and the rest as a large dividend.', 'Untuk hasil bagi terbesar, pakai angka terkecil sebagai pembagi dan sisanya sebagai bilangan besar yang dibagi.'),
    items: [
      { text: t('Put 4 as the divisor and 9, 3, 6 in the dividend', 'Taruh 4 sebagai pembagi dan 9, 3, 6 di yang dibagi'), ok: null },
      { text: t('936 ÷ 4 = 234, exactly (no remainder)', '936 ÷ 4 = 234, tepat (tanpa sisa)'), ok: null },
      { text: t('No other exact arrangement of 3, 4, 6, 9 beats 234', 'Tak ada susunan tepat lain dari 3, 4, 6, 9 yang melebihi 234'), ok: true },
    ],
    final: t('The largest possible quotient is 234.', 'Hasil bagi terbesar yang mungkin adalah 234.'),
    aria: t('936 divided by 4 is 234, the largest exact quotient.', '936 dibagi 4 adalah 234, hasil bagi tepat terbesar.'),
  }
})

/** Q17 — matchsticks from "2024" reused for the largest all-different number. */
export const Matchsticks24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the sticks in 2024, then spend them all on the MOST different digits.', 'Hitung korek pada 2024, lalu belanjakan semuanya untuk angka berbeda SEBANYAK mungkin.'),
    items: [
      { text: t('2024 costs 5 + 6 + 5 + 4 = 20 sticks', '2024 berbiaya 5 + 6 + 5 + 4 = 20 korek'), ok: null },
      { text: t('More digits = bigger number; the cheapest 5 different digits are 1,7,4,5,9 = 2+3+4+5+6 = 20', 'Lebih banyak angka = bilangan lebih besar; lima angka berbeda termurah 1,7,4,5,9 = 2+3+4+5+6 = 20'), ok: null },
      { text: t('Order them largest-first: 97541', 'Urutkan terbesar dulu: 97541'), ok: true },
    ],
    final: t('The largest number is 97541.', 'Bilangan terbesar adalah 97541.'),
    aria: t('Twenty sticks make five digits, ordered largest first as 97541.', 'Dua puluh korek membuat lima angka, terbesar dulu 97541.'),
  }
})

/** Q18 — four ordered cards from three sign-equations. */
export const CardEquations24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Call the cards a, b, c, d. Add and subtract the first two equations.', 'Sebut kartu a, b, c, d. Jumlahkan dan kurangkan dua persamaan pertama.'),
    items: [
      { text: 'a + bc + d = 52 and a + bc − d = 46', ok: null },
      { text: t('Add: a + bc = 49; subtract: 2d = 6 → d = 3', 'Jumlah: a + bc = 49; kurang: 2d = 6 → d = 3'), ok: null },
      { text: t('Third: a + bcd = 430 → bcd = 423 → b=4, c=2 → a = 49 − 42 = 7', 'Ketiga: a + bcd = 430 → bcd = 423 → b=4, c=2 → a = 49 − 42 = 7'), ok: true },
    ],
    final: t('Left to right the cards are 7, 4, 2, 3 → 7423.', 'Dari kiri ke kanan kartunya 7, 4, 2, 3 → 7423.'),
    aria: t('The cards are seven, four, two, three, forming 7423.', 'Kartunya tujuh, empat, dua, tiga, membentuk 7423.'),
  }
})

/** Q19 — tree ages: one is the average of the other two; exclude the example. */
export const TreeAges24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Make three 2-digit numbers from 1–6; one must be the average of the other two (2 × middle = sum of the others).', 'Buat tiga bilangan 2 angka dari 1–6; satu harus rata-rata dua lainnya (2 × tengah = jumlah dua lainnya).'),
    items: [
      { text: t('Searching the arrangements, there are 8 valid sets', 'Menelusuri susunan, ada 8 himpunan sah'), ok: null },
      { text: t('The example 34, 12, 56 is excluded by the question', 'Contoh 34, 12, 56 dikecualikan oleh soal'), ok: null },
      { text: '8 − 1 = 7', ok: true },
    ],
    final: t('There are 7 possibilities.', 'Ada 7 kemungkinan.'),
    aria: t('Eight valid sets exist; removing the named example leaves seven.', 'Ada delapan himpunan sah; menghapus contoh menyisakan tujuh.'),
  }
})

/** Q21 — two palindromes summing 2024; smallest difference. */
export const Palindrome24G3Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Both palindromes add to 2024. For the smallest difference, keep both near half, 1012.', 'Kedua palindrom berjumlah 2024. Untuk selisih terkecil, jaga keduanya dekat setengah, 1012.'),
    items: [
      { text: t('Half of 2024 is 1012', 'Setengah dari 2024 adalah 1012'), ok: null },
      { text: t('1661 is a palindrome, and 2024 − 1661 = 363 is also a palindrome', '1661 palindrom, dan 2024 − 1661 = 363 juga palindrom'), ok: null },
      { text: '1661 − 363 = 1298', ok: true },
    ],
    final: t('The smallest possible difference is 1298.', 'Selisih terkecil yang mungkin adalah 1298.'),
    aria: t('The closest palindrome pair, 1661 and 363, differ by 1298.', 'Pasangan palindrom terdekat, 1661 dan 363, berselisih 1298.'),
  }
})
