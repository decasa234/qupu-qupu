// CalMonth19B17Fig — SEAMO 2019 Paper B Q17
// "In a particular year some time ago, there was a month with 5 Sundays.
//  3 of those Sundays happened on an even day of the month.
//  Which day was the 24th day of that month?"
//
// Answer: A — Monday
//
// Solution:
//   If the 5 Sundays fall on dates d, d+7, d+14, d+21, d+28,
//   exactly 3 are even when d is even (even,odd,even,odd,even).
//   Smallest even d giving 5 Sundays in a ≤31-day month: d = 2.
//   → Sundays on  2, 9, 16, 23, 30.
//   The 24th is one day after Sunday the 23rd → Monday.
//
// Classification: STEM (figure in question stem; answer choices are day names)
//
// The illustration is a month calendar grid with Sun=first column.
// Sundays are highlighted in teal; the 24th cell is highlighted in amber.
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// Month layout: first Sunday on the 2nd → day-of-week offset for the 1st:
//   The 1st is a Saturday (index 6), so day 1 starts at column 6.
// Grid has 6 rows × 7 cols to fit all 30 dates (row 0 only has date 1 in col 6).
const FIRST_COL = 6   // Saturday is column 6

const CELL_W   = 44
const CELL_H   = 38
const HEADER_H = 28
const N_COLS   = 7
const N_ROWS   = 6

const PAD    = 12
const GRID_W = N_COLS * CELL_W
const GRID_H = N_ROWS * CELL_H
const SVG_W  = PAD + GRID_W + PAD
const SVG_H  = PAD + HEADER_H + GRID_H + PAD

const GRID_X = PAD
const GRID_Y = PAD + HEADER_H

// ── Colours ────────────────────────────────────────────────────────────────────

const BG_CLR      = '#FFFBF0'   // warm card background
const HEADER_CLR  = '#DC2626'   // red header background
const HEADER_TEXT = '#FFFFFF'
const SUN_COL_BG  = '#FECACA'   // light red for Sunday column header
const CELL_BG     = '#FFFFFF'
const CELL_STROKE = '#D1D5DB'   // gray-300 grid lines
const SUN_FILL    = '#5EEAD4'   // teal-300 for Sundays (highlighted)
const MARK_FILL   = '#FDE68A'   // amber-200 for the 24th
const MARK_STROKE = '#D97706'   // amber-600 border for the 24th
const SUN_STROKE  = '#0F766E'   // teal-700 border for Sundays
const NUM_CLR     = '#374151'   // default date number colour
const SUN_NUM_CLR = '#0F766E'   // teal date number for Sundays
const MARK_NUM    = '#92400E'   // amber date number for 24th
const HEADER_FONT = 'ui-sans-serif, system-ui, sans-serif'

// Sundays in this month layout (first Sunday on the 2nd)
const SUNDAY_DATES = new Set([2, 9, 16, 23, 30])
const TARGET_DATE  = 24   // the date whose day we seek (answer: Monday)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Given a 1-based date (1..30), return { row, col } in the grid. */
function cellPos(date: number): { row: number; col: number } {
  // date 1 is at column FIRST_COL, row 0
  const idx = date - 1 + FIRST_COL   // linear slot index (0-based)
  return { row: Math.floor(idx / N_COLS), col: idx % N_COLS }
}

function cellX(col: number): number { return GRID_X + col * CELL_W }
function cellY(row: number): number { return GRID_Y + row * CELL_H }

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface CalMonth19B17FigureProps {
  /** Highlight the Sunday cells (default true). */
  showSundays?: boolean
  /** Highlight the target 24th cell (default true). */
  showTarget?: boolean
  /** Show "Mon" label inside the 24th cell. */
  showAnswer?: boolean
}

export function CalMonth19B17Figure({
  showSundays = true,
  showTarget  = true,
  showAnswer  = false,
}: CalMonth19B17FigureProps) {
  // Build list of (date, row, col) for all dates 1..30
  const dateCells: Array<{ date: number; row: number; col: number }> = []
  for (let d = 1; d <= 30; d++) {
    dateCells.push({ date: d, ...cellPos(d) })
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Card background */}
      <rect width={SVG_W} height={SVG_H} fill={BG_CLR} rx={8} />

      {/* Header row — day-of-week names */}
      <rect
        x={GRID_X}
        y={PAD}
        width={GRID_W}
        height={HEADER_H}
        fill={HEADER_CLR}
        rx={4}
      />
      {DAYS_OF_WEEK.map((day, col) => {
        const isSun = col === 0
        return (
          <g key={day}>
            {isSun && (
              <rect
                x={cellX(col)}
                y={PAD}
                width={CELL_W}
                height={HEADER_H}
                fill={SUN_COL_BG}
                rx={0}
              />
            )}
            <text
              x={cellX(col) + CELL_W / 2}
              y={PAD + HEADER_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={isSun ? HEADER_CLR : HEADER_TEXT}
              fontFamily={HEADER_FONT}
            >
              {day}
            </text>
          </g>
        )
      })}

      {/* Empty grid cells (all rows × cols) */}
      {Array.from({ length: N_ROWS }, (_, r) =>
        Array.from({ length: N_COLS }, (_, c) => (
          <rect
            key={`bg-${r}-${c}`}
            x={cellX(c)}
            y={cellY(r)}
            width={CELL_W}
            height={CELL_H}
            fill={CELL_BG}
            stroke={CELL_STROKE}
            strokeWidth={0.75}
          />
        ))
      )}

      {/* Date cells */}
      {dateCells.map(({ date, row, col }) => {
        const isSun    = SUNDAY_DATES.has(date)
        const isTarget = date === TARGET_DATE

        const fillColor   = isTarget && showTarget
          ? MARK_FILL
          : isSun && showSundays
            ? SUN_FILL
            : CELL_BG
        const strokeColor = isTarget && showTarget
          ? MARK_STROKE
          : isSun && showSundays
            ? SUN_STROKE
            : CELL_STROKE
        const strokeW     = (isTarget && showTarget) || (isSun && showSundays) ? 1.8 : 0.75
        const numColor    = isTarget && showTarget
          ? MARK_NUM
          : isSun && showSundays
            ? SUN_NUM_CLR
            : NUM_CLR

        const cx = cellX(col)
        const cy = cellY(row)

        return (
          <g key={`d-${date}`}>
            <rect
              x={cx}
              y={cy}
              width={CELL_W}
              height={CELL_H}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <text
              x={cx + CELL_W / 2}
              y={cy + (showAnswer && isTarget ? CELL_H / 2 - 5 : CELL_H / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={isTarget || isSun ? 700 : 500}
              fill={numColor}
              fontFamily={HEADER_FONT}
            >
              {date}
            </text>
            {/* Day label inside the 24th cell when answer is revealed */}
            {showAnswer && isTarget && (
              <text
                x={cx + CELL_W / 2}
                y={cy + CELL_H / 2 + 9}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={800}
                fill={MARK_NUM}
                fontFamily={HEADER_FONT}
              >
                Mon
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export — static illustration ──────────────────────────────────────

export default function CalMonth19B17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A month calendar with 5 Sundays falling on dates 2, 9, 16, 23, and 30. ' +
        'Three Sundays (2, 16, 30) are on even dates. ' +
        'The 24th is highlighted in amber — it falls on a Monday, one day after Sunday the 23rd.'
      }
    >
      <CalMonth19B17Figure />
    </div>
  )
}

// ── VISUALS entry (do NOT paste into registry.ts here — return in report) ──────
//
//   'SEAMO-19-B-Q17': {
//     type: 'stem',
//     illustration: () => import('./CalMonth19B17Fig'),
//   },
