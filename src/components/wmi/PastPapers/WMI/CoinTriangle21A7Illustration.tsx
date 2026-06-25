// SEAMO-21-A-Q7 — Coins forming a triangle.
//
// Wattaria places coins along the 3 sides of a triangle, such that there are
// 6 coins on each side of the triangle. How many coins are there in total?
// Answer: A (15).
//
// The stem figure shows a triangle of coins with 6 per side (corners shared).
// Answer is NOT shown here — the figure shows only the problem arrangement:
// the triangle outline with all 15 coins in place (to let pupils see the setup).
//
// Reconstruction of 2021.imgs/013.jpg context: equilateral triangle, 6 coins
// per side, each corner coin shared by 2 sides. 3×6 − 3 = 15 coins total.
//
// SSR-safe: pure render, no Math.random, no Date, no hooks.

import { Coin } from './primitives/glyphs'

// ── Layout constants (shared with explainer) ──────────────────────────────────

/** Number of coins along each side (including the two corner coins). */
export const COINS_PER_SIDE = 6

/** SVG coordinate space. */
export const SVG_W = 260
export const SVG_H = 240

/** Coin radius in SVG units. */
export const COIN_R = 18

/** Gap between coin centres along each side. */
export const SPACING = 38

// ── Compute triangle coin centres ─────────────────────────────────────────────

/**
 * Returns the 15 coin positions for an equilateral triangle with 6 coins per
 * side. Corner indices: 0 = bottom-left, 1 = bottom-right, 2 = top.
 *
 * We compute each side as a lerp between two corner vertices and deduplicate
 * the three corner positions so we end up with exactly 15 unique coins.
 */
export function coinPositions(): { cx: number; cy: number; role: 'corner' | 'edge' }[] {
  const side = (COINS_PER_SIDE - 1) * SPACING   // 5 × 38 = 190
  const h = (side * Math.sqrt(3)) / 2            // height ≈ 164.4

  const cxC = SVG_W / 2
  const baseY = SVG_H / 2 + h / 2 + 4           // bottom edge
  const topY = baseY - h                          // apex

  const v0 = { x: cxC - side / 2, y: baseY }    // bottom-left corner
  const v1 = { x: cxC + side / 2, y: baseY }    // bottom-right corner
  const v2 = { x: cxC,            y: topY  }     // top corner

  const interiorPoints = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    steps: number,
  ) => {
    const pts: { cx: number; cy: number }[] = []
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      pts.push({ cx: from.x + t * (to.x - from.x), cy: from.y + t * (to.y - from.y) })
    }
    return pts
  }

  const steps = COINS_PER_SIDE - 1

  const corners = [
    { cx: v0.x, cy: v0.y },
    { cx: v1.x, cy: v1.y },
    { cx: v2.x, cy: v2.y },
  ]

  const bottomEdge = interiorPoints(v0, v1, steps)
  const rightEdge  = interiorPoints(v1, v2, steps)
  const leftEdge   = interiorPoints(v2, v0, steps)

  return [
    ...corners.map((p) => ({ ...p, role: 'corner' as const })),
    ...bottomEdge.map((p) => ({ ...p, role: 'edge' as const })),
    ...rightEdge.map((p) => ({ ...p, role: 'edge' as const })),
    ...leftEdge.map((p) => ({ ...p, role: 'edge' as const })),
  ]
}

// ── Shared figure primitive ───────────────────────────────────────────────────

export interface CoinTriangle21A7FigureProps {
  /** Highlight mode for corners (used in explainer). */
  cornerHighlight?: boolean
  /** Override the default coin colour for corners. */
  cornerColor?: string
  /** Override the default coin colour for edge coins. */
  edgeColor?: string
}

/**
 * CoinTriangle21A7Figure — shared primitive for illustration + explainer.
 *
 * Renders a root `<svg>` containing 15 gold coins arranged in an equilateral
 * triangle (6 coins per side, 3 shared corners). Corners and edge coins can
 * be coloured independently for the step-by-step explainer.
 */
export function CoinTriangle21A7Figure({
  cornerHighlight = false,
  cornerColor = '#F59E0B',
  edgeColor = '#F59E0B',
}: CoinTriangle21A7FigureProps) {
  const coins = coinPositions()

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {coins.map((coin, i) => {
        const isCorner = coin.role === 'corner'
        const color = isCorner ? cornerColor : edgeColor
        const r = isCorner && cornerHighlight ? COIN_R + 2 : COIN_R
        return (
          <g key={i}>
            {isCorner && cornerHighlight && (
              <circle
                cx={coin.cx}
                cy={coin.cy}
                r={r + 5}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2.5}
                opacity={0.6}
              />
            )}
            <Coin cx={coin.cx} cy={coin.cy} r={r} color={color} />
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

/**
 * CoinTriangle21A7Illustration
 *
 * Shows the triangle of 15 coins (6 per side). Does NOT reveal the answer.
 * Faithful to SEAMO 2021 Paper A Q7: all coins gold, equilateral triangle.
 */
export default function CoinTriangle21A7Illustration({ params }: { params?: unknown }) {
  void params // fully determined by the question

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Segitiga yang terbentuk dari koin emas. Terdapat 6 koin di setiap sisi, ' +
        'dengan koin sudut yang digunakan bersama oleh dua sisi. ' +
        'Berapa total koin yang digunakan?'
      }
    >
      <CoinTriangle21A7Figure />
    </div>
  )
}
