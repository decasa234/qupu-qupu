// HKIMO-18-P1H-Q19 — "According to the pattern shown below, what is the
// figure in the space provided?"
//
// Sequence: ○ □ □ □ △  ○ □ □ □ △  ○ □ □ _ △ …
// Repeating cycle (length 5): circle, square, square, square, triangle
// Blank is at position 14.  14 mod 5 = 4 (remainder), so the 4th item
// in the cycle is □ (square) — that is the answer.
//
// Pure SVG — no emoji, no hooks, SSR-safe.
// Adapted from Pattern4PEIllustration.tsx (IKMC-20-PE-Q4).

// ---------------------------------------------------------------------------
// Exported constants (reused by the explainer)
// ---------------------------------------------------------------------------

export type Shape = 'circle' | 'square' | 'triangle'

/** The 5-item repeating cycle. */
export const CYCLE: readonly Shape[] = ['circle', 'square', 'square', 'square', 'triangle']

/** Total number of positions shown (including the blank). */
export const TOTAL_SHOWN = 15

/** 0-based index of the blank slot. */
export const BLANK_IDX = 13 // position 14 → 0-based = 13

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const BLUE = '#30598A'
const AMBER = '#D97706'

const STEP = 27         // px between slot centres
const SY = 52           // shape centre y
const X0 = 20           // first slot centre x

/** Render one shape symbol at (cx, cy). */
function ShapeGlyph({ shape, cx, cy, size = 10, color = INK, strokeW = 2 }: {
  shape: Shape; cx: number; cy: number; size?: number; color?: string; strokeW?: number
}) {
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={size} fill="none" stroke={color} strokeWidth={strokeW} />
  }
  if (shape === 'square') {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
      />
    )
  }
  // triangle
  return (
    <polygon
      points={`${cx},${cy - size - 2} ${cx - size - 1},${cy + size} ${cx + size + 1},${cy + size}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeW}
    />
  )
}

// ---------------------------------------------------------------------------
// Stem illustration
// ---------------------------------------------------------------------------

const VIEW_W = 430
const VIEW_H = 110

// Cycle-bracket geometry (under slots 0–4)
const BRACK_Y1 = SY + 13
const BRACK_Y2 = SY + 23
const BRACK_X0 = X0 - 12
const BRACK_X1 = X0 + 4 * STEP + 12

export default function ShapeSeqHK18P1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola berulang 5 bentuk: lingkaran, persegi, persegi, persegi, segitiga. Tempat kosong ada di posisi ke-14."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Heading */}
        <text
          x={VIEW_W / 2}
          y={16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={BLUE}
        >
          Pola berulang / Repeating pattern
        </text>

        {/* 15 slots */}
        {Array.from({ length: TOTAL_SHOWN }).map((_, i) => {
          const cx = X0 + i * STEP
          const shape = CYCLE[i % CYCLE.length]
          const isBlank = i === BLANK_IDX

          return (
            <g key={i}>
              {/* Position label */}
              <text
                x={cx}
                y={SY + 27}
                textAnchor="middle"
                fontSize={7}
                fill="#9CA3AF"
              >
                {i + 1}
              </text>

              {isBlank ? (
                <>
                  <rect
                    x={cx - 11}
                    y={SY - 11}
                    width={22}
                    height={22}
                    rx={4}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={cx}
                    y={SY + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={900}
                    fill={AMBER}
                  >
                    ?
                  </text>
                </>
              ) : (
                <ShapeGlyph shape={shape} cx={cx} cy={SY} />
              )}
            </g>
          )
        })}

        {/* Ellipsis */}
        <text
          x={X0 + TOTAL_SHOWN * STEP - 4}
          y={SY + 2}
          fontSize={13}
          fontWeight={700}
          fill={INK}
          dominantBaseline="central"
        >
          …
        </text>

        {/* Cycle bracket under slots 0–4 */}
        <path
          d={`M ${BRACK_X0} ${BRACK_Y1} v ${BRACK_Y2 - BRACK_Y1} h ${BRACK_X1 - BRACK_X0} v -${BRACK_Y2 - BRACK_Y1}`}
          fill="none"
          stroke={BLUE}
          strokeWidth={1.6}
        />
        <text
          x={(BRACK_X0 + BRACK_X1) / 2}
          y={BRACK_Y2 + 11}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={BLUE}
        >
          siklus / cycle ×5
        </text>
      </svg>
    </div>
  )
}
