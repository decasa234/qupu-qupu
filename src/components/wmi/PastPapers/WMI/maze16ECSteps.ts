// Storyboard for IKMC-23-EC-Q16 (2023 IKMC Ecolier Contest, Question 16).
//
// Question: Sam walks through a two-storey maze from the entrance (ground floor,
// bottom-right) to the exit (ground floor, left). In what order does she
// find the wall stickers?
//
//   Ground floor: Boar at r0c1 (centre top)
//   First floor:  Frog at ff_r0c2 (right stair pocket)
//                 Shark at ff_r0c0 (left stair pocket)
//
// The two first-floor pockets are isolated (no horizontal door between them).
// Sam must descend to the ground floor between visits.
//
// Correct path & order:
//   1. Enter ground floor at r1c2 (IN).
//   2. Walk north to r0c2 (right stair) and ascend to first floor ff_r0c2.
//   3. Find FROG (🐸) at ff_r0c2.
//   4. Descend right stair back to ground r0c2.
//   5. Walk west through r0c1 — find BOAR (🐗).
//   6. Continue west to r0c0 (left stair) and ascend to first floor ff_r0c0.
//   7. Find SHARK (🦈) at ff_r0c0.
//   8. Descend left stair to ground r0c0 → exit OUT (←).
//   Order: 🐸 → 🐗 → 🦈   Answer A.
//
// litPath format: "floor:row,col" tokens joined by "-".
//   floor=1 → ground floor panel,  floor=2 → first floor panel.
//
// Pure (correctAnswer, lang) → storyboard. Deterministic, SSR-safe.

export type Lang = 'en' | 'id'

export type Maze16ECPhase = 'intro' | 'frog' | 'boar' | 'shark' | 'result'

export interface Maze16ECStep {
  phase: Maze16ECPhase
  caption: string
  hold: number
  /** Stickers found so far (emoji chars, in order). */
  found: string[]
  /** Whether this is the final answer beat. */
  result: boolean
  /** Optional lit-path for the maze primitive. */
  litPath: string | null
}

export interface Maze16ECStoryboard {
  steps: Maze16ECStep[]
  finalIndex: number
}

// ---- Pre-encoded path segments (floor:row,col tokens) ----

// Ground floor: Sam walks from IN (r1c2) north to right stair (r0c2)
const PATH_GF_TO_RIGHT_STAIR = '1:1,2-1:0,2'

// First floor right pocket: arrive ff_r0c2 → find Frog
const PATH_FF_FROG = '2:0,2'

// Descend right stair, walk ground floor west through Boar (r0c1)
const PATH_GF_BOAR = '1:0,2-1:0,1'

// Walk further west to left stair (r0c0), ascend to first floor left pocket
const PATH_GF_TO_LEFT_STAIR = '1:0,2-1:0,1-1:0,0'

// First floor left pocket: arrive ff_r0c0 → find Shark
const PATH_FF_SHARK = '2:0,0'

// Full journey path for result beat
const PATH_FULL =
  '1:1,2-1:0,2-2:0,2-1:0,2-1:0,1-1:0,0-2:0,0-1:0,0'

export function buildMaze16ECSteps(
  _correctAnswer: string,
  lang: Lang,
): Maze16ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Maze16ECStep[] = []

  // Beat 1 — Intro: Sam enters ground floor and heads toward the right stair.
  steps.push({
    phase: 'intro',
    hold: 2200,
    found: [],
    result: false,
    litPath: PATH_GF_TO_RIGHT_STAIR,
    caption: t(
      'Sam enters the ground floor. She walks north to the right staircase.',
      'Sam masuk ke lantai dasar. Ia berjalan ke tangga kanan.',
    ),
  })

  // Beat 2 — Frog: Sam goes up the right stair and finds the Frog.
  steps.push({
    phase: 'frog',
    hold: 2000,
    found: ['🐸'],
    result: false,
    litPath: PATH_FF_FROG,
    caption: t(
      'She climbs to the first floor — and finds the 🐸 frog!',
      'Ia naik ke lantai satu — dan menemukan 🐸 katak!',
    ),
  })

  // Beat 3 — Boar: Sam descends and walks west through the Boar room.
  steps.push({
    phase: 'boar',
    hold: 2000,
    found: ['🐸', '🐗'],
    result: false,
    litPath: PATH_GF_BOAR,
    caption: t(
      'She comes back down and walks west — next she finds the 🐗 boar!',
      'Ia turun kembali dan berjalan ke barat — lalu menemukan 🐗 babi hutan!',
    ),
  })

  // Beat 4 — Shark: Sam reaches the left stair and goes up to find the Shark.
  steps.push({
    phase: 'shark',
    hold: 2000,
    found: ['🐸', '🐗', '🦈'],
    result: false,
    litPath: PATH_FF_SHARK,
    caption: t(
      'She climbs the left staircase and finds the 🦈 shark!',
      'Ia naik tangga kiri dan menemukan 🦈 hiu!',
    ),
  })

  // Beat 5 — Result: reveal the full path and the answer.
  steps.push({
    phase: 'result',
    hold: 0,
    found: ['🐸', '🐗', '🦈'],
    result: true,
    litPath: PATH_FULL,
    caption: t(
      'Order: 🐸 → 🐗 → 🦈 — Answer A.',
      'Urutan: 🐸 → 🐗 → 🦈 — Jawaban A.',
    ),
  })

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
