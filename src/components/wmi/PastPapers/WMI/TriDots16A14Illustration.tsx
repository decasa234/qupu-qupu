// SEAMO-16-A-Q14 — "How many dots are there in Figure 5?"
//
// The paper shows Figures 1, 2, and 3 with triangular dot arrangements:
//   Figure 1: 1 dot   (T₁ = 1)
//   Figure 2: 3 dots  (T₂ = 3)
//   Figure 3: 6 dots  (T₃ = 6)
//
// The question asks for Figure 5 (T₅ = 15, answer D).
//
// The stem illustration shows Figures 1–3 only — never reveals Figure 4 or 5.
// The co-exported TriDotsFigure primitive lets the explainer animate the
// sequence (reveal Figure 4 and Figure 5 beat-by-beat).
//
// Triangular arrangement: row k (from top) has k dots, centred.
//   T(n) = n(n+1)/2 dots total.
//
// Pure SVG, no Math.random, no Date — SSR-safe & deterministic.

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const DOT_FILL   = '#1F2937'   // filled dot
const DOT_STROKE = '#374151'
const LABEL_FILL = '#30598A'   // brand blue for caption "Figure n"
const HIDDEN_FILL = '#D1D5DB'  // greyed-out placeholder dots (explainer)

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const DOT_R     = 7    // dot radius
const DOT_GAP   = 5    // horizontal gap between dots
const ROW_GAP   = 4    // vertical gap between rows
const CELL      = DOT_R * 2         // dot diameter
const ROW_STEP  = CELL + ROW_GAP    // vertical pitch per row

/** Total height of n rows of dots. */
function dotBlockH(n: number): number {
  return n * CELL + (n - 1) * ROW_GAP
}

/** Width of the widest row (n dots) in an n-figure. */
function dotBlockW(n: number): number {
  return n * CELL + (n - 1) * DOT_GAP
}

/** Generate the [cx, cy] centres for all dots in a triangular figure of size n.
 *  Row k (1-based) has k dots, centred within `maxW`. */
function triangleDots(n: number, originX: number, originY: number): Array<[number, number]> {
  const maxW = dotBlockW(n)
  const pts: Array<[number, number]> = []
  for (let row = 1; row <= n; row++) {
    const rowW = row * CELL + (row - 1) * DOT_GAP
    const startX = originX + (maxW - rowW) / 2 + DOT_R
    const y = originY + (row - 1) * ROW_STEP + DOT_R
    for (let col = 0; col < row; col++) {
      pts.push([startX + col * (CELL + DOT_GAP), y])
    }
  }
  return pts
}

// ---------------------------------------------------------------------------
// TriDotsFigure — primitive; renders ONE triangular figure of size n
// ---------------------------------------------------------------------------

export interface TriDotsFigureProps {
  /** Triangle order: 1 → 1 dot, 2 → 3 dots, 3 → 6 dots, etc. */
  n: number
  /** Figure label, e.g. "Figure 1" / "Gambar 1". */
  label: string
  /** If true, render dots as grey placeholders (for "?" state in explainer). */
  hidden?: boolean
  /** SVG-space origin of the dot-block (top-left of bounding box). */
  originX?: number
  originY?: number
}

/** Renders a single triangular dot figure inside its own <svg>. */
export function TriDotsFigure({
  n,
  label,
  hidden = false,
  originX = 0,
  originY = 0,
}: TriDotsFigureProps) {
  const bW = dotBlockW(n)
  const bH = dotBlockH(n)
  const pad = 10
  const labelH = 20
  const svgW = bW + pad * 2
  const svgH = bH + pad * 2 + labelH

  const dots = triangleDots(n, pad, pad)

  return (
    <svg
      viewBox={`${originX} ${originY} ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {dots.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={DOT_R}
          fill={hidden ? HIDDEN_FILL : DOT_FILL}
          stroke={hidden ? '#9CA3AF' : DOT_STROKE}
          strokeWidth={1.5}
        />
      ))}
      {/* Caption below the dots */}
      <text
        x={svgW / 2}
        y={bH + pad * 2 + labelH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// TriDotsRow — shared primitive: a horizontal strip of triangular figures
// ---------------------------------------------------------------------------

export interface TriDotsRowProps {
  /**
   * Array of figure configs to render side by side.
   * Each entry can include `hidden` to grey out that figure.
   */
  figures: Array<{
    n: number
    label: string
    hidden?: boolean
  }>
  /** Gap between adjacent figures (px). */
  gap?: number
}

/** Lays out multiple triangular-dot figures in a row inside one <svg>. */
export function TriDotsRow({ figures, gap = 20 }: TriDotsRowProps) {
  if (figures.length === 0) return null

  // All figures share the height of the tallest one (max n).
  const maxN = Math.max(...figures.map((f) => f.n))
  const maxBH = dotBlockH(maxN)
  const pad = 10
  const labelH = 20
  const rowH = maxBH + pad * 2 + labelH

  // Compute each figure's width
  const figWidths = figures.map((f) => dotBlockW(f.n) + pad * 2)
  const totalW = figWidths.reduce((s, w) => s + w, 0) + gap * (figures.length - 1)

  let cursor = 0
  const layout = figures.map((f, i) => {
    const x = cursor
    cursor += figWidths[i] + (i < figures.length - 1 ? gap : 0)
    return { f, x, figW: figWidths[i] }
  })

  return (
    <svg
      viewBox={`0 0 ${totalW} ${rowH}`}
      width="100%"
      style={{ maxWidth: Math.min(480, totalW * 1.5), display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {layout.map(({ f, x, figW }, i) => {
        // dots: centred within each figure's column
        const bW = dotBlockW(f.n)
        const bH = dotBlockH(f.n)
        // Dots are vertically bottom-aligned within the shared maxBH block
        const dotOriginY = pad + (maxBH - bH)
        const dotOriginX = x + pad + (figW - pad * 2 - bW) / 2
        const dots = triangleDots(f.n, dotOriginX, dotOriginY)

        return (
          <g key={i}>
            {dots.map(([cx, cy], j) => (
              <circle
                key={j}
                cx={cx}
                cy={cy}
                r={DOT_R}
                fill={f.hidden ? HIDDEN_FILL : DOT_FILL}
                stroke={f.hidden ? '#9CA3AF' : DOT_STROKE}
                strokeWidth={1.5}
              />
            ))}
            {/* caption */}
            <text
              x={x + figW / 2}
              y={maxBH + pad * 2 + labelH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill={f.hidden ? '#9CA3AF' : LABEL_FILL}
              fontFamily="sans-serif"
            >
              {f.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — the stem illustration (Figures 1, 2, 3 only)
// ---------------------------------------------------------------------------

export default function TriDots16A14Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const labelPrefix = lang === 'id' ? 'Gambar' : 'Figure'
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Pola titik segitiga: Gambar 1 punya 1 titik, Gambar 2 punya 3 titik, Gambar 3 punya 6 titik. Ada berapa titik pada Gambar 5?'
          : 'Triangular dot pattern: Figure 1 has 1 dot, Figure 2 has 3 dots, Figure 3 has 6 dots. How many dots in Figure 5?'
      }
    >
      <TriDotsRow
        figures={[
          { n: 1, label: `${labelPrefix} 1` },
          { n: 2, label: `${labelPrefix} 2` },
          { n: 3, label: `${labelPrefix} 3` },
        ]}
      />
    </div>
  )
}
