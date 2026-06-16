// WMI-23P2A-Q7 (2023 Grade 2 Semifinal, Paper A) — "Ribbons on a ruler".
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g2-a-q7.jpg:
//   • A ruler scaled 0–6 cm (with mm minor ticks).
//   • Four red arrowheads with dashed drop-lines at 1.0, 2.2, 4.3 and 6.0 cm.
//   • Ribbon A is a bar under the ruler spanning 1.0 cm → 4.3 cm  (= 33 mm).
//   • Ribbon B is a bar under the ruler spanning 2.2 cm → 6.0 cm  (= 38 mm).
// Question: the difference of the two lengths in mm = 38 − 33 = 5 mm  (answer C — NOT shown here).
//
// The static figure shows ONLY the problem (ruler + two ribbons + the four guide
// lines); it never reveals a length or the difference.

// ----- ruler scale -------------------------------------------------------
export const CM_LEFT = 0
export const CM_RIGHT = 6
const CM_SPAN = CM_RIGHT - CM_LEFT // 6 cm visible

const VW = 360
const VH = 200

const RULER_X0 = 24 // left edge of the ruler body
const RULER_W = 312 // ruler body width
const RULER_Y = 18 // top edge of ruler body
const RULER_H = 40 // ruler body height

// Leave headroom on the right so the "0..6" scale does not run into the edge.
const PX_PER_CM = (RULER_W - 36) / CM_SPAN

export function cmX(cm: number): number {
  return RULER_X0 + 14 + (cm - CM_LEFT) * PX_PER_CM
}

// The two ribbons (left cm, right cm). Bottoms of the bars hang below the ruler.
export const RIBBON_A = { from: 1.0, to: 4.3 } // 33 mm
export const RIBBON_B = { from: 2.2, to: 6.0 } // 38 mm

// y of each ribbon bar's top edge.
const ROW_A_Y = 104
const ROW_B_Y = 150
const BAR_H = 26

// The four guide lines drop from these cm marks (arrowheads on the ruler).
export const GUIDE_CM = [RIBBON_A.from, RIBBON_B.from, RIBBON_A.to, RIBBON_B.to] // 1.0, 2.2, 4.3, 6.0

const A_FILL = '#C7CBEF'
const A_STROKE = '#5A5FB0'
const B_FILL = '#F4C0C0'
const B_STROKE = '#C2585B'

export interface RibbonRulerSceneProps {
  /** Highlight ribbon A's span (draws its measured length bracket + mm label). */
  measureA?: boolean
  /** Highlight ribbon B's span. */
  measureB?: boolean
}

/**
 * The reusable ruler-with-ribbons scene. When `measureA` / `measureB` are set,
 * a mm bracket is drawn under that ribbon and its length is labelled.
 */
export function RibbonRulerScene({ measureA = false, measureB = false }: RibbonRulerSceneProps) {
  // minor mm ticks every 0.1 cm; half-cm and full-cm get taller ticks.
  const mmTicks: number[] = []
  for (let c = CM_LEFT; c <= CM_RIGHT + 0.001; c += 0.1) {
    const r = Math.round(c * 10) / 10
    const isCm = r === Math.round(r)
    const isHalf = Math.abs(r - Math.round(r)) === 0.5
    if (!isCm && !isHalf) mmTicks.push(r)
  }
  const halfTicks: number[] = []
  for (let c = CM_LEFT; c < CM_RIGHT; c++) halfTicks.push(c + 0.5)

  const lenAmm = Math.round((RIBBON_A.to - RIBBON_A.from) * 10)
  const lenBmm = Math.round((RIBBON_B.to - RIBBON_B.from) * 10)

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── RULER BODY ── */}
      <rect x={RULER_X0} y={RULER_Y} width={RULER_W} height={RULER_H} rx={4} fill="#FFFFFF" stroke="#475569" strokeWidth={1.6} />

      {/* mm ticks */}
      {mmTicks.map((c) => (
        <line key={`mm${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 7} stroke="#94A3B8" strokeWidth={0.7} />
      ))}
      {/* half-cm ticks */}
      {halfTicks.map((c) => (
        <line key={`hf${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 11} stroke="#64748B" strokeWidth={1} />
      ))}
      {/* full-cm ticks + labels */}
      {Array.from({ length: CM_SPAN + 1 }, (_, i) => CM_LEFT + i).map((c) => (
        <g key={`cm${c}`}>
          <line x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 16} stroke="#334155" strokeWidth={1.4} />
          <text x={cmX(c)} y={RULER_Y + 30} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
            {c}
          </text>
        </g>
      ))}

      {/* ── RED ARROWHEADS + DASHED DROP LINES ── */}
      {GUIDE_CM.map((c, i) => (
        <g key={`g${i}`}>
          {/* arrowhead sitting on the ruler's top edge */}
          <path d={`M ${cmX(c) - 6} ${RULER_Y - 12} L ${cmX(c) + 6} ${RULER_Y - 12} L ${cmX(c)} ${RULER_Y - 2} Z`} fill="#EF4444" />
          {/* dashed line dropping down through both ribbon rows */}
          <line
            x1={cmX(c)}
            y1={RULER_Y + RULER_H}
            x2={cmX(c)}
            y2={ROW_B_Y + BAR_H + 8}
            stroke="#94A3B8"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </g>
      ))}

      {/* ── RIBBON A ── */}
      <rect x={cmX(RIBBON_A.from)} y={ROW_A_Y} width={cmX(RIBBON_A.to) - cmX(RIBBON_A.from)} height={BAR_H} rx={2} fill={A_FILL} stroke={A_STROKE} strokeWidth={1.6} />
      <text x={cmX(RIBBON_A.from) - 12} y={ROW_A_Y + BAR_H / 2} textAnchor="end" dominantBaseline="central" fontSize={15} fontStyle="italic" fontWeight={700} fill={A_STROKE}>
        A
      </text>

      {/* ── RIBBON B ── */}
      <rect x={cmX(RIBBON_B.from)} y={ROW_B_Y} width={cmX(RIBBON_B.to) - cmX(RIBBON_B.from)} height={BAR_H} rx={2} fill={B_FILL} stroke={B_STROKE} strokeWidth={1.6} />
      <text x={cmX(RIBBON_B.from) - 12} y={ROW_B_Y + BAR_H / 2} textAnchor="end" dominantBaseline="central" fontSize={15} fontStyle="italic" fontWeight={700} fill={B_STROKE}>
        B
      </text>

      {/* ── measured length brackets (explainer only) ── */}
      {measureA && (
        <g>
          <line x1={cmX(RIBBON_A.from)} y1={ROW_A_Y - 8} x2={cmX(RIBBON_A.to)} y2={ROW_A_Y - 8} stroke={A_STROKE} strokeWidth={2} />
          <line x1={cmX(RIBBON_A.from)} y1={ROW_A_Y - 12} x2={cmX(RIBBON_A.from)} y2={ROW_A_Y - 4} stroke={A_STROKE} strokeWidth={2} />
          <line x1={cmX(RIBBON_A.to)} y1={ROW_A_Y - 12} x2={cmX(RIBBON_A.to)} y2={ROW_A_Y - 4} stroke={A_STROKE} strokeWidth={2} />
          <text x={(cmX(RIBBON_A.from) + cmX(RIBBON_A.to)) / 2} y={ROW_A_Y - 16} textAnchor="middle" fontSize={13} fontWeight={800} fill={A_STROKE}>
            {`${lenAmm} mm`}
          </text>
        </g>
      )}
      {measureB && (
        <g>
          <line x1={cmX(RIBBON_B.from)} y1={ROW_B_Y + BAR_H + 8} x2={cmX(RIBBON_B.to)} y2={ROW_B_Y + BAR_H + 8} stroke={B_STROKE} strokeWidth={2} />
          <line x1={cmX(RIBBON_B.from)} y1={ROW_B_Y + BAR_H + 4} x2={cmX(RIBBON_B.from)} y2={ROW_B_Y + BAR_H + 12} stroke={B_STROKE} strokeWidth={2} />
          <line x1={cmX(RIBBON_B.to)} y1={ROW_B_Y + BAR_H + 4} x2={cmX(RIBBON_B.to)} y2={ROW_B_Y + BAR_H + 12} stroke={B_STROKE} strokeWidth={2} />
          <text x={(cmX(RIBBON_B.from) + cmX(RIBBON_B.to)) / 2} y={ROW_B_Y + BAR_H + 24} textAnchor="middle" fontSize={13} fontWeight={800} fill={B_STROKE}>
            {`${lenBmm} mm`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P23G2Q7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A ruler marked 0 to 6 centimetres. Four guide lines drop to two ribbons below. Ribbon A spans from the 1 cm mark to the 4.3 cm mark; ribbon B spans from the 2.2 cm mark to the 6 cm mark."
    >
      <RibbonRulerScene />
    </div>
  )
}
