/**
 * IKMC-19-EC-Q2 — post-answer explainer: dot-bar notation, which is 12?
 *
 * Teaches the "decode and test" strategy, one option per beat:
 *   Beat 0 — intro:   dot = 1, bar = 5.
 *   Beat 1 — target:  decompose 12 = 2 bars + 2 dots.
 *   Beat 2 — A:       1 + 10 = 11 ≠ 12, eliminated.
 *   Beat 3 — B:       1 + 15 = 16 ≠ 12, eliminated.
 *   Beat 4 — C:       2 + 10 = 12 ✓ — answer!
 *   Beat 5 — D:       also 12 but non-canonical layout — trap.
 *   Beat 6 — E:       4 + 15 = 19 ≠ 12, eliminated.
 *   Beat 7 — result:  C is the answer.
 *
 * Reuses DotBarFigure from DotBar2ECIllustration so the animation reads as
 * the same scene coming alive.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DotBarFigure, DOT_BAR_SPECS } from './DotBar2ECIllustration'
import { buildDotBar2ECSteps } from './dotBar2ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED       = '#EF4444'
const RED_BG    = '#FEE2E2'
const ORANGE    = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const GREY      = '#9CA3AF'
const INK       = '#1F2937'

// ---------------------------------------------------------------------------
// OptionPanel — one labelled dot-bar option card
// ---------------------------------------------------------------------------

interface OptionPanelProps {
  label: string
  isActive: boolean
  isCorrect: boolean
  isTrap: boolean
  isEliminated: boolean
}

function OptionPanel({ label, isActive, isCorrect, isTrap, isEliminated }: OptionPanelProps) {
  const spec = DOT_BAR_SPECS[label]
  if (!spec) return null

  let borderColor = '#D1D5DB'
  if (isActive && isCorrect) borderColor = GREEN
  else if (isActive && isTrap) borderColor = ORANGE
  else if (isActive) borderColor = RED
  else if (isEliminated) borderColor = '#E5E7EB'

  const opacity = isEliminated && !isActive ? 0.35 : 1

  // Tag text: show score for eliminated/active choices
  let tagText: string | null = null
  const dotVal = (spec.dots.kind === 'row' ? spec.dots.count : 2) * 1
  const barVal = spec.bars * 5
  const total = dotVal + barVal

  if (isActive) {
    tagText = `${dotVal} + ${barVal} = ${total}`
    if (isCorrect) tagText += ' ✓'
    else if (!isTrap) tagText += ' ✗'
  }

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-1"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 64,
        opacity,
        transition: 'opacity 0.3s',
      }}
    >
      <DotBarFigure spec={spec} width={60} />
      <span
        className="font-display text-xs font-bold"
        style={{
          color: isActive && isCorrect ? GREEN
               : isActive && isTrap ? ORANGE
               : isActive ? RED
               : isEliminated ? GREY
               : INK,
        }}
      >
        {label}
      </span>
      <AnimatePresence>
        {tagText !== null && (
          <motion.div
            key={`tag-${label}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[9px] font-bold"
            style={{
              background: isCorrect ? GREEN_BG : isTrap ? ORANGE_BG : RED_BG,
              color: isCorrect ? GREEN_TEXT : isTrap ? '#92400E' : '#B91C1C',
              border: `1.5px solid ${isCorrect ? GREEN : isTrap ? ORANGE : RED}`,
            }}
          >
            {tagText}
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

export default function DotBar2ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildDotBar2ECSteps(lang), [lang])
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
      ? 'Penjelasan: titik = 1, batang = 5. 12 = 2 batang + 2 titik. Gambar C (2 titik + 2 batang = 12) adalah jawabannya.'
      : 'Explainer: dot = 1, bar = 5. 12 = 2 bars + 2 dots. Picture C (2 dots + 2 bars = 12) is the answer.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five option panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isActive = beat.activeChoice === label
            const isCorrect = isActive && beat.activeResult === 'correct'
            const isTrap = isActive && beat.activeResult === 'trap'
            const isEliminated = beat.eliminated.has(label) && !isActive
            return (
              <OptionPanel
                key={label}
                label={label}
                isActive={isActive}
                isCorrect={isCorrect}
                isTrap={isTrap}
                isEliminated={isEliminated}
              />
            )
          })}
        </div>

        {/* Equation chip */}
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
