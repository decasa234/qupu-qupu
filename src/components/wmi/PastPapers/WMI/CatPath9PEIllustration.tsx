// IKMC-21-PE-Q9 — "Rose the cat walks along the wall. She starts at point B and
// follows the direction of the arrows shown in the picture. The cat walks a total
// of 20 metres. Where does she end up?"
//
// The figure shows a rectangular room wall with labelled points A–E and arrows
// indicating the direction the cat walks. Distances are:
//   B → C: 4 m   (bottom wall, rightward)
//   C → D: 1 m   (right wall, upward)
//   D → E: 5 m   (top wall, leftward)
//   E → A: 2 m   (left wall, downward)
//   A → B: 3 m   (bottom wall, rightward)
//
// The cat STARTS at B. After 20 m she is at D.
// Circuit total = 4+1+5+2+3 = 15 m per loop.
// After 15 m she is back at B. Remaining 5 m: B→C (4 m) + C→D (1 m) = at D.
//
// PROBLEM-ONLY illustration. Does NOT reveal the answer.
// SSR-safe — no window / document access at module level.

// ── Shared layout constants (re-exported for the explainer) ──────────────────

/** SVG viewBox width */
export const SVG_W = 320

/** SVG viewBox height */
export const SVG_H = 220

/** Rectangle corners in SVG space (top-left origin) */
export const RECT = {
  x: 40,
  y: 40,
  w: 220,
  h: 140,
} as const

/** Colour palette */
export const COLOR = {
  BG: '#FFFFFF',
  WALL: '#374151',
  WALL_FILL: '#F3F4F6',
  POINT: '#1D4ED8',
  POINT_LABEL: '#1E3A8A',
  START: '#DC2626',
  ARROW: '#6B7280',
  DIST_LABEL: '#374151',
  CAT_FILL: '#92400E',
} as const

// ── Point coordinates ─────────────────────────────────────────────────────────
//
// We lay out the 5 points on the perimeter of the rectangle.
// Bottom-left = A, then B is to the right of A along the bottom,
// C is at the bottom-right corner, D is up the right wall from C,
// E is at the top-right corner (but layout: the top side goes E→D reversed),
// actually per figure: going clockwise from bottom-left:
//   A (bottom-left), B (bottom, between A and C), C (bottom-right)
//   D (right wall, near top), E (top-left corner area)
//
// Looking at the original image: the perimeter path goes
//   B (bottom-middle) → C (right-bottom) → D (right-top ish) → E (top-left) → A (left-mid) → B
// with the BOTTOM as starting area.
//
// We map:
//   B → on the bottom edge, proportional to 3m from left vs total bottom 3+4=7m
//   A → bottom-left corner
//   E → top-left corner
//   D → top-right corner (but D is 1m up from C on right wall; let's adjust)
//   C → bottom-right corner
//
// Segments along perimeter (going clockwise from B):
//   B→C: 4m right along bottom (B is 3m from A=bottom-left, C=bottom-right)
//   C→D: 1m up right wall
//   D→E: 5m left along top
//   E→A: 2m down left wall
//   A→B: 3m right along bottom
//
// Total bottom = 3(A→B) + 4(B→C) = 7m → scale right wall: 1m out of (1+5)=6m total perimeter vertical
// For visual clarity use a simple rectangle. Scale by 10px/m.

// Rectangle: bottom-left = A, bottom goes 7m (70px), right side: total vertical segments = 1+2 = but
// let's just pick nice pixel positions:
// Actual rect is 200px wide × 100px tall; points positioned proportionally.

const R = RECT

// Bottom edge total: A→B (3m) + B→C (4m) = 7m  → 200px total → scale = 200/7 ≈ 28.6 px/m
const BOTTOM_SCALE = R.w / 7 // px per metre along bottom

// Right wall: D is 1m up from C; left wall: E→A is 2m total height
// R.h represents 2m total visible wall height.
const RIGHT_SCALE = R.h / 2  // 1m up from C

/** Named points in SVG space */
export const POINTS: Record<string, [number, number]> = {
  A: [R.x,                        R.y + R.h],            // bottom-left corner
  B: [R.x + 3 * BOTTOM_SCALE,     R.y + R.h],            // 3m from A along bottom
  C: [R.x + R.w,                  R.y + R.h],            // bottom-right corner
  D: [R.x + R.w,                  R.y + R.h - 1 * RIGHT_SCALE], // 1m up right wall from C
  E: [R.x,                        R.y],                  // top-left corner
}

// ── Cat glyph (re-used from CatPath17 style) ─────────────────────────────────

export function CatGlyph({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  const earH = r * 0.55
  const earW = r * 0.45
  const leftEarX = cx - r * 0.55
  const rightEarX = cx + r * 0.55
  const earBaseY = cy - r * 0.62

  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill={COLOR.CAT_FILL} stroke="#1F2937" strokeWidth={1.2} />
      <polygon
        points={`${leftEarX - earW},${earBaseY - earH} ${leftEarX + earW},${earBaseY - earH} ${leftEarX},${cy - r * 0.85}`}
        fill={COLOR.CAT_FILL}
        stroke="#1F2937"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <polygon
        points={`${rightEarX - earW},${earBaseY - earH} ${rightEarX + earW},${earBaseY - earH} ${rightEarX},${cy - r * 0.85}`}
        fill={COLOR.CAT_FILL}
        stroke="#1F2937"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <circle cx={cx - r * 0.32} cy={cy - r * 0.12} r={r * 0.14} fill="#3B82F6" />
      <circle cx={cx + r * 0.32} cy={cy - r * 0.12} r={r * 0.14} fill="#3B82F6" />
      <polygon
        points={`${cx},${cy + r * 0.18} ${cx - r * 0.1},${cy + r * 0.08} ${cx + r * 0.1},${cy + r * 0.08}`}
        fill="#F472B6"
      />
      <line x1={cx - r * 0.05} y1={cy + r * 0.2} x2={cx - r * 0.65} y2={cy + r * 0.15} stroke="#D1D5DB" strokeWidth={0.8} />
      <line x1={cx - r * 0.05} y1={cy + r * 0.26} x2={cx - r * 0.65} y2={cy + r * 0.32} stroke="#D1D5DB" strokeWidth={0.8} />
      <line x1={cx + r * 0.05} y1={cy + r * 0.2} x2={cx + r * 0.65} y2={cy + r * 0.15} stroke="#D1D5DB" strokeWidth={0.8} />
      <line x1={cx + r * 0.05} y1={cy + r * 0.26} x2={cx + r * 0.65} y2={cy + r * 0.32} stroke="#D1D5DB" strokeWidth={0.8} />
    </g>
  )
}

// ── Arrow helper ──────────────────────────────────────────────────────────────

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len
  const uy = dy / len
  const hl = 10
  const hw = 5
  // Move arrowhead back from endpoint
  const tipX = x2
  const tipY = y2
  const baseX = tipX - ux * hl
  const baseY = tipY - uy * hl
  const perpX = -uy
  const perpY = ux
  return (
    <g>
      <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polygon
        points={`${tipX},${tipY} ${baseX + perpX * hw},${baseY + perpY * hw} ${baseX - perpX * hw},${baseY - perpY * hw}`}
        fill={color}
      />
    </g>
  )
}

// ── Segment midpoint helper ───────────────────────────────────────────────────

function mid(p1: [number, number], p2: [number, number]): [number, number] {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * CatPath9PEIllustration
 *
 * Static problem figure for IKMC-21-PE-Q9.
 * Shows a rectangular wall path with points A–E and labelled segment distances.
 * The cat (Rose) is shown at the starting point B.
 * Arrows indicate the direction of travel.
 * Does NOT reveal where the cat ends up.
 */
export default function CatPath9PEIllustration() {
  const A = POINTS.A
  const B = POINTS.B
  const C = POINTS.C
  const D = POINTS.D
  const E = POINTS.E

  // Path goes: B→C→D→E→A→B (one circuit, shown as directed arrows)
  const arrowColor = '#4B5563'

  // Point dot radius
  const dotR = 5

  // Label offsets (avoid overlapping walls)
  const labelOff: Record<string, [number, number]> = {
    A: [-14, 12],
    B: [0, 14],
    C: [10, 12],
    D: [12, 0],
    E: [-14, -8],
  }

  // Distance label positions (midpoint of each segment, offset away from the wall)
  const distLabels: Array<{ text: string; x: number; y: number }> = [
    { text: '4 m', x: mid(B, C)[0], y: mid(B, C)[1] + 14 },   // bottom: offset down
    { text: '1 m', x: mid(C, D)[0] + 16, y: mid(C, D)[1] },   // right wall: offset right
    { text: '5 m', x: mid(D, E)[0], y: mid(D, E)[1] - 12 },   // top: offset up
    { text: '2 m', x: mid(E, A)[0] - 16, y: mid(E, A)[1] },   // left wall: offset left
    { text: '3 m', x: mid(A, B)[0], y: mid(A, B)[1] + 14 },   // bottom: offset down
  ]

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Jalur persegi panjang sepanjang dinding dengan titik-titik berlabel A, B, C, D, E. ' +
        'Kucing Rose mulai dari titik B. Panah menunjukkan arah berjalan. ' +
        'Jarak antar titik ditunjukkan dalam meter. Berapa meter yang diperlukan untuk mencapai setiap titik?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* White background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* Wall rectangle fill */}
        <rect
          x={R.x}
          y={R.y}
          width={R.w}
          height={R.h}
          fill={COLOR.WALL_FILL}
          stroke={COLOR.WALL}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Directed arrows along the path: B→C→D→E→A→B */}
        <Arrow x1={B[0]} y1={B[1] - 4} x2={C[0] - 4} y2={C[1] - 4} color={arrowColor} />
        <Arrow x1={C[0] - 4} y1={C[1]} x2={D[0] - 4} y2={D[1] + 4} color={arrowColor} />
        <Arrow x1={D[0]} y1={D[1] - 4} x2={E[0] + 4} y2={E[1] + 4} color={arrowColor} />
        <Arrow x1={E[0] + 4} y1={E[1]} x2={A[0] + 4} y2={A[1] - 4} color={arrowColor} />
        <Arrow x1={A[0]} y1={A[1] - 4} x2={B[0] - 4} y2={B[1] - 4} color={arrowColor} />

        {/* Distance labels */}
        {distLabels.map(({ text, x, y }) => (
          <text
            key={text}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={COLOR.DIST_LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {text}
          </text>
        ))}

        {/* Point dots */}
        {Object.entries(POINTS).map(([name, [px, py]]) => (
          <circle
            key={name}
            cx={px}
            cy={py}
            r={dotR}
            fill={name === 'B' ? COLOR.START : COLOR.POINT}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* Point labels */}
        {Object.entries(POINTS).map(([name, [px, py]]) => {
          const [ox, oy] = labelOff[name] ?? [0, 10]
          return (
            <text
              key={`lbl-${name}`}
              x={px + ox}
              y={py + oy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={900}
              fill={name === 'B' ? COLOR.START : COLOR.POINT_LABEL}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {name}
            </text>
          )
        })}

        {/* Cat at starting point B */}
        <CatGlyph cx={B[0]} cy={B[1] - 22} r={13} />

        {/* "START" label above cat */}
        <text
          x={B[0]}
          y={B[1] - 40}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={700}
          fill={COLOR.START}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          START
        </text>
      </svg>
    </div>
  )
}
