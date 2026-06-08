import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPerfectSquareSteps } from './perfectSquareSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

export default function PerfectSquareExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { n: number }
  const story = useMemo(() => buildPerfectSquareSteps(p.n, lang), [p.n, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { n, root, answer, squares } = story
  const phase = beat.phase

  const showSquares = phase === 'squares' || phase === 'locate' || phase === 'result'
  const highlightAnswer = phase === 'locate' || phase === 'result'
  const highlightRoot = phase === 'locate' || phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Cara mencari bilangan kuadrat terkecil yang lebih besar dari ${n}.`
      : `Strategy: find the smallest perfect square greater than ${n}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        {/* Square chips row */}
        {showSquares && (
          <div className="flex flex-wrap items-end justify-center gap-2">
            {squares.map((sq) => {
              const isAnswer = sq.value === answer
              const isRoot = sq.value === root * root
              let borderColor = MUTED
              let textColor = PURPLE
              let bgColor = '#fff'
              if (isAnswer && highlightAnswer) {
                borderColor = GREEN
                textColor = GREEN
                bgColor = '#D1FAE5'
              } else if (isRoot && highlightRoot) {
                borderColor = BLUE
                textColor = BLUE
              }
              return (
                <motion.div
                  key={sq.k}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="flex flex-col items-center justify-end rounded-xl border-[3px] bg-white px-2 py-1"
                  style={{ borderColor, background: bgColor }}
                >
                  <span
                    className="font-display text-2xl font-extrabold leading-none"
                    style={{ color: textColor }}
                  >
                    {sq.value}
                  </span>
                  <span
                    className="font-display text-[10px] font-bold"
                    style={{ color: MUTED }}
                  >
                    {sq.k}×{sq.k}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* n marker: show on locate/result */}
        {(phase === 'locate' || phase === 'result') && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-full border-2 px-3 py-0.5 font-display text-xs font-bold"
            style={{ borderColor: MUTED, color: PURPLE, background: '#F3F4F6' }}
          >
            n = {n} is between {root * root} and {answer}
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
