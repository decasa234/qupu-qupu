import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildLackingShareSteps } from './lackingShareSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

export default function LackingMoneyExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { nameA: string; nameB: string; lackA: number; lackB: number }
  const story = useMemo(
    () => buildLackingShareSteps(p.nameA, p.nameB, p.lackA, p.lackB, lang),
    [p.nameA, p.nameB, p.lackA, p.lackB, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { nameA, lackA, lackB, price } = story
  const phase = beat.phase

  const showBar = phase === 'price' || phase === 'solve' || phase === 'result'
  const highlightLackB = phase === 'solve' || phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `${nameA} dan ${p.nameB} bersama-sama punya uang pas untuk membeli kue. Hitung berapa uang ${nameA}.`
      : `${nameA} and ${p.nameB} together have exactly enough for a cake. Find how much ${nameA} has.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        {/* Price bar split proportionally into lackA (orange) and lackB (blue/green) */}
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="w-full overflow-hidden rounded-xl"
            style={{ border: `3px solid ${MUTED}` }}
          >
            {/* price label above bar */}
            <div
              className="w-full py-1 text-center font-display text-xs font-extrabold"
              style={{ background: '#E1EFFB', color: '#30598A' }}
            >
              {lang === 'id' ? `Harga kue = ${price}` : `Cake price = ${price}`}
            </div>
            <div className="flex h-14">
              {/* lackA segment — orange (nameA is short this amount) */}
              <motion.div
                layout
                style={{ flex: lackA, background: ORANGE }}
                className="flex flex-col items-center justify-center px-1"
              >
                <span
                  className="font-display text-lg font-extrabold leading-none text-white"
                >
                  {lackA}
                </span>
                <span className="font-display text-[10px] font-bold text-white opacity-80 text-center leading-tight">
                  {lang === 'id' ? `kurang ${nameA}` : `${nameA} short`}
                </span>
              </motion.div>

              {/* lackB segment — blue normally, green when highlighted */}
              <motion.div
                layout
                animate={{ background: highlightLackB ? GREEN : BLUE }}
                transition={{ duration: 0.4 }}
                style={{ flex: lackB }}
                className="flex flex-col items-center justify-center px-1"
              >
                <span className="font-display text-lg font-extrabold leading-none text-white">
                  {lackB}
                </span>
                <span className="font-display text-[10px] font-bold text-white opacity-80 text-center leading-tight">
                  {highlightLackB
                    ? lang === 'id'
                      ? `uang ${nameA}`
                      : `${nameA}'s money`
                    : lang === 'id'
                      ? `kurang ${p.nameB}`
                      : `${p.nameB} short`}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* solve step: show the equation price − lackA = lackB */}
        {(phase === 'solve' || phase === 'result') && (
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {/* price box */}
            <motion.div
              className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-xl font-extrabold"
              style={{ borderColor: MUTED, color: PURPLE }}
            >
              {price}
            </motion.div>
            <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
              −
            </span>
            {/* lackA box */}
            <motion.div
              className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-xl font-extrabold"
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              {lackA}
            </motion.div>
            <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
              =
            </span>
            {/* answer box */}
            <motion.div
              className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-xl font-extrabold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {lackB}
            </motion.div>
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
