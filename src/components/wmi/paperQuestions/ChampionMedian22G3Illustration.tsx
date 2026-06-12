// WMI-22F3A-Q13 — Championship wins by country (last 50 years).
// Shows a horizontal bar chart of win counts, sorted ascending, so the student
// can locate the median. The median bar (5th of 9) is NOT pre-highlighted here —
// the animator imports WinCountChart and adds the highlight after the answer.
//
// Verified tally (sums to 50):
//   England 13, Spain 13, Germany 8, Italy 8, Netherlands 3,
//   Portugal 2, Romania 1, Serbia 1, France 1
//   Sorted counts: 1,1,1,2,3,8,8,13,13  →  median (5th) = 3 → Netherlands

export interface WinCountRow {
  country: string
  count: number
}

// Rows sorted ascending by count (then alpha for ties) — the order that makes
// the median problem answerable. The animator must NOT re-sort.
export const WIN_COUNTS: ReadonlyArray<WinCountRow> = [
  { country: 'Romania',     count: 1  },
  { country: 'Serbia',      count: 1  },
  { country: 'France',      count: 1  },
  { country: 'Portugal',    count: 2  },
  { country: 'Netherlands', count: 3  },
  { country: 'Germany',     count: 8  },
  { country: 'Italy',       count: 8  },
  { country: 'England',     count: 13 },
  { country: 'Spain',       count: 13 },
]

// ---- Layout constants -------------------------------------------------------

const VIEW_W   = 340
const PAD_L    = 86  // left margin for country labels
const PAD_R    = 36  // right margin for count labels
const PAD_TOP  = 18
const PAD_BOT  = 14
const ROW_H    = 26
const BAR_H    = 16
const MAX_COUNT = 13  // longest bar value
const PLOT_W   = VIEW_W - PAD_L - PAD_R  // 218 px

// Map a win count to bar pixel width
const barW = (count: number) => (count / MAX_COUNT) * PLOT_W

// Centre y of a row
const rowCY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2

// ---- Primitive: reusable chart component ------------------------------------

export interface WinCountChartProps {
  /** Rows to render. Defaults to WIN_COUNTS. */
  rows?: ReadonlyArray<WinCountRow>
  /**
   * Index of the row to highlight (0-based within `rows`).
   * When null/undefined nothing is highlighted.
   */
  highlightIndex?: number | null
}

/**
 * WinCountChart — a horizontal bar chart of championship win counts.
 *
 * Pure SVG fragment (no outer div). Caller places it inside an <svg> with the
 * correct viewBox, or wraps it in a container. The animator imports this and
 * passes highlightIndex to reveal the median bar.
 */
export function WinCountChart({ rows = WIN_COUNTS, highlightIndex = null }: WinCountChartProps) {
  const chartH = PAD_TOP + rows.length * ROW_H + PAD_BOT

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${chartH}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Vertical axis line */}
      <line
        x1={PAD_L}
        y1={PAD_TOP - 4}
        x2={PAD_L}
        y2={PAD_TOP + rows.length * ROW_H}
        stroke="#CBD5E1"
        strokeWidth={1.5}
      />

      {/* Subtle vertical grid lines at 4, 8, 12 */}
      {[4, 8, 12].map((tick) => (
        <line
          key={tick}
          x1={PAD_L + barW(tick)}
          y1={PAD_TOP - 4}
          x2={PAD_L + barW(tick)}
          y2={PAD_TOP + rows.length * ROW_H}
          stroke="#E2E8F0"
          strokeWidth={1}
        />
      ))}

      {rows.map((row, i) => {
        const cy    = rowCY(i)
        const bw    = barW(row.count)
        const isHit = highlightIndex === i

        // Bar fill: highlighted = brand-orange, normal = brand-blue at 80% opacity
        const barFill  = isHit ? '#f0853a' : '#30598A'
        const barOpacity = isHit ? 1 : 0.75

        return (
          <g key={row.country}>
            {/* Country label (right-aligned, left of axis) */}
            <text
              x={PAD_L - 6}
              y={cy}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={isHit ? 800 : 600}
              fill={isHit ? '#f0853a' : '#1E3A8A'}
              fontFamily="Nunito, sans-serif"
            >
              {row.country}
            </text>

            {/* Bar body */}
            <rect
              x={PAD_L + 2}
              y={cy - BAR_H / 2}
              width={Math.max(bw, 2)}
              height={BAR_H}
              rx={3}
              fill={barFill}
              opacity={barOpacity}
              stroke={isHit ? '#f0853a' : 'none'}
              strokeWidth={isHit ? 1.5 : 0}
            />

            {/* Win count label at the end of bar */}
            <text
              x={PAD_L + bw + 9}
              y={cy}
              dominantBaseline="central"
              fontSize={11}
              fontWeight={800}
              fill={isHit ? '#f0853a' : '#1E3A8A'}
              fontFamily="Nunito, sans-serif"
            >
              {row.count}
            </text>
          </g>
        )
      })}

      {/* X-axis label */}
      <text
        x={PAD_L + PLOT_W / 2}
        y={PAD_TOP + rows.length * ROW_H + PAD_BOT - 2}
        textAnchor="middle"
        fontSize={10}
        fill="#64748B"
        fontFamily="Nunito, sans-serif"
      >
        Jumlah kemenangan
      </text>
    </svg>
  )
}

// ---- SAMPLE fallback for type-narrowed params --------------------------------

interface ChampionMedianParams {
  /** No dynamic params for this question; the tally is fixed. */
  _unused?: unknown
}

const SAMPLE: ChampionMedianParams = {}

// ---- Default export: the static in-card illustration -----------------------

/**
 * ChampionMedian22G3Illustration
 *
 * Shows all 9 countries and their championship win counts as a horizontal bar
 * chart, sorted ascending, so the student can count to find the median.
 * Does NOT pre-highlight the median bar (that is the answer — the animator
 * reveals it post-answer using WinCountChart with highlightIndex=4).
 */
export default function ChampionMedian22G3Illustration({ params }: { params: unknown }) {
  // params is not used (tally is fixed), but we narrow defensively.
  void ((params ?? {}) as Partial<ChampionMedianParams> ?? SAMPLE)

  const ariaRows = WIN_COUNTS.map((r) => `${r.country} ${r.count}`).join(', ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Grafik batang horizontal: jumlah gelar kejuaraan per negara selama 50 tahun terakhir. ${ariaRows}.`}
    >
      <WinCountChart />
    </div>
  )
}
