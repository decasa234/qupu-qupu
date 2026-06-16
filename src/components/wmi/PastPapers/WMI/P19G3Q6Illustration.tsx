// Trapezoid-perimeter figure for WMI-19P3A-Q6 (2019 Semifinal Grade 3).
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q6.jpg:
// a shaded trapezoid (wider at the top), with side labels
//   top = 29, left = 26, right = 26, bottom = ?
// The perimeter is 104, so ? = 104 − 29 − 26 − 26 = 23 (answer C).
//
// The static figure shows ONLY the problem (the four labels including "?");
// it never reveals the bottom length.

export const Q6_TOP = 29
export const Q6_LEFT = 26
export const Q6_RIGHT = 26
export const Q6_PERIMETER = 104
export const Q6_BOTTOM = Q6_PERIMETER - Q6_TOP - Q6_LEFT - Q6_RIGHT // 23

const INK = '#1F2937'
const FILL = '#C9C9C9'
const BLUE = '#2f6df0'

export const Q6_VIEW_W = 300
export const Q6_VIEW_H = 280

// Trapezoid corner coordinates (wider at the top, like the scan).
const TL = { x: 70, y: 56 }
const TR = { x: 230, y: 56 }
const BR = { x: 200, y: 220 }
const BL = { x: 100, y: 220 }

export type Q6Side = 'top' | 'left' | 'right' | 'bottom'

const SIDE_POINTS: Record<Q6Side, [number, number, number, number]> = {
  top: [TL.x, TL.y, TR.x, TR.y],
  right: [TR.x, TR.y, BR.x, BR.y],
  bottom: [BR.x, BR.y, BL.x, BL.y],
  left: [BL.x, BL.y, TL.x, TL.y],
}

const SIDE_LABEL_POS: Record<Q6Side, { x: number; y: number }> = {
  top: { x: 150, y: 40 },
  right: { x: 234, y: 138 },
  left: { x: 60, y: 138 },
  bottom: { x: 150, y: 244 },
}

export interface Q6TrapezoidProps {
  /** Show the bottom value instead of "?" (used by the explainer to reveal). */
  showBottom?: boolean
  /** Side to highlight while solving, or null. */
  highlight?: Q6Side | null
}

export function Q6Trapezoid({ showBottom = false, highlight = null }: Q6TrapezoidProps) {
  const labels: Record<Q6Side, string> = {
    top: String(Q6_TOP),
    left: String(Q6_LEFT),
    right: String(Q6_RIGHT),
    bottom: showBottom ? String(Q6_BOTTOM) : '?',
  }

  return (
    <svg
      viewBox={`0 0 ${Q6_VIEW_W} ${Q6_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q6_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* trapezoid body */}
      <polygon
        points={`${TL.x},${TL.y} ${TR.x},${TR.y} ${BR.x},${BR.y} ${BL.x},${BL.y}`}
        fill={FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* highlight overlay on the active side */}
      {highlight &&
        (() => {
          const [x1, y1, x2, y2] = SIDE_POINTS[highlight]
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={6} strokeLinecap="round" />
        })()}

      {/* side labels */}
      {(['top', 'left', 'right', 'bottom'] as Q6Side[]).map((s) => {
        const isQ = s === 'bottom' && !showBottom
        return (
          <text
            key={s}
            x={SIDE_LABEL_POS[s].x}
            y={SIDE_LABEL_POS[s].y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={900}
            fill={isQ ? BLUE : INK}
          >
            {labels[s]}
          </text>
        )
      })}
    </svg>
  )
}

export default function P19G3Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A trapezoid wider at the top. Top side 29, left side 26, right side 26, bottom side unknown (question mark). Its perimeter is 104."
    >
      <Q6Trapezoid />
    </div>
  )
}
