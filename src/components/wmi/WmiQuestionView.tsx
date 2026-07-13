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
// The per-code visual registry is a ~250KB mapping table, and this component
// is imported by the EAGER konsep pages (App.tsx keeps them out of lazy routes
// so the post-login hot path never flashes a spinner). Loading the registry as
// its own async chunk keeps that table out of the initial bundle: questions
// render immediately and the bespoke illustration/explainer/choice renderers
// pop in once the chunk arrives (late pop-in is already the documented
// behavior for these visuals). On chunk failure the question stays usable,
// just without bespoke visuals.
type VisualRegistry = typeof import('./PastPapers/WMI/registry')
let visualRegistry: VisualRegistry | null = null
const visualRegistryPromise = import('./PastPapers/WMI/registry')
  .then((mod) => {
    visualRegistry = mod
    return mod
  })
  .catch(() => null)

function useVisualRegistry(): VisualRegistry | null {
  const [registry, setRegistry] = useState(visualRegistry)
  useEffect(() => {
    if (registry) return
    let cancelled = false
    visualRegistryPromise.then((mod) => {
      if (mod && !cancelled) setRegistry(mod)
    })
    return () => {
      cancelled = true
    }
  }, [registry])
  return registry
}

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
  /** Constrain the fill-in input to numeric characters (numeric keypad on
   *  mobile, non-numeric keystrokes filtered out). Default off. */
  numericFillIn?: boolean
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
  numericFillIn = false,
}: Props) {
  const [localFill, setLocalFill] = useState(fillValue)
  // Clear the fill-in input when the question changes. Hosts that keep this
  // component mounted across questions (e.g. a preloaded round) would otherwise
  // carry the previous answer's text into the next question.
  useEffect(() => {
    setLocalFill(fillValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])
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

  const registry = useVisualRegistry()
  const Illustration = registry?.getQuestionIllustration(question.code) ?? null
  const ConceptIllustration = conceptIllustration
  const QuestionExplainer = registry?.getQuestionExplainer(question.code) ?? null
  const ChoiceContent = registry?.getQuestionChoiceRenderer(question.code) ?? null

  // Reusable explainer-pool template binding (Approach A). When a question carries
  // `visual: { templateId, params }`, render the template's parameterized figure +
  // explainer instead of the per-code bespoke components. Bespoke path is unchanged
  // (templateParams stays {} and the bespoke explainer ignores params).
  const templateBinding = question.visual?.templateId
    ? registry?.getTemplate(question.visual.templateId) ?? null
    : null
  const templateParams = question.visual?.params ?? {}
  const TemplateIllustration = templateBinding?.Illustration ?? null
  const ResolvedExplainer = templateBinding?.Explainer ?? QuestionExplainer

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
      {/* mt-6 clears the absolute EN/Q toggle row (top-3 + h-9 ≈ 48px from the
          card top) so the first line of the question never crowds the buttons. */}
      <div className={`${hideConceptTitle ? 'mt-12' : 'mt-6'} text-lg font-semibold text-gray-900`}>
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
          vanishes, the question stays fully usable. Inside, the template-driven
          illustration wins, then the per-code registry illustration, then the
          host-supplied concept illustration, then the static figure. */}
      <ErrorBoundary key={question.id} scope="illustration" fallback={null}>
        <Suspense
          fallback={
            <div className="my-4 flex justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-qupu-cream-dark border-t-qupu-brand-blue" />
            </div>
          }
        >
          {TemplateIllustration ? (
            <TemplateIllustration params={templateParams} />
          ) : Illustration ? (
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
            inputMode={numericFillIn ? 'numeric' : undefined}
            onChange={(event) =>
              setLocalFill(
                numericFillIn ? event.target.value.replace(/[^0-9.-]/g, '') : event.target.value,
              )
            }
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
      {revealed && ResolvedExplainer && (
        <Suspense fallback={<div className="mt-4 h-10 animate-pulse rounded-xl bg-qupu-shell" />}>
          <WmiExplainer explainer={ResolvedExplainer} params={templateParams} correctAnswer="" lang={lang} />
        </Suspense>
      )}
    </article>
  )
}
