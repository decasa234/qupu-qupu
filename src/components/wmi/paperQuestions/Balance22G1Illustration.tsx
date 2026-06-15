// WMI-22F1A-Q9 (Grade 1) — two balance scales, both LEVEL.
//
// Scale 1: LEFT = 4 bananas. RIGHT = 9 strawberries + 1 banana.
//   Balanced ⇒ 4 bananas = 9 strawberries + 1 banana
//            ⇒ 3 bananas = 9 strawberries ⇒ 1 banana = 3 strawberries.
// Scale 2: LEFT = "?" (the unknown group we must find). RIGHT = 6 strawberries.
//   Balanced ⇒ ? = 6 strawberries = 2 bananas  (answer B).
//
// This draws ONLY the problem setup; scale 2's left pan stays "?" so the answer
// is never leaked. Pure render — no random, no dates, SSR-safe. The default
// export renders the two scales using the co-exported <FruitScale> primitive,
// which the animator reuses to show the deduction.

export type FruitGlyph = 'banana' | 'strawberry' | '?'

// ---- one-scale geometry (drawn inside a CELL_W × CELL_H box) --------------
const CELL_W = 300
const CELL_H = 150

const BEAM_Y = 92 // pivot height (y of the beam's centre when level)
const BEAM_HALF = 116 // half-length of the beam
const PIVOT_X = CELL_W / 2
const PAN_DROP = 18 // how far each pan hangs below its beam end
const PAN_RX = 46 // pan half-width
const FRUIT_R = 11 // nominal fruit radius (for centring rows)
const FRUIT_GAP = 3

/** Centre x for each fruit so a row of n is centred on x0. */
function rowCenters(n: number, x0: number): number[] {
  const step = FRUIT_R * 2 + FRUIT_GAP
  const totalW = n * step - FRUIT_GAP
  const startX = x0 - totalW / 2 + FRUIT_R
  return Array.from({ length: n }, (_, i) => startX + i * step)
}

/** A simple banana glyph (yellow crescent) centred at (cx, cy). */
function Banana({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M ${cx - 9} ${cy - 7}
          Q ${cx} ${cy + 11} ${cx + 10} ${cy - 5}
          Q ${cx + 2} ${cy + 4} ${cx - 9} ${cy - 7} Z`}
      className="fill-qupu-brand-yellow stroke-qupu-brand-orange"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  )
}

/** A simple strawberry glyph (red body + green leaf) centred at (cx, cy). */
function Strawberry({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M ${cx - 7} ${cy - 4}
            Q ${cx} ${cy - 9} ${cx + 7} ${cy - 4}
            Q ${cx + 5} ${cy + 9} ${cx} ${cy + 10}
            Q ${cx - 5} ${cy + 9} ${cx - 7} ${cy - 4} Z`}
        className="fill-qupu-brand-orange stroke-qupu-brand-blue-shadow"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* leaf */}
      <path
        d={`M ${cx - 5} ${cy - 5} L ${cx} ${cy - 9} L ${cx + 5} ${cy - 5} Z`}
        className="fill-qupu-ink"
      />
    </g>
  )
}

/** One fruit (or the "?" placeholder, drawn by the caller, not here). */
function Fruit({ kind, cx, cy }: { kind: FruitGlyph; cx: number; cy: number }) {
  if (kind === 'banana') return <Banana cx={cx} cy={cy} />
  if (kind === 'strawberry') return <Strawberry cx={cx} cy={cy} />
  return null
}

/**
 * Lay out a group of fruit on top of a pan whose centre is x0.
 * Strawberries pyramid (rows of up to 4); bananas/others go in a single row.
 */
function FruitGroup({ items, x0, baseY }: { items: FruitGlyph[]; x0: number; baseY: number }) {
  const allStraw = items.length > 0 && items.every((k) => k === 'strawberry')
  if (allStraw && items.length > 4) {
    // Pyramid: bottom row widest, stacking up. Rows of 4 / 3 / 2 / 1.
    const rowSizes: number[] = []
    let remaining = items.length
    let width = Math.min(4, remaining)
    while (remaining > 0) {
      const take = Math.min(width, remaining)
      rowSizes.push(take)
      remaining -= take
      width = Math.max(1, take - 1)
    }
    const rowH = FRUIT_R * 2 - 4
    return (
      <g>
        {rowSizes.map((size, r) => {
          const cy = baseY - r * rowH
          const centers = rowCenters(size, x0)
          return centers.map((cx, i) => <Strawberry key={`${r}-${i}`} cx={cx} cy={cy} />)
        })}
      </g>
    )
  }
  // Single centred row.
  const centers = rowCenters(items.length, x0)
  return (
    <g>
      {items.map((kind, i) => (
        <Fruit key={i} kind={kind} cx={centers[i]} cy={baseY} />
      ))}
    </g>
  )
}

export interface FruitScaleProps {
  left: FruitGlyph[]
  right: FruitGlyph[]
  /** Beam rotation in degrees about the pivot. 0 = level; negative = left-down. */
  tilt?: number
}

/**
 * One balance beam with a pan on each end, fruit resting on each pan.
 * The "?" glyph renders as a soft box on its pan instead of a fruit pile.
 */
export function FruitScale({ left, right, tilt = 0 }: FruitScaleProps) {
  const leftIsUnknown = left.length === 1 && left[0] === '?'
  const rightIsUnknown = right.length === 1 && right[0] === '?'

  // Beam ends before rotation.
  const leftEnd = { x: PIVOT_X - BEAM_HALF, y: BEAM_Y }
  const rightEnd = { x: PIVOT_X + BEAM_HALF, y: BEAM_Y }

  // Pan centres hang straight down from each beam end (in the rotated frame).
  const leftPanCx = leftEnd.x
  const rightPanCx = rightEnd.x
  const panTopY = BEAM_Y + PAN_DROP

  return (
    <svg viewBox={`0 0 ${CELL_W} ${CELL_H}`} width="100%" style={{ maxWidth: CELL_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* The beam + pans rotate together about the pivot. */}
      <g transform={`rotate(${tilt} ${PIVOT_X} ${BEAM_Y})`}>
        {/* beam */}
        <line
          x1={leftEnd.x}
          y1={leftEnd.y}
          x2={rightEnd.x}
          y2={rightEnd.y}
          className="stroke-qupu-brand-orange"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* end caps */}
        <circle cx={leftEnd.x} cy={leftEnd.y} r={4} className="fill-qupu-brand-blue" />
        <circle cx={rightEnd.x} cy={rightEnd.y} r={4} className="fill-qupu-brand-blue" />

        {/* hangers */}
        <line x1={leftEnd.x} y1={leftEnd.y} x2={leftPanCx} y2={panTopY} className="stroke-qupu-brand-blue" strokeWidth={2} />
        <line x1={rightEnd.x} y1={rightEnd.y} x2={rightPanCx} y2={panTopY} className="stroke-qupu-brand-blue" strokeWidth={2} />

        {/* left pan */}
        <path
          d={`M ${leftPanCx - PAN_RX} ${panTopY} L ${leftPanCx + PAN_RX} ${panTopY} L ${leftPanCx + PAN_RX - 12} ${panTopY + 12} L ${leftPanCx - PAN_RX + 12} ${panTopY + 12} Z`}
          className="fill-qupu-peach stroke-qupu-brand-blue"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* right pan */}
        <path
          d={`M ${rightPanCx - PAN_RX} ${panTopY} L ${rightPanCx + PAN_RX} ${panTopY} L ${rightPanCx + PAN_RX - 12} ${panTopY + 12} L ${rightPanCx - PAN_RX + 12} ${panTopY + 12} Z`}
          className="fill-qupu-peach stroke-qupu-brand-blue"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* left contents */}
        {leftIsUnknown ? (
          <g>
            <rect x={leftPanCx - 17} y={panTopY - 34} width={34} height={32} rx={6} className="fill-qupu-cream stroke-qupu-brand-orange" strokeWidth={2.5} />
            <text x={leftPanCx} y={panTopY - 18} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} className="fill-qupu-brand-orange">
              ?
            </text>
          </g>
        ) : (
          <FruitGroup items={left} x0={leftPanCx} baseY={panTopY - FRUIT_R} />
        )}

        {/* right contents */}
        {rightIsUnknown ? (
          <g>
            <rect x={rightPanCx - 17} y={panTopY - 34} width={34} height={32} rx={6} className="fill-qupu-cream stroke-qupu-brand-orange" strokeWidth={2.5} />
            <text x={rightPanCx} y={panTopY - 18} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} className="fill-qupu-brand-orange">
              ?
            </text>
          </g>
        ) : (
          <FruitGroup items={right} x0={rightPanCx} baseY={panTopY - FRUIT_R} />
        )}
      </g>

      {/* pivot column + base (fixed, drawn after so it sits in front of the beam) */}
      <polygon
        points={`${PIVOT_X - 18},${CELL_H - 14} ${PIVOT_X + 18},${CELL_H - 14} ${PIVOT_X + 9},${BEAM_Y + 2} ${PIVOT_X - 9},${BEAM_Y + 2}`}
        className="fill-qupu-brand-blue stroke-qupu-brand-blue-shadow"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={PIVOT_X} cy={BEAM_Y} r={6} className="fill-qupu-cream stroke-qupu-brand-blue-shadow" strokeWidth={2} />
      <line x1={PIVOT_X - 30} y1={CELL_H - 14} x2={PIVOT_X + 30} y2={CELL_H - 14} className="stroke-qupu-brand-blue-shadow" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

// ---- default export: the two-scale problem figure -------------------------

const SCALE1: { left: FruitGlyph[]; right: FruitGlyph[] } = {
  left: ['banana', 'banana', 'banana', 'banana'],
  right: ['strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'banana'],
}
const SCALE2: { left: FruitGlyph[]; right: FruitGlyph[] } = {
  left: ['?'],
  right: ['strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry', 'strawberry'],
}

export default function Balance22G1Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label="Dua timbangan yang keduanya seimbang. Timbangan pertama: panci kiri berisi 4 pisang, panci kanan berisi 9 stroberi dan 1 pisang. Timbangan kedua: panci kiri berisi sebuah kelompok yang ditanyakan, panci kanan berisi 6 stroberi."
    >
      <div className="w-full" style={{ maxWidth: CELL_W }}>
        <FruitScale left={SCALE1.left} right={SCALE1.right} />
      </div>
      <div className="w-full" style={{ maxWidth: CELL_W }}>
        <FruitScale left={SCALE2.left} right={SCALE2.right} />
      </div>
    </div>
  )
}
