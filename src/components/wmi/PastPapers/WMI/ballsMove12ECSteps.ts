// Storyboard for IKMC-21-EC-Q12 — 5-ball collision simulation.
//
// Balls (left→right): →10, →9, ←3, ←7, ←20
// Answer: one ball moving LEFT with value 49 (choice C).
//
// Collision sequence (derived from breakdown.quantities in seed):
//   1. 9(→) meets 3(←) → 9>3 → result 12(→)  — new right ball
//   2. 12(→) meets 7(←) → 12>7 → result 19(→) — keeps going right
//   3. 19(→) meets 20(←) → 20>19 → result 39(←) — direction FLIPS to left
//   4. 39(←) meets 10(→) → 39>10 → result 49(←) — final survivor
//
// Each beat shows the current ball state on the track (as a BallRow) and a
// caption describing what happened. A trap beat warns about value 50 (wrong D).
//
// Pure function of `lang` — SSR-safe, deterministic.

import type { BallNodeData } from './BallsMove12ECIllustration'

export type Lang = 'en' | 'id'

export interface BallsMove12ECStep {
  /** Balls on the track at this moment. */
  balls: BallNodeData[]
  /** Optional: indices to dim (the "consumed" ball). */
  dimSet?: Set<number>
  /** Optional: indices to highlight (the surviving/growing ball). */
  highlightSet?: Set<number>
  /** Caption text. */
  caption: string
  /** Hold duration in ms before auto-advancing. */
  hold: number
  /** True only on the final winning beat. */
  result: boolean
  /** Short equation badge (e.g. "9 + 3 = 12"), or null on intro/result. */
  equation: string | null
}

export interface BallsMove12ECStory {
  steps: BallsMove12ECStep[]
  finalIndex: number
  answer: string
}

// The starting layout for reference.
const START: BallNodeData[] = [
  { value: 10, dir: 'right' },
  { value: 9,  dir: 'right' },
  { value: 3,  dir: 'left'  },
  { value: 7,  dir: 'left'  },
  { value: 20, dir: 'left'  },
]

export function buildBallsMove12ECSteps(lang: Lang): BallsMove12ECStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BallsMove12ECStep[] = []

  // Beat 0 — intro: show the five starting balls, no collision yet.
  steps.push({
    balls: [...START],
    caption: t(
      'Five balls move simultaneously. Two go right (10, 9); three go left (3, 7, 20). Simulate each collision!',
      'Lima bola bergerak bersamaan. Dua ke kanan (10, 9); tiga ke kiri (3, 7, 20). Simulasikan setiap tabrakan!',
    ),
    hold: 2600,
    result: false,
    equation: null,
  })

  // Beat 1 — Collision 1: 9(→) meets 3(←). 9 > 3 → result 12(→).
  // After collision: track has 10→, 12→, 7←, 20←  (3 is swallowed, 9 grows to 12)
  steps.push({
    balls: [
      { value: 10, dir: 'right' },
      { value: 9,  dir: 'right' }, // about to grow
      { value: 3,  dir: 'left'  }, // about to be eaten
      { value: 7,  dir: 'left'  },
      { value: 20, dir: 'left'  },
    ],
    dimSet: new Set([2]),       // ball 3 is dim (consumed)
    highlightSet: new Set([1]), // ball 9 is highlighted (winner)
    equation: `9 + 3 = 12`,
    caption: t(
      'Collision 1: 9(→) meets 3(←). 9 > 3 → 9 swallows 3 and grows to 12, continuing right.',
      'Tabrakan 1: 9(→) bertemu 3(←). 9 > 3 → 9 menelan 3 dan bertumbuh jadi 12, terus ke kanan.',
    ),
    hold: 2400,
    result: false,
  })

  // State after collision 1
  const after1: BallNodeData[] = [
    { value: 10, dir: 'right' },
    { value: 12, dir: 'right' },
    { value: 7,  dir: 'left'  },
    { value: 20, dir: 'left'  },
  ]

  // Beat 2 — result of collision 1
  steps.push({
    balls: [...after1],
    equation: null,
    caption: t(
      'Now: 10(→), 12(→), 7(←), 20(←). Ball 12 still moves right — next it meets 7(←).',
      'Sekarang: 10(→), 12(→), 7(←), 20(←). Bola 12 masih ke kanan — berikutnya bertemu 7(←).',
    ),
    hold: 2000,
    result: false,
  })

  // Beat 3 — Collision 2: 12(→) meets 7(←). 12 > 7 → result 19(→).
  steps.push({
    balls: after1,
    dimSet: new Set([2]),       // ball 7 consumed
    highlightSet: new Set([1]), // ball 12 wins
    equation: `12 + 7 = 19`,
    caption: t(
      'Collision 2: 12(→) meets 7(←). 12 > 7 → 12 swallows 7, grows to 19, continues right.',
      'Tabrakan 2: 12(→) bertemu 7(←). 12 > 7 → 12 menelan 7, jadi 19, terus ke kanan.',
    ),
    hold: 2400,
    result: false,
  })

  // State after collision 2
  const after2: BallNodeData[] = [
    { value: 10, dir: 'right' },
    { value: 19, dir: 'right' },
    { value: 20, dir: 'left'  },
  ]

  // Beat 4 — result of collision 2
  steps.push({
    balls: [...after2],
    equation: null,
    caption: t(
      'Now: 10(→), 19(→), 20(←). Ball 19 still moves right — next it meets 20(←).',
      'Sekarang: 10(→), 19(→), 20(←). Bola 19 masih ke kanan — berikutnya bertemu 20(←).',
    ),
    hold: 2000,
    result: false,
  })

  // Beat 5 — Collision 3: 19(→) meets 20(←). 20 > 19 → result 39(←). DIRECTION FLIPS!
  steps.push({
    balls: after2,
    dimSet: new Set([1]),       // ball 19 consumed
    highlightSet: new Set([2]), // ball 20 wins
    equation: `20 + 19 = 39`,
    caption: t(
      'Collision 3: 19(→) meets 20(←). 20 > 19 → 20 wins! 20 swallows 19, grows to 39, continues LEFT.',
      'Tabrakan 3: 19(→) bertemu 20(←). 20 > 19 → 20 menang! 20 menelan 19, jadi 39, terus ke KIRI.',
    ),
    hold: 2800,
    result: false,
  })

  // State after collision 3
  const after3: BallNodeData[] = [
    { value: 10, dir: 'right' },
    { value: 39, dir: 'left'  }, // <-- direction reversed!
  ]

  // Beat 6 — result of collision 3 (direction surprise)
  steps.push({
    balls: [...after3],
    equation: null,
    caption: t(
      'Now: 10(→) and 39(←). The big ball 39 is now heading LEFT and will meet 10(→)!',
      'Sekarang: 10(→) dan 39(←). Bola besar 39 kini menuju ke KIRI dan akan bertemu 10(→)!',
    ),
    hold: 2200,
    result: false,
  })

  // Beat 7 — Collision 4: 39(←) meets 10(→). 39 > 10 → result 49(←).
  steps.push({
    balls: after3,
    dimSet: new Set([0]),       // ball 10 consumed
    highlightSet: new Set([1]), // ball 39 wins
    equation: `39 + 10 = 49`,
    caption: t(
      'Collision 4: 39(←) meets 10(→). 39 > 10 → 39 swallows 10, grows to 49, continues LEFT.',
      'Tabrakan 4: 39(←) bertemu 10(→). 39 > 10 → 39 menelan 10, jadi 49, terus ke KIRI.',
    ),
    hold: 2600,
    result: false,
  })

  // Beat 8 — final result: one ball, value 49, moving left. Answer C.
  steps.push({
    balls: [{ value: 49, dir: 'left' }],
    equation: null,
    caption: t(
      'Final result: one ball moving LEFT with value 49. Answer C. (Trap D says 50, but 20 > 19 so the leftward ball wins.)',
      'Hasil akhir: satu bola bergerak ke KIRI bernilai 49. Jawaban C. (Jebakan D bilang 50, tapi 20 > 19 sehingga bola ke kiri yang menang.)',
    ),
    hold: 0,
    result: true,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: 'C',
  }
}
