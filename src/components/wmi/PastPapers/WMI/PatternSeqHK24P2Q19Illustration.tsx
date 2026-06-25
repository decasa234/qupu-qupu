// HKIMO-24-P2H-Q19 — "According to the pattern shown below, what is the figure
// in the space provided?"
//
// The stem shows a horizontal sequence of three shape types:
//   ▲ = filled black upward triangle
//   ● = filled black circle
//   ■ = stipple-filled rectangle (dotted box)
//
// Repeating unit (5 shapes): ▲ ▲ ▲ ● ■
// 16 shapes total visible, blank at index 13 (position 14).
// 13 % 5 = 3 → CYCLE[3] = 'C' (circle). Answer: ●.
//
// Faithful to 2024.imgs/007.jpg.
// No Math.random, no Date — SSR-safe & deterministic.

// ---------------------------------------------------------------------------
// Types & cycle data
// ---------------------------------------------------------------------------

export type ShapeKind = 'T' | 'C' | 'R' | 'BLANK'  // Triangle | Circle | Rect | Blank

/** One repeating unit of the sequence. */
export const PATTERN_CYCLE: Exclude<ShapeKind, 'BLANK'>[] = ['T', 'T', 'T', 'C', 'R']

/**
 * Full 16-shape sequence (left-to-right).
 * Index 13 (position 14) is the blank to be filled.
 * 13 % 5 = 3 → CYCLE[3] = 'C'.
 */
export const PATTERN_SEQ: ShapeKind[] = Array.from({ length: 16 }, (_, i) =>
  i === 13 ? 'BLANK' : PATTERN_CYCLE[i % PATTERN_CYCLE.length],
)

export const BLANK_INDEX = 13
export const BLANK_ANSWER: 'C' = 'C'

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const SPACING  = 32       // centre-to-centre
const PAD_X    = 20
const CY       = 26
const SVG_H    = 52
const N        = PATTERN_SEQ.length  // 16
export const SVG_W = PAD_X + N * SPACING + 30   // +30 for trailing "…"

/** X-centre of shape at index i. */
export function shapeCx(i: number): number {
  return PAD_X + 16 + i * SPACING
}

// ---------------------------------------------------------------------------
// Individual shape glyphs (all centred at (cx, CY))
// ---------------------------------------------------------------------------

const FILL_BLACK  = '#1F2937'
const FILL_WHITE  = '#FFFFFF'
const STROKE_DARK = '#1F2937'
export const DOTS_ID = 'p2q19-dots'  // unique per page
const DASHED_CLR  = '#9CA3AF'

export function ShapeTriangle({ cx, cy = CY, size = 12 }: { cx: number; cy?: number; size?: number }) {
  // upward-pointing equilateral-ish triangle
  const pts = `${cx},${cy - size} ${cx - size},${cy + size * 0.75} ${cx + size},${cy + size * 0.75}`
  return <polygon points={pts} fill={FILL_BLACK} />
}

export function ShapeCircle({ cx, cy = CY, r = 10 }: { cx: number; cy?: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={FILL_BLACK} />
}

export function ShapeDottedRect({
  cx,
  cy = CY,
  w = 24,
  h = 22,
  dotsId = DOTS_ID,
}: {
  cx: number
  cy?: number
  w?: number
  h?: number
  dotsId?: string
}) {
  return (
    <rect
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      fill={`url(#${dotsId})`}
      stroke={STROKE_DARK}
      strokeWidth={1.5}
    />
  )
}

export function ShapeBlank({
  cx,
  cy = CY,
  w = 24,
  h = 22,
  reveal = false,
}: {
  cx: number
  cy?: number
  w?: number
  h?: number
  reveal?: boolean
}) {
  if (reveal) {
    return (
      <g>
        <rect
          x={cx - w / 2 - 2}
          y={cy - h / 2 - 2}
          width={w + 4}
          height={h + 4}
          rx={3}
          fill="#D1FAE5"
          stroke="#10B981"
          strokeWidth={2}
        />
        <ShapeCircle cx={cx} cy={cy} r={10} />
      </g>
    )
  }
  return (
    <rect
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      rx={2}
      fill={FILL_WHITE}
      stroke={DASHED_CLR}
      strokeWidth={2}
      strokeDasharray="4 3"
    />
  )
}

/** Render a single shape at the given screen position. */
export function ShapeGlyph({
  kind,
  cx,
  cy = CY,
  reveal = false,
}: {
  kind: ShapeKind
  cx: number
  cy?: number
  reveal?: boolean
}) {
  if (kind === 'T') return <ShapeTriangle cx={cx} cy={cy} />
  if (kind === 'C') return <ShapeCircle cx={cx} cy={cy} />
  if (kind === 'R') return <ShapeDottedRect cx={cx} cy={cy} />
  return <ShapeBlank cx={cx} cy={cy} reveal={reveal} />
}

// ---------------------------------------------------------------------------
// Illustration — the stem (shows the sequence with the blank box)
// ---------------------------------------------------------------------------

export default function PatternSeqHK24P2Q19Illustration({
  revealAnswer = false,
}: {
  revealAnswer?: boolean
}) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        revealAnswer
          ? 'Pattern: three triangles, one circle, one dotted box repeating. The blank is a filled circle.'
          : 'Shape pattern sequence with a blank space — determine the missing figure.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <defs>
          {/* Stipple pattern for the dotted rectangle */}
          <pattern
            id={DOTS_ID}
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill={FILL_BLACK} />
          </pattern>
        </defs>

        {/* Shapes */}
        {PATTERN_SEQ.map((kind, i) => (
          <ShapeGlyph
            key={i}
            kind={kind}
            cx={shapeCx(i)}
            cy={CY}
            reveal={kind === 'BLANK' && revealAnswer}
          />
        ))}

        {/* Trailing ellipsis */}
        <text
          x={PAD_X + N * SPACING + 16 + 4}
          y={CY + 5}
          fontSize={16}
          fill={STROKE_DARK}
          fontWeight="bold"
        >
          …
        </text>
      </svg>
    </div>
  )
}
