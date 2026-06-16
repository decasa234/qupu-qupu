import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANSWER_LETTER,
  COUNT_CIRCLE,
  COUNT_DIAMOND,
  COUNT_PLAIN,
  type FaceKind,
} from './P24G1Q21Illustration'

export type CubeNetQ21Phase = 'show' | 'count' | 'fold' | 'corner' | 'result'

export interface CubeNetQ21Step {
  phase: CubeNetQ21Phase
  /** Net-face indices to keep bright (others dim); null = all bright. */
  dimExcept: number[] | null
  /** When set, render the folded-cube corner view with these three visible faces. */
  cube: { top: FaceKind; left: FaceKind; right: FaceKind } | null
  caption: string
  hold: number
  result: boolean
}

export interface CubeNetQ21Storyboard {
  answer: string
  steps: CubeNetQ21Step[]
  finalIndex: number
}

// The two diamond faces in NET_FACES are indices 0 and 5.
const DIAMOND_IDS = [0, 5]

export function buildP24G1Q21Steps(lang: Lang): CubeNetQ21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeNetQ21Step[] = [
    {
      phase: 'show',
      dimExcept: null,
      cube: null,
      hold: 1700,
      result: false,
      caption: t('First, name the faces on the net.', 'Pertama, sebut tiap sisi pada jaring.'),
    },
    {
      phase: 'count',
      dimExcept: null,
      cube: null,
      hold: 2200,
      result: false,
      caption: t(
        `${COUNT_CIRCLE} red circles, ${COUNT_DIAMOND} blue diamonds, ${COUNT_PLAIN} plain face.`,
        `${COUNT_CIRCLE} lingkaran merah, ${COUNT_DIAMOND} belah ketupat biru, ${COUNT_PLAIN} sisi polos.`,
      ),
    },
    {
      phase: 'fold',
      dimExcept: DIAMOND_IDS,
      cube: null,
      hold: 2400,
      result: false,
      caption: t(
        'Fold it up: the two diamonds are far apart on the net, so they land on OPPOSITE faces — never side by side.',
        'Lipat: kedua belah ketupat berjauhan di jaring, jadi mereka di sisi BERSEBERANGAN — tak pernah bersebelahan.',
      ),
    },
    {
      phase: 'corner',
      dimExcept: null,
      cube: { top: 'circle', left: 'diamond', right: 'plain' },
      hold: 2300,
      result: false,
      caption: t(
        'At any corner the cube shows one diamond next to a circle and the plain face — only one diamond is ever visible at once.',
        'Di tiap sudut kubus tampak satu belah ketupat di samping lingkaran dan sisi polos — hanya satu belah ketupat terlihat sekaligus.',
      ),
    },
    {
      phase: 'result',
      dimExcept: null,
      cube: { top: 'circle', left: 'diamond', right: 'plain' },
      hold: 0,
      result: true,
      caption: t(
        `Only option ${ANSWER_LETTER} shows that arrangement — answer (${ANSWER_LETTER}).`,
        `Hanya opsi ${ANSWER_LETTER} yang menunjukkan susunan itu — jawaban (${ANSWER_LETTER}).`,
      ),
    },
  ]

  return { answer: ANSWER_LETTER, steps, finalIndex: steps.length - 1 }
}
