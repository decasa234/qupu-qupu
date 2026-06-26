/**
 * OSN 2024 SD Nasional Eksperimen — Q2
 * 24 numbered equilateral-triangle tiles; pick 6 to fill two composed triangles
 * where the center (inverted) piece is fixed at 20 and 24.
 */

// ── geometry helpers ────────────────────────────────────────────────────────

const S_SM = 38          // small tile side (px)
const H_SM = S_SM * Math.sqrt(3) / 2  // ≈ 32.91
const CT_SM = (2 * H_SM) / 3          // centroid from apex ≈ 21.94
const CS_SM = H_SM / 3                // centroid from base ≈ 10.97

/** Points string for an upward equilateral triangle centred at (cx, cy) with side s. */
function upTriPts(cx: number, cy: number, s: number): string {
  const h = s * Math.sqrt(3) / 2
  const ct = (2 * h) / 3
  const cs = h / 3
  return `${cx},${(cy - ct).toFixed(2)} ${(cx - s / 2).toFixed(2)},${(cy + cs).toFixed(2)} ${(cx + s / 2).toFixed(2)},${(cy + cs).toFixed(2)}`
}

/** Points string for a downward (inverted) equilateral triangle centred at (cx, cy) with side s. */
function downTriPts(cx: number, cy: number, s: number): string {
  const h = s * Math.sqrt(3) / 2
  const ct = (2 * h) / 3
  const cs = h / 3
  return `${cx},${(cy + ct).toFixed(2)} ${(cx - s / 2).toFixed(2)},${(cy - cs).toFixed(2)} ${(cx + s / 2).toFixed(2)},${(cy - cs).toFixed(2)}`
}

// ── small numbered tile ──────────────────────────────────────────────────────

interface TileProps { num: number; cx: number; cy: number }

function SmallTile({ num, cx, cy }: TileProps) {
  const red = num === 20 || num === 24
  return (
    <g>
      <polygon
        points={upTriPts(cx, cy, S_SM)}
        fill={red ? '#c0392b' : '#fafafa'}
        stroke={red ? '#922b21' : '#bbb'}
        strokeWidth={1.2}
      />
      <text
        x={cx}
        y={(cy + 2).toFixed(2)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="bold"
        fill={red ? 'white' : '#333'}
      >
        {num}
      </text>
    </g>
  )
}

// ── composed triangle (4 pieces) ────────────────────────────────────────────

interface CompTriProps {
  /** x of the bottom-left vertex */
  ox: number
  /** y of the bottom-left vertex */
  oy: number
  /** side length of the large composed triangle */
  S: number
  /** label for the centre (inverted) piece — shown in red */
  center: string
  /**
   * labels[0] = top corner piece
   * labels[1] = bottom-left corner piece
   * labels[2] = bottom-right corner piece
   */
  labels: [string | number, string | number, string | number]
  solved?: boolean
}

export function CompTriangle({ ox, oy, S, center, labels, solved = false }: CompTriProps) {
  const H = S * Math.sqrt(3) / 2
  const sub = S / 2  // sub-triangle side

  // Large-triangle vertices (upward, bottom-left origin)
  const BLx = ox,          BLy = oy
  const BRx = ox + S,      BRy = oy
  const APx = ox + S / 2,  APy = oy - H

  // Mid-edge points (subdivide large → 4 sub-triangles)
  const Mx = (BLx + BRx) / 2,  My = BLy            // bottom mid
  const Lx = (BLx + APx) / 2,  Ly = (BLy + APy) / 2 // left mid
  const Rx = (BRx + APx) / 2,  Ry = (BRy + APy) / 2 // right mid

  // Centroids of each sub-piece
  const cTop = [(APx + Lx + Rx) / 3, (APy + Ly + Ry) / 3] as [number, number]
  const cBL  = [(BLx + Mx + Lx) / 3, (BLy + My + Ly) / 3] as [number, number]
  const cBR  = [(Mx + BRx + Rx) / 3, (My + BRy + Ry) / 3] as [number, number]
  const cCtr = [(Mx + Rx + Lx) / 3,  (My + Ry + Ly) / 3]  as [number, number]

  // Points strings for the 4 pieces
  const topPts = `${APx},${APy} ${Lx},${Ly} ${Rx},${Ry}`
  const blPts  = `${BLx},${BLy} ${Mx},${My} ${Lx},${Ly}`
  const brPts  = `${Mx},${My} ${BRx},${BRy} ${Rx},${Ry}`
  const ctrPts = `${Mx},${My} ${Rx},${Ry} ${Lx},${Ly}`

  const cornerFill = solved ? '#e8f4fd' : '#f8f8f8'

  return (
    <g>
      {/* Corner pieces */}
      <polygon points={topPts} fill={cornerFill} stroke="#555" strokeWidth={1} />
      <polygon points={blPts}  fill={cornerFill} stroke="#555" strokeWidth={1} />
      <polygon points={brPts}  fill={cornerFill} stroke="#555" strokeWidth={1} />
      {/* Centre inverted piece — always red */}
      <polygon points={ctrPts} fill="#c0392b" stroke="#7b241c" strokeWidth={1} />
      {/* Outer boundary */}
      <polygon
        points={`${BLx},${BLy} ${BRx},${BRy} ${APx},${APy}`}
        fill="none"
        stroke="#333"
        strokeWidth={2}
      />
      {/* Centre label */}
      <text
        x={cCtr[0]}
        y={cCtr[1] + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.round(sub * 0.28)}
        fontWeight="bold"
        fill="white"
      >
        {center}
      </text>
      {/* Corner labels */}
      {([cTop, cBL, cBR] as [number, number][]).map((c, i) => (
        <text
          key={i}
          x={c[0]}
          y={c[1] + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.round(sub * 0.26)}
          fontStyle={typeof labels[i] === 'string' ? 'italic' : 'normal'}
          fontWeight={typeof labels[i] === 'number' ? 'bold' : 'normal'}
          fill={typeof labels[i] === 'number' ? '#1a5276' : '#333'}
        >
          {labels[i]}
        </text>
      ))}
    </g>
  )
}

// ── main illustration ────────────────────────────────────────────────────────

type Lang = 'en' | 'id'

interface IllustrationProps { lang?: Lang }

const COL_W = 48
const ROW_H = 46
const GRID_CX0 = 42    // centroid-x of tile in column 0
const GRID_CY0 = 38    // centroid-y of tile in row 0

const S_LARGE = 120
const H_LARGE = S_LARGE * Math.sqrt(3) / 2

// Bottom of last grid row (row 2 base = cy0 + 2*rowH + cs)
const GRID_BOTTOM = GRID_CY0 + 2 * ROW_H + CS_SM + 6
const TRI_OY = GRID_BOTTOM + 44   // bottom-vertex y of composition triangles
const SVG_W = 420
const SVG_H = Math.ceil(TRI_OY + 20)

// Horizontal centering for the two side-by-side comp triangles
const GAP = 20
const LEFT_OX  = Math.round((SVG_W - 2 * S_LARGE - GAP) / 2)
const RIGHT_OX = LEFT_OX + S_LARGE + GAP

export default function TrianglesOSN24NEKQ2Illustration({ lang = 'id' }: IllustrationProps) {
  const ariaLabel = lang === 'id'
    ? '24 keping segitiga bernomor (20 dan 24 berwarna merah sebagai keping tengah). Di bawah: dua segitiga besar tersusun dari 4 keping, tengah masing-masing bernomor 20 dan 24.'
    : '24 numbered triangle tiles (20 and 24 are red — fixed centre pieces). Below: two large triangles composed of 4 tiles each, centres numbered 20 and 24.'

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', maxWidth: SVG_W, display: 'block' }}
    >
      {/* ── grid header ── */}
      <text x={SVG_W / 2} y={14} textAnchor="middle" fontSize={11} fill="#666">
        {lang === 'id' ? 'Keping tersedia (1–24)' : 'Available tiles (1–24)'}
      </text>

      {/* ── tile grid: 8 cols × 3 rows ── */}
      {Array.from({ length: 24 }, (_, i) => {
        const col = i % 8
        const row = Math.floor(i / 8)
        const cx = GRID_CX0 + col * COL_W
        const cy = GRID_CY0 + row * ROW_H
        return <SmallTile key={i + 1} num={i + 1} cx={cx} cy={cy} />
      })}

      {/* ── divider ── */}
      <line x1={16} y1={GRID_BOTTOM + 10} x2={SVG_W - 16} y2={GRID_BOTTOM + 10} stroke="#ddd" strokeWidth={1} />

      {/* ── comp-triangle header ── */}
      <text x={SVG_W / 2} y={GRID_BOTTOM + 24} textAnchor="middle" fontSize={11} fill="#666">
        {lang === 'id'
          ? 'a + b + c = 20         d + e + f = 24'
          : 'a + b + c = 20         d + e + f = 24'}
      </text>

      {/* ── composition triangles ── */}
      <CompTriangle ox={LEFT_OX}  oy={TRI_OY} S={S_LARGE} center="20" labels={['a', 'b', 'c']} />
      <CompTriangle ox={RIGHT_OX} oy={TRI_OY} S={S_LARGE} center="24" labels={['d', 'e', 'f']} />
    </svg>
  )
}
