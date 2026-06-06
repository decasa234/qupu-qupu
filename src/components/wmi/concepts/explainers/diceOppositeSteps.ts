import type { Lang } from './makeTenSteps'

export type DiceOppositePhase =
  | 'rule'
  | 'visible'
  | 'pairs'
  | 'subtract'
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
  const visible = t + f + r
  const hidden = 21 - visible

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
      phase: 'pairs',
      caption: T(
        'All 6 faces together: 1+2+3+4+5+6 = 21.',
        'Keenam sisi berjumlah: 1+2+3+4+5+6 = 21.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'subtract',
      caption: T(
        `Visible: ${t}+${f}+${r} = ${visible}. Hidden = 21 − ${visible}.`,
        `Terlihat: ${t}+${f}+${r} = ${visible}. Tersembunyi = 21 − ${visible}.`,
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

  return { t, f, r, visible, hidden, steps, finalIndex: steps.length - 1 }
}
