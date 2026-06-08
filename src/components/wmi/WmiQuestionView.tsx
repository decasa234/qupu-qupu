import { useEffect, useState } from 'react'
import type { WmiChoice, WmiQuestion } from '../../types/wmi'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import { stripSectionLabels } from '../../lib/wmiBreakdown'
import WmiAnswerChoice from './WmiAnswerChoice'
import WmiFigure from './WmiFigure'
import WmiGlossaryTerm from './WmiGlossaryTerm'
import WmiBreakdownView from './WmiBreakdownView'
import WmiBreakdownToggle from './WmiBreakdownToggle'
import WmiLanguageToggle from './WmiLanguageToggle'

interface Props {
  question: WmiQuestion
  // Replaces the default "Soal {number}" eyebrow. Konsep passes the concept
  // name here (concept questions have no meaningful sequential number).
  label?: string
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
  onLanguageChange?: (lang: 'en' | 'id') => void
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
  label,
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
  onLanguageChange,
}: Props) {
  const [localFill, setLocalFill] = useState(fillValue)
  // Active display language. Starts English; the translation toggle swaps it in
  // place. Reset whenever the question changes (review starts pre-revealed in id).
  const [lang, setLang] = useState<'en' | 'id'>(revealed ? 'id' : 'en')
  useEffect(() => {
    const next = revealed ? 'id' : 'en'
    setLang(next)
    onLanguageChange?.(next)
  }, [question.id, revealed, onLanguageChange])

  const isId = lang === 'id'
  const body = isId ? question.body_id : question.body_en
  const choices: WmiChoice[] = (isId ? question.choices_id : question.choices_en) ?? []

  const toggleLang = () => {
    setLang((current) => {
      const next = current === 'en' ? 'id' : 'en'
      if (next === 'id') onRevealTranslation()
      onLanguageChange?.(next)
      return next
    })
  }

  return (
    <article data-tour="wmi-question" className="relative rounded-xl border-2 border-qupu-cream-dark bg-white p-4">
      <div data-tour="wmi-language" className="absolute right-3 top-3 flex items-center gap-2">
        <WmiLanguageToggle lang={lang} onToggle={toggleLang} />
        {onToggleBreakdown && (
          <WmiBreakdownToggle active={breakdownActive} onToggle={onToggleBreakdown} />
        )}
      </div>
      <div className="pr-28 text-sm font-bold text-qupu-muted">
        {label ?? `Soal ${question.number}`}
      </div>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        {breakdownActive ? (
          <WmiBreakdownView text={body} lang={lang} onLookup={onLookupTerm} />
        ) : (
          <MarkupText text={stripSectionLabels(body)} onLookup={onLookupTerm} />
        )}
      </div>
      <WmiFigure src={question.figure_url} />

      {question.answer_type === 'multiple_choice' ? (
        <div data-tour="wmi-choices" className="mt-4 grid gap-3">
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
          data-tour="wmi-choices"
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
    </article>
  )
}
