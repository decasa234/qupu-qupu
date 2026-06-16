import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BoardFigure, ANSWER_LETTER } from './P19G2Q25Illustration'
import { buildP19G2Q25Steps } from './p19G2Q25Steps'

// WMI-19P2A-Q25 — post-answer explainer for "on which piece is the dot?".
// Reuses the BoardFigure primitive: state the rotate-not-flip rule, locate the
// dot's cell, then mark it and name the correct option (C).

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P19G2Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G2Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `Find the square the dot sits on, then match the piece whose rotated outline fits there: the answer is Figure ${ANSWER_LETTER}.`,
    `Cari kotak tempat titik berada, lalu cocokkan potongan yang outline-nya (diputar) pas di situ: jawabannya Gambar ${ANSWER_LETTER}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <BoardFigure markDot={beat.markDot} hintDot={beat.hintDot} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
