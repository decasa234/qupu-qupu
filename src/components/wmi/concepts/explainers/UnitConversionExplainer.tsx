import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildUnitConvertSteps } from './unitConvertSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Box({
  children,
  color = BLUE,
  highlight = false,
  layoutId,
}: {
  children: ReactNode
  color?: string
  highlight?: boolean
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
      style={{ borderColor: highlight ? ORANGE : color, color: highlight ? ORANGE : PURPLE }}
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

export default function UnitConversionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { mode: 'm-cm' | 'kg-g' | 'dollar-cent'; big: number; small: number }

  const story = useMemo(
    () => buildUnitConvertSteps(p.mode, p.big, p.small, lang),
    [p.mode, p.big, p.small, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { factor, bigU, smallU, big, small, answer } = story
  const phase = beat.phase

  const showRule = phase === 'rule' || phase === 'compute' || phase === 'result'
  const showCompute = phase === 'compute' || phase === 'result'
  const showAnswer = phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Cara konversi satuan: kalikan ${bigU} dengan ${factor} lalu tambah ${smallU}.`
      : `How to convert units: multiply ${bigU} by ${factor} then add ${smallU}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">
        {/* Rule row: 1 bigU = factor smallU */}
        {showRule && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <Box color={BLUE} layoutId="rule-one">
              1
            </Box>
            <Box color={BLUE} layoutId="rule-bigU">
              {bigU}
            </Box>
            <Op>=</Op>
            <Box color={ORANGE} highlight={phase === 'rule'} layoutId="rule-factor">
              {factor}
            </Box>
            <Box color={ORANGE} highlight={phase === 'rule'} layoutId="rule-smallU">
              {smallU}
            </Box>
          </motion.div>
        )}

        {/* Compute row: big × factor = product + small */}
        {showCompute && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.05 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <Box color={BLUE} layoutId="comp-big">
              {big}
            </Box>
            <Op>×</Op>
            <Box color={BLUE} layoutId="comp-factor">
              {factor}
            </Box>
            <Op>=</Op>
            <Box color={ORANGE} layoutId="comp-product">
              {big * factor}
            </Box>
            <Op>+</Op>
            <Box color={ORANGE} layoutId="comp-small">
              {small}
            </Box>
          </motion.div>
        )}

        {/* Answer row */}
        {showAnswer && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <Op>=</Op>
            <motion.span
              className="font-display text-3xl font-extrabold"
              style={{ color: GREEN }}
            >
              {answer}
            </motion.span>
            <span className="font-display text-xl font-extrabold" style={{ color: GREEN }}>
              {smallU}
            </span>
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
