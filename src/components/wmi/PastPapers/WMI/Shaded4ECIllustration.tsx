// IKMC-20-EC-Q4 — "Which figure has the largest part shaded?"
//
// This is an OPTIONS-ONLY question: the five A–E choices ARE the shaded-grid
// figures. There is NO separate stem illustration (it would duplicate the options).
//
// Each option is a 4×4 square grid with some cells fully shaded (green),
// some unshaded (white), and some half-shaded (diagonal triangles).
//
// Shaded fractions (out of 16 cells):
//   A — 14  / 16 = 87.5 %  ← answer (most shaded)
//   B — 13.5/ 16 = 84.4 %
//   C — 12.5/ 16 = 78.1 %
//   D — 11.5/ 16 = 71.9 %
//   E — 11  / 16 = 68.75%
//
// Co-exports Shaded4ECOption (A–E choice renderer for CHOICE_RENDERERS).
// Pure SVG, no raster, no random, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const GREEN   = '#3A8A3A'   // shaded fill
const WHITE   = '#FFFFFF'   // unshaded fill
const STROKE  = '#1a1a1a'   // grid line colour
const SW      = 1.5         // stroke-width

// ---------------------------------------------------------------------------
// Grid geometry
// ---------------------------------------------------------------------------

/** SVG canvas size for one option grid */
const CELL  = 20   // cell side length in px
const COLS  = 4
const ROWS  = 4
const W     = COLS * CELL   // 80
const H     = ROWS * CELL   // 80

// ---------------------------------------------------------------------------
// Cell descriptor — describes how one grid cell is painted
// ---------------------------------------------------------------------------

/** 'full' = entire cell shaded; 'empty' = unshaded; 'tri-*' = half-diagonal */
type CellKind =
  | 'full'          // fully shaded
  | 'empty'         // fully unshaded
  | 'tri-bl'        // lower-left triangle shaded (upper-right white)
  | 'tri-br'        // lower-right triangle shaded (upper-left white)
  | 'tri-tl'        // upper-left triangle shaded (lower-right white)
  | 'tri-tr'        // upper-right triangle shaded (lower-left white)

/** Render a single grid cell at (cx, cy) using the given kind. */
function GridCell({ cx, cy, kind }: { cx: number; cy: number; kind: CellKind }) {
  const x = cx * CELL
  const y = cy * CELL
  const r = x + CELL   // right edge
  const b = y + CELL   // bottom edge

  if (kind === 'full') {
    return <rect x={x} y={y} width={CELL} height={CELL} fill={GREEN} />
  }
  if (kind === 'empty') {
    return <rect x={x} y={y} width={CELL} height={CELL} fill={WHITE} />
  }

  // Half-diagonal cells: two triangles
  let shadedPoly = ''
  let unshadedPoly = ''

  switch (kind) {
    case 'tri-tl':
      // upper-left triangle is shaded; diagonal goes top-right → bottom-left
      shadedPoly   = `${x},${y} ${r},${y} ${x},${b}`
      unshadedPoly = `${r},${y} ${r},${b} ${x},${b}`
      break
    case 'tri-br':
      // lower-right triangle is shaded; diagonal goes top-right → bottom-left
      shadedPoly   = `${r},${y} ${r},${b} ${x},${b}`
      unshadedPoly = `${x},${y} ${r},${y} ${x},${b}`
      break
    case 'tri-tr':
      // upper-right triangle is shaded; diagonal goes top-left → bottom-right
      shadedPoly   = `${x},${y} ${r},${y} ${r},${b}`
      unshadedPoly = `${x},${y} ${r},${b} ${x},${b}`
      break
    case 'tri-bl':
      // lower-left triangle is shaded; diagonal goes top-left → bottom-right
      shadedPoly   = `${x},${y} ${x},${b} ${r},${b}`
      unshadedPoly = `${x},${y} ${r},${y} ${r},${b}`
      break
  }

  return (
    <g>
      <polygon points={shadedPoly}   fill={GREEN} />
      <polygon points={unshadedPoly} fill={WHITE} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Option grid specs — row-major, [row][col], 0-indexed
//
// Verified against source image 017.jpg:
//
//   A  (shaded = 14/16):
//     Row 0: tri-br  full  full  full
//     Row 1: full    full  empty full
//     Row 2: full    full  full  full
//     Row 3: full    full  full  tri-tl
//
//   B  (shaded = 13.5/16):
//     Row 0: full  full  full  empty
//     Row 1: full  full  full  empty
//     Row 2: full  full  full  full
//     Row 3: tri-tr full  full  full
//
//   C  (shaded = 12.5/16):
//     Row 0: tri-br full  full  empty
//     Row 1: full   full  full  full
//     Row 2: full   full  full  full
//     Row 3: full   full  tri-tl full
//
//   D  (shaded = 11.5/16):
//     Row 0: empty  full  full  empty
//     Row 1: full   full  full  full
//     Row 2: full   full  full  full
//     Row 3: tri-tr full  empty empty
//
//   E  (shaded = 11/16):
//     Row 0: tri-tl tri-tr full  full
//     Row 1: full   tri-bl full  full
//     Row 2: tri-tr full   full  full
//     Row 3: tri-tl full   tri-br full
// ---------------------------------------------------------------------------

type Grid = CellKind[][]

// eslint-disable-next-line react-refresh/only-export-components
export const SHADED4_GRIDS: Record<string, Grid> = {
  A: [
    ['tri-br', 'full',  'full',  'full' ],
    ['full',   'full',  'empty', 'full' ],
    ['full',   'full',  'full',  'full' ],
    ['full',   'full',  'full',  'tri-tl'],
  ],
  B: [
    ['full',   'full',  'full',  'empty'],
    ['full',   'full',  'full',  'empty'],
    ['full',   'full',  'full',  'full' ],
    ['tri-tr', 'full',  'full',  'full' ],
  ],
  C: [
    ['tri-br', 'full',  'full',  'empty'],
    ['full',   'full',  'full',  'full' ],
    ['full',   'full',  'full',  'full' ],
    ['full',   'full',  'tri-tl','full' ],
  ],
  D: [
    ['empty',  'full',  'full',  'empty'],
    ['full',   'full',  'full',  'full' ],
    ['full',   'full',  'full',  'full' ],
    ['tri-tr', 'full',  'empty', 'empty'],
  ],
  E: [
    ['tri-tl', 'tri-tr','full',  'full' ],
    ['full',   'tri-bl','full',  'full' ],
    ['tri-tr', 'full',  'full',  'full' ],
    ['tri-tl', 'full',  'tri-br','full' ],
  ],
}

// ---------------------------------------------------------------------------
// Shaded4ECGrid — renders one grid option as SVG
// ---------------------------------------------------------------------------

interface Shaded4ECGridProps {
  grid: Grid
  /** Rendered width in px; height scales to maintain 1:1 aspect (default 80) */
  size?: number
}

export function Shaded4ECGrid({ grid, size = 80 }: Shaded4ECGridProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width={W} height={H} fill={WHITE} />

      {/* Cell fills */}
      {grid.map((row, ry) =>
        row.map((kind, cx) => (
          <GridCell key={`${ry}-${cx}`} cx={cx} cy={ry} kind={kind} />
        )),
      )}

      {/* Grid lines (drawn on top so they overlay the fills) */}
      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * CELL} y1={0}
          x2={i * CELL} y2={H}
          stroke={STROKE} strokeWidth={SW}
        />
      ))}
      {Array.from({ length: ROWS + 1 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={0} y1={i * CELL}
          x2={W} y2={i * CELL}
          stroke={STROKE} strokeWidth={SW}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shaded4ECOption — renders ONE A/B/C/D/E choice as its shaded grid.
// Registered in CHOICE_RENDERERS for IKMC-20-EC-Q4.
// ---------------------------------------------------------------------------

const ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Figure A: 4x4 grid with 14 out of 16 cells shaded green (87.5%)',
    id: 'Gambar A: kisi 4x4 dengan 14 dari 16 sel diarsir hijau (87,5%)',
  },
  B: {
    en: 'Figure B: 4x4 grid with 13.5 out of 16 cells shaded green (84.4%)',
    id: 'Gambar B: kisi 4x4 dengan 13,5 dari 16 sel diarsir hijau (84,4%)',
  },
  C: {
    en: 'Figure C: 4x4 grid with 12.5 out of 16 cells shaded green (78.1%)',
    id: 'Gambar C: kisi 4x4 dengan 12,5 dari 16 sel diarsir hijau (78,1%)',
  },
  D: {
    en: 'Figure D: 4x4 grid with 11.5 out of 16 cells shaded green (71.9%)',
    id: 'Gambar D: kisi 4x4 dengan 11,5 dari 16 sel diarsir hijau (71,9%)',
  },
  E: {
    en: 'Figure E: 4x4 grid with 11 out of 16 cells shaded green (68.8%)',
    id: 'Gambar E: kisi 4x4 dengan 11 dari 16 sel diarsir hijau (68,8%)',
  },
}

export function Shaded4ECOption({ choice }: { choice: WmiChoice }) {
  const grid = SHADED4_GRIDS[choice.label]
  if (!grid) return <span>{choice.text}</span>

  const aria = ARIA[choice.label] ?? { en: `Figure ${choice.label}`, id: `Gambar ${choice.label}` }

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Shaded4ECGrid grid={grid} size={76} />
    </span>
  )
}
