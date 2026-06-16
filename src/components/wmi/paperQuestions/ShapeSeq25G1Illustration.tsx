// WMI-25F1A-Q13 (2025 Grade 1 Final) — stem illustration + shared face-shape
// primitive. "Observe the arrangement of the shapes. Which shape should the '?'
// be?"  Answer = A.
//
// THE PATTERN — two independent cycles run in lock-step across the 14 drawn
// cells, then continue at the '?':
//   • Outline shape  → period 5:  triangle, circle, square, pentagon, diamond, …
//   • Face mood      → period 3:  smile, frown, frown, …
//
//   pos: 1  2  3  4  5  6  7  8  9 10 11 12 13 14 | 15 (?)
//   shp: △  ○  □  ⬠  ◇  △  ○  □  ⬠  ◇  △  ○  □  ⬠ |  ◇
//   fce: S  F  F  S  F  F  S  F  F  S  F  F  S  F  |  F
//
// 5 and 3 are coprime, so the (shape, mood) pairing only repeats every 15
// cells; cell 15 is the first repeat of cell 1's slot but with a fresh mood.
// At the '?' the shape cycle lands on DIAMOND and the mood cycle lands on
// FROWN → a sad diamond → option A.
//
// This file draws ONLY the question row (the 14 shapes + the '?'); it never
// reveals the answer. Pure render, SSR-safe, deterministic — no random/date,
// no state. A SAMPLE fallback keeps previews rendering on bad params.

const INK = '#1F2937'

export type SeqShape = 'triangle' | 'circle' | 'square' | 'pentagon' | 'diamond'
export type SeqMood = 'smile' | 'frown'

// The two cycles. Exported so the explainer/animator can reuse them and never
// drift from this stem.
export const SHAPE_CYCLE: SeqShape[] = ['triangle', 'circle', 'square', 'pentagon', 'diamond']
export const MOOD_CYCLE: SeqMood[] = ['smile', 'frown', 'frown']

export interface SeqCell {
  shape: SeqShape
  mood: SeqMood
}

// Build the i-th cell (0-based) straight from the two coprime cycles.
export function seqCellAt(i: number): SeqCell {
  return {
    shape: SHAPE_CYCLE[i % SHAPE_CYCLE.length],
    mood: MOOD_CYCLE[i % MOOD_CYCLE.length],
  }
}

// 14 visible cells precede the '?'. The hidden 15th cell (index 14) is the
// answer — diamond + frown — and is intentionally NOT drawn here.
const VISIBLE = 14

/**
 * Draws one outlined shape with a simple face centred on (cx, cy).
 * `r` is the shape's circumradius. Monochrome ink outline + a small smile/frown.
 * Reused by the option renderer so the stem and the choices share one shape set.
 */
export function FaceShape({
  shape,
  mood,
  cx,
  cy,
  r,
  strokeWidth = 2,
}: {
  shape: SeqShape
  mood: SeqMood
  cx: number
  cy: number
  r: number
  strokeWidth?: number
}) {
  const common = {
    fill: 'none',
    stroke: INK,
    strokeWidth,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }

  // Outline geometry. Each polygon is sized to roughly fill a circle of radius r
  // so the faces line up visually across different shapes.
  let outline
  if (shape === 'circle') {
    outline = <circle cx={cx} cy={cy} r={r} {...common} />
  } else if (shape === 'square') {
    const s = r * 1.6
    outline = (
      <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx={r * 0.12} {...common} />
    )
  } else if (shape === 'diamond') {
    const d = r * 1.18
    const pts = `${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`
    outline = <polygon points={pts} {...common} />
  } else if (shape === 'triangle') {
    // Up-pointing triangle. Nudge the centroid so the face sits in the body.
    const top = `${cx},${cy - r}`
    const bl = `${cx - r * 0.95},${cy + r * 0.72}`
    const br = `${cx + r * 0.95},${cy + r * 0.72}`
    outline = <polygon points={`${top} ${bl} ${br}`} {...common} />
  } else {
    // Pentagon, point up. Five vertices starting at -90deg.
    const pts = Array.from({ length: 5 }, (_, k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')
    outline = <polygon points={pts} {...common} />
  }

  // Triangles need the face nudged down toward their wider base.
  const fy = shape === 'triangle' ? cy + r * 0.18 : cy
  const eyeDx = r * 0.34
  const eyeY = fy - r * 0.22
  const eyeR = Math.max(1, r * 0.07)
  const mouthW = r * 0.46
  const mouthY = fy + r * 0.28
  // Smile arcs downward-open (sweep 1), frown arcs upward-open (sweep 0).
  const mouthDip = r * 0.26
  const smilePath = `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + mouthDip} ${cx + mouthW} ${mouthY}`
  const frownPath = `M ${cx - mouthW} ${mouthY + mouthDip * 0.6} Q ${cx} ${mouthY - mouthDip * 0.6} ${cx + mouthW} ${mouthY + mouthDip * 0.6}`

  return (
    <g>
      {outline}
      <circle cx={cx - eyeDx} cy={eyeY} r={eyeR} fill={INK} />
      <circle cx={cx + eyeDx} cy={eyeY} r={eyeR} fill={INK} />
      <path
        d={mood === 'smile' ? smilePath : frownPath}
        fill="none"
        stroke={INK}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </g>
  )
}

const MOOD_LABEL: Record<SeqMood, string> = { smile: 'tersenyum', frown: 'cemberut' }
const SHAPE_LABEL: Record<SeqShape, string> = {
  triangle: 'segitiga',
  circle: 'lingkaran',
  square: 'persegi',
  pentagon: 'segilima',
  diamond: 'belah ketupat',
}

export default function ShapeSeq25G1Illustration() {
  const cells = Array.from({ length: VISIBLE }, (_, i) => seqCellAt(i))

  // --- layout -------------------------------------------------------------
  const r = 16 // shape circumradius
  const cell = 44 // horizontal pitch per shape
  const padX = 14
  const padY = 14
  const rowY = padY + 24
  const qGap = 18 // gap before the '?'
  const dotsGap = 26 // gap after the '?' for the trailing dots

  const firstX = padX + cell / 2
  const lastShapeX = firstX + (VISIBLE - 1) * cell
  const qX = lastShapeX + cell / 2 + qGap
  const dotsX = qX + dotsGap

  const width = dotsX + 30 + padX
  const height = rowY + r + padY + 12

  const ariaParts = cells
    .map((c, i) => `${i + 1}: ${SHAPE_LABEL[c.shape]} ${MOOD_LABEL[c.mood]}`)
    .join(', ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Deret 14 bangun datar berwajah lalu tanda tanya: ${ariaParts}. Bangun apa yang harus menggantikan tanda tanya?`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(640, width)}>
        {cells.map((c, i) => (
          <FaceShape
            key={i}
            shape={c.shape}
            mood={c.mood}
            cx={firstX + i * cell}
            cy={rowY}
            r={r}
          />
        ))}

        {/* the unknown — a '?' over an answer underline, never the answer itself */}
        <text
          x={qX}
          y={rowY + 9}
          textAnchor="middle"
          fontSize="30"
          fontWeight="bold"
          fill={INK}
        >
          ?
        </text>
        <line
          x1={qX - 13}
          y1={rowY + r + 6}
          x2={qX + 13}
          y2={rowY + r + 6}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* trailing ellipsis — the sequence continues */}
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={dotsX + k * 11} cy={rowY + 4} r={2.4} fill={INK} />
        ))}
      </svg>
    </div>
  )
}
