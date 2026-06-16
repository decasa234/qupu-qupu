/**
 * CHOICE renderer for WMI-25F1A-Q8 (2025 Grade 1 Final).
 *
 * Each option is a small fragment cut from a 1–100 hundreds chart (10 per row,
 * so RIGHT = +1 and DOWN = +10). Some squares show numbers; one square is the
 * queried blank ("?"). The question asks: in which fragment is 35 NOT the
 * number that belongs in the blank? The fragments are read straight from the
 * scanned option images and hardcoded by label so the drawn grid can never
 * drift from the printed paper:
 *
 *   A  24 / 34 _ _ _      → blank right of 34 = 35
 *   B  diagonal 53,_,_    → up-right of 53: 44 then 35   → blank = 35
 *   C  _ 25 / _ _         → below 25 = 35                → blank = 35
 *   D  _ _ _ / _ 46       → above-left of 46 (left=45, up=35) → blank = 35
 *   E  _ _ / _ 37         → 37, left=36, up=26           → blank = 26  (NOT 35)  ← ANSWER
 *
 * Why E: in A–D the queried square resolves to 35 via the +1 / +10 rule, but
 * in E the only chart-consistent value for the blank is 26 (two steps from 37:
 * left to 36, up to 26) — so 35 does NOT belong there. The static figure shows
 * the blank as "?", never the recovered value, so it does not reveal the answer.
 *
 * Pure render, deterministic, SSR-safe. Binds to the choice LABEL (A–E); the
 * option order is fixed in the source paper. Unknown labels fall back to text.
 */

import type { WmiChoice } from '../../../types/wmi'

type Label = 'A' | 'B' | 'C' | 'D' | 'E'

// A cell placed on a small local grid. `kind`:
//   'num'   — a printed number
//   'blank' — an empty square (part of the fragment, not queried)
//   'query' — the queried square drawn as "?"
type Cell = { c: number; r: number; kind: 'num' | 'blank' | 'query'; value?: number }

// Fragments recovered from the Paper A scans, one per label. Coordinates are
// (col, row) on a local grid; the renderer normalises them to the viewBox.
const FRAGMENTS: Record<Label, Cell[]> = {
  // (A) 24 alone on top, then 34 _ _ _ underneath. Queried = right of 34 = 35.
  A: [
    { c: 0, r: 0, kind: 'num', value: 24 },
    { c: 0, r: 1, kind: 'num', value: 34 },
    { c: 1, r: 1, kind: 'query' },
    { c: 2, r: 1, kind: 'blank' },
    { c: 3, r: 1, kind: 'blank' },
  ],
  // (B) diagonal staircase: 53 bottom-left, up-right to the queried 35.
  B: [
    { c: 0, r: 2, kind: 'num', value: 53 },
    { c: 1, r: 1, kind: 'blank' },
    { c: 2, r: 0, kind: 'query' },
  ],
  // (C) top row _ 25 (offset right); bottom row _ _ under it. Queried below 25 = 35.
  C: [
    { c: 1, r: 0, kind: 'blank' },
    { c: 2, r: 0, kind: 'num', value: 25 },
    { c: 1, r: 1, kind: 'blank' },
    { c: 2, r: 1, kind: 'query' },
  ],
  // (D) top row _ _ _; bottom row _ 46. Queried = above the left blank = 35.
  D: [
    { c: 0, r: 0, kind: 'query' },
    { c: 1, r: 0, kind: 'blank' },
    { c: 2, r: 0, kind: 'blank' },
    { c: 0, r: 1, kind: 'blank' },
    { c: 1, r: 1, kind: 'num', value: 46 },
  ],
  // (E) top row _ _; bottom row _ 37 (offset right). Queried two steps from 37
  // (left 36, up 26) = 26, so 35 does NOT belong here — this is the answer.
  E: [
    { c: 0, r: 0, kind: 'blank' },
    { c: 1, r: 0, kind: 'query' },
    { c: 1, r: 1, kind: 'blank' },
    { c: 2, r: 1, kind: 'num', value: 37 },
  ],
}

function isLabel(s: string): s is Label {
  return s === 'A' || s === 'B' || s === 'C' || s === 'D' || s === 'E'
}

export default function HundredsChart25G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '').trim().toUpperCase()
  if (!isLabel(label)) return <span>{choice?.text}</span>

  const cells = FRAGMENTS[label]
  const cell = 30
  const pad = 6 // headroom so the outer strokes never clip

  const maxC = Math.max(...cells.map((k) => k.c))
  const maxR = Math.max(...cells.map((k) => k.r))
  const gridW = (maxC + 1) * cell
  const gridH = (maxR + 1) * cell
  const width = gridW + pad * 2
  const height = gridH + pad * 2

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: potongan papan seratus dengan satu kotak kosong bertanda tanya.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={Math.min(140, width * 2)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {cells.map((k, i) => {
          const x = pad + k.c * cell
          const y = pad + k.r * cell
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                className={
                  k.kind === 'query'
                    ? 'fill-qupu-peach stroke-qupu-brand-orange'
                    : 'fill-qupu-cream stroke-qupu-brand-blue'
                }
                strokeWidth={k.kind === 'query' ? 2.2 : 1.8}
              />
              {k.kind === 'num' && (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 5}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="bold"
                  className="fill-qupu-brand-blue"
                >
                  {k.value}
                </text>
              )}
              {k.kind === 'query' && (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 6}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight="bold"
                  className="fill-qupu-brand-orange"
                >
                  ?
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </span>
  )
}
