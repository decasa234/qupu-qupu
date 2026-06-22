import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GreyCubesBlock, TOTAL_GREY, VISIBLE_GREY, HIDDEN_GREY } from './Cubes6PEIllustration'
import { buildCubes6PESteps } from './cubes6PESteps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for IKMC-20-PE-Q6.
 *
 * Walks in 4 beats:
 *   1. Show full block — "14 grey cubes total".
 *   2. Highlight the 8 visible grey cubes (gold) — dim the rest.
 *   3. Show maths: 14 − 8 = 6.
 *   4. Confirm answer D = 6.
 */
export default function Cubes6PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubes6PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dari ${TOTAL_GREY} kubus abu-abu, ${VISIBLE_GREY} terlihat dan ${HIDDEN_GREY} tersembunyi.`
      : `Explainer: of ${TOTAL_GREY} grey cubes, ${VISIBLE_GREY} are visible and ${HIDDEN_GREY} are hidden.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <GreyCubesBlock
          highlightVisible={beat.highlightVisible}
          dimOthers={beat.dimOthers}
        />

        {/* running maths display */}
        {beat.phase === 'subtract' || beat.phase === 'result' ? (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
            }
          >
            {`${TOTAL_GREY} − ${VISIBLE_GREY} = ${HIDDEN_GREY}`}
          </div>
        ) : beat.phase === 'reveal' ? (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={{ background: '#FEF9E7', borderColor: '#F4B400', color: '#92400E' }}
          >
            {lang === 'id' ? `Terlihat: ${VISIBLE_GREY}` : `Visible: ${VISIBLE_GREY}`}
          </div>
        ) : null}

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
