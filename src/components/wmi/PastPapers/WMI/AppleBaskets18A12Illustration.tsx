/**
 * SEAMO-18-A-Q12 — Stem illustration
 * "Basket A has 54 apples. Basket B has 18 apples. Cindy moves 6 apples at a
 * time from Basket A to Basket B. How many times must she do this so that both
 * baskets have the same number of apples?"
 *
 * Shown: two wide weave-picnic baskets labelled A (54 apples) and B (18 apples).
 * Apple glyphs are stacked in each basket to visually represent the relative
 * quantities. An arrow from A to B labelled "6 at a time" indicates the transfer.
 * The answer (3 moves) is NOT revealed here.
 *
 * Reuses BasketGlyph (type 3 = wide weave picnic) from Baskets10PEIllustration.
 * Reuses Apple from primitives/glyphs.
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

import React from 'react'
import { BasketGlyph } from './Baskets10PEIllustration'
import { Apple } from './primitives/glyphs'

// ── Layout ────────────────────────────────────────────────────────────────────

export const SVG_W = 300
export const SVG_H = 220

/** Centre X of each basket. */
export const BASKET_A_CX = 75
export const BASKET_B_CX = 225
export const BASELINE_Y = 185

// ── Colour tokens ─────────────────────────────────────────────────────────────

const C = {
  APPLE_RED:         '#E63946',
  LABEL_DARK:        '#1F2937', // gray-900
  COUNT_BG:          '#FEF9C3', // yellow-100
  COUNT_TEXT:        '#92400E', // amber-900
  ARROW_COLOR:       '#6B7280', // gray-500
  BASKET_LABEL_BG:   '#DBEAFE', // blue-100
  BASKET_LABEL_TEXT: '#1E40AF', // blue-800
} as const

// ── Apple pile — compact cluster of apple glyphs ─────────────────────────────

/**
 * Renders up to 9 apple glyphs in a 3-col grid floating above a basket,
 * with a "+N more" label when count exceeds 9.
 */
function ApplePile({ cx, baseY, count }: { cx: number; baseY: number; count: number }) {
  const VISIBLE = 9
  const shown = Math.min(count, VISIBLE)
  const overflow = count - VISIBLE

  const R = 10             // apple radius px
  const colW = R * 2 + 2  // horizontal step
  const rowH = R * 1.6    // vertical step

  // Pile bottom is just above the open basket mouth (~52 px above BASELINE_Y for type 3)
  const basketMouthY = baseY - 52
  const cols = 3
  const rows = Math.ceil(shown / cols)
  const pileH = rows * rowH
  const startY = basketMouthY - pileH - 2

  const positions: Array<{ px: number; py: number }> = []
  for (let i = 0; i < shown; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const rowCount = Math.min(cols, shown - row * cols)
    // centre each partial row
    const rowOffsetX = ((cols - rowCount) * colW) / 2
    positions.push({
      px: cx - ((cols - 1) * colW) / 2 + col * colW + rowOffsetX,
      py: startY + row * rowH,
    })
  }

  return (
    <g>
      {positions.map((p, i) => (
        <Apple key={i} cx={p.px} cy={p.py} r={R} />
      ))}
      {overflow > 0 && (
        <text
          x={cx}
          y={startY - 4}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={9}
          fontWeight={700}
          fill={C.APPLE_RED}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          +{overflow} more
        </text>
      )}
    </g>
  )
}

// ── Default export: Stem illustration ─────────────────────────────────────────

/**
 * AppleBaskets18A12Illustration
 *
 * Shows basket A (54 apples) and basket B (18 apples) with an arrow from
 * A to B labelled "6 at a time".  Count badges float above each basket.
 */
export default function AppleBaskets18A12Illustration() {
  const ariaLabel =
    'Basket A on the left with 54 apples and Basket B on the right with 18 apples. ' +
    'An arrow from Basket A to Basket B is labelled "6 at a time", showing the direction of Cindy\'s transfers.'

  // Arrow sits between the two baskets at mid-height
  const arrowY = BASELINE_Y - 90
  const arrowX1 = BASKET_A_CX + 44
  const arrowX2 = BASKET_B_CX - 44

  // Count badge Y — just above the apple piles (~top area of SVG)
  const badgeY = 8

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── Basket A ── */}
        <BasketGlyph cx={BASKET_A_CX} baseY={BASELINE_Y} type={3} />
        <ApplePile cx={BASKET_A_CX} baseY={BASELINE_Y} count={9} />

        {/* Basket A letter label below basket */}
        <rect
          x={BASKET_A_CX - 14}
          y={BASELINE_Y + 10}
          width={28}
          height={18}
          rx={9}
          fill={C.BASKET_LABEL_BG}
          stroke={C.BASKET_LABEL_TEXT}
          strokeWidth={1}
        />
        <text
          x={BASKET_A_CX}
          y={BASELINE_Y + 19}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill={C.BASKET_LABEL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          A
        </text>

        {/* Count badge A */}
        <rect
          x={BASKET_A_CX - 24}
          y={badgeY}
          width={48}
          height={18}
          rx={9}
          fill={C.COUNT_BG}
          stroke={C.COUNT_TEXT}
          strokeWidth={1.2}
        />
        <text
          x={BASKET_A_CX}
          y={badgeY + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={C.COUNT_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          54 apples
        </text>

        {/* ── Basket B ── */}
        <BasketGlyph cx={BASKET_B_CX} baseY={BASELINE_Y} type={3} />
        <ApplePile cx={BASKET_B_CX} baseY={BASELINE_Y} count={3} />

        {/* Basket B letter label below basket */}
        <rect
          x={BASKET_B_CX - 14}
          y={BASELINE_Y + 10}
          width={28}
          height={18}
          rx={9}
          fill={C.BASKET_LABEL_BG}
          stroke={C.BASKET_LABEL_TEXT}
          strokeWidth={1}
        />
        <text
          x={BASKET_B_CX}
          y={BASELINE_Y + 19}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill={C.BASKET_LABEL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          B
        </text>

        {/* Count badge B */}
        <rect
          x={BASKET_B_CX - 24}
          y={badgeY}
          width={48}
          height={18}
          rx={9}
          fill={C.COUNT_BG}
          stroke={C.COUNT_TEXT}
          strokeWidth={1.2}
        />
        <text
          x={BASKET_B_CX}
          y={badgeY + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={C.COUNT_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          18 apples
        </text>

        {/* ── Transfer arrow A to B ── */}
        <defs>
          <marker
            id="seamo18a12-arrow"
            markerWidth={8}
            markerHeight={6}
            refX={7}
            refY={3}
            orient="auto"
          >
            <path d="M 0 0 L 8 3 L 0 6 Z" fill={C.ARROW_COLOR} />
          </marker>
        </defs>
        <line
          x1={arrowX1}
          y1={arrowY}
          x2={arrowX2}
          y2={arrowY}
          stroke={C.ARROW_COLOR}
          strokeWidth={2}
          markerEnd="url(#seamo18a12-arrow)"
        />

        {/* Arrow label */}
        <rect
          x={SVG_W / 2 - 32}
          y={arrowY - 16}
          width={64}
          height={14}
          rx={7}
          fill="#F3F4F6"
          stroke={C.ARROW_COLOR}
          strokeWidth={1}
        />
        <text
          x={SVG_W / 2}
          y={arrowY - 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={600}
          fill={C.LABEL_DARK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          6 at a time
        </text>
      </svg>
    </div>
  )
}
