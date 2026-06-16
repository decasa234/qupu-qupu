import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CopySheet, Q15_VIEW_H, Q15_VIEW_W } from './P24G2Q15Illustration'
import { buildP24G2Q15Steps } from './p24G2Q15Steps'

const GREEN = '#10B981'
const SPOT = '#F59E0B'

export default function P24G2Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G2Q15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const hi = new Set(beat.highlight)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lembar tak terpakai memuat 7 dan 8, jumlahnya ${story.answer} — jawaban ${story.answerLabel}.`
      : `Explainer: the unused sheet holds 7 and 8, which add to ${story.answer} — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q15_VIEW_W} ${Q15_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {beat.sheets.map((s, i) => {
            const lit = hi.has(i)
            const anyHi = beat.highlight.length > 0
            // Dim non-highlighted sheets only once something is highlighted.
            const opacity = anyHi && !lit ? 0.32 : 1
            return (
              <g key={i} opacity={opacity}>
                {lit && (
                  <rect
                    x={s.x - 4}
                    y={s.y - 4}
                    width={94}
                    height={140}
                    rx={7}
                    fill="none"
                    stroke={SPOT}
                    strokeWidth={4}
                  />
                )}
                <CopySheet {...s} />
              </g>
            )
          })}
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
