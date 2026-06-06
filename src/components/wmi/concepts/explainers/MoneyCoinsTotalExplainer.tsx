import { useMemo } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCoinGroupSteps } from './coinGroupSteps'
import { useBeatControl } from './useBeatControl'

interface CoinParams {
  coins: number[]
}

const GREEN = '#065F46'

// Coin diameter by denomination, echoing the static illustration.
function coinSize(v: number): number {
  return v >= 25 ? 44 : v >= 10 ? 40 : v >= 5 ? 36 : 32
}

// A coin keeps a stable layoutId so it slides from the flat row into its
// denomination cluster when the arrangement changes (magic-move).
function Coin({ index, value }: { index: number; value: number }) {
  const s = coinSize(value)
  return (
    <motion.div
      layout
      layoutId={`coin-${index}`}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center justify-center rounded-full border-[2.5px] border-qupu-brand-orange bg-qupu-peach font-display font-extrabold tabular-nums text-qupu-brand-blue"
      style={{ width: s, height: s, fontSize: 13 }}
    >
      {value}
    </motion.div>
  )
}

export default function MoneyCoinsTotalExplainer({ params, lang = 'en', step, playing, onStepCount, onStepChange, onPlayEnd }: ExplainerProps) {
  const p = params as CoinParams
  const story = useMemo(() => buildCoinGroupSteps(p?.coins ?? [], lang), [p, lang])
  const index = useBeatControl(story.finalIndex, { step, playing, onStepCount, onStepChange, onPlayEnd, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { coins, groups, total, needed } = story

  // Original coin indices per denomination, descending — used for the
  // clustered layout (each coin keeps its index-based layoutId).
  const clusters = groups.map((g) => ({
    ...g,
    indices: coins.map((v, i) => ({ v, i })).filter((x) => x.v === g.value).map((x) => x.i),
  }))

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: kelompokkan koin senilai sama dan jumlahkan menjadi ${total} sen, lalu 100 − ${total} = ${needed} sen untuk melengkapi satu dolar.`
      : `Strategy: group coins of equal value and add them to ${total}¢, then 100 − ${total} = ${needed}¢ to complete a dollar.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <LayoutGroup>
          {!beat.grouped ? (
            <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-2">
              {coins.map((v, i) => (
                <Coin key={i} index={i} value={v} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[72px] flex-wrap items-start justify-center gap-4">
              {clusters.map((g) => (
                <div key={g.value} className="flex flex-col items-center gap-1">
                  <div className="flex flex-wrap items-center justify-center gap-1" style={{ maxWidth: 100 }}>
                    {g.indices.map((i) => (
                      <Coin key={i} index={i} value={coins[i]} />
                    ))}
                  </div>
                  {beat.showSubtotals && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-display text-sm font-extrabold tabular-nums text-qupu-brand-orange"
                    >
                      {g.count} × {g.value} = {g.subtotal}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </LayoutGroup>

        {beat.showSum && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: beat.showDollar ? '#30598A' : GREEN }}
          >
            {groups.map((g) => g.subtotal).join(' + ')} = {total}¢
          </motion.div>
        )}

        {beat.showDollar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            <span style={{ color: '#9aa3b2' }}>100 − {total} = </span>
            {needed}¢
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
