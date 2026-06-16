import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { QUALIFYING_ROUTES } from './RouteTree23G1Illustration'

// WMI-23F1A-Q20 — "Monkey route tree". The monkey wants a BANANA but must never
// pass an APPLE. Eight routes branch out; each route passes two foods (a junction
// food and an endpoint food). A route qualifies iff it touches a banana AND no
// apple. The storyboard walks the eight routes one per beat — for each it reports
// whether the route reaches a banana and whether it hits an apple, marks the
// route ✓ or ✗, and keeps a running count of the good routes. After all eight it
// rings the qualifying endpoints (markGood) and lands on the count = 4.

export type RouteTreePhase = 'show' | 'trace' | 'result'

// Per-route foods, kept here so the captions agree with the static figure's tree.
// [junction food, endpoint food] for routes 1..8.
const ROUTE_FOODS: { n: number; foods: [string, string]; foodsId: [string, string] }[] = [
  { n: 1, foods: ['banana', 'apple'], foodsId: ['pisang', 'apel'] },
  { n: 2, foods: ['banana', 'pineapple'], foodsId: ['pisang', 'nanas'] },
  { n: 3, foods: ['blueberry', 'grapes'], foodsId: ['blueberry', 'anggur'] },
  { n: 4, foods: ['blueberry', 'banana'], foodsId: ['blueberry', 'pisang'] },
  { n: 5, foods: ['apple', 'cherries'], foodsId: ['apel', 'ceri'] },
  { n: 6, foods: ['apple', 'banana'], foodsId: ['apel', 'pisang'] },
  { n: 7, foods: ['banana', 'banana'], foodsId: ['pisang', 'pisang'] },
  { n: 8, foods: ['banana', 'watermelon'], foodsId: ['pisang', 'semangka'] },
]

export interface RouteTreeStep {
  phase: RouteTreePhase
  /** Route number (1..8) being traced this beat, or null on show/result. */
  route: number | null
  /** Does the traced route reach a banana? (null on show/result) */
  hasBanana: boolean | null
  /** Does the traced route hit an apple? (null on show/result) */
  hasApple: boolean | null
  /** True when this route qualifies (banana, no apple). */
  good: boolean
  /** Running count of qualifying routes so far. */
  running: number
  /** Ring the four qualifying endpoints (only on the result beat). */
  markGood: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (winner/result = 0). */
  hold: number
  result: boolean
}

export interface RouteTreeStoryboard {
  answer: number
  qualifying: number[]
  steps: RouteTreeStep[]
  finalIndex: number
}

export function buildRouteTreeSteps(lang: Lang): RouteTreeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RouteTreeStep[] = [
    {
      phase: 'show',
      route: null,
      hasBanana: null,
      hasApple: null,
      good: false,
      running: 0,
      markGood: false,
      hold: 2000,
      result: false,
      caption: t(
        'Monkey wants a banana but must skip every apple. Check each of the 8 routes.',
        'Monyet ingin pisang tapi harus melewati apel. Periksa 8 rute satu per satu.',
      ),
    },
  ]

  let running = 0
  for (const r of ROUTE_FOODS) {
    const hasBanana = r.foods.includes('banana')
    const hasApple = r.foods.includes('apple')
    const good = hasBanana && !hasApple
    if (good) running += 1

    const foods = lang === 'id' ? r.foodsId : r.foods
    const pair = `${foods[0]} + ${foods[1]}`

    let caption: string
    if (good) {
      caption = t(
        `Route ${r.n}: ${pair} — has a banana, no apple. ✓ (good: ${running})`,
        `Rute ${r.n}: ${pair} — ada pisang, tanpa apel. ✓ (bagus: ${running})`,
      )
    } else if (hasApple) {
      caption = t(
        `Route ${r.n}: ${pair} — an apple! ✗`,
        `Rute ${r.n}: ${pair} — ada apel! ✗`,
      )
    } else {
      caption = t(
        `Route ${r.n}: ${pair} — no banana. ✗`,
        `Rute ${r.n}: ${pair} — tidak ada pisang. ✗`,
      )
    }

    steps.push({
      phase: 'trace',
      route: r.n,
      hasBanana,
      hasApple,
      good,
      running,
      markGood: false,
      // Good routes and rejected routes both linger so the verdict reads.
      hold: 2000,
      result: false,
      caption,
    })
  }

  const answer = QUALIFYING_ROUTES.length // = 4 (computed, not hard-coded)
  const list = QUALIFYING_ROUTES.join(', ')
  steps.push({
    phase: 'result',
    route: null,
    hasBanana: null,
    hasApple: null,
    good: true,
    running: answer,
    markGood: true,
    hold: 0,
    result: true,
    caption: t(
      `Routes ${list} reach a banana with no apple — ${answer} routes.`,
      `Rute ${list} sampai ke pisang tanpa apel — ${answer} rute.`,
    ),
  })

  return {
    answer,
    qualifying: QUALIFYING_ROUTES,
    steps,
    finalIndex: steps.length - 1,
  }
}
