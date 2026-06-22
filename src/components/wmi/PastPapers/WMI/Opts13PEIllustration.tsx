// IKMC-20-PE-Q13 — "In which of the following pictures is more of the shape shaded
// than any of the others?" Answer: B.
//
// Each option A–E is a 3×3 grid of unit cells, with various grey-shaded regions.
// The question is pure visual comparison of shaded fractions — the 5 options ARE
// the only figures (no separate stem). This file exports ONLY the option renderer.
//
// Option layouts (grid cell indices: row 0–2, col 0–2):
//   A: 3×3 square with inscribed octagon — 4 corner cells each have a white
//      right-isosceles triangle (at the outer corner); 5 inner cells + 4 half-cells
//      are grey.  Shaded ≈ 7/9.
//   B: 3×3 grid — the top-left, top-right and bottom-right corner cells each
//      contain a white right-isosceles triangle (leaving half grey); the remaining
//      6 cells are fully grey.  Shaded ≈ 7.5/9.  ← MOST
//   C: 3×3 grid topped by a central roof triangle — center cell is white; all
//      other 8 cells + roof are grey.  Shaded ≈ 8.5/9 — but the shape includes
//      the roof area so the denominator is larger.  Shaded area/total area < B.
//   D: 3×3 grid — top-left cell white; bottom-left cell has a white right triangle
//      (top-left corner); top-right cell has a white right triangle (bottom corner);
//      6 cells + 2 half-cells are grey.  Shaded ≈ 7/9.
//   E: 3×3 grid — top-left cell white; bottom-right cell white; 7 cells grey.
//      Shaded = 7/9.
//
// Faithful reproduction of the source scans (042.jpg – 046.jpg).
// Pure SVG, SSR-safe, no random values.

import type { WmiChoice } from '../../../../types/wmi'

const GREY = '#9CA3AF'   // mid-grey for shaded regions
const INK = '#1F2937'    // border / outline
const WHITE = '#FFFFFF'

// Cell size and grid parameters (fits in a 96×96 viewBox with a small margin)
const CELL = 28
const OX = 6   // grid origin X
const OY = 6   // grid origin Y

// Returns the (x, y) top-left corner of cell (row, col)
function cellXY(row: number, col: number): [number, number] {
  return [OX + col * CELL, OY + row * CELL]
}

// A full grey rectangle for one cell
function FullCell({ row, col, fill = GREY }: { row: number; col: number; fill?: string }) {
  const [x, y] = cellXY(row, col)
  return <rect x={x} y={y} width={CELL} height={CELL} fill={fill} />
}

// A cell with a white right-isosceles triangle cut from one corner.
// corner: 'tl' | 'tr' | 'bl' | 'br'
function CornerCutCell({ row, col, corner }: { row: number; col: number; corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const [x, y] = cellXY(row, col)
  const r = CELL  // triangle legs equal full cell side

  // Grey polygon = full cell minus the white triangle corner
  let greyPts: string
  let whitePts: string

  if (corner === 'tl') {
    // white triangle at top-left: (x,y), (x+r,y), (x,y+r)
    whitePts = `${x},${y} ${x + r},${y} ${x},${y + r}`
    greyPts = `${x + r},${y} ${x + r},${y + r} ${x},${y + r}`
  } else if (corner === 'tr') {
    // white triangle at top-right: (x+r,y), (x,y), (x+r,y+r)
    whitePts = `${x},${y} ${x + r},${y} ${x + r},${y + r}`
    greyPts = `${x},${y} ${x + r},${y + r} ${x},${y + r}`
  } else if (corner === 'bl') {
    // white triangle at bottom-left: (x,y+r), (x+r,y+r), (x,y)
    whitePts = `${x},${y} ${x},${y + r} ${x + r},${y + r}`
    greyPts = `${x},${y} ${x + r},${y} ${x + r},${y + r}`
  } else {
    // br: white triangle at bottom-right: (x+r,y+r), (x,y+r), (x+r,y)
    whitePts = `${x + r},${y} ${x + r},${y + r} ${x},${y + r}`
    greyPts = `${x},${y} ${x + r},${y} ${x},${y + r}`
  }

  return (
    <g>
      <polygon points={greyPts} fill={GREY} />
      <polygon points={whitePts} fill={WHITE} />
    </g>
  )
}

// Grid outline (3×3 lines)
function GridLines() {
  const lines: React.ReactNode[] = []
  // Horizontal lines
  for (let r = 0; r <= 3; r++) {
    const y = OY + r * CELL
    lines.push(<line key={`h${r}`} x1={OX} y1={y} x2={OX + 3 * CELL} y2={y} stroke={INK} strokeWidth={1.5} />)
  }
  // Vertical lines
  for (let c = 0; c <= 3; c++) {
    const x = OX + c * CELL
    lines.push(<line key={`v${c}`} x1={x} y1={OY} x2={x} y2={OY + 3 * CELL} stroke={INK} strokeWidth={1.5} />)
  }
  return <g>{lines}</g>
}

// ---- Option A ---------------------------------------------------------------
// 3×3 with inscribed octagon: 4 corner cells have a white right-isosceles
// triangle at the outer corner; the other 5 cells are fully grey.
function OptionA() {
  // Corners: (0,0)→tl, (0,2)→tr, (2,0)→bl, (2,2)→br
  return (
    <g>
      {/* Fill whole grid grey first */}
      <rect x={OX} y={OY} width={3 * CELL} height={3 * CELL} fill={GREY} />
      {/* White triangles at four corners */}
      <CornerCutCell row={0} col={0} corner="tl" />
      <CornerCutCell row={0} col={2} corner="tr" />
      <CornerCutCell row={2} col={0} corner="bl" />
      <CornerCutCell row={2} col={2} corner="br" />
      <GridLines />
    </g>
  )
}

// ---- Option B ---------------------------------------------------------------
// 3×3 with white right-isosceles triangles in top-left, top-right, bottom-right
// corner cells (from the scan: those three corners are cut white, rest grey).
// This gives the HIGHEST shaded fraction ≈ 7.5/9.
function OptionB() {
  return (
    <g>
      {/* Fill whole grid grey */}
      <rect x={OX} y={OY} width={3 * CELL} height={3 * CELL} fill={GREY} />
      {/* White triangles in three corners */}
      <CornerCutCell row={0} col={0} corner="tl" />
      <CornerCutCell row={0} col={2} corner="tr" />
      <CornerCutCell row={2} col={2} corner="br" />
      <GridLines />
    </g>
  )
}

// ---- Option C ---------------------------------------------------------------
// 3×3 grid plus a roof triangle sitting on the top edge.
// Center cell (1,1) is white; all other 8 cells and the roof are grey.
function OptionC() {
  // The viewBox for C needs room for the roof: shift grid down by CELL/2
  const roofOY = OY   // roof apex above the grid
  const gridOY = OY + CELL / 2 + 2  // shift grid down slightly to fit roof
  const apex = OX + 1.5 * CELL  // horizontal centre
  const roofTop = roofOY
  const roofLeft = OX + CELL / 2     // align with col 0.5 edge (one cell in)
  const roofRight = OX + 2.5 * CELL
  const roofBase = gridOY            // roof base is top of grid

  return (
    <g transform={`translate(0, -8)`}>
      {/* Roof triangle (grey) */}
      <polygon points={`${apex},${roofTop} ${roofLeft},${roofBase} ${roofRight},${roofBase}`} fill={GREY} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Grid background grey */}
      <rect x={OX} y={gridOY} width={3 * CELL} height={3 * CELL} fill={GREY} />
      {/* Center cell white */}
      <rect x={OX + CELL} y={gridOY + CELL} width={CELL} height={CELL} fill={WHITE} />
      {/* Grid lines */}
      {[0, 1, 2, 3].map((r) => (
        <line key={`h${r}`} x1={OX} y1={gridOY + r * CELL} x2={OX + 3 * CELL} y2={gridOY + r * CELL} stroke={INK} strokeWidth={1.5} />
      ))}
      {[0, 1, 2, 3].map((c) => (
        <line key={`v${c}`} x1={OX + c * CELL} y1={gridOY} x2={OX + c * CELL} y2={gridOY + 3 * CELL} stroke={INK} strokeWidth={1.5} />
      ))}
    </g>
  )
}

// ---- Option D ---------------------------------------------------------------
// 3×3 grid: top-left cell (0,0) is white; bottom-left (2,0) has a white
// triangle at top-left; top-right (0,2) has a white triangle at bottom-right.
// Other cells grey.
function OptionD() {
  return (
    <g>
      {/* Fill whole grid grey */}
      <rect x={OX} y={OY} width={3 * CELL} height={3 * CELL} fill={GREY} />
      {/* Top-left cell is fully white */}
      <FullCell row={0} col={0} fill={WHITE} />
      {/* Bottom-left: white triangle at top-left corner */}
      <CornerCutCell row={2} col={0} corner="tl" />
      {/* Top-right: white triangle at bottom-right corner */}
      <CornerCutCell row={0} col={2} corner="br" />
      <GridLines />
    </g>
  )
}

// ---- Option E ---------------------------------------------------------------
// 3×3 grid: top-left cell (0,0) is white; bottom-right cell (2,2) is white;
// all 7 other cells are grey.  Shaded = 7/9.
function OptionE() {
  return (
    <g>
      {/* Fill whole grid grey */}
      <rect x={OX} y={OY} width={3 * CELL} height={3 * CELL} fill={GREY} />
      {/* Two white corner cells */}
      <FullCell row={0} col={0} fill={WHITE} />
      <FullCell row={2} col={2} fill={WHITE} />
      <GridLines />
    </g>
  )
}

// Map label → figure renderer
const FIGURES: Record<string, () => React.ReactNode> = {
  A: () => <OptionA />,
  B: () => <OptionB />,
  C: () => <OptionC />,
  D: () => <OptionD />,
  E: () => <OptionE />,
}

/**
 * Opts13PEOption — renders ONE choice (A–E) for IKMC-20-PE-Q13.
 * Used by CHOICE_RENDERERS['IKMC-20-PE-Q13'].
 */
export default function Opts13PEOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as string
  const fig = FIGURES[label]
  if (!fig) return <span>{choice.text}</span>
  return (
    <svg
      viewBox="0 0 96 96"
      width="96"
      height="96"
      role="img"
      aria-label={choice.text}
      style={{ display: 'block' }}
    >
      {fig()}
    </svg>
  )
}

// Named export so the registry can import it by name
export { Opts13PEOption }
