export type Lang = 'en' | 'id'

export interface TruthOrderStep {
  /** Which items are visible in the ranked row (in order, left = first). */
  placed: string[]
  /** Index in `placed` of the card that was just inserted by this step's clue. */
  newIndex: number | null
  /** Whether this is the final answer-reveal step. */
  result: boolean
  /** Hold duration in ms (0 = stay; non-zero = auto-advance after this many ms). */
  hold: number
  caption: string
}

export interface TruthOrderStoryboard {
  /** All three names in the correct first-to-last order. */
  order: string[]
  /** The name that is first (the answer). */
  answer: string
  steps: TruthOrderStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

/**
 * Builds the step-by-step storyboard for the truth-order-clues concept.
 *
 * Params shape: `{ order: string[] }` where order is [first, second, third].
 * The two clues are:
 *   Clue 1: order[0] is before order[1]
 *   Clue 2: order[1] is before order[2]
 *
 * Strategy: chain the comparison clues left-to-right to build the full order,
 * then read off who is first.
 */
export function buildTruthOrderSteps(
  rawOrder: unknown,
  lang: Lang,
): TruthOrderStoryboard {
  // Defensive: ensure we have a valid array of at least 3 strings
  const order: string[] = Array.isArray(rawOrder)
    ? rawOrder.filter((x): x is string => typeof x === 'string').slice(0, 3)
    : []
  // Pad to 3 if short (should never happen in practice)
  while (order.length < 3) order.push(`?${order.length + 1}`)

  const [first, second, third] = order
  const answer = first

  const steps: TruthOrderStep[] = [
    // Beat 0: show first clue — place first and second
    {
      placed: [first, second],
      newIndex: null,
      result: false,
      hold: 1800,
      caption: t(
        lang,
        `Clue 1: ${first} is before ${second}.`,
        `Petunjuk 1: ${first} berada sebelum ${second}.`,
      ),
    },
    // Beat 1: apply second clue — append third
    {
      placed: [first, second, third],
      newIndex: 2,
      result: false,
      hold: 1800,
      caption: t(
        lang,
        `Clue 2: ${second} is before ${third}. Chain them.`,
        `Petunjuk 2: ${second} berada sebelum ${third}. Rangkaikan.`,
      ),
    },
    // Beat 2 (final): highlight first position as the answer
    {
      placed: [first, second, third],
      newIndex: 0,
      result: true,
      hold: 0,
      caption: t(
        lang,
        `${first} is first! ${first} -> ${second} -> ${third}.`,
        `${first} yang pertama! ${first} -> ${second} -> ${third}.`,
      ),
    },
  ]

  return { order, answer, steps, finalIndex: steps.length - 1 }
}
