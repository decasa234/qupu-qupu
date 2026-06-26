// SASMO 2019 Grade 3 Q18 — Pictograph: muffin icon counts for 5 siblings.
// Source images: docs/reference/ocr-res/sasmo/contest/g3/2019-2020.imgs/023–027.jpg
// Icon counts: Anastacia 1 | Braiden 7 | Clarke 8 | Darla 4 | Eddie 4.
// Each icon = 6 muffins. Mom distributes to 4 (not Clarke). Answer: 12 more for Eddie.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

export type PictographFocus = null | 'eddie' | 'no_clarke' | 'result'

export interface PictographMuffinsProps {
  focus?: PictographFocus
  lang?: 'en' | 'id'
}

// ── Layout ────────────────────────────────────────────────────────────────────
const W        = 300
const H        = 210
const LABEL_W  = 80   // name column width
const ICON_W   = 18   // muffin icon bounding width
const ICON_GAP = 3    // horizontal gap between icons
const ROW_H    = 32   // height of each sibling row
const ROWS_Y0  = 20   // y-coordinate of first row's top edge

// Derived: y at which the 5-row block ends
const ROWS_END = ROWS_Y0 + 5 * ROW_H // = 180

// ── Sibling data ──────────────────────────────────────────────────────────────
const SIBLINGS = [
  { key: 'anastacia' as const, label: 'Anastacia', icons: 1 },
  { key: 'braiden'   as const, label: 'Braiden',   icons: 7 },
  { key: 'clarke'    as const, label: 'Clarke',    icons: 8 },
  { key: 'darla'     as const, label: 'Darla',     icons: 4 },
  { key: 'eddie'     as const, label: 'Eddie',     icons: 4 },
] as const

// ── Muffin glyph (cx, cy = icon centre; bounding box ≈ 15×19px) ───────────────
function MuffinIcon({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* cup / wrapper */}
      <path
        d={`M${cx - 7},${cy + 1} L${cx + 7},${cy + 1} L${cx + 5.5},${cy + 9} L${cx - 5.5},${cy + 9} Z`}
        fill="#C8963E"
        stroke="#A0742A"
        strokeWidth={0.5}
      />
      {/* cream base */}
      <ellipse cx={cx} cy={cy} rx={7.5} ry={5} fill="#FFFDE7" stroke="#E8C97A" strokeWidth={0.5} />
      {/* cream peak */}
      <ellipse cx={cx} cy={cy - 4} rx={4} ry={3.5} fill="#FFFDE7" stroke="#E8C97A" strokeWidth={0.5} />
      {/* cherry */}
      <circle cx={cx} cy={cy - 7.5} r={2} fill="#E53935" />
    </g>
  )
}

// ── Shared figure — used by both illustration and explainer ───────────────────
export function PictographMuffinsFigure({ focus = null, lang = 'id' }: PictographMuffinsProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="#FFFBF0" stroke="#E5C85A" strokeWidth={1.5} />

      {/* vertical divider between name column and icon area */}
      <line x1={LABEL_W} y1={ROWS_Y0} x2={LABEL_W} y2={ROWS_END} stroke="#D1C17A" strokeWidth={1} />

      {SIBLINGS.map((sib, i) => {
        const rowY       = ROWS_Y0 + i * ROW_H
        const cy         = rowY + ROW_H / 2
        const isEddie    = sib.key === 'eddie'
        const isClarke   = sib.key === 'clarke'

        // dim logic per focus state
        const dimRow =
          focus === 'no_clarke'               ? isClarke :
          focus === 'eddie' || focus === 'result' ? !isEddie :
          false

        const highlightRow =
          (focus === 'eddie' || focus === 'result') && isEddie

        return (
          <g key={sib.key} opacity={dimRow ? 0.25 : 1}>
            {/* row separator (skip above row 0) */}
            {i > 0 && (
              <line
                x1={2} y1={rowY}
                x2={W - 2} y2={rowY}
                stroke="#E5C85A"
                strokeWidth={0.7}
              />
            )}

            {/* highlight background for Eddie */}
            {highlightRow && (
              <rect
                x={2} y={rowY + 1}
                width={W - 4} height={ROW_H - 2}
                rx={3}
                fill="#FEF08A"
                opacity={0.45}
              />
            )}

            {/* sibling name */}
            <text
              x={LABEL_W - 7}
              y={cy}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={highlightRow ? 800 : 600}
              fill={highlightRow ? '#78350F' : '#374151'}
            >
              {sib.label}
            </text>

            {/* muffin icons */}
            {Array.from({ length: sib.icons }, (_, idx) => {
              const cx = LABEL_W + 8 + idx * (ICON_W + ICON_GAP) + ICON_W / 2
              return <MuffinIcon key={idx} cx={cx} cy={cy} />
            })}
          </g>
        )
      })}

      {/* separator above the key */}
      <line x1={8} y1={ROWS_END + 4} x2={W - 8} y2={ROWS_END + 4} stroke="#E5C85A" strokeWidth={1} />

      {/* key: icon + label */}
      <MuffinIcon cx={18} cy={ROWS_END + 24} />
      <text
        x={32}
        y={ROWS_END + 24}
        dominantBaseline="central"
        fontSize={9}
        fontWeight={600}
        fill="#4B5563"
      >
        {lang === 'id' ? '= 6 muffin' : '= 6 muffins'}
      </text>
    </svg>
  )
}

// ── Default export: illustration container ────────────────────────────────────
export default function PictographMuffinsSASMO19G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Grafik gambar muffin: Anastacia 1 ikon, Braiden 7 ikon, Clarke 8 ikon, Darla 4 ikon, Eddie 4 ikon. Setiap ikon mewakili 6 muffin."
    >
      <PictographMuffinsFigure />
    </div>
  )
}
