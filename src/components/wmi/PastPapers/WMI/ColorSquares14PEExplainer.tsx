import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  CELL,
  GRID_X,
  GRID_Y,
  ColorSquaresGrid,
  colCx,
  rowCy,
} from './ColorSquares14PEIllustration'
import { buildColorSquares14PESteps } from './colorSquares14PESteps'

// IKMC-20-PE-Q14 — post-answer animation.
// Reuses ColorSquaresGrid from the illustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro   — static grid with "?", state the problem.
//   1. total   — 1+2+3+4+5+6 = 21.
//   2. blue    — highlight blue cells, show "blue = 10".
//   3. yellow  — highlight yellow cells, show "yellow = 10".
//   4. white   — reveal answer "1" in white cell; 21−10−10=1.
//   5. result  — "1 → A" (green).

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE_DARK  = '#1D6FA4'   // caption accent when blue is highlighted
const YELLOW_DARK = '#C49B0A'  // caption accent when yellow is highlighted
const INK    = '#1F2937'

// Highlight ring colour for each group
const HIGHLIGHT_BLUE   = '#1D6FA4'
const HIGHLIGHT_YELLOW = '#C49B0A'
const HIGHLIGHT_WHITE  = GREEN

// ── Highlight ring overlay for a cell ─────────────────────────────────────────

/** Draws an inset ring around one grid cell to highlight it. */
function CellRing({
  row,
  col,
  color,
}: {
  row: number
  col: number
  color: string
}) {
  const x = GRID_X + col * CELL + 3
  const y = GRID_Y + row * CELL + 3
  return (
    <rect
      x={x}
      y={y}
      width={CELL - 6}
      height={CELL - 6}
      fill="none"
      stroke={color}
      strokeWidth={4}
      rx={6}
    />
  )
}

// ── Sum label beside a group of cells ─────────────────────────────────────────

/** "= 10" badge drawn to the right of the grid, vertically centred on `cy`. */
function SumLabel({ cy, color, label }: { cy: number; color: string; label: string }) {
  const x = GRID_X + CELL * 3 + 8
  return (
    <text
      x={x}
      y={cy}
      dominantBaseline="central"
      textAnchor="start"
      fontSize={13}
      fontWeight={900}
      fill={color}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Blue-group highlight (3 cells: [0,0], [0,1], [1,0]) ──────────────────────

function BlueHighlight() {
  const cells: Array<[number, number]> = [[0, 0], [0, 1], [1, 0]]
  // Vertical centre of the three blue cells
  const avgY = cells.reduce((s, [r]) => s + rowCy(r), 0) / cells.length
  return (
    <g>
      {cells.map(([r, c]) => (
        <CellRing key={`bh-${r}-${c}`} row={r} col={c} color={HIGHLIGHT_BLUE} />
      ))}
      <SumLabel cy={avgY} color={HIGHLIGHT_BLUE} label="= 10" />
    </g>
  )
}

// ── Yellow-group highlight (2 cells: [0,2], [1,1]) ───────────────────────────

function YellowHighlight() {
  const cells: Array<[number, number]> = [[0, 2], [1, 1]]
  const avgY = cells.reduce((s, [r]) => s + rowCy(r), 0) / cells.length
  return (
    <g>
      {cells.map(([r, c]) => (
        <CellRing key={`yh-${r}-${c}`} row={r} col={c} color={HIGHLIGHT_YELLOW} />
      ))}
      <SumLabel cy={avgY} color={HIGHLIGHT_YELLOW} label="= 10" />
    </g>
  )
}

// ── White-cell highlight ───────────────────────────────────────────────────────

function WhiteHighlight() {
  return <CellRing row={1} col={2} color={HIGHLIGHT_WHITE} />
}

// ── Answer overlay in the white cell ──────────────────────────────────────────

function AnswerLabel({ isResult }: { isResult: boolean }) {
  const x = colCx(2)
  const y = rowCy(1)
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={28}
      fontWeight={900}
      fill={isResult ? GREEN : INK}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      1
    </text>
  )
}

// ── Main explainer component ───────────────────────────────────────────────────

export default function ColorSquares14PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildColorSquares14PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE_DARK, color: BLUE_DARK }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: semua angka 1–6 berjumlah 21; kotak biru = 10, kotak kuning = 10, jadi kotak putih = 21 − 20 = 1 — jawaban A.'
      : 'Explainer: all numbers 1–6 sum to 21; blue = 10, yellow = 10, so white = 21 − 20 = 1 — answer A.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(300, SVG_W * 1.4)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* the static 2×3 grid — question mark only shown while answer hidden */}
          <ColorSquaresGrid questionMark={!beat.showAnswer} />

          {/* beat-driven overlays */}

          {/* blue group highlight */}
          <AnimatePresence>
            {beat.highlightBlue && (
              <motion.g
                key="blue-hl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <BlueHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* yellow group highlight */}
          <AnimatePresence>
            {beat.highlightYellow && (
              <motion.g
                key="yellow-hl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <YellowHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* white cell highlight (beats white + result) */}
          <AnimatePresence>
            {beat.highlightWhite && (
              <motion.g
                key="white-hl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <WhiteHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer "1" in the white cell (beats white + result) */}
          <AnimatePresence>
            {beat.showAnswer && (
              <motion.g
                key="answer"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <AnswerLabel isResult={isResult} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* blue sum label: "= 10" alongside blue cells (beats blue onward) */}
          <AnimatePresence>
            {beat.showBlueSum && !beat.highlightBlue && (
              <motion.g
                key="blue-sum"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* faded sum label persists after highlight fades */}
                <SumLabel cy={rowCy(0.5)} color={BLUE_DARK} label="= 10" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* yellow sum label: "= 10" alongside yellow cells (beats yellow onward) */}
          <AnimatePresence>
            {beat.showYellowSum && !beat.highlightYellow && (
              <motion.g
                key="yellow-sum"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SumLabel cy={rowCy(1)} color={YELLOW_DARK} label="= 10" />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE_DARK }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
