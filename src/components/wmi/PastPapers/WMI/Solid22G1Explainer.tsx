/**
 * Solid22G1Explainer — WMI-22F1A-Q7 (Grade 1)
 *
 * Post-answer animation teaching the "same-solid-turned / odd-one-out" strategy:
 *   1. Show all four cube solids A, B, C, D.
 *   2. A → count its cubes; it is the model shape.
 *   3. B → same cube count, same shape, just turned → matches A.
 *   4. C → same cube count, same shape, turned again → matches A and B.
 *   5. D → count its cubes; it does NOT match (different count / un-turnable shape).
 *   6. Result: A, B, C are one solid turned different ways; D is the odd one out.
 *
 * Mirrors the static figure by reusing the illustrator's CubeSolid + SOLID_SETS,
 * so the animation reads as the same scene coming alive. Cube counts shown in the
 * captions are derived from SOLID_SETS (see solid22G1Steps), so they can't drift.
 *
 * SSR-safe — no Math.random, no Date, pure render of props + lang.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SOLID_SETS, CubeSolid } from './Solid22G1Option'
import { buildSolid22G1Steps, type SolidLabel } from './solid22G1Steps'

// ── Colour tokens (echo the qupu palette used by the static figure) ──────────
const GREEN = '#10B981' // fill-qupu-green — matched / correct
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'
const AMBER = '#F59E0B' // focus glow
const RED = '#DC2626' // odd-one-out flag
const RED_BG = '#FEE2E2'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const INK = '#1F2937'

const LABELS: SolidLabel[] = ['A', 'B', 'C', 'D']

export default function Solid22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSolid22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: A, B, dan C adalah balok yang sama diputar dengan cara berbeda; D bentuknya berbeda, jadi D yang ganjil. Jawabannya D.`
      : `Explainer: A, B and C are the same block solid turned different ways; D is a different shape, so D is the odd one out. The answer is D.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Four-solid board */}
        <div className="grid w-full grid-cols-4 gap-2">
          {LABELS.map((label) => {
            const isFocus = beat.focus === label
            const isMatched = beat.matched.includes(label)
            const isOdd = beat.flaggedOdd === label
            const cubes = SOLID_SETS[label] ?? []
            const count = cubes.length

            // Card framing colours: odd → red, matched (settled) → green,
            // currently-focused → amber, otherwise neutral.
            const borderColor = isOdd ? RED : isMatched ? GREEN_BORDER : isFocus ? AMBER : '#CBD5E1'
            const bg = isOdd ? RED_BG : isMatched ? GREEN_BG : '#FFFFFF'
            const labelColor = isOdd ? '#991B1B' : isMatched ? GREEN_TEXT : INK

            return (
              <motion.div
                key={label}
                className="relative flex flex-col items-center rounded-xl border-2 px-1 pb-1 pt-2"
                style={{ background: bg, borderColor }}
                animate={{
                  scale: isFocus ? 1.06 : 1,
                  boxShadow: isFocus
                    ? `0 0 0 3px ${isOdd ? 'rgba(220,38,38,0.35)' : 'rgba(245,158,11,0.4)'}`
                    : '0 0 0 0 rgba(0,0,0,0)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {/* Solid drawing — same renderer as the static figure */}
                <div className="flex h-[68px] w-full items-end justify-center">
                  <CubeSolid cubes={cubes} highlight={isOdd ? 'odd' : isMatched ? 'match' : undefined} />
                </div>

                {/* Label + cube count tag */}
                <div className="flex items-center gap-1">
                  <span className="font-display text-sm font-extrabold" style={{ color: labelColor }}>
                    {label}
                  </span>
                  <AnimatePresence>
                    {beat.showCount && (isFocus || isMatched || isOdd) && (
                      <motion.span
                        key="count"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-full px-1.5 text-[10px] font-bold"
                        style={{
                          background: isOdd ? RED : isMatched ? GREEN : AMBER,
                          color: '#fff',
                        }}
                      >
                        {count} {story.cubesLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Odd-one-out cross flag */}
                <AnimatePresence>
                  {isOdd && (
                    <motion.div
                      key="odd-flag"
                      initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: RED }}
                      aria-hidden="true"
                    >
                      ✕
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Matched check mark */}
                <AnimatePresence>
                  {isMatched && !isOdd && beat.matched.includes(label) && (
                    <motion.div
                      key="match-flag"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: GREEN }}
                      aria-hidden="true"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Caption strip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
