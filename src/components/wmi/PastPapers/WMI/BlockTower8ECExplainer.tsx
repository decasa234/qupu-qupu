// Post-answer explainer for IKMC-22-EC-Q8 (John's block tower — top view).
//
// Walks the 3-D tower layer-by-layer, highlighting each layer in turn, while
// the caption explains what that layer's footprint looks like from above.
// Lands on answer C (3 nested squares).
//
// Imports the IsoBrick-based IsoTower primitive from BlockTower8ECIllustration.
// No raster assets; SSR-safe.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoTower } from './BlockTower8ECIllustration'
import { buildBlockTower8ECSteps } from './blockTower8ECSteps'

const GREEN  = '#10B981'
const BLUE   = '#30598A'

export default function BlockTower8ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildBlockTower8ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ratakan menara blok lapis demi lapis dari atas ke bawah — tampak atas adalah 3 persegi bertingkat, jawaban C.'
      : 'Explainer: flatten the block tower layer by layer from above — top view is 3 nested squares, answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 3-D tower with the current layer highlighted */}
        <IsoTower highlightLayer={beat.highlightLayer} />

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE   }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
