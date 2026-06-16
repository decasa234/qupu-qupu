// WMI-24P2A-Q14 (2024 Grade 2 Semifinal, Paper A) — three pencils between two
// dashed lines.
//
// READING THE SCAN (2024-semifinal-g2-a-q14.jpg): two vertical DASHED lines mark
// a fixed total width. Three horizontal pencils lie between them, each with a
// labelled EMPTY gap drawn as a thin double-ended span:
//   - TOP pencil (gold): left end sits 10 cm right of the left dashed line; its
//     tip points right toward the right line. Gap label "10 cm" on the LEFT.
//   - MIDDLE pencil (blue): the LONGEST one (18 cm). Its left (eraser) end is on
//     the left dashed line; its tip leaves a "5 cm" gap to the right line.
//   - BOTTOM pencil (green): left end sits 12 cm right of the left line; tip
//     points right. Gap label "12 cm" on the LEFT.
//
// SOLVE (per the paper's hint):
//   total width = longest pencil + its right gap = 18 + 5 = 23 cm.
//   top pencil    = 23 − 10 = 13 cm.
//   bottom pencil = 23 − 12 = 11 cm.
//   sum of the OTHER two = 13 + 11 = 24 cm  ->  answer B.
//
// The static figure shows ONLY what the scan shows: the dashed boundary lines,
// the three pencils, the three gap labels (10, 5, 12 cm) and the "18 cm" length
// on the longest pencil. It NEVER prints 23 (width) or 13/11 (the derived
// lengths). Revealing the width + the two derived lengths is the animator's job,
// via the co-exported primitive `Pencils24G2`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const GREEN = '#10B981'
const ORANGE = '#f0853a' // reveal accent (animator only)
const DASH = '#6B7280' // boundary dashed lines + gap spans

// ---- model (everything in cm; geometry is derived) -------------------------
export const TOTAL_W = 23 // = 18 + 5 (longest + its gap) — derived, not shown statically
export const LONG_LEN = 18 // middle pencil (given)
export const RIGHT_GAP = 5 // middle pencil's right gap (given)
export const TOP_GAP = 10 // top pencil's left gap (given)
export const BOT_GAP = 12 // bottom pencil's left gap (given)
export const TOP_LEN = TOTAL_W - TOP_GAP // 13
export const BOT_LEN = TOTAL_W - BOT_GAP // 11
export const ANSWER_SUM = TOP_LEN + BOT_LEN // 24

// ---- layout ----------------------------------------------------------------
const CM = 16 // svg px per centimetre
const PAD_X = 28
const PAD_TOP = 26
const ROW_H = 52 // vertical pitch between pencil rows
const PENCIL_H = 22
const LEFT_X = PAD_X // left dashed line
const RIGHT_X = PAD_X + TOTAL_W * CM // right dashed line
const WIDTH = RIGHT_X + PAD_X
const HEIGHT = PAD_TOP + ROW_H * 3 + 18
const ROW_Y = (r: number) => PAD_TOP + r * ROW_H + PENCIL_H / 2 // centre y of pencil row r (0,1,2)

/** cm offset from the left dashed line -> svg x. */
const cmX = (cm: number) => LEFT_X + cm * CM

export const PENCILS_GEOM = { WIDTH, HEIGHT, CM, LEFT_X, RIGHT_X, PAD_TOP, ROW_H, PENCIL_H, ROW_Y, cmX } as const

/** A horizontal pencil from leftX to its tip at rightX, sharpened tip on the RIGHT. */
function Pencil({ leftX, rightX, y, barrel, lit = false }: { leftX: number; rightX: number; y: number; barrel: string; lit?: boolean }) {
  const h = PENCIL_H
  const top = y - h / 2
  const tipLen = 14 // wooden point on the RIGHT
  const ferruleLen = 8 // metal band on the LEFT (eraser side)
  const bodyLeft = leftX + ferruleLen
  const bodyRight = rightX - tipLen
  const stroke = lit ? ORANGE : INK
  const sw = lit ? 2.4 : 1.5
  return (
    <g>
      {/* eraser/ferrule (left) */}
      <rect x={leftX} y={top} width={ferruleLen} height={h} rx={2} fill="#F4B400" stroke={stroke} strokeWidth={sw} />
      {/* painted barrel */}
      <rect x={bodyLeft} y={top} width={Math.max(0, bodyRight - bodyLeft)} height={h} fill={barrel} stroke={stroke} strokeWidth={sw} />
      {/* sharpened wooden tip (right) */}
      <path
        d={`M ${bodyRight} ${top} L ${rightX} ${y} L ${bodyRight} ${top + h} Z`}
        fill="#F5C77E"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* graphite point */}
      <path d={`M ${rightX} ${y} L ${rightX - 5} ${y - 2.5} L ${rightX - 5} ${y + 2.5} Z`} fill={INK} />
    </g>
  )
}

/** A horizontal measurement span "|<— label —>|" between x1 and x2 at height y. */
function GapSpan({ x1, x2, y, label, color = DASH }: { x1: number; x2: number; y: number; label: string; color?: string }) {
  const mid = (x1 + x2) / 2
  return (
    <g>
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={color} strokeWidth={1.4} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={color} strokeWidth={1.4} />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.4} />
      <rect x={mid - 22} y={y - 9} width={44} height={18} rx={4} fill="#FFFFFF" opacity={0.92} />
      <text x={mid} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={color === DASH ? INK : color} className="font-display">
        {label}
      </text>
    </g>
  )
}

export interface Pencils24G2Props {
  /** Animator beat: mark the total width across both dashed lines (the "23"). */
  showWidth?: boolean
  /** Animator beat: spotlight the top pencil + print its derived length (13). */
  showTopLen?: boolean
  /** Animator beat: spotlight the bottom pencil + print its derived length (11). */
  showBotLen?: boolean
}

/**
 * The three pencils between the two dashed boundary lines. With no props it
 * shows only the GIVEN figure: the dashed lines, the pencils, the gap labels
 * (10, 5, 12 cm) and the 18 cm length on the longest (middle) pencil.
 */
export function Pencils24G2({ showWidth = false, showTopLen = false, showBotLen = false }: Pencils24G2Props = {}) {
  const yTop = ROW_Y(0)
  const yMid = ROW_Y(1)
  const yBot = ROW_Y(2)

  // pencil end x-positions (left end, tip end)
  const topLeft = cmX(TOP_GAP) // gap on the left, pencil fills to the right line
  const topTip = RIGHT_X
  const midLeft = LEFT_X // longest pencil starts at the left line
  const midTip = cmX(LONG_LEN) // ends LONG_LEN cm in, leaving RIGHT_GAP to the right line
  const botLeft = cmX(BOT_GAP)
  const botTip = RIGHT_X

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the two vertical dashed boundary lines */}
      {[LEFT_X, RIGHT_X].map((x, i) => (
        <line
          key={`b${i}`}
          x1={x}
          y1={PAD_TOP - 8}
          x2={x}
          y2={HEIGHT - 8}
          stroke={showWidth ? ORANGE : DASH}
          strokeWidth={showWidth ? 2.2 : 1.6}
          strokeDasharray="6 4"
        />
      ))}

      {/* TOP pencil (gold) + its 10 cm left gap */}
      <Pencil leftX={topLeft} rightX={topTip} y={yTop} barrel="#F4C20D" lit={showTopLen} />
      <GapSpan x1={LEFT_X} x2={topLeft} y={yTop - PENCIL_H / 2 - 12} label="10 cm" />

      {/* MIDDLE pencil (blue, longest) + its 5 cm right gap + the 18 cm length */}
      <Pencil leftX={midLeft} rightX={midTip} y={yMid} barrel="#5BB7E8" />
      <GapSpan x1={midTip} x2={RIGHT_X} y={yMid - PENCIL_H / 2 - 12} label="5 cm" />
      <text x={(midLeft + midTip) / 2} y={yMid + 1} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
        18 cm
      </text>

      {/* BOTTOM pencil (green) + its 12 cm left gap */}
      <Pencil leftX={botLeft} rightX={botTip} y={yBot} barrel="#7AC23B" lit={showBotLen} />
      <GapSpan x1={LEFT_X} x2={botLeft} y={yBot - PENCIL_H / 2 - 12} label="12 cm" />

      {/* ---- animator overlays ---- */}
      {showWidth && (
        <GapSpan x1={LEFT_X} x2={RIGHT_X} y={HEIGHT - 12} label="23 cm" color={ORANGE} />
      )}
      {showTopLen && (
        <text x={(topLeft + topTip) / 2} y={yTop + 1} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill={ORANGE} className="font-display">
          13 cm
        </text>
      )}
      {showBotLen && (
        <text x={(botLeft + botTip) / 2} y={yBot + 1} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill={GREEN} className="font-display">
          11 cm
        </text>
      )}
    </svg>
  )
}

/** Default export — the bare three-pencil figure (no derived lengths shown). */
export default function P24G2Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three pencils lie between two vertical dashed lines. The top pencil leaves a 10 cm gap on the left; the middle pencil is the longest at 18 cm and leaves a 5 cm gap on the right; the bottom pencil leaves a 12 cm gap on the left. Find the sum of the lengths of the other two pencils."
    >
      <Pencils24G2 />
    </div>
  )
}
