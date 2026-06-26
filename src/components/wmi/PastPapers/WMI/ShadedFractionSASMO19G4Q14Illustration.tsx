// SASMO 2019 Grade 4 Q14 — "Which figure has the largest shaded fraction of its area?"
//
// The A–E choices ARE the figures; there is no separate stem image.
// Default export is a stub (never used — no VISUALS illustration key registered).
// Named export ShadedFractionSASMO19G4Q14Option is the CHOICE_RENDERERS entry.
//
// Shaded fractions:
//   A — cross shape:               5/8  (top cell full + 3 half-triangles)
//   B — rectangle, 4×2 tri grid:   1/2  (alternating right-triangles)
//   C — square, 3×3 tri grid:      1/2  (alternating right-triangles)
//   D — square, 4×4 framed grid:   3/4  ← ANSWER (largest)
//   E — rectangle with large tri:  1/2  (single right-triangle of rectangle)
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

const SHADE  = '#9CA3AF'   // gray-400
const STROKE = '#374151'   // gray-700
const BG     = '#FFFFFF'
const SW     = 1           // stroke-width

// ---------------------------------------------------------------------------
// Figure A — cross/plus shape   fraction = 5/8
//   ViewBox 96×64.  Cell = 32.
//   Shape: one 32×32 center-top cell + three 32×32 bottom cells.
//   Shaded: top full, each bottom cell one right-triangle (alternating corners).
// ---------------------------------------------------------------------------
function FigureA() {
  const C = 32
  return (
    <svg viewBox={`0 0 ${C * 3} ${C * 2}`} width={120} height={80} aria-hidden style={{ display: 'block' }}>
      {/* white background for entire cross area */}
      <rect x={0}   y={C}   width={C * 3} height={C} fill={BG} />
      <rect x={C}   y={0}   width={C}     height={C} fill={BG} />

      {/* shaded regions */}
      {/* top cell: full gray */}
      <rect x={C} y={0} width={C} height={C} fill={SHADE} />

      {/* bottom-left: lower-left right-triangle (diagonal TL→BR, shade BL) */}
      <polygon points={`0,${C} 0,${C*2} ${C},${C*2}`} fill={SHADE} />

      {/* bottom-center: upper-right right-triangle (diagonal TL→BR, shade UR) */}
      <polygon points={`${C},${C} ${C*2},${C} ${C*2},${C*2}`} fill={SHADE} />

      {/* bottom-right: lower-left right-triangle */}
      <polygon points={`${C*2},${C} ${C*2},${C*2} ${C*3},${C*2}`} fill={SHADE} />

      {/* grid lines */}
      {/* outer cross outline */}
      <rect x={0}   y={C}   width={C * 3} height={C} fill="none" stroke={STROKE} strokeWidth={SW} />
      <rect x={C}   y={0}   width={C}     height={C} fill="none" stroke={STROKE} strokeWidth={SW} />
      {/* internal dividers in bottom row */}
      <line x1={C}   y1={C} x2={C}   y2={C*2} stroke={STROKE} strokeWidth={SW} />
      <line x1={C*2} y1={C} x2={C*2} y2={C*2} stroke={STROKE} strokeWidth={SW} />
      {/* diagonals in bottom cells */}
      <line x1={0}   y1={C}   x2={C}   y2={C*2} stroke={STROKE} strokeWidth={SW} />
      <line x1={C}   y1={C}   x2={C*2} y2={C*2} stroke={STROKE} strokeWidth={SW} />
      <line x1={C*2} y1={C}   x2={C*3} y2={C*2} stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Figure B — 4×2 rectangle, alternating diagonal triangles   fraction = 1/2
//   ViewBox 128×64.  Cell = 32.
//   Odd (col+row) cells: shade upper-left tri; even cells: shade lower-right tri.
// ---------------------------------------------------------------------------
function FigureB() {
  const C = 32
  const COLS = 4
  const ROWS = 2
  const W = C * COLS
  const H = C * ROWS

  const tris: JSX.Element[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * C
      const y = r * C
      const shadeUL = (c + r) % 2 === 0
      const pts = shadeUL
        ? `${x},${y} ${x+C},${y} ${x},${y+C}`           // upper-left tri
        : `${x+C},${y} ${x+C},${y+C} ${x},${y+C}`       // lower-right tri
      tris.push(<polygon key={`${c}-${r}`} points={pts} fill={SHADE} />)
    }
  }

  const lines: JSX.Element[] = []
  for (let c = 0; c <= COLS; c++) {
    lines.push(<line key={`v${c}`} x1={c*C} y1={0} x2={c*C} y2={H} stroke={STROKE} strokeWidth={SW} />)
  }
  for (let r = 0; r <= ROWS; r++) {
    lines.push(<line key={`h${r}`} x1={0} y1={r*C} x2={W} y2={r*C} stroke={STROKE} strokeWidth={SW} />)
  }
  // diagonals
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * C
      const y = r * C
      lines.push(<line key={`d${c}-${r}`} x1={x} y1={y} x2={x+C} y2={y+C} stroke={STROKE} strokeWidth={SW} />)
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={128} height={64} aria-hidden style={{ display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} fill={BG} />
      {tris}
      {lines}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Figure C — 3×3 square, alternating diagonal triangles   fraction = 1/2
//   ViewBox 90×90.  Cell = 30.
// ---------------------------------------------------------------------------
function FigureC() {
  const C = 30
  const N = 3
  const S = C * N

  const tris: JSX.Element[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = c * C
      const y = r * C
      const shadeUL = (c + r) % 2 === 0
      const pts = shadeUL
        ? `${x},${y} ${x+C},${y} ${x},${y+C}`
        : `${x+C},${y} ${x+C},${y+C} ${x},${y+C}`
      tris.push(<polygon key={`${c}-${r}`} points={pts} fill={SHADE} />)
    }
  }

  const lines: JSX.Element[] = []
  for (let i = 0; i <= N; i++) {
    lines.push(<line key={`v${i}`} x1={i*C} y1={0} x2={i*C} y2={S} stroke={STROKE} strokeWidth={SW} />)
    lines.push(<line key={`h${i}`} x1={0} y1={i*C} x2={S} y2={i*C} stroke={STROKE} strokeWidth={SW} />)
  }
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = c * C
      const y = r * C
      lines.push(<line key={`d${c}-${r}`} x1={x} y1={y} x2={x+C} y2={y+C} stroke={STROKE} strokeWidth={SW} />)
    }
  }

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={90} height={90} aria-hidden style={{ display: 'block' }}>
      <rect x={0} y={0} width={S} height={S} fill={BG} />
      {tris}
      {lines}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Figure D — 4×4 square, framed pattern   fraction = 3/4   ← ANSWER
//   ViewBox 96×96.  Cell C = 24.
//
//   Shading map (F=full, TL=top-left tri, BR=bottom-right tri, 0=empty):
//     Row 0: F  F  F  F    → 4 units
//     Row 1: F  TL TL F    → 1+0.5+0.5+1 = 3 units
//     Row 2: TL F  F  TL   → 0.5+1+1+0.5 = 3 units
//     Row 3: F  0  0  F    → 1+0+0+1     = 2 units
//     Total: 12/16 = 3/4
// ---------------------------------------------------------------------------
function FigureD() {
  const C = 24
  const N = 4
  const S = C * N

  type CellFill = 'F' | 'TL' | 'BR' | '0'
  const MAP: CellFill[][] = [
    ['F',  'F',  'F',  'F' ],
    ['F',  'TL', 'TL', 'F' ],
    ['TL', 'F',  'F',  'TL'],
    ['F',  '0',  '0',  'F' ],
  ]

  const fills: JSX.Element[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = c * C
      const y = r * C
      const kind = MAP[r][c]
      if (kind === 'F') {
        fills.push(<rect key={`${c}-${r}`} x={x} y={y} width={C} height={C} fill={SHADE} />)
      } else if (kind === 'TL') {
        fills.push(<polygon key={`${c}-${r}`} points={`${x},${y} ${x+C},${y} ${x},${y+C}`} fill={SHADE} />)
      } else if (kind === 'BR') {
        fills.push(<polygon key={`${c}-${r}`} points={`${x+C},${y} ${x+C},${y+C} ${x},${y+C}`} fill={SHADE} />)
      }
      // '0' = no fill
    }
  }

  const lines: JSX.Element[] = []
  for (let i = 0; i <= N; i++) {
    lines.push(<line key={`v${i}`} x1={i*C} y1={0} x2={i*C} y2={S} stroke={STROKE} strokeWidth={SW} />)
    lines.push(<line key={`h${i}`} x1={0} y1={i*C} x2={S} y2={i*C} stroke={STROKE} strokeWidth={SW} />)
  }
  // diagonals only in cells with TL or BR
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const k = MAP[r][c]
      if (k === 'TL' || k === 'BR') {
        const x = c * C
        const y = r * C
        lines.push(<line key={`d${c}-${r}`} x1={x+C} y1={y} x2={x} y2={y+C} stroke={STROKE} strokeWidth={SW} />)
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={96} height={96} aria-hidden style={{ display: 'block' }}>
      <rect x={0} y={0} width={S} height={S} fill={BG} />
      {fills}
      {lines}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Figure E — rectangle, one large right-pointing triangle   fraction = 1/2
//   The shaded triangle has vertices at BL, TL, and right-center of rectangle.
//   ViewBox 128×64 (4:2 ratio).
//   Triangle: (0,0)(0,64)(128,32) → area = 0.5 × 64 × 128 = 4096 = 1/2 of 128×64=8192
// ---------------------------------------------------------------------------
function FigureE() {
  const W = 140
  const H = 64
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={140} height={64} aria-hidden style={{ display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} fill={BG} stroke={STROKE} strokeWidth={SW} />
      <polygon points={`0,0 0,${H} ${W},${H/2}`} fill={SHADE} stroke={STROKE} strokeWidth={SW} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OPTION MAP
// ---------------------------------------------------------------------------
const FIGURE_MAP: Record<string, () => JSX.Element> = {
  A: FigureA,
  B: FigureB,
  C: FigureC,
  D: FigureD,
  E: FigureE,
}

const ARIA_MAP: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Figure A: cross shape, upper square shaded, each lower rectangle half shaded. Shaded fraction: 5/8.',
    id: 'Gambar A: bentuk palang, kotak atas diarsir penuh, setiap persegi panjang bawah setengah diarsir. Pecahan diarsir: 5/8.',
  },
  B: {
    en: 'Figure B: rectangle divided into triangular sections, half shaded. Shaded fraction: 1/2.',
    id: 'Gambar B: persegi panjang dibagi menjadi segitiga-segitiga, setengah diarsir. Pecahan diarsir: 1/2.',
  },
  C: {
    en: 'Figure C: square divided into triangular sections, half shaded. Shaded fraction: 1/2.',
    id: 'Gambar C: persegi dibagi menjadi segitiga-segitiga, setengah diarsir. Pecahan diarsir: 1/2.',
  },
  D: {
    en: 'Figure D: square with framed triangle pattern, three-quarters shaded. Shaded fraction: 3/4. This is the largest.',
    id: 'Gambar D: persegi dengan pola segitiga berbingkai, tiga perempat diarsir. Pecahan diarsir: 3/4. Ini yang terbesar.',
  },
  E: {
    en: 'Figure E: rectangle with one large triangle shaded. Shaded fraction: 1/2.',
    id: 'Gambar E: persegi panjang dengan satu segitiga besar diarsir. Pecahan diarsir: 1/2.',
  },
}

// ---------------------------------------------------------------------------
// Named export — CHOICE_RENDERERS entry
// ---------------------------------------------------------------------------

/** Renders one A/B/C/D/E shaded-fraction figure for SASMO-19-G4-Q14. */
export function ShadedFractionSASMO19G4Q14Option({ choice }: { choice: WmiChoice }) {
  const FigComp = FIGURE_MAP[choice.label]
  const aria = ARIA_MAP[choice.label]
  if (!FigComp) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <FigComp />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Default export — stub (no stem illustration; choices ARE the figures)
// ---------------------------------------------------------------------------
export default function ShadedFractionSASMO19G4Q14Illustration() {
  return null
}
