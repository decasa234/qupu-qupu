// WMI-20P2A-Q6 (2020 Grade 2 Semifinal) — "Which solid below can be formed with
// the pieces shown on the right?"  Answer: B.
//
// READING THE SCAN (2020-semifinal-g2-a-q6.jpg): the "pieces shown on the right"
// are THREE PAIRS of rectangular cards, each pair drawn as two identical
// rectangles stacked with a slight offset (so you can see there are two of each):
//   - a LONG, SHORT pair   (top)            — the long/short faces
//   - a SMALL, NARROW pair (lower-left)      — the short/short end faces
//   - a LARGE, WIDE pair   (lower-right)     — the long/wide base faces
// Three matched pairs of rectangles are exactly the 6 faces of a rectangular box
// (a cuboid): opposite faces of a box are congruent, so they come in 3 pairs.
//
// The four answer options A–D were images in the original paper (the seed stores
// them as "(see figure …)" placeholders). The correct one, B, is the cuboid that
// uses all three pairs; the distractors are solids that cannot be tiled by these
// three pairs (e.g. a cube — which needs 3 pairs of EQUAL squares, or a solid
// needing a triangular / extra face).
//
// The static figure draws ONLY the three pairs of loose pieces, exactly as
// scanned — it never shows the assembled box or names the answer. Assembling the
// cuboid and pointing to option B is the animator's job, via the co-exported
// Cuboid20 + PiecePair20 primitives.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const CARD = '#FFFFFF'

// The three face pairs, by their drawn width x height (in svg px). These also
// describe the box: the long/short pair are the front+back, the small pair the
// two ends, the wide pair the top+bottom.
export const PIECE_PAIRS = [
  { id: 'long', w: 150, h: 34, label: 'long' }, // top pair
  { id: 'end', w: 30, h: 70, label: 'end' }, // lower-left pair
  { id: 'wide', w: 150, h: 78, label: 'wide' }, // lower-right pair
] as const

export type PiecePairId = (typeof PIECE_PAIRS)[number]['id']

/**
 * One PAIR of identical rectangles, drawn as a back card offset up-right behind a
 * front card — the scan's way of showing "there are two of these".
 */
export function PiecePair20({
  x,
  y,
  w,
  h,
  highlight = false,
}: {
  x: number
  y: number
  w: number
  h: number
  highlight?: boolean
}) {
  const off = 8 // offset between the two cards
  const stroke = highlight ? '#f0853a' : INK
  const fill = highlight ? '#FFF4E8' : CARD
  return (
    <g>
      {/* back card */}
      <rect x={x + off} y={y - off} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={2.5} />
      {/* front card */}
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={2.5} />
    </g>
  )
}

const VIEW_W = 340
const VIEW_H = 230

export interface Pieces20Props {
  /** Optionally highlight one pair by id (animator beat); undefined = none. */
  highlightId?: PiecePairId
}

/** The three loose face-pairs laid out as in the scan. */
export function Pieces20({ highlightId }: Pieces20Props = {}) {
  // layout positions (top pair, lower-left pair, lower-right pair)
  const layout: Record<PiecePairId, { x: number; y: number; w: number; h: number }> = {
    long: { x: 90, y: 18, w: 150, h: 34 },
    end: { x: 18, y: 96, w: 30, h: 70 },
    wide: { x: 110, y: 96, w: 150, h: 78 },
  }
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {PIECE_PAIRS.map((p) => {
        const L = layout[p.id]
        return <PiecePair20 key={p.id} x={L.x} y={L.y} w={L.w} h={L.h} highlight={highlightId === p.id} />
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Cuboid20 — the assembled rectangular box, drawn in a simple cabinet
// projection. Used ONLY by the explainer (never the static figure). Faces can be
// individually highlighted to show "this pair becomes these two faces".
// ---------------------------------------------------------------------------

export interface Cuboid20Props {
  /** Which face pair to light up: 'front' (long), 'end', 'top' (wide), or none. */
  litPair?: 'long' | 'end' | 'wide' | 'none'
  width?: number
}

export function Cuboid20({ litPair = 'none', width = 200 }: Cuboid20Props = {}) {
  // box footprint in the 2D drawing
  const x = 30
  const y = 70
  const w = 150 // front width
  const h = 60 // front height
  const dx = 40 // depth offset x
  const dy = -34 // depth offset y (up)

  const FRONT = litPair === 'long' ? '#FAD9B8' : '#DBEAFE'
  const TOP = litPair === 'wide' ? '#FAD9B8' : '#BFDBFE'
  const SIDE = litPair === 'end' ? '#FAD9B8' : '#93C5FD'

  const frontStroke = litPair === 'long' ? '#f0853a' : INK
  const topStroke = litPair === 'wide' ? '#f0853a' : INK
  const sideStroke = litPair === 'end' ? '#f0853a' : INK

  return (
    <svg viewBox="0 0 230 150" width={Math.min(width, 230)} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* top face (wide pair) */}
      <polygon
        points={`${x},${y} ${x + dx},${y + dy} ${x + w + dx},${y + dy} ${x + w},${y}`}
        fill={TOP}
        stroke={topStroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* right side face (end pair) */}
      <polygon
        points={`${x + w},${y} ${x + w + dx},${y + dy} ${x + w + dx},${y + dy + h} ${x + w},${y + h}`}
        fill={SIDE}
        stroke={sideStroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* front face (long pair) */}
      <rect x={x} y={y} width={w} height={h} fill={FRONT} stroke={frontStroke} strokeWidth={2.5} />
    </svg>
  )
}

/** Default export: ONLY the three loose face-pairs, no answer revealed. */
export default function P20G2Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tiga pasang persegi panjang sebagai potongan: sepasang panjang-tipis di atas, sepasang kecil-sempit di kiri bawah, dan sepasang besar-lebar di kanan bawah. Bangun ruang manakah yang dapat dibentuk dari potongan-potongan ini?"
    >
      <Pieces20 />
    </div>
  )
}
