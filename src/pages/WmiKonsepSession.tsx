import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import KonsepSessionShowcase from '../components/wmi/KonsepSessionShowcase'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteButtons from '../components/wmi/WmiVoteButtons'
import { PLANT_STAGES } from '../components/wmi/plantStages'
import PlantIcon from '../components/wmi/PlantIcon'
import { getIllustration } from '../components/wmi/concepts/registry'
import { commitKonsepSession, fetchConceptNext, fetchGarden, gradeConceptAnswer, submitConceptVote } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type {
  WmiConceptQuestion,
  WmiGardenConcept,
  WmiGrade,
  WmiKonsepGradeResult,
  WmiKonsepSessionResult,
  WmiQuestion,
} from '../types/wmi'

const SESSION_SIZE = 20

function buildPlan(concepts: WmiGardenConcept[]): WmiGardenConcept[] {
  const plan: WmiGardenConcept[] = []
  let prev: string | null = null
  for (let i = 0; i < SESSION_SIZE; i++) {
    const pool = concepts.length > 1 ? concepts.filter((c) => c.slug !== prev) : concepts
    const weights = pool.map((c) => Math.max(1, 100 - c.pct))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let pick = pool[0]
    for (let j = 0; j < pool.length; j++) {
      r -= weights[j]
      if (r <= 0) {
        pick = pool[j]
        break
      }
    }
    plan.push(pick)
    prev = pick.slug
  }
  return plan
}

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

export default function WmiKonsepSession() {
  const { subjectKey } = useParams<{ subjectKey: string }>()
  const { activeChildId } = useAuthStore()
  const setLastSubjectKey = useWmiStore((state) => state.setLastSubjectKey)
  const navigate = useNavigate()

  // Derive grade from subjectKey prefix (g1-…, g2-…, g3-…)
  const grade = (subjectKey ? Number(subjectKey[1]) : 0) as WmiGrade

  // Garden loading
  const [loadingGarden, setLoadingGarden] = useState(true)
  const [plan, setPlan] = useState<WmiGardenConcept[] | null>(null)
  const [gardenError, setGardenError] = useState<string | null>(null)

  // Per-question state
  const [idx, setIdx] = useState(0)
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [loadingQ, setLoadingQ] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiKonsepGradeResult | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [answers, setAnswers] = useState<{ concept_instance_id: string; selected_answer: string }[]>([])

  // Session commit state
  const [committing, setCommitting] = useState(false)
  const [commitError, setCommitError] = useState(false)
  const [result, setResult] = useState<WmiKonsepSessionResult | null>(null)

  // Prevent double-submit
  const submittingRef = useRef(false)

  // ── Step 1: load garden → build plan ──────────────────────────────────────
  useEffect(() => {
    if (!activeChildId || !subjectKey) return
    let cancelled = false
    setLoadingGarden(true)
    setGardenError(null)

    fetchGarden(activeChildId, grade)
      .then((garden) => {
        if (cancelled) return
        const chapter = garden.chapters.find((ch) => ch.subjectKey === subjectKey)
        if (!chapter || chapter.concepts.length === 0) {
          setGardenError('Belum ada konsep untuk bab ini.')
          return
        }
        // Build the plan ONCE here; never rebuild
        setPlan(buildPlan(chapter.concepts))
        // Session actually starts now — remember it per child for resume.
        setLastSubjectKey(subjectKey)
      })
      .catch((err) => {
        if (!cancelled) setGardenError(err instanceof Error ? err.message : 'Gagal memuat data konsep.')
      })
      .finally(() => { if (!cancelled) setLoadingGarden(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId, subjectKey])

  // ── Step 2: load question for plan[idx] whenever plan/idx changes ─────────
  const fetchQuestion = useCallback(async (planItem: WmiGardenConcept) => {
    if (!activeChildId) return
    setLoadingQ(true)
    setQuestion(null)
    setSelected(null)
    setFeedback(null)
    try {
      const q = await fetchConceptNext(activeChildId, grade, planItem.slug)
      setQuestion(q)
    } catch (err) {
      // surface via null question + gardenError
      setGardenError(err instanceof Error ? err.message : 'Gagal memuat soal.')
    } finally {
      setLoadingQ(false)
    }
  }, [activeChildId, grade])

  useEffect(() => {
    if (!plan) return
    fetchQuestion(plan[idx])
  }, [plan, idx, fetchQuestion])

  // ── Answer submission ──────────────────────────────────────────────────────
  const handleAnswer = async (answer: string) => {
    if (!question || feedback || submittingRef.current) return
    submittingRef.current = true
    setSubmittingAnswer(true)
    setSelected(answer)
    try {
      const fb = await gradeConceptAnswer(activeChildId!, question.concept_instance_id, answer)
      setFeedback(fb)
    } catch {
      // reset so user can retry
      setSelected(null)
    } finally {
      submittingRef.current = false
      setSubmittingAnswer(false)
    }
  }

  // ── Session commit (dedicated, retryable) ─────────────────────────────────
  const commitSession = useCallback(async (finalAnswers: { concept_instance_id: string; selected_answer: string }[]) => {
    if (!activeChildId || !subjectKey || committing) return
    setCommitError(false)
    setCommitting(true)
    try {
      const sessionResult = await commitKonsepSession(activeChildId, subjectKey, finalAnswers)
      setResult(sessionResult)
    } catch {
      setCommitError(true)
    } finally {
      setCommitting(false)
    }
  }, [activeChildId, subjectKey, committing])

  // ── "Lanjut" button ────────────────────────────────────────────────────────
  const handleLanjut = () => {
    if (!question || !feedback || !plan) return
    // Guard: if answers are already fully banked, the commit path owns this UI — never append again
    if (answers.length >= SESSION_SIZE) return

    const newAnswers = [...answers, { concept_instance_id: question.concept_instance_id, selected_answer: selected ?? '' }]

    if (idx < SESSION_SIZE - 1) {
      setAnswers(newAnswers)
      setIdx((i) => i + 1)
      // question fetch triggered by idx effect
    } else {
      // 20th question answered — bank the final array ONCE, then commit
      setAnswers(newAnswers)
      void commitSession(newAnswers)
    }
  }

  // ── Vote ───────────────────────────────────────────────────────────────────
  const onVote = async (vote: 1 | -1) => {
    if (activeChildId && question) await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  // ── Quit ───────────────────────────────────────────────────────────────────
  const handleQuit = () => {
    if (window.confirm('Keluar sesi? Progres sesi ini akan hilang.')) {
      navigate('/latihan/wmi')
    }
  }

  // ── No active child ────────────────────────────────────────────────────────
  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-child-reaching text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">Pilih profil anak dulu untuk mulai latihan.</p>
      </div>
    )
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        {/* Trophy icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[0_6px_0_0_#C46123]">
          <i className="fa-solid fa-trophy" aria-hidden="true" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Sesi selesai!</h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          {result.correct} dari {result.total} jawaban benar
        </p>

        {/* XP earned */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display font-black text-qupu-brand-orange ring-2 ring-[#FFE3CC]">
          <i className="fa-solid fa-star text-sm" aria-hidden="true" />
          +{result.xpEarned} XP
        </div>

        {/* Level-up note */}
        {result.levelUp && (
          <div className="mt-3 rounded-[1.25rem] bg-qupu-brand-blue p-3 text-sm font-bold text-white shadow-[0_3px_0_0_#0E1430]">
            <i className="fa-solid fa-arrow-up me-1" aria-hidden="true" />
            Level naik ke Level {result.levelUp.currentLevel} — {result.levelUp.tierName}!
          </div>
        )}

        {/* Concepts grown */}
        {result.conceptsGrown.length > 0 && (
          <div className="mt-4 space-y-2 text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-qupu-brand-orange">Konsep Tumbuh</p>
            {result.conceptsGrown.map((cg) => {
              const from = PLANT_STAGES[cg.fromTier as 0 | 1 | 2 | 3 | 4]
              const to = PLANT_STAGES[cg.toTier as 0 | 1 | 2 | 3 | 4]
              return (
                <div
                  key={cg.slug}
                  className="flex items-center gap-3 rounded-[1.25rem] bg-white p-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
                    style={{ background: to.bg, color: to.fg }}
                  >
                    <PlantIcon tier={cg.toTier as 0 | 1 | 2 | 3 | 4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[13px] font-black leading-tight text-qupu-brand-blue">{cg.nameId}</div>
                    <div className="mt-0.5 text-[10px] font-bold text-qupu-muted">
                      {from.labelId} <i className="fa-solid fa-arrow-right mx-0.5 text-[8px]" aria-hidden="true" /> {to.labelId}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Link
          to="/latihan/wmi"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430]"
        >
          <i className="fa-solid fa-seedling text-sm" aria-hidden="true" />
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadingGarden) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-qupu-peach border-t-qupu-brand-orange" />
        <p className="mt-3 text-sm font-semibold text-qupu-muted">Memuat sesi…</p>
      </div>
    )
  }

  if (gardenError) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">{gardenError}</p>
        <Link to="/latihan/wmi" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  if (!plan) return null

  const currentPlanItem = plan[idx]

  // ── Main session UI ────────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-8">
      {/* Confetti on correct answer — re-mount per question via key */}
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${idx}`} />}

      {/* Top row: quit button + single progress indicator */}
      <div className="mb-3 px-1">
        <div className="mb-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleQuit}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
            Keluar
          </button>
          <span className="font-display text-xs font-black text-qupu-brand-blue">
            Soal {idx + 1} / {SESSION_SIZE}
          </span>
        </div>
        {/* Slim progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + 1) / SESSION_SIZE) * 100}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
      </div>

      {/* Showcase band: concept info */}
      <KonsepSessionShowcase
        concept={{ nameId: currentPlanItem.nameId, tier: currentPlanItem.tier, tags: currentPlanItem.tags }}
      />

      {/* Question card area */}
      <div className="mt-4">
        {loadingQ || !question ? (
          <QuestionSkeleton />
        ) : (
          <div className="space-y-4">
            <WmiQuestionView
              question={adaptConceptQuestion(question)}
              label={question.concept_name_id}
              hideConceptTitle
              conceptIllustration={getIllustration(question.concept_slug)}
              conceptIllustrationParams={question.params}
              selectedChoice={selected}
              highlight={
                feedback
                  ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
                  : undefined
              }
              disabled={Boolean(feedback) || submittingAnswer}
              onPickChoice={handleAnswer}
              onSubmitFillIn={handleAnswer}
              onLookupTerm={() => {}}
              onRevealTranslation={() => {}}
            />

            {/* Feedback panel (shown after answer) */}
            {feedback && (
              <div
                className={`rounded-[1.5rem] border-2 p-4 shadow-[0_5px_0_0_#FFD3B1] ${
                  feedback.is_correct
                    ? 'border-[#58A700]/40 bg-[#E8F5D6]'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                {/* Correct / wrong badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${
                      feedback.is_correct ? 'bg-[#58A700]' : 'bg-rose-400'
                    }`}
                  >
                    <i
                      className={`fa-solid ${feedback.is_correct ? 'fa-check' : 'fa-xmark'} text-sm`}
                      aria-hidden="true"
                    />
                  </span>
                  <span className={`font-display font-black ${feedback.is_correct ? 'text-[#2D6B00]' : 'text-rose-600'}`}>
                    {feedback.is_correct ? 'Benar!' : 'Belum tepat'}
                  </span>
                </div>

                {/* Correct answer (shown on wrong) */}
                {!feedback.is_correct && (
                  <p className="mt-2 text-sm font-semibold text-rose-700">
                    Jawaban benar: <span className="font-black">{feedback.correct_answer}</span>
                  </p>
                )}

                {/* Hint */}
                {(feedback.hint_id ?? feedback.hint_en) && (
                  <p className="mt-2 text-xs font-semibold text-qupu-muted">
                    {feedback.hint_id ?? feedback.hint_en}
                  </p>
                )}

                {/* Vote buttons */}
                <WmiVoteButtons onVote={onVote} />

                {/* Lanjut / commit area */}
                {answers.length >= SESSION_SIZE ? (
                  // Final answer already banked — show commit/loading/retry state only
                  <div className="mt-4 space-y-2">
                    {commitError && (
                      <p className="text-center text-xs font-semibold text-rose-600">
                        <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                        Gagal menyimpan sesi. Coba lagi.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => void commitSession(answers)}
                      disabled={committing}
                      className="w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] disabled:opacity-50 transition-transform active:translate-y-0.5"
                    >
                      {committing
                        ? 'Menyimpan…'
                        : commitError
                        ? 'Coba lagi'
                        : 'Selesaikan Sesi'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLanjut}
                    className="mt-4 w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
                  >
                    Lanjut
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
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
