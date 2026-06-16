// WMI-25F1A-Q21 (2025 Grade 1 Final) — CONSISTENT interpretation.
//
// "Fill 1-10 into the circles (no repeats) so that two opposite circles marked
// with the same figure always add up to the same sum. With some numbers already
// filled in, find the sum of all the numbers that could go in the shaded
// circle."  Answer: 10 (fill-in).
//
// THE PUZZLE: ten circles sit around a centre, joined into FIVE diametrically-
// opposite pairs by five lines through the middle. Each pair carries a matching
// little shape mark (star, dot, hexagon, square, crescent — one shape per pair),
// so the two circles of a pair must add to the same sum as every other pair.
//
// REASONING (put in the header so the step-explainer and animator agree):
//   1 + 2 + ... + 10 = 55, split into 5 equal-sum opposite pairs, so every
//   opposite pair must sum to 55 / 5 = 11.
//   Givens 7, 9, 1 are placed in three circles; the SHADED circle is the one
//   diametrically OPPOSITE the "1". A pair summing to 11 forces the partner of 1
//   to be 11 - 1 = 10. The shaded circle IS that partner, so it can ONLY be 10.
//   The sum of all numbers that could go there = 10.
//
// The static figure draws ONLY the setup — the ring, the five pair-shape marks,
// the three givens (7, 9, 1), and the shaded circle left empty. It NEVER writes
// 10 into the shaded circle. Revealing 10 is the animator's job, via the
// co-exported primitive's `revealShaded` prop.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // ring outlines, spokes, numerals
const BLUE = '#30598A' // qupu-brand-blue — given numerals
const ORANGE = '#f0853a' // qupu-brand-orange — shaded circle accent + reveal
const SHADE_FILL = '#FDE3CF' // peach wash inside the shaded circle
const PAIR_MARK = '#7A8A99' // muted slate for the small pair-shape marks
const WHITE = '#FFFFFF'

// Ten ring positions, indices 0..9 clockwise from the top. Opposite of i is
// (i + 5) % 10. Givens and the shaded circle are pinned to fixed positions so the
// "1" and the shaded circle sit on the same diameter (positions 4 and 9 here).
const RING_N = 10
const TOP_ANGLE = -90 // index 0 at the top (degrees, SVG y grows downward)
const STEP = 360 / RING_N

// Each diametrically-opposite pair shares one shape mark. Five shapes, one per
// diameter. Pair p covers positions p and p+5.
type PairShape = 'star' | 'dot' | 'hex' | 'square' | 'crescent'
const PAIR_SHAPES: PairShape[] = ['star', 'dot', 'hex', 'square', 'crescent']

// Pre-filled givens, pinned to positions. Position 4 holds the "1"; its opposite
// (position 9) is the SHADED circle. 7 and 9 sit on two other circles.
const GIVENS: Record<number, number> = { 1: 7, 7: 9, 4: 1 }
const SHADED_POS = 9 // diametrically opposite position 4 (the "1")
const SHADED_ANSWER = 11 - GIVENS[4] // 11 - 1 = 10

export { SHADED_ANSWER }

// ---- layout ----------------------------------------------------------------
const PAD = 22 // headroom so the outer circles + marks never clip
const RING_R = 92 // radius of the ring of circle-centres
const NODE_R = 20 // radius of each numbered circle
const MARK_R = RING_R - NODE_R - 12 // radius where the pair-shape marks sit
const CENTER = PAD + RING_R + NODE_R // svg centre coordinate
const VIEW = (PAD + RING_R + NODE_R) * 2

/** Position index -> {x, y} of that circle's centre. */
function nodeCenter(i: number): { x: number; y: number } {
  const a = ((TOP_ANGLE + i * STEP) * Math.PI) / 180
  return { x: CENTER + RING_R * Math.cos(a), y: CENTER + RING_R * Math.sin(a) }
}

/** Point on the spoke at radius MARK_R for the pair-shape mark of position i. */
function markCenter(i: number): { x: number; y: number } {
  const a = ((TOP_ANGLE + i * STEP) * Math.PI) / 180
  return { x: CENTER + MARK_R * Math.cos(a), y: CENTER + MARK_R * Math.sin(a) }
}

/** Draw one small pair-shape mark (basic shapes only) centred at (x,y). */
function PairMark({ shape, x, y }: { shape: PairShape; x: number; y: number }) {
  const r = 6.5
  switch (shape) {
    case 'dot':
      return <circle cx={x} cy={y} r={r * 0.8} fill={PAIR_MARK} />
    case 'square':
      return <rect x={x - r * 0.85} y={y - r * 0.85} width={r * 1.7} height={r * 1.7} rx={1.5} fill={PAIR_MARK} />
    case 'hex': {
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = ((60 * k - 90) * Math.PI) / 180
        return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`
      }).join(' ')
      return <polygon points={pts} fill={PAIR_MARK} />
    }
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, k) => {
        const rr = k % 2 === 0 ? r : r * 0.45
        const a = ((36 * k - 90) * Math.PI) / 180
        return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`
      }).join(' ')
      return <polygon points={pts} fill={PAIR_MARK} />
    }
    case 'crescent':
      return (
        <path
          d={`M ${x + r * 0.35} ${y - r}
              A ${r} ${r} 0 1 0 ${x + r * 0.35} ${y + r}
              A ${r * 0.72} ${r * 0.72} 0 1 1 ${x + r * 0.35} ${y - r} Z`}
          fill={PAIR_MARK}
        />
      )
  }
}

export interface CircleSums25G1Props {
  /** Fill the shaded circle with its only possible value (10) — animator beat. */
  revealShaded?: boolean
}

/**
 * Bare 10-circle ring primitive: five opposite-pair shape marks, the three
 * givens (7, 9, 1), and the shaded circle. With no props it reveals nothing.
 *
 * @param revealShaded  When true, writes 10 into the shaded circle (the forced
 *                       partner of the "1"). Used post-answer by the animator;
 *                       the default static figure leaves it empty.
 */
export function CircleSums25G1({ revealShaded = false }: CircleSums25G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(280, VIEW)} aria-hidden="true">
      {/* five spokes through the centre, one per opposite pair */}
      {PAIR_SHAPES.map((_, p) => {
        const a = nodeCenter(p)
        const b = nodeCenter(p + 5)
        return <line key={`spoke-${p}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={2} strokeOpacity={0.45} />
      })}

      {/* pair-shape marks: same shape on both ends of each diameter */}
      {PAIR_SHAPES.map((shape, p) => {
        const m1 = markCenter(p)
        const m2 = markCenter(p + 5)
        return (
          <g key={`mark-${p}`}>
            <PairMark shape={shape} x={m1.x} y={m1.y} />
            <PairMark shape={shape} x={m2.x} y={m2.y} />
          </g>
        )
      })}

      {/* the ten numbered circles */}
      {Array.from({ length: RING_N }, (_, i) => {
        const c = nodeCenter(i)
        const isShaded = i === SHADED_POS
        const given = GIVENS[i]
        const fill = isShaded ? SHADE_FILL : WHITE
        const stroke = isShaded ? ORANGE : INK
        const strokeW = isShaded ? 3 : 2.4
        // numeral to show: given number, or 10 in the shaded circle once revealed
        const value = given ?? (isShaded && revealShaded ? SHADED_ANSWER : null)
        const valueFill = isShaded ? ORANGE : BLUE
        return (
          <g key={`node-${i}`}>
            <circle cx={c.x} cy={c.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={strokeW} />
            {value != null && (
              <text
                x={c.x}
                y={c.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontWeight={700}
                fill={valueFill}
                className="font-display"
              >
                {value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare ring inside the card (no box, no answer revealed). */
export default function CircleSums25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lingkaran berisi sepuluh lingkaran kecil yang disusun melingkar dan dihubungkan berpasangan oleh lima garis melalui pusat; setiap pasangan berlawanan diberi tanda bentuk yang sama. Tiga lingkaran sudah terisi angka 7, 9, dan 1. Satu lingkaran yang diarsir berada tepat berseberangan dengan angka 1 dan masih kosong. Setiap pasangan berlawanan harus berjumlah sama; carilah jumlah semua angka yang mungkin mengisi lingkaran yang diarsir."
    >
      <CircleSums25G1 />
    </div>
  )
}
