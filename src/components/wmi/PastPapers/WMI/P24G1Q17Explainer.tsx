import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LadybugShape, VIEW } from './P24G1Q17Illustration'
import { buildP24G1Q17Steps } from './p24G1Q17Steps'

const GREEN = '#10B981'
const SPOT_RING = '#2f6df0'
const HOLE_RING = '#7C3AED'

export default function P24G1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  // Q17 answer is a choice letter; default to A (the seed's answer) if absent.
  const answer = props.correctAnswer || 'A'
  const story = useMemo(() => buildP24G1Q17Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cx = 100
  const cy = 100

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bentuk yang sama setelah diputar adalah opsi ${story.answer}.`
      : `Explainer: the same figure after rotating is option ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          width="100%"
          style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <LadybugShape rotate={beat.rotate} />

          {/* feature rings travel with the rotation so the pattern is seen to stay fixed */}
          {beat.markFeatures && (
            <g transform={`rotate(${beat.rotate} ${cx} ${cy})`} fill="none" strokeWidth={3}>
              <circle cx={cx + 30} cy={cy - 34} r={17} stroke={SPOT_RING} />
              <circle cx={cx - 6} cy={cy - 22} r={17} stroke={SPOT_RING} />
              <circle cx={cx - 30} cy={cy + 32} r={16} stroke={HOLE_RING} />
              <circle cx={cx + 30} cy={cy + 32} r={16} stroke={HOLE_RING} />
            </g>
          )}

          {beat.result && (
            <text
              x={cx}
              y={188}
              textAnchor="middle"
              fontSize={24}
              fontWeight={900}
              fill={GREEN}
            >
              {`= ${story.answer}`}
            </text>
          )}
        </svg>

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
