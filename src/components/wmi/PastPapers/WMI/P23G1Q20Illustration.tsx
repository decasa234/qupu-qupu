// WMI-23P1A-Q20 (2023 Grade 1 Semifinal) — "At least how many dots must be added
// to the grid so that EVERY row and EVERY column has three or more dots?"
// Answer B = 4.
//
// Reconstructed from db/seed/wmi/figures/2023-semifinal-g1-a-q20.jpg (the JPG is
// NOT embedded): a 5×5 grid pre-filled with black dots. Dot positions traced from
// the scan (row, col are 0-indexed, row 0 = top, col 0 = left):
//   row 0: cols 2, 4
//   row 1: cols 1, 2, 3
//   row 2: cols 2, 3
//   row 3: cols 0, 3, 4
//   row 4: col 4
//
// Per-row counts (top→bottom): 2, 3, 2, 3, 1  → rows 0,2 need +1, row 4 needs +2.
// Per-col counts (left→right): 1, 1, 3, 3, 3  → cols 0,1 need +2.
// Row shortfall = 1+1+2 = 4; col shortfall = 2+2 = 4. A single added dot can fix a
// row AND a column at once, and the two shortfalls align perfectly, so the minimum
// is exactly 4 (verified by exhaustive search — see the build agent's check).
//
// One valid minimum placement (1-indexed row,col): (1,1), (3,2), (5,1), (5,2) →
// 0-indexed (0,0), (2,1), (4,0), (4,1). The static figure shows ONLY the original
// dots; the explainer reveals the four added dots via `revealedAdds`.
//
// Pure render, SSR-safe, deterministic — no window/document/Math.random/Date.

const INK = '#2B2622' // grid lines + original dots
const ADD = '#F08522' // qupu brand-orange — the added dots (explainer only)
const ADD_RING = '#92400E'

export const N = 5

/** Original dots from the scan, as [row, col] 0-indexed. The single source of truth. */
export const ORIGINAL: ReadonlyArray<readonly [number, number]> = [
  [0, 2], [0, 4],
  [1, 1], [1, 2], [1, 3],
  [2, 2], [2, 3],
  [3, 0], [3, 3], [3, 4],
  [4, 4],
] as const

/** The four added dots of one verified minimum solution, [row, col] 0-indexed. */
export const ADDS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], // fixes row 0 (+1) and col 0
  [2, 1], // fixes row 2 (+1) and col 1
  [4, 0], // fixes row 4 (+1) and col 0
  [4, 1], // fixes row 4 (+1, → row 4 reaches 3) and col 1
] as const

export const TOTAL_ADDED = ADDS.length // 4

// ---- layout ---------------------------------------------------------------
const PAD = 18
const CELL = 56
const BOARD = N * CELL
const VIEW = BOARD + PAD * 2

const cx = (c: number) => PAD + c * CELL + CELL / 2
const cy = (r: number) => PAD + r * CELL + CELL / 2
const DOT_R = 15

export interface DotGrid23Props {
  /** How many added dots (in ADDS order) to draw, 0..4. Default 0 = bare problem. */
  revealedAdds?: number
  /** Optional row index (0..4) to wash in light blue (the row being inspected). */
  litRow?: number | null
  /** Optional col index (0..4) to wash in light blue (the col being inspected). */
  litCol?: number | null
}

/**
 * The 5×5 dot grid primitive. At its defaults it is the pristine problem: the grid
 * with only the original black dots. The explainer passes `revealedAdds` to drop in
 * the orange added dots one by one, and `litRow`/`litCol` to spotlight a line.
 */
export function DotGrid23({ revealedAdds = 0, litRow = null, litCol = null }: DotGrid23Props = {}) {
  const adds = ADDS.slice(0, Math.max(0, Math.min(TOTAL_ADDED, revealedAdds)))
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* spotlight wash for an inspected row / column (drawn behind the grid lines) */}
      {litRow != null && (
        <rect x={PAD} y={PAD + litRow * CELL} width={BOARD} height={CELL} fill="rgba(43,179,230,0.16)" />
      )}
      {litCol != null && (
        <rect x={PAD + litCol * CELL} y={PAD} width={CELL} height={BOARD} fill="rgba(43,179,230,0.16)" />
      )}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="none" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: N - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`v-${i}`} x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + BOARD} stroke={INK} strokeWidth={2} />
      ))}
      {Array.from({ length: N - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`h-${i}`} x1={PAD} y1={PAD + i * CELL} x2={PAD + BOARD} y2={PAD + i * CELL} stroke={INK} strokeWidth={2} />
      ))}

      {/* original dots */}
      {ORIGINAL.map(([r, c]) => (
        <circle key={`o-${r}-${c}`} cx={cx(c)} cy={cy(r)} r={DOT_R} fill={INK} />
      ))}

      {/* added dots (explainer only) */}
      {adds.map(([r, c]) => (
        <circle key={`a-${r}-${c}`} cx={cx(c)} cy={cy(r)} r={DOT_R} fill={ADD} stroke={ADD_RING} strokeWidth={2.5} />
      ))}
    </svg>
  )
}

export default function P23G1Q20Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 5 kali 5 berisi titik-titik hitam. Baris 1: kolom 3 dan 5. Baris 2: kolom 2, 3, 4. Baris 3: kolom 3 dan 4. Baris 4: kolom 1, 4, 5. Baris 5: kolom 5. Pertanyaan: paling sedikit berapa titik harus ditambahkan agar setiap baris dan kolom punya tiga titik atau lebih?"
    >
      <DotGrid23 />
    </div>
  )
}
