// SEAMOX-20-A-Q19 — post-answer explainer for "What is the missing figure?"
//
// Walks through the analogy rule beat-by-beat:
//   0. observe   — first pair: diamond → square with X.
//   1. rule      — the shape flips 180° and shows only its plain outline.
//   2. apply     — so the upward subdivided triangle flips to a plain inverted triangle.
//   3. elim A    — A still has subdivisions. Cross it out.
//   4. elim C    — C adds new median lines. Cross it out.
//   5. elim D    — D has Y-pattern lines. Cross it out.
//   6. result    — B is the plain inverted triangle. Answer: B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeAnalogy20A19Option } from './ShapeAnalogy20A19Illustration'
import { buildShapeAnalogy20A19Steps } from './shapeAnalogy20A19Steps'

const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TXT= '#065F46'
const RED      = '#EF4444'
const RED_BG   = '#FEE2E2'

const OPTIONS = ['A', 'B', 'C', 'D'] as const

// ---------------------------------------------------------------------------
// Mini option card — shown in the option strip with highlight / cross states
// ---------------------------------------------------------------------------

interface OptionCardProps {
  label: typeof OPTIONS[number]
  active: boolean
  isAnswer: boolean
  showCross: boolean
}

function OptionCard({ label, active, isAnswer, showCross }: OptionCardProps) {
  let border = '#D1D5DB'
  let bg = '#fff'
  if (active && isAnswer) { border = GREEN; bg = GREEN_BG }
  else if (active && showCross) { border = RED; bg = RED_BG }
  else if (active) { border = BLUE; bg = BLUE_BG }

  // Fake WmiChoice object for the Option renderer
  const fakeChoice = { label, text: `(figure ${label})` }

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center gap-0.5 rounded-lg"
      style={{ border: `2.5px solid ${border}`, background: bg, padding: '4px 6px', minWidth: 60 }}
      animate={{ scale: active ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <ShapeAnalogy20A19Option choice={fakeChoice} />
      <span
        className="font-display text-xs font-bold"
        style={{ color: active && isAnswer ? GREEN_TXT : active && showCross ? RED : '#374151' }}
      >
        {label}
      </span>

      {/* Cross overlay */}
      <AnimatePresence>
        {active && showCross && (
          <motion.div
            key="cross"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden="true">
              <line x1={6} y1={6} x2={38} y2={38} stroke={RED} strokeWidth={4} strokeLinecap="round" />
              <line x1={38} y1={6} x2={6} y2={38} stroke={RED} strokeWidth={4} strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function ShapeAnalogy20A19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeAnalogy20A19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan analogi adalah putar/balik bentuk 180°. Berlian polos → persegi dengan X. Segitiga ke atas yang dibagi → segitiga terbalik polos (pilihan B).'
      : 'Explainer: the analogy rule is flip the shape 180°. Plain diamond → square with X. Subdivided upward triangle → plain inverted triangle (option B).'

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Options strip */}
        <div className="flex flex-wrap justify-center gap-2">
          {OPTIONS.map((label) => {
            const isActive = beat.activeOption === label
            return (
              <OptionCard
                key={label}
                label={label}
                active={isActive}
                isAnswer={beat.isAnswer && isActive}
                showCross={beat.showCross && isActive}
              />
            )
          })}
        </div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.phase + (beat.activeOption ?? '')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={captionStyle}
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
