import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParallelAnglesFigure } from './ParallelAnglesOSN08KQ16Illustration'
import { buildParallelAnglesOSN08KQ16Steps } from './parallelAnglesOSN08KQ16Steps'

// OSN-08-SD-KAB-Q16 — animated explainer for parallel-line co-interior angles.
//
// Beat plan (5 beats):
//   0  intro            — plain figure; angles x, 2x labelled
//   1  co-interior ID   — highlight x and lower 2x in amber
//   2  sum = 180°       — fill co-interior angles; "x + 2x = 180°"
//   3  solve            — "3x = 180° → x = 60°"
//   4  answer           — show numeric labels; "x = 60°"

const GREEN = '#059669'
const BLUE  = '#1E3A5F'

export default function ParallelAnglesOSN08KQ16Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildParallelAnglesOSN08KQ16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: sudut dalam sepihak x dan 2x pada dua garis sejajar berjumlah 180°; x + 2x = 180° → x = 60°.'
      : 'Explainer: co-interior angles x and 2x between two parallel lines sum to 180°; x + 2x = 180° → x = 60°.'

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}
    >
      <ParallelAnglesFigure
        highlightCoInterior={beat.highlightCoInterior}
        fillCoInterior={beat.fillCoInterior}
        showAnswer={beat.showAnswer}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          style={{
            border: '1.5px solid',
            borderRadius: 8,
            padding: '8px 14px',
            maxWidth: 300,
            textAlign: 'center',
            fontSize: 13,
            lineHeight: 1.5,
            ...captionStyle,
          }}
        >
          {beat.caption}
          {beat.equation && (
            <div style={{ marginTop: 6, fontWeight: 700, fontSize: 15 }}>
              {beat.equation}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
