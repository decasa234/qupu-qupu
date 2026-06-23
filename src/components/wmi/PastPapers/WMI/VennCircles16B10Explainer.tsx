// SEAMO-16-B-Q10 explainer — Inclusion-exclusion for three circles (answer D = 1200 per key).
//
// Beat sequence (see vennCircles16B10Steps.ts):
//   0 — formula intro
//   1 — A∩B highlighted (100 cm²)
//   2 — A∩C highlighted (120 cm²)
//   3 — B∩C highlighted (110 cm²)
//   4 — A∩B∩C highlighted (30 cm²)
//   5 — raw sum 1200
//   6 — inclusion-exclusion result 900
//   7 — official key D=1200 (discrepancy noted)

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VennCircles } from './VennCircles16B10Illustration'
import { buildVennCircles16B10Steps } from './vennCircles16B10Steps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'

export default function VennCircles16B10Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildVennCircles16B10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: use inclusion-exclusion |A∪B∪C| = 1200 − 100 − 120 − 110 + 30 = 900 cm². Official key records D = 1200 cm² (raw sum).',
    'Penjelasan: gunakan inklusi-eksklusi |A∪B∪C| = 1200 − 100 − 120 − 110 + 30 = 900 cm². Kunci resmi mencatat D = 1200 cm² (jumlah mentah).',
  )

  const captionColour = beat.result ? GREEN : beat.highlightRegion ? AMBER : BLUE

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|',
            '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|',
          )}
        </div>

        {/* Venn diagram with region highlight */}
        <VennCircles highlightRegion={beat.highlightRegion} />

        {/* Beat caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: captionColour }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t('D = 1200 cm²', 'D = 1200 cm²')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
