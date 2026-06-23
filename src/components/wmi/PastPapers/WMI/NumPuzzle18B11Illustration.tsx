// SEAMO-18-B-Q11 — "Find the missing number in the number puzzle below."
//
// Three circle groups sit side by side. Each group has ONE large centre circle
// (the "result") surrounded by THREE small circles: one at the TOP, one at the
// BOTTOM-LEFT, one at the BOTTOM-RIGHT.
//
// Rule:  top × (BL + BR) = centre
//   Group 1:  4 × (5 + 3) = 4 × 8 = 32  ✓
//   Group 2:  5 × (7 + 8) = 5 × 15 = 75  ✓
//   Group 3:  ? × (6 + 5) = 55  →  ? × 11 = 55  →  ? = 5   (Answer A)
//
// The static illustration shows only the PROBLEM — the top circle of group 3
// is left blank (?). `revealAnswer` prop fills it in for the explainer.
//
// Pure render: no Math.random, no Date — SSR-safe & deterministic.
//
// Exports:
//   NumPuzzle18B11   — named reusable SVG primitive (accepts revealAnswer prop)
//   default          — Illustration wrapper div (answer hidden)

// ── colour tokens ──────────────────────────────────────────────────────────────
const INK    = '#1F2937'   // outlines + labels
const BLUE   = '#30598A'   // known numeral fill
const ORANGE = '#f0853a'   // accent on the unknown / revealed answer
const SHADE  = '#FDE3CF'   // peach wash inside the ? circle
const WHITE  = '#FFFFFF'
const ROSE   = '#E64A5C'   // connecting line + circle stroke

// ── figure data ───────────────────────────────────────────────────────────────
export interface PuzzleGroup {
  top:    number | null   // null = unknown (?)
  bl:     number
  br:     number
  centre: number
}

export const GROUPS: PuzzleGroup[] = [
  { top: 4, bl: 5, br: 3, centre: 32 },
  { top: 5, bl: 7, br: 8, centre: 75 },
  { top: null, bl: 6, br: 5, centre: 55 },
]

export const ANSWER = 5   // ? × (6+5) = 55 → ? = 5

// ── geometry ──────────────────────────────────────────────────────────────────
export const CR_LARGE = 28   // large centre-circle radius
export const CR_SMALL = 16   // small satellite-circle radius
const GAP      = 10   // gap between circle edges (large ↔ small)

// Centre-to-centre distance from the large circle to each satellite
const DIST = CR_LARGE + GAP + CR_SMALL

// Satellite angles (degrees, SVG y-axis downward):
//   TOP      = -90° (straight up)
//   BOT-LEFT = 210° (lower-left, i.e. -150° from top)
//   BOT-RIGHT= 330° (lower-right, i.e.  -30° from top = 30° below horizon right)
const ANG_TOP = -90
const ANG_BL  = 210
const ANG_BR  = 330

function toRad(deg: number) { return (deg * Math.PI) / 180 }

/** Satellite centre relative to the large circle centre at (0,0). */
function satPos(angleDeg: number): { dx: number; dy: number } {
  return { dx: DIST * Math.cos(toRad(angleDeg)), dy: DIST * Math.sin(toRad(angleDeg)) }
}

// Per-group "origin" = centre of the large circle
const GROUP_SPACING = CR_LARGE * 2 + DIST + CR_SMALL * 2 + 24
const PAD_X = CR_SMALL + 12
const PAD_Y = CR_LARGE + DIST + CR_SMALL + 8   // enough headroom for the top satellite

// SVG dimensions
const VW = PAD_X * 2 + GROUP_SPACING * 2 + CR_LARGE * 2 + DIST + CR_SMALL
const VH = PAD_Y + CR_LARGE + DIST + CR_SMALL + 8

// Large-circle centre for each group
function groupOrigin(g: number): { cx: number; cy: number } {
  return {
    cx: PAD_X + CR_SMALL + DIST + CR_LARGE + g * GROUP_SPACING,
    cy: PAD_Y,
  }
}

// ── reusable primitive ─────────────────────────────────────────────────────────

export interface NumPuzzle18B11Props {
  /** Reveal the answer (5) in the third group's top circle. */
  revealAnswer?: boolean
}

export function NumPuzzle18B11({ revealAnswer = false }: NumPuzzle18B11Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {GROUPS.map((grp, g) => {
        const { cx, cy } = groupOrigin(g)

        // Satellite positions
        const topPos = satPos(ANG_TOP)
        const blPos  = satPos(ANG_BL)
        const brPos  = satPos(ANG_BR)

        const topCX = cx + topPos.dx, topCY = cy + topPos.dy
        const blCX  = cx + blPos.dx,  blCY  = cy + blPos.dy
        const brCX  = cx + brPos.dx,  brCY  = cy + brPos.dy

        const isUnknown = grp.top === null
        const topValue  = isUnknown ? (revealAnswer ? String(ANSWER) : '?') : String(grp.top)
        const topFill   = isUnknown ? SHADE : WHITE
        const topStroke = isUnknown ? ORANGE : ROSE
        const topStrokeW = isUnknown ? 2.8 : 2
        const topTextFill = isUnknown ? (revealAnswer ? ORANGE : INK) : BLUE

        return (
          <g key={`grp-${g}`}>
            {/* connecting lines from large circle centre to each satellite */}
            {[topPos, blPos, brPos].map((pos, i) => (
              <line
                key={`line-${g}-${i}`}
                x1={cx + pos.dx * (CR_LARGE / DIST)}
                y1={cy + pos.dy * (CR_LARGE / DIST)}
                x2={cx + pos.dx * ((DIST - CR_SMALL) / DIST)}
                y2={cy + pos.dy * ((DIST - CR_SMALL) / DIST)}
                stroke={ROSE}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}

            {/* large centre circle */}
            <circle cx={cx} cy={cy} r={CR_LARGE} fill={WHITE} stroke={ROSE} strokeWidth={2.4} />
            <text
              x={cx} y={cy}
              textAnchor="middle" dominantBaseline="central"
              fontSize={18} fontWeight={700} fill={BLUE}
            >
              {grp.centre}
            </text>

            {/* TOP satellite */}
            <circle cx={topCX} cy={topCY} r={CR_SMALL} fill={topFill} stroke={topStroke} strokeWidth={topStrokeW} />
            <text
              x={topCX} y={topCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={isUnknown && !revealAnswer ? 15 : 14}
              fontWeight={700}
              fill={topTextFill}
            >
              {topValue}
            </text>

            {/* BOTTOM-LEFT satellite */}
            <circle cx={blCX} cy={blCY} r={CR_SMALL} fill={WHITE} stroke={ROSE} strokeWidth={2} />
            <text
              x={blCX} y={blCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={14} fontWeight={700} fill={BLUE}
            >
              {grp.bl}
            </text>

            {/* BOTTOM-RIGHT satellite */}
            <circle cx={brCX} cy={brCY} r={CR_SMALL} fill={WHITE} stroke={ROSE} strokeWidth={2} />
            <text
              x={brCX} y={brCY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={14} fontWeight={700} fill={BLUE}
            >
              {grp.br}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Static illustration for SEAMO-18-B-Q11 (answer circle left blank). */
export default function NumPuzzle18B11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga kelompok lingkaran. Setiap kelompok punya satu lingkaran besar di tengah dan tiga lingkaran kecil di sekitarnya (atas, bawah-kiri, bawah-kanan). Kelompok 1: atas=4, tengah=32, bawah-kiri=5, bawah-kanan=3. Kelompok 2: atas=5, tengah=75, bawah-kiri=7, bawah-kanan=8. Kelompok 3: atas=?, tengah=55, bawah-kiri=6, bawah-kanan=5."
    >
      <NumPuzzle18B11 />
    </div>
  )
}
