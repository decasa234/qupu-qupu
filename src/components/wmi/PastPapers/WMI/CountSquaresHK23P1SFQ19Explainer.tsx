// HKIMO-23-P1SF-Q19 — post-answer explainer.
//
// Reveals how to count all squares by size:
//   Beat 0 — intro
//   Beat 1 — highlight all 9 unit (1×1) cells
//   Beat 2 — highlight 3 composite (2×2) blocks
//   Beat 3 — show final answer: 12

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildCountSquaresHK23P1SFQ19Steps } from './countSquaresHK23P1SFQ19Steps'

// ── Layout constants ────────────────────────────────────────────────────────

const C   = 60   // cell size
const PAD = 8    // outer padding
const VW  = PAD * 2 + 4 * C   // 256
const VH  = PAD * 2 + 3 * C   // 196

// ── All 9 cells in the figure ────────────────────────────────────────────────
const CELLS: [number, number][] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1], [1, 2], [1, 3],
          [2, 1], [2, 2], [2, 3],
]

// ── Colour tokens ────────────────────────────────────────────────────────────
const CELL_DEFAULT  = '#FFFFFF'
const CELL_UNIT     = '#BFDBFE'   // blue-200
const BLOCK_STROKE  = '#F59E0B'   // amber-400 for 2×2 outlines
const BLOCK_FILL    = '#FEF3C7'   // amber-50
const GRID_STROKE   = '#374151'
const GREEN         = '#16A34A'
const INK           = '#1F2937'

// ── FigureGrid ───────────────────────────────────────────────────────────────

interface FigureGridProps {
  highlightCells: Set<string>
  highlightBlocks: [number, number][]
}

function FigureGrid({ highlightCells, highlightBlocks }: FigureGridProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      height={VH}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* 2×2 block overlays (drawn below unit cells so cells are on top) */}
      {highlightBlocks.map(([r, c]) => (
        <rect
          key={`blk-${r}-${c}`}
          x={PAD + c * C + 2}
          y={PAD + r * C + 2}
          width={2 * C - 4}
          height={2 * C - 4}
          fill={BLOCK_FILL}
          stroke={BLOCK_STROKE}
          strokeWidth={3}
          rx={3}
        />
      ))}

      {/* Unit cells */}
      {CELLS.map(([r, c]) => {
        const key = `${r},${c}`
        const isHighlighted = highlightCells.has(key)
        return (
          <rect
            key={`cell-${r}-${c}`}
            x={PAD + c * C}
            y={PAD + r * C}
            width={C}
            height={C}
            fill={isHighlighted ? CELL_UNIT : CELL_DEFAULT}
            stroke={GRID_STROKE}
            strokeWidth={2}
          />
        )
      })}
    </svg>
  )
}

// ── Explainer ────────────────────────────────────────────────────────────────

export default function CountSquaresHK23P1SFQ19Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildCountSquaresHK23P1SFQ19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, props)

  const beat = story.beats[index]

  const highlightCells = useMemo(
    () => new Set(beat.highlightCells.map(([r, c]) => `${r},${c}`)),
    [beat.highlightCells],
  )

  const isAnswer = beat.phase === 'answer'

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Figure */}
      <FigureGrid
        highlightCells={highlightCells}
        highlightBlocks={beat.highlightBlocks}
      />

      {/* Running count badge */}
      <AnimatePresence mode="wait">
        {beat.count !== null && (
          <motion.div
            key={`count-${beat.phase}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded-xl px-5 py-2 font-display text-lg font-bold"
            style={{
              background: isAnswer ? GREEN : '#EFF6FF',
              color: isAnswer ? '#fff' : '#1D4ED8',
            }}
          >
            {isAnswer
              ? (lang === 'en' ? `Answer: ${beat.count}` : `Jawaban: ${beat.count}`)
              : (lang === 'en'
                  ? `${beat.phase === 'unit' ? '1×1' : '2×2'}: ${beat.count}`
                  : `${beat.phase === 'unit' ? '1×1' : '2×2'}: ${beat.count}`)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption */}
      <p
        className="text-center font-display text-sm"
        style={{ color: INK, maxWidth: 280 }}
      >
        {beat.caption[lang]}
      </p>
    </div>
  )
}
