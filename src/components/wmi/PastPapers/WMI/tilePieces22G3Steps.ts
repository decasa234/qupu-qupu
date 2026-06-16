// WMI-22F3A-Q20 — Tile-pieces 3×3 storyboard builder.
//
// A 3×3 grid must be tiled with exactly one 1×1 square and four 1×2 dominoes.
// The six distinct tilings are enumerated by the solver (verified exhaustively).
//
// Strategy taught:
//   1. Checkerboard-parity argument: 5 of one colour, 4 of the other;
//      each domino covers one of each, so the 1×1 must sit on the majority
//      colour — a corner (4 corner cells) or the centre (1 cell).
//   2. Centre case: show T5 and T6 → 2 ways.
//   3. Corner case: show T1–T4 → 4 ways.
//   4. Final beat: 2 + 4 = 6.
//
// Pure function — no side effects, SSR-safe, deterministic.

import type { TilingDescription } from './TilePieces22G3Illustration'

export type Lang = 'en' | 'id'

// ---------------------------------------------------------------------------
// The 6 verified distinct tilings (solver-confirmed)
// ---------------------------------------------------------------------------

/** T1 — corner [0,0] */
export const T1: TilingDescription = {
  monoCell: [0, 0],
  dominoes: [
    [[0, 1], [0, 2]],
    [[1, 0], [1, 1]],
    [[1, 2], [2, 2]],
    [[2, 0], [2, 1]],
  ],
}

/** T2 — corner [0,0] */
export const T2: TilingDescription = {
  monoCell: [0, 0],
  dominoes: [
    [[0, 1], [0, 2]],
    [[1, 0], [2, 0]],
    [[1, 1], [1, 2]],
    [[2, 1], [2, 2]],
  ],
}

/** T3 — corner [0,0] */
export const T3: TilingDescription = {
  monoCell: [0, 0],
  dominoes: [
    [[0, 1], [0, 2]],
    [[1, 0], [2, 0]],
    [[1, 1], [2, 1]],
    [[1, 2], [2, 2]],
  ],
}

/** T4 — corner [0,0] */
export const T4: TilingDescription = {
  monoCell: [0, 0],
  dominoes: [
    [[0, 1], [1, 1]],
    [[0, 2], [1, 2]],
    [[1, 0], [2, 0]],
    [[2, 1], [2, 2]],
  ],
}

/** T5 — centre [1,1] */
export const T5: TilingDescription = {
  monoCell: [1, 1],
  dominoes: [
    [[0, 0], [0, 1]],
    [[0, 2], [1, 2]],
    [[1, 0], [2, 0]],
    [[2, 1], [2, 2]],
  ],
}

/** T6 — centre [1,1] */
export const T6: TilingDescription = {
  monoCell: [1, 1],
  dominoes: [
    [[0, 0], [1, 0]],
    [[0, 1], [0, 2]],
    [[1, 2], [2, 2]],
    [[2, 0], [2, 1]],
  ],
}

// ---------------------------------------------------------------------------
// Beat shape
// ---------------------------------------------------------------------------

export type TilePiecesPhase =
  | 'parity'
  | 'centre-both'
  | 'corner-pair1'
  | 'corner-pair2'
  | 'answer'

export interface TilePiecesStep {
  phase: TilePiecesPhase
  /** Tilings visible on this beat (1 or 2). */
  tilings: TilingDescription[]
  /** Running count of tilings shown so far (0 on parity beat). */
  count: number
  /** Whether the final answer badge should appear. */
  showAnswer: boolean
  result: boolean
  caption: string
  hold: number
}

export interface TilePiecesStoryboard {
  steps: TilePiecesStep[]
  finalIndex: number
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildTilePieces22G3Steps(lang: Lang): TilePiecesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TilePiecesStep[] = [
    // Beat 0 — parity argument: the 1×1 must sit on a majority-colour cell
    {
      phase: 'parity',
      tilings: [],
      count: 0,
      showAnswer: false,
      result: false,
      hold: 2800,
      caption: t(
        'Colour the grid like a checkerboard: 5 dark cells, 4 light cells. Each domino covers one dark + one light, so the leftover 1×1 MUST sit on a dark cell — that means a corner or the centre.',
        'Warnai kotak seperti papan catur: 5 sel gelap, 4 sel terang. Setiap domino menutupi satu gelap + satu terang, jadi kotak 1×1 yang tersisa HARUS berada di sel gelap — artinya pojok atau pusat.',
      ),
    },

    // Beat 1 — centre case: T5 and T6 together → 2 ways
    {
      phase: 'centre-both',
      tilings: [T5, T6],
      count: 2,
      showAnswer: false,
      result: false,
      hold: 2600,
      caption: t(
        '1×1 at the centre: there are exactly 2 ways to fill the rest with dominoes. Count so far: 2.',
        '1×1 di pusat: ada tepat 2 cara mengisi sisanya dengan domino. Hitungan sejauh ini: 2.',
      ),
    },

    // Beat 2 — corner case, first pair: T1 and T2 → count 4
    {
      phase: 'corner-pair1',
      tilings: [T1, T2],
      count: 4,
      showAnswer: false,
      result: false,
      hold: 2600,
      caption: t(
        '1×1 at a corner: here are the first 2 corner tilings. Running count: 2 + 2 = 4.',
        '1×1 di pojok: ini 2 cara pertama dengan pojok. Hitungan sementara: 2 + 2 = 4.',
      ),
    },

    // Beat 3 — corner case, second pair: T3 and T4 → count 6
    {
      phase: 'corner-pair2',
      tilings: [T3, T4],
      count: 6,
      showAnswer: false,
      result: false,
      hold: 2600,
      caption: t(
        'Two more corner tilings (the dominoes run vertically this time). Running count: 4 + 2 = 6.',
        'Dua cara pojok lagi (domino kali ini vertikal). Hitungan sementara: 4 + 2 = 6.',
      ),
    },

    // Beat 4 — final answer
    {
      phase: 'answer',
      tilings: [T5, T6, T1, T2, T3, T4],
      count: 6,
      showAnswer: true,
      result: true,
      hold: 0,
      caption: t(
        'Centre ways (2) + corner ways (4) = 6 distinct tilings. Answer: 6.',
        'Cara pusat (2) + cara pojok (4) = 6 cara berbeda. Jawaban: 6.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
