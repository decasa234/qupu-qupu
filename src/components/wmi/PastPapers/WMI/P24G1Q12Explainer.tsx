import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ScatterFigure } from './P24G1Q12Illustration'
import { buildP24G1Q12Steps } from './p24G1Q12Steps'

const GREEN = '#10B981'

export default function P24G1Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tiap angka harus muncul 3 kali; 2 dan 8 hanya muncul 2 kali, jadi yang hilang 8 dan 2 (jawaban C).'
      : 'Explainer: each digit should appear 3 times; 2 and 8 appear only twice, so the missing pair is 8 and 2 (answer C).'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ScatterFigure ringDigit={beat.ringDigit} focus={beat.focus} />

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
