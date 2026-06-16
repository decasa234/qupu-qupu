import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q25Setup } from './P23G1Q25Illustration'
import { buildP23G1Q25Steps } from './p23G1Q25Steps'

const GREEN = '#10B981'

export default function P23G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'A'
  const story = useMemo(() => buildP23G1Q25Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: keping tidak boleh diputar sehingga susunannya tunggal; baca pojok 2×2 yang diarsir — jawaban ${story.answer}.`
      : `Explainer: pieces cannot rotate so the assembly is forced; read the shaded 2×2 corner — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q25Setup solved={beat.solved} spotlight={beat.spotlight} />

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
