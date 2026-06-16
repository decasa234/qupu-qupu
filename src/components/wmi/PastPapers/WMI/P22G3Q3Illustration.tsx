// WMI-22P3A-Q3 (2022 Grade 3 Semifinal) — "which option shows a balanced scale?"
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g3-a-q3.jpg + the stem: two
// GIVEN balance facts.
//   Scale 1: 1 glass of juice  balances  5 apples.   ⇒ juice = 5 apples.
//   Scale 2: 3 apples          balance   1 bottle.   ⇒ bottle = 3 apples.
// The four answer options (originally pictures, here "(see figure)") each show a
// candidate scale; the learner picks the balanced one. Answer A, which is the
// scale where 1 juice equals 1 bottle + 2 apples (5 = 3 + 2).
//
// The static figure shows ONLY the two given facts (both level scales). It never
// shows the options nor reveals which is balanced — that derivation is the
// animator's job. Pure render, no params needed (a fixed paper figure), SSR-safe
// & deterministic (no Math.random / Date). A co-exported `ItemScale` primitive
// (glasses / apples / bottles on a balance beam) is reused by the animator.

export type ItemGlyph = 'juice' | 'apple' | 'bottle'

// ---- one-scale geometry (drawn inside a CELL_W × CELL_H box) ---------------
const CELL_W = 320
const CELL_H = 170

const BEAM_Y = 96
const BEAM_HALF = 126
const PIVOT_X = CELL_W / 2
const PAN_DROP = 20
const PAN_RX = 52
const ITEM_GAP = 4

// ---- glyphs ----------------------------------------------------------------

/** A glass of orange juice with a straw, base centred at (cx, baseY). */
function Juice({ cx, baseY }: { cx: number; baseY: number }) {
  const w = 26
  const h = 40
  const left = cx - w / 2
  const top = baseY - h
  return (
    <g>
      {/* glass body (slightly tapered) */}
      <path
        d={`M ${left + 2} ${top} L ${left + w - 2} ${top} L ${left + w - 5} ${baseY} L ${left + 5} ${baseY} Z`}
        fill="#BFE0F2"
        stroke="#30598A"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* juice fill */}
      <path
        d={`M ${left + 3.5} ${top + 12} L ${left + w - 3.5} ${top + 12} L ${left + w - 5} ${baseY - 2} L ${left + 5} ${baseY - 2} Z`}
        fill="#F6A623"
      />
      {/* straw */}
      <line x1={cx + 3} y1={top + 5} x2={cx + 12} y2={top - 14} stroke="#E05050" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

/** A red apple with a short stem, centred at (cx, cy). */
function Apple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M ${cx} ${cy - 7}
            C ${cx - 11} ${cy - 13} ${cx - 13} ${cy + 6} ${cx} ${cy + 9}
            C ${cx + 13} ${cy + 6} ${cx + 11} ${cy - 13} ${cx} ${cy - 7} Z`}
        fill="#E0533B"
        stroke="#A8341F"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <line x1={cx} y1={cy - 8} x2={cx} y2={cy - 13} stroke="#6B4A2B" strokeWidth={2} strokeLinecap="round" />
      <path d={`M ${cx} ${cy - 11} q 6 -3 9 1`} fill="#65A30D" stroke="none" />
    </g>
  )
}

/** A bottle with a cap, base centred at (cx, baseY). */
function Bottle({ cx, baseY }: { cx: number; baseY: number }) {
  const bodyW = 22
  const bodyH = 36
  const left = cx - bodyW / 2
  const top = baseY - bodyH
  const neckTop = top - 12
  return (
    <g>
      {/* body */}
      <rect x={left} y={top} width={bodyW} height={bodyH} rx={6} fill="#A6D6C0" stroke="#2C7A5B" strokeWidth={1.8} />
      {/* neck */}
      <rect x={cx - 5} y={neckTop} width={10} height={14} fill="#A6D6C0" stroke="#2C7A5B" strokeWidth={1.8} />
      {/* cap */}
      <rect x={cx - 6} y={neckTop - 6} width={12} height={7} rx={1.5} fill="#2C7A5B" />
    </g>
  )
}

function Item({ kind, cx, baseY }: { kind: ItemGlyph; cx: number; baseY: number }) {
  if (kind === 'juice') return <Juice cx={cx} baseY={baseY} />
  if (kind === 'bottle') return <Bottle cx={cx} baseY={baseY} />
  return <Apple cx={cx} cy={baseY - 9} />
}

// nominal footprint widths so a group centres nicely on a pan
const ITEM_W: Record<ItemGlyph, number> = { juice: 28, apple: 24, bottle: 24 }

/** Lay a group of items on a pan; apples pyramid (rows of up to 3), others row. */
function ItemGroup({ items, x0, baseY }: { items: ItemGlyph[]; x0: number; baseY: number }) {
  const allApples = items.length > 0 && items.every((k) => k === 'apple')
  if (allApples && items.length > 3) {
    // pyramid rows of 3 / 2 / ... bottom widest
    const rowSizes: number[] = []
    let remaining = items.length
    let width = Math.min(3, remaining)
    while (remaining > 0) {
      const take = Math.min(width, remaining)
      rowSizes.push(take)
      remaining -= take
      width = Math.max(1, take - 1)
    }
    const rowH = 19
    return (
      <g>
        {rowSizes.map((size, r) => {
          const cy = baseY - r * rowH
          const step = ITEM_W.apple + ITEM_GAP
          const totalW = size * step - ITEM_GAP
          const startX = x0 - totalW / 2 + ITEM_W.apple / 2
          return Array.from({ length: size }, (_, i) => (
            <Apple key={`${r}-${i}`} cx={startX + i * step} cy={cy - 9} />
          ))
        })}
      </g>
    )
  }
  // single centred row
  const step = (k: ItemGlyph) => ITEM_W[k] + ITEM_GAP
  const totalW = items.reduce((s, k) => s + step(k), 0) - ITEM_GAP
  let x = x0 - totalW / 2
  return (
    <g>
      {items.map((kind, i) => {
        const cx = x + ITEM_W[kind] / 2
        x += step(kind)
        return <Item key={i} kind={kind} cx={cx} baseY={baseY} />
      })}
    </g>
  )
}

export interface ItemScaleProps {
  left: ItemGlyph[]
  right: ItemGlyph[]
  /** Beam rotation in degrees about the pivot. 0 = level. */
  tilt?: number
  /** Brighten the whole scale (animator spotlight). */
  lit?: boolean
}

/**
 * One balance beam with a pan on each end, items resting on each pan.
 * The scale is drawn level when tilt = 0.
 */
export function ItemScale({ left, right, tilt = 0, lit = false }: ItemScaleProps) {
  const leftEnd = { x: PIVOT_X - BEAM_HALF, y: BEAM_Y }
  const rightEnd = { x: PIVOT_X + BEAM_HALF, y: BEAM_Y }
  const panTopY = BEAM_Y + PAN_DROP
  const beamStroke = lit ? '#f0853a' : '#C97B30'

  return (
    <svg
      viewBox={`0 0 ${CELL_W} ${CELL_H}`}
      width="100%"
      style={{ maxWidth: CELL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <g transform={`rotate(${tilt} ${PIVOT_X} ${BEAM_Y})`}>
        {/* beam */}
        <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke={beamStroke} strokeWidth={6} strokeLinecap="round" />
        <circle cx={leftEnd.x} cy={leftEnd.y} r={4} fill="#30598A" />
        <circle cx={rightEnd.x} cy={rightEnd.y} r={4} fill="#30598A" />
        {/* hangers */}
        <line x1={leftEnd.x} y1={leftEnd.y} x2={leftEnd.x} y2={panTopY} stroke="#30598A" strokeWidth={2} />
        <line x1={rightEnd.x} y1={rightEnd.y} x2={rightEnd.x} y2={panTopY} stroke="#30598A" strokeWidth={2} />
        {/* pans */}
        <path
          d={`M ${leftEnd.x - PAN_RX} ${panTopY} L ${leftEnd.x + PAN_RX} ${panTopY} L ${leftEnd.x + PAN_RX - 12} ${panTopY + 12} L ${leftEnd.x - PAN_RX + 12} ${panTopY + 12} Z`}
          fill="#FDE3C4"
          stroke="#30598A"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d={`M ${rightEnd.x - PAN_RX} ${panTopY} L ${rightEnd.x + PAN_RX} ${panTopY} L ${rightEnd.x + PAN_RX - 12} ${panTopY + 12} L ${rightEnd.x - PAN_RX + 12} ${panTopY + 12} Z`}
          fill="#FDE3C4"
          stroke="#30598A"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* contents resting on each pan */}
        <ItemGroup items={left} x0={leftEnd.x} baseY={panTopY - 2} />
        <ItemGroup items={right} x0={rightEnd.x} baseY={panTopY - 2} />
      </g>

      {/* pivot column + base (fixed, drawn last so it sits in front) */}
      <polygon
        points={`${PIVOT_X - 20},${CELL_H - 12} ${PIVOT_X + 20},${CELL_H - 12} ${PIVOT_X + 10},${BEAM_Y + 2} ${PIVOT_X - 10},${BEAM_Y + 2}`}
        fill="#E7B7A0"
        stroke="#A8341F"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={PIVOT_X} cy={BEAM_Y} r={6} fill="#FFFFFF" stroke="#A8341F" strokeWidth={2} />
      <line x1={PIVOT_X - 32} y1={CELL_H - 12} x2={PIVOT_X + 32} y2={CELL_H - 12} stroke="#A8341F" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

// ---- the two GIVEN facts ---------------------------------------------------
export const FACT1: { left: ItemGlyph[]; right: ItemGlyph[] } = {
  left: ['juice'],
  right: ['apple', 'apple', 'apple', 'apple', 'apple'],
}
export const FACT2: { left: ItemGlyph[]; right: ItemGlyph[] } = {
  left: ['apple', 'apple', 'apple'],
  right: ['bottle'],
}

const ARIA =
  'Dua timbangan seimbang yang diketahui. Timbangan pertama: 1 gelas jus seimbang dengan 5 apel. ' +
  'Timbangan kedua: 3 apel seimbang dengan 1 botol.'

/**
 * Default export: the two given balanced facts (juice = 5 apples; 3 apples =
 * bottle). It shows only what the problem states — not the answer options.
 */
export default function P22G3Q3Illustration() {
  return (
    <div className="my-4 flex flex-col items-center gap-3" role="img" aria-label={ARIA}>
      <div className="w-full" style={{ maxWidth: CELL_W }}>
        <ItemScale left={FACT1.left} right={FACT1.right} />
      </div>
      <div className="w-full" style={{ maxWidth: CELL_W }}>
        <ItemScale left={FACT2.left} right={FACT2.right} />
      </div>
    </div>
  )
}
