import { Suspense, useEffect, useState, type ComponentType } from 'react'
import type { WmiChoice, WmiQuestion } from '../../types/wmi'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import { stripSectionLabels } from '../../lib/wmiBreakdown'
import WmiAnswerChoice from './WmiAnswerChoice'
import WmiFigure from './WmiFigure'
import WmiGlossaryTerm from './WmiGlossaryTerm'
import WmiBreakdownView from './WmiBreakdownView'
import WmiAuthoredBreakdown from './WmiAuthoredBreakdown'
import WmiBreakdownToggle from './WmiBreakdownToggle'
import WmiLanguageToggle from './WmiLanguageToggle'
import WmiExplainer from './WmiExplainer'
import WmiSteps from './WmiSteps'
import WmiTrapNote from './WmiTrapNote'
import { getQuestionIllustration, getQuestionExplainer, getQuestionChoiceRenderer } from './paperQuestions/registry'

interface Props {
  question: WmiQuestion
  // Replaces the default "Soal {number}" eyebrow. Konsep passes the concept
  // name here (concept questions have no meaningful sequential number).
  label?: string
  /** When true, hides the label/eyebrow line (use in the concept session where
   *  the concept name is already shown in the KonsepSessionShowcase). */
  hideConceptTitle?: boolean
  selectedChoice?: string | null
  fillValue?: string
  highlight?: { correct: string | null; wrongPicked: string | null }
  disabled?: boolean
  revealed?: boolean
  breakdownActive?: boolean
  // Concept questions have no paper-registry code; the host passes the concept's
  // illustration (looked up by slug) so it renders inside the problem card.
  conceptIllustration?: ComponentType<{ params: unknown }> | null
  conceptIllustrationParams?: unknown
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
  hideConceptTitle = false,
  selectedChoice = null,
  fillValue = '',
  highlight,
  disabled,
  revealed = false,
  breakdownActive = false,
  conceptIllustration = null,
  conceptIllustrationParams,
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

  const Illustration = getQuestionIllustration(question.code)
  const ConceptIllustration = conceptIllustration
  const QuestionExplainer = getQuestionExplainer(question.code)
  const ChoiceContent = getQuestionChoiceRenderer(question.code)

  const [internalBreakdown, setInternalBreakdown] = useState(false)
  const breakdownControlled = onToggleBreakdown != null
  const bdActive = breakdownControlled ? breakdownActive : internalBreakdown
  const handleBreakdownToggle = breakdownControlled ? onToggleBreakdown : () => setInternalBreakdown((v) => !v)
  const stepList = lang === 'id' ? question.hint_steps_id : question.hint_steps_en

  return (
    <article className="relative rounded-xl border-2 border-qupu-cream-dark bg-white p-4">
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <WmiLanguageToggle lang={lang} onToggle={toggleLang} />
        <WmiBreakdownToggle active={bdActive} onToggle={handleBreakdownToggle} />
      </div>
      {!hideConceptTitle && (
        <div className="pr-28 text-sm font-bold text-qupu-muted">
          {label ?? `Soal ${question.number}`}
        </div>
      )}
      <div className={`${hideConceptTitle ? 'mt-12' : 'mt-2'} text-lg font-semibold text-gray-900`}>
        {bdActive ? (
          question.breakdown ? (
            <WmiAuthoredBreakdown breakdown={question.breakdown} text={body} lang={lang} />
          ) : (
            <WmiBreakdownView text={body} lang={lang} onLookup={onLookupTerm} />
          )
        ) : (
          <MarkupText text={stripSectionLabels(body)} onLookup={onLookupTerm} />
        )}
      </div>
      {/* Illustrations come from lazy registries — a late pop-in is fine. */}
      <Suspense fallback={null}>
        {Illustration ? (
          <Illustration />
        ) : ConceptIllustration ? (
          <ConceptIllustration params={conceptIllustrationParams} />
        ) : (
          <WmiFigure src={question.figure_url} />
        )}
      </Suspense>

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
              {ChoiceContent ? (
                // Lazy renderer — show the plain choice text until it loads.
                <Suspense fallback={<MarkupText text={choice.text} onLookup={onLookupTerm} />}>
                  <ChoiceContent choice={choice} />
                </Suspense>
              ) : (
                <MarkupText text={choice.text} onLookup={onLookupTerm} />
              )}
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
            Jawab
          </button>
        </form>
      )}
      {revealed && stepList && stepList.length > 0 && <WmiSteps steps={stepList} lang={lang} />}
      {revealed && question.breakdown?.trap && <WmiTrapNote trap={question.breakdown.trap} lang={lang} />}
      {revealed && QuestionExplainer && (
        <WmiExplainer explainer={QuestionExplainer} params={{}} correctAnswer="" lang={lang} />
      )}
    </article>
  )
}
