import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HandRow } from './P25G1Q16Illustration'
import { buildP25G1Q16Steps } from './p25G1Q16Steps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for WMI-25P1A-Q16. Names the trap (count only LEFT
 * hands), highlights the three left hands, then adds their stretched fingers one
 * at a time with a running total that lands on 11: 5 + 4 + 2 = 11.
 */
export default function P25G1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q16Steps(lang, props.correctAnswer), [lang, props.correctAnswer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const runningLabel = lang === 'id' ? 'Jumlah' : 'Count'
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung jari terentang di tangan kiri saja — totalnya ${story.leftTotal}.`
      : `Explainer: count stretched fingers on the left hands only — total ${story.leftTotal}.`

  return (
    <div className="mx-auto w-full max-w-[760px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <HandRow litHands={beat.litHands.length ? beat.litHands : undefined} />

        <div
          className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
          }
        >
          {`${runningLabel}: ${beat.running}`}
        </div>

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
