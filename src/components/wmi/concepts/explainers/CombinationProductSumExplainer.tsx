import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCombinationProductSteps, type CombinationRow } from './combinationProductSteps'
import { useBeatControl } from './useBeatControl'

interface CombinationParams {
  x: number
  y: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const MUTED = '#94A3B8'

function Row({ row, shown, checked }: { row: CombinationRow; shown: boolean; checked: boolean }) {
  const matched = checked && row.matches
  const missed = checked && !row.matches

  return (
    <motion.div
      className="grid grid-cols-[72px_72px_76px] items-center gap-2 rounded-xl border-2 px-3 py-2 font-display text-sm font-black tabular-nums"
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: shown ? (missed ? 0.45 : 1) : 0, scale: shown ? 1 : 0.94, y: shown ? 0 : 8 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      style={{
        borderColor: matched ? GREEN : shown ? '#C7D2FE' : '#E5E7EB',
        background: matched ? '#D1FAE5' : '#fff',
        color: matched ? '#065F46' : missed ? MUTED : '#30598A',
      }}
    >
      <span>
        {row.a} + {row.b}
      </span>
      <span>= {row.a + row.b}</span>
      <motion.span
        className="rounded-lg px-2 py-1 text-center"
        initial={false}
        animate={{
          backgroundColor: checked ? (matched ? GREEN : '#F1F5F9') : '#FFF7ED',
          color: checked && matched ? '#fff' : ORANGE,
        }}
      >
        {checked ? row.product : `${row.a} x ${row.b}`}
      </motion.span>
    </motion.div>
  )
}

export default function CombinationProductSumExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as CombinationParams
  const story = useMemo(() => buildCombinationProductSteps(p?.x, p?.y, lang), [p?.x, p?.y, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: daftar pasangan dengan jumlah yang sama, lalu cek hasil kalinya.'
      : 'Strategy: list pairs with the same sum, then check their products.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3 font-display text-base font-black tabular-nums">
          <div className="rounded-xl bg-blue-50 px-4 py-2" style={{ color: BLUE }}>
            sum = {story.sum}
          </div>
          <div className="rounded-xl bg-orange-50 px-4 py-2" style={{ color: ORANGE }}>
            product = {story.product}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          {story.rows.map((row, i) => (
            <Row key={`${row.a}-${row.b}`} row={row} shown={i < beat.visibleRows} checked={i < beat.checkedRows} />
          ))}
        </div>
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
