import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'
import {
  readComposeParams,
  type ComposeCell,
  type ComposeView,
} from '../explainers/composeShapePerimeterSteps'

// In-card figure for `compose-shape-perimeter`: one loose piece on the left, the
// shape those pieces build on the right.
//
// Everything is drawn by the shared `Polyomino` primitive, at 1 cm per cell, so
// a 4 cm by 2 cm piece really is twice as wide as it is tall and the picture
// cannot flatter a wrong perimeter. Each piece is its own Polyomino block laid
// on the grid, and one last Polyomino traces the finished OUTLINE on top — the
// same boundary the answer is counted off, which is why the heavy line skips
// every place two pieces touch.
//
// The two-layer trick (from `tile-fill-count`): Polyomino normalises its viewBox
// to its OWN cells, so a block laid over the base is nudged by the difference
// between the two cell lists' top-left corners. Same cellSize and pad on every
// layer, so each piece lands exactly where it belongs.
//
// Pure render from params: no hooks, no randomness, no dates — SSR-safe. No
// measurement is ever written on the drawing, so the figure cannot leak the
// answer for the "how long is one side?" ask.

const INK = '#30598A' // qupu-brand-blue
const INK_SOFT = '#E1EFFB'
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'

const PAD = 4

/** Every 1 cm cell of one piece. */
function pieceBlock(pieceW: number, pieceH: number): ComposeCell[] {
  const out: ComposeCell[] = []
  for (let r = 0; r < pieceH; r++) for (let c = 0; c < pieceW; c++) out.push([r, c])
  return out
}

/** Every 1 cm cell the finished shape covers. */
function shapeBlock(view: ComposeView): ComposeCell[] {
  const out: ComposeCell[] = []
  for (const [r, c] of view.cells) {
    for (let dr = 0; dr < view.pieceH; dr++) {
      for (let dc = 0; dc < view.pieceW; dc++) {
        out.push([r * view.pieceH + dr, c * view.pieceW + dc])
      }
    }
  }
  return out
}

/** Pixels per centimetre, so a nine-piece row still fits a phone. */
function scaleFor(cmWide: number, cmTall: number): number {
  const byWidth = 230 / Math.max(cmWide, 1)
  const byHeight = 150 / Math.max(cmTall, 1)
  return Math.max(5, Math.min(22, Math.floor(Math.min(byWidth, byHeight))))
}

/**
 * Speaks the drawn evidence and nothing else: how many pieces, what shape they
 * are, and how they are arranged row by row. Never a length, never an area —
 * those are the question.
 */
function aria(view: ComposeView): string {
  const rows = [...new Set(view.cells.map(([r]) => r))].sort((x, y) => x - y)
  const perRow = rows.map((r) => {
    const wide = view.cells.filter(([rr]) => rr === r).length
    return `baris ${r + 1} ada ${wide} keping`
  })
  const shape =
    view.piece === 'square'
      ? 'Satu keping berbentuk persegi digambar terpisah di sebelah kiri.'
      : 'Satu keping berbentuk persegi panjang digambar terpisah di sebelah kiri.'
  return `${shape} Di sebelah kanan, ${view.count} keping yang sama besar dirapatkan menjadi satu bentuk: ${perRow.join(', ')}. Garis tebal mengikuti tepi luar bentuk itu.`
}

export default function ComposeShapePerimeterIllustration({ params }: { params: unknown }) {
  const view = readComposeParams(params)

  const cmWide = view.width * view.pieceW + view.pieceW + 2
  const cmTall = Math.max(view.height * view.pieceH, view.pieceH)
  const cell = scaleFor(cmWide, cmTall)

  const block = pieceBlock(view.pieceW, view.pieceH)
  const whole = shapeBlock(view)

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={aria(view)}>
      <div className="flex items-center gap-4 sm:gap-6">
        {/* one loose piece, so the child can see the unit being repeated */}
        <Polyomino
          cells={block}
          cellSize={cell}
          pad={PAD}
          fill={INK_SOFT}
          stroke={INK}
          strokeWidth={2}
          showGrid={false}
        />

        <div aria-hidden="true" className="h-16 w-px shrink-0" style={{ background: MUTED }} />

        <div
          style={{
            position: 'relative',
            width: view.width * view.pieceW * cell + PAD * 2,
            height: view.height * view.pieceH * cell + PAD * 2,
          }}
        >
          {view.cells.map(([r, c]) => (
            <div
              key={`p${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * view.pieceW * cell,
                top: r * view.pieceH * cell,
              }}
            >
              <Polyomino
                cells={block}
                cellSize={cell}
                pad={PAD}
                fill={PEACH}
                stroke={MUTED}
                strokeWidth={1.5}
                showGrid={false}
              />
            </div>
          ))}
          {/* the finished outline, traced over the joins it skips */}
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            <Polyomino
              cells={whole}
              cellSize={cell}
              pad={PAD}
              fill="none"
              stroke={INK}
              strokeWidth={3}
              showGrid={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
