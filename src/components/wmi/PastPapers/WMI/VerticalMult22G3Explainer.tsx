import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { MultGrid, CELLS_22G3_Q19 } from './VerticalMult22G3Illustration'
import { buildVerticalMult22G3Story } from './verticalMult22G3Steps'

// WMI-22F3A-Q19 — 256 × 79 = 20224; sum of all boxed digits = 51.

const GREEN = '#10B981'

export default function VerticalMult22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildVerticalMult22G3Story(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.steps.length - 1]

  const aria =
    lang === 'id'
      ? '256 dikali 79 sama dengan 20224. Jumlah semua angka di kotak adalah 51.'
      : '256 times 79 equals 20224. The sum of all boxed digits is 51.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <MultGrid
          cells={CELLS_22G3_Q19}
          revealRows={beat.reveal}
          focusRow={beat.focus}
        />
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
