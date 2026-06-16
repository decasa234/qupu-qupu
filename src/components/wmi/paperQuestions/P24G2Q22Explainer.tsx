import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CubeFrame } from './P24G2Q22Illustration'
import { buildP24G2Q22Steps } from './p24G2Q22Steps'

// WMI-24P2A-Q22 — post-answer explainer for the cube-growth sequence.
// Reuses the CubeFrame primitive so the animation reads as the static figure
// coming alive: it walks frames 1 -> 2 -> 3, then the full final block, fixing
// the growth rule (one cube per step), and reveals the 7-cube in-between frame
// that fills the gap — the seed answer (E).

const GREEN = '#10B981'

export default function P24G2Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'E'
  const story = useMemo(() => buildP24G2Q22Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: balok tumbuh satu kubus tiap langkah; langkah hilang punya 7 kubus — jawaban ${answer}.`
      : `Explainer: the block grows one cube per step; the missing step has 7 cubes — answer ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex min-h-[120px] items-center justify-center">
          <CubeFrame voxels={beat.voxels} size={132} highlight={beat.highlight} />
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
