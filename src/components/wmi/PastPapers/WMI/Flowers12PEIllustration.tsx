// IKMC-20-PE-Q12 — "A number is written on each petal of two flowers. One petal is hidden.
// The sums of the numbers on the two flowers are equal. What number is written on the
// hidden petal?"
//
// Stem illustration — problem only.
// Two flowers side by side (the smaller one partially overlaps the larger one from behind):
//   Flower 1 (large, bottom-left):  petals labelled 1, 3, 5, 7, 9 (sum = 25)
//   Flower 2 (small, top-right):    petals labelled 2, 4, 6, 8 and one HIDDEN petal (marked ?)
//
// Source figure: 2020.imgs/041.jpg
// The ? petal is at the top-left of the small flower, partially behind the large flower's petal.
//
// Pure SVG, no random, no Date. SSR-safe and deterministic.
// Reuses the flower primitive concept from MayaBeeFlowers12Illustration (different question —
// that is IKMC-19-PE-Q12 about Maya Bee and set regions; this one is a sum puzzle).

// ── Shared layout constants ────────────────────────────────────────────────────

export const SVG_W = 300
export const SVG_H = 260

/** Colour palette. */
export const COLOR = {
  PETAL_FILL: '#FFFFFF',
  PETAL_STROKE: '#E91E8C',  // vivid pink, matching the source figure
  CENTER_FILL: '#FFEE00',   // yellow centre
  CENTER_STROKE: '#E91E8C',
  TEXT_COLOR: '#1A1A1A',
  HIDDEN_TEXT: '#888888',   // grey ? on hidden petal
  BG: '#FFFFFF',
} as const

// ── Flower primitive ──────────────────────────────────────────────────────────

/**
 * Renders one rounded-petal flower centred at (cx, cy).
 * `petals` is an array of { angle (deg, 0=up), label } objects.
 * `petalR` = half-length of the petal ellipse along its major axis.
 * `petalRy` = half-width of the petal (minor axis).
 * `centerR` = radius of the yellow centre circle.
 * Co-exported so the explainer can reuse it.
 */
export function FlowerPE({
  cx,
  cy,
  petalR = 38,
  petalRy = 24,
  centerR = 18,
  petals,
}: {
  cx: number
  cy: number
  petalR?: number
  petalRy?: number
  centerR?: number
  petals: ReadonlyArray<{ angleDeg: number; label: string; hidden?: boolean }>
}) {
  // Offset: petal centre is petalR * 0.62 from flower centre (along angle)
  const offset = petalR * 0.62

  return (
    <g>
      {/* petal shapes (ellipses, drawn first) */}
      {petals.map((p, i) => {
        const rad = ((p.angleDeg - 90) * Math.PI) / 180
        const px = cx + Math.cos(rad) * offset
        const py = cy + Math.sin(rad) * offset
        return (
          <ellipse
            key={`petal-${i}`}
            cx={px}
            cy={py}
            rx={petalR}
            ry={petalRy}
            fill={COLOR.PETAL_FILL}
            stroke={COLOR.PETAL_STROKE}
            strokeWidth={2.5}
            transform={`rotate(${p.angleDeg} ${px} ${py})`}
          />
        )
      })}

      {/* yellow centre */}
      <circle
        cx={cx}
        cy={cy}
        r={centerR}
        fill={COLOR.CENTER_FILL}
        stroke={COLOR.CENTER_STROKE}
        strokeWidth={2.5}
      />

      {/* petal labels */}
      {petals.map((p, i) => {
        const rad = ((p.angleDeg - 90) * Math.PI) / 180
        // Label at petal tip (further than the ellipse centre)
        const lx = cx + Math.cos(rad) * (offset + petalR * 0.42)
        const ly = cy + Math.sin(rad) * (offset + petalR * 0.42)
        return (
          <text
            key={`label-${i}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={p.hidden ? 13 : 14}
            fontWeight="bold"
            fill={p.hidden ? COLOR.HIDDEN_TEXT : COLOR.TEXT_COLOR}
            fontFamily="sans-serif"
          >
            {p.label}
          </text>
        )
      })}
    </g>
  )
}

// ── Flower configurations ─────────────────────────────────────────────────────

/**
 * Large flower — 5 petals with numbers 1, 3, 5, 7, 9.
 * Angles: 36° apart (pentagonal layout), starting from top-left.
 * Source positions: left=3, bottom-left=1, bottom-right=9, right=7, top=5.
 * Adjusted to match 2020.imgs/041.jpg layout (top petal goes behind the small flower).
 */
export const LARGE_PETALS = [
  { angleDeg: 270, label: '5' },   // top (upward)
  { angleDeg: 342, label: '7' },   // upper-right
  { angleDeg: 54,  label: '9' },   // lower-right
  { angleDeg: 126, label: '1' },   // lower-left
  { angleDeg: 198, label: '3' },   // left
] as const

/**
 * Small flower — 5 petals with numbers 2, 4, 6, 8 and one HIDDEN petal (?).
 * From the figure: top=4, upper-right=6, right=8, bottom=2, upper-left=? (hidden, behind large).
 */
export const SMALL_PETALS = [
  { angleDeg: 270, label: '4' },   // top
  { angleDeg: 342, label: '6' },   // upper-right
  { angleDeg: 54,  label: '8' },   // right / lower-right
  { angleDeg: 126, label: '2' },   // lower / lower-left
  { angleDeg: 198, label: '?', hidden: true },  // upper-left — the hidden petal
] as const

// ── Default export — static illustration ──────────────────────────────────────

/**
 * Flowers12PEIllustration
 *
 * Static, problem-only SVG for IKMC-20-PE-Q12.
 * Shows two overlapping flowers with numbers on their petals.
 * The large flower has 1, 3, 5, 7, 9 (sum = 25).
 * The small flower has 2, 4, 6, 8 and one hidden petal marked ?.
 * Does NOT reveal the answer.
 */
export default function Flowers12PEIllustration() {
  const largeCx = 130
  const largeCy = 148
  const smallCx = 193
  const smallCy = 98

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua bunga dengan angka-angka pada kelopaknya. ' +
        'Bunga besar: kelopak berlabel 1, 3, 5, 7, 9. ' +
        'Bunga kecil: kelopak berlabel 2, 4, 6, 8, dan satu kelopak tersembunyi bertanda tanya. ' +
        'Jumlah angka kedua bunga sama.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* large flower (drawn first so small flower overlaps it) */}
        <FlowerPE
          cx={largeCx}
          cy={largeCy}
          petalR={42}
          petalRy={27}
          centerR={22}
          petals={LARGE_PETALS}
        />

        {/* small flower (overlaps the large flower's top petal) */}
        <FlowerPE
          cx={smallCx}
          cy={smallCy}
          petalR={30}
          petalRy={19}
          centerR={16}
          petals={SMALL_PETALS}
        />
      </svg>
    </div>
  )
}
