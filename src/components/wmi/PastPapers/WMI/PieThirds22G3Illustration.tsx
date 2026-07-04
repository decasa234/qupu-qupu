// Pie-thirds puzzle for WMI-22F3A-Q2.
//
// Source figure: db/seed/wmi/figures/2022-final-g3-a-q2.jpg
// Five pie charts: circles 1, 2 and 5 show exactly 1/3 shaded (answer C = 3).
//
// Segment counts and shading derived by direct pixel-counting of the scan
// (angular ring sampling at r = 0.5, 0.65, 0.8 of each circle's radius):
//   Circle 1: 3 segments, 1 shaded  → 1/3  ✓
//   Circle 2: 12 segments, 4 shaded → 4/12 = 1/3 ✓  (evenly spread pinwheel)
//   Circle 3: 6 segments, 3 shaded  → 3/6  = 1/2 ✗  (alternating wedges)
//   Circle 4: 12 segments, 5 shaded → 5/12 ✗  (three adjacent at bottom + two on top)
//   Circle 5: 12 segments, 4 shaded → 4/12 = 1/3 ✓  (two adjacent pairs)
//
// This file draws ONLY the problem (the five diagrams) — never the answer.
// The PieDiagram primitive is co-exported so the animator can import it.

/** Props for the reusable pie-diagram primitive. */
export interface PieDiagramProps {
  /** Number of equal wedge segments. */
  segments: number
  /** 0-based indices of the shaded (pink) segments, in clockwise order starting from the top. */
  shadedIndices: number[]
  /** Radius of the circle in SVG user units. */
  r?: number
  /** cx, cy of the circle centre. */
  cx?: number
  cy?: number
  /** Stroke colour for the circle outline and dividers (default dark). */
  stroke?: string
  /** Stroke width (default 2). */
  strokeWidth?: number
}

const PIE_PINK = '#F9C4CB'
const PIE_WHITE = '#FFFFFF'
const PIE_STROKE = '#1F2937'

/**
 * PieDiagram — reusable pie chart primitive.
 *
 * Draws `segments` equal wedges centred at (cx, cy) with radius r.
 * Wedges listed in `shadedIndices` are filled pink; the rest are white.
 * Wedge 0 starts at the top (12 o'clock) and advances clockwise.
 *
 * Pure function — SSR-safe, no hooks.
 */
export function PieDiagram({
  segments,
  shadedIndices,
  r = 40,
  cx = 0,
  cy = 0,
  stroke = PIE_STROKE,
  strokeWidth = 2,
}: PieDiagramProps) {
  const shaded = new Set(shadedIndices)
  const angleStep = (2 * Math.PI) / segments

  const wedges: Array<{ d: string; filled: boolean }> = []
  for (let i = 0; i < segments; i++) {
    // Wedge i goes from startAngle to endAngle (clockwise, 0 = top)
    const startAngle = -Math.PI / 2 + i * angleStep
    const endAngle = startAngle + angleStep

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    // largeArcFlag = 1 when wedge > 180°
    const largeArc = angleStep > Math.PI ? 1 : 0

    const d = [
      `M ${cx.toFixed(3)},${cy.toFixed(3)}`,
      `L ${x1.toFixed(3)},${y1.toFixed(3)}`,
      `A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(3)},${y2.toFixed(3)}`,
      'Z',
    ].join(' ')

    wedges.push({ d, filled: shaded.has(i) })
  }

  return (
    <g>
      {wedges.map(({ d, filled }, i) => (
        <path
          key={i}
          d={d}
          fill={filled ? PIE_PINK : PIE_WHITE}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
      {/* outer circle ring over the wedges so the border is clean */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// In-card illustration — the five circles from the scan, drawn faithfully.
// ---------------------------------------------------------------------------

/**
 * Circle definitions (from direct image analysis):
 *   #1  3-seg, wedge 0 shaded              → 1/3  ✓
 *   #2  12-seg, wedges 1,4,7,10 shaded     → 4/12 = 1/3 ✓
 *   #3  6-seg, wedges 0,2,4 shaded         → 3/6  = 1/2 ✗
 *   #4  12-seg, wedges 1,4,5,6,10 shaded   → 5/12 ✗
 *   #5  12-seg, wedges 1,2,8,9 shaded      → 4/12 = 1/3 ✓
 */
const CIRCLES: PieDiagramProps[] = [
  { segments: 3,  shadedIndices: [0] },
  { segments: 12, shadedIndices: [1, 4, 7, 10] },
  { segments: 6,  shadedIndices: [0, 2, 4] },
  { segments: 12, shadedIndices: [1, 4, 5, 6, 10] },
  { segments: 12, shadedIndices: [1, 2, 8, 9] },
]

// Layout: 3 circles on top row, 2 centred on bottom row
const R = 44          // circle radius in SVG units
const GAP = 18        // horizontal gap between circles
const ROW_GAP = 20    // vertical gap between rows
const PAD = 12        // outer padding

// Three circles across the top row
const TOP_COUNT = 3
const TOP_ROW_W = TOP_COUNT * (2 * R) + (TOP_COUNT - 1) * GAP
const VIEW_W = PAD * 2 + TOP_ROW_W
const VIEW_H = PAD + R + ROW_GAP + R + R + PAD  // top: pad+R…+R, bottom: +gap+R…+R+pad

// Top row centres
const topY = PAD + R
const topXs = [
  PAD + R,
  PAD + R + (2 * R + GAP),
  PAD + R + 2 * (2 * R + GAP),
]

// Bottom row: 2 circles, centred under the top row
const BOT_COUNT = 2
const BOT_ROW_W = BOT_COUNT * (2 * R) + (BOT_COUNT - 1) * GAP
const botY = topY + R + ROW_GAP + R
const botStartX = (VIEW_W - BOT_ROW_W) / 2
const botXs = [
  botStartX + R,
  botStartX + R + (2 * R + GAP),
]

const ALL_CENTRES = [
  { cx: topXs[0], cy: topY },
  { cx: topXs[1], cy: topY },
  { cx: topXs[2], cy: topY },
  { cx: botXs[0], cy: botY },
  { cx: botXs[1], cy: botY },
]

/**
 * PieThirds22G3Illustration — in-card SVG for WMI-22F3A-Q2.
 *
 * Shows the five pie charts as they appear in the original scan.
 * Draws ONLY the problem setup; never reveals the answer.
 *
 * Pure function of params (params unused for this static figure),
 * SSR-safe, deterministic.
 */
export default function PieThirds22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima lingkaran terbagi menjadi irisan sama besar: lingkaran 1 punya 3 irisan dengan 1 diarsir merah muda; lingkaran 2 punya 12 irisan dengan 4 diarsir; lingkaran 3 punya 6 irisan dengan 3 diarsir; lingkaran 4 punya 12 irisan dengan 5 diarsir; lingkaran 5 punya 12 irisan dengan 4 diarsir. Pada berapa banyak lingkaran yang tepat 1/3 bagian luasnya diarsir?"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(340, VIEW_W)}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {CIRCLES.map((circle, i) => {
          const { cx, cy } = ALL_CENTRES[i]
          return (
            <PieDiagram
              key={i}
              segments={circle.segments}
              shadedIndices={circle.shadedIndices}
              r={R}
              cx={cx}
              cy={cy}
              stroke={PIE_STROKE}
              strokeWidth={2}
            />
          )
        })}
      </svg>
    </div>
  )
}
