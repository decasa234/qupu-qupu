// In-card figure for WMI-23P3A-Q4 (2023 Grade-3 Semifinal, Paper A, question 4).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q4.jpg (NOT embedded):
// a rectangle divided into 9 equal VERTICAL strips. Reading left → right the
// strips alternate shaded / un-shaded, starting AND ending shaded:
//   shaded, white, shaded, white, shaded, white, shaded, white, shaded
// So 5 of the 9 strips are coloured → the shaded fraction is 5/9 (answer D).
//
// The static figure is PROBLEM-ONLY: it shows the divided shape with its real
// shading, never the fraction answer. Pure render, SSR-safe, deterministic.

export const STRIP_COUNT = 9
/** Which strips (0-indexed, left→right) are shaded. */
export const SHADED_STRIPS = [0, 2, 4, 6, 8] as const
export const SHADED_COUNT = SHADED_STRIPS.length // 5

const INK = '#2A2A2A'
const SHADE = '#AEDCF3' // light blue, matching the scan
const SHADE_EDGE = '#5BA9D6'

// ---- pixel layout -----------------------------------------------------------
const PAD = 14
const STRIP_W = 34
const GAP = 6 // thin white channel the scan shows between strips
const RECT_H = 168
const VIEW_W = PAD * 2 + STRIP_COUNT * STRIP_W + (STRIP_COUNT - 1) * GAP
const VIEW_H = PAD * 2 + RECT_H

export interface FractionStripsProps {
  /** Highlight strips that have been counted so far, left→right (0..9). */
  countedShaded?: number
  /** Draw a thicker outline once the whole shape is read as the "denominator". */
  ringWhole?: boolean
}

/**
 * The 9-strip rectangle. `countedShaded` rings the first N shaded strips with a
 * bold tick (used by the explainer while it counts the coloured parts).
 */
export function FractionStrips({ countedShaded = 0, ringWhole = false }: FractionStripsProps) {
  const x0 = PAD
  const y0 = PAD
  // running index over only the shaded strips, to know which are "counted"
  let shadedSeen = 0

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Array.from({ length: STRIP_COUNT }, (_, i) => {
        const x = x0 + i * (STRIP_W + GAP)
        const isShaded = (SHADED_STRIPS as readonly number[]).includes(i)
        let counted = false
        if (isShaded) {
          counted = shadedSeen < countedShaded
          shadedSeen += 1
        }
        return (
          <g key={i}>
            <rect
              x={x}
              y={y0}
              width={STRIP_W}
              height={RECT_H}
              fill={isShaded ? SHADE : '#FFFFFF'}
              stroke={isShaded ? SHADE_EDGE : INK}
              strokeWidth={2}
            />
            {counted && (
              <g>
                {/* a small check tick centered in the counted shaded strip */}
                <circle cx={x + STRIP_W / 2} cy={y0 + RECT_H / 2} r={11} fill="#FFFFFF" stroke="#1D7A46" strokeWidth={2.5} />
                <path
                  d={`M ${x + STRIP_W / 2 - 5} ${y0 + RECT_H / 2} l 3.5 4 l 6 -8`}
                  fill="none"
                  stroke="#1D7A46"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        )
      })}

      {/* outer frame of the whole rectangle */}
      <rect
        x={x0 - 2}
        y={y0 - 2}
        width={STRIP_COUNT * STRIP_W + (STRIP_COUNT - 1) * GAP + 4}
        height={RECT_H + 4}
        fill="none"
        stroke={ringWhole ? '#2f6df0' : INK}
        strokeWidth={ringWhole ? 4 : 2.5}
      />
    </svg>
  )
}

export default function P23G3Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A rectangle split into 9 equal vertical strips; strips 1, 3, 5, 7 and 9 are shaded blue and the rest are white."
    >
      <FractionStrips />
    </div>
  )
}
