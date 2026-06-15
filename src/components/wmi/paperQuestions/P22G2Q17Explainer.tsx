import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CubeStack22G2, HeightTable22G2 } from './P22G2Q17Illustration'
import { buildP22G2Q17Steps } from './p22G2Q17Steps'

const GREEN = '#10B981'

export default function P22G2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung tinggi tumpukan tiap kotak alas; tabel yang benar adalah [2,2,1] [2,1,1] [0,1,2], jawaban B.'
      : 'Explainer: count each base square stack height; the correct table is [2,2,1] [2,1,1] [0,1,2], answer B.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {beat.showTable ? (
          <HeightTable22G2 values={beat.table} active={beat.activeCell} />
        ) : (
          <CubeStack22G2 highlightCells={beat.spotlight ? [beat.spotlight] : []} />
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
