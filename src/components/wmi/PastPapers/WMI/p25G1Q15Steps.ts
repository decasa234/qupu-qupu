import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ALLY_DARTS, ALLY_TOTAL } from './P25G1Q15Illustration'

export type DartPhase = 'show' | 'tally' | 'rule' | 'result'

export interface DartStep {
  phase: DartPhase
  /** Show Ally's running total badge. */
  showTotal: boolean
  /** How many of Ally's darts are tallied so far (0..5). */
  countedDarts: number
  caption: string
  hold: number
  result: boolean
}

export interface DartStoryboard {
  allyTotal: number
  answer: string
  steps: DartStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-25P1A-Q15. The option boards are images (choices are
 * placeholders), so the explainer derives Ally's total, states the winning rule,
 * and lands on the keyed answer letter (D = the only board that ties or beats
 * Ally, so it is impossible if Ally wins).
 *
 *   Ally = 10 + 10 + 1 + 1 + 0 = 22.
 *   To win, Luka must score LESS than 22.
 *   Option D scores 22 or more -> impossible -> answer D.
 */
export function buildP25G1Q15Steps(lang: Lang, answer: string): DartStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const ans = (answer || 'D').toUpperCase()
  const [a, b, c, d, e] = ALLY_DARTS // 10,10,1,1,0

  const steps: DartStep[] = [
    {
      phase: 'show',
      showTotal: false,
      countedDarts: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Rings are worth 10, 5, 1 — a miss is 0. First add up Ally’s board.',
        'Lingkaran bernilai 10, 5, 1 — meleset 0. Pertama jumlahkan papan Ally.',
      ),
    },
    {
      phase: 'tally',
      showTotal: true,
      countedDarts: 2,
      hold: 1900,
      result: false,
      caption: t(`Two darts in the centre: ${a} + ${b} = 20.`, `Dua panah di tengah: ${a} + ${b} = 20.`),
    },
    {
      phase: 'tally',
      showTotal: true,
      countedDarts: 4,
      hold: 1900,
      result: false,
      caption: t(
        `Two darts in the outer ring: + ${c} + ${d} = 22.`,
        `Dua panah di lingkaran luar: + ${c} + ${d} = 22.`,
      ),
    },
    {
      phase: 'tally',
      showTotal: true,
      countedDarts: 5,
      hold: 1900,
      result: false,
      caption: t(
        `The last dart misses: + ${e}. Ally = ${ALLY_TOTAL}.`,
        `Panah terakhir meleset: + ${e}. Ally = ${ALLY_TOTAL}.`,
      ),
    },
    {
      phase: 'rule',
      showTotal: true,
      countedDarts: 5,
      hold: 2000,
      result: false,
      caption: t(
        `Ally wins only if Luka scores LESS than ${ALLY_TOTAL}.`,
        `Ally menang hanya jika Luka mencetak KURANG dari ${ALLY_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      showTotal: true,
      countedDarts: 5,
      hold: 0,
      result: true,
      caption: t(
        `Board ${ans} reaches ${ALLY_TOTAL} or more, so it cannot happen — answer ${ans}.`,
        `Papan ${ans} mencapai ${ALLY_TOTAL} atau lebih, jadi tak mungkin — jawaban ${ans}.`,
      ),
    },
  ]

  return { allyTotal: ALLY_TOTAL, answer: ans, steps, finalIndex: steps.length - 1 }
}
