// Ribbons-on-a-grid figure for WMI-20P1A-Q9 (2020 WMI Semifinal Grade 1 Paper A).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g1-a-q9.jpg:
// a 10-column x 7-row square grid holds four horizontal ribbons, each starting
// at the left edge and running a whole number of squares. The fills (hatch,
// stars, crosshatch, dotted) only tell the ribbons apart — the LENGTH in squares
// is what the question asks about.
//
//   ribbon 1 (diagonal hatch): 9 squares  ← longest
//   ribbon 2 (stars):          8 squares
//   ribbon 3 (crosshatch):     5 squares  ← shortest
//   ribbon 4 (dotted):         7 squares
//
// Longest - shortest = 9 - 5 = 4 squares  (answer B).
export const RIBBONS = [
  { key: 'hatch', squares: 9, label: 'A' },
  { key: 'stars', squares: 8, label: 'B' },
  { key: 'cross', squares: 5, label: 'C' },
  { key: 'dots', squares: 7, label: 'D' },
] as const

export type RibbonKey = (typeof RIBBONS)[number]['key']

export const RIBBON_SQUARES = RIBBONS.map((r) => r.squares)
export const LONGEST = Math.max(...RIBBON_SQUARES) // 9
export const SHORTEST = Math.min(...RIBBON_SQUARES) // 5
export const DIFFERENCE = LONGEST - SHORTEST // 4

// Grid geometry.
const COLS = 10
const ROWS = 7
const CELL = 38
const PAD = 16
export const RIBBON_VIEW_W = PAD * 2 + COLS * CELL // 412
export const RIBBON_VIEW_H = PAD * 2 + ROWS * CELL // 298

const GRID_LINE = '#9CA3AF'
const RIBBON_STROKE = '#111827'

// Each ribbon lives on its own grid row (rows 1, 2, 4, 5 — leaving blank rows
// between so the strips read as separate, matching the scan).
const RIBBON_ROW = [1, 2, 4, 5]

/** SVG <defs> with the four ribbon fill patterns. Mount once per <svg>. */
export function RibbonPatterns() {
  return (
    <defs>
      <pattern id="rb-hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width={8} height={8} fill="#FFFFFF" />
        <line x1={0} y1={0} x2={0} y2={8} stroke="#374151" strokeWidth={2.5} />
      </pattern>
      <pattern id="rb-stars" width={18} height={18} patternUnits="userSpaceOnUse">
        <rect width={18} height={18} fill="#FFFFFF" />
        <text x={9} y={13} textAnchor="middle" fontSize={12} fill="#374151">
          *
        </text>
      </pattern>
      <pattern id="rb-cross" width={6} height={6} patternUnits="userSpaceOnUse">
        <rect width={6} height={6} fill="#FFFFFF" />
        <line x1={0} y1={0} x2={6} y2={0} stroke="#374151" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={6} stroke="#374151" strokeWidth={1} />
      </pattern>
      <pattern id="rb-dots" width={12} height={12} patternUnits="userSpaceOnUse">
        <rect width={12} height={12} fill="#FFFFFF" />
        <circle cx={6} cy={6} r={1.6} fill="#374151" />
      </pattern>
    </defs>
  )
}

const FILL_BY_KEY: Record<RibbonKey, string> = {
  hatch: 'url(#rb-hatch)',
  stars: 'url(#rb-stars)',
  cross: 'url(#rb-cross)',
  dots: 'url(#rb-dots)',
}

export interface RibbonGridProps {
  /** Which ribbon (by index 0..3) is currently highlighted, or null for none. */
  highlight?: number | null
  /** Show a "= N" length badge at the end of the highlighted ribbon. */
  showLength?: boolean
  /** Tint colour for the highlight ring / badge. */
  highlightColor?: string
}

/** The reusable grid-of-ribbons primitive. */
export function RibbonGrid({ highlight = null, showLength = false, highlightColor = '#2f6df0' }: RibbonGridProps) {
  return (
    <svg
      viewBox={`0 0 ${RIBBON_VIEW_W} ${RIBBON_VIEW_H}`}
      width="100%"
      style={{ maxWidth: RIBBON_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <RibbonPatterns />

      {/* grid lines */}
      <g stroke={GRID_LINE} strokeWidth={1}>
        {Array.from({ length: COLS + 1 }, (_, c) => (
          <line key={`v${c}`} x1={PAD + c * CELL} y1={PAD} x2={PAD + c * CELL} y2={PAD + ROWS * CELL} />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, r) => (
          <line key={`h${r}`} x1={PAD} y1={PAD + r * CELL} x2={PAD + COLS * CELL} y2={PAD + r * CELL} />
        ))}
      </g>

      {/* ribbons */}
      {RIBBONS.map((rb, i) => {
        const row = RIBBON_ROW[i]
        const x = PAD
        const y = PAD + row * CELL + 4
        const w = rb.squares * CELL
        const h = CELL - 8
        const isHi = highlight === i
        return (
          <g key={rb.key}>
            <rect x={x} y={y} width={w} height={h} fill={FILL_BY_KEY[rb.key]} stroke={RIBBON_STROKE} strokeWidth={2} />
            {isHi && (
              <rect
                x={x - 2}
                y={y - 2}
                width={w + 4}
                height={h + 4}
                fill="none"
                stroke={highlightColor}
                strokeWidth={3.5}
                rx={3}
              />
            )}
            {isHi && showLength && (
              <g>
                <rect
                  x={x + w + 8}
                  y={y + h / 2 - 13}
                  width={46}
                  height={26}
                  rx={6}
                  fill="#FFFFFF"
                  stroke={highlightColor}
                  strokeWidth={2}
                />
                <text
                  x={x + w + 8 + 23}
                  y={y + h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill={highlightColor}
                >
                  {`= ${rb.squares}`}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G1Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A square grid with four horizontal ribbons of different lengths, each starting at the left edge."
    >
      <RibbonGrid />
    </div>
  )
}
