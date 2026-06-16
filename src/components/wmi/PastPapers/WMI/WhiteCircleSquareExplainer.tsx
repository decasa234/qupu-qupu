import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeOptions, Q8_GREEN, type Q8Option } from './WhiteCircleSquareIllustration'

interface FigureStep {
  caption: string
  hold: number
  result: boolean
  highlight?: Q8Option
}

function buildSteps(lang: Lang): FigureStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      hold: 1900,
      result: false,
      caption: t(
        'We want a white circle inside a gray square.',
        'Kita mencari lingkaran putih di dalam persegi abu-abu.',
      ),
    },
    {
      hold: 2200,
      result: false,
      caption: t(
        'A is a triangle; C and D have the gray shape as a circle — not a square.',
        'A adalah segitiga; C dan D bentuk abu-abunya lingkaran — bukan persegi.',
      ),
    },
    {
      hold: 0,
      result: true,
      highlight: 'B',
      caption: t(
        'B is a white circle in a gray square (a tilted square is still a square) — that’s B.',
        'B adalah lingkaran putih di persegi abu-abu (persegi miring tetap persegi) — itu B.',
      ),
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
      ? 'Penjelasan: pilih lingkaran putih di dalam persegi abu-abu — pilihan B.'
      : 'Explainer: pick the white circle inside a gray square — option B.'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeOptions highlight={beat.highlight} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: Q8_GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
