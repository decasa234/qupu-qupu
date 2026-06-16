import { useCallback, useEffect, useMemo, useState } from 'react'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import WmiExplainer from '../../components/wmi/WmiExplainer'
import WmiTrapNote from '../../components/wmi/WmiTrapNote'
import { getIllustration } from '../../components/wmi/concepts/registry'
import { getExplainer } from '../../components/wmi/concepts/explainers/registry'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Button, Input, Panel, SectionHeading, Textarea } from '../../components/admin/ui'
import {
  fetchConceptList,
  fetchConceptReview,
  fetchConceptSamples,
  saveConceptReview,
  type AdminConceptSample,
  type AdminConceptSummary,
  type ConceptReview,
  type ReviewStatus,
} from '../../lib/wmiAdminApi'
import type { WmiQuestion } from '../../types/wmi'
import { useReviewIssues } from '../../hooks/useReviewIssues'
import { useReviewKeyboard } from '../../hooks/useReviewKeyboard'
import IssuesPanel from '../../components/admin/review/IssuesPanel'
import FlagButton from '../../components/admin/review/FlagButton'
import {
  fetchIssueCounts,
  suggestVerdictClient,
  type IssueCounts,
  type IssuePart,
  type IssueSeverity,
} from '../../lib/wmiReviewIssues'

const noop = () => {}

const STRAND_OPTIONS: { code: string; label: string }[] = [
  { code: 'AR', label: 'Arithmetic & Computation' },
  { code: 'NT', label: 'Number Theory' },
  { code: 'AP', label: 'Algebra & Patterns' },
  { code: 'CO', label: 'Combinatorics & Counting' },
  { code: 'GE', label: 'Geometry & Measurement' },
  { code: 'LR', label: 'Logic & Reasoning' },
]

const STATUS_ORDER = ['pending', 'approved', 'needs_changes'] as const
const STATUS_META: Record<
  ReviewStatus,
  { dot: string; label: string; ring: string; active: string }
> = {
  pending: { dot: 'bg-admin-edge', label: 'Pending', ring: 'border-admin-edge text-admin-muted', active: 'bg-qupu-brand-blue text-white' },
  approved: { dot: 'bg-emerald-500', label: 'Approved', ring: 'border-emerald-300 text-emerald-700', active: 'bg-emerald-600 text-white' },
  needs_changes: { dot: 'bg-amber-500', label: 'Needs changes', ring: 'border-amber-300 text-amber-700', active: 'bg-amber-600 text-white' },
}

function adapt(slug: string, s: AdminConceptSample): WmiQuestion {
  return {
    id: `${slug}-${s.seed}`,
    paper_id: '',
    number: s.seed,
    body_en: s.body_en ?? '',
    body_id: s.body_id ?? '',
    answer_type: s.answer_type ?? 'fill_in',
    choices_en: s.choices_en ?? null,
    choices_id: s.choices_id ?? null,
    figure_url: null,
    hint_en: s.hint_en ?? null,
    hint_id: s.hint_id ?? null,
    difficulty: null,
    breakdown: s.breakdown ?? null,
  }
}

function Chip({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        on ? 'bg-emerald-100 text-emerald-700' : 'bg-admin-sunk text-admin-faint'
      }`}
    >
      <i className={`fa-solid ${on ? 'fa-check' : 'fa-minus'} text-[9px]`} aria-hidden="true" />
      {label}
    </span>
  )
}

function Section({
  title,
  hint,
  part,
  onFlag,
  children,
}: {
  title: string
  hint?: string
  part?: IssuePart
  onFlag?: (i: {
    part: IssuePart
    title: string
    detail: string
    severity: IssueSeverity
    ai_actionable: boolean
  }) => Promise<unknown>
  children: React.ReactNode
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-2">
        <SectionHeading>{title}</SectionHeading>
        {part && onFlag && <FlagButton part={part} onCreate={onFlag} />}
      </div>
      {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </Panel>
  )
}

export default function AdminWmiConcepts() {
  const [concepts, setConcepts] = useState<AdminConceptSummary[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [samples, setSamples] = useState<AdminConceptSample[]>([])
  // Which concept the loaded `samples` belong to. Used to avoid rendering a
  // sample (and its animation) for the previous concept during the render
  // between an activeSlug change and the async sample reload completing.
  const [samplesSlug, setSamplesSlug] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [breakdown, setBreakdown] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [sampleError, setSampleError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Review (editable + saved)
  const [review, setReview] = useState<ConceptReview | null>(null)
  const [status, setStatus] = useState<ReviewStatus>('pending')
  const [notes, setNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [query, setQuery] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'urgent' | ReviewStatus>('all')
  const [strandFilter, setStrandFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [olympiadOnly, setOlympiadOnly] = useState(false)

  useEffect(() => {
    fetchConceptList()
      .then((cs) => {
        setConcepts(cs)
        if (cs[0]) setActiveSlug(cs[0].slug)
      })
      .catch((e) => setListError(e instanceof Error ? e.message : 'Gagal memuat daftar konsep'))
  }, [])

  const loadSamples = useCallback(async (slug: string, seed?: number) => {
    setLoading(true)
    setSampleError(null)
    setBreakdown(false)
    try {
      const { samples: next } = await fetchConceptSamples(slug, 8, seed)
      setSamples(next)
      setSamplesSlug(slug)
      setIdx(0)
    } catch (e) {
      setSampleError(e instanceof Error ? e.message : 'Gagal membuat contoh soal')
      setSamples([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeSlug) loadSamples(activeSlug)
  }, [activeSlug, loadSamples])

  useEffect(() => {
    if (!activeSlug) return
    setReviewLoading(true)
    setSaveError(null)
    setSavedFlash(false)
    fetchConceptReview(activeSlug)
      .then((r) => {
        setReview(r)
        setStatus(r.status)
        setNotes(r.notes)
      })
      .catch((e) => setSaveError(e instanceof Error ? e.message : 'Gagal memuat review'))
      .finally(() => setReviewLoading(false))
  }, [activeSlug])

  const saveReview = async () => {
    if (!activeSlug) return
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await saveConceptReview(activeSlug, status, notes)
      setReview(saved)
      setConcepts((cs) =>
        cs.map((c) => (c.slug === activeSlug ? { ...c, status: saved.status } : c)),
      )
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1800)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Gagal menyimpan review')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return concepts.filter((c) => {
      if (reviewFilter === 'urgent') {
        if (!(c.priority === 'high' && c.status === 'pending')) return false
      } else if (reviewFilter !== 'all' && c.status !== reviewFilter) {
        return false
      }
      if (strandFilter !== 'all' && c.strand !== strandFilter) return false
      if (difficultyFilter !== 'all' && String(c.difficulty) !== difficultyFilter) return false
      if (olympiadOnly && !c.isOlympiad) return false
      if (!q) return true
      return (
        c.short_id.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q) ||
        c.name_id.toLowerCase().includes(q) ||
        c.strand_label.toLowerCase().includes(q) ||
        c.topic_label.toLowerCase().includes(q)
      )
    })
  }, [concepts, query, reviewFilter, strandFilter, difficultyFilter, olympiadOnly])

  // Two-level: strand label -> topic label -> concepts. `filtered` preserves
  // the server sort (strand order -> topic order -> short_id), so Map insertion
  // order reflects it.
  const grouped = useMemo(() => {
    const strands = new Map<string, Map<string, AdminConceptSummary[]>>()
    for (const c of filtered) {
      if (!strands.has(c.strand_label)) strands.set(c.strand_label, new Map())
      const topics = strands.get(c.strand_label)!
      if (!topics.has(c.topic)) topics.set(c.topic, [])
      topics.get(c.topic)!.push(c)
    }
    return [...strands.entries()].map(
      ([strand, topics]) => [strand, [...topics.entries()]] as const,
    )
  }, [filtered])

  const summary = useMemo(() => {
    const counts: Record<ReviewStatus, number> = { pending: 0, approved: 0, needs_changes: 0 }
    for (const c of concepts) counts[c.status] = (counts[c.status] ?? 0) + 1
    return counts
  }, [concepts])

  const urgentCount = useMemo(
    () => concepts.filter((c) => c.priority === 'high' && c.status === 'pending').length,
    [concepts],
  )

  const active = concepts.find((c) => c.slug === activeSlug) ?? null
  const sample = samples[idx] ?? null
  const Illustration = activeSlug ? getIllustration(activeSlug) : null
  const hasExplainer = activeSlug ? Boolean(getExplainer(activeSlug)) : false
  const hasSteps = Boolean(sample?.hint_steps_en?.length || sample?.hint_steps_id?.length)
  const dirty = !review || status !== review.status || notes !== review.notes

  const issueTarget = activeSlug ? { target_type: 'concept' as const, concept_slug: activeSlug } : null
  const { issues, add: addIssue, update: updateIssue } = useReviewIssues(issueTarget)
  const suggested = suggestVerdictClient(issues)
  const flagConcept = useCallback(
    (i: { part: IssuePart; title: string; detail: string; severity: IssueSeverity; ai_actionable: boolean }) =>
      addIssue({ target_type: 'concept', concept_slug: activeSlug!, ...i }),
    [addIssue, activeSlug],
  )
  const [counts, setCounts] = useState<IssueCounts>({
    byConcept: {},
    byPaper: {},
    fixedByConcept: {},
    fixedByPaper: {},
  })
  useEffect(() => {
    fetchIssueCounts().then(setCounts).catch(() => {})
  }, [issues])
  const gotoConceptDelta = (delta: number) => {
    if (filtered.length === 0) return
    const i = filtered.findIndex((c) => c.slug === activeSlug)
    const next = filtered[(Math.max(0, i) + delta + filtered.length) % filtered.length]
    if (next) setActiveSlug(next.slug)
  }
  const nextConceptWithIssues = () => {
    if (filtered.length === 0) return
    const start = filtered.findIndex((c) => c.slug === activeSlug)
    for (let k = 1; k <= filtered.length; k++) {
      const c = filtered[(start + k + filtered.length) % filtered.length]
      if ((counts.byConcept[c.slug] ?? 0) > 0 || (counts.fixedByConcept[c.slug] ?? 0) > 0 || c.status === 'pending') {
        setActiveSlug(c.slug)
        return
      }
    }
  }
  useReviewKeyboard({
    j: () => gotoConceptDelta(1),
    k: () => gotoConceptDelta(-1),
    n: nextConceptWithIssues,
  })

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Konsep"
        title="Math Olympiad Concept Proofreading"
        description="Every registered generator, grouped by olympiad strand → topic. Preview generated questions with answers, breakdown, step-by-step, and animation. Samples are generated live; your review verdict & notes per concept are saved."
      />

      {concepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setReviewFilter('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${
              reviewFilter === 'all'
                ? 'bg-qupu-brand-blue text-white'
                : 'bg-admin-sunk text-admin-muted hover:bg-admin-line'
            }`}
          >
            All <span className="tabular-nums">{concepts.length}</span>
          </button>
          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setReviewFilter((f) => (f === 'urgent' ? 'all' : 'urgent'))}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${
                reviewFilter === 'urgent' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <i className="fa-solid fa-flag text-[11px]" aria-hidden="true" />
              <span className="tabular-nums">{urgentCount}</span> Urgent
            </button>
          )}
          {(['pending', 'needs_changes', 'approved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReviewFilter((f) => (f === s ? 'all' : s))}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${
                reviewFilter === s
                  ? 'bg-qupu-brand-blue text-white'
                  : 'bg-admin-sunk text-admin-muted hover:bg-admin-line'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              <span className="tabular-nums">{summary[s]}</span> {s === 'pending' ? 'Needs review' : STATUS_META[s].label}
            </button>
          ))}
          <span className="text-admin-faint">· click to filter</span>
        </div>
      )}

      {concepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="rounded-full border border-admin-line bg-admin-card px-3 py-1 font-semibold text-admin-ink"
          >
            <option value="all">All strands</option>
            {STRAND_OPTIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="rounded-full border border-admin-line bg-admin-card px-3 py-1 font-semibold text-admin-ink"
          >
            <option value="all">Any difficulty</option>
            {['1', '2', '3', '4', '5'].map((d) => (
              <option key={d} value={d}>
                Difficulty {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-pressed={olympiadOnly}
            onClick={() => setOlympiadOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-colors ${
              olympiadOnly ? 'bg-qupu-brand-orange text-white' : 'bg-admin-sunk text-admin-muted hover:bg-admin-line'
            }`}
          >
            ◆ Olympiad only
          </button>
          <span className="text-admin-faint">· {filtered.length} shown</span>
        </div>
      )}

      {listError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {listError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Concept sidebar, grouped by strand → topic */}
        <aside className="rounded-2xl border border-admin-line bg-admin-card p-2 shadow-admin-soft lg:sticky lg:top-6 lg:max-h-[80vh] lg:self-start lg:overflow-auto">
          <div className="sticky top-0 z-10 -mx-2 -mt-2 mb-1 border-b border-admin-line bg-admin-card px-2 pb-2 pt-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filtered[0]) setActiveSlug(filtered[0].slug)
              }}
              placeholder="Search id / name… (e.g. G14)"
            />
            {query && (
              <div className="px-1 pt-1 text-[11px] text-admin-faint">
                {filtered.length} match{filtered.length === 1 ? '' : 'es'} · Enter to open the first
              </div>
            )}
          </div>
          {grouped.length === 0 && <div className="px-2 py-3 text-sm text-admin-faint">No matches.</div>}
          {grouped.map(([strand, topics]) => (
            <div key={strand} className="mb-3">
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-admin-faint">
                {strand}
              </div>
              {topics.map(([topic, items]) => (
                <div key={topic} className="mb-1">
                  <div className="px-2 pb-0.5 pt-1 text-[10px] font-semibold text-admin-muted">
                    {items[0]?.topic_label ?? topic}
                  </div>
                  {items.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setActiveSlug(c.slug)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors ${
                        c.slug === activeSlug
                          ? 'bg-qupu-brand-blue text-white'
                          : 'text-admin-ink hover:bg-admin-sunk'
                      }`}
                    >
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                          c.slug === activeSlug ? 'bg-white/20 text-white' : 'bg-admin-sunk text-admin-muted'
                        }`}
                      >
                        {c.short_id || '—'}
                      </span>
                      <span className="flex-1 truncate">{c.name_en}</span>
                      <span
                        className={`shrink-0 tabular-nums text-[10px] ${c.slug === activeSlug ? 'text-white/70' : 'text-admin-faint'}`}
                        title={`Difficulty ${c.difficulty}/5`}
                        aria-hidden="true"
                      >
                        d{c.difficulty}
                      </span>
                      {c.isOlympiad && (
                        <span
                          className={`shrink-0 text-[10px] leading-none ${c.slug === activeSlug ? 'text-yellow-200' : 'text-qupu-brand-orange'}`}
                          title="Olympiad-core"
                          aria-hidden="true"
                        >
                          ◆
                        </span>
                      )}
                      <span
                        className={`shrink-0 text-[10px] ${c.slug === activeSlug ? 'text-white/70' : 'text-admin-faint'}`}
                      >
                        G{c.grades.join('')}
                      </span>
                      {c.wmi_refined && (
                        <i
                          className={`fa-solid fa-star shrink-0 text-[10px] leading-none ${
                            c.slug === activeSlug ? 'text-yellow-200' : 'text-qupu-purple'
                          }`}
                          aria-hidden="true"
                          title="WMI Refined"
                        />
                      )}
                      {counts.byConcept[c.slug] > 0 && (
                        <span
                          className="shrink-0 rounded-full bg-qupu-brand-orange px-1.5 text-[9px] font-bold text-white"
                          title={`${counts.byConcept[c.slug]} open issue(s)`}
                        >
                          {counts.byConcept[c.slug]}⚑
                        </span>
                      )}
                      {counts.fixedByConcept[c.slug] > 0 && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                          title="fix awaiting re-review"
                        />
                      )}
                      <i
                        className={`fa-solid shrink-0 text-xs leading-none ${
                          c.status === 'approved'
                            ? 'fa-check text-emerald-500'
                            : c.status === 'needs_changes'
                              ? 'fa-triangle-exclamation text-amber-500'
                              : c.priority === 'high'
                                ? 'fa-flag text-red-600'
                                : 'fa-flag text-qupu-brand-orange'
                        }`}
                        aria-hidden="true"
                        title={
                          c.status === 'pending'
                            ? c.priority === 'high'
                              ? 'Needs review — urgent'
                              : 'Needs review'
                            : STATUS_META[c.status]?.label
                        }
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </aside>

        {/* Preview panel */}
        <div className="min-w-0 space-y-3">
          {active && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-md bg-qupu-brand-blue px-2.5 py-1 font-mono text-base font-extrabold text-white">
                {active.short_id || '—'}
              </span>
              <div>
                <div className="font-display text-lg font-extrabold text-admin-ink">
                  {active.name_en} <span className="text-admin-faint">/</span> {active.name_id}
                </div>
                <code className="text-xs text-admin-muted">{active.slug}</code>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip on label={`Grades ${active.grades.join(', ')}`} />
                <Chip on={Boolean(Illustration)} label="Illustration" />
                <Chip on={hasExplainer} label="Animation" />
                <Chip on={hasSteps} label="Step-by-step" />
                <Chip on label={`Difficulty ${active.difficulty}/5`} />
                <Chip on={active.isOlympiad} label="Olympiad" />
              </div>
            </div>
          )}

          {/* Review — editable verdict + notes, saved per concept */}
          {active && (
            <Section title="Review — saved verdict & notes">
              {reviewLoading ? (
                <div className="text-sm text-admin-faint">Memuat review…</div>
              ) : (
                <div className="grid gap-3">
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
                  {suggested !== status && (
                    <span className="text-xs font-semibold text-admin-faint">
                      Suggested from issues: {suggested.replace('_', ' ')}
                    </span>
                  )}
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Notes / corrections for this concept — what's wrong, the suggested fix, edge cases to handle…"
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
            </Section>
          )}

          {active && (
            <IssuesPanel issues={issues} title="Issues" onUpdate={(id, patch) => updateIssue(id, patch)} />
          )}

          {/* Sample navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              icon="fa-solid fa-chevron-left"
              onClick={() => setIdx((i) => (i - 1 + samples.length) % Math.max(1, samples.length))}
              disabled={samples.length < 2}
            >
              Prev
            </Button>
            <span className="text-sm font-semibold text-admin-muted">
              {samples.length ? `Sample ${idx + 1} / ${samples.length}` : '—'}
              {sample && <span className="ml-1 text-xs text-admin-faint">seed {sample.seed}</span>}
            </span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIdx((i) => (i + 1) % Math.max(1, samples.length))}
              disabled={samples.length < 2}
            >
              Next <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              icon="fa-solid fa-rotate-right"
              onClick={() => activeSlug && loadSamples(activeSlug)}
            >
              New samples
            </Button>
          </div>
          <p className="text-[10px] text-admin-faint">
            Keys: <b>j</b>/<b>k</b> move concept · <b>n</b> next with open issues
          </p>

          {loading && <div className="p-6 text-center text-admin-muted">Membuat contoh…</div>}
          {sampleError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {sampleError}
            </div>
          )}

          {!loading && sample && samplesSlug === activeSlug && (
            <div className="grid gap-4">
              {sample.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Generator error on seed {sample.seed}: {sample.error}
                </div>
              ) : (
                <>
                  <Section title="Question" hint="Toggle EN/ID and breakdown inside the card." part="stem" onFlag={flagConcept}>
                    {activeSlug && (
                      <WmiQuestionView
                        question={adapt(activeSlug, sample)}
                        disabled
                        highlight={{ correct: sample.answer ?? null, wrongPicked: null }}
                        breakdownActive={breakdown}
                        conceptIllustration={Illustration}
                        conceptIllustrationParams={sample.params}
                        onToggleBreakdown={() => setBreakdown((v) => !v)}
                        onPickChoice={noop}
                        onSubmitFillIn={noop}
                        onLookupTerm={noop}
                        onRevealTranslation={noop}
                      />
                    )}
                    <p className="mt-1 text-xs text-admin-faint">
                      Click <span className="font-bold">Q</span> to see the kid-friendly breakdown; the illustration sits in the card.
                    </p>
                  </Section>

                  <Section title="Answer & params" part="answer" onFlag={flagConcept}>
                    <div className="text-sm">
                      <span className="font-bold text-admin-muted">Answer:</span>{' '}
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                        {sample.answer}
                      </span>
                    </div>
                    <pre className="mt-2 overflow-auto rounded-lg bg-admin-sunk p-2 text-xs text-admin-muted">
                      {JSON.stringify(sample.params, null, 1)}
                    </pre>
                  </Section>

                  <Section title="Step-by-step" part="steps" onFlag={flagConcept}>
                    {hasSteps ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Steps label="EN" steps={sample.hint_steps_en} fallback={sample.hint_en} />
                        <Steps label="ID" steps={sample.hint_steps_id} fallback={sample.hint_id} />
                      </div>
                    ) : (
                      <div className="text-sm text-admin-muted">
                        <div>
                          <span className="font-bold text-admin-faint">Hint EN:</span> {sample.hint_en ?? '—'}
                        </div>
                        <div>
                          <span className="font-bold text-admin-faint">Hint ID:</span> {sample.hint_id ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-admin-faint">
                          (No multi-step hints authored for this concept yet.)
                        </div>
                      </div>
                    )}
                    {sample.breakdown?.trap && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <WmiTrapNote trap={sample.breakdown.trap} lang="en" />
                        <WmiTrapNote trap={sample.breakdown.trap} lang="id" />
                      </div>
                    )}
                  </Section>

                  <Section title="Animation" part="animation" onFlag={flagConcept}>
                    {hasExplainer && activeSlug ? (
                      <WmiExplainer
                        key={`${activeSlug}-${sample.seed}`}
                        slug={activeSlug}
                        params={sample.params}
                        correctAnswer={sample.answer ?? ''}
                      />
                    ) : (
                      <div className="text-sm text-admin-faint">No animation authored for this concept yet.</div>
                    )}
                  </Section>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Steps({
  label,
  steps,
  fallback,
}: {
  label: string
  steps?: string[] | null
  fallback?: string | null
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase text-admin-faint">{label}</div>
      {steps?.length ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-admin-ink">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      ) : (
        <div className="text-sm text-admin-muted">{fallback ?? '—'}</div>
      )}
    </div>
  )
}
