import { useCallback, useEffect, useRef, useState } from 'react'
import WmiFeedbackPanel from '../components/wmi/WmiFeedbackPanel'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteButtons from '../components/wmi/WmiVoteButtons'
import { getIllustration } from '../components/wmi/concepts/registry'
import { fetchConceptNext, submitConceptAttempt, submitConceptVote } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiAttemptResult, WmiConceptQuestion, WmiQuestion } from '../types/wmi'

export default function WmiKonsepDrill() {
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [lookedUpTerms, setLookedUpTerms] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const askedAt = useRef(Date.now())

  const loadNext = useCallback(async () => {
    if (!activeChildId) return
    setSelected(null)
    setFeedback(null)
    setLookedUpTerms([])
    setRevealed(false)
    setError(null)
    try {
      const q = await fetchConceptNext(activeChildId)
      setQuestion(q)
      askedAt.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat soal')
    }
  }, [activeChildId])

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
    } catch (err) {
      setSelected(null)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jawaban')
    }
  }

  const onVote = async (vote: 1 | -1) => {
    if (!activeChildId || !question) return
    await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>
  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!question) return <div className="p-6 text-center">Memuat soal...</div>

  const Illustration = getIllustration(question.concept_slug)

  // Adapt the concept question to WmiQuestionView's expected props.
  const adapted: WmiQuestion = {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-qupu-brand-blue">Latihan Konsep</h1>
      </div>
      {Illustration && (
        <div className="mb-2">
          <Illustration params={question.params} />
        </div>
      )}
      <WmiQuestionView
        question={adapted}
        selectedChoice={selected}
        highlight={
          feedback
            ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
            : undefined
        }
        disabled={Boolean(feedback)}
        revealed={revealed}
        onPickChoice={submit}
        onSubmitFillIn={submit}
        onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
        onRevealTranslation={() => setRevealed(true)}
      />
      {feedback && (
        <>
          <WmiFeedbackPanel
            isCorrect={feedback.is_correct}
            correctAnswer={feedback.correct_answer}
            hintEn={feedback.hint_en}
            hintId={feedback.hint_id}
            onNext={loadNext}
          />
          <WmiVoteButtons onVote={onVote} />
        </>
      )}
    </div>
  )
}
