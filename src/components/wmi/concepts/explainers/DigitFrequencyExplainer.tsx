import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDigitFrequencySteps } from './digitFrequencySteps'
import { useBeatControl } from './useBeatControl'

interface DigitFrequencyParams {
  a: number
  b: number
  d: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const STEP_MS = 1900

export default function DigitFrequencyExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as DigitFrequencyParams
  const story = useMemo(() => buildDigitFrequencySteps(p.a, p.b, p.d, lang), [p.a, p.b, p.d, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { numbers, d, onesCount, tensCount, answer } = story
  const rule = lang === 'id' ? story.ruleId : story.ruleEn

  const showOnes = beat.phase === 'ones' || beat.phase === 'tens' || beat.phase === 'result'
  const showTens = beat.phase === 'tens' || beat.phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: hitung angka ${d} di tempat satuan dan puluhan secara terpisah.`
      : `Strategy: count the digit ${d} in the ones place and the tens place separately.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-3">
        {/* the rule */}
        <div
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-xs font-extrabold"
          style={{ background: '#FFF4E8', borderColor: ORANGE, color: '#8a4b1d' }}
        >
          {rule}
        </div>

        {/* number grid with per-place highlighting */}
        <div className="flex flex-wrap justify-center gap-1">
          {numbers.map((n) => {
            const str = String(n)
            const onesChar = str.slice(-1)
            const tensChar = str.length > 1 ? str.slice(0, -1) : ''
            const onesHit = showOnes && n % 10 === d
            const tensHit = showTens && n >= 10 && Math.floor(n / 10) % 10 === d
            return (
              <span
                key={n}
                className="inline-flex overflow-hidden rounded-[0.1875rem] border text-[0.6875rem] font-extrabold"
                style={{ borderColor: '#e6dcc6', color: PURPLE }}
              >
                {tensChar && (
                  <span className="px-[0.1875rem] py-[0.0625rem]" style={{ background: tensHit ? BLUE : 'transparent', color: tensHit ? '#fff' : PURPLE }}>
                    {tensChar}
                  </span>
                )}
                <span className="px-[0.1875rem] py-[0.0625rem]" style={{ background: onesHit ? ORANGE : 'transparent', color: onesHit ? '#fff' : PURPLE }}>
                  {onesChar}
                </span>
              </span>
            )
          })}
        </div>

        {/* running sub-counts / sum */}
        <div className="flex items-center gap-3 font-display text-sm font-extrabold">
          {showOnes && (
            <span style={{ color: ORANGE }}>
              {lang === 'id' ? 'satuan' : 'ones'}: {onesCount}
            </span>
          )}
          {showTens && (
            <span style={{ color: BLUE }}>
              {lang === 'id' ? 'puluhan' : 'tens'}: {tensCount}
            </span>
          )}
          {beat.result && (
            <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: GREEN }}>
              = {answer}
            </motion.span>
          )}
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
