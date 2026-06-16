import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { UnfoldCutout } from './P25G2Q15Illustration'
import { buildP25G2Q15Steps } from './p25G2Q15Steps'

const GREEN = '#10B981'

export default function P25G2Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  // The correct option letter comes from the seed (answer = 'A').
  const answer = (props.correctAnswer || 'A').trim().toUpperCase().charAt(0) || 'A'
  const story = useMemo(() => buildP25G2Q15Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kertas dilipat dua kali maka potongannya simetris; hanya pilihan ${story.answer} yang cocok.`
      : `Explainer: folding twice makes the cut symmetric; only option ${story.answer} matches.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <UnfoldCutout showFolds={beat.showFolds} showQuarter={beat.showQuarter} />

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
