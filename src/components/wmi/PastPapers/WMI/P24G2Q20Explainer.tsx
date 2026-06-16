import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q20Pyramid } from './P24G2Q20Illustration'
import { buildP24G2Q20Steps } from './p24G2Q20Steps'

// WMI-24P2A-Q20 — post-answer explainer for the sum-pyramid.
// Reuses the Q20Pyramid primitive so the animation reads as the static figure
// coming alive: it tries a = 9, then a = 8 (both forced into a repeat), then
// a = 7 which gives the all-different row 7,8,4,9 — units digit 9, answer E.

const GREEN = '#10B981'

export default function P24G2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G2Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi kotak bawah dengan 7, 8, 4, 9, jadi angka satuannya ${story.answerDigit} — jawaban E.`
      : `Explainer: fill the bottom squares 7, 8, 4, 9, so the units digit is ${story.answerDigit} — answer E.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q20Pyramid bottom={beat.bottom} activeBottom={beat.activeBottom} activeTop={beat.activeTop} />

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
