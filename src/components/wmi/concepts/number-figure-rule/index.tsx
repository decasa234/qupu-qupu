import type { ReactNode } from 'react'

export type Slot = 'a' | 'b' | 'c'
export type Layout = 'row' | 'pyramid'

export interface Triple {
  a: number
  b: number
  c: number
}

export interface RuleFigureParams {
  layout: Layout
  groups: Triple[]
  blankPosition: Slot
}

/**
 * Warm brand palette. Exported (with the geometry and glyph helpers below) so
 * the animated explainer paints the SAME picture instead of keeping its own copy
 * of these literals — a copy silently desyncs the moment the figure is redrawn.
 */
export const RULE_INK = {
  /** The two numbers you are handed. */
  given: '#30598A',
  /** The blank. */
  gap: '#F0853A',
  /** The number the rule produces. */
  result: '#58A700',
  card: '#FDF8F1',
  cardEdge: '#EADFCD',
  link: '#B5A896',
} as const

export const RULE_SLOTS: readonly Slot[] = ['a', 'b', 'c']

/** Dash pattern that marks a bubble as "something belongs here". */
export const GAP_DASH = '5 4'

/** Which ink a bubble wears: gap first, then result, then given. */
export function slotInk(slot: Slot, blank: boolean): string {
  if (blank) return RULE_INK.gap
  return slot === 'c' ? RULE_INK.result : RULE_INK.given
}

/** Where the numeral inside a bubble sits, and how big it is drawn. */
export function bubbleNumeral(cx: number, cy: number, r: number) {
  return { x: cx, y: cy + r * 0.36, fontSize: r * 1.05 }
}

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

export interface Connector {
  x1: string
  y1: string
  x2: string
  y2: string
  /** `points` for the arrow head polygon. */
  head: string
}

/**
 * A connector that stops short of both circles and ends in a small arrow head,
 * so "these two make that one" reads in one direction only. Pure trigonometry.
 */
export function connector(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  trimStart: number,
  trimEnd: number,
): Connector {
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

// ── coordinate maths ───────────────────────────────────────────────────────
// One source of truth for both drawings. The explainer reuses every number here
// and only adds a work strip of its own underneath `figureHeight`.

export interface RuleSeat {
  slot: Slot
  cx: number
  cy: number
}

export interface RuleGroupGeom {
  card: { x: number; y: number; w: number; h: number; rx: number }
  seats: RuleSeat[]
  /** Always points AT the result bubble. */
  arrows: Connector[]
}

export interface RuleGeom {
  layout: Layout
  /** Bubble radius. */
  r: number
  /** viewBox width. */
  width: number
  /** viewBox height of the figure on its own. */
  figureHeight: number
  /** On-screen width the static figure renders at. */
  drawWidth: number
  /** Exactly three groups, in reading order. */
  groups: RuleGroupGeom[]
}

const CARD_RX = 14

export function ruleGeometry(layout: Layout): RuleGeom {
  // --- row: three circles in a straight line, groups stacked ---------------
  if (layout === 'row') {
    const r = 19
    const cxs = [36, 86, 172]
    const cardX = 4
    const cardW = 200
    const cardH = 62
    const gapY = 11
    const pitch = cardH + gapY
    const width = 208
    const figureHeight = 6 + cardH * 3 + gapY * 2 + 6
    return {
      layout,
      r,
      width,
      figureHeight,
      drawWidth: 260,
      groups: [0, 1, 2].map((i) => {
        const cardY = 6 + i * pitch
        const cy = cardY + cardH / 2
        return {
          card: { x: cardX, y: cardY, w: cardW, h: cardH, rx: CARD_RX },
          seats: RULE_SLOTS.map((slot, k) => ({ slot, cx: cxs[k], cy })),
          arrows: [connector(cxs[1], cy, cxs[2], cy, r + 10, r + 9)],
        }
      }),
    }
  }

  // --- pyramid: two above, one below, groups side by side ------------------
  const r = 16
  const groupW = 88
  const gapX = 9
  const cyTop = 30
  const cyBot = 94
  const cardY = 4
  const cardH = 116
  const width = 4 + groupW * 3 + gapX * 2 + 4
  const figureHeight = cardY + cardH + 4
  return {
    layout,
    r,
    width,
    figureHeight,
    drawWidth: 288,
    groups: [0, 1, 2].map((i) => {
      const ox = 4 + i * (groupW + gapX)
      const cxA = ox + 24
      const cxB = ox + 64
      const cxC = ox + 44
      return {
        card: { x: ox, y: cardY, w: groupW, h: cardH, rx: CARD_RX },
        seats: [
          { slot: 'a' as Slot, cx: cxA, cy: cyTop },
          { slot: 'b' as Slot, cx: cxB, cy: cyTop },
          { slot: 'c' as Slot, cx: cxC, cy: cyBot },
        ],
        arrows: [
          connector(cxA, cyTop, cxC, cyBot, r + 2, r + 3),
          connector(cxB, cyTop, cxC, cyBot, r + 2, r + 3),
        ],
      }
    }),
  }
}

// ── screen-reader label ────────────────────────────────────────────────────
// The question body of this concept carries NO numbers — the figure is the only
// place they appear — so the label has to be rich enough to attempt the puzzle
// from. Policy: describe the layout and every GIVEN number (they are evidence,
// freely readable), and speak the blank as "tanda tanya", never as its value.

const LAYOUT_WORDS_ID: Record<Layout, string> = {
  row: 'Tiga kelompok angka, satu kelompok tiap baris. Tiap baris berisi tiga lingkaran berjajar mendatar, dan panah menunjuk ke lingkaran terakhir',
  pyramid:
    'Tiga kelompok angka berjajar mendatar. Tiap kelompok berbentuk segitiga: dua lingkaran di atas dan satu lingkaran di bawah, dengan dua panah menunjuk ke lingkaran bawah',
}

/**
 * Deterministic Indonesian description of the picture. The blanked slot is
 * always spoken as "tanda tanya" — its value is the answer and never appears.
 */
export function ruleFigureAriaLabel(p: RuleFigureParams): string {
  const { layout, groups, blankPosition } = p
  const spoken = (groupIndex: number, slot: Slot, group: Triple) =>
    groupIndex === 2 && slot === blankPosition ? 'tanda tanya' : String(group[slot])
  const lines = groups
    .map(
      (g, i) =>
        `Kelompok ${i + 1}: ${spoken(i, 'a', g)} dan ${spoken(i, 'b', g)} menjadi ${spoken(i, 'c', g)}`,
    )
    .join('. ')
  return `${LAYOUT_WORDS_ID[layout]}. Semua kelompok memakai aturan yang sama. ${lines}. Satu lingkaran berisi tanda tanya, itulah angka yang harus dicari.`
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
  const figure = normalize(params)
  const { groups, blankPosition } = figure
  const geom = ruleGeometry(figure.layout)

  const isBlank = (groupIndex: number, slot: Slot) => groupIndex === 2 && slot === blankPosition
  const cellText = (groupIndex: number, slot: Slot, group: Triple) =>
    isBlank(groupIndex, slot) ? '?' : String(group[slot])

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
  ): ReactNode => {
    const numeral = bubbleNumeral(cx, cy, r)
    return (
      <g key={key}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="#FFFFFF"
          stroke={tone}
          strokeWidth={3}
          strokeDasharray={blank ? GAP_DASH : undefined}
        />
        <text
          x={numeral.x}
          y={numeral.y}
          textAnchor="middle"
          fontSize={numeral.fontSize}
          fontWeight="bold"
          fill={tone}
        >
          {text}
        </text>
      </g>
    )
  }

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ruleFigureAriaLabel(figure)}>
      <svg viewBox={`0 0 ${geom.width} ${geom.figureHeight}`} width={geom.drawWidth}>
        {groups.map((g, i) => {
          const cell = geom.groups[i]
          return (
            <g key={i}>
              <rect
                x={cell.card.x}
                y={cell.card.y}
                width={cell.card.w}
                height={cell.card.h}
                rx={cell.card.rx}
                fill={RULE_INK.card}
                stroke={RULE_INK.cardEdge}
                strokeWidth={2}
              />
              {cell.arrows.map((arrow, k) => (
                <g key={`arrow${k}`}>
                  <line
                    x1={arrow.x1}
                    y1={arrow.y1}
                    x2={arrow.x2}
                    y2={arrow.y2}
                    stroke={RULE_INK.link}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <polygon points={arrow.head} fill={RULE_INK.link} />
                </g>
              ))}
              {cell.seats.map((seat) =>
                bubble(
                  `${i}-${seat.slot}`,
                  seat.cx,
                  seat.cy,
                  geom.r,
                  cellText(i, seat.slot, g),
                  slotInk(seat.slot, isBlank(i, seat.slot)),
                  isBlank(i, seat.slot),
                ),
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
