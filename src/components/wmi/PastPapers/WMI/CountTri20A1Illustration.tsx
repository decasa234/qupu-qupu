// SEAMO-20-A-Q1 — "How many triangles are there altogether?"
//
// Source figure (2020.imgs/002.jpg): a large triangle whose apex is at the
// BOTTOM-RIGHT; 3 interior fan lines radiate from that bottom-right apex to
// 3 equally-spaced points on the LEFT slant edge, dividing the figure into
// 4 equal fan sectors.
//
// Triangle count (all sizes, fan-sector formula N_SECTORS=4):
//   Size-1 (single sector)           : 4
//   Size-2 (2 adjacent sectors)      : 3
//   Size-3 (3 adjacent sectors)      : 2
//   Size-4 (all sectors = whole tri) : 1
//   TOTAL = 4 + 3 + 2 + 1 = 10  → answer E
//
// Copy-adapted from TriCount19A1Illustration.tsx (same fan geometry, same count).
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Geometry ─────────────────────────────────────────────────────────────────
//
// The outer triangle vertices:
//   TOP-LEFT  = left top corner   (the base of the fan slant edge, topmost)
//   BOT-LEFT  = left bottom corner (the base of the fan slant edge, bottommost)
//   BOT-RIGHT = the fan apex (bottom-right corner)
//
// Fan lines radiate FROM bot-right TO 3 equally-spaced interior points on the
// LEFT edge (vertical left edge from top-left to bot-left).

const N_SECTORS = 4
const N_LINES   = N_SECTORS - 1  // 3 interior dividing lines

const VW  = 280
const VH  = 200
const PAD = 16

// Fan apex — bottom-right corner
const APX = VW - PAD
const APY = VH - PAD

// Left (vertical) edge — the base the fan lines divide
const LEFT_X  = PAD
const LEFT_TOP_Y = PAD
const LEFT_BOT_Y = VH - PAD

const LEFT_LEN = LEFT_BOT_Y - LEFT_TOP_Y

/** i-th division point on the left edge (i=0 → top-left; i=N_SECTORS → bot-left) */
function leftPoint(i: number): [number, number] {
  return [LEFT_X, LEFT_TOP_Y + (i / N_SECTORS) * LEFT_LEN]
}

// ── Colours (match 2019 illustration) ────────────────────────────────────────
const FILL       = '#5ECFBF'
const STROKE     = '#1A5C55'
const BG         = '#F0FAFB'
const GREEN      = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.20)'

// ── Triangle catalogue ────────────────────────────────────────────────────────

export interface FanTri20A1 {
  lo: number
  hi: number
  size: number
  key: string
  pts: [[number, number], [number, number], [number, number]]
}

function fanTri(lo: number, hi: number): FanTri20A1 {
  const apex: [number, number] = [APX, APY]
  const pLo: [number, number]  = leftPoint(lo)
  const pHi: [number, number]  = leftPoint(hi)
  return { lo, hi, size: hi - lo, key: `T${lo}-${hi}`, pts: [apex, pLo, pHi] }
}

function buildAllTris(): FanTri20A1[] {
  const out: FanTri20A1[] = []
  for (let size = 1; size <= N_SECTORS; size++) {
    for (let lo = 0; lo + size <= N_SECTORS; lo++) {
      out.push(fanTri(lo, lo + size))
    }
  }
  return out
}

export const ALL_TRIS_20A1   = buildAllTris()
export const TRI_TOTAL_20A1  = ALL_TRIS_20A1.length  // 10

export const TRIS_BY_SIZE_20A1: { size: number; tris: FanTri20A1[] }[] =
  [1, 2, 3, 4].map((sz) => ({
    size: sz,
    tris: ALL_TRIS_20A1.filter((t) => t.size === sz),
  }))

function ptsStr(pts: [[number, number], [number, number], [number, number]]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface CountTri20A1FigureProps {
  /** Highlight all triangles of this size (1–4), or null for none. */
  highlightSize?: number | null
  /** Highlight a specific triangle. */
  highlightTri?: FanTri20A1 | null
}

export function CountTri20A1Figure({
  highlightSize = null,
  highlightTri  = null,
}: CountTri20A1FigureProps) {
  const highlights = highlightTri
    ? [highlightTri]
    : highlightSize != null
      ? ALL_TRIS_20A1.filter((t) => t.size === highlightSize)
      : []

  const interiorPts: [number, number][] = Array.from(
    { length: N_LINES },
    (_, i) => leftPoint(i + 1)
  )

  const outerPts = `${LEFT_X},${LEFT_TOP_Y} ${LEFT_X},${LEFT_BOT_Y} ${APX},${APY}`

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
        points={outerPts}
        fill={FILL}
        stroke="none"
      />

      {/* Highlight fills (behind lines) */}
      {highlights.map((t, i) => (
        <polygon key={`hf-${i}`} points={ptsStr(t.pts)} fill={GREEN_FILL} />
      ))}

      {/* Interior fan lines from apex to each interior left-edge point */}
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

      {/* Outer border */}
      <polygon
        points={outerPts}
        fill="none"
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Highlight borders */}
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

export default function CountTri20A1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A large triangle subdivided by ${N_LINES} interior lines from the bottom-right apex into ` +
        `${N_SECTORS} fan sectors. Count all triangles of every size — the total is ${TRI_TOTAL_20A1}.`
      }
    >
      <CountTri20A1Figure />
    </div>
  )
}
