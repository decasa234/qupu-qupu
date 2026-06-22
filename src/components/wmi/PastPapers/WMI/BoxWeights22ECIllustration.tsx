// IKMC-21-EC-Q22 — "Each of the 5 boxes contains either apples or bananas,
// but not both. The total weight of all the bananas is 3 times the weight of
// all the apples. Which boxes contain apples?"
// Box 1: 7 kg · Box 2: 5 kg · Box 3: 6 kg · Box 4: 2 kg · Box 5: 16 kg
// Answer E: boxes 1 and 4 (7+2=9 kg apples; 27 kg bananas = 3×9).
//
// The source figure (docs/reference/ocr-res/ikmc/contest/ecolier/2021.imgs/062–066)
// shows five 3-D rectangular crates drawn in perspective: a front face, a top face,
// and a right side face.  Each crate carries a bold weight label ("7 kg") centred
// on the front face and a small circled box-number (①②③④⑤) at the lower-right
// corner of the front face.
//
// This file draws ONLY the problem setup — the five crates with their labels.
// It never marks which crates hold apples and never reveals the answer.
//
// The co-exported primitive `BoxWeights22EC` accepts a `litBoxes` prop (0-based
// indices, same convention as AppleBoxes25G1) so the explainer can highlight
// the apple boxes after the reasoning.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── colour palette (qupu tokens) ──────────────────────────────────────────────
const INK = '#1F2937'           // default text / outline
const CRATE_FRONT = '#FFF9F4'  // qupu-shell — front face fill
const CRATE_TOP   = '#E4DACB'  // warm grey — top face (lighter shade for depth)
const CRATE_SIDE  = '#D3C4B0'  // slightly darker warm grey — right side face
const CRATE_STROKE = '#9C7F5E' // warm brown outline
const LIT_FRONT   = '#FFF2DF'  // qupu-cream — highlighted front face
const LIT_TOP     = '#F5D9BE'  // highlighted top face
const LIT_SIDE    = '#ECC99C'  // highlighted right side face
const LIT_STROKE  = '#30598A'  // qupu-brand-blue — highlighted outline
const CIRCLE_FILL = '#1F2937'  // circled number background
const CIRCLE_TEXT = '#FFFFFF'  // circled number text

// ── crate geometry ────────────────────────────────────────────────────────────
/** Front face width. */
const CW = 68
/** Front face height. */
const CH = 48
/** Isometric offset for the top / right faces (depth in px). */
const D  = 14
/** Gap between crates. */
const GAP = 18
/** Outer SVG padding. */
const PAD = 16

// Q22 data — fixed from the OCR source.
export const BOX_WEIGHTS = [7, 5, 6, 2, 16] as const

const BOX_COUNT = BOX_WEIGHTS.length

// Total SVG dimensions.
const TOTAL_W = PAD * 2 + BOX_COUNT * CW + (BOX_COUNT - 1) * GAP + D
const TOTAL_H = PAD * 2 + D + CH

// ── Crate primitive ───────────────────────────────────────────────────────────

/**
 * One 3-D crate drawn in simple isometric-ish projection.
 *
 * @param x       Left edge of the front face.
 * @param y       Top edge of the front face (after adding the top-face offset).
 * @param weight  Weight label (e.g. 7 → "7 kg").
 * @param num     Box number 1–5 (displayed in the circled label).
 * @param lit     Whether this crate is highlighted (apple boxes).
 */
function Crate({
  x,
  y,
  weight,
  num,
  lit,
}: {
  x: number
  y: number
  weight: number
  num: number
  lit: boolean
}) {
  const front  = lit ? LIT_FRONT  : CRATE_FRONT
  const top    = lit ? LIT_TOP    : CRATE_TOP
  const side   = lit ? LIT_SIDE   : CRATE_SIDE
  const stroke = lit ? LIT_STROKE : CRATE_STROKE
  const sw     = lit ? 2.4 : 1.8

  // Corner points for the top face (parallelogram above the front face).
  //   TL → TR → TR+D → TL+D  (D = depth vector going up-right)
  const topFace = [
    [x,       y],
    [x + CW,  y],
    [x + CW + D, y - D],
    [x + D,      y - D],
  ]
  const topPts = topFace.map(([px, py]) => `${px},${py}`).join(' ')

  // Right-side face: front-right-top to front-right-bottom, then add D.
  const rightFace = [
    [x + CW,       y],
    [x + CW,       y + CH],
    [x + CW + D,   y + CH - D],
    [x + CW + D,   y - D],
  ]
  const rightPts = rightFace.map(([px, py]) => `${px},${py}`).join(' ')

  // Front face centroid for the weight label.
  const labelX = x + CW / 2
  const labelY = y + CH / 2

  // Small circle number — bottom-right corner of front face.
  const circleX = x + CW - 12
  const circleY = y + CH - 10

  return (
    <g>
      {/* top face */}
      <polygon points={topPts} fill={top} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* right side face */}
      <polygon points={rightPts} fill={side} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* front face */}
      <rect x={x} y={y} width={CW} height={CH} rx={3} fill={front} stroke={stroke} strokeWidth={sw} />

      {/* weight label — e.g. "7 kg" */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        fill={lit ? LIT_STROKE : INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {weight} kg
      </text>

      {/* circled box number */}
      <circle cx={circleX} cy={circleY} r={8} fill={lit ? LIT_STROKE : CIRCLE_FILL} />
      <text
        x={circleX}
        y={circleY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill={CIRCLE_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {num}
      </text>
    </g>
  )
}

// ── The row of five crates ────────────────────────────────────────────────────

/**
 * The shared primitive: a row of five labelled crates.
 *
 * @param litBoxes  0-based crate indices to highlight (defaults to none).
 *                  Out-of-range / non-array input is ignored.
 */
export function BoxWeights22EC({ litBoxes }: { litBoxes?: number[] } = {}) {
  const litSet = new Set(
    (Array.isArray(litBoxes) ? litBoxes : []).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < BOX_COUNT,
    ),
  )

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BOX_WEIGHTS.map((w, i) => {
        // x starts at PAD; each crate occupies (CW + GAP).
        const x = PAD + i * (CW + GAP)
        // y sits D pixels below the top pad so the top face fits.
        const y = PAD + D
        return (
          <Crate
            key={i}
            x={x}
            y={y}
            weight={w}
            num={i + 1}
            lit={litSet.has(i)}
          />
        )
      })}
    </svg>
  )
}

// ── Default export: the static stem illustration ──────────────────────────────

export default function BoxWeights22ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lima kotak dengan berat: Kotak 1 = 7 kg, Kotak 2 = 5 kg, Kotak 3 = 6 kg, ' +
        'Kotak 4 = 2 kg, Kotak 5 = 16 kg. Setiap kotak berisi apel atau pisang.'
      }
    >
      <BoxWeights22EC />
    </div>
  )
}
