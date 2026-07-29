import type { ReactNode } from 'react'

type Slot = 'a' | 'b' | 'c'
type Layout = 'quartered-circle' | 'triangle' | 'chain'

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
const YELLOW = '#E0A000'
const CREAM = '#FAF6EF'
const MUTED = '#A99F92'

const SLOTS: Slot[] = ['a', 'b', 'c']

const SAMPLE: RuleFigureParams = {
  layout: 'quartered-circle',
  groups: [
    { a: 3, b: 4, c: 7 },
    { a: 5, b: 2, c: 7 },
    { a: 6, b: 3, c: 9 },
  ],
  blankPosition: 'c',
}

function isTriple(value: unknown): value is Triple {
  const t = value as Triple | null
  return (
    !!t &&
    typeof t === 'object' &&
    typeof t.a === 'number' &&
    typeof t.b === 'number' &&
    typeof t.c === 'number'
  )
}

function normalize(params: unknown): RuleFigureParams {
  const p = (params ?? {}) as Partial<RuleFigureParams>
  const layout: Layout =
    p.layout === 'triangle' || p.layout === 'chain' || p.layout === 'quartered-circle'
      ? p.layout
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

/** Five-pointed star as an SVG points string — pure maths, no randomness. */
function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const angle = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** A small diamond used as a link bead on the chain layout. */
function diamondPoints(cx: number, cy: number, r: number): string {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
}

function groupLabel(x: number, y: number, index: number, anchor: 'middle' | 'start') {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="11" fontWeight="bold" fill={MUTED}>
      {index + 1}
    </text>
  )
}

/**
 * number-figure-rule — question figure.
 *
 * Three number groups drawn in the same decorated shape. Two are complete (the
 * evidence the hidden rule is read from) and the third shows a "?" in one slot.
 * The figure never hints at the operation — that is exactly what the child has
 * to work out. Pure render from params: no random, no dates, SSR-safe, and it
 * falls back to a sample when params arrive with the wrong shape.
 */
export default function NumberFigureRuleIllustration({ params }: { params: unknown }) {
  const { layout, groups, blankPosition } = normalize(params)

  const isBlank = (groupIndex: number, slot: Slot) => groupIndex === 2 && slot === blankPosition
  const cellText = (groupIndex: number, slot: Slot, group: Triple) =>
    isBlank(groupIndex, slot) ? '?' : String(group[slot])

  // Colour of one cell: the gap is always orange, the result slot green, the
  // two given slots brand blue.
  const toneOf = (groupIndex: number, slot: Slot) =>
    isBlank(groupIndex, slot) ? ORANGE : slot === 'c' ? GREEN : BLUE

  // One number cell: an optional badge ring (dashed when it is the gap), then
  // the value. Layouts that already draw their own outline pass ring = null.
  const cell = (
    key: string,
    cx: number,
    cy: number,
    text: string,
    tone: string,
    ring: number | null,
  ): ReactNode => (
    <g key={key}>
      {ring !== null && (
        <circle
          cx={cx}
          cy={cy}
          r={ring}
          fill="#FFFFFF"
          stroke={tone}
          strokeWidth={2.5}
          strokeDasharray={tone === ORANGE ? '4 3' : undefined}
        />
      )}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="17" fontWeight="bold" fill={tone}>
        {text}
      </text>
    </g>
  )

  const ariaLayout =
    layout === 'triangle' ? 'segitiga'
    : layout === 'chain' ? 'rantai lingkaran'
    : 'lingkaran berbagi empat'
  const ariaGroups = groups
    .map((g, i) => `Gambar ${i + 1}: ${SLOTS.map((s) => cellText(i, s, g)).join(', ')}`)
    .join('. ')
  const ariaLabel = `Tiga gambar ${ariaLayout} yang memakai aturan yang sama. ${ariaGroups}. Cari angka yang hilang.`

  // --- chain: wide groups, so stack them ------------------------------------
  if (layout === 'chain') {
    const groupW = 210
    const groupH = 54
    const gapY = 12
    const padX = 14
    const padY = 8
    const labelW = 24
    const width = padX * 2 + labelW + groupW
    const height = padY * 2 + groupH * 3 + gapY * 2

    return (
      <div
        className="my-4 flex justify-center"
        role="img"
        aria-label={ariaLabel}
      >
        <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(300, width)}>
          {groups.map((g, i) => {
            const ox = padX + labelW
            const oy = padY + i * (groupH + gapY)
            const cy = oy + groupH / 2
            const cxs = [ox + 22, ox + 105, ox + 188]
            return (
              <g key={i}>
                {groupLabel(padX + 4, cy + 4, i, 'start')}
                {/* link bars with a bead in the middle */}
                {[0, 1].map((k) => {
                  const x = cxs[k] + 19
                  const w = cxs[k + 1] - 19 - x
                  return (
                    <g key={`l${k}`}>
                      <rect x={x} y={cy - 3.5} width={w} height={7} rx={3.5} fill={ORANGE} />
                      <polygon points={diamondPoints(x + w / 2, cy, 5)} fill={YELLOW} />
                    </g>
                  )
                })}
                {/* the three number bubbles */}
                {SLOTS.map((slot, k) => (
                  <g key={slot}>
                    <circle
                      cx={cxs[k]}
                      cy={cy}
                      r={19}
                      fill={isBlank(i, slot) ? '#FFFFFF' : CREAM}
                      stroke={toneOf(i, slot)}
                      strokeWidth={3}
                      strokeDasharray={isBlank(i, slot) ? '4 3' : undefined}
                    />
                    {cell(`${i}-${slot}`, cxs[k], cy, cellText(i, slot, g), toneOf(i, slot), null)}
                  </g>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // --- quartered-circle & triangle: compact groups, side by side ------------
  const groupW = 112
  const groupH = 116
  const gapX = 8
  const padX = 10
  const padY = 6
  const width = padX * 2 + groupW * 3 + gapX * 2
  const height = padY * 2 + groupH

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(340, width)}>
        {groups.map((g, i) => {
          const ox = padX + i * (groupW + gapX)
          const oy = padY
          const cx = ox + groupW / 2

          if (layout === 'triangle') {
            const apexY = oy + 24
            const baseY = oy + 100
            const left = ox + 16
            const right = ox + 96
            const midY = oy + 76
            const seats: Array<[Slot, number, number]> = [
              ['a', left, baseY],
              ['b', right, baseY],
              ['c', cx, midY],
            ]
            return (
              <g key={i}>
                {groupLabel(cx, oy + 11, i, 'middle')}
                <polygon
                  points={`${cx},${apexY} ${left},${baseY} ${right},${baseY}`}
                  fill={CREAM}
                  stroke={BLUE}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
                <polygon points={starPoints(cx, apexY, 9)} fill={YELLOW} />
                {seats.map(([slot, sx, sy]) =>
                  cell(`${i}-${slot}`, sx, sy, cellText(i, slot, g), toneOf(i, slot), 15),
                )}
              </g>
            )
          }

          // quartered-circle
          const cy = oy + 66
          const r = 40
          const d = 20
          const seats: Array<[Slot, number, number]> = [
            ['a', cx - d, cy - d],
            ['b', cx + d, cy - d],
            ['c', cx + d, cy + d],
          ]
          return (
            <g key={i}>
              {groupLabel(cx, oy + 11, i, 'middle')}
              <circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={BLUE} strokeWidth={3} />
              <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={BLUE} strokeWidth={2} />
              <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={BLUE} strokeWidth={2} />
              {/* the fourth quarter is decoration, never a number */}
              <polygon points={starPoints(cx - d, cy + d, 11)} fill={YELLOW} />
              {seats.map(([slot, sx, sy]) =>
                cell(
                  `${i}-${slot}`,
                  sx,
                  sy,
                  cellText(i, slot, g),
                  toneOf(i, slot),
                  isBlank(i, slot) ? 13 : null,
                ),
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
