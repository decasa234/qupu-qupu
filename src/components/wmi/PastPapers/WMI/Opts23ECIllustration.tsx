/**
 * IKMC-23-EC-Q23 — "Which L-shaped piece was actually cut from Holger's grid?"
 * (answer C)
 *
 * Q23 is options-only: the A–E choices ARE the L-shaped grid pieces.
 * This file provides only the option renderer (Opts23ECOption) used by
 * CHOICE_RENDERERS — there is no default export.
 *
 * Grid: 10 columns, 5 rows, numbers 1–50.
 *   Row 1: 1–10, row 2: 11–20, row 3: 21–30, row 4: 31–40, row 5: 41–50.
 * Rule: right = +1, down = +10.
 *
 * Shape topology (shared by all options):
 *   [ top ]
 *   [mid-L][mid-R]
 *          [ bot ]
 *
 * Cell numbers per option:
 *   A: top=22, mid-L=32, mid-R=33, bot=44  — invalid (+11 at bottom)
 *   B: top=22, mid-L=33, mid-R=34, bot=44  — invalid (+11 at top)
 *   C: top=22, mid-L=32, mid-R=33, bot=43  — VALID ✓
 *   D: top=22, mid-L=33, mid-R=34, bot=45  — invalid (+11 at top)
 *   E: top=22, mid-L=32, mid-R=33, bot=42  — invalid (+9 at bottom)
 *
 * Pure SVG, no Math.random, no Date, SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ──────────────────────────────────────────────────────────

const CELL_FILL   = '#E5E7EB'   // grey-200 — cell background
const CELL_STROKE = '#374151'   // grey-700 — cell border
const LABEL_FILL  = '#111827'   // grey-900 — number text

// ─── cell size ───────────────────────────────────────────────────────────────

const CS = 24   // cell side length in px
const PAD = 3   // padding around the L-shape

// ─── option data ─────────────────────────────────────────────────────────────
//
// Each option is described as { top, midL, midR, bot } numbers.
// Layout in the SVG bounding box:
//   top    → col 0, row 0
//   mid-L  → col 0, row 1
//   mid-R  → col 1, row 1
//   bot    → col 1, row 2
//
// Bounding box: 2 cols × 3 rows

interface OptionCells {
  top: number
  midL: number
  midR: number
  bot: number
}

const OPT_DATA: Record<string, OptionCells> = {
  A: { top: 22, midL: 32, midR: 33, bot: 44 },
  B: { top: 22, midL: 33, midR: 34, bot: 44 },
  C: { top: 22, midL: 32, midR: 33, bot: 43 },
  D: { top: 22, midL: 33, midR: 34, bot: 45 },
  E: { top: 22, midL: 32, midR: 33, bot: 42 },
}

// ─── aria descriptions ────────────────────────────────────────────────────────

const OPT_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: L-shaped grid piece with cells 22, 32, 33, 44.',
    id: 'Pilihan A: potongan berbentuk L dengan sel 22, 32, 33, 44.',
  },
  B: {
    en: 'Option B: L-shaped grid piece with cells 22, 33, 34, 44.',
    id: 'Pilihan B: potongan berbentuk L dengan sel 22, 33, 34, 44.',
  },
  C: {
    en: 'Option C: L-shaped grid piece with cells 22, 32, 33, 43. This is the valid piece.',
    id: 'Pilihan C: potongan berbentuk L dengan sel 22, 32, 33, 43. Ini potongan yang valid.',
  },
  D: {
    en: 'Option D: L-shaped grid piece with cells 22, 33, 34, 45.',
    id: 'Pilihan D: potongan berbentuk L dengan sel 22, 33, 34, 45.',
  },
  E: {
    en: 'Option E: L-shaped grid piece with cells 22, 32, 33, 42.',
    id: 'Pilihan E: potongan berbentuk L dengan sel 22, 32, 33, 42.',
  },
}

// ─── LCell — a single numbered grid cell ─────────────────────────────────────

function LCell({ col, row, num }: { col: number; row: number; num: number }) {
  const x = PAD + col * CS
  const y = PAD + row * CS
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CS}
        height={CS}
        fill={CELL_FILL}
        stroke={CELL_STROKE}
        strokeWidth={1.5}
      />
      <text
        x={x + CS / 2}
        y={y + CS / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {num}
      </text>
    </g>
  )
}

// ─── LPiece — renders the 4-cell L-shape for one option ──────────────────────

function LPiece({ data }: { data: OptionCells }) {
  // SVG dimensions: 2 cols × 3 rows + padding on all sides
  const svgW = 2 * CS + PAD * 2
  const svgH = 3 * CS + PAD * 2

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* top — col 0, row 0 */}
      <LCell col={0} row={0} num={data.top} />
      {/* mid-L — col 0, row 1 */}
      <LCell col={0} row={1} num={data.midL} />
      {/* mid-R — col 1, row 1 */}
      <LCell col={1} row={1} num={data.midR} />
      {/* bot — col 1, row 2 */}
      <LCell col={1} row={2} num={data.bot} />
    </svg>
  )
}

// ─── Opts23ECOption — choice renderer ────────────────────────────────────────

/**
 * Opts23ECOption — renders one A/B/C/D/E L-shaped grid piece as an SVG figure.
 * Registered in CHOICE_RENDERERS for IKMC-23-EC-Q23.
 */
export function Opts23ECOption({ choice }: { choice: WmiChoice }) {
  const k = (choice.label ?? '').trim().toUpperCase()
  const data = OPT_DATA[k]
  const aria = OPT_ARIA[k]
  if (!data) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <LPiece data={data} />
    </span>
  )
}
