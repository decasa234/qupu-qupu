import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q19Diagram } from './P20G1Q19Illustration'
import { buildP20G1Q19Steps } from './p20G1Q19Steps'

const GREEN = '#10B981'

export default function P20G1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kanan-atas = jumlah tiga angka lain, jadi 12 + 8 + 3 = ${story.answer} (jawaban C).`
      : `Explainer: top-right = the other three added, so 12 + 8 + 3 = ${story.answer} (answer C).`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q19Diagram
          highlightCircle={beat.highlightCircle}
          highlightQuarter={beat.highlightQuarter}
          revealStar={beat.revealStar}
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
