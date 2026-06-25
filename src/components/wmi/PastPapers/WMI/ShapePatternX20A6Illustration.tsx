// SEAMOX-20-A-Q6 — "Draw the 17th shape in the geometric pattern shown below."
//
// Pattern (cycle length 5):
//   pos 1 = □  pos 2 = ○  pos 3 = △  pos 4 = ◇  pos 5 = ⬠
//
// The paper image shows 12 shapes: □ ○ △ ◇ ⬠ □ ○ △ ◇ ⬠ □ ○
// Question: what is the 17th?  17 ÷ 5 = 3 r 2 → position 2 = ○
//
// Pure SVG (no emoji — geometric Unicode glyphs). SSR-safe.
// Adapted from Pattern4PEIllustration.tsx (IKMC-20-PE-Q4).

// ---------------------------------------------------------------------------
// Exported constants — shared with the explainer
// ---------------------------------------------------------------------------

/** The five shapes in order. Unicode geometric outlines. */
export const SHAPE_CYCLE = ['□', '○', '△', '◇', '⬠'] as const
export type ShapeChar = (typeof SHAPE_CYCLE)[number]

/** How many shapes are shown in the paper figure. */
export const SHOWN_COUNT = 12

/** The position being asked about. */
export const ASK_POS = 17

/** Correct answer character. */
export const ANSWER_SHAPE: ShapeChar = '○'

// ---------------------------------------------------------------------------
// Brand palette
// ---------------------------------------------------------------------------

const BLUE = '#30598A'
const INK  = '#1F2937'

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const VIEW_W = 460
const VIEW_H = 130

const SLOT_Y    = 60
const SLOT_X0   = 24
const SLOT_STEP = 36
const SLOT_SIZE = 28

// Cycle-bracket geometry (under slots 0–4)
const BRACK_TOP = SLOT_Y + 16
const BRACK_BOT = SLOT_Y + 28
const BRACK_X0  = SLOT_X0 - 10
const BRACK_X1  = SLOT_X0 + 4 * SLOT_STEP + 10

// ---------------------------------------------------------------------------
// Stem illustration (default export)
// ---------------------------------------------------------------------------

/**
 * Shows the 12-shape printed sequence from the paper, a cycle bracket under
 * the first five slots, and a dashed "?" slot labelled "17th" to the right.
 */
export default function ShapePatternX20A6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola geometri berulang: □ ○ △ ◇ ⬠ □ ○ △ ◇ ⬠ □ ○ … Temukan bentuk ke-17."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Title */}
        <text
          x={VIEW_W / 2}
          y={18}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          Geometric pattern — find the 17th shape / Temukan bentuk ke-17
        </text>

        {/* 12 shown shape slots */}
        {Array.from({ length: SHOWN_COUNT }).map((_, i) => {
          const cx = SLOT_X0 + i * SLOT_STEP
          return (
            <text
              key={i}
              x={cx}
              y={SLOT_Y + 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fill={INK}
            >
              {SHAPE_CYCLE[i % SHAPE_CYCLE.length]}
            </text>
          )
        })}

        {/* Ellipsis after the shown shapes */}
        <text
          x={SLOT_X0 + SHOWN_COUNT * SLOT_STEP}
          y={SLOT_Y + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fill={INK}
        >
          …
        </text>

        {/* "17th = ?" dashed slot */}
        {(() => {
          const cx = SLOT_X0 + (SHOWN_COUNT + 2) * SLOT_STEP
          return (
            <g>
              <rect
                x={cx - SLOT_SIZE / 2}
                y={SLOT_Y - SLOT_SIZE / 2}
                width={SLOT_SIZE}
                height={SLOT_SIZE}
                rx={5}
                fill="none"
                stroke={BLUE}
                strokeWidth={1.8}
                strokeDasharray="4 3"
              />
              <text
                x={cx}
                y={SLOT_Y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={900}
                fill={BLUE}
                className="font-display"
              >
                ?
              </text>
              <text
                x={cx}
                y={SLOT_Y + SLOT_SIZE / 2 + 10}
                textAnchor="middle"
                fontSize={8}
                fill={BLUE}
                className="font-display"
              >
                17th
              </text>
            </g>
          )
        })()}

        {/* Cycle bracket under slots 0–4 */}
        <path
          d={`M ${BRACK_X0} ${BRACK_TOP} v ${BRACK_BOT - BRACK_TOP} h ${BRACK_X1 - BRACK_X0} v -${BRACK_BOT - BRACK_TOP}`}
          fill="none"
          stroke={BLUE}
          strokeWidth={1.8}
        />
        <text
          x={(BRACK_X0 + BRACK_X1) / 2}
          y={BRACK_BOT + 12}
          textAnchor="middle"
          fontSize={9}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          cycle of 5
        </text>
      </svg>
    </div>
  )
}
