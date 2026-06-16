// WMI-24F1A-Q3 (2024 Grade 1 Final) — answer = B, i.e. the true statement "A < B".
//
// "What is true about the lengths of the three black line segments A, B, and C
// below?" Each of A, B, C is one thick black zig-zag polyline drawn on a dotted
// unit grid; its length is the number of unit edges it traverses (a one-cell
// diagonal counts as one diagonal step).
//
// RECOVERED PATHS (measured from the three source scans, grid origin top-left,
// y down — exactly the orientation of the scans). Every path contains ONE
// straight diagonal spanning two cells (Δ2,Δ2); the rest are axis edges:
//
//   A:  (3,0)→(3,1)→(1,1)→(3,3)→(3,4)→(1,4)
//       edges:  1 down · 2 left · diag(2) · 1 down · 2 left   → 6 straight + 2 diag
//   B:  (1,2)→(1,3)→(3,1)→(3,4)→(4,4)→(4,2)
//       edges:  1 down · diag(2) · 3 down · 1 right · 2 up     → 7 straight + 2 diag
//   C:  (1,0)→(1,1)→(3,1)→(1,3)→(3,3)→(3,4)
//       edges:  1 down · 2 right · diag(2) · 2 right · 1 down  → 6 straight + 2 diag
//
// LENGTHS (total unit edges, diagonal cells counted as the shared 2-step run):
//   A = 6 + 2 = 8   B = 7 + 2 = 9   C = 6 + 2 = 8
// All three share the identical 2-cell diagonal, so it cancels in every
// comparison; the order is fixed by the axis-edge counts alone: A = C < B.
//
// Therefore exactly one option is true:
//   A = B  false   ·   A < B  TRUE   ·   A < C  false   ·   B < C  false   ·   B = C  false
//
// The default export draws ONLY the three bare labelled segments on the dotted
// grid — no lengths, no answer. The co-exported Segments24G1 primitive lets the
// animator trace each path and (revealLengths) print its unit count, or dim all
// but the lit segments (lit). By itself it reveals nothing about the comparison.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // the thick black segment (matches the scan)
const DOT = '#D8C9B4' // dotted grid — a muted cream/tan so the ink reads
const LABEL = '#30598A' // brand blue — the A / B / C captions
const LIT = '#f0853a' // brand orange — a traced / highlighted segment
const COUNT = '#30598A' // brand blue — the unit-count badge text

export type SegmentId = 'A' | 'B' | 'C'

/** Recovered polylines in grid units (col, row), y increasing downward. */
export const SEGMENT_PATHS: Readonly<Record<SegmentId, ReadonlyArray<readonly [number, number]>>> = {
  A: [
    [3, 0],
    [3, 1],
    [1, 1],
    [3, 3],
    [3, 4],
    [1, 4],
  ],
  B: [
    [1, 2],
    [1, 3],
    [3, 1],
    [3, 4],
    [4, 4],
    [4, 2],
  ],
  C: [
    [1, 0],
    [1, 1],
    [3, 1],
    [1, 3],
    [3, 3],
    [3, 4],
  ],
}

export const SEGMENT_IDS: readonly SegmentId[] = ['A', 'B', 'C']

/**
 * Total length of a path in unit edges: each axis edge contributes its run; a
 * diagonal (Δx === Δy) contributes that many diagonal steps. A = C = 8, B = 9.
 */
export function pathLength(pts: ReadonlyArray<readonly [number, number]>): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.abs(pts[i][0] - pts[i - 1][0])
    const dy = Math.abs(pts[i][1] - pts[i - 1][1])
    total += dx === 0 || dy === 0 ? dx + dy : dx // diagonal: dx === dy steps
  }
  return total
}

export const SEGMENT_LENGTHS: Readonly<Record<SegmentId, number>> = {
  A: pathLength(SEGMENT_PATHS.A),
  B: pathLength(SEGMENT_PATHS.B),
  C: pathLength(SEGMENT_PATHS.C),
}

// ---- layout ----------------------------------------------------------------
const UNIT = 30 // px per grid unit
const GRID = 4 // 4×4 cells (dots 0..4 on each axis)
const PANEL_PAD = 14 // dotted-grid margin inside each panel
const PANEL_INNER = GRID * UNIT // 120
const PANEL_W = PANEL_INNER + PANEL_PAD * 2 // 148
const LABEL_H = 26 // room for the A / B / C caption under each grid
const PANEL_GAP = 16
const PANEL_H = PANEL_INNER + PANEL_PAD * 2 + LABEL_H

const VIEW_W = PANEL_W * 3 + PANEL_GAP * 2
const VIEW_H = PANEL_H

/** Convert a grid point (col,row) to px within a panel whose top-left is panelX/0. */
function toPx(panelX: number, col: number, row: number): [number, number] {
  return [panelX + PANEL_PAD + col * UNIT, PANEL_PAD + row * UNIT]
}

/** "M x y L x y …" polyline path for a segment in the panel at panelX. */
function polyPath(panelX: number, pts: ReadonlyArray<readonly [number, number]>): string {
  return pts
    .map(([c, r], i) => {
      const [px, py] = toPx(panelX, c, r)
      return `${i === 0 ? 'M' : 'L'}${px} ${py}`
    })
    .join(' ')
}

export interface Segments24G1Props {
  /** Print each segment's unit-count badge (A=8, B=9, C=8). Off by default. */
  revealLengths?: boolean
  /**
   * Draw the listed segments in brand orange (traced/lit) and dim the rest.
   * Empty/undefined → all three drawn in plain black, nothing emphasised.
   */
  lit?: ReadonlyArray<SegmentId>
}

/**
 * The three labelled segments on a dotted grid. With no props it renders the
 * bare problem figure (plain black, no counts). The animator passes `lit` to
 * trace a path and `revealLengths` to surface its unit count post-answer.
 */
export function Segments24G1({ revealLengths = false, lit }: Segments24G1Props = {}) {
  const litSet = new Set<SegmentId>(lit ?? [])
  const emphasising = litSet.size > 0

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(300, VIEW_W)} aria-hidden="true">
      {SEGMENT_IDS.map((id, idx) => {
        const panelX = idx * (PANEL_W + PANEL_GAP)
        const isLit = litSet.has(id)
        const dimmed = emphasising && !isLit
        const strokeColor = isLit ? LIT : INK
        const strokeOpacity = dimmed ? 0.28 : 1

        return (
          <g key={id}>
            {/* dotted unit grid (dots at every lattice point of the 4×4 grid) */}
            {Array.from({ length: GRID + 1 }, (_, r) =>
              Array.from({ length: GRID + 1 }, (_, c) => {
                const [px, py] = toPx(panelX, c, r)
                return <circle key={`${r}-${c}`} cx={px} cy={py} r={1.6} fill={DOT} />
              }),
            )}

            {/* the recovered segment polyline */}
            <path
              d={polyPath(panelX, SEGMENT_PATHS[id])}
              fill="none"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* caption A / B / C under the grid */}
            <text
              x={panelX + PANEL_W / 2}
              y={PANEL_INNER + PANEL_PAD * 2 + 18}
              textAnchor="middle"
              fontSize="18"
              fontWeight="bold"
              fill={LABEL}
            >
              {id}
            </text>

            {/* unit-count badge (post-answer only) */}
            {revealLengths && (
              <g>
                <rect
                  x={panelX + PANEL_W / 2 + 12}
                  y={PANEL_INNER + PANEL_PAD * 2 + 4}
                  width={34}
                  height={20}
                  rx={10}
                  fill="#FFF2DF"
                  stroke={COUNT}
                  strokeWidth={1.5}
                />
                <text
                  x={panelX + PANEL_W / 2 + 29}
                  y={PANEL_INNER + PANEL_PAD * 2 + 18}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={COUNT}
                >
                  {SEGMENT_LENGTHS[id]}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export: the three bare labelled segments — no lengths, no answer. */
export default function Segments24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga ruas garis hitam tebal berlabel A, B, dan C, masing-masing digambar berliku-liku pada kisi titik-titik. Tentukan pernyataan yang benar tentang perbandingan panjang ketiga ruas garis tersebut."
    >
      <Segments24G1 />
    </div>
  )
}
