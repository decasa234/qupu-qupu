// Substitution balance scales for WMI-19P1A-Q23 (2019 semifinal G1).
//
// Two given balances:
//   Balance 1: 2 hexagons  ⚖  3 squares
//   Balance 2: 2 diamonds  ⚖  4 hexagons
// Asked: the diamonds shown (2 diamonds) balance how many squares?
//
// Chain: 2 dia = 4 hex ⇒ 1 dia = 2 hex; and 2 hex = 3 sq ⇒ 1 dia = 3 sq.
// So 2 diamonds = 6 squares — answer B.
//
// The static figure shows ONLY the problem: the two given balances plus the
// asked balance (2 diamonds ⚖ ?). The square count behind ? is never drawn.
//
// Glyphs are drawn polygons (NOT emoji): hexagon, square, diamond.

export type ShapeKind = 'hexagon' | 'square' | 'diamond' | 'unknown'

const INK = '#1F2937'
const HEX_FILL = '#1F2937' // hexagons drawn solid (match source figure)
const SQ_FILL = '#FFFFFF'
const DIA_FILL = '#1F2937'
const HILITE = '#FDE68A'
const HILITE_STROKE = '#D97706'
const GREEN = '#10B981'
const GREEN_FILL = '#D1FAE5'

// ---- geometry: one balance drawn inside a BEAM_W × BEAM_H cell ----
export const BEAM_W = 360
export const BEAM_H = 150

const BEAM_Y = 70
const FULCRUM_X = BEAM_W / 2 // 180
const PAN_LEFT_X = 86
const PAN_RIGHT_X = BEAM_W - 86 // 274
const PAN_Y = 50
const SHAPE_R = 13 // half-extent of a glyph
const SHAPE_GAP = 5

/** Centre x for each of `n` glyphs, centred over a pan at `cx`. */
function shapeCenters(cx: number, n: number): number[] {
  const step = SHAPE_R * 2 + SHAPE_GAP
  const totalW = n * step - SHAPE_GAP
  const startX = cx - totalW / 2 + SHAPE_R
  return Array.from({ length: n }, (_, i) => startX + i * step)
}

interface GlyphProps {
  kind: ShapeKind
  cx: number
  cy: number
  highlight?: boolean
  solved?: boolean
}

/** A single shape glyph centred at (cx, cy). Deterministic — no randomness. */
export function ShapeGlyph({ kind, cx, cy, highlight = false, solved = false }: GlyphProps) {
  const r = SHAPE_R
  const stroke = solved ? GREEN : highlight ? HILITE_STROKE : INK
  const sw = highlight || solved ? 3 : 2

  if (kind === 'hexagon') {
    // pointy-top hexagon
    const pts = [
      [cx, cy - r],
      [cx + r * 0.866, cy - r * 0.5],
      [cx + r * 0.866, cy + r * 0.5],
      [cx, cy + r],
      [cx - r * 0.866, cy + r * 0.5],
      [cx - r * 0.866, cy - r * 0.5],
    ]
      .map((p) => p.map((n) => Number(n.toFixed(2)).toString()).join(','))
      .join(' ')
    const fill = solved ? GREEN_FILL : highlight ? HILITE : HEX_FILL
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
  }

  if (kind === 'square') {
    const fill = solved ? GREEN_FILL : highlight ? HILITE : SQ_FILL
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} />
  }

  if (kind === 'diamond') {
    const pts = [
      [cx, cy - r],
      [cx + r, cy],
      [cx, cy + r],
      [cx - r, cy],
    ]
      .map((p) => p.join(','))
      .join(' ')
    const fill = solved ? GREEN_FILL : highlight ? HILITE : DIA_FILL
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
  }

  // unknown: a "?" pill — the answer count is hidden behind it
  return (
    <g>
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={5} fill="#E1EFFB" stroke="#30598A" strokeWidth={2} strokeDasharray="4 3" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#30598A">
        ?
      </text>
    </g>
  )
}

export interface BalanceBeamProps {
  /** Glyphs on the left pan. */
  left: ShapeKind[]
  /** Glyphs on the right pan. */
  right: ShapeKind[]
  /** Highlight 'left' | 'right' pan, or null. */
  highlight?: 'left' | 'right' | null
  /** Render the right pan's glyphs as solved (green). */
  solvedRight?: boolean
  /** Render the left pan's glyphs as solved (green). */
  solvedLeft?: boolean
}

/**
 * One level (balanced) beam with a pan of glyphs on each side.
 * Re-usable primitive: the explainer imports this to redraw the chain.
 */
export function BalanceBeam({ left, right, highlight = null, solvedRight = false, solvedLeft = false }: BalanceBeamProps) {
  const leftCenters = shapeCenters(PAN_LEFT_X, left.length)
  const rightCenters = shapeCenters(PAN_RIGHT_X, right.length)
  const glyphCy = PAN_Y - SHAPE_R - 4

  return (
    <svg
      viewBox={`0 0 ${BEAM_W} ${BEAM_H}`}
      width="100%"
      style={{ maxWidth: BEAM_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Fulcrum triangle + base */}
      <polygon
        points={`${FULCRUM_X},${BEAM_Y} ${FULCRUM_X - 24},${BEAM_H - 22} ${FULCRUM_X + 24},${BEAM_H - 22}`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.5}
      />
      <line x1={FULCRUM_X - 34} y1={BEAM_H - 22} x2={FULCRUM_X + 34} y2={BEAM_H - 22} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />

      {/* Level beam */}
      <line x1={PAN_LEFT_X} y1={BEAM_Y} x2={PAN_RIGHT_X} y2={BEAM_Y} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={FULCRUM_X} cy={BEAM_Y} r={5} fill={INK} />

      {/* Pan hangers + tray bars */}
      {[PAN_LEFT_X, PAN_RIGHT_X].map((cx) => (
        <g key={cx}>
          <line x1={cx} y1={BEAM_Y} x2={cx - 30} y2={PAN_Y} stroke={INK} strokeWidth={1.5} />
          <line x1={cx} y1={BEAM_Y} x2={cx + 30} y2={PAN_Y} stroke={INK} strokeWidth={1.5} />
          <line x1={cx - 36} y1={PAN_Y} x2={cx + 36} y2={PAN_Y} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}

      {/* Left glyphs */}
      {left.map((kind, i) => (
        <ShapeGlyph key={`l-${i}`} kind={kind} cx={leftCenters[i]} cy={glyphCy} highlight={highlight === 'left'} solved={solvedLeft} />
      ))}
      {/* Right glyphs */}
      {right.map((kind, i) => (
        <ShapeGlyph key={`r-${i}`} kind={kind} cx={rightCenters[i]} cy={glyphCy} highlight={highlight === 'right'} solved={solvedRight} />
      ))}
    </svg>
  )
}

// ---- the three rows of THIS problem ----
export const HEX2: ShapeKind[] = ['hexagon', 'hexagon']
export const SQ3: ShapeKind[] = ['square', 'square', 'square']
export const DIA2: ShapeKind[] = ['diamond', 'diamond']
export const HEX4: ShapeKind[] = ['hexagon', 'hexagon', 'hexagon', 'hexagon']
/** The asked pan: how many squares? — hidden behind a single "?" glyph. */
export const ASK_UNKNOWN: ShapeKind[] = ['unknown']

/** Derived answer: 2 diamonds = 6 squares (each diamond = 3 squares). Answer B. */
export const SQUARES_PER_DIAMOND = 3
export const SHOWN_DIAMONDS = 2
export const ANSWER_SQUARES = SQUARES_PER_DIAMOND * SHOWN_DIAMONDS // 6

function GivenLabel({ text }: { text: string }) {
  return <div className="text-center text-[11px] font-bold uppercase tracking-wide text-qupu-blue/70">{text}</div>
}

export default function BalanceSub19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Three balance scales. First: 2 hexagons balance 3 squares. Second: 2 diamonds balance 4 hexagons. Third (asked): 2 diamonds balance an unknown number of squares marked with a question mark."
    >
      <div className="flex flex-col gap-3">
        <div>
          <GivenLabel text="Given 1" />
          <BalanceBeam left={HEX2} right={SQ3} />
        </div>
        <div>
          <GivenLabel text="Given 2" />
          <BalanceBeam left={DIA2} right={HEX4} />
        </div>
        <div>
          <GivenLabel text="Find" />
          <BalanceBeam left={DIA2} right={ASK_UNKNOWN} />
        </div>
      </div>
    </div>
  )
}
