// WMI-25F2A-Q5 — Rope on a ruler (measure the straight pieces, ignore curves).
// Static problem figure: ruler + rope only, no answer revealed.
// SSR-safe and deterministic — no random, no dates, no side effects.

// ----- layout constants -----------------------------------------------
// Viewbox: 320 wide × 140 tall.
// Ruler occupies the lower half; rope is drawn above/over it.
//
// The photo shows:
//   • Ruler tick marks from 2 to 11 cm.
//   • Upper piece of rope: from the 3 cm mark to the 7 cm mark  (≈4 cm).
//   • Left-facing U-turn loop connecting the two pieces (centred near 5–7 cm).
//   • Lower piece of rope: from the 3 cm mark to the 11 cm mark (≈8 cm).
// Together, straightened: 4 + 8 = 12 cm  → answer E (not shown here).

const RULER_X0 = 16     // left edge of the ruler body (SVG units)
const RULER_Y = 78      // y of the top edge of the ruler
const RULER_W = 288     // total ruler width
const RULER_H = 50      // ruler body height
const RULER_RX = 8      // corner radius

// We display tick labels 2 through 11 and a "cm" label after 11.
// The ruler's scale: marks 2..11  →  10 unit spans across RULER_W.
// Mark 0 would be at RULER_X0 - 2*PX_PER_CM, but we simply offset.
const TICKS_COUNT = 10  // ticks 2..11 inclusive = 10 labels, 9 inter-gaps shown, but
                         // ruler runs 2→11 = 9 cm across RULER_W
const CM_LEFT = 2       // lowest labelled cm
const CM_RIGHT = 11     // highest labelled cm
const CM_SPAN = CM_RIGHT - CM_LEFT   // 9 cm visible

// pixels per cm on the ruler
const PX_PER_CM = RULER_W / (CM_SPAN + 0.8)  // slight padding after "11 cm"

// convert a cm reading to an x coordinate
function cmX(cm: number): number {
  return RULER_X0 + (cm - CM_LEFT) * PX_PER_CM
}

// Rope geometry (SSR-deterministic, no Math.random)
// Upper piece: 3 cm → 7 cm, sits 16 px above ruler top
const ROPE_UPPER_Y = RULER_Y - 18
const ROPE_UPPER_X1 = cmX(3)
const ROPE_UPPER_X2 = cmX(7)

// Lower piece: 3 cm → 11 cm, sits 6 px above ruler top
const ROPE_LOWER_Y = RULER_Y - 6
const ROPE_LOWER_X1 = cmX(3)
const ROPE_LOWER_X2 = cmX(11)

// U-turn loop: cubic bezier connecting right end of upper to right end of lower.
// Both pieces end near x=cmX(7) (upper) and the loop goes left to ~x=cmX(5).
// We model it as a smooth arc using an SVG quadratic / cubic curve.
// Control points chosen to produce a plausible left-facing hairpin.
const LOOP_CX = cmX(5.5) - 18   // left control point x (dips left of 5.5 cm)

// The arch: starts at upper right (cmX(7), ROPE_UPPER_Y),
//            sweeps left via LOOP_CX,
//            then back right to (cmX(6.5), ROPE_LOWER_Y).
// Using a cubic bezier for a smooth U shape.
const LOOP_START_X = ROPE_UPPER_X2   // cmX(7)
const LOOP_END_X   = cmX(6.5)        // where lower piece begins at the loop side
const LOOP_D = [
  `M ${LOOP_START_X} ${ROPE_UPPER_Y}`,
  `C ${LOOP_CX} ${ROPE_UPPER_Y},`,   // control 1: pull left at upper y
  `  ${LOOP_CX} ${ROPE_LOWER_Y},`,   // control 2: pull left at lower y
  `  ${LOOP_END_X} ${ROPE_LOWER_Y}`, // end: rejoin lower piece
].join(' ')

// Rope stripe pattern: diagonal dashes to look like a twisted cord.
// We use a <pattern> for the rope fill instead of raw hex.

export default function RopeRuler25G2Illustration() {
  const VW = 320
  const VH = 140

  // tick positions for half-cm marks (one between each labelled cm)
  const halfTicks: number[] = []
  for (let c = CM_LEFT; c < CM_RIGHT; c++) {
    halfTicks.push(c + 0.5)
  }

  // Minor tick positions (every 0.1 cm — simulated by mm marks)
  const mmTicks: number[] = []
  for (let c = CM_LEFT; c <= CM_RIGHT; c += 0.1) {
    const rounded = Math.round(c * 10) / 10
    // skip full-cm and half-cm ticks (they have their own heights)
    const isCm   = rounded === Math.round(rounded)
    const isHalf = Math.abs(rounded - Math.round(rounded)) === 0.5
    if (!isCm && !isHalf) mmTicks.push(rounded)
  }

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tali di atas penggaris dari 2 cm hingga 11 cm. Bagian atas tali lurus dari 3 cm ke 7 cm (sekitar 4 cm). Setelah lekukan, bagian bawah tali lurus dari 3 cm ke 11 cm (sekitar 8 cm). Abaikan lekukannya; total panjang tali sekitar 12 cm."
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={Math.min(320, VW)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          {/* Diagonal stripe pattern for rope texture */}
          <pattern
            id="rope-stripe"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* light blue base */}
            <rect width="8" height="8" className="fill-qupu-brand-blue" opacity="0.7" />
            {/* white stripes */}
            <rect x="0" y="0" width="4" height="8" fill="white" opacity="0.45" />
          </pattern>
          {/* Clip path for upper rope segment */}
          <clipPath id="clip-upper">
            <rect
              x={ROPE_UPPER_X1 - 1}
              y={ROPE_UPPER_Y - 5}
              width={ROPE_UPPER_X2 - ROPE_UPPER_X1 + 2}
              height={10}
            />
          </clipPath>
          {/* Clip path for lower rope segment */}
          <clipPath id="clip-lower">
            <rect
              x={ROPE_LOWER_X1 - 1}
              y={ROPE_LOWER_Y - 5}
              width={ROPE_LOWER_X2 - ROPE_LOWER_X1 + 2}
              height={10}
            />
          </clipPath>
        </defs>

        {/* ── RULER BODY ── */}
        <rect
          x={RULER_X0}
          y={RULER_Y}
          width={RULER_W}
          height={RULER_H}
          rx={RULER_RX}
          className="fill-qupu-cream"
          stroke="#C4A64A"
          strokeWidth={1.8}
        />
        {/* Ruler top sheen (subtle lighter band) */}
        <rect
          x={RULER_X0 + RULER_RX}
          y={RULER_Y}
          width={RULER_W - RULER_RX * 2}
          height={6}
          fill="rgba(255,255,255,0.45)"
        />

        {/* ── MILLIMETRE TICKS ── */}
        {mmTicks.map((c) => (
          <line
            key={`mm-${c}`}
            x1={cmX(c)}
            y1={RULER_Y}
            x2={cmX(c)}
            y2={RULER_Y + 6}
            stroke="#A08020"
            strokeWidth={0.7}
          />
        ))}

        {/* ── HALF-CM TICKS ── */}
        {halfTicks.map((c) => (
          <line
            key={`half-${c}`}
            x1={cmX(c)}
            y1={RULER_Y}
            x2={cmX(c)}
            y2={RULER_Y + 10}
            stroke="#A08020"
            strokeWidth={1}
          />
        ))}

        {/* ── FULL-CM TICKS ── */}
        {Array.from({ length: TICKS_COUNT }, (_, i) => {
          const c = CM_LEFT + i
          return (
            <line
              key={`cm-${c}`}
              x1={cmX(c)}
              y1={RULER_Y}
              x2={cmX(c)}
              y2={RULER_Y + 16}
              stroke="#7A6010"
              strokeWidth={1.4}
            />
          )
        })}

        {/* ── CM LABELS ── */}
        {Array.from({ length: TICKS_COUNT }, (_, i) => {
          const c = CM_LEFT + i
          return (
            <text
              key={`lbl-${c}`}
              x={cmX(c)}
              y={RULER_Y + 30}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#5A4A00"
            >
              {c}
            </text>
          )
        })}
        {/* "cm" unit label after 11 */}
        <text
          x={cmX(11) + 14}
          y={RULER_Y + 30}
          textAnchor="start"
          fontSize="10"
          fontWeight="500"
          fill="#5A4A00"
        >
          cm
        </text>

        {/* ── ROPE: UPPER PIECE (3 cm → 7 cm) ── */}
        {/* Background stroke for outline */}
        <line
          x1={ROPE_UPPER_X1}
          y1={ROPE_UPPER_Y}
          x2={ROPE_UPPER_X2}
          y2={ROPE_UPPER_Y}
          stroke="#1565C0"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Stripe fill via pattern */}
        <line
          x1={ROPE_UPPER_X1}
          y1={ROPE_UPPER_Y}
          x2={ROPE_UPPER_X2}
          y2={ROPE_UPPER_Y}
          stroke="url(#rope-stripe)"
          strokeWidth={9}
          strokeLinecap="round"
        />

        {/* ── ROPE: U-TURN LOOP ── */}
        {/* Dark outline */}
        <path
          d={LOOP_D}
          fill="none"
          stroke="#1565C0"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stripe fill */}
        <path
          d={LOOP_D}
          fill="none"
          stroke="url(#rope-stripe)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── ROPE: LOWER PIECE (3 cm → 11 cm) ── */}
        {/* Background stroke for outline */}
        <line
          x1={ROPE_LOWER_X1}
          y1={ROPE_LOWER_Y}
          x2={ROPE_LOWER_X2}
          y2={ROPE_LOWER_Y}
          stroke="#1565C0"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Stripe fill */}
        <line
          x1={ROPE_LOWER_X1}
          y1={ROPE_LOWER_Y}
          x2={ROPE_LOWER_X2}
          y2={ROPE_LOWER_Y}
          stroke="url(#rope-stripe)"
          strokeWidth={9}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
