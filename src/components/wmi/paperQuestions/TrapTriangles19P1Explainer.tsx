import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TrapFigure } from './TrapTriangles19P1Illustration'
import { buildTrapTriangles19P1Steps } from './trapTriangles19P1Steps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for WMI-19P1A-Q11. Outlines each triangle in the dashed
 * trapezoid one beat at a time with a running counter, landing on the total the
 * source's "Figure A" shows.
 */
export default function TrapTriangles19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTrapTriangles19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tandai tiap segitiga satu per satu — totalnya ${story.total} (Gambar A).`
      : `Explainer: outline each triangle one at a time — total ${story.total} (Figure A).`

  const runningLabel = lang === 'id' ? 'Segitiga' : 'Triangles'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TrapFigure litId={beat.litId} />

        {/* running triangle count */}
        <div
          className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
          }
        >
          {`${runningLabel}: ${beat.running}`}
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
