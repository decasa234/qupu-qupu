// Cube-net "largest corner sum" figure for WMI-22P2A-Q11 (2022 Semifinal Grade 2).
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g2-a-q11.jpg: a 6-square net laid
// out as a vertical column of three squares (3 / 5 / 4, top→bottom) with a horizontal
// arm of three more squares (8, 3, 9) extending RIGHT from the middle square (5):
//
//     [3]
//     [5][8][3][9]
//     [4]
//
// Question: fold into a cube; find the largest sum of three faces meeting at one
// vertex. Folding (verified by a cube-roll solver) gives opposite pairs
//   5 ↔ 3,  4 ↔ 3,  9 ↔ 8.
// A vertex picks one face from each opposite pair, so the max corner sum is
//   max{5,3} + max{4,3} + max{9,8} = 5 + 4 + 9 = 18  → answer C.
//
// The static figure draws ONLY the labelled net (the problem). It never marks
// opposite pairs and never reveals 18 — that is the explainer's job via the
// co-exported NetGrid22G2 primitive.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#374151'
const TILE = '#D6E9DB' // pale green, matching the source scan
const TILE_DIM = '#EEF4EF'

// Net cells as (col, row) → face value. Middle row is row 1.
export interface NetCell {
  col: number
  row: number
  value: number
  /** A stable id (0..5) so the explainer can talk about specific faces. */
  id: number
}

export const NET_CELLS: NetCell[] = [
  { id: 0, col: 0, row: 0, value: 3 },
  { id: 1, col: 0, row: 1, value: 5 },
  { id: 2, col: 1, row: 1, value: 8 },
  { id: 3, col: 2, row: 1, value: 3 },
  { id: 4, col: 3, row: 1, value: 9 },
  { id: 5, col: 0, row: 2, value: 4 },
]

// Verified opposite pairs by NET-CELL id (from a cube-roll fold solver). A cube
// vertex picks exactly one face from each opposite pair, so the largest corner
// sum keeps the bigger face of each pair: max{5,3} + max{4,3} + max{9,8} = 18.
//   id1 (5) ↔ id3 (3)
//   id5 (4) ↔ id0 (3)
//   id4 (9) ↔ id2 (8)
export const OPPOSITE_PAIRS: Array<[number, number]> = [
  [1, 3], // 5 ↔ 3
  [5, 0], // 4 ↔ 3
  [4, 2], // 9 ↔ 8
]

const CELL = 64
const PAD = 14
const COLS = 4
const ROWS = 3

export const NET_VIEW_W = COLS * CELL + PAD * 2 // 284
export const NET_VIEW_H = ROWS * CELL + PAD * 2 // 220

export interface NetGrid22G2Props {
  /** Cell ids to spotlight (everything else dims). Empty = show all at full strength. */
  highlight?: number[]
}

/** The labelled cube net. Reusable by the explainer. */
export function NetGrid22G2({ highlight = [] }: NetGrid22G2Props) {
  const dimming = highlight.length > 0
  return (
    <svg
      viewBox={`0 0 ${NET_VIEW_W} ${NET_VIEW_H}`}
      width="100%"
      style={{ maxWidth: NET_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {NET_CELLS.map((cell) => {
        const x = PAD + cell.col * CELL
        const y = PAD + cell.row * CELL
        const on = !dimming || highlight.includes(cell.id)
        return (
          <g key={cell.id} opacity={on ? 1 : 0.32}>
            <rect x={x} y={y} width={CELL} height={CELL} fill={on ? TILE : TILE_DIM} stroke={INK} strokeWidth={2.4} />
            <text
              x={x + CELL / 2}
              y={y + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={30}
              fontWeight={800}
              fill={on ? '#1F2937' : '#9CA3AF'}
            >
              {cell.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const ARIA =
  'Jaring-jaring kubus: kolom tiga kotak (3, 5, 4 dari atas ke bawah) dengan lengan tiga kotak (8, 3, 9) ke kanan dari kotak tengah. ' +
  'Lipat menjadi kubus; cari jumlah terbesar dari tiga sisi yang bertemu di satu titik sudut.'

export default function P22G2Q11Illustration() {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={ARIA}>
      <NetGrid22G2 />
    </div>
  )
}
