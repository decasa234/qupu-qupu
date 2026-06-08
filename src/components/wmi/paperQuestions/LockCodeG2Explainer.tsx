import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LockCodeG2Figure } from './LockCodeG2Illustration'
import { buildLockCodeG2Steps } from './lockCodeG2Steps'

const GREEN = '#10B981'

export default function LockCodeG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLockCodeG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const highlight = useMemo(() => new Set(beat.highlight), [beat.highlight])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: gunakan petunjuk untuk menemukan kode — kodenya ${story.code}.`
      : `Explainer: use the clues to find the lock code — the code is ${story.code}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <LockCodeG2Figure
          slots={beat.slots}
          crossEliminated={beat.crossEliminated}
          highlight={highlight}
          solved={beat.solved}
        />

        {beat.result && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: GREEN }}>
            {story.code}
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
