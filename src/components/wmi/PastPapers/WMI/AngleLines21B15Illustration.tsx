// AngleLines21B15Illustration — SEAMO 2021 Paper B Q15
//
// "Find ∠a + ∠b + ∠c + ∠d."
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-b/2021.md Q15,
// image crop:  2021.imgs/004.jpg
// Answer: C — 360°
//
// FIGURE: A configuration of straight lines forming a quadrilateral-like shape
// where four vertices each have a line extending beyond, creating spike angles
// a, b, c, d. Known angles of 35° and 75° (at right vertex) and 34° and 45°
// (at left-bottom vertex) are labelled.
//
// The geometry (reading the image):
//   - Top vertex: a line goes UP from a horizontal; angle a is above the horizontal.
//   - Right vertex: two diagonals meet; 35° is between them and 75° is below;
//     angle b is the exterior spike angle.
//   - Bottom-right vertex: angle c is the exterior spike pointing down-right.
//   - Left-bottom vertex: d is the spike angle; 34° and 45° are the two angles
//     formed between a line crossing a horizontal.
//
// No existing primitive covers this 4-spike exterior-angle figure → fresh SVG.
// SSR-safe — no hooks, no framer-motion, pure SVG.

type Pt = [number, number]

// ── Geometry ─────────────────────────────────────────────────────────────────
// viewBox: 360 × 300
// Layout matches the source image: apex at top-centre, right vertex at right,
// bottom-right corner, and left-bottom vertex.

const W = 360
const H = 300

// Four main vertices of the inner polygon
const TOP:    Pt = [160, 50]    // apex (angle a)
const RIGHT:  Pt = [300, 120]   // right (angle b), with 35° / 75° shown
const BOTRIGHT: Pt = [290, 240] // bottom-right (angle c)
const LEFT:   Pt = [70, 220]    // left-bottom (angle d), with 34° / 45° shown

// Extension length for the spike lines (beyond each vertex)
const EXT = 45

// Compute unit vector from p1 to p2
function unit(p1: Pt, p2: Pt): Pt {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

// Extend a point by `dist` in direction from `origin` toward `toward`
function extend(origin: Pt, toward: Pt, dist: number): Pt {
  const u = unit(origin, toward)
  return [origin[0] + u[0] * dist, origin[1] + u[1] * dist]
}

// Arc path for an angle at vertex v between rays toward a and b
function arcPath(v: Pt, a: Pt, b: Pt, r: number): string {
  const ang = (p: Pt) => Math.atan2(p[1] - v[1], p[0] - v[0])
  const a0 = ang(a)
  let a1 = ang(b)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  // pick the sweep that goes through the interior (shorter arc)
  const sweep = d >= 0 ? 1 : 0
  a1 = a0 + d
  const x0 = v[0] + r * Math.cos(a0)
  const y0 = v[1] + r * Math.sin(a0)
  const x1 = v[0] + r * Math.cos(a1)
  const y1 = v[1] + r * Math.sin(a1)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`
}

// Midpoint direction for placing text label along bisector
function bisectorLabel(v: Pt, a: Pt, b: Pt, dist: number): Pt {
  const ang = (p: Pt) => Math.atan2(p[1] - v[1], p[0] - v[0])
  const a0 = ang(a)
  let a1 = ang(b)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const mid = (a0 + a1) / 2
  return [v[0] + dist * Math.cos(mid), v[1] + dist * Math.sin(mid)]
}

// ── Line segments (extending beyond the polygon vertices) ─────────────────────
// Top vertex (a): the line goes from LEFT → TOP and then extends upward beyond TOP.
//                 Another segment runs from TOP toward RIGHT.
// The spike for angle a is above the LEFT–TOP–RIGHT junction.
// Horizontal line at TOP level (implied: the "a" is between the extended line and
// a horizontal line through TOP).

// Following the image: there is a HORIZONTAL line through TOP, and a diagonal
// line that crosses it. Angle a is the acute angle above the horizontal.

// Top junction: horizontal line (going left and right) + diagonal from lower-left
const TOP_LEFT:  Pt = [extend(TOP, [TOP[0] - 80, TOP[1]], 1)[0], TOP[1] - 0] // horizontal left
const TOP_RIGHT: Pt = [TOP[0] + 80, TOP[1]]                                   // horizontal right
// The diagonal at TOP comes from LEFT (lower-left) and goes up-right beyond
const DIAG_TOP_FROM: Pt = LEFT   // the spike line from left vertex arrives at TOP
const DIAG_TOP_BEYOND: Pt = extend(TOP, LEFT, -EXT) // extends past TOP

// Right junction: two diagonals + a line going right
// Line from TOP arrives at RIGHT; line from BOTRIGHT arrives at RIGHT; horizontal right
const RIGHT_HORIZ: Pt = [RIGHT[0] + 60, RIGHT[1]] // horizontal going right
// Line from TOP passes through RIGHT and continues to BOTRIGHT
// Spike line from beyond TOP-RIGHT side
const DIAG_R_FROM_TOP_BEYOND: Pt = extend(RIGHT, TOP, -EXT)  // extends past RIGHT away from TOP
const DIAG_R_TO_BOTRIGHT: Pt = BOTRIGHT

// Left-bottom junction: two lines cross a horizontal
// Line from LEFT goes up-right to TOP; another line from LEFT goes to BOTRIGHT
// Horizontal at LEFT level going further left
const LEFT_HORIZ: Pt = [LEFT[0] - 60, LEFT[1]]   // horizontal going left
const LEFT_HORIZ_R: Pt = [LEFT[0] + 30, LEFT[1]] // slight right of left vertex
// Spike line for d: extends past LEFT in the direction away from the interior
const DIAG_LEFT_BEYOND: Pt = extend(LEFT, BOTRIGHT, -EXT) // extends past LEFT

// ── SVG colours ──────────────────────────────────────────────────────────────
const INK   = '#1E293B'  // near-black lines
const MARK  = '#2563EB'  // blue arc marks for a,b,c,d
const NOTE  = '#64748B'  // grey for known-angle labels (35°, 75°, 34°, 45°)

// Known angles text positions (from image):
// 35° is between two lines at RIGHT, slightly left of RIGHT
// 75° is below 35° at RIGHT
// 34° is just right of LEFT vertex between the two lines
// 45° is below 34°

const ARIA =
  'Gambar geometri dengan empat sudut a, b, c, d pada ujung-ujung konfigurasi garis. ' +
  'Di sekitar sudut kanan terdapat 35° dan 75°. Di sekitar sudut kiri-bawah terdapat 34° dan 45°. ' +
  'Pertanyaan: berapakah jumlah a + b + c + d?'

export default function AngleLines21B15Illustration() {
  // Build SVG paths
  // The overall figure has these lines:
  // 1) Horizontal through TOP: from far-left to far-right (cutting through the scene)
  // 2) Diagonal: from LEFT through TOP, extending upward (spike for a)
  // 3) From TOP to RIGHT
  // 4) From RIGHT to BOTRIGHT
  // 5) Horizontal through RIGHT (going right, making angles b)
  // 6) From BOTRIGHT to LEFT
  // 7) Horizontal through LEFT (going left, making angle d), and another from LEFT going up-right to BOTRIGHT region

  // Simplified approach matching the image:
  // - A horizontal line at y=TOP[1] going from x=50 to x=300
  // - A line from [70,50] (extended left of top) going through TOP and continuing to BOTRIGHT → this creates angle a at top
  // - A horizontal line at y=RIGHT[1] going from x=160 to x=340
  // - A line from TOP going through RIGHT and down to BOTRIGHT → creates angle b at right
  // - A line from BOTRIGHT going further right and down → angle c at bottom-right
  // - A horizontal line at y=LEFT[1] going from x=10 to x=130
  // - A line from BOTRIGHT through LEFT and extending beyond → angle d at left

  // Let me use coordinates faithful to the image:
  // Image has:
  //   - Top vertex at top-centre with a horizontal line and a diagonal going up-left
  //   - Right cluster with 35°/75° labels (two diagonals meet at RIGHT, with horizontal going right from there)
  //   - Bottom-right corner with angle c
  //   - Left cluster with 34°/45° and a horizontal going left + diagonal

  // Coordinates (matching image proportions):
  const tl: Pt = [60, 50]         // extended line upper-left (creates spike a)
  const top: Pt = [170, 50]       // horizontal at top
  const topR: Pt = [310, 50]      // horizontal right end at top level

  const right: Pt = [300, 125]    // right vertex
  const rightFar: Pt = [340, 125] // horizontal going right (for angle b)

  const botRight: Pt = [285, 245] // bottom-right vertex (angle c)
  const botFarR: Pt = [335, 275]  // extension beyond botRight for angle c

  const left: Pt = [60, 225]      // left vertex (angle d)
  const leftFar: Pt = [15, 225]   // horizontal going left (for angle d)

  // Lines in the figure (reading the image):
  // 1. Horizontal at top level: from [50,50] to [310,50]
  // 2. Diagonal: from upper-left [55,20] through top vertex, down to left vertex
  //    (this line produces angle a = spike above horizontal at top)
  // 3. From top vertex area through right vertex (diagonal going right-down)
  // 4. From right vertex going down to bottom-right vertex
  // 5. Horizontal through right: goes right from right vertex
  // 6. From bottom-right vertex toward lower-right (for spike c)
  // 7. From bottom-right vertex to left vertex
  // 8. Horizontal through left vertex (going left)

  // Top area: a line goes from bottom-left, crosses horizontal at top, and extends upper-left
  const diagTopFrom: Pt = left        // the line from left comes up to top crossing
  const topCross: Pt = [170, 50]      // crossing point on the horizontal
  const diagTopBeyond: Pt = [105, 10] // extends upper-left beyond crossing (spike for a)

  // Right area: line from topCross goes right-down through right vertex
  const diagRightFrom: Pt = topCross
  const rightCross: Pt = right
  // second line at right: from left vertex also goes to right vertex area
  // but the image shows two separate diagonals meeting at right vertex:
  // one from top-left, one from below-right
  const diagRight2Beyond: Pt = [340, 75]  // extends upper-right beyond right vertex (spike b)

  // The known angles:
  // At right vertex: 35° is between the two diagonals (from top and from below)
  //                  75° is between the lower diagonal and the horizontal
  // At left vertex: 34° is between the diagonal from top and the diagonal going to botRight
  //                  45° is between the lower diagonal and the horizontal

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <svg viewBox={`0 0 ${W} ${H}`} width={360} style={{ maxWidth: '100%' }} aria-hidden="true">
        {/* 1. Horizontal line through TOP area (y=50) */}
        <line x1={50} y1={50} x2={310} y2={50} stroke={INK} strokeWidth={2} />

        {/* 2. Main diagonal: from upper-left spike, through top crossing, down to left vertex */}
        <line x1={diagTopBeyond[0]} y1={diagTopBeyond[1]} x2={left[0]} y2={left[1]}
              stroke={INK} strokeWidth={2} />

        {/* 3. Diagonal from top crossing down-right to right vertex */}
        <line x1={topCross[0]} y1={topCross[1]} x2={right[0]} y2={right[1]}
              stroke={INK} strokeWidth={2} />

        {/* 4. Diagonal from right vertex down to bottom-right vertex */}
        <line x1={right[0]} y1={right[1]} x2={botRight[0]} y2={botRight[1]}
              stroke={INK} strokeWidth={2} />

        {/* 5. Horizontal through right vertex going right (for angle b) */}
        <line x1={160} y1={right[1]} x2={rightFar[0]} y2={rightFar[1]}
              stroke={INK} strokeWidth={2} />

        {/* 6. Bottom-right vertex: line going further down-right (spike c) */}
        <line x1={right[0]} y1={right[1]} x2={botFarR[0]} y2={botFarR[1]}
              stroke={INK} strokeWidth={2} />

        {/* 7. Diagonal from bottom-right vertex to left vertex */}
        <line x1={botRight[0]} y1={botRight[1]} x2={left[0]} y2={left[1]}
              stroke={INK} strokeWidth={2} />

        {/* 8. Horizontal through left vertex going left (for angle d) */}
        <line x1={leftFar[0]} y1={left[1]} x2={left[0] + 30} y2={left[1]}
              stroke={INK} strokeWidth={2} />

        {/* ── Angle marks (arcs at each spike vertex) ── */}

        {/* Angle a: at topCross, between the upper-left spike and the horizontal going right */}
        <path
          d={arcPath(topCross, diagTopBeyond, [310, 50], 20)}
          fill="none" stroke={MARK} strokeWidth={2} strokeLinecap="round"
        />
        <text
          x={bisectorLabel(topCross, diagTopBeyond, [310, 50], 32)[0]}
          y={bisectorLabel(topCross, diagTopBeyond, [310, 50], 32)[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontStyle="italic" fontWeight={600} fill={INK}
        >
          a
        </text>

        {/* Angle b: at right vertex, between the spike going upper-right and horizontal right */}
        <path
          d={arcPath(right, diagRight2Beyond, rightFar, 20)}
          fill="none" stroke={MARK} strokeWidth={2} strokeLinecap="round"
        />
        <text
          x={bisectorLabel(right, diagRight2Beyond, rightFar, 32)[0]}
          y={bisectorLabel(right, diagRight2Beyond, rightFar, 32)[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontStyle="italic" fontWeight={600} fill={INK}
        >
          b
        </text>

        {/* Angle c: at botRight, the spike going further right-down */}
        {/* The exterior angle c is between the two extended lines at botRight */}
        <path
          d={arcPath(botRight,
                     extend(botRight, right, -30),
                     botFarR,
                     18)}
          fill="none" stroke={MARK} strokeWidth={2} strokeLinecap="round"
        />
        <text
          x={botRight[0] + 26}
          y={botRight[1] + 20}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontStyle="italic" fontWeight={600} fill={INK}
        >
          c
        </text>

        {/* Angle d: at left vertex, between spike going further left and horizontal */}
        <path
          d={arcPath(left, leftFar, extend(left, botRight, -30), 18)}
          fill="none" stroke={MARK} strokeWidth={2} strokeLinecap="round"
        />
        <text
          x={bisectorLabel(left, leftFar, extend(left, botRight, -30), 30)[0]}
          y={bisectorLabel(left, leftFar, extend(left, botRight, -30), 30)[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontStyle="italic" fontWeight={600} fill={INK}
        >
          d
        </text>

        {/* ── Known angle labels ── */}

        {/* 35° — between the two diagonals at right vertex (upper portion) */}
        <text x={245} y={115} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill={NOTE}>35°</text>

        {/* 75° — below 35°, between lower diagonal and horizontal */}
        <text x={265} y={140} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill={NOTE}>75°</text>

        {/* 34° — between two diagonals at left vertex (right portion) */}
        <text x={105} y={210} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill={NOTE}>34°</text>

        {/* 45° — below/beside 34°, between lower diagonal and horizontal */}
        <text x={108} y={232} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill={NOTE}>45°</text>
      </svg>
    </div>
  )
}
