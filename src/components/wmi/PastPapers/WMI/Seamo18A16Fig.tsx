// Seamo18A16Fig — SEAMO 2018 Paper A Q16
// "How many triangles are there in the figure below?"
//
// Source figure (2018.imgs/024.jpg): a large right-angled triangle with the
// apex at the LEFT and the base (vertical edge) on the RIGHT.
// Three interior lines radiate from the apex to evenly-spaced points on the
// base, dividing the big triangle into 4 equal "fan" sub-triangles.
//
// Triangle count (all sizes):
//   Size-1 (single sector)          : 4
//   Size-2 (2 adjacent sectors)     : 3
//   Size-3 (3 adjacent sectors)     : 2
//   Size-4 (all sectors = whole tri): 1
//   TOTAL = 4+3+2+1 = 10  → answer D
//
// Classification: STEM  (figure in question stem; answer choices are numbers)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Geometry ─────────────────────────────────────────────────────────────────
//
// We draw the triangle in a landscape orientation matching the source image:
//   Apex  = far left
//   Top-R = top-right corner of the base
//   Bot-R = bottom-right corner of the base
//
// The base is divided into N_SECTORS equal segments, and interior lines
// connect the apex to each interior base point.

const N_SECTORS = 4   // number of fan sectors (= number of unit triangles)
const N_LINES   = N_SECTORS - 1  // interior dividing lines = 3

const VW  = 280
const VH  = 200
const PAD = 12

// Apex sits at the far left (vertically centred), base on the right.
const APX = PAD
const APY = VH / 2

const TOP_X = VW - PAD
const TOP_Y = PAD
const BOT_X = VW - PAD
const BOT_Y = VH - PAD

// Base length (vertical span)
const BASE_LEN = BOT_Y - TOP_Y

// Interior base points (top to bottom along the right edge)
function basePoint(i: number): [number, number] {
  // i = 1 .. N_SECTORS-1
  const frac = i / N_SECTORS
  return [BOT_X, TOP_Y + frac * BASE_LEN]
}

// ── Colours ───────────────────────────────────────────────────────────────────
const FILL    = '#FEF3C7'   // warm amber fill for the big triangle
const STROKE  = '#92400E'   // dark amber stroke for all edges
const BG      = '#FFFBF0'   // card background
const GREEN        = '#10B981'
const GREEN_FILL   = 'rgba(16,185,129,0.20)'

// ── Triangle catalogue ────────────────────────────────────────────────────────
//
// Each fan triangle is identified by its sector range [lo, hi)  (0-indexed).
// A composite triangle spans sectors lo..hi-1 (size = hi - lo).
//   vertices: apex + basePoint(lo) + basePoint(hi)
//   where basePoint(0) = TOP vertex, basePoint(N_SECTORS) = BOT vertex.
//
export interface FanTri {
  lo: number   // first sector index (0-based)
  hi: number   // one past the last sector index
  size: number // hi - lo  (1..N_SECTORS)
  key: string
  pts: [[number, number], [number, number], [number, number]]
}

function fanTri(lo: number, hi: number): FanTri {
  const apex: [number, number]  = [APX, APY]
  const pLo: [number, number]   = basePoint(lo)
  const pHi: [number, number]   = basePoint(hi)
  return {
    lo,
    hi,
    size: hi - lo,
    key: `T${lo}-${hi}`,
    pts: [apex, pLo, pHi],
  }
}

function buildAllTris(): FanTri[] {
  const out: FanTri[] = []
  for (let size = 1; size <= N_SECTORS; size++) {
    for (let lo = 0; lo + size <= N_SECTORS; lo++) {
      out.push(fanTri(lo, lo + size))
    }
  }
  return out
}

export const ALL_TRIS_18A16 = buildAllTris()
export const TRI_TOTAL_18A16 = ALL_TRIS_18A16.length  // 10

function ptsStr(pts: [[number, number], [number, number], [number, number]]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface Seamo18A16FigureProps {
  /** Highlight all triangles of this size (1-4), or null for no highlight. */
  highlightSize?: number | null
  /** Highlight a specific triangle, or null for no highlight. */
  highlightTri?: FanTri | null
}

export function Seamo18A16Figure({
  highlightSize = null,
  highlightTri  = null,
}: Seamo18A16FigureProps) {
  const highlights = highlightTri
    ? [highlightTri]
    : highlightSize != null
      ? ALL_TRIS_18A16.filter((t) => t.size === highlightSize)
      : []

  // Interior base points (indices 1 .. N_SECTORS-1 = 1,2,3)
  const interiorPts: [number, number][] = Array.from(
    { length: N_LINES },
    (_, i) => basePoint(i + 1)
  )

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VW} height={VH} fill={BG} rx={8} />

      {/* Big triangle fill */}
      <polygon
        points={`${APX},${APY} ${TOP_X},${TOP_Y} ${BOT_X},${BOT_Y}`}
        fill={FILL}
        stroke="none"
      />

      {/* Highlight fills (behind lines) */}
      {highlights.map((t, i) => (
        <polygon key={`hf-${i}`} points={ptsStr(t.pts)} fill={GREEN_FILL} />
      ))}

      {/* Interior fan lines from apex to each interior base point */}
      {interiorPts.map(([x, y], i) => (
        <line
          key={`il-${i}`}
          x1={APX} y1={APY}
          x2={x}   y2={y}
          stroke={STROKE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}

      {/* Outer border drawn on top, thicker */}
      <polygon
        points={`${APX},${APY} ${TOP_X},${TOP_Y} ${BOT_X},${BOT_Y}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Highlight borders (above everything) */}
      {highlights.map((t, i) => (
        <polygon
          key={`hb-${i}`}
          points={ptsStr(t.pts)}
          fill="none"
          stroke={GREEN}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function Seamo18A16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A large triangle subdivided by ${N_LINES} interior lines from the apex into ` +
        `${N_SECTORS} fan sectors. Count all triangles of every size — the total is ${TRI_TOTAL_18A16}.`
      }
    >
      <Seamo18A16Figure />
    </div>
  )
}

// ── VISUALS export (paste the entry into registry.ts) ────────────────────────
//
//   'SEAMO-18-A-Q16': {
//     type: 'stem',
//     illustration: () => import('./Seamo18A16Fig'),
//   },

export const VISUALS: Record<string, {
  type: 'stem'
  illustration: () => Promise<{ default: () => JSX.Element }>
}> = {
  'SEAMO-18-A-Q16': {
    type: 'stem',
    illustration: () =>
      import('./Seamo18A16Fig').then((m) => ({ default: m.default })),
  },
}
