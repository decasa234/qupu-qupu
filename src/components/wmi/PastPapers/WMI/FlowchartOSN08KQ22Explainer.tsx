// Post-answer explainer for OSN-08-SD-KAB-Q22.
// "Nilai x yang memenuhi operasi skematik" — answer: 14.
//
// Beats:
//   0 (intro)  — full flowchart; "work backwards" caption.
//   1 (step1)  — highlight output + box "Dibagi 5"; badge: 12×5=60.
//   2 (step2)  — highlight box "Ditambah 4"; badge: 60−4=56.
//   3 (step3)  — highlight box "Dikali 4"; badge: 56÷4=14.
//   4 (result) — x-circle shows "14"; green badge x=14.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FlowchartScene } from './FlowchartOSN08KQ22Illustration'
import { buildFlowchartOSN08KQ22Steps } from './flowchartOSN08KQ22Steps'

const GREEN = '#10B981'
const BLUE  = '#1D4ED8'

export default function FlowchartOSN08KQ22Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildFlowchartOSN08KQ22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: balik ÷5 → 12×5=60; balik +4 → 60−4=56; balik ×4 → 56÷4=14. Jadi x=14.'
      : 'Explainer: reverse ÷5 → 12×5=60; reverse +4 → 60−4=56; reverse ×4 → 56÷4=14. So x=14.'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Flowchart */}
        <div className="w-full overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-4">
          <FlowchartScene
            highlightBoxes={beat.highlightBoxes}
            highlightX={beat.highlightX}
            highlightOutput={beat.highlightOutput}
            xLabel={beat.xLabel}
          />
        </div>

        {/* Arithmetic badge */}
        {beat.badge && (
          <motion.div
            key={beat.badge}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.badge}
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
