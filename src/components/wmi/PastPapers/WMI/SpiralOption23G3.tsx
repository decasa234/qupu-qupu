// Answer-option renderer for WMI-23F3A-Q15 (clockwise spiral, answer = B).
//
// Each of the five options is a PAIR of figures (the two "missing" shapes the
// learner picks for cells (1,3) and (1,4)). The pair is drawn with the SAME
// ShapeGlyph primitive as the main grid figure (Spiral23G3Illustration), so an
// option can never drift from the grid's shapes/fills.
//
//   A: gray heptagon + black square
//   B: white heptagon + gray square   ← correct
//   C: gray square    + white square
//   D: white heptagon + white square
//   E: white heptagon + gray heptagon
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

import { ShapeGlyph, type ShapeKind, type ShapeFill } from './Spiral23G3Illustration'

type Pair = readonly [
  { shape: ShapeKind; fill: ShapeFill },
  { shape: ShapeKind; fill: ShapeFill },
]

const PAIR_BY_LABEL: Record<string, Pair> = {
  A: [
    { shape: 'heptagon', fill: 'gray' },
    { shape: 'square', fill: 'black' },
  ],
  B: [
    { shape: 'heptagon', fill: 'white' },
    { shape: 'square', fill: 'gray' },
  ],
  C: [
    { shape: 'square', fill: 'gray' },
    { shape: 'square', fill: 'white' },
  ],
  D: [
    { shape: 'heptagon', fill: 'white' },
    { shape: 'square', fill: 'white' },
  ],
  E: [
    { shape: 'heptagon', fill: 'white' },
    { shape: 'heptagon', fill: 'gray' },
  ],
}

const BOX = 44 // per-shape box
const GAP = 8 // gap between the two shapes

export default function SpiralOption23G3({ choice }: { choice: { label: string; text: string } }) {
  const pair = PAIR_BY_LABEL[choice.label]
  // Fall back to plain text for any label we don't know how to draw.
  if (!pair) return <span>{choice.text}</span>

  const width = BOX * 2 + GAP
  const height = BOX

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: 'block' }}
      role="img"
      aria-label={choice.text}
    >
      <g transform="translate(0, 0)">
        <ShapeGlyph shape={pair[0].shape} fill={pair[0].fill} size={BOX} />
      </g>
      <g transform={`translate(${BOX + GAP}, 0)`}>
        <ShapeGlyph shape={pair[1].shape} fill={pair[1].fill} size={BOX} />
      </g>
    </svg>
  )
}
