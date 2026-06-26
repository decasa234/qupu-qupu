// TIMO-22-P1H-Q5 — animated explainer
// Beat-by-beat: observe counts → highlight +2+3+4 diffs → predict +5 → reveal group 5.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HashTriangleDiagram } from './HashTriangleTIMO22P1Q5Illustration'
import { buildHashTriangleTIMO22P1Q5Steps } from './hashTriangleTIMO22P1Q5Steps'

const GREEN = '#059669'
const BLUE  = '#1E3A5F'

export default function HashTriangleTIMO22P1Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildHashTriangleTIMO22P1Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola bilangan segitiga +2, +3, +4, +5 → Kelompok 5 = 15.'
      : 'Explainer: triangular number pattern +2, +3, +4, +5 → Group 5 = 15.'

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <HashTriangleDiagram
          lang={lang}
          showGroup5={beat.showGroup5}
          showDiffs={beat.showDiffs}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#2563EB', color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
