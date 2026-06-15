// Repeating-symbol pattern strip for WMI-19P3A-Q5 (2019 Semifinal Grade 3).
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q5.jpg:
// a row of 12 boxes. The first eight are filled with the repeating loop
//   ○ × △ △ | ○ × △ △
// followed by three blank boxes, the "?" box (11th box), and one more blank.
// The loop has period 4 (○ × △ △). Box 11 lands on the 3rd slot of the loop,
// which is △ — answer C.
//
// The static figure shows ONLY the problem (filled cells + the "?"); it never
// reveals the answer.

export type Glyph = 'circle' | 'cross' | 'triangle' | 'blank' | 'q'

/** The repeating loop, one period. */
export const LOOP: Glyph[] = ['circle', 'cross', 'triangle', 'triangle']

/** The twelve boxes exactly as printed (8 filled, blanks, then "?"). */
export const Q5_CELLS: Glyph[] = [
  'circle', 'cross', 'triangle', 'triangle',
  'circle', 'cross', 'triangle', 'triangle',
  'blank', 'blank', 'q', 'blank',
]

/** Zero-based index of the "?" box. */
export const Q5_QMARK_INDEX = Q5_CELLS.indexOf('q') // 10
/** The glyph the loop assigns to the "?" box. */
export const Q5_ANSWER_GLYPH: Glyph = LOOP[Q5_QMARK_INDEX % LOOP.length] // 'triangle'

const INK = '#1F2937'
const BLUE = '#2f6df0'

const CELL = 46 // box edge length
const PAD = 12 // viewBox padding

export const Q5_VIEW_W = PAD * 2 + CELL * Q5_CELLS.length
export const Q5_VIEW_H = PAD * 2 + CELL

/** One symbol drawn centred in a cell of the given size. */
export function GlyphMark({
  glyph,
  cx,
  cy,
  size = 26,
  color = INK,
}: {
  glyph: Glyph
  cx: number
  cy: number
  size?: number
  color?: string
}) {
  const r = size / 2
  if (glyph === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={3} />
  }
  if (glyph === 'cross') {
    return (
      <g stroke={color} strokeWidth={3} strokeLinecap="round">
        <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
        <line x1={cx - r} y1={cy + r} x2={cx + r} y2={cy - r} />
      </g>
    )
  }
  if (glyph === 'triangle') {
    const h = size * 0.92
    const top = cy - h / 2
    const bot = cy + h / 2
    return (
      <polygon
        points={`${cx},${top} ${cx - r},${bot} ${cx + r},${bot}`}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    )
  }
  if (glyph === 'q') {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={BLUE}>
        ?
      </text>
    )
  }
  return null
}

export interface Q5StripProps {
  /** Cells to draw; defaults to the real printed strip. */
  cells?: Glyph[]
  /** Box index to ring with a highlight (e.g. while solving). */
  highlightIndex?: number | null
  /** Override the glyph drawn at the "?" box (used by the explainer to reveal). */
  revealAt?: { index: number; glyph: Glyph } | null
}

export function Q5Strip({ cells = Q5_CELLS, highlightIndex = null, revealAt = null }: Q5StripProps) {
  return (
    <svg
      viewBox={`0 0 ${Q5_VIEW_W} ${Q5_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q5_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {cells.map((g, i) => {
        const x = PAD + i * CELL
        const y = PAD
        const cx = x + CELL / 2
        const cy = y + CELL / 2
        const shown: Glyph = revealAt && revealAt.index === i ? revealAt.glyph : g
        const isHi = highlightIndex === i
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              fill={isHi ? '#FEF3C7' : '#FFFFFF'}
              stroke={isHi ? '#F59E0B' : INK}
              strokeWidth={isHi ? 3 : 1.5}
            />
            <GlyphMark glyph={shown} cx={cx} cy={cy} />
          </g>
        )
      })}
    </svg>
  )
}

export default function P19G3Q5Illustration() {
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A row of twelve boxes. The first eight repeat the loop circle, cross, triangle, triangle. Then blanks, with a question mark in the eleventh box."
    >
      <Q5Strip />
    </div>
  )
}
