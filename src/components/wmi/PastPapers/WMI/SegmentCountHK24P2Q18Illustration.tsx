// HKIMO-24-P2H-Q18 — "How many line segments are there in the figure?"
//
// PROBLEM ONLY (no answer): cross-rectangle-triangle compound figure.
//
// 9 labelled dots (the only points that define segments):
//   ptA (top), ptB (cross centre), ptC (left bar end), ptD (right bar end),
//   ptG (rect centre / diagonal intersection), ptH (rect bot-left = tri left vertex),
//   ptI (rect bot-centre, on vertical), ptJ (rect bot-right = tri right vertex),
//   ptK (triangle apex)
//
// Collinear sets → total 20 segments:
//   Vertical   {A,B,G,I,K} → C(5,2) = 10
//   Horizontal {C,B,D}     → C(3,2) =  3
//   BottomEdge {H,I,J}     → C(3,2) =  3
//   DiagTL-BR  {G,J}       →         = 1  (top-left corner unlabelled)
//   DiagTR-BL  {G,H}       →         = 1  (top-right corner unlabelled)
//   TriLeft    {H,K}       →         = 1
//   TriRight   {J,K}       →         = 1
//                            Total  = 20
//
// SSR-safe & deterministic — no hooks, no framer-motion.

export const VB_W = 200
export const VB_H = 290

// ── Labelled points (exported so the explainer can import them) ───────────────
export const ptA = { x: 100, y: 20  }  // top of vertical
export const ptB = { x: 100, y: 65  }  // cross centre (above rectangle)
export const ptC = { x: 45,  y: 65  }  // left end of horizontal bar
export const ptD = { x: 155, y: 65  }  // right end of horizontal bar
export const ptG = { x: 100, y: 150 }  // centre of rectangle (diagonal intersection)
export const ptH = { x: 55,  y: 200 }  // bot-left of rectangle = left vertex of triangle
export const ptI = { x: 100, y: 200 }  // bot-centre of rectangle (lies on vertical line)
export const ptJ = { x: 145, y: 200 }  // bot-right of rectangle = right vertex of triangle
export const ptK = { x: 100, y: 270 }  // triangle apex

// ── Unlabelled rectangle corners (exported for explainer overlay drawing) ─────
export const TL = { x: 55,  y: 100 }  // top-left corner  (no dot)
export const TR = { x: 145, y: 100 }  // top-right corner (no dot)

const STROKE = '#1a1a1a'
const SW     = 2.5
const DOT_R  = 4

export default function SegmentCountHK24P2Q18Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxWidth: VB_W }}
    >
      {/* ── drawn lines ────────────────────────────────────────────────────── */}
      <g stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* vertical line: A through B, [rect top edge], G, I to K */}
        <line x1={ptA.x} y1={ptA.y} x2={ptK.x} y2={ptK.y} />
        {/* horizontal bar: C through B to D */}
        <line x1={ptC.x} y1={ptC.y} x2={ptD.x} y2={ptD.y} />
        {/* rectangle outline: TL → TR → J → H → TL */}
        <polyline
          points={`${TL.x},${TL.y} ${TR.x},${TR.y} ${ptJ.x},${ptJ.y} ${ptH.x},${ptH.y} ${TL.x},${TL.y}`}
        />
        {/* diagonal 1: TL → J (passes through G) */}
        <line x1={TL.x} y1={TL.y} x2={ptJ.x} y2={ptJ.y} />
        {/* diagonal 2: TR → H (passes through G) */}
        <line x1={TR.x} y1={TR.y} x2={ptH.x} y2={ptH.y} />
        {/* triangle sides: H → K and J → K */}
        <line x1={ptH.x} y1={ptH.y} x2={ptK.x} y2={ptK.y} />
        <line x1={ptJ.x} y1={ptJ.y} x2={ptK.x} y2={ptK.y} />
      </g>

      {/* ── labelled dots ──────────────────────────────────────────────────── */}
      <g fill={STROKE}>
        {[ptA, ptB, ptC, ptD, ptG, ptH, ptI, ptJ, ptK].map(({ x, y }, i) => (
          <circle key={i} cx={x} cy={y} r={DOT_R} />
        ))}
      </g>
    </svg>
  )
}
