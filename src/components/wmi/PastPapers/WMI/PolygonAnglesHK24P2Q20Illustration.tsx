// HKIMO-24-P2H-Q20 — "How many interior angle(s) is / are there in the polygon below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-2/2024.imgs/008.jpg:
// a 12-sided concave polygon: an upward-pointing arrow with a zig-zag shaft
// (2 concave V-notches on the left, 1 on the right) connected at the base to a
// 2-step descending staircase on the lower-right.
//
// Answer: 12 interior angles (one per vertex = one per side).
// Pure SVG, SSR-safe, no hooks.

const INK = '#1F2937'
const FILL = '#EFF6FF'
const DOT_FILL = '#E11D48'
const DOT_TEXT = '#ffffff'

// 12 vertices, clockwise from the apex (top tip).
// ViewBox: 0 0 420 330
export const PTS: ReadonlyArray<[number, number]> = [
  [188, 18],  //  1: apex — top tip of the upward arrow
  [278, 112], //  2: right arrowhead barb (going right-down)
  [242, 152], //  3: right shaft V-notch — concave, goes inward-left
  [308, 268], //  4: staircase top-left — diagonal from shaft lands here
  [355, 268], //  5: step 1 top-right (going right)
  [355, 296], //  6: step 1 riser base (going down)
  [382, 296], //  7: step 2 top-right (going right)
  [382, 312], //  8: bottom-right corner (going down)
  [30,  312], //  9: bottom-left corner (going left along bottom edge)
  [86,  252], // 10: left V-notch 1 — concave, goes inward-right
  [86,  188], // 11: left V-notch 2 — concave, goes inward-right
  [112, 112], // 12: left arrowhead barb (going right-up)
]

interface FigureProps {
  /** Number of vertex-dot labels to show, 0 = none, 12 = all */
  highlightCount?: number
}

/** Shared figure — used by both Illustration and Explainer. */
export function PolygonAnglesHK24P2Q20Figure({ highlightCount = 0 }: FigureProps) {
  const pointsStr = PTS.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg
      viewBox="0 0 420 330"
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <polygon
        points={pointsStr}
        fill={FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {highlightCount > 0 &&
        PTS.slice(0, highlightCount).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={8} fill={DOT_FILL} />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={DOT_TEXT}
              fontSize={8}
              fontFamily="system-ui, sans-serif"
              fontWeight="bold"
            >
              {i + 1}
            </text>
          </g>
        ))}
    </svg>
  )
}

export default function PolygonAnglesHK24P2Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Poligon 12 sisi: panah zigzag menghadap ke atas dengan dua takik cekung di sisi kiri, satu di sisi kanan, dan tangga dua anak di kanan bawah."
    >
      <PolygonAnglesHK24P2Q20Figure />
    </div>
  )
}
