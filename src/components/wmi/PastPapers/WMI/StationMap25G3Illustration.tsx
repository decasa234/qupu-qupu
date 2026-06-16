// WMI-25F3A-Q8 (2025 Grade 3 Final) — Thailand Southern Line station map.
//
// The question: Tak takes the 07:30 train from Krung Thep Aphiwat (Bangkok)
// towards Chaiya. After 6 hours he is about to arrive at Chumphon. Anan takes
// the 07:30 train from Chaiya in the opposite direction at the same speed.
// Where is Anan after 6 hours?  Answer: A = Phetchaburi.
//
// NOTE ON SCAN (db/seed/wmi/figures/2025-final-g3-a-q8.jpg): The figure in the
// scan is a decorative high-speed train icon with no station names or timetable
// data. The station order below was reconstructed from Thailand's real Southern
// Main Line using the station names given in body_en and the answer choices.
// Real order (north to south): Krung Thep Aphiwat → Ratchaburi → Phetchaburi →
// Hua Hin → Prachuap Khiri Khan → Chumphon → Chaiya.
//
// The static figure draws ONLY the setup: the ordered station line with Tak's
// departure end (Krung Thep Aphiwat) and destination end (Chaiya) labelled, and
// Anan's departure end (Chaiya) labelled. It does NOT reveal which station Anan
// reaches after 6 hours — that is the animator's job.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

/** Ordered stations along the line, north-to-south (Krung Thep → Chaiya). */
export const STATIONS: readonly string[] = [
  'Krung Thep\nAphiwat',
  'Ratchaburi',
  'Phetchaburi',
  'Hua Hin',
  'Prachuap\nKhiri Khan',
  'Chumphon',
  'Chaiya',
] as const

/** Index of Tak's after-6-hours position (problem statement). */
export const TAK_POSITION = 5 // 'Chumphon'

/** Index of Anan's after-6-hours position (the answer — A = Phetchaburi). */
export const ANAN_POSITION = 2 // 'Phetchaburi' — never drawn in the static figure

// ---- layout constants -------------------------------------------------------
const VB_W = 320
const VB_H = 290
const LINE_X = 58    // x of the vertical track line
const Y_TOP = 28     // y of the first station
const Y_BOT = 262    // y of the last station
const STATION_R = 7  // circle radius for ordinary stations
const END_R = 9      // radius for endpoint stations (Krung Thep & Chaiya)

const N = STATIONS.length
const Y_STEP = (Y_BOT - Y_TOP) / (N - 1)

function stationY(i: number): number {
  return Y_TOP + i * Y_STEP
}

// Label text lines for stations that have a newline in their name.
function labelLines(name: string): string[] {
  return name.split('\n')
}

// ---- primitive ---------------------------------------------------------------

export interface StationMap25G3Props {
  /**
   * When provided, tints the station at that index with the highlight colour
   * (animator only — e.g. pass TAK_POSITION or ANAN_POSITION).
   */
  highlightIndex?: number | null
}

/**
 * Primitive. Draws the linear Southern Line station map.
 * Without `highlightIndex` (the default) all stations are equal; with it the
 * animator can tint one stop.
 */
export function StationMap25G3({ highlightIndex = null }: StationMap25G3Props = {}) {
  const trackY1 = stationY(0)
  const trackY2 = stationY(N - 1)

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={Math.min(280, VB_W)} aria-hidden="true">
      {/* vertical track line */}
      <line
        x1={LINE_X}
        y1={trackY1}
        x2={LINE_X}
        y2={trackY2}
        strokeWidth={4}
        strokeLinecap="round"
        className="stroke-qupu-brand-blue-shadow"
      />

      {/* direction arrows — small chevrons on the track */}
      {[1, 2, 3].map((t) => {
        const ay = trackY1 + (trackY2 - trackY1) * (t / 4)
        return (
          <polyline
            key={t}
            points={`${LINE_X - 5},${ay - 6} ${LINE_X},${ay} ${LINE_X + 5},${ay - 6}`}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-qupu-brand-blue-shadow"
          />
        )
      })}

      {/* stations */}
      {STATIONS.map((name, i) => {
        const cy = stationY(i)
        const isEnd = i === 0 || i === N - 1
        const r = isEnd ? END_R : STATION_R
        const lit = highlightIndex === i
        const lines = labelLines(name)

        // Label to the right of the dot
        const labelX = LINE_X + r + 12

        return (
          <g key={i}>
            <circle
              cx={LINE_X}
              cy={cy}
              r={r}
              strokeWidth={isEnd ? 3 : 2}
              className={
                lit
                  ? 'fill-qupu-cream stroke-qupu-brand-orange'
                  : isEnd
                    ? 'fill-qupu-shell stroke-qupu-brand-blue'
                    : 'fill-qupu-shell stroke-qupu-brand-blue-shadow'
              }
            />
            {/* station name — split over lines if needed */}
            {lines.map((line, li) => (
              <text
                key={li}
                x={labelX}
                y={cy + li * 14 - (lines.length - 1) * 7}
                dominantBaseline="central"
                fontSize={isEnd ? 14 : 12}
                fontWeight={isEnd ? 700 : 400}
                className={
                  lit
                    ? 'fill-qupu-brand-orange'
                    : isEnd
                      ? 'fill-qupu-brand-blue'
                      : 'fill-qupu-ink'
                }
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* Tak's train glyph at station 0 (Krung Thep Aphiwat) — shows departure end */}
      {(() => {
        const tx = LINE_X - END_R - 30
        const ty = stationY(0)
        return (
          <g transform={`translate(${tx}, ${ty})`}>
            {/* simple train silhouette: body + cab + wheels */}
            <rect x={-18} y={-10} width={24} height={14} rx={3} className="fill-qupu-brand-blue" />
            {/* cab nose */}
            <path d="M6,-6 L14,-2 L14,4 L6,4 Z" className="fill-qupu-brand-blue-shadow" />
            {/* window */}
            <rect x={-10} y={-7} width={8} height={6} rx={1} className="fill-qupu-cream" />
            {/* wheels */}
            <circle cx={-10} cy={6} r={3.5} className="fill-qupu-ink" />
            <circle cx={2} cy={6} r={3.5} className="fill-qupu-ink" />
          </g>
        )
      })()}

      {/* "07:30" label near both end stations */}
      {[0, N - 1].map((i) => {
        const cy = stationY(i)
        // time label sits above/below the end station dot
        const ty = i === 0 ? cy - END_R - 7 : cy + END_R + 12
        return (
          <text
            key={i}
            x={LINE_X + END_R + 12}
            y={ty}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            className="fill-qupu-brand-orange"
          >
            07:30
          </text>
        )
      })}
    </svg>
  )
}

/**
 * Default export: the plain station-line map — all seven stations shown in
 * order, both ends labelled with 07:30, decorative train glyph at the north
 * end. Reveals no answer about Anan's position.
 */
export default function StationMap25G3Illustration() {
  const stationList = STATIONS.map((s) => s.replace('\n', ' ')).join(' → ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Peta jalur kereta selatan Thailand: ${stationList}. Tak berangkat pukul 07:30 dari Krung Thep Aphiwat menuju Chaiya; Anan berangkat pukul 07:30 dari Chaiya menuju Krung Thep Aphiwat dengan kecepatan yang sama. Setelah 6 jam, Tak hampir tiba di Chumphon. Di stasiun mana Anan hampir tiba?`}
    >
      <StationMap25G3 />
    </div>
  )
}
