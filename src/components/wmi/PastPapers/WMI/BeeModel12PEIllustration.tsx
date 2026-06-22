// IKMC-23-PE-Q12 — "Raha wants to finish the bee on the left according to the
// model on the right. Raha needs to win points to unlock parts of the bee.
// How many points does she need to win to complete the bee?"
//
// PROBLEM ONLY — shows exactly what is in the printed figure (2023.imgs/030.jpg):
//   • A 6-row legend table (centre) showing each bee part with its point cost (1–6)
//   • An INCOMPLETE bee on the left — body + wings + dot antenna (cost 1) +
//     curly antenna wire (cost 3) + scroll tail "3" (cost 4) already unlocked
//   • A COMPLETE model bee on the right — all 6 parts present
//
// Does NOT reveal which parts are missing or the total (13). SSR-safe & deterministic.

// ── Palette ───────────────────────────────────────────────────────────────────

export const COLOR = {
  BG:           '#FAFAFA',
  BEE_BODY:     '#FBBF24',   // amber-400 — yellow bee body
  BEE_STRIPE:   '#1C1917',   // stone-900 — black stripes
  BEE_EYE:      '#1C1917',
  BEE_WING:     '#FFFFFF',
  BEE_WING_STR: '#D1D5DB',  // gray-300
  PETAL:        '#FFFFFF',
  PETAL_STR:    '#D1D5DB',
  TABLE_BG:     '#FFFFFF',
  TABLE_BORDER: '#9CA3AF',  // gray-400
  COST_FILL:    '#1F2937',  // ink
  MISSING_DASH: '#D1D5DB',  // dashed placeholder
  AMBER:        '#F59E0B',
} as const

// ── SVG canvas ────────────────────────────────────────────────────────────────

export const SVG_W = 340
export const SVG_H = 220

// ── Legend table geometry ─────────────────────────────────────────────────────
// 6 rows × 2 columns (icon | cost), centred in the SVG
export const TABLE_X  = 130   // left edge of table
export const TABLE_Y  = 20    // top of first row
export const ROW_H    = 30    // row height
export const COL_ICON = 20    // icon column width
export const COL_COST = 20    // cost column width
export const TABLE_W  = COL_ICON + COL_COST  // 40

// ── Bee geometry ──────────────────────────────────────────────────────────────
// Left bee centre:  (65, 110)
// Right bee centre: (280, 110)

export const LEFT_BEE  = { cx: 65,  cy: 110 } as const
export const RIGHT_BEE = { cx: 278, cy: 110 } as const

// ── Bee primitive ─────────────────────────────────────────────────────────────

export type BeePart =
  | 'dot'        // part 1 — antenna tip dot (cost 1)
  | 'flower'     // part 2 — flower antenna head (cost 2)
  | 'curl'       // part 3 — curly wire antenna stem (cost 3)
  | 'scroll'     // part 4 — "3"-shaped scroll tail (cost 4)
  | 'smile'      // part 5 — smile mouth (cost 5)
  | 'sunEye'     // part 6 — sun / daisy eye decoration (cost 6)

export interface BeeModelProps {
  /** Centre x of the whole bee glyph. */
  cx: number
  /** Centre y of the whole bee glyph. */
  cy: number
  /**
   * Which optional bee parts to render. The body, wings and basic outline
   * are always rendered. Selectively show/hide the 6 unlock-able parts.
   */
  parts?: Set<BeePart>
  /** If true, draw a dim dashed circle where missing face features would go. */
  showFacePlaceholder?: boolean
}

/**
 * BeePrimitive
 *
 * Shared SVG bee glyph for IKMC-23-PE-Q12.
 * Always draws: oval body + yellow/black stripes + petal wings.
 * Draws selectively: dot antenna (part 1), flower antenna (part 2),
 * curly wire (part 3), scroll tail (part 4), smile (part 5), sun eye (part 6).
 */
export function BeePrimitive({ cx, cy, parts = new Set(), showFacePlaceholder = false }: BeeModelProps) {
  const has = (p: BeePart) => parts.has(p)

  // Layout offsets from (cx, cy)
  const bodyRx = 26, bodyRy = 32   // main body ellipse
  const headCy = cy - bodyRy - 14  // head centre y
  const headR  = 14                 // head radius
  const wingR  = 20                 // petal wing

  return (
    <g>
      {/* ── Petal wings (4 petals around the body) ── */}
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([dx, dy], i) => (
        <ellipse
          key={`wing${i}`}
          cx={cx + dx * (bodyRx + wingR * 0.6)}
          cy={cy + dy * (bodyRy * 0.45)}
          rx={wingR}
          ry={wingR * 0.6}
          fill={COLOR.BEE_WING}
          stroke={COLOR.BEE_WING_STR}
          strokeWidth={1.5}
          transform={`rotate(${dx * dy * 30} ${cx + dx * (bodyRx + wingR * 0.6)} ${cy + dy * (bodyRy * 0.45)})`}
        />
      ))}

      {/* ── Body (yellow with black stripes) ── */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={bodyRx}
        ry={bodyRy}
        fill={COLOR.BEE_BODY}
        stroke={COLOR.BEE_STRIPE}
        strokeWidth={1.5}
      />
      {/* stripes */}
      {[-14, -3, 8, 19].map((dy, i) => (
        <rect
          key={`stripe${i}`}
          x={cx - bodyRx + 1}
          y={cy + dy}
          width={(bodyRx - 1) * 2}
          height={6}
          fill={COLOR.BEE_STRIPE}
          rx={3}
        />
      ))}

      {/* ── Head ── */}
      <circle
        cx={cx}
        cy={headCy}
        r={headR}
        fill={COLOR.BEE_BODY}
        stroke={COLOR.BEE_STRIPE}
        strokeWidth={1.5}
      />

      {/* ── Face placeholder (dashed circle) for incomplete bee ── */}
      {showFacePlaceholder && (
        <circle
          cx={cx}
          cy={headCy}
          r={headR - 3}
          fill="none"
          stroke={COLOR.MISSING_DASH}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      )}

      {/* ── Part 6 — sun/daisy eye decoration ── */}
      {has('sunEye') && (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI * 2) / 8
            return (
              <line
                key={`ray${i}`}
                x1={cx + Math.cos(a) * 4}
                y1={headCy + Math.sin(a) * 4}
                x2={cx + Math.cos(a) * 8}
                y2={headCy + Math.sin(a) * 8}
                stroke={COLOR.AMBER}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )
          })}
          <circle cx={cx} cy={headCy} r={4} fill={COLOR.AMBER} />
          <circle cx={cx} cy={headCy} r={2} fill={COLOR.BEE_STRIPE} />
        </g>
      )}

      {/* ── Part 5 — smile ── */}
      {has('smile') && (
        <path
          d={`M ${cx - 6} ${headCy + 5} Q ${cx} ${headCy + 10} ${cx + 6} ${headCy + 5}`}
          fill="none"
          stroke={COLOR.BEE_STRIPE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}

      {/* ── Antenna stems ── */}
      {/* Part 3 — curly wire (always paired with dot or flower above it) */}
      {has('curl') && (
        <path
          d={`M ${cx - 6} ${headCy - headR} C ${cx - 18} ${headCy - headR - 12} ${cx - 22} ${headCy - headR - 6} ${cx - 12} ${headCy - headR - 16}`}
          fill="none"
          stroke={COLOR.BEE_STRIPE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
      {/* Right antenna: always a straight stem */}
      <line
        x1={cx + 6}
        y1={headCy - headR}
        x2={cx + 10}
        y2={headCy - headR - 14}
        stroke={COLOR.BEE_STRIPE}
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* ── Part 1 — antenna dot (tip on right antenna) ── */}
      {has('dot') && (
        <circle
          cx={cx + 10}
          cy={headCy - headR - 14}
          r={3}
          fill={COLOR.BEE_STRIPE}
        />
      )}

      {/* ── Part 2 — flower head (tip on left antenna / curly wire end) ── */}
      {has('flower') && (
        <g transform={`translate(${cx - 12} ${headCy - headR - 16})`}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI * 2) / 6
            return (
              <ellipse
                key={`fp${i}`}
                cx={Math.cos(a) * 4}
                cy={Math.sin(a) * 4}
                rx={3}
                ry={2}
                fill={COLOR.PETAL}
                stroke={COLOR.PETAL_STR}
                strokeWidth={0.8}
                transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 4} ${Math.sin(a) * 4})`}
              />
            )
          })}
          <circle cx={0} cy={0} r={2.5} fill={COLOR.AMBER} />
        </g>
      )}

      {/* ── Part 4 — scroll / "3"-shaped tail (bottom of body) ── */}
      {has('scroll') && (
        <path
          d={`M ${cx} ${cy + bodyRy} C ${cx + 10} ${cy + bodyRy + 8} ${cx + 12} ${cy + bodyRy + 14} ${cx + 6} ${cy + bodyRy + 16} C ${cx} ${cy + bodyRy + 18} ${cx - 4} ${cy + bodyRy + 12} ${cx + 2} ${cy + bodyRy + 8}`}
          fill="none"
          stroke={COLOR.BEE_STRIPE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

// ── Legend row icons ──────────────────────────────────────────────────────────

export function LegendIcon({ part, x, y }: { part: BeePart; x: number; y: number }) {
  const s = COLOR.BEE_STRIPE
  const a = COLOR.AMBER

  switch (part) {
    case 'dot':
      return <circle cx={x} cy={y} r={4} fill={s} />
    case 'flower':
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const ang = (i * Math.PI * 2) / 6
            return (
              <ellipse
                key={i}
                cx={x + Math.cos(ang) * 5}
                cy={y + Math.sin(ang) * 5}
                rx={3.5}
                ry={2}
                fill={COLOR.PETAL}
                stroke={COLOR.PETAL_STR}
                strokeWidth={0.8}
                transform={`rotate(${(ang * 180) / Math.PI + 90} ${x + Math.cos(ang) * 5} ${y + Math.sin(ang) * 5})`}
              />
            )
          })}
          <circle cx={x} cy={y} r={2.5} fill={a} />
        </g>
      )
    case 'curl':
      return (
        <path
          d={`M ${x - 2} ${y + 5} C ${x - 10} ${y - 2} ${x - 12} ${y + 4} ${x - 4} ${y - 6}`}
          fill="none"
          stroke={s}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )
    case 'scroll':
      return (
        <path
          d={`M ${x - 4} ${y - 5} C ${x + 6} ${y - 5} ${x + 8} ${y + 2} ${x + 2} ${y + 4} C ${x - 2} ${y + 6} ${x - 4} ${y + 2} ${x} ${y}`}
          fill="none"
          stroke={s}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )
    case 'smile':
      return (
        <path
          d={`M ${x - 6} ${y - 2} Q ${x} ${y + 5} ${x + 6} ${y - 2}`}
          fill="none"
          stroke={s}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )
    case 'sunEye':
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const ang = (i * Math.PI * 2) / 8
            return (
              <line
                key={i}
                x1={x + Math.cos(ang) * 3}
                y1={y + Math.sin(ang) * 3}
                x2={x + Math.cos(ang) * 7}
                y2={y + Math.sin(ang) * 7}
                stroke={a}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )
          })}
          <circle cx={x} cy={y} r={3} fill={a} />
          <circle cx={x} cy={y} r={1.5} fill={s} />
        </g>
      )
  }
}

// ── Static illustration (default export) ──────────────────────────────────────

// The LEFT bee already has parts 1 (dot), 3 (curl), 4 (scroll) — cost already paid = 8
// MISSING parts: 2 (flower, cost 2), 5 (smile, cost 5), 6 (sunEye, cost 6) → 2+5+6 = 13
export const LEFT_BEE_PARTS: Set<BeePart> = new Set(['dot', 'curl', 'scroll'])
export const RIGHT_BEE_PARTS: Set<BeePart> = new Set(['dot', 'flower', 'curl', 'scroll', 'smile', 'sunEye'])

// Part legend: [part, cost] pairs in display order
export const LEGEND: Array<{ part: BeePart; cost: number }> = [
  { part: 'dot',    cost: 1 },
  { part: 'flower', cost: 2 },
  { part: 'curl',   cost: 3 },
  { part: 'scroll', cost: 4 },
  { part: 'smile',  cost: 5 },
  { part: 'sunEye', cost: 6 },
]

/**
 * BeeModel12PEIllustration
 *
 * Static, problem-only SVG for IKMC-23-PE-Q12.
 * Shows the incomplete left bee, the 6-part legend with costs, and the complete
 * right model bee — faithfully reconstructed from 2023.imgs/030.jpg.
 * Does NOT reveal the missing parts or the answer (13 points).
 */
export default function BeeModel12PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lebah tidak lengkap di sebelah kiri, tabel legenda 6 bagian lebah dengan biaya poin 1–6 di tengah, ' +
        'dan lebah model lengkap di sebelah kanan. ' +
        'Temukan berapa poin yang diperlukan untuk melengkapi lebah sebelah kiri.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(380, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ── LEFT bee (incomplete) ── */}
        <BeePrimitive
          cx={LEFT_BEE.cx}
          cy={LEFT_BEE.cy}
          parts={LEFT_BEE_PARTS}
          showFacePlaceholder
        />

        {/* ── Legend table (centre) ── */}
        <rect
          x={TABLE_X - 2}
          y={TABLE_Y - 2}
          width={TABLE_W + 4}
          height={LEGEND.length * ROW_H + 4}
          fill={COLOR.TABLE_BG}
          stroke={COLOR.TABLE_BORDER}
          strokeWidth={1.5}
          rx={3}
        />
        {LEGEND.map(({ part, cost }, i) => {
          const rowY = TABLE_Y + i * ROW_H + ROW_H / 2
          const iconX = TABLE_X + COL_ICON / 2
          const costX = TABLE_X + COL_ICON + COL_COST / 2

          return (
            <g key={part}>
              {/* row divider */}
              {i > 0 && (
                <line
                  x1={TABLE_X - 2}
                  y1={TABLE_Y + i * ROW_H - 2}
                  x2={TABLE_X + TABLE_W + 2}
                  y2={TABLE_Y + i * ROW_H - 2}
                  stroke={COLOR.TABLE_BORDER}
                  strokeWidth={0.8}
                />
              )}
              {/* column divider */}
              <line
                x1={TABLE_X + COL_ICON}
                y1={TABLE_Y + i * ROW_H - 2}
                x2={TABLE_X + COL_ICON}
                y2={TABLE_Y + (i + 1) * ROW_H - 2}
                stroke={COLOR.TABLE_BORDER}
                strokeWidth={0.8}
              />
              {/* icon */}
              <LegendIcon part={part} x={iconX} y={rowY} />
              {/* cost number */}
              <text
                x={costX}
                y={rowY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fill={COLOR.COST_FILL}
                fontFamily="Nunito, sans-serif"
              >
                {cost}
              </text>
            </g>
          )
        })}

        {/* ── RIGHT bee (complete model) ── */}
        <BeePrimitive
          cx={RIGHT_BEE.cx}
          cy={RIGHT_BEE.cy}
          parts={RIGHT_BEE_PARTS}
        />
      </svg>
    </div>
  )
}
