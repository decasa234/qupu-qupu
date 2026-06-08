import { Fragment, useMemo } from 'react'
import type { ReactNode } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildReverseArithmeticSteps } from './reverseArithmeticSteps'
import { useBeatControl } from './useBeatControl'

interface ReverseParams {
  d: number
  r: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const STEP_MS = 1900

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

export default function ReverseArithmeticExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as ReverseParams
  const story = useMemo(() => buildReverseArithmeticSteps(p.d, p.r, lang), [p.d, p.r, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { base, r, number, digits, answer } = story

  const phase = beat.phase
  const revealed = phase === 'number' || phase === 'digits' || phase === 'result'
  const flipped = phase === 'flip' || revealed
  const showDigits = phase === 'digits' || phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: kerja terbalik untuk menemukan bilangan, lalu jumlahkan digitnya.'
      : 'Strategy: work backward to find the number, then add its digits.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-5">
        <LayoutGroup>
          {/* equation row: "? - base = r" rearranges to "? = r + base" (then ? -> number) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Box layoutId="lhs" color={revealed ? GREEN : BLUE}>
              {revealed ? number : '?'}
            </Box>
            {!flipped ? (
              <>
                <Op>−</Op>
                <Box layoutId="base" highlight={phase === 'base'}>
                  {base}
                </Box>
                <Op>=</Op>
                <Box layoutId="r">{r}</Box>
              </>
            ) : (
              <>
                <Op>=</Op>
                <Box layoutId="r">{r}</Box>
                <Op>+</Op>
                <Box layoutId="base">{base}</Box>
              </>
            )}
          </div>

          {/* digit-sum row */}
          {showDigits && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {digits.map((dg, i) => (
                <Fragment key={i}>
                  {i > 0 && <Op>+</Op>}
                  <Box color={ORANGE}>{dg}</Box>
                </Fragment>
              ))}
              {phase === 'result' && (
                <>
                  <Op>=</Op>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-3xl font-extrabold"
                    style={{ color: GREEN }}
                  >
                    {answer}
                  </motion.div>
                </>
              )}
            </div>
          )}
        </LayoutGroup>

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
