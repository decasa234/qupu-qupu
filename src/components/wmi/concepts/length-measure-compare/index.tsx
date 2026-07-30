import type { ReactNode } from 'react'

interface LengthItem {
  name: string
  start: number
  length: number
}

interface LengthParams {
  medium: 'ruler' | 'offset-ruler' | 'unit-chain'
  unitLabel: 'cm' | 'petak'
  ask: 'measure-one' | 'longest' | 'difference'
  rulerMax: number
  items: LengthItem[]
  focusA: number
  focusB: number
}

// The offset ruler is the signature case, so it is also the safe fallback.
const SAMPLE: LengthParams = {
  medium: 'offset-ruler',
  unitLabel: 'cm',
  ask: 'measure-one',
  rulerMax: 12,
  items: [{ name: 'pita', start: 3, length: 8 }],
  focusA: 0,
  focusB: 0,
}

const BLUE = '#30598A'
const CREAM = '#FAF6EF'
const SQUARE_FILL = '#E9F0F8' // pale blue so each petak reads against the card
const OBJECT_COLORS = ['#F0853A', '#58A700', '#E0A000'] // orange, green, yellow
const CHOICE_LABELS = ['A', 'B', 'C']

/** Pixels per whole unit. */
export const U = 22
/** Object bar height. */
export const BAR_H = 18

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ---------------------------------------------------------------------------
// geometry — the ONE copy of this board's coordinate maths.
//
// Exported because the post-answer explainer draws the same board and must land
// on the same pixels; it imports this instead of replaying the numbers. Change
// a pad, a gutter or a row height here and both pictures move together.
// ---------------------------------------------------------------------------

export interface LengthGeometryInput {
  medium: LengthParams['medium']
  ask: LengthParams['ask']
  /** Biggest number printed on the ruler (ignored by unit chains). */
  rulerMax: number
  items: LengthItem[]
}

export interface LengthGeometryRow {
  name: string
  /** top of the row box */
  top: number
  /** y of the object bar (ruler rows sit 4px below the row top; chain rows sit on it) */
  barY: number
  /** left / right edge of the object bar */
  x0: number
  x1: number
  /** chain only: y of the unit-square strip */
  stripY: number
  start: number
  end: number
  length: number
}

export interface LengthGeometry {
  kind: 'ruler' | 'chain'
  width: number
  height: number
  padL: number
  padR: number
  topPad: number
  rowH: number
  rowGap: number
  /** ruler only (0 on chains) */
  rulerTop: number
  rulerH: number
  /** ruler: the printed maximum. chain: the longest chain, used for the canvas. */
  rulerMax: number
  single: boolean
  showLetters: boolean
  rows: LengthGeometryRow[]
}

export function lengthFigureGeometry(p: LengthGeometryInput): LengthGeometry {
  const single = p.items.length === 1
  const gutter = single ? 0 : 78 // room for the name (and A./B./C.) beside each row
  const padL = 22 + gutter
  const padR = 22
  const showLetters = p.ask === 'longest'

  if (p.medium === 'unit-chain') {
    const widest = p.items.reduce((m, it) => Math.max(m, it.length), 1)
    const topPad = single ? 24 : 12
    const rowH = 54
    const rowGap = 12
    return {
      kind: 'chain',
      width: padL + widest * U + padR,
      height: topPad + p.items.length * rowH + (p.items.length - 1) * rowGap + 8,
      padL,
      padR,
      topPad,
      rowH,
      rowGap,
      rulerTop: 0,
      rulerH: 0,
      rulerMax: widest,
      single,
      showLetters,
      rows: p.items.map((it, i) => {
        const top = topPad + i * (rowH + rowGap)
        return {
          name: it.name,
          top,
          barY: top,
          x0: padL,
          x1: padL + it.length * U,
          stripY: top + 26,
          start: 0,
          end: it.length,
          length: it.length,
        }
      }),
    }
  }

  const topPad = single ? 26 : 12
  const rowH = 26
  const rowGap = 10
  const objectsH = p.items.length * rowH + (p.items.length - 1) * rowGap
  const rulerTop = topPad + objectsH + 14
  const rulerH = 46
  return {
    kind: 'ruler',
    width: padL + p.rulerMax * U + padR,
    height: rulerTop + rulerH + 8,
    padL,
    padR,
    topPad,
    rowH,
    rowGap,
    rulerTop,
    rulerH,
    rulerMax: p.rulerMax,
    single,
    showLetters,
    rows: p.items.map((it, i) => {
      const top = topPad + i * (rowH + rowGap)
      return {
        name: it.name,
        top,
        barY: top + 4,
        x0: padL + it.start * U,
        x1: padL + (it.start + it.length) * U,
        stripY: 0,
        start: it.start,
        end: it.start + it.length,
        length: it.length,
      }
    }),
  }
}

/** x of ruler value `v`. */
export function xAt(geometry: Pick<LengthGeometry, 'padL'>, v: number): number {
  return geometry.padL + v * U
}

function coerce(params: unknown): LengthParams {
  const p = (params ?? {}) as Partial<LengthParams>
  const items =
    Array.isArray(p.items) &&
    p.items.length > 0 &&
    p.items.every(
      (it) =>
        it && typeof it.name === 'string' && typeof it.start === 'number' && typeof it.length === 'number',
    )
      ? (p.items.slice(0, 3) as LengthItem[])
      : SAMPLE.items
  const medium =
    p.medium === 'ruler' || p.medium === 'offset-ruler' || p.medium === 'unit-chain'
      ? p.medium
      : SAMPLE.medium
  // Rulers are always cm; unit chains are always unit squares (petak). Nothing
  // else is drawable, so derive it rather than trusting the incoming value.
  const unitLabel: LengthParams['unitLabel'] = medium === 'unit-chain' ? 'petak' : 'cm'
  const ask =
    p.ask === 'measure-one' || p.ask === 'longest' || p.ask === 'difference' ? p.ask : SAMPLE.ask
  const widest = items.reduce((m, it) => Math.max(m, it.start + it.length), 1)
  const rulerMax =
    typeof p.rulerMax === 'number' && p.rulerMax >= widest ? Math.round(p.rulerMax) : widest
  return { medium, unitLabel, ask, rulerMax, items, focusA: 0, focusB: 0 }
}

/**
 * The measured object drawn as a bar spanning exactly [x, x + w] so its two ends
 * line up with the ruler ticks. Each object kind gets a small drawn cue — no
 * emoji, no images, everything is plain SVG.
 */
function ObjectBar({
  kind,
  x,
  y,
  w,
  color,
}: {
  kind: string
  x: number
  y: number
  w: number
  color: string
}): ReactNode {
  const h = BAR_H
  if (kind === 'pensil' || kind === 'krayon') {
    const tip = Math.min(kind === 'pensil' ? 11 : 7, w * 0.28)
    return (
      <g>
        <rect x={x} y={y} width={w - tip} height={h} rx={3} fill={color} />
        <polygon
          points={`${x + w - tip},${y} ${x + w},${y + h / 2} ${x + w - tip},${y + h}`}
          fill={color}
        />
        <rect x={x + w - tip - 8} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
      </g>
    )
  }
  if (kind === 'pita') {
    const notch = Math.min(8, w * 0.2)
    return (
      <path
        d={`M ${x} ${y} H ${x + w} L ${x + w - notch} ${y + h / 2} L ${x + w} ${y + h} H ${x} Z`}
        fill={color}
      />
    )
  }
  if (kind === 'sedotan') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={3} fill={color} />
        <rect x={x + w * 0.34} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
        <rect x={x + w * 0.62} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
      </g>
    )
  }
  if (kind === 'tali') {
    return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
  }
  // ranting — a stick with two bark marks
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={color} />
      <line
        x1={x + w * 0.3}
        y1={y + 4}
        x2={x + w * 0.3 + 5}
        y2={y + h - 4}
        stroke={CREAM}
        strokeWidth={2}
        opacity={0.8}
      />
      <line
        x1={x + w * 0.62}
        y1={y + 4}
        x2={x + w * 0.62 + 5}
        y2={y + h - 4}
        stroke={CREAM}
        strokeWidth={2}
        opacity={0.8}
      />
    </g>
  )
}

/**
 * `count` unit squares (petak satuan) laid end to end along the object: one
 * unbroken strip whose neighbours share an edge, with a divider drawn on every
 * shared edge so each square is separately countable. Deliberately unnumbered —
 * counting the tiles is the exercise.
 */
function UnitSquareStrip({ count, x, y }: { count: number; x: number; y: number }): ReactNode {
  const squares: ReactNode[] = []
  for (let j = 0; j < count; j++) {
    // Exactly U wide and U tall, butted against its neighbour: consecutive
    // squares share an edge, and each square's own stroke draws that edge.
    squares.push(
      <rect
        key={j}
        x={x + j * U}
        y={y}
        width={U}
        height={U}
        fill={SQUARE_FILL}
        stroke={BLUE}
        strokeWidth={1.5}
        shapeRendering="crispEdges"
      />,
    )
  }
  return (
    <g>
      {squares}
      {/* outline the whole strip so its two ends line up with the object's ends */}
      <rect
        x={x}
        y={y}
        width={count * U}
        height={U}
        fill="none"
        stroke={BLUE}
        strokeWidth={2.4}
        shapeRendering="crispEdges"
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// aria-label
//
// Policy: describe what is pictured richly enough that a screen-reader user can
// attempt the question, but NEVER speak a value that IS the answer. So: name the
// objects and the measuring instrument, and say WHETHER an object starts at 0 —
// a legitimate observable. Never a length, never an end reading, never a
// difference, and never a hint at which object is longest.
// ---------------------------------------------------------------------------

function objectList(p: LengthParams): string {
  const showLetters = p.ask === 'longest'
  return p.items
    .map((it, i) => (showLetters ? `${CHOICE_LABELS[i]}. ${cap(it.name)}` : cap(it.name)))
    .join(', ')
}

function rulerAria(p: LengthParams): string {
  const atZero = p.items.filter((it) => it.start === 0).length
  const wherePlaced =
    p.items.length === 1
      ? atZero === 1
        ? 'Ujung kirinya tepat di angka 0'
        : 'Ujung kirinya tidak di angka 0'
      : atZero === p.items.length
        ? 'Semua ujung kirinya tepat di angka 0'
        : atZero === 0
          ? 'Tidak ada ujung kiri yang tepat di angka 0'
          : 'Sebagian ujung kirinya tidak di angka 0'
  return (
    `Penggaris bernomor dengan angka berurutan mulai dari angka 0. ` +
    `Di atasnya diletakkan ${objectList(p)}. ${wherePlaced}. ` +
    `Posisi kedua ujung tiap benda dibaca sendiri dari gambar.`
  )
}

function chainAria(p: LengthParams): string {
  return (
    `${objectList(p)} diukur memakai petak satuan berukuran sama yang disusun rapat tanpa celah. ` +
    `Deretan petak mulai tepat di ujung kiri tiap benda dan berhenti tepat di ujung kanannya. ` +
    `Banyak petaknya dihitung sendiri dari gambar.`
  )
}

/**
 * length-measure-compare — question figure.
 *
 * Draws either a numbered ruler with the object(s) lying on it (aligned at 0, or
 * offset so the child must subtract), or a strip of unit squares (petak satuan)
 * laid end to end under each object. It never shows the length as a number —
 * reading it off the picture is the whole exercise.
 *
 * Pure render from params: no random, no dates, SSR-safe. Falls back to a sample
 * so previews still render when params have the wrong shape.
 */
export default function LengthMeasureCompareIllustration({ params }: { params: unknown }) {
  const p = coerce(params)
  const g = lengthFigureGeometry(p)
  const { single, showLetters, padL } = g

  const nameFor = (i: number) => cap(p.items[i].name)
  const colorFor = (i: number) => OBJECT_COLORS[i % OBJECT_COLORS.length]

  if (g.kind === 'chain') {
    return (
      <div className="my-4 flex justify-center" role="img" aria-label={chainAria(p)}>
        <svg viewBox={`0 0 ${g.width} ${g.height}`} width={Math.min(360, g.width)} className="max-w-full">
          {g.rows.map((row, i) => {
            const color = colorFor(i)
            return (
              <g key={i}>
                {single ? (
                  <text
                    x={(row.x0 + row.x1) / 2}
                    y={row.top - 6}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight="bold"
                    fill={color}
                  >
                    {nameFor(i)}
                  </text>
                ) : (
                  <text
                    x={padL - 12}
                    y={row.top + BAR_H - 4}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight="bold"
                    fill={color}
                  >
                    {showLetters ? `${CHOICE_LABELS[i]}. ${nameFor(i)}` : nameFor(i)}
                  </text>
                )}
                <ObjectBar kind={row.name} x={row.x0} y={row.barY} w={row.x1 - row.x0} color={color} />
                {/* the unit squares line up exactly under the object, edge to edge */}
                <UnitSquareStrip count={row.length} x={row.x0} y={row.stripY} />
                <line
                  x1={row.x0}
                  y1={row.barY + BAR_H}
                  x2={row.x0}
                  y2={row.stripY}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <line
                  x1={row.x1}
                  y1={row.barY + BAR_H}
                  x2={row.x1}
                  y2={row.stripY}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // --- ruler / offset-ruler -------------------------------------------------
  const { rulerTop, rulerH, rulerMax } = g

  // Only spotlight the two boundary numbers when there is a single object —
  // with several objects the dashed guides already do the work.
  const emphasis = single ? [g.rows[0].start, g.rows[0].end] : []

  const ticks = []
  for (let v = 0; v <= rulerMax; v++) {
    const x = xAt(g, v)
    const major = v % 5 === 0
    const hot = emphasis.includes(v)
    ticks.push(
      <g key={v}>
        <line
          x1={x}
          y1={rulerTop}
          x2={x}
          y2={rulerTop + (major || hot ? 15 : 10)}
          stroke={BLUE}
          strokeWidth={major || hot ? 2 : 1.2}
        />
        {hot && <rect x={x - 9} y={rulerTop + 18} width={18} height={16} rx={5} fill={BLUE} />}
        <text
          x={x}
          y={rulerTop + 30}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill={hot ? CREAM : BLUE}
        >
          {v}
        </text>
      </g>,
    )
  }

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={rulerAria(p)}>
      <svg viewBox={`0 0 ${g.width} ${g.height}`} width={Math.min(360, g.width)} className="max-w-full">
        {/* the ruler */}
        <rect
          x={xAt(g, 0) - 10}
          y={rulerTop}
          width={rulerMax * U + 20}
          height={rulerH}
          rx={6}
          fill={CREAM}
          stroke={BLUE}
          strokeWidth={2}
        />
        {ticks}
        <text x={xAt(g, rulerMax) + 6} y={rulerTop + rulerH - 6} textAnchor="end" fontSize={10} fill={BLUE}>
          cm
        </text>

        {/* the measured objects, sitting above the ruler */}
        {g.rows.map((row, i) => {
          const color = colorFor(i)
          return (
            <g key={i}>
              {single ? (
                <text
                  x={(row.x0 + row.x1) / 2}
                  y={row.barY - 8}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill={color}
                >
                  {nameFor(i)}
                </text>
              ) : (
                <text
                  x={padL - 12}
                  y={row.barY + BAR_H - 4}
                  textAnchor="end"
                  fontSize={12}
                  fontWeight="bold"
                  fill={color}
                >
                  {showLetters ? `${CHOICE_LABELS[i]}. ${nameFor(i)}` : nameFor(i)}
                </text>
              )}
              <ObjectBar kind={row.name} x={row.x0} y={row.barY} w={row.x1 - row.x0} color={color} />
              {/* dashed drop lines from both ends down to the ruler */}
              <line
                x1={row.x0}
                y1={row.barY + BAR_H}
                x2={row.x0}
                y2={rulerTop}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <line
                x1={row.x1}
                y1={row.barY + BAR_H}
                x2={row.x1}
                y2={rulerTop}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
