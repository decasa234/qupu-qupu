import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ArrowStrip, NumberGrid } from './P19G2Q3Illustration'
import { buildP19G2Q3Steps } from './p19G2Q3Steps'

const GREEN = '#10B981'

// Post-answer explainer for WMI-19P2A-Q3. Mirrors the static figure (same
// ArrowStrip) and traces the path on the 61..120 grid one segment per beat,
// landing on 94 (choice C).
export default function P19G2Q3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G2Q3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ikuti panah pada kisi, mendarat di ${story.answer} — jawaban C.`
      : `Explainer: follow the arrows on the grid, landing on ${story.answer} — answer C.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ArrowStrip revealTarget={beat.result} />
        <NumberGrid pathLen={beat.pathLen} />

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
