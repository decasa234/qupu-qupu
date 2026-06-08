import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildFindMultipleSteps } from './findMultipleSteps'
import { useBeatControl } from './useBeatControl'

interface FindMultipleParams {
  d: number
  options: number[]
}

const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const ROSE = '#e11d48'
const STEP_MS = 1900

export default function FindMultipleExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as FindMultipleParams
  const story = useMemo(() => buildFindMultipleSteps(p.d, p.options, lang), [p.d, p.options, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { checks, correctIndex, lastDigitRule } = story
  const rule = lang === 'id' ? story.ruleId : story.ruleEn

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: pakai aturan kelipatan ${p.d} untuk mencoret pilihan yang tidak cocok.`
      : `Strategy: use the rule for multiples of ${p.d} to cross out the options that don't fit.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-3">
        {/* the rule */}
        <div
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-xs font-extrabold"
          style={{ background: '#FFF4E8', borderColor: ORANGE, color: '#8a4b1d' }}
        >
          {rule}
        </div>

        {/* option rows */}
        <div className="flex w-full flex-col gap-1.5">
          {checks.map((c, i) => {
            const shown = i < beat.checked
            const isCorrect = i === correctIndex
            const win = beat.result && isCorrect
            const crossed = shown && !c.pass
            const feature = lang === 'id' ? c.featureId : c.featureEn
            const nStr = String(c.n)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: shown ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-2 rounded-lg border-2 bg-white px-3 py-1.5 font-display font-extrabold"
                style={{ borderColor: win ? GREEN : '#e6dcc6' }}
              >
                <span
                  className="text-lg"
                  style={{ color: win ? GREEN : crossed ? MUTED : PURPLE, textDecoration: crossed ? 'line-through' : 'none' }}
                >
                  {lastDigitRule ? (
                    <>
                      {nStr.slice(0, -1)}
                      <span
                        className="rounded px-1"
                        style={{ background: shown ? ORANGE : 'transparent', color: shown ? '#fff' : PURPLE }}
                      >
                        {nStr.slice(-1)}
                      </span>
                    </>
                  ) : (
                    nStr
                  )}
                </span>
                {shown && (
                  <span className="text-xs" style={{ color: MUTED }}>
                    {feature}
                  </span>
                )}
                {shown && (
                  <span className="text-lg" style={{ color: c.pass ? GREEN : ROSE }}>
                    {c.pass ? '✓' : '✗'}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

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
