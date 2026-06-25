// TriangleNumHK24P3Q4Explainer — HKIMO-24-P3H-Q4
//
// Animated step-by-step solution: discover the rule "top = left × right − 3"
// from T1, verify with T2, apply to T3 → answer 42.
// Beat-driven via useBeatControl; 4 beats.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TriangleNumHK24P3Q4Figure, type TriangleData } from './TriangleNumHK24P3Q4Illustration'
import { buildTriangleNumHK24P3Q4Steps } from './triangleNumHK24P3Q4Steps'

const BRAND_BLUE = '#30598A'
const GREEN      = '#10B981'
const AMBER      = '#F59E0B'

export default function TriangleNumHK24P3Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTriangleNumHK24P3Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const triangles: TriangleData[] = [
    {
      top: '60', left: '7', right: '9',
      highlight: beat.activeIndex === 0,
    },
    {
      top: '29', left: '8', right: '4',
      highlight: beat.activeIndex === 1,
    },
    {
      top: beat.showAnswer ? '?' : '?',
      left: '5', right: '9',
      highlight: beat.activeIndex === 2,
      topOverride: beat.showAnswer ? '42' : undefined,
    },
  ]

  const ariaLabel = t(
    'Animated solution: rule top = left × right − 3; T1 7×9−3=60 ✓; T2 8×4−3=29 ✓; T3 5×9−3=42.',
    'Animasi solusi: aturan atas = kiri × kanan − 3; S1 7×9−3=60 ✓; S2 8×4−3=29 ✓; S3 5×9−3=42.',
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* Header */}
        <div
          className="relative flex w-full max-w-[360px] items-center justify-center overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <span className="text-sm font-bold text-white">
            {t('Find the rule', 'Temukan aturannya')}
          </span>
        </div>

        {/* Figure */}
        <div className="w-full">
          <TriangleNumHK24P3Q4Figure triangles={triangles} />
        </div>

        {/* Equation line */}
        <AnimatePresence mode="wait">
          {beat.equation ? (
            <motion.div
              key={beat.equation}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg px-4 py-2 text-center font-mono text-base font-bold"
              style={{ background: '#FEF3C7', color: '#92400E', border: `1.5px solid ${AMBER}` }}
            >
              {beat.equation}
            </motion.div>
          ) : (
            <div key="empty" className="h-10" />
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-[340px] text-center text-sm leading-snug"
            style={{ color: '#1E293B' }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Answer badge */}
        {beat.showAnswer && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="rounded-full px-5 py-1 text-base font-extrabold"
            style={{ background: GREEN, color: 'white' }}
          >
            {t('Answer: 42', 'Jawaban: 42')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
