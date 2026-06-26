// NestedShapePatternSASMO19G2Q7Illustration.tsx
// SASMO-19-G2-Q7 — "Find the missing shape in the pattern below."
//
// Pattern (5 steps, step 5 = "?"):
//   Step 1: outer=kite,    inner=square
//   Step 2: outer=square,  inner=rhombus
//   Step 3: outer=rhombus, inner=circle
//   Step 4: outer=circle,  inner=pentagon
//   Step 5: outer=pentagon,inner=kite  ← answer D
//
// Rule: the INNER shape of step N becomes the OUTER shape of step N+1.
//
// Answer choices (all outer=pentagon):
//   A: inner=circle   B: inner=rhombus   C: inner=square   D: inner=kite (answer)
//
// Default export : NestedShapePatternSASMO19G2Q7Illustration (stem)
// Named export   : NestedShapePatternSASMO19G2Q7Option (one choice renderer)
//
// Pure SVG. SSR-safe. No hooks, no framer-motion, no window/document.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ─────────────────────────────────────────────────────────────────
const INK   = '#1F2937'
const WHITE = '#FFFFFF'
const QMARK = '#374151'
const RING  = '#F59E0B'  // amber highlight ring (explainer)

// ── shape types ─────────────────────────────────────────────────────────────
export type ShapeName = 'kite' | 'square' | 'rhombus' | 'circle' | 'pentagon'

// ── geometry ─────────────────────────────────────────────────────────────────
const CELL    = 88
const PAD     = 10
const STEM_W  = CELL * 5 + PAD * 2
const STEM_H  = CELL + PAD * 2
const CY      = PAD + CELL / 2           // vertical centre = 54

/** X-centre of item i (0-indexed, left to right). */
export function itemCx(i: number): number { return PAD + CELL * i + CELL / 2 }

/** Outer shape circumradius (fills ~82 % of cell half). */
export const OUTER_R = 33
/** Inner shape circumradius (~38 % of OUTER_R). */
export const INNER_R = 13

// ── shape geometry helpers ────────────────────────────────────────────────────

/** Kite: vertically elongated, wider above centre. */
function kitePoints(cx: number, cy: number, r: number): string {
  return [
    `${cx.toFixed(2)},${(cy - r).toFixed(2)}`,
    `${(cx + r * 0.62).toFixed(2)},${(cy - r * 0.14).toFixed(2)}`,
    `${cx.toFixed(2)},${(cy + r * 0.65).toFixed(2)}`,
    `${(cx - r * 0.62).toFixed(2)},${(cy - r * 0.14).toFixed(2)}`,
  ].join(' ')
}

/** Axis-aligned square centred at (cx, cy). Returns [x, y, w, h]. */
function squareRect(cx: number, cy: number, r: number): [number, number, number, number] {
  const s = r * 1.24
  return [cx - s / 2, cy - s / 2, s, s]
}

/** Horizontal rhombus (wider than tall). */
function rhombusPoints(cx: number, cy: number, r: number): string {
  const h = r * 0.56
  return [
    `${(cx - r).toFixed(2)},${cy.toFixed(2)}`,
    `${cx.toFixed(2)},${(cy - h).toFixed(2)}`,
    `${(cx + r).toFixed(2)},${cy.toFixed(2)}`,
    `${cx.toFixed(2)},${(cy + h).toFixed(2)}`,
  ].join(' ')
}

/** Regular pentagon — vertex at top. */
function pentagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180)
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

// ── single-shape SVG component ────────────────────────────────────────────────

interface ShapeOutlineProps {
  name: ShapeName
  cx: number
  cy: number
  r: number
  strokeWidth?: number
  fill?: string
  stroke?: string
}

/**
 * Renders one shape outline centred at (cx, cy) with circumradius r.
 * Emits only SVG primitives — safe inside an `<svg>` or `<g>`.
 */
export function ShapeOutline({
  name,
  cx,
  cy,
  r,
  strokeWidth = 2,
  fill = WHITE,
  stroke = INK,
}: ShapeOutlineProps) {
  const sw = strokeWidth
  const sj = 'round' as const
  switch (name) {
    case 'kite':
      return <polygon points={kitePoints(cx, cy, r)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin={sj} />
    case 'square': {
      const [x, y, w, h] = squareRect(cx, cy, r)
      return <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin={sj} />
    }
    case 'rhombus':
      return <polygon points={rhombusPoints(cx, cy, r)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin={sj} />
    case 'circle':
      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
    case 'pentagon':
      return <polygon points={pentagonPoints(cx, cy, r)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin={sj} />
  }
}

// ── pattern data (exported for the explainer) ─────────────────────────────────

export interface PatternStep {
  outer: ShapeName
  inner: ShapeName
}

/** The four known steps of the pattern (stem only; step 5 is "?"). */
export const PATTERN_STEPS: PatternStep[] = [
  { outer: 'kite',    inner: 'square'   },
  { outer: 'square',  inner: 'rhombus'  },
  { outer: 'rhombus', inner: 'circle'   },
  { outer: 'circle',  inner: 'pentagon' },
]

/** The correct missing step 5. */
export const ANSWER_STEP: PatternStep = { outer: 'pentagon', inner: 'kite' }

/** Inner shape for each answer choice. */
export const OPTION_INNERS: Record<'A' | 'B' | 'C' | 'D', ShapeName> = {
  A: 'circle',
  B: 'rhombus',
  C: 'square',
  D: 'kite',
}

export { RING }

// ── stem illustration (default export) ───────────────────────────────────────

/**
 * Draws 5 items in a row: items 1–4 filled from PATTERN_STEPS, item 5 = "?".
 * The stem never reveals the answer; that is the explainer's job.
 */
export default function NestedShapePatternSASMO19G2Q7Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2"
      role="img"
      aria-label="Pola lima gambar: layang-layang berisi persegi, persegi berisi wajik, wajik berisi lingkaran, lingkaran berisi segi lima, lalu tanda tanya"
    >
      <svg
        viewBox={`0 0 ${STEM_W} ${STEM_H}`}
        width="100%"
        style={{ maxWidth: STEM_W, display: 'block' }}
        aria-hidden="true"
      >
        {PATTERN_STEPS.map((step, i) => {
          const cx = itemCx(i)
          return (
            <g key={i}>
              <ShapeOutline name={step.outer} cx={cx} cy={CY} r={OUTER_R} strokeWidth={2.2} />
              <ShapeOutline name={step.inner} cx={cx} cy={CY} r={INNER_R} strokeWidth={2}   />
            </g>
          )
        })}
        {/* Item 5 — placeholder "?" */}
        <text
          x={itemCx(4)}
          y={CY + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={38}
          fontWeight="bold"
          fill={QMARK}
        >
          ?
        </text>
      </svg>
    </div>
  )
}

// ── choice renderer (named export) ────────────────────────────────────────────

const OPT_SIZE = 80
const OPT_CX   = OPT_SIZE / 2
const OPT_OUTER = 28
const OPT_INNER = 10

/**
 * Renders one A/B/C/D picture-choice as a pentagon containing its inner shape.
 * Used by CHOICE_RENDERERS['SASMO-19-G2-Q7'].
 */
export function NestedShapePatternSASMO19G2Q7Option({ choice }: { choice: WmiChoice }) {
  const label = choice.label as keyof typeof OPTION_INNERS
  const inner = OPTION_INNERS[label]
  if (!inner) return <span>{choice.text}</span>
  return (
    <svg
      viewBox={`0 0 ${OPT_SIZE} ${OPT_SIZE}`}
      width={OPT_SIZE}
      height={OPT_SIZE}
      role="img"
      aria-label={`Pilihan ${choice.label}`}
      style={{ display: 'block' }}
    >
      <ShapeOutline name="pentagon" cx={OPT_CX} cy={OPT_CX} r={OPT_OUTER} strokeWidth={1.8} />
      <ShapeOutline name={inner}    cx={OPT_CX} cy={OPT_CX} r={OPT_INNER} strokeWidth={1.6} />
    </svg>
  )
}
