// NestedTriOSN24NT1Q2Illustration — OSN-24-SD-NAS-TEORI1-Q2
//
// Two nested right triangles:
//   Outer — right angle bottom-left, vertical leg 12, horizontal leg a.
//   Inner — right angle bottom-left, vertical leg 4, horizontal leg 3, hypotenuse 5.
// Ratio of areas inner:outer = 1:5. Find a.
//
// The STEM illustration shows only the PROBLEM (no computed areas, no answer).
// Co-exports NestedTriFigure so the explainer can reuse the geometry.
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.

// ── viewBox ────────────────────────────────────────────────────────────────────

export const VW = 190
export const VH = 215

// ── outer triangle vertices ────────────────────────────────────────────────────

export const OA: [number, number] = [28, 188]   // bottom-left (right angle)
export const OB: [number, number] = [28, 22]    // top-left
export const OC: [number, number] = [168, 188]  // bottom-right

// ── inner triangle vertices ────────────────────────────────────────────────────

export const ID: [number, number] = [65, 158]   // bottom-left (right angle)
export const IE: [number, number] = [65, 118]   // top  (vertical leg 4)
export const IF: [number, number] = [105, 158]  // right (horizontal leg 3)

// ── colours ───────────────────────────────────────────────────────────────────

export const COLOR = {
  OUTER_FILL:   '#dbeafe',  // light blue
  INNER_FILL:   '#fef9c3',  // light yellow
  STROKE:       '#1e3a5f',
  LABEL:        '#1a1a2e',
  LABEL_A:      '#1d4ed8',  // blue for unknown side a
}

// ── helpers ───────────────────────────────────────────────────────────────────

/** Right-angle square at corner (cx, cy). Extends inward: right+up for bottom-left corner. */
function RightAngleMark({
  cx,
  cy,
  s = 10,
  dx = 1,
  dy = -1,
}: {
  cx: number
  cy: number
  s?: number
  dx?: number
  dy?: number
}) {
  return (
    <path
      d={`M ${cx} ${cy + dy * s} L ${cx + dx * s} ${cy + dy * s} L ${cx + dx * s} ${cy}`}
      fill="none"
      stroke={COLOR.STROKE}
      strokeWidth={1.6}
      strokeLinejoin="miter"
    />
  )
}

// ── NestedTriFigure (shared primitive) ────────────────────────────────────────

export interface NestedTriFigureProps {
  /** Tint inner triangle (use during explainer to draw attention to it). */
  highlightInner?: boolean
  /** Tint outer triangle shell. */
  highlightOuter?: boolean
  /** Show 'a' label on the outer bottom leg (default true). */
  showLabelA?: boolean
  /** Override the bottom-leg label text (default 'a'). */
  labelA?: string
}

/**
 * NestedTriFigure — co-exported pure-SVG fragment (emits a <g>).
 * Wrap in an <svg viewBox={`0 0 ${VW} ${VH}`}> for standalone use.
 */
export function NestedTriFigure({
  highlightInner = false,
  highlightOuter = false,
  showLabelA = true,
  labelA = 'a',
}: NestedTriFigureProps = {}) {
  const outerFill = highlightOuter ? '#93c5fd' : COLOR.OUTER_FILL
  const innerFill = highlightInner ? '#fde68a' : COLOR.INNER_FILL
  const font = 'ui-sans-serif, system-ui, sans-serif'

  // midpoints for labels
  const outerLeftMidY = (OA[1] + OB[1]) / 2
  const outerBotMidX  = (OA[0] + OC[0]) / 2
  const innerLeftMidY = (ID[1] + IE[1]) / 2
  const innerBotMidX  = (ID[0] + IF[0]) / 2
  const hypMidX       = (IE[0] + IF[0]) / 2
  const hypMidY       = (IE[1] + IF[1]) / 2

  return (
    <g>
      {/* ── Outer triangle ── */}
      <polygon
        points={`${OA[0]},${OA[1]} ${OB[0]},${OB[1]} ${OC[0]},${OC[1]}`}
        fill={outerFill}
        stroke={COLOR.STROKE}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      {/* ── Inner triangle ── */}
      <polygon
        points={`${ID[0]},${ID[1]} ${IE[0]},${IE[1]} ${IF[0]},${IF[1]}`}
        fill={innerFill}
        stroke={COLOR.STROKE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* ── Right-angle marks ── */}
      <RightAngleMark cx={OA[0]} cy={OA[1]} s={11} dx={1} dy={-1} />
      <RightAngleMark cx={ID[0]} cy={ID[1]} s={8}  dx={1} dy={-1} />

      {/* ── Outer leg labels ── */}
      {/* "12" left of outer vertical leg */}
      <text
        x={OA[0] - 14}
        y={outerLeftMidY}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={15}
        fontWeight="700"
        fill={COLOR.LABEL}
        fontFamily={font}
      >
        12
      </text>

      {/* "a" below outer horizontal leg */}
      {showLabelA && (
        <text
          x={outerBotMidX}
          y={OA[1] + 17}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight="700"
          fill={COLOR.LABEL_A}
          fontFamily={font}
          fontStyle="italic"
        >
          {labelA}
        </text>
      )}

      {/* ── Inner leg labels ── */}
      {/* "4" left of inner vertical leg */}
      <text
        x={ID[0] - 10}
        y={innerLeftMidY}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={COLOR.LABEL}
        fontFamily={font}
      >
        4
      </text>

      {/* "3" below inner horizontal leg */}
      <text
        x={innerBotMidX}
        y={ID[1] + 13}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={COLOR.LABEL}
        fontFamily={font}
      >
        3
      </text>

      {/* "5" along inner hypotenuse (offset toward top-right) */}
      <text
        x={hypMidX + 12}
        y={hypMidY - 5}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={COLOR.LABEL}
        fontFamily={font}
      >
        5
      </text>
    </g>
  )
}

// ── Default export — stem illustration ────────────────────────────────────────

export default function NestedTriOSN24NT1Q2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua segitiga siku-siku bersarang: segitiga luar berkaki 12 dan a, segitiga dalam berkaki 3 dan 4 dengan sisi miring 5."
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={Math.min(220, VW)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <NestedTriFigure />
      </svg>
    </div>
  )
}
