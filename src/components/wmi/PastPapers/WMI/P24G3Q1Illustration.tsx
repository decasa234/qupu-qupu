/**
 * WMI-24P3A-Q1 (2024 Grade 3 Semifinal, Paper A) — number-line placement.
 *
 * Source figure (db/seed/wmi/figures/2024-semifinal-g3-a-q1.jpg): a horizontal
 * number line with tick marks labelled 8000 and 9000. A red dot marked "P" sits
 * between them, a little to the LEFT of the midpoint (i.e. just past 8500,
 * closer to the middle than to either end).
 *
 * A 4-digit number P is made from the digits {8, 8, 5, 0}. Which choice is P?
 *   A 5088   B 8085   C 8850   D 8580   → answer D.
 *
 * The static figure shows ONLY the problem: the marked line and P's position.
 * It never reveals which choice is correct.
 *
 * Co-exports `NumberLineP` so the explainer can re-draw the same line and slide
 * a candidate value along it.
 *
 * Pure render — no Math.random, no Date, no window/document at module load.
 * SSR-safe + deterministic.
 */

// ── colour tokens ────────────────────────────────────────────────────────────
const AXIS = '#2B2118' // dark line + ticks
const DOT = '#E11D48' // red marker for P
const LABEL = '#2B2118'
const FAINT = '#94A3B8' // midpoint guide

// ── geometry ─────────────────────────────────────────────────────────────────
const VW = 460
const VH = 150
const AXIS_Y = 78
const LEFT_X = 60 // x of the "8000" tick
const RIGHT_X = 400 // x of the "9000" tick
const MID_X = (LEFT_X + RIGHT_X) / 2 // 8500 midpoint

/** P sits a little LEFT of the midpoint — fraction 0.42 of the way from 8000. */
export const P_FRACTION = 0.42
const P_X = LEFT_X + (RIGHT_X - LEFT_X) * P_FRACTION

export interface NumberLinePProps {
  /** Show the faint dashed midpoint guide at 8500. */
  showMidpoint?: boolean
  /** Optional candidate value to drop on the line at the given fraction. */
  candidate?: { value: string; fraction: number; correct?: boolean }
}

/** Pure SVG primitive: the 8000–9000 number line with P, reusable by explainers. */
export function NumberLineP({ showMidpoint = false, candidate }: NumberLinePProps) {
  const candX = candidate ? LEFT_X + (RIGHT_X - LEFT_X) * candidate.fraction : 0
  const candColor = candidate?.correct ? '#16A34A' : '#2563EB'
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 460 }}
      aria-hidden="true"
    >
      {/* faint midpoint guide */}
      {showMidpoint && (
        <g>
          <line x1={MID_X} y1={AXIS_Y - 34} x2={MID_X} y2={AXIS_Y + 10} stroke={FAINT} strokeWidth={2} strokeDasharray="4 4" />
          <text x={MID_X} y={AXIS_Y - 42} textAnchor="middle" fontSize={15} fontWeight={700} fill={FAINT}>
            8500
          </text>
        </g>
      )}

      {/* main axis with an arrowhead on the right */}
      <line x1={28} y1={AXIS_Y} x2={RIGHT_X + 36} y2={AXIS_Y} stroke={AXIS} strokeWidth={3.2} strokeLinecap="round" />
      <polygon
        points={`${RIGHT_X + 50},${AXIS_Y} ${RIGHT_X + 36},${AXIS_Y - 7} ${RIGHT_X + 36},${AXIS_Y + 7}`}
        fill={AXIS}
      />

      {/* the two labelled ticks */}
      {[
        { x: LEFT_X, label: '8000' },
        { x: RIGHT_X, label: '9000' },
      ].map((t) => (
        <g key={t.label}>
          <line x1={t.x} y1={AXIS_Y - 14} x2={t.x} y2={AXIS_Y + 14} stroke={AXIS} strokeWidth={3.2} strokeLinecap="round" />
          <text x={t.x} y={AXIS_Y + 38} textAnchor="middle" fontSize={20} fontWeight={800} fill={LABEL}>
            {t.label}
          </text>
        </g>
      ))}

      {/* P marker: red dot + label above */}
      <text x={P_X} y={AXIS_Y - 22} textAnchor="middle" fontSize={22} fontWeight={800} fontStyle="italic" fill={DOT}>
        P
      </text>
      <circle cx={P_X} cy={AXIS_Y} r={6.5} fill={DOT} />

      {/* optional candidate value dropped on the line */}
      {candidate && (
        <g>
          <line x1={candX} y1={AXIS_Y} x2={candX} y2={AXIS_Y + 26} stroke={candColor} strokeWidth={2.4} strokeDasharray="3 3" />
          <circle cx={candX} cy={AXIS_Y + 26} r={5} fill={candColor} />
          <rect x={candX - 30} y={AXIS_Y + 36} width={60} height={24} rx={6} fill={candColor} />
          <text x={candX} y={AXIS_Y + 48} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill="#FFFFFF">
            {candidate.value}
          </text>
        </g>
      )}
    </svg>
  )
}

// ── default export ───────────────────────────────────────────────────────────

export default function P24G3Q1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Garis bilangan dengan tanda 8000 dan 9000. Sebuah titik merah P berada di antara keduanya, sedikit di kiri titik tengah (dekat 8500)."
    >
      <NumberLineP />
    </div>
  )
}
