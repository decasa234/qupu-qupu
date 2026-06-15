// Statistical-pictograph figure for WMI-24P3A-Q12 (2024 Grade-3 Semifinal).
//
// Source figure (db/seed/wmi/figures/2024-semifinal-g3-a-q12.jpg) shows a single
// big black star — the legend glyph for the pictograph. The body text gives the
// three rows of the table:
//   Golden kudzu             = 2 big stars + 1 small star
//   Eschscholzia californica = 1 big star  + 2 small stars
//   Heteromeles arbutifolia  = 4 small stars
// Legend: a BIG star = 5 plants, a SMALL star = 1 plant.
//
// The figure draws the PROBLEM ONLY — the three labelled rows of stars with the
// legend. It never shows the difference (the answer); decoding + subtracting is
// the explainer's job. A reusable <StarRow> primitive is co-exported so the
// explainer can render the same rows (and a fresh answer row) beat by beat.

const INK = '#1F2937'
const STAR_FILL = '#F59E0B' // warm gold body
const STAR_EDGE = '#B45309' // darker gold edge
const SMALL_FILL = '#FCD34D' // lighter gold for the small (=1) stars

/* -------------------------------------------------------------- data ------- */
export interface PlantRow {
  /** Short key (used for React keys / aria). */
  key: string
  labelEn: string
  labelId: string
  big: number
  small: number
}

export const PLANT_ROWS: PlantRow[] = [
  { key: 'kudzu', labelEn: 'Golden kudzu', labelId: 'Golden kudzu', big: 2, small: 1 },
  { key: 'esch', labelEn: 'Eschscholzia', labelId: 'Eschscholzia', big: 1, small: 2 },
  { key: 'heter', labelEn: 'Heteromeles', labelId: 'Heteromeles', big: 0, small: 4 },
]

export const BIG_VALUE = 5
export const SMALL_VALUE = 1

export const rowValue = (r: PlantRow) => r.big * BIG_VALUE + r.small * SMALL_VALUE

export const KUDZU_TOTAL = rowValue(PLANT_ROWS[0]) // 11
export const HETER_TOTAL = rowValue(PLANT_ROWS[2]) // 4
export const DIFFERENCE = KUDZU_TOTAL - HETER_TOTAL // 7

/* ---------------------------------------------------------- primitive ------ */
// One five-pointed star centred at (cx, cy) with outer radius r.
function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const inner = r * 0.4
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    // start at the top point (-90deg) and step 36deg each vertex
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={STAR_EDGE} strokeWidth={1.4} strokeLinejoin="round" />
}

export const BIG_R = 15
export const SMALL_R = 8
const BIG_GAP = 38
const SMALL_GAP = 22

/**
 * A horizontal run of `big` big stars (=5) followed by `small` small stars (=1),
 * laid out left to right starting at x0, vertically centred on y. Returns the
 * group plus the x where it ends (so callers can place a value tag).
 */
export function StarRow({
  x0,
  y,
  big,
  small,
  smallFill = SMALL_FILL,
}: {
  x0: number
  y: number
  big: number
  small: number
  smallFill?: string
}) {
  const stars: React.ReactNode[] = []
  let x = x0
  for (let i = 0; i < big; i++) {
    stars.push(<Star key={`b${i}`} cx={x + BIG_R} cy={y} r={BIG_R} fill={STAR_FILL} />)
    x += BIG_GAP
  }
  // a touch of breathing room between big and small clusters
  if (big > 0 && small > 0) x += 6
  for (let i = 0; i < small; i++) {
    stars.push(<Star key={`s${i}`} cx={x + SMALL_R} cy={y} r={SMALL_R} fill={smallFill} />)
    x += SMALL_GAP
  }
  return <g>{stars}</g>
}

/* ----------------------------------------------------------- layout -------- */
export const Q12_VIEW_W = 460
const ROW_H = 56
const LABEL_X = 14
const STARS_X = 150
const TOP_Y = 64

export interface Q12DiagramProps {
  /** en / id label set. */
  lang?: 'en' | 'id'
}

export function Q12Diagram({ lang = 'en' }: Q12DiagramProps) {
  const rows = PLANT_ROWS
  const height = TOP_Y + rows.length * ROW_H + 8
  return (
    <svg
      viewBox={`0 0 ${Q12_VIEW_W} ${height}`}
      width="100%"
      style={{ maxWidth: Q12_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Legend strip */}
      <g>
        <Star cx={28} cy={26} r={BIG_R} fill={STAR_FILL} />
        <text x={48} y={26} dominantBaseline="central" fontSize={14} fontWeight={700} fill={INK}>
          {lang === 'id' ? '= 5 tanaman' : '= 5 plants'}
        </text>
        <Star cx={236} cy={26} r={SMALL_R} fill={SMALL_FILL} />
        <text x={250} y={26} dominantBaseline="central" fontSize={14} fontWeight={700} fill={INK}>
          {lang === 'id' ? '= 1 tanaman' : '= 1 plant'}
        </text>
      </g>

      {/* Divider under legend */}
      <line x1={LABEL_X} y1={44} x2={Q12_VIEW_W - 14} y2={44} stroke="#CBD5E1" strokeWidth={1.4} />

      {/* Plant rows */}
      {rows.map((r, i) => {
        const cy = TOP_Y + i * ROW_H + ROW_H / 2 - 6
        return (
          <g key={r.key}>
            <text x={LABEL_X} y={cy} dominantBaseline="central" fontSize={13} fontWeight={700} fill={INK}>
              {lang === 'id' ? r.labelId : r.labelEn}
            </text>
            <StarRow x0={STARS_X} y={cy} big={r.big} small={r.small} />
          </g>
        )
      })}
    </svg>
  )
}

export default function P24G3Q12Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pictograph table of three plants. A big star is 5 plants and a small star is 1 plant. Golden kudzu: 2 big and 1 small. Eschscholzia: 1 big and 2 small. Heteromeles: 4 small."
    >
      <Q12Diagram />
    </div>
  )
}
