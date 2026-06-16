// In-card SVG illustration for WMI-25P2A-Q21 (2025 Grade-2 Semifinal).
//
// Problem: regular pentagon tiles in two colours build a "butterfly" pattern —
// Picture 1, Picture 2, Picture 3, ...  How many WHITE tiles are in Picture 9?
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g2-a-q21.jpg: each picture
// adds one GREEN centre pentagon ringed by WHITE pentagons; the scan shows the
// 3-flower stage (Picture 3) with three green centres and ten white tiles.
//
// The white-tile count grows the same amount each picture:
//   Picture 1 -> 4 white,  Picture 2 -> 7,  Picture 3 -> 10,  ...  (+3 each time)
//   rule: white(n) = 3n + 1   =>  Picture 9 = 3*9 + 1 = 28   (answer D)
//
// The static figure shows the PATTERN (the scan's 3-flower stage) plus the prompt
// "Picture 9 = ?".  It does NOT print the running counts or the rule — that is the
// explainer's job.
//
// Pure render: no Math.random, no Date, no window/document at module load. SSR-safe.

const INK = '#27303A' // tile edges
const WHITE = '#FFFFFF' // white tile
const GREEN = '#1FA64A' // green centre tile

// ── pentagon geometry ──────────────────────────────────────────────────────────
const R = 22 // pentagon circumradius

/** Regular-pentagon vertices: centre (cx,cy), circumradius R, first vertex at
 *  angle a0 (degrees, SVG +y down). */
function pentVerts(cx: number, cy: number, a0: number): Array<[number, number]> {
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((a0 + i * 72) * Math.PI) / 180
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number]
  })
}

function toPoints(v: Array<[number, number]>): string {
  return v.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

/** Reflect point P across the line through A and B (used to grow a petal off an edge). */
function reflect(P: [number, number], A: [number, number], B: [number, number]): [number, number] {
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  const t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / (dx * dx + dy * dy)
  const px = A[0] + t * dx
  const py = A[1] + t * dy
  return [2 * px - P[0], 2 * py - P[1]]
}

/**
 * One butterfly "flower": a green centre pentagon (point-down) with `petals`
 * white pentagons reflected off its edges.  `petalEdges` picks which of the 5
 * edges grow a white petal — letting flowers share petals at junctions so the
 * count matches the scan.
 */
export function PentagonFlower({
  cx,
  cy,
  petalEdges = [0, 1, 2, 3, 4],
}: {
  cx: number
  cy: number
  petalEdges?: number[]
}) {
  const centre = pentVerts(cx, cy, 90) // a vertex points straight down
  return (
    <g>
      {/* white petals (drawn first, under the green centre) */}
      {petalEdges.map((e) => {
        const A = centre[e]
        const B = centre[(e + 1) % 5]
        const petal = centre.map((p) => reflect(p, A, B)) as Array<[number, number]>
        return <polygon key={`p${e}`} points={toPoints(petal)} fill={WHITE} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      })}
      {/* green centre */}
      <polygon points={toPoints(centre)} fill={GREEN} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  )
}

export const Q21_VIEW_W = 300
export const Q21_VIEW_H = 220

// Three flower centres laid out like the scan: one up-centre, two lower (left/right).
// Petals are picked so the rosettes read as the butterfly without overlapping ink.
export const FLOWER_CENTRES: Array<{ cx: number; cy: number; petalEdges: number[] }> = [
  { cx: 150, cy: 66, petalEdges: [0, 1, 2, 3, 4] }, // top centre
  { cx: 92, cy: 136, petalEdges: [0, 1, 2, 3, 4] }, // lower left
  { cx: 208, cy: 136, petalEdges: [0, 1, 2, 3, 4] }, // lower right
]

/** The pattern stage: draws the first `flowers` flowers (1..3 for the scan). */
export function ButterflyPattern({ flowers = 3 }: { flowers?: number }) {
  const shown = FLOWER_CENTRES.slice(0, flowers)
  return (
    <>
      {shown.map((f, i) => (
        <PentagonFlower key={i} cx={f.cx} cy={f.cy} petalEdges={f.petalEdges} />
      ))}
    </>
  )
}

export default function P25G2Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola kupu-kupu dari ubin segilima: tiga ubin hijau di tengah, masing-masing dikelilingi ubin putih. Berapa ubin putih pada Gambar 9?"
    >
      <svg
        viewBox={`0 0 ${Q21_VIEW_W} ${Q21_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <ButterflyPattern flowers={3} />
        {/* prompt: this is the growing pattern; Picture 9 white tiles = ? */}
        <text x={Q21_VIEW_W / 2} y={Q21_VIEW_H - 14} textAnchor="middle" fontSize={15} fontWeight={800} fill="#30598A">
          Picture 1, 2, 3, … &#8594; Picture 9 = ?
        </text>
      </svg>
    </div>
  )
}
