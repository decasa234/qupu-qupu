// Folded-paper cut-out figure for WMI-25P2A-Q15 (2025 Grade-2 Semifinal).
//
// "A square piece of colored paper is folded and a shape is cut out of it, as
//  shown. From which option does the cut-out figure come?"  Answer: A.
//
// Reading db/seed/wmi/figures/2025-semifinal-g2-a-q15.jpg: the figure shown is
// the UNFOLDED result — a central square with 8 triangles radiating out:
//   • 4 large triangles at the diagonal CORNERS (point outward to each corner)
//   • 4 smaller triangles on the EDGE midpoints (top, bottom, left, right)
// The whole figure is 4-fold symmetric (mirror across the vertical fold AND the
// horizontal fold), which is exactly what folding a square into quarters and
// cutting must produce.
//
// The answer options A–E in the paper are images of the folded quarter with its
// cut; their seed texts are placeholders. So this component draws the STEM (the
// symmetric unfolded result) and the explainer derives that only option A — the
// quarter whose cuts unfold into this symmetric figure — can be the source.
//
// The static figure draws ONLY the unfolded cut-out (the problem). It NEVER
// states which option is correct. The co-exported UnfoldCutout primitive lets
// the explainer overlay the two fold lines and the folded quarter.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#2E3A30' // dark green-grey outline (matches the source figure)
const PAPER = '#CFE6D2' // pale green paper fill
const FOLD = '#2C7BE5' // fold-line accent (explainer only)
const QUARTER = '#F6C85F' // highlighted quarter wash (explainer only)

export const VIEW = 260 // square viewBox
const C = VIEW / 2 // centre
const SQ = 56 // half-side of the central square
const EDGE_H = 30 // edge-triangle height (sticks out from the square)
const EDGE_HALF = 22 // edge-triangle half-base
const COR_OUT = 78 // how far the corner-triangle apex reaches from centre (per axis)
const COR_BASE = 30 // corner-triangle base half-width

/**
 * The unfolded cut-out: central square + 4 edge triangles + 4 corner triangles.
 * All eight pieces are placed by symmetry so the figure mirrors across both folds.
 */
export function UnfoldCutout({
  showFolds = false,
  showQuarter = false,
}: {
  /** Draw the vertical + horizontal fold lines through the centre. */
  showFolds?: boolean
  /** Tint the top-right quarter (the piece that unfolds into the whole). */
  showQuarter?: boolean
}) {
  // central square
  const square = (
    <rect
      x={C - SQ}
      y={C - SQ}
      width={SQ * 2}
      height={SQ * 2}
      fill={PAPER}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  )

  // edge triangles, apex pointing straight out along each axis
  const top = `${C},${C - SQ - EDGE_H} ${C - EDGE_HALF},${C - SQ} ${C + EDGE_HALF},${C - SQ}`
  const bottom = `${C},${C + SQ + EDGE_H} ${C - EDGE_HALF},${C + SQ} ${C + EDGE_HALF},${C + SQ}`
  const left = `${C - SQ - EDGE_H},${C} ${C - SQ},${C - EDGE_HALF} ${C - SQ},${C + EDGE_HALF}`
  const right = `${C + SQ + EDGE_H},${C} ${C + SQ},${C - EDGE_HALF} ${C + SQ},${C + EDGE_HALF}`

  // corner triangles, apex pointing diagonally toward each corner.
  // Built from the square's corner, sticking out along the diagonal.
  const corner = (sx: number, sy: number) => {
    const apexX = C + sx * COR_OUT
    const apexY = C + sy * COR_OUT
    // base sits just outside the square's corner, perpendicular-ish to the diagonal
    const bx = C + sx * SQ
    const by = C + sy * SQ
    return `${apexX},${apexY} ${bx + sx * 4},${by - sy * (SQ - COR_BASE)} ${bx - sx * (SQ - COR_BASE)},${by + sy * 4}`
  }

  const tri = (points: string, key: string) => (
    <polygon key={key} points={points} fill={PAPER} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
  )

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* optional quarter wash (top-right) drawn first, behind everything */}
      {showQuarter && <rect x={C} y={0} width={C} height={C} fill={QUARTER} opacity={0.35} />}

      {/* corner triangles */}
      {tri(corner(1, -1), 'cTR')}
      {tri(corner(-1, -1), 'cTL')}
      {tri(corner(-1, 1), 'cBL')}
      {tri(corner(1, 1), 'cBR')}

      {/* edge triangles */}
      {tri(top, 'eT')}
      {tri(bottom, 'eB')}
      {tri(left, 'eL')}
      {tri(right, 'eR')}

      {/* central square (on top so its outline is crisp) */}
      {square}

      {/* fold lines through the centre (explainer only) */}
      {showFolds && (
        <g>
          <line x1={C} y1={6} x2={C} y2={VIEW - 6} stroke={FOLD} strokeWidth={2} strokeDasharray="7 5" />
          <line x1={6} y1={C} x2={VIEW - 6} y2={C} stroke={FOLD} strokeWidth={2} strokeDasharray="7 5" />
        </g>
      )}
    </svg>
  )
}

const ARIA =
  'Hasil bukaan dari kertas persegi yang dilipat lalu dipotong: ' +
  'sebuah persegi di tengah dengan empat segitiga di tengah tiap sisi ' +
  'dan empat segitiga besar di tiap sudut, simetris ke segala arah. ' +
  'Dari pilihan manakah bangun potongan ini berasal?'

export default function P25G2Q15Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <UnfoldCutout />
    </div>
  )
}
