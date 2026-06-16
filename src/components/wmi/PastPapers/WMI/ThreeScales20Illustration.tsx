// Three balance scales for WMI-20F1A-Q25 — five blocks weigh 2, 3, 3, 3, 5 g; △ + ○ = ?
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q25.jpg: three scales, each
// pan holding white square tiles with a colored shape icon.
//   Scale 1 (LEVEL):       triangle + square + hexagon  =  circle + star
//   Scale 2 (LEFT down):   star + hexagon               >  square + circle
//   Scale 3 (RIGHT down):  square + hexagon             <  triangle + circle
// Deduction: total 16 → balanced sides are 8 each → {circle, star} = {3, 5}.
// Scale 2 forces star = 5 (else its side maxes at 6 vs 7); scale 3 forces
// triangle = 3 (else 5 vs 6). So △ + ○ = 3 + 3 = 6 g.

export type ShapeKey = 'triangle' | 'square' | 'hexagon' | 'circle' | 'star'

export const ANSWER = 6
export const TOTAL_G = 16 // 2 + 3 + 3 + 3 + 5

const SHAPE_COLOR: Record<ShapeKey, string> = {
  triangle: '#F472B6',
  square: '#8B7CC8',
  hexagon: '#84CC16',
  circle: '#3B82F6',
  star: '#F59E0B',
}

/** Tilt: 1 = left pan down (left heavier), -1 = right pan down, 0 = level. */
export interface ScaleDef {
  tilt: -1 | 0 | 1
  /** Tile rows on the left pan, bottom row first. */
  left: ShapeKey[][]
  /** Tile rows on the right pan, bottom row first. */
  right: ShapeKey[][]
}

export const SCALES: ScaleDef[] = [
  { tilt: 0, left: [['square', 'hexagon'], ['triangle']], right: [['circle', 'star']] },
  { tilt: 1, left: [['star', 'hexagon']], right: [['square', 'circle']] },
  { tilt: -1, left: [['square', 'hexagon']], right: [['triangle', 'circle']] },
]

// Each scale spans pivot ± (BEAM_HALF + plate rx) = ±132 horizontally, so a
// cell must be at least 264 wide; 280 leaves a 20 px gap between neighbours
// and 14 px of edge headroom inside the 860-wide viewBox.
export const VIEW_W = 860
export const VIEW_H = 280

const CELL_W = 280
const PIVOT_Y = 148
const BEAM_HALF = 86
const TILT_DY = 20
const TILE = 36
const TILE_GAP = 3

const INK = '#1F2937'
const BEAM_COLOR = '#B5651D'
const BASE_COLOR = '#2f6df0'
const PLATE_FILL = '#E5E7EB'
const GREEN = '#10B981'

/** A shape icon centred at (cx, cy) sized to sit inside a tile. */
export function ShapeIcon({ shape, cx, cy, r = 11 }: { shape: ShapeKey; cx: number; cy: number; r?: number }) {
  const c = SHAPE_COLOR[shape]
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={c} />
  }
  if (shape === 'square') {
    const s = r * 1.7
    return <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={c} />
  }
  if (shape === 'triangle') {
    return <polygon points={`${cx},${cy - r} ${cx - r},${cy + r * 0.85} ${cx + r},${cy + r * 0.85}`} fill={c} strokeLinejoin="round" />
  }
  if (shape === 'hexagon') {
    const pts: string[] = []
    for (let i = 0; i < 6; i++) {
      const rad = (Math.PI / 3) * i - Math.PI / 6
      pts.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`)
    }
    return <polygon points={pts.join(' ')} fill={c} />
  }
  // star
  const inner = r * 0.45
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={c} strokeLinejoin="round" />
}

/** A white square tile bearing a shape icon, top-left at (x, y). */
function Tile({ shape, x, y, badgeG }: { shape: ShapeKey; x: number; y: number; badgeG?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={TILE} height={TILE} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <ShapeIcon shape={shape} cx={x + TILE / 2} cy={y + TILE / 2} />
      {badgeG !== undefined && (
        <g>
          <rect x={x + TILE / 2 - 16} y={y - 19} width={32} height={16} rx={8} fill={GREEN} stroke="#FFFFFF" strokeWidth={1.5} />
          <text x={x + TILE / 2} y={y - 10.5} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={900} fill="#FFFFFF">
            {`${badgeG} g`}
          </text>
        </g>
      )}
    </g>
  )
}

/** One pan: post + plate at (px, py), tile rows stacked above the plate. */
function Pan({ px, py, rows, solved }: { px: number; py: number; rows: ShapeKey[][]; solved: Partial<Record<ShapeKey, number>> }) {
  const plateY = py - 10
  return (
    <g>
      <line x1={px} y1={py} x2={px} y2={plateY} stroke={INK} strokeWidth={3} />
      <ellipse cx={px} cy={plateY} rx={46} ry={6} fill={PLATE_FILL} stroke={INK} strokeWidth={2} />
      {rows.map((row, ri) => {
        const rowW = row.length * TILE + (row.length - 1) * TILE_GAP
        const startX = px - rowW / 2
        const y = plateY - 5 - (ri + 1) * TILE - ri * 1
        return row.map((shape, ci) => (
          <Tile key={`${ri}-${ci}`} shape={shape} x={startX + ci * (TILE + TILE_GAP)} y={y} badgeG={solved[shape]} />
        ))
      })}
    </g>
  )
}

/** One balance scale drawn inside its cell; (ox, 0) is the cell's top-left. */
export function ScaleRow({
  def,
  ox,
  solved = {},
  dim = false,
}: {
  def: ScaleDef
  ox: number
  solved?: Partial<Record<ShapeKey, number>>
  dim?: boolean
}) {
  const pivotX = ox + CELL_W / 2
  const leftY = PIVOT_Y + def.tilt * TILT_DY
  const rightY = PIVOT_Y - def.tilt * TILT_DY
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  return (
    <g opacity={dim ? 0.25 : 1}>
      {/* base */}
      <polygon
        points={`${pivotX},${PIVOT_Y} ${pivotX - 26},${PIVOT_Y + 44} ${pivotX + 26},${PIVOT_Y + 44}`}
        fill={BASE_COLOR}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* beam */}
      <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke={BEAM_COLOR} strokeWidth={9} strokeLinecap="round" />
      <circle cx={pivotX} cy={PIVOT_Y} r={3.5} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
      {/* pans */}
      <Pan px={leftX} py={leftY} rows={def.left} solved={solved} />
      <Pan px={rightX} py={rightY} rows={def.right} solved={solved} />
    </g>
  )
}

/** The asked line "△ + ○ = ? g" under the scales. */
function AskedLine({ showAnswer }: { showAnswer: boolean }) {
  const y = VIEW_H - 32
  const tile = 30
  const t1 = VIEW_W / 2 - 88
  const t2 = t1 + 64
  return (
    <g>
      <rect x={t1} y={y - tile / 2} width={tile} height={tile} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <ShapeIcon shape="triangle" cx={t1 + tile / 2} cy={y} r={9} />
      <text x={t1 + 47} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={INK}>
        +
      </text>
      <rect x={t2} y={y - tile / 2} width={tile} height={tile} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <ShapeIcon shape="circle" cx={t2 + tile / 2} cy={y} r={9} />
      <text x={t2 + 47} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={INK}>
        =
      </text>
      <text
        x={t2 + 78}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
        fontWeight={900}
        fill={showAnswer ? GREEN : '#94A3B8'}
      >
        {showAnswer ? String(ANSWER) : '?'}
      </text>
      <text x={t2 + 102} y={y} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fill={INK}>
        g
      </text>
    </g>
  )
}

export interface ScalesDiagramProps {
  /** Emphasise one scale (0..2); the others dim. null = all neutral. */
  focus?: 0 | 1 | 2 | null
  /** Shapes whose weight is known — shown as a green "n g" badge on every tile of that shape. */
  solved?: Partial<Record<ShapeKey, number>>
  /** Reveal the asked answer (△ + ○ = 6). */
  showAnswer?: boolean
}

export function ScalesDiagram({ focus = null, solved = {}, showAnswer = false }: ScalesDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 700, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCALES.map((def, i) => (
        <ScaleRow key={i} def={def} ox={6 + i * (CELL_W + 4)} solved={solved} dim={focus !== null && focus !== i} />
      ))}
      <AskedLine showAnswer={showAnswer} />
    </svg>
  )
}

export default function ThreeScales20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three balance scales. First scale is level: triangle, square and hexagon balance circle and star. Second scale tips left: star and hexagon outweigh square and circle. Third scale tips right: triangle and circle outweigh square and hexagon. Below: triangle plus circle equals how many grams?"
    >
      <ScalesDiagram />
    </div>
  )
}
