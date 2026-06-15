// WMI-23F1A-Q17 (2023 Grade 1 Final) — answer = 3 (fill-in).
//
// "You draw the digits 0–9 one by one on the 15 squares below (draw 0, then
// erase; … through 9). In the end, □ of the squares were drawn on 9 times and
// △ of the squares were drawn on 7 times. Find □ − △."
//
// FIGURE (db/seed/wmi/figures/2023-final-g1-a-q17.jpg): a plain, uniform
// 3-column × 5-row grid of 15 identical blank squares — no markings, no
// seven-segment outline. Squares are numbered 1..15 row-major:
//     1  2  3
//     4  5  6
//     7  8  9
//    10 11 12
//    13 14 15
//
// Each digit 0–9 is drawn as a standard 3×5 calculator / dot-matrix numeral by
// shading a fixed subset of the 15 squares. The verified glyph set (DIGIT_SQUARES
// below) is the canonical form for every digit; "1" is a single centered vertical
// stroke (column 2 → squares {2,5,8,11,14}), "4" is closed, "7" is the top bar
// plus the right column.
//
// SOLVER PROOF (throwaway `npx tsx`, since deleted): for that glyph set, count for
// each of the 15 squares how many of the ten digits light it:
//     sq:  1  2  3 | 4  5  6 | 7  8  9 | 10 11 12 | 13 14 15
//   count: 9  9  9 | 6  1  7 | 8  8  9 |  4  1  8 |  7  8  9
//   distribution: 1×{5,11}  4×{10}  6×{4}  7×{6,13}  8×{7,8,12,14}  9×{1,2,3,9,15}
//   □ (drawn 9×) = squares {1,2,3,9,15}  → 5
//   △ (drawn 7×) = squares {6,13}        → 2
//   □ − △ = 5 − 2 = 3   ✓ (matches the answer key)
//
// The default export draws ONLY the blank 15-square template — no counts, no
// answer. The co-exported SegmentCount23G1 primitive lets the animator light one
// digit's squares (showDigit) and/or reveal the per-square heat/count overlay
// (heat). By itself it reveals nothing about □, △, or the answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines (house "ink")
const LIT = '#f0853a' // brand orange — a square currently drawn on
const LIT_FILL = 'rgba(240,133,58,0.22)'
const HEAT_TEXT = '#30598a' // brand blue — count label in the heat overlay

export const GRID_COLS = 3
export const GRID_ROWS = 5
export const SQUARE_COUNT = GRID_COLS * GRID_ROWS // 15

/**
 * Squares (1..15, row-major) lit when each digit is drawn on the grid.
 * Standard 3×5 calculator / dot-matrix numerals; verified to yield □ − △ = 3.
 */
export const DIGIT_SQUARES: Readonly<Record<number, readonly number[]>> = {
  0: [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15],
  1: [2, 5, 8, 11, 14],
  2: [1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15],
  3: [1, 2, 3, 6, 7, 8, 9, 12, 13, 14, 15],
  4: [1, 3, 4, 6, 7, 8, 9, 12, 15],
  5: [1, 2, 3, 4, 7, 8, 9, 12, 13, 14, 15],
  6: [1, 2, 3, 4, 7, 8, 9, 10, 12, 13, 14, 15],
  7: [1, 2, 3, 6, 9, 12, 15],
  8: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15],
  9: [1, 2, 3, 4, 6, 7, 8, 9, 12, 13, 14, 15],
}

/** How many of the ten digits 0–9 light each square (index 1..15). */
export const SQUARE_COUNTS: Readonly<Record<number, number>> = (() => {
  const c: Record<number, number> = {}
  for (let s = 1; s <= SQUARE_COUNT; s++) c[s] = 0
  for (let d = 0; d <= 9; d++) for (const s of DIGIT_SQUARES[d]) c[s] += 1
  return c
})()

/** Squares drawn on exactly 9 times — the □ group. */
export const BOX_SQUARES: readonly number[] = Object.keys(SQUARE_COUNTS)
  .map(Number)
  .filter((s) => SQUARE_COUNTS[s] === 9)
  .sort((a, b) => a - b) // {1,2,3,9,15}

/** Squares drawn on exactly 7 times — the △ group. */
export const TRIANGLE_SQUARES: readonly number[] = Object.keys(SQUARE_COUNTS)
  .map(Number)
  .filter((s) => SQUARE_COUNTS[s] === 7)
  .sort((a, b) => a - b) // {6,13}

/** □ − △ = 5 − 2 = 3. */
export const ANSWER = BOX_SQUARES.length - TRIANGLE_SQUARES.length

// ---- layout ----------------------------------------------------------------
const PAD = 14
const CELL = 50
const BOARD_W = GRID_COLS * CELL
const BOARD_H = GRID_ROWS * CELL
const VIEW_W = BOARD_W + PAD * 2
const VIEW_H = BOARD_H + PAD * 2

/** Top-left corner of square s (1..15). col 0 = left, row 0 = top. */
function squareXY(s: number): { x: number; y: number } {
  const i = s - 1
  const col = i % GRID_COLS
  const row = Math.floor(i / GRID_COLS)
  return { x: PAD + col * CELL, y: PAD + row * CELL }
}

export interface SegmentCount23G1Props {
  /**
   * Light the squares for this digit (0–9). The animator steps through the
   * ten digits one at a time. Anything outside 0–9 (or null) draws no fill.
   */
  showDigit?: number | null
  /**
   * Reveal a per-square count overlay (how many of the ten digits drew on each
   * square). Off by default so the bare template gives nothing away.
   */
  heat?: boolean
}

/**
 * Bare 3×5 template primitive, with optional overlays for the post-answer
 * animation. With no props it renders the blank grid and reveals nothing.
 */
export function SegmentCount23G1({ showDigit = null, heat = false }: SegmentCount23G1Props = {}) {
  const litSet =
    typeof showDigit === 'number' && Number.isInteger(showDigit) && showDigit >= 0 && showDigit <= 9
      ? new Set<number>(DIGIT_SQUARES[showDigit])
      : new Set<number>()

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(220, VIEW_W)} aria-hidden="true">
      {/* lit squares for the current digit (drawn behind the grid lines) */}
      {Array.from(litSet).map((s) => {
        const { x, y } = squareXY(s)
        return <rect key={`lit-${s}`} x={x} y={y} width={CELL} height={CELL} fill={LIT_FILL} />
      })}

      {/* white board so unlit squares stay clean */}
      <rect x={PAD} y={PAD} width={BOARD_W} height={BOARD_H} fill="none" />

      {/* outer border */}
      <rect x={PAD} y={PAD} width={BOARD_W} height={BOARD_H} fill="none" stroke={INK} strokeWidth={3} />

      {/* interior vertical grid lines */}
      {Array.from({ length: GRID_COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`v-${i}`}
          x1={PAD + i * CELL}
          y1={PAD}
          x2={PAD + i * CELL}
          y2={PAD + BOARD_H}
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}

      {/* interior horizontal grid lines */}
      {Array.from({ length: GRID_ROWS - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`h-${i}`}
          x1={PAD}
          y1={PAD + i * CELL}
          x2={PAD + BOARD_W}
          y2={PAD + i * CELL}
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}

      {/* lit-square outlines on top, so the current digit reads clearly */}
      {Array.from(litSet).map((s) => {
        const { x, y } = squareXY(s)
        return (
          <rect
            key={`out-${s}`}
            x={x + 1.5}
            y={y + 1.5}
            width={CELL - 3}
            height={CELL - 3}
            fill="none"
            stroke={LIT}
            strokeWidth={3}
          />
        )
      })}

      {/* per-square count overlay (only when heat is on) */}
      {heat &&
        Array.from({ length: SQUARE_COUNT }, (_, i) => i + 1).map((s) => {
          const { x, y } = squareXY(s)
          return (
            <text
              key={`heat-${s}`}
              x={x + CELL / 2}
              y={y + CELL / 2 + 7}
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
              fill={HEAT_TEXT}
            >
              {SQUARE_COUNTS[s]}
            </text>
          )
        })}
    </svg>
  )
}

/** Default export: the blank 15-square template, no counts, no answer. */
export default function SegmentCount23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 3 kolom kali 5 baris berisi 15 kotak kosong. Setiap angka 0 sampai 9 digambar dengan mewarnai sebagian kotak pada kisi ini, lalu dihapus, satu per satu. Tentukan selisih banyak kotak yang tergambari 9 kali dan banyak kotak yang tergambari 7 kali."
    >
      <SegmentCount23G1 />
    </div>
  )
}
