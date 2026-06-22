// FruitEq24ECIllustration.tsx
// IKMC-22-EC-Q24 — Joanna's numbered cards and fruit equations.
//
// Problem: 4 cards numbered 1–4. Each back has one unique fruit.
// fruit + fruit = fruit  (two equations shown in the paper figure).
// Equation 1: strawberry + watermelon = grapes  (050.jpg)
// Equation 2: grapes + strawberry = tomato      (051.jpg)
// Question: watermelon + tomato = ?             (052.jpg)
//
// This illustration shows ONLY the problem — numbered cards face-up (1-4)
// and the two fruit equations — NOT the answer or the value assignments.
//
// Adapted from FruitSubtraction20Illustration: re-uses the StrawberryGlyph
// and adds WatermelonGlyph / GrapesGlyph / TomatoGlyph in the same style.
// A shared <SymbolEquation> primitive renders one fruit-equation row.

// ── Colour tokens ─────────────────────────────────────────────────────────────
const INK = '#1F2937'
const CARD_BG = '#FFFFFF'
const CARD_STROKE = '#6B7280'
const CARD_NUM_COLOR = '#1D4ED8'  // qupu blue
const EQ_BG = '#F9FAFB'
const EQ_STROKE = '#D1D5DB'

// ── Fruit glyphs (centred at cx, cy) ──────────────────────────────────────────

/** Red strawberry with seeds and green leaf. */
export function StrawberryGlyph({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  const s = r / 16  // scale factor
  return (
    <g transform={`translate(${cx},${cy - r * 0.1})`} aria-hidden="true">
      <path
        d={`M 0 ${-r * 0.5} C ${r * 0.56} ${-r * 0.69} ${r * 0.91} ${-r * 0.25} ${r * 0.84} ${r * 0.19}
            C ${r * 0.78} ${r * 0.63} ${r * 0.31} ${r} 0 ${r * 1.16}
            C ${-r * 0.31} ${r} ${-r * 0.78} ${r * 0.63} ${-r * 0.84} ${r * 0.19}
            C ${-r * 0.91} ${-r * 0.25} ${-r * 0.56} ${-r * 0.69} 0 ${-r * 0.5} Z`}
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth={1.4 * s}
        strokeLinejoin="round"
      />
      <circle cx={-r * 0.38} cy={r * 0.06} r={1.2 * s * (r / 4)} fill="#FFFFFF" />
      <circle cx={r * 0.34} cy={r * 0.13} r={1.2 * s * (r / 4)} fill="#FFFFFF" />
      <circle cx={-r * 0.06} cy={r * 0.44} r={1.2 * s * (r / 4)} fill="#FFFFFF" />
      <circle cx={-r * 0.44} cy={r * 0.47} r={1.2 * s * (r / 4)} fill="#FFFFFF" />
      <circle cx={r * 0.41} cy={r * 0.5} r={1.2 * s * (r / 4)} fill="#FFFFFF" />
      <path
        d={`M ${-r * 0.5} ${-r * 0.56} L ${-r * 0.19} ${-r * 0.78} L 0 ${-r * 0.53}
            L ${r * 0.19} ${-r * 0.78} L ${r * 0.5} ${-r * 0.56}
            L ${r * 0.19} ${-r * 0.39} L 0 ${-r * 0.47} L ${-r * 0.19} ${-r * 0.39} Z`}
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth={1 * s}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Green watermelon slice. */
export function WatermelonGlyph({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  // A half-circle (slice) with rind + green flesh and seeds
  const halfW = r * 1.1
  const halfH = r * 0.9
  return (
    <g transform={`translate(${cx},${cy})`} aria-hidden="true">
      {/* rind (outer) */}
      <path
        d={`M ${-halfW} 0 A ${halfW} ${halfH} 0 0 1 ${halfW} 0 Z`}
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth={1.5}
      />
      {/* flesh (slightly smaller) */}
      <path
        d={`M ${-halfW * 0.82} ${-halfH * 0.08} A ${halfW * 0.82} ${halfH * 0.82} 0 0 1 ${halfW * 0.82} ${-halfH * 0.08} Z`}
        fill="#F87171"
      />
      {/* seeds */}
      {[[-0.4, -0.3], [0, -0.45], [0.4, -0.3], [-0.2, -0.6], [0.2, -0.6]].map(([dx, dy], i) => (
        <ellipse
          key={i}
          cx={halfW * dx}
          cy={halfH * dy}
          rx={1.8}
          ry={2.8}
          fill="#1F2937"
          transform={`rotate(${dx * 20},${halfW * dx},${halfH * dy})`}
        />
      ))}
      {/* flat base line */}
      <line x1={-halfW} y1={0} x2={halfW} y2={0} stroke="#15803D" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** Purple/blue grapes cluster. */
export function GrapesGlyph({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  const g = r * 0.52
  const positions = [
    [0, -r * 0.7],         // top
    [-r * 0.5, -r * 0.28], // upper-left
    [r * 0.5, -r * 0.28],  // upper-right
    [-r * 0.52, r * 0.18], // mid-left
    [r * 0.52, r * 0.18],  // mid-right
    [-r * 0.26, r * 0.62], // lower-left
    [r * 0.26, r * 0.62],  // lower-right
    [0, r],                // bottom
  ] as [number, number][]
  return (
    <g transform={`translate(${cx},${cy})`} aria-hidden="true">
      {/* stem */}
      <line x1={0} y1={-r * 1.1} x2={0} y2={-r * 0.8} stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
      {/* leaf hint */}
      <path
        d={`M 0 ${-r * 1.1} Q ${r * 0.45} ${-r * 1.3} ${r * 0.3} ${-r * 0.9}`}
        fill="none"
        stroke="#16A34A"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* grape balls */}
      {positions.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={g} fill="#7C3AED" stroke="#5B21B6" strokeWidth={0.8} />
      ))}
    </g>
  )
}

/** Red tomato. */
export function TomatoGlyph({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  return (
    <g transform={`translate(${cx},${cy})`} aria-hidden="true">
      {/* stem */}
      <line x1={0} y1={-r} x2={0} y2={-r * 1.25} stroke="#15803D" strokeWidth={2} strokeLinecap="round" />
      {/* leaves */}
      <path
        d={`M 0 ${-r} Q ${-r * 0.5} ${-r * 1.3} ${-r * 0.4} ${-r * 0.8}`}
        fill="none"
        stroke="#16A34A"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d={`M 0 ${-r} Q ${r * 0.5} ${-r * 1.3} ${r * 0.4} ${-r * 0.8}`}
        fill="none"
        stroke="#16A34A"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* body */}
      <circle cx={0} cy={r * 0.1} r={r * 0.95} fill="#EF4444" stroke="#B91C1C" strokeWidth={1.5} />
      {/* highlight */}
      <circle cx={-r * 0.3} cy={-r * 0.25} r={r * 0.18} fill="rgba(255,255,255,0.45)" />
    </g>
  )
}

// ── Shared primitive: one equation row  A + B = C ─────────────────────────────

type FruitId = 'strawberry' | 'watermelon' | 'grapes' | 'tomato' | 'question'

function FruitIcon({ id, cx, cy, r = 18 }: { id: FruitId; cx: number; cy: number; r?: number }) {
  if (id === 'strawberry') return <StrawberryGlyph cx={cx} cy={cy} r={r} />
  if (id === 'watermelon') return <WatermelonGlyph cx={cx} cy={cy} r={r} />
  if (id === 'grapes')     return <GrapesGlyph cx={cx} cy={cy} r={r} />
  if (id === 'tomato')     return <TomatoGlyph cx={cx} cy={cy} r={r} />
  // question mark
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={r * 1.5} fontWeight={900} fill={CARD_NUM_COLOR}>
      ?
    </text>
  )
}

/**
 * Draws one fruit equation row: [fruitA] + [fruitB] = [fruitC]
 * centred at (cx, cy) in the given SVG.
 * Re-exported so the explainer can embed the same rows in its animation.
 */
export interface EquationRowProps {
  left: FruitId
  right: FruitId
  result: FruitId
  /** SVG y-centre of the row. */
  cy: number
  /** Half-width of the row area; default 130. */
  hw?: number
  /** Highlight colour for the equation box border; undefined = default grey. */
  highlightColor?: string
  /** Fruit icon radius; default 18. */
  r?: number
}

export const EQ_VIEW_W = 280
export const EQ_ROW_H = 56

export function EquationRow({ left, right, result, cy, hw = 130, highlightColor, r = 18 }: EquationRowProps) {
  const cx = EQ_VIEW_W / 2
  const leftX  = cx - hw * 0.62
  const plusX  = cx - hw * 0.25
  const rightX = cx
  const eqX    = cx + hw * 0.25
  const resX   = cx + hw * 0.62
  const boxColor = highlightColor ?? EQ_STROKE
  return (
    <g>
      {/* rounded pill background */}
      <rect
        x={cx - hw}
        y={cy - EQ_ROW_H / 2}
        width={hw * 2}
        height={EQ_ROW_H}
        rx={12}
        ry={12}
        fill={EQ_BG}
        stroke={boxColor}
        strokeWidth={1.6}
      />
      {/* left fruit */}
      <FruitIcon id={left} cx={leftX} cy={cy} r={r} />
      {/* + */}
      <text x={plusX} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>+</text>
      {/* right fruit */}
      <FruitIcon id={right} cx={rightX} cy={cy} r={r} />
      {/* = */}
      <text x={eqX} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>=</text>
      {/* result fruit */}
      <FruitIcon id={result} cx={resX} cy={cy} r={r} />
    </g>
  )
}

// ── Numbered card primitive ────────────────────────────────────────────────────

export function NumberedCard({ x, y, w = 44, h = 56, num }: { x: number; y: number; w?: number; h?: number; num: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} ry={6} fill={CARD_BG} stroke={CARD_STROKE} strokeWidth={1.8} />
      {/* top-left small number */}
      <text x={x + 6} y={y + 13} textAnchor="start" fontSize={10} fontWeight={700} fill={CARD_NUM_COLOR}>{num}</text>
      {/* bottom-right small number (rotated 180°, convention) */}
      <text
        x={x + w - 6}
        y={y + h - 8}
        textAnchor="end"
        fontSize={10}
        fontWeight={700}
        fill={CARD_NUM_COLOR}
        transform={`rotate(180,${x + w - 6},${y + h - 8})`}
      >
        {num}
      </text>
      {/* centre big number */}
      <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={CARD_NUM_COLOR}>
        {num}
      </text>
    </g>
  )
}

// ── Main illustration ──────────────────────────────────────────────────────────

const VIEW_W = EQ_VIEW_W
const VIEW_H = 260

/**
 * FruitEq24ECIllustration
 *
 * Static, problem-only figure for IKMC-22-EC-Q24.
 * Shows: four numbered face-up cards (1–4) and two fruit equations.
 * Does NOT reveal the value assignments or the answer (6).
 */
export default function FruitEq24ECIllustration() {
  // card strip centred at top
  const cardW = 44
  const cardH = 56
  const cardGap = 10
  const totalCardsW = 4 * cardW + 3 * cardGap
  const cardsLeft = (VIEW_W - totalCardsW) / 2
  const cardY = 14

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Four numbered cards face-up: 1, 2, 3, 4. ' +
        'Each card has a different fruit on the back. ' +
        'Equation 1: strawberry plus watermelon equals grapes. ' +
        'Equation 2: grapes plus strawberry equals tomato.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(320, VIEW_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

        {/* section label */}
        <text x={VIEW_W / 2} y={12} textAnchor="middle" fontSize={9} fontWeight={700} fill="#6B7280" letterSpacing={0.5}>
          CARDS
        </text>

        {/* numbered cards */}
        {[1, 2, 3, 4].map((n, i) => (
          <NumberedCard
            key={n}
            x={cardsLeft + i * (cardW + cardGap)}
            y={cardY + 4}
            w={cardW}
            h={cardH}
            num={n}
          />
        ))}

        {/* divider */}
        <line x1={20} y1={90} x2={VIEW_W - 20} y2={90} stroke={EQ_STROKE} strokeWidth={1} />

        {/* equation label */}
        <text x={VIEW_W / 2} y={105} textAnchor="middle" fontSize={9} fontWeight={700} fill="#6B7280" letterSpacing={0.5}>
          EQUATIONS
        </text>

        {/* Equation 1: strawberry + watermelon = grapes */}
        <EquationRow left="strawberry" right="watermelon" result="grapes" cy={140} />

        {/* Equation 2: grapes + strawberry = tomato */}
        <EquationRow left="grapes" right="strawberry" result="tomato" cy={210} />
      </svg>
    </div>
  )
}
