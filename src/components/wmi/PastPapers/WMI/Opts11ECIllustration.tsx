// IKMC-23-EC-Q11 — "Ali's ruler"
//
// Q11 is options-only: the A–E choices ARE rulers with tick marks.
// Each ruler is 60 cm long with 0 at the left end, 60 at the right end,
// and exactly two internal tick marks.  From the 4 points (0, m1, m2, 60)
// Ali can measure C(4,2) = 6 distinct distances.  Only Ruler E produces
// all six of: 10, 20, 30, 40, 50, 60.
//
// Ruler data:
//   A: m1=10, m2=30  →  distances: 10, 20, 30, 50, 40, 60  — 20 repeated
//   B: m1=20, m2=40  →  distances: 20, 20, 40, 20, 40, 60  — many repeats
//   C: m1=30, m2=50  →  distances: 30, 20, 10, 50, 30, 60  — 30 repeated, 40 missing
//   D: m1=10, m2=20  →  distances: 10, 10, 50, 20, 40, 60  — 10 repeated, 30 missing
//   E: m1=10, m2=40  →  distances: 10, 30, 20, 40, 50, 60  — all six ✓
//
// Named exports only (no default export — options-only question).
//
// Pure render: no Math.random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── Layout constants (re-exported for the explainer) ─────────────────────────

/** SVG viewBox width for one ruler. */
export const RULER_VW = 200
/** SVG viewBox height for one ruler. */
export const RULER_VH = 70

/** Horizontal padding on each side inside the viewBox. */
export const RULER_PAD = 14
/** Y position of the top edge of the ruler rectangle. */
export const RULER_TOP = 14
/** Ruler rectangle height. */
export const RULER_H = 22
/** Bottom edge of ruler body. */
export const RULER_BOT = RULER_TOP + RULER_H

/** Usable drawing width (ruler spans from PAD to VW-PAD). */
export const RULER_SPAN = RULER_VW - 2 * RULER_PAD

/** Convert a cm value (0–60) to SVG x coordinate. */
export function cmToX(cm: number): number {
  return RULER_PAD + (cm / 60) * RULER_SPAN
}

// ── Colour tokens ─────────────────────────────────────────────────────────────

const RULER_FILL  = '#F3F4F6'   // light gray body
const RULER_STROKE = '#374151'  // dark border
const TICK_STROKE  = '#374151'  // tick marks
const LABEL_FILL   = '#1F2937'  // number labels
const ARROW_COLOR  = '#374151'  // double-headed arrow

/** Highlight colours for interactive beats. */
export const HIGHLIGHT_M1 = '#30598A'   // blue
export const HIGHLIGHT_M2 = '#DC2626'   // red

// ── Ruler data ────────────────────────────────────────────────────────────────

export const RULER_OPTS: Record<string, { m1: number; m2: number }> = {
  A: { m1: 10, m2: 30 },
  B: { m1: 20, m2: 40 },
  C: { m1: 30, m2: 50 },
  D: { m1: 10, m2: 20 },
  E: { m1: 10, m2: 40 },
}

// ── Aria descriptions ─────────────────────────────────────────────────────────

export const RULER_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: a 60 cm ruler with tick marks at 10 cm and 30 cm.',
    id: 'Pilihan A: penggaris 60 cm dengan tanda di 10 cm dan 30 cm.',
  },
  B: {
    en: 'Option B: a 60 cm ruler with tick marks at 20 cm and 40 cm.',
    id: 'Pilihan B: penggaris 60 cm dengan tanda di 20 cm dan 40 cm.',
  },
  C: {
    en: 'Option C: a 60 cm ruler with tick marks at 30 cm and 50 cm.',
    id: 'Pilihan C: penggaris 60 cm dengan tanda di 30 cm dan 50 cm.',
  },
  D: {
    en: 'Option D: a 60 cm ruler with tick marks at 10 cm and 20 cm.',
    id: 'Pilihan D: penggaris 60 cm dengan tanda di 10 cm dan 20 cm.',
  },
  E: {
    en: 'Option E: a 60 cm ruler with tick marks at 10 cm and 40 cm.',
    id: 'Pilihan E: penggaris 60 cm dengan tanda di 10 cm dan 40 cm.',
  },
}

// ── RulerPrimitive ────────────────────────────────────────────────────────────

/**
 * RulerPrimitive — draws one ruler given its two internal mark positions.
 *
 * Used both by Opts11ECOption (static) and Opts11ECExplainer (animated,
 * with optional highlight on m1 and/or m2).
 *
 * Renders entirely within RULER_VW × RULER_VH viewBox; the parent is
 * responsible for wrapping in an <svg> element with the correct viewBox.
 */
export function RulerPrimitive({
  m1,
  m2,
  highlightM1 = false,
  highlightM2 = false,
  accentColor = HIGHLIGHT_M1,
}: {
  m1: number
  m2: number
  highlightM1?: boolean
  highlightM2?: boolean
  accentColor?: string
}) {
  const x0   = cmToX(0)
  const xM1  = cmToX(m1)
  const xM2  = cmToX(m2)
  const x60  = cmToX(60)

  // Tick heights
  const TICK_FULL = RULER_H       // endpoint ticks span full ruler height
  const TICK_INT  = RULER_H * 0.75  // internal ticks slightly shorter

  // Arrow row: sits below the ruler body
  const ARROW_Y  = RULER_BOT + 18
  const ARROWHEAD = 5  // arrowhead size

  return (
    <g>
      {/* ruler body */}
      <rect
        x={x0}
        y={RULER_TOP}
        width={x60 - x0}
        height={RULER_H}
        fill={RULER_FILL}
        stroke={RULER_STROKE}
        strokeWidth={1.5}
        rx={2}
      />

      {/* endpoint tick at 0 */}
      <line
        x1={x0} y1={RULER_TOP}
        x2={x0} y2={RULER_TOP + TICK_FULL}
        stroke={TICK_STROKE}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* endpoint tick at 60 */}
      <line
        x1={x60} y1={RULER_TOP}
        x2={x60} y2={RULER_TOP + TICK_FULL}
        stroke={TICK_STROKE}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* internal tick at m1 */}
      <line
        x1={xM1} y1={RULER_TOP}
        x2={xM1} y2={RULER_TOP + TICK_INT}
        stroke={highlightM1 ? accentColor : TICK_STROKE}
        strokeWidth={highlightM1 ? 3 : 1.5}
        strokeLinecap="round"
      />

      {/* internal tick at m2 */}
      <line
        x1={xM2} y1={RULER_TOP}
        x2={xM2} y2={RULER_TOP + TICK_INT}
        stroke={highlightM2 ? accentColor : TICK_STROKE}
        strokeWidth={highlightM2 ? 3 : 1.5}
        strokeLinecap="round"
      />

      {/* label for m1 */}
      <text
        x={xM1}
        y={RULER_BOT + 8}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={9}
        fontWeight={highlightM1 ? 800 : 600}
        fill={highlightM1 ? accentColor : LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {m1}
      </text>

      {/* label for m2 */}
      <text
        x={xM2}
        y={RULER_BOT + 8}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={9}
        fontWeight={highlightM2 ? 800 : 600}
        fill={highlightM2 ? accentColor : LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {m2}
      </text>

      {/* double-headed arrow below ruler */}
      {/* left arrowhead */}
      <polygon
        points={`${x0},${ARROW_Y} ${x0 + ARROWHEAD},${ARROW_Y - ARROWHEAD / 2} ${x0 + ARROWHEAD},${ARROW_Y + ARROWHEAD / 2}`}
        fill={ARROW_COLOR}
      />
      {/* right arrowhead */}
      <polygon
        points={`${x60},${ARROW_Y} ${x60 - ARROWHEAD},${ARROW_Y - ARROWHEAD / 2} ${x60 - ARROWHEAD},${ARROW_Y + ARROWHEAD / 2}`}
        fill={ARROW_COLOR}
      />
      {/* arrow shaft */}
      <line
        x1={x0 + ARROWHEAD}
        y1={ARROW_Y}
        x2={x60 - ARROWHEAD}
        y2={ARROW_Y}
        stroke={ARROW_COLOR}
        strokeWidth={1.5}
      />
      {/* "60 cm" label centred under arrow */}
      <text
        x={(x0 + x60) / 2}
        y={ARROW_Y + 7}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={9}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        60 cm
      </text>
    </g>
  )
}

// ── Opts11ECOption ────────────────────────────────────────────────────────────

/**
 * Opts11ECOption — renders a single A/B/C/D/E choice as an SVG ruler.
 * Registered in CHOICE_RENDERERS for IKMC-23-EC-Q11.
 */
export function Opts11ECOption({ choice }: { choice: WmiChoice }) {
  const k = (choice.label ?? '').trim().toUpperCase()
  const data = RULER_OPTS[k]
  const aria = RULER_ARIA[k]
  if (!data) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${RULER_VW} ${RULER_VH}`}
        width={RULER_VW}
        height={RULER_VH}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={RULER_VW} height={RULER_VH} fill="white" />
        <RulerPrimitive m1={data.m1} m2={data.m2} />
      </svg>
    </span>
  )
}
