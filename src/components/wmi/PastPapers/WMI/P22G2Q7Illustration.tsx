// Dessert-tray counting figure for WMI-22P2A-Q7 (2022 Semifinal Grade 2, Paper A).
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g2-a-q7.jpg: a 3-row × 12-column
// tray of desserts. The question names three kinds to count — sandwich cookies
// (green bar), strawberry cakes (pink bar) and cheese wedges (blue bar) — and asks
// which bar chart shows the three totals. The tray ALSO holds plain donuts, which
// are distractors and are NOT charted.
//
// Verified cell-by-cell against the scan:
//   row 0: cake  cookie donut donut donut donut cookie cheese cheese donut cookie cookie
//   row 1: donut cheese cookie cake  cake  cheese donut  cake   donut  cookie donut  donut
//   row 2: donut donut  cake   cookie donut cheese cake  donut  cookie cake   donut  cheese
// Totals: cookies = 8, cakes = 7, cheese = 6 (donuts = 15, not charted) → answer B.
//
// The static figure draws ONLY the tray (the problem). It never draws the bar
// chart or reveals the counts — that is the explainer's job, post-answer, via the
// co-exported DessertTray22G2 + BarChart22G2 primitives.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

export type Dessert = 'cookie' | 'cake' | 'cheese' | 'donut'

// The tray, row by row (12 per row). Verified against the source scan.
export const TRAY: Dessert[][] = [
  ['cake', 'cookie', 'donut', 'donut', 'donut', 'donut', 'cookie', 'cheese', 'cheese', 'donut', 'cookie', 'cookie'],
  ['donut', 'cheese', 'cookie', 'cake', 'cake', 'cheese', 'donut', 'cake', 'donut', 'cookie', 'donut', 'donut'],
  ['donut', 'donut', 'cake', 'cookie', 'donut', 'cheese', 'cake', 'donut', 'cookie', 'cake', 'donut', 'cheese'],
]

const flat = TRAY.flat()
export const COOKIE_TOTAL = flat.filter((d) => d === 'cookie').length // 8
export const CAKE_TOTAL = flat.filter((d) => d === 'cake').length // 7
export const CHEESE_TOTAL = flat.filter((d) => d === 'cheese').length // 6

// Colours: the three charted kinds get the chart's bar colours so figure ⇄ chart
// read as one scene; donuts stay a neutral brown.
const COOKIE_FILL = '#7C4A26' // biscuit brown (green bar)
const COOKIE_CREAM = '#FBEFD6'
const CAKE_SPONGE = '#9C6B3F'
const CAKE_FROST = '#FDFBF6'
const CAKE_BERRY = '#E2403C'
const CHEESE_FILL = '#F2C14E'
const CHEESE_DK = '#E0A92E'
const DONUT_FILL = '#7A4A2A'
const DONUT_GLAZE = '#A56A3C'
const INK = '#3A2A1A'

// One dessert glyph centred at (cx, cy) inside a CELL of size CELL.
function DessertGlyph({ kind, cx, cy }: { kind: Dessert; cx: number; cy: number }) {
  if (kind === 'cookie') {
    return (
      <g>
        <ellipse cx={cx} cy={cy + 5} rx={15} ry={9} fill={COOKIE_FILL} stroke={INK} strokeWidth={1.4} />
        <rect x={cx - 15} y={cy - 1} width={30} height={6} fill={COOKIE_CREAM} stroke={INK} strokeWidth={1} />
        <ellipse cx={cx} cy={cy - 5} rx={15} ry={9} fill={COOKIE_FILL} stroke={INK} strokeWidth={1.4} />
        <circle cx={cx - 6} cy={cy - 6} r={1.4} fill={INK} />
        <circle cx={cx + 5} cy={cy - 4} r={1.4} fill={INK} />
        <circle cx={cx + 1} cy={cy - 8} r={1.4} fill={INK} />
      </g>
    )
  }
  if (kind === 'cake') {
    return (
      <g>
        <path d={`M ${cx - 14} ${cy + 9} L ${cx + 14} ${cy + 9} L ${cx + 12} ${cy + 1} L ${cx - 12} ${cy + 1} Z`} fill={CAKE_SPONGE} stroke={INK} strokeWidth={1.3} />
        <path d={`M ${cx - 13} ${cy + 1} Q ${cx} ${cy - 6} ${cx + 13} ${cy + 1} L ${cx + 12} ${cy + 1} L ${cx - 12} ${cy + 1} Z`} fill={CAKE_FROST} stroke={INK} strokeWidth={1.3} />
        <ellipse cx={cx} cy={cy + 1} rx={13} ry={3} fill={CAKE_FROST} stroke={INK} strokeWidth={1.1} />
        <path d={`M ${cx} ${cy - 12} q -5 4 -3 8 q 4 2 6 -1 q 1 -5 -3 -7 Z`} fill={CAKE_BERRY} stroke={INK} strokeWidth={1.1} />
      </g>
    )
  }
  if (kind === 'cheese') {
    return (
      <g>
        <path d={`M ${cx - 15} ${cy + 8} L ${cx + 15} ${cy + 1} L ${cx - 15} ${cy - 8} Z`} fill={CHEESE_FILL} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={`M ${cx - 15} ${cy + 8} L ${cx + 15} ${cy + 1} L ${cx + 15} ${cy + 4} L ${cx - 15} ${cy + 11} Z`} fill={CHEESE_DK} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <circle cx={cx - 6} cy={cy} r={2} fill={CAKE_FROST} stroke={INK} strokeWidth={0.8} />
        <circle cx={cx + 2} cy={cy - 2} r={1.6} fill={CAKE_FROST} stroke={INK} strokeWidth={0.8} />
      </g>
    )
  }
  // donut (distractor)
  return (
    <g>
      <ellipse cx={cx} cy={cy + 2} rx={15} ry={11} fill={DONUT_FILL} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={cx} cy={cy} rx={15} ry={11} fill={DONUT_GLAZE} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={cx} cy={cy} rx={5} ry={4} fill="#FBF6EC" stroke={INK} strokeWidth={1.2} />
      <circle cx={cx - 6} cy={cy - 4} r={1} fill="#F4D35E" />
      <circle cx={cx + 7} cy={cy - 1} r={1} fill="#E2403C" />
      <circle cx={cx + 2} cy={cy + 5} r={1} fill="#9ACA3C" />
    </g>
  )
}

const COLS = 12
const ROWS = 3
const CELL_W = 56
const CELL_H = 46
const PAD = 8

export const TRAY_VIEW_W = COLS * CELL_W + PAD * 2 // 688
export const TRAY_VIEW_H = ROWS * CELL_H + PAD * 2 // 154

export interface DessertTray22G2Props {
  /** When set, dim every dessert except this kind (used while counting one kind). */
  highlight?: Dessert | null
}

/** The full dessert tray. Reusable by the explainer. */
export function DessertTray22G2({ highlight = null }: DessertTray22G2Props) {
  return (
    <svg
      viewBox={`0 0 ${TRAY_VIEW_W} ${TRAY_VIEW_H}`}
      width="100%"
      style={{ maxWidth: TRAY_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* tray background + grid */}
      <rect x={PAD} y={PAD} width={COLS * CELL_W} height={ROWS * CELL_H} rx={6} fill="#FFFDF8" stroke="#C9B79A" strokeWidth={2} />
      {Array.from({ length: COLS - 1 }, (_, i) => (
        <line key={`v${i}`} x1={PAD + (i + 1) * CELL_W} y1={PAD} x2={PAD + (i + 1) * CELL_W} y2={PAD + ROWS * CELL_H} stroke="#E3D7C0" strokeWidth={1.2} />
      ))}
      {Array.from({ length: ROWS - 1 }, (_, i) => (
        <line key={`h${i}`} x1={PAD} y1={PAD + (i + 1) * CELL_H} x2={PAD + COLS * CELL_W} y2={PAD + (i + 1) * CELL_H} stroke="#E3D7C0" strokeWidth={1.2} />
      ))}

      {TRAY.map((row, r) =>
        row.map((kind, c) => {
          const cx = PAD + c * CELL_W + CELL_W / 2
          const cy = PAD + r * CELL_H + CELL_H / 2
          const dim = highlight != null && kind !== highlight
          return (
            <g key={`${r}-${c}`} opacity={dim ? 0.16 : 1}>
              <DessertGlyph kind={kind} cx={cx} cy={cy} />
            </g>
          )
        }),
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Reusable mini bar-chart primitive (used by the explainer to build chart B).
// Three bars: cookies (green), cakes (pink), cheese (blue), heights 0..maxH.
// ---------------------------------------------------------------------------

export const BAR_GREEN = '#4FA84F'
export const BAR_PINK = '#E879A6'
export const BAR_BLUE = '#3E8EDE'

export interface BarChart22G2Props {
  /** Bar heights in units: [cookies, cakes, cheese]. */
  values: [number, number, number]
  /** Which bar (0/1/2) to outline as "just placed", or null. */
  active?: number | null
  /** Top of the axis in units (defaults to 8). */
  maxH?: number
}

export function BarChart22G2({ values, active = null, maxH = 8 }: BarChart22G2Props) {
  const W = 260
  const H = 200
  const left = 40
  const bottom = H - 34
  const top = 20
  const plotH = bottom - top
  const unit = plotH / maxH
  const barW = 44
  const gap = 22
  const colours = [BAR_GREEN, BAR_PINK, BAR_BLUE]
  const labelKinds: Dessert[] = ['cookie', 'cake', 'cheese']

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* gridlines + y ticks */}
      {Array.from({ length: maxH + 1 }, (_, i) => {
        const y = bottom - i * unit
        return (
          <g key={`g${i}`}>
            <line x1={left} y1={y} x2={W - 12} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <text x={left - 6} y={y} textAnchor="end" dominantBaseline="central" fontSize={11} fill="#6B7280">
              {i}
            </text>
          </g>
        )
      })}
      {/* axes */}
      <line x1={left} y1={top} x2={left} y2={bottom} stroke="#374151" strokeWidth={2} />
      <line x1={left} y1={bottom} x2={W - 12} y2={bottom} stroke="#374151" strokeWidth={2} />

      {values.map((v, i) => {
        const x = left + 18 + i * (barW + gap)
        const h = v * unit
        const y = bottom - h
        const isActive = active === i
        return (
          <g key={`bar${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              fill={colours[i]}
              stroke={isActive ? '#111827' : 'none'}
              strokeWidth={isActive ? 2.5 : 0}
            />
            {v > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={13} fontWeight={800} fill="#374151">
                {v}
              </text>
            )}
            <g transform={`translate(${x + barW / 2}, ${bottom + 17}) scale(0.62)`}>
              <DessertGlyph kind={labelKinds[i]} cx={0} cy={0} />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

const ARIA =
  'Nampan 3 baris kali 12 berisi makanan penutup: biskuit isi, kue stroberi, irisan keju, dan donat. ' +
  'Hitung banyaknya biskuit, kue, dan keju, lalu pilih diagram batang yang benar.'

export default function P22G2Q7Illustration() {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={ARIA}>
      <DessertTray22G2 />
    </div>
  )
}
