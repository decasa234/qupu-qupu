/**
 * WMI-24F3A-Q9 — In-card illustration.
 *
 * Four identical 3-4-5 right triangles arranged to form a trapezoid.
 * Two valid trapezoids exist:
 *   Trapezoid A: parallel bases 3 & 9, legs 5 & 5, height 4  → perimeter 22
 *   Trapezoid B: parallel bases 4 & 12, legs 5 & 5, height 3 → perimeter 26
 *
 * The figure shows BOTH arrangements side-by-side with labelled outer sides.
 * It does NOT indicate which perimeter is correct (the answer is "both", E).
 *
 * Pure render — no Math.random, no Date, no useState/useEffect side effects.
 * SSR-safe and deterministic.
 */

// ── colour constants ───────────────────────────────────────────────────────────
const INK       = '#1F2937'   // near-black outlines and labels
const FILL_A    = '#D1E8F5'   // light blue fill — Trapezoid A triangles
const FILL_B    = '#D5EDD5'   // light green fill — Trapezoid B triangles
const DASH_CLR  = '#6B7280'   // grey for internal construction lines
const LABEL_CLR = '#92400E'   // amber-brown for side-length labels

// ── geometry helpers ───────────────────────────────────────────────────────────

/**
 * Trapezoid A — bases 3 & 9, height 4, legs 5.
 * Placed with long base at the bottom.
 *
 * Vertices (SVG coords, y↓):
 *   TL = (3, 0),  TR = (6, 0)   ← top edge, length 3
 *   BL = (0, 4),  BR = (9, 4)   ← bottom edge, length 9
 *
 * Scaled by SCALE_A pixels-per-unit.
 */
const SCALE_A = 22   // 1 cm → 22 px  (9 cm × 22 = 198 px; height 4 × 22 = 88 px)

function trapAPoints(ox: number, oy: number) {
  const S = SCALE_A
  return {
    TL: [ox + 3 * S, oy         ] as [number, number],
    TR: [ox + 6 * S, oy         ] as [number, number],
    BL: [ox + 0    , oy + 4 * S ] as [number, number],
    BR: [ox + 9 * S, oy + 4 * S ] as [number, number],
    // internal nodes (from dividing into 4 triangles)
    ML: [ox + 3 * S, oy + 4 * S ] as [number, number],  // (3,4) on bottom
    MR: [ox + 6 * S, oy + 4 * S ] as [number, number],  // (6,4) on bottom
  }
}

/**
 * Trapezoid B — bases 4 & 12, height 3, legs 5.
 * Placed with long base at the bottom.
 *
 * Vertices (SVG coords, y↓):
 *   TL = (4, 0),  TR = (8, 0)   ← top edge, length 4
 *   BL = (0, 3),  BR = (12, 3)  ← bottom edge, length 12
 *
 * Scaled by SCALE_B pixels-per-unit.
 */
const SCALE_B = 18   // 1 cm → 18 px  (12 cm × 18 = 216 px; height 3 × 18 = 54 px)

function trapBPoints(ox: number, oy: number) {
  const S = SCALE_B
  return {
    TL: [ox + 4 * S, oy         ] as [number, number],
    TR: [ox + 8 * S, oy         ] as [number, number],
    BL: [ox + 0    , oy + 3 * S ] as [number, number],
    BR: [ox + 12 * S, oy + 3 * S] as [number, number],
    // internal nodes
    ML: [ox + 4 * S, oy + 3 * S ] as [number, number],  // (4,3) on bottom
    MR: [ox + 8 * S, oy + 3 * S ] as [number, number],  // (8,3) on bottom
  }
}

// ── viewBox sizing ─────────────────────────────────────────────────────────────
// Layout: two trapezoids stacked vertically with a gap, centred.
//
//  Trapezoid A width  = 9 × 22 = 198 px,   height = 4 × 22 = 88 px
//  Trapezoid B width  = 12 × 18 = 216 px,  height = 3 × 18 = 54 px
//
// SVG canvas: wide enough for B (wider), tall enough for both + labels + gap.

const PAD     = 22          // outer padding
const LABEL_H = 20          // height reserved for perimeter label below each shape
const GAP     = 32          // vertical gap between the two trapezoids
const TITLE_H = 18          // vertical space above each trapezoid for "Trapesium A/B" title

const A_W = 9  * SCALE_A   // 198
const A_H = 4  * SCALE_A   // 88
const B_W = 12 * SCALE_B   // 216
const B_H = 3  * SCALE_B   // 54

const VB_W  = B_W + PAD * 2                              // 260
const VB_H  = PAD + TITLE_H + A_H + LABEL_H + GAP + TITLE_H + B_H + LABEL_H + PAD  // ≈ 366

// Offsets: centre both shapes horizontally within the wider (B) bounding box.
const A_OX = PAD + (B_W - A_W) / 2
const A_OY = PAD + TITLE_H
const B_OX = PAD
const B_OY = PAD + TITLE_H + A_H + LABEL_H + GAP + TITLE_H

// ── sub-components ─────────────────────────────────────────────────────────────

/** Draws a right-angle marker at a corner. */
function RightAngle({
  cx, cy, dx, dy, size = 7,
}: {
  cx: number; cy: number;
  dx: number; dy: number;   // unit vectors pointing along the two legs
  size?: number;
}) {
  // dx, dy are the two perpendicular directions along the legs from corner
  // We draw a small square: corner + size*(d1) + size*(d2) + etc.
  // Provide four points of the square pocket.
  const p1x = cx + dx * size
  const p1y = cy + dy * size
  const p3x = cx + dx * size - dy * size
  const p3y = cy + dy * size + dx * size
  const p2x = cx - dy * size
  const p2y = cy + dx * size
  return (
    <polyline
      points={`${p1x},${p1y} ${p3x},${p3y} ${p2x},${p2y}`}
      fill="none"
      stroke={INK}
      strokeWidth={1.2}
      strokeLinejoin="miter"
    />
  )
}

/**
 * TrapezoidAFigure — draws the 3&9 trapezoid (height 4) divided into 4 triangles.
 * Origin (ox, oy) is the top-left of its bounding box.
 */
function TrapezoidAFigure({ ox, oy }: { ox: number; oy: number }) {
  const { TL, TR, BL, BR, ML, MR } = trapAPoints(ox, oy)

  // The 4 right triangles:
  //   T1: BL, ML, TL  — right angle at ML=(3,4): horiz leg=3, vert leg=4
  //   T2: ML, TL, TR  — right angle at TL=(3,0): horiz leg=3, vert leg=4
  //   T3: ML, TR, MR  — right angle at MR=(6,4): horiz leg=3, vert leg=4
  //   T4: MR, TR, BR  — right angle at MR=(6,4): horiz leg=3, vert leg=4
  // Internal construction lines: ML→TL (already part of outline), MR→TR, ML→TR (diag)

  const polyA = (pts: [number, number][]) =>
    pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <g>
      {/* Filled triangles */}
      <polygon
        points={polyA([BL, ML, TL])}
        fill={FILL_A}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyA([ML, TL, TR])}
        fill={FILL_A}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyA([ML, TR, MR])}
        fill={FILL_A}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyA([MR, TR, BR])}
        fill={FILL_A}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* Internal construction lines (dashed grey) */}
      {/* Vertical: TL→ML (already in outline, re-draw dashed for clarity) */}
      <line
        x1={TL[0]} y1={TL[1]} x2={ML[0]} y2={ML[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />
      {/* Vertical: TR→MR */}
      <line
        x1={TR[0]} y1={TR[1]} x2={MR[0]} y2={MR[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />
      {/* Diagonal: ML→TR (shared hypotenuse of T2 and T3) */}
      <line
        x1={ML[0]} y1={ML[1]} x2={TR[0]} y2={TR[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />

      {/* Right-angle markers */}
      {/* T1 right angle at ML: legs go left (−x) and up (−y) */}
      <RightAngle cx={ML[0]} cy={ML[1]} dx={-1} dy={0} size={7} />
      {/* T2 right angle at TL: legs go right (+x) and down (+y) */}
      <RightAngle cx={TL[0]} cy={TL[1]} dx={1} dy={0} size={7} />
      {/* T4 right angle at MR: legs go left (−x) and up (−y) */}
      <RightAngle cx={MR[0]} cy={MR[1]} dx={-1} dy={0} size={7} />

      {/* Side-length labels on the outer boundary */}
      {/* Top base: "3 cm" centred above TL→TR */}
      <text
        x={(TL[0] + TR[0]) / 2}
        y={TL[1] - 6}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        3
      </text>
      {/* Bottom base: "9 cm" centred below BL→BR */}
      <text
        x={(BL[0] + BR[0]) / 2}
        y={BL[1] + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        9
      </text>
      {/* Left leg: "5" — along BL→TL, offset left */}
      <text
        x={(BL[0] + TL[0]) / 2 - 12}
        y={(BL[1] + TL[1]) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        5
      </text>
      {/* Right leg: "5" — along BR→TR, offset right */}
      <text
        x={(BR[0] + TR[0]) / 2 + 12}
        y={(BR[1] + TR[1]) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        5
      </text>
      {/* Height annotation "4 cm" on the right side interior (optional clarity) */}
      <text
        x={BR[0] + 6}
        y={(BL[1] + TL[1]) / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={10}
        fill={DASH_CLR}
      >
        h=4
      </text>
    </g>
  )
}

/**
 * TrapezoidBFigure — draws the 4&12 trapezoid (height 3) divided into 4 triangles.
 */
function TrapezoidBFigure({ ox, oy }: { ox: number; oy: number }) {
  const { TL, TR, BL, BR, ML, MR } = trapBPoints(ox, oy)

  // The 4 right triangles:
  //   T1: BL, ML, TL  — right angle at ML=(4,3): horiz leg=4, vert leg=3
  //   T2: ML, TL, TR  — right angle at TL=(4,0): horiz leg=4, vert leg=3
  //   T3: ML, TR, MR  — right angle at MR=(8,3): horiz leg=4, vert leg=3
  //   T4: MR, TR, BR  — right angle at MR=(8,3): horiz leg=4, vert leg=3

  const polyB = (pts: [number, number][]) =>
    pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <g>
      {/* Filled triangles */}
      <polygon
        points={polyB([BL, ML, TL])}
        fill={FILL_B}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyB([ML, TL, TR])}
        fill={FILL_B}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyB([ML, TR, MR])}
        fill={FILL_B}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <polygon
        points={polyB([MR, TR, BR])}
        fill={FILL_B}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* Internal construction lines (dashed grey) */}
      <line
        x1={TL[0]} y1={TL[1]} x2={ML[0]} y2={ML[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />
      <line
        x1={TR[0]} y1={TR[1]} x2={MR[0]} y2={MR[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />
      <line
        x1={ML[0]} y1={ML[1]} x2={TR[0]} y2={TR[1]}
        stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3"
      />

      {/* Right-angle markers */}
      <RightAngle cx={ML[0]} cy={ML[1]} dx={-1} dy={0} size={7} />
      <RightAngle cx={TL[0]} cy={TL[1]} dx={1} dy={0} size={7} />
      <RightAngle cx={MR[0]} cy={MR[1]} dx={-1} dy={0} size={7} />

      {/* Side-length labels on the outer boundary */}
      {/* Top base: "4" */}
      <text
        x={(TL[0] + TR[0]) / 2}
        y={TL[1] - 6}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        4
      </text>
      {/* Bottom base: "12" */}
      <text
        x={(BL[0] + BR[0]) / 2}
        y={BL[1] + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        12
      </text>
      {/* Left leg: "5" */}
      <text
        x={(BL[0] + TL[0]) / 2 - 12}
        y={(BL[1] + TL[1]) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        5
      </text>
      {/* Right leg: "5" */}
      <text
        x={(BR[0] + TR[0]) / 2 + 12}
        y={(BR[1] + TR[1]) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_CLR}
      >
        5
      </text>
      {/* Height annotation */}
      <text
        x={BR[0] + 6}
        y={(BL[1] + TL[1]) / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={10}
        fill={DASH_CLR}
      >
        h=3
      </text>
    </g>
  )
}

// ── exported primitive ─────────────────────────────────────────────────────────

/**
 * The inner SVG primitive for WMI-24F3A-Q9.
 *
 * Draws both valid trapezoids formed from four 3-4-5 right triangles:
 *   Trapezoid A (blue):  bases 3 & 9,  height 4
 *   Trapezoid B (green): bases 4 & 12, height 3
 *
 * Each trapezoid shows the four constituent right triangles with dashed
 * internal division lines and labelled outer sides.  The perimeter totals
 * are NOT shown (problem-only figure).
 *
 * Usable by the animator (accept highlight props in future).
 */
export function Trapezoid24G3Figure() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(280, VB_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Trapezoid A label ── */}
      <text
        x={A_OX + A_W / 2}
        y={A_OY - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={INK}
      >
        Trapesium A
      </text>

      {/* ── Trapezoid A figure ── */}
      <TrapezoidAFigure ox={A_OX} oy={A_OY} />

      {/* ── Separator line between the two trapezoids ── */}
      <line
        x1={PAD}
        y1={A_OY + A_H + LABEL_H + GAP / 2}
        x2={VB_W - PAD}
        y2={A_OY + A_H + LABEL_H + GAP / 2}
        stroke="#E5E7EB"
        strokeWidth={1}
        strokeDasharray="6 4"
      />

      {/* ── Trapezoid B label ── */}
      <text
        x={B_OX + B_W / 2}
        y={B_OY - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={700}
        fill={INK}
      >
        Trapesium B
      </text>

      {/* ── Trapezoid B figure ── */}
      <TrapezoidBFigure ox={B_OX} oy={B_OY} />
    </svg>
  )
}

// ── exported data constants ────────────────────────────────────────────────────

/** Side lengths of each 3-4-5 right triangle piece. */
export const TRIANGLE_SIDES = { short: 3, long: 4, hyp: 5 } as const

/** Trapezoid A geometry (bases 3 & 9, height 4, perimeter 22). */
export const TRAPEZOID_A = {
  topBase: 3,
  bottomBase: 9,
  height: 4,
  leg: 5,
  perimeter: 22,
} as const

/** Trapezoid B geometry (bases 4 & 12, height 3, perimeter 26). */
export const TRAPEZOID_B = {
  topBase: 4,
  bottomBase: 12,
  height: 3,
  leg: 5,
  perimeter: 26,
} as const

// ── default export: in-card illustration ───────────────────────────────────────

/**
 * In-card illustration for WMI-24F3A-Q9.
 *
 * Shows BOTH trapezoids that can be formed from four identical 3-4-5 right
 * triangles.  Outer sides are labelled; internal triangle division lines are
 * shown as dashed grey.  Neither perimeter value is printed — that is the
 * answer, revealed by the explainer.
 *
 * No `params` argument needed — the geometry is fully determined by the
 * problem statement.
 */
export default function Trapezoid24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua trapesium yang dibentuk dari empat segitiga siku-siku 3-4-5 identik. Trapesium A: alas pendek 3, alas panjang 9, kaki 5 dan 5, tinggi 4. Trapesium B: alas pendek 4, alas panjang 12, kaki 5 dan 5, tinggi 3. Garis putus-putus menunjukkan batas keempat segitiga penyusun."
    >
      <Trapezoid24G3Figure />
    </div>
  )
}
