/**
 * SEAMOX-24-A-Q12 — Stem illustration
 *
 * Shows the GIVEN scenario: 1 vertical cut divides a log into 2 pieces
 * (taking 2 minutes). The question (4 pieces = ? min) is left unanswered.
 *
 * Exports `SawLogSVG` so the explainer can reuse the same geometry.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

const LOG_X = 20
const LOG_Y = 14
const LOG_W = 260
const LOG_H = 64
const LOG_RX = 16

const LOG_FILL   = '#B8722A'
const LOG_STRIPE = '#CD8A3C'
const LOG_STROKE = '#7A4E18'
const CUT_NORMAL = '#1E3A5F'
const CUT_HI     = '#EF4444'

/** x-centre of the i-th cut line given `total` cuts. */
function cutX(i: number, total: number): number {
  return LOG_X + (LOG_W / (total + 1)) * (i + 1)
}

/** x-centre of piece i (0-based) given `total` cuts. */
function pieceCX(i: number, total: number): number {
  const w = LOG_W / (total + 1)
  return LOG_X + w * i + w / 2
}

export interface SawLogSVGProps {
  /** Number of vertical cuts shown (0–3). pieces = cuts + 1. */
  cuts?: number
  /** Index of the cut to highlight in red (0-based). null = none. */
  highlightCut?: number | null
}

/**
 * Shared log SVG — used by both the illustration and the explainer.
 * Emits a root `<svg>` (SSR-safe).
 */
export function SawLogSVG({ cuts = 1, highlightCut = null }: SawLogSVGProps) {
  const pieces = cuts + 1
  const VB_W = LOG_X * 2 + LOG_W
  const VB_H = LOG_Y * 2 + LOG_H

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      aria-hidden="true"
    >
      {/* log body */}
      <rect
        x={LOG_X}
        y={LOG_Y}
        width={LOG_W}
        height={LOG_H}
        rx={LOG_RX}
        fill={LOG_FILL}
        stroke={LOG_STROKE}
        strokeWidth={2}
      />

      {/* alternating-shade stripes per piece (clipped to log shape) */}
      {pieces > 1 &&
        Array.from({ length: pieces }).map((_, i) => {
          if (i % 2 === 0) return null
          const pW = LOG_W / pieces
          return (
            <rect
              key={i}
              x={LOG_X + pW * i}
              y={LOG_Y}
              width={pW}
              height={LOG_H}
              fill={LOG_STRIPE}
              opacity={0.6}
            />
          )
        })}

      {/* cut lines */}
      {Array.from({ length: cuts }).map((_, i) => {
        const cx = cutX(i, cuts)
        const isHi = highlightCut === i
        return (
          <line
            key={i}
            x1={cx}
            y1={LOG_Y - 5}
            x2={cx}
            y2={LOG_Y + LOG_H + 5}
            stroke={isHi ? CUT_HI : CUT_NORMAL}
            strokeWidth={isHi ? 3 : 2}
            strokeDasharray="6 3"
          />
        )
      })}

      {/* piece number labels */}
      {Array.from({ length: pieces }).map((_, i) => (
        <text
          key={i}
          x={pieceCX(i, cuts)}
          y={LOG_Y + LOG_H / 2 + 5}
          textAnchor="middle"
          fontSize={15}
          fontWeight="700"
          fill="#FFFFFF"
          fontFamily="sans-serif"
        >
          {i + 1}
        </text>
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function SawLogX24A12Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-2 rounded-lg border-2 border-qupu-cream-dark bg-white px-4 pb-4 pt-3"
      role="img"
      aria-label="A log split by 1 vertical cut into 2 pieces. 1 cut takes 2 minutes."
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        1 cut → 2 pieces (2 min)
      </p>
      <SawLogSVG cuts={1} />
    </div>
  )
}
