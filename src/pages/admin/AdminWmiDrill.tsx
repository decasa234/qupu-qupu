import { useCallback, useEffect, useMemo, useState } from 'react'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Button, Input, Panel, SectionHeading, Select, Textarea } from '../../components/admin/ui'
import {
  fetchPaperList, fetchPaperQuestions, fetchPaperReview, patchPaperQuestion, savePaperReview,
  type AdminPaperSummary, type AdminPaperQuestion, type PaperReview, type ReviewStatus,
} from '../../lib/wmiAdminApi'
import type { WmiQuestion } from '../../types/wmi'
import { paperCode } from '../../lib/wmiPaperCode'
import { listBrands, getBrand, type Brand } from '../../../api/services/wmi/olympiads/registry'
import { useReviewIssues } from '../../hooks/useReviewIssues'
import IssuesPanel from '../../components/admin/review/IssuesPanel'
import FlagButton from '../../components/admin/review/FlagButton'
import type { IssuePart, IssueSeverity } from '../../lib/wmiReviewIssues'

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

// Tolerant registry accessors — the data only carries registered brands, but the
// selector should never crash on an unexpected brand string.
function brandOrNull(slug: string | null): Brand | null {
  if (!slug) return null
  try {
    return getBrand(slug)
  } catch {
    return null
  }
}

function brandName(slug: string): string {
  return brandOrNull(slug)?.nameId ?? slug.toUpperCase()
}

function roundLabel(slug: string, round: string): string {
  return brandOrNull(slug)?.rounds.find((r) => r.key === round)?.labelId ?? round
}

function levelLabelOf(p: AdminPaperSummary): string {
  // The server already maps a label; prefer it but fall back to the registry/code.
  return p.level_label
    || brandOrNull(p.brand)?.levels.find((l) => l.key === p.level_code)?.labelId
    || p.level_code
}

// `paperCode` consumes the shared registry input; pass `level` (preferred) so a
// null `grade` (SASMO) never reaches the generator.
function codeOf(p: AdminPaperSummary): string {
  return paperCode({ brand: p.brand, year: p.year, round: p.round, level: p.level_code, variant: p.variant })
}

// AdminPaperQuestion is a superset of WmiQuestion (it adds `answer`). Spread it so
// every WmiQuestion field — including code and hint_steps_* used by the per-question
// visuals/steps — flows through without having to enumerate fields (which silently
// dropped new fields in the past).
function toWmiQuestion(q: AdminPaperQuestion): WmiQuestion {
  return { ...q }
}

type FilterValue = string | 'all'

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
  // Selector: brand tabs + filter bar
  const [activeBrand, setActiveBrand] = useState<string | null>(null)
  const [level, setLevel] = useState<FilterValue>('all')
  const [round, setRound] = useState<FilterValue>('all')
  const [year, setYear] = useState<FilterValue>('all')
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all')
  const [search, setSearch] = useState('')
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

  // Brands present in the data, ordered by the registry.
  const brands = useMemo(() => {
    const present = new Set(papers.map((p) => p.brand))
    return listBrands().map((b) => b.slug).filter((s) => present.has(s))
  }, [papers])

  // Default the active brand once papers load (or when the active brand vanishes).
  useEffect(() => {
    if (brands.length === 0) return
    if (activeBrand === null || !brands.includes(activeBrand)) {
      setActiveBrand(brands[0])
    }
  }, [brands, activeBrand])

  // Papers of the active brand (the filter options + list all derive from these).
  const brandPapers = useMemo(
    () => papers.filter((p) => p.brand === activeBrand),
    [papers, activeBrand],
  )

  // Filter option lists, derived from the active brand's papers.
  const levelOptions = useMemo(() => {
    const present = new Set(brandPapers.map((p) => p.level_code))
    const registryLevels = brandOrNull(activeBrand)?.levels ?? []
    const ordered = registryLevels
      .filter((l) => present.has(l.key))
      .map((l) => ({ value: l.key, label: l.labelId }))
    // Include any level_code the registry doesn't know (defensive), at the end.
    const known = new Set(ordered.map((o) => o.value))
    for (const code of present) {
      if (!known.has(code)) ordered.push({ value: code, label: code })
    }
    return ordered
  }, [brandPapers, activeBrand])

  const roundOptions = useMemo(() => {
    const present = [...new Set(brandPapers.map((p) => p.round))]
    return present.map((r) => ({ value: r, label: roundLabel(activeBrand ?? '', r) }))
  }, [brandPapers, activeBrand])

  const yearOptions = useMemo(
    () => [...new Set(brandPapers.map((p) => p.year))].sort((a, b) => b - a),
    [brandPapers],
  )

  // Reset filters whenever the active brand changes (option sets differ per brand).
  useEffect(() => {
    setLevel('all')
    setRound('all')
    setYear('all')
    setStatusFilter('all')
    setSearch('')
  }, [activeBrand])

  // Papers visible after brand + all filters.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return brandPapers.filter(
      (p) =>
        (level === 'all' || p.level_code === level) &&
        (round === 'all' || p.round === round) &&
        (year === 'all' || String(p.year) === year) &&
        (statusFilter === 'all' || p.status === statusFilter) &&
        (q === '' || codeOf(p).toLowerCase().includes(q) || p.title.toLowerCase().includes(q)),
    )
  }, [brandPapers, level, round, year, statusFilter, search])

  // Visible papers grouped by level, groups ordered by the registry level sort.
  const grouped = useMemo<[string, AdminPaperSummary[]][]>(() => {
    const byLevel = new Map<string, AdminPaperSummary[]>()
    for (const p of visible) {
      if (!byLevel.has(p.level_code)) byLevel.set(p.level_code, [])
      byLevel.get(p.level_code)!.push(p)
    }
    const registryLevels = brandOrNull(activeBrand)?.levels ?? []
    // Registry sort when known; unknown levels (defensive) sink to the bottom in
    // insertion order — the server already returns papers ordered by level_sort.
    const sortOf = (code: string) => registryLevels.find((l) => l.key === code)?.sort ?? Number.MAX_SAFE_INTEGER
    return [...byLevel.entries()].sort((a, b) => sortOf(a[0]) - sortOf(b[0]))
  }, [visible, activeBrand])

  // Keep the active paper in sync with the visible set: if it falls out of view,
  // select the first visible paper (or clear when nothing is visible).
  useEffect(() => {
    if (papers.length === 0) return
    if (!activePaperId || !visible.some((p) => p.id === activePaperId)) {
      setActivePaperId(visible[0]?.id ?? null)
    }
  }, [visible, activePaperId, papers.length])

  const activePaper = papers.find((p) => p.id === activePaperId) ?? null
  const currentQuestion = questions[idx] ?? null
  const dirty = !review || status !== review.status || notes !== review.notes

  const issueTarget = activePaperId ? { target_type: 'paper' as const, paper_id: activePaperId } : null
  const { issues, add: addIssue, update: updateIssue } = useReviewIssues(issueTarget)
  const questionMeta = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, { code: q.code, number: q.number }])),
    [questions],
  )
  const thisQuestionIssues = useMemo(
    () => issues.filter((i) => i.question_id === currentQuestion?.id),
    [issues, currentQuestion],
  )
  const [scopeAll, setScopeAll] = useState(false)
  const flagQuestion = useCallback(
    (i: { part: IssuePart; title: string; detail: string; severity: IssueSeverity; ai_actionable: boolean }) =>
      addIssue({
        target_type: 'paper_question',
        paper_id: activePaperId!,
        question_id: currentQuestion!.id,
        ...i,
      }),
    [addIssue, activePaperId, currentQuestion],
  )
  const [editPart, setEditPart] = useState<null | 'stem' | 'answer' | 'hint'>(null)
  const [draft, setDraft] = useState({ body_en: '', body_id: '', answer: '', hint_en: '', hint_id: '' })
  const openEdit = (part: 'stem' | 'answer' | 'hint') => {
    if (!currentQuestion) return
    setDraft({
      body_en: currentQuestion.body_en,
      body_id: currentQuestion.body_id,
      answer: currentQuestion.answer,
      hint_en: currentQuestion.hint_en ?? '',
      hint_id: currentQuestion.hint_id ?? '',
    })
    setEditPart(part)
  }
  const saveEdit = async () => {
    if (!currentQuestion || !activePaperId || !editPart) return
    const qid = currentQuestion.id
    const patch =
      editPart === 'stem'
        ? { body_en: draft.body_en, body_id: draft.body_id }
        : editPart === 'answer'
          ? { answer: draft.answer }
          : { hint_en: draft.hint_en, hint_id: draft.hint_id }
    await patchPaperQuestion(activePaperId, qid, patch)
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, ...patch } : q)))
    const openIssue = issues.find(
      (i) =>
        i.question_id === qid &&
        i.part === editPart &&
        i.status !== 'verified' &&
        i.status !== 'wont_fix',
    )
    if (openIssue) await updateIssue(openIssue.id, { status: 'verified' })
    setEditPart(null)
  }

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
        <div className="space-y-4">
          {/* Brand tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {brands.map((slug) => {
              const on = slug === activeBrand
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveBrand(slug)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    on
                      ? 'bg-qupu-brand-blue text-white'
                      : 'border border-admin-edge bg-white text-admin-ink hover:bg-admin-sunk'
                  }`}
                >
                  {brandName(slug)}
                </button>
              )
            })}
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg border border-dashed border-admin-edge px-3 py-1.5 text-sm font-semibold text-admin-faint opacity-70"
              title="Coming soon"
            >
              + tambah
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Selector: filter bar + list grouped by level */}
            <aside className="space-y-3 lg:sticky lg:top-6 lg:max-h-[80vh] lg:self-start lg:overflow-auto">
              <Panel className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    aria-label="Level"
                  >
                    <option value="all">Semua level</option>
                    {levelOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                  <Select
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    aria-label="Round"
                  >
                    <option value="all">Semua babak</option>
                    {roundOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    aria-label="Year"
                  >
                    <option value="all">Semua tahun</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </Select>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Status"
                  >
                    <option value="all">Semua status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="needs_changes">Needs changes</option>
                  </Select>
                </div>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode atau judul…"
                  aria-label="Search"
                />
              </Panel>

              <div className="rounded-2xl border border-admin-line bg-admin-card p-2 shadow-admin-soft">
                {grouped.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-admin-faint">
                    Tidak ada soal yang cocok.
                  </div>
                ) : (
                  grouped.map(([levelCode, items]) => (
                    <div key={levelCode} className="mb-2">
                      <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-admin-faint">
                        {levelLabelOf(items[0])}
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
                            {codeOf(p)}
                          </span>
                          <span className="flex-1 truncate">
                            {p.year} {roundLabel(p.brand, p.round)}
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
                  ))
                )}
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 space-y-4">
              {activePaper && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="rounded px-1.5 py-0.5 font-mono text-xs font-bold bg-admin-sunk text-admin-muted">
                    {codeOf(activePaper)}
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
                    {roundLabel(activePaper.brand, activePaper.round)}
                  </span>
                  <span className="text-xs text-admin-faint">
                    {levelLabelOf(activePaper)} · {activePaper.year} · {activePaper.question_count} soal
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['stem', 'answer', 'choices', 'hint', 'breakdown', 'steps', 'illustration'] as IssuePart[]).map(
                      (part) => (
                        <FlagButton key={part} part={part} onCreate={flagQuestion} />
                      ),
                    )}
                  </div>
                  {currentQuestion && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="font-bold text-admin-faint">Quick-fix:</span>
                      {(['stem', 'answer', 'hint'] as const).map((part) => (
                        <button
                          key={part}
                          type="button"
                          onClick={() => openEdit(part)}
                          className="rounded-md border border-emerald-600 px-2 py-0.5 font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          ✎ {part}
                        </button>
                      ))}
                    </div>
                  )}
                  {editPart && currentQuestion && (
                    <div className="mt-3 grid gap-2 rounded-lg border border-emerald-500 bg-emerald-50/40 p-3">
                      <div className="text-xs font-bold text-emerald-800">
                        Quick-fix: {editPart} — edits the stored question row
                      </div>
                      {editPart === 'stem' && (
                        <>
                          <Textarea value={draft.body_en} onChange={(e) => setDraft((d) => ({ ...d, body_en: e.target.value }))} rows={2} aria-label="Body EN" />
                          <Textarea value={draft.body_id} onChange={(e) => setDraft((d) => ({ ...d, body_id: e.target.value }))} rows={2} aria-label="Body ID" />
                        </>
                      )}
                      {editPart === 'answer' && (
                        <Input value={draft.answer} onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))} aria-label="Answer" />
                      )}
                      {editPart === 'hint' && (
                        <>
                          <Textarea value={draft.hint_en} onChange={(e) => setDraft((d) => ({ ...d, hint_en: e.target.value }))} rows={2} aria-label="Hint EN" />
                          <Textarea value={draft.hint_id} onChange={(e) => setDraft((d) => ({ ...d, hint_id: e.target.value }))} rows={2} aria-label="Hint ID" />
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Button type="button" onClick={saveEdit}>Save → verify issue</Button>
                        <button type="button" className="text-xs text-admin-faint" onClick={() => setEditPart(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </Panel>
              )}

              {activePaper && (
                <IssuesPanel
                  issues={scopeAll ? issues : thisQuestionIssues}
                  title={scopeAll ? 'In this paper' : 'On this question'}
                  questionMeta={questionMeta}
                  onUpdate={(id, patch) => updateIssue(id, patch)}
                />
              )}
              {activePaper && (
                <button
                  type="button"
                  className="text-xs font-semibold text-admin-muted hover:text-admin-ink"
                  onClick={() => setScopeAll((v) => !v)}
                >
                  {scopeAll ? 'Show this question only' : `Show all paper issues (${issues.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
