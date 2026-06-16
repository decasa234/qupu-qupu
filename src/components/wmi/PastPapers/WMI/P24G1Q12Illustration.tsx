// WMI-24P1A-Q12 (2024 Semifinal Grade 1, Paper A) — scattered-digit tally.
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q12.jpg: a pink blob with
// the digits 0, 2, 3, 7, 8 strewn about at random sizes/angles. Each of the five
// digits is supposed to appear the same number of times (3×), but two appear only
// twice. Tally → 0:3, 3:3, 7:3 complete; 2:2 and 8:2 short → missing 8 and 2
// (answer C). The static figure shows ONLY the jumble (never which are missing).
//
// Counts in the figure (problem state, deliberately incomplete):
//   0 → 3,  2 → 2,  3 → 3,  7 → 3,  8 → 2   (total 13 glyphs)

const INK = '#7A2E1E' // hand-drawn brown digits
const BLOB = '#F8DCDC' // pink background blob

/** One scattered digit: value, position (in viewBox units), size, rotation. */
export interface ScatterGlyph {
  d: string // the digit character
  x: number
  y: number
  size: number
  rot: number
}

// Deterministic layout mirroring the scan. Exactly 13 glyphs with the intended
// tally — 0→3, 2→2, 3→3, 7→3, 8→2 — so 2 and 8 are each one short of 3.
// (No randomness: fixed coordinates, sizes and rotations.)
export const SCATTER_GLYPHS: ScatterGlyph[] = [
  { d: '0', x: 250, y: 110, size: 56, rot: -18 },
  { d: '2', x: 360, y: 150, size: 58, rot: 12 },
  { d: '3', x: 470, y: 130, size: 52, rot: 8 },
  { d: '7', x: 560, y: 150, size: 50, rot: 18 },
  { d: '8', x: 850, y: 130, size: 60, rot: -10 },
  { d: '8', x: 180, y: 240, size: 70, rot: 14 },
  { d: '0', x: 690, y: 230, size: 62, rot: 6 },
  { d: '3', x: 790, y: 270, size: 48, rot: 16 },
  { d: '2', x: 320, y: 320, size: 64, rot: -12 },
  { d: '7', x: 440, y: 300, size: 52, rot: 22 },
  { d: '7', x: 690, y: 360, size: 58, rot: -16 },
  { d: '3', x: 200, y: 420, size: 54, rot: 18 },
  { d: '0', x: 430, y: 440, size: 50, rot: 6 },
]

// Tally derived from SCATTER_GLYPHS (single source of truth for the explainer).
export const DIGIT_VALUES = ['0', '2', '3', '7', '8'] as const
export type DigitValue = (typeof DIGIT_VALUES)[number]
export const TALLY: Record<DigitValue, number> = DIGIT_VALUES.reduce(
  (acc, d) => ({ ...acc, [d]: SCATTER_GLYPHS.filter((g) => g.d === d).length }),
  {} as Record<DigitValue, number>,
)
export const FULL_COUNT = Math.max(...Object.values(TALLY)) // 3
export const MISSING_DIGITS = DIGIT_VALUES.filter((d) => TALLY[d] < FULL_COUNT) // ['2','8']

export const VIEW_W = 1100
export const VIEW_H = 540

/** The pink organic blob behind the digits. */
export function ScatterBlob() {
  return (
    <path
      d="M70 270 C40 150 160 60 320 50 C520 38 760 30 940 70 C1060 96 1090 200 1050 300 C1085 400 980 500 800 510 C560 524 320 520 180 480 C70 446 100 360 70 270 Z"
      fill={BLOB}
    />
  )
}

export interface ScatterFigureProps {
  /** Optionally ring the glyphs of one digit value (used by the explainer). */
  ringDigit?: string | null
  /** Optionally dim glyphs that are NOT the ringed digit. */
  focus?: boolean
}

export function ScatterFigure({ ringDigit = null, focus = false }: ScatterFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <ScatterBlob />
      {SCATTER_GLYPHS.map((g, i) => {
        const isTarget = ringDigit != null && g.d === ringDigit
        const dim = focus && ringDigit != null && !isTarget
        return (
          <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`} opacity={dim ? 0.18 : 1}>
            {isTarget && <circle cx={0} cy={-g.size * 0.32} r={g.size * 0.62} fill="none" stroke="#2f6df0" strokeWidth={5} />}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={g.size}
              fontWeight={900}
              fontFamily="ui-rounded, 'Segoe UI', system-ui, sans-serif"
              fill={INK}
            >
              {g.d}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function P24G1Q12Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A pink blob scattered with the hand-drawn digits 0, 2, 3, 7 and 8 at different sizes and angles."
    >
      <ScatterFigure />
    </div>
  )
}
