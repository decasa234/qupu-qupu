// SASMO-19-G3-Q7 — "Temukan bayangan cermin dari gambar di sebelah kanan."
// (Find the mirror image of the picture on the right.)
//
// Reference (010.jpg): rocket tilted LEFT, yellow star upper-RIGHT in a blue
// circle background, side booster on the RIGHT of the body.
// Horizontal mirror = Option A: rocket tilts RIGHT, star upper-LEFT, booster LEFT.
//
// Default export  → RocketMirrorSASMO19G3Q7Illustration (stem).
// Named export    → RocketMirrorSASMO19G3Q7Option (CHOICE_RENDERERS, A–E).
//
// Copy-adapted from PencilMirrorSASMO19G2Q12Illustration (same question type).
// Pure SVG, SSR-safe (no hooks, no framer-motion).

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C_BODY   = '#F1F5F9'  // rocket body (off-white)
const C_RED    = '#DC2626'  // nose cone, fins, accent band
const C_WIN    = '#3B82F6'  // window centre
const C_WIN_L  = '#BFDBFE'  // window outer glow
const C_BST    = '#D1D5DB'  // side booster body
const C_FLAME  = '#F97316'  // outer flame (orange)
const C_FLAMI  = '#FDE047'  // inner flame (yellow)
const C_CIRCLE = '#93C5FD'  // blue circle background
const C_STAR   = '#FCD34D'  // yellow star
const C_INK    = '#111827'  // outline

// ---------------------------------------------------------------------------
// 5-pointed star polygon helper
// ---------------------------------------------------------------------------
function starPts(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.38
    const angle  = (i * Math.PI) / 5 - Math.PI / 2
    pts.push(
      `${(cx + radius * Math.cos(angle)).toFixed(1)},` +
      `${(cy + radius * Math.sin(angle)).toFixed(1)}`
    )
  }
  return pts.join(' ')
}

// ---------------------------------------------------------------------------
// Rocket body — drawn pointing UP, centred at local origin (0, 0).
// Spans approx. y=-38 (nose tip) … y=40 (exhaust tip), ±22 wide with booster.
// `booster` decides which local x-side carries the auxiliary engine.
// ---------------------------------------------------------------------------
function RocketBody({ booster }: { booster: 'left' | 'right' }) {
  // booster rect left-edge x in local coords
  const bx   = booster === 'right' ? 12 : -23
  const bMid = bx + 5.5

  return (
    <>
      {/* Rear fins (behind body) */}
      <polygon points="-11,8 -22,24 -11,24" fill={C_RED} stroke={C_INK} strokeWidth={0.7} />
      <polygon points=" 11,8  22,24  11,24" fill={C_RED} stroke={C_INK} strokeWidth={0.7} />

      {/* Main body */}
      <rect x={-11} y={-26} width={22} height={50} fill={C_BODY} rx={2} stroke={C_INK} strokeWidth={0.8} />

      {/* Red accent band */}
      <rect x={-11} y={-6} width={22} height={7} fill={C_RED} />

      {/* Nose cone */}
      <polygon points="-10,-26 10,-26 0,-38" fill={C_RED} stroke={C_INK} strokeWidth={0.8} />

      {/* Upper window */}
      <circle cx={0} cy={-14} r={7} fill={C_WIN_L} stroke={C_WIN} strokeWidth={1.8} />
      <circle cx={0} cy={-14} r={4} fill={C_WIN} />

      {/* Lower window */}
      <circle cx={0} cy={3} r={8} fill={C_WIN_L} stroke={C_WIN} strokeWidth={1.8} />
      <circle cx={0} cy={3} r={5} fill={C_WIN} />

      {/* Side booster: nose → body → flame */}
      <polygon
        points={`${bx},-10 ${bx + 11},-10 ${bMid},-18`}
        fill={C_RED} stroke={C_INK} strokeWidth={0.7}
      />
      <rect x={bx} y={-10} width={11} height={22} fill={C_BST} rx={2} stroke={C_INK} strokeWidth={0.7} />
      <polygon points={`${bx + 1},12 ${bx + 10},12 ${bMid},20`} fill={C_FLAME} />
      <polygon points={`${bx + 3},12 ${bx + 8},12 ${bMid},17`} fill={C_FLAMI} />

      {/* Main exhaust flame */}
      <polygon points="-8,24 8,24 0,40"  fill={C_FLAME} />
      <polygon points="-5,24 5,24 0,34"  fill={C_FLAMI} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Per-option scene configuration
// ---------------------------------------------------------------------------
interface RocketCfg {
  /** Tilt angle in degrees — negative = lean left (CCW), positive = lean right (CW). */
  angle:   number
  /** Star centre [cx, cy] in viewBox coords. */
  star:    readonly [number, number]
  /** Side booster placement on the rocket body. */
  booster: 'left' | 'right'
}

// Stem: leans left, star upper-right, booster right
const CFG_REF: RocketCfg = { angle: -20, star: [82, 26], booster: 'right' }

// Options — only A is the correct horizontal mirror of the reference
const CFG_BY_LABEL: Record<string, RocketCfg> = {
  // A — correct mirror: tilt right, star left, booster left
  A: { angle:  20, star: [38, 26], booster: 'left'  },
  // B — same tilt as reference, star flipped, booster unchanged
  B: { angle: -20, star: [38, 26], booster: 'right' },
  // C — tilt mirrored but star still on original side
  C: { angle:  20, star: [82, 26], booster: 'right' },
  // D — tilt and star mirrored but booster not flipped
  D: { angle:  20, star: [38, 26], booster: 'right' },
  // E — same tilt as reference; star and booster flipped but tilt wrong
  E: { angle: -20, star: [38, 26], booster: 'left'  },
}

// ---------------------------------------------------------------------------
// Inner scene content (background + star + rocket).
// Returns a React Fragment — must be placed inside an <svg> element.
// ---------------------------------------------------------------------------
function RocketSceneContent({ cfg }: { cfg: RocketCfg }) {
  return (
    <>
      <rect width={120} height={120} fill="#EFF6FF" rx={8} />
      <circle cx={60} cy={60} r={42} fill={C_CIRCLE} />
      <polygon
        points={starPts(cfg.star[0], cfg.star[1], 11)}
        fill={C_STAR} stroke="#D97706" strokeWidth={0.8}
      />
      <g transform={`translate(60,60) rotate(${cfg.angle})`}>
        <RocketBody booster={cfg.booster} />
      </g>
    </>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (180 × 180 display)
// ---------------------------------------------------------------------------
export default function RocketMirrorSASMO19G3Q7Illustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      width={180}
      height={180}
      role="img"
      aria-label="Gambar referensi: roket miring ke kiri dengan bintang di kanan atas lingkaran biru"
    >
      <RocketSceneContent cfg={CFG_REF} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Named export — option renderer for CHOICE_RENDERERS (90 × 90 display)
// ---------------------------------------------------------------------------
export function RocketMirrorSASMO19G3Q7Option({ choice }: { choice: WmiChoice }) {
  const cfg = CFG_BY_LABEL[choice.label]
  if (!cfg) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={`Pilihan ${choice.label}: gambar roket`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg viewBox="0 0 120 120" width={90} height={90}>
        <RocketSceneContent cfg={cfg} />
      </svg>
    </span>
  )
}
