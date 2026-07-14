import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildLegsSteps } from './legsSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const STEP_MS = 1900

export default function LegsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { kinds: string[]; counts: number[] }
  const story = useMemo(() => buildLegsSteps(p.kinds, p.counts, lang), [p.kinds, p.counts, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: kalikan jumlah tiap hewan dengan kakinya, lalu jumlahkan semua.'
      : 'Strategy: multiply each animal count by its legs, then add the subtotals.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-3">
        {/* animal rows */}
        <div className="flex w-full flex-col gap-1.5">
          {story.rows.map((row, i) => {
            const shown = i < beat.revealed
            const animalLabel = lang === 'id' ? row.id : row.en
            const legsWord = lang === 'id' ? 'kaki' : 'legs'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: shown ? 1 : 0.25, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-2 rounded-lg border-2 bg-white px-3 py-1.5 font-display font-extrabold"
                style={{ borderColor: shown ? BLUE : '#e6dcc6' }}
              >
                {/* count × animal */}
                <span className="text-base" style={{ color: PURPLE }}>
                  <span style={{ color: ORANGE }}>{row.count}</span>
                  {' '}
                  {animalLabel}
                </span>

                {/* × legs = subtotal */}
                <span className="text-sm" style={{ color: MUTED }}>
                  × {row.legs} {legsWord}
                </span>

                {shown && (
                  <span
                    className="min-w-[2rem] rounded-lg px-2 py-0.5 text-center text-base"
                    style={{ background: '#E1EFFB', color: BLUE }}
                  >
                    {row.subtotal}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* total row — only on result beat */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="flex items-center gap-2 font-display text-xl font-extrabold"
          >
            <span style={{ color: MUTED }}>
              {story.rows.map((r) => r.subtotal).join(' + ')} =
            </span>
            <span style={{ color: GREEN }}>{story.total}</span>
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
