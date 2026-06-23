// DiamondPattern16B1Explainer.tsx
//
// Animated explainer for SEAMO-16-B-Q1:
//   "Find the missing number in the number pattern below."
//
// Strategy: each column (left, right, top) decreases by 1 across the three groups.
// Top column: 5 → 4 → 3. Since 3 is not in choices A(4)–D(7), answer is E.
//
// Beat-by-beat:
//   0 — overview of three diamond groups
//   1 — left column shows -1 pattern (4,3,2)
//   2 — right column shows -1 pattern (6,5,4)
//   3 — top column: 5 → 4 → ? = 3 (same rule)
//   4 — reveal 3 in Group 3; compare with choices
//   5 — final: answer E

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiamondGroups } from './DiamondPattern16B1Illustration'
import { buildDiamondPattern16B1Steps } from './diamondPattern16B1Steps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'

export default function DiamondPattern16B1Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildDiamondPattern16B1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: left 4→3→2, right 6→5→4, top 5→4→3. Answer is 3 = choice E (None of the above).',
    'Penjelasan: kiri 4→3→2, kanan 6→5→4, atas 5→4→3. Jawaban adalah 3 = pilihan E (Tidak ada jawaban yang benar).',
  )

  const captionColor = beat.result ? GREEN : beat.highlight !== null ? AMBER : BLUE

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            'Each column: − 1 per group → top: 5, 4, ?',
            'Setiap kolom: − 1 per kelompok → atas: 5, 4, ?',
          )}
        </div>

        {/* Diamond groups figure */}
        <DiamondGroups
          revealAnswer={beat.revealAnswer}
          highlight={beat.highlight}
        />

        {/* Beat caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: captionColor }}
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
            {t('Answer: E (None of the above) — missing = 3', 'Jawaban: E — bilangan yang hilang = 3')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
