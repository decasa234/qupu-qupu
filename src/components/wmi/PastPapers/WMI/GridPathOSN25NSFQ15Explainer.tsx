// OSN-25-SD-NAS-SEMIFINAL-Q15 — post-answer explainer.
//
// Beats:
//   0. intro     — grid with A, P, B; state the constraints.
//   1. total     — C(7,3) = 35 total paths A→B (bubble at B).
//   2. aToP      — C(4,2) = 6 paths A→P (bubble at P).
//   3. pToB      — C(3,1) = 3 paths P→B (bubbles at P and B).
//   4. forbidden — 6 × 3 = 18 forbidden paths; P crossed out.
//   5. result    — 35 − 18 = 17 valid paths.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridPathGrid } from './GridPathOSN25NSFQ15Illustration'
import { buildGridPathOSN25NSFQ15Steps } from './gridPathOSN25NSFQ15Steps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function GridPathOSN25NSFQ15Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildGridPathOSN25NSFQ15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: C(7,3)=35 total jalur dikurangi 6×3=18 melalui P menghasilkan 17.'
      : 'Explainer: C(7,3)=35 total paths minus 6×3=18 through P equals 17.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Grid */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <GridPathGrid
            bubbles={beat.bubbles}
            forbiddenP={beat.forbiddenP}
            showCompass
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
