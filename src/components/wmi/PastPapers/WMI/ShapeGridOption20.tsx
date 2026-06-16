import type { WmiChoice } from '../../../../types/wmi'
import { GridShapeGlyph, type GridShapeKind } from './ShapeGrid20Illustration'

// Renders an answer option for the shape-grid question (WMI-20F1A-Q4) as the
// actual shape the option names, reusing the same glyphs (and therefore the
// same colours) as the 3x3 grid illustration:
//   A = magenta/purple outlined diamond, B = blue downward triangle,
//   C = teal flower, D = brown circled-cross.
const LABEL_TO_KIND: Record<string, GridShapeKind> = {
  A: 'diamond',
  B: 'triangle',
  C: 'flower',
  D: 'cross',
}

export default function ShapeGridOption20({ choice }: { choice: WmiChoice }) {
  const kind = LABEL_TO_KIND[choice.label]
  // Fallback to plain text for any label we don't know how to draw.
  if (!kind) return <span>{choice.text}</span>

  return (
    <svg
      viewBox="-28 -28 56 56"
      width={56}
      height={56}
      style={{ display: 'block' }}
      role="img"
      aria-label={choice.text}
    >
      <GridShapeGlyph kind={kind} />
    </svg>
  )
}
