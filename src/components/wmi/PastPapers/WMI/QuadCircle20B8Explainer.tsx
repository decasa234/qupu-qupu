import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { QuadCircle20B8 } from './QuadCircle20B8Illustration'
import { buildQuadCircle20B8Steps } from './quadCircle20B8Steps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function QuadCircle20B8Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildQuadCircle20B8Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan aturan lingkaran — (kiri atas + kiri bawah) × kanan atas = kanan bawah; jawaban B = 72.'
      : 'Explainer: find the quadrant-circle rule — (TL + BL) × TR = BR; answer B = 72.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <QuadCircle20B8 revealAnswer={beat.revealAnswer} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.phase === 'result'
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
