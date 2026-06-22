// SEAMO-16-A-Q3 — Coins forming a triangle.
//
// Vanessa places coins to form a triangle. Each of the 3 corners has a coin;
// there are 6 coins on each side. How many coins total? Answer: D (15).
//
// The stem figure shows a triangle of coins with 6 per side (corners shared).
// Answer is NOT shown here — the figure shows only the problem arrangement:
// the triangle outline with all 15 coins in place (to let pupils see the setup).
//
// Reconstruction of 2016.imgs/004.jpg context: equilateral triangle, 6 coins
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
 * side. Corner indices: 0 = bottom-left, 5 = bottom-right, 10 = top.
 *
 * The three sides are:
 *   Bottom (left→right):  indices 0..5
 *   Right  (bottom→top):  indices 5..10
 *   Left   (top→bottom):  indices 10..14, 0  (corners shared)
 *
 * We compute each side as a lerp between two corner vertices and deduplicate
 * the three corner positions so we end up with exactly 15 unique coins.
 */
export function coinPositions(): { cx: number; cy: number; role: 'corner' | 'edge' }[] {
  // Centre the triangle in the viewBox.
  // Equilateral triangle side = (COINS_PER_SIDE − 1) × SPACING
  const side = (COINS_PER_SIDE - 1) * SPACING   // 5 × 38 = 190
  const h = (side * Math.sqrt(3)) / 2             // height ≈ 164.4

  // Three vertices (centred in SVG).
  const cx = SVG_W / 2
  const baseY = SVG_H / 2 + h / 2 + 4            // bottom edge
  const topY = baseY - h                           // apex

  const v0 = { x: cx - side / 2, y: baseY }       // bottom-left corner
  const v1 = { x: cx + side / 2, y: baseY }       // bottom-right corner
  const v2 = { x: cx,            y: topY  }        // top corner

  /** Lerp between two vertices and produce n-2 interior points (excluding endpoints). */
  const interiorPoints = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    steps: number,  // = COINS_PER_SIDE - 1
  ) => {
    const pts: { cx: number; cy: number }[] = []
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      pts.push({ cx: from.x + t * (to.x - from.x), cy: from.y + t * (to.y - from.y) })
    }
    return pts
  }

  const steps = COINS_PER_SIDE - 1

  // Corners
  const corners = [
    { cx: v0.x, cy: v0.y },
    { cx: v1.x, cy: v1.y },
    { cx: v2.x, cy: v2.y },
  ]

  // Edge interiors (4 coins per side, corners excluded)
  const bottomEdge = interiorPoints(v0, v1, steps)
  const rightEdge  = interiorPoints(v1, v2, steps)
  const leftEdge   = interiorPoints(v2, v0, steps)

  const result: { cx: number; cy: number; role: 'corner' | 'edge' }[] = [
    ...corners.map((p) => ({ ...p, role: 'corner' as const })),
    ...bottomEdge.map((p) => ({ ...p, role: 'edge' as const })),
    ...rightEdge.map((p) => ({ ...p, role: 'edge' as const })),
    ...leftEdge.map((p) => ({ ...p, role: 'edge' as const })),
  ]

  return result
}

// ── Shared figure primitive ───────────────────────────────────────────────────

export interface CoinTriangleFigureProps {
  /** Highlight mode for corners (used in explainer). */
  cornerHighlight?: boolean
  /** Override the default coin colour for corners. */
  cornerColor?: string
  /** Override the default coin colour for edge coins. */
  edgeColor?: string
}

/**
 * CoinTriangle16A3Figure — shared primitive for illustration + explainer.
 *
 * Renders a root `<svg>` containing 15 gold coins arranged in an equilateral
 * triangle (6 coins per side, 3 shared corners). Corners and edge coins can
 * be coloured independently for the step-by-step explainer.
 */
export function CoinTriangle16A3Figure({
  cornerHighlight = false,
  cornerColor = '#F59E0B',
  edgeColor = '#F59E0B',
}: CoinTriangleFigureProps) {
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
            {/* corner glow ring for explainer highlighting */}
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
 * CoinTriangle16A3Illustration
 *
 * Shows the triangle of 15 coins (6 per side). Does NOT reveal the answer.
 * Faithful to SEAMO 2016 Paper A Q3: all coins gold, equilateral triangle.
 */
export default function CoinTriangle16A3Illustration({ params }: { params?: unknown }) {
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
      <CoinTriangle16A3Figure />
    </div>
  )
}
