import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { MoneyBoard } from './Money22G1Illustration'
import { buildMoney22G1Steps, MONEY_ANSWER } from './money22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green (running total / winning total)
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'

export default function Money22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMoney22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung semua uang per kelompok. Tegel besar 50 + 10 + 10 = 70, tiga angka 5 jadi 5 + 5 + 5 = 15 sehingga 70 + 15 = 85, lalu sembilan koin 1 jadi 9 sehingga 85 + 9 = 94. Jadi totalnya ${MONEY_ANSWER}.`
      : `Explainer: count all the money in groups. The big tiles 50 + 10 + 10 = 70, the three 5s make 5 + 5 + 5 = 15 so 70 + 15 = 85, then the nine 1-coins make 9 so 85 + 9 = 94. So the total is ${MONEY_ANSWER}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The money board, ringing the group being added this beat. */}
        <MoneyBoard highlight={beat.highlight} />

        {/* Running-total chip: appears once we start adding, grows on each beat. */}
        {beat.total > 0 ? (
          <motion.div
            key={`total-${beat.total}`}
            className="flex items-center gap-2 font-display font-extrabold tabular-nums"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <span className="text-sm uppercase tracking-wide" style={{ color: BLUE }}>
              {beat.result ? T('Total', 'Total') : T('Running total', 'Total sejauh ini')}
            </span>
            <span
              className="flex h-10 min-w-[3rem] items-center justify-center rounded-xl px-3 text-2xl text-white"
              style={{ background: GREEN }}
            >
              {beat.total}
            </span>
          </motion.div>
        ) : null}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
