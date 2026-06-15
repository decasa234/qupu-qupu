// Post-answer explainer for WMI-24F1A-Q16 (2024 Grade 1 Final) — ★ = 9.
//
// Plays AFTER the learner answers, so it may reveal the answer. It teaches the
// METHOD: name the goal, expose the two column rules (first number −1, second
// number +2), then read results down the list (27, 24, 21, 18, 15, 12) until
// the ★ row 22 − 13 lands on 9. The board is the SAME ExprPattern24G1 primitive
// from the static figure — we drive its `revealUpTo` / `showResults` per beat so
// the animation reads as that scene coming alive.
//
// Deterministic & SSR-safe: a pure render of the storyboard, an <svg> every beat.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ExprPattern24G1 } from './ExprPattern24G1Illustration'
import { buildExprPattern24G1Steps } from './exprPattern24G1Steps'

// Echo the qupu tokens used by the static figure so the scene reads as one.
const LABEL = '#30598A' // brand blue
const INK = '#1F2937'
const STAR_FILL = '#FBBF6B'
const GREEN = '#10B981'
const MINUEND_TINT = '#E1EFFB' // cool blue — "first number" rule
const SUBTRAHEND_TINT = '#FFF2DF' // warm cream — "second number" rule

export default function ExprPattern24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildExprPattern24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Explainer: the first number drops by 1 and the second climbs by 2, so the 7th result is ${story.answer}.`,
    `Penjelasan: angka depan turun 1 dan angka belakang naik 2, jadi hasil ke-7 adalah ${story.answer}.`,
  )

  // The rule badge shown above the board on the two "rule" beats.
  const ruleBadge =
    beat.phase === 'ruleMinuend'
      ? { tint: MINUEND_TINT, text: T('first number  −1', 'angka depan  −1'), color: LABEL }
      : beat.phase === 'ruleSubtrahend'
        ? { tint: SUBTRAHEND_TINT, text: T('second number  +2', 'angka belakang  +2'), color: '#B4791F' }
        : null

  // Caption box colour: warm/green on the winning beat, blue otherwise.
  const boxStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: LABEL, color: LABEL }

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Rule badge — animates in only on the two rule beats. */}
        <div className="flex min-h-[30px] items-center justify-center">
          {ruleBadge && (
            <motion.div
              key={beat.phase}
              initial={{ opacity: 0, y: -6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="rounded-full border-2 px-3 py-1 font-display text-xs font-black tabular-nums"
              style={{ background: ruleBadge.tint, borderColor: ruleBadge.color, color: ruleBadge.color }}
            >
              {ruleBadge.text}
            </motion.div>
          )}
        </div>

        {/* The shared sequence board, revealed beat by beat. */}
        <motion.div
          key={`board-${beat.revealUpTo}-${beat.showResults ? 1 : 0}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <ExprPattern24G1 revealUpTo={beat.revealUpTo} showResults={beat.showResults} />
        </motion.div>

        {/* The ★ answer chip, springing in on the winning beat. */}
        {beat.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 18 }}
            className="flex items-center gap-2 font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            <span aria-hidden style={{ color: STAR_FILL, WebkitTextStroke: `1px ${INK}` }}>
              ★
            </span>
            <span>= {story.answer}</span>
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={boxStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
