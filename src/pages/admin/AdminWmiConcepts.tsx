import { useCallback, useEffect, useMemo, useState } from 'react'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import WmiExplainer from '../../components/wmi/WmiExplainer'
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

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Panel>
      <SectionHeading>{title}</SectionHeading>
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
  // Mobile-only: track whether user has explicitly opened a concept detail view.
  // activeSlug is auto-set on load (desktop convenience), but on mobile we want
  // the list to show first; only switch to detail when the user taps a row.
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

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
      if (!q) return true
      return (
        c.short_id.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q) ||
        c.name_id.toLowerCase().includes(q) ||
        c.domain_label.toLowerCase().includes(q)
      )
    })
  }, [concepts, query, reviewFilter])

  const grouped = useMemo(() => {
    const m = new Map<string, AdminConceptSummary[]>()
    for (const c of filtered) {
      if (!m.has(c.domain_label)) m.set(c.domain_label, [])
      m.get(c.domain_label)!.push(c)
    }
    return [...m.entries()]
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

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · WMI"
        title="WMI Concept Proofreading"
        description="Every registered generator, grouped by domain. Preview generated questions with answers, breakdown, step-by-step, and animation. Samples are generated live; your review verdict & notes per concept are saved."
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

      {listError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {listError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Concept sidebar, grouped by domain */}
        <aside className={`rounded-2xl border border-admin-line bg-admin-card p-2 shadow-admin-soft lg:sticky lg:top-6 lg:max-h-[80vh] lg:self-start lg:overflow-auto ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-0 z-10 -mx-2 -mt-2 mb-1 border-b border-admin-line bg-admin-card px-2 pb-2 pt-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filtered[0]) { setActiveSlug(filtered[0].slug); setMobileShowDetail(true) }
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
          {grouped.map(([domain, items]) => (
            <div key={domain} className="mb-2">
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-admin-faint">
                {domain}
              </div>
              {items.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => { setActiveSlug(c.slug); setMobileShowDetail(true) }}
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
        </aside>

        {/* Preview panel */}
        <div className={`min-w-0 space-y-3 ${mobileShowDetail ? 'block' : 'hidden lg:block'}`}>
          <button
            type="button"
            onClick={() => setMobileShowDetail(false)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-qupu-brand-blue lg:hidden"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Daftar konsep
          </button>
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
                  <Section title="Question" hint="Toggle EN/ID and breakdown inside the card.">
                    {activeSlug && (
                      <WmiQuestionView
                        question={adapt(activeSlug, sample)}
                        disabled
                        highlight={{ correct: sample.answer ?? null, wrongPicked: null }}
                        breakdownActive={breakdown}
                        onToggleBreakdown={() => setBreakdown((v) => !v)}
                        onPickChoice={noop}
                        onSubmitFillIn={noop}
                        onLookupTerm={noop}
                        onRevealTranslation={noop}
                      />
                    )}
                  </Section>

                  {Illustration && (
                    <Section title="Illustration">
                      <Illustration params={sample.params} />
                    </Section>
                  )}

                  <Section title="Answer & params">
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

                  <Section title="Step-by-step">
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
                  </Section>

                  <Section title="Animation">
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
