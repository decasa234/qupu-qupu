// WMI-23F1A-Q19 (2023 Grade 1 Final) — "How many squares contain exactly one ★?"
//
// Reconstructed pixel-for-pixel from db/seed/wmi/figures/2023-final-g1-a-q19.jpg:
// a 6x6 square grid (all sides full grid lines) with six black stars placed on
// the anti-diagonal. Cell coords use col 0 = LEFT, row 0 = TOP. The stars sit
// in every cell where col + row = 5:
//   (5,0) (4,1) (3,2) (2,3) (1,4) (0,5).
//
// SOLVER PROOF (throwaway backtracking/enumeration, run with `npx tsx`, since
// deleted): enumerate every axis-aligned square of every size 1..6 whose four
// sides are full grid lines, count those containing EXACTLY ONE star.
//   size 1 -> 6, size 2 -> 8, size 3 -> 4  =>  TOTAL = 18  (matches answer key).
//
// The static figure draws ONLY the grid + stars. It NEVER reveals the count or
// outlines any qualifying square — that is the animator's job, via the
// co-exported StarSquares23G1 primitive (highlightSquare / countedSquares props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines (house "ink")
const STAR = '#2B2622' // black star fill (matches the scan)

export const GRID_N = 6

/** Star cells (col, row); col 0 = left, row 0 = top. Anti-diagonal col+row=5. */
export const STAR_CELLS: ReadonlyArray<readonly [number, number]> = [
  [5, 0],
  [4, 1],
  [3, 2],
  [2, 3],
  [1, 4],
  [0, 5],
]

export interface SquareRef {
  /** Top-left grid corner of the square (col, row). */
  x: number
  y: number
  /** Side length in cells. */
  size: number
}

// ---- enumeration (the same logic the throwaway solver used) ----------------
const STAR_SET = new Set(STAR_CELLS.map(([c, r]) => `${c},${r}`))

function starsIn(x: number, y: number, size: number): number {
  let n = 0
  for (let c = x; c < x + size; c++) {
    for (let r = y; r < y + size; r++) {
      if (STAR_SET.has(`${c},${r}`)) n++
    }
  }
  return n
}

/** Every axis-aligned square (all sides full grid lines) with exactly one star. */
export function squaresWithExactlyOneStar(): SquareRef[] {
  const out: SquareRef[] = []
  for (let size = 1; size <= GRID_N; size++) {
    for (let x = 0; x <= GRID_N - size; x++) {
      for (let y = 0; y <= GRID_N - size; y++) {
        if (starsIn(x, y, size) === 1) out.push({ x, y, size })
      }
    }
  }
  return out
}

export const QUALIFYING_SQUARES = squaresWithExactlyOneStar()
export const ANSWER = QUALIFYING_SQUARES.length // 18

// ---- layout ----------------------------------------------------------------
const PAD = 16
const CELL = 44
const BOARD = GRID_N * CELL
const VIEW = BOARD + PAD * 2

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

/** A drawn 5-pointed star path centred at (cx, cy) with outer radius rOut. */
function starPath(cx: number, cy: number, rOut: number): string {
  const rIn = rOut * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    // start pointing up (-90deg), step 36deg per point
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

export interface StarSquares23G1Props {
  /** Outline a single qualifying square (the animator highlights one per beat). */
  highlightSquare?: SquareRef | null
  /** Show several already-counted squares faded behind the current one. */
  countedSquares?: ReadonlyArray<SquareRef> | null
}

/**
 * Bare grid + stars primitive, with optional highlight overlays for the
 * post-answer animation. By itself it reveals nothing about the count.
 */
export function StarSquares23G1({ highlightSquare = null, countedSquares = null }: StarSquares23G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(300, VIEW)} aria-hidden="true">
      {/* already-counted squares: faint blue wash behind the grid */}
      {(countedSquares ?? []).map((s, i) => (
        <rect
          key={`c-${i}`}
          x={gx(s.x)}
          y={gy(s.y)}
          width={s.size * CELL}
          height={s.size * CELL}
          rx={3}
          fill="rgba(48,89,138,0.10)"
        />
      ))}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="#FFFFFF" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`l-${i}`}>
          <line x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(GRID_N)} stroke={INK} strokeWidth={2.5} />
          <line x1={gx(0)} y1={gy(i)} x2={gx(GRID_N)} y2={gy(i)} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* stars, one per anti-diagonal cell */}
      {STAR_CELLS.map(([c, r], i) => (
        <path key={`s-${i}`} d={starPath(gx(c) + CELL / 2, gy(r) + CELL / 2, CELL * 0.34)} fill={STAR} />
      ))}

      {/* the one square the animator is currently outlining (drawn last, on top) */}
      {highlightSquare && (
        <rect
          x={gx(highlightSquare.x)}
          y={gy(highlightSquare.y)}
          width={highlightSquare.size * CELL}
          height={highlightSquare.size * CELL}
          rx={3}
          fill="rgba(240,133,58,0.16)"
          stroke="#f0853a"
          strokeWidth={3.5}
        />
      )}
    </svg>
  )
}

/** Default export: bare grid + stars, no answer revealed. */
export default function StarSquares23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi persegi 6 kali 6. Enam bintang hitam tersusun menurun dari kanan atas ke kiri bawah, satu bintang di setiap kotak pada diagonal. Hitung berapa banyak persegi yang memuat tepat satu bintang."
    >
      <StarSquares23G1 />
    </div>
  )
}
