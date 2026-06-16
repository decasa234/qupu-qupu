import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-21F1A (2021 Grade 1 Final) — deduction-chain explainers.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — which subtraction gives the largest result? */
export const LargestResult21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every choice first — compare only at the end!', 'Hitung setiap pilihan dulu — bandingkan hanya di akhir!'),
    items: [
      { text: t('(A) 11 − 8 = 3', '(A) 11 − 8 = 3'), ok: null },
      { text: t('(B) 15 − 7 = 8', '(B) 15 − 7 = 8'), ok: null },
      { text: t('(C) 16 − 9 = 7', '(C) 16 − 9 = 7'), ok: null },
      { text: t('(D) 12 − 6 = 6', '(D) 12 − 6 = 6'), ok: null },
      { text: t('Compare: 3, 8, 7, 6 — the biggest is 8 ✓', 'Bandingkan: 3, 8, 7, 6 — yang terbesar 8 ✓'), ok: true },
    ],
    final: t('15 − 7 = 8 is the largest (B).', '15 − 7 = 8 yang terbesar (B).'),
    aria: t('Computing each choice, fifteen minus seven equals eight is the largest.', 'Menghitung tiap pilihan, lima belas dikurangi tujuh sama dengan delapan yang terbesar.'),
  }
})

/** Q9 — people waiting at the bus stop. */
export const BusStop21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The original waiters split into two groups when Bus #9 left.', 'Penunggu semula terbagi dua kelompok saat bus nomor 9 berangkat.'),
    items: [
      { text: t('Group 1: the 4 people who got ON Bus #9', 'Kelompok 1: 4 orang yang NAIK bus nomor 9'), ok: null },
      { text: t('Group 2: the 7 people still waiting for Bus #12', 'Kelompok 2: 7 orang yang masih menunggu bus nomor 12'), ok: null },
      { text: t('Originally: 4 + 7 = 11 people', 'Semula: 4 + 7 = 11 orang'), ok: true },
    ],
    final: t('11 people were waiting originally (D).', 'Semula ada 11 orang menunggu (D).'),
    aria: t('Four boarded plus seven still waiting equals eleven original waiters.', 'Empat naik plus tujuh masih menunggu sama dengan sebelas penunggu semula.'),
  }
})

/** Q12 — count 2-digit numbers with tens > 5 and units < 8. */
export const DigitCount21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the choices for each digit separately, then pair them up.', 'Hitung pilihan tiap angka secara terpisah, lalu pasangkan.'),
    items: [
      { text: t('Tens digit > 5: 6, 7, 8, 9 → 4 choices', 'Puluhan > 5: 6, 7, 8, 9 → 4 pilihan'), ok: null },
      { text: t('Units digit < 8: 0, 1, 2, 3, 4, 5, 6, 7 → 8 choices (don’t skip 0!)', 'Satuan < 8: 0, 1, 2, 3, 4, 5, 6, 7 → 8 pilihan (jangan lewatkan 0!)'), ok: null },
      { text: t('Each of the 4 tens pairs with all 8 units: 4 × 8 = 32', 'Tiap dari 4 puluhan berpasangan dengan 8 satuan: 4 × 8 = 32'), ok: true },
    ],
    final: t('There are 32 such numbers (D).', 'Ada 32 bilangan seperti itu (D).'),
    aria: t('Four tens choices times eight units choices equals thirty-two numbers.', 'Empat pilihan puluhan kali delapan pilihan satuan sama dengan tiga puluh dua bilangan.'),
  }
})

/** Q13 — parking lot overflow. */
export const ParkingLot21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Fill the parking lot step by step, then see who fits.', 'Isi tempat parkir langkah demi langkah, lalu lihat siapa yang muat.'),
    items: [
      { text: t('Inside: 7, then +9 → 16, then +5 → 21 cars', 'Di dalam: 7, lalu +9 → 16, lalu +5 → 21 mobil'), ok: null },
      { text: t('Free spaces: 24 − 21 = 3', 'Tempat kosong: 24 − 21 = 3'), ok: null },
      { text: t('8 cars wait but only 3 fit: 8 − 3 = 5 cannot park', '8 mobil menunggu tapi hanya 3 muat: 8 − 3 = 5 tidak bisa parkir'), ok: true },
    ],
    final: t('5 cars cannot park (C).', '5 mobil tidak bisa parkir (C).'),
    aria: t('Twenty-one inside leaves three spaces, so five of the eight waiting cars cannot park.', 'Dua puluh satu di dalam menyisakan tiga tempat, jadi lima dari delapan mobil yang menunggu tidak bisa parkir.'),
  }
})

/** Q15 — which □ differs? Fill every box first. */
export const OddBox21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each sequence’s step and fill its box.', 'Temukan langkah tiap barisan dan isi kotaknya.'),
    items: [
      { text: t('A: 24, 20, □, 12 — down by 4 → □ = 16', 'A: 24, 20, □, 12 — turun 4 → □ = 16'), ok: null },
      { text: t('D: □, 15, 14, 13 — down by 1 → □ = 16', 'D: □, 15, 14, 13 — turun 1 → □ = 16'), ok: null },
      { text: t('C: 1, 4, 9, □, 25, 36 — steps +3, +5, +7, +9 → □ = 16', 'C: 1, 4, 9, □, 25, 36 — langkah +3, +5, +7, +9 → □ = 16'), ok: null },
      { text: t('B: 6, □, 21, 36, 56, 81 — steps +5, +10, +15, +20, +25 → □ = 11', 'B: 6, □, 21, 36, 56, 81 — langkah +5, +10, +15, +20, +25 → □ = 11'), ok: true },
    ],
    final: t('A, C and D all give 16; B gives 11 — B is the different one.', 'A, C, dan D semuanya 16; B memberi 11 — B yang berbeda.'),
    aria: t('Three boxes equal sixteen; the box in option B equals eleven.', 'Tiga kotak sama dengan enam belas; kotak pada pilihan B sama dengan sebelas.'),
  }
})

/** Q16 — 28 − 6 + 36 − 8. */
export const ComputeChain21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('One operation at a time, left to right.', 'Satu operasi tiap langkah, dari kiri ke kanan.'),
    items: [
      { text: '28 − 6 = 22', ok: null },
      { text: '22 + 36 = 58', ok: null },
      { text: '58 − 8 = 50', ok: true },
    ],
    final: t('28 − 6 + 36 − 8 = 50.', '28 − 6 + 36 − 8 = 50.'),
    aria: t('Twenty-two, then fifty-eight, then fifty.', 'Dua puluh dua, lalu lima puluh delapan, lalu lima puluh.'),
  }
})

/** Q17 — the 2-digit number with units forced to 5. */
export const TensUnits21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the two sides of the fact: tens + units vs tens + 5.', 'Bandingkan dua sisi fakta: puluhan + satuan vs puluhan + 5.'),
    items: [
      { text: t('tens + units is bigger than tens by exactly the units digit', 'puluhan + satuan lebih besar dari puluhan tepat sebesar angka satuan'), ok: null },
      { text: t('That extra must be 5 → units = 5', 'Kelebihan itu harus 5 → satuan = 5'), ok: null },
      { text: t('Tens is 3 → the number is 35. Check: 3 + 5 = 8, and 8 − 3 = 5 ✓', 'Puluhan 3 → bilangannya 35. Cek: 3 + 5 = 8, dan 8 − 3 = 5 ✓'), ok: true },
    ],
    final: t('The number is 35.', 'Bilangannya 35.'),
    aria: t('The units digit must be five, so the number is thirty-five.', 'Angka satuannya harus lima, jadi bilangannya tiga puluh lima.'),
  }
})

/** Q23 — four shapes, four equations in a cross: try the triangle. */
export const ShapeCross21G1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('🔺 + 🟣 = 6 has few choices — try each 🔺 value and check the other clues.', '🔺 + 🟣 = 6 pilihannya sedikit — coba tiap nilai 🔺 dan periksa petunjuk lain.'),
    items: [
      { text: t('🔺 = 2: 🟣 = 4, 🔷 = 13, 🟡 = 5 → 🟡 − 🟣 = 1, not 5', '🔺 = 2: 🟣 = 4, 🔷 = 13, 🟡 = 5 → 🟡 − 🟣 = 1, bukan 5'), ok: false },
      { text: t('🔺 = 3: 🟣 = 3 — two shapes with the same number, not allowed', '🔺 = 3: 🟣 = 3 — dua bentuk bernilai sama, tidak boleh'), ok: false },
      { text: t('🔺 = 4: 🟣 = 2, 🔷 = 15 − 4 = 11, 🟡 = 18 − 11 = 7 → 🟡 − 🟣 = 5 ✓', '🔺 = 4: 🟣 = 2, 🔷 = 15 − 4 = 11, 🟡 = 18 − 11 = 7 → 🟡 − 🟣 = 5 ✓'), ok: true },
      { text: t('Asked: 🟣 + 🔷 = 2 + 11 = 13', 'Ditanya: 🟣 + 🔷 = 2 + 11 = 13'), ok: true },
    ],
    final: t('🟣 + 🔷 = 13.', '🟣 + 🔷 = 13.'),
    aria: t('Triangle four, purple circle two, diamond eleven, yellow circle seven; purple circle plus diamond is thirteen.', 'Segitiga empat, lingkaran ungu dua, belah ketupat sebelas, lingkaran kuning tujuh; lingkaran ungu plus belah ketupat tiga belas.'),
  }
})
