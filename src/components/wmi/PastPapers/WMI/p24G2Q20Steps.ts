import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { BOTTOM_MAX, TOP_SUMS, UNITS_DIGIT } from './P24G2Q20Illustration'

// Deterministic storyboard for WMI-24P2A-Q20 (sum-pyramid, answer E = 9).
//
// a+b=15, b+c=12, c+d=13, all different 1-digit; maximise abcd, report units (d).
// We try the largest first digit, chain the sums, and reject repeats:
//   a=9 -> b=6, c=6 (repeats b)        X
//   a=8 -> b=7, c=5, d=8 (repeats a)   X
//   a=7 -> b=8, c=4, d=9               OK  -> 7849, units digit 9.

export interface Q20Step {
  bottom: Array<number | undefined>
  activeBottom: number[]
  activeTop: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  answerDigit: number
  steps: Q20Step[]
  finalIndex: number
}

export function buildP24G2Q20Steps(lang: Lang): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const [s0, s1, s2] = TOP_SUMS // 15, 12, 13
  const [a, b, c, d] = BOTTOM_MAX // 7, 8, 4, 9

  const steps: Q20Step[] = [
    {
      bottom: [undefined, undefined, undefined, undefined],
      activeBottom: [],
      activeTop: [0, 1, 2],
      hold: 1900,
      result: false,
      caption: t(
        `Name the squares a, b, c, d: a + b = ${s0}, b + c = ${s1}, c + d = ${s2}.`,
        `Sebut kotak a, b, c, d: a + b = ${s0}, b + c = ${s1}, c + d = ${s2}.`,
      ),
    },
    {
      bottom: [9, 6, undefined, undefined],
      activeBottom: [0, 1, 2],
      activeTop: [0, 1],
      hold: 2100,
      result: false,
      caption: t(
        `Try the biggest start, a = 9. Then b = ${s0} - 9 = 6, but c = ${s1} - 6 = 6 repeats b. No good.`,
        `Coba awal terbesar, a = 9. Maka b = ${s0} - 9 = 6, tapi c = ${s1} - 6 = 6 mengulang b. Gagal.`,
      ),
    },
    {
      bottom: [8, 7, 5, 8],
      activeBottom: [0, 3],
      activeTop: [],
      hold: 2100,
      result: false,
      caption: t(
        `Try a = 8: b = 7, c = 5, d = ${s2} - 5 = 8. But d = 8 repeats a. Still no good.`,
        `Coba a = 8: b = 7, c = 5, d = ${s2} - 5 = 8. Tapi d = 8 mengulang a. Tetap gagal.`,
      ),
    },
    {
      bottom: [a, b, c, d],
      activeBottom: [0, 1, 2, 3],
      activeTop: [0, 1, 2],
      hold: 2000,
      result: false,
      caption: t(
        `Try a = ${a}: b = ${b}, c = ${c}, d = ${d}. All four ${a}, ${b}, ${c}, ${d} are different!`,
        `Coba a = ${a}: b = ${b}, c = ${c}, d = ${d}. Keempatnya ${a}, ${b}, ${c}, ${d} berbeda!`,
      ),
    },
    {
      bottom: [a, b, c, d],
      activeBottom: [3],
      activeTop: [],
      hold: 0,
      result: true,
      caption: t(
        `Largest bottom row is ${a}${b}${c}${d}, so the units digit is ${UNITS_DIGIT} — answer E.`,
        `Baris bawah terbesar ${a}${b}${c}${d}, jadi angka satuannya ${UNITS_DIGIT} — jawaban E.`,
      ),
    },
  ]

  return { answerDigit: UNITS_DIGIT, steps, finalIndex: steps.length - 1 }
}
