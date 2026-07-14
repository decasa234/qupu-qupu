import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMoneyChangeSteps } from './moneyChangeSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Box({
  children,
  color = BLUE,
  layoutId,
}: {
  children: ReactNode
  color?: string
  layoutId?: string
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-12 min-w-[3rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-2xl font-extrabold"
      style={{ borderColor: color, color: PURPLE }}
    >
      {children}
    </motion.div>
  )
}

function Op({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-2xl font-extrabold" style={{ color: MUTED }}>
      {children}
    </span>
  )
}

export default function MoneyChangeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { cost: number; pay: number; name: string; item_en: string; item_id: string }
  const story = useMemo(
    () => buildMoneyChangeSteps(p.cost, p.pay, p.name, p.item_en, p.item_id, lang),
    [p.cost, p.pay, p.name, p.item_en, p.item_id, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { pay, cost, change } = story

  const phase = beat.phase
  const showCompute = phase === 'compute' || phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `${p.name} membayar ${pay} untuk ${p.item_id} seharga ${cost}. Kembalian: ${change}.`
      : `${p.name} pays ${pay} for a ${p.item_en} that costs ${cost}. Change: ${change}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">
        {/* labeled chips: paid (blue) and price (orange) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-xs font-bold uppercase tracking-wide" style={{ color: BLUE }}>
              {lang === 'id' ? 'dibayar' : 'paid'}
            </span>
            <Box color={BLUE} layoutId="pay">
              {pay}
            </Box>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-xs font-bold uppercase tracking-wide" style={{ color: ORANGE }}>
              {lang === 'id' ? 'harga' : 'price'}
            </span>
            <Box color={ORANGE} layoutId="cost">
              {cost}
            </Box>
          </div>
        </div>

        {/* subtraction row from 'compute' phase */}
        {showCompute && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Box color={BLUE}>{pay}</Box>
            <Op>−</Op>
            <Box color={ORANGE}>{cost}</Box>
            <Op>=</Op>
            {phase === 'result' ? (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-12 min-w-[3rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-2xl font-extrabold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {change}
              </motion.div>
            ) : (
              <Box color={MUTED}>?</Box>
            )}
          </motion.div>
        )}

        {/* caption */}
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
