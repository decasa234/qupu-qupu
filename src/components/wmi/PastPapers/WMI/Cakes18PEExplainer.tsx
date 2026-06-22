// Explainer for IKMC-23-PE-Q18 — birthday cake age deduction.
//
// Walks through the four clues beat-by-beat, rendering all five cakes and
// highlighting the relevant one(s) each beat, landing on Sarah (6) as answer.
//
// Reuses BirthdayCake from Cakes18PEIllustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BirthdayCake } from './Cakes18PEIllustration'
import { buildCakes18PESteps } from './cakes18PESteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE_RING = '#F97316'

const DIGITS: [number, string][] = [
  [8, 'A'],
  [7, 'B'],
  [6, 'C'],
  [5, 'D'],
  [4, 'E'],
]

export default function Cakes18PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCakes18PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Vittorio 4 lilin, Jose 5, Lea 7, Ali 8, Sarah 6 — jawaban C.'
      : 'Explainer: Vittorio 4 candles, Jose 5, Lea 7, Ali 8, Sarah 6 — answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five cake thumbnails in a row */}
        <div className="flex items-end justify-center gap-1 flex-wrap">
          {DIGITS.map(([n, label]) => {
            const highlighted = beat.highlight.has(n)
            const isAnswer = beat.answer === n

            let ringColor: string | undefined
            if (isAnswer) ringColor = GREEN
            else if (highlighted) ringColor = ORANGE_RING

            return (
              <div
                key={n}
                style={{
                  width: 60,
                  flexShrink: 0,
                  border: ringColor ? `2.5px solid ${ringColor}` : '2.5px solid transparent',
                  borderRadius: 10,
                  padding: '2px 4px',
                  background: isAnswer ? GREEN_BG : highlighted ? '#FFF7ED' : '#fff',
                  opacity: beat.highlight.size > 0 && !highlighted && !isAnswer ? 0.38 : 1,
                  transition: 'opacity 0.3s, border-color 0.3s',
                }}
              >
                <BirthdayCake n={n} />
                <div
                  className="text-center font-display text-xs font-bold mt-0.5"
                  style={{ color: isAnswer ? GREEN_TEXT : highlighted ? '#92400E' : '#374151' }}
                >
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
