// SASMO 2019 G3 Q2 — "Study the pattern below. How many black circles are in
// the circle with the question mark?"
//
// Ten large circles in a row. Each contains small black (filled) and white
// (hollow) circles in specific arrangements:
//   1:1B 1W  2:9B  3:1B 1W  4:3B 1W  5:8B  6:1B 2W  7:3B 1W  8:6B  9:2B 2W  10:?
// Answer: D = 4 (2×2 grid of black circles).
//
// Pure SVG, SSR-safe. No hooks. No Math.random/Date.now.

export type DotSpec = { dx: number; dy: number; filled: boolean; r: number }

// Dot layout for circles 0-8 (0-indexed). Circle 9 is the question mark.
export const CIRCLE_DOTS: DotSpec[][] = [
  // 0: 1B 1W — two large dots side by side
  [
    { dx: -8, dy: 0, filled: true,  r: 7 },
    { dx:  8, dy: 0, filled: false, r: 7 },
  ],
  // 1: 9B — 3×3 grid, all filled
  [
    { dx: -8, dy: -8, filled: true, r: 3.5 },
    { dx:  0, dy: -8, filled: true, r: 3.5 },
    { dx:  8, dy: -8, filled: true, r: 3.5 },
    { dx: -8, dy:  0, filled: true, r: 3.5 },
    { dx:  0, dy:  0, filled: true, r: 3.5 },
    { dx:  8, dy:  0, filled: true, r: 3.5 },
    { dx: -8, dy:  8, filled: true, r: 3.5 },
    { dx:  0, dy:  8, filled: true, r: 3.5 },
    { dx:  8, dy:  8, filled: true, r: 3.5 },
  ],
  // 2: 1B 1W — same as circle 0
  [
    { dx: -8, dy: 0, filled: true,  r: 7 },
    { dx:  8, dy: 0, filled: false, r: 7 },
  ],
  // 3: 3B 1W — 2×2 grid, bottom-right hollow
  [
    { dx: -6, dy: -6, filled: true,  r: 5 },
    { dx:  6, dy: -6, filled: true,  r: 5 },
    { dx: -6, dy:  6, filled: true,  r: 5 },
    { dx:  6, dy:  6, filled: false, r: 5 },
  ],
  // 4: 8B — 2×4 grid, all filled
  [
    { dx: -12, dy: -5, filled: true, r: 3 },
    { dx:  -4, dy: -5, filled: true, r: 3 },
    { dx:   4, dy: -5, filled: true, r: 3 },
    { dx:  12, dy: -5, filled: true, r: 3 },
    { dx: -12, dy:  5, filled: true, r: 3 },
    { dx:  -4, dy:  5, filled: true, r: 3 },
    { dx:   4, dy:  5, filled: true, r: 3 },
    { dx:  12, dy:  5, filled: true, r: 3 },
  ],
  // 5: 1B 2W — cluster of 3
  [
    { dx: -6, dy: -3, filled: true,  r: 5 },
    { dx:  5, dy: -6, filled: false, r: 5 },
    { dx:  5, dy:  5, filled: false, r: 5 },
  ],
  // 6: 3B 1W — 2×2 grid, bottom-left hollow
  [
    { dx: -6, dy: -6, filled: true,  r: 5 },
    { dx:  6, dy: -6, filled: true,  r: 5 },
    { dx: -6, dy:  6, filled: false, r: 5 },
    { dx:  6, dy:  6, filled: true,  r: 5 },
  ],
  // 7: 6B — 2×3 grid, all filled
  [
    { dx: -8, dy: -5, filled: true, r: 4 },
    { dx:  0, dy: -5, filled: true, r: 4 },
    { dx:  8, dy: -5, filled: true, r: 4 },
    { dx: -8, dy:  5, filled: true, r: 4 },
    { dx:  0, dy:  5, filled: true, r: 4 },
    { dx:  8, dy:  5, filled: true, r: 4 },
  ],
  // 8: 2B 2W — 2×2 grid, diagonal blacks
  [
    { dx: -6, dy: -6, filled: true,  r: 5 },
    { dx:  6, dy: -6, filled: false, r: 5 },
    { dx: -6, dy:  6, filled: false, r: 5 },
    { dx:  6, dy:  6, filled: true,  r: 5 },
  ],
]

// The answer: 4 black dots in a 2×2 arrangement (revealed in explainer)
export const ANSWER_COUNT = 4
export const ANSWER_DOTS: DotSpec[] = [
  { dx: -6, dy: -6, filled: true, r: 5 },
  { dx:  6, dy: -6, filled: true, r: 5 },
  { dx: -6, dy:  6, filled: true, r: 5 },
  { dx:  6, dy:  6, filled: true, r: 5 },
]

// Geometry shared with the explainer
export const CIRCLE_R = 18
export const STEP    = 44
export const X0      = 24
export const CY      = 36
export const VIEW_W  = 460
export const VIEW_H  = 72

const INK    = '#1F2937'
const WHITE  = '#FFFFFF'
const STROKE = '#374151'
const BLUE   = '#30598A'

function OuterCircle({
  cx,
  cy,
  dashed = false,
}: {
  cx: number
  cy: number
  dashed?: boolean
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={CIRCLE_R}
      fill={WHITE}
      stroke={STROKE}
      strokeWidth={2}
      strokeDasharray={dashed ? '5 3' : undefined}
    />
  )
}

function InnerDot({ cx, cy, dot }: { cx: number; cy: number; dot: DotSpec }) {
  return (
    <circle
      cx={cx + dot.dx}
      cy={cy + dot.dy}
      r={dot.r}
      fill={dot.filled ? INK : WHITE}
      stroke={STROKE}
      strokeWidth={1.5}
    />
  )
}

export default function CircleCountPatternSASMO19G3Q2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola 10 lingkaran besar berisi lingkaran kecil hitam dan putih; lingkaran ke-10 bertanda tanya."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const cx = X0 + i * STEP
          const isQuestion = i === 9
          return (
            <g key={i}>
              <OuterCircle cx={cx} cy={CY} />
              {isQuestion ? (
                <text
                  x={cx}
                  y={CY + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={22}
                  fontWeight={900}
                  fill={BLUE}
                  className="font-display"
                >
                  ?
                </text>
              ) : (
                CIRCLE_DOTS[i].map((dot, j) => (
                  <InnerDot key={j} cx={cx} cy={CY} dot={dot} />
                ))
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
