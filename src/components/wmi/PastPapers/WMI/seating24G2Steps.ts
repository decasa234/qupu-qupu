// Storyboard for WMI-24F2A-Q12 (2024 Grade-2 final) — Samuel's snake seat.
//
// Pure builder: turns the seating-block geometry (from the static figure) + lang
// into ordered beats that teach the SNAKE (boustrophedon) numbering method.
//
// Method the beats walk, never asserting the answer up front:
//   1. State the goal — find Samuel's seat number.
//   2. Use the two known seats (11, 37) to FIX the direction each row runs.
//   3. Walk the snake row by row from the bottom-left (seat 1) upward, turning
//      direction each row, driving `upto` so the numbers fill in as we count.
//   4. Land on Samuel's marked cell → seat 20 (derived, not hardcoded).
//   5. Reject the trap: reading every row left-to-right would land on 26 ✗.
//
// Deterministic & SSR-safe: no random, no dates; a pure (lang) => storyboard.

import {
  SEATING_ROWS,
  SEATING_COLS,
  SAMUEL_CELL,
  KNOWN_SEATS,
  seatNumberAt,
} from './Seating24G2Illustration'

export type Lang = 'en' | 'id'

export interface SeatingStep {
  caption: string
  /** Winner beat — the seat is found. Drives the green verdict styling. */
  result: boolean
  /** Print snake numbers for every seat <= this count (drives the walk). */
  upto: number
  /** Cell to ring in blue this beat (the seat being pointed at). */
  highlight?: { row: number; col: number }
  /** Show Samuel's face (false once we want to reveal his seat number). */
  markSamuel: boolean
  /** Print numbers in every cell (used only by the trap beat). */
  reveal?: boolean
  /** Hold in ms; tries/rejections linger, the winner ends with 0. */
  hold: number
}

export interface SeatingStoryboard {
  rows: number
  cols: number
  answer: number
  samuel: { row: number; col: number }
  /** Bottom-up walk: the last seat number printed in each top-down row. */
  rowEnds: number[]
  steps: SeatingStep[]
  finalIndex: number
}

export function buildSeatingSteps(lang: Lang): SeatingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive the answer from the single source of truth — never hardcode 20.
  const answer = seatNumberAt(SAMUEL_CELL.row, SAMUEL_CELL.col)

  // Last seat number printed when we finish each top-down row, walking from the
  // bottom row (highest top-down index) upward. rowEnds[topDownRow] = that row's
  // largest seat number.
  const rowEnds = Array.from({ length: SEATING_ROWS }, (_, topRow) => {
    let max = 0
    for (let c = 0; c < SEATING_COLS; c++) max = Math.max(max, seatNumberAt(topRow, c))
    return max
  })

  // Known seats, ordered bottom row first so the direction story reads upward.
  const known = [...KNOWN_SEATS].sort((a, b) => a.n - b.n)

  // The two rows directly below Samuel's, fully walked before we enter his row.
  // Samuel sits in the top-down row SAMUEL_CELL.row; rows below it (larger index)
  // are walked first. The seat just before Samuel's row is rowEnds of the row
  // one below him.
  const samuelTopRow = SAMUEL_CELL.row
  const beforeSamuelRowEnd = rowEnds[samuelTopRow + 1] // last seat in row below Samuel

  const steps: SeatingStep[] = []

  // 1. Goal.
  steps.push({
    caption: t(
      "Where does Samuel sit? The seats are numbered, so let's read the pattern.",
      'Di mana Samuel duduk? Kursi sudah dinomori, jadi mari baca polanya.',
    ),
    result: false,
    upto: 0,
    highlight: SAMUEL_CELL,
    markSamuel: true,
    hold: 2400,
  })

  // 2. Use the known seats to fix the snake direction.
  steps.push({
    caption: t(
      `Only seats ${known[0].n} and ${known[1].n} show numbers. Seat 1 is the bottom-left corner.`,
      `Hanya kursi ${known[0].n} dan ${known[1].n} bernomor. Kursi 1 ada di pojok kiri bawah.`,
    ),
    result: false,
    upto: 0,
    highlight: { row: known[0].row, col: known[0].col },
    markSamuel: true,
    hold: 2400,
  })
  steps.push({
    caption: t(
      `Seats ${known[0].n} and ${known[1].n} sit in opposite directions — the rows snake back and forth!`,
      `Kursi ${known[0].n} dan ${known[1].n} mengarah berlawanan — barisnya berkelok bolak-balik!`,
    ),
    result: false,
    upto: 0,
    highlight: { row: known[1].row, col: known[1].col },
    markSamuel: true,
    hold: 2600,
  })

  // 3. Walk the snake row by row from the bottom up to Samuel's row.
  // Bottom row first (largest top-down index), then upward.
  for (let topRow = SEATING_ROWS - 1; topRow > samuelTopRow; topRow--) {
    const end = rowEnds[topRow]
    const start = end - SEATING_COLS + 1
    // Direction this row runs (left→right vs right→left), read from the geometry.
    const leftToRight = seatNumberAt(topRow, 0) < seatNumberAt(topRow, SEATING_COLS - 1)
    const arrow = leftToRight ? '→' : '←'
    steps.push({
      caption: t(
        `Row of ${start}-${end} runs ${leftToRight ? 'left to right' : 'right to left'} ${arrow}.`,
        `Baris ${start}-${end} berjalan ${leftToRight ? 'kiri ke kanan' : 'kanan ke kiri'} ${arrow}.`,
      ),
      result: false,
      upto: end,
      markSamuel: true,
      hold: 2000,
    })
  }

  // 4. Enter Samuel's row and stop exactly on his seat.
  const samuelRowLeftToRight =
    seatNumberAt(samuelTopRow, 0) < seatNumberAt(samuelTopRow, SEATING_COLS - 1)
  const samuelRowArrow = samuelRowLeftToRight ? '→' : '←'
  const samuelRowStart = rowEnds[samuelTopRow] - SEATING_COLS + 1
  steps.push({
    caption: t(
      `Now Samuel's row turns back ${samuelRowArrow} starting at ${samuelRowStart}. Keep counting to his circle…`,
      `Sekarang baris Samuel berbalik ${samuelRowArrow} mulai dari ${samuelRowStart}. Terus hitung sampai lingkarannya…`,
    ),
    result: false,
    upto: beforeSamuelRowEnd,
    highlight: SAMUEL_CELL,
    markSamuel: true,
    hold: 2200,
  })

  // 5. Land on Samuel's seat — reveal the number in his cell.
  steps.push({
    caption: t(
      `…${samuelRowStart} then counting along, Samuel's circle is seat ${answer}!`,
      `…${samuelRowStart} lalu hitung terus, lingkaran Samuel adalah kursi ${answer}!`,
    ),
    result: false,
    upto: answer,
    highlight: SAMUEL_CELL,
    markSamuel: false,
    hold: 2400,
  })

  // 6. Reject the trap: reading every row left-to-right (ignoring the snake)
  //    lands on a different number. Show why the back-and-forth matters.
  steps.push({
    caption: t(
      'Trap: read every row the same way and you slip to the wrong seat. The snake matters!',
      'Jebakan: kalau tiap baris dibaca arah sama, kamu meleset ke kursi salah. Pola ular penting!',
    ),
    result: false,
    upto: 0,
    reveal: true,
    highlight: SAMUEL_CELL,
    markSamuel: false,
    hold: 2600,
  })

  // 7. Winner — answer locked in (last beat, hold 0).
  steps.push({
    caption: t(
      `Following the snake, Samuel sits in seat ${answer} → D.`,
      `Mengikuti pola ular, Samuel di kursi ${answer} → D.`,
    ),
    result: true,
    upto: answer,
    highlight: SAMUEL_CELL,
    markSamuel: false,
    hold: 0,
  })

  return {
    rows: SEATING_ROWS,
    cols: SEATING_COLS,
    answer,
    samuel: { row: SAMUEL_CELL.row, col: SAMUEL_CELL.col },
    rowEnds,
    steps,
    finalIndex: steps.length - 1,
  }
}
