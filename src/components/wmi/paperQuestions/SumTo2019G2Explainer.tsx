import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SumTo2019G2Figure } from './SumTo2019G2Illustration'
import { buildSumTo2019G2Steps } from './sumTo2019G2Steps'

const GREEN = '#10B981'

export default function SumTo2019G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSumTo2019G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 27 + 403 + 1589 = 2019, jadi angka 4 digit terbesar adalah ${story.answer}.`
      : `Explainer: 27 + 403 + 1589 = 2019, so the largest 4-digit number is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SumTo2019G2Figure
          topMask={beat.topMask}
          midMask={beat.midMask}
          botMask={beat.botMask}
          trial={beat.trial}
          highlightRow={beat.highlightRow}
          highlightCol={beat.highlightCol}
          solved={beat.solved}
        />

        {beat.result && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: GREEN }}>
            {story.answer}
          </div>
        )}

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
