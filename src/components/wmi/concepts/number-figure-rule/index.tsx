import type { ReactNode } from 'react'

type Slot = 'a' | 'b' | 'c'
type Layout = 'row' | 'pyramid'

interface Triple {
  a: number
  b: number
  c: number
}

interface RuleFigureParams {
  layout: Layout
  groups: Triple[]
  blankPosition: Slot
}

// Warm brand palette — kept as literals so the figure is fully self-contained.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const CARD = '#FDF8F1'
const CARD_EDGE = '#EADFCD'
const LINK = '#B5A896'

const SLOTS: Slot[] = ['a', 'b', 'c']

const SAMPLE: RuleFigureParams = {
  layout: 'row',
  groups: [
    { a: 3, b: 4, c: 7 },
    { a: 5, b: 2, c: 7 },
    { a: 6, b: 3, c: 9 },
  ],
  blankPosition: 'c',
}

// Layout names before the figures were simplified. Kept only so instances that
// were pooled under the old shape still draw a sensible picture.
const LEGACY_LAYOUT: Record<string, Layout> = {
  chain: 'row',
  triangle: 'pyramid',
  'quartered-circle': 'pyramid',
}

function isTriple(value: unknown): value is Triple {
  const t = value as Triple | null
  return (
    !!t &&
    typeof t === 'object' &&
    Number.isFinite(t.a) &&
    Number.isFinite(t.b) &&
    Number.isFinite(t.c)
  )
}

function normalize(params: unknown): RuleFigureParams {
  const p = (params ?? {}) as Partial<RuleFigureParams>
  const raw = p.layout as string | undefined
  const layout: Layout =
    raw === 'row' || raw === 'pyramid' ? raw
    : raw && LEGACY_LAYOUT[raw] ? LEGACY_LAYOUT[raw]
    : SAMPLE.layout
  const groups =
    Array.isArray(p.groups) && p.groups.length === 3 && p.groups.every(isTriple)
      ? (p.groups as Triple[])
      : SAMPLE.groups
  const blankPosition: Slot =
    p.blankPosition === 'a' || p.blankPosition === 'b' || p.blankPosition === 'c'
      ? p.blankPosition
      : SAMPLE.blankPosition
  return { layout, groups, blankPosition }
}

/**
 * A connector that stops short of both circles and ends in a small arrow head,
 * so "these two make that one" reads in one direction only. Pure trigonometry.
 */
function connector(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  trimStart: number,
  trimEnd: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const tipX = x2 - ux * trimEnd
  const tipY = y2 - uy * trimEnd
  const headLen = 8
  const headHalf = 4.5
  const baseX = tipX - ux * headLen
  const baseY = tipY - uy * headLen
  const f = (n: number) => n.toFixed(2)
  return {
    x1: f(x1 + ux * trimStart),
    y1: f(y1 + uy * trimStart),
    x2: f(baseX),
    y2: f(baseY),
    head: `${f(tipX)},${f(tipY)} ${f(baseX - uy * headHalf)},${f(baseY + ux * headHalf)} ${f(
      baseX + uy * headHalf,
    )},${f(baseY - ux * headHalf)}`,
  }
}

/**
 * number-figure-rule — question figure.
 *
 * The figure is the ONLY place the numbers appear, so it stays deliberately
 * plain: three number groups on their own cards, two complete (the evidence the
 * hidden rule is read from) and one showing a "?" in a single slot. Two given
 * numbers in blue, the result in green, the gap in dashed orange, and an arrow
 * that always points at the result — nothing decorative, nothing that could be
 * mistaken for a fourth number. Pure render from params: no random, no dates,
 * SSR-safe, and it falls back to a sample when params arrive malformed.
 */
export default function NumberFigureRuleIllustration({ params }: { params: unknown }) {
  const { layout, groups, blankPosition } = normalize(params)

  const isBlank = (groupIndex: number, slot: Slot) => groupIndex === 2 && slot === blankPosition
  const cellText = (groupIndex: number, slot: Slot, group: Triple) =>
    isBlank(groupIndex, slot) ? '?' : String(group[slot])
  const toneOf = (groupIndex: number, slot: Slot) =>
    isBlank(groupIndex, slot) ? ORANGE : slot === 'c' ? GREEN : BLUE

  // One number bubble: white disc, coloured ring, the value inside. The gap gets
  // a dashed ring so it reads as "something belongs here".
  const bubble = (
    key: string,
    cx: number,
    cy: number,
    r: number,
    text: string,
    tone: string,
    blank: boolean,
  ): ReactNode => (
    <g key={key}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#FFFFFF"
        stroke={tone}
        strokeWidth={3}
        strokeDasharray={blank ? '5 4' : undefined}
      />
      <text
        x={cx}
        y={cy + r * 0.36}
        textAnchor="middle"
        fontSize={r * 1.05}
        fontWeight="bold"
        fill={tone}
      >
        {text}
      </text>
    </g>
  )

  const spoken = (groupIndex: number, slot: Slot, group: Triple) =>
    isBlank(groupIndex, slot) ? 'tanda tanya' : String(group[slot])
  const ariaGroups = groups
    .map(
      (g, i) =>
        `Kelompok ${i + 1}: ${spoken(i, 'a', g)} dan ${spoken(i, 'b', g)} menjadi ${spoken(i, 'c', g)}`,
    )
    .join('. ')
  const ariaLabel = `Tiga kelompok angka yang memakai aturan yang sama. ${ariaGroups}. Satu angka diganti tanda tanya.`

  // --- row: three circles in a straight line, groups stacked ----------------
  if (layout === 'row') {
    const r = 19
    const cxA = 36
    const cxB = 86
    const cxC = 172
    const cardX = 4
    const cardW = 200
    const cardH = 62
    const pitch = cardH + 11
    const width = 208
    const height = 6 + cardH * 3 + 11 * 2 + 6

    return (
      <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
        <svg viewBox={`0 0 ${width} ${height}`} width={260}>
          {groups.map((g, i) => {
            const cardY = 6 + i * pitch
            const cy = cardY + cardH / 2
            const arrow = connector(cxB, cy, cxC, cy, r + 10, r + 9)
            return (
              <g key={i}>
                <rect
                  x={cardX}
                  y={cardY}
                  width={cardW}
                  height={cardH}
                  rx={14}
                  fill={CARD}
                  stroke={CARD_EDGE}
                  strokeWidth={2}
                />
                <line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke={LINK}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <polygon points={arrow.head} fill={LINK} />
                {SLOTS.map((slot, k) =>
                  bubble(
                    `${i}-${slot}`,
                    [cxA, cxB, cxC][k],
                    cy,
                    r,
                    cellText(i, slot, g),
                    toneOf(i, slot),
                    isBlank(i, slot),
                  ),
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // --- pyramid: two above, one below, groups side by side -------------------
  const r = 16
  const groupW = 88
  const gapX = 9
  const cyTop = 30
  const cyBot = 94
  const cardY = 4
  const cardH = 116
  const width = 4 + groupW * 3 + gapX * 2 + 4
  const height = cardY + cardH + 4

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width={288}>
        {groups.map((g, i) => {
          const ox = 4 + i * (groupW + gapX)
          const cxA = ox + 24
          const cxB = ox + 64
          const cxC = ox + 44
          const legs = [
            connector(cxA, cyTop, cxC, cyBot, r + 2, r + 3),
            connector(cxB, cyTop, cxC, cyBot, r + 2, r + 3),
          ]
          const seats: Array<[Slot, number, number]> = [
            ['a', cxA, cyTop],
            ['b', cxB, cyTop],
            ['c', cxC, cyBot],
          ]
          return (
            <g key={i}>
              <rect
                x={ox}
                y={cardY}
                width={groupW}
                height={cardH}
                rx={14}
                fill={CARD}
                stroke={CARD_EDGE}
                strokeWidth={2}
              />
              {legs.map((leg, k) => (
                <g key={`leg${k}`}>
                  <line
                    x1={leg.x1}
                    y1={leg.y1}
                    x2={leg.x2}
                    y2={leg.y2}
                    stroke={LINK}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <polygon points={leg.head} fill={LINK} />
                </g>
              ))}
              {seats.map(([slot, sx, sy]) =>
                bubble(
                  `${i}-${slot}`,
                  sx,
                  sy,
                  r,
                  cellText(i, slot, g),
                  toneOf(i, slot),
                  isBlank(i, slot),
                ),
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
