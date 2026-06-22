import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubesBlock15, TOTAL_CUBES15, SHARED_FACES15 } from './Cubes15PEIllustration'
import { buildCubes15PESteps } from './cubes15PESteps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for IKMC-23-PE-Q15.
 *
 * Walks in 4 beats:
 *   1. Show full 12-cube shape — state the glue problem.
 *   2. Highlight the 8 horizontal joints (side-by-side cubes at bottom layer).
 *   3. Highlight the 3 vertical joints (pillar stacks).
 *   4. Show all 11 joints highlighted — confirm answer D = 11.
 */
export default function Cubes15PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubes15PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${TOTAL_CUBES15} kubus dengan ${SHARED_FACES15} pasang permukaan yang bersentuhan — ${SHARED_FACES15} tetes lem.`
      : `Explainer: ${TOTAL_CUBES15} cubes with ${SHARED_FACES15} pairs of touching faces — ${SHARED_FACES15} glue drops.`

  const jointLabel = lang === 'id' ? 'Sambungan lem' : 'Glue joints'

  // Running joint count to display in the progress pill
  const runningCount =
    beat.phase === 'show'
      ? 0
      : beat.phase === 'count-horizontal'
      ? 8
      : beat.phase === 'count-vertical'
      ? 8 + 3
      : SHARED_FACES15

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CubesBlock15
          highlightJoints={beat.highlightJoints}
          dimOthers={beat.dimOthers}
        />

        {/* running joint count */}
        {beat.phase !== 'show' && (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
            }
          >
            {`${jointLabel}: ${runningCount}`}
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
