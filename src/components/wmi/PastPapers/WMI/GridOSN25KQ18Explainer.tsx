// OSN-25-SD-KAB-Q18 — animated explainer.
// Beats: intro → list 12 primes → per-cell choice counts → P(12,4) multiplication → answer C.
// Reuses GridBoard (from ./primitives/GridBoard) and layout constants from the illustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { CELL, ROWS, COLS, CELL_COLORS } from './GridOSN25KQ18Illustration'
import { buildGridOSN25KQ18Steps } from './gridOSN25KQ18Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const INK    = '#1F2937'
const PANEL  = '#F9FAFB'

const FIG_W = COLS * CELL
const FIG_H = ROWS * CELL

// ── Explainer (default export) ────────────────────────────────────────────────

export default function GridOSN25KQ18Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(
    () => buildGridOSN25KQ18Steps(lang as 'en' | 'id'),
    [lang],
  )

  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })

  const b = story.steps[beat]
  const vb = gridBoardViewBox(ROWS, COLS, CELL)

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', maxWidth: 340 }}>

      {/* ── 2×2 grid with animated per-cell labels ── */}
      <svg
        viewBox={vb}
        width={FIG_W}
        height={FIG_H}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          fill={(r, c) => CELL_COLORS[`${r}-${c}`]}
          gridStroke="#374151"
        />

        {/* per-cell choice-count / question-mark labels */}
        {b.cellLabels.map((lbl, i) => {
          const r = Math.floor(i / COLS)
          const c = i % COLS
          if (!lbl) return null
          const isQuestion = lbl === '?'
          return (
            <motion.text
              key={`lbl-${beat}-${i}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              x={c * CELL + CELL / 2}
              y={r * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isQuestion ? 34 : 26}
              fontWeight={900}
              fill={b.result ? GREEN : '#FFFFFF'}
              style={{ opacity: isQuestion ? 0.55 : 1 }}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lbl}
            </motion.text>
          )
        })}
      </svg>

      {/* ── prime list (beat 1 only) ── */}
      <AnimatePresence>
        {b.showPrimes && (
          <motion.div
            key="primes"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              margin: '10px 4px 2px',
              textAlign: 'center',
              fontSize: 12,
              color: '#374151',
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}
          >
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── equation ── */}
      {b.equation ? (
        <motion.div
          key={`eq-${beat}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            margin: '10px 4px 4px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            color: b.result ? GREEN : INK,
          }}
        >
          {b.equation}
        </motion.div>
      ) : null}

      {/* ── caption ── */}
      <div
        style={{
          padding: '8px 12px',
          background: PANEL,
          borderRadius: 8,
          fontSize: 13,
          color: '#374151',
          lineHeight: 1.5,
          marginTop: 8,
        }}
      >
        {b.caption}
      </div>
    </div>
  )
}
