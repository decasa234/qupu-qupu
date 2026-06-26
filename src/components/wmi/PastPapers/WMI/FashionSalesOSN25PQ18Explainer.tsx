// OSN 2025 SD Provinsi Q18 — animated explainer for the fashion-sales bar chart.
// Walks through: read kerudung price → derive all prices → compute total revenue.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FashionSalesFigure } from './FashionSalesOSN25PQ18Illustration'
import {
  buildSalesBarOSN25PQ18Steps,
  ANSWER_EN,
  ANSWER_ID,
} from './salesBarOSN25PQ18Steps'
import type { FocusKey } from './salesBarOSN25PQ18Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'

export default function FashionSalesOSN25PQ18Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildSalesBarOSN25PQ18Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const answer = lang === 'id' ? ANSWER_ID : ANSWER_EN

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: harga kerudung 55.000, kaos/kemeja/celana 60.000, gamis 120.000. Total = Rp 24.310.000.'
      : 'Explainer: kerudung price 55,000, kaos/kemeja/celana 60,000, gamis 120,000. Total = Rp 24,310,000.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Chart figure with focus highlight */}
        <motion.div
          key={beat.focus ?? 'all'}
          initial={{ opacity: 0.7, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <FashionSalesFigure focus={beat.focus as FocusKey} lang={lang} />
        </motion.div>

        {/* Caption / result box */}
        <motion.div
          key={`caption-${index}`}
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

        {/* Answer chip on final beat */}
        {beat.result && (
          <motion.div
            key="answer-chip"
            className="rounded-xl px-5 py-2 font-display text-base font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {lang === 'id' ? `Jawaban: ${answer}` : `Answer: ${answer}`}
          </motion.div>
        )}
      </div>
    </div>
  )
}
