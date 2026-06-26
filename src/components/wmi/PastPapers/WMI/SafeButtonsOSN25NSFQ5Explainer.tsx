// OSN-25-SD-NAS-SEMIFINAL-Q5 — post-answer animated explainer.
//
// Beats:
//   0. intro   — empty 2×4 grid; state the constraints.
//   1. per-col — show 1 button per column (4 total, each col odd ✓).
//   2. k=1     — 1 button in row 1, 3 in row 2 → both odd; C(4,1)=4 ways.
//   3. k=3     — 3 buttons in row 1, 1 in row 2 → both odd; C(4,3)=4 ways.
//   4. count   — C(4,1)+C(4,3) = 4+4.
//   5. result  — total = 8.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SafeButtonPanel } from './SafeButtonsOSN25NSFQ5Illustration'
import { buildSafeButtonsOSN25NSFQ5Steps } from './safeButtonsOSN25NSFQ5Steps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function SafeButtonsOSN25NSFQ5Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildSafeButtonsOSN25NSFQ5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: k=1 → C(4,1)=4 cara; k=3 → C(4,3)=4 cara; total 8 kombinasi.'
      : 'Explainer: k=1 → C(4,1)=4 ways; k=3 → C(4,3)=4 ways; total 8 combinations.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Button panel */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <SafeButtonPanel
            pressed={beat.pressed}
            showRowBadges={beat.phase !== 'intro'}
            lang={lang}
          />
        </div>

        {/* Equation badge */}
        {beat.equation && (
          <motion.div
            key={beat.phase + '-eq'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
