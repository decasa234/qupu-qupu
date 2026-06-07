import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { WhiteCircleSquare } from './WhiteCircleSquareIllustration'

const GREEN = '#10B981'

interface FigureStep {
  caption: string
  hold: number
  result: boolean
}

function buildSteps(lang: Lang): FigureStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    { hold: 1700, result: false, caption: t('Look at the figure.', 'Perhatikan gambar.') },
    {
      hold: 0,
      result: true,
      caption: t('A white circle inside a gray square — that’s option B.', 'Lingkaran putih di dalam persegi abu-abu — itu pilihan B.'),
    },
  ]
}

export default function WhiteCircleSquareExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lingkaran putih di dalam persegi abu-abu.'
      : 'Explainer: a white circle inside a gray square.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <WhiteCircleSquare />

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
