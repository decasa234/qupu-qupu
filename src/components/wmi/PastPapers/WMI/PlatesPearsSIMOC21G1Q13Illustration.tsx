// PlatesPearsSIMOC21G1Q13Illustration.tsx
// SIMOC-21-G1-Q13 stem illustration.
//
// Shows 5 plates with pears in the Fibonacci sequence (1, 1, 2, 3, 5).
// Question: How many pears on plate 6? → 3 + 5 = 8 (answer D).
//
// No existing primitive covers a pear glyph; Pear is authored here and
// exported so the explainer can reuse it. Plate is an inline ellipse.

import type { GlyphProps } from './primitives/glyphs'

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 460
export const SVG_H = 162

/** Centre X of each of the 5 visible plates (0-indexed). */
export const PLATE_CX = [52, 122, 192, 262, 332] as const

/** Y centre of the plate ellipse. */
export const PLATE_Y = 136

/** Semi-axes of the plate ellipse. */
export const PLATE_RX = 26
export const PLATE_RY = 7

/** Pear radius (SVG units; half the authored ±14 grid ≈ 16 px). */
export const PEAR_R = 16

/** Y centre of the bottom-row pear on every plate. */
export const PEAR_BASE_CY = PLATE_Y - PLATE_RY - PEAR_R - 2   // 111

/** Vertical spacing between row centres (row above = PEAR_BASE_CY − ROW_H). */
export const ROW_H = 28

/** Horizontal centre-to-centre spacing between adjacent pears. */
export const SEP = 34

/** Fibonacci pear counts for plates 1–5. */
export const PLATE_COUNTS = [1, 1, 2, 3, 5] as const

// ── Pear glyph ────────────────────────────────────────────────────────────────

/**
 * Pear — narrow-top, round-bottom green pear with stem + leaf.
 * Authored on a ±14 unit grid; position via cx/cy, scale via r.
 */
export function Pear({ cx = 0, cy = 0, r = PEAR_R, color = '#6DB33F' }: GlyphProps) {
  const s = r / 14
  const dark = '#3E7A1E'
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* lower bulge */}
      <ellipse cx={0} cy={5} rx={10} ry={11} fill={color} />
      {/* upper narrowing */}
      <ellipse cx={0} cy={-5} rx={6} ry={8} fill={color} />
      {/* blend band */}
      <ellipse cx={0} cy={0} rx={8} ry={5} fill={color} />
      {/* shadow at base */}
      <ellipse cx={0} cy={10} rx={8} ry={4} fill={dark} opacity={0.25} />
      {/* shine */}
      <ellipse
        cx={-4}
        cy={-3}
        rx={2.5}
        ry={3.2}
        fill="#FFFFFF"
        opacity={0.48}
        transform="rotate(-20 -4 -3)"
      />
      {/* stem */}
      <rect x={-1.2} y={-16} width={2.4} height={6} rx={1.2} fill="#5A3A1A" />
      {/* leaf */}
      <ellipse
        cx={4}
        cy={-14}
        rx={4.5}
        ry={2}
        fill="#4CA14E"
        transform="rotate(-28 4 -14)"
      />
    </g>
  )
}

// ── Pear layout helper ────────────────────────────────────────────────────────

/**
 * Returns [dx, dy] offsets from (plateCx, PEAR_BASE_CY) for each pear
 * in a count-sized Fibonacci plate (pyramid arrangement).
 */
export function pearOffsets(count: number): Array<[number, number]> {
  switch (count) {
    case 1:
      return [[0, 0]]
    case 2:
      return [[-SEP / 2, 0], [SEP / 2, 0]]
    case 3:
      return [[-SEP / 2, 0], [SEP / 2, 0], [0, -ROW_H]]
    case 5:
      return [
        [-SEP, 0], [0, 0], [SEP, 0],
        [-SEP / 2, -ROW_H], [SEP / 2, -ROW_H],
      ]
    default:
      return []
  }
}

// ── Plate shape ───────────────────────────────────────────────────────────────

function Plate({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* shadow */}
      <ellipse cx={cx} cy={cy + 4} rx={PLATE_RX + 2} ry={PLATE_RY * 0.55} fill="#90BDD0" opacity={0.35} />
      {/* plate body */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={PLATE_RX}
        ry={PLATE_RY}
        fill="#D6EEF7"
        stroke="#85BDD4"
        strokeWidth={1.2}
      />
      {/* rim shine */}
      <ellipse
        cx={cx}
        cy={cy - PLATE_RY * 0.3}
        rx={PLATE_RX * 0.72}
        ry={PLATE_RY * 0.3}
        fill="#FFFFFF"
        opacity={0.45}
      />
    </g>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlatesPearsSIMOC21G1Q13Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      aria-label="Five plates with pears: 1, 1, 2, 3, 5 pears following the Fibonacci pattern"
    >
      {PLATE_CX.map((cx, i) => {
        const count = PLATE_COUNTS[i]
        const offsets = pearOffsets(count)
        return (
          <g key={i}>
            {/* plate drawn first (behind pears) */}
            <Plate cx={cx} cy={PLATE_Y} />
            {/* pears on top of plate */}
            {offsets.map(([dx, dy], pi) => (
              <Pear key={pi} cx={cx + dx} cy={PEAR_BASE_CY + dy} r={PEAR_R} />
            ))}
            {/* plate number label */}
            <text
              x={cx}
              y={SVG_H - 3}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#374151"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        )
      })}

      {/* Ellipsis after plate 5 */}
      <text
        x={390}
        y={PLATE_Y - 4}
        textAnchor="middle"
        fontSize={20}
        fill="#6B7280"
        letterSpacing={3}
      >
        ...
      </text>
    </svg>
  )
}
