// Three balance scales for WMI-25F1A-Q22 (2025 Grade 1 Final).
//
// Recovered from db/seed/wmi/figures/2025-final-g1-a-q22.jpg. Two kinds of shape
// have unknown WHOLE-NUMBER weights: a green ball (b) and a yellow square (s). A
// pink "12" block is a fixed 12-unit reference weight. The heavier pan tips DOWN.
//
//   Scale 1 (LEFT down):  2 balls   > 1 square              =>  2b  > s
//   Scale 2 (RIGHT down): 3 balls   < 2 squares             =>  3b  < 2s
//   Scale 3 (LEFT down):  12 (pink) > 1 square + 1 ball     =>  12  > b + s
//
// Solver-confirmed (whole numbers >= 1): only two solutions satisfy all three
// balances — (b=3, s=5) total 8, and (b=4, s=7) total 11. So the largest total
// of one ball + one square is 11 and the smallest is 8; their difference is
//   11 - 8 = 3.   (ANSWER = 3.)
//
// This figure draws ONLY the problem: the three tilted scales with their shapes.
// No weights are labelled (except the printed "12" on the pink block, which is a
// given), and the answer is never revealed. Pure render, SSR-safe, deterministic.

export const ANSWER = 3
export const MAX_TOTAL = 11 // b=4, s=7
export const MIN_TOTAL = 8 // b=3, s=5
export const REF_WEIGHT = 12 // printed on the pink block

// --- palette (matches the scan; raw hex is allowed for shape colours) -------
const INK = '#1F2937'
const BALL_FILL = '#A7D154' // green ball
const SQUARE_FILL = '#F6F3A6' // pale yellow square
const PINK_FILL = '#F2A8A8' // pink reference block
const BASE_FILL = '#5BC0EB' // blue triangular base/pivot (scan)
const BEAM_COLOR = '#9AA0A6' // grey beam
const PAN_FILL = '#FFFFFF'

// --- one scale drawn inside a CELL_W x CELL_H cell --------------------------
const CELL_W = 270
const CELL_H = 170
const PIVOT_Y = 96
const BEAM_HALF = 92
const TILT_DY = 26
const PAN_DROP = 14 // pan sits this far below the beam end

export type ShapeKey = 'ball' | 'square'

/** Tilt: 1 = left pan down (left heavier), -1 = right pan down, 0 = level. */
export interface ScaleDef {
  tilt: -1 | 0 | 1
  /** Contents of the left pan. A 'pink12' marks the printed reference block. */
  left: Array<ShapeKey | 'pink12'>
  /** Contents of the right pan. */
  right: Array<ShapeKey | 'pink12'>
  /** How the left items are arranged: a single row, or a 2+1 cluster (scale 2). */
  leftLayout?: 'row' | 'cluster'
}

export const SCALES: ScaleDef[] = [
  // Scale 1: 2 balls (left, down) vs 1 square (right, up)
  { tilt: 1, left: ['ball', 'ball'], right: ['square'] },
  // Scale 2: 3 balls clustered (left, up) vs 2 squares (right, down)
  { tilt: -1, left: ['ball', 'ball', 'ball'], right: ['square', 'square'], leftLayout: 'cluster' },
  // Scale 3: pink 12 block (left, down) vs 1 square + 1 ball (right, up)
  { tilt: 1, left: ['pink12'], right: ['square', 'ball'] },
]

// Whole figure: three cells side by side with gaps + edge headroom.
const GAP = 12
const PAD = 10
export const VIEW_W = PAD * 2 + CELL_W * 3 + GAP * 2 // 838
export const VIEW_H = CELL_H

const BALL_R = 16
const SQ = 30 // square side
const PINK_W = 46
const PINK_H = 50

/** A single shape glyph sitting with its BASE at y = baseY, centred at cx. */
function ShapeGlyph({ kind, cx, baseY }: { kind: ShapeKey | 'pink12'; cx: number; baseY: number }) {
  if (kind === 'ball') {
    return <circle cx={cx} cy={baseY - BALL_R} r={BALL_R} fill={BALL_FILL} stroke={INK} strokeWidth={2.5} />
  }
  if (kind === 'square') {
    return (
      <rect
        x={cx - SQ / 2}
        y={baseY - SQ}
        width={SQ}
        height={SQ}
        rx={4}
        fill={SQUARE_FILL}
        stroke={INK}
        strokeWidth={2.5}
      />
    )
  }
  // pink "12" reference block — slightly rotated like the scan
  return (
    <g transform={`rotate(-6 ${cx} ${baseY - PINK_H / 2})`}>
      <rect
        x={cx - PINK_W / 2}
        y={baseY - PINK_H}
        width={PINK_W}
        height={PINK_H}
        rx={5}
        fill={PINK_FILL}
        stroke={INK}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={baseY - PINK_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={INK}
      >
        {REF_WEIGHT}
      </text>
    </g>
  )
}

/** One pan: a shallow tray hanging at (px, py) with its items resting on it. */
function Pan({
  px,
  py,
  items,
  layout = 'row',
}: {
  px: number
  py: number
  items: Array<ShapeKey | 'pink12'>
  layout?: 'row' | 'cluster'
}) {
  const trayTop = py + PAN_DROP
  const trayW = 78
  const restY = trayTop - 3 // shapes sit just above the tray surface

  // Place each item. 'cluster' = a 2-over-1 triangle for the three balls.
  const placements: Array<{ kind: ShapeKey | 'pink12'; cx: number; baseY: number }> = []
  if (layout === 'cluster' && items.length === 3) {
    placements.push({ kind: items[0], cx: px - BALL_R - 1, baseY: restY })
    placements.push({ kind: items[1], cx: px + BALL_R + 1, baseY: restY })
    placements.push({ kind: items[2], cx: px, baseY: restY - BALL_R * 1.7 }) // top ball
  } else {
    const step = items.some((k) => k === 'square') ? SQ + 4 : BALL_R * 2 + 4
    const n = items.length
    const startX = px - ((n - 1) * step) / 2
    items.forEach((kind, i) => {
      const w = kind === 'pink12' ? PINK_W : 0
      placements.push({ kind, cx: startX + i * step + (kind === 'pink12' ? -w * 0.05 : 0), baseY: restY })
    })
  }

  return (
    <g>
      {/* hanger lines from beam end to tray */}
      <line x1={px} y1={py} x2={px - trayW / 2 + 6} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={px} y1={py} x2={px + trayW / 2 - 6} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {/* items first (so the tray rim overlaps their base) */}
      {placements.map((p, i) => (
        <ShapeGlyph key={i} kind={p.kind} cx={p.cx} baseY={p.baseY} />
      ))}
      {/* shallow tray (an open ellipse arc) */}
      <path
        d={`M ${px - trayW / 2} ${trayTop} Q ${px} ${trayTop + 16} ${px + trayW / 2} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={px} cy={trayTop} rx={trayW / 2} ry={4.5} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

/** One balance scale drawn inside its cell; (ox, 0) is the cell's top-left. */
export function ScaleRow({ def, ox, dim = false }: { def: ScaleDef; ox: number; dim?: boolean }) {
  const pivotX = ox + CELL_W / 2
  const leftY = PIVOT_Y + def.tilt * TILT_DY
  const rightY = PIVOT_Y - def.tilt * TILT_DY
  const leftX = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = CELL_H - 8

  return (
    <g opacity={dim ? 0.28 : 1}>
      {/* pans hang from the beam ends */}
      <Pan px={leftX} py={leftY} items={def.left} layout={def.leftLayout} />
      <Pan px={rightX} py={rightY} items={def.right} />

      {/* beam */}
      <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke={BEAM_COLOR} strokeWidth={8} strokeLinecap="round" />

      {/* triangular blue base/pivot */}
      <polygon
        points={`${pivotX},${PIVOT_Y - 4} ${pivotX - 30},${groundY} ${pivotX + 30},${groundY}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* pivot bolt */}
      <circle cx={pivotX} cy={PIVOT_Y} r={5} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

export interface BalanceScales25G1Props {
  /** Emphasise one scale (1..3); the others dim. null/undefined = all neutral. */
  litScale?: number | null
}

/**
 * Bare-scales primitive: the three balance scales, optionally spotlighting one
 * (1-indexed) so the animator can step through them. Renders an <svg> with no
 * wrapper; it is `aria-hidden` and meant to be embedded inside a labelled host.
 */
export function BalanceScales25G1({ litScale = null }: BalanceScales25G1Props) {
  const lit = typeof litScale === 'number' && litScale >= 1 && litScale <= 3 ? litScale : null
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 720, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCALES.map((def, i) => (
        <ScaleRow key={i} def={def} ox={PAD + i * (CELL_W + GAP)} dim={lit !== null && lit !== i + 1} />
      ))}
    </svg>
  )
}

/**
 * WMI-25F1A-Q22 question figure: the three balance scales as scanned. Two green
 * balls outweigh one yellow square; three balls are outweighed by two squares;
 * a "12" block outweighs one square plus one ball. No weights are labelled and
 * no answer is shown.
 */
export default function BalanceScales25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga timbangan. Timbangan pertama: dua bola hijau lebih berat daripada satu persegi kuning. ' +
        'Timbangan kedua: tiga bola hijau lebih ringan daripada dua persegi kuning. ' +
        'Timbangan ketiga: sebuah balok bertuliskan 12 lebih berat daripada satu persegi ditambah satu bola. ' +
        'Berat setiap bentuk adalah bilangan bulat.'
      }
    >
      <BalanceScales25G1 />
    </div>
  )
}
