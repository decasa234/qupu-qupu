import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'
import { scoreGuess } from '../explainers/mastermindCodeDeduceSteps'

// In-card figure for `mastermind-code-deduce`: the lock's blank code on top,
// then one row per guess with the two counts the lock reported beside it.
//
// Language-neutral on purpose — the illustration only ever draws digits and two
// key glyphs, so the same SVG serves the English and the Indonesian stem. The
// stem already states every report in words; this is the table version of the
// same information, which is how the WMI papers print it.
//
// The true code is NEVER drawn: the top row stays a row of question marks.

const CELL = 44
const CHIP = 34
const CHIP_GAP = 8
const GRID_GAP = 14
const LEGEND_H = 26
const ROW_GAP = 16

const GREEN = '#10B981'
const GREEN_TINT = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER = '#D97706'
const AMBER_TINT = '#FEF3C7'
const AMBER_INK = '#92400E'
const ORANGE = '#f0853a'
const CREAM = '#FFF2DF'
const SLATE = '#9aa3b2'

interface ChipProps {
  x: number
  y: number
  text: string
  tint: string
  stroke: string
  ink: string
  size?: number
}

function Chip({ x, y, text, tint, stroke, ink, size = CHIP }: ChipProps) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={9} fill={tint} stroke={stroke} strokeWidth={2} />
      <text
        x={x + size / 2}
        y={y + size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.round(size * 0.5)}
        fontWeight={900}
        fill={ink}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {text}
      </text>
    </g>
  )
}

export default function MastermindCodeDeduceIllustration({ params }: { params: unknown }) {
  const p = params as { code?: number[]; guesses?: number[][]; codeLength?: number }
  const code = p.code ?? []
  const guesses = p.guesses ?? []
  const cols = p.codeLength ?? (code.length || 3)

  const gridW = cols * CELL
  const chipX1 = gridW + GRID_GAP
  const chipX2 = chipX1 + CHIP + CHIP_GAP
  const width = chipX2 + CHIP
  const guessesTop = CELL + ROW_GAP + LEGEND_H + 6
  const height = guessesTop + guesses.length * CELL

  const reports = guesses.map((g) => scoreGuess(g, code))
  const chipY = (row: number) => guessesTop + row * CELL + (CELL - CHIP) / 2

  const ariaLabel = `Kode rahasia ${cols} angka yang belum diketahui, dengan ${guesses.length} tebakan: ${guesses
    .map(
      (g, i) =>
        `${g.join(' ')} memberi ${reports[i].placed} tepat tempat dan ${reports[i].present} salah tempat`,
    )
    .join('; ')}.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {/* the lock's code — three slots nobody has seen yet */}
        <GridBoard
          rows={1}
          cols={cols}
          cellSize={CELL}
          fill={() => CREAM}
          label={() => '?'}
          gridStroke={ORANGE}
        />

        {/* key: which column is "right spot" and which is "wrong spot" */}
        <Chip
          x={chipX1 + (CHIP - LEGEND_H) / 2}
          y={CELL + ROW_GAP}
          size={LEGEND_H}
          text="✓"
          tint={GREEN_TINT}
          stroke={GREEN}
          ink={GREEN_INK}
        />
        <Chip
          x={chipX2 + (CHIP - LEGEND_H) / 2}
          y={CELL + ROW_GAP}
          size={LEGEND_H}
          text="↔"
          tint={AMBER_TINT}
          stroke={AMBER}
          ink={AMBER_INK}
        />
        <line
          x1={0}
          y1={CELL + ROW_GAP + LEGEND_H + 3}
          x2={width}
          y2={CELL + ROW_GAP + LEGEND_H + 3}
          stroke={SLATE}
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* one row per guess, with the two counts the lock reported */}
        <g transform={`translate(0, ${guessesTop})`}>
          <GridBoard
            rows={guesses.length}
            cols={cols}
            cellSize={CELL}
            label={(r, c) => String(guesses[r]?.[c] ?? '')}
          />
        </g>
        {reports.map((f, r) => (
          <g key={`report-${r}`}>
            <Chip
              x={chipX1}
              y={chipY(r)}
              text={String(f.placed)}
              tint={GREEN_TINT}
              stroke={GREEN}
              ink={GREEN_INK}
            />
            <Chip
              x={chipX2}
              y={chipY(r)}
              text={String(f.present)}
              tint={AMBER_TINT}
              stroke={AMBER}
              ink={AMBER_INK}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
