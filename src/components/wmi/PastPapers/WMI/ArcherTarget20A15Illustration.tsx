/**
 * SEAMO-20-A-Q15 — Archery target with five arrows.
 *
 * "An archer shoots five arrows at the target board without missing.
 *  Points scored depend on where the arrow lands.
 *  How many points did the archer score in total?"
 *
 * Source figure: docs/reference/ocr-res/seamo/contest/paper-a/2020.imgs/016.jpg
 * Three concentric rings (red/white/red) scored:
 *   inner  = 5 pts
 *   middle = 3 pts
 *   outer  = 1 pt
 * All five arrows land in the middle ring → 5 × 3 = 15 pts (answer C).
 *
 * This file shows the PROBLEM only (arrow positions in the middle ring).
 * It co-exports `ArcherTargetSVG` so the explainer can reuse it.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion, no Date/random.
 */

// ── colour tokens (match source image: red/white/red) ─────────────────────────
const RED_OUTER = '#C0392B'
const WHITE_MID = '#FFFFFF'
const RED_INNER = '#C0392B'
const STROKE    = '#111111'
const ARROW_CLR = '#1F2937'

// ── geometry ──────────────────────────────────────────────────────────────────
const CX    = 110
const CY    = 110
const VW    = 220
const VH    = 220
const R_OUT = 100   // outer ring edge
const R_MID =  72   // border between outer and middle ring
const R_INN =  40   // border between middle and inner ring

// Label font sizes
const LBL_OUTER = 16
const LBL_MID   = 18
const LBL_INN   = 20

// ── Five arrow hits (all in the middle ring: R_INN < r < R_MID) ───────────────
// Positioned to replicate a natural spread across the middle ring.
// Each dot [dx, dy] relative to CX, CY; verify |sqrt(dx²+dy²)| ∈ (40, 72).
const ARROW_DOTS: Array<{ dx: number; dy: number }> = [
  { dx:  0,  dy: -58 },  // top of middle ring
  { dx: 55,  dy: -18 },  // upper-right
  { dx: 48,  dy:  38 },  // lower-right
  { dx: -50, dy:  30 },  // lower-left
  { dx: -54, dy: -22 },  // upper-left
]

// ── Shared SVG primitive ───────────────────────────────────────────────────────

export interface ArcherTargetSVGProps {
  /** Highlight one ring with amber border (for explainer). */
  highlightRing?: 1 | 3 | 5 | null
  /** Show arrow dots (true in illustration; can toggle for explainer beats). */
  showArrows?: boolean
}

export function ArcherTargetSVG({
  highlightRing = null,
  showArrows = true,
}: ArcherTargetSVGProps) {
  const hlStroke = '#F59E0B'
  const hlW      = 4

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect x={0} y={0} width={VW} height={VH} fill="#F9FAFB" />

      {/* Outer ring (score = 1) — largest, drawn first */}
      <circle
        cx={CX} cy={CY} r={R_OUT}
        fill={RED_OUTER}
        stroke={highlightRing === 1 ? hlStroke : STROKE}
        strokeWidth={highlightRing === 1 ? hlW : 2}
      />

      {/* Middle ring (score = 3) */}
      <circle
        cx={CX} cy={CY} r={R_MID}
        fill={WHITE_MID}
        stroke={highlightRing === 3 ? hlStroke : STROKE}
        strokeWidth={highlightRing === 3 ? hlW : 2}
      />

      {/* Inner ring (score = 5) */}
      <circle
        cx={CX} cy={CY} r={R_INN}
        fill={RED_INNER}
        stroke={highlightRing === 5 ? hlStroke : STROKE}
        strokeWidth={highlightRing === 5 ? hlW : 2}
      />

      {/* Ring score labels (white on red, dark on white) */}
      <text
        x={CX} y={CY - 78}
        textAnchor="middle" dominantBaseline="central"
        fontSize={LBL_OUTER} fontWeight={700} fill="#FFFFFF"
      >1</text>
      <text
        x={CX} y={CY - 10}
        textAnchor="middle" dominantBaseline="central"
        fontSize={LBL_MID} fontWeight={700} fill={STROKE}
      >3</text>
      <text
        x={CX} y={CY + 4}
        textAnchor="middle" dominantBaseline="central"
        fontSize={LBL_INN} fontWeight={700} fill="#FFFFFF"
      >5</text>

      {/* Arrow-hit dots */}
      {showArrows && ARROW_DOTS.map((d, i) => (
        <g key={i}>
          {/* Arrow shaft */}
          <line
            x1={CX + d.dx}
            y1={CY + d.dy - 10}
            x2={CX + d.dx}
            y2={CY + d.dy + 6}
            stroke={ARROW_CLR}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <polygon
            points={`${CX + d.dx},${CY + d.dy - 13} ${CX + d.dx - 4},${CY + d.dy - 5} ${CX + d.dx + 4},${CY + d.dy - 5}`}
            fill={ARROW_CLR}
          />
        </g>
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

export default function ArcherTarget20A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Target panahan dengan tiga cincin konsentris. Cincin luar bernilai 1 poin, cincin tengah 3 poin, cincin dalam 5 poin. Lima anak panah menancap di cincin tengah."
    >
      <ArcherTargetSVG showArrows />
    </div>
  )
}
