// HKIMO-19-P2H-Q18 — repeating shape-sequence pattern
//
// Sequence shown on the paper:
//   ○ □ □ △ ○  ○ □ □ △ ○  ○ □ □ △ __ ○ …
//   pos: 1 2 3 4 5  6 7 8 9 10  11 12 13 14 15 16
//
// Repeating unit: ○ □ □ △ ○  (length 5)
// Blank is at position 15 (0-indexed: 14)
// 15 mod 5 = 0  →  5th symbol (index 4) = ○
// Answer: ○
//
// This is a fill-in question (no picture choices), so only a stem illustration
// is needed. Adapted from Pattern4PEIllustration (IKMC-20-PE-Q4).
//
// Pure SVG. SSR-safe. No window/document at module top. No Math.random/Date.now.

export type Shape = 'circle' | 'square' | 'triangle'

// ---------------------------------------------------------------------------
// Exported constants (reused by explainer)
// ---------------------------------------------------------------------------

/** The 5-item repeating cycle. */
export const CYCLE: readonly Shape[] = ['circle', 'square', 'square', 'triangle', 'circle']

/** 0-indexed position of the blank in the displayed row (position 15). */
export const BLANK_IDX = 14

/** Total number of slots shown (positions 1–16). */
export const TOTAL_SHOWN = 16

// ---------------------------------------------------------------------------
// Shared shape glyph (reused in explainer)
// ---------------------------------------------------------------------------

const _DEFAULT_SIZE = 16
const _DEFAULT_SW = 2

export function ShapeGlyph({
  shape,
  cx,
  cy,
  size,
  color,
  strokeWidth,
}: {
  shape: Shape
  cx: number
  cy: number
  size?: number
  color: string
  strokeWidth?: number
}) {
  const s = size ?? _DEFAULT_SIZE
  const sw = strokeWidth ?? _DEFAULT_SW
  const r = s / 2

  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={color} strokeWidth={sw} />
  }

  if (shape === 'square') {
    return (
      <rect
        x={cx - r + 1}
        y={cy - r + 1}
        width={s - 2}
        height={s - 2}
        fill="none"
        stroke={color}
        strokeWidth={sw}
      />
    )
  }

  // triangle (equilateral, pointing up)
  const side = s - 2
  const h = side * (Math.sqrt(3) / 2)
  const py0 = cy - (h * 2) / 3
  const py1 = cy + h / 3
  return (
    <polygon
      points={`${cx},${py0} ${cx - side / 2},${py1} ${cx + side / 2},${py1}`}
      fill="none"
      stroke={color}
      strokeWidth={sw}
    />
  )
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const INK = '#1F2937'
const BLUE = '#30598A'

const VIEW_W = 480
const VIEW_H = 105

const SLOT_Y = 44
const SLOT_X0 = 18
const SLOT_STEP = 28
const SHAPE_SIZE = 16

// Bracket under slots 0–4 (repeating unit)
const BRK_Y0 = SLOT_Y + 13
const BRK_Y1 = SLOT_Y + 25
const BRK_X0 = SLOT_X0 - 8
const BRK_X1 = SLOT_X0 + 4 * SLOT_STEP + 8

// ---------------------------------------------------------------------------
// Default export — stem illustration
// ---------------------------------------------------------------------------

export default function PatternHK19P2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola berulang: lingkaran, kotak, kotak, segitiga, lingkaran. Posisi 15 kosong. Temukan gambar yang tepat."
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
          y={14}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          Temukan pola berulang / Find the repeating pattern
        </text>

        {/* 16 shape slots */}
        {Array.from({ length: TOTAL_SHOWN }).map((_, i) => {
          const cx = SLOT_X0 + i * SLOT_STEP
          const shape = CYCLE[i % CYCLE.length]
          const isBlank = i === BLANK_IDX

          return (
            <g key={i}>
              {isBlank ? (
                <>
                  <rect
                    x={cx - 10}
                    y={SLOT_Y - 10}
                    width={20}
                    height={20}
                    rx={4}
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
                    fontSize={13}
                    fontWeight={900}
                    fill={BLUE}
                    className="font-display"
                  >
                    ?
                  </text>
                </>
              ) : (
                <ShapeGlyph shape={shape} cx={cx} cy={SLOT_Y} color={INK} size={SHAPE_SIZE} />
              )}
            </g>
          )
        })}

        {/* "…" after the last slot */}
        <text
          x={SLOT_X0 + TOTAL_SHOWN * SLOT_STEP}
          y={SLOT_Y + 1}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={INK}
        >
          …
        </text>

        {/* Bracket under slots 0–4 marking the repeating unit */}
        <path
          d={`M ${BRK_X0} ${BRK_Y0} v ${BRK_Y1 - BRK_Y0} h ${BRK_X1 - BRK_X0} v -${BRK_Y1 - BRK_Y0}`}
          fill="none"
          stroke={BLUE}
          strokeWidth={1.6}
        />
        <text
          x={(BRK_X0 + BRK_X1) / 2}
          y={BRK_Y1 + 12}
          textAnchor="middle"
          fontSize={9}
          fontWeight={800}
          fill={BLUE}
          className="font-display"
        >
          unit berulang / repeating unit
        </text>
      </svg>
    </div>
  )
}
