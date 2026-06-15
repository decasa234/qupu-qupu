// Grid-area figure for WMI-25P3A-Q4 (2025 Grade-3 Semifinal).
//
// "The sides of each small square are 1 cm, as shown. Find the area of the
//  shaded region in cm²."  Answer: B = 3.
//
// Reading db/seed/wmi/figures/2025-semifinal-g3-a-q4.jpg: a 3x3 grid of unit
// squares with a tilted parallelogram shaded pink. Its long axis runs along the
// main diagonal; the four corners sit on grid lattice points:
//   (0,0) bottom-left  →  (2,1)  →  (3,3) top-right  →  (1,2)  →  back.
// (Coordinates use (0,0) at the bottom-left, (3,3) at the top-right.)
//
// Shoelace area of (0,0),(2,1),(3,3),(1,2) = 3 cm², which is exactly half of the
// 2x3 = 6 bounding block — the trap answer.
//
// The static figure draws ONLY the problem (grid + shaded shape). It never
// states the area. The co-exported GridArea primitive lets the explainer split
// the parallelogram into two countable triangles and tally the area.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#1F2937' // grid lines
const SHADE = '#F8D7DA' // pink fill (matches the scan)
const SHADE_EDGE = '#C0697A' // parallelogram outline
const SPLIT = '#2C7BE5' // explainer-only split line / tally accent

export const GRID_N = 3 // 3x3 unit squares
const CELL = 56 // px per 1 cm cell
const PAD = 26 // viewBox padding (headroom so strokes never clip)
export const Q4_VIEW = GRID_N * CELL + PAD * 2

// Parallelogram corners in grid units (x right, y UP). Drawn flipped to SVG y.
const POLY: Array<[number, number]> = [
  [0, 0],
  [2, 1],
  [3, 3],
  [1, 2],
]

// The two triangles the parallelogram splits into across its long diagonal.
const TRI_A: Array<[number, number]> = [
  [0, 0],
  [2, 1],
  [3, 3],
]
const TRI_B: Array<[number, number]> = [
  [0, 0],
  [3, 3],
  [1, 2],
]

/** Grid-unit (x,y with y up) → SVG pixel coordinate. */
function px(gx: number, gy: number): [number, number] {
  return [PAD + gx * CELL, PAD + (GRID_N - gy) * CELL]
}

function pointsAttr(pts: Array<[number, number]>): string {
  return pts.map(([gx, gy]) => px(gx, gy).join(',')).join(' ')
}

export interface GridAreaProps {
  /** Show the dividing diagonal that splits the shape into two triangles. */
  showSplit?: boolean
  /** Which triangle halves are highlighted: 0 = none, 1 = first, 2 = both. */
  litTriangles?: 0 | 1 | 2
  /** Show the "= N cm²" area tally per highlighted triangle (1 + ... ). */
  showTally?: boolean
}

export function GridArea({ showSplit = false, litTriangles = 0, showTally = false }: GridAreaProps) {
  // grid lines
  const lines: React.ReactNode[] = []
  for (let i = 0; i <= GRID_N; i++) {
    const [x0, y0] = px(0, i)
    const [x1, y1] = px(GRID_N, i)
    lines.push(<line key={`h${i}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={2} />)
    const [vx0, vy0] = px(i, 0)
    const [vx1, vy1] = px(i, GRID_N)
    lines.push(<line key={`v${i}`} x1={vx0} y1={vy0} x2={vx1} y2={vy1} stroke={INK} strokeWidth={2} />)
  }

  const litA = litTriangles >= 1
  const litB = litTriangles >= 2

  // mid-points of the two triangle centroids for the tally badge
  const centroid = (tri: Array<[number, number]>): [number, number] => {
    const sx = tri.reduce((a, [gx]) => a + gx, 0) / 3
    const sy = tri.reduce((a, [, gy]) => a + gy, 0) / 3
    return px(sx, sy)
  }

  return (
    <svg
      viewBox={`0 0 ${Q4_VIEW} ${Q4_VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* shaded parallelogram (base figure) */}
      {litTriangles === 0 ? (
        <polygon points={pointsAttr(POLY)} fill={SHADE} stroke={SHADE_EDGE} strokeWidth={2.5} strokeLinejoin="round" />
      ) : (
        <>
          <polygon
            points={pointsAttr(TRI_A)}
            fill={litA ? '#F4B6C2' : SHADE}
            stroke={SHADE_EDGE}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <polygon
            points={pointsAttr(TRI_B)}
            fill={litB ? '#F4B6C2' : SHADE}
            stroke={SHADE_EDGE}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </>
      )}

      {/* grid on top so cell lines stay crisp over the shading */}
      {lines}

      {/* dividing diagonal */}
      {showSplit && (
        <line
          {...(() => {
            const [x0, y0] = px(0, 0)
            const [x1, y1] = px(3, 3)
            return { x1: x0, y1: y0, x2: x1, y2: y1 }
          })()}
          stroke={SPLIT}
          strokeWidth={2.5}
          strokeDasharray="6 4"
        />
      )}

      {/* per-triangle area tally */}
      {showTally &&
        ([
          [TRI_A, litA, 'A'],
          [TRI_B, litB, 'B'],
        ] as Array<[Array<[number, number]>, boolean, string]>)
          .filter(([, lit]) => lit)
          .map(([tri, , key]) => {
            const [cx, cy] = centroid(tri)
            return (
              <g key={key}>
                <circle cx={cx} cy={cy} r={13} fill="#FFFFFF" stroke={SPLIT} strokeWidth={2} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={SPLIT}>
                  1½
                </text>
              </g>
            )
          })}
    </svg>
  )
}

const ARIA =
  'Kisi 3 kali 3 persegi satuan, masing-masing bersisi 1 cm. ' +
  'Sebuah jajar genjang miring diarsir merah muda, dengan sudut-sudutnya ' +
  'di titik kisi sepanjang diagonal utama. Tentukan luas daerah yang diarsir.'

export default function P25G3Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={ARIA}
    >
      <GridArea />
    </div>
  )
}
