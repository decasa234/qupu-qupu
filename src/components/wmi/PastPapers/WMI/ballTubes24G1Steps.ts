import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F1A-Q20 (2024 Grade 1 Final) — answer = 3 (fill-in).
//
// A black ball's number shifts by a fixed amount per tube colour:
//   Yellow +2, Blue −2, Red −1.
// Along the equation path START 5 → ? → ? → 6 → Blue → ? → ? → Red → ? → END 5,
// how many YELLOW tubes does the ball pass through?
//
// The individual unknown colours are AMBIGUOUS, but the *count* of yellow tubes
// is forced. The storyboard deduces it one idea per beat:
//   Segment A  (5 → 6 through the two "?"): the two deltas must sum to +1, and
//     the only pair from {+2,−2,−1} summing to +1 is {Yellow +2, Red −1}
//     → exactly 1 yellow.
//   Segment B  (6 → 5 through Blue(−2), two "?", Red(−1), one "?"): the three
//     unknown deltas must sum to +2, and the only multiset from {+2,−2,−1}
//     summing to +2 is {Yellow +2, Yellow +2, Blue −2} → exactly 2 yellow.
//   Total yellow = 1 + 2 = 3.
//
// litStep indexes the illustration's PATH nodes 0..9 (0 = START box 5, 9 = END
// box 5). We step the ball along the path while the running number is tracked.

export interface BallTubesStep {
  /** Path node to glow (0..9), or null to leave the board pristine. */
  litStep: number | null
  /** Running number under the ball at this beat, or null before it starts. */
  running: number | null
  /** Which deduction segment this beat belongs to (for accent colour). */
  segment: 'intro' | 'A' | 'B' | 'sum'
  /** Tally of yellow tubes proven so far (drives the count chip). */
  yellowSoFar: number
  caption: string
  hold: number
  /** True only on the final winning beat. */
  result: boolean
}

export interface BallTubesStoryboard {
  /** The forced answer: total yellow tubes. */
  answer: number
  steps: BallTubesStep[]
  finalIndex: number
}

export function buildBallTubes24G1Steps(lang: Lang): BallTubesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BallTubesStep[] = [
    // --- intro: state the rule + the goal -----------------------------------
    {
      litStep: 0,
      running: 5,
      segment: 'intro',
      yellowSoFar: 0,
      hold: 2100,
      result: false,
      caption: t(
        'Each tube shifts the ball: Yellow +2, Blue −2, Red −1. Start at 5.',
        'Tiap tabung mengubah bola: Kuning +2, Biru −2, Merah −1. Mulai dari 5.',
      ),
    },
    // --- Segment A: 5 → 6 across the two "?" tubes --------------------------
    {
      litStep: 3,
      running: 6,
      segment: 'A',
      yellowSoFar: 0,
      hold: 2100,
      result: false,
      caption: t(
        'First the ball goes 5 → 6. The two ? tubes must add +1.',
        'Pertama bola pergi 5 → 6. Dua tabung ? harus menambah +1.',
      ),
    },
    {
      litStep: 1,
      running: 6,
      segment: 'A',
      yellowSoFar: 1,
      hold: 2100,
      result: false,
      caption: t(
        'Only +2 and −1 make +1 → Yellow + Red. That is 1 yellow.',
        'Hanya +2 dan −1 jadi +1 → Kuning + Merah. Itu 1 kuning.',
      ),
    },
    // --- Segment B: 6 → 5 across Blue, two "?", Red, one "?" ----------------
    {
      litStep: 9,
      running: 5,
      segment: 'B',
      yellowSoFar: 1,
      hold: 2100,
      result: false,
      caption: t(
        'Next 6 → 5. Blue is −2 and Red is −1, so the three ? must add +2.',
        'Lalu 6 → 5. Biru −2 dan Merah −1, jadi tiga ? harus menambah +2.',
      ),
    },
    {
      litStep: 4,
      running: 5,
      segment: 'B',
      yellowSoFar: 3,
      hold: 2100,
      result: false,
      caption: t(
        'Only +2 +2 −2 make +2 → Yellow + Yellow + Blue. That is 2 more yellow.',
        'Hanya +2 +2 −2 jadi +2 → Kuning + Kuning + Biru. Itu 2 kuning lagi.',
      ),
    },
    // --- sum: 1 + 2 = 3 ------------------------------------------------------
    {
      litStep: 9,
      running: 5,
      segment: 'sum',
      yellowSoFar: 3,
      hold: 0,
      result: true,
      caption: t(
        '1 yellow + 2 yellow = 3 yellow tubes in all.',
        '1 kuning + 2 kuning = 3 tabung kuning semuanya.',
      ),
    },
  ]

  return { answer: 3, steps, finalIndex: steps.length - 1 }
}
