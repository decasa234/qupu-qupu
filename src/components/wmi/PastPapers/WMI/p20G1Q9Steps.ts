import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { DIFFERENCE, LONGEST, RIBBONS, SHORTEST } from './P20G1Q9Illustration'

export type RibbonPhase = 'show' | 'measure' | 'longest' | 'shortest' | 'result'

export interface RibbonStep {
  phase: RibbonPhase
  /** Index of the ribbon to ring (0..3) or null. */
  highlight: number | null
  showLength: boolean
  highlightColor: string
  caption: string
  hold: number
  result: boolean
}

export interface RibbonStoryboard {
  longest: number
  shortest: number
  difference: number
  steps: RibbonStep[]
  finalIndex: number
}

const BLUE = '#2f6df0'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

// Indices of the longest and shortest ribbons within RIBBONS.
const LONG_I = RIBBONS.findIndex((r) => r.squares === LONGEST)
const SHORT_I = RIBBONS.findIndex((r) => r.squares === SHORTEST)

export function buildP20G1Q9Steps(lang: Lang): RibbonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RibbonStep[] = [
    {
      phase: 'show',
      highlight: null,
      showLength: false,
      highlightColor: BLUE,
      hold: 1700,
      result: false,
      caption: t(
        'Forget the patterns — measure each ribbon by the grid squares it covers.',
        'Abaikan coraknya — ukur tiap pita dari banyak kotak yang ditutupinya.',
      ),
    },
    {
      phase: 'measure',
      highlight: 0,
      showLength: true,
      highlightColor: BLUE,
      hold: 1500,
      result: false,
      caption: t(`Ribbon A covers ${RIBBONS[0].squares} squares.`, `Pita A menutupi ${RIBBONS[0].squares} kotak.`),
    },
    {
      phase: 'measure',
      highlight: 1,
      showLength: true,
      highlightColor: BLUE,
      hold: 1500,
      result: false,
      caption: t(`Ribbon B covers ${RIBBONS[1].squares} squares.`, `Pita B menutupi ${RIBBONS[1].squares} kotak.`),
    },
    {
      phase: 'measure',
      highlight: 2,
      showLength: true,
      highlightColor: BLUE,
      hold: 1500,
      result: false,
      caption: t(`Ribbon C covers ${RIBBONS[2].squares} squares.`, `Pita C menutupi ${RIBBONS[2].squares} kotak.`),
    },
    {
      phase: 'measure',
      highlight: 3,
      showLength: true,
      highlightColor: BLUE,
      hold: 1500,
      result: false,
      caption: t(`Ribbon D covers ${RIBBONS[3].squares} squares.`, `Pita D menutupi ${RIBBONS[3].squares} kotak.`),
    },
    {
      phase: 'longest',
      highlight: LONG_I,
      showLength: true,
      highlightColor: GREEN,
      hold: 1700,
      result: false,
      caption: t(`Longest ribbon = ${LONGEST} squares.`, `Pita terpanjang = ${LONGEST} kotak.`),
    },
    {
      phase: 'shortest',
      highlight: SHORT_I,
      showLength: true,
      highlightColor: AMBER,
      hold: 1700,
      result: false,
      caption: t(`Shortest ribbon = ${SHORTEST} squares.`, `Pita terpendek = ${SHORTEST} kotak.`),
    },
    {
      phase: 'result',
      highlight: SHORT_I,
      showLength: false,
      highlightColor: GREEN,
      hold: 0,
      result: true,
      caption: t(
        `${LONGEST} - ${SHORTEST} = ${DIFFERENCE} squares longer — answer B.`,
        `${LONGEST} - ${SHORTEST} = ${DIFFERENCE} kotak lebih panjang — jawaban B.`,
      ),
    },
  ]

  return {
    longest: LONGEST,
    shortest: SHORTEST,
    difference: DIFFERENCE,
    steps,
    finalIndex: steps.length - 1,
  }
}
