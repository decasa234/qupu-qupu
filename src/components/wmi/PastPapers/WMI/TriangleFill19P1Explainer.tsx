import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TriangleFillFigure } from './TriangleFill19P1Illustration'
import { buildTriangleFill19P1Steps } from './TriangleFill19P1Steps'

// WMI-19P1A-Q6 — reveals the empty space being filled by the small triangle ONE
// per beat, with a running counter, landing on 7 (answer B). Reuses the
// illustration's TriangleFillFigure primitive so the geometry can never drift.

const GREEN = '#10B981'

export default function TriangleFill19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTriangleFill19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Filling the empty space with the small triangle one at a time, it takes ${story.answer} triangles — answer B.`,
    `Mengisi ruang kosong dengan segitiga kecil satu per satu, diperlukan ${story.answer} segitiga — jawaban B.`,
  )

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TriangleFillFigure filledEmpty={beat.filled} active={beat.active} />

        {/* Running counter — the concrete "how many so far". */}
        <div className="font-display text-sm font-extrabold text-qupu-brand-blue">
          {t('triangles so far', 'segitiga sejauh ini')}: {beat.count}
        </div>

        {/* Caption. */}
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
