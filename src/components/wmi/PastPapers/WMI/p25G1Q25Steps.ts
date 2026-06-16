import type { Lang } from '../concepts/explainers/makeTenSteps'
import { COW_VALUE, LION_VALUE, Q25_ANSWER } from './P25G1Q25Illustration'

// Deterministic storyboard for WMI-25P1A-Q25 (Lion + Cow equations).
// Method, one idea per beat:
//   1. Show both givens side by side.
//   2. The second equation is the first PLUS one extra Lion -> the extra is the gap.
//   3. 25 - 14 = 11, so Lion = 11.
//   4. Lion + Cow = 14, so Cow = 14 - 11 = 3.
//   5. Lion + Cow + Cow = 11 + 3 + 3 = 17 (answer A).

export type Q25Phase = 'show' | 'compare' | 'lion' | 'cow' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** Reveal the asked total (17) in the diagram's bottom row. */
  revealAnswer: boolean
  /** Lion value to surface in the side panel, or null to hide. */
  showLion: number | null
  /** Cow value to surface in the side panel, or null to hide. */
  showCow: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  lion: number
  cow: number
  answer: number
  steps: Q25Step[]
  finalIndex: number
}

export function buildP25G1Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q25Step[] = [
    {
      phase: 'show',
      revealAnswer: false,
      showLion: null,
      showCow: null,
      hold: 1800,
      result: false,
      caption: t(
        'Two clues. We want Lion + Cow + Cow.',
        'Dua petunjuk. Kita ingin Singa + Sapi + Sapi.',
      ),
    },
    {
      phase: 'compare',
      revealAnswer: false,
      showLion: null,
      showCow: null,
      hold: 2300,
      result: false,
      caption: t(
        'The 25 clue is the 14 clue plus ONE extra Lion.',
        'Petunjuk 25 adalah petunjuk 14 ditambah SATU Singa lagi.',
      ),
    },
    {
      phase: 'lion',
      revealAnswer: false,
      showLion: LION_VALUE,
      showCow: null,
      hold: 2200,
      result: false,
      caption: t(
        `So that extra Lion = 25 - 14 = ${LION_VALUE}. Lion = ${LION_VALUE}.`,
        `Jadi Singa tambahan itu = 25 - 14 = ${LION_VALUE}. Singa = ${LION_VALUE}.`,
      ),
    },
    {
      phase: 'cow',
      revealAnswer: false,
      showLion: LION_VALUE,
      showCow: COW_VALUE,
      hold: 2200,
      result: false,
      caption: t(
        `Lion + Cow = 14, so Cow = 14 - ${LION_VALUE} = ${COW_VALUE}.`,
        `Singa + Sapi = 14, jadi Sapi = 14 - ${LION_VALUE} = ${COW_VALUE}.`,
      ),
    },
    {
      phase: 'result',
      revealAnswer: true,
      showLion: LION_VALUE,
      showCow: COW_VALUE,
      hold: 0,
      result: true,
      caption: t(
        `Lion + Cow + Cow = ${LION_VALUE} + ${COW_VALUE} + ${COW_VALUE} = ${Q25_ANSWER} — answer A.`,
        `Singa + Sapi + Sapi = ${LION_VALUE} + ${COW_VALUE} + ${COW_VALUE} = ${Q25_ANSWER} — jawaban A.`,
      ),
    },
  ]

  return {
    lion: LION_VALUE,
    cow: COW_VALUE,
    answer: Q25_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
