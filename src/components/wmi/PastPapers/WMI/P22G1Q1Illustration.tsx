// In-card figure for WMI-22P1A-Q1 (2022 Grade 1 Semifinal, Paper A).
//
// Stem: "How many of the figures below are formed from 8 triangular tiles?"
// Redrawn from db/seed/wmi/figures/2022-semifinal-g1-a-q1.jpg — six tangram-style
// pictures built from identical right-isosceles triangle tiles (each = half of a
// unit square along a diagonal). Counting the tiles in each picture (verified by
// a connected-component count of the green regions in the scan — 48 tiles total):
//   1 fish   = 7   2 table = 8 ✓   3 tree   = 10
//   4 anchor = 7   5 boat  = 8 ✓   6 person = 8 ✓
// Exactly 3 pictures use 8 tiles → answer C. The static figure shows ONLY the
// six shapes (never the per-figure count or the answer).
//
// SSR-safe + deterministic: no window/document at module top, no Math.random/Date.

const FILL = '#D9E589' // olive-green tile, matching the scan
const INK = '#1F2937'

const U = 26 // unit length (one tile leg) in svg units

/** The six pictures, each as a list of triangle tiles. A tile is three [x,y]
 *  points in unit-grid coordinates (multiplied by U at draw time). Every tile
 *  is one half of a unit square, so all tiles are congruent. */
export interface Tri {
  pts: Array<[number, number]>
}
export interface FigureSpec {
  /** Unique key + human label. */
  key: string
  labelEn: string
  labelId: string
  /** Triangle tiles in unit-grid coords. */
  tiles: Tri[]
  /** Bounding box in unit-grid coords for centering: [minX, minY, maxX, maxY]. */
  box: [number, number, number, number]
}

// Helper: a unit square at (c,r) split by a diagonal into two tiles.
// dir 'main' = top-left↘bottom-right diagonal; 'anti' = top-right↙bottom-left.
function squareSplit(c: number, r: number, dir: 'main' | 'anti'): Tri[] {
  const tl: [number, number] = [c, r]
  const tr: [number, number] = [c + 1, r]
  const br: [number, number] = [c + 1, r + 1]
  const bl: [number, number] = [c, r + 1]
  return dir === 'main'
    ? [{ pts: [tl, tr, br] }, { pts: [tl, br, bl] }]
    : [{ pts: [tl, tr, bl] }, { pts: [tr, br, bl] }]
}

// Helper: a unit square split by BOTH diagonals into 4 tiles (an "X").
function squareX(c: number, r: number): Tri[] {
  const tl: [number, number] = [c, r]
  const tr: [number, number] = [c + 1, r]
  const br: [number, number] = [c + 1, r + 1]
  const bl: [number, number] = [c, r + 1]
  const m: [number, number] = [c + 0.5, r + 0.5]
  return [
    { pts: [tl, tr, m] },
    { pts: [tr, br, m] },
    { pts: [br, bl, m] },
    { pts: [bl, tl, m] },
  ]
}

// --- 1: fish — central X-square (4) + dorsal fin + nose + tail = 7 tiles ---
const FISH: Tri[] = [
  ...squareX(1, 1),
  { pts: [[1, 0], [2, 1], [1, 1]] }, // dorsal fin (above the square)
  { pts: [[0, 1.5], [1, 1], [1, 2]] }, // nose (left point)
  { pts: [[2, 1], [2, 2], [3, 1.5]] }, // tail (right point)
]

// --- 2: table — three diagonal-split squares (6) + a split big triangle (2) = 8 ---
const TABLE: Tri[] = [
  ...squareSplit(0, 0, 'main'),
  ...squareSplit(1, 0, 'main'),
  ...squareSplit(2, 0, 'main'),
  { pts: [[0.5, 2], [1.5, 1], [1.5, 2]] }, // base leg (left)
  { pts: [[1.5, 1], [2.5, 2], [1.5, 2]] }, // base leg (right)
]

// --- 3: tree — apex + 2 tiles per slope (4) + central 2x2 X-square (4) + trunk = 10 ---
const TREE: Tri[] = [
  { pts: [[3, 0], [2, 1], [4, 1]] }, // apex triangle
  { pts: [[2, 1], [2, 3], [1, 2]] }, // left slope, upper tile
  { pts: [[1, 2], [2, 3], [0, 3]] }, // left slope, lower tile
  { pts: [[4, 1], [4, 3], [5, 2]] }, // right slope, upper tile
  { pts: [[5, 2], [4, 3], [6, 3]] }, // right slope, lower tile
  // central 2x2 square split by BOTH diagonals into 4 tiles
  { pts: [[2, 1], [4, 1], [3, 2]] },
  { pts: [[4, 1], [4, 3], [3, 2]] },
  { pts: [[4, 3], [2, 3], [3, 2]] },
  { pts: [[2, 3], [2, 1], [3, 2]] },
  { pts: [[3, 3.15], [3.8, 4.15], [2.2, 4.15]] }, // trunk (up-pointing, under the base)
]

// --- 4: anchor — top inverted tri + central X-square (4) + two wings = 7 ---
const ANCHOR: Tri[] = [
  { pts: [[1, 0], [3, 0], [2, 1]] }, // top inverted triangle
  ...squareX(1.5, 1),
  { pts: [[0, 1.5], [1, 1.5], [1, 2.5]] }, // left wing
  { pts: [[2.5, 1.5], [3.5, 1.5], [2.5, 2.5]] }, // right wing
]

// --- 5: boat — sail (2) + hull (6) = 8 tiles ---
const BOAT: Tri[] = [
  { pts: [[2, 0], [2, 1], [3, 1]] }, // sail top
  { pts: [[2, 1], [3, 1], [2, 2]] }, // sail bottom
  { pts: [[0, 2.5], [1, 2], [1, 3]] }, // left bow
  ...squareSplit(1, 2, 'anti'), // hull (2)
  ...squareSplit(2, 2, 'main'), // hull (2)
  { pts: [[3, 2], [4, 2.5], [3, 3]] }, // right bow
]

// --- 6: person — head (2) + body (2) + 2 arms + 2 legs = 8 tiles ---
const PERSON: Tri[] = [
  // head: a diamond (rotated square) split by a horizontal line into two tiles
  { pts: [[2, 0], [2.7, 0.7], [1.3, 0.7]] }, // head upper
  { pts: [[1.3, 0.7], [2.7, 0.7], [2, 1.4]] }, // head lower
  // body: unit square split by one diagonal
  ...squareSplit(1.5, 1.6, 'main'),
  // arms (point out to the sides)
  { pts: [[0.6, 1.7], [1.5, 1.9], [1.0, 2.6]] }, // left arm
  { pts: [[2.5, 1.9], [3.4, 1.7], [3.0, 2.6]] }, // right arm
  // legs
  { pts: [[1.4, 2.6], [2.0, 2.6], [1.4, 3.5]] }, // left leg
  { pts: [[2.0, 2.6], [2.6, 2.6], [2.6, 3.5]] }, // right leg
]

export const FIGURES: FigureSpec[] = [
  { key: 'fish', labelEn: 'Fish', labelId: 'Ikan', tiles: FISH, box: bounds(FISH) },
  { key: 'table', labelEn: 'Table', labelId: 'Meja', tiles: TABLE, box: bounds(TABLE) },
  { key: 'tree', labelEn: 'Tree', labelId: 'Pohon', tiles: TREE, box: bounds(TREE) },
  { key: 'anchor', labelEn: 'Anchor', labelId: 'Jangkar', tiles: ANCHOR, box: bounds(ANCHOR) },
  { key: 'boat', labelEn: 'Boat', labelId: 'Perahu', tiles: BOAT, box: bounds(BOAT) },
  { key: 'person', labelEn: 'Person', labelId: 'Orang', tiles: PERSON, box: bounds(PERSON) },
]

/** Verified tile counts per figure (1-indexed by FIGURES order). */
export const TILE_COUNTS = [7, 8, 10, 7, 8, 8] as const
export const TARGET_TILES = 8
export const MATCH_COUNT = TILE_COUNTS.filter((n) => n === TARGET_TILES).length // 3

function bounds(tiles: Tri[]): [number, number, number, number] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const t of tiles)
    for (const [x, y] of t.pts) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  return [minX, minY, maxX, maxY]
}

/** One picture, centred in a fixed cell, optionally with a highlight tint and a
 *  count badge (used by the explainer; never by the static figure). */
export function TilePicture({
  fig,
  cellW,
  cellH,
  highlight = false,
  countedTiles = 0,
  badge,
}: {
  fig: FigureSpec
  cellW: number
  cellH: number
  highlight?: boolean
  /** How many of this figure's tiles to render as "counted" (filled darker). */
  countedTiles?: number
  /** Optional number badge under the picture. */
  badge?: number
}) {
  const [minX, minY, maxX, maxY] = fig.box
  const wU = maxX - minX
  const hU = maxY - minY
  const pad = 0.5
  const scale = Math.min((cellW - 2 * pad * U) / (wU * U), (cellH - 26 - 2 * pad * U) / (hU * U))
  const drawW = wU * U * scale
  const drawH = hU * U * scale
  const ox = (cellW - drawW) / 2 - minX * U * scale
  const oy = pad * U + (cellH - 26 - 2 * pad * U - drawH) / 2 - minY * U * scale
  const P = (p: [number, number]) => `${ox + p[0] * U * scale},${oy + p[1] * U * scale}`
  return (
    <g>
      {highlight && (
        <rect x={2} y={2} width={cellW - 4} height={cellH - 4} rx={8} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2.5} />
      )}
      {fig.tiles.map((t, i) => (
        <polygon
          key={i}
          points={t.pts.map(P).join(' ')}
          fill={i < countedTiles ? '#A7C400' : FILL}
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}
      {badge != null && (
        <g>
          <circle cx={cellW / 2} cy={cellH - 13} r={12} fill="white" stroke={INK} strokeWidth={1.8} />
          <text x={cellW / 2} y={cellH - 13} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK} className="font-display">
            {badge}
          </text>
        </g>
      )}
    </g>
  )
}

export const Q1_VIEW_W = 480
export const Q1_VIEW_H = 320
const COLS = 3
const ROWS = 2
const CELL_W = Q1_VIEW_W / COLS
const CELL_H = Q1_VIEW_H / ROWS

export interface Q1DiagramProps {
  /** Index (0..5) of the figure currently being inspected, or -1 for none. */
  activeFigure?: number
  /** For the active figure, how many of its tiles to show as counted. */
  countedTiles?: number
  /** Indices of figures to mark with their tile-count badge. */
  badged?: number[]
}

export function Q1Diagram({ activeFigure = -1, countedTiles = 0, badged = [] }: Q1DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q1_VIEW_W} ${Q1_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q1_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {FIGURES.map((fig, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        return (
          <g key={fig.key} transform={`translate(${col * CELL_W} ${row * CELL_H})`}>
            <TilePicture
              fig={fig}
              cellW={CELL_W}
              cellH={CELL_H}
              highlight={i === activeFigure}
              countedTiles={i === activeFigure ? countedTiles : 0}
              badge={badged.includes(i) ? TILE_COUNTS[i] : undefined}
            />
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Six pictures made from identical triangular tiles: a fish, a table, a tree, an anchor, a boat and a person."
    >
      <Q1Diagram />
    </div>
  )
}
