// HKIMO-22-P1H-Q17 — "How many edges are there in the polygon below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-1/2022.imgs/003.jpg:
// a wide rectangle (box) with an upward-pointing arrow protruding from the top centre.
// Single closed polygon. Pure SVG, SSR-safe, no hooks.

const INK = '#1F2937'
const FILL = '#EFF6FF'

// Outline vertices, clockwise from bottom-left (viewBox 0 0 360 240).
const PTS: ReadonlyArray<[number, number]> = [
  [20, 220], // bottom-left
  [20, 110], // top-left
  [155, 110], // top edge → left base of arrow shaft
  [155, 80], // shaft left wall up
  [135, 80], // out to left barb of arrowhead
  [180, 35], // apex
  [225, 80], // down to right barb
  [205, 80], // in to shaft right
  [205, 110], // shaft right wall down to top edge
  [340, 110], // top edge → top-right
  [340, 220], // right wall down to bottom-right
]

export default function CountEdgesHK22P1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebuah segi-banyak berbentuk kotak persegi panjang dengan anak panah menghadap ke atas menonjol dari sisi atasnya."
    >
      <svg
        viewBox="0 0 360 240"
        width="100%"
        style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <polygon
          points={PTS.map(([x, y]) => `${x},${y}`).join(' ')}
          fill={FILL}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
