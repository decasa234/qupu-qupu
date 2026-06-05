import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildOddEvenSteps } from './oddEvenSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

export default function OddEvenExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { options: { x: number; y: number }[] }
  const story = useMemo(() => buildOddEvenSteps(p.options, lang), [p.options, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id' ? 'Penjumlahan mana yang ganjil?' : 'Which sum is odd?'

  const parityLabel = (isOdd: boolean) =>
    isOdd ? (lang === 'id' ? 'ganjil' : 'odd') : (lang === 'id' ? 'genap' : 'even')

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-3">
        {/* Target chip */}
        <div
          className="flex items-center gap-1 rounded-xl border-[3px] bg-white px-3 py-1 font-display text-lg font-extrabold"
          style={{ borderColor: BLUE, color: PURPLE }}
        >
          <span style={{ color: MUTED }}>{lang === 'id' ? 'jumlah' : 'sum'}</span>
          <span style={{ color: BLUE }}>{lang === 'id' ? '= ganjil?' : '= odd?'}</span>
        </div>

        {/* Option rows */}
        <div className="flex w-full flex-col gap-2 px-2">
          {story.checks.map((check, i) => {
            const revealed = i < beat.checked
            const isMatch = check.match
            const highlight = beat.result && isMatch

            return (
              <motion.div
                key={i}
                initial={false}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className="flex items-center gap-2 rounded-xl border-[3px] bg-white px-3 py-2"
                style={{
                  borderColor: highlight ? GREEN : revealed ? (isMatch ? ORANGE : MUTED) : MUTED,
                  background: highlight ? '#D1FAE5' : 'white',
                  opacity: revealed ? 1 : 0,
                }}
              >
                {/* Sum expression */}
                <div className="flex items-end gap-1">
                  <div className="flex flex-col items-center">
                    <span
                      className="font-display text-2xl font-extrabold min-w-[1.5rem] text-center"
                      style={{ color: highlight ? '#065F46' : PURPLE }}
                    >
                      {check.x}
                    </span>
                    {revealed && (
                      <span
                        className="font-display text-[10px] font-bold px-1 rounded"
                        style={{
                          color: check.xOdd ? ORANGE : BLUE,
                          background: check.xOdd ? '#FFF7ED' : '#EFF6FF',
                        }}
                      >
                        {parityLabel(check.xOdd)}
                      </span>
                    )}
                  </div>

                  <span
                    className="font-display text-xl font-extrabold mb-4"
                    style={{ color: MUTED }}
                  >
                    +
                  </span>

                  <div className="flex flex-col items-center">
                    <span
                      className="font-display text-2xl font-extrabold min-w-[1.5rem] text-center"
                      style={{ color: highlight ? '#065F46' : PURPLE }}
                    >
                      {check.y}
                    </span>
                    {revealed && (
                      <span
                        className="font-display text-[10px] font-bold px-1 rounded"
                        style={{
                          color: check.yOdd ? ORANGE : BLUE,
                          background: check.yOdd ? '#FFF7ED' : '#EFF6FF',
                        }}
                      >
                        {parityLabel(check.yOdd)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sum result */}
                {revealed && (
                  <span
                    className="font-display text-base font-bold"
                    style={{ color: MUTED }}
                  >
                    {'= '}
                    <span style={{ color: isMatch ? GREEN : ORANGE }}>{check.sum}</span>
                  </span>
                )}

                {/* Match / no-match badge */}
                {revealed && (
                  <span
                    className="ml-auto font-display text-lg font-extrabold"
                    style={{ color: isMatch ? GREEN : ORANGE }}
                  >
                    {isMatch ? '✓' : '✗'}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

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
