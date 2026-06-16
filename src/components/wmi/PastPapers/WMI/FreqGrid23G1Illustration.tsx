// WMI-23F1A-Q6 (2023 Grade 1 Final) — "Among the numbers shown below, what is the
// difference between the number that appears the most often and the number that
// appears the least often?"  Answer: 6 (choice E).
//
// The data is a 5-row x 6-column grid of numbers (rendered faithfully; no scan):
//      9  4  5  7 10  4
//     10  7  7  6  9  5
//      5  9  5 10 10  7
//      9  6 10  9  5  6
//      7 10  4  6  7 10
//
// TALLY (throwaway — NEVER shown on the static figure):
//   4 -> 3, 5 -> 5, 6 -> 4, 7 -> 6, 9 -> 5, 10 -> 7.
//   Most frequent value = 10 (7 times); least frequent value = 4 (3 times).
//   Difference = 10 - 4 = 6.
//
// The static figure draws ONLY the grid of numbers — no tally, no highlight, no
// answer. The animator highlights cells / shows a frequency tally afterwards via
// the co-exported FreqGrid23G1 primitive (highlightValue / tally props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines
const NUM = '#2B2622' // the printed numbers (matches scan's black ink)
const HILITE_FILL = 'rgba(240,133,58,0.18)' // qupu brand-orange wash
const HILITE_STROKE = '#f0853a' // qupu brand-orange
const TALLY_BLUE = '#30598a' // qupu brand blue, for the post-answer tally

export const ROWS = 5
export const COLS = 6

/** The grid data in reading order (row by row). The single source of truth. */
export const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [9, 4, 5, 7, 10, 4],
  [10, 7, 7, 6, 9, 5],
  [5, 9, 5, 10, 10, 7],
  [9, 6, 10, 9, 5, 6],
  [7, 10, 4, 6, 7, 10],
] as const

/** Distinct values in ascending order, derived from GRID (used for the tally). */
const VALUES = Array.from(new Set(GRID.flat())).sort((a, b) => a - b)

/** Frequency of each value, derived from GRID (animation only — never static). */
function frequencyOf(value: number): number {
  let n = 0
  for (const row of GRID) for (const cell of row) if (cell === value) n += 1
  return n
}

// ---- layout ----------------------------------------------------------------
const PAD = 16
const CELL = 44
const BOARD_W = COLS * CELL
const BOARD_H = ROWS * CELL

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

// Tally strip sits below the grid (only drawn when tally is requested), so the
// viewBox reserves room for it; the bare grid simply leaves that space empty,
// which keeps the default figure centered with comfortable headroom.
const TALLY_H = 56
const TALLY_GAP = 14

const BASE_VIEW_W = BOARD_W + PAD * 2
const BASE_VIEW_H = BOARD_H + PAD * 2

export interface FreqGrid23G1Props {
  /**
   * When set, every cell equal to this value gets an orange wash + outline, and
   * its tally bar (if shown) is emphasized. Omit/null for the bare problem.
   */
  highlightValue?: number | null
  /**
   * When true, draw a small frequency tally below the grid (one labeled count
   * per distinct value). Animation only — the static problem never shows it.
   */
  tally?: boolean
}

/**
 * Bare 5x6 number grid primitive, with optional highlight + tally overlays for
 * the post-answer animation. By itself it reveals nothing — only the numbers.
 */
export function FreqGrid23G1({ highlightValue = null, tally = false }: FreqGrid23G1Props = {}) {
  const viewW = BASE_VIEW_W
  const viewH = tally ? BASE_VIEW_H + TALLY_GAP + TALLY_H : BASE_VIEW_H

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} width={Math.min(280, viewW)} aria-hidden="true">
      {/* highlighted cells: faint orange wash behind the grid lines */}
      {highlightValue != null &&
        GRID.map((row, r) =>
          row.map((value, c) =>
            value === highlightValue ? (
              <rect
                key={`h-${r}-${c}`}
                x={gx(c)}
                y={gy(r)}
                width={CELL}
                height={CELL}
                fill={HILITE_FILL}
                stroke={HILITE_STROKE}
                strokeWidth={3}
              />
            ) : null,
          ),
        )}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD_W} height={BOARD_H} fill="#FFFFFF" stroke={INK} strokeWidth={3} />

      {/* interior vertical grid lines */}
      {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`v-${i}`} x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(ROWS)} stroke={INK} strokeWidth={2} />
      ))}
      {/* interior horizontal grid lines */}
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`hl-${i}`} x1={gx(0)} y1={gy(i)} x2={gx(COLS)} y2={gy(i)} stroke={INK} strokeWidth={2} />
      ))}

      {/* the numbers (always shown) */}
      {GRID.map((row, r) =>
        row.map((value, c) => (
          <text
            key={`n-${r}-${c}`}
            x={gx(c) + CELL / 2}
            y={gy(r) + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="22"
            fontWeight="bold"
            fill={NUM}
          >
            {value}
          </text>
        )),
      )}

      {/* frequency tally (animation only) — one count per distinct value */}
      {tally &&
        (() => {
          const ty = PAD + BOARD_H + TALLY_GAP
          const slotW = BOARD_W / VALUES.length
          const maxFreq = Math.max(...VALUES.map(frequencyOf))
          const barMaxH = 28
          const barW = Math.min(20, slotW - 8)
          const baseY = ty + TALLY_H - 16
          return (
            <g>
              {VALUES.map((value, i) => {
                const freq = frequencyOf(value)
                const cx = PAD + slotW * i + slotW / 2
                const h = (freq / maxFreq) * barMaxH
                const emphasized = highlightValue != null && value === highlightValue
                return (
                  <g key={`t-${value}`}>
                    {/* bar */}
                    <rect
                      x={cx - barW / 2}
                      y={baseY - h}
                      width={barW}
                      height={h}
                      rx={2}
                      fill={emphasized ? HILITE_STROKE : TALLY_BLUE}
                    />
                    {/* count above the bar */}
                    <text
                      x={cx}
                      y={baseY - h - 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={emphasized ? HILITE_STROKE : TALLY_BLUE}
                    >
                      {freq}
                    </text>
                    {/* value label below the bar */}
                    <text x={cx} y={baseY + 12} textAnchor="middle" fontSize="12" fontWeight="bold" fill={NUM}>
                      {value}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })()}
    </svg>
  )
}

/** Default export: bare 5x6 number grid, no tally, no highlight, no answer. */
export default function FreqGrid23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi angka 5 baris kali 6 kolom. Baris 1: 9, 4, 5, 7, 10, 4. Baris 2: 10, 7, 7, 6, 9, 5. Baris 3: 5, 9, 5, 10, 10, 7. Baris 4: 9, 6, 10, 9, 5, 6. Baris 5: 7, 10, 4, 6, 7, 10. Tentukan selisih antara angka yang paling sering muncul dan angka yang paling jarang muncul."
    >
      <FreqGrid23G1 />
    </div>
  )
}
