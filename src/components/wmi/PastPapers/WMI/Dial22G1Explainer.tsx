import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PasswordDial } from './Dial22G1Illustration'
import { buildDial22G1Steps } from './dial22G1Steps'

// Mirror the qupu palette used across the paper figures.
const GREEN = '#10B981' // fill-qupu-green
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_SOFT = '#E1EFFB'
const INK = '#1F2937'

export default function Dial22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDial22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const directionLabel =
    beat.direction === 'cw'
      ? lang === 'id'
        ? `Putar ${beat.steps} searah jarum jam`
        : `Turn ${beat.steps} clockwise`
      : beat.direction === 'ccw'
        ? lang === 'id'
          ? `Putar ${beat.steps} berlawanan jarum jam`
          : `Turn ${beat.steps} counterclockwise`
        : null

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: penunjuk mulai di angka 0, lalu tiap putaran (searah atau berlawanan jarum jam) berhenti di angka baru yang dibaca satu per satu — 9, 3, 1, 2, 8. Sandinya ${story.answer}.`
      : `Explainer: the pointer starts on 0, then each turn (clockwise or counterclockwise) lands on a new number we read one at a time — 9, 3, 1, 2, 8. The password is ${story.answer}.`

  const passwordDigits = beat.password.split('')

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The dial, mirroring the static figure. */}
        <div className="relative">
          <PasswordDial pointerIndex={beat.pointerIndex} />

          {/* Turn-direction badge floats above the dial during the turns. */}
          <AnimatePresence>
            {directionLabel && (
              <motion.div
                key={`${index}-${directionLabel}`}
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
                style={{
                  background: beat.direction === 'cw' ? '#FEF3C7' : '#EDE9FE',
                  borderColor: beat.direction === 'cw' ? '#D97706' : '#7C3AED',
                  color: beat.direction === 'cw' ? '#92400E' : '#5B21B6',
                }}
              >
                {beat.direction === 'cw' ? '↻ ' : '↺ '}
                {directionLabel}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Running password readout: one digit slot per turn. */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-display text-[11px] font-extrabold uppercase tracking-wide"
            style={{ color: BLUE }}
          >
            {story.passwordLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {passwordDigits.length === 0 ? (
              <span
                className="font-display text-2xl font-black"
                style={{ color: '#9CA3AF' }}
                aria-hidden
              >
                _
              </span>
            ) : (
              passwordDigits.map((d, i) => {
                const isNewest = i === passwordDigits.length - 1 && !beat.result && beat.phase === 'turn'
                return (
                  <motion.span
                    key={`${i}-${d}`}
                    initial={isNewest ? { opacity: 0, scale: 0.4, y: -10 } : false}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="flex h-10 w-9 items-center justify-center rounded-lg border-2 font-display text-2xl font-black"
                    style={{
                      background: beat.result ? '#D1FAE5' : isNewest ? '#FFF7ED' : BLUE_SOFT,
                      borderColor: beat.result ? GREEN : isNewest ? '#D97706' : BLUE,
                      color: beat.result ? '#065F46' : INK,
                    }}
                  >
                    {d}
                  </motion.span>
                )
              })
            )}
          </div>
        </div>

        {/* Kid-first caption. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
