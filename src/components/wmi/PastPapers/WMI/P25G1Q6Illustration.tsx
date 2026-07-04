// WMI-25P1A-Q6 (2025 Grade 1 Semifinal, Paper A) — "Danny measures 2 pencils
// with a ruler. Find the sum of their lengths in cm."  Answer: 10 (choice D).
//
// Redrawn from db/seed/wmi/figures/2025-semifinal-g1-a-q6.jpg:
//   • A ruler running 0 → 15 cm with mm / half-cm / full-cm ticks.
//   • Pencil 1 lies from the 2 cm mark to the 9 cm mark  → 7 cm long.
//   • Pencil 2 lies from the 11 cm mark to the 14 cm mark → 3 cm long.
// Neither pencil starts at 0, so length = (tip mark − tail mark), not the tip
// number. 7 + 3 = 10 cm (answer not shown in the static figure).
//
// SSR-safe + deterministic: no window/document at module top, no Math.random,
// no Date.now.

// ----- ruler geometry --------------------------------------------------
export const Q6_VIEW_W = 460
export const Q6_VIEW_H = 200

const RULER_X0 = 24 // x of the 0 cm mark
const RULER_Y = 120 // top edge of the ruler body
const RULER_H = 50
const RULER_RX = 8
const CM_MIN = 0
const CM_MAX = 15
const PX_PER_CM = 27 // 15 cm * 27 = 405 px wide ruler scale

export function cmX(cm: number): number {
  return RULER_X0 + (cm - CM_MIN) * PX_PER_CM
}

// ----- pencil placements (cm marks) -----------------------------------
export const PENCIL_1 = { tail: 2, tip: 9 } // 7 cm
export const PENCIL_2 = { tail: 11, tip: 14 } // 3 cm
export const PENCIL_1_LEN = PENCIL_1.tip - PENCIL_1.tail // 7
export const PENCIL_2_LEN = PENCIL_2.tip - PENCIL_2.tail // 3
export const Q6_TOTAL = PENCIL_1_LEN + PENCIL_2_LEN // 10

const BODY = '#8B7BD8' // pencil barrel
const BODY_DK = '#6B5BB8' // barrel shade
const WOOD = '#FBE2B8' // sharpened wood
const LEAD = '#1F2937' // graphite tip
const PENCIL_Y = 86 // vertical centre of the pencils (above the ruler)
const PENCIL_HALF = 13 // half-height of a pencil barrel

/**
 * One horizontal pencil drawn from cm mark `tail` to cm mark `tip`, with a
 * sharpened cone + lead at the right (tip) end. A faint guide drops from each
 * end to the ruler. When `measured`, a span bracket + "N cm" badge appears.
 */
export function Pencil({
  tail,
  tip,
  y = PENCIL_Y,
  measured = false,
  guides = false,
}: {
  tail: number
  tip: number
  y?: number
  measured?: boolean
  guides?: boolean
}) {
  const x0 = cmX(tail)
  const x1 = cmX(tip)
  const len = tip - tail
  const coneW = Math.min(22, (x1 - x0) * 0.3) // wood cone length
  const bodyX1 = x1 - coneW
  const half = PENCIL_HALF

  return (
    <g>
      {/* optional vertical guides from each end down to the ruler top */}
      {guides && (
        <g stroke="#94A3B8" strokeWidth={1.4} strokeDasharray="3 3">
          <line x1={x0} y1={y + half} x2={x0} y2={RULER_Y} />
          <line x1={x1} y1={y} x2={x1} y2={RULER_Y} />
        </g>
      )}

      {/* barrel */}
      <rect x={x0} y={y - half} width={bodyX1 - x0} height={half * 2} rx={3} fill={BODY} />
      {/* barrel shade (lower third) */}
      <rect x={x0} y={y + half * 0.25} width={bodyX1 - x0} height={half * 0.75} rx={2} fill={BODY_DK} opacity={0.55} />
      {/* flat end cap */}
      <rect x={x0} y={y - half} width={4} height={half * 2} rx={2} fill={BODY_DK} />

      {/* sharpened wooden cone */}
      <path d={`M ${bodyX1} ${y - half} L ${x1 - 5} ${y} L ${bodyX1} ${y + half} Z`} fill={WOOD} stroke="#D9B877" strokeWidth={1} />
      {/* graphite lead */}
      <path d={`M ${x1 - 5} ${y} L ${x1 - 11} ${y - 5} L ${x1 - 11} ${y + 5} Z`} fill={LEAD} />

      {/* measure bracket + badge */}
      {measured && (
        <g>
          <line x1={x0} y1={y - half - 12} x2={x1} y2={y - half - 12} stroke="#2f6df0" strokeWidth={2} />
          <line x1={x0} y1={y - half - 16} x2={x0} y2={y - half - 8} stroke="#2f6df0" strokeWidth={2} />
          <line x1={x1} y1={y - half - 16} x2={x1} y2={y - half - 8} stroke="#2f6df0" strokeWidth={2} />
          <g>
            <rect x={(x0 + x1) / 2 - 22} y={y - half - 42} width={44} height={22} rx={6} fill="#E1EFFB" stroke="#2f6df0" strokeWidth={1.6} />
            <text x={(x0 + x1) / 2} y={y - half - 31} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#2f6df0">
              {`${len} cm`}
            </text>
          </g>
        </g>
      )}
    </g>
  )
}

export interface Q6RulerProps {
  /** Show the measuring bracket on pencil 1. */
  measure1?: boolean
  /** Show the measuring bracket on pencil 2. */
  measure2?: boolean
  /** Drop dashed guides from a pencil's ends to the ruler. */
  guides1?: boolean
  guides2?: boolean
}

export function Q6Ruler({ measure1 = false, measure2 = false, guides1 = false, guides2 = false }: Q6RulerProps) {
  // tick collections
  const fullCm: number[] = []
  const halfCm: number[] = []
  const mm: number[] = []
  for (let c = CM_MIN; c <= CM_MAX; c++) fullCm.push(c)
  for (let c = CM_MIN; c < CM_MAX; c++) halfCm.push(c + 0.5)
  for (let t = CM_MIN * 10; t <= CM_MAX * 10; t++) {
    const c = t / 10
    if (Number.isInteger(c)) continue
    if (Math.abs(c * 2 - Math.round(c * 2)) < 1e-9 && !Number.isInteger(c)) continue // skip .5
    mm.push(c)
  }

  return (
    <svg
      viewBox={`0 0 ${Q6_VIEW_W} ${Q6_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q6_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── PENCILS (drawn above the ruler) ── */}
      <Pencil tail={PENCIL_1.tail} tip={PENCIL_1.tip} measured={measure1} guides={guides1} />
      <Pencil tail={PENCIL_2.tail} tip={PENCIL_2.tip} measured={measure2} guides={guides2} />

      {/* ── RULER BODY ── */}
      <rect x={RULER_X0 - 6} y={RULER_Y} width={(CM_MAX - CM_MIN) * PX_PER_CM + 30} height={RULER_H} rx={RULER_RX} fill="#FFF3D6" stroke="#C4A64A" strokeWidth={1.8} />
      <rect x={RULER_X0} y={RULER_Y} width={(CM_MAX - CM_MIN) * PX_PER_CM} height={6} fill="rgba(255,255,255,0.5)" />

      {/* mm ticks */}
      {mm.map((c) => (
        <line key={`mm${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 6} stroke="#A08020" strokeWidth={0.7} />
      ))}
      {/* half-cm ticks */}
      {halfCm.map((c) => (
        <line key={`half${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 10} stroke="#A08020" strokeWidth={1} />
      ))}
      {/* full-cm ticks */}
      {fullCm.map((c) => (
        <line key={`cm${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 16} stroke="#7A6010" strokeWidth={1.4} />
      ))}
      {/* cm labels */}
      {fullCm.map((c) => (
        <text key={`lbl${c}`} x={cmX(c)} y={RULER_Y + 30} textAnchor="middle" fontSize={11} fontWeight={700} fill="#5A4A00">
          {c}
        </text>
      ))}
      <text x={cmX(CM_MAX) + 14} y={RULER_Y + 44} textAnchor="middle" fontSize={11} fontWeight={600} fill="#5A4A00">
        (cm)
      </text>
    </svg>
  )
}

export default function P25G1Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A ruler from 0 to 15 cm with two pencils lying on it. The first pencil lies from the 2 cm mark to the 9 cm mark. The second pencil lies from the 11 cm mark to the 14 cm mark."
    >
      <Q6Ruler />
    </div>
  )
}
