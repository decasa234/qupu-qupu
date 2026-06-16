// Scene illustration for WMI-24F3A-Q10 (2024 Grade-3 Final).
// Reconstructed from db/seed/wmi/figures/2024-final-g3-a-q10.jpg:
//   A boy (Jay) stands behind a four-legged table. Four objects sit on the table:
//     - a tall rectangular box  (left-back area)
//     - a ball / sphere         (centre-left)
//     - a small cube            (centre-right)
//     - a triangular prism      (right, leaning — shows as a triangle from above)
//   Jay looks DOWN at the table from behind. The question asks which top-view
//   option (A–E) matches what Jay sees.
//
// This figure shows the PROBLEM SETUP only: Jay + the perspective table + objects.
// It never reveals which option is correct (answer D) — that is post-answer.
//
// Pure render — no random, no Date, SSR-safe and deterministic.

const INK = '#1F2937'
const TABLE_TOP = '#D1D5DB' // light grey tabletop
const TABLE_LEG = '#9CA3AF' // darker grey legs
const TABLE_EDGE = '#6B7280'
const TABLE_SHADOW = '#B0B7C1'

// ── Isometric helpers ────────────────────────────────────────────────────────
// Standard 2:1 isometric: project (ix, iy) grid → screen (sx, sy).
// Origin at front-left corner of tabletop.
const KX = 0.86 // cos30 ≈ horizontal scale per iso-unit
const KY = 0.5  // sin30 ≈ vertical scale per iso-unit

// ── Table drawing ─────────────────────────────────────────────────────────────
// The table is a flat rectangle shown in "cabinet" perspective (front face + top).
// Coordinate origin: front-left corner of the table surface = (tableX, tableY).

const TABLE = {
  x: 28,    // SVG x of the front-left corner of the table surface
  y: 118,   // SVG y of the front-left corner of the table surface
  w: 180,   // table surface width (horizontal)
  d: 60,    // table surface depth in iso y-pixels (goes up-right)
  legH: 50, // leg height in SVG px
  legW: 10, // leg width
}

// Compute the four corner positions of the tabletop using simple 2:1 iso.
// (front-left, front-right, back-right, back-left)
function tableCorners() {
  const { x, y, w, d } = TABLE
  // Front-left
  const fl = { sx: x, sy: y }
  // Front-right (move right by w)
  const fr = { sx: x + w, sy: y }
  // Back-right (move up-right by d in pseudo-iso)
  const br = { sx: x + w + d * KX, sy: y - d * KY }
  // Back-left
  const bl = { sx: x + d * KX, sy: y - d * KY }
  return { fl, fr, br, bl }
}

function TableSurface() {
  const { fl, fr, br, bl } = tableCorners()
  const pts = `${fl.sx},${fl.sy} ${fr.sx},${fr.sy} ${br.sx},${br.sy} ${bl.sx},${bl.sy}`
  return <polygon points={pts} fill={TABLE_TOP} stroke={TABLE_EDGE} strokeWidth={1.8} />
}

// Front apron (thin strip below front edge)
function TableFront() {
  const { fl, fr } = tableCorners()
  const apronH = 7
  const pts = `${fl.sx},${fl.sy} ${fr.sx},${fr.sy} ${fr.sx},${fr.sy + apronH} ${fl.sx},${fl.sy + apronH}`
  return <polygon points={pts} fill={TABLE_SHADOW} stroke={TABLE_EDGE} strokeWidth={1.2} />
}

// Right apron
function TableRight() {
  const { fr, br } = tableCorners()
  const apronH = 7
  const pts = `${fr.sx},${fr.sy} ${br.sx},${br.sy} ${br.sx},${br.sy + apronH} ${fr.sx},${fr.sy + apronH}`
  return <polygon points={pts} fill={TABLE_LEG} stroke={TABLE_EDGE} strokeWidth={1.2} />
}

function TableLegs() {
  const { fl, fr, br, bl } = tableCorners()
  const legH = TABLE.legH
  const legW = TABLE.legW
  const corners = [fl, fr, br, bl]
  return (
    <>
      {corners.map((c, i) => (
        <rect
          key={i}
          x={c.sx - legW / 2}
          y={c.sy}
          width={legW}
          height={legH}
          fill={TABLE_LEG}
          stroke={TABLE_EDGE}
          strokeWidth={1.2}
        />
      ))}
    </>
  )
}

// ── Objects on the table ──────────────────────────────────────────────────────
// All drawn in rough front perspective to match the scan.
// Positions are approximate fractions along the table surface.

function tablePoint(fracX: number, fracY: number) {
  // fracX 0..1 = left to right along front edge
  // fracY 0..1 = front to back
  const { fl, fr, bl } = tableCorners()
  const frontPt = {
    sx: fl.sx + fracX * (fr.sx - fl.sx),
    sy: fl.sy + fracX * (fr.sy - fl.sy),
  }
  const backPt = {
    sx: bl.sx + fracX * (fr.sx - fl.sx),
    sy: bl.sy + fracX * (fr.sy - fl.sy),
  }
  return {
    sx: frontPt.sx + fracY * (backPt.sx - frontPt.sx),
    sy: frontPt.sy + fracY * (backPt.sy - frontPt.sy),
  }
}

// Tall rectangular box (front-left area of the table)
function TallBox({ baseX, baseY }: { baseX: number; baseY: number }) {
  const w = 22
  const h = 44
  const d = 12
  // front face
  const fx0 = baseX - w / 2
  const fy0 = baseY - h
  // top face in simple 2:1 iso offset
  const dx = d * KX
  const dy = -d * KY
  const topPts = `${fx0},${fy0} ${fx0 + w},${fy0} ${fx0 + w + dx},${fy0 + dy} ${fx0 + dx},${fy0 + dy}`
  const rightPts = `${fx0 + w},${fy0} ${fx0 + w},${baseY} ${fx0 + w + dx},${baseY + dy} ${fx0 + w + dx},${fy0 + dy}`
  return (
    <g>
      {/* front face */}
      <rect x={fx0} y={fy0} width={w} height={h} fill="white" stroke={INK} strokeWidth={1.5} />
      {/* right face */}
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2} />
      {/* top face */}
      <polygon points={topPts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2} />
    </g>
  )
}

// Ball / sphere
function Ball({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth={1.5} />
      {/* simple highlight arc to suggest sphere */}
      <ellipse cx={cx - r * 0.25} cy={cy - r * 0.3} rx={r * 0.3} ry={r * 0.2} fill="none" stroke="#9CA3AF" strokeWidth={1} />
    </>
  )
}

// Small cube
function SmallCube({ baseX, baseY }: { baseX: number; baseY: number }) {
  const s = 18   // side length
  const d = 10   // depth
  const dx = d * KX
  const dy = -d * KY
  const fy0 = baseY - s
  const fx0 = baseX - s / 2
  const topPts = `${fx0},${fy0} ${fx0 + s},${fy0} ${fx0 + s + dx},${fy0 + dy} ${fx0 + dx},${fy0 + dy}`
  const rightPts = `${fx0 + s},${fy0} ${fx0 + s},${baseY} ${fx0 + s + dx},${baseY + dy} ${fx0 + s + dx},${fy0 + dy}`
  return (
    <g>
      <rect x={fx0} y={fy0} width={s} height={s} fill="white" stroke={INK} strokeWidth={1.5} />
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2} />
      <polygon points={topPts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2} />
    </g>
  )
}

// Triangular prism (leaning wedge, appears as triangle from above)
// The prism lies on its rectangular face with one triangular end facing forward.
function TriangularPrism({ baseX, baseY }: { baseX: number; baseY: number }) {
  // Draw a triangular prism leaning/tilted: triangular cross-section visible on the right.
  // Front triangle (pointing up-right, leaning)
  const tw = 28   // triangle base width
  const th = 36   // triangle height
  const depth = 12

  // Front triangular face: base at (baseX, baseY) going left, apex up-right
  const p0x = baseX
  const p0y = baseY
  const p1x = baseX - tw * 0.6
  const p1y = baseY
  const p2x = baseX + tw * 0.25
  const p2y = baseY - th

  // Back face: offset by depth in iso direction
  const dx = depth * KX
  const dy = -depth * KY

  // Visible faces: the sloped top, right rectangle, and front triangle
  const slopePts = `${p2x},${p2y} ${p2x + dx},${p2y + dy} ${p1x + dx},${p1y + dy} ${p1x},${p1y}`
  const rightPts = `${p0x},${p0y} ${p2x},${p2y} ${p2x + dx},${p2y + dy} ${p0x + dx},${p0y + dy}`

  return (
    <g>
      {/* sloped top face */}
      <polygon points={slopePts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2} />
      {/* right rectangular face */}
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2} />
      {/* front triangular face */}
      <polygon points={`${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y}`} fill="white" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

// ── Jay (the boy) ─────────────────────────────────────────────────────────────
// Simplified drawn figure standing behind-right of the table.
function BoyFigure({ x, y }: { x: number; y: number }) {
  // head
  const headR = 14
  const headCX = x
  const headCY = y - 90
  // hair (dark brown arc on top)
  const bodyTop = headCY + headR
  const bodyBot = headCY + headR + 38
  const bodyL = x - 12
  const bodyR = x + 12

  return (
    <g>
      {/* hair */}
      <ellipse cx={headCX} cy={headCY - 4} rx={headR} ry={headR * 0.7} fill="#5D3A1A" />
      {/* head */}
      <circle cx={headCX} cy={headCY} r={headR} fill="#F5CBA7" stroke="#C8996C" strokeWidth={1.2} />
      {/* eyes */}
      <circle cx={headCX - 4} cy={headCY - 1} r={1.8} fill={INK} />
      <circle cx={headCX + 4} cy={headCY - 1} r={1.8} fill={INK} />
      {/* smile */}
      <path d={`M ${headCX - 4} ${headCY + 5} Q ${headCX} ${headCY + 9} ${headCX + 4} ${headCY + 5}`} fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      {/* body (shirt — light blue) */}
      <rect x={bodyL} y={bodyTop} width={bodyR - bodyL} height={bodyBot - bodyTop} rx={5} fill="#B3D7F5" stroke="#7FB8E8" strokeWidth={1.2} />
      {/* overalls bib — dark blue rectangle */}
      <rect x={bodyL + 3} y={bodyTop + 4} width={bodyR - bodyL - 6} height={(bodyBot - bodyTop) * 0.55} rx={3} fill="#3B6FA0" stroke="#2C5580" strokeWidth={1} />
      {/* overalls straps */}
      <line x1={bodyL + 6} y1={bodyTop + 4} x2={headCX - 4} y2={bodyTop} stroke="#3B6FA0" strokeWidth={2.5} />
      <line x1={bodyR - 6} y1={bodyTop + 4} x2={headCX + 4} y2={bodyTop} stroke="#3B6FA0" strokeWidth={2.5} />
      {/* legs */}
      <rect x={bodyL + 2} y={bodyBot} width={10} height={22} rx={4} fill="#3B6FA0" stroke="#2C5580" strokeWidth={1} />
      <rect x={bodyR - 12} y={bodyBot} width={10} height={22} rx={4} fill="#3B6FA0" stroke="#2C5580" strokeWidth={1} />
      {/* shoes */}
      <ellipse cx={bodyL + 7} cy={bodyBot + 24} rx={8} ry={4} fill="#5D3A1A" />
      <ellipse cx={bodyR - 7} cy={bodyBot + 24} rx={8} ry={4} fill="#5D3A1A" />
      {/* arms spread out */}
      <line x1={bodyL} y1={bodyTop + 10} x2={bodyL - 18} y2={bodyTop + 26} stroke="#F5CBA7" strokeWidth={6} strokeLinecap="round" />
      <line x1={bodyR} y1={bodyTop + 10} x2={bodyR + 18} y2={bodyTop + 26} stroke="#F5CBA7" strokeWidth={6} strokeLinecap="round" />
    </g>
  )
}

// ── Arrow from boy eyes to table ──────────────────────────────────────────────
function ViewArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#F59E0B"
      strokeWidth={2}
      strokeDasharray="4 3"
      strokeLinecap="round"
      markerEnd="url(#arrow-head)"
    />
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ViewTable24G3Illustration() {
  // Layout constants
  const SVG_W = 340
  const SVG_H = 220

  // Compute table corner positions for placing objects
  const { fl, br } = tableCorners()
  // Midpoint of table surface (for reference)
  const tableMidX = (fl.sx + br.sx) / 2
  const tableMidY = (fl.sy + br.sy) / 2

  // Object base positions (on the table surface, using bilinear interp)
  // Tall box: left-back area
  const tallBoxPt = tablePoint(0.18, 0.55)
  // Ball: centre-left
  const ballPt = tablePoint(0.35, 0.45)
  // Small cube: centre-right
  const cubePt = tablePoint(0.54, 0.4)
  // Triangular prism: right area
  const prismPt = tablePoint(0.75, 0.38)

  // Boy: stands upper-right of the table
  const boyX = 288
  const boyY = 180

  // Dashed arrow from boy's gaze to centre of table
  const arrowStartX = boyX - 14
  const arrowStartY = boyY - 108
  const arrowEndX = tableMidX + 10
  const arrowEndY = tableMidY

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jay berdiri di belakang meja dan melihat ke bawah. Di atas meja terdapat empat benda: kotak tinggi di kiri-belakang, bola di tengah-kiri, kubus kecil di tengah-kanan, dan prisma segitiga di kanan. Pertanyaan: tampak atas yang terlihat Jay adalah pilihan yang mana?"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <marker id="arrow-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
          </marker>
        </defs>

        {/* Table legs drawn first (behind tabletop) */}
        <TableLegs />

        {/* Front and right aprons */}
        <TableFront />
        <TableRight />

        {/* Tabletop surface */}
        <TableSurface />

        {/* Objects on the table — drawn back to front so nearer items overlap */}
        {/* Tall box (back-left, so draw first) */}
        <TallBox baseX={tallBoxPt.sx} baseY={tallBoxPt.sy} />

        {/* Ball */}
        <Ball cx={ballPt.sx} cy={ballPt.sy - 14} r={14} />

        {/* Small cube */}
        <SmallCube baseX={cubePt.sx} baseY={cubePt.sy} />

        {/* Triangular prism (front-right area) */}
        <TriangularPrism baseX={prismPt.sx} baseY={prismPt.sy} />

        {/* Dashed arrow showing Jay's viewing direction */}
        <ViewArrow
          x1={arrowStartX}
          y1={arrowStartY}
          x2={arrowEndX}
          y2={arrowEndY}
        />

        {/* Jay (the boy) */}
        <BoyFigure x={boyX} y={boyY} />

        {/* "Jay" label */}
        <text
          x={boyX}
          y={boyY - 110}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={INK}
          className="font-display"
        >
          Jay
        </text>
      </svg>
    </div>
  )
}
