// WMI-23P2A-Q25 (2023 Semifinal Grade 2 Paper A) — jigsaw / polyomino assembly.
//
// "Put the 4 puzzle pieces on the left into the 4×4 grid on the right to complete
//  the puzzle. The pieces cannot be rotated. What does the shaded 2×2 region look
//  like?"  The four answer options were images; the seed answer letter is A.
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g2-a-q25.jpg). Read piece by
// piece (row 0 = top, col 0 = left within each piece's own box), with icons:
//   D = dragon (🐉), B = bomb (💣), C = chest (🧰), '.' = a blank (white) tile.
//   P1 (S-tetromino, 4 cells):  (0,0)=D, (1,0)=D, (1,1)=D, (2,1)=.
//   P2 (I-tromino, 3 cells):    (0,0)=B, (1,0)=C, (2,0)=.
//   P3 (T-pentomino, 5 cells):  (0,0)=., (0,1)=B, (0,2)=D, (1,1)=., (2,1)=C
//   P4 (4 cells):               (0,0)=B, (1,0)=., (1,1)=C, (1,2)=D
//   Total = 4 + 3 + 5 + 4 = 16 = the 4×4 grid.  Pieces translate only (no rotate,
//   no flip). The shaded target region is the centre 2×2 (rows 1–2, cols 1–2).
//
// SOLVER PROOF (brute-force exact cover over translations only — confirmed UNIQUE):
//   D . B D
//   D D . B
//   B . C C
//   . C D .
//   Centre 2×2 (rows 1–2, cols 1–2):  [D, .] over [., C]  → 🐉 blank / blank 🧰.
//   That single tiling matches option A (the seed answer).
//
// The static figure draws ONLY the four pieces + the empty 4×4 grid with its
// centre 2×2 shaded. It NEVER shows the assembled solution; that is the
// explainer's job, via the co-exported PuzzleGrid23 primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. Icons are
// single-codepoint emoji (🐉 💣 🧰).

export type Icon = 'D' | 'B' | 'C' | '.'

export const ICON_GLYPH: Record<Exclude<Icon, '.'>, string> = {
  D: '🐉',
  B: '💣',
  C: '🧰',
}

export type Cell = [number, number] // [row, col], row 0 = top

export interface Piece {
  label: string
  /** Cell → icon, in the piece's own bounding box. */
  cells: Array<{ rc: Cell; icon: Icon }>
}

/** The four pieces, exactly as drawn in the stem. */
export const PIECES: ReadonlyArray<Piece> = [
  {
    label: 'P1',
    cells: [
      { rc: [0, 0], icon: 'D' },
      { rc: [1, 0], icon: 'D' },
      { rc: [1, 1], icon: 'D' },
      { rc: [2, 1], icon: '.' },
    ],
  },
  {
    label: 'P2',
    cells: [
      { rc: [0, 0], icon: 'B' },
      { rc: [1, 0], icon: 'C' },
      { rc: [2, 0], icon: '.' },
    ],
  },
  {
    label: 'P3',
    cells: [
      { rc: [0, 0], icon: '.' },
      { rc: [0, 1], icon: 'B' },
      { rc: [0, 2], icon: 'D' },
      { rc: [1, 1], icon: '.' },
      { rc: [2, 1], icon: 'C' },
    ],
  },
  {
    label: 'P4',
    cells: [
      { rc: [0, 0], icon: 'B' },
      { rc: [1, 0], icon: '.' },
      { rc: [1, 1], icon: 'C' },
      { rc: [1, 2], icon: 'D' },
    ],
  },
]

/**
 * Where each piece's bounding box sits in the 4×4 grid in the verified unique
 * solution (top-left [row, col] offset). Translation only — no rotation, no flip.
 */
export const SOLUTION_OFFSETS: Record<string, Cell> = {
  P1: [0, 0],
  P2: [1, 3],
  P3: [0, 1],
  P4: [2, 0],
}

export const GRID_N = 4

/** The assembled grid (row-major) from the verified unique solution. */
export const SOLVED_GRID: ReadonlyArray<ReadonlyArray<Icon>> = [
  ['D', '.', 'B', 'D'],
  ['D', 'D', '.', 'B'],
  ['B', '.', 'C', 'C'],
  ['.', 'C', 'D', '.'],
]

/** The shaded centre region: rows 1–2, cols 1–2. */
export const CENTER_CELLS: ReadonlyArray<Cell> = [
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 2],
]

const INK = '#1F2937'
const SHADE = '#F6C6C2' // pink centre wash, matching the source figure
const PIECE_FILL = '#FFFFFF'

// ---- icon cell -------------------------------------------------------------
function IconCell({ x, y, size, icon, fill }: { x: number; y: number; size: number; icon: Icon; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill={fill} stroke={INK} strokeWidth={2} />
      {icon !== '.' && (
        <text
          x={x + size / 2}
          y={y + size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.62}
        >
          {ICON_GLYPH[icon]}
        </text>
      )}
    </g>
  )
}

// ---- piece span ------------------------------------------------------------
function pieceSpan(p: Piece) {
  const rows = Math.max(...p.cells.map((c) => c.rc[0])) + 1
  const cols = Math.max(...p.cells.map((c) => c.rc[1])) + 1
  return { rows, cols }
}

/** Draws a single piece, bounding-box top-left at (x, y). Co-exported primitive. */
export function PieceShape({ piece, x, y, cell }: { piece: Piece; x: number; y: number; cell: number }) {
  return (
    <g>
      {piece.cells.map(({ rc: [r, c], icon }, i) => (
        <IconCell key={i} x={x + c * cell} y={y + r * cell} size={cell} icon={icon} fill={PIECE_FILL} />
      ))}
    </g>
  )
}

// ---- the target 4×4 grid ---------------------------------------------------
export interface PuzzleGrid23Props {
  /** Cell → icon to draw inside the 4×4 grid (the assembled-so-far fills). */
  filled?: Partial<Record<string, Icon>> | null
  /** Always shade the centre 2×2 (true by default). */
  shadeCenter?: boolean
  cell?: number
  /** Outline these cells with a bold ring (e.g. the centre when reading it). */
  ringCells?: ReadonlyArray<Cell> | null
}

const gridKey = (r: number, c: number) => `${r},${c}`

export function PuzzleGrid23({
  filled = null,
  shadeCenter = true,
  cell = 38,
  ringCells = null,
}: PuzzleGrid23Props = {}) {
  const board = GRID_N * cell
  const ringSet = new Set((ringCells ?? []).map(([r, c]) => gridKey(r, c)))

  return (
    <g>
      {/* centre shading */}
      {shadeCenter &&
        CENTER_CELLS.map(([r, c]) => (
          <rect key={`s-${gridKey(r, c)}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={SHADE} />
        ))}

      {/* filled icons */}
      {filled &&
        Object.entries(filled).map(([k, icon]) => {
          const [r, c] = k.split(',').map(Number)
          if (!icon || icon === '.') return null
          return (
            <text
              key={`fi-${k}`}
              x={c * cell + cell / 2}
              y={r * cell + cell / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={cell * 0.62}
            >
              {ICON_GLYPH[icon]}
            </text>
          )
        })}

      {/* grid lines */}
      <rect x={0} y={0} width={board} height={board} fill="none" stroke={INK} strokeWidth={3} />
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`gl-${i}`}>
          <line x1={i * cell} y1={0} x2={i * cell} y2={board} stroke={INK} strokeWidth={2} />
          <line x1={0} y1={i * cell} x2={board} y2={i * cell} stroke={INK} strokeWidth={2} />
        </g>
      ))}

      {/* ring overlays */}
      {[...ringSet].map((k) => {
        const [r, c] = k.split(',').map(Number)
        return (
          <rect
            key={`ring-${k}`}
            x={c * cell + 1.5}
            y={r * cell + 1.5}
            width={cell - 3}
            height={cell - 3}
            fill="none"
            stroke="#10B981"
            strokeWidth={3}
          />
        )
      })}
    </g>
  )
}

// ---- full stem diagram -----------------------------------------------------
const VIEW_W = 360
const VIEW_H = 250
const PIECE_CELL = 22
const SLOT_W = 84
const PIECES_TOP = 16
const GRID_CELL = 40

export function P23G2Q25Diagram() {
  const board = GRID_N * GRID_CELL
  const gridX = (VIEW_W - board) / 2
  const gridY = 118

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* four pieces across the top, each centred in its slot */}
      {PIECES.map((p, i) => {
        const { rows, cols } = pieceSpan(p)
        const w = cols * PIECE_CELL
        const h = rows * PIECE_CELL
        const cx = i * SLOT_W + SLOT_W / 2 + 6
        const x = cx - w / 2
        const y = PIECES_TOP + (74 - h) / 2
        return (
          <g key={p.label}>
            <PieceShape piece={p} x={x} y={y} cell={PIECE_CELL} />
          </g>
        )
      })}

      {/* divider + caption */}
      <line x1={20} y1={104} x2={VIEW_W - 20} y2={104} stroke="#D6CBB8" strokeWidth={1.5} />

      {/* the empty 4×4 target grid with shaded centre */}
      <g transform={`translate(${gridX}, ${gridY})`}>
        <PuzzleGrid23 cell={GRID_CELL} />
      </g>
    </svg>
  )
}

/** Default export: bare problem — four pieces + empty grid with shaded centre. */
export default function P23G2Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Empat keping puzzle di atas (tidak boleh diputar) dan kisi target 4 kali 4 dengan bagian tengah 2 kali 2 diarsir. Susun keping mengisi kisi, lalu tentukan tampilan bagian tengah yang diarsir."
    >
      <P23G2Q25Diagram />
    </div>
  )
}
