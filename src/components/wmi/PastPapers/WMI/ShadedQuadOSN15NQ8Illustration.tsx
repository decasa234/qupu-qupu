// OSN-15-SD-NAS-Q8 — "ABCD is a square. P midpoint AB, Q midpoint CD, R on BC
// with BR = (1/3)BC. Ratio of shaded to unshaded area = ?"
//
// Reconstructed from docs/reference/ocr-res/osn/nasional/sd/2015.imgs/003.jpg:
// square A(bottom-left) B(bottom-right) C(top-right) D(top-left); shaded
// quadrilateral D-Q-R-P. Pure SVG, SSR-safe, no hooks.
//
// NOTE (answer-key queue): with P,Q at the midpoints the shaded quad D-Q-R-P is
// exactly half the square (its area is independent of where R sits on BC), so the
// figure yields 1:1, not the seed's 5:7. Illustration-only on purpose — the figure
// is faithful and verifiable; the disputed ratio is left to the answer-key review.

const INK = '#3B4CCA' // blue outline (matches source)
const SHADE = '#F6DCC9' // pale peach fill (matches source)
const LBL = '#1F2937'

// square corners (viewBox 0 0 260 260), side = 200px
const A: [number, number] = [30, 220]
const B: [number, number] = [230, 220]
const C: [number, number] = [230, 20]
const D: [number, number] = [30, 20]
const P: [number, number] = [130, 220] // midpoint AB
const Q: [number, number] = [130, 20] // midpoint DC
const R: [number, number] = [230, 220 - 200 / 3] // BR = 1/3 BC (≈153.3)

const pt = ([x, y]: [number, number]) => `${x},${y}`

export default function ShadedQuadOSN15NQ8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Persegi ABCD dengan P titik tengah AB, Q titik tengah CD, dan R pada BC dengan BR sepertiga BC; daerah segiempat D-Q-R-P diarsir."
    >
      <svg
        viewBox="0 0 260 260"
        width="100%"
        style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* shaded quad D-Q-R-P */}
        <polygon points={[D, Q, R, P].map(pt).join(' ')} fill={SHADE} stroke="none" />

        {/* square border */}
        <polygon points={[A, B, C, D].map(pt).join(' ')} fill="none" stroke={INK} strokeWidth={2} />

        {/* the three internal segments that bound the shaded quad */}
        <line x1={Q[0]} y1={Q[1]} x2={R[0]} y2={R[1]} stroke={INK} strokeWidth={2} />
        <line x1={R[0]} y1={R[1]} x2={P[0]} y2={P[1]} stroke={INK} strokeWidth={2} />
        <line x1={P[0]} y1={P[1]} x2={D[0]} y2={D[1]} stroke={INK} strokeWidth={2} />

        {/* vertex dots */}
        {[P, Q, R].map((v, i) => (
          <circle key={i} cx={v[0]} cy={v[1]} r={2.6} fill={INK} />
        ))}

        {/* labels */}
        <text x={A[0] - 8} y={A[1] + 14} fontSize={14} fill={LBL} textAnchor="middle">A</text>
        <text x={B[0] + 8} y={B[1] + 14} fontSize={14} fill={LBL} textAnchor="middle">B</text>
        <text x={C[0] + 8} y={C[1] - 4} fontSize={14} fill={LBL} textAnchor="middle">C</text>
        <text x={D[0] - 8} y={D[1] - 4} fontSize={14} fill={LBL} textAnchor="middle">D</text>
        <text x={P[0]} y={P[1] + 16} fontSize={14} fill={LBL} textAnchor="middle">P</text>
        <text x={Q[0]} y={Q[1] - 5} fontSize={14} fill={LBL} textAnchor="middle">Q</text>
        <text x={R[0] + 10} y={R[1] + 4} fontSize={14} fill={LBL} textAnchor="middle">R</text>
      </svg>
    </div>
  )
}
