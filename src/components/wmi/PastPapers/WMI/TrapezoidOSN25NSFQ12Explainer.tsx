// TrapezoidOSN25NSFQ12Explainer — OSN-25-SD-NAS-SEMIFINAL-Q12
//
// Beat animasi: intro → drop-perp → eq-ab → eq-dc → solve → area.
// Menggunakan TrapezoidFigure dari Illustration dengan prop highlight.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrapezoidFigure } from './TrapezoidOSN25NSFQ12Illustration'
import { buildTrapezoidOSN25NSFQ12Steps } from './trapezoidOSN25NSFQ12Steps'

export default function TrapezoidOSN25NSFQ12Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildTrapezoidOSN25NSFQ12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan luas trapesium ABCD — turunkan tegak lurus, Pythagoras, rumus luas'
      : 'Step-by-step: area of trapezium ABCD via perpendiculars and Pythagorean theorem'

  return (
    <div role="img" aria-label={ariaLabel} className="mx-auto w-full max-w-[280px] space-y-3">
      <TrapezoidFigure
        showPerp={beat.showPerp}
        highlightAB={beat.highlightAB}
        highlightDC={beat.highlightDC}
        highlightH={beat.highlightH}
        fillArea={beat.fillArea}
        heightLabel={beat.heightLabel}
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
