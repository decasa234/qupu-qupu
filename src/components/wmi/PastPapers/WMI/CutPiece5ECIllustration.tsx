/**
 * IKMC-19-EC-Q5 — "Karina cuts out one piece of this grid. Which piece is the
 * one she cut?" (answer A).
 *
 * The stem figure is a 4×4 grid of card-suit symbols:
 *   Row 0: club (♣) | star (★) | club (♣) | heart (♥)
 *   Row 1: diamond (♦) | club (♣) | heart (♥) | spade (♠)
 *   Row 2: diamond (♦) | star (★) | club (♣) | spade (♠)
 *   Row 3: diamond (♦) | club (♣) | spade (♠) | heart (♥)
 *
 * The five answer options are 1×2 horizontal dominoes taken from this grid.
 * Option A (★ + ♣) matches row 2, columns 1–2 exactly → answer A.
 *
 * Co-exports CutPiece5ECOption (used by CHOICE_RENDERERS) which renders one
 * 1×2 domino for choices A–E, drawn from the same symbol table so they
 * cannot drift from the source.
 *
 * Card suits rendered as Unicode glyphs in SVG <text> elements.
 * Red suits (heart, diamond): #DC2626. Dark suits (club, spade, star): #1F2937.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ──────────────────────────────────────────────────────────

const INK = '#1F2937'
const CELL_BG = '#FFFFFF'
const CELL_BORDER = '#4B5563'
const SUIT_DARK = '#1F2937'   // club, spade, star
const SUIT_RED = '#DC2626'    // heart, diamond

// ─── grid data ──────────────────────────────────────────────────────────────

/** Symbol ids used in the grid. */
export type SymbolId = 'club' | 'star' | 'heart' | 'diamond' | 'spade'

/** The 4×4 grid, row-major, rows 0–3, cols 0–3. */
export const GRID: SymbolId[][] = [
  ['club',    'star',  'club',  'heart'],
  ['diamond', 'club',  'heart', 'spade'],
  ['diamond', 'star',  'club',  'spade'],
  ['diamond', 'club',  'spade', 'heart'],
]

/** The pairs shown in each option choice A–E (left symbol, right symbol). */
export const OPTION_PAIR: Record<string, [SymbolId, SymbolId]> = {
  A: ['star',  'club'],    // ← correct cut: row 2, cols 1–2
  B: ['star',  'spade'],   // wrong — spade never right of star in same row
  C: ['star',  'star'],    // wrong — same symbol never adjacent
  D: ['heart', 'diamond'], // wrong — heart not immediately left of diamond
  E: ['heart', 'heart'],   // wrong — same symbol never adjacent
}

// ─── SVG dimensions ─────────────────────────────────────────────────────────

export const CELL = 44     // px per grid cell
export const GRID_COLS = 4
export const GRID_ROWS = 4
export const PAD = 10

export const GRID_VIEW_W = PAD * 2 + GRID_COLS * CELL
export const GRID_VIEW_H = PAD * 2 + GRID_ROWS * CELL

// ─── suit glyph map ─────────────────────────────────────────────────────────

const SUIT_GLYPH: Record<SymbolId, string> = {
  club:    '♣',  // ♣
  star:    '★',  // ★
  heart:   '♥',  // ♥
  diamond: '♦',  // ♦
  spade:   '♠',  // ♠
}

function suitColor(id: SymbolId): string {
  return id === 'heart' || id === 'diamond' ? SUIT_RED : SUIT_DARK
}

// ─── symbol primitives ──────────────────────────────────────────────────────

/**
 * Draws one card-suit symbol centred in a (size × size) square whose
 * top-left is (x, y). Uses a Unicode glyph in an SVG <text> element.
 */
export function Symbol({ id, x, y, size = CELL }: { id: SymbolId; x: number; y: number; size?: number }) {
  const cx = x + size / 2
  const cy = y + size / 2
  const fontSize = size * 0.65

  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontFamily="Georgia, serif"
      fill={suitColor(id)}
      style={{ userSelect: 'none', pointerEvents: 'none' }}
    >
      {SUIT_GLYPH[id]}
    </text>
  )
}

// ─── boxed cell ─────────────────────────────────────────────────────────────

/** One grid cell: white box with a suit symbol centred inside. */
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

// ─── the 4×4 stem grid ──────────────────────────────────────────────────────

/**
 * SymbolGrid — the full 4×4 stem figure, top-left at (x, y).
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

export default function CutPiece5ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 4 by 4 grid of card-suit symbols. ' +
        'Row 1: club, star, club, heart. ' +
        'Row 2: diamond, club, heart, spade. ' +
        'Row 3: diamond, star, club, spade. ' +
        'Row 4: diamond, club, spade, heart.'
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
  A: { en: 'Option A: star and club',    id: 'Pilihan A: bintang dan keriting' },
  B: { en: 'Option B: star and spade',   id: 'Pilihan B: bintang dan sekop' },
  C: { en: 'Option C: star and star',    id: 'Pilihan C: bintang dan bintang' },
  D: { en: 'Option D: heart and diamond', id: 'Pilihan D: hati dan berlian' },
  E: { en: 'Option E: heart and heart',  id: 'Pilihan E: hati dan hati' },
}

/**
 * CutPiece5ECOption — renders one A–E answer choice as a 1×2 domino picture,
 * matching the source paper exactly. Used as a `CHOICE_RENDERERS` entry.
 * Binds to choice.label (not choice.text) so drift is impossible.
 */
export function CutPiece5ECOption({ choice }: { choice: WmiChoice }) {
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
