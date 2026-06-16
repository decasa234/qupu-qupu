// Roundabout illustration for WMI-25F2A-Q20 (2025 Grade-2 Final, Question 20).
// Three homes sit around a counterclockwise-only roundabout.
// Given arc distances: Ashley->Cheryl = 207 m, Brenda->Ashley = 332 m, Cheryl->Brenda = 313 m.
// The figure shows ONLY the problem setup — never the answer arc (Ashley->Brenda = 94 m).

// --- exported data constants (for the explainer to bind to) ---
export const ROUNDABOUT_ARCS = {
  ashleyToCheryl: 207,
  brendaToAshley: 332,
  cherylToBrenda: 313,
} as const

// Arc labels: direction is counterclockwise (CCW).
// Person positions on the circle (angles measured clockwise from top, but travel is CCW):
//   Ashley  ~ 315° (top-left, ~10 o'clock)
//   Brenda  ~ 225° (bottom-left, ~7 o'clock)
//   Cheryl  ~ 45°  (bottom-right, ~5 o'clock)
// (In SVG coords y increases downward, so "counterclockwise" visually = CW in math.)

const CX = 140  // circle center x
const CY = 128  // circle center y
const R_OUTER = 72 // outer road radius
const R_INNER = 46 // inner road radius (central island)
const R_MID   = (R_OUTER + R_INNER) / 2 // dashed center-line radius
const R_PERSON = R_OUTER + 32 // house icon center distance from circle center

// Convert polar angle (degrees, 0=right, CCW positive in math) to SVG x,y
function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

// Build an SVG arc path segment on a circle of radius r, from angleDeg1 to angleDeg2
// Going counterclockwise in math coords (= clockwise in SVG pixel coords because y is flipped).
// sweep=0 means counter-clockwise in SVG (which is CCW visually as seen by viewer)
function arcPath(cx: number, cy: number, r: number, a1Deg: number, a2Deg: number, ccwVisual: boolean): string {
  const [x1, y1] = polar(cx, cy, r, a1Deg)
  const [x2, y2] = polar(cx, cy, r, a2Deg)
  // large-arc flag: 1 if the arc spans > 180 degrees
  let span = a1Deg - a2Deg
  if (span < 0) span += 360
  const large = span > 180 ? 1 : 0
  // In SVG: sweep=1 means CW (in pixel space), sweep=0 means CCW (in pixel space).
  // "CCW visually" = the direction that looks counterclockwise to a viewer = CCW in pixel space = sweep=0.
  const sweep = ccwVisual ? 0 : 1
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`
}

// Person angles (math convention: 0=right, 90=up, CCW positive)
// Ashley top-left ~ 130°, Brenda bottom-left ~ 210°, Cheryl bottom-right ~ 330°
const A_ASHLEY  = 130  // top-left
const A_BRENDA  = 210  // bottom-left
const A_CHERYL  =  330  // bottom-right

// The travel direction on the roundabout is counterclockwise when viewed from above.
// In our SVG (y-down), CCW visually = decreasing angle in standard math convention.
// Travel sequence (CCW visually): Ashley -> Cheryl -> Brenda -> Ashley
// In math angles (CCW positive): A→C goes 130 → 330 going CCW (downward through bottom-right),
// which is a decrease: 130 → -30 (= 330). Arc span = 160° CCW in visual.

// House glyph — a simple drawn house (no emoji)
function House({ cx, cy, color, label }: { cx: number; cy: number; color: string; label: string }) {
  const hw = 18, hh = 14, roofH = 12
  const lx = cx - hw / 2
  const ty = cy - hh / 2
  // Label below
  const labelY = cy + hh / 2 + roofH + 14
  return (
    <g>
      {/* roof */}
      <polygon
        points={`${cx},${ty - roofH} ${lx - 2},${ty} ${lx + hw + 2},${ty}`}
        fill={color}
        stroke="#5A3A1A"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* walls */}
      <rect x={lx} y={ty} width={hw} height={hh} fill="#FEF3C7" stroke="#5A3A1A" strokeWidth={1.5} />
      {/* door */}
      <rect x={cx - 3} y={ty + hh - 7} width={6} height={7} rx={1} fill="#92400E" stroke="#5A3A1A" strokeWidth={1} />
      {/* windows */}
      <rect x={lx + 2} y={ty + 3} width={5} height={4} rx={1} fill="#BAE6FD" stroke="#5A3A1A" strokeWidth={1} />
      <rect x={lx + hw - 7} y={ty + 3} width={5} height={4} rx={1} fill="#BAE6FD" stroke="#5A3A1A" strokeWidth={1} />
      {/* name label */}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fontStyle="italic"
        fill="#1F2937"
        className="font-display"
      >
        {label}
      </text>
    </g>
  )
}

// Arrowhead at a point on the circle, pointing in the travel direction (CCW visually)
function ArrowHead({ cx, cy, r, angleDeg }: { cx: number; cy: number; r: number; angleDeg: number }) {
  // Tangent direction for CCW visual movement at angleDeg:
  // In math (y-up) CCW tangent at angle θ is (-sin θ, cos θ).
  // In SVG (y-down) that maps to (-sin θ, -cos θ) ... but our polar() already flips y.
  // The tangent direction in SVG pixel space for CCW-visual travel:
  const rad = (angleDeg * Math.PI) / 180
  // forward direction in SVG pixel space (for CCW visual = CW in pixel angle space = decreasing angleDeg)
  const tx = Math.sin(rad)   // tangent x (CCW visual in SVG)
  const ty = Math.cos(rad)   // tangent y
  const [px, py] = polar(cx, cy, r, angleDeg)
  const size = 7
  // arrowhead triangle
  const p1x = px + tx * size
  const p1y = py + ty * size
  const nx = -ty  // normal
  const ny = tx
  const p2x = px - tx * 3 + nx * 4
  const p2y = py - ty * 3 + ny * 4
  const p3x = px - tx * 3 - nx * 4
  const p3y = py - ty * 3 - ny * 4
  return (
    <polygon
      points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
      fill="#1F2937"
    />
  )
}

// Midpoint angle between two angles (going CCW visually = decreasing in math)
function midAngleCCW(a1: number, a2: number): number {
  // We want the midpoint going CCW from a1 to a2.
  let diff = a1 - a2
  if (diff < 0) diff += 360
  const mid = a1 - diff / 2
  return ((mid % 360) + 360) % 360
}

// Arc distance label — placed just outside the ring
function ArcLabel({ cx, cy, r, angleDeg, text }: { cx: number; cy: number; r: number; angleDeg: number; text: string }) {
  const [lx, ly] = polar(cx, cy, r, angleDeg)
  return (
    <text
      x={lx}
      y={ly}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={10}
      fontWeight={700}
      fill="#B45309"
      className="font-display"
    >
      {text}
    </text>
  )
}

// Small connection line from house to road edge
function EntryLine({ cx, cy, personAngle }: { cx: number; cy: number; personAngle: number }) {
  const [hx, hy] = polar(cx, cy, R_OUTER - 4, personAngle)
  const [ex, ey] = polar(cx, cy, R_PERSON - 20, personAngle)
  return <line x1={hx} y1={hy} x2={ex} y2={ey} stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="3 2" />
}

// Main illustration component
export function Roundabout25G2Figure() {
  // CCW arcs (visually counterclockwise):
  // Ashley (A) -> Cheryl (C): 207 m, arc from 130° to 330° going CCW
  // Cheryl (C) -> Brenda (B): 313 m, arc from 330° to 210° going CCW  (span = 120° CCW)
  // Brenda (B) -> Ashley (A): 332 m, arc from 210° to 130° going CCW  (span = 80° CCW)

  // Arrow positions (at ~mid-arc)
  const arrowAB = midAngleCCW(A_ASHLEY, A_CHERYL)   // mid of A->C arc (upper-right area)
  const arrowBC = midAngleCCW(A_CHERYL, A_BRENDA)    // mid of C->B arc (lower area)

  // Label positions: slightly outside the outer ring
  const labelRadius = R_OUTER + 18
  const labelAC = midAngleCCW(A_ASHLEY, A_CHERYL)    // A->C arc
  const labelCB = midAngleCCW(A_CHERYL, A_BRENDA)    // C->B arc
  const labelBA = midAngleCCW(A_BRENDA, A_ASHLEY)    // B->A arc

  // House positions
  const [hax, hay] = polar(CX, CY, R_PERSON, A_ASHLEY)
  const [hbx, hby] = polar(CX, CY, R_PERSON, A_BRENDA)
  const [hcx, hcy] = polar(CX, CY, R_PERSON, A_CHERYL)

  // Dashed centerline: 12 dashes around the ring
  const dashCount = 12
  const dashes = Array.from({ length: dashCount }, (_, i) => {
    const a1 = (i * 360) / dashCount
    const a2 = ((i + 0.55) * 360) / dashCount
    return arcPath(CX, CY, R_MID, a1, a2, false)
  })

  return (
    <svg
      viewBox="0 0 280 270"
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- road ring ---- */}
      {/* outer road fill */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="#D1D5DB" />
      {/* inner island */}
      <circle cx={CX} cy={CY} r={R_INNER} fill="#F9FAFB" stroke="#9CA3AF" strokeWidth={1} />
      {/* outer road border */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#9CA3AF" strokeWidth={1.5} />

      {/* ---- dashed center line ---- */}
      {dashes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth={1.5} />
      ))}

      {/* ---- direction arrows (CCW travel) ---- */}
      <ArrowHead cx={CX} cy={CY} r={R_MID + 4} angleDeg={arrowAB} />
      <ArrowHead cx={CX} cy={CY} r={R_MID + 4} angleDeg={arrowBC} />

      {/* ---- entry connector lines ---- */}
      <EntryLine cx={CX} cy={CY} personAngle={A_ASHLEY} />
      <EntryLine cx={CX} cy={CY} personAngle={A_BRENDA} />
      <EntryLine cx={CX} cy={CY} personAngle={A_CHERYL} />

      {/* ---- arc distance labels ---- */}
      {/* A -> C: 207 m (upper-right side) */}
      <ArcLabel cx={CX} cy={CY} r={labelRadius} angleDeg={labelAC} text="207 m" />
      {/* C -> B: 313 m (lower area) */}
      <ArcLabel cx={CX} cy={CY} r={labelRadius} angleDeg={labelCB} text="313 m" />
      {/* B -> A: 332 m (left side) */}
      <ArcLabel cx={CX} cy={CY} r={labelRadius} angleDeg={labelBA} text="332 m" />

      {/* ---- houses ---- */}
      <House cx={hax} cy={hay} color="#4ADE80" label="Ashley" />
      <House cx={hbx} cy={hby} color="#4ADE80" label="Brenda" />
      <House cx={hcx} cy={hcy} color="#4ADE80" label="Cheryl" />
    </svg>
  )
}

// Main export: in-card illustration (no bordered box per house style)
export default function Roundabout25G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bundaran dengan aturan hanya boleh dilewati berlawanan jarum jam. Rumah Ashley di kiri atas, Brenda di kiri bawah, Cheryl di kanan bawah. Jarak Ashley ke Cheryl 207 m, Cheryl ke Brenda 313 m, Brenda ke Ashley 332 m."
    >
      <Roundabout25G2Figure />
    </div>
  )
}
