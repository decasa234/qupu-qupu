/**
 * Parrots21ECIllustration — IKMC-20-EC-Q21
 *
 * "Jane has some pictures of parrots. She wants to colour only the head, tail
 * and wings of each parrot either red, blue or green so that all three colours
 * are used on each picture. She colours one parrot's head red, its wings green
 * and its tail blue. How many more parrots can she colour so that all the
 * parrots are coloured differently?"
 *
 * Stem figure: a single parrot whose three parts (head, wings, tail) are
 * labelled but not yet coloured — the PROBLEM, not the answer.
 *
 * Source scan: docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/049.jpg
 * — a simple cartoon parrot line drawing. Reproduced here as pure SVG.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe & deterministic.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
// Uncoloured body parts are white with a dark stroke; labels use qupu-blue ink.
export const P21_COLORS = {
  BODY: '#F5F0E8',      // warm off-white body
  STROKE: '#2D2D2D',    // dark outline
  BEAK: '#F5A623',      // orange beak
  EYE: '#2D2D2D',       // dark eye
  LABEL_INK: '#30598A', // qupu-brand-blue for part labels
  LABEL_BG: '#E8F0FB',  // light blue label chip
} as const

// ── SVG layout ───────────────────────────────────────────────────────────────
export const P21_W = 260
export const P21_H = 220

// ── Parrot body primitive ─────────────────────────────────────────────────────
// A simplified side-view cartoon parrot:
//   - round body (torso + head as overlapping ellipses)
//   - wing on the side
//   - tail feathers at the rear
//   - beak on the head
//   - eye on the head

export interface ParrotProps {
  /** Fill for the head region (default: body colour). */
  headFill?: string
  /** Fill for the wings region (default: body colour). */
  wingFill?: string
  /** Fill for the tail region (default: body colour). */
  tailFill?: string
  /** Stroke for all parts (default: dark). */
  stroke?: string
}

/**
 * ParrotPrimitive — shared between Illustration (uncoloured) and Explainer
 * (coloured per beat). All coordinates are in a 200×180 sub-canvas, centred
 * inside the P21_W × P21_H viewBox.
 *
 * Layout (x=offset 30, y=offset 20):
 *   Tail: leftmost, x 30–70, y 90–140
 *   Body: centre ellipse, cx 120, cy 110, rx 52, ry 42
 *   Wing: upper patch on the body, ellipse cx 105, cy 92, rx 32, ry 18
 *   Head: upper-right circle, cx 175, cy 68, r 32
 *   Beak: triangle to the right of head, points rightward
 *   Eye:  small circle inside head
 *   Foot: two short lines at bottom
 */
export function ParrotPrimitive({
  headFill = P21_COLORS.BODY,
  wingFill = P21_COLORS.BODY,
  tailFill = P21_COLORS.BODY,
  stroke = P21_COLORS.STROKE,
}: ParrotProps) {
  const sw = 2.2 // stroke width

  return (
    <g>
      {/* ── Tail ── 3 feather shapes radiating left-downward */}
      <g fill={tailFill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
        {/* top tail feather */}
        <ellipse cx={64} cy={112} rx={22} ry={8} transform="rotate(-30 64 112)" />
        {/* middle tail feather */}
        <ellipse cx={58} cy={124} rx={24} ry={8} transform="rotate(-10 58 124)" />
        {/* bottom tail feather */}
        <ellipse cx={62} cy={136} rx={20} ry={8} transform="rotate(15 62 136)" />
      </g>

      {/* ── Body ── main torso ellipse */}
      <ellipse
        cx={120} cy={115}
        rx={52} ry={44}
        fill={P21_COLORS.BODY}
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* ── Wing ── patch on the upper-left body */}
      <ellipse
        cx={104} cy={98}
        rx={33} ry={18}
        fill={wingFill}
        stroke={stroke}
        strokeWidth={sw}
        transform="rotate(-18 104 98)"
      />

      {/* ── Neck connector (no outline gap between head and body) */}
      <ellipse
        cx={158} cy={88}
        rx={22} ry={18}
        fill={P21_COLORS.BODY}
        stroke="none"
      />

      {/* ── Head ── */}
      <circle
        cx={170} cy={72}
        r={32}
        fill={headFill}
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* ── Crest / tuft on head top ── two small arcs */}
      <g fill={headFill} stroke={stroke} strokeWidth={1.6}>
        <ellipse cx={164} cy={42} rx={5} ry={10} transform="rotate(-15 164 42)" />
        <ellipse cx={174} cy={40} rx={5} ry={11} transform="rotate(5 174 40)" />
        <ellipse cx={183} cy={44} rx={4} ry={9} transform="rotate(20 183 44)" />
      </g>

      {/* ── Beak ── orange triangle pointing right */}
      <path
        d="M 200 66 L 220 72 L 200 80 Z"
        fill={P21_COLORS.BEAK}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* ── Eye ── */}
      <circle cx={180} cy={68} r={5} fill="#fff" stroke={stroke} strokeWidth={1.5} />
      <circle cx={181} cy={68} r={2.5} fill={P21_COLORS.EYE} />

      {/* ── Feet ── two thin lines at the bottom of the body */}
      <g stroke={stroke} strokeWidth={2} strokeLinecap="round">
        <line x1={108} y1={155} x2={104} y2={172} />
        <line x1={104} y1={172} x2={94} y2={176} />
        <line x1={104} y1={172} x2={110} y2={177} />
        <line x1={128} y1={157} x2={124} y2={174} />
        <line x1={124} y1={174} x2={114} y2={178} />
        <line x1={124} y1={174} x2={130} y2={179} />
      </g>
    </g>
  )
}

// ── Part label chips ──────────────────────────────────────────────────────────

/** Small rounded-rect label with a leader line pointing to a body part. */
function PartLabel({
  x, y,
  lineX2, lineY2,
  text,
}: {
  x: number; y: number
  lineX2: number; lineY2: number
  text: string
}) {
  const W = text.length * 6.8 + 14
  const H = 18
  return (
    <g>
      <line x1={x + W / 2} y1={y + H} x2={lineX2} y2={lineY2}
        stroke={P21_COLORS.LABEL_INK} strokeWidth={1.2} strokeDasharray="3 2" />
      <rect
        x={x} y={y} width={W} height={H} rx={5}
        fill={P21_COLORS.LABEL_BG} stroke={P21_COLORS.LABEL_INK} strokeWidth={1.2}
      />
      <text
        x={x + W / 2} y={y + H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={700} fill={P21_COLORS.LABEL_INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {text}
      </text>
    </g>
  )
}

// ── Default export — uncoloured stem figure ───────────────────────────────────

export default function Parrots21ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Seekor burung beo dengan kepala, sayap, dan ekor yang belum diwarnai. ' +
        'Setiap bagian akan diberi salah satu dari tiga warna: merah, biru, atau hijau.'
      }
    >
      <svg
        viewBox={`0 0 ${P21_W} ${P21_H}`}
        width="100%"
        style={{ maxWidth: P21_W, display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={P21_W} height={P21_H} fill="white" />

        {/* parrot — all parts uncoloured */}
        <ParrotPrimitive />

        {/* part labels */}
        <PartLabel x={0}   y={20}  lineX2={158} lineY2={65}  text="head / kepala" />
        <PartLabel x={50}  y={65}  lineX2={104} lineY2={94}  text="wings / sayap" />
        <PartLabel x={0}   y={112} lineX2={60}  lineY2={124} text="tail / ekor" />
      </svg>
    </div>
  )
}
