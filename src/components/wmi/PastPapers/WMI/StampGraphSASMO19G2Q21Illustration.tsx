// SASMO-19-G2-Q21 — Pictograph: stamps owned by 5 children.
//
// Source (OCR 2019-2020.md §Q21, crops 025–029.jpg):
//   Each △ stands for 3 stamps.
//   Anthony  1 △  →  3 stamps
//   Brandon  2 △  →  6 stamps
//   Carol    4 △  → 12 stamps   (distributed after)
//   Dennis   3 △  →  9 stamps
//   Elizabeth 4 △  → 12 stamps
//
// The STEM shows all five rows unchanged — Carol's distribution is the solution,
// never revealed here. The explainer handles that.
//
// No matching primitive exists; this is a row-of-symbols pictograph table.
// Co-exports PictographTable for the explainer to reuse with phase data.

const CHILDREN = ['Anthony', 'Brandon', 'Carol', 'Dennis', 'Elizabeth'] as const
type Child = (typeof CHILDREN)[number]

/** Initial triangle counts per child (seed-verified). */
export const TRIANGLE_COUNTS: Record<Child, number> = {
  Anthony: 1,
  Brandon: 2,
  Carol: 4,
  Dennis: 3,
  Elizabeth: 4,
}

/** Stamps per triangle (seed quantity). */
export const STAMPS_PER_TRI = 3

// ── layout constants ────────────────────────────────────────────────────────
const ROW_H = 44
const NAME_W = 88
const TRI_SIZE = 28   // bounding box side for each triangle glyph
const TRI_GAP = 6
const MAX_TRIS = 4    // Carol / Elizabeth max in the original
const CELL_W = MAX_TRIS * (TRI_SIZE + TRI_GAP) + TRI_GAP
const PAD = 14
const HEADER_H = 32
const LEGEND_H = 30

const TOTAL_W = PAD + NAME_W + 2 + CELL_W + PAD   // 2px divider
const TOTAL_H = PAD + HEADER_H + CHILDREN.length * ROW_H + LEGEND_H + PAD

// qupu token colours (no tailwind — pure SVG)
const BLUE = '#30598A'
const ORANGE = '#F97316'
const CREAM = '#FFF8F0'
const SHELL = '#FEF3E2'
const AMBER_LIGHT = '#FEF9C3'
const CAROL_HIGHLIGHT = '#DCFCE7'  // light green — highlights Carol's row

/** One triangle glyph at (cx, cy) top-centre. */
function Triangle({
  cx,
  cy,
  size = TRI_SIZE,
  fill = CREAM,
  stroke = BLUE,
}: {
  cx: number
  cy: number
  size?: number
  fill?: string
  stroke?: string
}) {
  const hw = size / 2
  const h = (size * Math.sqrt(3)) / 2
  const top = cy - h * 0.6
  const bot = cy + h * 0.4
  return (
    <polygon
      points={`${cx},${top} ${cx + hw},${bot} ${cx - hw},${bot}`}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/**
 * PictographTable — the shared pictograph figure.
 *
 * @param counts         triangle counts per child (may differ from TRIANGLE_COUNTS
 *                       when the explainer shows the "after" state).
 * @param highlightCarol when true, Carol's row gets a soft green band (the "she is
 *                       giving her stamps away" beat).
 * @param grayCarol      when true, Carol's triangles are drawn greyed-out (empty).
 */
export function PictographTable({
  counts = TRIANGLE_COUNTS,
  highlightCarol = false,
  grayCarol = false,
}: {
  counts?: Record<Child, number>
  highlightCarol?: boolean
  grayCarol?: boolean
}) {
  const tableTop = PAD + HEADER_H
  const cellX = PAD + NAME_W + 2

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width={Math.min(320, TOTAL_W)}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={TOTAL_W} height={TOTAL_H} rx={10} fill={SHELL} />

      {/* header */}
      <rect x={0} y={0} width={TOTAL_W} height={PAD + HEADER_H} rx={10} fill={BLUE} />
      <rect x={0} y={PAD + HEADER_H - 10} width={TOTAL_W} height={10} fill={BLUE} />
      <text
        x={PAD + NAME_W / 2}
        y={PAD + HEADER_H / 2 + 6}
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill={CREAM}
      >
        Nama
      </text>
      <text
        x={cellX + CELL_W / 2}
        y={PAD + HEADER_H / 2 + 6}
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill={CREAM}
      >
        Prangko (△)
      </text>

      {/* name / cell divider */}
      <line
        x1={PAD + NAME_W}
        y1={PAD}
        x2={PAD + NAME_W}
        y2={PAD + HEADER_H + CHILDREN.length * ROW_H}
        stroke={BLUE}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.4}
      />

      {/* rows */}
      {CHILDREN.map((child, i) => {
        const rowY = tableTop + i * ROW_H
        const isCarol = child === 'Carol'
        const rowFill =
          isCarol && highlightCarol
            ? CAROL_HIGHLIGHT
            : i % 2 === 0
              ? CREAM
              : AMBER_LIGHT

        const triCount = counts[child] ?? 0
        const triStroke = isCarol && grayCarol ? '#9CA3AF' : BLUE
        const triFill = isCarol && grayCarol ? '#E5E7EB' : CREAM

        return (
          <g key={child}>
            {/* row background */}
            <rect
              x={PAD / 2}
              y={rowY + 2}
              width={TOTAL_W - PAD}
              height={ROW_H - 4}
              rx={6}
              fill={rowFill}
            />

            {/* name */}
            <text
              x={PAD + NAME_W / 2}
              y={rowY + ROW_H / 2 + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill={BLUE}
            >
              {child}
            </text>

            {/* triangle glyphs */}
            {Array.from({ length: triCount }).map((_, t) => {
              const cx = cellX + TRI_GAP + t * (TRI_SIZE + TRI_GAP) + TRI_SIZE / 2
              const cy = rowY + ROW_H / 2
              return (
                <Triangle
                  key={t}
                  cx={cx}
                  cy={cy}
                  fill={triFill}
                  stroke={triStroke}
                />
              )
            })}

            {/* row bottom border */}
            <line
              x1={PAD / 2}
              y1={rowY + ROW_H - 2}
              x2={TOTAL_W - PAD / 2}
              y2={rowY + ROW_H - 2}
              stroke={BLUE}
              strokeWidth={0.5}
              opacity={0.2}
            />
          </g>
        )
      })}

      {/* legend */}
      {(() => {
        const legY = tableTop + CHILDREN.length * ROW_H + 6
        const legCx = PAD + TRI_SIZE / 2 + 4
        const legCy = legY + LEGEND_H / 2
        return (
          <g>
            <Triangle cx={legCx} cy={legCy} size={20} fill={CREAM} stroke={ORANGE} />
            <text
              x={legCx + TRI_SIZE / 2 + 4}
              y={legCy + 5}
              fontSize="12"
              fill={BLUE}
              fontWeight="600"
            >
              {`= ${STAMPS_PER_TRI} prangko`}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

/**
 * Default export — static stem illustration for SASMO-19-G2-Q21.
 * Shows the pictograph exactly as given in the problem (all 5 rows, no answer).
 */
export default function StampGraphSASMO19G2Q21Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Diagram gambar prangko: Anthony 1 segitiga, Brandon 2 segitiga, Carol 4 segitiga, Dennis 3 segitiga, Elizabeth 4 segitiga. Setiap segitiga mewakili 3 prangko."
    >
      <PictographTable />
    </div>
  )
}
