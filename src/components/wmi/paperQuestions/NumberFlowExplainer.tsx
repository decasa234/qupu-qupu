import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NumberFlowFigure, type NfBox } from './NumberFlowIllustration'
import { buildNumberFlowSteps } from './numberFlowSteps'

const GREEN = '#10B981'

export default function NumberFlowExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberFlowSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const litSet = useMemo(() => new Set<NfBox>(beat.lit), [beat.lit])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ikuti aliran bilangan melalui kotak — apel = ${story.apple}.`
      : `Explainer: follow the numbers flowing through the boxes — apple = ${story.apple}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberFlowFigure lit={litSet} litApple={beat.litApple} showAppleValue={beat.showAppleValue} />

        {beat.running !== null && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#2f6df0' }}
          >
            {beat.running}
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
