// Pictograph figure for WMI-20P3A-Q14 (2020 Grade 3 Semifinal).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q14.jpg:
// four zoos A, B, C, D each drawn as a row of elephant icons, where each icon
// stands for 3 elephants. The scan shows:
//   A: 2 icons   B: 5 icons   C: 4 icons   D: 3 icons
// Each icon = 3 elephants, so the real counts are 6, 15, 12, 9.
// Question: how many zoos have MORE THAN 10 elephants?  -> B (15) and C (12) = 2.
//
// The static figure shows ONLY the icon rows and the "= 3" key. It does NOT
// reveal the per-zoo totals or which zoos clear 10 — that is the explainer's job.

// Icon counts as drawn in the scan (ground truth for the explainer to bind to).
export const ZOO_ICONS = [
  { label: 'A', icons: 2 },
  { label: 'B', icons: 5 },
  { label: 'C', icons: 4 },
  { label: 'D', icons: 3 },
]
export const PER_ICON = 3
export const ZOO_TOTALS = ZOO_ICONS.map((z) => z.icons * PER_ICON) // 6, 15, 12, 9
export const THRESHOLD = 10
// Zoos strictly over 10: B (15) and C (12) -> 2 zoos.
export const OVER_COUNT = ZOO_TOTALS.filter((t) => t > THRESHOLD).length

const INK = '#1F2937'
const BODY = '#D1D5DB'
const BODY_DARK = '#9CA3AF'
const AXIS = '#374151'

/** One stylised elephant icon, drawn from basic shapes, fitting a ~46x32 box at (x, y-top-left). */
export function ElephantIcon({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* body */}
      <ellipse cx={20} cy={16} rx={17} ry={11} fill={BODY} stroke={INK} strokeWidth={1.4} />
      {/* head */}
      <circle cx={9} cy={14} r={9} fill={BODY} stroke={INK} strokeWidth={1.4} />
      {/* ear */}
      <ellipse cx={11} cy={12} rx={5} ry={6} fill={BODY_DARK} stroke={INK} strokeWidth={1} />
      {/* trunk */}
      <path
        d="M 2 16 Q -5 20 -3 27 Q -1 30 2 28"
        fill="none"
        stroke={INK}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* eye */}
      <circle cx={8} cy={12} r={1.4} fill={INK} />
      {/* legs */}
      <rect x={11} y={24} width={4.5} height={8} rx={1.5} fill={BODY} stroke={INK} strokeWidth={1.2} />
      <rect x={26} y={24} width={4.5} height={8} rx={1.5} fill={BODY} stroke={INK} strokeWidth={1.2} />
    </g>
  )
}

export const Q14_VIEW_W = 470
export const Q14_VIEW_H = 280

const LABEL_X = 26
const FIRST_ICON_X = 56
const ICON_GAP = 70
const ROW_Y = [30, 90, 150, 210]
const ICON_SCALE = 1.18

export interface Q14DiagramProps {
  /** Index (0..3) of the row whose total badge is shown, or -1 for none. */
  revealRow?: number
  /** Rows (by index) to ring as "over 10". */
  markedOver?: number[]
}

export function Q14Diagram({ revealRow = -1, markedOver = [] }: Q14DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q14_VIEW_W} ${Q14_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q14_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* key: one icon = 3 */}
      <g transform="translate(300, 246)">
        <ElephantIcon x={0} y={-6} scale={0.9} />
        <text x={44} y={10} fontSize={18} fontWeight={800} fill={INK}>
          = {PER_ICON}
        </text>
      </g>

      {/* y-axis (left) and x-axis (bottom) */}
      <line x1={44} y1={12} x2={44} y2={236} stroke={AXIS} strokeWidth={2.5} />
      <line x1={44} y1={236} x2={Q14_VIEW_W - 12} y2={236} stroke={AXIS} strokeWidth={2.5} />

      {ZOO_ICONS.map((zoo, r) => {
        const cy = ROW_Y[r]
        const over = markedOver.includes(r)
        return (
          <g key={zoo.label}>
            {/* tick + label */}
            <line x1={38} y1={cy + 14} x2={44} y2={cy + 14} stroke={AXIS} strokeWidth={2} />
            <text
              x={LABEL_X}
              y={cy + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight={800}
              fontStyle="italic"
              fill={INK}
            >
              {zoo.label}
            </text>
            {/* over-10 ring around the whole row */}
            {over && (
              <rect
                x={48}
                y={cy - 4}
                width={zoo.icons * ICON_GAP + 6}
                height={40}
                rx={9}
                fill="none"
                stroke="#F97316"
                strokeWidth={3}
              />
            )}
            {/* icons */}
            {Array.from({ length: zoo.icons }).map((_, i) => (
              <ElephantIcon key={i} x={FIRST_ICON_X + i * ICON_GAP} y={cy} scale={ICON_SCALE} />
            ))}
            {/* total badge for the revealed row */}
            {revealRow === r && (
              <g transform={`translate(${FIRST_ICON_X + zoo.icons * ICON_GAP + 8}, ${cy + 14})`}>
                <rect x={0} y={-13} width={50} height={26} rx={8} fill="#E1EFFB" stroke="#30598A" strokeWidth={2} />
                <text x={25} y={1} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#30598A">
                  = {ZOO_TOTALS[r]}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G3Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Pictograph of elephants in four zoos A, B, C, D. Each elephant icon represents 3 elephants. Zoo A has 2 icons, B has 5, C has 4, D has 3."
    >
      <Q14Diagram />
    </div>
  )
}
