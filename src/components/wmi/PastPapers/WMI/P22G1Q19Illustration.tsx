/**
 * WMI-22P1A-Q19 (2022 Grade 1 Semifinal) — "How many different triangles (large
 * and small) are there in the picture?"  (seed answer key: C.)
 *
 * Reconstructed from db/seed/wmi/figures/2022-semifinal-g1-a-q19.jpg: a large
 * triangle T-L-R (apex T at top, base L…R) with
 *   - one full cevian from the apex T THROUGH interior point P down to the base
 *     point M (the scan draws T, P, M in one straight line), and
 *   - three spokes from P: to the bottom-left corner L, a horizontal segment to
 *     a point N on the right edge, and to the bottom-right corner R.
 * P fans the figure into five small triangular cells; counting every triangle
 * of every size (verified by an exhaustive enumerator over the exact lattice)
 * gives the TEN triangles listed in TRIANGLES below — matching the answer key
 * (option C = 10).
 *
 * The static figure draws ONLY the line-work (no highlight, no count). The
 * co-exported Q19Figure({ litId }) primitive outlines exactly one triangle so the
 * explainer can sweep them one at a time. Pure render, SSR-safe, deterministic.
 */

// ─── palette (echoes the pale-green scan) ───────────────────────────────────
const FILL = '#DDEEE0' // pale interior fill
const LINE = '#2B332E' // dark outline
const LIT_FILL = '#FF8A3D' // the triangle currently counted
const LIT_EDGE = '#30598A' // ring around it

// ─── geometry (matches the enumerator's verified lattice) ───────────────────
export const Q19_VIEW_W = 256
export const Q19_VIEW_H = 251

type Pt = [number, number]
const PTS: Record<string, Pt> = {
  T: [128, 14], // apex
  L: [16, 236], // bottom-left corner
  R: [240, 236], // bottom-right corner
  M: [150, 236], // base point (foot of the cevian)
  P: [141.5, 150], // interior point — exactly on the line T–M
  N: [196.6, 150], // point on the right edge (foot of the horizontal; exactly on T–R)
}

// Every drawn straight line, as an ordered list of the named points on it.
const LINES: string[][] = [
  ['T', 'L'], // left edge
  ['L', 'M', 'R'], // base, with M between
  ['T', 'N', 'R'], // right edge, with N between
  ['T', 'P', 'M'], // full cevian from the apex through P to the base at M
  ['P', 'L'], // spoke to bottom-left
  ['P', 'N'], // horizontal spoke to the right edge
  ['P', 'R'], // spoke to bottom-right corner
]

export interface TriEntry {
  id: number
  points: string // SVG polygon points
  size: 'small' | 'medium' | 'large'
}

// The ten triangles, smallest area first (the order the explainer reveals them).
// Vertex triples are exactly those the exhaustive enumerator returned.
const TRI_TRIPLES: Array<[string, string, string]> = [
  ['R', 'P', 'N'], // small cell under the horizontal, by the right edge
  ['T', 'P', 'N'], // upper cell between cevian and right edge
  ['R', 'M', 'P'], // small cell at the bottom, right of the cevian
  ['L', 'M', 'P'], // lower-left cell
  ['T', 'R', 'P'], // apex to the right corner through P (2 cells)
  ['T', 'L', 'P'], // big left cell, apex to the left corner
  ['L', 'R', 'P'], // whole base fan (the wide bottom triangle)
  ['T', 'M', 'R'], // apex, base point, right corner (3 cells)
  ['T', 'L', 'M'], // apex, left corner, base point (left of the cevian)
  ['T', 'L', 'R'], // the whole outer triangle
]

const pointsOf = (tri: [string, string, string]) => tri.map((v) => PTS[v].join(',')).join(' ')

export const TRIANGLES: TriEntry[] = TRI_TRIPLES.map((tri, i) => ({
  id: i + 1,
  points: pointsOf(tri),
  size: i < 4 ? 'small' : i < 9 ? 'medium' : 'large',
}))

export const TRI_TOTAL = TRIANGLES.length // 10 — answer C

// ─── drawing ────────────────────────────────────────────────────────────────

/** Every black stroke of the figure (outer edges + cevian + the four spokes). */
function FigureLines() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      {LINES.map((ln, i) => {
        const a = PTS[ln[0]]
        const b = PTS[ln[ln.length - 1]]
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      })}
    </g>
  )
}

/**
 * Q19Figure — the whole triangle, pale-green filled. When `litId` is given the
 * matching triangle is filled orange and ringed in blue so the explainer can
 * highlight it; with no props it renders the plain problem figure.
 */
export function Q19Figure({ litId }: { litId?: number }) {
  const lit = litId ? TRIANGLES.find((t) => t.id === litId) : undefined
  return (
    <svg
      viewBox={`0 0 ${Q19_VIEW_W} ${Q19_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 250 }}
      aria-hidden="true"
    >
      <polygon points={pointsOf(['T', 'L', 'R'])} fill={FILL} stroke="none" />
      {lit && <polygon points={lit.points} fill={LIT_FILL} stroke="none" opacity={0.85} />}
      <FigureLines />
      {lit && <polygon points={lit.points} fill="none" stroke={LIT_EDGE} strokeWidth={3.2} strokeLinejoin="round" />}
    </svg>
  )
}

export default function P22G1Q19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah segitiga besar dengan satu garis dari puncak ke titik dalam, lalu garis-garis dari titik itu ke alas dan sisi kanan. Ada berapa banyak segitiga, besar dan kecil?"
    >
      <Q19Figure />
    </div>
  )
}
