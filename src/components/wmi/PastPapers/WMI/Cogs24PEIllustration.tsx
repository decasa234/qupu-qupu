// Cogs24PEIllustration.tsx
// IKMC-21-PE-Q24 — "Where will the black teeth end up after the small cog makes one full turn?"
//
// Stem: two meshing cogs, each with a marked black tooth.
//   Small cog (rose/pink): 8 teeth, upper-left
//   Large cog (blue):     16 teeth, lower-right
//   Black tooth on small cog: at ~150° (the mesh contact zone, ~5 o'clock)
//   Black tooth on large cog: at ~330° (the mesh contact zone, ~11 o'clock)
//
// Co-exports CogsPair (shared primitive) and Cogs24PEOption for CHOICE_RENDERERS.
//
// SSR-safe, no random, no Date.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Shared layout constants (re-exported for the explainer)
// ---------------------------------------------------------------------------

/** SVG viewBox dimensions */
export const VIEW_W = 160
export const VIEW_H = 130

/** Small cog (rose/pink): 8 teeth */
export const SMALL_COG = {
  cx: 52,
  cy: 48,
  pitchR: 28,
  toothH: 8,
  teeth: 8,
  color: '#F9A8D4',   // rose-300
  stroke: '#E11D48',  // rose-600
}

/** Large cog (blue): 16 teeth */
export const LARGE_COG = {
  cx: 108,
  cy: 88,
  pitchR: 42,
  toothH: 8,
  teeth: 16,
  color: '#93C5FD',   // blue-300
  stroke: '#1D4ED8',  // blue-700
}

// Ink color for shared elements
const INK = '#1F2937'

/**
 * Build an array of individual tooth polygons for a gear.
 * Returns each tooth as a 4-point polygon string (SVG `points` attribute).
 *
 * For tooth index i of N total teeth:
 *   - The outer arc (tip) centre is at angle θ_i = phaseRad + (i/N)*2π
 *   - The tooth spans half-a-tooth width on each side
 *   - Outer points at R_outer = pitchR + toothH
 *   - Inner (root) points at R_inner = pitchR - toothH*0.4
 */
function buildToothPolygons(
  cx: number,
  cy: number,
  pitchR: number,
  toothH: number,
  teeth: number,
  phaseRad: number,
): string[] {
  const R_outer = pitchR + toothH
  const R_inner = pitchR - toothH * 0.4
  const step = (2 * Math.PI) / teeth
  const halfTooth = step * 0.35  // tooth occupies 70% of angular slot

  return Array.from({ length: teeth }, (_, i) => {
    const θ = phaseRad + i * step - Math.PI / 2  // -PI/2 so 0 = top

    // Outer two points (tooth tip)
    const oLeft = θ - halfTooth
    const oRight = θ + halfTooth
    // Inner two points (valley between teeth)
    const iLeft = θ - step * 0.5
    const iRight = θ + step * 0.5

    const pts = [
      [cx + R_outer * Math.cos(oLeft),  cy + R_outer * Math.sin(oLeft)],
      [cx + R_outer * Math.cos(oRight), cy + R_outer * Math.sin(oRight)],
      [cx + R_inner * Math.cos(iRight), cy + R_inner * Math.sin(iRight)],
      [cx + R_inner * Math.cos(iLeft),  cy + R_inner * Math.sin(iLeft)],
    ]
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  })
}

// ---------------------------------------------------------------------------
// CogShape — renders one gear with highlighted black tooth
// ---------------------------------------------------------------------------

interface CogShapeProps {
  cx: number
  cy: number
  pitchR: number
  toothH: number
  teeth: number
  /** Phase offset in radians (0 = tooth 0 points to 12 o'clock) */
  phaseRad: number
  /** Index of the tooth to highlight in black */
  blackToothIndex: number
  color: string
  stroke: string
}

export function CogShape({
  cx,
  cy,
  pitchR,
  toothH,
  teeth,
  phaseRad,
  blackToothIndex,
  color,
  stroke,
}: CogShapeProps) {
  const toothPolygons = buildToothPolygons(cx, cy, pitchR, toothH, teeth, phaseRad)
  const R_inner = pitchR - toothH * 0.4

  return (
    <g>
      {/* Gear body disc */}
      <circle cx={cx} cy={cy} r={R_inner} fill={color} stroke={stroke} strokeWidth={1.5} />
      {/* Hub circle */}
      <circle cx={cx} cy={cy} r={pitchR * 0.18} fill={stroke} />
      {/* Teeth */}
      {toothPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill={i === blackToothIndex ? '#000000' : color}
          stroke={stroke}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// CogsPair — renders both cogs with caller-supplied tooth angles
// ---------------------------------------------------------------------------

interface CogsPairProps {
  /** Angle of small cog's black tooth in degrees (0 = top / 12-o'clock, CW) */
  smallToothDeg: number
  /** Angle of large cog's black tooth in degrees */
  largeToothDeg: number
  /** Show a clockwise rotation arrow on the small cog */
  showSmallArrow?: boolean
  /** Show a counter-clockwise rotation arrow on the large cog */
  showLargeArrow?: boolean
}

/**
 * Convert a desired single-tooth angle (degrees, 0=top CW) into a gear phase
 * offset so that tooth at index 0 lands on that angle.
 */
function toothAngleToPhase(angleDeg: number, toothIndex: number, teeth: number): number {
  const step = (2 * Math.PI) / teeth
  const targetRad = (angleDeg * Math.PI) / 180
  return targetRad - toothIndex * step
}

export function CogsPair({ smallToothDeg, largeToothDeg, showSmallArrow, showLargeArrow }: CogsPairProps) {
  // For the small cog: we designate tooth 0 as the black tooth
  const smallPhase = toothAngleToPhase(smallToothDeg, 0, SMALL_COG.teeth)
  // For the large cog: tooth 0 as the black tooth
  const largePhase = toothAngleToPhase(largeToothDeg, 0, LARGE_COG.teeth)

  return (
    <g>
      {/* Large cog rendered first (behind) */}
      <CogShape
        cx={LARGE_COG.cx}
        cy={LARGE_COG.cy}
        pitchR={LARGE_COG.pitchR}
        toothH={LARGE_COG.toothH}
        teeth={LARGE_COG.teeth}
        phaseRad={largePhase}
        blackToothIndex={0}
        color={LARGE_COG.color}
        stroke={LARGE_COG.stroke}
      />
      {/* Small cog rendered on top */}
      <CogShape
        cx={SMALL_COG.cx}
        cy={SMALL_COG.cy}
        pitchR={SMALL_COG.pitchR}
        toothH={SMALL_COG.toothH}
        teeth={SMALL_COG.teeth}
        phaseRad={smallPhase}
        blackToothIndex={0}
        color={SMALL_COG.color}
        stroke={SMALL_COG.stroke}
      />
      {/* Optional spin arrows */}
      {showSmallArrow && (
        <GearArrow cx={SMALL_COG.cx} cy={SMALL_COG.cy} r={SMALL_COG.pitchR + SMALL_COG.toothH} spin="cw" />
      )}
      {showLargeArrow && (
        <GearArrow cx={LARGE_COG.cx} cy={LARGE_COG.cy} r={LARGE_COG.pitchR + LARGE_COG.toothH} spin="ccw" />
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// GearArrow — a small curved rotation arrow around a cog
// ---------------------------------------------------------------------------

function GearArrow({ cx, cy, r, spin }: { cx: number; cy: number; r: number; spin: 'cw' | 'ccw' }) {
  const rr = r + 7
  // Arc from ~200° to ~340° (CW) or reversed (CCW), measured from positive-x axis
  const startDeg = spin === 'cw' ? 200 : 340
  const endDeg = spin === 'cw' ? 340 : 200
  const sweep = spin === 'cw' ? 1 : 0

  const toXY = (deg: number): [number, number] => {
    const rad = (deg * Math.PI) / 180
    return [cx + rr * Math.cos(rad), cy + rr * Math.sin(rad)]
  }

  const [sx, sy] = toXY(startDeg)
  const [ex, ey] = toXY(endDeg)

  // Arrowhead tangent at the end point
  const headDeg = endDeg + (spin === 'cw' ? -12 : 12)
  const [hx, hy] = toXY(headDeg)

  return (
    <g stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${rr} ${rr} 0 1 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`} />
      <polygon
        points={`${ex.toFixed(2)},${ey.toFixed(2)} ${hx.toFixed(2)},${hy.toFixed(2)} ${(ex + (ex - hx) * 0.5).toFixed(2)},${(ey + (ey - hy) * 0.5).toFixed(2)}`}
        fill={INK}
        stroke="none"
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Stem: initial problem state (before rotation)
// ---------------------------------------------------------------------------

// Small cog black tooth at ~150° (5 o'clock, pointing toward mesh zone)
export const STEM_SMALL_TOOTH_DEG = 150
// Large cog black tooth at ~330° (11 o'clock, pointing toward mesh zone)
export const STEM_LARGE_TOOTH_DEG = 330

/**
 * Cogs24PEIllustration — shows the problem state (before rotation).
 * Both black teeth are at the mesh contact zone.
 * Does NOT reveal where they end up.
 */
export default function Cogs24PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Two meshing cogs: a small pink cog (8 teeth) in the upper-left, ' +
        'and a large blue cog (16 teeth) in the lower-right. ' +
        'Each cog has one black tooth near the mesh point.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#FFFFFF" />
        <CogsPair
          smallToothDeg={STEM_SMALL_TOOTH_DEG}
          largeToothDeg={STEM_LARGE_TOOTH_DEG}
        />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option configuration (A–E)
// ---------------------------------------------------------------------------

// Per-option tooth angles after 1 full CW turn of the small cog.
// Key physics:
//   - Small cog tooth: always returns to start after 1 full turn
//   - Large cog tooth: rotates 180° CCW from its start position
// The CORRECT answer is C, which matches the physics exactly.
//
// Small tooth angle (deg) | Large tooth angle (deg)
// Option A: small ~330° (11 o'clock), large ~270° (9 o'clock)
// Option B: small ~60°  (2 o'clock),  large ~330° (11 o'clock / same as start — wrong)
// Option C: small ~150° (same as start, 5 o'clock), large ~150° (5 o'clock)  ← ANSWER
// Option D: small ~240° (8 o'clock),  large ~60°   (2 o'clock)
// Option E: small ~0°   (12 o'clock), large ~210°  (7 o'clock)

interface OptionConfig {
  smallToothDeg: number
  largeToothDeg: number
  ariaEn: string
  ariaId: string
}

const OPTION_CONFIGS: Record<string, OptionConfig> = {
  A: {
    smallToothDeg: 330,
    largeToothDeg: 270,
    ariaEn: 'Option A: small cog black tooth at 11 o\'clock, large cog black tooth at 9 o\'clock.',
    ariaId: 'Pilihan A: gigi hitam roda kecil di posisi jam 11, roda besar di posisi jam 9.',
  },
  B: {
    smallToothDeg: 60,
    largeToothDeg: 330,
    ariaEn: 'Option B: small cog black tooth at 2 o\'clock, large cog black tooth at 11 o\'clock.',
    ariaId: 'Pilihan B: gigi hitam roda kecil di posisi jam 2, roda besar di posisi jam 11.',
  },
  C: {
    smallToothDeg: 150,
    largeToothDeg: 150,
    ariaEn: 'Option C: small cog black tooth at 5 o\'clock (same as start), large cog black tooth at 5 o\'clock (rotated 180°).',
    ariaId: 'Pilihan C: gigi hitam roda kecil di posisi jam 5 (sama seperti awal), roda besar di posisi jam 5 (berputar 180°).',
  },
  D: {
    smallToothDeg: 240,
    largeToothDeg: 60,
    ariaEn: 'Option D: small cog black tooth at 8 o\'clock, large cog black tooth at 2 o\'clock.',
    ariaId: 'Pilihan D: gigi hitam roda kecil di posisi jam 8, roda besar di posisi jam 2.',
  },
  E: {
    smallToothDeg: 0,
    largeToothDeg: 210,
    ariaEn: 'Option E: small cog black tooth at 12 o\'clock, large cog black tooth at 7 o\'clock.',
    ariaId: 'Pilihan E: gigi hitam roda kecil di posisi jam 12, roda besar di posisi jam 7.',
  },
}

/**
 * Cogs24PEOption — renders one A/B/C/D/E option as the two-cog figure
 * with black teeth in the final position described by that choice.
 * Registered in CHOICE_RENDERERS for IKMC-21-PE-Q24.
 */
export function Cogs24PEOption({ choice }: { choice: WmiChoice }) {
  const cfg = OPTION_CONFIGS[choice.label]
  if (!cfg) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={cfg.ariaEn}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={140}
        height={Math.round(140 * VIEW_H / VIEW_W)}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#FFFFFF" />
        <CogsPair
          smallToothDeg={cfg.smallToothDeg}
          largeToothDeg={cfg.largeToothDeg}
        />
      </svg>
    </span>
  )
}
