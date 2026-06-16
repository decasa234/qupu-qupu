import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER_FRUIT,
  ANSWER_LABEL,
  CYCLE,
  FRUIT_EMOJI,
  MARK_POS,
  ROW_LEN,
} from './P21G1Q16Illustration'

// Storyboard for WMI-21P1A-Q16 — read the repeating cycle, count 10 from the
// right to land on the marked bracket cell, continue the pattern into it, then
// pick the matching option (C = cherry).

export interface Q16Step {
  /** Show the repeating-cycle bracket under the first three fruits. */
  showCycle: boolean
  /** Count cells 1..countFromRight from the right (0 = none yet). */
  countFromRight: number
  /** Fill the bracket with the pattern fruit. */
  fillBracket: boolean
  /** Highlight the matching option. */
  showOption: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q16Storyboard {
  cycleEmoji: string[]
  answerFruitEmoji: string
  answerLabel: 'A' | 'B' | 'C' | 'D'
  markPos: number
  rowLen: number
  steps: Q16Step[]
  finalIndex: number
}

export function buildP21G1Q16Steps(lang: Lang): Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const cycleStr = CYCLE.map((f) => FRUIT_EMOJI[f]).join(' ')
  const ansEmoji = FRUIT_EMOJI[ANSWER_FRUIT]

  const steps: Q16Step[] = [
    {
      showCycle: false,
      countFromRight: 0,
      fillBracket: false,
      showOption: false,
      hold: 2100,
      result: false,
      caption: t(
        `The same 3 fruits repeat over and over: ${cycleStr}.`,
        `Tiga buah yang sama berulang terus: ${cycleStr}.`,
      ),
    },
    {
      showCycle: true,
      countFromRight: 0,
      fillBracket: false,
      showOption: false,
      hold: 2300,
      result: false,
      caption: t(
        `So each fruit's place in the cycle is fixed: ${cycleStr}, ${cycleStr}, …`,
        `Jadi posisi tiap buah dalam pola sudah pasti: ${cycleStr}, ${cycleStr}, …`,
      ),
    },
    {
      showCycle: true,
      countFromRight: 10,
      fillBracket: false,
      showOption: false,
      hold: 2600,
      result: false,
      caption: t(
        `Count 10 from the RIGHT — the 10th cell is the bracket (position ${MARK_POS} from the left).`,
        `Hitung 10 dari KANAN — sel ke-10 adalah tanda kurung (posisi ${MARK_POS} dari kiri).`,
      ),
    },
    {
      showCycle: true,
      countFromRight: 10,
      fillBracket: true,
      showOption: false,
      hold: 2500,
      result: false,
      caption: t(
        `Position ${MARK_POS} of the cycle is ${ansEmoji} — so the bracket holds ${ansEmoji}.`,
        `Posisi ${MARK_POS} dalam pola adalah ${ansEmoji} — jadi tanda kurung berisi ${ansEmoji}.`,
      ),
    },
    {
      showCycle: true,
      countFromRight: 10,
      fillBracket: true,
      showOption: true,
      hold: 0,
      result: true,
      caption: t(
        `${ansEmoji} is option (${ANSWER_LABEL}).`,
        `${ansEmoji} adalah pilihan (${ANSWER_LABEL}).`,
      ),
    },
  ]

  return {
    cycleEmoji: CYCLE.map((f) => FRUIT_EMOJI[f]),
    answerFruitEmoji: ansEmoji,
    answerLabel: ANSWER_LABEL,
    markPos: MARK_POS,
    rowLen: ROW_LEN,
    steps,
    finalIndex: steps.length - 1,
  }
}
