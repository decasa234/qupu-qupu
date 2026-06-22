/**
 * SEAMO-16-A-Q12 — Stem illustration
 * "How many ways are there to put 20 oranges into 3 baskets so that each
 * basket has an even number of oranges?"
 *
 * Shown: three identical open weave-picnic baskets labelled 1, 2, 3.
 * Each has a question-mark count and a small orange glyph above it,
 * representing the unknown even counts that must sum to 20.
 * The answer (9 ways) is NOT revealed here.
 *
 * Reuses BasketGlyph (type 3 = wide weave picnic) from Baskets10PEIllustration.
 * Orange glyph drawn inline (no dedicated primitive exists for oranges).
 *
 * Co-exports: OrangeGlyph (used by the explainer).
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

import React from 'react'
import {
  BasketGlyph,
} from './Baskets10PEIllustration'

// Re-export the shared glyph so the explainer can import it from this module.
export { BasketGlyph } from './Baskets10PEIllustration'

// ── Layout ────────────────────────────────────────────────────────────────────

export const SVG_W = 320
export const SVG_H = 190

/** Centre X of each basket. */
export const BASKET_CX = [60, 160, 260] as const
export const BASELINE_Y = 155

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const C = {
  ORANGE_FILL:  '#F97316', // orange-500
  ORANGE_DARK:  '#C2410C', // orange-700
  ORANGE_SHINE: '#FED7AA', // orange-200
  LEAF:         '#16A34A', // green-600
  LABEL_DARK:   '#1F2937', // gray-900
  LABEL_BLUE:   '#1D4ED8', // blue-700
  TOTAL_BG:     '#FEF9C3', // yellow-100
  TOTAL_TEXT:   '#92400E', // amber-900
} as const

// ── OrangeGlyph ───────────────────────────────────────────────────────────────

export interface OrangeGlyphProps {
  cx: number
  cy: number
  /** Half-size radius. @default 14 */
  r?: number
  /** Optional fill override. */
  color?: string
}

/**
 * A simple round orange fruit with a tiny stem and two-leaf sprig.
 * Emits a `<g>` — place inside a parent `<svg>`.
 */
export function OrangeGlyph({ cx, cy, r = 14, color = C.ORANGE_FILL }: OrangeGlyphProps) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* body */}
      <circle cx={0} cy={0} r={r} fill={color} />

      {/* shadow arc bottom-right */}
      <path
        d={`M ${-r * 0.3} ${r * 0.55} A ${r} ${r} 0 0 0 ${r * 0.55} ${-r * 0.1}`}
        fill="none"
        stroke={C.ORANGE_DARK}
        strokeWidth={r * 0.18}
        strokeLinecap="round"
        opacity={0.35}
      />

      {/* shine */}
      <ellipse
        cx={-r * 0.32}
        cy={-r * 0.32}
        rx={r * 0.22}
        ry={r * 0.14}
        fill={C.ORANGE_SHINE}
        opacity={0.7}
        transform={`rotate(-35,${-r * 0.32},${-r * 0.32})`}
      />

      {/* stem */}
      <line
        x1={0}
        y1={-r}
        x2={2}
        y2={-r - r * 0.38}
        stroke={C.ORANGE_DARK}
        strokeWidth={r * 0.18}
        strokeLinecap="round"
      />

      {/* left leaf */}
      <path
        d={`M 2 ${-r - r * 0.22} Q ${-r * 0.5} ${-r - r * 0.7} ${-r * 0.6} ${-r - r * 0.22}`}
        fill={C.LEAF}
        stroke={C.LEAF}
        strokeWidth={0.5}
      />

      {/* right leaf */}
      <path
        d={`M 2 ${-r - r * 0.22} Q ${r * 0.55} ${-r - r * 0.65} ${r * 0.6} ${-r - r * 0.22}`}
        fill={C.LEAF}
        stroke={C.LEAF}
        strokeWidth={0.5}
      />
    </g>
  )
}

// ── Default export: Stem illustration ─────────────────────────────────────────

/**
 * OrangeBaskets16A12Illustration
 *
 * Shows 3 identical open weave-picnic baskets (type 3) labelled 1, 2, 3.
 * Each has a "?" count and a small orange above it, representing the unknown
 * even distributions.  A banner reads "Total = 20 oranges".
 */
export default function OrangeBaskets16A12Illustration() {
  const ariaLabel =
    'Three picnic baskets labelled 1, 2, and 3. Each basket has a question mark above it ' +
    'and a small orange glyph, showing unknown even counts of oranges that sum to 20.'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Total constraint banner */}
        <rect
          x={SVG_W / 2 - 66}
          y={4}
          width={132}
          height={22}
          rx={11}
          fill={C.TOTAL_BG}
          stroke={C.TOTAL_TEXT}
          strokeWidth={1.5}
        />
        <text
          x={SVG_W / 2}
          y={15}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={C.TOTAL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Total = 20 oranges
        </text>

        {/* Three baskets */}
        {(BASKET_CX as readonly number[]).map((cx, i) => (
          <g key={i}>
            {/* basket body (type 3 = wide weave picnic) */}
            <BasketGlyph cx={cx} baseY={BASELINE_Y} type={3} />

            {/* orange glyph floating above basket */}
            <OrangeGlyph cx={cx} cy={BASELINE_Y - 105} r={14} />

            {/* "even" annotation */}
            <text
              x={cx}
              y={BASELINE_Y - 86}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={8}
              fontWeight={600}
              fill={C.ORANGE_DARK}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              (even)
            </text>

            {/* question-mark count */}
            <text
              x={cx}
              y={BASELINE_Y - 74}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={18}
              fontWeight={800}
              fill={C.LABEL_BLUE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              ?
            </text>

            {/* basket number label below */}
            <text
              x={cx}
              y={BASELINE_Y + 14}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={11}
              fontWeight={700}
              fill={C.LABEL_DARK}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
