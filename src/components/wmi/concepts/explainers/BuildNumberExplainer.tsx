import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBuildNumberSteps } from './buildNumberSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Tile({
  digit,
  color,
  label,
}: {
  digit: number
  color: string
  label: string
}) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-extrabold"
        style={{ borderColor: color, color }}
      >
        {digit}
      </div>
      <span className="font-display text-xs font-bold" style={{ color: MUTED }}>
        {label}
      </span>
    </motion.div>
  )
}

export default function BuildNumberExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { tens: number; units: number; k: number; dir: 'more' | 'less' }

  const story = useMemo(
    () => buildBuildNumberSteps(p.tens, p.units, p.k, p.dir, lang),
    [p.tens, p.units, p.k, p.dir, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { tens, units, number, k, dir, answer } = story

  const phase = beat.phase
  const showNumber = phase === 'number' || phase === 'op' || phase === 'result'
  const showOp = phase === 'op' || phase === 'result'
  const showResult = phase === 'result'

  const opSymbol = dir === 'more' ? '+' : '−'

  const tensLabel = lang === 'id' ? 'puluhan' : 'tens'
  const unitsLabel = lang === 'id' ? 'satuan' : 'ones'

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: bentuk bilangan dari digit puluhan dan satuan, lalu hitung lebih atau kurangnya.'
      : 'Strategy: build the number from tens and ones digits, then calculate more or less.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">
        {/* Tiles row */}
        <div className="flex items-end gap-4">
          <Tile digit={tens} color={BLUE} label={tensLabel} />
          <Tile digit={units} color={ORANGE} label={unitsLabel} />
        </div>

        {/* Number formed from digits */}
        {showNumber && (
          <motion.div
            key="number"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="font-display text-4xl font-extrabold"
            style={{ color: PURPLE }}
          >
            {number}
          </motion.div>
        )}

        {/* Operation row */}
        {showOp && (
          <motion.div
            key="op"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="flex items-center gap-2 font-display text-2xl font-extrabold"
          >
            <span style={{ color: PURPLE }}>{number}</span>
            <span style={{ color: MUTED }}>{opSymbol}</span>
            <span style={{ color: MUTED }}>{k}</span>
            {showResult && (
              <>
                <span style={{ color: MUTED }}>=</span>
                <motion.span
                  key="answer"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  style={{ color: GREEN }}
                >
                  {answer}
                </motion.span>
              </>
            )}
          </motion.div>
        )}

        {/* Caption */}
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
