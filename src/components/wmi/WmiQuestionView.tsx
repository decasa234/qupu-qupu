import { Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import type { WmiChoice, WmiQuestion } from '../../types/wmi'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import { stripSectionLabels } from '../../lib/wmiBreakdown'
import ErrorBoundary from '../ErrorBoundary'
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
import { getQuestionIllustration, getQuestionExplainer, getQuestionChoiceRenderer } from './PastPapers/WMI/registry'

interface Props {
  question: WmiQuestion
  // Replaces the default "Soal {number}" eyebrow. Konsep passes the concept
  // name here (concept questions have no meaningful sequential number).
  label?: string
  /** When true, hides the label/eyebrow line (used on the kid-facing konsep
   *  session/drill screens, which keep the question card free of labels). */
  hideConceptTitle?: boolean
  selectedChoice?: string | null
  fillValue?: string
  highlight?: { correct: string | null; wrongPicked: string | null }
  disabled?: boolean
  revealed?: boolean
  breakdownActive?: boolean
  /** Sticky per-child starting language. Ignored while `revealed` forces 'id'.
   *  Defaults to 'en' — competition prep keeps English-first. */
  initialLang?: 'en' | 'id'
  /** Admin/preview override: pins the initial display language even when
   *  `revealed` is set (which otherwise forces 'id'). The EN/ID toggle still
   *  works; this only sets the default. */
  previewLang?: 'en' | 'id'
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
  /** Fires only on a manual EN/ID toggle tap (never on per-question resets) —
   *  hosts persist the sticky language preference here. */
  onUserToggleLanguage?: (lang: 'en' | 'id') => void
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
  initialLang,
  previewLang,
  conceptIllustration = null,
  conceptIllustrationParams,
  onToggleBreakdown,
  onPickChoice,
  onSubmitFillIn,
  onLookupTerm,
  onRevealTranslation,
  onLanguageChange,
  onUserToggleLanguage,
}: Props) {
  const [localFill, setLocalFill] = useState(fillValue)
  // Active display language. Starts in the child's sticky preference (default
  // English); the translation toggle swaps it in place. Reset whenever the
  // question changes (review starts pre-revealed in id).
  const resolvedInitial = previewLang ?? (revealed ? 'id' : initialLang ?? 'en')
  const [lang, setLang] = useState<'en' | 'id'>(resolvedInitial)
  // The language this question STARTED in — reveal telemetry only fires on a
  // true EN→ID reveal. An ID-default question toggled around is not a reveal.
  const startLangRef = useRef<'en' | 'id'>(resolvedInitial)
  // Read through a ref inside the reset effect: a manual toggle writes the
  // sticky preference back to the store, which re-renders with a new
  // initialLang mid-question — that must not reset the view (or rewrite the
  // question's start language).
  const initialLangRef = useRef(initialLang)
  initialLangRef.current = initialLang
  useEffect(() => {
    const next = previewLang ?? (revealed ? 'id' : initialLangRef.current ?? 'en')
    startLangRef.current = next
    setLang(next)
    onLanguageChange?.(next)
  }, [question.id, revealed, previewLang, onLanguageChange])

  const isId = lang === 'id'
  const body = isId ? question.body_id : question.body_en
  const choices: WmiChoice[] = (isId ? question.choices_id : question.choices_en) ?? []

  const toggleLang = () => {
    const next = lang === 'en' ? 'id' : 'en'
    if (next === 'id' && startLangRef.current === 'en') onRevealTranslation()
    onLanguageChange?.(next)
    onUserToggleLanguage?.(next)
    setLang(next)
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
    <article className="relative rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
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
      {/* Illustrations come from lazy registries — a late pop-in is fine.
          Boundary (keyed per question so one crash doesn't hide the next
          question's illustration) sits OUTSIDE Suspense: a broken illustration
          vanishes, the question stays fully usable. */}
      <ErrorBoundary key={question.id} scope="illustration" fallback={null}>
        <Suspense fallback={null}>
          {Illustration ? (
            <Illustration />
          ) : ConceptIllustration ? (
            <ConceptIllustration params={conceptIllustrationParams} />
          ) : (
            <WmiFigure src={question.figure_url} />
          )}
        </Suspense>
      </ErrorBoundary>

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
                // Lazy renderer — show the plain choice text until it loads,
                // and ALSO if the renderer crashes (the choice must stay
                // pickable, so the fallback is text, not nothing).
                <ErrorBoundary
                  key={`${question.id}-${choice.label}`}
                  scope="illustration"
                  fallback={<MarkupText text={choice.text} onLookup={onLookupTerm} />}
                >
                  <Suspense fallback={<MarkupText text={choice.text} onLookup={onLookupTerm} />}>
                    <ChoiceContent choice={choice} />
                  </Suspense>
                </ErrorBoundary>
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
            className="min-w-0 flex-1 rounded-full border-2 border-qupu-peach bg-qupu-shell px-4 py-2.5 font-semibold focus:border-qupu-brand-orange focus:outline-none disabled:opacity-60"
            placeholder="Jawabanmu"
          />
          <button
            type="submit"
            disabled={disabled || !localFill.trim()}
            className="rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5 disabled:opacity-50"
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
