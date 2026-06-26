// TIMO-22-P4H-Q16 — "4 identical right-angled triangles form the figure below.
// The areas of the big and the small squares are 64 and 36 respectively.
// Find the perimeter of the triangle."
//
// Classic tilted-square / Pythagorean proof figure:
//   - Outer axis-aligned square (side = a+b = √64 = 8)
//   - 4 identical right triangles filling the corners
//   - Inner tilted square (side = c = √36 = 6, the hypotenuse)
//
// PROBLEM ONLY — does NOT show the perimeter answer (14).
// Pure SVG, no hooks, no framer-motion. SSR-safe and deterministic.

// ── Layout constants (re-exported so the explainer can share coordinates) ──────

export const SVG_W = 220
export const SVG_H = 220

/** Margin around the big square. */
const M = 22

/** Pixel length of the big square's side (8 units × 22 px/unit). */
export const BIG_SIDE = 176

// Big square corners (axis-aligned)
export const TL = { x: M, y: M } as const
export const TR = { x: M + BIG_SIDE, y: M } as const
export const BR = { x: M + BIG_SIDE, y: M + BIG_SIDE } as const
export const BL = { x: M, y: M + BIG_SIDE } as const

// Inner tilted square vertex positions.
// Legs: a = 4 − √2 ≈ 2.5858 units, b = 4 + √2 ≈ 5.4142 units, a+b = 8.
// At 22 px/unit: a_px ≈ 56.9, b_px ≈ 119.1
// P1 on top edge (distance a from TL), P2 on right edge, P3 on bottom, P4 on left.
const A_PX = 56.9  // a × 22 px/unit
const B_PX = 119.1 // b × 22 px/unit

export const P1 = { x: TL.x + A_PX, y: TL.y }              // top edge
export const P2 = { x: TR.x, y: TR.y + A_PX }              // right edge
export const P3 = { x: TL.x + B_PX, y: BL.y }              // bottom edge
export const P4 = { x: TL.x, y: TL.y + B_PX }              // left edge

/** Centre of the inner tilted square (for the area label). */
export const INNER_CX = (P1.x + P2.x + P3.x + P4.x) / 4
export const INNER_CY = (P1.y + P2.y + P3.y + P4.y) / 4

// ── Colour palette ───────────────────────────────────────────────────────────

export const COLOR = {
  TRIANGLE:      '#BFDBFE',  // light blue — the 4 right triangles
  TRIANGLE_EDGE: '#3B82F6',  // blue edge
  INNER:         '#FEF9C3',  // light yellow — inner tilted square
  INNER_EDGE:    '#D97706',  // amber edge
  BIG_EDGE:      '#374151',  // dark gray — outer square
  LABEL:         '#1F2937',
  ANSWER:        '#059669',  // green — used only in explainer
} as const

// ── Shared sub-components ────────────────────────────────────────────────────

/** The four right-triangle fills in the corners. */
export function TriangleFills({ fill = COLOR.TRIANGLE }: { fill?: string }) {
  const stroke = COLOR.TRIANGLE_EDGE
  const sw = 1.5
  return (
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      {/* TL triangle — right angle at TL */}
      <polygon
        points={`${TL.x},${TL.y} ${P1.x},${P1.y} ${P4.x},${P4.y}`}
        fill={fill}
      />
      {/* TR triangle — right angle at TR */}
      <polygon
        points={`${TR.x},${TR.y} ${P1.x},${P1.y} ${P2.x},${P2.y}`}
        fill={fill}
      />
      {/* BR triangle — right angle at BR */}
      <polygon
        points={`${BR.x},${BR.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
        fill={fill}
      />
      {/* BL triangle — right angle at BL */}
      <polygon
        points={`${BL.x},${BL.y} ${P3.x},${P3.y} ${P4.x},${P4.y}`}
        fill={fill}
      />
    </g>
  )
}

/** The inner tilted square. */
export function InnerSquare({ fill = COLOR.INNER }: { fill?: string }) {
  return (
    <polygon
      points={`${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y} ${P4.x},${P4.y}`}
      fill={fill}
      stroke={COLOR.INNER_EDGE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/** The outer big square border. */
export function OuterSquare() {
  return (
    <rect
      x={TL.x}
      y={TL.y}
      width={BIG_SIDE}
      height={BIG_SIDE}
      fill="none"
      stroke={COLOR.BIG_EDGE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * TiltedSquareTIMO22P4Q16Illustration
 *
 * Static, problem-only figure for TIMO-22-P4H-Q16.
 * Shows: outer square (area 64), 4 right triangles, inner tilted square (area 36).
 * Does NOT reveal the perimeter (14).
 */
export default function TiltedSquareTIMO22P4Q16Illustration() {
  // Label positions: place area text in safe spots
  // "64" — outside the inner square, in the top-right corner region (TR triangle)
  const bigLabelX = TR.x - 22
  const bigLabelY = M + 14

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Gambar persegi besar (luas 64) yang dibentuk oleh empat segitiga siku-siku ' +
        'identik di pojok-pojoknya dan sebuah persegi kecil miring di tengah (luas 36). ' +
        'Tentukan keliling segitiga tersebut.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        overflow="visible"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* 4 right-triangle fills (draw first, beneath the inner square) */}
        <TriangleFills />

        {/* inner tilted square */}
        <InnerSquare />

        {/* outer square border (on top so it's crisp) */}
        <OuterSquare />

        {/* right-angle marks at each corner */}
        {[
          { cx: TL.x, cy: TL.y, dx: 7, dy: 7 },
          { cx: TR.x, cy: TR.y, dx: -7, dy: 7 },
          { cx: BR.x, cy: BR.y, dx: -7, dy: -7 },
          { cx: BL.x, cy: BL.y, dx: 7, dy: -7 },
        ].map(({ cx, cy, dx, dy }, i) => (
          <path
            key={i}
            d={`M ${cx + dx} ${cy} L ${cx + dx} ${cy + dy} L ${cx} ${cy + dy}`}
            fill="none"
            stroke={COLOR.BIG_EDGE}
            strokeWidth={1.2}
          />
        ))}

        {/* Area label — inner square: "Luas = 36" */}
        <text
          x={INNER_CX}
          y={INNER_CY - 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Luas = 36
        </text>

        {/* Area label — big square (placed near top edge, outside inner square) */}
        <text
          x={bigLabelX}
          y={bigLabelY}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Luas = 64
        </text>
      </svg>
    </div>
  )
}
