import { useCallback, useEffect, useMemo, useState } from 'react'
import WmiQuestionView from '../../components/wmi/WmiQuestionView'
import WmiExplainer from '../../components/wmi/WmiExplainer'
import { getIllustration } from '../../components/wmi/concepts/registry'
import { getExplainer } from '../../components/wmi/concepts/explainers/registry'
import {
  fetchConceptList,
  fetchConceptSamples,
  type AdminConceptSample,
  type AdminConceptSummary,
} from '../../lib/wmiAdminApi'
import type { WmiQuestion } from '../../types/wmi'

const noop = () => {}

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
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
        on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {on ? '✓ ' : '— '}
      {label}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  )
}

export default function AdminWmiConcepts() {
  const [concepts, setConcepts] = useState<AdminConceptSummary[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [samples, setSamples] = useState<AdminConceptSample[]>([])
  const [idx, setIdx] = useState(0)
  const [breakdown, setBreakdown] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [sampleError, setSampleError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const grouped = useMemo(() => {
    const m = new Map<string, AdminConceptSummary[]>()
    for (const c of concepts) {
      if (!m.has(c.domain_label)) m.set(c.domain_label, [])
      m.get(c.domain_label)!.push(c)
    }
    return [...m.entries()]
  }, [concepts])

  const active = concepts.find((c) => c.slug === activeSlug) ?? null
  const sample = samples[idx] ?? null
  const Illustration = activeSlug ? getIllustration(activeSlug) : null
  const hasExplainer = activeSlug ? Boolean(getExplainer(activeSlug)) : false
  const hasSteps = Boolean(sample?.hint_steps_en?.length || sample?.hint_steps_id?.length)

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">WMI Concept Proofreading</h1>
        <p className="text-sm text-slate-500">
          Every registered generator, grouped by domain. Preview generated questions with answers,
          breakdown, step-by-step, and animation. Samples are generated live — nothing is saved.
        </p>
      </div>

      {listError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{listError}</div>
      )}

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Concept sidebar, grouped by domain */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 lg:sticky lg:top-24 lg:max-h-[80vh] lg:self-start lg:overflow-auto">
          {grouped.map(([domain, items]) => (
            <div key={domain} className="mb-2">
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {domain}
              </div>
              {items.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setActiveSlug(c.slug)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors ${
                    c.slug === activeSlug
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                      c.slug === activeSlug ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c.short_id || '—'}
                  </span>
                  <span className="flex-1 truncate">{c.name_en}</span>
                  <span
                    className={`shrink-0 text-[10px] ${c.slug === activeSlug ? 'text-slate-300' : 'text-slate-400'}`}
                  >
                    G{c.grades.join('')}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Preview panel */}
        <div className="min-w-0">
          {active && (
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-md bg-slate-900 px-2.5 py-1 font-mono text-base font-extrabold text-white">
                {active.short_id || '—'}
              </span>
              <div>
                <div className="font-display text-lg font-extrabold text-slate-900">
                  {active.name_en} <span className="text-slate-400">/</span> {active.name_id}
                </div>
                <code className="text-xs text-slate-500">{active.slug}</code>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip on label={`Grades ${active.grades.join(', ')}`} />
                <Chip on={Boolean(Illustration)} label="Illustration" />
                <Chip on={hasExplainer} label="Animation" />
                <Chip on={hasSteps} label="Step-by-step" />
              </div>
            </div>
          )}

          {/* Sample navigation */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + samples.length) % Math.max(1, samples.length))}
              disabled={samples.length < 2}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              ‹ Prev
            </button>
            <span className="text-sm font-semibold text-slate-600">
              {samples.length ? `Sample ${idx + 1} / ${samples.length}` : '—'}
              {sample && <span className="ml-1 text-xs text-slate-400">seed {sample.seed}</span>}
            </span>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % Math.max(1, samples.length))}
              disabled={samples.length < 2}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Next ›
            </button>
            <button
              type="button"
              onClick={() => activeSlug && loadSamples(activeSlug)}
              className="rounded-lg bg-qupu-brand-blue px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
            >
              ↻ New samples
            </button>
          </div>

          {loading && <div className="p-6 text-center text-slate-500">Membuat contoh…</div>}
          {sampleError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{sampleError}</div>
          )}

          {!loading && sample && (
            <div className="grid gap-4">
              {sample.error ? (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  Generator error on seed {sample.seed}: {sample.error}
                </div>
              ) : (
                <>
                  <Section title="Question (toggle EN/ID and breakdown in the card)">
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

                  <Section title="Answer & params (proofreading)">
                    <div className="text-sm">
                      <span className="font-bold text-slate-500">Answer:</span>{' '}
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                        {sample.answer}
                      </span>
                    </div>
                    <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
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
                      <div className="text-sm text-slate-600">
                        <div>
                          <span className="font-bold text-slate-400">Hint EN:</span> {sample.hint_en ?? '—'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-400">Hint ID:</span> {sample.hint_id ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
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
                      <div className="text-sm text-slate-400">No animation authored for this concept yet.</div>
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
      <div className="mb-1 text-[11px] font-bold uppercase text-slate-400">{label}</div>
      {steps?.length ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      ) : (
        <div className="text-sm text-slate-600">{fallback ?? '—'}</div>
      )}
    </div>
  )
}
