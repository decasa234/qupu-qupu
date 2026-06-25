/**
 * SEAMOX-23-B-Q4 — Animated explainer for "Into how many parts can 6 lines divide a circle?"
 *
 * Adds chords one by one, showing the growing region count and explaining why
 * each new line k adds exactly k new regions (it crosses k−1 previous lines inside).
 * Final beat: formula 1 + 6 + C(6,2) = 22.
 *
 * Imports `CircleDivSVG` from the Illustration to keep geometry in one place.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleDivSVG } from './CircleDivX23B4Illustration'
import { buildCircleDivX23B4Steps } from './circleDivX23B4Steps'

const GREEN = '#10B981'
const BLUE  = '#1E40AF'

export default function CircleDivX23B4Explainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildCircleDivX23B4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menambah garis ke dalam lingkaran satu per satu. Saat ini ${beat.regionCount} bagian.`
      : `Explainer: adding lines into a circle one by one. Current count: ${beat.regionCount} parts.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Circle with progressively more chords */}
        <CircleDivSVG lineCount={beat.lineCount} />

        {/* Running region count */}
        <div
          className="font-display text-3xl font-black tabular-nums"
          style={{ color: beat.result ? GREEN : BLUE }}
        >
          {beat.regionCount}
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN,    color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
