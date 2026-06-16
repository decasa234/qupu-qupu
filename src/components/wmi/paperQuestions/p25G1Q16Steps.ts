import type { Lang } from '../concepts/explainers/makeTenSteps'
import { HANDS, LEFT_COUNTS, LEFT_TOTAL } from './P25G1Q16Illustration'

export type HandPhase = 'show' | 'pickLeft' | 'add' | 'result'

export interface HandStep {
  phase: HandPhase
  /** Hand indices to highlight (the left hands being counted). */
  litHands: number[]
  /** Running total of stretched left-hand fingers. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface HandStoryboard {
  leftTotal: number
  answer: string
  steps: HandStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-25P1A-Q16. The trap is counting every hand; only the
 * LEFT hands count. The explainer highlights the left hands, then adds their
 * stretched fingers one hand at a time, landing on 11 (answer C).
 *
 *   left hands' stretched fingers: 5 + 4 + 2 = 11.
 */
export function buildP25G1Q16Steps(lang: Lang, answer: string): HandStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const ans = (answer || 'C').toUpperCase()

  const leftIdx = HANDS.map((h, i) => (h.left ? i : -1)).filter((i) => i >= 0)
  const [c1, c2, c3] = LEFT_COUNTS // 5,4,2

  const steps: HandStep[] = [
    {
      phase: 'show',
      litHands: [],
      running: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Trap: don’t count every hand. Only the LEFT hands count.',
        'Jebakan: jangan hitung semua tangan. Hanya tangan KIRI yang dihitung.',
      ),
    },
    {
      phase: 'pickLeft',
      litHands: leftIdx,
      running: 0,
      hold: 2000,
      result: false,
      caption: t('These three are the left hands.', 'Ketiga ini adalah tangan kiri.'),
    },
    {
      phase: 'add',
      litHands: [leftIdx[0]],
      running: c1,
      hold: 1800,
      result: false,
      caption: t(`First left hand: ${c1} stretched fingers.`, `Tangan kiri pertama: ${c1} jari terentang.`),
    },
    {
      phase: 'add',
      litHands: [leftIdx[0], leftIdx[1]],
      running: c1 + c2,
      hold: 1800,
      result: false,
      caption: t(`Next: + ${c2} = ${c1 + c2}.`, `Berikutnya: + ${c2} = ${c1 + c2}.`),
    },
    {
      phase: 'add',
      litHands: leftIdx,
      running: c1 + c2 + c3,
      hold: 1800,
      result: false,
      caption: t(`Last: + ${c3} = ${c1 + c2 + c3}.`, `Terakhir: + ${c3} = ${c1 + c2 + c3}.`),
    },
    {
      phase: 'result',
      litHands: leftIdx,
      running: LEFT_TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `${c1} + ${c2} + ${c3} = ${LEFT_TOTAL} stretched fingers — answer ${ans}.`,
        `${c1} + ${c2} + ${c3} = ${LEFT_TOTAL} jari terentang — jawaban ${ans}.`,
      ),
    },
  ]

  return { leftTotal: LEFT_TOTAL, answer: ans, steps, finalIndex: steps.length - 1 }
}
