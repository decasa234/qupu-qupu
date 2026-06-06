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
  /** All names in the correct first-to-last order. */
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
 * Storyboard for truth-order-clues.
 *
 * Params: `{ order: string[], clueOrder: number[] }`. The clues are the
 * consecutive "order[i] is before order[i+1]" pairs, *presented scrambled* in
 * clueOrder. The strategy shown: read the jumbled clues, link them end to end
 * into one line, then read who is at the front.
 */
export function buildTruthOrderSteps(
  rawOrder: unknown,
  rawClueOrder: unknown,
  lang: Lang,
): TruthOrderStoryboard {
  // Defensive: tolerate stale/garbage params.
  const order: string[] = Array.isArray(rawOrder)
    ? rawOrder.filter((x): x is string => typeof x === 'string')
    : []
  while (order.length < 3) order.push(`?${order.length + 1}`)

  const n = order.length
  const consecutive = order.slice(0, -1).map((name, i) => [name, order[i + 1]] as [string, string])

  const clueOrder: number[] = Array.isArray(rawClueOrder)
    ? rawClueOrder.filter((x): x is number => typeof x === 'number' && x >= 0 && x < consecutive.length)
    : []
  // Fall back to chain order if clueOrder is missing/incomplete.
  const presented = clueOrder.length === consecutive.length ? clueOrder.map((i) => consecutive[i]) : consecutive
  const jumbled = presented.map(([a, b]) => `${a}→${b}`).join(', ')

  const answer = order[0]

  const steps: TruthOrderStep[] = [
    // Beat 0: the scrambled clues.
    {
      placed: [],
      newIndex: null,
      result: false,
      hold: 2200,
      caption: t(lang, `Clues (mixed up): ${jumbled}.`, `Petunjuk (teracak): ${jumbled}.`),
    },
    // Beat 1: start the line with the first link.
    {
      placed: order.slice(0, 2),
      newIndex: 1,
      result: false,
      hold: 1900,
      caption: t(lang, `Start the line: ${order[0]} is before ${order[1]}.`, `Mulai barisan: ${order[0]} sebelum ${order[1]}.`),
    },
  ]

  // Beats 2..n-1: link the remaining people one at a time.
  for (let k = 2; k < n; k++) {
    steps.push({
      placed: order.slice(0, k + 1),
      newIndex: k,
      result: false,
      hold: 1700,
      caption: t(lang, `${order[k - 1]} is before ${order[k]} — add ${order[k]}.`, `${order[k - 1]} sebelum ${order[k]} — tambahkan ${order[k]}.`),
    })
  }

  // Final beat: the head of the line is the answer.
  steps.push({
    placed: order.slice(),
    newIndex: 0,
    result: true,
    hold: 0,
    caption: t(lang, `${answer} is at the front — ${answer} is first!`, `${answer} paling depan — ${answer} yang pertama!`),
  })

  return { order, answer, steps, finalIndex: steps.length - 1 }
}
