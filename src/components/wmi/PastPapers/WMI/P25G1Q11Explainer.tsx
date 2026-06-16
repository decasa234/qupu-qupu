import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q11Cluster } from './P25G1Q11Illustration'
import { buildP25G1Q11Steps } from './p25G1Q11Steps'

const GREEN = '#10B981'

export default function P25G1Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung jenis bangun yang berbeda, totalnya ${story.answer} jenis.`
      : `Explainer: count the distinct kinds of shapes; there are ${story.answer} kinds.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full">
          <Q11Cluster highlightKind={beat.highlightKind} confirmedKinds={beat.confirmedKinds} />
          {/* running tally badge */}
          <div
            className="absolute right-2 top-2 rounded-full border-2 px-3 py-1 font-display text-sm font-extrabold"
            style={{ background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }}
          >
            {lang === 'id' ? `Jenis: ${beat.tally}` : `Kinds: ${beat.tally}`}
          </div>
        </div>

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
