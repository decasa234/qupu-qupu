import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ScaleFigure, SCALE1, SCALE2, WHITE_BALL_G } from './BalanceTwoScalesG2Illustration'
import { buildBalanceTwoScalesG2Steps } from './balanceTwoScalesG2Steps'

const GREEN = '#10B981'

export default function BalanceTwoScalesG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalanceTwoScalesG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: selisih 180 − 120 = 60 g adalah 2 bola putih, jadi satu bola putih ${WHITE_BALL_G} g.`
      : `Explainer: the difference 180 − 120 = 60 g is 2 white balls, so one white ball is ${WHITE_BALL_G} g.`

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <ScaleFigure def={SCALE1} highlightKind={beat.highlightKind} emphasizeTotal={beat.emphasizeTotals} />
          <ScaleFigure def={SCALE2} highlightKind={beat.highlightKind} emphasizeTotal={beat.emphasizeTotals} />
        </div>

        {beat.equation && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : '#2f6df0' }}>
            {beat.equation}
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
