/**
 * IKMC-22-PE-Q12 — post-answer explainer: which picture has a unique shape?
 *
 * Teaches the "compare shapes across pictures" strategy:
 *   Beat 0 — intro: five tangram animals, look for the odd shape.
 *   Beat 1 — A, B, C, E all use triangles, diamonds, parallelograms.
 *   Beat 2 — D (dog) has a horizontal rectangle as its body.
 *   Beat 3 — that rectangle is absent in A, B, C, E.
 *   Beat 4 — answer: D.
 *
 * Reuses TangramFigure + COLORS from ShapeOdd12PEIllustration so the
 * animation reads as the same scene coming alive.
 *
 * No raster, no random, no Date — SSR-safe.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TangramFigure } from './ShapeOdd12PEIllustration'
import { buildShapeOdd12PESteps } from './shapeOdd12PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN       = '#10B981'
const GREEN_BG    = '#D1FAE5'
const GREEN_TEXT  = '#065F46'
const BLUE        = '#30598A'
const BLUE_BG     = '#E1EFFB'
const ORANGE      = '#F59E0B'
const ORANGE_BG   = '#FFF7ED'
const ORANGE_TEXT = '#92400E'
const INK         = '#1F2937'
const GRAY_BORDER = '#D1D5DB'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ── Animal panel ──────────────────────────────────────────────────────────────

interface AnimalPanelProps {
  label: string
  active: boolean
  isAnswer: boolean
  tag: string
}

function AnimalPanel({ label, active, isAnswer, tag }: AnimalPanelProps) {
  let borderColor = GRAY_BORDER
  if (active && isAnswer)  borderColor = GREEN
  else if (active)         borderColor = ORANGE

  const labelColor = active && isAnswer ? GREEN
    : active ? ORANGE
    : INK

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 68,
      }}
    >
      <TangramFigure label={label} size={64} />

      <span
        className="font-display text-xs font-bold"
        style={{ color: labelColor }}
      >
        {label}
      </span>

      <AnimatePresence>
        {active && tag && (
          <motion.div
            key={`tag-${label}-${tag}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[9px] font-bold"
            style={{
              background: isAnswer ? GREEN_BG : ORANGE_BG,
              color:      isAnswer ? GREEN_TEXT : ORANGE_TEXT,
              border:     `1.5px solid ${isAnswer ? GREEN : ORANGE}`,
              maxWidth: 72,
              lineHeight: 1.2,
            }}
          >
            {tag}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function ShapeOdd12PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShapeOdd12PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG,  borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG,   borderColor: BLUE,  color: BLUE      }

  const pillColor = isResult ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: A, B, C, E menggunakan segitiga, belah ketupat, dan jajargenjang. Gambar D (anjing) adalah satu-satunya yang memiliki persegi panjang. Jawaban D.'
      : 'Explainer: A, B, C, E use triangles, diamonds, and parallelograms. Picture D (dog) is the only one with a rectangle. Answer D.'

  const highlightSet = new Set(beat.highlight)

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five animal panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const active   = highlightSet.has(label)
            const isAnswer = label === 'D' && (beat.phase === 'spotD' || beat.phase === 'compare' || beat.phase === 'result')
            return (
              <AnimalPanel
                key={label}
                label={label}
                active={active}
                isAnswer={isAnswer}
                tag={active ? beat.tag : ''}
              />
            )
          })}
        </div>

        {/* Pill / tag chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.tag && (
              <motion.span
                key={beat.tag + beat.phase}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: pillColor }}
              >
                {beat.tag}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption box */}
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
