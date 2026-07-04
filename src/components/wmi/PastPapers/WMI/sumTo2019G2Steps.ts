import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { MAX_FOUR, BOT_NUM, MID_NUM, TOP_NUM, TOTAL, type TrialDigit } from './SumTo2019G2Illustration'

// WMI-19F2A-Q23 — derive the largest 4-digit number column by column.
//
// Deduction (each beat follows from the previous; verified by brute force —
// max is 1597, reachable four ways, e.g. 82 + 340 + 1597):
//  1. Flip: 4-digit = 2019 − (3-digit + 2-digit) → minimize the other two.
//  2. Thousands: others ≥ 100 + 10, so 4-digit ≤ 1909 → starts with 1, and the
//     hundreds column must carry (1 + carry = 2).
//  3. Hundreds: (a) + (3-digit's hundreds h) + tens-carry must make 10
//     (write 0, carry 1); h ∉ {0, 1}; the tens-carry can be 0, 1, or 2
//     (three tens digits can total more than 20).
//  4. a=9 is out at once: h would have to be 0 or 1. a=8 forces h=2, tc=0:
//     the tens digits would sum to exactly 1 — impossible. ✗
//  5. a=7: 7+3 (tc=0) → tens sum 1 ✗; 7+2 (tc=1) → checking every split of
//     the leftover digits, the tens and ones never fit. ✗
//  6. a=6: 6+4 (tc=0) → tens sum 1 ✗; 6+3 (tc=1) and 6+2 (tc=2) → again no
//     split of the leftovers fits the tens and ones. ✗
//  7. a=5, h=3, tc=2 (5+3+2 = 10 ✓): leave out 6 — the leftovers are
//     0, 2, 4, 7, 8, 9.
//  8. Tens must total 21 (write 1, carry 2): 9+8+4 = 21 → give the biggest,
//     9, to the 4-digit number (8 and 4 to the others).
//  9. Ones left: {0,2,7} = 9 ✓ (write 9, no carry needed from the ones... the
//     21 in the tens already includes no ones-carry) → the biggest, 7, goes
//     to the 4-digit number.
// 10. Result: 1597 + 340 + 82 = 2019; nine different digits, 0 used.
//     (Note: 5+4 with tc=1 also fills — it gives 1589 — but 5+3 with tc=2
//     frees the 9 for the tens, so 1597 > 1589 wins.)
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
        'Hundreds: the two hundreds digits plus the carry from the tens must make 10 — write 0, carry 1. The tens can carry as much as 2! And the 3-digit number cannot start with 0 or 1 (1 is taken), so 9 up top is impossible.',
        'Ratusan: dua angka ratusan plus simpanan dari puluhan harus jadi 10 — tulis 0, simpan 1. Puluhan bisa menyimpan sampai 2! Dan bilangan 3 angka tak boleh mulai 0 atau 1 (1 sudah dipakai), jadi 9 di atas tidak mungkin.',
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
        'Try 7: with 7 + 3 the tens again need total 1 ✗. With 7 + 2 and a carry, check every split of the leftover digits 0, 3, 4, 5, 6, 8, 9 — the tens and ones never both fit. ✗',
        'Coba 7: dengan 7 + 3 puluhan lagi-lagi butuh jumlah 1 ✗. Dengan 7 + 2 dan simpanan, cek setiap pembagian angka sisa 0, 3, 4, 5, 6, 8, 9 — puluhan dan satuan tak pernah sama-sama pas. ✗',
      ),
    },
    {
      topMask: 0, midMask: 0, botMask: 1,
      trial: [{ row: 'bottom', col: 1, ch: '6' }, { row: 'middle', col: 1, ch: '4' }],
      highlightRow: null, highlightCol: 1, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Try 6: with 6 + 4 = 10 the tens again need sum 1 ✗. With 6 + 3 (carry 1) or 6 + 2 (carry 2), check every split of the leftovers — the tens and ones never both fit. ✗',
        'Coba 6: dengan 6 + 4 = 10 puluhan lagi-lagi butuh jumlah 1 ✗. Dengan 6 + 3 (simpanan 1) atau 6 + 2 (simpanan 2), cek setiap pembagian angka sisa — puluhan dan satuan tak pernah sama-sama pas. ✗',
      ),
    },
    {
      topMask: 0, midMask: 1, botMask: 2, highlightRow: null, highlightCol: 1, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Try 5 — and use the BIG carry: 5 + 3 + a tens carry of 2 makes 10 ✓. Leave out 6: the leftovers are 0, 2, 4, 7, 8, 9. So far: 1 5 _ _, and the 3-digit starts with 3.',
        'Coba 5 — dan pakai simpanan BESAR: 5 + 3 + simpanan puluhan 2 jadi 10 ✓. Sisihkan 6: sisa angkanya 0, 2, 4, 7, 8, 9. Sejauh ini: 1 5 _ _, dan bilangan 3 angka mulai dengan 3.',
      ),
    },
    {
      topMask: 1, midMask: 2, botMask: 3, highlightRow: null, highlightCol: 2, solved: false,
      hold: 3200, result: false,
      caption: t(
        'Tens must total 21 (write 1, carry 2 ✓): 9 + 8 + 4 = 21. Give the biggest digit, 9, to our number — 8 and 4 go to the others.',
        'Puluhan harus berjumlah 21 (tulis 1, simpan 2 ✓): 9 + 8 + 4 = 21. Beri angka terbesar, 9, ke bilangan kita — 8 dan 4 untuk yang lain.',
      ),
    },
    {
      topMask: 2, midMask: 3, botMask: 4, highlightRow: null, highlightCol: 3, solved: false,
      hold: 3000, result: false,
      caption: t(
        'The ones that remain: 0, 2, 7 — exactly 9 (write 9, no carry ✓). The biggest, 7, goes to our number → 1597, with 340 and 82.',
        'Satuan yang tersisa: 0, 2, 7 — tepat 9 (tulis 9, tanpa simpanan ✓). Yang terbesar, 7, untuk bilangan kita → 1597, dengan 340 dan 82.',
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
