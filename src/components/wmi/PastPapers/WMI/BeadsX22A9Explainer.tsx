/**
 * SEAMOX-22-A-Q9 — Animated explainer for "How many beads are there in all?"
 *
 * Highlights each figure panel in turn, accumulating 1 + 8 + 16 + 24 = 49.
 * Shares the same SVG primitive as the stem illustration.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BeadsX22A9SVG } from './BeadsX22A9Figure'
import { buildBeadsX22A9Steps } from './beadsX22A9Steps'

const GREEN = '#10B981'

export default function BeadsX22A9Explainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildBeadsX22A9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menjumlahkan 1 + 8 + 16 + 24 = 49 manik seluruhnya.`
      : `Explainer: adding 1 + 8 + 16 + 24 = 49 beads in all.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BeadsX22A9SVG lang={lang} highlightFig={beat.figIndex} />

        {beat.running > 0 && (
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
