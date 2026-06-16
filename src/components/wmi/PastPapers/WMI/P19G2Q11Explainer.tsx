import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { WheelChain } from './P19G2Q11Illustration'
import { buildP19G2Q11Steps } from './p19G2Q11Steps'

// WMI-19P2A-Q11 — post-answer explainer. Traces the spin from the arrow wheel
// to wheel A one link at a time (open belt = same, crossed belt = opposite, rigid
// axle = same), revealing each wheel's rotation arrow as it goes, and lands on the
// matching option letter (B). Mirrors the static figure exactly (same WheelChain).

const GREEN = '#10B981'

export default function P19G2Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G2Q11Steps(props.correctAnswer, lang), [props.correctAnswer, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  return (
    <div
      className="mx-auto w-full max-w-[460px]"
      role="img"
      aria-label={t(
        `Tracing belt by belt from the arrow wheel, wheel A's spin matches Figure ${story.answer}.`,
        `Menelusuri sabuk demi sabuk dari roda berpanah, putaran roda A cocok dengan Gambar ${story.answer}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <WheelChain tracedTo={beat.tracedTo} focus={beat.focus} arrowColor={beat.result ? GREEN : '#2563EB'} />

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
