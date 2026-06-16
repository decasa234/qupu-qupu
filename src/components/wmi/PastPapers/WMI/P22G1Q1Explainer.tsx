import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { MATCH_COUNT, Q1Diagram } from './P22G1Q1Illustration'
import { buildP22G1Q1Steps } from './p22G1Q1Steps'

const GREEN = '#10B981'

export default function P22G1Q1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'C'
  const story = useMemo(() => buildP22G1Q1Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung keping segitiga tiap gambar; ${MATCH_COUNT} gambar memakai 8 keping, jawaban ${answer}.`
      : `Explainer: count the triangle tiles in each picture; ${MATCH_COUNT} pictures use 8 tiles, answer ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q1Diagram activeFigure={beat.activeFigure} countedTiles={beat.countedTiles} badged={beat.badged} />

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
