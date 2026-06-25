// ShadedArc22B14Illustration — SEAMO 2022 Paper B Q14
//
// "The area of a circle is πr², where π = 22/7 and r is the radius.
//  Find the area of the shaded region."
//
// SOURCE FIGURE (docs/reference/ocr-res/seamo/contest/paper-b/2022.imgs/007.jpg):
// A quarter-circle of radius 7 cm, right angle at bottom-left corner.
// The two straight sides are labelled "7 cm" (vertical left, horizontal bottom).
// A diagonal (the chord from top-left to bottom-right — i.e., the hypotenuse
// of the right triangle formed by the two radii) divides the quarter-circle:
//   • White region  = right triangle (legs = 7 cm each, right angle at bottom-left)
//   • Shaded region = area between the arc and the diagonal (crescent above hyp.)
//
// Solution (bound to breakdown.quantities):
//   Quarter-circle area = (1/4) × (22/7) × 7² = 38.5 cm²
//   Triangle area       = (1/2) × 7 × 7        = 24.5 cm²
//   Shaded area         = 38.5 − 24.5           = 14 cm²  → Answer E
//
// No primitive covers a quarter-circle shaded-arc figure.
// Copy-adapted structure from TriangleArea17B24Illustration (shared-primitive
// + co-export pattern) to support the beat-driven explainer.
//
// SSR-safe: no hooks, no framer-motion, pure SVG.

// ── colours ───────────────────────────────────────────────────────────────────
const STROKE      = '#374151'
const SHADE_FILL  = '#CBD5E1'   // light grey for the shaded arc region (matches source)
const SHADE_STR   = '#6B7280'
const WHITE_FILL  = '#FFFFFF'
const LABEL_COL   = '#111827'
const TICK_COL    = '#374151'
const HIGHLIGHT   = '#2563EB'
const GREEN_HL    = '#10B981'

// ── coordinate system ─────────────────────────────────────────────────────────
// SVG viewBox: 220 × 220 px
// Origin (bottom-left corner of the right angle) placed at (20, 200).
// Positive x = right, positive y = up (SVG y flips: SVG_y = 200 - math_y).
// Radius = 7 cm mapped to 168 px (24 px per cm).
const W = 220
const H = 220
const PAD = 20
const R = 168   // 7 cm in px (radius)

// Corner at bottom-left (right-angle vertex)
const OX = PAD          // 20
const OY = H - PAD      // 200

// Top-left arc endpoint (straight up 7 cm from O)
const TLX = OX          // 20
const TLY = OY - R      // 32

// Bottom-right arc endpoint (straight right 7 cm from O)
const BRX = OX + R      // 188
const BRY = OY          // 200

function fmt(n: number) { return n.toFixed(1) }

// ── arc path ──────────────────────────────────────────────────────────────────
// Quarter-circle: from (TLX, TLY) to (BRX, BRY), center at (OX, OY), radius R.
// SVG arc: large-arc-flag=0, sweep-flag=1 (clockwise in SVG coords).
const ARC_D = `M ${fmt(TLX)} ${fmt(TLY)} A ${fmt(R)} ${fmt(R)} 0 0 1 ${fmt(BRX)} ${fmt(BRY)}`

// ── shaded region path ────────────────────────────────────────────────────────
// Shaded = bounded by: arc (TL → BR) + straight line (BR → TL).
// This is the region between the arc and the diagonal chord.
const SHADED_D =
  `M ${fmt(TLX)} ${fmt(TLY)}` +
  ` A ${fmt(R)} ${fmt(R)} 0 0 1 ${fmt(BRX)} ${fmt(BRY)}` +
  ` L ${fmt(TLX)} ${fmt(TLY)} Z`

// ── white triangle path ───────────────────────────────────────────────────────
// Triangle: O (bottom-left) → TL (top-left) → BR (bottom-right) → back to O.
const TRI_PTS = `${fmt(OX)},${fmt(OY)} ${fmt(TLX)},${fmt(TLY)} ${fmt(BRX)},${fmt(BRY)}`

// ── props ─────────────────────────────────────────────────────────────────────

export type HighlightRegion22B14 = 'none' | 'quarter' | 'triangle' | 'shaded'

export interface ShadedArc22B14FigureProps {
  /** Which region to highlight for the animated explainer. */
  highlight?: HighlightRegion22B14
  /** Text label to overlay inside the highlighted region. */
  areaLabel?: string | null
  /** When true, show area label in green (result beat); default blue. */
  isResult?: boolean
}

// ── shared primitive (illustration + explainer) ───────────────────────────────

/**
 * ShadedArc22B14Figure — co-exported primitive for the explainer.
 *
 * Draws the quarter-circle with:
 *   - white right triangle (legs = 7 cm)
 *   - grey shaded arc region
 *   - dimension labels "7 cm" on both legs
 *   - small right-angle tick at the corner
 *
 * The explainer uses `highlight` + `areaLabel` to animate the solution.
 */
export function ShadedArc22B14Figure({
  highlight = 'none',
  areaLabel = null,
  isResult = false,
}: ShadedArc22B14FigureProps = {}) {

  const hlColor = isResult ? GREEN_HL : HIGHLIGHT

  // Approximate centroid positions for labels
  // Shaded arc centroid: roughly above the diagonal midpoint
  const shadedLabelX = OX + R * 0.65
  const shadedLabelY = OY - R * 0.65
  // Triangle centroid
  const triLabelX = (OX + TLX + BRX) / 3
  const triLabelY = (OY + TLY + BRY) / 3
  // Quarter circle centroid (between arc centroid and O)
  const quarterLabelX = OX + R * 0.45
  const quarterLabelY = OY - R * 0.45

  const labelPos: Record<string, { x: number; y: number }> = {
    quarter: { x: quarterLabelX, y: quarterLabelY },
    triangle: { x: triLabelX,    y: triLabelY     },
    shaded:   { x: shadedLabelX, y: shadedLabelY  },
  }
  const labelXY = highlight !== 'none' ? labelPos[highlight] : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── white right triangle ── */}
      <polygon
        points={TRI_PTS}
        fill={WHITE_FILL}
        stroke={STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── shaded arc region ── */}
      <path
        d={SHADED_D}
        fill={SHADE_FILL}
        stroke={SHADE_STR}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* ── arc outline (quarter circle boundary) ── */}
      <path
        d={ARC_D}
        fill="none"
        stroke={STROKE}
        strokeWidth={2}
      />

      {/* ── diagonal (chord from TL to BR) ── */}
      <line
        x1={fmt(TLX)} y1={fmt(TLY)}
        x2={fmt(BRX)} y2={fmt(BRY)}
        stroke={STROKE}
        strokeWidth={2}
      />

      {/* ── right-angle tick at O ── */}
      <path
        d={`M ${OX + 12},${OY} L ${OX + 12},${OY - 12} L ${OX},${OY - 12}`}
        fill="none"
        stroke={TICK_COL}
        strokeWidth={1.5}
      />

      {/* ── highlight overlay ── */}
      {highlight === 'shaded' && (
        <path
          d={SHADED_D}
          fill={hlColor + '33'}
          stroke={hlColor}
          strokeWidth={2.5}
        />
      )}
      {highlight === 'triangle' && (
        <polygon
          points={TRI_PTS}
          fill={hlColor + '22'}
          stroke={hlColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      {highlight === 'quarter' && (
        <>
          <polygon
            points={TRI_PTS}
            fill={hlColor + '22'}
            stroke={hlColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d={SHADED_D}
            fill={hlColor + '22'}
            stroke={hlColor}
            strokeWidth={2.5}
          />
        </>
      )}

      {/* ── area label ── */}
      {areaLabel && labelXY && (
        <text
          x={fmt(labelXY.x)}
          y={fmt(labelXY.y)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={hlColor}
        >
          {areaLabel}
        </text>
      )}

      {/* ── dimension label: left side "7 cm" ── */}
      <text
        x={OX - 6}
        y={(OY + TLY) / 2}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={LABEL_COL}
      >
        7 cm
      </text>

      {/* ── dimension label: bottom "7 cm" ── */}
      <text
        x={(OX + BRX) / 2}
        y={OY + 14}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={13}
        fontWeight={700}
        fill={LABEL_COL}
      >
        7 cm
      </text>
    </svg>
  )
}

// ── default export: static stem illustration ──────────────────────────────────

/**
 * ShadedArc22B14Illustration — default export.
 *
 * Static stem for SEAMO-22-B-Q14.
 * Shows the quarter-circle (r = 7 cm) with the shaded region between
 * the arc and the diagonal chord. Does NOT reveal the answer (14 cm²).
 * Faithful to 2022.imgs/007.jpg.
 */
export default function ShadedArc22B14Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Seperempat lingkaran berjari-jari 7 cm dengan sudut siku-siku di pojok kiri bawah. ' +
        'Sisi kiri dan bawah masing-masing 7 cm. Diagonal menghubungkan pojok kiri atas ke pojok kanan bawah. ' +
        'Daerah segitiga (antara dua kaki dan diagonal) berwarna putih. ' +
        'Daerah yang diarsir (antara busur dan diagonal) berwarna abu-abu.'
      }
    >
      <ShadedArc22B14Figure />
    </div>
  )
}
