// SEAMO-19-B-Q7 — "The sum of Alice and her uncle's ages is 33 years.
// If her uncle will be twice her age in 3 years' time, how old is Alice this year?"
//
// Stem figure: two side-by-side panels.
//   LEFT  — "NOW"  panel: Alice box + Uncle box joined by "+", "= 33" on the right.
//   RIGHT — "IN 3 YEARS" panel: (Uncle+3) box = 2×(Alice+3) box.
// The figure never shows the answer (Alice=10). SSR-safe (no hooks, no random).
//
// No primitive matches a two-equation algebra display → fresh SVG.
// Pattern adapted from AppleAdd19P1Illustration (box-row + operator text layout).

const INK = '#1F2937'
const ALICE_FILL = '#FDE68A'   // warm amber — "girl" colour
const UNCLE_FILL = '#BFDBFE'   // cool blue — "uncle" colour
const PANEL_STROKE = '#6B7280'
const PANEL_RX = 10
const ACCENT = '#30598A'

// ── geometry ────────────────────────────────────────────────────────────────
const W = 480
const H = 180
const MID = W / 2

// shared box sizes
const BOX_W = 68
const BOX_H = 48
const BOX_Y = 54   // top of equation boxes

// ── LEFT PANEL: Alice + Uncle = 33  (NOW) ───────────────────────────────────
// two boxes + plus + equals
const L_ALICE_X = 30
const L_PLUS_X = L_ALICE_X + BOX_W + 18
const L_UNCLE_X = L_PLUS_X + 26
const L_EQ_X = L_UNCLE_X + BOX_W + 18
const L_TOTAL_X = L_EQ_X + 26

// ── RIGHT PANEL: Uncle+3 = 2×(Alice+3)  (IN 3 YEARS) ───────────────────────
const R_OFF = MID + 8          // right panel starts at mid
const R_UNCLE_X = R_OFF + 6
const R_EQ_X = R_UNCLE_X + BOX_W + 18
const R_ALICE_X = R_EQ_X + 36

// ── shared helpers ───────────────────────────────────────────────────────────
interface BoxProps {
  x: number; label: string; sublabel?: string; fill: string; highlight?: boolean
}
function EqBox({ x, label, sublabel, fill, highlight = false }: BoxProps) {
  const by = BOX_Y
  return (
    <g>
      <rect
        x={x} y={by} width={BOX_W} height={BOX_H} rx={PANEL_RX}
        fill={fill}
        stroke={highlight ? '#10B981' : PANEL_STROKE}
        strokeWidth={highlight ? 3 : 1.8}
      />
      <text x={x + BOX_W / 2} y={by + (sublabel ? 20 : BOX_H / 2)} textAnchor="middle" dominantBaseline="central"
        fontSize={sublabel ? 15 : 17} fontWeight={800} fill={INK}>
        {label}
      </text>
      {sublabel && (
        <text x={x + BOX_W / 2} y={by + BOX_H - 12} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={600} fill="#6B7280">
          {sublabel}
        </text>
      )}
    </g>
  )
}

/** Shared props for the stem diagram (used by explainer for highlight toggling). */
export interface AgeAliceDiagramProps {
  /** Highlight the "NOW" equation (step 1). */
  highlightNow?: boolean
  /** Highlight the "IN 3 YEARS" equation (step 2). */
  highlightFuture?: boolean
  /** Show the solved value for Alice (10). */
  showAnswer?: boolean
}

export function AgeAliceDiagram({
  highlightNow = false,
  highlightFuture = false,
  showAnswer = false,
}: AgeAliceDiagramProps) {
  const midLine = MID - 4

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── LEFT PANEL background ── */}
      <rect
        x={8} y={28} width={midLine - 16} height={H - 36} rx={14}
        fill={highlightNow ? '#EFF6FF' : '#F9FAFB'}
        stroke={highlightNow ? '#2563EB' : '#D1D5DB'}
        strokeWidth={highlightNow ? 2.5 : 1.5}
        strokeDasharray={highlightNow ? '0' : '0'}
      />
      {/* "NOW" label */}
      <text x={midLine / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} fill={ACCENT} letterSpacing={1}>
        SEKARANG / NOW
      </text>

      {/* Alice box */}
      <EqBox x={L_ALICE_X} label="Alice" sublabel="= ?" fill={ALICE_FILL} />
      {/* name labels below boxes */}
      <text x={L_ALICE_X + BOX_W / 2} y={BOX_Y + BOX_H + 14} textAnchor="middle" fontSize={10} fill="#6B7280" fontWeight={600}>Alice</text>

      {/* + */}
      <text x={L_PLUS_X + 4} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={INK}>+</text>

      {/* Uncle box */}
      <EqBox x={L_UNCLE_X} label="Paman" sublabel="33−Alice" fill={UNCLE_FILL} />
      <text x={L_UNCLE_X + BOX_W / 2} y={BOX_Y + BOX_H + 14} textAnchor="middle" fontSize={10} fill="#6B7280" fontWeight={600}>Uncle</text>

      {/* = 33 */}
      <text x={L_EQ_X + 4} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={INK}>=</text>
      <text x={L_TOTAL_X + 12} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={26} fontWeight={900} fill={ACCENT}>33</text>

      {/* ── RIGHT PANEL background ── */}
      <rect
        x={midLine + 8} y={28} width={W - midLine - 16} height={H - 36} rx={14}
        fill={highlightFuture ? '#F0FDF4' : '#F9FAFB'}
        stroke={highlightFuture ? '#16A34A' : '#D1D5DB'}
        strokeWidth={highlightFuture ? 2.5 : 1.5}
      />
      {/* "+3 tahun / years" label */}
      <text x={midLine + (W - midLine) / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} fill="#16A34A" letterSpacing={1}>
        +3 TAHUN / YEARS
      </text>

      {/* Uncle+3 box */}
      <EqBox x={R_UNCLE_X} label="Paman" sublabel="+3 thn" fill={UNCLE_FILL} />
      <text x={R_UNCLE_X + BOX_W / 2} y={BOX_Y + BOX_H + 14} textAnchor="middle" fontSize={10} fill="#6B7280" fontWeight={600}>Uncle+3</text>

      {/* = */}
      <text x={R_EQ_X + 4} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900} fill={INK}>=</text>

      {/* 2× */}
      <text x={R_ALICE_X - 16} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={18} fontWeight={900} fill={highlightFuture ? '#16A34A' : ACCENT}>2×</text>

      {/* Alice+3 box — green when answer shown */}
      <EqBox
        x={R_ALICE_X}
        label={showAnswer ? 'Alice' : 'Alice'}
        sublabel={showAnswer ? '+3 → 13' : '+3 thn'}
        fill={showAnswer ? '#D1FAE5' : ALICE_FILL}
        highlight={showAnswer}
      />
      <text x={R_ALICE_X + BOX_W / 2} y={BOX_Y + BOX_H + 14} textAnchor="middle" fontSize={10} fill="#6B7280" fontWeight={600}>Alice+3</text>

      {/* answer badge */}
      {showAnswer && (
        <g>
          <rect x={R_ALICE_X - 10} y={BOX_Y + BOX_H + 24} width={BOX_W + 20} height={22} rx={8}
            fill="#D1FAE5" stroke="#10B981" strokeWidth={2} />
          <text x={R_ALICE_X + BOX_W / 2} y={BOX_Y + BOX_H + 35} textAnchor="middle" dominantBaseline="central"
            fontSize={13} fontWeight={900} fill="#065F46">
            Alice = 10
          </text>
        </g>
      )}
    </svg>
  )
}

/** SEAMO-19-B-Q7 stem illustration — shows the problem only (no answer). */
export default function AgeAlice19B7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Dua panel persamaan. Kiri (Sekarang): Alice + Paman = 33. ' +
        'Kanan (3 tahun lagi): Paman+3 = 2×(Alice+3).'
      }
    >
      <AgeAliceDiagram />
    </div>
  )
}
