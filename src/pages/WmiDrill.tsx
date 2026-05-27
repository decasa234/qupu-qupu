import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import WmiFeedbackPanel from '../components/wmi/WmiFeedbackPanel'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import { fetchDrillQuestion, submitAttempt } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiAttemptResult, WmiGrade, WmiQuestion } from '../types/wmi'

function parseGrade(raw: string | null): WmiGrade {
  const n = Number(raw ?? 0)
  return n === 1 || n === 2 || n === 3 ? n : 0
}

export default function WmiDrill() {
  const [params] = useSearchParams()
  const grade = useMemo(() => parseGrade(params.get('grade')), [params])
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
  const [question, setQuestion] = useState<WmiQuestion | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [lookedUpTerms, setLookedUpTerms] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [streak, setStreak] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const askedAt = useRef(Date.now())

  const loadQuestion = useCallback(async () => {
    if (!activeChildId) return
    setSelected(null)
    setFeedback(null)
    setLookedUpTerms([])
    setRevealed(false)
    setError(null)
    try {
      setQuestion(await fetchDrillQuestion(activeChildId, grade))
      askedAt.current = Date.now()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat soal')
    }
  }, [activeChildId, grade])

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    loadQuestion()
  }, [loadQuestion])

  const submit = async (answer: string) => {
    if (!activeChildId || !question || feedback) return
    setSelected(answer)
    try {
      const saved = await submitAttempt({
        childId: activeChildId,
        question_id: question.id,
        mode: 'drill',
        selected_answer: answer,
        time_taken_ms: Date.now() - askedAt.current,
        revealed_id_translation: revealed,
        looked_up_terms: lookedUpTerms,
      })
      setFeedback(saved)
      setStreak((value) => (saved.is_correct ? value + 1 : 0))
    } catch (err) {
      setSelected(null)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jawaban')
    }
  }

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>
  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!question) return <div className="p-6 text-center">Memuat soal...</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-qupu-brand-blue">Drill WMI Grade {grade}</h1>
        <span className="rounded-full bg-qupu-cream px-3 py-1 text-sm font-bold text-qupu-brand-blue">
          Streak {streak}
        </span>
      </div>
      <WmiQuestionView
        question={question}
        selectedChoice={selected}
        highlight={
          feedback
            ? {
                correct: feedback.correct_answer,
                wrongPicked: feedback.is_correct ? null : selected,
              }
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
        <WmiFeedbackPanel
          isCorrect={feedback.is_correct}
          correctAnswer={feedback.correct_answer}
          hintEn={feedback.hint_en}
          hintId={feedback.hint_id}
          onNext={() => loadQuestion()}
        />
      )}
    </div>
  )
}
