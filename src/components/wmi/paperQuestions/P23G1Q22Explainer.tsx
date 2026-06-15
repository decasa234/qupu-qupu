import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FLAG_ORDER, FlagBunting } from './P23G1Q22Illustration'
import { buildP23G1Q22Steps } from './p23G1Q22Steps'

const GREEN = '#10B981'

export default function P23G1Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G1Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // During tallying, flags already counted (to the left of focus) settle/fade so
  // the eye lands on the flag being inspected.
  const highlightAt = beat.focusIndex >= 0 ? [beat.focusIndex] : []
  const fadedAt =
    beat.phase === 'tally' && beat.focusIndex > 0
      ? FLAG_ORDER.map((_, i) => i).filter((i) => i < beat.focusIndex)
      : []

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: urutan bendera 5, 3, 4, 1, 6, 2 punya ${story.answer} pasang salah urut, jadi perlu ${story.answer} kali tukar.`
      : `Explainer: the flag order 5, 3, 4, 1, 6, 2 has ${story.answer} out-of-order pairs, so ${story.answer} swaps are needed.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FlagBunting order={FLAG_ORDER} highlightAt={highlightAt} fadedAt={fadedAt} />

        {/* Running tally chip (hidden on the opening / idea beats). */}
        {(beat.phase === 'tally' || beat.phase === 'sum') && (
          <div
            className="rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
            style={{ background: '#FFF7ED', borderColor: '#F97316', color: '#9A3412' }}
          >
            {lang === 'id' ? 'Tukar diperlukan' : 'Swaps needed'}: {beat.runningTotal}
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
