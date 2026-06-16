// Repeating-pattern row for WMI-19F3A-Q9: ◻ ▼ ◯ ★ ◻ ▼ ◯ ★ … find the 32nd.
// Drawn as equal-sized SVG shapes (the text glyphs render at different sizes).

export type PatternKind = 'square' | 'tri' | 'circle' | 'star'
export const PATTERN_CYCLE: ReadonlyArray<PatternKind> = ['square', 'tri', 'circle', 'star']

const INK = '#1F2937'

/** One equal-sized pattern glyph centred at (cx, cy). */
export function PatternGlyph({ kind, cx, cy, r = 10, color = INK }: { kind: PatternKind; cx: number; cy: number; r?: number; color?: string }) {
  if (kind === 'square') {
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="none" stroke={color} strokeWidth={2.2} />
  }
  if (kind === 'tri') {
    return <polygon points={`${cx - r},${cy - r * 0.9} ${cx + r},${cy - r * 0.9} ${cx},${cy + r}`} fill={color} />
  }
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2.2} />
  }
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r * 1.15 : r * 0.48
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={color} />
}

export const PC_VIEW_W = 360
export const PC_VIEW_H = 64

export default function PatternCycleG3Illustration() {
  const STEP = 27
  const X0 = 22
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A repeating row of shapes: square, triangle, circle, star, over and over."
    >
      <svg viewBox={`0 0 ${PC_VIEW_W} ${PC_VIEW_H}`} width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <PatternGlyph key={i} kind={PATTERN_CYCLE[i % 4]} cx={X0 + i * STEP} cy={PC_VIEW_H / 2} />
        ))}
        <text x={X0 + 12 * STEP} y={PC_VIEW_H / 2} dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>…</text>
      </svg>
    </div>
  )
}
