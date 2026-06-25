/**
 * SEAMOX-23-A-Q1 — Stem illustration for "Find the missing number in the diagram".
 *
 * Source: docs/reference/ocr-res/seamo-x/contest/paper-a/2023.imgs/001-003.jpg
 * Answer: 55
 *
 * Three panels showing consecutive Fibonacci windows [1,1,2]→(3,5),
 * [3,5,8]→(13,21), [13,21,34]→(?,89). The left circle of panel 3 is
 * the missing number. Rule: left_circle = box2+box3; right_circle = left_circle+box3.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

// ── Geometry ──────────────────────────────────────────────────────────────────

export const VW = 610
export const VH = 100

const BOX_W = 60
const BOX_H = 36
const BOX_Y = 8
const CIR_R = 20
const CIR_Y = 76 // circle centre y (box bottom 44 + gap 12 + radius 20)

// Each panel origin x. Within each panel: box1 at x=0, box2 at x=60, box3 at x=120.
// Left circle cx=60, right circle cx=120. Panel width = 180; 25px gap between panels.
export const PANEL_ORIGINS = [10, 215, 420] as const

// ── Data ──────────────────────────────────────────────────────────────────────

export const FIB_PANELS: Array<{ boxes: string[]; circles: string[] }> = [
  { boxes: ['1', '1', '2'],  circles: ['3', '5']   },
  { boxes: ['3', '5', '8'],  circles: ['13', '21']  },
  { boxes: ['13', '21', '34'], circles: ['55', '89'] }, // circles[0] = answer
]

// ── Shared SVG primitive ──────────────────────────────────────────────────────

export interface FibPanelX23A1SVGProps {
  /** Index of the panel that contains the blank circle (shown as '?'). null = all revealed. */
  blankPanel?: number | null
  /** Replacement label when blankPanel's left circle is revealed (overrides '?'). */
  revealedAnswer?: string
  /** Which panel to tint (light blue highlight). */
  highlightPanel?: number | null
  /** Which circle in highlightPanel to accent. */
  highlightCircle?: 'left' | 'right' | null
}

export function FibPanelX23A1SVG({
  blankPanel = 2,
  revealedAnswer,
  highlightPanel = null,
  highlightCircle = null,
}: FibPanelX23A1SVGProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {FIB_PANELS.map((panel, pi) => {
        const ox = PANEL_ORIGINS[pi]
        const isPanelHL = pi === highlightPanel

        return (
          <g key={pi}>
            {/* Three boxes */}
            {panel.boxes.map((val, bi) => {
              const bx = ox + bi * BOX_W
              return (
                <g key={bi}>
                  <rect
                    x={bx}
                    y={BOX_Y}
                    width={BOX_W}
                    height={BOX_H}
                    fill={isPanelHL ? '#EFF6FF' : '#FFFFFF'}
                    stroke="#1C1917"
                    strokeWidth={2}
                    rx={2}
                  />
                  <text
                    x={bx + BOX_W / 2}
                    y={BOX_Y + BOX_H / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={15}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    fill="#1C1917"
                  >
                    {val}
                  </text>
                </g>
              )
            })}

            {/* Two circles */}
            {panel.circles.map((val, ci) => {
              const cx = ox + BOX_W + ci * BOX_W // cx at 60 and 120 within panel
              const isBlankCircle = pi === blankPanel && ci === 0
              const isRevealed = isBlankCircle && revealedAnswer != null
              const isCircHL =
                isPanelHL &&
                ((ci === 0 && highlightCircle === 'left') ||
                  (ci === 1 && highlightCircle === 'right'))

              let fill = '#FFFFFF'
              let stroke = '#1C1917'
              let textFill = '#1C1917'

              if (isBlankCircle && !isRevealed) {
                fill = '#FEF3C7'
                stroke = '#D97706'
                textFill = '#92400E'
              }
              if (isRevealed) {
                fill = '#D1FAE5'
                stroke = '#059669'
                textFill = '#065F46'
              }
              if (isCircHL && !isRevealed) {
                fill = '#DBEAFE'
                stroke = '#2563EB'
                textFill = '#1D4ED8'
              }

              const label = isRevealed ? revealedAnswer! : val
              const isQuestion = isBlankCircle && !isRevealed

              return (
                <g key={ci}>
                  <circle
                    cx={cx}
                    cy={CIR_Y}
                    r={CIR_R}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                  />
                  <text
                    x={cx}
                    y={CIR_Y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isQuestion ? 18 : label.length > 2 ? 12 : 14}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    fill={textFill}
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

export default function FibPanelX23A1Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Three panels of Fibonacci windows: [1,1,2]→(3,5), [3,5,8]→(13,21), [13,21,34]→(?,89). Find the missing number in the left circle of the third panel."
    >
      <FibPanelX23A1SVG />
    </div>
  )
}
