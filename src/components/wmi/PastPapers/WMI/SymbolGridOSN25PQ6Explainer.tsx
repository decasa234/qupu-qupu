// OSN-25-SD-PROV-Q6 — animated solution explainer.
//
// Beats:
//   0. intro      — show the static puzzle.
//   1. row-total  — highlight row sums → 24+26+23+26 = 99.
//   2. known-cols — highlight known col sums → 24+23+27 = 74.
//   3. result     — reveal col 1 = 99−74 = 25 in green.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import {
  GRID,
  SYMBOL_CHAR,
  SYMBOL_COLOR,
  ROW_SUMS,
  COL_SUMS,
  ROWS,
  COLS,
  CELL,
} from './SymbolGridOSN25PQ6Illustration'
import { buildSymbolGridOSN25PQ6Steps } from './symbolGridOSN25PQ6Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const AMBER = '#D97706'
const BLUE  = '#3B82F6'
const INK   = '#374151'

// ── sub-components ────────────────────────────────────────────────────────────

/** Flashing ring overlay on a single cell column — highlights col-sum labels. */
function ColHighlight({ c, color }: { c: number; color: string }) {
  return (
    <rect
      x={c * CELL + 2}
      y={2}
      width={CELL - 4}
      height={ROWS * CELL - 4}
      fill={`${color}22`}
      stroke={color}
      strokeWidth={2}
      rx={4}
    />
  )
}

/** Bracket on the right side of the grid for row sums. */
function RowBrace({ color }: { color: string }) {
  const x = COLS * CELL + 6
  const y0 = 2
  const y1 = ROWS * CELL - 2
  return (
    <g stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round">
      <line x1={x} y1={y0} x2={x} y2={y1} />
      <line x1={x - 6} y1={y0} x2={x + 6} y2={y0} />
      <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} />
    </g>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function SymbolGridOSN25PQ6Explainer({ lang }: ExplainerProps) {
  const storyboard = useMemo(() => buildSymbolGridOSN25PQ6Steps(lang), [lang])
  const { beat, isPlaying, goTo, play, pause, next, prev } = useBeatControl(storyboard)

  const vb = gridBoardViewBox(ROWS, COLS, CELL, ROW_SUMS, COL_SUMS)
  const symFontSize = Math.round(CELL * 0.48)
  const sumFontSize = Math.round(CELL * 0.38)
  const SUM_OFFSET  = Math.round(CELL * 0.6)
  const SUM_CY      = ROWS * CELL + SUM_OFFSET * 0.9 // approx y of col-sum label row

  const revealColor = beat.revealCol1 ? GREEN : '#F97316'
  const colSumsDisplay = beat.revealCol1
    ? ['25', '24', '23', '27']
    : COL_SUMS

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* ── SVG figure ── */}
      <svg viewBox={vb} width={Math.min(300, COLS * CELL + SUM_OFFSET * 2)} aria-hidden="true">
        {/* base grid */}
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          fill={() => '#FDF4FF'}
          gridStroke="#9CA3AF"
          /* no rowSums/colSums here — we draw them manually for animation */
        />

        {/* col highlights for known-cols beat */}
        <AnimatePresence>
          {beat.highlightKnownCols && [1, 2, 3].map(c => (
            <motion.g key={`ch-${c}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ColHighlight c={c} color={BLUE} />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* row brace for row-total beat */}
        <AnimatePresence>
          {beat.highlightRows && (
            <motion.g key="rb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RowBrace color={AMBER} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* colored symbol glyphs */}
        {GRID.map((row, r) =>
          row.map((sym, c) => (
            <text
              key={`sym-${r}-${c}`}
              x={c * CELL + CELL / 2}
              y={r * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={symFontSize}
              fill={SYMBOL_COLOR[sym]}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {SYMBOL_CHAR[sym]}
            </text>
          )),
        )}

        {/* row sum labels */}
        {ROW_SUMS.map((s, r) => (
          <text
            key={`rs-${r}`}
            x={COLS * CELL + SUM_OFFSET}
            y={r * CELL + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={sumFontSize}
            fontWeight={beat.highlightRows ? 900 : 700}
            fill={beat.highlightRows ? AMBER : INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {s}
          </text>
        ))}

        {/* col sum labels — animated */}
        {colSumsDisplay.map((s, c) => {
          const isKnown = c > 0
          const isRevealed = c === 0 && beat.revealCol1
          const color = isRevealed
            ? GREEN
            : (beat.highlightKnownCols && isKnown) ? BLUE : (c === 0 ? '#F97316' : INK)
          const fw = (isRevealed || (beat.highlightKnownCols && isKnown)) ? 900 : 700

          return (
            <text
              key={`cs-${c}`}
              x={c * CELL + CELL / 2}
              y={SUM_CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={sumFontSize}
              fontWeight={fw}
              fill={color}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {s}
            </text>
          )
        })}
      </svg>

      {/* ── equation ── */}
      <AnimatePresence mode="wait">
        {beat.equation && (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-base font-mono font-bold text-gray-700 bg-gray-50 rounded px-3 py-1"
          >
            {beat.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── caption ── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat.phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`text-sm text-center px-2 ${beat.result ? 'font-bold text-emerald-700' : 'text-gray-600'}`}
        >
          {beat.caption}
        </motion.p>
      </AnimatePresence>

      {/* ── controls ── */}
      <div className="flex gap-2 mt-1">
        <button onClick={prev} className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
          ‹
        </button>
        <button onClick={isPlaying ? pause : play} className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-sm hover:bg-indigo-200">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={next} className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
          ›
        </button>
      </div>
    </div>
  )
}
