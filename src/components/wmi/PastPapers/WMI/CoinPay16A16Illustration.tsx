// SEAMO-16-A-Q16 — Coins Akshta has for paying 70 ¢.
//
// A file in a bookstore costs 70 ¢.  Akshta has:
//   • 5 ten-cent coins  (10¢)
//   • 3 twenty-cent coins (20¢)
//   • 1 fifty-cent coin  (50¢)
// How many ways can she pay without receiving change?  Answer: A (5 ways).
//
// The stem figure (2016.imgs/014.jpg) shows the coins she possesses, grouped
// by denomination, so pupils can enumerate payment combinations.
//
// Layout: three horizontal rows of coins, each row labelled with the value:
//   Row 1: five 10¢ coins
//   Row 2: three 20¢ coins
//   Row 3: one  50¢ coin
//
// SSR-safe: pure render, no Math.random, no Date, no hooks.

import { Coin } from './primitives/glyphs'

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 300
const SVG_H = 220
const COIN_R = 22
const SPACING = 52        // centre-to-centre within a row
const LABEL_X = 34       // x of the denomination label
const ROW_Y = [52, 120, 188] as const   // y centres of each row

// Coin colours: slightly different tints to distinguish 10¢ / 20¢ / 50¢
const COLOR_10 = '#F59E0B'   // amber gold  — standard
const COLOR_20 = '#D97706'   // darker gold
const COLOR_50 = '#B45309'   // deep gold / copper

// ── Shared figure ─────────────────────────────────────────────────────────────

/**
 * CoinPay16A16Figure — the three rows of coins Akshta carries.
 *
 * Props let the explainer highlight individual coins or grey them out to
 * illustrate which combination is being used in each step.
 *
 * `used10` / `used20` / `used50` are the counts of each denomination
 * selected in the current combination (0 when not highlighting).
 */
export interface CoinPayFigureProps {
  /** How many of Akshta's five 10¢ coins are highlighted (used). 0–5. */
  used10?: number
  /** How many of Akshta's three 20¢ coins are highlighted (used). 0–3. */
  used20?: number
  /** Whether the 50¢ coin is highlighted (used). */
  used50?: boolean
}

/**
 * Renders the root `<svg>`.  Three rows of coins; each row has a denomination
 * label on the left.  Used coins glow; unused coins are dimmed.
 */
export function CoinPay16A16Figure({
  used10 = 0,
  used20 = 0,
  used50 = false,
}: CoinPayFigureProps) {
  // First coin x for each row: centre the group within the viewBox.
  // Row of n coins spans (n-1)*SPACING.  First coin at:  SVG_W/2 - (n-1)*SPACING/2
  const rowStart = (n: number) => SVG_W / 2 - ((n - 1) * SPACING) / 2

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Row 1: five 10¢ coins ── */}
      <text
        x={LABEL_X}
        y={ROW_Y[0]}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#92400E"
      >
        10¢
      </text>
      {Array.from({ length: 5 }, (_, i) => {
        const active = i < used10
        return (
          <g key={`t${i}`} opacity={used10 === 0 ? 1 : active ? 1 : 0.3}>
            {active && (
              <circle
                cx={rowStart(5) + i * SPACING}
                cy={ROW_Y[0]}
                r={COIN_R + 5}
                fill="none"
                stroke="#FCD34D"
                strokeWidth={2}
                opacity={0.7}
              />
            )}
            <Coin
              cx={rowStart(5) + i * SPACING}
              cy={ROW_Y[0]}
              r={COIN_R}
              color={COLOR_10}
              label="10"
            />
          </g>
        )
      })}

      {/* ── Row 2: three 20¢ coins ── */}
      <text
        x={LABEL_X}
        y={ROW_Y[1]}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#92400E"
      >
        20¢
      </text>
      {Array.from({ length: 3 }, (_, i) => {
        const active = i < used20
        return (
          <g key={`tw${i}`} opacity={used20 === 0 ? 1 : active ? 1 : 0.3}>
            {active && (
              <circle
                cx={rowStart(3) + i * SPACING}
                cy={ROW_Y[1]}
                r={COIN_R + 5}
                fill="none"
                stroke="#FCD34D"
                strokeWidth={2}
                opacity={0.7}
              />
            )}
            <Coin
              cx={rowStart(3) + i * SPACING}
              cy={ROW_Y[1]}
              r={COIN_R}
              color={COLOR_20}
              label="20"
            />
          </g>
        )
      })}

      {/* ── Row 3: one 50¢ coin ── */}
      <text
        x={LABEL_X}
        y={ROW_Y[2]}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#92400E"
      >
        50¢
      </text>
      <g opacity={!used50 || used50 ? 1 : 0.3}>
        {used50 && (
          <circle
            cx={SVG_W / 2}
            cy={ROW_Y[2]}
            r={COIN_R + 5}
            fill="none"
            stroke="#FCD34D"
            strokeWidth={2}
            opacity={0.7}
          />
        )}
        <Coin
          cx={SVG_W / 2}
          cy={ROW_Y[2]}
          r={COIN_R}
          color={COLOR_50}
          label="50"
        />
      </g>
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

/**
 * CoinPay16A16Illustration
 *
 * Shows the three groups of coins Akshta has (5×10¢, 3×20¢, 1×50¢) so pupils
 * can enumerate the 5 ways to total exactly 70¢ without receiving change.
 * Does NOT reveal the answer.
 */
export default function CoinPay16A16Illustration({ params }: { params?: unknown }) {
  void params // fully determined by the question

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Koin-koin yang dimiliki Akshta: lima koin 10 sen, tiga koin 20 sen, dan satu koin 50 sen. ' +
        'Ada berapa cara ia dapat membayar tepat 70 sen tanpa kembalian?'
      }
    >
      <CoinPay16A16Figure />
    </div>
  )
}
