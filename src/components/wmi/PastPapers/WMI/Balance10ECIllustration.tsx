// IKMC-23-EC-Q10 — "There are six weights of 1,2,3,4,5 and 6 kg.
// Rossitza puts five of them on the scales (5 kg on the left side together with
// two others, and the 6 kg weight on the right side together with one other)
// and puts one weight aside. The scales balance. Which weight did she put aside?"
//
// Stem figure: ONE balanced scale.
//   Left pan:  3 bottle-weights — one labeled "5", two labeled "?"
//   Right pan: 2 bottle-weights — one labeled "6", one labeled "?"
//   Aside: a single bottle-weight labelled "?" sitting to the right of the scale
//
// The scale beam is LEVEL (balanced) — answer (1 kg) is never drawn.
// Adapted from ThreeScales24ECIllustration.tsx (same Pan/beam/pivot geometry,
// same blue-pivot house style) and BalanceScales25G1Illustration.tsx (bottle
// weight glyphs with numeric labels).
//
// Pure render — no randomness, no Date(), SSR-safe.

// ---- palette (matches EC scan / house style) --------------------------------
const INK = '#1F2937'
const WEIGHT_BODY = '#FFFFFF'   // white bottle body
const WEIGHT_STROKE = '#374151' // dark grey outline
const BEAM_COLOR = '#9AA0A6'
const BASE_FILL = '#5BC0EB'     // blue triangular pivot (EC pool standard)
const PAN_FILL = '#FFFFFF'

// ---- scale geometry ---------------------------------------------------------
export const CELL_W = 380
export const CELL_H = 210

const PIVOT_Y = 110
const BEAM_HALF = 120
const PAN_DROP = 18
const TRAY_W = 100
const TRAY_HALF = TRAY_W / 2

// ---- weight bottle dimensions -----------------------------------------------
const W_W = 36    // bottle body width
const W_H = 44    // bottle body height
const W_CAP_W = 20
const W_CAP_H = 10
const W_RX = 5    // corner radius
const W_SPACING = 42 // horizontal centre-to-centre

/** One bottle-weight glyph. baseY = the pan tray surface. */
function WeightBottle({
  cx,
  baseY,
  label,
}: {
  cx: number
  baseY: number
  label: string
}) {
  const bodyY = baseY - W_H
  const capY = bodyY - W_CAP_H
  return (
    <g>
      {/* cap / neck */}
      <rect
        x={cx - W_CAP_W / 2}
        y={capY}
        width={W_CAP_W}
        height={W_CAP_H + 4}
        rx={3}
        fill={WEIGHT_BODY}
        stroke={WEIGHT_STROKE}
        strokeWidth={2}
      />
      {/* body */}
      <rect
        x={cx - W_W / 2}
        y={bodyY}
        width={W_W}
        height={W_H}
        rx={W_RX}
        fill={WEIGHT_BODY}
        stroke={WEIGHT_STROKE}
        strokeWidth={2.5}
      />
      {/* label */}
      <text
        x={cx}
        y={bodyY + W_H / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={label === '?' ? 18 : 15}
        fontWeight={900}
        fill={label === '?' ? '#6B7280' : WEIGHT_STROKE}
      >
        {label}
      </text>
    </g>
  )
}

// ---- Pan (V-hanger + shallow tray + weights) --------------------------------
function Pan({
  px,
  py,
  labels,
}: {
  px: number
  py: number
  labels: string[]
}) {
  const trayTop = py + PAN_DROP
  const shapeBase = trayTop - 2

  const n = labels.length
  const totalW = (n - 1) * W_SPACING
  const startX = px - totalW / 2

  return (
    <g>
      {/* V-hanger */}
      <line x1={px} y1={py} x2={px - TRAY_HALF + 10} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={px} y1={py} x2={px + TRAY_HALF - 10} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {/* weight bottles (drawn before tray rim so rim sits on top) */}
      {labels.map((lbl, i) => (
        <WeightBottle key={i} cx={startX + i * W_SPACING} baseY={shapeBase} label={lbl} />
      ))}
      {/* shallow bowl rim */}
      <path
        d={`M ${px - TRAY_HALF} ${trayTop} Q ${px} ${trayTop + 16} ${px + TRAY_HALF} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={px} cy={trayTop} rx={TRAY_HALF} ry={5} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ---- exported primitive used by the explainer --------------------------------

export interface Balance10ECProps {
  /** When true, highlight the left pan to signal the "sum = 10" reveal. */
  highlightLeft?: boolean
  /** When true, highlight the right pan. */
  highlightRight?: boolean
  /** When true, highlight the aside weight. */
  highlightAside?: boolean
}

const LEFT_LABELS = ['5', '?', '?']
const RIGHT_LABELS = ['6', '?']

/**
 * The single balanced scale primitive. aria-hidden — must sit in a labelled host.
 * The aside weight is drawn to the right of the scale.
 */
export function Balance10EC({
  highlightLeft = false,
  highlightRight = false,
  highlightAside = false,
}: Balance10ECProps) {
  const scaleOX = 0
  const pivotX = scaleOX + CELL_W / 2
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = CELL_H - 10

  // total SVG width: scale cell + gap + aside weight area
  const ASIDE_X = CELL_W + 32
  const ASIDE_CX = ASIDE_X + W_W / 2 + 10
  const TOTAL_W = ASIDE_X + W_W + 28
  const ASIDE_BASE_Y = PIVOT_Y + PAN_DROP + W_H + 2 // visually aligned with pan surface

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${CELL_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Left pan */}
      <g opacity={highlightLeft ? 1 : 0.85}>
        {highlightLeft && (
          <rect
            x={leftX - TRAY_HALF - 6}
            y={PIVOT_Y - W_H - W_CAP_H - 14}
            width={TRAY_W + (LEFT_LABELS.length - 1) * W_SPACING + 12}
            height={W_H + W_CAP_H + PAN_DROP + 22}
            rx={10}
            fill="none"
            stroke="#2563EB"
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.7}
          />
        )}
        <Pan px={leftX} py={PIVOT_Y} labels={LEFT_LABELS} />
      </g>

      {/* Right pan */}
      <g opacity={highlightRight ? 1 : 0.85}>
        {highlightRight && (
          <rect
            x={rightX - TRAY_HALF - 6}
            y={PIVOT_Y - W_H - W_CAP_H - 14}
            width={TRAY_W + (RIGHT_LABELS.length - 1) * W_SPACING + 12}
            height={W_H + W_CAP_H + PAN_DROP + 22}
            rx={10}
            fill="none"
            stroke="#2563EB"
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.7}
          />
        )}
        <Pan px={rightX} py={PIVOT_Y} labels={RIGHT_LABELS} />
      </g>

      {/* Level beam */}
      <line
        x1={leftX}
        y1={PIVOT_Y}
        x2={rightX}
        y2={PIVOT_Y}
        stroke={BEAM_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Blue triangular pivot base */}
      <polygon
        points={`${pivotX},${PIVOT_Y - 4} ${pivotX - 32},${groundY} ${pivotX + 32},${groundY}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* pivot bolt */}
      <circle cx={pivotX} cy={PIVOT_Y} r={6} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />

      {/* Aside weight */}
      <g opacity={highlightAside ? 1 : 0.72}>
        {highlightAside && (
          <rect
            x={ASIDE_CX - W_W / 2 - 10}
            y={ASIDE_BASE_Y - W_H - W_CAP_H - 14}
            width={W_W + 20}
            height={W_H + W_CAP_H + 20}
            rx={10}
            fill="#FEF9C3"
            stroke="#CA8A04"
            strokeWidth={2}
            strokeDasharray="5 3"
            opacity={0.9}
          />
        )}
        {/* "Aside" label above the weight */}
        <text
          x={ASIDE_CX}
          y={ASIDE_BASE_Y - W_H - W_CAP_H - 20}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#6B7280"
        />
        <WeightBottle cx={ASIDE_CX} baseY={ASIDE_BASE_Y} label="?" />
        {/* base line for aside weight */}
        <line
          x1={ASIDE_CX - W_W / 2 - 6}
          y1={ASIDE_BASE_Y + 4}
          x2={ASIDE_CX + W_W / 2 + 6}
          y2={ASIDE_BASE_Y + 4}
          stroke={INK}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

/**
 * IKMC-23-EC-Q10 stem illustration.
 * Balanced scale: left pan has the 5 kg weight + 2 unknowns;
 * right pan has the 6 kg weight + 1 unknown.
 * One weight (unknown) is set aside next to the scale.
 */
export default function Balance10ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Satu timbangan seimbang. Sisi kiri: tiga beban — satu berlabel 5, dua berlabel ?. ' +
        'Sisi kanan: dua beban — satu berlabel 6, satu berlabel ?. ' +
        'Di samping timbangan ada satu beban dengan tanda tanya yang disisihkan.'
      }
    >
      <Balance10EC />
    </div>
  )
}
