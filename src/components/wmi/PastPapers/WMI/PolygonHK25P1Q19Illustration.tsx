// HKIMO-25-P1H-Q19 — "How many interior angle(s) is/are there in the polygon below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-1/2025.imgs/008.jpg:
// 7-sided non-convex polygon (heptagon) with two reflex angles — one on the right
// side (zigzag indent) and one at the bottom (upward V-notch). Answer: 7.
// Pure SVG, SSR-safe, no hooks.

export const SVG_W = 220
export const SVG_H = 200

// 7 vertices clockwise from upper-left.
// Reflex angles: index 3 (right-side concave) and index 5 (bottom V-peak).
export const VERTICES: ReadonlyArray<[number, number]> = [
  [20, 45],   // 0 UL  – upper-left
  [125, 10],  // 1 UR  – upper-right
  [155, 60],  // 2 SP  – right zigzag outer spike
  [85, 88],   // 3 RC  – right concave (reflex)
  [165, 145], // 4 LR  – lower-right
  [100, 112], // 5 BV  – bottom V peak (reflex)
  [18, 162],  // 6 LL  – lower-left
]

const INK = '#1F2937'
const FILL = '#EFF6FF'

export default function PolygonHK25P1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebuah poligon 7 sisi dengan dua sudut cekung."
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
