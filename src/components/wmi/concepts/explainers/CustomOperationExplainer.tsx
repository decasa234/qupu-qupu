import { useMemo, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSubstituteSteps, type SubParams } from './substituteSteps'
import { useBeatControl } from './useBeatControl'

// Nunito (font-display) lacks the ◎ / × / − glyphs, so list symbol-capable
// fallbacks; the browser fills missing glyphs from these.
const MATH_FONT = '"Nunito", "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols2", sans-serif'
const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#065F46'
const MUTED = '#9aa3b2'

function Row({ show, label, children }: { show: boolean; label?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-0.5"
        >
          {label && (
            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: MUTED }}>
              {label}
            </span>
          )}
          <span className="text-lg font-extrabold tabular-nums" style={{ fontFamily: MATH_FONT }}>
            {children}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function CustomOperationExplainer({ params, correctAnswer, lang = 'en', step, onStepCount, onStepChange }: ExplainerProps) {
  const p = params as SubParams
  const story = useMemo(() => buildSubstituteSteps(p, correctAnswer, lang), [p, correctAnswer, lang])
  const index = useBeatControl(story.finalIndex, { step, onStepCount, onStepChange, holds: story.steps.map((s) => s.hold) })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { def, e1, e2, exampleSub, exampleVal, c, d, sub, answer } = story

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: masukkan bilanganmu ke aturan, persis seperti contoh.'
      : 'Strategy: put your numbers into the rule, just like the example.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
          <Row show={beat.showRule}>
            <span style={{ color: BLUE }}>{def}</span>
          </Row>

          <Row show={beat.showExample} label={lang === 'id' ? 'Contoh' : 'Example'}>
            <span style={{ color: MUTED }}>
              {e1} ◎ {e2} = {exampleSub} = {exampleVal}
            </span>
          </Row>

          <Row show={beat.showSub} label={lang === 'id' ? 'Soalmu' : 'Your problem'}>
            <span>
              <span style={{ color: ORANGE }}>{c}</span> ◎ <span style={{ color: ORANGE }}>{d}</span> = {sub}
              {beat.showResult && (
                <>
                  {' = '}
                  <span style={{ color: GREEN }}>{answer}</span>
                </>
              )}
            </span>
          </Row>
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-extrabold"
          style={{
            fontFamily: MATH_FONT,
            ...(beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }),
          }}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
