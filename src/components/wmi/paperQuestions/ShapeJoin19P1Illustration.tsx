// Shape-join figure for WMI-19P1A-Q13
// (2019 WMI Semifinal Grade 1 Paper A, question 13).
//
// Reconstructed from the scan (db/seed/wmi/figures/2019-semifinal-g1-a-q13.jpg),
// which shows the OPERATION to solve inside a dotted frame:
//
//     ⊤  (a T glyph: a horizontal bar with a vertical stem hanging down)
//     +
//     ▢  (an empty square)
//     ⇒  ?
//
// The body also references the worked example rule:
//     a Y shape + a triangle  →  one combined shape
// i.e. the second shape is JOINED onto the foot of the first, keeping the same
// orientation. Applying that join to "T + square" stacks the square under the
// T's stem — the result is choice D.
//
// PROBLEM-ONLY: the static figure draws the example rule and the
// "T + square ⇒ ?" operation. It never draws the assembled answer.
//
// Pure render — SSR-safe, deterministic (no window/Date/random at module top).

// ---------------------------------------------------------------------------
// Reusable shape primitive (shared with the explainer)
// ---------------------------------------------------------------------------

export type ShapeName = 'T' | 'square' | 'Y' | 'triangle' | 'Y+triangle' | 'T+square'

const INK = '#1F2937'
const ACCENT = '#30598A'

export interface ShapeGlyphProps {
  name: ShapeName
  /** Centre of the glyph box. */
  cx: number
  cy: number
  /** Box half-size (the glyph fits inside a 2*size square). */
  size?: number
  /** Stroke colour. */
  stroke?: string
  /** Fill colour for the second (joined) piece, to highlight it. */
  joinFill?: string
}

/**
 * Draws one named glyph centred at (cx, cy). All glyphs are stroke-only line
 * art matching the scan's hand-drawn style; the "combined" glyphs show the two
 * pieces joined (second piece optionally tinted via `joinFill`).
 */
export function ShapeGlyph({ name, cx, cy, size = 26, stroke = INK, joinFill }: ShapeGlyphProps) {
  const sw = 3
  const s = size

  switch (name) {
    case 'T': {
      // horizontal bar across the top, vertical stem down from the centre
      return (
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none">
          <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy - s} />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
        </g>
      )
    }
    case 'square': {
      return (
        <rect
          x={cx - s * 0.75}
          y={cy - s * 0.75}
          width={s * 1.5}
          height={s * 1.5}
          fill={joinFill ?? 'none'}
          stroke={stroke}
          strokeWidth={sw}
        />
      )
    }
    case 'Y': {
      // two arms meeting at a fork, with a stem going down
      const forkY = cy
      return (
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none">
          <line x1={cx - s} y1={cy - s} x2={cx} y2={forkY} />
          <line x1={cx + s} y1={cy - s} x2={cx} y2={forkY} />
          <line x1={cx} y1={forkY} x2={cx} y2={cy + s} />
        </g>
      )
    }
    case 'triangle': {
      return (
        <path
          d={`M ${cx} ${cy - s} L ${cx + s} ${cy + s} L ${cx - s} ${cy + s} Z`}
          fill={joinFill ?? 'none'}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )
    }
    case 'Y+triangle': {
      // Y on top, triangle joined under the stem
      const stemTop = cy - s * 1.2
      const stemBot = cy + s * 0.1
      const triTop = stemBot
      const triH = s * 1.1
      const triHW = s * 0.85
      return (
        <g>
          <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none">
            <line x1={cx - s * 0.8} y1={stemTop} x2={cx} y2={cy - s * 0.5} />
            <line x1={cx + s * 0.8} y1={stemTop} x2={cx} y2={cy - s * 0.5} />
            <line x1={cx} y1={cy - s * 0.5} x2={cx} y2={triTop} />
          </g>
          <path
            d={`M ${cx} ${triTop} L ${cx + triHW} ${triTop + triH} L ${cx - triHW} ${triTop + triH} Z`}
            fill={joinFill ?? 'none'}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </g>
      )
    }
    case 'T+square': {
      // T on top, square joined at the foot of the stem
      const barY = cy - s * 1.15
      const stemBot = cy + s * 0.05
      const sqSize = s * 1.4
      return (
        <g>
          <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none">
            <line x1={cx - s} y1={barY} x2={cx + s} y2={barY} />
            <line x1={cx} y1={barY} x2={cx} y2={stemBot} />
          </g>
          <rect
            x={cx - sqSize / 2}
            y={stemBot}
            width={sqSize}
            height={sqSize}
            fill={joinFill ?? 'none'}
            stroke={stroke}
            strokeWidth={sw}
          />
        </g>
      )
    }
    default:
      return null
  }
}

/** A small "+" operator glyph. */
function PlusGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke={INK} strokeWidth={3} strokeLinecap="round">
      <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} />
      <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} />
    </g>
  )
}

/** A "⇒" arrow glyph. */
function ArrowGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={cx - 16} y1={cy - 5} x2={cx + 12} y2={cy - 5} />
      <line x1={cx - 16} y1={cy + 5} x2={cx + 12} y2={cy + 5} />
      <path d={`M ${cx + 4} ${cy - 12} L ${cx + 16} ${cy} L ${cx + 4} ${cy + 12}`} />
    </g>
  )
}

/** A "?" placeholder glyph. */
function QuestionGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={ACCENT}>
      ?
    </text>
  )
}

export const SHAPEJOIN_VIEW_W = 360
export const SHAPEJOIN_VIEW_H = 200

// ---------------------------------------------------------------------------
// Main export — static problem figure
// ---------------------------------------------------------------------------

export default function ShapeJoin19P1Illustration() {
  // Row 1 (y≈58): the example rule  Y + triangle ⇒ combined
  // Row 2 (y≈140): the operation to solve  T + square ⇒ ?
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Shape-join rule. Example row: a Y shape plus a triangle gives a combined shape. ' +
        'Operation row: a T shape plus a square gives a question mark to find.'
      }
    >
      <svg
        viewBox={`0 0 ${SHAPEJOIN_VIEW_W} ${SHAPEJOIN_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SHAPEJOIN_VIEW_W} height={SHAPEJOIN_VIEW_H} fill="#FFFFFF" />

        {/* ── Example rule (label) ── */}
        <text x={20} y={26} textAnchor="start" fontSize={13} fontWeight={700} fill="#6B7280">
          Rule
        </text>
        <ShapeGlyph name="Y" cx={56} cy={62} size={22} />
        <PlusGlyph cx={110} cy={62} />
        <ShapeGlyph name="triangle" cx={160} cy={62} size={22} />
        <ArrowGlyph cx={222} cy={62} />
        <ShapeGlyph name="Y+triangle" cx={300} cy={58} size={20} />

        {/* divider */}
        <line x1={20} y1={102} x2={SHAPEJOIN_VIEW_W - 20} y2={102} stroke="#E5E7EB" strokeWidth={1.5} />

        {/* ── Operation to solve ── */}
        <text x={20} y={126} textAnchor="start" fontSize={13} fontWeight={700} fill="#6B7280">
          Solve
        </text>
        <ShapeGlyph name="T" cx={56} cy={160} size={22} />
        <PlusGlyph cx={110} cy={160} />
        <ShapeGlyph name="square" cx={160} cy={160} size={20} />
        <ArrowGlyph cx={222} cy={160} />
        <QuestionGlyph cx={300} cy={160} />
      </svg>
    </div>
  )
}
