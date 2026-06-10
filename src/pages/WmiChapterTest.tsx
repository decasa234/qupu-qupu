import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { startChapterTest, submitChapterTest } from '../lib/wmiApi'
import { fetchGamificationSummary } from '../lib/gamificationApi'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import type { WmiChapterTestQuestion, WmiChapterTestResult } from '../types/wmi'

export default function WmiChapterTest() {
  const { subjectKey } = useParams()
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<WmiChapterTestQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<WmiChapterTestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!activeChildId || !subjectKey) return
    let cancelled = false
    setLoading(true)
    startChapterTest(activeChildId, subjectKey)
      .then((d) => !cancelled && setQuestions(d.questions))
      .catch(() => !cancelled && setQuestions([]))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, subjectKey])

  const current = questions[idx]
  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q.concept_instance_id]),
    [questions, answers],
  )

  async function finish() {
    if (!activeChildId || !subjectKey) return
    const childId = activeChildId
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        concept_instance_id: q.concept_instance_id,
        selected_answer: answers[q.concept_instance_id] ?? '',
      }))
      const testResult = await submitChapterTest(childId, subjectKey, payload)
      setResult(testResult)
      if (testResult.passed) {
        // A pass awards rewards but the test response carries no balances —
        // refresh the top stat strip from the summary endpoint, stamped for
        // the child who took the test. Fire-and-forget: a failure just
        // leaves the strip stale until the next surface fetches.
        fetchGamificationSummary(childId)
          .then((summary) => {
            useGamificationStats.getState().setStats(childId, {
              streak: summary.streak,
              coinBalance: summary.coinBalance,
              level: summary.level,
              tierName: summary.tierName,
              xp: summary.xpIntoCurrent,
              xpToNext: summary.xpToNext,
            })
          })
          .catch(() => { /* stat strip refresh is best-effort */ })
      }
    } finally { setSubmitting(false) }
  }

  if (!activeChildId) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  if (loading) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Memuat tes…</div>

  if (result) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white ${result.passed ? 'bg-[#58A700]' : 'bg-rose-400'}`}>
          <i className={`fa-solid ${result.passed ? 'fa-check' : 'fa-rotate-right'}`} aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
          {result.passed ? 'Bab terbuka!' : 'Belum lulus'}
        </h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          Skor {result.score_pct}% ({result.correct}/{result.total}). {result.passed ? 'Bab ini sekarang terbuka.' : 'Butuh >70%. Coba lagi atau tumbuhkan bab sebelumnya.'}
        </p>
        {/* First-pass reward chips — 0 on repeat passes, so nothing renders */}
        {(result.xp_earned > 0 || result.coins_earned > 0) && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {result.xp_earned > 0 && (
              <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-1.5 font-display text-sm font-black text-white shadow-[0_3px_0_0_#0E1430]">
                <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                +{result.xp_earned} XP
              </span>
            )}
            {result.coins_earned > 0 && (
              <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 font-display text-sm font-black text-white shadow-[0_3px_0_0_#B45309]">
                <i className="fa-solid fa-coins" aria-hidden="true" />
                +{result.coins_earned} koin
              </span>
            )}
          </div>
        )}
        <Link to="/latihan/wmi" className="mt-6 inline-flex rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430]">
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  if (!current) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Tes belum tersedia untuk bab ini.</div>

  const pick = (val: string) => setAnswers((a) => ({ ...a, [current.concept_instance_id]: val }))

  return (
    <div className="mx-auto w-full max-w-[460px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate('/latihan/wmi')} className="text-sm font-bold text-qupu-muted"><i className="fa-solid fa-xmark" aria-hidden="true" /> Keluar</button>
        <span className="text-xs font-black text-qupu-brand-blue">Soal {idx + 1}/{questions.length}</span>
      </div>
      <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <p className="font-display text-lg font-black text-qupu-brand-blue">{current.body_id}</p>
        <div className="mt-4 space-y-2">
          {current.answer_type === 'multiple_choice' && current.choices_id ? (
            current.choices_id.map((ch) => (
              <button key={ch.label} onClick={() => pick(ch.text)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold ${answers[current.concept_instance_id] === ch.text ? 'border-qupu-brand-blue bg-qupu-sky/40' : 'border-qupu-cream-dark bg-white'}`}>
                <span className="font-black text-qupu-brand-blue">{ch.label}</span> {ch.text}
              </button>
            ))
          ) : (
            <input
              type="text" inputMode="numeric"
              value={answers[current.concept_instance_id] ?? ''}
              onChange={(e) => pick(e.target.value)}
              className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-4 py-3 font-semibold focus:border-qupu-brand-orange focus:outline-none"
              placeholder="Jawabanmu"
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        {idx > 0 && (
          <button onClick={() => setIdx((i) => i - 1)} className="flex-1 rounded-full bg-white py-3 font-display font-black text-qupu-brand-blue ring-2 ring-[#FFE3CC]">Sebelumnya</button>
        )}
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx((i) => i + 1)} disabled={!answers[current.concept_instance_id]}
            className="flex-1 rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] disabled:opacity-50">Lanjut</button>
        ) : (
          <button onClick={finish} disabled={!allAnswered || submitting}
            className="flex-1 rounded-full bg-[#58A700] py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] disabled:opacity-50">
            {submitting ? 'Memeriksa…' : 'Selesai'}
          </button>
        )}
      </div>
    </div>
  )
}
