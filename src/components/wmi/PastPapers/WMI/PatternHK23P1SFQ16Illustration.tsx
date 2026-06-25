// HKIMO-23-P1SF-Q16 — "According to the pattern shown below, what is the figure in the space provided?"
//
// Repeating cycle (period 6): [square, triangle, circle, filled-circle, circle, circle]
// The ? is at position 7 (cycle position 1) → answer = square
//
// Source: docs/reference/ocr-res/hkimo/semifinal/primary-1/2023.md Q16
//         docs/reference/ocr-res/hkimo/semifinal/primary-1/2023.imgs/005.jpg
// Seed:   db/seed/hkimo/papers/2023-semifinal-p1.json question 16
//
// Adapted from Pattern4PEIllustration (IKMC-20-PE-Q4).
// Pure SVG. SSR-safe. No hooks, no Math.random/Date.now at module top.

export type ShapeKind = 'square' | 'triangle' | 'circle' | 'filled-circle'

/** The 6-item repeating cycle. */
export const CYCLE: readonly ShapeKind[] = [
  'square', 'triangle', 'circle', 'filled-circle', 'circle', 'circle',
]

/** 1-based position of the missing (?) shape. */
export const QUESTION_POS = 7

/** Total shapes rendered (includes the ? position). */
export const TOTAL_SLOTS = 17

// ---------------------------------------------------------------------------
// Shape geometry constants (re-used by explainer)
// ---------------------------------------------------------------------------

export const SZ = 20   // bounding box size
export const R  = 8    // circle radius

const INK  = '#1F2937'
export const BLUE = '#30598A'

// ---------------------------------------------------------------------------
// Single-shape renderer (exported so the explainer can reuse)
// ---------------------------------------------------------------------------

export function ShapeGlyph({
  kind, cx, cy, fill,
}: {
  kind: ShapeKind
  cx: number
  cy: number
  fill?: string
}) {
  const ink = fill ?? INK
  if (kind === 'square') {
    return (
      <rect
        x={cx - SZ / 2} y={cy - SZ / 2}
        width={SZ} height={SZ}
        fill="none" stroke={ink} strokeWidth={2.2}
      />
    )
  }
  if (kind === 'triangle') {
    const h = SZ * 0.9
    const pts = `${cx},${cy - h / 2} ${cx - SZ / 2},${cy + h / 2} ${cx + SZ / 2},${cy + h / 2}`
    return <polygon points={pts} fill="none" stroke={ink} strokeWidth={2.2} />
  }
  if (kind === 'filled-circle') {
    return <circle cx={cx} cy={cy} r={R} fill={ink} />
  }
  // circle (outline)
  return <circle cx={cx} cy={cy} r={R} fill="none" stroke={ink} strokeWidth={2.2} />
}

// ---------------------------------------------------------------------------
// Layout constants (exported for explainer)
// ---------------------------------------------------------------------------

export const VIEW_W = 440
export const VIEW_H = 108
export const SLOT_Y  = 44
export const SLOT_X0 = 22
export const SLOT_STEP = 24

// ---------------------------------------------------------------------------
// Stem illustration (default export)
// ---------------------------------------------------------------------------

export default function PatternHK23P1SFQ16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pola berulang 6 bentuk: persegi, segitiga, lingkaran, lingkaran hitam, lingkaran, lingkaran. Posisi ke-7 kosong (?)."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Title */}
        <text
          x={VIEW_W / 2} y={13}
          textAnchor="middle" fontSize={10} fontWeight={800} fill={BLUE}
        >
          Pola berulang / Repeating pattern — setiap 6 / every 6
        </text>

        {/* Shape slots */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const pos = i + 1
          const cx = SLOT_X0 + i * SLOT_STEP
          const isQ = pos === QUESTION_POS

          if (isQ) {
            return (
              <g key={i}>
                <rect
                  x={cx - SZ / 2} y={SLOT_Y - SZ / 2}
                  width={SZ} height={SZ} rx={3}
                  fill="none" stroke={BLUE} strokeWidth={1.8} strokeDasharray="4 3"
                />
                <text
                  x={cx} y={SLOT_Y + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={13} fontWeight={900} fill={BLUE}
                >
                  ?
                </text>
              </g>
            )
          }

          const kind = CYCLE[(pos - 1) % CYCLE.length]
          return <ShapeGlyph key={i} kind={kind} cx={cx} cy={SLOT_Y} />
        })}

        {/* Cycle bracket under positions 1–6 */}
        {(() => {
          const x0 = SLOT_X0 - 12
          const x1 = SLOT_X0 + 5 * SLOT_STEP + 12
          const bTop = SLOT_Y + SZ / 2 + 5
          const bBot = bTop + 10
          return (
            <g>
              <path
                d={`M ${x0} ${bTop} v ${bBot - bTop} h ${x1 - x0} v -${bBot - bTop}`}
                fill="none" stroke={BLUE} strokeWidth={1.6}
              />
              <text
                x={(x0 + x1) / 2} y={bBot + 11}
                textAnchor="middle" fontSize={9} fontWeight={700} fill={BLUE}
              >
                1 siklus / 1 cycle
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
