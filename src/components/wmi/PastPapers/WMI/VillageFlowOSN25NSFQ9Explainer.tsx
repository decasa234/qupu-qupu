// OSN-25-SD-NAS-SEMIFINAL-Q9 — post-answer explainer.
//
// Beats:
//   0. intro   — full diagram, problem setup.
//   1. q_stays — highlight Q node, 400 × 36% = 144 stay in Q.
//   2. p_to_q  — highlight P→Q edge, 320 × 25% = 80.
//   3. r_to_q  — highlight R→Q edge, 380 × 35% = 133.
//   4. result  — 144 + 80 + 133 = 357.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VillageFlowDiagram } from './VillageFlowOSN25NSFQ9Illustration'
import { buildVillageFlowOSN25NSFQ9Steps } from './villageFlowOSN25NSFQ9Steps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function VillageFlowOSN25NSFQ9Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildVillageFlowOSN25NSFQ9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 400×36%=144 tetap di Q; 320×25%=80 dari P; 380×35%=133 dari R; total 357.'
      : 'Explainer: 400×36%=144 stay in Q; 320×25%=80 from P; 380×35%=133 from R; total 357.'

  return (
    <div className="mx-auto w-full max-w-sm" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Flow diagram */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <VillageFlowDiagram
            highlightEdge={beat.highlightEdge}
            highlightNode={beat.highlightNode}
            sourceNode={beat.sourceNode}
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
          style={{
            borderColor: beat.result ? GREEN : BLUE,
            color:        beat.result ? GREEN : BLUE,
            background:   beat.result ? '#ECFDF5' : '#EFF6FF',
          }}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
