// "Add two straight lines to the M, max triangles" for WMI-19F3A-Q17.
// The paper's figure is an M of four strokes (two peaks, a valley). The best
// move: draw BOTH lines across all four strokes, tilted so they also cross
// each other. Each line alone makes 3 triangles (two peaks + the valley V);
// the X-crossing makes one thin triangle with every stroke: 3 + 3 + 4 = 10.

export const M_ANSWER = 10

const INK = '#1F2937'

export const M_VIEW_W = 240
export const M_VIEW_H = 170

/** The M: A → P1 → V → P2 → B (four strokes). */
export const M_PTS: Record<string, [number, number]> = {
  A: [20, 152],
  P1: [70, 18],
  V: [120, 152],
  P2: [170, 18],
  B: [220, 152],
}
export const M_STROKES: ReadonlyArray<[string, string]> = [
  ['A', 'P1'],
  ['P1', 'V'],
  ['V', 'P2'],
  ['P2', 'B'],
]

/** The two added lines (cross all four strokes AND each other). */
export const M_L1: [[number, number], [number, number]] = [[6, 76], [234, 96]]
export const M_L2: [[number, number], [number, number]] = [[6, 96], [234, 76]]

/** Intersection of segment p1–p2 with segment p3–p4 (null if none). */
export function segX(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
): [number, number] | null {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0])
  if (Math.abs(d) < 1e-9) return null
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d
  const u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]
}

const strokeSeg = (i: number): [[number, number], [number, number]] => {
  const [a, b] = M_STROKES[i]
  return [M_PTS[a], M_PTS[b]]
}

/** L (1|2) ∩ stroke i. */
export const lineHit = (line: 1 | 2, i: number): [number, number] => {
  const L = line === 1 ? M_L1 : M_L2
  const [a, b] = strokeSeg(i)
  return segX(L[0], L[1], a, b)!
}

/** L1 ∩ L2. */
export const M_X: [number, number] = segX(M_L1[0], M_L1[1], M_L2[0], M_L2[1])!

export function MShape({ showL1 = false, showL2 = false }: { showL1?: boolean; showL2?: boolean }) {
  return (
    <g>
      {M_STROKES.map(([a, b], i) => (
        <line key={i} x1={M_PTS[a][0]} y1={M_PTS[a][1]} x2={M_PTS[b][0]} y2={M_PTS[b][1]} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      ))}
      {showL1 && <line x1={M_L1[0][0]} y1={M_L1[0][1]} x2={M_L1[1][0]} y2={M_L1[1][1]} stroke="#2563EB" strokeWidth={2.5} />}
      {showL2 && <line x1={M_L2[0][0]} y1={M_L2[0][1]} x2={M_L2[1][0]} y2={M_L2[1][1]} stroke="#7C3AED" strokeWidth={2.5} />}
    </g>
  )
}

export default function MShapeLinesG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An M-shaped figure made of four strokes: two peaks with a valley between them. Two straight lines are to be added to form as many triangles as possible."
    >
      <svg viewBox={`0 0 ${M_VIEW_W} ${M_VIEW_H}`} width="100%" style={{ maxWidth: 260, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <MShape />
      </svg>
    </div>
  )
}
