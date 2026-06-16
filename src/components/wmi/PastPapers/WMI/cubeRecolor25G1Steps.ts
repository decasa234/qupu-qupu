import type { Lang } from '../concepts/explainers/makeTenSteps'

// Storyboard for WMI-25F1A-Q16 (2025 Grade 1 Final).
//
// "Change the cube design 2025 (left) into 0726 (right). How many cubes change
//  colour?"  Answer: 9.
//
// Method (one digit-POSITION per beat): line the two boards up and compare each
// of the 4 digit positions, counting the cubes that differ:
//   pos0  2 -> 0   differs in 3 cubes   (running 3)
//   pos1  0 -> 7   differs in 5 cubes   (running 8)
//   pos2  2 -> 2   differs in 0 cubes   (running 8 — same digit, nothing changes)
//   pos3  5 -> 6   differs in 1 cube    (running 9)
//   TOTAL = 3 + 5 + 0 + 1 = 9  ✓
//
// The result beat flips markChanges on so the primitive rings all 9 differing
// cubes on both boards. Pure builder — deterministic, SSR-safe, no random/dates.

// Each digit is a 5-row × 3-col grid; true = filled (orange), false = empty.
// These mirror LEFT / RIGHT in CubeRecolor25G1Illustration exactly so the per-
// position mini-comparison reads as the same cubes coming alive.
type Cell = boolean
type Glyph = Cell[][] // [row][col]

const F = true
const E = false

// LEFT board digits: 2 0 2 5
const LEFT_GLYPHS: Glyph[] = [
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]], // 2
  [[F, F, F], [F, E, F], [F, E, F], [F, E, F], [F, F, F]], // 0
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]], // 2
  [[F, F, F], [F, E, E], [F, F, F], [E, E, F], [F, F, F]], // 5
]

// RIGHT board digits: 0 7 2 6
const RIGHT_GLYPHS: Glyph[] = [
  [[F, F, F], [F, E, F], [F, E, F], [F, E, F], [F, F, F]], // 0
  [[F, F, F], [E, E, F], [E, E, F], [E, E, F], [E, E, F]], // 7
  [[F, F, F], [E, E, F], [F, F, F], [F, E, E], [F, F, F]], // 2
  [[F, F, F], [F, E, E], [F, F, F], [F, E, F], [F, F, F]], // 6
]

const ROWS = 5
const COLS = 3

const LEFT_LABEL = '2025'
const RIGHT_LABEL = '0726'

// Per-position difference mask (true where the two glyphs disagree).
function diffMask(a: Glyph, b: Glyph): boolean[][] {
  return a.map((row, r) => row.map((cell, c) => cell !== b[r][c]))
}
function countDiff(mask: boolean[][]): number {
  let n = 0
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (mask[r][c]) n++
  return n
}

export type CubeRecolorPhase = 'show' | 'compare' | 'result'

export interface CubeRecolorStep {
  phase: CubeRecolorPhase
  /** Digit position 0..3 being compared this beat, or null on show/result. */
  pos: number | null
  /** The single LEFT digit glyph in focus (for the mini-comparison). */
  leftGlyph: Glyph | null
  /** The single RIGHT digit glyph in focus. */
  rightGlyph: Glyph | null
  /** Which cubes differ in the focused pair (5×5 mask), or null. */
  mask: boolean[][] | null
  /** Cubes that differ at this position. */
  changedHere: number
  /** Running total of changed cubes so far. */
  running: number
  /** When true, the bound primitive rings all 9 differing cubes. */
  markChanges: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CubeRecolorStoryboard {
  answer: number
  /** "3 + 5 + 0 + 1" for the result caption. */
  sumParts: string
  steps: CubeRecolorStep[]
  finalIndex: number
}

export function buildCubeRecolor25G1Steps(lang: Lang): CubeRecolorStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeRecolorStep[] = [
    {
      phase: 'show',
      pos: null,
      leftGlyph: null,
      rightGlyph: null,
      mask: null,
      changedHere: 0,
      running: 0,
      markChanges: false,
      hold: 1600,
      result: false,
      caption: t(
        `Turn ${LEFT_LABEL} into ${RIGHT_LABEL}. Check one digit at a time, left to right.`,
        `Ubah ${LEFT_LABEL} jadi ${RIGHT_LABEL}. Periksa satu angka tiap kali, kiri ke kanan.`,
      ),
    },
  ]

  const perPosition: number[] = []
  let running = 0
  for (let pos = 0; pos < 4; pos++) {
    const leftGlyph = LEFT_GLYPHS[pos]
    const rightGlyph = RIGHT_GLYPHS[pos]
    const mask = diffMask(leftGlyph, rightGlyph)
    const changedHere = countDiff(mask)
    perPosition.push(changedHere)
    running += changedHere

    const leftDigit = LEFT_LABEL[pos]
    const rightDigit = RIGHT_LABEL[pos]

    let caption: string
    if (changedHere === 0) {
      // Same digit at this position — nothing recolours. Show the rejection of
      // "every position must change" by making the zero explicit.
      caption = t(
        `Position ${pos + 1}: ${leftDigit} is already ${rightDigit}. Same shape, 0 cubes change. Total stays ${running}.`,
        `Posisi ${pos + 1}: ${leftDigit} sudah ${rightDigit}. Bentuk sama, 0 kubus berubah. Total tetap ${running}.`,
      )
    } else {
      const enClause =
        changedHere === 1 ? '1 cube differs' : `${changedHere} cubes differ`
      caption = t(
        `Position ${pos + 1}: ${leftDigit} → ${rightDigit}. ${enClause}. Total now ${running}.`,
        `Posisi ${pos + 1}: ${leftDigit} → ${rightDigit}. ${changedHere} kubus berbeda. Total jadi ${running}.`,
      )
    }

    steps.push({
      phase: 'compare',
      pos,
      leftGlyph,
      rightGlyph,
      mask,
      changedHere,
      running,
      markChanges: false,
      // Linger a touch longer on the "0 change" position so the surprise reads.
      hold: changedHere === 0 ? 2100 : 1800,
      result: false,
      caption,
    })
  }

  const sumParts = perPosition.join(' + ')
  const answer = running

  steps.push({
    phase: 'result',
    pos: null,
    leftGlyph: null,
    rightGlyph: null,
    mask: null,
    changedHere: 0,
    running: answer,
    markChanges: true,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${answer} cubes change colour.`,
      `${sumParts} = ${answer} kubus berganti warna.`,
    ),
  })

  return { answer, sumParts, steps, finalIndex: steps.length - 1 }
}
