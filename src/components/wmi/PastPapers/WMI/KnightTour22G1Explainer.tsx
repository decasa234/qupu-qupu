/**
 * WMI-22F1A-Q22 — Knight's Tour explainer (Grade 1).
 *
 * Teaches the count-the-hops strategy beat-by-beat: the chess Horse must visit
 * EVERY square exactly once, starting on 1 and ending on 12. We walk the tour
 * one L-jump per beat — `KnightBoard` fills square n and draws the move into it
 * — and watch which hop lands on the ★ square. It turns out to be the 9th square
 * the Horse reaches, so ★ = 9. We DEDUCE this by hopping, never by asserting.
 *
 * The board geometry, the verified path `KNIGHT_TOUR`, and the `KnightBoard`
 * primitive all belong to the illustrator's file; this component only animates
 * the beats the storyboard derives from that data.
 *
 * SSR-safe, deterministic — no Math.random, no Date. Pure render of the beat.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { KnightBoard } from './KnightTour22G1Illustration'
import { buildKnightTour22G1Steps, KNIGHT_TOUR_G1_ANSWER } from './knightTour22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'
const STAR_RED = '#DC2626' // the ★ glyph

export default function KnightTour22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildKnightTour22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  // Highlight the caption while the Horse is actually standing on the ★ square.
  const isStarBeat = beat.onStar

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan jalur Kuda catur: Kuda melompat membentuk huruf L, mengunjungi setiap kotak satu kali dari 1 sampai 12. Dengan menghitung lompatan, kotak ★ ternyata kotak ke-${story.starStep} yang dikunjungi, jadi ★ = ${story.answer}.`
      : `Knight's tour explainer: the chess Horse hops in an L-shape, visiting every square once from 1 to 12. Counting the hops, the ★ square turns out to be the ${story.starStep}th visited, so ★ = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The board comes alive: each beat fills one more square and draws the L-jump into it. */}
        <motion.div
          key={beat.upto}
          className="w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          {/* `star` is a boolean: show the ★ marker while its cell is still blank.
              The board hides it automatically once the Horse numbers that cell. */}
          <KnightBoard upto={beat.upto} star />
        </motion.div>

        {/* Result chip — ★ = 9, only on the winning beat. */}
        {isResult ? (
          <motion.div
            key="answer-chip"
            className="flex items-center gap-2 font-display text-base font-extrabold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <span style={{ color: STAR_RED, fontSize: '1.4em', lineHeight: 1 }}>★</span>
            <span style={{ color: GREEN_INK }}>= {KNIGHT_TOUR_G1_ANSWER}</span>
          </motion.div>
        ) : null}

        {/* Caption box. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : isStarBeat
                ? { background: '#FEE2E2', borderColor: STAR_RED, color: '#991B1B' }
                : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

// Re-exported so the static answer is visible to readers of this module.
export { KNIGHT_TOUR_G1_ANSWER }
