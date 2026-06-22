/**
 * IKMC-21-PE-Q5 — post-answer explainer: "Which path is the longest?"
 *
 * Strategy: count grid segments (each step between adjacent lattice points
 * is 1 unit). More segments = longer path, regardless of the area covered.
 *
 *   E: 20 segments (shortest)
 *   D: 24 segments
 *   C: 26 segments
 *   B: 28 segments
 *   A: 34 segments ← longest → answer A
 *
 * Animation walks through each path in ascending order (E → D → C → B → A),
 * counting segments, then lands on the result.
 *
 * Reuses Paths5PEOption from Paths5PEIllustration so the explainer looks like
 * the same paths from the question coming alive.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Paths5PEOption } from './Paths5PEIllustration'
import { buildPaths5PESteps } from './paths5PESteps'

// ── Colour tokens (echo qupu design system) ──────────────────────────────────
const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TXT= '#065F46'
const ORANGE   = '#F59E0B'
const ORANGE_BG= '#FFF7ED'
const ORANGE_TXT='#92400E'
const INK      = '#1F2937'
const MUTED    = '#9CA3AF'

// ── Path panel ────────────────────────────────────────────────────────────────

interface PathPanelProps {
  label: 'A' | 'B' | 'C' | 'D' | 'E'
  active: boolean
  isAnswer: boolean
  segments: number | null
}

function PathPanel({ label, active, isAnswer, segments }: PathPanelProps) {
  let borderColor = MUTED
  if (active && isAnswer) borderColor = GREEN
  else if (active) borderColor = ORANGE

  const tagBg    = isAnswer ? GREEN_BG  : ORANGE_BG
  const tagColor = isAnswer ? GREEN_TXT : ORANGE_TXT
  const tagBorder= isAnswer ? GREEN     : ORANGE

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 4px 2px',
        background: '#fff',
        minWidth: 56,
      }}
    >
      {/* Reuse the option SVG — pass a synthetic WmiChoice */}
      <Paths5PEOption choice={{ label, text: `(figure ${label})` }} />

      {/* Label */}
      <span
        className="font-display text-xs font-bold"
        style={{ color: active && isAnswer ? GREEN : active ? ORANGE : INK }}
      >
        {label}
      </span>

      {/* Segment count chip */}
      <AnimatePresence>
        {active && segments !== null && (
          <motion.div
            key={`seg-${label}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[10px] font-bold"
            style={{
              background: tagBg,
              color: tagColor,
              border: `1.5px solid ${tagBorder}`,
            }}
          >
            {segments}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Paths5PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPaths5PESteps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult    = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung segmen kotak setiap jalur — E:20, D:24, C:26, B:28, A:34. Jalur A memiliki segmen terbanyak → jalur terpanjang. Jawaban A.'
      : 'Explainer: count grid segments per path — E:20, D:24, C:26, B:28, A:34. Path A has the most segments → the longest path. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five path panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isActive   = beat.activeLabel === label
            const isAnswer   = label === 'A' && (beat.isAnswer || beat.result)
            const showSegments = isActive ? beat.segments : null
            return (
              <PathPanel
                key={label}
                label={label}
                active={isActive}
                isAnswer={isAnswer}
                segments={showSegments}
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
