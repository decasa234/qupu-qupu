import type { Lang } from '../concepts/explainers/makeTenSteps'
import { FOODS, TARGET_POSITION, indexFromStar, ANSWER_FOOD } from './PatternNinthG2Illustration'

export type PatternPhase = 'show' | 'count' | 'result'

export interface PatternStep {
  phase: PatternPhase
  /** How many pictures have been counted from the ★ so far (0 = none yet). */
  count: number
  /** 0-based left index of the picture currently highlighted, or -1 for none. */
  activeIndex: number
  /** Highlight the answer option with this label, or null. */
  highlightOption: 'A' | 'B' | 'C' | 'D' | null
  caption: string
  hold: number
  result: boolean
}

export interface PatternStoryboard {
  steps: PatternStep[]
  finalIndex: number
}

/**
 * Storyboard for "the 9th figure counting from ★".
 *
 * We start at the ★ on the right end, then count 1..9 moving LEFT, lighting up
 * each picture in turn. The 9th picture is 🍡 (the dango skewer), option D.
 */
export function buildPatternNinthG2Steps(lang: Lang): PatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PatternStep[] = [
    {
      phase: 'show',
      count: 0,
      activeIndex: -1,
      highlightOption: null,
      hold: 1800,
      result: false,
      caption: t(
        'Find the ★ at the right end of the row.',
        'Temukan ★ di ujung kanan barisan.',
      ),
    },
  ]

  // Count 1..9, each step moving one picture further left from the ★.
  for (let n = 1; n <= TARGET_POSITION; n++) {
    const idx = indexFromStar(n) // 0-based left index of the n-th picture
    const emoji = FOODS[idx]
    const isLast = n === TARGET_POSITION
    steps.push({
      phase: 'count',
      count: n,
      activeIndex: idx,
      highlightOption: null,
      hold: isLast ? 2000 : 850,
      result: false,
      caption: isLast
        ? t(
            `Picture number ${n} — that's the one we want: ${emoji}.`,
            `Gambar ke-${n} — itu yang kita cari: ${emoji}.`,
          )
        : t(
            `Counting from ★, picture number ${n} is ${emoji}.`,
            `Dihitung dari ★, gambar ke-${n} adalah ${emoji}.`,
          ),
    })
  }

  // Final beat: the 9th picture is the answer, option D.
  steps.push({
    phase: 'result',
    count: TARGET_POSITION,
    activeIndex: indexFromStar(TARGET_POSITION),
    highlightOption: 'D',
    hold: 0,
    result: true,
    caption: t(
      `The 9th picture from ★ is ${ANSWER_FOOD} → D.`,
      `Gambar ke-9 dari ★ adalah ${ANSWER_FOOD} → D.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
