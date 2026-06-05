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
  const { checks, winnerIndex } = story
  const rule = lang === 'id' ? story.ruleId : story.ruleEn

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: coret harga di atas ${p.budget}, lalu pilih yang terbesar.`
      : `Strategy: cross out prices above ${p.budget}, then pick the largest remaining.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-3">
        {/* rule banner */}
        <div
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-xs font-extrabold"
          style={{ background: '#FFF4E8', borderColor: ORANGE, color: '#8a4b1d' }}
        >
          {rule}
        </div>

        {/* price rows */}
        <div className="flex w-full flex-col gap-1.5">
          {checks.map((c, i) => {
            const shown = i < beat.checked
            const isWinner = i === winnerIndex
            const win = beat.result && isWinner
            const crossed = shown && !c.affordable
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: shown ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-2 rounded-lg border-2 bg-white px-3 py-1.5 font-display font-extrabold"
                style={{ borderColor: win ? GREEN : '#e6dcc6' }}
              >
                <span
                  className="text-lg"
                  style={{
                    color: win ? GREEN : crossed ? MUTED : PURPLE,
                    textDecoration: crossed ? 'line-through' : 'none',
                  }}
                >
                  {c.price}
                </span>
                {shown && (
                  <span className="text-xs" style={{ color: MUTED }}>
                    {c.affordable
                      ? (lang === 'id' ? `≤ ${p.budget}` : `≤ ${p.budget}`)
                      : (lang === 'id' ? `> ${p.budget}` : `> ${p.budget}`)}
                  </span>
                )}
                {shown && (
                  <span className="text-lg" style={{ color: c.affordable ? GREEN : ROSE }}>
                    {c.affordable ? '✓' : '✗'}
                  </span>
                )}
              </motion.div>
            )
          })}
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
