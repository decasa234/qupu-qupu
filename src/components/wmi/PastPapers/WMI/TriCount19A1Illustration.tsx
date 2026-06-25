// SEAMO-19-A-Q1 — "How many triangles are there in the figure below?"
//
// Source figure (2019.imgs/002.jpg): a large triangle subdivided by 3 interior
// fan lines radiating from the left apex to 3 equally-spaced points on the
// vertical right base, dividing the figure into 4 equal sector triangles.
//
// Triangle count (all sizes, fan-sector formula N_SECTORS=4):
//   Size-1 (single sector)           : 4
//   Size-2 (2 adjacent sectors)      : 3
//   Size-3 (3 adjacent sectors)      : 2
//   Size-4 (all sectors = whole tri) : 1
//   TOTAL = 4 + 3 + 2 + 1 = 10  → answer D
//
// Copy-adapted from Seamo18A16Fig.tsx (same fan geometry, same count).
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Geometry ─────────────────────────────────────────────────────────────────
//
// Apex at far left (vertically centred); base is the vertical right edge.
// N_SECTORS fan lines divide the base into N_SECTORS equal segments.

const N_SECTORS = 4        // number of equal fan sectors
const N_LINES   = N_SECTORS - 1  // interior dividing lines = 3

const VW  = 280
const VH  = 200
const PAD = 12

const APX = PAD           // apex x (far left)
const APY = VH / 2        // apex y (vertical centre)

const BASE_X = VW - PAD   // x of the vertical right base
const TOP_Y  = PAD        // top of the base
const BOT_Y  = VH - PAD   // bottom of the base

const BASE_LEN = BOT_Y - TOP_Y

/** i-th base division point (i = 0 → top corner; i = N_SECTORS → bottom corner) */
function basePoint(i: number): [number, number] {
  return [BASE_X, TOP_Y + (i / N_SECTORS) * BASE_LEN]
}

// ── Colours ───────────────────────────────────────────────────────────────────
const FILL       = '#5ECFBF'   // teal fill matching the source figure
const STROKE     = '#1A5C55'   // dark teal stroke
const BG         = '#F0FAFB'   // light card background
const GREEN      = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.20)'

// ── Triangle catalogue ────────────────────────────────────────────────────────
//
// Each fan triangle spans sector indices [lo, hi).  Vertices: apex + basePoint(lo) + basePoint(hi).

export interface FanTri19A1 {
  lo: number
  hi: number
  size: number   // hi - lo  (1 .. N_SECTORS)
  key: string
  pts: [[number, number], [number, number], [number, number]]
}

function fanTri(lo: number, hi: number): FanTri19A1 {
  const apex: [number, number] = [APX, APY]
  const pLo: [number, number]  = basePoint(lo)
  const pHi: [number, number]  = basePoint(hi)
  return { lo, hi, size: hi - lo, key: `T${lo}-${hi}`, pts: [apex, pLo, pHi] }
}

function buildAllTris(): FanTri19A1[] {
  const out: FanTri19A1[] = []
  for (let size = 1; size <= N_SECTORS; size++) {
    for (let lo = 0; lo + size <= N_SECTORS; lo++) {
      out.push(fanTri(lo, lo + size))
    }
  }
  return out
}

export const ALL_TRIS_19A1   = buildAllTris()
export const TRI_TOTAL_19A1  = ALL_TRIS_19A1.length  // 10

export const TRIS_BY_SIZE_19A1: { size: number; tris: FanTri19A1[] }[] =
  [1, 2, 3, 4].map((sz) => ({
    size: sz,
    tris: ALL_TRIS_19A1.filter((t) => t.size === sz),
  }))

function ptsStr(pts: [[number, number], [number, number], [number, number]]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface TriCount19A1FigureProps {
  /** Highlight all triangles of this size (1–4), or null for none. */
  highlightSize?: number | null
  /** Highlight a specific triangle. */
  highlightTri?: FanTri19A1 | null
}

export function TriCount19A1Figure({
  highlightSize = null,
  highlightTri  = null,
}: TriCount19A1FigureProps) {
  const highlights = highlightTri
    ? [highlightTri]
    : highlightSize != null
      ? ALL_TRIS_19A1.filter((t) => t.size === highlightSize)
      : []

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
        points={`${APX},${APY} ${BASE_X},${TOP_Y} ${BASE_X},${BOT_Y}`}
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

      {/* Outer border (the big triangle) drawn on top, thicker */}
      <polygon
        points={`${APX},${APY} ${BASE_X},${TOP_Y} ${BASE_X},${BOT_Y}`}
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

// ── Default export — static illustration ──────────────────────────────────────

export default function TriCount19A1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A large triangle subdivided by ${N_LINES} interior lines from the apex into ` +
        `${N_SECTORS} fan sectors. Count all triangles of every size — the total is ${TRI_TOTAL_19A1}.`
      }
    >
      <TriCount19A1Figure />
    </div>
  )
}
