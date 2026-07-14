import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBarCompareSteps } from './barCompareSteps'
import { useBeatControl } from './useBeatControl'

interface Item {
  emoji: string
  value: number
}
interface BarParams {
  items: Item[]
  iA: number
  iB: number
}

const UNIT = 15
const MAX = 9
const BLUE = '#2f6df0'
const ORANGE = '#F97316'

function Bar({ emoji, value, shown, diffFrom }: { emoji: string; value: number; shown: boolean; diffFrom: number | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-6 font-display text-lg font-black tabular-nums" style={{ color: BLUE, opacity: shown ? 1 : 0 }}>
        {shown ? value : ''}
      </div>
      <div className="relative w-10 overflow-hidden rounded-md" style={{ height: MAX * UNIT, background: '#f1f5f9' }}>
        <motion.div
          className="absolute inset-x-0 bottom-0 rounded-t-sm"
          style={{ background: BLUE }}
          initial={false}
          animate={{ height: (shown ? value : 0) * UNIT }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        {diffFrom !== null && shown && value > diffFrom && (
          <motion.div
            className="absolute inset-x-0 ring-2 ring-white"
            style={{ background: ORANGE, bottom: diffFrom * UNIT, height: (value - diffFrom) * UNIT }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      <div className="text-2xl leading-none">{emoji}</div>
    </div>
  )
}

export default function BarChartCompareExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as BarParams
  const items = Array.isArray(p?.items) ? p.items : []
  const a = items[p?.iA]?.emoji ?? '?'
  const b = items[p?.iB]?.emoji ?? '?'
  const vA = items[p?.iA]?.value ?? 0
  const vB = items[p?.iB]?.value ?? 0
  const story = useMemo(() => buildBarCompareSteps(a, b, vA, vB, lang), [a, b, vA, vB, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: baca tinggi tiap batang, lalu kurangkan untuk mencari selisihnya.'
      : 'Strategy: read each bar height, then subtract to find the difference.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-10">
          <Bar emoji={story.a} value={story.vA} shown={beat.showA} diffFrom={beat.showDiff ? story.vB : null} />
          <Bar emoji={story.b} value={story.vB} shown={beat.showB} diffFrom={null} />
        </div>
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
