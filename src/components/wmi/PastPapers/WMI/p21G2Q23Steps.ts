import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { Highlight } from './P21G2Q23Illustration'

// Storyboard for WMI-21P2A-Q23 (2021 semifinal Grade 2).
// Three bees give three orthographic views (top / side / front) of one hidden
// solid. To pick the right option you must test each candidate against ALL three
// views — only one matches every view. We don't have the candidate-solid art,
// so the explainer teaches the method and lands on the answer letter: A.

export const Q23_ANSWER = 'A'

export type Q23Phase = 'intro' | 'top' | 'side' | 'front' | 'combine' | 'result'

export interface Q23Step {
  phase: Q23Phase
  /** Which view to spotlight in the figure. */
  highlight: Highlight
  /** Reveal the "A" answer badge. */
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answer: string
  steps: Q23Step[]
  finalIndex: number
}

export function buildP21G2Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      phase: 'intro',
      highlight: 'none',
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Three bees look at one hidden solid from three directions — each sees one flat view.',
        'Tiga lebah melihat satu benda tersembunyi dari tiga arah — masing-masing melihat satu bentuk datar.',
      ),
    },
    {
      phase: 'top',
      highlight: 'top',
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Top view (blue bee, from above): this is the shape seen looking straight down.',
        'Tampak atas (lebah biru, dari atas): inilah bentuk saat dilihat dari atas.',
      ),
    },
    {
      phase: 'side',
      highlight: 'side',
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Side view (green bee, from the right): the solid must look like this from the side.',
        'Tampak samping (lebah hijau, dari kanan): dari samping benda harus tampak seperti ini.',
      ),
    },
    {
      phase: 'front',
      highlight: 'front',
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Front view (pink bee, from the front): a 3-step staircase shape.',
        'Tampak depan (lebah merah muda, dari depan): bentuk tangga 3 anak tangga.',
      ),
    },
    {
      phase: 'combine',
      highlight: 'none',
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Test each option against the front, side AND top — only one fits all three at once.',
        'Uji tiap pilihan dengan tampak depan, samping, DAN atas — hanya satu yang cocok ketiganya.',
      ),
    },
    {
      phase: 'result',
      highlight: 'none',
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Only one solid matches all three views — that is option ${Q23_ANSWER}.`,
        `Hanya satu benda yang cocok dengan ketiga tampak itu — yaitu pilihan ${Q23_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: Q23_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
