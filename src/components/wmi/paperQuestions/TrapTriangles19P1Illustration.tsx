// Trapezoid-with-dashed-lines figure for WMI-19P1A-Q11 (2019 Semifinal Grade 1
// Paper A).
//
// "The trapezoid on the right is divided by the dashed lines. How many triangles
//  are there in the figure?"  In the source paper the four choices were PICTURES
//  ("Figure A/B/C/D"), each showing a candidate total; the answer key is A.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g1-a-q11.jpg (the JPG is
// NOT embedded). The scan is a trapezoid (short top edge, long bottom edge) drawn
// with a SOLID outline, subdivided by DASHED interior segments:
//
//        TL ____________ TR          corners: TL,TR (top)  BL,BR (bottom)
//          /\          /\            interior centres: Lc, Rc
//         /  Lc ---- Rc  \           dashed: TL-Lc, BL-Lc, Lc-Rc, TR-Rc, BR-Rc
//        / .'        '. \
//      BL /____________\ BR
//
// Two interior points Lc, Rc are joined by a short horizontal dash. From Lc a
// dash rises to the top-left corner and one falls to the bottom-left corner; from
// Rc a dash rises to the top-right corner and one falls to the bottom-right
// corner. This carves the trapezoid into a left triangle, a right triangle and a
// central band — TWO triangles in all (the answer the source's "Figure A" shows).
//
// The static figure shows ONLY the problem: the trapezoid and its dashed lines,
// nothing highlighted, no count printed. The explainer imports the co-exported
// TrapFigure to outline one triangle at a time as it tallies them.
//
// Pure render — no window/document, no Math.random, no Date. SSR-safe + deterministic.

const SOLID = '#1F2937' // trapezoid outline
const DASH = '#1F2937' // interior dashed lines
const FILL = '#EAF2FB' // soft interior fill
const LIT_FILL = '#FF8A3D' // triangle currently being counted
const LIT_EDGE = '#30598A' // ring around the counted triangle

// ─── geometry ──────────────────────────────────────────────────────────────
export const VIEW_W = 260
export const VIEW_H = 180

type Pt = readonly [number, number]

// Trapezoid corners (short top, wide bottom), centred with viewBox headroom.
export const TL: Pt = [78, 44]
export const TR: Pt = [182, 44]
export const BL: Pt = [30, 140]
export const BR: Pt = [230, 140]

// Two interior centres joined by a short horizontal dash, at mid height.
export const Lc: Pt = [108, 96]
export const Rc: Pt = [152, 96]

const pts = (...p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')

// The interior dashed segments exactly as drawn in the scan.
const DASHES: [Pt, Pt][] = [
  [TL, Lc],
  [BL, Lc],
  [Lc, Rc],
  [TR, Rc],
  [BR, Rc],
]

export interface TriEntry {
  id: number
  points: string
  /** human label of the triangle (for aria / captions) */
}

// The two triangles in reveal order: left wedge, then right wedge.
const TRI_PTS: Pt[][] = [
  [TL, BL, Lc], // left triangle
  [TR, BR, Rc], // right triangle
]

export const TRIANGLES: TriEntry[] = TRI_PTS.map((p, i) => ({
  id: i + 1,
  points: pts(...p),
}))
export const TRI_TOTAL = TRIANGLES.length // 2

/**
 * Draws the trapezoid + dashed interior. With no props it is the pristine
 * question figure. `litId` outlines exactly one triangle (orange fill + blue
 * ring) so the explainer can highlight them one at a time.
 */
export function TrapFigure({ litId }: { litId?: number }) {
  const lit = litId ? TRIANGLES.find((t) => t.id === litId) : undefined
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 280 }}
      aria-hidden="true"
    >
      {/* interior fill (soft, behind everything) */}
      <polygon points={pts(TL, TR, BR, BL)} fill={FILL} stroke="none" />

      {/* highlighted triangle fill */}
      {lit && <polygon points={lit.points} fill={LIT_FILL} stroke="none" opacity={0.85} />}

      {/* interior dashed segments */}
      <g stroke={DASH} strokeWidth={2.2} strokeDasharray="6 5" strokeLinecap="round" fill="none">
        {DASHES.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>

      {/* solid trapezoid outline (drawn last so it stays crisp on top) */}
      <polygon
        points={pts(TL, TR, BR, BL)}
        fill="none"
        stroke={SOLID}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />

      {/* ring around the counted triangle */}
      {lit && (
        <polygon
          points={lit.points}
          fill="none"
          stroke={LIT_EDGE}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default function TrapTriangles19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A trapezoid with a short top edge and a wide bottom edge, drawn with a solid outline and divided inside by dashed lines into a left part, a central band, and a right part. How many triangles are in the figure? The count is not shown."
    >
      <TrapFigure />
    </div>
  )
}
