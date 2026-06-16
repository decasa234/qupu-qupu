import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CircleRectFigure, FIGURES } from './CircleRect22G1Option'
import { buildCircleRect22G1Steps } from './circleRect22G1Steps'

// WMI-22F1A-Q10 (Grade 1). "Which figure has MORE circles than rectangles?"
// The animation states the goal, then walks figures A→D: it rings the circles
// (shows the count), rings the rectangles (shows the count), and judges whether
// circles > rectangles. Only figure A passes, so it lands on A.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_INK = '#991B1B'
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Count-chip palette echoing the qupu shape tokens (circle = brand blue, rect = amber).
const CIRCLE_INK = '#1D6FB8'
const CIRCLE_BG = '#E1EFFB'
const RECT_INK = '#B45309'
const RECT_BG = '#FEF3C7'
const MUTED_INK = '#94A3B8'
const MUTED_BG = '#F1F5F9'

function CountChip({
  glyph,
  label,
  count,
  show,
  ink,
  bg,
}: {
  glyph: '○' | '▭'
  label: string
  count: number
  show: boolean
  ink: string
  bg: string
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
      style={{
        background: show ? bg : MUTED_BG,
        color: show ? ink : MUTED_INK,
        borderColor: show ? ink : '#CBD5E1',
      }}
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{label}</span>
      <span className="tabular-nums">{show ? count : '?'}</span>
    </div>
  )
}

export default function CircleRect22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCircleRect22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The figure under test (default to the answer on the goal-framing intro beat).
  const shown = beat.label ?? story.answer
  const fig = FIGURES[shown]
  const verdictPass = beat.verdict === 'pass'
  const verdictFail = beat.verdict === 'fail'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: cari gambar dengan lebih banyak lingkaran daripada persegi panjang. Cek tiap pilihan dengan menghitung lingkaran dan persegi panjangnya. Hanya gambar ${story.answer} yang lebih banyak lingkaran (${FIGURES[story.answer].circles} lawan ${FIGURES[story.answer].rects}), jadi jawabannya ${story.answer}.`
      : `Explainer: find the figure with more circles than rectangles. Check each option by counting its circles and rectangles. Only figure ${story.answer} has more circles (${FIGURES[story.answer].circles} vs ${FIGURES[story.answer].rects}), so the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Option label badge + the figure under test (rings circles, then rectangles). */}
        <div className="flex flex-col items-center gap-2">
          {beat.label && (
            <motion.div
              key={`label-${beat.label}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-lg font-black"
              style={
                beat.result
                  ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                  : { background: BLUE_BG, color: BLUE_INK, borderColor: BLUE_INK }
              }
            >
              {beat.label}
            </motion.div>
          )}

          <motion.div
            key={`fig-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="rounded-2xl border-2 bg-white px-3 py-2"
            style={{ borderColor: beat.result ? GREEN : '#E2E8F0' }}
          >
            <CircleRectFigure label={shown} markShape={beat.mark} />
          </motion.div>
        </div>

        {/* Count chips: circles vs rectangles, revealed as each is marked. */}
        <div className="flex items-center gap-2">
          <CountChip
            glyph="○"
            label={story.circlesLabel}
            count={fig.circles}
            show={beat.showCircles}
            ink={CIRCLE_INK}
            bg={CIRCLE_BG}
          />
          <CountChip
            glyph="▭"
            label={story.rectsLabel}
            count={fig.rects}
            show={beat.showRects}
            ink={RECT_INK}
            bg={RECT_BG}
          />
          {(verdictPass || verdictFail) && (
            <motion.div
              key={`verdict-${index}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-sm font-black"
              style={
                verdictPass
                  ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                  : { background: RED_BG, color: RED_INK, borderColor: RED }
              }
              aria-hidden="true"
            >
              {verdictPass ? '✓' : '✗'}
            </motion.div>
          )}
        </div>

        {/* Caption box — blue while deducing, green on the winning beat. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
