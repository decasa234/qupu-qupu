// Storyboard for IKMC-19-EC-Q1 — "Who finished third?"
//
// The podium encodes rank by step height (taller step = higher rank).
// Step heights tallest→shortest: C (1st) > D (2nd) > E (3rd) > B (4th) > A (5th).
// Answer: E (on the 3rd-tallest step).
//
// Animation strategy — reveal ranks one per beat:
//   Beat 0 (intro):   Show the full podium, no highlights. "Read the step heights."
//   Beat 1 (1st):     Highlight C — tallest step → 1st place.
//   Beat 2 (2nd):     Highlight D — second tallest → 2nd place.
//   Beat 3 (3rd):     Highlight E — third tallest → 3rd place. ← ANSWER
//   Beat 4 (result):  Green cap, confirm answer E.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const PODIUM_ANSWER = 'E'
export const PODIUM_CHOICE = 'E'

export type PodiumPhase = 'intro' | 'rank1' | 'rank2' | 'rank3' | 'result'

export interface PodiumStep {
  phase: PodiumPhase
  /** Which runner labels to highlight (amber) in this beat. */
  highlight: string[]
  /** Rank badge to show beside each highlighted runner, e.g. "🥇" label. */
  rankLabel: string
  caption: string
  hold: number
  result: boolean
}

export interface PodiumStoryboard {
  steps: PodiumStep[]
  finalIndex: number
}

export function buildPodium1ECSteps(lang: Lang): PodiumStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PodiumStep[] = [
    {
      phase: 'intro',
      highlight: [],
      rankLabel: '',
      hold: 2200,
      result: false,
      caption: t(
        'The higher the step, the higher the rank. Let us find each rank by looking at step height — tallest step = 1st place.',
        'Tangga semakin tinggi = peringkat semakin tinggi. Mari temukan setiap peringkat berdasarkan ketinggian tangga — tangga tertinggi = peringkat 1.',
      ),
    },
    {
      phase: 'rank1',
      highlight: ['C'],
      rankLabel: '1st',
      hold: 2000,
      result: false,
      caption: t(
        'Runner C stands on the TALLEST step → C finished 1st.',
        'Pelari C berdiri di tangga TERTINGGI → C finis peringkat 1.',
      ),
    },
    {
      phase: 'rank2',
      highlight: ['D'],
      rankLabel: '2nd',
      hold: 2000,
      result: false,
      caption: t(
        'Runner D is on the second-tallest step → D finished 2nd.',
        'Pelari D berada di tangga tertinggi kedua → D finis peringkat 2.',
      ),
    },
    {
      phase: 'rank3',
      highlight: ['E'],
      rankLabel: '3rd',
      hold: 2200,
      result: false,
      caption: t(
        'Runner E is on the third-tallest step → E finished 3rd. That is the answer!',
        'Pelari E berada di tangga tertinggi ketiga → E finis peringkat 3. Itulah jawabannya!',
      ),
    },
    {
      phase: 'result',
      highlight: ['E'],
      rankLabel: '3rd',
      hold: 0,
      result: true,
      caption: t(
        `The third-highest step belongs to runner E. The answer is ${PODIUM_CHOICE}.`,
        `Tangga ketiga tertinggi dimiliki oleh pelari E. Jawabannya adalah ${PODIUM_CHOICE}.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
