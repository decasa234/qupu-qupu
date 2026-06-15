import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_LETTER, RING_BLUE } from './P22G1Q22Illustration'

export type Q22Phase = 'show' | 'read' | 'strip' | 'rule' | 'result'

export interface Q22Step {
  phase: Q22Phase
  /** Wedge index being read this beat (0..7), or null. */
  focusWedge: number | null
  /** Number the wedges 1..8 in reading order. */
  showOrder: boolean
  /** How many swatches of the colour strip are revealed (0..8). */
  swatchCount: number
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  /** Colour cycle read clockwise from the top (true = blue). */
  ring: boolean[]
  answer: string
  steps: Q22Step[]
  finalIndex: number
}

export function buildP22G1Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q22Step[] = [
    {
      phase: 'show',
      focusWedge: null,
      showOrder: false,
      swatchCount: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Pick a start wedge and read the colours the way the arrow points — clockwise.',
        'Pilih satu juring awal lalu baca warnanya searah panah — searah jarum jam.',
      ),
    },
    {
      phase: 'read',
      focusWedge: 0,
      showOrder: true,
      swatchCount: 1,
      hold: 1800,
      result: false,
      caption: t(
        'Start at the top wedge: white. That is the first colour of the strip.',
        'Mulai dari juring atas: putih. Itu warna pertama strip.',
      ),
    },
    {
      phase: 'strip',
      focusWedge: 4,
      showOrder: true,
      swatchCount: 8,
      hold: 2400,
      result: false,
      caption: t(
        'Keep going clockwise: white, blue, blue, white, blue, white, blue, white.',
        'Lanjut searah jarum jam: putih, biru, biru, putih, biru, putih, biru, putih.',
      ),
    },
    {
      phase: 'rule',
      focusWedge: null,
      showOrder: false,
      swatchCount: 8,
      hold: 2400,
      result: false,
      caption: t(
        'A strip may be slid around (rotated) or its ends joined, but NOT flipped over. Match that exact order.',
        'Strip boleh digeser memutar (diputar) atau ujungnya disambung, tetapi TIDAK boleh dibalik. Cocokkan urutan persis itu.',
      ),
    },
    {
      phase: 'result',
      focusWedge: null,
      showOrder: false,
      swatchCount: 8,
      hold: 0,
      result: true,
      caption: t(
        `Only strip ${ANSWER_LETTER} has this cyclic colour order — answer ${ANSWER_LETTER}.`,
        `Hanya strip ${ANSWER_LETTER} yang memiliki urutan warna melingkar ini — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    ring: RING_BLUE,
    answer: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
