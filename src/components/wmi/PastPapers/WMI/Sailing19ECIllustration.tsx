// IKMC-22-EC-Q19 — "Karin sailed around four buoys, as shown."
//
// Faithfully reconstructs the figure from:
//   docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/041.jpg
//
// Layout (approximate SVG coords, 320×220 viewBox):
//   Boat:   left side,  ~x=36, y=110
//   Buoy 3: upper-left,  ~x=112, y=62
//   Buoy 1: upper-right, ~x=192, y=62
//   Buoy 4: right,       ~x=270, y=100
//   Buoy 2: lower-center,~x=160, y=162
//
// Sailing path (problem-only; never shows CW/CCW annotation):
//   Boat → Buoy3 (counterclockwise loop) → Buoy1 (clockwise loop)
//       → Buoy4 (clockwise loop) → Buoy2 (counterclockwise loop) → Boat
//
// Pure SVG, no raster.  SSR-safe, deterministic, no random/Date.
// Co-exports layout constants for the explainer to reuse.

// ── Layout constants ─────────────────────────────────────────────────────────

export const SVG_W = 320
export const SVG_H = 220

/** Centre of each buoy by number (1-indexed). */
export const BUOY: Record<number, [number, number]> = {
  1: [195, 62],
  2: [158, 162],
  3: [112, 62],
  4: [272, 100],
}

/** Buoy circle radius. */
export const BUOY_R = 22

/** Boat position (hull centre). */
export const BOAT_X = 34
export const BOAT_Y = 112

// ── Sub-components ───────────────────────────────────────────────────────────

/** Simple sailboat silhouette centred at (cx, cy). */
export function BoatGlyph({ cx, cy }: { cx: number; cy: number }) {
  // Hull: a small trapezoid
  const hW = 22
  const hH = 10
  // Mast
  const mH = 32
  // Sail (triangle)
  return (
    <g aria-hidden="true">
      {/* hull */}
      <path
        d={`M ${cx - hW / 2} ${cy} L ${cx + hW / 2} ${cy} L ${cx + hW / 2 - 4} ${cy + hH} L ${cx - hW / 2 + 4} ${cy + hH} Z`}
        fill="#9CA3AF"
        stroke="#374151"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* mast */}
      <line
        x1={cx - 2}
        y1={cy}
        x2={cx - 2}
        y2={cy - mH}
        stroke="#374151"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* sail (right-leaning triangle) */}
      <polygon
        points={`${cx - 2},${cy - mH} ${cx - 2},${cy - 6} ${cx + 14},${cy - 16}`}
        fill="white"
        stroke="#374151"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Numbered buoy (circle + label). */
export function BuoyGlyph({ num, x, y, r = BUOY_R }: { num: number; x: number; y: number; r?: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={r} fill="white" stroke="#374151" strokeWidth={2} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={700}
        fill="#111827"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {num}
      </text>
    </g>
  )
}

// ── Sailing path ──────────────────────────────────────────────────────────────
//
// The path is drawn as a single continuous cubic-bezier SVG path that:
//   1. Starts at the boat (right side of hull)
//   2. Enters buoy 3 from the left, loops counter-clockwise (the loop dips below
//      then swings up-right over the top), exits heading right toward buoy 1
//   3. Enters buoy 1 from the left, loops clockwise (dips above then comes back
//      below), exits heading right toward buoy 4
//   4. Enters buoy 4 from the left, loops clockwise, exits heading down-left
//   5. Enters buoy 2 from the right, loops counter-clockwise (comes around from
//      the left below), exits heading left back toward the boat
//   6. Returns to the boat (arrow tip at hull)
//
// We model this as two arrowhead-tipped segments:
//   • A forward arrow from boat → entering buoy 3 (showing initial direction)
//   • A return arrow arriving back at boat (showing return direction)
// Plus four smooth loop curves around each buoy (the characteristic "lemniscate"
// crossing/loop shape visible in the figure).
//
// The SVG path closely mirrors the figure's curved loop layout:
//   Buoy 3 (CCW): path crosses from below-left, loops up and over the top,
//                 exits to the right crossing the incoming line
//   Buoy 1 (CW):  path crosses from the left, loops below then back up
//   Buoy 4 (CW):  path loops from left, swings clockwise around
//   Buoy 2 (CCW): path comes from upper-right, loops left & below, exits left

function SailingPath({ color = '#374151' }: { color?: string }) {
  const [b1x, b1y] = BUOY[1]
  const [b2x, b2y] = BUOY[2]
  const [b3x, b3y] = BUOY[3]
  const [b4x, b4y] = BUOY[4]
  const bx = BOAT_X + 18  // boat right edge (start of forward arrow)
  const by = BOAT_Y - 4

  // Arrow marker id
  const arrowId = 'sail19-arrow'

  // The continuous path, broken into labeled segments for clarity.
  // Each buoy loop is a pair of cubic curves that form an approximate circle
  // around the buoy. The crossing/interweaving of the path segments (where
  // the forward leg crosses the return leg) is shown as distinct strokes.

  // Segment 1: Boat → approach Buoy 3
  const seg1 = `M ${bx},${by} C ${bx + 24},${by - 8} ${b3x - 36},${b3y + 30} ${b3x - BUOY_R - 2},${b3y + 6}`

  // Segment 2: CCW loop around Buoy 3 (enters left-side, goes below then over top, exits right-side)
  const loop3 =
    `C ${b3x - BUOY_R - 16},${b3y + 26} ${b3x - 8},${b3y + BUOY_R + 18} ${b3x + 4},${b3y + BUOY_R + 4}` +
    ` C ${b3x + 16},${b3y + BUOY_R - 4} ${b3x + BUOY_R + 10},${b3y - 8} ${b3x + BUOY_R},${b3y - 10}` +
    ` C ${b3x + BUOY_R - 6},${b3y - 20} ${b3x - 4},${b3y - BUOY_R - 10} ${b3x - BUOY_R - 2},${b3y - 4}` +
    ` C ${b3x - BUOY_R - 12},${b3y + 4} ${b3x - BUOY_R - 4},${b3y + 10} ${b3x + BUOY_R + 4},${b3y}`

  // Segment 3: Buoy 3 exit → approach Buoy 1
  const seg3 = `C ${b3x + BUOY_R + 24},${b3y - 4} ${b1x - BUOY_R - 24},${b1y - 4} ${b1x - BUOY_R - 2},${b1y}`

  // Segment 4: CW loop around Buoy 1 (enters left-side, goes above then loops below, exits right)
  const loop1 =
    `C ${b1x - BUOY_R - 10},${b1y - 14} ${b1x - 6},${b1y - BUOY_R - 14} ${b1x + 2},${b1y - BUOY_R - 4}` +
    ` C ${b1x + 12},${b1y - BUOY_R + 4} ${b1x + BUOY_R + 10},${b1y - 6} ${b1x + BUOY_R},${b1y + 4}` +
    ` C ${b1x + BUOY_R - 4},${b1y + 18} ${b1x + 4},${b1y + BUOY_R + 12} ${b1x - 4},${b1y + BUOY_R + 4}` +
    ` C ${b1x - 14},${b1y + BUOY_R - 4} ${b1x - BUOY_R - 8},${b1y + 10} ${b1x + BUOY_R + 4},${b1y + 2}`

  // Segment 5: Buoy 1 exit → approach Buoy 4
  const seg5 = `C ${b1x + BUOY_R + 24},${b1y - 2} ${b4x - BUOY_R - 20},${b4y - 14} ${b4x - BUOY_R - 2},${b4y}`

  // Segment 6: CW loop around Buoy 4
  const loop4 =
    `C ${b4x - BUOY_R - 10},${b4y - 16} ${b4x - 4},${b4y - BUOY_R - 12} ${b4x + 4},${b4y - BUOY_R - 2}` +
    ` C ${b4x + 14},${b4y - BUOY_R + 8} ${b4x + BUOY_R + 8},${b4y - 4} ${b4x + BUOY_R},${b4y + 6}` +
    ` C ${b4x + BUOY_R - 2},${b4y + 20} ${b4x + 6},${b4y + BUOY_R + 10} ${b4x - 4},${b4y + BUOY_R + 2}` +
    ` C ${b4x - 14},${b4y + BUOY_R - 6} ${b4x - BUOY_R - 6},${b4y + 8} ${b4x - BUOY_R + 2},${b4y - 2}` +
    ` C ${b4x - BUOY_R + 8},${b4y - 10} ${b4x - 10},${b4y - BUOY_R - 4} ${b2x + BUOY_R + 10},${b4y - 2}`

  // Segment 7: Buoy 4 exit → approach Buoy 2
  const seg7 = `C ${b2x + BUOY_R + 24},${b2y - 22} ${b2x + BUOY_R + 12},${b2y - 10} ${b2x + BUOY_R + 2},${b2y}`

  // Segment 8: CCW loop around Buoy 2 (enters right-side, goes below then over top, exits left)
  const loop2 =
    `C ${b2x + BUOY_R + 12},${b2y + 14} ${b2x + 8},${b2y + BUOY_R + 12} ${b2x - 2},${b2y + BUOY_R + 4}` +
    ` C ${b2x - 16},${b2y + BUOY_R - 2} ${b2x - BUOY_R - 10},${b2y + 8} ${b2x - BUOY_R - 2},${b2y}` +
    ` C ${b2x - BUOY_R - 12},${b2y - 14} ${b2x - 6},${b2y - BUOY_R - 12} ${b2x + 4},${b2y - BUOY_R - 4}` +
    ` C ${b2x + 14},${b2y - BUOY_R + 4} ${b2x + BUOY_R + 6},${b2y - 6} ${b2x - BUOY_R - 4},${b2y - 2}`

  // Segment 9: Buoy 2 exit → return to boat
  const seg9 = `C ${b2x - BUOY_R - 20},${b2y - 12} ${bx + 16},${by + 18} ${bx + 2},${by + 6}`

  const d = [seg1, loop3, seg3, loop1, seg5, loop4, seg7, loop2, seg9].join(' ')

  return (
    <g>
      <defs>
        <marker
          id={arrowId}
          markerWidth={8}
          markerHeight={8}
          refX={6}
          refY={3}
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Forward arrow head — near buoy 3 approach */}
      <path
        d={seg1}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        markerEnd={`url(#${arrowId})`}
        strokeLinecap="round"
      />
      {/* Return arrow head — return to boat */}
      <path
        d={seg9}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        markerEnd={`url(#${arrowId})`}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Sailing19ECIllustration
 *
 * Static problem-only figure for IKMC-22-EC-Q19.
 * Shows the boat and four numbered buoys with Karin's sailing path.
 * Does NOT label any buoy as CW or CCW (that would reveal the answer).
 */
export default function Sailing19ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah perahu berlayar melewati empat pelampung bernomor 1, 2, 3, dan 4. ' +
        'Jalur berlayar melingkari setiap pelampung, sebagian searah jarum jam dan sebagian berlawanan. ' +
        'Pelampung 3 ada di kiri atas, pelampung 1 di kanan atas, pelampung 4 di kanan, pelampung 2 di bawah.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* sailing path (drawn first so buoys render on top) */}
        <SailingPath />

        {/* boat */}
        <BoatGlyph cx={BOAT_X} cy={BOAT_Y} />

        {/* buoys */}
        {([1, 2, 3, 4] as const).map((n) => (
          <BuoyGlyph key={n} num={n} x={BUOY[n][0]} y={BUOY[n][1]} />
        ))}
      </svg>
    </div>
  )
}
