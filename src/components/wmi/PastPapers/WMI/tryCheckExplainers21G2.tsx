import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-21F2A (2021 Grade 2 Final) — deduction-chain explainers.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q1 — 94−67+21 matched to a product. */
export const MatchProduct21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compute the left side first, then hunt for the matching product.', 'Hitung ruas kiri dulu, lalu cari hasil kali yang cocok.'),
    items: [
      { text: t('94 − 67 = 27, then 27 + 21 = 48', '94 − 67 = 27, lalu 27 + 21 = 48'), ok: null },
      { text: '8 × 9 = 72', ok: false },
      { text: '7 × 7 = 49', ok: false },
      { text: '9 × 5 = 45', ok: false },
      { text: '6 × 8 = 48', ok: true },
    ],
    final: t('94 − 67 + 21 = 48 = 6 × 8 (B).', '94 − 67 + 21 = 48 = 6 × 8 (B).'),
    aria: t('The left side is forty-eight, which equals six times eight.', 'Ruas kiri empat puluh delapan, sama dengan enam kali delapan.'),
  }
})

/** Q3 — cross totals: n must be odd. */
export const CrossCount21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Row and column share John once: total = 2n − 1, so n = (total + 1) ÷ 2 — and a line with an exact middle needs n ODD.', 'Baris dan kolom memakai John sekali: total = 2n − 1, jadi n = (total + 1) ÷ 2 — dan barisan dengan tengah pasti butuh n GANJIL.'),
    items: [
      { text: t('25 → n = 13, odd ✓ possible', '25 → n = 13, ganjil ✓ mungkin'), ok: null },
      { text: t('61 → n = 31, odd ✓ possible', '61 → n = 31, ganjil ✓ mungkin'), ok: null },
      { text: t('49 → n = 25, odd ✓ possible', '49 → n = 25, ganjil ✓ mungkin'), ok: null },
      { text: t('95 → n = 48, EVEN — no exact middle for John ✗', '95 → n = 48, GENAP — tak ada tengah pasti untuk John ✗'), ok: true },
    ],
    final: t('95 cannot be the total (B).', '95 tidak mungkin menjadi total (B).'),
    aria: t('Ninety-five forces a line of forty-eight, which has no exact centre.', 'Sembilan puluh lima memaksa barisan empat puluh delapan, yang tak punya tengah pasti.'),
  }
})

/** Q4 — calendar day counts. */
export const CalendarDays21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Every day of the month has a name — add up all the name-counts.', 'Setiap hari dalam bulan punya nama — jumlahkan semua kemunculan nama.'),
    items: [
      { text: t('Saturday + Sunday: 2 × 5 = 10 days', 'Sabtu + Minggu: 2 × 5 = 10 hari'), ok: null },
      { text: t('Monday–Friday: 5 × 4 = 20 days', 'Senin–Jumat: 5 × 4 = 20 hari'), ok: null },
      { text: t('Total: 10 + 20 = 30 days', 'Total: 10 + 20 = 30 hari'), ok: true },
      { text: t('Check: a 30-day month starting Saturday gives 5 Saturdays and 5 Sundays ✓', 'Cek: bulan 30 hari yang dimulai Sabtu memberi 5 Sabtu dan 5 Minggu ✓'), ok: null },
    ],
    final: t('The month has 30 days (B).', 'Bulan itu 30 hari (B).'),
    aria: t('Two names five times and five names four times add to thirty days.', 'Dua nama lima kali dan lima nama empat kali berjumlah tiga puluh hari.'),
  }
})

/** Q5 — skip counting from 101. */
export const SkipCount21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Starting AT 101, counting by 5’s lands on 105, 110, … (multiples of 5); counting by 7’s lands on 107, 114, … (100 + a multiple of 7).', 'Mulai DARI 101, hitung loncat 5 mendarat di 105, 110, … (kelipatan 5); loncat 7 mendarat di 107, 114, … (100 + kelipatan 7).'),
    items: [
      { text: t('175 = 35 × 5 — counted by 5’s ✗', '175 = 35 × 5 — terhitung loncat 5 ✗'), ok: false },
      { text: t('255 = 51 × 5 — counted by 5’s ✗', '255 = 51 × 5 — terhitung loncat 5 ✗'), ok: false },
      { text: t('212 = 100 + 112 = 100 + 7 × 16 — counted by 7’s ✗', '212 = 100 + 112 = 100 + 7 × 16 — terhitung loncat 7 ✗'), ok: false },
      { text: t('238: not a multiple of 5, and 238 − 100 = 138 is not a multiple of 7 ✓', '238: bukan kelipatan 5, dan 238 − 100 = 138 bukan kelipatan 7 ✓'), ok: true },
    ],
    final: t('238 is never counted (D).', '238 tak pernah terhitung (D).'),
    aria: t('Two hundred thirty-eight misses both skip-count lists.', 'Dua ratus tiga puluh delapan luput dari kedua daftar hitung loncat.'),
  }
})

/** Q6 — two wrong clocks. */
export const TwoClocks21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Go through the TRUE time — it bridges the two clocks.', 'Lewati waktu SEBENARNYA — itu jembatan kedua jam.'),
    items: [
      { text: t('Blue is 20 min slow and shows 06:05 → true time = 06:05 + 20 = 06:25', 'Biru lambat 20 menit dan menunjukkan 06.05 → waktu sebenarnya = 06.05 + 20 = 06.25'), ok: null },
      { text: t('Red is 15 min fast → it shows 06:25 + 15 = 06:40', 'Merah cepat 15 menit → menunjukkan 06.25 + 15 = 06.40'), ok: true },
    ],
    final: t('The red clock shows 06:40 (A).', 'Jam merah menunjukkan 06.40 (A).'),
    aria: t('True time six twenty-five, so the fast red clock shows six forty.', 'Waktu sebenarnya enam dua puluh lima, jadi jam merah yang cepat menunjukkan enam empat puluh.'),
  }
})

/** Q7 — □×□×□ = 64. */
export const TripleBox21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The same number multiplied three times gives 64 — try small numbers.', 'Bilangan yang sama dikalikan tiga kali memberi 64 — coba bilangan kecil.'),
    items: [
      { text: '2 × 2 × 2 = 8', ok: false },
      { text: '3 × 3 × 3 = 27', ok: false },
      { text: '4 × 4 × 4 = 64', ok: true },
      { text: t('So □ × 5 = 4 × 5 = 20', 'Jadi □ × 5 = 4 × 5 = 20'), ok: true },
    ],
    final: t('□ = 4 and □ × 5 = 20 (A).', '□ = 4 dan □ × 5 = 20 (A).'),
    aria: t('Four cubed is sixty-four, so the box times five is twenty.', 'Empat pangkat tiga enam puluh empat, jadi kotak kali lima sama dengan dua puluh.'),
  }
})

/** Q8 — Bob in the middle of the queue. */
export const BobQueue21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the people in front of Bob first.', 'Hitung dulu orang di depan Bob.'),
    items: [
      { text: t('In front of Bob: 8 already done + 6 still to go = 14', 'Di depan Bob: 8 sudah selesai + 6 masih menunggu = 14'), ok: null },
      { text: t('So Bob stands 15th', 'Jadi Bob di posisi ke-15'), ok: null },
      { text: t('Bob is the exact middle → 14 behind him too', 'Bob tepat di tengah → 14 juga di belakangnya'), ok: null },
      { text: t('Total: 14 + 1 + 14 = 29', 'Total: 14 + 1 + 14 = 29'), ok: true },
    ],
    final: t('29 people line up (D).', '29 orang antre (D).'),
    aria: t('Fourteen in front, Bob, fourteen behind: twenty-nine people.', 'Empat belas di depan, Bob, empat belas di belakang: dua puluh sembilan orang.'),
  }
})

/** Q10 — rope around two pillars. */
export const TwoPillars21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The first rope reveals the exchange rate between the pillars.', 'Tali pertama mengungkap nilai tukar antara kedua pilar.'),
    items: [
      { text: t('Same rope: 4 loops of A = 4 + 4 = 8 loops of B', 'Tali sama: 4 lilitan A = 4 + 4 = 8 lilitan B'), ok: null },
      { text: t('So 1 loop of A = 2 loops of B (A is twice as thick)', 'Jadi 1 lilitan A = 2 lilitan B (A dua kali lebih tebal)'), ok: null },
      { text: t('New rope: 10 loops of B → 10 ÷ 2 = 5 loops of A', 'Tali baru: 10 lilitan B → 10 ÷ 2 = 5 lilitan A'), ok: true },
    ],
    final: t('It goes around pillar A 5 times (B).', 'Tali itu melilit pilar A 5 kali (B).'),
    aria: t('One loop of A equals two of B, so ten B-loops make five A-loops.', 'Satu lilitan A sama dengan dua lilitan B, jadi sepuluh lilitan B menjadi lima lilitan A.'),
  }
})

/** Q12 — bee and butterfly equations. */
export const BeeButterfly21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Solve each insect first, then subtract.', 'Selesaikan tiap serangga dulu, lalu kurangkan.'),
    items: [
      { text: t('🐝 − 45 = 38 → 🐝 = 38 + 45 = 83', '🐝 − 45 = 38 → 🐝 = 38 + 45 = 83'), ok: null },
      { text: t('62 − 🦋 = 33 → 🦋 = 62 − 33 = 29', '62 − 🦋 = 33 → 🦋 = 62 − 33 = 29'), ok: null },
      { text: '🐝 − 🦋 = 83 − 29 = 54', ok: true },
    ],
    final: t('🐝 − 🦋 = 54 (A).', '🐝 − 🦋 = 54 (A).'),
    aria: t('Bee eighty-three minus butterfly twenty-nine equals fifty-four.', 'Lebah delapan puluh tiga dikurangi kupu-kupu dua puluh sembilan sama dengan lima puluh empat.'),
  }
})

/** Q16 — running total. */
export const RunningTotal21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Keep a running total, one operation at a time.', 'Jaga total berjalan, satu operasi tiap kali.'),
    items: [
      { text: '34 + 27 = 61', ok: null },
      { text: '61 + 16 = 77', ok: null },
      { text: '77 − 52 = 25', ok: null },
      { text: '25 + 72 = 97', ok: null },
      { text: '97 − 17 = 80', ok: true },
    ],
    final: t('The answer is 80.', 'Jawabannya 80.'),
    aria: t('The running total ends at eighty.', 'Total berjalan berakhir di delapan puluh.'),
  }
})

/** Q20 — five cards, smallest result. */
export const FiveCards21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('□□ − □□ + □ with cards 3, 5, 5, 8, 1: make the subtraction small AND save a small card for the +.', '□□ − □□ + □ dengan kartu 3, 5, 5, 8, 1: buat pengurangan kecil DAN sisakan kartu kecil untuk +.'),
    items: [
      { text: t('Far apart: 85 − 13 + 5 = 77 — big', 'Berjauhan: 85 − 13 + 5 = 77 — besar'), ok: false },
      { text: t('Closest pair: 53 − 51 = 2, but the leftover card is the big 8 → 2 + 8 = 10', 'Pasangan terdekat: 53 − 51 = 2, tapi kartu sisanya si besar 8 → 2 + 8 = 10'), ok: false },
      { text: t('Save the 1 instead: 58 − 53 = 5, leaving the 1', 'Sisakan 1 saja: 58 − 53 = 5, menyisakan 1'), ok: null },
      { text: t('58 − 53 + 1 = 6 — no arrangement does better', '58 − 53 + 1 = 6 — tak ada susunan yang lebih baik'), ok: true },
    ],
    final: t('m = 6.', 'm = 6.'),
    aria: t('Fifty-eight minus fifty-three plus one equals six, the smallest result.', 'Lima puluh delapan dikurangi lima puluh tiga ditambah satu sama dengan enam, hasil terkecil.'),
  }
})

/** Q21 — triangular repdigits. */
export const Repdigit21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List the staircase sums 1+2+…+n and look for 11, 22, 33, …, 99.', 'Daftarkan jumlah bertingkat 1+2+…+n dan cari 11, 22, 33, …, 99.'),
    items: [
      { text: t('n = 4 → 10, n = 5 → 15, n = 6 → 21, n = 7 → 28 — none are repdigits', 'n = 4 → 10, n = 5 → 15, n = 6 → 21, n = 7 → 28 — tak ada yang berdigit sama'), ok: false },
      { text: t('n = 8 → 36, n = 9 → 45 — still no', 'n = 8 → 36, n = 9 → 45 — masih bukan'), ok: false },
      { text: t('n = 10 → 55 ✓ same digit twice!', 'n = 10 → 55 ✓ digit sama dua kali!'), ok: true },
      { text: t('n = 11 → 66 ✓ again!', 'n = 11 → 66 ✓ lagi!'), ok: true },
      { text: t('n = 12 → 78, n = 13 → 91, n = 14 → 105 (3 digits) — stop', 'n = 12 → 78, n = 13 → 91, n = 14 → 105 (3 angka) — berhenti'), ok: false },
    ],
    final: t('n = 10 and n = 11 work: 10 + 11 = 21.', 'n = 10 dan n = 11 cocok: 10 + 11 = 21.'),
    aria: t('Only the sums fifty-five and sixty-six are repdigits, giving ten plus eleven equals twenty-one.', 'Hanya jumlah lima puluh lima dan enam puluh enam yang berdigit sama, memberi sepuluh plus sebelas sama dengan dua puluh satu.'),
  }
})

/** Q22 — cube with equal opposite sums. */
export const CubeFaces21G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Call the common sum S. The partners of 3, 8, 7 are S−3, S−8, S−7 — all from 1–9, all unused.', 'Sebut jumlah bersamanya S. Pasangan 3, 8, 7 adalah S−3, S−8, S−7 — semua dari 1–9, semua belum dipakai.'),
    items: [
      { text: t('S−8 ≥ 1 and S−3 ≤ 9 → S is between 9 and 12', 'S−8 ≥ 1 dan S−3 ≤ 9 → S antara 9 dan 12'), ok: null },
      { text: t('S = 9: partners 6, 1, 2 — all free ✓ → 7 faces 2', 'S = 9: pasangan 6, 1, 2 — semua bebas ✓ → 7 berhadapan dengan 2'), ok: true },
      { text: t('S = 10: partner of 3 is 7 — already on the cube ✗', 'S = 10: pasangan 3 adalah 7 — sudah ada di kubus ✗'), ok: false },
      { text: t('S = 11: partner of 3 is 8 — already used ✗', 'S = 11: pasangan 3 adalah 8 — sudah dipakai ✗'), ok: false },
      { text: t('S = 12: partners 9, 4, 5 — all free ✓ → 7 faces 5', 'S = 12: pasangan 9, 4, 5 — semua bebas ✓ → 7 berhadapan dengan 5'), ok: true },
    ],
    final: t('7 can face 2 or 5 → 2 × 5 = 10.', '7 bisa berhadapan dengan 2 atau 5 → 2 × 5 = 10.'),
    aria: t('The face opposite seven is two or five, and their product is ten.', 'Sisi di hadapan tujuh adalah dua atau lima, hasil kalinya sepuluh.'),
  }
})
