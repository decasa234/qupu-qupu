import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import WmiConceptFeedbackPanel from '../components/wmi/WmiConceptFeedbackPanel'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteButtons from '../components/wmi/WmiVoteButtons'
import WmiExplainer from '../components/wmi/WmiExplainer'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import WmiDots, { type WmiDot } from '../components/wmi/WmiDots'
import { getIllustration } from '../components/wmi/concepts/registry'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchConceptNext, submitConceptAttempt, submitConceptVote } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { syncStatStrip } from '../hooks/useGamificationStats'
import { useWmiStore } from '../store/wmiStore'
import type { WmiAttemptResult, WmiConceptQuestion, WmiQuestion } from '../types/wmi'
import { tagLabel } from '../components/wmi/tagLabels'

export default function WmiKonsepDrill() {
  const { activeChildId } = useAuthStore()
  const { loadGlossary, selectedGrade } = useWmiStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // When present, drill this specific concept (tapped from the catalog) rather
  // than a random one for the grade.
  const conceptSlug = searchParams.get('concept') ?? undefined
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [lookedUpTerms, setLookedUpTerms] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [breakdown, setBreakdown] = useState(false)
  const [questionLang, setQuestionLang] = useState<'en' | 'id'>('en')
  const [error, setError] = useState<string | null>(null)
  // Session history: one entry per answered question (true = correct). Persists
  // across questions for this visit so the dot strip marks what's been done.
  const [results, setResults] = useState<boolean[]>([])
  const askedAt = useRef(Date.now())

  const loadNext = useCallback(async () => {
    if (!activeChildId) return
    setSelected(null)
    setFeedback(null)
    setLookedUpTerms([])
    setRevealed(false)
    setBreakdown(false)
    setQuestionLang('en')
    setError(null)
    setQuestion(null)
    try {
      const q = await fetchConceptNext(activeChildId, selectedGrade, conceptSlug)
      setQuestion(q)
      askedAt.current = Date.now()
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memuat soal'))
    }
  }, [activeChildId, selectedGrade, conceptSlug])

  function handleBack() {
    if (location.key === 'default') navigate('/latihan/wmi')
    else navigate(-1)
  }

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    loadNext()
  }, [loadNext])

  const submit = async (answer: string) => {
    if (!activeChildId || !question || feedback) return
    setSelected(answer)
    try {
      const saved = await submitConceptAttempt({
        childId: activeChildId,
        concept_instance_id: question.concept_instance_id,
        mode: 'concept',
        selected_answer: answer,
        time_taken_ms: Date.now() - askedAt.current,
        revealed_id_translation: revealed,
        looked_up_terms: lookedUpTerms,
      })
      setFeedback(saved)
      setResults((prev) => [...prev, saved.is_correct])
      // Stamped with the child who answered (closed over at submit time).
      if (saved.gamification) {
        syncStatStrip(activeChildId, {
          streak: saved.gamification.streak.current,
          coinBalance: saved.gamification.coinBalance,
          level: saved.gamification.level,
          tierName: saved.gamification.tierName,
        })
      }
    } catch (err) {
      setSelected(null)
      setError(toIndonesianErrorMessage(err, 'Gagal menyimpan jawaban'))
    }
  }

  const onVote = async (vote: 1 | -1) => {
    if (!activeChildId || !question) return
    await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  const Illustration = question ? getIllustration(question.concept_slug) : null
  const hintSteps = useMemo(() => {
    const steps = questionLang === 'id' ? feedback?.hint_steps_id : feedback?.hint_steps_en
    const fallback = questionLang === 'id' ? feedback?.hint_id : feedback?.hint_en
    return steps?.length ? steps : fallback ? [fallback] : []
  }, [feedback, questionLang])

  // Session marker strip: answered questions (correct/wrong) + the active one.
  const recentResults = results.slice(-24)
  const resultOffset = results.length - recentResults.length
  const sessionDots: WmiDot[] = recentResults.map((correct, index): WmiDot => ({
    key: `r-${resultOffset + index}`,
    state: correct ? 'correct' : 'wrong',
    current: feedback != null && index === recentResults.length - 1,
  }))
  if (!feedback && question) {
    sessionDots.push({ key: 'current', state: 'pending', current: true })
  }

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[440px] self-center pb-6">
        <BackRow onBack={handleBack} />
        <KonsepHeader />
        <div className="mt-4 rounded-[1.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-child-reaching text-2xl" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-qupu-muted">Pilih profil anak dulu untuk mulai latihan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[440px] self-center pb-6">
      {feedback?.is_correct && <KonsepConfetti key={question?.concept_instance_id} />}
      <BackRow onBack={handleBack} />
      <KonsepHeader grade={conceptSlug ? undefined : selectedGrade} />

      {sessionDots.length > 0 && (
        <div className="mt-4">
          <WmiDots dots={sessionDots} />
        </div>
      )}

      {error ? (
        <div className="mt-4 rounded-[1.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-qupu-muted">{error}</p>
          <button
            type="button"
            onClick={loadNext}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      ) : !question ? (
        <KonsepSkeleton />
      ) : (
        <div className="mt-4 space-y-4">
          {Illustration && (
            <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-qupu-shell p-4 shadow-[5px_6px_0_0_#FFD3B1]">
              <Illustration params={question.params} />
            </div>
          )}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((t) => {
                const { name_id, color_hex } = tagLabel(t)
                return (
                  <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${color_hex}1A`, color: color_hex }}>
                    {name_id}
                  </span>
                )
              })}
            </div>
          )}
          <WmiQuestionView
            question={adaptConceptQuestion(question)}
            label={questionLang === 'id' ? question.concept_name_id : question.concept_name_en}
            selectedChoice={selected}
            highlight={
              feedback
                ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
                : undefined
            }
            disabled={Boolean(feedback)}
            revealed={revealed}
            breakdownActive={breakdown}
            onToggleBreakdown={() => setBreakdown((value) => !value)}
            onPickChoice={submit}
            onSubmitFillIn={submit}
            onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
            onRevealTranslation={() => setRevealed(true)}
            onLanguageChange={setQuestionLang}
          />
          {feedback && (
            <>
              <WmiExplainer
                slug={question.concept_slug}
                params={question.params}
                correctAnswer={feedback.correct_answer}
                lang={questionLang}
              />
              <WmiConceptFeedbackPanel
                isCorrect={feedback.is_correct}
                correctAnswer={feedback.correct_answer}
                hintSteps={hintSteps}
                lang={questionLang}
                reward={feedback.gamification}
                onNext={loadNext}
              />
              <WmiVoteButtons onVote={onVote} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Adapt the concept question to WmiQuestionView's expected props.
function adaptConceptQuestion(question: WmiConceptQuestion): WmiQuestion {
  return {
    id: question.concept_instance_id,
    paper_id: '',
    number: 0,
    body_en: question.body_en,
    body_id: question.body_id,
    answer_type: question.answer_type,
    choices_en: question.choices_en,
    choices_id: question.choices_id,
    figure_url: null,
    hint_en: question.hint_en,
    hint_id: question.hint_id,
    difficulty: null,
  }
}

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
      >
        <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
        Kembali
      </button>
    </div>
  )
}

function KonsepHeader({ grade }: { grade?: number }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-4 text-white shadow-[0_6px_0_0_#C46123]">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/35" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
          <i className="fa-solid fa-brain" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">WMI · Konsep</p>
          <h1 className="font-display text-2xl font-black leading-none">Latihan Konsep</h1>
          <p className="mt-1 text-xs font-bold text-white/80">
            {grade !== undefined ? `Grade ${grade} · ` : ''}+5 XP tiap jawaban benar
          </p>
        </div>
      </div>
    </section>
  )
}

function KonsepSkeleton() {
  return (
    <div className="mt-4 space-y-4" aria-hidden="true">
      <div className="h-32 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
      <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-3 h-6 w-4/5 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
          ))}
        </div>
      </div>
    </div>
  )
}
