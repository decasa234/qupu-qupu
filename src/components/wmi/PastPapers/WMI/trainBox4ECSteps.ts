// IKMC-22-EC-Q4 — storyboard for "minimum boxes Bill must move to open TRAIN".
//
// The shelf scene has 11 boxes in three rows:
//   Top row:    books | music sheets | board games
//   Middle row: stuffed animals | bedding | puzzles
//   Bottom row: cloths | TRAIN (dark) | CDs | BOOKS
//
// The TRAIN box is at the bottom-center. To open it, any box in the column(s)
// above it must be removed first. The blocking chain is:
//
//   Top row boxes must come off before middle-row boxes can move:
//     - "books" is on top of "stuffed animals"
//     - "music sheets" is on top of "bedding"
//     - "board games" is on top of "bedding" / right side
//
//   Middle row boxes blocking TRAIN:
//     - "stuffed animals" (left, overlaps TRAIN column)
//     - "bedding" (center, directly above TRAIN)
//
// Minimum sequence (5 moves):
//   Move 1: books        (clears path to stuffed animals)
//   Move 2: music sheets (clears path to bedding)
//   Move 3: board games  (clears path to bedding)
//   Move 4: stuffed animals (now free)
//   Move 5: bedding          (now free → TRAIN is accessible)
//   → answer C: 5
//
// Teaching walk, one idea per beat:
//   Beat 0 (setup)   — show the scene; ask which boxes block TRAIN.
//   Beat 1 (locate)  — highlight TRAIN; note it is buried under layers.
//   Beat 2 (top-row) — must clear top row first: remove books, music sheets,
//                       board games (3 moves so far).
//   Beat 3 (books)   — move books (count = 1).
//   Beat 4 (music)   — move music sheets (count = 2).
//   Beat 5 (board)   — move board games (count = 3).
//   Beat 6 (stuffed) — now move stuffed animals (count = 4).
//   Beat 7 (bedding) — now move bedding (count = 5).
//   Beat 8 (result)  — TRAIN is free! Minimum = 5 → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { BoxId } from './TrainBox4ECIllustration'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TrainPhase =
  | 'setup'
  | 'locate'
  | 'plan'
  | 'move-books'
  | 'move-music'
  | 'move-board'
  | 'move-stuffed'
  | 'move-bedding'
  | 'result'

export interface TrainStep {
  phase: TrainPhase
  /** Set of box IDs that have been moved (dimmed) by this beat. */
  movedBoxes: Set<BoxId>
  /** Running count of boxes moved so far (shown as big tally). */
  count: number
  /** Caption text for the explanation box. */
  caption: string
  /** ms to hold before auto-advancing (0 = final beat, manual only). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TrainStoryboard {
  steps: TrainStep[]
  finalIndex: number
  answer: number
}

const ANSWER = 5

export function buildTrainBox4ECSteps(lang: Lang): TrainStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrainStep[] = [
    {
      // Beat 0 — setup: show the scene; ask the question.
      phase: 'setup',
      movedBoxes: new Set(),
      count: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Bill wants to open the dark TRAIN box. Which boxes are blocking it?',
        'Bill ingin membuka kotak TRAIN yang gelap. Kotak mana yang menghalanginya?',
      ),
    },
    {
      // Beat 1 — locate: TRAIN is at the bottom; layers above must come off first.
      phase: 'locate',
      movedBoxes: new Set(),
      count: 0,
      hold: 2200,
      result: false,
      caption: t(
        'TRAIN is at the bottom. The boxes above it must be moved before we can reach it.',
        'TRAIN ada di bawah. Kotak-kotak di atasnya harus dipindahkan terlebih dahulu.',
      ),
    },
    {
      // Beat 2 — plan: top row must go first (3 moves).
      phase: 'plan',
      movedBoxes: new Set(),
      count: 0,
      hold: 2200,
      result: false,
      caption: t(
        'Top row first: books, music sheets, and board games rest on the middle row. Move them first.',
        'Baris atas dulu: books, music sheets, dan board games ada di atas baris tengah. Pindahkan dulu.',
      ),
    },
    {
      // Beat 3 — move books (1st move).
      phase: 'move-books',
      movedBoxes: new Set<BoxId>(['books-top']),
      count: 1,
      hold: 1600,
      result: false,
      caption: t(
        'Move 1: books. (1 box moved)',
        'Langkah 1: books. (1 kotak dipindahkan)',
      ),
    },
    {
      // Beat 4 — move music sheets (2nd move).
      phase: 'move-music',
      movedBoxes: new Set<BoxId>(['books-top', 'music']),
      count: 2,
      hold: 1600,
      result: false,
      caption: t(
        'Move 2: music sheets. (2 boxes moved)',
        'Langkah 2: music sheets. (2 kotak dipindahkan)',
      ),
    },
    {
      // Beat 5 — move board games (3rd move).
      phase: 'move-board',
      movedBoxes: new Set<BoxId>(['books-top', 'music', 'board']),
      count: 3,
      hold: 1600,
      result: false,
      caption: t(
        'Move 3: board games. Top row cleared! (3 boxes moved)',
        'Langkah 3: board games. Baris atas bersih! (3 kotak dipindahkan)',
      ),
    },
    {
      // Beat 6 — move stuffed animals (4th move).
      phase: 'move-stuffed',
      movedBoxes: new Set<BoxId>(['books-top', 'music', 'board', 'stuffed']),
      count: 4,
      hold: 1600,
      result: false,
      caption: t(
        'Move 4: stuffed animals. One more to go! (4 boxes moved)',
        'Langkah 4: stuffed animals. Satu lagi! (4 kotak dipindahkan)',
      ),
    },
    {
      // Beat 7 — move bedding (5th move) → TRAIN now accessible.
      phase: 'move-bedding',
      movedBoxes: new Set<BoxId>(['books-top', 'music', 'board', 'stuffed', 'bedding']),
      count: 5,
      hold: 1800,
      result: false,
      caption: t(
        'Move 5: bedding. The TRAIN box is now free!',
        'Langkah 5: bedding. Kotak TRAIN kini bebas!',
      ),
    },
    {
      // Beat 8 — result: minimum = 5 → answer C.
      phase: 'result',
      movedBoxes: new Set<BoxId>(['books-top', 'music', 'board', 'stuffed', 'bedding']),
      count: 5,
      hold: 0,
      result: true,
      caption: t(
        'The minimum number of boxes Bill must move is 5. Answer: C',
        'Jumlah minimum kotak yang harus dipindahkan Bill adalah 5. Jawaban: C',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: ANSWER }
}
