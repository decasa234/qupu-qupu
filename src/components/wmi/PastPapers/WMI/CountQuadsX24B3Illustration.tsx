// SEAMOX-24-B-Q3 — "How many quadrilaterals are there in the figure below?" (answer 16).
//
// Reconstructed from docs/reference/ocr-res/seamo-x/contest/paper-b/2024.imgs/002.jpg:
// a rectangle split by a horizontal midline into a top and a bottom sub-rectangle;
// each sub-rectangle has both of its diagonals drawn, so each half shows an X.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

const INK = '#1F2937'
const FILL = '#EFF6FF' // pale blue

// Outer rectangle corners (px).
const L = 24
const R = 236
const T = 22
const B = 178
const MY = (T + B) / 2 // midline y

export default function CountQuadsX24B3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebuah persegi panjang dibagi garis tengah mendatar menjadi dua; tiap bagian digambar kedua diagonalnya sehingga membentuk pola X."
    >
      <svg
        viewBox="0 0 260 200"
        width="100%"
        style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* fill */}
        <rect x={L} y={T} width={R - L} height={B - T} fill={FILL} />

        {/* top-half diagonals (X) */}
        <line x1={L} y1={T} x2={R} y2={MY} stroke={INK} strokeWidth={1.6} />
        <line x1={R} y1={T} x2={L} y2={MY} stroke={INK} strokeWidth={1.6} />

        {/* bottom-half diagonals (X) */}
        <line x1={L} y1={B} x2={R} y2={MY} stroke={INK} strokeWidth={1.6} />
        <line x1={R} y1={B} x2={L} y2={MY} stroke={INK} strokeWidth={1.6} />

        {/* midline */}
        <line x1={L} y1={MY} x2={R} y2={MY} stroke={INK} strokeWidth={1.8} />

        {/* outer border last so it sits on top */}
        <rect x={L} y={T} width={R - L} height={B - T} fill="none" stroke={INK} strokeWidth={2.2} />
      </svg>
    </div>
  )
}
