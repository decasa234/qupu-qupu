import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q19Diagram } from './P21G2Q19Illustration'
import { buildP21G2Q19Steps } from './p21G2Q19Steps'

const GREEN = '#10B981'

/**
 * WMI-21P2A-Q19 — beat-by-beat: spot the period-3 unit (banana, apple, banana),
 * extend it under the "?" box, reveal the three hidden fruit, and land on the
 * answer (C). Reuses the <Q19Diagram> primitive from the illustration.
 */
export default function P21G2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLabel = props.correctAnswer || 'C'
  const story = useMemo(() => buildP21G2Q19Steps(lang, answerLabel), [lang, answerLabel])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pola berulang pisang-apel-pisang; tiga lingkaran tersembunyi mengikuti pola — jawaban ${answerLabel}.`
      : `Explainer: the banana-apple-banana pattern repeats; the three hidden circles follow it — answer ${answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q19Diagram litUnit={beat.litUnit} reveal={beat.reveal} fillAnswer={beat.fillAnswer} />

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
