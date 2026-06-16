/**
 * WMI-19P1A-Q6 — "How many MORE of the small triangle are needed to fill the
 * empty space?" (2019 Grade 1 Semifinal, Paper A, answer B = 7).
 *
 * Reconstructed from db/seed/wmi/figures/2019-semifinal-g1-a-q6.jpg.
 *
 * The puzzle figure is a tangram-style outline tiled by ONE repeating tile: a
 * small right-isosceles triangle = half of a unit grid cell, split by a
 * diagonal. Some tiles are already drawn in grey; the rest of the outline is
 * empty white space. Counting carefully, exactly SEVEN more small triangles are
 * needed to fill the white part — that is the answer (never drawn in the static
 * figure).
 *
 * Grid model
 * ----------
 * Columns c = 0..3, rows r = 0..3 (cell size 1, y grows downward). Each cell is
 * split by the main diagonal '\' (top-left → bottom-right) into two half-cell
 * triangles:
 *
 *        'tr' = upper-right half  (corners TL, TR, BR)
 *        'bl' = lower-left half   (corners TL, BL, BR)
 *
 * (The 'tl' / 'br' halves of the OTHER diagonal exist too and are used by the
 * outline maths, but every drawn tile here is a 'tr' or 'bl' half, so all tiles
 * are congruent.) GREY_TILES are the placed (grey) ones; EMPTY_TILES are the
 * white ones that still need filling — EMPTY_TILES.length === 7.
 *
 * The silhouette is a single simple polygon (verified: no pinch points), and the
 * empty region is one connected blob (verified), so the static figure can draw
 * the empty area as one flat white shape with no inner tile lines — the answer
 * stays hidden.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe.
 */

// ── geometry ─────────────────────────────────────────────────────────────────
const CELL = 44 // px per grid cell
const COLS = 3 // occupied columns 0..2
const ROWS = 4 // occupied rows 0..3
const PAD = 20 // viewBox breathing room so strokes never clip
export const TF_VIEW_W = COLS * CELL + PAD * 2 // 172
export const TF_VIEW_H = ROWS * CELL + PAD * 2 // 216

// ── colour tokens ────────────────────────────────────────────────────────────
const GREY_FILL = '#9CA3AF' // placed tiles (matches the scanned grey)
const GREY_STROKE = '#1F2937'
const INK = '#1F2937' // figure outline ink
const EMPTY_FILL = '#FFFFFF'
const REVEAL_FILL = '#8FD6A8' // green used when the explainer fills a tile
const REVEAL_STROKE = '#3E7A4E'
const ACTIVE_RING = '#D97706'

export type Half = 'tl' | 'br' | 'tr' | 'bl'

/** A single half-cell tile: column c, row r, and which half. */
export interface Tile {
  c: number
  r: number
  h: Half
}

const tile = (c: number, r: number, h: Half): Tile => ({ c, r, h })

/** Corner points of cell (c, r) in viewBox px. */
function corners(c: number, r: number) {
  const x = PAD + c * CELL
  const y = PAD + r * CELL
  return {
    TL: [x, y] as [number, number],
    TR: [x + CELL, y] as [number, number],
    BR: [x + CELL, y + CELL] as [number, number],
    BL: [x, y + CELL] as [number, number],
  }
}

/** The three vertices of a half-cell tile, in px. */
export function tilePoints({ c, r, h }: Tile): [number, number][] {
  const k = corners(c, r)
  switch (h) {
    case 'tl':
      return [k.TL, k.TR, k.BL]
    case 'br':
      return [k.TR, k.BR, k.BL]
    case 'tr':
      return [k.TL, k.TR, k.BR]
    case 'bl':
      return [k.TL, k.BL, k.BR]
  }
}

export function pointsStr(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ')
}

/** Centroid of a tile (handy for placing per-tile counters in the explainer). */
export function tileCentroid(t: Tile): [number, number] {
  const pts = tilePoints(t)
  return [
    (pts[0][0] + pts[1][0] + pts[2][0]) / 3,
    (pts[0][1] + pts[1][1] + pts[2][1]) / 3,
  ]
}

export const sameTile = (a: Tile, b: Tile) => a.c === b.c && a.r === b.r && a.h === b.h

// ── the figure (geometry verified offline) ───────────────────────────────────
// GREY: the 9 tiles already placed in the problem figure — the peak block on
// top, the right tab, and the two bottom corners, plus a grey edge on the upper
// left. Together with the empty tiles they tile one clean silhouette.
export const GREY_TILES: Tile[] = [
  tile(1, 0, 'tr'), // peak block, upper-right
  tile(1, 0, 'bl'), // peak block, lower-left
  tile(0, 1, 'tr'), // upper-left grey edge
  tile(2, 1, 'tr'), // right tab, upper
  tile(2, 1, 'bl'), // right tab, lower
  tile(0, 3, 'tr'), // bottom-left corner, upper
  tile(0, 3, 'bl'), // bottom-left corner, lower
  tile(1, 3, 'tr'), // bottom-right corner, upper
  tile(1, 3, 'bl'), // bottom-right corner, lower
]

// EMPTY: the 7 white tiles still to be filled — one connected region forming the
// blank middle of the figure. EMPTY_TILES.length === 7 is the answer.
export const EMPTY_TILES: Tile[] = [
  tile(0, 1, 'bl'), // upper-left of the gap
  tile(1, 1, 'tr'), // gap, upper-right
  tile(1, 1, 'bl'), // gap, centre
  tile(0, 2, 'tr'), // gap, left-upper
  tile(0, 2, 'bl'), // gap, left-lower
  tile(1, 2, 'tr'), // gap, right-upper
  tile(1, 2, 'bl'), // gap, right-lower
]

export const EMPTY_COUNT = EMPTY_TILES.length // 7 — the answer

// Outline of the whole figure (grey ∪ empty), traced clockwise (computed offline
// from the tile set, collinear points removed). Drawing this thick over the
// tiles gives a clean tangram silhouette without leaking inner tile lines.
export const OUTLINE: [number, number][] = [
  corners(0, 0).TR,
  corners(1, 0).TR,
  corners(1, 0).BR,
  corners(2, 0).BR,
  corners(2, 1).BR,
  corners(1, 1).BR,
  corners(1, 3).BR,
  corners(0, 3).BL,
  corners(0, 0).BL,
  corners(0, 0).BR,
]

export interface TriangleFillFigureProps {
  /** Empty tiles to reveal as filled (used by the explainer, beat by beat). */
  filledEmpty?: Tile[]
  /** Highlight one tile with an amber active ring (the tile being placed now). */
  active?: Tile | null
  /** Fill colour for revealed tiles. */
  fillColor?: string
}

/**
 * Pure SVG of the puzzle. By default draws ONLY the problem: the grey placed
 * tiles plus a single flat white region (no inner lines → the answer count is
 * not given away). The explainer passes `filledEmpty` to reveal the answer tiles
 * one at a time.
 */
export function TriangleFillFigure({
  filledEmpty = [],
  active = null,
  fillColor = REVEAL_FILL,
}: TriangleFillFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${TF_VIEW_W} ${TF_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 220 }}
      aria-hidden="true"
    >
      {/* Whole silhouette as one flat white area first — this becomes the empty
          region wherever a grey tile is not drawn on top. */}
      <polygon points={pointsStr(OUTLINE)} fill={EMPTY_FILL} stroke="none" />

      {/* Grey placed tiles. */}
      {GREY_TILES.map((t, i) => (
        <polygon
          key={`g${i}`}
          points={pointsStr(tilePoints(t))}
          fill={GREY_FILL}
          stroke={GREY_STROKE}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}

      {/* Revealed empty tiles (explainer only). */}
      {filledEmpty.map((t, i) => (
        <polygon
          key={`f${i}`}
          points={pointsStr(tilePoints(t))}
          fill={fillColor}
          stroke={REVEAL_STROKE}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}

      {/* Active ring on the tile being placed this beat. */}
      {active && (
        <polygon
          points={pointsStr(tilePoints(active))}
          fill="none"
          stroke={ACTIVE_RING}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
      )}

      {/* Thick figure outline drawn last so it crowns everything cleanly. */}
      <polygon
        points={pointsStr(OUTLINE)}
        fill="none"
        stroke={INK}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function TriangleFill19P1Illustration() {
  return (
    <div
      className="my-4 flex justify-center rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A tangram-style figure outlined in black. Several small grey triangles are already placed — a peak block on top, a tab on the right, and the two bottom corners. A white space in the middle is still empty and must be filled with more of the same small triangle."
    >
      <TriangleFillFigure />
    </div>
  )
}
