import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HeightBars } from './HeightOrder22G1Illustration'
import {
  buildHeightOrder22G1Steps,
  HEIGHT_ORDER_ANSWER,
  HEIGHT_ORDER_CHOICE,
  type ChildName,
} from './heightOrder22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'
const AMBER = '#F59E0B' // fill-qupu-yellow (the freshly-placed child)

export default function HeightOrder22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHeightOrder22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pakai petunjuk satu per satu untuk mengurutkan tinggi anak. Dan paling tinggi, Pan lebih tinggi dari Ken, Ken lebih tinggi dari Ann. Tertinggi ke terpendek: Dan, Pan, Ken, Ann. Jawabannya ${HEIGHT_ORDER_CHOICE}.`
      : `Explainer: use the clues one at a time to order the kids by height. Dan is tallest, Pan is taller than Ken, Ken is taller than Ann. Tallest to shortest: Dan, Pan, Ken, Ann. The answer is ${HEIGHT_ORDER_CHOICE}.`

  const focus = new Set<ChildName>(beat.focus)

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Heading: which clue we are applying. */}
        <div className="font-display text-xs font-extrabold uppercase tracking-wide" style={{ color: BLUE }}>
          {beat.phase === 'unknown'
            ? T('Who is tallest?', 'Siapa yang paling tinggi?')
            : beat.phase === 'result'
              ? T('Tallest to shortest', 'Tertinggi ke terpendek')
              : T(`Clue ${index}`, `Petunjuk ${index}`)}
        </div>

        {/* The bars come alive: each clue animates a child up or down. */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <HeightBars heights={beat.heights} />
        </motion.div>

        {/* Focus chips — the children touched by this clue light up amber. */}
        {focus.size > 0 && !beat.result ? (
          <motion.div
            key={`focus-${beat.phase}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {(['Dan', 'Pan', 'Ken', 'Ann'] as ChildName[])
              .filter((name) => focus.has(name))
              .map((name, i) => (
                <motion.div
                  key={name}
                  className="flex h-8 items-center justify-center rounded-lg px-3 font-display text-sm font-extrabold text-white"
                  style={{ background: AMBER }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 18 }}
                >
                  {name}
                </motion.div>
              ))}
          </motion.div>
        ) : null}

        {/* Final order strip — only on the winning beat. */}
        {beat.result ? (
          <motion.div
            key="order"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {story.order.map((name, i) => (
              <motion.div
                key={name}
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 * i }}
              >
                <span
                  className="flex h-9 items-center justify-center rounded-lg px-3 font-display text-base font-extrabold text-white"
                  style={{ background: GREEN }}
                >
                  {name}
                </span>
                {i < story.order.length - 1 ? (
                  <span className="font-display text-base font-extrabold" style={{ color: GREEN_INK }}>
                    {'>'}
                  </span>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

// Re-exported so the static answer is visible to readers of this module.
export { HEIGHT_ORDER_ANSWER }
