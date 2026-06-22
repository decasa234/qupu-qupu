// Storyboard for IKMC-23-PE-Q20 (2023 IKMC Pre-Ecolier, Question 20).
//
// Question: Sam walks through a two-storey maze from entrance (Floor 1 top-left)
// to exit (Floor 1 bottom-right). In what order does she find the wall stickers?
//   frog (Floor 1, r0c2) · boar (Floor 2, r0c0) · shark (Floor 2, r0c1)
//
// Correct path & order:
//   1. Enter Floor 1 at top-left.
//   2. Walk along Floor 1 to stairs at (r1c0).
//   3. Go up to Floor 2 → first encounter: SHARK (r0c1).
//   4. Walk back to BOAR (r0c0) on Floor 2.
//   5. Descend stairs back to Floor 1.
//   6. Find FROG (r0c2) on Floor 1.
//   7. Exit at Floor 1 bottom-right.
//   Order: 🦈 → 🐗 → 🐸   Answer B.
//
// litPath format: "floor:row,col" tokens joined by "-".
// Floor 1 = 1, Floor 2 = 2.
//
// Pure (correctAnswer, lang) → storyboard. Deterministic, SSR-safe.

export type Lang = 'en' | 'id'

export type Maze20PEPhase = 'intro' | 'floor2' | 'boar' | 'frog' | 'result'

export interface Maze20PEStep {
  phase: Maze20PEPhase
  caption: string
  hold: number
  /** Stickers found so far (as emoji chars, in order). */
  found: string[]
  /** Whether this is the final answer beat. */
  result: boolean
  /**
   * Optional lit path for the maze primitive. Encoded as "floor:row,col-…"
   * tokens, matching the Maze20PE litPath prop format.
   */
  litPath: string | null
}

export interface Maze20PEStoryboard {
  steps: Maze20PEStep[]
  finalIndex: number
}

// Pre-encoded path segments (floor:row,col tokens)
// Floor 1 traversal to stairs: enter r0c0 → r0c1 → stairs r1c0
const PATH_F1_TO_STAIRS = '1:0,0-1:0,1-1:1,0'
// Floor 2: stairs landing r1c0 → across to shark r0c1 (via r0c0 hub)
const PATH_F2_TO_SHARK = '2:1,0-2:0,0-2:0,1'
// Floor 2: shark to boar (backtrack)
const PATH_F2_BOAR = '2:1,0-2:0,0-2:0,1-2:0,0'
// Floor 1 descent to frog: stairs → r0c0 → r0c1 → r0c2 (frog)
const PATH_F1_FROG = '1:1,0-1:0,0-1:0,1-1:0,2'
// Full result path (complete journey)
const PATH_FULL =
  '1:0,0-1:0,1-1:1,0-2:1,0-2:0,0-2:0,1-2:0,0-2:1,0-1:1,0-1:0,0-1:0,1-1:0,2-1:1,2'

export function buildMaze20PESteps(
  _correctAnswer: string,
  lang: Lang,
): Maze20PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Maze20PEStep[] = []

  // Beat 1 — Intro: Sam enters Floor 1.
  steps.push({
    phase: 'intro',
    hold: 2200,
    found: [],
    result: false,
    litPath: PATH_F1_TO_STAIRS,
    caption: t(
      'Sam enters Floor 1. She walks through rooms toward the stairs.',
      'Sam masuk ke Lantai 1. Ia berjalan melewati kamar-kamar menuju tangga.',
    ),
  })

  // Beat 2 — Floor 2: Sam goes upstairs; first finds the shark.
  steps.push({
    phase: 'floor2',
    hold: 2000,
    found: ['🦈'],
    result: false,
    litPath: PATH_F2_TO_SHARK,
    caption: t(
      'Sam goes upstairs to Floor 2 — first she finds the 🦈 shark!',
      'Sam naik ke Lantai 2 — pertama ia menemukan 🦈 hiu!',
    ),
  })

  // Beat 3 — Boar: Sam backtracks to find the boar.
  steps.push({
    phase: 'boar',
    hold: 2000,
    found: ['🦈', '🐗'],
    result: false,
    litPath: PATH_F2_BOAR,
    caption: t(
      'Next she finds the 🐗 boar.',
      'Selanjutnya ia menemukan 🐗 babi hutan.',
    ),
  })

  // Beat 4 — Frog: Sam goes back to Floor 1 and finds the frog.
  steps.push({
    phase: 'frog',
    hold: 2000,
    found: ['🦈', '🐗', '🐸'],
    result: false,
    litPath: PATH_F1_FROG,
    caption: t(
      'She goes back to Floor 1 and finds the 🐸 frog.',
      'Ia kembali ke Lantai 1 dan menemukan 🐸 katak.',
    ),
  })

  // Beat 5 — Result: reveal the full path and the answer.
  steps.push({
    phase: 'result',
    hold: 0,
    found: ['🦈', '🐗', '🐸'],
    result: true,
    litPath: PATH_FULL,
    caption: t(
      'Order: 🦈 → 🐗 → 🐸 — Answer B.',
      'Urutan: 🦈 → 🐗 → 🐸 — Jawaban B.',
    ),
  })

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
