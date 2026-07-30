import type { ReactNode } from 'react'

export type ShapeKind = 'circle' | 'triangle' | 'square' | 'star'

export interface Side {
  a: number
  b: number
  unit: number
}
export interface ScaleData {
  left: Side
  right: Side
}
export interface BalanceParams {
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
// Exported (with the geometry and glyphs below) so the animated explainer draws
// the same scale from the same numbers instead of keeping a private copy that
// silently desyncs whenever this figure is redrawn.
export const BALANCE_INK = {
  /** Every piece of scale chrome, and every glyph outline. */
  frame: '#30598A',
  shapeA: '#F0853A',
  shapeB: '#58A700',
  cubeFront: '#E0A000',
  cubeTop: '#F2BE45',
  cubeSide: '#B27C00',
  cream: '#FAF6EF',
} as const

/** Which fill a shape wears — role A is warm, role B is green. */
export function roleFill(role: 'A' | 'B' | null): string {
  return role === 'B' ? BALANCE_INK.shapeB : BALANCE_INK.shapeA
}

// ── geometry (one scale cell) ─────────────────────────────────────────────
// Counting the things in the pans IS the task, so the whole frame is built so
// that nothing can ever sit on top of an item:
//   • the pan is a flat plate, not a bowl — items rest ON it, never inside it;
//   • the pan hangs from two wires that splay out high, then drop VERTICALLY
//     outside the item strip, so a tall stack never runs into a slanted hanger;
//   • the beam sits far enough above the plate to clear the tallest stack;
//   • every piece of scale chrome is painted BEFORE the items.
export const SCALE_GEOM = {
  width: 300,
  pivotX: 150,
  beamY: 44,
  beamHalf: 92,
  beamWidth: 7,
  /** The hanger has finished splaying out and runs straight down from here. */
  splayY: 44 + 18,
  /** Half width of the flat plate. */
  panHalfWidth: 54,
  /** Vertical hanger wires — always outside the items. */
  wireHalfSpan: 50,
  /** Shallow plate: it can never swallow an item body. */
  trayThickness: 5,
  bowlDepth: 15,
  /** Usable width for items (wires at ±50, 6px of air each side). */
  innerWidth: 88,
  leftX: 150 - 92,
  rightX: 150 + 92,
} as const

/** Beam → pan surface for the question figure; long enough to clear two cube rows. */
export const FIGURE_PAN_DROP = 60

export interface ScaleFrameGeom {
  /** The surface items rest on. */
  trayY: number
  postBottom: number
  /** Total height of one scale cell. */
  height: number
}

/**
 * Everything below the beam follows from where the pans hang, so a caller that
 * needs longer wires (the explainer stacks more on a pan than the question
 * figure ever does) only has to move `trayY`.
 */
export function scaleFrame(trayY: number): ScaleFrameGeom {
  const postBottom = trayY + 36
  return { trayY, postBottom, height: postBottom + 18 }
}

// ── item sizing ───────────────────────────────────────────────────────────
/** The box one shape glyph is drawn in: bottom edge y = 0, centred on x = 0. */
export const SHAPE_BOX = 26
/** The box one unit cube is drawn in: bottom edge y = 0, centred on x = 0. */
export const CUBE_BOX = 16
export const STAR_SIN54 = Math.sin((54 * Math.PI) / 180)

const SHAPE_GAP = 5
const CUBE_GAP = 4
const CUBES_PER_ROW = 4
const CUBE_ROW_PITCH = CUBE_BOX + CUBE_GAP
const GROUP_GAP = 10

export const SHAPE_LABEL_ID: Record<ShapeKind, string> = {
  circle: 'lingkaran',
  triangle: 'segitiga',
  square: 'persegi',
  star: 'bintang',
}

/** Defensive count: params arrive as `unknown`, so clamp to something drawable. */
function count(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(max, Math.floor(value)))
}

/** The counts actually drawn on a pan — the label reads these, not the raw params. */
export function drawnSide(side: Side): Side {
  return { a: count(side.a, 6), b: count(side.b, 6), unit: count(side.unit, 12) }
}

export function starPoints(r: number, cx: number, cy: number): string {
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
export function shapeGlyph(kind: ShapeKind, fill: string, key?: string): ReactNode {
  const s = SHAPE_BOX
  const half = s / 2
  const common = {
    fill,
    stroke: BALANCE_INK.frame,
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'circle':
      return <circle key={key} cx={0} cy={-half} r={half} {...common} />
    case 'square':
      return <rect key={key} x={-half} y={-s} width={s} height={s} rx={3} {...common} />
    case 'triangle':
      return <polygon key={key} points={`0,${-s} ${-half},0 ${half},0`} {...common} />
    case 'star':
    default:
      // seat the star's two lowest points exactly on the pan surface
      return <polygon key={key} points={starPoints(half, 0, -half * STAR_SIN54)} {...common} />
  }
}

/** One unit cube. Bottom edge at y = 0, centred on x = 0. */
export function cubeGlyph(key?: string): ReactNode {
  const s = CUBE_BOX
  const d = s * 0.28
  const fw = s - d
  const x0 = -s / 2
  const topY = -fw
  return (
    <g key={key} stroke={BALANCE_INK.frame} strokeWidth={1.2} strokeLinejoin="round">
      <rect x={x0} y={topY} width={fw} height={fw} fill={BALANCE_INK.cubeFront} />
      <polygon
        points={`${x0},${topY} ${x0 + d},${topY - d} ${x0 + d + fw},${topY - d} ${x0 + fw},${topY}`}
        fill={BALANCE_INK.cubeTop}
      />
      <polygon
        points={`${x0 + fw},${topY} ${x0 + fw + d},${topY - d} ${x0 + fw + d},${-d} ${x0 + fw},0`}
        fill={BALANCE_INK.cubeSide}
      />
    </g>
  )
}

/**
 * Everything resting on one pan plate. Origin (0, 0) = plate top-centre.
 *
 * Shapes go in one row; cubes go in at most two tidy rows next to them. If a
 * pan is unusually crowded the whole group is scaled down to the plate width
 * instead of spilling past the hanger wires.
 */
function panContents(side: Side, shapeA: ShapeKind, shapeB: ShapeKind, tag: string): ReactNode {
  const { a: nA, b: nB, unit } = drawnSide(side)

  const shapes: Array<{ kind: ShapeKind; fill: string }> = [
    ...Array.from({ length: nA }, () => ({ kind: shapeA, fill: roleFill('A') })),
    ...Array.from({ length: nB }, () => ({ kind: shapeB, fill: roleFill('B') })),
  ]
  const shapesW =
    shapes.length > 0 ? shapes.length * SHAPE_BOX + (shapes.length - 1) * SHAPE_GAP : 0

  // Never more than two rows — a third row would reach the beam. Wide rows are
  // handled by the fit-to-plate scale below.
  const rows = unit === 0 ? 0 : unit <= CUBES_PER_ROW ? 1 : 2
  const perRow = rows === 0 ? 0 : rows === 1 ? unit : Math.ceil(unit / rows)
  const cubeRows: number[] = []
  let remaining = unit
  while (remaining > 0) {
    const take = Math.min(perRow, remaining)
    cubeRows.push(take)
    remaining -= take
  }
  const cubesW = perRow > 0 ? perRow * CUBE_BOX + (perRow - 1) * CUBE_GAP : 0

  const bridge = shapesW > 0 && cubesW > 0 ? GROUP_GAP : 0
  const totalW = shapesW + cubesW + bridge
  const startX = -totalW / 2

  const nodes: ReactNode[] = []
  shapes.forEach((item, i) => {
    const cx = startX + i * (SHAPE_BOX + SHAPE_GAP) + SHAPE_BOX / 2
    nodes.push(
      <g key={`${tag}-s${i}`} transform={`translate(${cx.toFixed(2)},0)`}>
        {shapeGlyph(item.kind, item.fill, `${tag}-g${i}`)}
      </g>,
    )
  })

  const cubesStartX = startX + shapesW + bridge
  let placed = 0
  cubeRows.forEach((rowCount, row) => {
    const rowW = rowCount * CUBE_BOX + (rowCount - 1) * CUBE_GAP
    const rowX = cubesStartX + (cubesW - rowW) / 2
    const rowY = -row * CUBE_ROW_PITCH
    for (let i = 0; i < rowCount; i++) {
      const cx = rowX + i * (CUBE_BOX + CUBE_GAP) + CUBE_BOX / 2
      nodes.push(
        <g key={`${tag}-c${placed}`} transform={`translate(${cx.toFixed(2)},${rowY})`}>
          {cubeGlyph(`${tag}-cg${placed}`)}
        </g>,
      )
      placed += 1
    }
  })

  const fit = totalW > SCALE_GEOM.innerWidth ? SCALE_GEOM.innerWidth / totalW : 1
  return <g transform={`scale(${fit.toFixed(4)})`}>{nodes}</g>
}

/** One hanger wire: it splays out from the beam high up, then drops vertically. */
export function hangerPath(bx: number, trayY: number, dir: 1 | -1): string {
  const { beamY, splayY, wireHalfSpan } = SCALE_GEOM
  const x = bx + dir * wireHalfSpan
  return `M ${bx} ${beamY} C ${bx} ${beamY + 10}, ${x} ${beamY + 8}, ${x} ${splayY} L ${x} ${trayY}`
}

export interface PanChromeStyle {
  /** Outline of the plate and its dish. Defaults to the frame ink. */
  stroke?: string
  /** Fill of the flat plate. Defaults to cream. */
  plateFill?: string
  /** Emphasis: slightly heavier outlines, for a spotlighted pan. */
  bold?: boolean
}

/**
 * The pan: two hanger wires, a shallow dish and the flat plate items rest on.
 * Draw this BEFORE the items, so no piece of chrome can ever cover a countable.
 */
export function PanChrome({
  bx,
  trayY,
  style = {},
}: {
  bx: number
  trayY: number
  style?: PanChromeStyle
}) {
  const { panHalfWidth, trayThickness, bowlDepth } = SCALE_GEOM
  const stroke = style.stroke ?? BALANCE_INK.frame
  const plateFill = style.plateFill ?? BALANCE_INK.cream
  // thin wires: the pan chrome stays quiet so the goods on it read first
  const wire = {
    fill: 'none',
    stroke: BALANCE_INK.frame,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
  }
  return (
    <g>
      <path d={hangerPath(bx, trayY, -1)} {...wire} />
      <path d={hangerPath(bx, trayY, 1)} {...wire} />
      <path
        d={`M ${bx - panHalfWidth + 6} ${trayY + trayThickness} Q ${bx} ${trayY + trayThickness + bowlDepth} ${bx + panHalfWidth - 6} ${trayY + trayThickness}`}
        fill={BALANCE_INK.cream}
        stroke={stroke}
        strokeWidth={style.bold ? 3 : 2.5}
        strokeLinejoin="round"
      />
      <rect
        x={bx - panHalfWidth}
        y={trayY}
        width={panHalfWidth * 2}
        height={trayThickness}
        rx={trayThickness / 2}
        fill={plateFill}
        stroke={stroke}
        strokeWidth={style.bold ? 2.6 : 2}
      />
    </g>
  )
}

/**
 * The standing part of the scale: the numbered badge, a level beam, the post,
 * the base and the pivot cap. Both beams are always level because every
 * generated scale really does balance.
 */
export function ScaleFrame({ trayY, index }: { trayY: number; index: number | null }) {
  const { pivotX, beamY, beamWidth, leftX, rightX } = SCALE_GEOM
  const { postBottom } = scaleFrame(trayY)
  return (
    <g>
      {/* which scale this is — matches "timbangan pertama / kedua" in the stem */}
      {index != null && (
        <>
          <circle cx={20} cy={20} r={13} fill={BALANCE_INK.frame} />
          <text
            x={20}
            y={20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight={800}
            fill={BALANCE_INK.cream}
          >
            {index}
          </text>
        </>
      )}
      <line
        x1={leftX}
        y1={beamY}
        x2={rightX}
        y2={beamY}
        stroke={BALANCE_INK.frame}
        strokeWidth={beamWidth}
        strokeLinecap="round"
      />
      <rect
        x={pivotX - 4}
        y={beamY}
        width={8}
        height={postBottom - beamY}
        rx={3}
        fill={BALANCE_INK.frame}
      />
      <rect x={pivotX - 38} y={postBottom} width={76} height={10} rx={5} fill={BALANCE_INK.frame} />
      <circle
        cx={pivotX}
        cy={beamY}
        r={7}
        fill={BALANCE_INK.cream}
        stroke={BALANCE_INK.frame}
        strokeWidth={2.5}
      />
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
  const trayY = SCALE_GEOM.beamY + FIGURE_PAN_DROP
  const { leftX, rightX } = SCALE_GEOM
  return (
    <g>
      {/* frame first, pans next, items last — always fully visible on the plate */}
      <ScaleFrame trayY={trayY} index={index} />
      <PanChrome bx={leftX} trayY={trayY} />
      <PanChrome bx={rightX} trayY={trayY} />
      <g transform={`translate(${leftX},${trayY})`}>
        {panContents(scale.left, shapeA, shapeB, `s${index}l`)}
      </g>
      <g transform={`translate(${rightX},${trayY})`}>
        {panContents(scale.right, shapeA, shapeB, `s${index}r`)}
      </g>
    </g>
  )
}

// ── screen-reader label ────────────────────────────────────────────────────
// Policy: describe both level scales and exactly what sits on each pan — that
// is the given evidence, and the stem states the very same counts in words. The
// asked quantity (what one shape is worth, or how many shapes balance the
// group) is never derived here, so the label can never hand over the answer.

function describePan(side: Side, shapeA: ShapeKind, shapeB: ShapeKind): string {
  const { a, b, unit } = drawnSide(side)
  const parts: string[] = []
  if (a > 0) parts.push(`${a} ${SHAPE_LABEL_ID[shapeA]}`)
  if (b > 0) parts.push(`${b} ${SHAPE_LABEL_ID[shapeB]}`)
  if (unit > 0) parts.push(`${unit} kubus`)
  return parts.length > 0 ? parts.join(' dan ') : 'kosong'
}

const SCALE_ORDINAL_ID = ['pertama', 'kedua'] as const

/** Deterministic Indonesian description of the two scales, in `params` order. */
export function balanceFigureAriaLabel(p: BalanceParams): string {
  const lines = p.scales
    .map(
      (s, i) =>
        `Timbangan ${SCALE_ORDINAL_ID[i] ?? i + 1}: piring kiri berisi ${describePan(s.left, p.shapeA, p.shapeB)}, piring kanan berisi ${describePan(s.right, p.shapeA, p.shapeB)}`,
    )
    .join('. ')
  return `Dua timbangan, keduanya seimbang dengan lengan mendatar. ${lines}.`
}

function isSide(v: unknown): v is Side {
  const s = v as Partial<Side> | null
  return (
    !!s &&
    Number.isFinite(s.a as number) &&
    Number.isFinite(s.b as number) &&
    Number.isFinite(s.unit as number)
  )
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

  const cellH = scaleFrame(SCALE_GEOM.beamY + FIGURE_PAN_DROP).height
  const ariaLabel = balanceFigureAriaLabel({ shapeA, shapeB, scales })

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${SCALE_GEOM.width} ${cellH * 2}`}
        width={SCALE_GEOM.width}
        className="h-auto max-w-full"
      >
        <g transform="translate(0,0)">
          <ScaleCell scale={scales[0]} shapeA={shapeA} shapeB={shapeB} index={1} />
        </g>
        <g transform={`translate(0,${cellH})`}>
          <ScaleCell scale={scales[1]} shapeA={shapeA} shapeB={shapeB} index={2} />
        </g>
      </svg>
    </div>
  )
}
