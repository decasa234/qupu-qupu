import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FruitBalance, SCALES } from './P21G2Q17Illustration'
import { buildP21G2Q17Steps } from './p21G2Q17Steps'

const GREEN = '#10B981'

/**
 * WMI-21P2A-Q17 — beat-by-beat: read each balance, chain the comparisons, and
 * land on the heaviest fruit (the pineapple → answer B). Reuses the
 * <FruitBalance> primitive from the illustration so the figure never drifts.
 */
export default function P21G2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLabel = props.correctAnswer || 'B'
  const story = useMemo(() => buildP21G2Q17Steps(lang, answerLabel), [lang, answerLabel])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bandingkan tiga timbangan; nanas paling berat — jawaban ${answerLabel}.`
      : `Explainer: compare the three balances; the pineapple is heaviest — answer ${answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-2">
        {SCALES.map((s, i) => {
          const active = beat.highlight === i
          const dim = beat.highlight !== -1 && !active
          return (
            <div
              key={i}
              className="w-full transition-opacity"
              style={{ maxWidth: 320, opacity: dim ? 0.3 : 1 }}
            >
              <FruitBalance left={s.left} right={s.right} tilt={s.tilt} />
            </div>
          )
        })}

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
