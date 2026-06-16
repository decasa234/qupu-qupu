// "Which is the second longest?" figure for WMI-19F1-Q4.
// Four labelled strips A–D of different lengths drawn over a faint column grid.
// Real-figure ordering by length: B (longest) > A (second) > D > C (shortest),
// so the SECOND longest strip is A — the correct answer.
export interface Bar {
  label: string
  /** Grid column where the strip starts (0..GRID_COLS). */
  start: number
  /** Strip length in grid columns. */
  length: number
  /** Cross-hatch / fill pattern id. */
  pattern: 'diag' | 'dots' | 'wave' | 'cross'
}

export const GRID_COLS = 13
export const GRID_ROWS = 4

// Lengths chosen to match the figure: B=10 (longest), A=9 (second), D=8, C=7.
export const BARS: Bar[] = [
  { label: 'A', start: 1, length: 9, pattern: 'diag' },
  { label: 'B', start: 2, length: 10, pattern: 'dots' },
  { label: 'C', start: 1, length: 7, pattern: 'wave' },
  { label: 'D', start: 5, length: 8, pattern: 'cross' },
]

/** B is longest (10), A second (9), then D (8), then C (7). */
export const LONGEST_LABEL = 'B'
export const SECOND_LONGEST_LABEL = 'A'

export const SL_VIEW_W = 522
export const SL_VIEW_H = 240

const PAD_L = 26 // room for the row labels (A–D)
const PAD_R = 6
const PAD_T = 8
const PAD_B = 8
const COL_W = (SL_VIEW_W - PAD_L - PAD_R) / GRID_COLS
const ROW_H = (SL_VIEW_H - PAD_T - PAD_B) / GRID_ROWS
const BAR_H = ROW_H * 0.62

const HILITE = '#FDE68A'
const HILITE_STROKE = '#D97706'
const GREEN = '#10B981'
const GREEN_FILL = '#D1FAE5'

export interface SecondLongestBarsProps {
  /** Label of the bar to highlight as "longest" (amber). */
  longest?: string | null
  /** Label of the bar to highlight as "second longest" (green). */
  second?: string | null
}

function patternFill(pattern: Bar['pattern']): string {
  return `url(#sl-${pattern})`
}

export function SecondLongestBars({ longest = null, second = null }: SecondLongestBarsProps) {
  return (
    <svg
      viewBox={`0 0 ${SL_VIEW_W} ${SL_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 522, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="sl-diag" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={8} height={8} fill="#fff" />
          <rect width={4} height={8} fill="#1F2937" />
        </pattern>
        <pattern id="sl-dots" width={8} height={8} patternUnits="userSpaceOnUse">
          <rect width={8} height={8} fill="#fff" />
          <path d="M0 4 L4 0 M4 8 L8 4" stroke="#475569" strokeWidth={1} />
        </pattern>
        <pattern id="sl-wave" width={12} height={6} patternUnits="userSpaceOnUse">
          <rect width={12} height={6} fill="#fff" />
          <path d="M0 3 Q3 0 6 3 T12 3" fill="none" stroke="#475569" strokeWidth={1.2} />
        </pattern>
        <pattern id="sl-cross" width={8} height={8} patternUnits="userSpaceOnUse">
          <rect width={8} height={8} fill="#fff" />
          <path d="M0 0 L8 8 M8 0 L0 8" stroke="#1F2937" strokeWidth={1} />
        </pattern>
      </defs>

      {/* Faint column grid for visual length comparison */}
      {Array.from({ length: GRID_COLS + 1 }, (_, c) => (
        <line
          key={`col-${c}`}
          x1={PAD_L + c * COL_W}
          y1={PAD_T}
          x2={PAD_L + c * COL_W}
          y2={SL_VIEW_H - PAD_B}
          stroke="#E2E8F0"
          strokeWidth={1}
        />
      ))}
      {/* Outer frame */}
      <rect
        x={PAD_L}
        y={PAD_T}
        width={SL_VIEW_W - PAD_L - PAD_R}
        height={SL_VIEW_H - PAD_T - PAD_B}
        fill="none"
        stroke="#94A3B8"
        strokeWidth={1.5}
      />

      {BARS.map((bar, i) => {
        const x = PAD_L + bar.start * COL_W
        const w = bar.length * COL_W
        const yMid = PAD_T + i * ROW_H + ROW_H / 2
        const y = yMid - BAR_H / 2
        const isLongest = longest === bar.label
        const isSecond = second === bar.label
        const stroke = isSecond ? GREEN : isLongest ? HILITE_STROKE : '#1F2937'
        return (
          <g key={bar.label}>
            {/* highlight backing */}
            {(isLongest || isSecond) && (
              <rect
                x={x - 3}
                y={y - 3}
                width={w + 6}
                height={BAR_H + 6}
                rx={4}
                fill={isSecond ? GREEN_FILL : HILITE}
                opacity={0.55}
              />
            )}
            <rect x={x} y={y} width={w} height={BAR_H} fill={patternFill(bar.pattern)} stroke={stroke} strokeWidth={isLongest || isSecond ? 2.5 : 1.5} />
            <text
              x={PAD_L - 10}
              y={yMid}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontStyle="italic"
              fontWeight={700}
              fill={isSecond ? GREEN : isLongest ? HILITE_STROKE : '#1F2937'}
            >
              {bar.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function SecondLongestIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four labelled horizontal strips A, B, C and D of different lengths. B is the longest, A is the second longest, then D, and C is the shortest."
    >
      <SecondLongestBars />
    </div>
  )
}
