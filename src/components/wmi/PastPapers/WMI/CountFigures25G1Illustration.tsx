// WMI-25F1A-Q14 (2025 Grade 1 Final, Paper A) — stem illustration.
//
// "Count the 48 figures below. Which two kinds of figures appear in equal
// quantity?"  Answer = C.
//
// The decorative strip holds 48 figures of FIVE kinds, read straight off the
// scanned Paper A image (db/seed/wmi/figures/2025-final-g1-a-q14.jpg) and
// transcribed into FIGURE_ROWS below so the drawing can never drift from the
// printed paper:
//
//   row 1 (24): rose×4, xflower×5, blue×2, tulip×1, tulip×2, rose×5, tulip×3, rose×2
//   row 2 (24): cosmos×6, blue×4, tulip×2, cosmos×6, xflower×5, rose×1
//
//   TALLY (48):  rose 12 · cosmos 12 · blue 6 · tulip 8 · xflower 10
//   → rose (12) == cosmos (12) is the only equal pair → option C.
//
// This file draws ONLY the 48-figure strip — never the tally, never which pair
// is equal. Pure render, SSR-safe, deterministic (no random/date, no state).
// A SAMPLE fallback keeps previews rendering on bad params.
//
// Figure glyphs are exported so the A–E option renderer reuses the exact same
// icons and can't drift from the stem.

export type FigureKind = 'rose' | 'cosmos' | 'blue' | 'tulip' | 'xflower'

// Colours sampled from the scanned paper.
const COLORS: Record<FigureKind, { fill: string; dark: string; light: string; center: string }> = {
  rose: { fill: '#D6256E', dark: '#9E1A50', light: '#F06BA3', center: '#FBD3E4' },
  cosmos: { fill: '#F4A6C8', dark: '#E87FAE', light: '#FBD6E6', center: '#FBE34A' },
  blue: { fill: '#1E9BE0', dark: '#0F7BC0', light: '#7FCBF2', center: '#F4B41A' },
  tulip: { fill: '#D9694B', dark: '#B14730', light: '#E8957C', center: '#B14730' },
  xflower: { fill: '#F2913D', dark: '#E0741E', light: '#F8C07A', center: '#FBD24A' },
}

export const FIGURE_LABEL_ID: Record<FigureKind, string> = {
  rose: 'mawar',
  cosmos: 'kosmos merah muda',
  blue: 'bunga biru',
  tulip: 'tulip',
  xflower: 'bunga oranye',
}

// The 48 figures, in reading order across the two rows of the scan.
const FIGURE_ROWS: FigureKind[][] = [
  [
    'rose', 'rose', 'rose', 'rose',
    'xflower', 'xflower', 'xflower', 'xflower', 'xflower',
    'blue', 'blue',
    'tulip',
    'tulip', 'tulip',
    'rose', 'rose', 'rose', 'rose', 'rose',
    'tulip', 'tulip', 'tulip',
    'rose', 'rose',
  ],
  [
    'cosmos', 'cosmos', 'cosmos', 'cosmos', 'cosmos', 'cosmos',
    'blue', 'blue', 'blue', 'blue',
    'tulip', 'tulip',
    'cosmos', 'cosmos', 'cosmos', 'cosmos', 'cosmos', 'cosmos',
    'xflower', 'xflower', 'xflower', 'xflower', 'xflower',
    'rose',
  ],
]

/**
 * Draws one figure glyph of the given kind centred on (cx, cy).
 * `s` is the glyph radius in px. Built from basic shapes (no emoji), reused by
 * both the stem and the option renderer so they share one icon set.
 */
export function FigureGlyph({
  kind,
  cx,
  cy,
  s,
}: {
  kind: FigureKind
  cx: number
  cy: number
  s: number
}) {
  const c = COLORS[kind]

  if (kind === 'rose') {
    // Concentric magenta whorls + a swirl centre.
    return (
      <g>
        <circle cx={cx} cy={cy} r={s} fill={c.fill} />
        <circle cx={cx} cy={cy} r={s * 0.72} fill={c.dark} />
        <circle cx={cx} cy={cy} r={s * 0.46} fill={c.fill} />
        <circle cx={cx} cy={cy} r={s * 0.22} fill={c.light} />
        <path
          d={`M ${cx} ${cy - s * 0.32} A ${s * 0.32} ${s * 0.32} 0 1 1 ${cx - s * 0.01} ${cy - s * 0.32}`}
          fill="none"
          stroke={c.center}
          strokeWidth={Math.max(0.6, s * 0.1)}
          strokeLinecap="round"
        />
      </g>
    )
  }

  if (kind === 'cosmos') {
    // Six rounded pink petals + a yellow disc centre.
    return (
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 6 - Math.PI / 2
          const px = cx + Math.cos(a) * s * 0.6
          const py = cy + Math.sin(a) * s * 0.6
          return (
            <ellipse
              key={i}
              cx={px}
              cy={py}
              rx={s * 0.5}
              ry={s * 0.26}
              fill={c.fill}
              stroke={c.dark}
              strokeWidth={Math.max(0.4, s * 0.04)}
              transform={`rotate(${(a * 180) / Math.PI} ${px} ${py})`}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={s * 0.3} fill={c.center} />
      </g>
    )
  }

  if (kind === 'blue') {
    // Five blue petals + a yellow centre.
    return (
      <g>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 5 - Math.PI / 2
          const px = cx + Math.cos(a) * s * 0.58
          const py = cy + Math.sin(a) * s * 0.58
          return <circle key={i} cx={px} cy={py} r={s * 0.46} fill={c.fill} />
        })}
        <circle cx={cx} cy={cy} r={s * 0.42} fill={c.dark} fillOpacity={0.0} />
        <circle cx={cx} cy={cy} r={s * 0.3} fill={c.center} />
      </g>
    )
  }

  if (kind === 'tulip') {
    // A closed orange-red tulip cup: three rounded lobes on a rounded body.
    const w = s * 1.5
    const h = s * 1.9
    const left = cx - w / 2
    const top = cy - h / 2
    return (
      <g>
        <path
          d={[
            `M ${left} ${top + h * 0.28}`,
            `Q ${left} ${top + h * 0.92} ${cx} ${top + h}`,
            `Q ${left + w} ${top + h * 0.92} ${left + w} ${top + h * 0.28}`,
            `L ${left + w} ${top + h * 0.28}`,
            `Q ${cx} ${top + h * 0.46} ${left} ${top + h * 0.28}`,
            'Z',
          ].join(' ')}
          fill={c.fill}
        />
        {/* three petal lobes */}
        <path
          d={`M ${left} ${top + h * 0.3} Q ${left + w * 0.02} ${top} ${left + w * 0.32} ${top + h * 0.16} Q ${cx} ${top + h * 0.4} ${left} ${top + h * 0.3} Z`}
          fill={c.dark}
        />
        <path
          d={`M ${left + w} ${top + h * 0.3} Q ${left + w * 0.98} ${top} ${left + w * 0.68} ${top + h * 0.16} Q ${cx} ${top + h * 0.4} ${left + w} ${top + h * 0.3} Z`}
          fill={c.dark}
        />
        <path
          d={`M ${left + w * 0.3} ${top + h * 0.18} Q ${cx} ${top - h * 0.04} ${left + w * 0.7} ${top + h * 0.18} Q ${cx} ${top + h * 0.42} ${left + w * 0.3} ${top + h * 0.18} Z`}
          fill={c.light}
        />
      </g>
    )
  }

  // xflower — four pointed orange petals in an X (clover) shape + yellow centre.
  return (
    <g>
      {Array.from({ length: 4 }, (_, i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4
        const tipX = cx + Math.cos(a) * s
        const tipY = cy + Math.sin(a) * s
        // petal as a leaf shape from centre to tip
        const perp = a + Math.PI / 2
        const midX = cx + Math.cos(a) * s * 0.5
        const midY = cy + Math.sin(a) * s * 0.5
        const w = s * 0.34
        const lX = midX + Math.cos(perp) * w
        const lY = midY + Math.sin(perp) * w
        const rX = midX - Math.cos(perp) * w
        const rY = midY - Math.sin(perp) * w
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} Q ${lX} ${lY} ${tipX} ${tipY} Q ${rX} ${rY} ${cx} ${cy} Z`}
            fill={c.fill}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={s * 0.26} fill={c.center} />
    </g>
  )
}

const SAMPLE_ROWS = FIGURE_ROWS

export default function CountFigures25G1Illustration({ params }: { params?: unknown }) {
  // The figure is fully determined by the scan; params is accepted for the
  // role contract but the layout always falls back to the transcribed rows.
  const p = (params ?? {}) as { rows?: FigureKind[][] }
  const rows =
    Array.isArray(p.rows) && p.rows.length > 0 && p.rows.every((r) => Array.isArray(r))
      ? (p.rows as FigureKind[][])
      : SAMPLE_ROWS

  // --- layout -------------------------------------------------------------
  const glyphR = 14
  const cellW = 36
  const rowH = 40
  const padX = 16
  const padY = 16
  const cols = Math.max(...rows.map((r) => r.length))

  const width = padX * 2 + cols * cellW
  const height = padY * 2 + rows.length * rowH

  const ariaCounts = (() => {
    const tally: Record<string, number> = {}
    rows.flat().forEach((k) => {
      tally[k] = (tally[k] ?? 0) + 1
    })
    return Object.entries(tally)
      .map(([k, n]) => `${n} ${FIGURE_LABEL_ID[k as FigureKind] ?? k}`)
      .join(', ')
  })()

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Untaian 48 bunga hias dalam dua baris (${ariaCounts}). Hitung bunganya, lalu tentukan dua jenis bunga yang jumlahnya sama banyak.`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(640, width)}>
        {rows.map((row, ri) =>
          row.map((kind, ci) => (
            <FigureGlyph
              key={`${ri}-${ci}`}
              kind={kind}
              cx={padX + ci * cellW + cellW / 2}
              cy={padY + ri * rowH + rowH / 2}
              s={glyphR}
            />
          )),
        )}
      </svg>
    </div>
  )
}
