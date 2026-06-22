/**
 * IKMC-20-EC-Q4 — post-answer explainer: which shaded 4×4 grid covers
 * the greatest fraction?
 *
 * Teaching walk:
 *   Beat 0 — intro:  count shaded cells in each figure.
 *   Beat 1 — E:      11/16 — eliminated.
 *   Beat 2 — D:      11.5/16 — eliminated.
 *   Beat 3 — C:      12.5/16 — eliminated.
 *   Beat 4 — B:      13.5/16 — not the most.
 *   Beat 5 — A:      14/16 ✓ — the largest!
 *   Beat 6 — result: A is the answer.
 *
 * Reuses Shaded4ECGrid from Shaded4ECIllustration so the animation shows
 * the same figures used for the options.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Shaded4ECGrid, SHADED4_GRIDS } from './Shaded4ECIllustration'
import { buildShaded4ECSteps } from './shaded4ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED        = '#EF4444'
const RED_BG     = '#FEE2E2'
const GREY       = '#9CA3AF'
const INK        = '#1F2937'

// ---------------------------------------------------------------------------
// OptionPanel — one labelled shaded-grid option card
// ---------------------------------------------------------------------------

interface OptionPanelProps {
  label: string
  isActive: boolean
  isCorrect: boolean
  isEliminated: boolean
  fraction: string
}

function OptionPanel({ label, isActive, isCorrect, isEliminated, fraction }: OptionPanelProps) {
  const grid = SHADED4_GRIDS[label]
  if (!grid) return null

  let borderColor = '#D1D5DB'
  if (isActive && isCorrect) borderColor = GREEN
  else if (isActive) borderColor = RED
  else if (isEliminated) borderColor = '#E5E7EB'

  const opacity = isEliminated && !isActive ? 0.35 : 1

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-1"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 60,
        opacity,
        transition: 'opacity 0.3s',
      }}
    >
      <Shaded4ECGrid grid={grid} size={56} />
      <span
        className="font-display text-xs font-bold"
        style={{
          color: isActive && isCorrect ? GREEN
               : isActive ? RED
               : isEliminated ? GREY
               : INK,
        }}
      >
        {label}
      </span>
      <AnimatePresence>
        {isActive && fraction !== '' && (
          <motion.div
            key={`tag-${label}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[9px] font-bold"
            style={{
              background: isCorrect ? GREEN_BG : RED_BG,
              color: isCorrect ? GREEN_TEXT : '#B91C1C',
              border: `1.5px solid ${isCorrect ? GREEN : RED}`,
            }}
          >
            {fraction}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Shaded4ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildShaded4ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Gambar A memiliki 14 dari 16 sel diarsir (87,5%), terbanyak di antara semua gambar. Jawaban: A.'
      : 'Explainer: Figure A has 14 out of 16 cells shaded (87.5%), the most of all figures. Answer: A.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five option panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isActive = beat.activeChoice === label
            const isCorrect = isActive && beat.activeResult === 'correct'
            const isEliminated = beat.eliminated.has(label) && !isActive
            return (
              <OptionPanel
                key={label}
                label={label}
                isActive={isActive}
                isCorrect={isCorrect}
                isEliminated={isEliminated}
                fraction={isActive ? beat.fraction : ''}
              />
            )
          })}
        </div>

        {/* Fraction chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.fraction !== '' && (
              <motion.span
                key={beat.fraction}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.fraction}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
