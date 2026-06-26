// ChainedTriOSN25NFQ25Explainer — OSN-25-SD-NAS-FINAL-Q25
//
// Beats:
//   0. intro    — neutral figure; label given sides (AB=12, BC=5, CD=9).
//   1. find-ac  — compute AC = 13 via Pythagoras.
//   2. find-de  — highlight CE; △CDE ~ △ABC (scale 3/4); DE = 15/4, CE = 39/4.
//   3. find-f   — highlight CE+CF; right angle at C in △ECF; F on AC at y=15/4.
//   4. result   — highlight FE in blue; FE = 169/16 cm.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ChainedTriFigure } from './ChainedTriOSN25NFQ25Illustration'
import { buildChainedTriOSN25NFQ25Steps } from './chainedTriOSN25NFQ25Steps'

export default function ChainedTriOSN25NFQ25Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildChainedTriOSN25NFQ25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan tiga segitiga siku-siku berurutan — mencari panjang FE'
      : 'Step-by-step: three chained right triangles — finding length FE'

  return (
    <div role="img" aria-label={ariaLabel} className="mx-auto w-full max-w-[380px] space-y-3">
      <ChainedTriFigure
        highlightFE={beat.highlightFE}
        highlightCE={beat.highlightCE}
        highlightCF={beat.highlightCF}
        feLabel={beat.feLabel}
      />

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center"
      >
        {beat.equation && (
          <p className="mb-1 font-mono text-sm font-semibold text-slate-700">
            {beat.equation}
          </p>
        )}
        <p className={`text-sm ${beat.result ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
          {beat.caption}
        </p>
      </motion.div>
    </div>
  )
}
