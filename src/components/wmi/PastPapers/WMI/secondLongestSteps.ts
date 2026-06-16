import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { BARS, LONGEST_LABEL, SECOND_LONGEST_LABEL } from './SecondLongestIllustration'

export type SecondLongestPhase = 'show' | 'longest' | 'second' | 'result'

export interface SecondLongestStep {
  phase: SecondLongestPhase
  /** Bar label highlighted amber as the current "longest" find. */
  longest: string | null
  /** Bar label highlighted green as the "second longest" answer. */
  second: string | null
  caption: string
  hold: number
  result: boolean
}

export interface SecondLongestStoryboard {
  longest: string
  secondLongest: string
  steps: SecondLongestStep[]
  finalIndex: number
}

export function buildSecondLongestSteps(lang: Lang): SecondLongestStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Length ordering, longest first, for narration.
  const ordered = [...BARS].sort((a, b) => b.length - a.length).map((b) => b.label)
  const longest = LONGEST_LABEL // 'B'
  const second = SECOND_LONGEST_LABEL // 'A'

  const steps: SecondLongestStep[] = [
    {
      phase: 'show',
      longest: null,
      second: null,
      hold: 1500,
      result: false,
      caption: t('Compare the strips. Which one is the second longest?', 'Bandingkan strip-nya. Mana yang kedua terpanjang?'),
    },
    {
      phase: 'longest',
      longest,
      second: null,
      hold: 1800,
      result: false,
      caption: t(`${longest} reaches the furthest — it is the longest.`, `${longest} paling jauh — itulah yang terpanjang.`),
    },
    {
      phase: 'second',
      longest,
      second,
      hold: 1800,
      result: false,
      caption: t(`The next longest after ${longest} is ${second}.`, `Yang terpanjang berikutnya setelah ${longest} adalah ${second}.`),
    },
    {
      phase: 'result',
      longest: null,
      second,
      hold: 0,
      result: true,
      caption: t(
        `Order: ${ordered.join(' > ')}. The second longest is ${second}.`,
        `Urutan: ${ordered.join(' > ')}. Yang kedua terpanjang adalah ${second}.`,
      ),
    },
  ]

  return { longest, secondLongest: second, steps, finalIndex: steps.length - 1 }
}
