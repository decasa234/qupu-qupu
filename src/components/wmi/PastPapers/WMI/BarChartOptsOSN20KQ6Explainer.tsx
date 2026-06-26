import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PopBarChart } from './BarChartOptsOSN20KQ6Illustration'
import { buildBarChartOptsOSN20KQ6Steps } from './barChartOptsOSN20KQ6Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'

export default function BarChartOptsOSN20KQ6Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildBarChartOptsOSN20KQ6Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: data 2015=124, 2016=140, 2017=120, 2018=160. Batang 2017 paling pendek, 2018 tertinggi. Diagram A sesuai.'
      : 'Explainer: data 2015=124, 2016=140, 2017=120, 2018=160. Bar 2017 shortest, 2018 tallest. Diagram A matches.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Chart — always Diagram A (the correct one) */}
        <motion.div
          key={beat.focusYear ?? 'all'}
          initial={{ opacity: 0.7, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <PopBarChart diagram={beat.diagram} focusYear={beat.focusYear} />
        </motion.div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          className="w-full min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          {beat.caption}
        </motion.div>

        {/* Answer chip */}
        {beat.result && (
          <motion.div
            key="chip"
            className="rounded-xl px-5 py-2 font-display text-base font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {lang === 'id' ? 'Jawaban: A' : 'Answer: A'}
          </motion.div>
        )}
      </div>
    </div>
  )
}
