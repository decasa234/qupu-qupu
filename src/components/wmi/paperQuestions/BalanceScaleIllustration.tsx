// Balance-scale figure for WMI-19F1-Q11.
// Left pan = 7, 2, 5 (sum 14); right pan = 3, 8, ? — balanced when ? = 3.
export const LEFT_WEIGHTS = [7, 2, 5] as const
export const RIGHT_KNOWN = [3, 8] as const
export const UNKNOWN = 3 // 7+2+5 = 14 = 3+8+? ⇒ ? = 3

export const LEFT_TOTAL = LEFT_WEIGHTS.reduce((s, n) => s + n, 0) // 14
export const RIGHT_KNOWN_TOTAL = RIGHT_KNOWN.reduce((s, n) => s + n, 0) // 11

export const SCALE_VIEW_W = 360
export const SCALE_VIEW_H = 180

const BEAM_Y = 96
const FULCRUM_X = SCALE_VIEW_W / 2 // 180
const FULCRUM_TOP_Y = BEAM_Y
const FULCRUM_BASE_Y = 150
const PAN_LEFT_X = 78
const PAN_RIGHT_X = 282
const PAN_Y = 70
const BLOCK_W = 30
const BLOCK_H = 26
const BLOCK_GAP = 4

type Side = 'left' | 'right'

interface WeightBlock {
  side: Side
  index: number
  x: number
  y: number
  label: string
  unknown: boolean
}

/** Three weight blocks centered over a pan at `cx`. */
function blocksForPan(cx: number, labels: { label: string; unknown: boolean }[], side: Side): WeightBlock[] {
  const totalW = labels.length * BLOCK_W + (labels.length - 1) * BLOCK_GAP
  const startX = cx - totalW / 2
  return labels.map((l, i) => ({
    side,
    index: i,
    x: startX + i * (BLOCK_W + BLOCK_GAP),
    y: PAN_Y - BLOCK_H - 2,
    label: l.label,
    unknown: l.unknown,
  }))
}

export function balanceBlocks(): WeightBlock[] {
  const left = blocksForPan(
    PAN_LEFT_X,
    LEFT_WEIGHTS.map((w) => ({ label: String(w), unknown: false })),
    'left',
  )
  const right = blocksForPan(
    PAN_RIGHT_X,
    [
      ...RIGHT_KNOWN.map((w) => ({ label: String(w), unknown: false })),
      { label: '?', unknown: true },
    ],
    'right',
  )
  return [...left, ...right]
}

export interface BalanceScaleProps {
  /** 'left' | 'right' highlights one side's blocks; 'solved' fills ? in green; null = neutral. */
  highlight?: Side | 'solved' | null
  /** Reveal the solved value (3) in the ? block. */
  revealValue?: boolean
}

const BLOCK_FILL = '#FFFFFF'
const BLOCK_STROKE = '#1F2937'
const HILITE = '#FDE68A'
const HILITE_STROKE = '#D97706'
const GREEN = '#10B981'
const GREEN_FILL = '#D1FAE5'

export function BalanceScale({ highlight = null, revealValue = false }: BalanceScaleProps) {
  const blocks = balanceBlocks()
  return (
    <svg
      viewBox={`0 0 ${SCALE_VIEW_W} ${SCALE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Fulcrum (triangle) */}
      <polygon
        points={`${FULCRUM_X},${FULCRUM_TOP_Y} ${FULCRUM_X - 26},${FULCRUM_BASE_Y} ${FULCRUM_X + 26},${FULCRUM_BASE_Y}`}
        fill="#CBD5E1"
        stroke="#64748B"
        strokeWidth={2}
      />
      <rect x={FULCRUM_X - 38} y={FULCRUM_BASE_Y} width={76} height={8} rx={3} fill="#64748B" />

      {/* Level beam */}
      <line x1={PAN_LEFT_X} y1={BEAM_Y} x2={PAN_RIGHT_X} y2={BEAM_Y} stroke="#1F2937" strokeWidth={5} strokeLinecap="round" />
      <circle cx={FULCRUM_X} cy={BEAM_Y} r={5} fill="#1F2937" />

      {/* Pan hangers + pans */}
      {[PAN_LEFT_X, PAN_RIGHT_X].map((cx) => (
        <g key={cx}>
          <line x1={cx} y1={BEAM_Y} x2={cx - 26} y2={PAN_Y} stroke="#1F2937" strokeWidth={2} />
          <line x1={cx} y1={BEAM_Y} x2={cx + 26} y2={PAN_Y} stroke="#1F2937" strokeWidth={2} />
          <path d={`M ${cx - 30} ${PAN_Y} Q ${cx} ${PAN_Y + 18} ${cx + 30} ${PAN_Y}`} fill="none" stroke="#1F2937" strokeWidth={3} />
        </g>
      ))}

      {/* Weight blocks */}
      {blocks.map((b) => {
        const isSolved = b.unknown && (highlight === 'solved' || revealValue)
        const isHi = highlight === b.side
        const fill = isSolved ? GREEN_FILL : isHi ? HILITE : BLOCK_FILL
        const stroke = isSolved ? GREEN : isHi ? HILITE_STROKE : BLOCK_STROKE
        const text = b.unknown && (revealValue || highlight === 'solved') ? String(UNKNOWN) : b.label
        return (
          <g key={`${b.side}-${b.index}`}>
            <rect x={b.x} y={b.y} width={BLOCK_W} height={BLOCK_H} rx={3} fill={fill} stroke={stroke} strokeWidth={2} />
            <text
              x={b.x + BLOCK_W / 2}
              y={b.y + BLOCK_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={800}
              fill={isSolved ? '#065F46' : '#1F2937'}
            >
              {text}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function BalanceScaleIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A balanced scale: left pan holds weights ${LEFT_WEIGHTS.join(', ')} and the right pan holds ${RIGHT_KNOWN.join(', ')} and an unknown weight marked with a question mark.`}
    >
      <BalanceScale />
    </div>
  )
}
