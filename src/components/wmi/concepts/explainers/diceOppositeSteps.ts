import type { Lang } from './makeTenSteps'

export type DiceOppositePhase =
  | 'rule'
  | 'visible'
  | 'opposites'
  | 'add'
  | 'result'

export interface DiceOppositeStep {
  phase: DiceOppositePhase
  caption: string
  hold: number
  result: boolean
}

export interface DiceOppositeStoryboard {
  t: number
  f: number
  r: number
  /** Opposite (hidden) face of each shown face = 7 − shown. */
  tOpp: number
  fOpp: number
  rOpp: number
  visible: number
  hidden: number
  steps: DiceOppositeStep[]
  finalIndex: number
}

function clampFace(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(6, Math.round(n)))
}

export function buildDiceOppositeSteps(
  tRaw: number,
  fRaw: number,
  rRaw: number,
  lang: Lang,
): DiceOppositeStoryboard {
  const t = clampFace(tRaw)
  const f = clampFace(fRaw)
  const r = clampFace(rRaw)
  // Each hidden face is directly opposite a shown face, and opposite faces add to 7.
  const tOpp = 7 - t
  const fOpp = 7 - f
  const rOpp = 7 - r
  const visible = t + f + r
  const hidden = tOpp + fOpp + rOpp // = 21 − visible

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiceOppositeStep[] = [
    {
      phase: 'rule',
      caption: T(
        'On a standard die, opposite faces always sum to 7.',
        'Pada dadu standar, sisi yang berhadapan selalu berjumlah 7.',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'visible',
      caption: T(
        `Three faces show: top ${t}, front ${f}, right ${r}.`,
        `Tiga sisi terlihat: atas ${t}, depan ${f}, kanan ${r}.`,
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'opposites',
      caption: T(
        `Each hidden face is 7 − the shown one: ${tOpp}, ${fOpp}, ${rOpp}.`,
        `Setiap sisi tersembunyi = 7 − sisi terlihat: ${tOpp}, ${fOpp}, ${rOpp}.`,
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'add',
      caption: T(
        `Add the hidden faces: ${tOpp} + ${fOpp} + ${rOpp} = ${hidden}.`,
        `Jumlahkan sisi tersembunyi: ${tOpp} + ${fOpp} + ${rOpp} = ${hidden}.`,
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'result',
      caption: T(
        `The hidden faces total ${hidden}.`,
        `Jumlah sisi tersembunyi adalah ${hidden}.`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { t, f, r, tOpp, fOpp, rOpp, visible, hidden, steps, finalIndex: steps.length - 1 }
}
