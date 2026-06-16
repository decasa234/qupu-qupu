import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CELL, CubeNetQ21, FoldedCubeQ21 } from './P24G1Q21Illustration'
import { buildP24G1Q21Steps } from './p24G1Q21Steps'

const GREEN = '#10B981'

// Net viewBox (matches the illustration's grid + padding).
const PAD = 12
const NET_W = 4 * CELL + PAD * 2
const NET_H = 3 * CELL + PAD * 2

export default function P24G1Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jaring punya 3 lingkaran, 2 belah ketupat, 1 polos; saat dilipat dua belah ketupat berseberangan, jadi jawabannya (${story.answer}).`
      : `Explainer: the net has 3 circles, 2 diamonds, 1 plain; folded, the two diamonds are opposite, so the answer is (${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${NET_W} ${NET_H}`}
          width="100%"
          style={{ maxWidth: NET_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <g transform={`translate(${PAD}, ${PAD})`}>
            <CubeNetQ21 dimExcept={beat.dimExcept} />
          </g>
        </svg>

        {beat.cube && (
          <svg viewBox="0 0 120 130" width="120" style={{ display: 'block' }} aria-hidden="true">
            <g transform="translate(10, 8)">
              <FoldedCubeQ21 top={beat.cube.top} left={beat.cube.left} right={beat.cube.right} s={56} />
            </g>
          </svg>
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
