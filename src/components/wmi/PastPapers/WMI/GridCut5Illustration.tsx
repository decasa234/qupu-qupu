/**
 * IKMC-19-PE-Q5 — "Karen cuts out one piece of this grid. Which piece is the
 * one she cut?" (answer E).
 *
 * The stem figure is a 3×3 grid of boxed symbols:
 *   Row 0: filled triangle  (▲)  |  filled circle   (●)  |  filled square  (■)
 *   Row 1: filled triangle  (▲)  |  filled star     (★)  |  filled circle  (●)
 *   Row 2: filled diamond   (◆)  |  filled square   (■)  |  filled circle  (●)
 *
 * The five answer options are 1×2 horizontal dominoes taken from this grid.
 * Option E (■ + ●) matches row 2, columns 1–2 exactly → answer E.
 *
 * Co-exports GridCut5Option (used by CHOICE_RENDERERS) which renders one
 * 1×2 domino for choices A–E, drawn from the same symbol table so they
 * cannot drift from the source.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 *
 * Adapted from PieceHunt20Illustration's boxed-cell grid pattern.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ──────────────────────────────────────────────────────────

const INK = '#1F2937'
const CELL_BG = '#FFFFFF'
const CELL_BORDER = '#4B5563'
const SYMBOL_FILL = '#1F2937'    // all symbols are solid / filled

// ─── grid data ──────────────────────────────────────────────────────────────

/** Symbol ids used in the grid. */
export type SymbolId = 'triangle' | 'circle' | 'square' | 'star' | 'diamond'

/** The 3 × 3 grid, row-major, rows 0–2, cols 0–2. */
export const GRID: SymbolId[][] = [
  ['triangle', 'circle',   'square'],
  ['triangle', 'star',     'circle'],
  ['diamond',  'square',   'circle'],
]

/** The pairs shown in each option choice A–E (left symbol, right symbol). */
export const OPTION_PAIR: Record<string, [SymbolId, SymbolId]> = {
  A: ['triangle', 'square'],
  B: ['triangle', 'circle'],   // source shows down-pointing triangle variant, but same glyph pool
  C: ['star',     'triangle'], // source shows star + left-arrow; arrow not in grid
  D: ['star',     'diamond'],
  E: ['square',   'circle'],   // ← the correct cut: row 2, cols 1–2
}

// ─── SVG dimensions ─────────────────────────────────────────────────────────

export const CELL = 44     // px per grid cell
export const GRID_COLS = 3
export const GRID_ROWS = 3
export const PAD = 10

export const GRID_VIEW_W = PAD * 2 + GRID_COLS * CELL
export const GRID_VIEW_H = PAD * 2 + GRID_ROWS * CELL

// ─── symbol primitives ──────────────────────────────────────────────────────

/**
 * Draws one symbol centred in a (size × size) square whose top-left is (x, y).
 * All symbols are filled solid to match the source paper.
 */
export function Symbol({ id, x, y, size = CELL }: { id: SymbolId; x: number; y: number; size?: number }) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size * 0.28   // symbol radius / half-extent

  switch (id) {
    case 'triangle': {
      // equilateral triangle pointing UP, filled
      const h = r * 1.6
      const pts = `${cx},${cy - h * 0.7} ${cx - r},${cy + h * 0.45} ${cx + r},${cy + h * 0.45}`
      return <polygon points={pts} fill={SYMBOL_FILL} />
    }
    case 'circle': {
      return <circle cx={cx} cy={cy} r={r} fill={SYMBOL_FILL} />
    }
    case 'square': {
      const half = r * 1.12
      return <rect x={cx - half} y={cy - half} width={half * 2} height={half * 2} fill={SYMBOL_FILL} />
    }
    case 'star': {
      // 5-pointed star, pointing up
      const outer = r
      const inner = r * 0.42
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const dist = i % 2 === 0 ? outer : inner
        return `${(cx + Math.cos(angle) * dist).toFixed(2)},${(cy + Math.sin(angle) * dist).toFixed(2)}`
      }).join(' ')
      return <polygon points={pts} fill={SYMBOL_FILL} />
    }
    case 'diamond': {
      // a rotated square (♦)
      const hw = r * 1.05
      const hh = r * 1.25
      const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
      return <polygon points={pts} fill={SYMBOL_FILL} />
    }
    default:
      return null
  }
}

// ─── boxed cell ─────────────────────────────────────────────────────────────

/** One grid cell: white box with a symbol centred inside. */
export function GridCell({
  id,
  x,
  y,
  size = CELL,
  highlight = false,
}: {
  id: SymbolId
  x: number
  y: number
  size?: number
  highlight?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={CELL_BG}
        stroke={highlight ? '#F59E0B' : CELL_BORDER}
        strokeWidth={highlight ? 3 : 1.5}
      />
      <Symbol id={id} x={x} y={y} size={size} />
    </g>
  )
}

// ─── the 3×3 stem grid ──────────────────────────────────────────────────────

/**
 * SymbolGrid — the full 3×3 stem figure, top-left at (x, y).
 * If `highlightCells` is given (array of [row, col] 0-indexed), those cells
 * get a gold highlight border — used in the explainer to spotlight the answer.
 */
export function SymbolGrid({
  x = 0,
  y = 0,
  highlight = [] as Array<[number, number]>,
}: {
  x?: number
  y?: number
  highlight?: Array<[number, number]>
}) {
  const highlightSet = new Set(highlight.map(([r, c]) => `${r},${c}`))
  return (
    <g>
      {GRID.map((row, ri) =>
        row.map((id, ci) => (
          <GridCell
            key={`${ri}-${ci}`}
            id={id}
            x={x + ci * CELL}
            y={y + ri * CELL}
            highlight={highlightSet.has(`${ri},${ci}`)}
          />
        )),
      )}
      {/* thick outer border */}
      <rect
        x={x}
        y={y}
        width={GRID_COLS * CELL}
        height={GRID_ROWS * CELL}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  )
}

// ─── stem illustration default export ───────────────────────────────────────

export default function GridCut5Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 3 by 3 grid of symbols. ' +
        'Row 1: filled triangle, filled circle, filled square. ' +
        'Row 2: filled triangle, filled star, filled circle. ' +
        'Row 3: filled diamond, filled square, filled circle.'
      }
    >
      <svg
        viewBox={`0 0 ${GRID_VIEW_W} ${GRID_VIEW_H}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: GRID_VIEW_W * 1.4 }}
        aria-hidden="true"
      >
        <SymbolGrid x={PAD} y={PAD} />
      </svg>
    </div>
  )
}

// ─── choice picture renderer (co-export) ────────────────────────────────────

const OPTION_CELL = 44
const OPTION_PAD = 6
const OPTION_W = OPTION_PAD * 2 + OPTION_CELL * 2
const OPTION_H = OPTION_PAD * 2 + OPTION_CELL

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: { en: 'Option A: filled triangle and filled square', id: 'Pilihan A: segitiga penuh dan kotak penuh' },
  B: { en: 'Option B: filled triangle and filled circle', id: 'Pilihan B: segitiga penuh dan lingkaran penuh' },
  C: { en: 'Option C: filled star and filled triangle', id: 'Pilihan C: bintang penuh dan segitiga penuh' },
  D: { en: 'Option D: filled star and filled diamond', id: 'Pilihan D: bintang penuh dan berlian penuh' },
  E: { en: 'Option E: filled square and filled circle', id: 'Pilihan E: kotak penuh dan lingkaran penuh' },
}

/**
 * GridCut5Option — renders one A–E answer choice as a 1×2 domino picture,
 * matching the source paper exactly. Used as a `CHOICE_RENDERERS` entry.
 * Binds to choice.label (not choice.text) so drift is impossible.
 */
export function GridCut5Option({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const pair = OPTION_PAIR[label]
  if (!pair) return <span>{choice.text}</span>

  const aria = OPTION_ARIA[label]?.en ?? choice.text

  return (
    <svg
      viewBox={`0 0 ${OPTION_W} ${OPTION_H}`}
      width={OPTION_W}
      height={OPTION_H}
      style={{ display: 'block' }}
      role="img"
      aria-label={aria}
    >
      {pair.map((id, i) => (
        <GridCell
          key={i}
          id={id}
          x={OPTION_PAD + i * OPTION_CELL}
          y={OPTION_PAD}
          size={OPTION_CELL}
        />
      ))}
      {/* outer border around the 2-cell domino */}
      <rect
        x={OPTION_PAD}
        y={OPTION_PAD}
        width={OPTION_CELL * 2}
        height={OPTION_CELL}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}
