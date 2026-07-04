// Deterministic storyboard for WMI-22P2A-Q23 (colour-ring → strip, answer A).
//
// We read the ring's colours in the arrow's direction, unroll them into a
// straight strip, and note that the right strip is any ROTATION of that order
// (joining ends is allowed) — but NOT the reversed order (flipping is banned).
// That rotation is option A.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { RING_N, STRIP_COLORS } from './P22G2Q23Illustration'

export interface RingStep {
  /** How many wedges have been read into the strip so far (0..RING_N). */
  read: number
  /** Show the unrolled strip row beneath the ring. */
  showStrip: boolean
  /** Highlight that reversing is not allowed. */
  flipNote: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RingStoryboard {
  colors: typeof STRIP_COLORS
  steps: RingStep[]
  finalIndex: number
}

export function buildP22G2Q23Steps(lang: Lang): RingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const stripEn = STRIP_COLORS.join(', ')
  const stripId = STRIP_COLORS.map((c) => (c === 'blue' ? 'biru' : 'putih')).join(', ')

  const steps: RingStep[] = [
    {
      read: 0,
      showStrip: false,
      flipNote: false,
      hold: 1700,
      result: false,
      caption: t(
        'Read the wedge colours around the ring, following the red arrow.',
        'Baca warna tiap baji mengelilingi cincin, mengikuti panah merah.',
      ),
    },
    {
      read: RING_N,
      showStrip: true,
      flipNote: false,
      hold: 2000,
      result: false,
      caption: t(`Unroll them into a straight strip: ${stripEn}.`, `Buka jadi pita lurus: ${stripId}.`),
    },
    {
      read: RING_N,
      showStrip: true,
      flipNote: false,
      hold: 1900,
      result: false,
      caption: t(
        'The strip’s ends may be joined, so any strip that is just a ROTATION of this order is the same ring.',
        'Ujung pita boleh disambung, jadi pita yang hanya PUTARAN dari urutan ini adalah cincin yang sama.',
      ),
    },
    {
      read: RING_N,
      showStrip: true,
      flipNote: true,
      hold: 1900,
      result: false,
      caption: t(
        'But the strip can’t be flipped — a strip in REVERSED order is a different one, so reject it.',
        'Tapi pita tidak boleh dibalik — pita dengan urutan TERBALIK itu berbeda, jadi tolak.',
      ),
    },
    {
      read: RING_N,
      showStrip: true,
      flipNote: false,
      hold: 0,
      result: true,
      caption: t(
        'Only strip A is a rotation of the ring’s order — answer A.',
        'Hanya pita A yang merupakan putaran urutan cincin — jawaban A.',
      ),
    },
  ]

  return { colors: STRIP_COLORS, steps, finalIndex: steps.length - 1 }
}
