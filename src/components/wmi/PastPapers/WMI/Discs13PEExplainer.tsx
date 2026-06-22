// IKMC-22-PE-Q13 — post-answer explainer: view from above a disc stack.
//
// Reuses DiscStackPrimitive from Discs13PEIllustration (side view).
// Animation walk:
//   0. intro      — show side view; look straight down.
//   1. identify   — highlight the tiny top-disc center.
//   2. unfold     — show all 6 rings building outward.
//   3. checkA     — highlight the outermost orange ring confirming option A.
//   4. result     — full top-view; announce A.
//
// Answer: A.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiscStackPrimitive, STEM_W, STEM_H } from './Discs13PEIllustration'
import { buildDiscs13PESteps } from './discs13PESteps'

// ── Colour tokens ────────────────────────────────────────────────────────────
const COL_ORANGE = '#E07030'
const COL_BLUE   = '#2060A0'
const COL_CREAM  = '#F0DFA0'
const INK        = '#1F2937'

const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'

// ── Top-view figure (full 6-ring answer A) used in the explainer ─────────────

const RINGS = [
  { r: 42, fill: COL_ORANGE },
  { r: 34, fill: COL_BLUE   },
  { r: 26, fill: COL_CREAM  },
  { r: 18, fill: COL_BLUE   },
  { r: 10, fill: COL_ORANGE },
  { r:  4, fill: COL_BLUE   },
] as const

const TOP_VB = 100
const TOP_CX = 50
const TOP_CY = 50

interface TopViewProps {
  /** Which ring index (0=outermost) to highlight (glowing border). null = all. */
  highlightRing: number | null
  /** Number of rings to draw (for progressive reveal). 0–6 */
  ringCount?: number
}

function TopViewFigure({ highlightRing, ringCount = 6 }: TopViewProps) {
  const visibleRings = RINGS.slice(0, ringCount)

  return (
    <svg
      viewBox={`0 0 ${TOP_VB} ${TOP_VB}`}
      width={TOP_VB}
      height={TOP_VB}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={TOP_VB} height={TOP_VB} fill="white" />
      {visibleRings.map(({ r, fill }, i) => {
        const isHighlit = highlightRing !== null && i === highlightRing
        return (
          <circle
            key={i}
            cx={TOP_CX}
            cy={TOP_CY}
            r={r}
            fill={fill}
            stroke={isHighlit ? '#FACC15' : INK}
            strokeWidth={isHighlit ? 3 : 1.2}
          />
        )
      })}
    </svg>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Discs13PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildDiscs13PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const showTopView = beat.phase === 'unfold' || beat.phase === 'checkA' || beat.phase === 'result'

  // How many rings to reveal for the 'unfold' beat
  const ringCount = beat.phase === 'unfold' ? 6 : beat.phase === 'identify' ? 1 : 6

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lihat ke bawah tumpukan — cakram teratas biru kecil di tengah, lalu cincin oranye, biru, krem, biru, oranye ke luar. Pilihan A cocok — jawaban A.'
      : 'Explainer: look down at the stack — top disc is tiny blue at centre, then orange, blue, cream, blue, orange rings outward. Option A matches — answer A.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure: side-view stem → top-view answer */}
        <AnimatePresence mode="wait">
          {showTopView ? (
            <motion.div
              key={`top-${beat.phase}-${beat.highlight}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <TopViewFigure
                highlightRing={beat.highlight}
                ringCount={ringCount}
              />
            </motion.div>
          ) : (
            <motion.div
              key="side-view"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.7 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <svg
                viewBox={`0 0 ${STEM_W} ${STEM_H}`}
                width={STEM_W}
                height={STEM_H}
                aria-hidden="true"
                style={{ display: 'block' }}
              >
                <rect x={0} y={0} width={STEM_W} height={STEM_H} fill="white" />
                <DiscStackPrimitive />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
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
