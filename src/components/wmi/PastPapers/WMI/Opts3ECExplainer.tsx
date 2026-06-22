import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadeGrid, OPTION_GRIDS, OPT_W } from './Opts3ECIllustration'
import { buildOpts3ECSteps } from './opts3ECSteps'

// IKMC-20-EC-Q3 — post-answer beat-by-beat animation.
//
// Strategy: show a live 2×3 grid where cells light up (shade) or stay white
// as each arithmetic expression is evaluated.  Uses ShadeGrid from
// Opts3ECIllustration with a `highlightCell` ring on the currently active cell.
//
// Beats:
//   0  intro     — unsolved grid, state the task
//   1  cell-00   — 16+4=20 ✓ → shade top-left
//   2  cell-01   — 19+1=20 ✓ → shade top-middle
//   3  cell-02   — 28−8=20 ✓ → shade top-right
//   4  cell-10   — 2×10=20 ✓ → shade bottom-left
//   5  cell-11   — 16−4=12 ✗ → leave bottom-middle blank
//   6  cell-12   — 7×3=21  ✗ → leave bottom-right blank
//   7  result    — 4 shaded = Shape A (answer)

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_FG  = '#065F46'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const RED_RING  = '#EF4444'   // accent for ✗ cells

// ── Answer-shape overlay ───────────────────────────────────────────────────────

// On the result beat we show Option A's grid enlarged to confirm the shape.
function AnswerShape() {
  return (
    <div className="flex flex-col items-center gap-1">
      <ShadeGrid grid={OPTION_GRIDS['A']} width={OPT_W * 1.6} />
      <span
        className="font-display text-xs font-black"
        style={{ color: GREEN }}
      >
        Shape A
      </span>
    </div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Opts3ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOpts3ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  // Determine accent colour for the current cell's ring.
  // ✓ cells (true): green ring.  ✗ cells (false): red ring.  null: no ring.
  const focusVal = beat.focus
    ? beat.cells[beat.focus[0]]?.[beat.focus[1]] ?? null
    : null
  const accentColor =
    focusVal === true ? GREEN : focusVal === false ? RED_RING : GREEN

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_FG }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Convert the beat's 3-state cells (null | boolean) into a boolean grid
  // for ShadeGrid: null → false (empty), false → false, true → true.
  const displayGrid: boolean[][] = beat.cells.map((row) =>
    row.map((v) => v === true),
  )

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung setiap kotak — yang hasilnya 20 diarsir. Empat kotak diarsir: seluruh baris atas dan kiri bawah, membentuk bentuk A.'
      : 'Explainer: evaluate each cell — shade if result is 20. Four cells shaded: entire top row and bottom-left, forming shape A.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — live 2×3 grid (hidden on result beat, replaced by answer shape) */}
        <AnimatePresence mode="wait">
          {!isResult ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ShadeGrid
                grid={displayGrid}
                highlightCell={beat.focus}
                accentColor={accentColor}
                width={OPT_W * 2.2}
              />
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <AnswerShape />
            </motion.div>
          )}
        </AnimatePresence>

        {/* equation pill */}
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
                style={{ background: isResult ? GREEN : BLUE }}
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
