import type { WmiChoice } from '../../../types/wmi'
import { FigureGlyph, FIGURE_LABEL_ID, type FigureKind } from './CountFigures25G1Illustration'

// CHOICE renderer for WMI-25F1A-Q14 (2025 Grade 1 Final, Paper A).
//
// Each of the five options A–E pictures a PAIR of figure kinds — "do these two
// kinds appear in equal quantity?". The pairs are read straight off the scanned
// Paper A option images and transcribed into OPTION_PAIRS so the drawn options
// can never drift from the printed paper:
//
//   A = tulip  + blue      (8  vs 6)
//   B = cosmos + xflower   (12 vs 10)
//   C = rose   + cosmos    (12 vs 12)  ← the only equal pair → correct
//   D = blue   + xflower   (6  vs 10)
//   E = xflower + tulip    (10 vs 8)
//
// The renderer reuses FigureGlyph from the stem, so the options share one icon
// set with the 48-figure strip. It deliberately never reveals which pair is
// equal — that's the animator's job.

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export const OPTION_PAIRS: Record<OptionLabel, [FigureKind, FigureKind]> = {
  A: ['tulip', 'blue'],
  B: ['cosmos', 'xflower'],
  C: ['rose', 'cosmos'],
  D: ['blue', 'xflower'],
  E: ['xflower', 'tulip'],
}

export default function CountFigures25G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '').trim().toUpperCase() as OptionLabel
  const pair = OPTION_PAIRS[label]
  // Fall back to plain text for any unexpected label so previews stay safe.
  if (!pair) return <span>{choice?.text}</span>

  const s = 16
  const pad = 8
  const gap = 14
  const cellW = s * 2 + 4
  const width = pad * 2 + cellW * 2 + gap
  const height = pad * 2 + cellW
  const cy = height / 2

  const aria = `Pilihan ${label}: ${FIGURE_LABEL_ID[pair[0]]} dan ${FIGURE_LABEL_ID[pair[1]]}.`

  return (
    <span
      role="img"
      aria-label={aria}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(96, width)} style={{ display: 'block' }}>
        <FigureGlyph kind={pair[0]} cx={pad + cellW / 2} cy={cy} s={s} />
        <FigureGlyph kind={pair[1]} cx={pad + cellW + gap + cellW / 2} cy={cy} s={s} />
      </svg>
    </span>
  )
}
