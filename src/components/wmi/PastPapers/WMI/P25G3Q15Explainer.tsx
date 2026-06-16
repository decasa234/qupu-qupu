import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CubeFigure } from './P25G3Q15Illustration'
import { buildP25G3Q15Steps } from './p25G3Q15Steps'

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function P25G3Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G3Q15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: enam bilangan berurutan 2,3,4,5,6,7 berjumlah ${story.answer} — jawaban ${story.answerLabel}.`
      : `Explainer: six consecutive numbers 2,3,4,5,6,7 sum to ${story.answer} — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CubeFigure top={beat.top} left={beat.left} right={beat.right} showHidden={beat.showHidden} />

        {/* the consecutive run, shown once it is fixed */}
        {beat.run.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {beat.run.map((n) => {
              const given = n === 2 || n === 5 || n === 6
              return (
                <span
                  key={n}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-extrabold"
                  style={
                    given
                      ? { background: '#FBEFA6', border: `2px solid ${BLUE}`, color: '#1F2937' }
                      : { background: '#EEF2F7', border: '2px solid #CBD5E1', color: '#475569' }
                  }
                >
                  {n}
                </span>
              )
            })}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
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
