// IKMC-23-EC-Q22 — Stem illustration for the two-machine rotation problem.
//
// READING THE SCAN:
//   2023.imgs/061.jpg — shows two machine diagrams side by side:
//     Left:  paper(dot bottom-left) → [R blue box] → paper(dot bottom-right)
//     Right: paper(empty)           → [S pink box]  → paper(club stamp ♣)
//
//   2023.imgs/062.jpg — shows the PROBLEM:
//     paper(dot bottom-left) → [?] → [?] → [?] → paper(club stamp, correct position)
//
// FIGURE TYPE: stem illustration only (choices are text: SRR, RSR, RSS, RRS, SRS).
// ANSWER: B (RSR) — see breakdown in seed.
//
// This illustration shows the MACHINE DEFINITIONS only (what R and S each do),
// NOT the answer sequence. The correct sequence (RSR) is revealed in the explainer.
//
// Co-exports:
//   RotatePaper            — shared square-paper primitive (dot or club at corner)
//   MachineLegend          — shared R/S machine-box with arrow diagram
//   ROTATE22EC_GEOM        — layout constants
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

// ── colour palette ────────────────────────────────────────────────────────────
const PAPER_FILL    = '#FFFFFF'
const PAPER_STROKE  = '#374151'
const DOT_FILL      = '#1F2937'
const CLUB_FILL     = '#1F2937'
const MACHINE_R_BG  = '#BAE6FD'   // sky-200, matching the scan's blue box
const MACHINE_S_BG  = '#FECACA'   // red-200, matching the scan's pink/red box
const MACHINE_INK   = '#1E40AF'   // label colour for R
const MACHINE_S_INK = '#991B1B'   // label colour for S
const ARROW_COL     = '#6B7280'
const ARROW_HEAD    = '#6B7280'

// ── geometry ──────────────────────────────────────────────────────────────────
/** Square paper side length in px. */
export const PAPER_SZ = 36
/** Machine box side length. */
export const MACHINE_SZ = 44
/** Gap between elements in a row. */
export const GAP = 16

export const ROTATE22EC_GEOM = { PAPER_SZ, MACHINE_SZ, GAP } as const

// ── dot positions on a paper square ──────────────────────────────────────────
// The "dot" tracks the corner of the paper through rotations.
// Rotation 0° (start): dot bottom-left
// After 1× 90° CW:    dot bottom-right
// After 2× 90° CW:    dot top-right
// After 3× 90° CW:    dot top-left
export type DotCorner = 'bl' | 'br' | 'tr' | 'tl' | 'none'
export type StampContent = 'dot' | 'club' | 'none'

const CORNER_OFFSET = 6   // px inset from corner

/** Returns (cx, cy) for the dot/club glyph on a paper rect at (x,y) with side sz. */
export function dotPos(
  corner: DotCorner,
  paperX: number,
  paperY: number,
  sz: number = PAPER_SZ,
): { cx: number; cy: number } {
  const inset = CORNER_OFFSET
  switch (corner) {
    case 'bl': return { cx: paperX + inset,      cy: paperY + sz - inset }
    case 'br': return { cx: paperX + sz - inset, cy: paperY + sz - inset }
    case 'tr': return { cx: paperX + sz - inset, cy: paperY + inset }
    case 'tl': return { cx: paperX + inset,      cy: paperY + inset }
    default:   return { cx: paperX + sz / 2,     cy: paperY + sz / 2 }
  }
}

/** Rotate a DotCorner 90° clockwise. */
export function rotateCW(corner: DotCorner): DotCorner {
  switch (corner) {
    case 'bl': return 'br'
    case 'br': return 'tr'
    case 'tr': return 'tl'
    case 'tl': return 'bl'
    default:   return 'none'
  }
}

// ── SVG primitives ────────────────────────────────────────────────────────────

/** A small filled dot. */
function DotGlyph({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={4} fill={DOT_FILL} />
}

/** A club symbol (♣) as a compact SVG path.
 *  Drawn from scratch: three overlapping circles (the three leaves) + a stem.
 *  Total bounding box ≈ 12×14 px centred on (cx, cy).
 */
function ClubGlyph({ cx, cy, size = 12 }: { cx: number; cy: number; size?: number }) {
  const r = size * 0.32        // leaf circle radius
  const sr = size * 0.09       // stem half-width
  const sh = size * 0.34       // stem height

  // Three leaf centres: top, bottom-left, bottom-right
  const topY    = cy - size * 0.18
  const sideY   = cy + size * 0.1
  const sideOff = size * 0.22

  return (
    <g fill={CLUB_FILL}>
      {/* top leaf */}
      <circle cx={cx}          cy={topY}  r={r} />
      {/* bottom-left leaf */}
      <circle cx={cx - sideOff} cy={sideY} r={r} />
      {/* bottom-right leaf */}
      <circle cx={cx + sideOff} cy={sideY} r={r} />
      {/* stem */}
      <rect
        x={cx - sr}
        y={sideY + r - 1}
        width={sr * 2}
        height={sh}
      />
      {/* base flare */}
      <rect
        x={cx - sr * 2.5}
        y={sideY + r + sh - 2}
        width={sr * 5}
        height={sr * 1.5}
        rx={sr * 0.5}
      />
    </g>
  )
}

/** A square paper tile with an optional dot or club mark. */
export function RotatePaper({
  x,
  y,
  sz = PAPER_SZ,
  dotCorner = 'none',
  showClub = false,
}: {
  x: number
  y: number
  sz?: number
  /** Where to draw the corner dot. 'none' = no dot. */
  dotCorner?: DotCorner
  /** When true, draw a club stamp in the centre instead of/in addition to the dot. */
  showClub?: boolean
}) {
  const { cx: dotCx, cy: dotCy } = dotPos(dotCorner, x, y, sz)
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={sz}
        height={sz}
        fill={PAPER_FILL}
        stroke={PAPER_STROKE}
        strokeWidth={1.5}
        rx={2}
      />
      {dotCorner !== 'none' && <DotGlyph cx={dotCx} cy={dotCy} />}
      {showClub && (
        <ClubGlyph cx={x + sz / 2} cy={y + sz / 2} size={sz * 0.55} />
      )}
    </g>
  )
}

/** Arrow pointing right (→). */
function ArrowRight({ x, y }: { x: number; y: number }) {
  const len = GAP - 2
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={x + len - 6}
        y2={y}
        stroke={ARROW_COL}
        strokeWidth={1.5}
      />
      <polygon
        points={`${x + len},${y} ${x + len - 6},${y - 4} ${x + len - 6},${y + 4}`}
        fill={ARROW_HEAD}
      />
    </g>
  )
}

/** A labelled machine box (R or S). */
function MachineBox({
  x,
  y,
  sz = MACHINE_SZ,
  label,
  bg,
  ink,
}: {
  x: number
  y: number
  sz?: number
  label: 'R' | 'S'
  bg: string
  ink: string
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={sz}
        height={sz}
        fill={bg}
        stroke={ink}
        strokeWidth={2}
        rx={4}
      />
      <text
        x={x + sz / 2}
        y={y + sz / 2 + 9}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={sz * 0.55}
        fontWeight="bold"
        fill={ink}
      >
        {label}
      </text>
    </g>
  )
}

/** One machine diagram: paper-in → [Machine] → paper-out */
export function MachineLegend({
  x,
  y,
  label,
  dotIn,
  dotOut,
  clubOut = false,
}: {
  x: number
  y: number
  label: 'R' | 'S'
  /** dot corner on the input paper */
  dotIn: DotCorner
  /** dot corner on the output paper */
  dotOut: DotCorner
  /** show club on the output paper */
  clubOut?: boolean
}) {
  const bg  = label === 'R' ? MACHINE_R_BG : MACHINE_S_BG
  const ink = label === 'R' ? MACHINE_INK  : MACHINE_S_INK

  // Row height = PAPER_SZ, centre-aligned with machine box
  const papCY = MACHINE_SZ / 2 - PAPER_SZ / 2

  const pIn  = { x: x,                                        y: y + papCY }
  const mBox = { x: x + PAPER_SZ + GAP,                      y }
  const pOut = { x: x + PAPER_SZ + GAP + MACHINE_SZ + GAP,   y: y + papCY }

  const arrIn  = { x: pIn.x  + PAPER_SZ, y: y + MACHINE_SZ / 2 }
  const arrOut = { x: mBox.x + MACHINE_SZ, y: y + MACHINE_SZ / 2 }

  return (
    <g>
      <RotatePaper x={pIn.x}  y={pIn.y}  dotCorner={dotIn} />
      <ArrowRight x={arrIn.x}  y={arrIn.y} />
      <MachineBox x={mBox.x} y={mBox.y} label={label} bg={bg} ink={ink} />
      <ArrowRight x={arrOut.x} y={arrOut.y} />
      <RotatePaper x={pOut.x} y={pOut.y} dotCorner={dotOut} showClub={clubOut} />
    </g>
  )
}

// ── row width helper ──────────────────────────────────────────────────────────
// paper + gap + machine + gap + paper
const ROW_W = PAPER_SZ + GAP + MACHINE_SZ + GAP + PAPER_SZ

// ── ARIA strings ─────────────────────────────────────────────────────────────
const ARIA_EN =
  'Two machine diagrams. Left diagram: a square paper with a dot in the bottom-left corner ' +
  'enters machine R (blue) and comes out with the dot now in the bottom-right corner — ' +
  'machine R rotates the paper 90° clockwise. ' +
  'Right diagram: a blank paper enters machine S (pink) and comes out with a club stamp — ' +
  'machine S stamps the paper with a club symbol.'

const ARIA_ID =
  'Dua diagram mesin. Diagram kiri: selembar kertas persegi dengan titik di sudut kiri bawah ' +
  'masuk ke mesin R (biru) dan keluar dengan titik kini di sudut kanan bawah — ' +
  'mesin R memutar kertas 90° searah jarum jam. ' +
  'Diagram kanan: kertas kosong masuk ke mesin S (merah muda) dan keluar dengan stempel klub — ' +
  'mesin S menstempel kertas dengan simbol klub.'

// ── default export ────────────────────────────────────────────────────────────
export default function Rotate22ECIllustration({ lang = 'en' }: { lang?: string } = {}) {
  // Two legend rows, stacked vertically with a gap
  const VW = ROW_W + 24         // 12px side padding each side
  const rowH = MACHINE_SZ
  const rowGap = 20
  const VH = rowH * 2 + rowGap + 24  // 12px top + 12px bottom

  const PAD_X = 12
  const PAD_Y = 12

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={Math.min(340, VW * 2)}
        style={{ maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* Machine R: dot bl → dot br (90° CW rotation) */}
        <MachineLegend
          x={PAD_X}
          y={PAD_Y}
          label="R"
          dotIn="bl"
          dotOut="br"
        />

        {/* Machine S: no dot → club stamp */}
        <MachineLegend
          x={PAD_X}
          y={PAD_Y + rowH + rowGap}
          label="S"
          dotIn="none"
          dotOut="none"
          clubOut={true}
        />
      </svg>
    </div>
  )
}
