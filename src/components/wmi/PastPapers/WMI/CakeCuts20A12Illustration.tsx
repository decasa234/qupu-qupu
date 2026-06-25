// SEAMO-20-A-Q12 — "A single cut divides a cake into 2 pieces. Two cuts divide
// it into 4 pieces. What is the MOST pieces you can get with THREE cuts?"
// Answer: 7 (B).
//
// The stem figure shows TWO cakes side-by-side:
//   Left  — 1 cut through centre → 2 pieces
//   Right — 2 cuts crossing at one interior point → 4 pieces
// This mirrors the real OCR image (2020.imgs/015.jpg).
//
// Pure SVG — no Math.random, no Date, no window/document. SSR-safe.

// ── Shared geometry (re-exported for the explainer) ──────────────────────────

export const SVG_W = 360
export const SVG_H = 160

/** Per-cake geometry. */
export const CAKE = {
  R: 62,          // circle radius
  CY: 80,         // vertical centre
  C1X: 90,        // centre X for the left cake  (1 cut)
  C2X: 270,       // centre X for the right cake (2 cuts)
} as const

export const COLOR = {
  CAKE_FILL:   '#FDE68A',   // warm yellow
  CAKE_STROKE: '#B45309',   // dark amber border
  CREAM:       '#FEF3C7',   // lighter cream ring
  CUT:         '#DC2626',   // red cut lines
  LABEL:       '#1F2937',
  BLUE:        '#30598A',
} as const

// ── Cut-line definitions (clipped to each circle) ────────────────────────────
//
// For the LEFT cake (1 cut): a single roughly-horizontal slice.
export const LEFT_CUTS: [number, number, number, number][] = [
  // slight upward tilt, full diameter
  [CAKE.C1X - CAKE.R, CAKE.CY - 12, CAKE.C1X + CAKE.R, CAKE.CY - 12],
]

// For the RIGHT cake (2 cuts crossing at an interior point, matching the image):
export const RIGHT_CUTS: [number, number, number, number][] = [
  // first cut — diagonal top-left → bottom-right
  [CAKE.C2X - CAKE.R * 0.65, CAKE.CY - CAKE.R * 0.88, CAKE.C2X + CAKE.R * 0.65, CAKE.CY + CAKE.R * 0.88],
  // second cut — diagonal top-right → bottom-left, crossing the first
  [CAKE.C2X + CAKE.R * 0.65, CAKE.CY - CAKE.R * 0.88, CAKE.C2X - CAKE.R * 0.65, CAKE.CY + CAKE.R * 0.88],
]

// ── Re-usable sub-components ──────────────────────────────────────────────────

/** A plain cake disc centred at (cx, cy). */
export function CakeDisc({ cx, cy }: { cx: number; cy: number }) {
  const { R, CY: _CY } = CAKE
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill={COLOR.CAKE_FILL} stroke={COLOR.CAKE_STROKE} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={R - 8} fill="none" stroke={COLOR.CREAM} strokeWidth={4} />
    </g>
  )
}

/** One cut-line segment, already clipped by the caller's clipPath. */
export function CutSeg({
  x1, y1, x2, y2,
  strokeWidth = 2.5,
  stroke = COLOR.CUT,
  clipPathId,
}: {
  x1: number; y1: number; x2: number; y2: number
  strokeWidth?: number
  stroke?: string
  clipPathId: string
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      clipPath={`url(#${clipPathId})`}
    />
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * CakeCuts20A12Illustration
 *
 * Static, problem-only figure for SEAMO-20-A-Q12.
 * Shows two cakes: 1 cut → 2 pieces (left) and 2 crossing cuts → 4 pieces (right).
 * A question mark below prompts: "What about 3 cuts?"
 */
export default function CakeCuts20A12Illustration({ lang = 'en' }: { lang?: string }) {
  const id = lang === 'id'
  const label1 = id ? '1 potongan → 2 bagian' : '1 cut → 2 pieces'
  const label2 = id ? '2 potongan → 4 bagian' : '2 cuts → 4 pieces'
  const question = id ? '3 potongan → ? bagian' : '3 cuts → ? pieces'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        id
          ? 'Dua kue: kue kiri dipotong 1 garis lurus (2 bagian), kue kanan dipotong 2 garis silang (4 bagian). Berapa bagian dengan 3 potongan?'
          : 'Two cakes: left cut once (2 pieces), right cut twice crossing (4 pieces). How many pieces from 3 cuts?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: 400, display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="cc20a12-left">
            <circle cx={CAKE.C1X} cy={CAKE.CY} r={CAKE.R} />
          </clipPath>
          <clipPath id="cc20a12-right">
            <circle cx={CAKE.C2X} cy={CAKE.CY} r={CAKE.R} />
          </clipPath>
        </defs>

        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* LEFT cake — 1 cut */}
        <CakeDisc cx={CAKE.C1X} cy={CAKE.CY} />
        {LEFT_CUTS.map(([x1, y1, x2, y2], i) => (
          <CutSeg key={i} x1={x1} y1={y1} x2={x2} y2={y2} clipPathId="cc20a12-left" />
        ))}
        <text x={CAKE.C1X} y={CAKE.CY + CAKE.R + 16}
          textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.BLUE}
        >
          {label1}
        </text>

        {/* RIGHT cake — 2 cuts crossing */}
        <CakeDisc cx={CAKE.C2X} cy={CAKE.CY} />
        {RIGHT_CUTS.map(([x1, y1, x2, y2], i) => (
          <CutSeg key={i} x1={x1} y1={y1} x2={x2} y2={y2} clipPathId="cc20a12-right" />
        ))}
        <text x={CAKE.C2X} y={CAKE.CY + CAKE.R + 16}
          textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.BLUE}
        >
          {label2}
        </text>

        {/* Question prompt — centred between the two cakes */}
        <text x={SVG_W / 2} y={CAKE.CY + CAKE.R + 36}
          textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill={COLOR.LABEL}
        >
          {question}
        </text>
      </svg>
    </div>
  )
}
