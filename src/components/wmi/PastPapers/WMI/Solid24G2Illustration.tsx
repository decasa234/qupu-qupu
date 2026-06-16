// Composite-solid figure for WMI-24F2A-Q9 (2024 Grade-2 Final).
// Reconstructed from db/seed/wmi/figures/2024-final-g2-a-q9.jpg: three labelled
// component pieces on the left, the assembled stack on the right.
//
// Scan reads (legible): pink cuboid 6 cm tall × 15 cm long, orange cube 8 cm edge,
// blue/purple cuboid 3 cm tall × 18 cm long. The cube and both cuboids share the
// same (into-page) width. The composite stacks the pink cuboid (6) under two
// 8-cm cubes; the blue slab sits at the base. Height = 6 + 8 + 8 = 22 (answer C).
//
// The figure shows the SETUP only: piece dimensions + the assembled stack. It does
// NOT show the running total or the answer — that is the animator's job post-answer.

const INK = '#1F2937'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- data ----- */
// Heights are what the question is really about (same width is given, so width and
// length only set the visual footprint, not the answer). `lengthCm`/`widthCm` drive
// the iso footprint; `heightCm` drives the vertical extent.
export type Piece24 = {
  id: 'pinkCuboid' | 'cube' | 'blueCuboid'
  labelEn: string
  labelId: string
  heightCm: number
  lengthCm: number
  widthCm: number
  top: string
  left: string
  right: string
}

export const SOLID24G2: Record<Piece24['id'], Piece24> = {
  pinkCuboid: {
    id: 'pinkCuboid',
    labelEn: 'cuboid: 6 cm tall, 15 cm long',
    labelId: 'balok: tinggi 6 cm, panjang 15 cm',
    heightCm: 6,
    lengthCm: 15,
    widthCm: 8,
    top: '#F7CFDB',
    left: '#EFB6C7',
    right: '#E59FB4',
  },
  cube: {
    id: 'cube',
    labelEn: 'cube: 8 cm edge',
    labelId: 'kubus: rusuk 8 cm',
    heightCm: 8,
    lengthCm: 8,
    widthCm: 8,
    top: '#FBE0B6',
    left: '#F2CB8C',
    right: '#E7B566',
  },
  blueCuboid: {
    id: 'blueCuboid',
    labelEn: 'cuboid: 3 cm tall, 18 cm long',
    labelId: 'balok: tinggi 3 cm, panjang 18 cm',
    heightCm: 3,
    lengthCm: 18,
    widthCm: 8,
    top: '#CBC9EC',
    left: '#B4B1E0',
    right: '#9D99D4',
  },
}

// The stack that makes up the composite, bottom → top (heights add to 22).
export const STACK24: Array<Piece24['id']> = ['pinkCuboid', 'cube', 'cube']
export const STACK_TOTAL_CM = STACK24.reduce((a, id) => a + SOLID24G2[id].heightCm, 0) // 22

/* ----------------------------------------------------------- primitive ----- */
// Isometric box. (x, y) is the screen position of the FRONT-BOTTOM-LEFT corner.
// w = length (runs to the right), d = depth/width (runs back), h = height (up).
export function IsoBox({
  x,
  y,
  w,
  d,
  h,
  top,
  left,
  right,
  label,
  labelSide = 'left',
}: {
  x: number
  y: number
  w: number
  d: number
  h: number
  top: string
  left: string
  right: string
  label?: string | null
  labelSide?: 'left' | 'bottom'
}) {
  const kx = 0.86 // horizontal run per unit of depth
  const ky = 0.5 // vertical run per unit of depth
  // Front-bottom-left corner.
  const flbX = x
  const flbY = y
  // Front-bottom-right.
  const frbX = x + w
  const frbY = y
  // Front-top corners.
  const fltX = flbX
  const fltY = flbY - h
  const frtX = frbX
  const frtY = frbY - h
  // Back offset (depth goes up-right).
  const bx = d * kx
  const by = -d * ky
  // Top face (front-left-top, front-right-top, back-right-top, back-left-top).
  const topPts = `${fltX},${fltY} ${frtX},${frtY} ${frtX + bx},${frtY + by} ${fltX + bx},${fltY + by}`
  // Right face (front-right-bottom, front-right-top, back-right-top, back-right-bottom).
  const rightPts = `${frbX},${frbY} ${frtX},${frtY} ${frtX + bx},${frtY + by} ${frbX + bx},${frbY + by}`
  return (
    <g>
      {/* draw left (front) face, right face, then top so the top reads on top */}
      <polygon points={`${flbX},${flbY} ${frbX},${frbY} ${frtX},${frtY} ${fltX},${fltY}`} fill={left} stroke={INK} strokeWidth={1.4} />
      <polygon points={rightPts} fill={right} stroke={INK} strokeWidth={1.4} />
      <polygon points={topPts} fill={top} stroke={INK} strokeWidth={1.4} />
      {label != null && labelSide === 'left' && (
        <text x={flbX - 6} y={flbY - h / 2} textAnchor="end" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
          {label}
        </text>
      )}
      {label != null && labelSide === 'bottom' && (
        <text x={flbX + w / 2} y={flbY + 16} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
          {label}
        </text>
      )}
    </g>
  )
}

/* ------------------------------------------------------------ component ----- */
// Visual scale: cm → px. Depth is drawn shorter so the iso boxes stay compact.
const PX = 6
const DEPTH_CM = 8

export function Solid24G2Figure() {
  const d = DEPTH_CM
  const p = SOLID24G2.pinkCuboid
  const c = SOLID24G2.cube
  const b = SOLID24G2.blueCuboid

  // --- left column: the three separate pieces with their dimension labels ---
  // pink cuboid
  const pinkX = 56
  const pinkY = 70
  // cube (to the right of the pink cuboid, sharing the top band)
  const cubeX = 170
  const cubeY = 78
  // blue slab (below, left)
  const blueX = 70
  const blueY = 150

  // --- right column: the assembled stack (pink base + two cubes) ---
  const stackX = 268
  const stackBaseY = 160 // front-bottom-left of the pink base
  // blue slab tucked at the base behind/under the front, slightly offset
  const slabX = 256
  const slabY = 168

  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* ---- separate component pieces (left) ---- */}
      {/* pink cuboid: 6 tall, 15 long */}
      <IsoBox
        x={pinkX}
        y={pinkY}
        w={p.lengthCm * PX}
        d={d * PX}
        h={p.heightCm * PX}
        top={p.top}
        left={p.left}
        right={p.right}
        label="6 cm"
      />
      <text x={pinkX + (p.lengthCm * PX) / 2} y={pinkY + 16} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
        15 cm
      </text>

      {/* orange cube: 8 edge */}
      <IsoBox
        x={cubeX}
        y={cubeY}
        w={c.lengthCm * PX}
        d={d * PX}
        h={c.heightCm * PX}
        top={c.top}
        left={c.left}
        right={c.right}
        label="8 cm"
      />

      {/* blue cuboid: 3 tall, 18 long */}
      <IsoBox
        x={blueX}
        y={blueY}
        w={b.lengthCm * PX}
        d={d * PX}
        h={b.heightCm * PX}
        top={b.top}
        left={b.left}
        right={b.right}
        label="3 cm"
      />
      <text x={blueX + (b.lengthCm * PX) / 2} y={blueY + 16} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
        18 cm
      </text>

      {/* ---- assembled composite (right): pink base + two stacked cubes ---- */}
      {/* blue slab at the very base, slightly behind and to the right */}
      <IsoBox
        x={slabX}
        y={slabY}
        w={b.lengthCm * (PX * 0.6)}
        d={d * PX}
        h={b.heightCm * PX}
        top={b.top}
        left={b.left}
        right={b.right}
      />
      {/* pink base cuboid */}
      <IsoBox
        x={stackX}
        y={stackBaseY}
        w={c.lengthCm * PX}
        d={d * PX}
        h={p.heightCm * PX}
        top={p.top}
        left={p.left}
        right={p.right}
      />
      {/* lower cube */}
      <IsoBox
        x={stackX}
        y={stackBaseY - p.heightCm * PX}
        w={c.lengthCm * PX}
        d={d * PX}
        h={c.heightCm * PX}
        top={c.top}
        left={c.left}
        right={c.right}
      />
      {/* upper cube */}
      <IsoBox
        x={stackX}
        y={stackBaseY - (p.heightCm + c.heightCm) * PX}
        w={c.lengthCm * PX}
        d={d * PX}
        h={c.heightCm * PX}
        top={c.top}
        left={c.left}
        right={c.right}
      />
    </svg>
  )
}

export function Solid24G2Illustration() {
  return (
    <Frame aria="Tiga bagian terpisah dengan ukurannya: balok merah muda tinggi 6 cm panjang 15 cm, kubus oranye rusuk 8 cm, dan balok biru tinggi 3 cm panjang 18 cm. Di sebelah kanan, bagian-bagian itu disusun menjadi satu benda gabungan: balok merah muda di bawah dengan dua kubus oranye ditumpuk di atasnya. Lebar semua bagian sama. Tentukan tinggi benda gabungan.">
      <Solid24G2Figure />
    </Frame>
  )
}

export default Solid24G2Illustration
