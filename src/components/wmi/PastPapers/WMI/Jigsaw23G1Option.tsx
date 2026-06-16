import type { WmiChoice } from '../../../types/wmi'
import { cellSpan, PIECE_CELLS, PolyShape, type Cell } from './Jigsaw23G1Illustration'

// Renders an answer option for WMI-23F1A-Q10 (jigsaw completion) as the actual
// candidate piece — a small polyomino drawn from the source scan of pieces A–E.
// The drawn piece replaces the choice text, so the figure can never drift from
// the option it represents. Falls back to the plain text for any unknown label.

const CELL = 22
const PAD = 6

export default function Jigsaw23G1Option({ choice }: { choice: WmiChoice }) {
  const cells: Cell[] | undefined = PIECE_CELLS[choice.label]
  if (!cells) return <span>{choice.text}</span>

  const { rows, cols } = cellSpan(cells)
  const w = cols * CELL + PAD * 2
  const h = rows * CELL + PAD * 2

  return (
    <span
      role="img"
      aria-label={`Potongan puzzle pilihan ${choice.label}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
        <PolyShape cells={cells} x={PAD} y={PAD} cell={CELL} />
      </svg>
    </span>
  )
}
