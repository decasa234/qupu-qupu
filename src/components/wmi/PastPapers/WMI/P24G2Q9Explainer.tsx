import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FaceOff24G2 } from './P24G2Q9Illustration'
import { buildP24G2Q9Steps } from './p24G2Q9Steps'

const GREEN = '#10B981'

export default function P24G2Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'B'
  const story = useMemo(() => buildP24G2Q9Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: punggung Jimmy ke Utara jadi Jimmy menghadap Selatan; Nancy berhadapan jadi menghadap Utara; menghadap Utara, kiri menunjuk Barat — jawaban ${story.answer}.`
      : `Explainer: Jimmy's back faces North so Jimmy faces South; Nancy faces him so she faces North; facing North, left points West — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FaceOff24G2
          showJimmyFace={beat.showJimmyFace}
          showNancyFace={beat.showNancyFace}
          showNancyLeft={beat.showNancyLeft}
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
