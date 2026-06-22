/**
 * Sticks1PEExplainer — IKMC-21-PE-Q1
 *
 * Post-answer animated explainer: "Which shape can be made from 3 equal sticks?"
 * Answer: E (6-armed star, 3 sticks at 0°/60°/120°).
 *
 * Layout:
 *   Top — 5 option panels (A–E), each showing the stick figure from
 *          Sticks1PEIllustration.  The active spotlight gets a coloured border;
 *          eliminated options get a red badge "✗".
 *   Bottom — equation chip + caption box.
 *
 * Beat-by-beat walk (see sticks1PESteps.ts):
 *   0. intro      — all options shown neutrally, "3 sticks, same length" rule.
 *   1. countSticks— concept: arms ÷ 2 = sticks.
 *   2. checkA     — A spotlit red: 8 arms ÷ 2 = 4 sticks ✗.
 *   3. checkB     — B spotlit red: unequal lengths ✗.
 *   4. checkCD    — C & D spotlit red: unequal or too many ✗.
 *   5. checkE     — E spotlit green: 6 arms ÷ 2 = 3 sticks ✓.
 *   6. result     — E green, A–D all dimmed red.
 *
 * Reuses option components via Sticks1PEOption (from Sticks1PEIllustration)
 * so the animation reads as the same scene coming alive.
 *
 * Pure React + framer-motion.  No random, no Date.  SSR-safe.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Sticks1PEOption } from './Sticks1PEIllustration'
import { buildSticks1PESteps } from './sticks1PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED        = '#EF4444'
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const NEUTRAL    = '#D1D5DB'
const INK        = '#1F2937'

// ── Option labels ─────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const
type OptionLabel = (typeof LABELS)[number]

// ── OptionPanel ───────────────────────────────────────────────────────────────

interface OptionPanelProps {
  label: OptionLabel
  /** Spotlight type for this beat: 'correct' | 'wrong' | null */
  spotlight: 'correct' | 'wrong' | null
  /** Whether this option has been eliminated (show ✗ badge). */
  eliminated: boolean
}

function OptionPanel({ label, spotlight, eliminated }: OptionPanelProps) {
  const isCorrect  = spotlight === 'correct'
  const isWrong    = spotlight === 'wrong'
  const isActive   = spotlight !== null

  let borderColor = NEUTRAL
  if (isCorrect) borderColor = GREEN
  else if (isWrong) borderColor = RED

  const dimmed = !isActive && eliminated

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        opacity: dimmed ? 0.45 : 1,
        minWidth: 56,
        position: 'relative',
      }}
    >
      <Sticks1PEOption choice={{ label, text: `(${label})` }} />

      {/* Letter label */}
      <span
        className="font-display text-xs font-bold"
        style={{ color: isCorrect ? GREEN : isWrong ? RED : INK }}
      >
        {label}
      </span>

      {/* ✗ badge for eliminated options */}
      <AnimatePresence>
        {eliminated && (
          <motion.div
            key={`elim-${label}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full font-display text-[11px] font-black"
            style={{ background: RED, color: '#fff' }}
          >
            ✗
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✓ badge for the correct answer option */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            key={`correct-${label}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full font-display text-[11px] font-black"
            style={{ background: GREEN, color: '#fff' }}
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Sticks1PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildSticks1PESteps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const equationStyle = isResult
    ? { background: GREEN }
    : { background: BLUE }

  // Build per-option state
  const spotlightSet  = new Set(beat.spotlight)
  const eliminatedSet = new Set(beat.eliminated)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Hitung lengan lalu bagi 2 untuk mendapat jumlah batang. A=4 batang, B=panjang berbeda, C=panjang berbeda, D=6 batang, E=3 batang semua sama panjang. Jawaban E.'
      : 'Explainer: Count arms then divide by 2 for stick count. A=4 sticks, B=unequal lengths, C=unequal lengths, D=6 sticks, E=3 sticks all equal length. Answer E.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five option panels */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LABELS.map((label) => {
            const inSpotlight = spotlightSet.has(label as OptionLabel)
            const spotType: 'correct' | 'wrong' | null = inSpotlight
              ? label === 'E'
                ? 'correct'
                : 'wrong'
              : null

            return (
              <OptionPanel
                key={label}
                label={label as OptionLabel}
                spotlight={spotType}
                eliminated={eliminatedSet.has(label as OptionLabel)}
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
                style={equationStyle}
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
