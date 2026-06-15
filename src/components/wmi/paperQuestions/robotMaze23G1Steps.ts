// Storyboard for WMI-23F1A-Q25 (2023 Grade 1 Final).
//
// Question: a robot enters a 6x5 square maze on the LEFT (middle row) facing
// EAST. It may ONLY go straight or turn RIGHT before stepping — never left, never
// reverse. A square may be passed more than once, and EVERY square it enters
// counts (repeats too). "Least number of squares passed through?"  Answer: 20.
//
// Method taught (deduce, don't assert): we DON'T just announce 20. We walk the
// verified shortest legal route ONE square at a time, with a running counter of
// squares passed. Each step beat:
//   - reads the move: STRAIGHT (kept going the same way) or RIGHT turn,
//   - ticks the squares-passed counter by 1,
//   - flags when the robot re-enters a square it already visited — the count
//     STILL ticks (the whole trick of the problem), so kids see why repeats add up.
// The robot leaves East out of the exit on the 20th square, landing on 20.
//
// OPTIMAL_ROUTE (20 cells incl. the two revisits at (2,1) and (2,5)) is imported
// from the illustration so the storyboard can never drift from the drawn path.
//
// Pure (lang) => storyboard. Deterministic: walks the fixed route in order, no
// Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { OPTIMAL_ROUTE, type Cell } from './RobotMaze23G1Illustration'

export type RobotMazePhase = 'intro' | 'step' | 'result'

/** How the robot got into the current square, relative to the previous heading. */
export type RobotMove = 'enter' | 'straight' | 'right'

export interface RobotMazeStep {
  phase: RobotMazePhase
  /** How many cells of the route to reveal (1..route.length) — feeds RobotMaze23G1 `step`. */
  step: number
  /** The cell entered THIS beat (the head). */
  current: Cell
  /** Move type that brought the robot here (enter on the first cell). */
  move: RobotMove
  /** True when this square was already visited earlier in the route. */
  revisit: boolean
  /** Squares passed so far (= step). Counts repeats. Builds to 20. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface RobotMazeStoryboard {
  /** The final answer = least squares passed (20). */
  answer: number
  steps: RobotMazeStep[]
  finalIndex: number
}

/** Compass heading from cell `a` to cell `b` (adjacent in the grid). */
type Heading = 'E' | 'W' | 'N' | 'S'
function headingOf(a: Cell, b: Cell): Heading {
  if (b.c > a.c) return 'E'
  if (b.c < a.c) return 'W'
  if (b.r > a.r) return 'S'
  return 'N'
}

export function buildRobotMaze23G1Steps(lang: Lang): RobotMazeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const route = OPTIMAL_ROUTE
  const answer = route.length // 20

  const steps: RobotMazeStep[] = []

  // 1) Goal beat — state the rule + the strategy, only the parked robot, no count.
  steps.push({
    phase: 'intro',
    step: 1,
    current: route[0],
    move: 'enter',
    revisit: false,
    count: 0,
    hold: 2200,
    result: false,
    caption: t(
      'Rule: only go straight or turn RIGHT. Count EVERY square — repeats too. Find the shortest way out.',
      'Aturan: hanya boleh lurus atau belok KANAN. Hitung SETIAP kotak — yang berulang juga. Cari jalan keluar terpendek.',
    ),
  })

  // 2) Step beats — advance one square at a time, naming the move + repeats.
  const seen = new Set<string>()
  let heading: Heading = 'E' // robot starts facing East
  for (let i = 0; i < route.length; i++) {
    const cell = route[i]
    const key = `${cell.r},${cell.c}`
    const revisit = seen.has(key)
    seen.add(key)
    const count = i + 1

    let move: RobotMove
    if (i === 0) {
      move = 'enter'
    } else {
      const newHeading = headingOf(route[i - 1], cell)
      move = newHeading === heading ? 'straight' : 'right'
      heading = newHeading
    }

    const isLast = i === route.length - 1

    let caption: string
    if (i === 0) {
      caption = t(
        `Square 1: enter facing right. Squares passed: ${count}.`,
        `Kotak 1: masuk menghadap kanan. Kotak dilewati: ${count}.`,
      )
    } else if (isLast) {
      // The 20th square is also a revisit of the exit cell — say so, then exit.
      caption = t(
        `Square ${count}: turn right onto the exit square again, then step OUT. ${count} squares!`,
        `Kotak ${count}: belok kanan ke kotak keluar lagi, lalu keluar. ${count} kotak!`,
      )
    } else if (revisit) {
      caption = t(
        `Square ${count}: ${move === 'right' ? 'turn right' : 'go straight'} back into a square already used — it STILL counts. Now ${count}.`,
        `Kotak ${count}: ${move === 'right' ? 'belok kanan' : 'lurus'} kembali ke kotak yang sudah dipakai — tetap DIHITUNG. Sekarang ${count}.`,
      )
    } else if (move === 'right') {
      caption = t(
        `Square ${count}: turn right. Squares passed: ${count}.`,
        `Kotak ${count}: belok kanan. Kotak dilewati: ${count}.`,
      )
    } else {
      caption = t(
        `Square ${count}: go straight. Squares passed: ${count}.`,
        `Kotak ${count}: lurus. Kotak dilewati: ${count}.`,
      )
    }

    steps.push({
      phase: isLast ? 'result' : 'step',
      step: count,
      current: cell,
      move,
      revisit,
      count,
      // Revisits linger a touch longer so "it still counts" reads; the final
      // square holds (0) as the answer reveal.
      hold: isLast ? 0 : revisit ? 2100 : 1300,
      result: isLast,
      caption,
    })
  }

  return {
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
