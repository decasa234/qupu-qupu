import type { ReactNode } from 'react'

type ShapeKind = 'circle' | 'triangle' | 'square' | 'star'

interface Side {
  a: number
  b: number
  unit: number
}
interface ScaleData {
  left: Side
  right: Side
}
interface BalanceParams {
  shapeA: ShapeKind
  shapeB: ShapeKind
  scales: [ScaleData, ScaleData]
}

const SAMPLE: BalanceParams = {
  shapeA: 'triangle',
  shapeB: 'star',
  scales: [
    { left: { a: 1, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 3 } },
    { left: { a: 2, b: 0, unit: 0 }, right: { a: 0, b: 1, unit: 0 } },
  ],
}

// ── palette ───────────────────────────────────────────────────────────────
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const CUBE_FRONT = '#E0A000'
const CUBE_TOP = '#F2BE45'
const CUBE_SIDE = '#B27C00'
const CREAM = '#FAF6EF'

// ── geometry (one scale cell) ─────────────────────────────────────────────
const CELL_W = 300
const CELL_H = 164
const PIVOT_X = 150
const BEAM_Y = 52 // level beam — both scales always balance
const BEAM_HALF = 96
const PAN_DROP = 52 // long hangers keep pan contents clear of the beam
const PAN_HW = 48
const POST_BOTTOM = 144

// ── item sizing ───────────────────────────────────────────────────────────
const SHAPE = 24
const SHAPE_GAP = 5
const CUBE = 16
const CUBE_GAP = 4
const CUBES_PER_ROW = 4

const SHAPE_LABEL_ID: Record<ShapeKind, string> = {
  circle: 'lingkaran',
  triangle: 'segitiga',
  square: 'persegi',
  star: 'bintang',
}

function starPoints(r: number, cx: number, cy: number): string {
  const inner = r * 0.44
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    // start at the top point and walk clockwise — fully deterministic
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + rad * Math.cos(angle)).toFixed(2)},${(cy + rad * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** One shape glyph. Bottom edge sits at y = 0, horizontally centred on x = 0. */
function shapeGlyph(kind: ShapeKind, fill: string, key: string): ReactNode {
  const s = SHAPE
  const half = s / 2
  const common = { fill, stroke: BLUE, strokeWidth: 1.5, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'circle':
      return <circle key={key} cx={0} cy={-half} r={half} {...common} />
    case 'square':
      return <rect key={key} x={-half} y={-s} width={s} height={s} rx={3} {...common} />
    case 'triangle':
      return <polygon key={key} points={`0,${-s} ${-half},0 ${half},0`} {...common} />
    case 'star':
    default:
      return <polygon key={key} points={starPoints(half, 0, -half)} {...common} />
  }
}

/** One unit cube. Bottom edge at y = 0, centred on x = 0. */
function cubeGlyph(key: string): ReactNode {
  const s = CUBE
  const d = s * 0.28
  const fw = s - d
  const x0 = -s / 2
  const topY = -fw
  return (
    <g key={key} stroke={BLUE} strokeWidth={1.2} strokeLinejoin="round">
      <rect x={x0} y={topY} width={fw} height={fw} fill={CUBE_FRONT} />
      <polygon
        points={`${x0},${topY} ${x0 + d},${topY - d} ${x0 + d + fw},${topY - d} ${x0 + fw},${topY}`}
        fill={CUBE_TOP}
      />
      <polygon
        points={`${x0 + fw},${topY} ${x0 + fw + d},${topY - d} ${x0 + fw + d},${-d} ${x0 + fw},0`}
        fill={CUBE_SIDE}
      />
    </g>
  )
}

/** Everything resting on one pan tray. Origin (0, 0) = tray top-centre. */
function panContents(side: Side, shapeA: ShapeKind, shapeB: ShapeKind, tag: string): ReactNode {
  const shapes: Array<{ kind: ShapeKind; fill: string }> = [
    ...Array.from({ length: side.a }, () => ({ kind: shapeA, fill: ORANGE })),
    ...Array.from({ length: side.b }, () => ({ kind: shapeB, fill: GREEN })),
  ]
  const shapesW = shapes.length > 0 ? shapes.length * SHAPE + (shapes.length - 1) * SHAPE_GAP : 0

  const cubeRows: number[] = []
  let remaining = side.unit
  while (remaining > 0) {
    const take = Math.min(CUBES_PER_ROW, remaining)
    cubeRows.push(take)
    remaining -= take
  }
  const cubeCols = Math.min(side.unit, CUBES_PER_ROW)
  const cubesW = side.unit > 0 ? cubeCols * CUBE + (cubeCols - 1) * CUBE_GAP : 0

  const bridge = shapesW > 0 && cubesW > 0 ? 10 : 0
  const totalW = shapesW + cubesW + bridge
  const startX = -totalW / 2

  const nodes: ReactNode[] = []
  shapes.forEach((item, i) => {
    const cx = startX + i * (SHAPE + SHAPE_GAP) + SHAPE / 2
    nodes.push(
      <g key={`${tag}-s${i}`} transform={`translate(${cx.toFixed(2)},0)`}>
        {shapeGlyph(item.kind, item.fill, `${tag}-g${i}`)}
      </g>,
    )
  })

  const cubesStartX = startX + shapesW + bridge
  let placed = 0
  cubeRows.forEach((count, row) => {
    const rowW = count * CUBE + (count - 1) * CUBE_GAP
    const rowX = cubesStartX + (cubesW - rowW) / 2
    const rowY = -row * (CUBE + CUBE_GAP)
    for (let i = 0; i < count; i++) {
      const cx = rowX + i * (CUBE + CUBE_GAP) + CUBE / 2
      nodes.push(
        <g key={`${tag}-c${placed}`} transform={`translate(${cx.toFixed(2)},${rowY})`}>
          {cubeGlyph(`${tag}-cg${placed}`)}
        </g>,
      )
      placed += 1
    }
  })

  return <>{nodes}</>
}

function Pan({ bx, children }: { bx: number; children: ReactNode }) {
  const trayTop = BEAM_Y + PAN_DROP
  return (
    <g>
      <line x1={bx} y1={BEAM_Y} x2={bx - PAN_HW + 8} y2={trayTop} stroke={BLUE} strokeWidth={1.5} />
      <line x1={bx} y1={BEAM_Y} x2={bx + PAN_HW - 8} y2={trayTop} stroke={BLUE} strokeWidth={1.5} />
      <g transform={`translate(${bx},${trayTop})`}>{children}</g>
      <path
        d={`M ${bx - PAN_HW} ${trayTop} Q ${bx} ${trayTop + 14} ${bx + PAN_HW} ${trayTop}`}
        fill="none"
        stroke={BLUE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={bx} cy={trayTop} rx={PAN_HW} ry={4.5} fill={CREAM} stroke={BLUE} strokeWidth={2.5} />
    </g>
  )
}

function ScaleCell({
  scale,
  shapeA,
  shapeB,
  index,
}: {
  scale: ScaleData
  shapeA: ShapeKind
  shapeB: ShapeKind
  index: number
}) {
  const leftX = PIVOT_X - BEAM_HALF
  const rightX = PIVOT_X + BEAM_HALF
  return (
    <g>
      {/* which scale this is — matches "timbangan pertama / kedua" in the stem */}
      <circle cx={20} cy={20} r={13} fill={BLUE} />
      <text x={20} y={20} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={CREAM}>
        {index}
      </text>

      <Pan bx={leftX}>{panContents(scale.left, shapeA, shapeB, `s${index}l`)}</Pan>
      <Pan bx={rightX}>{panContents(scale.right, shapeA, shapeB, `s${index}r`)}</Pan>

      {/* level beam — the scale always balances */}
      <line x1={leftX} y1={BEAM_Y} x2={rightX} y2={BEAM_Y} stroke={BLUE} strokeWidth={7} strokeLinecap="round" />

      {/* stand: post + base plate, drawn between the two pans */}
      <rect x={PIVOT_X - 4} y={BEAM_Y} width={8} height={POST_BOTTOM - BEAM_Y} rx={3} fill={BLUE} />
      <rect x={PIVOT_X - 38} y={POST_BOTTOM} width={76} height={10} rx={5} fill={BLUE} />
      <circle cx={PIVOT_X} cy={BEAM_Y} r={7} fill={CREAM} stroke={BLUE} strokeWidth={2.5} />
    </g>
  )
}

function describeSideId(side: Side, shapeA: ShapeKind, shapeB: ShapeKind): string {
  const parts: string[] = []
  if (side.a > 0) parts.push(`${side.a} ${SHAPE_LABEL_ID[shapeA]}`)
  if (side.b > 0) parts.push(`${side.b} ${SHAPE_LABEL_ID[shapeB]}`)
  if (side.unit > 0) parts.push(`${side.unit} kubus`)
  return parts.join(' dan ')
}

function isSide(v: unknown): v is Side {
  const s = v as Partial<Side> | null
  return !!s && typeof s.a === 'number' && typeof s.b === 'number' && typeof s.unit === 'number'
}
function isScale(v: unknown): v is ScaleData {
  const s = v as Partial<ScaleData> | null
  return !!s && isSide(s.left) && isSide(s.right)
}

/**
 * balance-substitution — question figure.
 *
 * Draws the TWO level balance scales the learner reads: a stand, a level beam,
 * and the shapes / unit cubes resting in each pan. Both beams are always level
 * because every generated scale really does balance. Nothing here reveals the
 * hidden weights or the answer.
 *
 * Pure render from params — no random, no dates, SSR-safe. Falls back to a
 * sample when params arrive in the wrong shape so previews still render.
 */
export default function BalanceSubstitutionIllustration({ params }: { params: unknown }) {
  const p = (params ?? {}) as Partial<BalanceParams>
  const shapeA: ShapeKind = p.shapeA && SHAPE_LABEL_ID[p.shapeA] ? p.shapeA : SAMPLE.shapeA
  const shapeB: ShapeKind = p.shapeB && SHAPE_LABEL_ID[p.shapeB] ? p.shapeB : SAMPLE.shapeB
  const scales: [ScaleData, ScaleData] =
    Array.isArray(p.scales) && p.scales.length === 2 && p.scales.every(isScale)
      ? (p.scales as [ScaleData, ScaleData])
      : SAMPLE.scales

  const height = CELL_H * 2
  const aria = scales
    .map(
      (s, i) =>
        `Timbangan ${i === 0 ? 'pertama' : 'kedua'}: ${describeSideId(s.left, shapeA, shapeB)} seimbang dengan ${describeSideId(s.right, shapeA, shapeB)}.`,
    )
    .join(' ')

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={`Dua timbangan yang seimbang. ${aria}`}>
      <svg viewBox={`0 0 ${CELL_W} ${height}`} width={CELL_W} className="h-auto max-w-full">
        <g transform="translate(0,0)">
          <ScaleCell scale={scales[0]} shapeA={shapeA} shapeB={shapeB} index={1} />
        </g>
        <g transform={`translate(0,${CELL_H})`}>
          <ScaleCell scale={scales[1]} shapeA={shapeA} shapeB={shapeB} index={2} />
        </g>
      </svg>
    </div>
  )
}
