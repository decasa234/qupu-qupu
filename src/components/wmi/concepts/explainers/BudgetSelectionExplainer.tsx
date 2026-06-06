import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBudgetSteps } from './budgetSteps'
import { useBeatControl } from './useBeatControl'

const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const ROSE = '#e11d48'

export default function BudgetSelectionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { prices: number[]; budget: number }
  const story = useMemo(
    () => buildBudgetSteps(p.prices, p.budget, lang),
    [p.prices, p.budget, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { prices, budget } = story

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Which of the two tiles in the current pair this price belongs to (prices are distinct).
  const pairPos = (price: number): 0 | 1 | -1 => {
    if (!beat.pair) return -1
    if (beat.pair[0] === price) return 0
    if (beat.pair[1] === price) return 1
    return -1
  }

  const ariaLabel = T(
    `Strategy: buy two different tickets and spend the most you can within ${budget}. The best pair totals ${story.answer}.`,
    `Strategi: beli dua tiket berbeda dan belanjakan sebanyak mungkin dalam ${budget}. Pasangan terbaik berjumlah ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[230px] flex-col items-center justify-center gap-3">
        {/* rule banner */}
        <div
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-xs font-extrabold"
          style={{ background: '#FFF4E8', borderColor: ORANGE, color: '#8a4b1d' }}
        >
          {T(`Budget ${budget} — buy two, spend the most you can.`, `Anggaran ${budget} — beli dua, belanjakan sebanyak mungkin.`)}
        </div>

        {/* price tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {prices.map((price, i) => {
            const pos = pairPos(price)
            const active = pos !== -1
            const win = beat.result && active
            const border = win ? GREEN : active ? (beat.fits ? GREEN : ROSE) : '#e6dcc6'
            const bg = win ? '#D1FAE5' : active ? (beat.fits ? '#ECFDF5' : '#FFF1F2') : '#fff'
            const color = win ? '#065F46' : active ? (beat.fits ? '#065F46' : ROSE) : PURPLE
            return (
              <motion.div
                key={i}
                animate={{ scale: active ? 1.07 : 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                className="grid h-12 w-16 place-items-center rounded-2xl border-4 font-display text-xl font-black"
                style={{ borderColor: border, background: bg, color }}
              >
                {price}
              </motion.div>
            )
          })}
        </div>

        {/* current pair total */}
        <div className="flex min-h-[2.75rem] items-center justify-center">
          {beat.pair && (
            <motion.div
              key={`${beat.pair[0]}-${beat.pair[1]}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-2xl font-black"
            >
              <span style={{ color: PURPLE }}>{beat.pair[0]}</span>
              <span style={{ color: MUTED }}> + </span>
              <span style={{ color: PURPLE }}>{beat.pair[1]}</span>
              <span style={{ color: MUTED }}> = </span>
              <span style={{ color: beat.fits ? '#065F46' : ROSE }}>{beat.sum}</span>
              <span className="ml-2" style={{ color: beat.fits ? GREEN : ROSE }}>{beat.fits ? '✓' : '✗'}</span>
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
