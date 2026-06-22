// IKMC-19-EC-Q11 — "Six strips woven into a pattern" stem figure + shared primitive.
//
// PROBLEM ONLY: shows the FRONT view of the weave — 3 cyan vertical strips over
// 3 yellow horizontal strips forming a 3×3 crossing grid in an alternating
// checkerboard pattern (cyan on top at corners + centre, yellow on top at edges).
//
// Also exports:
//   Weave6Panel      — shared primitive reused by explainer and options (adapts
//                      WeavePanel's painter algorithm to a 3×3 grid).
//   Weave11ECOption  — renders one A–E answer option as a Weave6Panel.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── Layout constants ──────────────────────────────────────────────────────────

/** SVG viewBox size (square). */
export const VB = 180

// Three vertical (cyan) strips
const V_X = [18, 78, 138] as const
const V_W = 24

// Three horizontal (yellow) strips
const H_Y = [18, 78, 138] as const
const H_H = 24

// ── Colour tokens ─────────────────────────────────────────────────────────────

const CYAN_FILL   = '#00CCDD'
const CYAN_STROKE = '#1F2937'
const YELL_FILL   = '#F5E642'
const YELL_STROKE = '#1F2937'
const STRIP_SW    = 1.5

// ── Weave6Panel ───────────────────────────────────────────────────────────────

/**
 * Crossing matrix for a 3×3 grid.
 * Index order: row-major top-to-bottom, left-to-right.
 *   [0]=TL, [1]=TM, [2]=TR,
 *   [3]=ML, [4]=MM, [5]=MR,
 *   [6]=BL, [7]=BM, [8]=BR
 * true = vertical (cyan) strip on top; false = horizontal (yellow) strip on top.
 */
export type CrossingMatrix9 = [
  boolean, boolean, boolean,
  boolean, boolean, boolean,
  boolean, boolean, boolean,
]

export interface Weave6PanelProps {
  /** 9-element crossing matrix (row-major, top-left → bottom-right). */
  crossings: CrossingMatrix9
  /** Rendered pixel width (viewBox always VB×VB). */
  width?: number
  /** Optional aria-label. */
  ariaLabel?: string
}

/**
 * Draws a 3-vertical × 3-horizontal woven-strip grid.
 *
 * Painter algorithm (same as WeavePanel in Weave13Illustration):
 *   1. Draw full yellow horizontal strip bodies.
 *   2. Draw full cyan vertical strip bodies.
 *   3. At each crossing, redraw the "over" strip's rectangle on top (fill only).
 *   4. Redraw outlines for both strip sets (boundary lines sit on top).
 */
export function Weave6Panel({ crossings, width = VB, ariaLabel }: Weave6PanelProps) {
  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width={width}
      style={{ display: 'block' }}
      role="img"
      aria-label={ariaLabel ?? 'Woven strips pattern'}
    >
      {/* white background */}
      <rect x={0} y={0} width={VB} height={VB} fill="white" />

      {/* ── Step 1: yellow horizontal strip bodies ── */}
      {H_Y.map((y, hi) => (
        <rect key={`h-body-${hi}`} x={0} y={y} width={VB} height={H_H} fill={YELL_FILL} />
      ))}

      {/* ── Step 2: cyan vertical strip bodies ── */}
      {V_X.map((x, vi) => (
        <rect key={`v-body-${vi}`} x={x} y={0} width={V_W} height={VB} fill={CYAN_FILL} />
      ))}

      {/* ── Step 3: redraw "over" strip at each crossing ── */}
      {H_Y.map((y, ri) =>
        V_X.map((x, ci) => {
          const idx = ri * 3 + ci
          const vOnTop = crossings[idx]
          return vOnTop ? (
            // vertical (cyan) on top → redraw cyan rect at crossing
            <rect key={`cx-${idx}`} x={x} y={y} width={V_W} height={H_H} fill={CYAN_FILL} />
          ) : (
            // horizontal (yellow) on top → redraw yellow rect at crossing
            <rect key={`cx-${idx}`} x={x} y={y} width={V_W} height={H_H} fill={YELL_FILL} />
          )
        })
      )}

      {/* ── Step 4: outline strokes for horizontal strips ── */}
      {H_Y.map((y, hi) => (
        <rect
          key={`h-stroke-${hi}`}
          x={0} y={y} width={VB} height={H_H}
          fill="none"
          stroke={YELL_STROKE}
          strokeWidth={STRIP_SW}
        />
      ))}

      {/* outline strokes for vertical strips */}
      {V_X.map((x, vi) => (
        <rect
          key={`v-stroke-${vi}`}
          x={x} y={0} width={V_W} height={VB}
          fill="none"
          stroke={CYAN_STROKE}
          strokeWidth={STRIP_SW}
        />
      ))}
    </svg>
  )
}

// ── Crossing configurations ───────────────────────────────────────────────────

/**
 * STEM: alternating checkerboard — cyan (vertical) on top at TL, TM=no, TR,
 * ML=no, MM, MR=no, BL, BM=no, BR.
 * Pattern: V, H, V / H, V, H / V, H, V
 */
const STEM_CROSSINGS: CrossingMatrix9 = [
  true,  false, true,
  false, true,  false,
  true,  false, true,
]

/**
 * Per-option crossing configurations (faithfully matching the original images).
 *
 * Option A: cyan on top at all 9 crossings (uniform vertical-over).
 * Option B: cyan on top everywhere except centre — cyan except [4]=false.
 * Option C (ANSWER): opposite checkerboard — H, V, H / V, H, V / H, V, H.
 * Option D: cyan on top in top and bottom rows; yellow on top in middle row.
 * Option E: yellow on top at all 9 crossings (uniform horizontal-over).
 */
const OPTION_CONFIG: Record<string, {
  crossings: CrossingMatrix9
  ariaLabel: string
}> = {
  A: {
    crossings: [
      true,  true,  true,
      true,  true,  true,
      true,  true,  true,
    ],
    ariaLabel: 'Option A: cyan vertical strips on top at all 9 crossings',
  },
  B: {
    crossings: [
      true,  true,  true,
      true,  false, true,
      true,  true,  true,
    ],
    ariaLabel: 'Option B: cyan on top everywhere except the centre crossing',
  },
  C: {
    // CORRECT ANSWER: back view = LR mirror + over/under swap of the stem
    crossings: [
      false, true,  false,
      true,  false, true,
      false, true,  false,
    ],
    ariaLabel: 'Option C: opposite checkerboard — yellow on top at corners and centre (correct back view)',
  },
  D: {
    crossings: [
      true,  false, true,
      true,  false, true,
      true,  false, true,
    ],
    ariaLabel: 'Option D: cyan on top in left and right columns; yellow on top in middle column',
  },
  E: {
    crossings: [
      false, false, false,
      false, false, false,
      false, false, false,
    ],
    ariaLabel: 'Option E: yellow horizontal strips on top at all 9 crossings',
  },
}

// ── Weave11ECOption ───────────────────────────────────────────────────────────

/**
 * Renders one A–E answer option as the appropriate Weave6Panel.
 * Binds to choice.label — unknown labels fall back to plain text.
 */
export function Weave11ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const config = OPTION_CONFIG[label]
  if (!config) return <span>{choice.text}</span>

  return (
    <Weave6Panel
      crossings={config.crossings}
      width={80}
      ariaLabel={config.ariaLabel}
    />
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * Weave11ECIllustration
 *
 * Static, problem-only figure for IKMC-19-EC-Q11.
 * Shows the front view: 3 cyan vertical strips woven with 3 yellow horizontal
 * strips — alternating checkerboard (cyan on top at corners and centre).
 */
export default function Weave11ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Enam strip dijalin: tiga strip cyan vertikal dan tiga strip kuning horizontal. ' +
        'Pola papan catur bergantian: strip cyan di atas di sudut dan pusat, strip kuning di atas di tepi tengah.'
      }
    >
      <Weave6Panel
        crossings={STEM_CROSSINGS}
        width={180}
        ariaLabel="Stem figure: 3×3 weave, cyan vertical strips alternating over/under yellow horizontal strips"
      />
    </div>
  )
}
