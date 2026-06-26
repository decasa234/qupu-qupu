// SIMOC-21-G1-Q15 — Euler path picture-options
//
// "Four of the following figures can be drawn without lifting the pen and
//  without retracing any lines. Which CANNOT be drawn in the same way?"
//
// All five A–E answer choices ARE the figures (no separate stem illustration).
// Co-exports EulerFiguresSIMOC21G1Q15Option as the CHOICE_RENDERERS entry.
//
// Euler-path analysis (odd-degree vertex count):
//   A — Triangle + X-trapezoid: BL(3), BR(3)                    → 2 odd → drawable ✓
//   B — House (rect+roof) + X inside rect: BL(3), BR(3)         → 2 odd → drawable ✓
//   C — Vertical hourglass with horizontal caps: all degree ≤4   → 0 odd → drawable ✓
//   D — Square, inner L (ML-MC-MB), diagonals TL→MC & TR→MB:
//         TL(3), TR(3), ML(3), MC(3)                            → 4 odd → NOT drawable ✗ (answer D)
//   E — Two concentric circles + diagonal + triangle:            → 2 odd → drawable ✓
//
// Pure SVG, SSR-safe, no hooks.

import type { WmiChoice } from '../../../../types/wmi'

const INK = '#1F2937'
const SW = 2.5

// ─── per-option SVG helpers ──────────────────────────────────────────────────

function FigA() {
  return (
    <svg viewBox="0 0 100 122" width={80} aria-hidden style={{ display: 'block' }}>
      {/* outer triangle */}
      <line x1={50}  y1={8}   x2={18}  y2={55}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={8}   x2={82}  y2={55}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* horizontal bar splitting triangle from trapezoid */}
      <line x1={18}  y1={55}  x2={82}  y2={55}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* trapezoid sides */}
      <line x1={18}  y1={55}  x2={8}   y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={82}  y1={55}  x2={92}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* base */}
      <line x1={8}   y1={114} x2={92}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* X diagonals of trapezoid */}
      <line x1={18}  y1={55}  x2={92}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={82}  y1={55}  x2={8}   y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

function FigB() {
  return (
    <svg viewBox="0 0 100 122" width={80} aria-hidden style={{ display: 'block' }}>
      {/* roof */}
      <line x1={50}  y1={8}   x2={12}  y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={8}   x2={88}  y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* rectangle */}
      <line x1={12}  y1={50}  x2={88}  y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={12}  y1={50}  x2={12}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={88}  y1={50}  x2={88}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={12}  y1={114} x2={88}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* X inside rectangle */}
      <line x1={12}  y1={50}  x2={88}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={88}  y1={50}  x2={12}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

function FigC() {
  // Vertical hourglass: wide top (TL-TR), sides converge to centre C, fan back to wide bottom (BL-BR).
  // All vertices even → 0 odd → Euler circuit.
  return (
    <svg viewBox="0 0 100 122" width={80} aria-hidden style={{ display: 'block' }}>
      <line x1={15}  y1={8}   x2={85}  y2={8}   stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={15}  y1={8}   x2={50}  y2={61}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={85}  y1={8}   x2={50}  y2={61}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={61}  x2={15}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={61}  x2={85}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={15}  y1={114} x2={85}  y2={114} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

function FigD() {
  // Large square. Inner "L" at lower-left: ML(8,50)→MC(50,50)→MB(50,92).
  // Two diagonals: TL(8,8)→MC(50,50) and TR(92,8)→MB(50,92).
  // Odd-degree: TL(3), TR(3), ML(3), MC(3) → 4 odd → CANNOT trace.
  return (
    <svg viewBox="0 0 100 100" width={80} aria-hidden style={{ display: 'block' }}>
      {/* outer square, edges split at ML and MB */}
      <line x1={8}   y1={8}   x2={92}  y2={8}   stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={92}  y1={8}   x2={92}  y2={92}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={92}  y1={92}  x2={50}  y2={92}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={92}  x2={8}   y2={92}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={8}   y1={92}  x2={8}   y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={8}   y1={50}  x2={8}   y2={8}   stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* inner L: horizontal ML→MC then vertical MC→MB */}
      <line x1={8}   y1={50}  x2={50}  y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <line x1={50}  y1={50}  x2={50}  y2={92}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* diagonal 1: TL→MC */}
      <line x1={8}   y1={8}   x2={50}  y2={50}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* diagonal 2: TR→MB */}
      <line x1={92}  y1={8}   x2={50}  y2={92}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

function FigE() {
  // Two concentric circles + diagonal transversal (tangent to inner circle) + closed triangle at end.
  // Euler: P1 and P2 on outer circle each degree 3 (odd) → 2 odd → drawable.
  const cx = 48, cy = 66, rO = 44, rI = 22
  return (
    <svg viewBox="0 0 100 122" width={80} aria-hidden style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={rO} fill="none" stroke={INK} strokeWidth={SW} />
      <circle cx={cx} cy={cy} r={rI} fill="none" stroke={INK} strokeWidth={SW} />
      {/* transversal: lower-left to upper-right, passing through outer circle */}
      <line x1={5}   y1={100} x2={82}  y2={20}  stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* small closed triangle at the upper-right end of the transversal */}
      <polyline
        points="82,20 91,8 98,22 82,20"
        fill="none"
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── figure map ──────────────────────────────────────────────────────────────

const FIGURE: Record<string, () => JSX.Element> = {
  A: FigA,
  B: FigB,
  C: FigC,
  D: FigD,
  E: FigE,
}

const ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Figure A: triangle with a trapezoid below it, diagonals crossing inside the trapezoid.',
    id: 'Gambar A: segitiga dengan trapesium di bawahnya, diagonal-diagonal bersilang di dalam trapesium.',
  },
  B: {
    en: 'Figure B: rectangle with a triangular roof, diagonals crossing inside the rectangle.',
    id: 'Gambar B: persegi panjang dengan atap segitiga, diagonal-diagonal bersilang di dalam persegi panjang.',
  },
  C: {
    en: 'Figure C: vertical hourglass shape with horizontal bars at top and bottom.',
    id: 'Gambar C: bentuk jam pasir vertikal dengan garis horizontal di atas dan bawah.',
  },
  D: {
    en: 'Figure D: large square with an inner L-shaped corner in the lower left and two diagonal lines.',
    id: 'Gambar D: persegi besar dengan sudut-L di bawah kiri dan dua garis diagonal.',
  },
  E: {
    en: 'Figure E: two concentric circles with a diagonal line and a small triangle at one end.',
    id: 'Gambar E: dua lingkaran konsentris dengan garis diagonal dan segitiga kecil di salah satu ujung.',
  },
}

// ─── named export (used by CHOICE_RENDERERS) ─────────────────────────────────

export function EulerFiguresSIMOC21G1Q15Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const Renderer = FIGURE[label]
  const aria = ARIA[label]
  if (!Renderer || !aria) return <span>{choice?.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.id}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Renderer />
    </span>
  )
}

export default EulerFiguresSIMOC21G1Q15Option
