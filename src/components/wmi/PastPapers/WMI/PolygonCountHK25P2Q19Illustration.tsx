// HKIMO-25-P2H-Q19 — "How many interior angle(s) is/are there in the polygon below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-2/2025.imgs/006.jpg:
// 6-sided concave polygon (hexagon) with two reflex angles — one on the left side
// (rightward V-notch) and one at the bottom (upward V-notch). Answer: 6.
// Pure SVG, SSR-safe, no hooks.

export const SVG_W = 285
export const SVG_H = 170

// 6 vertices clockwise from upper-left.
// Reflex angles: index 3 (bottom V peak, pointing up) and index 5 (left notch, pointing right).
export const VERTICES: ReadonlyArray<[number, number]> = [
  [20,  18],   // 0 TL — top-left (convex)
  [255, 15],   // 1 TR — top-right (convex)
  [265, 145],  // 2 LR — lower-right (convex)
  [148, 100],  // 3 BV — bottom V peak (reflex, points up into interior)
  [18,  152],  // 4 LL — lower-left (convex)
  [62,  72],   // 5 LN — left-side notch peak (reflex, points right into interior)
]

const INK = '#1F2937'
const FILL = '#EFF6FF'

export default function PolygonCountHK25P2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebuah poligon 6 sisi dengan dua sudut cekung (heksagon tidak beraturan)."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <polygon
          points={VERTICES.map(([x, y]) => `${x},${y}`).join(' ')}
          fill={FILL}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
