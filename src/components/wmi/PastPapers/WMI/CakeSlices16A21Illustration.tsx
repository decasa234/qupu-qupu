// SEAMO-16-A-Q21 — "What is the maximum number of slices we can get by
// making 3 straight cuts?"  Answer: 7.
//
// Stem figure: a round cake (circle) with the question mark, but NO lines drawn —
// the student must imagine the cuts.  The cake is labelled "3 potongan / 3 cuts"
// to bind to the problem text.  The explainer adds the lines step-by-step.
//
// Pure SVG — no Math.random, no Date, no window/document.  SSR-safe.

// ── shared geometry (re-exported so the explainer can overlay in the same coords)

export const SVG_W = 220
export const SVG_H = 220
/** Centre of the cake circle. */
export const CX = 110
export const CY = 110
/** Outer radius of the cake. */
export const R = 88

/** Colour tokens. */
export const COLOR = {
  CAKE_FILL: '#FDE68A',      // warm yellow — the cake surface
  CAKE_STROKE: '#B45309',    // dark amber border
  CREAM: '#FEF3C7',          // lighter cream for decoration band
  CUTS: '#DC2626',           // red cut lines (used in explainer)
  LABEL: '#1F2937',
  BLUE: '#30598A',
} as const

// ── The three optimal cut lines (line segments crossing the circle).
// Parameterised as (x1,y1,x2,y2) in the SVG coordinate system.
// Cut 1: horizontal; Cut 2: diagonal; Cut 3: another diagonal crossing both.
// Chosen so each new line crosses all previous lines at distinct interior points.

export const CUTS: [number, number, number, number][] = [
  // cut 1 — roughly horizontal (slightly tilted for natural look)
  [CX - R, CY - 14, CX + R, CY - 14],
  // cut 2 — diagonal top-left to bottom-right, crossing cut 1
  [CX - R * 0.62, CY - R * 0.92, CX + R * 0.62, CY + R * 0.92],
  // cut 3 — diagonal top-right to bottom-left, crossing both
  [CX + R * 0.62, CY - R * 0.92, CX - R * 0.62, CY + R * 0.92],
]

// ── Cake base (exported so explainer reuses it) ───────────────────────────────

export function CakeBase() {
  return (
    <g>
      {/* main cake disc */}
      <circle cx={CX} cy={CY} r={R} fill={COLOR.CAKE_FILL} stroke={COLOR.CAKE_STROKE} strokeWidth={3} />
      {/* cream decoration ring near edge */}
      <circle cx={CX} cy={CY} r={R - 10} fill="none" stroke={COLOR.CREAM} strokeWidth={5} />
      {/* small centre dot */}
      <circle cx={CX} cy={CY} r={4} fill={COLOR.CAKE_STROKE} />
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * CakeSlices16A21Illustration
 *
 * Static, problem-only figure for SEAMO-16-A-Q21.
 * Shows a round cake with no cuts drawn — just the cake shape.
 * Students must work out how 3 straight cuts maximise slices.
 */
export default function CakeSlices16A21Illustration({ lang = 'en' }: { lang?: string }) {
  const labelLine1 = lang === 'id' ? '3 potongan lurus' : '3 straight cuts'
  const labelLine2 = lang === 'id' ? 'Maks. berapa irisan?' : 'Max. slices?'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Kue bundar — berapa irisan maksimum dengan 3 potongan lurus?'
          : 'Round cake — maximum slices from 3 straight cuts?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(260, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the cake */}
        <CakeBase />

        {/* labels inside the cake */}
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={COLOR.LABEL}
        >
          {labelLine1}
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={COLOR.BLUE}
        >
          {labelLine2}
        </text>
      </svg>
    </div>
  )
}
