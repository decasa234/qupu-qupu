import { useState } from 'react'
import type { WmiChoice, WmiQuestion } from '../../types/wmi'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import WmiAnswerChoice from './WmiAnswerChoice'
import WmiFigure from './WmiFigure'
import WmiGlossaryTerm from './WmiGlossaryTerm'
import WmiTranslationSpoiler from './WmiTranslationSpoiler'
import WmiBreakdownView from './WmiBreakdownView'
import WmiBreakdownToggle from './WmiBreakdownToggle'

interface Props {
  question: WmiQuestion
  selectedChoice?: string | null
  fillValue?: string
  highlight?: { correct: string | null; wrongPicked: string | null }
  disabled?: boolean
  revealed?: boolean
  breakdownActive?: boolean
  onToggleBreakdown?: () => void
  onPickChoice: (label: string) => void
  onSubmitFillIn: (answer: string) => void
  onLookupTerm: (slug: string) => void
  onRevealTranslation: () => void
}

function MarkupText({ text, onLookup }: { text: string; onLookup: (slug: string) => void }) {
  return (
    <>
      {parseWmiMarkup(text).map((segment, index) =>
        segment.type === 'text' ? (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ) : (
          <WmiGlossaryTerm key={`${segment.slug}-${index}`} slug={segment.slug} onLookup={onLookup}>
            {segment.text}
          </WmiGlossaryTerm>
        ),
      )}
    </>
  )
}

export default function WmiQuestionView({
  question,
  selectedChoice = null,
  fillValue = '',
  highlight,
  disabled,
  revealed = false,
  breakdownActive = false,
  onToggleBreakdown,
  onPickChoice,
  onSubmitFillIn,
  onLookupTerm,
  onRevealTranslation,
}: Props) {
  const [localFill, setLocalFill] = useState(fillValue)
  const choices = question.choices_en ?? []
  const choicesId = question.choices_id ?? []

  return (
    <article className="rounded-xl border-2 border-qupu-cream-dark bg-white p-4">
      <div className="text-sm font-bold text-qupu-muted">Soal {question.number}</div>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        {breakdownActive ? (
          <WmiBreakdownView text={question.body_en} lang="en" onLookup={onLookupTerm} />
        ) : (
          <MarkupText text={question.body_en} onLookup={onLookupTerm} />
        )}
      </div>
      {onToggleBreakdown && (
        <WmiBreakdownToggle active={breakdownActive} onToggle={onToggleBreakdown} />
      )}
      <WmiFigure src={question.figure_url} />

      {question.answer_type === 'multiple_choice' ? (
        <div className="mt-4 grid gap-3">
          {choices.map((choice: WmiChoice) => (
            <WmiAnswerChoice
              key={choice.label}
              choice={choice}
              selected={selectedChoice === choice.label}
              correct={highlight?.correct === choice.label}
              wrongPicked={highlight?.wrongPicked === choice.label}
              disabled={disabled}
              onPick={onPickChoice}
            >
              <MarkupText text={choice.text} onLookup={onLookupTerm} />
            </WmiAnswerChoice>
          ))}
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            if (!disabled && localFill.trim()) onSubmitFillIn(localFill.trim())
          }}
        >
          <input
            value={localFill}
            disabled={disabled}
            onChange={(event) => setLocalFill(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border-2 border-qupu-cream-dark px-3 py-2"
            placeholder="Jawaban"
          />
          <button
            type="submit"
            disabled={disabled || !localFill.trim()}
            className="rounded-lg bg-qupu-brand-blue px-4 py-2 font-bold text-white disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      )}

      <WmiTranslationSpoiler revealed={revealed} onReveal={onRevealTranslation}>
        <div className="font-semibold">
          {breakdownActive ? (
            <WmiBreakdownView text={question.body_id} lang="id" onLookup={onLookupTerm} />
          ) : (
            <MarkupText text={question.body_id} onLookup={onLookupTerm} />
          )}
        </div>
        {choicesId.length > 0 && (
          <div className="mt-3 grid gap-2 text-sm">
            {choicesId.map((choice) => (
              <div key={choice.label}>
                <strong>{choice.label}.</strong> <MarkupText text={choice.text} onLookup={onLookupTerm} />
              </div>
            ))}
          </div>
        )}
      </WmiTranslationSpoiler>
    </article>
  )
}
