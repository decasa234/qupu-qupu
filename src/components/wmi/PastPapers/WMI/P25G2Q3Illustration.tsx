// Ruler-and-two-pencils figure for WMI-25P2A-Q3 (2025 Grade-2 Semifinal).
//
// Reading db/seed/wmi/figures/2025-semifinal-g2-a-q3.jpg:
//   A 0–15 cm ruler with two pencils laid above it.
//   - Long pencil:  back-end at the 2 cm mark, tip at the 9 cm mark   → 7 cm
//   - Short pencil: back-end at the 11 cm mark, tip at the 14 cm mark → 3 cm
//   "Find the difference between the lengths."  Difference = 7 − 3 = 4 cm (B).
//
// The static figure shows ONLY the setup: the ruler with its tick marks and the
// two pencils sitting over their real spans. It NEVER draws the measured numbers
// (7, 3) and NEVER reveals the difference — that is the explainer's job.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#1F2937'
const RULER_BODY = '#DCEEFB' // pale blue ruler face
const RULER_EDGE = '#9CC6EC'
const RULER_BASE = '#7FB3E0' // darker bottom band (the "(cm)" strip)
const WOOD = '#FBE6BF' // pencil tip wood
const LEAD = '#1F2937' // pencil lead
const BARREL = '#8E7CC3' // pencil barrel (violet)
const BARREL_HI = '#B7A9DC' // barrel highlight stripe
const BARREL_LO = '#6E5CA6' // barrel shadow stripe

// ── geometry ────────────────────────────────────────────────────────────────
// One cm = CM px along the ruler. x(mark) maps a cm mark to an x coordinate.
export const VIEW_W = 540
export const VIEW_H = 220
const X0 = 40 // x of the 0 mark
const CM = 31 // px per cm
const MAX_CM = 15
export const x = (cm: number) => X0 + cm * CM

const RULER_TOP = 132
const RULER_H = 56

// The two pencils, taken straight from the figure.
export const LONG_PENCIL = { back: 2, tip: 9 } // 7 cm
export const SHORT_PENCIL = { back: 11, tip: 14 } // 3 cm
export const LONG_LEN = LONG_PENCIL.tip - LONG_PENCIL.back // 7
export const SHORT_LEN = SHORT_PENCIL.tip - SHORT_PENCIL.back // 3
export const DIFFERENCE = LONG_LEN - SHORT_LEN // 4

/** A single pencil drawn lying flat: barrel from `back` cm, tapering to a tip at `tip` cm. */
export function Pencil({
  back,
  tip,
  cy,
  half = 11,
}: {
  back: number
  tip: number
  cy: number
  /** half-height of the barrel in px */
  half?: number
}) {
  const x0 = x(back)
  const xTip = x(tip)
  const tipW = CM * 0.85 // wooden cone length
  const xCone = xTip - tipW // where barrel meets the cone
  const xLeadBack = xTip - tipW * 0.34 // where the lead nib starts
  return (
    <g>
      {/* barrel body */}
      <rect x={x0} y={cy - half} width={xCone - x0} height={half * 2} fill={BARREL} stroke={INK} strokeWidth={2} />
      {/* barrel highlight + shadow stripes for a little volume */}
      <rect x={x0} y={cy - half + 3} width={xCone - x0} height={5} fill={BARREL_HI} opacity={0.8} />
      <rect x={x0} y={cy + half - 7} width={xCone - x0} height={4} fill={BARREL_LO} opacity={0.7} />
      {/* wooden cone */}
      <polygon
        points={`${xCone},${cy - half} ${xLeadBack},${cy - half * 0.42} ${xLeadBack},${cy + half * 0.42} ${xCone},${cy + half}`}
        fill={WOOD}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* lead nib */}
      <polygon
        points={`${xLeadBack},${cy - half * 0.42} ${xTip},${cy} ${xLeadBack},${cy + half * 0.42}`}
        fill={LEAD}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </g>
  )
}

export interface RulerPencilsProps {
  /** Highlight the long pencil's span (back→tip) on the ruler. */
  markLong?: boolean
  /** Highlight the short pencil's span (back→tip) on the ruler. */
  markShort?: boolean
}

/** The ruler + two pencils. Optional span underlays show each pencil's footprint on the scale. */
export function RulerPencils({ markLong = false, markShort = false }: RulerPencilsProps) {
  const marks: number[] = []
  for (let i = 0; i <= MAX_CM; i++) marks.push(i)

  const Span = ({ p, color }: { p: { back: number; tip: number }; color: string }) => (
    <g>
      <rect x={x(p.back)} y={RULER_TOP} width={x(p.tip) - x(p.back)} height={RULER_H} fill={color} opacity={0.45} />
      <line x1={x(p.back)} y1={RULER_TOP - 8} x2={x(p.back)} y2={RULER_TOP + RULER_H} stroke={color} strokeWidth={2.5} />
      <line x1={x(p.tip)} y1={RULER_TOP - 8} x2={x(p.tip)} y2={RULER_TOP + RULER_H} stroke={color} strokeWidth={2.5} />
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* pencils above the ruler */}
      <Pencil back={LONG_PENCIL.back} tip={LONG_PENCIL.tip} cy={48} />
      <Pencil back={SHORT_PENCIL.back} tip={SHORT_PENCIL.tip} cy={96} half={9} />

      {/* highlighted spans (explainer only) drawn under the ticks */}
      {markLong && <Span p={LONG_PENCIL} color="#2C7BE5" />}
      {markShort && <Span p={SHORT_PENCIL} color="#E8615A" />}

      {/* ruler body */}
      <rect x={X0 - 18} y={RULER_TOP} width={MAX_CM * CM + 36} height={RULER_H} rx={6} fill={RULER_BODY} stroke={RULER_EDGE} strokeWidth={2} />
      {/* bottom band */}
      <rect x={X0 - 18} y={RULER_TOP + RULER_H - 16} width={MAX_CM * CM + 36} height={16} rx={0} fill={RULER_BASE} opacity={0.6} />

      {/* tick marks: long at every cm, short at half-cm */}
      {marks.map((m) => (
        <g key={`tk${m}`}>
          <line x1={x(m)} y1={RULER_TOP} x2={x(m)} y2={RULER_TOP + 16} stroke={INK} strokeWidth={2} />
          <text x={x(m)} y={RULER_TOP + 32} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
            {m}
          </text>
          {m < MAX_CM && (
            <line x1={x(m + 0.5)} y1={RULER_TOP} x2={x(m + 0.5)} y2={RULER_TOP + 9} stroke={INK} strokeWidth={1.4} />
          )}
        </g>
      ))}

      {/* unit label */}
      <text x={X0 + MAX_CM * CM + 6} y={RULER_TOP + RULER_H - 4} textAnchor="end" fontSize={12} fontStyle="italic" fill={INK}>
        (cm)
      </text>
    </svg>
  )
}

const ARIA =
  'Sebuah penggaris 0 sampai 15 cm dengan dua pensil di atasnya. ' +
  'Pensil panjang membentang dari tanda 2 cm sampai 9 cm. ' +
  'Pensil pendek membentang dari tanda 11 cm sampai 14 cm. ' +
  'Berapa selisih panjang kedua pensil itu?'

export default function P25G2Q3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <RulerPencils />
    </div>
  )
}
