// IKMC-22-PE-Q23 — storyboard for the "Kangy's car can only turn left" explainer.
//
// Question: "Kangy's car can only turn left. It can never turn right.
//            Which of the following five routes can Kangy take?"
// Answer: A
//
// Key insight (what to TEACH — deduce, don't assert):
//   "Left turn" means a counterclockwise 90° change of heading. In screen
//   coordinates (Y increases downward) the only valid direction transitions
//   for an all-left-turns route are:
//     going RIGHT → can only turn UP
//     going UP    → can only turn LEFT
//     going LEFT  → can only turn DOWN
//     going DOWN  → can only turn RIGHT
//   A route is valid if and only if EVERY corner is one of these CCW transitions.
//
// Strategy:
//   Examine each route in order (A → B → C → D → E). For each route, decide
//   "valid" or "eliminated". Land on Route A as the only valid one.
//
// Beats (one idea per beat):
//   0. intro   — explain what "only left turns" means (CCW constraint)
//   1. checkA  — Route A: every corner is CCW → VALID (answer!)
//   2. checkB  — Route B: E-shape has a RIGHT turn at middle shelf → ELIMINATED
//   3. checkC  — Route C: hairpin has a RIGHT turn at the bottom → ELIMINATED
//   4. checkD  — Route D: clockwise spiral → every turn is a RIGHT turn → ELIMINATED
//   5. checkE  — Route E: L+shelf has a RIGHT turn going into the shelf → ELIMINATED
//   6. result  — Route A is the only route with all left turns. Answer: A.
//
// Pure builder: (correctAnswer, lang) => storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type RouteLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export type RouteMap23Phase =
  | 'intro'
  | 'checkA'
  | 'checkB'
  | 'checkC'
  | 'checkD'
  | 'checkE'
  | 'result'

export interface RouteMap23Beat {
  phase: RouteMap23Phase
  /** Which route is being highlighted on this beat (null on intro). */
  activeRoute: RouteLabel | null
  /** Whether the active route is valid (has all left turns). */
  isValid: boolean | null
  /** True only on the result beat. */
  result: boolean
  /** Caption text for this beat. */
  caption: string
  /** Auto-advance hold duration in ms (0 = final/manual-stop beat). */
  hold: number
}

export interface RouteMap23Storyboard {
  /** The correct answer letter (always 'A' for this question). */
  answer: RouteLabel
  steps: RouteMap23Beat[]
  finalIndex: number
}

const CHECK_ORDER: RouteLabel[] = ['A', 'B', 'C', 'D', 'E']

export function buildRouteMap23PESteps(
  correctAnswer: string,
  lang: Lang,
): RouteMap23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer: RouteLabel =
    CHECK_ORDER.includes(correctAnswer as RouteLabel)
      ? (correctAnswer as RouteLabel)
      : 'A'

  const steps: RouteMap23Beat[] = []

  // Beat 0 — intro: explain the left-turn-only rule
  steps.push({
    phase: 'intro',
    activeRoute: null,
    isValid: null,
    result: false,
    hold: 2400,
    caption: t(
      'A "left turn" always rotates the heading counterclockwise. We check each route: does every corner make a left turn? If even one corner turns right, the route is invalid.',
      'Belok kiri berarti memutar arah berlawanan jarum jam. Kita periksa tiap rute: apakah setiap tikungan adalah belok kiri? Jika ada satu saja yang belok kanan, rute itu gugur.',
    ),
  })

  // Beats 1–5 — check each route A→E
  const ROUTE_RESULT: Record<RouteLabel, boolean> = {
    A: true,  // all CCW
    B: false, // has CW turn at the E-shelf
    C: false, // has CW turn at the hairpin base
    D: false, // full CW spiral
    E: false, // has CW turn entering the shelf
  }

  const ROUTE_REASON_EN: Record<RouteLabel, string> = {
    A: 'Route A: every corner turns left (counterclockwise). This route is VALID!',
    B: 'Route B: the horizontal shelf requires turning right at one corner. ELIMINATED.',
    C: 'Route C: the inner vertical strip ends with a right turn at the base. ELIMINATED.',
    D: 'Route D: the whole spiral winds clockwise — every turn is a right turn. ELIMINATED.',
    E: 'Route E: going into the shelf requires a right turn. ELIMINATED.',
  }

  const ROUTE_REASON_ID: Record<RouteLabel, string> = {
    A: 'Rute A: setiap tikungan belok kiri (berlawanan jarum jam). Rute ini VALID!',
    B: 'Rute B: rak horizontal membutuhkan belok kanan di salah satu tikungan. GUGUR.',
    C: 'Rute C: strip vertikal dalam berakhir dengan belok kanan di dasarnya. GUGUR.',
    D: 'Rute D: seluruh spiral berputar searah jarum jam — setiap tikungan ke kanan. GUGUR.',
    E: 'Rute E: masuk ke rak membutuhkan belok kanan. GUGUR.',
  }

  for (const route of CHECK_ORDER) {
    const valid = ROUTE_RESULT[route]
    steps.push({
      phase: `check${route}` as RouteMap23Phase,
      activeRoute: route,
      isValid: valid,
      result: false,
      // Valid routes linger slightly longer so the answer lands; eliminated ones
      // move quickly.
      hold: valid ? 2200 : 1800,
      caption: t(ROUTE_REASON_EN[route], ROUTE_REASON_ID[route]),
    })
  }

  // Beat 6 — result
  steps.push({
    phase: 'result',
    activeRoute: answer,
    isValid: true,
    result: true,
    hold: 0,
    caption: t(
      `Route ${answer} is the only route where every turn is a left turn. Answer: ${answer}.`,
      `Rute ${answer} adalah satu-satunya rute di mana setiap tikungan adalah belok kiri. Jawaban: ${answer}.`,
    ),
  })

  return {
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
