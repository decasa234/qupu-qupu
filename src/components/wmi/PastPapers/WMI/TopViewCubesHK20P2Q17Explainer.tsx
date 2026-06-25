// Post-answer explainer for HKIMO-20-P2H-Q17.
// "At least how many squares can be seen if viewing the figure below from the top?" — answer: 13.
//
// Beat strategy:
//   intro    — 3D IsoCubes (dimmed), explain "look straight down"
//   topview  — 2D footprint with cell numbers, count = 10 × 1×1
//   count2x2 — 2D footprint + 3 highlighted 2×2 squares (A amber, B blue, C green)
//   answer   — final total 10 + 3 = 13

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import {
  HKIMO20P2Q17_CUBES,
  TopViewDiagram,
} from './TopViewCubesHK20P2Q17Illustration'
import { buildTopViewCubesHK20P2Q17Steps } from './topViewCubesHK20P2Q17Steps'

const DIM   = '#C8D8E8'
const GREEN = '#10B981'

export default function TopViewCubesHK20P2Q17Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildTopViewCubesHK20P2Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]
  const phase = beat.phase

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas → 10 persegi 1×1 + 3 persegi 2×2 = 13.'
      : 'Explainer: top view → 10 × 1×1 + 3 × 2×2 = 13 squares.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Visual — 3D in intro, 2D footprint in subsequent phases */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3 w-full">
          {phase === 'intro' ? (
            <IsoCubes
              cubes={HKIMO20P2Q17_CUBES.map((c) => ({ ...c, color: DIM }))}
              size={24}
              palette={ISO_BLUE_PALETTE}
              viewPadding={12}
            />
          ) : (
            <TopViewDiagram
              showCellNumbers={phase === 'topview'}
              showA={phase === 'count2x2' || phase === 'answer'}
              showB={phase === 'count2x2' || phase === 'answer'}
              showC={phase === 'count2x2' || phase === 'answer'}
            />
          )}
        </div>

        {/* Running count */}
        {phase !== 'intro' && (
          <motion.div
            key={`count-${phase}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {phase === 'topview' ? '10' : '13'}
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
