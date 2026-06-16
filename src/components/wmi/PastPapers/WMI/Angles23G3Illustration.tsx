// WMI-23F3A-Q2 (2023 Grade 3 Final) — "measure with your eyes" angle ordering.
//
// The three stylized block letters W M I carry four marked angles:
//   ∠1 — the sharp inner bottom "V" of the W (very acute, the smallest).
//   ∠2 — the upper-left interior of the M (left stroke ∠ first inner diagonal).
//   ∠3 — the wider interior bottom "V" of the M.
//   ∠4 — the top-right corner of the I: a RIGHT ANGLE (square mark = 90°).
// The learner orders ∠1..∠4 from largest to smallest. The static figure shows
// ONLY the four angles; it must NOT reveal the ordering nor that ∠4 wins.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. A co-exported
// `WmiAngleLetters` primitive lets the animator emphasize one angle
// (`highlight`) and reveal the 90° tag on ∠4 (`showValues`) post-answer. With
// the defaults (null / false) it is the plain problem figure that reveals
// nothing.

// Dark block-letter ink. No qupu token maps to this near-black; the codebase
// uses raw hex for un-tokened colours (e.g. #E11D48 in Letters22G1).
const LETTER_INK = '#2B2119'
const STROKE_W = 13 // block-letter stroke thickness

type Pt = [number, number]

// --- letter geometry --------------------------------------------------------
// Each letter is authored in its own local coordinate box (x right, y down),
// then translated into place. Strokes are heavy round-joined polylines so the
// thick caps read as solid block letters.

// W: four slanted strokes forming two outer "V"s and a sharp central peak.
// Bottom-centre is the acute inner notch where ∠1 sits.
const W_STROKE: Pt[] = [
  [4, 6],
  [26, 92],
  [44, 30],
  [62, 92],
  [84, 6],
]
// The ∠1 vertex is the central bottom dip of the W — between the two inner
// strokes [26,92]->[44,30] and [44,30]->[62,92]. Its apex is at [44,30].
const W_A1: Pt = [44, 30]

// M: left stem up, inner diagonal down to a wide bottom V, inner diagonal up,
// right stem. ∠2 = top-left interior; ∠3 = bottom interior V.
const M_STROKE: Pt[] = [
  [6, 96],
  [6, 6],
  [44, 78],
  [82, 6],
  [82, 96],
]
const M_A2: Pt = [6, 6] // upper-left interior corner (∠2)
const M_A3: Pt = [44, 78] // bottom interior "V" apex (∠3)

// I: serif capital — thick top bar, central stem, thick bottom bar. ∠4 is the
// top-right corner of the top bar (a right angle).
const I_TOP_Y = 8
const I_BOT_Y = 96
const I_LEFT = 6
const I_RIGHT = 70
const I_MIDX = 38
const I_A4: Pt = [I_RIGHT, I_TOP_Y] // top-right corner of the I (∠4, = 90°)

const ARIA =
  'Tiga huruf balok W, M, dan I. Pada huruf-huruf ini ditandai empat sudut: ' +
  'sudut 1 di lekukan tajam bagian bawah huruf W, sudut 2 di sudut kiri-atas huruf M, ' +
  'sudut 3 di lekukan bawah huruf M, dan sudut 4 di pojok kanan-atas huruf I yang berupa sudut siku-siku. ' +
  'Urutkan sudut 1, 2, 3, dan 4 dari yang terbesar ke yang terkecil.'

export interface WmiAngleLettersProps {
  /** Emphasize one angle's arc (brighter + thicker) for the post-answer reveal. */
  highlight?: 1 | 2 | 3 | 4 | null
  /** Show the right-angle "90°" tag on ∠4 only (animator post-answer). */
  showValues?: boolean
}

// Small arc mark for an angle: a circular arc centred at `vertex`, swept between
// the directions toward `a` and `b`, at radius `r`.
function angleArc(vertex: Pt, a: Pt, b: Pt, r: number): string {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let a1 = ang(b)
  // shortest sweep
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const sweep = d >= 0 ? 1 : 0
  const x0 = vertex[0] + r * Math.cos(a0)
  const y0 = vertex[1] + r * Math.sin(a0)
  const x1 = vertex[0] + r * Math.cos(a1)
  const y1 = vertex[1] + r * Math.sin(a1)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`
}

// Midpoint direction (unit) of an angle's bisector, pointing into the wedge.
function bisectorPoint(vertex: Pt, a: Pt, b: Pt, dist: number): Pt {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let a1 = ang(b)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const mid = (a0 + a1) / 2
  return [vertex[0] + dist * Math.cos(mid), vertex[1] + dist * Math.sin(mid)]
}

// Right-angle square mark at `vertex`, with legs toward `a` and `b`, side `s`.
function rightAnglePath(vertex: Pt, a: Pt, b: Pt, s: number): string {
  const unit = (p: Pt): Pt => {
    const dx = p[0] - vertex[0]
    const dy = p[1] - vertex[1]
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len]
  }
  const u = unit(a)
  const v = unit(b)
  const p1: Pt = [vertex[0] + u[0] * s, vertex[1] + u[1] * s]
  const p3: Pt = [vertex[0] + v[0] * s, vertex[1] + v[1] * s]
  const p2: Pt = [p1[0] + v[0] * s, p1[1] + v[1] * s]
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`
}

/**
 * The three block letters W M I with the four marked angles. With the defaults
 * it is the plain problem figure (no highlight, no values). `highlight` brightens
 * and thickens one arc; `showValues` reveals the 90° label on ∠4.
 */
export function WmiAngleLetters({ highlight = null, showValues = false }: WmiAngleLettersProps = {}) {
  // --- layout -------------------------------------------------------------
  const letterBoxW = 90 // local-coordinate width of each letter box
  const letterBoxH = 104
  const gap = 30 // gap between letters
  const margin = 26 // outer headroom so arcs / labels never clip

  // local-x origins of W, M, I
  const wx = margin
  const mx = wx + letterBoxW + gap
  const ix = mx + letterBoxW + gap
  const topY = margin

  const width = ix + letterBoxW + margin
  const height = topY + letterBoxH + margin

  // translate a letter-local point into the global frame
  const T = (ox: number, pt: Pt): Pt => [ox + pt[0], topY + pt[1]]
  const poly = (ox: number, pts: Pt[]) =>
    pts.map(([x, y]) => `${ox + x},${topY + y}`).join(' ')

  // --- I strokes (built explicitly, not a single polyline) ----------------
  const iTopBar: Pt = [I_LEFT, I_TOP_Y]
  const iTopBarR: Pt = [I_RIGHT, I_TOP_Y]
  const iStemTop: Pt = [I_MIDX, I_TOP_Y]
  const iStemBot: Pt = [I_MIDX, I_BOT_Y]
  const iBotBarL: Pt = [I_LEFT, I_BOT_Y]
  const iBotBarR: Pt = [I_RIGHT, I_BOT_Y]

  // --- angle mark definitions (vertex + the two leg directions) -----------
  // Each leg direction is given as a neighbouring stroke point in local coords.
  const arcs: Array<{
    id: 1 | 2 | 3 | 4
    ox: number
    vertex: Pt
    a: Pt
    b: Pt
    r: number
    labelDist: number
    right?: boolean
  }> = [
    // ∠1 — W bottom inner notch (very acute). Legs go up-left and up-right.
    { id: 1, ox: wx, vertex: W_A1, a: [26, 92], b: [62, 92], r: 16, labelDist: 30 },
    // ∠2 — M upper-left interior. Legs: down the left stem, down the inner diag.
    { id: 2, ox: mx, vertex: M_A2, a: [6, 96], b: [44, 78], r: 22, labelDist: 38 },
    // ∠3 — M bottom interior V. Legs go up-left and up-right.
    { id: 3, ox: mx, vertex: M_A3, a: [6, 6], b: [82, 6], r: 22, labelDist: 36 },
    // ∠4 — I top-right corner: RIGHT angle. Legs: along the top bar + down stem.
    { id: 4, ox: ix, vertex: I_A4, a: iTopBar, b: iBotBarR, r: 18, labelDist: 30, right: true },
  ]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(360, width)} aria-hidden="true">
      {/* W — single heavy polyline */}
      <polyline
        points={poly(wx, W_STROKE)}
        fill="none"
        stroke={LETTER_INK}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* M — single heavy polyline */}
      <polyline
        points={poly(mx, M_STROKE)}
        fill="none"
        stroke={LETTER_INK}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* I — three strokes: top bar, stem, bottom bar */}
      <polyline
        points={poly(ix, [iTopBar, iTopBarR])}
        fill="none"
        stroke={LETTER_INK}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
      <polyline
        points={poly(ix, [iStemTop, iStemBot])}
        fill="none"
        stroke={LETTER_INK}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
      <polyline
        points={poly(ix, [iBotBarL, iBotBarR])}
        fill="none"
        stroke={LETTER_INK}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />

      {/* angle marks + labels */}
      {arcs.map((m) => {
        const v = T(m.ox, m.vertex)
        const a = T(m.ox, m.a)
        const b = T(m.ox, m.b)
        const lit = highlight === m.id
        const arcStroke = lit ? 'stroke-qupu-brand-orange' : 'stroke-qupu-brand-blue'
        const arcW = lit ? 4 : 2.4
        const label = bisectorPoint(v, a, b, m.labelDist)
        return (
          <g key={m.id}>
            {m.right ? (
              <path
                d={rightAnglePath(v, a, b, 13)}
                fill="none"
                className={arcStroke}
                strokeWidth={arcW}
                strokeLinejoin="round"
              />
            ) : (
              <path
                d={angleArc(v, a, b, m.r)}
                fill="none"
                className={arcStroke}
                strokeWidth={arcW}
                strokeLinecap="round"
              />
            )}
            {/* angle label "1".."4" placed along the bisector */}
            <text
              x={label[0]}
              y={label[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fontStyle="italic"
              fontWeight={600}
              fill={LETTER_INK}
            >
              {m.id}
            </text>
            {/* 90° tag on ∠4 only, animator post-answer */}
            {m.right && showValues && (
              <text
                x={v[0] + 22}
                y={v[1] - 6}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={700}
                className="fill-qupu-brand-orange"
              >
                90°
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Default export: the plain W M I problem figure with the four marked angles and
 * nothing else — no highlight, no values. Reveals neither the ordering nor that
 * ∠4 is the largest.
 */
export default function Angles23G3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <WmiAngleLetters />
    </div>
  )
}
