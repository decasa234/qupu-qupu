import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildOddEvenSteps } from './oddEvenSteps'
import { useBeatControl } from './useBeatControl'

interface OddEvenParams {
  options: { x: number; y: number }[]
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const ROSE = '#e11d48'
const STEP_MS = 1900

// A number with a small parity tag underneath (odd = orange, even = blue).
function Term({ n, odd, lang }: { n: number; odd: boolean; lang: 'en' | 'id' }) {
  const tag = lang === 'id' ? (odd ? 'ganjil' : 'genap') : odd ? 'odd' : 'even'
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span className="text-lg font-extrabold" style={{ color: PURPLE }}>
        {n}
      </span>
      <span className="text-[10px] font-bold" style={{ color: odd ? ORANGE : BLUE }}>
        {tag}
      </span>
    </span>
  )
}

export default function OddEvenExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as OddEvenParams
  const story = useMemo(() => buildOddEvenSteps(p.options, lang), [p.options, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { checks, correctIndex } = story
  const rule = lang === 'id' ? story.ruleId : story.ruleEn

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: jumlah ganjil hanya dari satu ganjil + satu genap; coret yang lain.'
      : 'Strategy: an odd sum only comes from one odd + one even; cross out the rest.'

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
            const crossed = shown && !c.match
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: shown ? 1 : 0.3, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-2 rounded-lg border-2 bg-white px-3 py-1.5 font-display"
                style={{ borderColor: win ? GREEN : '#e6dcc6' }}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={{ textDecoration: crossed ? 'line-through' : 'none', opacity: crossed ? 0.6 : 1 }}
                >
                  <Term n={c.x} odd={c.xOdd} lang={lang} />
                  <span className="text-lg font-extrabold" style={{ color: MUTED }}>
                    +
                  </span>
                  <Term n={c.y} odd={c.yOdd} lang={lang} />
                </span>
                {shown && (
                  <span className="text-sm font-extrabold" style={{ color: win ? GREEN : PURPLE }}>
                    = {c.sum}
                  </span>
                )}
                {shown && (
                  <span className="text-lg font-extrabold" style={{ color: c.match ? GREEN : ROSE }}>
                    {c.match ? '✓' : '✗'}
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
