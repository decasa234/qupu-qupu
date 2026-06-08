import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { BasicStep } from './logicSteps'

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'

export function Caption({ beat }: { beat: BasicStep }) {
  return (
    <motion.div
      key={beat.phase}
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={
        beat.result
          ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
          : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
      }
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {beat.caption}
    </motion.div>
  )
}

export function LogicFrame({ children, beat, label }: { children: ReactNode; beat: BasicStep; label: string }) {
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={label}>
      <div className="flex flex-col items-center gap-3">
        {children}
        <Caption beat={beat} />
      </div>
    </div>
  )
}

export function Pill({ children, active = false, good = false }: { children: ReactNode; active?: boolean; good?: boolean }) {
  return (
    <motion.div
      className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-black tabular-nums"
      style={{
        borderColor: good ? GREEN : active ? ORANGE : '#CBD5E1',
        background: good ? '#D1FAE5' : active ? '#FFF7ED' : '#fff',
        color: good ? '#065F46' : active ? ORANGE : BLUE,
      }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: active || good ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      {children}
    </motion.div>
  )
}
