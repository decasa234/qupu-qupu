/**
 * SEAMOX-24-B-Q11 — Illustration
 * "ABCD is a square; E, F are midpoints of sides AD and AB respectively.
 *  Find the area of the square if the shaded region is 48 cm²."
 *
 * Source: docs/reference/ocr-res/seamo-x/contest/paper-b/2024.imgs/005.jpg
 * Answer: 240 cm²  (shaded triangle BGC = 1/5 of square area)
 *
 * Square: A = top-left, B = top-right, C = bottom-right, D = bottom-left.
 * E = midpoint of AD (left side), F = midpoint of AB (top side).
 * Lines EB and FC intersect at G = (3s/5, s/5) from top-left corner.
 * Shaded polygon: triangle BGC (right side of square).
 *
 * Co-exports SquareMidX24B11SVG for the explainer (showLines / showShade props).
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

const S = 200 // square side in SVG units

// Key points in SVG coordinates (y increases downward, A at top-left)
export const SQUARE_PTS = {
  A: [0, 0] as [number, number],
  B: [S, 0] as [number, number],
  C: [S, S] as [number, number],
  D: [0, S] as [number, number],
  E: [0, S / 2] as [number, number],             // midpoint of AD
  F: [S / 2, 0] as [number, number],             // midpoint of AB
  G: [(3 * S) / 5, S / 5] as [number, number],   // intersection of EB and FC
}

interface SvgProps {
  showLines?: boolean  // draw lines EB and FC  (default true)
  showShade?: boolean  // fill shaded triangle BGC (default true)
}

export function SquareMidX24B11SVG({ showLines = true, showShade = true }: SvgProps = {}) {
  const PAD = 22
  const vb = `-${PAD} -${PAD} ${S + 2 * PAD} ${S + 2 * PAD}`

  const { A, B, C, D, E, F, G } = SQUARE_PTS

  return (
    <svg
      viewBox={vb}
      width={244}
      height={244}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Shaded triangle BGC */}
      {showShade && (
        <polygon
          points={`${B[0]},${B[1]} ${G[0]},${G[1]} ${C[0]},${C[1]}`}
          fill="#93C5FD"
          fillOpacity={0.65}
          stroke="none"
        />
      )}

      {/* Square outline */}
      <rect x={0} y={0} width={S} height={S} fill="none" stroke="#1e3a5f" strokeWidth={2} />

      {/* Midpoint tick marks (show E and F are midpoints) */}
      <line x1={E[0] - 5} y1={E[1]} x2={E[0] + 5} y2={E[1]} stroke="#1e3a5f" strokeWidth={1.5} />
      <line x1={F[0]} y1={F[1] - 5} x2={F[0]} y2={F[1] + 5} stroke="#1e3a5f" strokeWidth={1.5} />

      {/* Lines E→B and F→C */}
      {showLines && (
        <>
          <line
            x1={E[0]} y1={E[1]} x2={B[0]} y2={B[1]}
            stroke="#1e3a5f" strokeWidth={1.5}
          />
          <line
            x1={F[0]} y1={F[1]} x2={C[0]} y2={C[1]}
            stroke="#1e3a5f" strokeWidth={1.5}
          />
        </>
      )}

      {/* Corner labels */}
      <text x={A[0] - 10} y={A[1] - 8} fontSize={14} fontWeight="bold" fill="#1e3a5f" textAnchor="middle">A</text>
      <text x={B[0] + 10} y={B[1] - 8} fontSize={14} fontWeight="bold" fill="#1e3a5f" textAnchor="middle">B</text>
      <text x={C[0] + 10} y={C[1] + 14} fontSize={14} fontWeight="bold" fill="#1e3a5f" textAnchor="middle">C</text>
      <text x={D[0] - 10} y={D[1] + 14} fontSize={14} fontWeight="bold" fill="#1e3a5f" textAnchor="middle">D</text>

      {/* Midpoint labels */}
      <text x={E[0] - 14} y={E[1] + 5} fontSize={13} fill="#1e3a5f" textAnchor="end">E</text>
      <text x={F[0]} y={F[1] - 10} fontSize={13} fill="#1e3a5f" textAnchor="middle">F</text>

      {/* Intersection label */}
      {showLines && (
        <text x={G[0] + 7} y={G[1] + 4} fontSize={12} fill="#1e3a5f" textAnchor="start">G</text>
      )}
    </svg>
  )
}

export default function SquareMidX24B11Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Persegi ABCD dengan E titik tengah AD, F titik tengah AB; segitiga BGC diarsir"
    >
      <SquareMidX24B11SVG />
    </div>
  )
}
