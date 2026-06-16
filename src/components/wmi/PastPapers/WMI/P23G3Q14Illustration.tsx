// Locker-grid figure for WMI-23P3A-Q14.
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g3-a-q14.jpg:
// a 4-row × 6-column wall of lockers. Each row is a single colour
// (top→bottom: White, Red, Yellow, Green) and the lockers are numbered
// left→right, top→bottom (row-major):
//   White  row: 1  2  3  4  5  6
//   Red    row: 7  8  9 10 11 12
//   Yellow row: 13 14 15 16 17 18
//   Green  row: 19 20 21 22 23 24
// Only some numbers are printed on the scan (1,2,3,5 / 7,12 / 14,16); the rest
// are blank, so the solver must work out the pattern.
//
// Question: which option lists three lockers coloured green, green, red?
//   A 20,24,11 → Green,Green,Red  ✓ (answer A)
//   B 15,24,22 → Yellow,Green,Green
//   C 18,21,8  → Yellow,Green,Red
//   D 19,11,23 → Green,Red,Green
export const ROWS = 4
export const COLS = 6

export type LockerColour = 'White' | 'Red' | 'Yellow' | 'Green'
export const ROW_COLOURS: LockerColour[] = ['White', 'Red', 'Yellow', 'Green']

/** Locker number (1..24) → its row colour. */
export function lockerColour(n: number): LockerColour {
  return ROW_COLOURS[Math.floor((n - 1) / COLS)]
}

// Fills tuned to match the scan (pale bands).
const ROW_FILL: Record<LockerColour, string> = {
  White: '#FFFFFF',
  Red: '#F2C0C0',
  Yellow: '#FBF1B6',
  Green: '#CFE08A',
}
const ROW_FILL_BRIGHT: Record<LockerColour, string> = {
  White: '#F3F4F6',
  Red: '#EF8C8C',
  Yellow: '#F6E173',
  Green: '#A7CB4D',
}

// Numbers actually printed on the original scan (the rest are blank).
const GIVEN: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  5: 5,
  7: 7,
  12: 12,
  14: 14,
  16: 16,
}

const EDGE = '#374151'
const BOX = '#FFFFFF'
const BOX_EDGE = '#374151'
const NUM = '#1F2937'

// Geometry.
const CELL_W = 92
const CELL_H = 78
const PAD = 14
const LABEL_W = 86 // room for the colour name on the right
const BOX_W = 40
const BOX_H = 34

const GRID_X = PAD
const GRID_Y = PAD
const GRID_W = COLS * CELL_W
const GRID_H = ROWS * CELL_H

export const Q14_VIEW_W = PAD * 2 + GRID_W + LABEL_W
export const Q14_VIEW_H = PAD * 2 + GRID_H

function num(row: number, col: number): number {
  return row * COLS + col + 1
}

export interface LockerGridProps {
  /** Show ALL locker numbers (the explainer's "fill the pattern" beat). */
  revealAll?: boolean
  /** Locker numbers to ring + label as Green (g) / Red (r). */
  marks?: Array<{ n: number; tag: 'g' | 'r' }>
  /** Brighten the colour bands (explainer emphasis). */
  bright?: boolean
}

/** The 4×6 coloured locker wall. */
export function LockerGrid({ revealAll = false, marks = [], bright = false }: LockerGridProps) {
  const markOf = (n: number) => marks.find((m) => m.n === n)
  const fills = bright ? ROW_FILL_BRIGHT : ROW_FILL

  return (
    <svg
      viewBox={`0 0 ${Q14_VIEW_W} ${Q14_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* colour bands */}
      {ROW_COLOURS.map((colour, r) => (
        <rect
          key={`band${r}`}
          x={GRID_X}
          y={GRID_Y + r * CELL_H}
          width={GRID_W}
          height={CELL_H}
          fill={fills[colour]}
        />
      ))}

      {/* grid lines */}
      <rect x={GRID_X} y={GRID_Y} width={GRID_W} height={GRID_H} fill="none" stroke={EDGE} strokeWidth={2.5} />
      {Array.from({ length: COLS - 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={GRID_X + (i + 1) * CELL_W}
          y1={GRID_Y}
          x2={GRID_X + (i + 1) * CELL_W}
          y2={GRID_Y + GRID_H}
          stroke={EDGE}
          strokeWidth={2}
        />
      ))}
      {Array.from({ length: ROWS - 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={GRID_X}
          y1={GRID_Y + (i + 1) * CELL_H}
          x2={GRID_X + GRID_W}
          y2={GRID_Y + (i + 1) * CELL_H}
          stroke={EDGE}
          strokeWidth={2}
        />
      ))}

      {/* lockers */}
      {ROW_COLOURS.map((_colour, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const n = num(r, c)
          const cx = GRID_X + c * CELL_W + CELL_W / 2
          const cyBox = GRID_Y + r * CELL_H + 24
          const cyLatch = GRID_Y + r * CELL_H + 56
          const shown = revealAll || GIVEN[n] !== undefined
          const mark = markOf(n)
          return (
            <g key={`L${n}`}>
              {/* number box */}
              <rect
                x={cx - BOX_W / 2}
                y={cyBox - BOX_H / 2}
                width={BOX_W}
                height={BOX_H}
                rx={3}
                fill={BOX}
                stroke={mark ? (mark.tag === 'g' ? '#16A34A' : '#DC2626') : BOX_EDGE}
                strokeWidth={mark ? 4 : 2}
              />
              {shown && (
                <text
                  x={cx}
                  y={cyBox}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={18}
                  fontWeight={700}
                  fill={NUM}
                >
                  {n}
                </text>
              )}
              {/* latch glyph ("=") below the box, as in the scan */}
              <text
                x={cx}
                y={cyLatch}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={700}
                fill={EDGE}
              >
                =
              </text>
              {/* mark tag (G / R) */}
              {mark && (
                <text
                  x={cx + BOX_W / 2 + 9}
                  y={cyBox - BOX_H / 2 - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill={mark.tag === 'g' ? '#16A34A' : '#DC2626'}
                >
                  {mark.tag === 'g' ? 'G' : 'R'}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* colour-name labels on the right */}
      {ROW_COLOURS.map((colour, r) => (
        <text
          key={`lab${r}`}
          x={GRID_X + GRID_W + 12}
          y={GRID_Y + r * CELL_H + CELL_H / 2}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={700}
          fill={NUM}
        >
          {colour}
        </text>
      ))}
    </svg>
  )
}

export default function P23G3Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A wall of lockers, 4 coloured rows (white, red, yellow, green) of 6 lockers each. Some lockers show numbers 1, 2, 3, 5, 7, 12, 14, 16; the rest are blank."
    >
      <LockerGrid />
    </div>
  )
}
