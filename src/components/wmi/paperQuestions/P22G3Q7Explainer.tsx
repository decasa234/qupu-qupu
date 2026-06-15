import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { MoneyTable } from './P22G3Q7Illustration'
import { buildP22G3Q7Steps, ANSWER_TOTAL, ANSWER_CHOICE } from './p22G3Q7Steps'

// WMI-22P3A-Q7 (2022 Grade 3 Semifinal) — total a five-column bill table.
// Answer C = 1005.
//
// The animation walks the columns left → right, ringing each one and revealing
// value × count plus a running total. It calls out the empty $20 column (the
// trap) as a deliberate "+$0" rather than a skip. Each beat re-uses the
// MoneyTable primitive so the animation reads as the static figure coming alive.
// The grand total lands last with hold 0.

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function P22G3Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP22G3Q7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: multiply each bill by its count — 700, 250, 0, 30, 25 — then add to ${ANSWER_TOTAL} dollars, choice ${ANSWER_CHOICE}.`,
    `Penjelasan: kalikan tiap nilai uang dengan jumlahnya — 700, 250, 0, 30, 25 — lalu jumlahkan jadi ${ANSWER_TOTAL} dolar, pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The table, with the active column ringed by the shared primitive. */}
        <motion.div
          key={`fig-${beat.highlight ?? -1}`}
          initial={{ opacity: 0.7, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full"
        >
          <MoneyTable highlight={beat.highlight} subtotalFor={beat.subtotalFor} />
        </motion.div>

        {/* Running total chip. */}
        <div
          className="rounded-lg border-2 px-3 py-1 font-display text-sm font-black tabular-nums"
          style={{
            background: beat.result ? '#D1FAE5' : '#E1EFFB',
            borderColor: beat.result ? GREEN : BLUE,
            color: beat.result ? '#065F46' : BLUE,
          }}
        >
          {t('Total', 'Total')}: {beat.runningTotal}
        </div>

        {/* Caption: kid-first, bilingual; green when we land the answer. */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
