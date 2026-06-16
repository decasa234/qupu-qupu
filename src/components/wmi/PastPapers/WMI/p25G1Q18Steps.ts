import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FOUR_PAINTED_COUNT } from './P25G1Q18Illustration'

export type SolidPhase = 'show' | 'rule' | 'find' | 'result'

export interface SolidStep {
  phase: SolidPhase
  /** Glow the four-painted cubes found so far + dim the rest. */
  litFour: boolean
  /** How many four-painted cubes are revealed so far. */
  revealCount: number
  /** Running count of four-painted cubes. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface SolidStoryboard {
  answer: string
  total: number
  steps: SolidStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-25P1A-Q18. A small cube is painted only on its outward
 * faces; a glued face is hidden. So a cube shows exactly 4 red faces when it is
 * glued to exactly 2 neighbours. The explainer states the rule, then lights up
 * the six such cubes a few at a time, landing on 6 (answer A).
 */
export function buildP25G1Q18Steps(lang: Lang, answer: string): SolidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const ans = (answer || 'A').toUpperCase()
  const total = FOUR_PAINTED_COUNT // 6

  const steps: SolidStep[] = [
    {
      phase: 'show',
      litFour: false,
      revealCount: 0,
      running: 0,
      hold: 1800,
      result: false,
      caption: t(
        'A cube is painted only where it faces outward. A glued face stays unpainted.',
        'Kubus dicat hanya di sisi yang menghadap keluar. Sisi yang menempel tidak dicat.',
      ),
    },
    {
      phase: 'rule',
      litFour: false,
      revealCount: 0,
      running: 0,
      hold: 2100,
      result: false,
      caption: t(
        '6 − (neighbours) = painted faces. 4 painted ⇒ glued to exactly 2 cubes.',
        '6 − (tetangga) = sisi dicat. 4 dicat ⇒ menempel tepat pada 2 kubus.',
      ),
    },
    {
      phase: 'find',
      litFour: true,
      revealCount: 2,
      running: 2,
      hold: 1900,
      result: false,
      caption: t('Find the cubes with exactly 2 neighbours… 2 so far.', 'Cari kubus dengan tepat 2 tetangga… 2 sejauh ini.'),
    },
    {
      phase: 'find',
      litFour: true,
      revealCount: 4,
      running: 4,
      hold: 1900,
      result: false,
      caption: t('Two more on the steps… 4.', 'Dua lagi di anak tangga… 4.'),
    },
    {
      phase: 'find',
      litFour: true,
      revealCount: 6,
      running: total,
      hold: 1900,
      result: false,
      caption: t(`Two more corners… ${total}.`, `Dua sudut lagi… ${total}.`),
    },
    {
      phase: 'result',
      litFour: true,
      revealCount: 6,
      running: total,
      hold: 0,
      result: true,
      caption: t(
        `${total} cubes touch exactly 2 neighbours, so ${total} show 4 red faces — answer ${ans}.`,
        `${total} kubus menempel tepat 2 tetangga, jadi ${total} kubus berisi 4 sisi merah — jawaban ${ans}.`,
      ),
    },
  ]

  return { answer: ans, total, steps, finalIndex: steps.length - 1 }
}
