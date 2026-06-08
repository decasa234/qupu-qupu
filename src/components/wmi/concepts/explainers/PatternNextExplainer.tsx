import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPatternNextSteps } from './patternNextSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Chip({
  children,
  color = BLUE,
  layoutId,
}: {
  children: React.ReactNode
  color?: string
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
      style={{ borderColor: color, color: PURPLE }}
    >
      {children}
    </motion.div>
  )
}

function PlusLabel({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="flex flex-col items-center"
    >
      <span
        className="rounded-full px-1.5 py-0.5 text-xs font-extrabold"
        style={{ background: '#FFF7ED', color: ORANGE, border: `1.5px solid ${ORANGE}` }}
      >
        +{step}
      </span>
      <span style={{ color: MUTED, fontSize: 14, lineHeight: 1 }}>↓</span>
    </motion.div>
  )
}

export default function PatternNextExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { start: number; step: number }
  const story = useMemo(() => buildPatternNextSteps(p.start, p.step, lang), [p.start, p.step, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const showDiffs = phase === 'diff' || phase === 'add' || phase === 'result'
  const showNext = phase === 'add' || phase === 'result'
  const isResult = phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Pola bilangan: tiap bilangan naik ${p.step}. Bilangan berikutnya ${story.next}.`
      : `Number pattern: each number goes up by ${p.step}. The next number is ${story.next}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        {/* Sequence row */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {story.terms.map((term, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              {/* +step label above gap (appears from phase 'diff') */}
              {showDiffs && i < story.terms.length - 1 && (
                <PlusLabel step={p.step} />
              )}
              {/* empty spacer so chips stay bottom-aligned when no label */}
              {!showDiffs && <div className="h-6" />}
              <Chip color={BLUE} layoutId={`term-${i}`}>
                {term}
              </Chip>
            </div>
          ))}

          {/* Gap label before '?' chip */}
          <div className="flex flex-col items-center gap-1">
            {showDiffs && (
              <PlusLabel step={p.step} />
            )}
            {!showDiffs && <div className="h-6" />}
            {/* '?' chip transforms to next value */}
            <AnimatePresence mode="wait">
              {showNext ? (
                <Chip key="next-val" color={isResult ? GREEN : ORANGE} layoutId="question">
                  {story.next}
                </Chip>
              ) : (
                <Chip key="question" color={MUTED} layoutId="question">
                  ?
                </Chip>
              )}
            </AnimatePresence>
          </div>
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
