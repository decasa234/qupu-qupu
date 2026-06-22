// IKMC-20-PE-Q18 — "Two identical trains, each with 31 cars, are traveling in
// opposite directions. When car No. 19 of one train is opposite car No. 19 of
// the other, which car is opposite car No. 12?"
//
// STATIC PROBLEM FIGURE — two horizontal trains, one facing left (top) and one
// facing right (bottom), showing cars numbered 1–5 (with "..." implying more).
// The trains are drawn facing each other, the locomotive on opposite ends.
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/preecolier/2020.imgs/062.jpg:
//   Train A (top):    ← [loco] [1] [2] [3] [4] [5] ...
//   Train B (bottom): ...  [5] [4] [3] [2] [1] [loco] →
//
// The STEM NEVER reveals which cars align — that is the explainer's job.
//
// Reuses the locomotive/car/coupling idiom from TrainArrows24G2Illustration.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported so the explainer can overlay in the same coords) ──

/** Total SVG width. */
export const SVG_W = 380

/** Total SVG height. */
export const SVG_H = 160

/** Y centre of Train A (top train). */
export const TRAIN_A_Y = 44

/** Y centre of Train B (bottom train). */
export const TRAIN_B_Y = 116

/** Width of each numbered car (square). */
export const CAR_W = 36

/** Height of each numbered car. */
export const CAR_H = 30

/** Gap between adjacent cars (coupling space). */
export const CAR_GAP = 6

/** Width of the locomotive body. */
export const LOCO_W = 46

/** Height of the locomotive. */
export const LOCO_H = 30

/** Number of labelled cars shown per train (1..CARS_SHOWN). */
export const CARS_SHOWN = 5

/** Left x where the first car/loco begins. */
export const LOCO_X = 12

/** Colour tokens. */
export const COLOR = {
  BODY: '#F5F5F5',
  BODY_STROKE: '#2B2B2B',
  WHEEL: '#2B2B2B',
  LOCO_CABIN: '#2B2B2B',
  LOCO_FILL: '#F5F5F5',
  ARROW: '#1F2937',
  DOTS: '#555555',
  INK: '#1F2937',
  HIGHLIGHT_A: '#D97706',  // amber — train A car highlight
  HIGHLIGHT_B: '#2563EB',  // blue  — train B car highlight
  HIGHLIGHT_FILL: '#FEF3C7',
  ANSWER_FILL: '#DCFCE7',
  ANSWER_STROKE: '#16A34A',
} as const

// ── Wheel strip under a car ───────────────────────────────────────────────────

function Wheels({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const r = 5
  const cy = y + h / 2 + 3
  return (
    <g fill={COLOR.WHEEL}>
      <circle cx={x + w * 0.25} cy={cy} r={r} />
      <circle cx={x + w * 0.75} cy={cy} r={r} />
    </g>
  )
}

// ── One numbered car ──────────────────────────────────────────────────────────

export interface CarProps {
  /** Left x of the car body. */
  x: number
  /** Top y of the car body. */
  y: number
  /** Car number label (string to allow "?" or "26"). */
  label: string
  /** Optional fill override for highlights. */
  fill?: string
  /** Optional stroke override for highlights. */
  stroke?: string
}

export function TrainCar({ x, y, label, fill = COLOR.BODY, stroke = COLOR.BODY_STROKE }: CarProps) {
  const cx = x + CAR_W / 2
  const cy = y + CAR_H / 2
  return (
    <g>
      <Wheels x={x} y={y} w={CAR_W} h={CAR_H} />
      <rect x={x} y={y} width={CAR_W} height={CAR_H} rx={3} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={label.length > 2 ? 9 : 11}
        fontWeight={700}
        fill={stroke}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Coupling bar between two adjacent cars ────────────────────────────────────

export function Coupling({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const mx = (x1 + x2) / 2
  return (
    <g stroke={COLOR.INK} strokeWidth={2} strokeLinecap="round">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <circle cx={mx} cy={y} r={2.5} fill={COLOR.INK} />
    </g>
  )
}

// ── Locomotive ────────────────────────────────────────────────────────────────

/**
 * Simple locomotive silhouette.
 *   dir='left'  — nose points left  (train A, top row)
 *   dir='right' — nose points right (train B, bottom row)
 * `x` is the left edge of the loco body, `y` the top edge.
 */
export function Locomotive({ x, y, dir }: { x: number; y: number; dir: 'left' | 'right' }) {
  const w = LOCO_W
  const h = LOCO_H
  const noseW = 10
  const bodyLeft = dir === 'left' ? x + noseW : x
  const bodyRight = dir === 'left' ? x + w : x + w - noseW
  const noseTipX = dir === 'left' ? x : x + w
  const cabinW = 18
  const cabinH = 14
  const cabinX = dir === 'left' ? bodyRight - cabinW : bodyLeft
  const cabinY = y - cabinH + 4

  // wheel y — same as cars so wheels align on the track
  const cy = y + h / 2 + 3
  const wheelR = 5

  return (
    <g>
      {/* wheels */}
      <circle cx={bodyLeft + 10} cy={cy} r={wheelR} fill={COLOR.WHEEL} />
      <circle cx={bodyRight - 10} cy={cy} r={wheelR} fill={COLOR.WHEEL} />

      {/* main body */}
      <rect
        x={bodyLeft}
        y={y}
        width={bodyRight - bodyLeft}
        height={h}
        rx={3}
        fill={COLOR.LOCO_FILL}
        stroke={COLOR.BODY_STROKE}
        strokeWidth={2}
      />

      {/* nose / wedge */}
      <polygon
        points={
          dir === 'left'
            ? `${bodyLeft},${y} ${bodyLeft},${y + h} ${noseTipX},${y + h / 2}`
            : `${bodyRight},${y} ${bodyRight},${y + h} ${noseTipX},${y + h / 2}`
        }
        fill={COLOR.LOCO_FILL}
        stroke={COLOR.BODY_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* cabin on top */}
      <rect x={cabinX} y={cabinY} width={cabinW} height={cabinH} rx={2} fill={COLOR.LOCO_CABIN} />
      {/* cabin window */}
      <rect
        x={cabinX + 3}
        y={cabinY + 3}
        width={cabinW - 6}
        height={cabinH - 6}
        rx={1}
        fill={COLOR.LOCO_FILL}
      />
    </g>
  )
}

// ── Direction arrow ───────────────────────────────────────────────────────────

function DirectionArrow({ x, y, dir }: { x: number; y: number; dir: 'left' | 'right' }) {
  const arrowLen = 28
  const headLen = 10
  const headH = 7
  const ey = y
  if (dir === 'left') {
    const sx = x + arrowLen
    return (
      <g stroke={COLOR.ARROW} strokeWidth={2.5} strokeLinecap="round" fill={COLOR.ARROW}>
        <line x1={sx} y1={ey} x2={x} y2={ey} />
        <polygon points={`${x},${ey} ${x + headLen},${ey - headH} ${x + headLen},${ey + headH}`} stroke="none" />
      </g>
    )
  } else {
    const sx = x
    const ex = x + arrowLen
    return (
      <g stroke={COLOR.ARROW} strokeWidth={2.5} strokeLinecap="round" fill={COLOR.ARROW}>
        <line x1={sx} y1={ey} x2={ex} y2={ey} />
        <polygon points={`${ex},${ey} ${ex - headLen},${ey - headH} ${ex - headLen},${ey + headH}`} stroke="none" />
      </g>
    )
  }
}

// ── "..." ellipsis dots ───────────────────────────────────────────────────────

function Ellipsis({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={16}
      fontWeight={900}
      fill={COLOR.DOTS}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      …
    </text>
  )
}

// ── Full train row (exported for explainer reuse) ────────────────────────────

/**
 * Computes the x-positions of all cars and the locomotive for a given train row.
 *
 *  dir='left':  loco is leftmost, then car 1, 2, 3... then "..."
 *  dir='right': "..." is leftmost, then car N...2, 1, then loco
 *
 * Returns an array of { kind, x, label? } for each element from LEFT to RIGHT.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function trainLayout(
  dir: 'left' | 'right',
  rowY: number,
): { kind: 'loco' | 'car' | 'dots'; x: number; label?: string; topY: number }[] {
  const topY = rowY - CAR_H / 2
  const step = CAR_W + CAR_GAP
  const items: { kind: 'loco' | 'car' | 'dots'; x: number; label?: string; topY: number }[] = []

  if (dir === 'left') {
    // Train A: ← [loco] [1] [2] [3] [4] [5] [...]
    let x = LOCO_X + 32 // leave room for arrow
    items.push({ kind: 'loco', x, topY })
    x += LOCO_W + CAR_GAP
    for (let n = 1; n <= CARS_SHOWN; n++) {
      items.push({ kind: 'car', x, label: String(n), topY })
      x += step
    }
    items.push({ kind: 'dots', x: x + 2, topY })
  } else {
    // Train B: [...] [5] [4] [3] [2] [1] [loco] →
    let x = LOCO_X
    items.push({ kind: 'dots', x, topY })
    x += 20 + CAR_GAP
    for (let n = CARS_SHOWN; n >= 1; n--) {
      items.push({ kind: 'car', x, label: String(n), topY })
      x += step
    }
    items.push({ kind: 'loco', x, topY })
  }
  return items
}

/**
 * TrainRow — one full train row (loco + numbered cars + dots).
 * Exported so the explainer can re-render with highlights applied.
 */
export function TrainRow({
  dir,
  rowY,
  highlightCar,
  highlightFill = COLOR.HIGHLIGHT_FILL,
  highlightStroke = COLOR.HIGHLIGHT_A,
}: {
  dir: 'left' | 'right'
  rowY: number
  highlightCar?: number
  highlightFill?: string
  highlightStroke?: string
}) {
  const items = trainLayout(dir, rowY)
  const topY = rowY - CAR_H / 2

  // Find loco x to place the direction arrow
  const locoItem = items.find((it) => it.kind === 'loco')!
  const locoX = locoItem.x

  // coupling y = row centre
  const coupY = rowY

  return (
    <g>
      {/* direction arrow */}
      {dir === 'left' && <DirectionArrow x={LOCO_X} y={rowY} dir="left" />}

      {/* couplings between adjacent pieces */}
      {items.map((item, i) => {
        if (i === 0 || item.kind === 'dots' || items[i - 1].kind === 'dots') return null
        const prev = items[i - 1]
        const prevRight = prev.kind === 'loco' ? prev.x + LOCO_W : prev.x + CAR_W
        return <Coupling key={`coup-${i}`} x1={prevRight} x2={item.x} y={coupY} />
      })}

      {/* render pieces */}
      {items.map((item, i) => {
        if (item.kind === 'loco') {
          return <Locomotive key={`loco-${i}`} x={item.x} y={topY} dir={dir} />
        }
        if (item.kind === 'dots') {
          return <Ellipsis key={`dots-${i}`} cx={item.x + 6} cy={rowY} />
        }
        // car
        const carNum = Number(item.label)
        const isHighlighted = highlightCar !== undefined && carNum === highlightCar
        return (
          <TrainCar
            key={`car-${item.label}-${i}`}
            x={item.x}
            y={topY}
            label={item.label!}
            fill={isHighlighted ? highlightFill : COLOR.BODY}
            stroke={isHighlighted ? highlightStroke : COLOR.BODY_STROKE}
          />
        )
      })}

      {/* direction arrow for right-facing train */}
      {dir === 'right' && (
        <DirectionArrow
          x={locoX + LOCO_W}
          y={rowY}
          dir="right"
        />
      )}
    </g>
  )
}

// ── Vertical connector line (shows alignment between two cars) ────────────────

export function AlignmentLine({
  x,
  y1,
  y2,
  color = COLOR.HIGHLIGHT_A,
  dashed = false,
}: {
  x: number
  y1: number
  y2: number
  color?: string
  dashed?: boolean
}) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dashed ? '4 3' : undefined}
      strokeLinecap="round"
    />
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Trains18PEIllustration
 *
 * Static problem-only figure for IKMC-20-PE-Q18.
 * Shows two identical trains traveling in opposite directions (cars 1–5 visible,
 * with "…" implying more). Does NOT show which cars are currently aligned —
 * that is revealed in the explainer.
 */
export default function Trains18PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua kereta identik berjalan ke arah berlawanan. ' +
        'Kereta atas mengarah ke kiri, kereta bawah mengarah ke kanan. ' +
        'Tiap kereta memiliki 31 gerbong. Gerbong 1 sampai 5 ditampilkan.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Train A — top, traveling LEFT (← direction) */}
        <TrainRow dir="left" rowY={TRAIN_A_Y} />

        {/* Train B — bottom, traveling RIGHT (→ direction) */}
        <TrainRow dir="right" rowY={TRAIN_B_Y} />
      </svg>
    </div>
  )
}
