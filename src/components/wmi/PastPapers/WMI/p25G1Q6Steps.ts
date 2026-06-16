// Storyboard for WMI-25P1A-Q6 — sum of two pencil lengths on a ruler.
// Beat-by-beat: read pencil 1 (6 cm), read pencil 2 (4 cm), add → 10 cm (D).
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PENCIL_1, PENCIL_1_LEN, PENCIL_2, PENCIL_2_LEN, Q6_TOTAL } from './P25G1Q6Illustration'

export interface Q6Step {
  measure1: boolean
  measure2: boolean
  guides1: boolean
  guides2: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q6Storyboard {
  pencil1Len: number
  pencil2Len: number
  answer: number
  steps: Q6Step[]
  finalIndex: number
}

export function buildP25G1Q6Steps(lang: Lang): Q6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q6Step[] = [
    {
      measure1: false,
      measure2: false,
      guides1: false,
      guides2: false,
      hold: 1800,
      result: false,
      caption: t(
        'Neither pencil starts at 0, so length = tip mark − tail mark.',
        'Kedua pensil tidak mulai dari 0, jadi panjang = ujung − pangkal.',
      ),
    },
    {
      measure1: false,
      measure2: false,
      guides1: true,
      guides2: false,
      hold: 2000,
      result: false,
      caption: t(
        `Pencil 1 runs from ${PENCIL_1.tail} to ${PENCIL_1.tip}.`,
        `Pensil 1 dari ${PENCIL_1.tail} sampai ${PENCIL_1.tip}.`,
      ),
    },
    {
      measure1: true,
      measure2: false,
      guides1: true,
      guides2: false,
      hold: 2000,
      result: false,
      caption: t(
        `${PENCIL_1.tip} − ${PENCIL_1.tail} = ${PENCIL_1_LEN} cm.`,
        `${PENCIL_1.tip} − ${PENCIL_1.tail} = ${PENCIL_1_LEN} cm.`,
      ),
    },
    {
      measure1: true,
      measure2: false,
      guides1: false,
      guides2: true,
      hold: 2000,
      result: false,
      caption: t(
        `Pencil 2 runs from ${PENCIL_2.tail} to ${PENCIL_2.tip}, so ${PENCIL_2.tip} − ${PENCIL_2.tail} = ${PENCIL_2_LEN} cm.`,
        `Pensil 2 dari ${PENCIL_2.tail} sampai ${PENCIL_2.tip}, jadi ${PENCIL_2.tip} − ${PENCIL_2.tail} = ${PENCIL_2_LEN} cm.`,
      ),
    },
    {
      measure1: true,
      measure2: true,
      guides1: false,
      guides2: false,
      hold: 1900,
      result: false,
      caption: t(
        'Trap: don’t read the tip number (14) — measure the span.',
        'Jebakan: jangan baca angka ujung (14) — ukur rentangnya.',
      ),
    },
    {
      measure1: true,
      measure2: true,
      guides1: false,
      guides2: false,
      hold: 0,
      result: true,
      caption: t(
        `${PENCIL_1_LEN} + ${PENCIL_2_LEN} = ${Q6_TOTAL} cm — answer D.`,
        `${PENCIL_1_LEN} + ${PENCIL_2_LEN} = ${Q6_TOTAL} cm — jawaban D.`,
      ),
    },
  ]

  return {
    pencil1Len: PENCIL_1_LEN,
    pencil2Len: PENCIL_2_LEN,
    answer: Q6_TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
