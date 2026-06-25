// SEAMO-20-A-Q9 — "Find the missing number."
//
// Source figures: 2020.imgs/011.jpg, 012.jpg, 013.jpg
//
// Three side-by-side circle puzzles, each with:
//   - A large central circle (holds the result or ?)
//   - Three small satellite circles: TOP, BOTTOM-LEFT, BOTTOM-RIGHT
//   connected to the central circle by short lines.
//
// Data:
//   Circle 1: top=9,  center=13, bl=12, br=8   → 9+12−8=13 ✓
//   Circle 2: top=12, center=20, bl=15, br=7    → 12+15−7=20 ✓
//   Circle 3: top=6,  center=?,  bl=9,  br=1    → 6+9−1=14   → answer C
//
// Rule: center = top + bottom-left − bottom-right
//
// No imported primitive covers this layout — original SVG drawn here.
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Colours ──────────────────────────────────────────────────────────────────

const INK    = '#1F2937'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const PEACH  = '#FDE3CF'
const WHITE  = '#FFFFFF'
const ROSE   = '#C94060'

// ── Figure data ───────────────────────────────────────────────────────────────

export interface CircleNumbersEntry {
  top: number
  bl: number
  br: number
  center: number | null   // null = missing (shown as ?)
}

export const CIRCLE_NUMBERS_ENTRIES: CircleNumbersEntry[] = [
  { top: 9,  bl: 12, br: 8, center: 13 },
  { top: 12, bl: 15, br: 7, center: 20 },
  { top: 6,  bl: 9,  br: 1, center: null },
]

export const CIRCLE_NUMBERS_ANSWER = 14  // 6+9−1=14

// ── Geometry ─────────────────────────────────────────────────────────────────

const CR   = 26   // large center circle radius
const SR   = 17   // small satellite circle radius

const PAD  = SR + 4   // outer padding so satellites aren't clipped

// For each puzzle, the large circle is at (0,0) in local coords.
// Satellite positions (relative to large circle center):
//   TOP:          (0, -(CR + 18 + SR))
//   BOTTOM-LEFT:  (-(CR*0.7 + 14 + SR), (CR*0.6 + 14 + SR))
//   BOTTOM-RIGHT: (+(CR*0.7 + 14 + SR), (CR*0.6 + 14 + SR))

const SAT_TOP_DX   = 0
const SAT_TOP_DY   = -(CR + 18 + SR)    // -61
const SAT_BL_DX    = -(CR * 0.7 + 14 + SR)   // ≈ -49
const SAT_BL_DY    = CR * 0.6 + 14 + SR      //  ≈ +47
const SAT_BR_DX    = CR * 0.7 + 14 + SR
const SAT_BR_DY    = SAT_BL_DY

// Local bounding box per puzzle (centered at 0,0 → the big circle centre)
const LBOX_TOP   = SAT_TOP_DY - SR         // top of top-satellite
const LBOX_BOT   = SAT_BL_DY  + SR         // bottom of BL/BR satellite
const LBOX_LEFT  = SAT_BL_DX  - SR         // left of BL satellite
const LBOX_RIGHT = SAT_BR_DX  + SR         // right of BR satellite

const LBOX_W = LBOX_RIGHT - LBOX_LEFT       // ≈ 133
const LBOX_H = LBOX_BOT   - LBOX_TOP        // ≈ 125

// Local origin in SVG coords (0,0 → top-left of local bounding box + pad)
const LOC_OX = -LBOX_LEFT + PAD   // offsets local 0,0 to within the tile
const LOC_OY = -LBOX_TOP  + PAD

const TILE_W = LBOX_W + PAD * 2
const TILE_H = LBOX_H + PAD * 2

const PUZZLE_GAP = 20   // horizontal gap between puzzles

const VW = TILE_W * 3 + PUZZLE_GAP * 2
const VH = TILE_H

// ── Sub-components ────────────────────────────────────────────────────────────

interface SatelliteProps {
  dx: number
  dy: number
  value: number
  ox: number   // local origin x
  oy: number   // local origin y
}

function Satellite({ dx, dy, value, ox, oy }: SatelliteProps) {
  const cx = ox + dx
  const cy = oy + dy
  const lcx = ox          // large circle center
  const lcy = oy

  // Line endpoint on the large circle edge
  const angle = Math.atan2(dy, dx)
  const lx = lcx + Math.cos(angle) * CR
  const ly = lcy + Math.sin(angle) * CR

  // Line endpoint on satellite edge (towards large circle)
  const sx = cx - Math.cos(angle) * SR
  const sy = cy - Math.sin(angle) * SR

  return (
    <>
      <line x1={lx} y1={ly} x2={sx} y2={sy} stroke={ROSE} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={SR} fill={WHITE} stroke={ROSE} strokeWidth={2.4} />
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={700} fill={BLUE}
      >
        {value}
      </text>
    </>
  )
}

interface CirclePuzzleProps {
  entry: CircleNumbersEntry
  tileX: number      // x offset of this tile
  revealAnswer?: boolean
}

function CirclePuzzle({ entry, tileX, revealAnswer = false }: CirclePuzzleProps) {
  const ox = tileX + LOC_OX   // large circle center x in SVG coords
  const oy = LOC_OY             // large circle center y in SVG coords

  const isUnknown = entry.center === null
  const centerValue = isUnknown
    ? (revealAnswer ? String(CIRCLE_NUMBERS_ANSWER) : '?')
    : String(entry.center)

  const cirFill   = isUnknown ? PEACH  : WHITE
  const cirStroke = isUnknown ? ORANGE : ROSE
  const cirStrokeW = isUnknown ? 3 : 2.4
  const cirTextFill = isUnknown && revealAnswer ? ORANGE : isUnknown ? INK : BLUE

  return (
    <g>
      {/* Large center circle */}
      <circle cx={ox} cy={oy} r={CR} fill={cirFill} stroke={cirStroke} strokeWidth={cirStrokeW} />
      <text
        x={ox} y={oy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={isUnknown && !revealAnswer ? 22 : 18}
        fontWeight={700} fill={cirTextFill}
      >
        {centerValue}
      </text>

      {/* TOP satellite */}
      <Satellite dx={SAT_TOP_DX} dy={SAT_TOP_DY} value={entry.top} ox={ox} oy={oy} />
      {/* BOTTOM-LEFT satellite */}
      <Satellite dx={SAT_BL_DX} dy={SAT_BL_DY} value={entry.bl} ox={ox} oy={oy} />
      {/* BOTTOM-RIGHT satellite */}
      <Satellite dx={SAT_BR_DX} dy={SAT_BR_DY} value={entry.br} ox={ox} oy={oy} />
    </g>
  )
}

// ── Main exportable component ─────────────────────────────────────────────────

export interface CircleNumbers20A9Props {
  /** Reveal the answer (14) in the third circle. Default false. */
  revealAnswer?: boolean
}

export function CircleNumbers20A9({ revealAnswer = false }: CircleNumbers20A9Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {CIRCLE_NUMBERS_ENTRIES.map((entry, i) => (
        <CirclePuzzle
          key={i}
          entry={entry}
          tileX={i * (TILE_W + PUZZLE_GAP)}
          revealAnswer={revealAnswer}
        />
      ))}
    </svg>
  )
}

// ── Default export: static illustration (answer blank) ───────────────────────

/** Static illustration for SEAMO-20-A-Q9 (unknown circle shown as ?). */
export default function CircleNumbers20A9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tiga teka-teki lingkaran berjejer. ' +
        'Lingkaran pertama: atas 9, kiri bawah 12, kanan bawah 8, tengah 13. ' +
        'Lingkaran kedua: atas 12, kiri bawah 15, kanan bawah 7, tengah 20. ' +
        'Lingkaran ketiga: atas 6, kiri bawah 9, kanan bawah 1, tengah tanda tanya.'
      }
    >
      <CircleNumbers20A9 />
    </div>
  )
}
