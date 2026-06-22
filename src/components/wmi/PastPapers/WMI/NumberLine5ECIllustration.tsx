// IKMC-22-EC-Q5 — static stem illustration for the Kengu number-line question.
//
// Problem: Kengu always makes ONE large jump (+2) followed by TWO small jumps (+1 each)
// on the number line, as shown in the picture. Kengu starts at 0 and ends on 16.
// How many jumps does Kengu make? → Answer E (12).
//
// This illustration shows ONLY the problem (one example cycle 0→2→3→4) with a
// kangaroo silhouette above the large arc — exactly as printed in the paper.
// It does NOT reveal the answer (4 cycles, 12 jumps).
//
// Quantities bound to seed breakdown.quantities:
//   largeJump = 2 (big arc spans 2 units)
//   smallJump = 1 (each small arc spans 1 unit)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ──

/** Total SVG width. */
export const SVG_W = 360

/** Total SVG height. */
export const SVG_H = 130

/** Y-coordinate of the number line baseline. */
export const LINE_Y = 90

/** X of the 0 tick. */
export const X0 = 30

/** Pixels per unit on the number line. */
export const PX_PER_UNIT = 52

/** Colour tokens. */
export const COLOR = {
  INK: '#1F2937',
  ARC: '#374151',
  KANGAROO: '#4B5563',
  LABEL: '#1F2937',
} as const

// ── Helper: x-position for a given value on the number line ────────────────────

export function xAt(value: number): number {
  return X0 + value * PX_PER_UNIT
}

// ── Arc primitive (quadratic bezier) ─────────────────────────────────────────

/**
 * A jump arc from `fromVal` to `toVal` on the number line.
 * `height` controls how tall the arc is (in SVG units above LINE_Y).
 */
export function JumpArc({
  fromVal,
  toVal,
  height,
  color,
  strokeWidth = 2.2,
}: {
  fromVal: number
  toVal: number
  height: number
  color: string
  strokeWidth?: number
}) {
  const x1 = xAt(fromVal)
  const x2 = xAt(toVal)
  const midX = (x1 + x2) / 2
  const cy = LINE_Y - height
  const d = `M ${x1} ${LINE_Y} Q ${midX} ${cy} ${x2} ${LINE_Y}`

  // Arrowhead at landing (x2, LINE_Y)
  const ang = Math.atan2(LINE_Y - cy, x2 - midX)
  const ax = x2 - 7 * Math.cos(ang)
  const ay = LINE_Y - 7 * Math.sin(ang)

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {/* arrowhead tip pointing to x2, LINE_Y */}
      <polygon
        points={`${x2},${LINE_Y} ${ax - 4 * Math.sin(ang)},${ay + 4 * Math.cos(ang)} ${ax + 4 * Math.sin(ang)},${ay - 4 * Math.cos(ang)}`}
        fill={color}
      />
    </g>
  )
}

// ── Kangaroo silhouette (simple geometric — no codepoints) ───────────────────

/**
 * Minimal kangaroo shape: body oval + head circle + ear nub + tail curve.
 * Centred at (cx, cy). Inspired by the original paper figure.
 */
export function KangarooFigure({ cx, cy }: { cx: number; cy: number }) {
  const c = COLOR.KANGAROO
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={cy} rx={10} ry={7} fill={c} />
      {/* head */}
      <circle cx={cx + 8} cy={cy - 9} r={5} fill={c} />
      {/* ear */}
      <ellipse cx={cx + 10} cy={cy - 14} rx={2} ry={3.5} fill={c} />
      {/* tail curving left */}
      <path
        d={`M ${cx - 10} ${cy + 4} Q ${cx - 18} ${cy + 12} ${cx - 12} ${cy + 15}`}
        fill="none"
        stroke={c}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* front legs */}
      <line x1={cx + 5} y1={cy + 5} x2={cx + 5} y2={cy + 13} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + 1} y1={cy + 5} x2={cx - 1} y2={cy + 13} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// ── Number line primitive ─────────────────────────────────────────────────────

/**
 * Draws the number line baseline with ticks and labels from 0 to maxVal.
 */
export function NumberLineBase({ maxVal, extraTicks = 2 }: { maxVal: number; extraTicks?: number }) {
  const totalMax = maxVal + extraTicks
  const endX = xAt(totalMax) + 20
  const c = COLOR.INK

  const ticks: number[] = []
  for (let i = 0; i <= totalMax; i++) ticks.push(i)

  return (
    <g>
      {/* baseline */}
      <line x1={X0 - 10} y1={LINE_Y} x2={endX} y2={LINE_Y} stroke={c} strokeWidth={2.2} />
      {/* arrowhead */}
      <polygon points={`${endX},${LINE_Y - 5} ${endX + 10},${LINE_Y} ${endX},${LINE_Y + 5}`} fill={c} />

      {/* ticks + labels */}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={xAt(v)} y1={LINE_Y - 5} x2={xAt(v)} y2={LINE_Y + 5} stroke={c} strokeWidth={2} />
          <text
            x={xAt(v)}
            y={LINE_Y + 18}
            textAnchor="middle"
            fontSize={12}
            fontWeight={800}
            fill={c}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {v}
          </text>
        </g>
      ))}
    </g>
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

/**
 * NumberLine5ECIllustration
 *
 * Static, problem-only figure for IKMC-22-EC-Q5.
 * Shows: number line 0‥6+, one example cycle (large arc 0→2, small arcs 2→3, 3→4),
 * kangaroo silhouette above the large arc, as in the printed paper.
 * Does NOT reveal that 4 cycles are needed or that the answer is 12.
 */
export default function NumberLine5ECIllustration() {
  const largeArcH = 48  // height of the large (+2) arc
  const smallArcH = 22  // height of the small (+1) arcs

  // Kangaroo sits above the large arc apex
  const kangX = xAt(1)  // midpoint of 0→2
  const kangY = LINE_Y - largeArcH - 20

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Garis bilangan dari 0. Kengu melompat: satu lompatan besar dari 0 ke 2, ' +
        'lalu dua lompatan kecil dari 2 ke 3 dan dari 3 ke 4.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* number line: show 0..6 with 2 extra ticks */}
        <NumberLineBase maxVal={4} extraTicks={2} />

        {/* large arc: 0 → 2 */}
        <JumpArc fromVal={0} toVal={2} height={largeArcH} color={COLOR.ARC} />

        {/* small arc 1: 2 → 3 */}
        <JumpArc fromVal={2} toVal={3} height={smallArcH} color={COLOR.ARC} />

        {/* small arc 2: 3 → 4 */}
        <JumpArc fromVal={3} toVal={4} height={smallArcH} color={COLOR.ARC} />

        {/* kangaroo silhouette above the large arc */}
        <KangarooFigure cx={kangX} cy={kangY} />
      </svg>
    </div>
  )
}
