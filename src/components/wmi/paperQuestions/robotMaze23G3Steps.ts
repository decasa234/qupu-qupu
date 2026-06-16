// Storyboard for WMI-23F3A-Q25 (2023 Grade 3 Final).
//
// Question: a robot enters a 7x5 square maze on the LEFT (row 1, cell (1,0))
// facing EAST. Its left-turn and reverse are BROKEN, so at every move it may
// ONLY go straight or turn RIGHT (90deg clockwise) before stepping one cell —
// never left, never reverse. A square may be passed more than once, and EVERY
// square it enters counts (repeats too). "Least number of squares passed
// through to get out?"  Answer: 31.
//
// Method taught (deduce, don't assert): we DON'T just announce 31. We walk the
// verified shortest legal route ONE square at a time, with a running counter of
// squares passed. Each step beat:
//   - reads the move: STRAIGHT (kept the same heading) or RIGHT turn — there is
//     never a left or a reverse, because those are broken,
//   - ticks the squares-passed counter by 1,
//   - flags when the robot re-enters a square it already used. Because it can't
//     turn left, the robot is forced to back-track across 5 squares it already
//     crossed; the count STILL ticks on each, which is exactly why the minimum
//     is as big as 31. Kids see the right-only rule MAKE the route long.
// The robot leaves East out of the exit on the 31st square, landing on 31.
//
// SOLUTION_PATH (31 cells incl. the 5 forced revisits at (2,2),(2,3),(3,3),
// (3,4),(3,6)) is imported from the illustration so the storyboard can never
// drift from the drawn/solved route — length, prefixes and the final count all
// come from it.
//
// Pure (lang) => storyboard. Deterministic: walks the fixed route in order, no
// Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { SOLUTION_PATH, ANSWER, type Cell } from './RobotMaze23G3Illustration'

export type RobotMazePhase = 'intro' | 'step' | 'result'

/** How the robot got into the current square, relative to the previous heading. */
export type RobotMove = 'enter' | 'straight' | 'right'

export interface RobotMazeStep {
  phase: RobotMazePhase
  /** How many cells of the route to reveal (1..path.length) — feeds RobotMaze23G3 `step`. */
  step: number
  /** The cell entered THIS beat (the head). */
  current: Cell
  /** Move type that brought the robot here (enter on the first cell). */
  move: RobotMove
  /** True when this square was already visited earlier in the route. */
  revisit: boolean
  /** Squares passed so far (= step). Counts repeats. Builds to 31. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface RobotMazeStoryboard {
  /** The final answer = least squares passed (31). */
  answer: number
  /** How many forced revisits the right-only rule causes (5). */
  revisitCount: number
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

export function buildRobotMaze23G3Steps(lang: Lang): RobotMazeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const route = SOLUTION_PATH
  const answer = ANSWER // 31

  // Count the forced revisits up front so the intro can promise them honestly.
  const seenAll = new Set<string>()
  let revisitCount = 0
  for (const cell of route) {
    const key = `${cell.r},${cell.c}`
    if (seenAll.has(key)) revisitCount += 1
    seenAll.add(key)
  }

  const steps: RobotMazeStep[] = []

  // 1) Goal beat — state the rule + the strategy, only the parked robot, no count.
  steps.push({
    phase: 'intro',
    step: 1,
    current: route[0],
    move: 'enter',
    revisit: false,
    count: 0,
    hold: 2600,
    result: false,
    caption: t(
      'Rule: left turns and reverse are BROKEN. The robot may only go straight or turn RIGHT. Every square counts — repeats too. Walk the shortest way out.',
      'Aturan: belok kiri dan mundur RUSAK. Robot hanya boleh lurus atau belok KANAN. Setiap kotak dihitung — yang berulang juga. Telusuri jalan keluar terpendek.',
    ),
  })

  // 2) Step beats — advance one square at a time, naming the move + revisits.
  const seen = new Set<string>()
  let revisitsSoFar = 0
  let heading: Heading = 'E' // robot starts facing East
  for (let i = 0; i < route.length; i++) {
    const cell = route[i]
    const key = `${cell.r},${cell.c}`
    const revisit = seen.has(key)
    seen.add(key)
    if (revisit) revisitsSoFar += 1
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
      // The 31st square steps out the exit gap — the answer reveal.
      caption = t(
        `Square ${count}: ${move === 'right' ? 'turn right' : 'go straight'} onto the exit square, then step OUT. ${count} squares — that's the fewest!`,
        `Kotak ${count}: ${move === 'right' ? 'belok kanan' : 'lurus'} ke kotak keluar, lalu keluar. ${count} kotak — itu paling sedikit!`,
      )
    } else if (revisit) {
      caption = t(
        `Square ${count}: can't turn left, so it's forced back across a square it already used (revisit ${revisitsSoFar} of ${revisitCount}). It STILL counts → ${count}.`,
        `Kotak ${count}: tak bisa belok kiri, jadi terpaksa melewati lagi kotak yang sudah dipakai (ulang ke-${revisitsSoFar} dari ${revisitCount}). Tetap DIHITUNG → ${count}.`,
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
      // Revisits linger longer so "it STILL counts" reads as the reason the
      // route is forced to be long; the final square holds (0) as the reveal.
      hold: isLast ? 0 : revisit ? 2200 : 1100,
      result: isLast,
      caption,
    })
  }

  return {
    answer,
    revisitCount,
    steps,
    finalIndex: steps.length - 1,
  }
}
