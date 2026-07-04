// WMI-25F1A-Q21 (2025 Grade 1 Final) — faithful to the scan (2025-final-g1-a-q21.jpg).
//
// "Fill 1-10 into the circles (no repeats) so that the two opposite GROUPS of
// circles marked with the same figure always add up to the same sum. With some
// numbers already filled in, find the sum of all the numbers that could go in
// the shaded circle."  Answer: 10 (fill-in).
//
// THE PUZZLE (as printed): ten circles sit around a centre with a spoke to each
// circle. The ten SECTORS between neighbouring spokes carry five shape marks
// (star, dot, hexagon, square, crescent), each shape appearing in TWO opposite
// sectors. The two circles flanking a sector must total the same as the two
// circles flanking the opposite same-shape sector.
//
// Scan layout (SVG angles, y down, index j at j*36°, j0 = right):
//   givens  j0 = 10 (right), j9 = 7 (upper-right), j5 = 9 (left), j3 = 1
//   (bottom-left); SHADED = j2 (bottom-right, next to the 1).
//   sector pairs: square j0j1 / j5j6 · dot j1j2 / j6j7 · star j2j3 / j7j8 ·
//   hexagon j3j4 / j8j9 · crescent j4j5 / j9j0.
//
// REASONING (brute-force verified — exactly 2 fillings exist):
//   crescent: 10 + 7 = 17 = 9 + j4      → j4 = 8
//   hexagon:  7 + j8 = 8 + 1 = 9        → j8 = 2
//   leftovers {3,4,5,6}: square forces j6 = j1 + 1, star forces shaded = j7 + 1,
//   dot then checks out for both splits → (j7, j6, shaded, j1) = (3,6,4,5) or
//   (5,4,6,3). Shaded can be 4 or 6, so the requested sum is 4 + 6 = 10.
//
// The static figure draws ONLY the setup — ring, spokes, sector marks, the four
// givens (10, 7, 9, 1) and the empty shaded circle. Deduced values (8, 2, the
// 4/6 candidates) are revealed by the animator via the co-exported primitive's
// props.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // ring outlines, spokes, numerals
const BLUE = '#30598A' // qupu-brand-blue — given numerals
const ORANGE = '#f0853a' // qupu-brand-orange — shaded circle accent + reveal
const SHADE_FILL = '#BEE3F8' // light-blue wash inside the shaded circle (as printed)
const PAIR_MARK = '#374151' // dark slate for the small sector-shape marks
const GREEN_INK = '#065F46' // deduced numerals (8, 2)
const WHITE = '#FFFFFF'

// Ten ring positions, index j at SVG angle j*36° (y grows downward), j0 = right.
const RING_N = 10
const STEP = 360 / RING_N

// Sector s sits between circles s and s+1 (midline at s*36°+18°). Each shape
// marks sectors s and s+5 (opposite sectors).
type PairShape = 'square' | 'dot' | 'star' | 'hex' | 'crescent'
const SECTOR_SHAPES: PairShape[] = ['square', 'dot', 'star', 'hex', 'crescent']

// Pre-filled givens, pinned to the scan's positions.
export const GIVENS: Record<number, number> = { 0: 10, 9: 7, 5: 9, 3: 1 }
export const SHADED_POS = 2 // bottom-right, next to the "1"
// Deduced by the sector rules (see header): j4 = 8, j8 = 2.
export const DEDUCED: Record<number, number> = { 4: 8, 8: 2 }
// The shaded circle's possible values and the requested sum.
export const SHADED_CANDIDATES = [4, 6] as const
export const SHADED_ANSWER = SHADED_CANDIDATES[0] + SHADED_CANDIDATES[1] // 10

// ---- layout ----------------------------------------------------------------
const PAD = 22 // headroom so the outer circles + marks never clip
const RING_R = 92 // radius of the ring of circle-centres
const NODE_R = 20 // radius of each numbered circle
const MARK_R = RING_R - NODE_R - 14 // radius where the sector-shape marks sit
const CENTER = PAD + RING_R + NODE_R // svg centre coordinate
const VIEW = (PAD + RING_R + NODE_R) * 2

/** Position index -> {x, y} of that circle's centre. */
function nodeCenter(j: number): { x: number; y: number } {
  const a = (j * STEP * Math.PI) / 180
  return { x: CENTER + RING_R * Math.cos(a), y: CENTER + RING_R * Math.sin(a) }
}

/** Midline point of sector s (between circles s and s+1) at radius MARK_R. */
function markCenter(s: number): { x: number; y: number } {
  const a = ((s * STEP + STEP / 2) * Math.PI) / 180
  return { x: CENTER + MARK_R * Math.cos(a), y: CENTER + MARK_R * Math.sin(a) }
}

/** Draw one small sector-shape mark (basic shapes only) centred at (x,y). */
function PairMark({ shape, x, y }: { shape: PairShape; x: number; y: number }) {
  const r = 6.5
  switch (shape) {
    case 'dot':
      return <circle cx={x} cy={y} r={r * 0.8} fill={PAIR_MARK} />
    case 'square':
      return <rect x={x - r * 0.85} y={y - r * 0.85} width={r * 1.7} height={r * 1.7} rx={1.5} fill={PAIR_MARK} transform={`rotate(20 ${x} ${y})`} />
    case 'hex': {
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = ((60 * k - 90) * Math.PI) / 180
        return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`
      }).join(' ')
      return <polygon points={pts} fill={PAIR_MARK} />
    }
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, k) => {
        const rr = k % 2 === 0 ? r : r * 0.45
        const a = ((36 * k - 90) * Math.PI) / 180
        return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`
      }).join(' ')
      return <polygon points={pts} fill={PAIR_MARK} />
    }
    case 'crescent':
      return (
        <path
          d={`M ${x + r * 0.35} ${y - r}
              A ${r} ${r} 0 1 0 ${x + r * 0.35} ${y + r}
              A ${r * 0.72} ${r * 0.72} 0 1 1 ${x + r * 0.35} ${y - r} Z`}
          fill={PAIR_MARK}
        />
      )
  }
}

export interface CircleSums25G1Props {
  /** Reveal the deduced 8 (next to the 9) — crescent-rule beat. */
  revealEight?: boolean
  /** Reveal the deduced 2 (top-right) — hexagon-rule beat. */
  revealTwo?: boolean
  /** Write "4/6" in the shaded circle — candidates beat (and the final one). */
  revealCandidates?: boolean
  /** Sector shapes to spotlight (e.g. ['crescent']) — draws them in orange. */
  highlightShapes?: PairShape[]
}

/**
 * Bare 10-circle ring primitive, faithful to the scan: ten spokes, five shape
 * marks in opposite sectors, four givens (10, 7, 9, 1) and the shaded circle.
 * With no props it reveals nothing beyond the printed figure.
 */
export function CircleSums25G1({
  revealEight = false,
  revealTwo = false,
  revealCandidates = false,
  highlightShapes = [],
}: CircleSums25G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(280, VIEW)} aria-hidden="true">
      {/* ten spokes, one per circle */}
      {Array.from({ length: RING_N }, (_, j) => {
        const c = nodeCenter(j)
        return <line key={`spoke-${j}`} x1={CENTER} y1={CENTER} x2={c.x} y2={c.y} stroke={INK} strokeWidth={1.8} strokeOpacity={0.45} />
      })}

      {/* sector-shape marks: same shape in two opposite sectors */}
      {SECTOR_SHAPES.map((shape, s) => {
        const m1 = markCenter(s)
        const m2 = markCenter(s + 5)
        const hot = highlightShapes.includes(shape)
        return (
          <g key={`mark-${s}`} style={hot ? { filter: 'none' } : undefined}>
            {hot && (
              <>
                <circle cx={m1.x} cy={m1.y} r={11} fill={ORANGE} fillOpacity={0.25} />
                <circle cx={m2.x} cy={m2.y} r={11} fill={ORANGE} fillOpacity={0.25} />
              </>
            )}
            <PairMark shape={shape} x={m1.x} y={m1.y} />
            <PairMark shape={shape} x={m2.x} y={m2.y} />
          </g>
        )
      })}

      {/* the ten circles */}
      {Array.from({ length: RING_N }, (_, j) => {
        const c = nodeCenter(j)
        const isShaded = j === SHADED_POS
        const given = GIVENS[j]
        const deduced = revealEight && j === 4 ? DEDUCED[4] : revealTwo && j === 8 ? DEDUCED[8] : null
        const fill = isShaded ? SHADE_FILL : WHITE
        const stroke = isShaded ? ORANGE : INK
        const strokeW = isShaded ? 3 : 2.4
        const label = given != null ? String(given) : deduced != null ? String(deduced) : isShaded && revealCandidates ? '4/6' : null
        const labelFill = given != null ? BLUE : isShaded ? ORANGE : GREEN_INK
        return (
          <g key={`node-${j}`}>
            <circle cx={c.x} cy={c.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={strokeW} />
            {label != null && (
              <text
                x={c.x}
                y={c.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={label.length > 2 ? 14 : 20}
                fontWeight={700}
                fill={labelFill}
                className="font-display"
              >
                {label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare ring inside the card (no box, nothing revealed). */
export default function CircleSums25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sepuluh lingkaran kecil disusun melingkar, masing-masing dihubungkan ke pusat oleh sebuah garis. Sepuluh daerah di antara garis-garis diberi lima tanda bentuk (bintang, titik, segi enam, persegi, bulan sabit); setiap bentuk muncul di dua daerah yang berseberangan. Empat lingkaran sudah terisi: 10 di kanan, 7 di kanan atas, 9 di kiri, dan 1 di kiri bawah. Lingkaran biru yang diarsir berada di kanan bawah, di sebelah angka 1, dan masih kosong."
    >
      <CircleSums25G1 />
    </div>
  )
}
