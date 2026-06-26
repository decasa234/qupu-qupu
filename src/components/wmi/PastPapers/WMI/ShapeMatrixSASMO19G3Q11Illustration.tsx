// SASMO-19-G3-Q11 — "Find the missing shape in the diagram below."
//
// A 3×3 shape matrix:
//   Col:   1 (shape)          2 (circles)           3 (combined)
//   Row 0: 3-arm star        | single annulus       | 3-arm star inside circle
//   Row 1: small 3-arm star  | double concentric    | triquetra (star merged with rings)
//   Row 2: 6-arm star        | triple concentric    | ? (answer B)
//
// Rule: column 3 = column 1 shape drawn inside column 2 circle system.
// Row 2 missing shape = 6-arm compass star inside triple concentric rings = Answer B.
//
// Choices (all are picture options):
//   A: 6-arm star with small circle INSIDE the star (inverted — wrong)
//   B: 6-arm star inside triple concentric circles (CORRECT)
//   C: 6-arm diamond-arm star inside single large circle
//   D: triquetra inside single large circle
//
// Pure SVG, SSR-safe. No hooks, no framer-motion, no external images.

import type { WmiChoice } from '../../../../types/wmi'

const INK = '#1F2937'
const GRID_STROKE = '#9CA3AF'

// ─── star polygon path helper ─────────────────────────────────────────────

export function starPath(
  cx: number,
  cy: number,
  n: number,
  rO: number,
  rI: number,
  startDeg = -90,
): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const deg = startDeg + (i * 180) / n
    const rad = (deg * Math.PI) / 180
    const r = i % 2 === 0 ? rO : rI
    pts.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// ─── atom shapes (exported so the Explainer can reuse them) ──────────────

/** 3-arm triforce star — fat diamond arms (row 0 col 0). */
export function Star3({
  cx, cy, r = 28, sw = 1.5,
}: { cx: number; cy: number; r?: number; sw?: number }) {
  return (
    <polygon
      points={starPath(cx, cy, 3, r, r * 0.16, -90)}
      fill="none"
      stroke={INK}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  )
}

/** Smaller 3-arm star (row 1 col 0). */
export function Star3Sm({
  cx, cy, r = 18, sw = 1.5,
}: { cx: number; cy: number; r?: number; sw?: number }) {
  return (
    <polygon
      points={starPath(cx, cy, 3, r, r * 0.22, -90)}
      fill="none"
      stroke={INK}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  )
}

/** 6-arm compass star — thin arms (row 2 col 0, options A/B). */
export function Star6({
  cx, cy, r = 30, sw = 1.5,
}: { cx: number; cy: number; r?: number; sw?: number }) {
  return (
    <polygon
      points={starPath(cx, cy, 6, r, r * 0.28, -90)}
      fill="none"
      stroke={INK}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  )
}

/** 6-arm diamond star — fat hexagram arms (option C only). */
export function Star6Diamond({
  cx, cy, r = 28, sw = 1.5,
}: { cx: number; cy: number; r?: number; sw?: number }) {
  return (
    <polygon
      points={starPath(cx, cy, 6, r, r * 0.60, -90)}
      fill="none"
      stroke={INK}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  )
}

/** Concentric circles — `rings` is an array of radii, largest first. */
export function Rings({
  cx, cy, rings, sw = 1.5,
}: { cx: number; cy: number; rings: number[]; sw?: number }) {
  return (
    <>
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={sw} />
      ))}
    </>
  )
}

/** Triquetra — 3 overlapping circles at 120° spacing (row 1 col 2, option D). */
export function Triquetra({
  cx, cy, r = 24, sw = 1.5,
}: { cx: number; cy: number; r?: number; sw?: number }) {
  const d = r * 0.42   // offset from center to each circle's center
  const rc = r * 0.68  // individual circle radius
  const angles = [-90, 30, 150]
  return (
    <>
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <circle
            key={i}
            cx={cx + d * Math.cos(rad)}
            cy={cy + d * Math.sin(rad)}
            r={rc}
            fill="none"
            stroke={INK}
            strokeWidth={sw}
          />
        )
      })}
    </>
  )
}

// ─── Stem illustration (3×3 grid) ────────────────────────────────────────

const CELL = 90
const W = CELL * 3

/**
 * ShapeMatrixSASMO19G3Q11Illustration — shows the 3×3 shape matrix with a "?" in
 * the bottom-right cell. Does NOT reveal the answer.
 */
export default function ShapeMatrixSASMO19G3Q11Illustration() {
  // Cell centres
  const R0 = CELL / 2
  const R1 = CELL + CELL / 2
  const R2 = 2 * CELL + CELL / 2
  const C0 = CELL / 2
  const C1 = CELL + CELL / 2
  const C2 = 2 * CELL + CELL / 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="3×3 shape matrix — find the missing shape in the bottom-right cell."
    >
      <svg
        viewBox={`0 0 ${W} ${W}`}
        width="100%"
        style={{ maxWidth: W, display: 'block' }}
        aria-hidden="true"
      >
        {/* Grid border and dividers */}
        <rect x={0} y={0} width={W} height={W} fill="none" stroke={GRID_STROKE} strokeWidth={1.5} />
        <path
          d={`M 0 ${CELL} H ${W} M 0 ${CELL * 2} H ${W}`}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
          fill="none"
        />
        <path
          d={`M ${CELL} 0 V ${W} M ${CELL * 2} 0 V ${W}`}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
          fill="none"
        />

        {/* Row 0: 3-arm star | annulus | 3-arm star in circle */}
        <Star3 cx={C0} cy={R0} r={30} />
        <Rings cx={C1} cy={R0} rings={[28, 9]} />
        <circle cx={C2} cy={R0} r={34} fill="none" stroke={INK} strokeWidth={1.5} />
        <Star3 cx={C2} cy={R0} r={27} />

        {/* Row 1: small 3-arm star | double rings | triquetra */}
        <Star3Sm cx={C0} cy={R1} r={20} />
        <Rings cx={C1} cy={R1} rings={[22, 12]} />
        <Triquetra cx={C2} cy={R1} r={28} />

        {/* Row 2: 6-arm star | triple rings | ? */}
        <Star6 cx={C0} cy={R2} r={32} />
        <Rings cx={C1} cy={R2} rings={[30, 20, 11]} />
        <text
          x={C2}
          y={R2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={40}
          fontWeight={900}
          fill={INK}
        >
          ?
        </text>
      </svg>
    </div>
  )
}

// ─── Option renderer ──────────────────────────────────────────────────────

const OPT = 90  // option SVG size (square)

/**
 * ShapeMatrixSASMO19G3Q11Option — renders one A/B/C/D choice as an SVG figure.
 * Registered in CHOICE_RENDERERS for SASMO-19-G3-Q11.
 */
export function ShapeMatrixSASMO19G3Q11Option({ choice }: { choice: WmiChoice }) {
  const cx = OPT / 2
  const cy = OPT / 2
  const k = choice.label

  if (k === 'A') {
    // 6-arm star (no outer circle) with a small inner circle at centre
    return (
      <span
        role="img"
        aria-label="Option A: six-arm star with small circle inside"
        style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
      >
        <svg viewBox={`0 0 ${OPT} ${OPT}`} width={80} height={80} aria-hidden="true">
          <Star6 cx={cx} cy={cy} r={36} />
          <circle cx={cx} cy={cy} r={10} fill="none" stroke={INK} strokeWidth={1.5} />
        </svg>
      </span>
    )
  }

  if (k === 'B') {
    // 6-arm star inside triple concentric circles (correct answer)
    return (
      <span
        role="img"
        aria-label="Option B: six-arm star inside triple concentric circles"
        style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
      >
        <svg viewBox={`0 0 ${OPT} ${OPT}`} width={80} height={80} aria-hidden="true">
          <Rings cx={cx} cy={cy} rings={[40, 27, 15]} />
          <Star6 cx={cx} cy={cy} r={36} />
        </svg>
      </span>
    )
  }

  if (k === 'C') {
    // Fat 6-arm diamond star inside a single large circle
    return (
      <span
        role="img"
        aria-label="Option C: six-arm diamond star inside single circle"
        style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
      >
        <svg viewBox={`0 0 ${OPT} ${OPT}`} width={80} height={80} aria-hidden="true">
          <circle cx={cx} cy={cy} r={40} fill="none" stroke={INK} strokeWidth={1.5} />
          <Star6Diamond cx={cx} cy={cy} r={34} />
        </svg>
      </span>
    )
  }

  if (k === 'D') {
    // Triquetra inside a single large circle
    return (
      <span
        role="img"
        aria-label="Option D: trefoil inside single circle"
        style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
      >
        <svg viewBox={`0 0 ${OPT} ${OPT}`} width={80} height={80} aria-hidden="true">
          <circle cx={cx} cy={cy} r={40} fill="none" stroke={INK} strokeWidth={1.5} />
          <Triquetra cx={cx} cy={cy} r={28} />
        </svg>
      </span>
    )
  }

  // Option E or fallback: plain text
  return <span>{choice.text}</span>
}
