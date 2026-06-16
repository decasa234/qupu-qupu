// Storyboard for WMI-25F2A-Q8 (Grade 2 Final) — Gomoku five-in-a-row.
//
// Pure builder: (lang) => ordered beats. No Math.random, no Date — SSR-safe.
//
// Method we TEACH (deduce, don't assert): the winning move is the empty cell
// that turns FOUR black stones in a line into FIVE. So we
//   1) state the goal (five black stones in a straight line),
//   2) hunt the black line that is almost done — light the four diagonal blacks
//      1-6, 2-5, 3-4, 4-3 one per beat (each (col,row) drops by exactly +1 col,
//      -1 row, i.e. "down to the right"),
//   3) reject a tempting near-cell that does NOT extend the four into five (the
//      trap, 5-3), with the reason visible,
//   4) reveal the empty END of that diagonal — 5-2 — as the winning move → C.
//
// Stone ids match the illustration's `stoneId(col,row)` = `c{col}r{row}` so the
// explainer can light exactly those stones via `litStones`.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { stoneId } from './Gomoku25G2Illustration'

/** Winning choice letter and the empty cell it names ("5−2", col−row). */
export const GOMOKU_ANSWER = 'C'
export const GOMOKU_TARGET = { col: 5, row: 2 } as const

/** The four black stones on the winning diagonal, in down-right order. */
export const WINNING_DIAGONAL: ReadonlyArray<{ col: number; row: number }> = [
  { col: 1, row: 6 },
  { col: 2, row: 5 },
  { col: 3, row: 4 },
  { col: 4, row: 3 },
]

export interface GomokuStep {
  /** Highlight-ring stone ids lit on this beat (cumulative as the line builds). */
  litStones: string[]
  /** Empty cell to ring as the candidate move, or null. */
  target: { col: number; row: number } | null
  /** Style the candidate ring as a rejected try (the trap) instead of the win. */
  reject: boolean
  caption: string
  hold: number
  /** True only on the final winning beat (green verdict). */
  result: boolean
}

export interface GomokuStoryboard {
  /** The choice letter that wins ("C"). */
  answer: string
  /** "5−2" — the winning cell, written col−row like the choice strings. */
  cellLabel: string
  steps: GomokuStep[]
  finalIndex: number
}

const cellText = (col: number, row: number) => `${col}−${row}`

export function buildGomoku25G2Steps(lang: Lang): GomokuStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const d = WINNING_DIAGONAL
  const lit = (upto: number) => d.slice(0, upto).map((s) => stoneId(s.col, s.row))
  const winLabel = cellText(GOMOKU_TARGET.col, GOMOKU_TARGET.row) // "5−2"

  const steps: GomokuStep[] = [
    {
      litStones: [],
      target: null,
      reject: false,
      hold: 2600,
      result: false,
      caption: t(
        'To WIN, Musa needs FIVE black stones in one straight line. Let us hunt the black line that is almost done.',
        'Untuk MENANG, Musa butuh LIMA batu hitam dalam satu garis lurus. Ayo cari garis hitam yang hampir selesai.',
      ),
    },
    {
      litStones: lit(1),
      target: null,
      reject: false,
      hold: 1900,
      result: false,
      caption: t(
        `Start at the top black stone ${cellText(d[0].col, d[0].row)}. That is 1 in the line.`,
        `Mulai dari batu hitam paling atas ${cellText(d[0].col, d[0].row)}. Itu batu ke-1 dalam garis.`,
      ),
    },
    {
      litStones: lit(2),
      target: null,
      reject: false,
      hold: 1900,
      result: false,
      caption: t(
        `Step DOWN-RIGHT: ${cellText(d[1].col, d[1].row)} is black too. That is 2 in a row.`,
        `Melangkah KE BAWAH-KANAN: ${cellText(d[1].col, d[1].row)} juga hitam. Itu 2 sejajar.`,
      ),
    },
    {
      litStones: lit(3),
      target: null,
      reject: false,
      hold: 1900,
      result: false,
      caption: t(
        `Again down-right: ${cellText(d[2].col, d[2].row)} is black. Now 3 in a row.`,
        `Lagi ke bawah-kanan: ${cellText(d[2].col, d[2].row)} hitam. Sekarang 3 sejajar.`,
      ),
    },
    {
      litStones: lit(4),
      target: null,
      reject: false,
      hold: 2200,
      result: false,
      caption: t(
        `And ${cellText(d[3].col, d[3].row)} is black as well — FOUR black stones on one diagonal! Only one more is needed.`,
        `Dan ${cellText(d[3].col, d[3].row)} juga hitam — EMPAT batu hitam satu diagonal! Tinggal butuh satu lagi.`,
      ),
    },
    {
      // Trap beat: 5−3 (choice A) sits beside the line but does NOT extend it.
      litStones: lit(4),
      target: { col: 5, row: 3 },
      reject: true,
      hold: 2100,
      result: false,
      caption: t(
        `Careful — 5−3 (A) sits right next to the stones, but it is NOT on the diagonal, so it does not make five. ✗`,
        `Hati-hati — 5−3 (A) ada tepat di samping batu-batu itu, tapi BUKAN di diagonal, jadi tak jadi lima. ✗`,
      ),
    },
    {
      litStones: lit(4),
      target: { col: GOMOKU_TARGET.col, row: GOMOKU_TARGET.row },
      reject: false,
      hold: 0,
      result: true,
      caption: t(
        `Keep going down-right: the empty END of the diagonal is ${winLabel}. Place a black stone there → FIVE in a row! Answer ${GOMOKU_ANSWER}.`,
        `Lanjut ke bawah-kanan: ujung kosong diagonal adalah ${winLabel}. Letakkan batu hitam di sana → LIMA sejajar! Jawaban ${GOMOKU_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: GOMOKU_ANSWER,
    cellLabel: winLabel,
    steps,
    finalIndex: steps.length - 1,
  }
}
