// Shape-combination rule figure for WMI-19P2A-Q6 (2019 Semifinal Grade 2).
//
// Source figure (db/seed/wmi/figures/2019-semifinal-g2-a-q6.jpg): a dotted
// rounded box holding ONE worked rule —
//     ◯  +  ▽-on-a-stem   ⇒   a "Y": an open cup on top, the stick splitting
//                              into a Y, with a solid ▲ at the foot.
// Reading the rule: the FIRST (top) shape becomes the open cup at the top of the
// frame; the SECOND (the solid stemmed shape) becomes the solid blob at the foot.
//
// The question then asks: by the SAME rule, triangle + stemmed bowl ⇒ which
// figure? (choices were images; the seed answer is A.)
//
// The static QUESTION figure shows the worked rule PLUS the new operands
// (triangle + stemmed bowl ⇒ ?). It NEVER draws the constructed result and
// never names a choice letter — that is the explainer's job, post-answer, via
// the co-exported Combine primitive.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#1F2937'
const SOLID = '#7C8794' // gray fill matching the paper's solid shapes
const GREEN = '#10B981'

// ---------------------------------------------------------------------------
// Reusable shape glyphs. Each is centred at (cx, cy) within a ~46px box.

/** Open circle outline. */
function CircleGlyph({ cx, cy, r = 20 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.5} />
}

/** Open (outline) upward triangle. */
function TriangleGlyph({ cx, cy, s = 22, fill = 'none' }: { cx: number; cy: number; s?: number; fill?: string }) {
  const pts = `${cx},${cy - s} ${cx - s},${cy + s * 0.8} ${cx + s},${cy + s * 0.8}`
  return <polygon points={pts} fill={fill} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
}

/** A stemmed shape: a solid head on a thin vertical stem (a "funnel" or "bowl"). */
function StemmedGlyph({
  cx,
  cy,
  kind,
}: {
  cx: number
  cy: number
  kind: 'funnel' | 'bowl'
}) {
  const headHalf = 16
  const headTop = cy - 22
  const stemBottom = cy + 22
  return (
    <g>
      {kind === 'funnel' ? (
        // solid downward triangle (funnel) feeding a stem
        <polygon
          points={`${cx - headHalf},${headTop} ${cx + headHalf},${headTop} ${cx},${headTop + 24}`}
          fill={SOLID}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ) : (
        // solid bowl (a filled half-disc opening up) feeding a stem
        <path
          d={`M ${cx - headHalf} ${headTop + 2} A ${headHalf} ${headHalf} 0 0 0 ${cx + headHalf} ${headTop + 2} Z`}
          fill={SOLID}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {/* stem */}
      <line x1={cx} y1={kind === 'funnel' ? headTop + 24 : headTop + headHalf} x2={cx} y2={stemBottom} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** A "+" operator. */
function Plus({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK}>
      +
    </text>
  )
}

/** A "⇒" arrow operator. */
function Implies({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <line x1={cx - 14} y1={cy - 4} x2={cx + 10} y2={cy - 4} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx - 14} y1={cy + 4} x2={cx + 10} y2={cy + 4} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${cx + 16},${cy} ${cx + 6},${cy - 7} ${cx + 6},${cy + 7}`} fill={INK} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// The combined "Y" result: TOP shape sits as an open cup at the top of a
// Y-frame; the stem splits into a Y and carries the SOLID bottom shape at the
// foot. `top` selects the cup glyph; `bottomKind` selects the solid foot shape.
// Used by both the worked rule (circle/funnel) and, in the explainer, the new
// answer (triangle/bowl). The question figure only draws it for the worked rule.
export type TopShape = 'circle' | 'triangle'
export type BottomKind = 'funnel' | 'bowl'

export function Combine({
  cx,
  cy,
  top,
  bottomKind,
  highlight = false,
}: {
  cx: number
  cy: number
  top: TopShape
  bottomKind: BottomKind
  highlight?: boolean
}) {
  // Geometry (matches the source "Y"): a single stem rises from the foot to a
  // fork, then two short arms splay UP-and-OUT to the rim of an OPEN cup (the
  // top shape opened upward). The solid foot shape sits at the base.
  const rimY = cy - 24 // height of the cup's rim
  const rimHalf = 20 // half-width of the cup opening
  const forkY = cy + 2 // where the two arms meet the stem
  const armX = 11 // how far the arms splay out at the rim
  const footTopY = cy + 12
  const footBotY = cy + 34
  const footHalf = 17
  const stroke = highlight ? GREEN : INK
  return (
    <g>
      {/* central stem from foot up to the fork */}
      <line x1={cx} y1={footTopY} x2={cx} y2={forkY} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      {/* two arms splaying up-and-out from the fork to the cup rim ends */}
      <line x1={cx} y1={forkY} x2={cx - rimHalf + armX} y2={rimY} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx} y1={forkY} x2={cx + rimHalf - armX} y2={rimY} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      {/* the top shape as an OPEN cup opening upward, spanning the rim */}
      {top === 'circle' ? (
        // lower half of a circle = a U-shaped bowl opening up
        <path
          d={`M ${cx - rimHalf} ${rimY} A ${rimHalf} ${rimHalf} 0 0 0 ${cx + rimHalf} ${rimY}`}
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
        />
      ) : (
        // triangle cup: an open V opening upward (triangle "cut open" at the top)
        <polyline
          points={`${cx - rimHalf} ${rimY} ${cx} ${rimY + rimHalf} ${cx + rimHalf} ${rimY}`}
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      {/* short arms continue out to the rim tips so the cup reads as a wide bowl */}
      <line x1={cx - rimHalf + armX} y1={rimY} x2={cx - rimHalf} y2={rimY} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + rimHalf - armX} y1={rimY} x2={cx + rimHalf} y2={rimY} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      {/* solid foot shape — the second shape's solid head, sitting on the base */}
      {bottomKind === 'funnel' ? (
        // solid UPWARD triangle (the funnel's head, flipped to a base)
        <polygon
          points={`${cx},${footTopY} ${cx - footHalf},${footBotY} ${cx + footHalf},${footBotY}`}
          fill={SOLID}
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ) : (
        // solid bowl (a filled half-disc opening up) at the base
        <path
          d={`M ${cx - footHalf} ${footTopY} A ${footHalf} ${footHalf} 0 0 0 ${cx + footHalf} ${footTopY} Z`}
          fill={SOLID}
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
export const Q6_VIEW_W = 320
export const Q6_VIEW_H = 220

export interface RuleBoardProps {
  /** When true, also render the constructed answer in the "?" slot (explainer). */
  revealAnswer?: boolean
}

/**
 * Primitive board: the dotted-frame worked rule on the top row, and the new
 * question (triangle + bowl ⇒ ?) on the bottom row. With revealAnswer the "?"
 * is replaced by the constructed result (triangle-cup over solid bowl).
 */
export function RuleBoard({ revealAnswer = false }: RuleBoardProps) {
  const topY = 56
  const botY = 158
  return (
    <svg
      viewBox={`0 0 ${Q6_VIEW_W} ${Q6_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q6_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* dotted rounded frame around the worked rule */}
      <rect
        x={8}
        y={14}
        width={Q6_VIEW_W - 16}
        height={84}
        rx={14}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {/* --- worked rule: circle + funnel ⇒ combined --- */}
      <CircleGlyph cx={44} cy={topY} />
      <Plus cx={84} cy={topY} />
      <StemmedGlyph cx={124} cy={topY} kind="funnel" />
      <Implies cx={176} cy={topY} />
      <Combine cx={236} cy={topY} top="circle" bottomKind="funnel" />

      {/* --- the new question: triangle + bowl ⇒ ? --- */}
      <TriangleGlyph cx={44} cy={botY} />
      <Plus cx={84} cy={botY} />
      <StemmedGlyph cx={124} cy={botY} kind="bowl" />
      <Implies cx={176} cy={botY} />
      {revealAnswer ? (
        <Combine cx={236} cy={botY} top="triangle" bottomKind="bowl" highlight />
      ) : (
        <text x={236} y={botY} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={900} fill={INK}>
          ?
        </text>
      )}
    </svg>
  )
}

const ARIA =
  'Aturan dalam bingkai bertitik: lingkaran ditambah corong bertangkai menghasilkan bentuk gabungan berbentuk Y, ' +
  'dengan cangkir terbuka di atas dan bentuk padat di kaki. ' +
  'Pertanyaan: segitiga ditambah mangkuk bertangkai menghasilkan gambar yang mana?'

/**
 * Question figure — the worked rule plus the new "triangle + bowl ⇒ ?" line.
 * No constructed answer, no choice letter.
 */
export default function P19G2Q6Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <RuleBoard />
    </div>
  )
}
