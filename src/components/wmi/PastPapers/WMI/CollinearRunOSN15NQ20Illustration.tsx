// OSN 2015 SD Nasional Q20 — "Amir menyusul Budi"
//
// Problem-only figure: three collinear points A, B, C on a horizontal line.
// AC : BC = 7 : 5, so B lies between A and C.
// Faithfully reconstructs the inline diagram in the paper (2015.imgs/008.jpg).
//
// Pure SVG — no framer-motion, no React hooks, SSR-safe (no window/document).
// Layout constants are exported so CollinearRunOSN15NQ20Explainer can reuse them.

import { MarkDot } from './primitives/NumberLine'

// ── Shared layout constants (re-exported for the Explainer) ──────────────────

/** Total SVG width. */
export const SVG_W = 300
/** Total SVG height (illustration). */
export const SVG_H = 80
/** Y-coordinate of the axis line. */
export const LINE_Y = 46

const PAD = 28
const AXIS_W = SVG_W - PAD - 42   // 230 px of usable axis
const PX_PER = AXIS_W / 7         // ~32.86 px per unit of k

/**
 * Convert a value on the 0–7 (unit-k) scale to SVG x-coordinate.
 * 0 = position of A, 7 = position of C, 2 = position of B.
 */
export function xAt(v: number): number {
  return PAD + v * PX_PER
}

/** Pre-computed dot positions (unit-k scale). */
export const X_A = xAt(0)   // 28    — A at left end
export const X_B = xAt(2)   // ~93.7 — B: AB = AC − BC = 7k − 5k = 2k from A
export const X_C = xAt(7)   // 258   — C at right end

/** Colour tokens. */
export const COL = {
  A:    '#3B82F6',  // blue   — Amir / point A
  B:    '#F97316',  // orange — Budi / point B
  C:    '#10B981',  // green  — finish / point C
  LINE: '#374151',  // axis
  INK:  '#1F2937',  // default text
} as const

const FONT = 'ui-sans-serif, system-ui, sans-serif'
const MARK_R = 5  // matches MarkDot's internal MARK_R

// ── Default export ────────────────────────────────────────────────────────────

/**
 * CollinearRunOSN15NQ20Illustration
 *
 * Static, problem-only figure for OSN 2015 SD Nasional Q20.
 * Shows three collinear points A, B, C with B between A and C (AC:BC = 7:5).
 * Does NOT reveal speeds, meeting time, or the answer (4 minutes).
 */
export default function CollinearRunOSN15NQ20Illustration() {
  const pts: Array<{ x: number; label: string; color: string }> = [
    { x: X_A, label: 'A', color: COL.A },
    { x: X_B, label: 'B', color: COL.B },
    { x: X_C, label: 'C', color: COL.C },
  ]

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga titik segaris: A di kiri, B di tengah, C di kanan — AC:BC = 7:5"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* horizontal line — plain segment, matching the paper figure */}
        <line
          x1={PAD - 8}
          y1={LINE_Y}
          x2={X_C + 8}
          y2={LINE_Y}
          stroke={COL.LINE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* three labeled dots — labels above (matching paper orientation) */}
        {pts.map(({ x, label, color }) => (
          <g key={label}>
            <MarkDot x={x} lineY={LINE_Y} color={color} />
            <text
              x={x}
              y={LINE_Y - MARK_R - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={800}
              fill={color}
              fontFamily={FONT}
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
