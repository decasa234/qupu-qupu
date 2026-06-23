// TiltedSquare17B6Illustration.tsx
//
// Stem illustration for SEAMO-2017-Paper-B Q6:
//   "The area of a square is given as Side × Side. Find the area of square ABCD
//    if the area of the shaded region (tilted inner square) is 16 cm²."
//
// Source image: docs/reference/ocr-res/seamo/contest/paper-b/2017.imgs/009.jpg
// Classification: stem-only — numeric answer choices, no picture options.
//
// Figure: outer square ABCD (A=top-left, B=top-right, C=bottom-right, D=bottom-left)
//   with a tilted inner square whose four vertices each touch the midpoint of one
//   side of ABCD. The inner square is shaded cyan/light-blue. Red tick marks on
//   each half-side show that the vertex bisects the outer side.
//
// Primitives used: none imported — bespoke SVG (tilted-square geometry not
//   covered by existing primitives).
//
// Pure SVG, SSR-safe: no hooks, no framer-motion, no Math.random, no Date.
//
// Exports:
//   TiltedSquare17B6     — shared primitive (accepts highlight props)
//   default              — static stem illustration
//   VISUALS              — record keyed 'SEAMO-17-B-Q6' for the registry

import type { JSX } from 'react'

// ── Colour palette ─────────────────────────────────────────────────────────────
const C_OUTER_STROKE  = '#111827'   // outer square border (near-black)
const C_OUTER_FILL    = '#FFFFFF'   // outer square background (white)
const C_INNER_FILL    = '#BAE6FD'   // shaded inner square (cyan-200)
const C_INNER_STROKE  = '#0C4A6E'   // inner square outline (dark blue)
const C_TICK          = '#DC2626'   // red tick marks on sides
const C_LABEL         = '#111827'   // corner labels (A B C D)
const C_BG            = '#F8FAFC'   // canvas background

// ── Dimensions ────────────────────────────────────────────────────────────────
const W = 280
const H = 280

// Outer square: padded for labels
const PAD   = 32   // padding from canvas edge so labels have room
const SIDE  = W - PAD * 2   // 216px outer square side

// Outer square corners
const OX = PAD          // left x
const OY = PAD          // top y
const OX2 = OX + SIDE   // right x
const OY2 = OY + SIDE   // bottom y

// Midpoints of outer sides (inner square vertices)
const MID   = SIDE / 2
const MX_T  = OX + MID       // mid-top x
const MY_T  = OY              // mid-top y  (top side midpoint)
const MX_R  = OX2             // mid-right x
const MY_R  = OY + MID        // mid-right y
const MX_B  = OX + MID        // mid-bottom x
const MY_B  = OY2             // mid-bottom y
const MX_L  = OX              // mid-left x
const MY_L  = OY + MID        // mid-left y

// Tick mark length (half-length on each side of the midpoint)
const TICK_H = 7   // perpendicular to the side
const TICK_W = 0   // tick runs ⊥ to the side, centred on midpoint

// ── Shared primitive ───────────────────────────────────────────────────────────

export interface TiltedSquare17B6Props {
  /** Override inner square fill (e.g. for explainer highlighting). */
  innerFill?: string
  className?: string
}

/**
 * SVG figure for SEAMO-2017-B-Q6: outer square ABCD with shaded tilted inner square.
 * The inner square's vertices lie at the midpoints of ABCD's four sides.
 */
export function TiltedSquare17B6({
  innerFill = C_INNER_FILL,
  className,
}: TiltedSquare17B6Props): JSX.Element {
  // Inner square as polygon through the four midpoints
  const innerPts = `${MX_T},${MY_T} ${MX_R},${MY_R} ${MX_B},${MY_B} ${MX_L},${MY_L}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Canvas background */}
      <rect x={0} y={0} width={W} height={H} fill={C_BG} />

      {/* ── Outer square ABCD ─────────────────────────────────────────── */}
      <rect
        x={OX}
        y={OY}
        width={SIDE}
        height={SIDE}
        fill={C_OUTER_FILL}
        stroke={C_OUTER_STROKE}
        strokeWidth={2}
      />

      {/* ── Tilted inner square (shaded) ──────────────────────────────── */}
      <polygon
        points={innerPts}
        fill={innerFill}
        stroke={C_INNER_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── Red tick marks (equal-length segments on each half-side) ────── */}
      {/* Top side: tick near top-left quarter midpoint (quarter of way from A to mid-top) */}
      {/* Each tick sits at the 1/4 point of each half-side, perpendicular to the side */}

      {/* Top side — left half, quarter point */}
      <line
        x1={OX + MID / 2}
        y1={OY - TICK_H}
        x2={OX + MID / 2}
        y2={OY + TICK_H}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Top side — right half, quarter point */}
      <line
        x1={OX + MID + MID / 2}
        y1={OY - TICK_H}
        x2={OX + MID + MID / 2}
        y2={OY + TICK_H}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Right side — top half, quarter point */}
      <line
        x1={OX2 - TICK_H}
        y1={OY + MID / 2}
        x2={OX2 + TICK_H}
        y2={OY + MID / 2}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Right side — bottom half, quarter point */}
      <line
        x1={OX2 - TICK_H}
        y1={OY + MID + MID / 2}
        x2={OX2 + TICK_H}
        y2={OY + MID + MID / 2}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Bottom side — left half, quarter point */}
      <line
        x1={OX + MID / 2}
        y1={OY2 - TICK_H}
        x2={OX + MID / 2}
        y2={OY2 + TICK_H}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Bottom side — right half, quarter point */}
      <line
        x1={OX + MID + MID / 2}
        y1={OY2 - TICK_H}
        x2={OX + MID + MID / 2}
        y2={OY2 + TICK_H}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Left side — top half, quarter point */}
      <line
        x1={OX - TICK_H}
        y1={OY + MID / 2}
        x2={OX + TICK_H}
        y2={OY + MID / 2}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Left side — bottom half, quarter point */}
      <line
        x1={OX - TICK_H}
        y1={OY + MID + MID / 2}
        x2={OX + TICK_H}
        y2={OY + MID + MID / 2}
        stroke={C_TICK}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* ── Corner labels A B C D ─────────────────────────────────────── */}
      {/* A = top-left */}
      <text
        x={OX - 14}
        y={OY - 8}
        fontSize={15}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={C_LABEL}
        textAnchor="middle"
        dominantBaseline="auto"
      >
        A
      </text>
      {/* B = top-right */}
      <text
        x={OX2 + 14}
        y={OY - 8}
        fontSize={15}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={C_LABEL}
        textAnchor="middle"
        dominantBaseline="auto"
      >
        B
      </text>
      {/* C = bottom-right */}
      <text
        x={OX2 + 14}
        y={OY2 + 18}
        fontSize={15}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={C_LABEL}
        textAnchor="middle"
        dominantBaseline="auto"
      >
        C
      </text>
      {/* D = bottom-left */}
      <text
        x={OX - 14}
        y={OY2 + 18}
        fontSize={15}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={C_LABEL}
        textAnchor="middle"
        dominantBaseline="auto"
      >
        D
      </text>
    </svg>
  )
}

// ── Default export: static stem illustration ───────────────────────────────────

/**
 * Static problem figure for SEAMO-2017-B-Q6.
 * Shows outer square ABCD with shaded tilted inner square (area = 16 cm²).
 * Does NOT reveal the answer (outer area = 32 cm²).
 */
export default function TiltedSquare17B6Illustration(): JSX.Element {
  return (
    <div
      className="mx-auto w-full max-w-[300px]"
      role="img"
      aria-label={
        'Square ABCD with a tilted inner square. ' +
        'The inner square is shaded and its four vertices lie at the ' +
        'midpoints of the sides of ABCD. ' +
        'Red tick marks show the midpoint divisions. ' +
        'The shaded area is 16 cm². Find the area of ABCD.'
      }
    >
      <TiltedSquare17B6 />
    </div>
  )
}

// ── VISUALS export ─────────────────────────────────────────────────────────────

/**
 * Registry loaders for SEAMO-2017-B-Q6.
 * Add this entry to VISUALS in registry.ts:
 *
 *   'SEAMO-17-B-Q6': {
 *     type: 'stem',
 *     illustration: () => import('./TiltedSquare17B6Illustration'),
 *   },
 */
export const VISUALS: Record<string, {
  type: 'stem'
  illustration: () => Promise<{ default: () => JSX.Element }>
}> = {
  'SEAMO-17-B-Q6': {
    type: 'stem',
    illustration: () =>
      import('./TiltedSquare17B6Illustration').then((m) => ({ default: m.default })),
  },
}
