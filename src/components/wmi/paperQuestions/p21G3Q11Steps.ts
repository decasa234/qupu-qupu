import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q11_ANSWER, TRIS, triRule } from './P21G3Q11Illustration'

export type Q11Phase = 'show' | 'check1' | 'check2' | 'apply' | 'result'

export interface Q11Step {
  phase: Q11Phase
  /** Per-panel centre overrides (index 0..2). undefined = panel default. */
  centerOverrides: Array<number | null | undefined>
  solveIdx: number
  readIdx: number
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  answer: number
  steps: Q11Step[]
  finalIndex: number
}

export function buildP21G3Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const t1 = TRIS[0]
  const t2 = TRIS[1]
  const t3 = TRIS[2]
  const r1 = triRule(t1.top, t1.ll, t1.lr) // 3
  const r2 = triRule(t2.top, t2.ll, t2.lr) // 8

  const steps: Q11Step[] = [
    {
      phase: 'show',
      centerOverrides: [],
      solveIdx: -1,
      readIdx: -1,
      hold: 1700,
      result: false,
      caption: t(
        'The centre comes from the three corner numbers. Find the rule.',
        'Angka tengah berasal dari tiga angka sudut. Cari aturannya.',
      ),
    },
    {
      phase: 'check1',
      centerOverrides: [],
      solveIdx: 0,
      readIdx: 0,
      hold: 2000,
      result: false,
      caption: t(
        `Triangle 1: top + left − right = ${t1.top} + ${t1.ll} − ${t1.lr} = ${r1}. Matches the ${t1.center}!`,
        `Segitiga 1: atas + kiri − kanan = ${t1.top} + ${t1.ll} − ${t1.lr} = ${r1}. Cocok dengan ${t1.center}!`,
      ),
    },
    {
      phase: 'check2',
      centerOverrides: [],
      solveIdx: 1,
      readIdx: 1,
      hold: 2000,
      result: false,
      caption: t(
        `Triangle 2: ${t2.top} + ${t2.ll} − ${t2.lr} = ${r2}. Matches the ${t2.center} — rule confirmed.`,
        `Segitiga 2: ${t2.top} + ${t2.ll} − ${t2.lr} = ${r2}. Cocok dengan ${t2.center} — aturan terbukti.`,
      ),
    },
    {
      phase: 'apply',
      centerOverrides: [undefined, undefined, undefined],
      solveIdx: 2,
      readIdx: 2,
      hold: 2000,
      result: false,
      caption: t(
        `Triangle 3: ${t3.top} + ${t3.ll} − ${t3.lr} = ?`,
        `Segitiga 3: ${t3.top} + ${t3.ll} − ${t3.lr} = ?`,
      ),
    },
    {
      phase: 'result',
      centerOverrides: [undefined, undefined, Q11_ANSWER],
      solveIdx: 2,
      readIdx: -1,
      hold: 0,
      result: true,
      caption: t(
        `${t3.top} + ${t3.ll} − ${t3.lr} = ${Q11_ANSWER} — answer A.`,
        `${t3.top} + ${t3.ll} − ${t3.lr} = ${Q11_ANSWER} — jawaban A.`,
      ),
    },
  ]

  return { answer: Q11_ANSWER, steps, finalIndex: steps.length - 1 }
}
