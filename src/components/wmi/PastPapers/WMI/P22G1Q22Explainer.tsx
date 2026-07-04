import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PatternRing, RING_BLUE } from './P22G1Q22Illustration'
import { buildP22G1Q22Steps } from './p22G1Q22Steps'

const GREEN = '#10B981'
const BLUE = '#9FD2EE'
const WHITE = '#FFFFFF'
const INK = '#2B2B2B'

/** The colour strip read along the arrow from the wedge left of the top vertex — first `count` swatches shown. */
function ColourStrip({ count }: { count: number }) {
  const SW = 28
  const GAP = 4
  const w = RING_BLUE.length * (SW + GAP) - GAP
  return (
    <svg viewBox={`0 0 ${w} ${SW + 4}`} width="100%" style={{ maxWidth: 256, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {RING_BLUE.map((isBlue, i) => {
        const shown = i < count
        return (
          <rect
            key={i}
            x={i * (SW + GAP)}
            y={2}
            width={SW}
            height={SW}
            rx={5}
            fill={shown ? (isBlue ? BLUE : WHITE) : '#F1F5F9'}
            stroke={shown ? INK : '#CBD5E1'}
            strokeWidth={2}
          />
        )
      })}
    </svg>
  )
}

export default function P22G1Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G1Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: baca cincin mengikuti arah panah menjadi strip warna; hanya strip ${story.answer} yang cocok (jawaban ${story.answer}).`
      : `Explainer: read the ring in the arrow's direction into a colour strip; only strip ${story.answer} matches (answer ${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PatternRing focusWedge={beat.focusWedge} showOrder={beat.showOrder} />

        {beat.swatchCount > 0 && <ColourStrip count={beat.swatchCount} />}

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
