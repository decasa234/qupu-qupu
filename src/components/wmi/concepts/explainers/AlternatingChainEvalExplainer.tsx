import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildChainEvalSteps, type ChainParams } from './chainEvalSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const STEP_MS = 1700

// One token in the chain (the start number or an "± n" step). The active token
// is highlighted; tokens already folded into the running total fade back.
function Chip({ children, active, done, color = PURPLE }: { children: ReactNode; active: boolean; done: boolean; color?: string }) {
  return (
    <motion.span
      layout
      animate={{ scale: active ? 1.12 : 1, opacity: done && !active ? 0.4 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="rounded-lg border-2 px-2.5 py-1"
      style={{ borderColor: active ? ORANGE : '#e6dcc6', background: active ? '#FFF4E8' : '#ffffff', color }}
    >
      {children}
    </motion.span>
  )
}

export default function AlternatingChainEvalExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as ChainParams
  const story = useMemo(() => buildChainEvalSteps(p, lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.beats[index] ?? story.beats[story.finalIndex]
  const { start, chain } = story

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: hitung rantai dari kiri ke kanan, satu langkah demi satu.'
      : 'Strategy: compute the chain left to right, one step at a time.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">
        {/* the chain, with the current step highlighted */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-display text-lg font-extrabold tabular-nums">
          <Chip active={beat.active === -1} done={beat.active >= 0} color={BLUE}>
            {start}
          </Chip>
          {chain.map((s, i) => (
            <Chip key={i} active={beat.active === i} done={i < beat.active}>
              {s.op === '+' ? '+' : '−'} {s.n}
            </Chip>
          ))}
        </div>

        {/* running total */}
        <div className="font-display text-4xl font-black tabular-nums" style={{ color: beat.result ? GREEN : PURPLE }}>
          {beat.total}
        </div>

        {/* worked equation for the current step */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold tabular-nums"
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
