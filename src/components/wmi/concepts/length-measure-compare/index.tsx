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

const U = 22 // pixels per whole unit
const BAR_H = 18

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
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
  const single = p.items.length === 1
  const gutter = single ? 0 : 78
  const padL = 22 + gutter
  const padR = 22
  const showLetters = p.ask === 'longest'

  const nameFor = (i: number) => cap(p.items[i].name)
  const colorFor = (i: number) => OBJECT_COLORS[i % OBJECT_COLORS.length]

  if (p.medium === 'unit-chain') {
    const widest = p.items.reduce((m, it) => Math.max(m, it.length), 1)
    const topPad = single ? 24 : 12
    const rowH = 54
    const rowGap = 12
    const width = padL + widest * U + padR
    const height = topPad + p.items.length * rowH + (p.items.length - 1) * rowGap + 8
    const aria = p.items.map((it) => `${cap(it.name)} sepanjang ${it.length} petak`).join(', ')

    return (
      <div
        className="my-4 flex justify-center"
        role="img"
        aria-label={`Benda diukur dengan petak satuan yang disusun rapat tanpa celah: ${aria}.`}
      >
        <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(360, width)} className="max-w-full">
          {p.items.map((it, i) => {
            const rowTop = topPad + i * (rowH + rowGap)
            const color = colorFor(i)
            const barX = padL
            const barW = it.length * U
            const stripY = rowTop + 26
            return (
              <g key={i}>
                {single ? (
                  <text
                    x={barX + barW / 2}
                    y={rowTop - 6}
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
                    y={rowTop + BAR_H - 4}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight="bold"
                    fill={color}
                  >
                    {showLetters ? `${CHOICE_LABELS[i]}. ${nameFor(i)}` : nameFor(i)}
                  </text>
                )}
                <ObjectBar kind={it.name} x={barX} y={rowTop} w={barW} color={color} />
                {/* the unit squares line up exactly under the object, edge to edge */}
                <UnitSquareStrip count={it.length} x={barX} y={stripY} />
                <line
                  x1={barX}
                  y1={rowTop + BAR_H}
                  x2={barX}
                  y2={stripY}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <line
                  x1={barX + barW}
                  y1={rowTop + BAR_H}
                  x2={barX + barW}
                  y2={stripY}
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
  const xAt = (v: number) => padL + v * U
  const topPad = single ? 26 : 12
  const rowH = 26
  const rowGap = 10
  const objectsH = p.items.length * rowH + (p.items.length - 1) * rowGap
  const rulerTop = topPad + objectsH + 14
  const rulerH = 46
  const width = padL + p.rulerMax * U + padR
  const height = rulerTop + rulerH + 8

  // Only spotlight the two boundary numbers when there is a single object —
  // with several objects the dashed guides already do the work.
  const emphasis = single ? [p.items[0].start, p.items[0].start + p.items[0].length] : []

  const ticks = []
  for (let v = 0; v <= p.rulerMax; v++) {
    const x = xAt(v)
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

  const aria = p.items
    .map((it) => `${cap(it.name)} dari angka ${it.start} sampai angka ${it.start + it.length}`)
    .join(', ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Penggaris dari 0 sampai ${p.rulerMax} cm. ${aria}.`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(360, width)} className="max-w-full">
        {/* the ruler */}
        <rect
          x={xAt(0) - 10}
          y={rulerTop}
          width={p.rulerMax * U + 20}
          height={rulerH}
          rx={6}
          fill={CREAM}
          stroke={BLUE}
          strokeWidth={2}
        />
        {ticks}
        <text x={xAt(p.rulerMax) + 6} y={rulerTop + rulerH - 6} textAnchor="end" fontSize={10} fill={BLUE}>
          cm
        </text>

        {/* the measured objects, sitting above the ruler */}
        {p.items.map((it, i) => {
          const rowTop = topPad + i * (rowH + rowGap)
          const color = colorFor(i)
          const x0 = xAt(it.start)
          const x1 = xAt(it.start + it.length)
          const barY = rowTop + 4
          return (
            <g key={i}>
              {single ? (
                <text
                  x={(x0 + x1) / 2}
                  y={barY - 8}
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
                  y={barY + BAR_H - 4}
                  textAnchor="end"
                  fontSize={12}
                  fontWeight="bold"
                  fill={color}
                >
                  {showLetters ? `${CHOICE_LABELS[i]}. ${nameFor(i)}` : nameFor(i)}
                </text>
              )}
              <ObjectBar kind={it.name} x={x0} y={barY} w={x1 - x0} color={color} />
              {/* dashed drop lines from both ends down to the ruler */}
              <line
                x1={x0}
                y1={barY + BAR_H}
                x2={x0}
                y2={rulerTop}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <line
                x1={x1}
                y1={barY + BAR_H}
                x2={x1}
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
