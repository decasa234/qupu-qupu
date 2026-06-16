import { useCallback, useEffect, useMemo, useState } from 'react'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Button, Panel, SectionHeading, Textarea } from '../../components/admin/ui'
import {
  fetchPaperList, fetchPaperQuestions, fetchPaperReview, savePaperReview,
  type AdminPaperSummary, type AdminPaperQuestion, type PaperReview, type ReviewStatus,
} from '../../lib/wmiAdminApi'
import type { WmiQuestion } from '../../types/wmi'
import { paperCode } from '../../lib/wmiPaperCode'

// WmiQuestionView requires interaction handlers; this is a read-only preview, so they no-op.
const noop = () => {}

const STATUS_ORDER = ['pending', 'approved', 'needs_changes'] as const
const STATUS_META: Record<
  ReviewStatus,
  { dot: string; label: string; ring: string; active: string }
> = {
  pending: { dot: 'bg-admin-edge', label: 'Pending', ring: 'border-admin-edge text-admin-muted', active: 'bg-qupu-brand-blue text-white' },
  approved: { dot: 'bg-emerald-500', label: 'Approved', ring: 'border-emerald-300 text-emerald-700', active: 'bg-emerald-600 text-white' },
  needs_changes: { dot: 'bg-amber-500', label: 'Needs changes', ring: 'border-amber-300 text-amber-700', active: 'bg-amber-600 text-white' },
}

// AdminPaperQuestion is a superset of WmiQuestion (it adds `answer`). Spread it so
// every WmiQuestion field — including code and hint_steps_* used by the per-question
// visuals/steps — flows through without having to enumerate fields (which silently
// dropped new fields in the past).
function toWmiQuestion(q: AdminPaperQuestion): WmiQuestion {
  return { ...q }
}

export default function AdminWmiDrill() {
  const [papers, setPapers] = useState<AdminPaperSummary[]>([])
  const [activePaperId, setActivePaperId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<AdminPaperQuestion[]>([])
  // Which paper the loaded `questions` belong to — guards against showing
  // stale data between an activePaperId change and the async reload completing.
  const [questionsPaperId, setQuestionsPaperId] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [questionsError, setQuestionsError] = useState<string | null>(null)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  // Review
  const [review, setReview] = useState<PaperReview | null>(null)
  const [status, setStatus] = useState<ReviewStatus>('pending')
  const [notes, setNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  // Load paper list on mount
  useEffect(() => {
    setListLoading(true)
    fetchPaperList()
      .then((ps) => {
        setPapers(ps)
        if (ps[0]) setActivePaperId(ps[0].id)
      })
      .catch((e) => setListError(e instanceof Error ? e.message : 'Gagal memuat daftar soal'))
      .finally(() => setListLoading(false))
  }, [])

  // Load questions when active paper changes
  const loadQuestions = useCallback(async (paperId: string) => {
    setQuestionsLoading(true)
    setQuestionsError(null)
    try {
      const qs = await fetchPaperQuestions(paperId)
      setQuestions(qs)
      setQuestionsPaperId(paperId)
      setIdx(0)
    } catch (e) {
      setQuestionsError(e instanceof Error ? e.message : 'Gagal memuat soal')
      setQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activePaperId) loadQuestions(activePaperId)
  }, [activePaperId, loadQuestions])

  // Load review when active paper changes
  useEffect(() => {
    if (!activePaperId) return
    setReviewLoading(true)
    setSaveError(null)
    setSavedFlash(false)
    fetchPaperReview(activePaperId)
      .then((r) => {
        setReview(r)
        setStatus(r.status)
        setNotes(r.notes)
      })
      .catch((e) => setSaveError(e instanceof Error ? e.message : 'Gagal memuat review'))
      .finally(() => setReviewLoading(false))
  }, [activePaperId])

  const saveReview = async () => {
    if (!activePaperId) return
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await savePaperReview(activePaperId, status, notes)
      setReview(saved)
      setPapers((ps) =>
        ps.map((p) => (p.id === activePaperId ? { ...p, status: saved.status } : p)),
      )
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1800)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Gagal menyimpan review')
    } finally {
      setSaving(false)
    }
  }

  // Group papers by grade — memoized so it only recomputes when `papers` changes.
  const grouped = useMemo<[number, AdminPaperSummary[]][]>(() => {
    const gradeMap = new Map<number, AdminPaperSummary[]>()
    for (const p of papers) {
      if (!gradeMap.has(p.grade)) gradeMap.set(p.grade, [])
      gradeMap.get(p.grade)!.push(p)
    }
    const result: [number, AdminPaperSummary[]][] = []
    for (const [grade, items] of [...gradeMap.entries()].sort((a, b) => a[0] - b[0])) {
      result.push([grade, items])
    }
    return result
  }, [papers])

  const activePaper = papers.find((p) => p.id === activePaperId) ?? null
  const currentQuestion = questions[idx] ?? null
  const dirty = !review || status !== review.status || notes !== review.notes

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · WMI"
        title="WMI Drill Papers"
        description="Imported WMI exam papers. Preview each question with its answer, and record a review verdict + notes per paper."
      />

      {listError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {listError}
        </div>
      )}

      {!listLoading && papers.length === 0 && !listError && (
        <div className="rounded-xl border border-dashed border-admin-edge bg-admin-sunk p-8 text-center text-sm text-admin-muted">
          No papers imported yet.
        </div>
      )}

      {papers.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Paper sidebar, grouped by grade */}
          <aside className="rounded-2xl border border-admin-line bg-admin-card p-2 shadow-admin-soft lg:sticky lg:top-6 lg:max-h-[80vh] lg:self-start lg:overflow-auto">
            {grouped.map(([grade, items]) => (
              <div key={grade} className="mb-2">
                <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-admin-faint">
                  Grade {grade}
                </div>
                {items.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePaperId(p.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors ${
                      p.id === activePaperId
                        ? 'bg-qupu-brand-blue text-white'
                        : 'text-admin-ink hover:bg-admin-sunk'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[p.status].dot}`}
                    />
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                        p.id === activePaperId ? 'bg-white/20 text-white' : 'bg-admin-sunk text-admin-muted'
                      }`}
                    >
                      {paperCode(p)}
                    </span>
                    <span className="flex-1 truncate">
                      {p.year} {p.round === 'final' ? 'Final' : 'Semi'}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] tabular-nums ${
                        p.id === activePaperId ? 'text-white/70' : 'text-admin-faint'
                      }`}
                    >
                      {p.question_count} soal
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-4">
            {activePaper && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded px-1.5 py-0.5 font-mono text-xs font-bold bg-admin-sunk text-admin-muted">
                  {paperCode(activePaper)}
                </span>
                <div className="font-display text-lg font-extrabold text-admin-ink">
                  {activePaper.title}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    activePaper.round === 'final'
                      ? 'bg-qupu-brand-blue/10 text-qupu-brand-blue'
                      : 'bg-admin-sunk text-admin-muted'
                  }`}
                >
                  {activePaper.round === 'final' ? 'Final' : 'Semifinal'}
                </span>
                <span className="text-xs text-admin-faint">
                  Grade {activePaper.grade} · {activePaper.year} · {activePaper.question_count} soal
                </span>
              </div>
            )}

            {/* Review panel */}
            {activePaper && (
              <Panel>
                <SectionHeading>Review</SectionHeading>
                {reviewLoading ? (
                  <div className="mt-3 text-sm text-admin-faint">Memuat review…</div>
                ) : (
                  <div className="mt-3 grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ORDER.map((s) => {
                        const m = STATUS_META[s]
                        const on = status === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-colors ${
                              on ? `border-transparent ${m.active}` : `bg-admin-card ${m.ring} hover:bg-admin-sunk`
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${on ? 'bg-white' : m.dot}`} />
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Notes / corrections for this paper — what's wrong, questions to fix, issues found…"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" onClick={saveReview} disabled={saving || !dirty} loading={saving}>
                        {dirty ? 'Save review' : 'Saved'}
                      </Button>
                      {savedFlash && (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <i className="fa-solid fa-check" aria-hidden="true" /> Saved
                        </span>
                      )}
                      {saveError && <span className="text-sm text-rose-600">{saveError}</span>}
                      {review?.updated_at && (
                        <span className="text-xs text-admin-faint">
                          Last saved {new Date(review.updated_at).toLocaleString()}
                          {review.reviewed_by ? ` by ${review.reviewed_by}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {/* Question navigation */}
            {activePaper && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  icon="fa-solid fa-chevron-left"
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0 || questions.length === 0}
                >
                  Prev
                </Button>
                <span className="text-sm font-semibold text-admin-muted">
                  {questions.length ? `${idx + 1} / ${questions.length}` : '—'}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={idx >= questions.length - 1 || questions.length === 0}
                >
                  Next <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </Button>
              </div>
            )}

            {questionsLoading && (
              <div className="p-6 text-center text-admin-muted">Memuat soal…</div>
            )}

            {questionsError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {questionsError}
              </div>
            )}

            {!questionsLoading && currentQuestion && questionsPaperId === activePaperId && (
              <Panel>
                <WmiQuestionView
                  question={toWmiQuestion(currentQuestion)}
                  label={`Soal ${currentQuestion.number}`}
                  disabled
                  revealed
                  onPickChoice={noop}
                  onSubmitFillIn={noop}
                  onLookupTerm={noop}
                  onRevealTranslation={noop}
                />
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="font-bold text-admin-muted">Answer:</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                    {currentQuestion.answer}
                  </span>
                </div>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
