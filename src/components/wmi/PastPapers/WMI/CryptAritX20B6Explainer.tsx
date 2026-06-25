import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CryptAritGrid, CELLS_X20B6 } from './CryptAritX20B6Illustration'
import { buildCryptAritX20B6Story } from './cryptAritX20B6Steps'

// SEAMO-X 2020 Paper B Q6 — AT × AT = CAT, find C.  Answer: C = 6.

const GREEN = '#10B981'

export default function CryptAritX20B6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCryptAritX20B6Story(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.steps.length - 1]

  const aria =
    lang === 'id'
      ? 'AT dikali AT sama dengan CAT. AT adalah 25 karena 25 dikali 25 adalah 625. Jadi C sama dengan 6.'
      : 'AT times AT equals CAT. AT is 25 because 25 times 25 is 625. So C equals 6.'

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <CryptAritGrid
          cells={CELLS_X20B6}
          revealed={beat.revealed}
          focusLetter={beat.focusLetter}
        />
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
