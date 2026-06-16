import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { MAX_FOUR, BOT_NUM, MID_NUM, TOP_NUM, TOTAL, type TrialDigit } from './SumTo2019G2Illustration'

// WMI-19F2A-Q23 — derive the largest 4-digit number column by column.
//
// Deduction (each beat follows from the previous):
//  1. Flip: 4-digit = 2019 − (3-digit + 2-digit) → minimize the other two.
//  2. Thousands: others ≥ 100 + 10, so 4-digit ≤ 1909 → starts with 1, and the
//     hundreds column must carry (1 + carry = 2).
//  3. Hundreds: (a) + (3-digit's hundreds h) + tens-carry must make 10
//     (write 0, carry 1); h ∉ {0, 1}.
//  4. a=8, h=2 (=10, so no tens carry): tens digits would sum to exactly 1 —
//     impossible for three different digits. ✗
//  5. a=7, h=2 (=9 + tens carry): leftovers {0,3,4,5,8,9} (6 unused) would need
//     a tens triple summing 10 — none exists (closest 9 / 11). ✗
//  6. a=6: 6+4=10 → tens sum 1 again ✗; 6+3+carry → the six leftover digits
//     would have to sum 10+19 = 29, forcing 6 itself to be the unused digit —
//     but 6 is already used. ✗
//  7. a=5, h=4 (=9 + carry = 10 ✓): leftovers 0,2,3,7,8,9 sum 29 with 6 unused —
//     the tens (10) and ones (19) CAN be filled.
//  8. Tens triples summing 10: only {0,2,8} or {0,3,7} → give the biggest, 8,
//     to the 4-digit number (0 and 2 to the others).
//  9. Ones left: {3,7,9} = 19 ✓ → the biggest, 9, to the 4-digit number.
// 10. Result: 1589 + 403 + 27 = 2019; nine different digits, 0 used.
export interface SumStepG2 {
  topMask: number
  midMask: number
  botMask: number
  /** Candidate digits being simulated this beat (translucent, not fixed). */
  trial?: TrialDigit[]
  highlightRow: 'top' | 'middle' | 'bottom' | 'total' | null
  highlightCol: number | null
  solved: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SumStoryboardG2 {
  answer: number
  steps: SumStepG2[]
  finalIndex: number
}

export function buildSumTo2019G2Steps(lang: Lang): SumStoryboardG2 {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SumStepG2[] = [
    {
      topMask: 0, midMask: 0, botMask: 0, highlightRow: null, highlightCol: null, solved: false,
      hold: 3000, result: false,
      caption: t(
        `A 2-digit + 3-digit + 4-digit number use nine different digits (0 must be used) and add to ${TOTAL}. Make the 4-digit number as big as possible.`,
        `Bilangan 2 angka + 3 angka + 4 angka memakai sembilan angka berbeda (0 harus dipakai) dan berjumlah ${TOTAL}. Buat bilangan 4 angka sebesar mungkin.`,
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 0, highlightRow: 'total', highlightCol: null, solved: false,
      hold: 2600, result: false,
      caption: t(
        `Flip it: 4-digit = ${TOTAL} − (3-digit + 2-digit). The smaller those two, the bigger our number.`,
        `Balik: 4 angka = ${TOTAL} − (3 angka + 2 angka). Makin kecil keduanya, makin besar bilangan kita.`,
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1, highlightRow: null, highlightCol: 0, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Thousands: only the 4-digit number reaches here. The others take at least 100 + 10, so it is at most 1909 — it starts with 1, and the hundreds column must send a carry (1 + 1 = 2).',
        'Ribuan: hanya bilangan 4 angka yang sampai sini. Dua lainnya minimal 100 + 10, jadi paling besar 1909 — mulai dengan 1, dan kolom ratusan harus mengirim simpanan (1 + 1 = 2).',
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1, highlightRow: null, highlightCol: 1, solved: false,
      hold: 3000, result: false,
      caption: t(
        'Hundreds: the two hundreds digits (plus any carry from the tens) must make 10 — write 0, carry 1. And the 3-digit number cannot start with 0 or 1 (1 is taken).',
        'Ratusan: dua angka ratusan (ditambah simpanan dari puluhan) harus jadi 10 — tulis 0, simpan 1. Dan bilangan 3 angka tak boleh mulai 0 atau 1 (1 sudah dipakai).',
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1,
      trial: [{ row: 'bottom', col: 1, ch: '8' }, { row: 'middle', col: 1, ch: '2' }],
      highlightRow: null, highlightCol: 2, solved: false,
      hold: 3000, result: false,
      caption: t(
        'Try the biggest first: 8 + 2 = 10. But then the tens digits would have to add to exactly 1 — three different digits cannot. ✗',
        'Coba yang terbesar dulu: 8 + 2 = 10. Tapi angka-angka puluhan harus berjumlah tepat 1 — tiga angka berbeda tak mungkin. ✗',
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1,
      trial: [{ row: 'bottom', col: 1, ch: '7' }, { row: 'middle', col: 1, ch: '2' }],
      highlightRow: null, highlightCol: 2, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Try 7 + 2 (= 9, plus the tens carry). The tens would need three of 0, 3, 4, 5, 8, 9 to make 10 — check them all: 9 or 11, never 10. ✗',
        'Coba 7 + 2 (= 9, plus simpanan puluhan). Puluhan butuh tiga dari 0, 3, 4, 5, 8, 9 berjumlah 10 — cek semuanya: 9 atau 11, tak pernah 10. ✗',
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1,
      trial: [{ row: 'bottom', col: 1, ch: '6' }, { row: 'middle', col: 1, ch: '4' }],
      highlightRow: null, highlightCol: 1, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Try 6: with 6 + 4 = 10 the tens again need sum 1 ✗. With 6 + 3 + carry, the six leftover digits would have to add to 10 + 19 = 29 — only possible by leaving out 6, and 6 is already used. ✗',
        'Coba 6: dengan 6 + 4 = 10 puluhan lagi-lagi butuh jumlah 1 ✗. Dengan 6 + 3 + simpanan, enam angka sisa harus berjumlah 10 + 19 = 29 — hanya bisa kalau 6 tak dipakai, padahal 6 sudah dipakai. ✗',
      ),
    },
    {
      topMask: 0, midMask: 1, botMask: 2, highlightRow: null, highlightCol: 1, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Try 5 + 4 (= 9, plus carry = 10 ✓). Leave out 6: the leftovers 0, 2, 3, 7, 8, 9 add to exactly 10 + 19 = 29 — the tens and ones CAN be filled. So far: 1 5 _ _, and the 3-digit starts with 4.',
        'Coba 5 + 4 (= 9, plus simpanan = 10 ✓). Sisihkan 6: sisa angka 0, 2, 3, 7, 8, 9 berjumlah tepat 10 + 19 = 29 — puluhan dan satuan BISA terisi. Sejauh ini: 1 5 _ _, dan bilangan 3 angka mulai dengan 4.',
      ),
    },
    {
      topMask: 1, midMask: 2, botMask: 3, highlightRow: null, highlightCol: 2, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Tens must make 10 (the ones carry then writes 1): only 0+2+8 or 0+3+7. Give the biggest digit, 8, to our number — 0 and 2 go to the others.',
        'Puluhan harus berjumlah 10 (dengan simpanan satuan jadi menulis 1): hanya 0+2+8 atau 0+3+7. Beri angka terbesar, 8, ke bilangan kita — 0 dan 2 untuk yang lain.',
      ),
    },
    {
      topMask: 2, midMask: 3, botMask: 4, highlightRow: null, highlightCol: 3, solved: false,
      hold: 3000, result: false,
      caption: t(
        'The ones that remain: 3, 7, 9 — exactly 19 (write 9, carry 1 ✓). The biggest, 9, goes to our number → 1589, with 403 and 27.',
        'Satuan yang tersisa: 3, 7, 9 — tepat 19 (tulis 9, simpan 1 ✓). Yang terbesar, 9, untuk bilangan kita → 1589, dengan 403 dan 27.',
      ),
    },
    {
      topMask: 2, midMask: 3, botMask: 4, highlightRow: 'total', highlightCol: null, solved: true,
      hold: 0, result: true,
      caption: t(
        `Check: ${TOP_NUM} + ${MID_NUM} + ${BOT_NUM} = ${TOTAL} — nine different digits, 0 is used. The largest 4-digit number is ${MAX_FOUR}.`,
        `Periksa: ${TOP_NUM} + ${MID_NUM} + ${BOT_NUM} = ${TOTAL} — sembilan angka berbeda, 0 terpakai. Bilangan 4 angka terbesar adalah ${MAX_FOUR}.`,
      ),
    },
  ]

  return { answer: MAX_FOUR, steps, finalIndex: steps.length - 1 }
}
