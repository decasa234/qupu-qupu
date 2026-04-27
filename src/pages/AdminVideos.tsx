import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import SkeletonCard from '../components/SkeletonCard'
import BadgeCurve from '../components/BadgeCurve'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../components/ConfirmDangerousAction'
import api from '../lib/api'
import { slugify } from '../lib/youtube'
import type { AdminVideoFormValues, PublicMeta, VideoDetail } from '../types'

const INPUT =
  'w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500'

const EMPTY_FORM: AdminVideoFormValues = {
  title: '',
  slug: '',
  youtubeUrl: '',
  thumbnailUrl: '',
  subjectId: '',
  ageGroupId: '',
  numberOfQuestions: 10,
  difficulty: 'easy',
  description: '',
  isPublished: true,
  isFeatured: false,
  sortOrder: 0,
  badgeRanges: [
    { minCorrect: 0, maxCorrect: 4, badgeCount: 1 },
    { minCorrect: 5, maxCorrect: 7, badgeCount: 2 },
    { minCorrect: 8, maxCorrect: null, badgeCount: 3 },
  ],
}

export default function AdminVideosPage() {
  const [meta, setMeta] = useState<PublicMeta | null>(null)
  const [videos, setVideos] = useState<VideoDetail[]>([])
  const [form, setForm] = useState<AdminVideoFormValues>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<VideoDetail | null>(null)
  const [importing, setImporting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [metaResponse, videosResponse] = await Promise.all([
        api.get('/public/meta'),
        api.get('/admin/videos'),
      ])

      setMeta(metaResponse.data.data)
      setVideos(videosResponse.data.data.videos)
      if (!editingId && metaResponse.data.data.subjects[0]) {
        setForm((state) => ({
          ...state,
          subjectId: state.subjectId || metaResponse.data.data.subjects[0].id,
          ageGroupId: state.ageGroupId || metaResponse.data.data.ageGroups[0].id,
        }))
      }
    } catch (error) {
      console.error('Failed to load admin videos:', error)
    } finally {
      setLoading(false)
    }
  }, [editingId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const subjectOptions = useMemo(() => meta?.subjects ?? [], [meta])
  const ageGroupOptions = useMemo(() => meta?.ageGroups ?? [], [meta])

  const titlePreview = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title])

  const selectedSubject = useMemo(
    () => subjectOptions.find((subject) => subject.id === form.subjectId) ?? null,
    [subjectOptions, form.subjectId],
  )

  function startCreate() {
    setEditingId(null)
    setMessage('')
    const firstSubject = subjectOptions[0]
    const template = firstSubject?.defaultBadgeRanges ?? []
    setForm({
      ...EMPTY_FORM,
      subjectId: firstSubject?.id ?? '',
      ageGroupId: ageGroupOptions[0]?.id ?? '',
      badgeRanges:
        template.length > 0 ? template.map((r) => ({ ...r })) : EMPTY_FORM.badgeRanges,
    })
  }

  function applyTemplate() {
    const subject = subjectOptions.find((s) => s.id === form.subjectId)
    const template = subject?.defaultBadgeRanges ?? []
    if (template.length === 0) {
      setMessage(`Subject "${subject?.name ?? ''}" belum punya template.`)
      return
    }
    setForm((s) => ({
      ...s,
      badgeRanges: template.map((r) => ({ ...r })),
    }))
    setMessage(`Template ${subject?.name ?? ''} diterapkan.`)
  }

  function handleSubjectChange(subjectId: string) {
    const subject = subjectOptions.find((s) => s.id === subjectId)
    setForm((s) => {
      const isCreating = editingId === null
      const isPristine =
        JSON.stringify(s.badgeRanges) === JSON.stringify(EMPTY_FORM.badgeRanges) ||
        s.badgeRanges.length === 0
      const shouldApplyTemplate =
        subject &&
        subject.defaultBadgeRanges &&
        subject.defaultBadgeRanges.length > 0 &&
        (isCreating || isPristine)
      return {
        ...s,
        subjectId,
        badgeRanges: shouldApplyTemplate
          ? subject.defaultBadgeRanges!.map((r) => ({ ...r }))
          : s.badgeRanges,
      }
    })
  }

  function startEdit(video: VideoDetail) {
    setEditingId(video.id)
    setMessage('')
    setForm({
      title: video.title,
      slug: video.slug,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl,
      subjectId: video.subject.id,
      ageGroupId: video.ageGroup.id,
      numberOfQuestions: video.numberOfQuestions,
      difficulty: video.difficulty,
      description: video.description ?? '',
      isPublished: video.isPublished,
      isFeatured: video.isFeatured,
      sortOrder: video.sortOrder,
      badgeRanges: video.badgeRanges.map((range) => ({
        minCorrect: range.minCorrect,
        maxCorrect: range.maxCorrect,
        badgeCount: range.badgeCount,
      })),
    })
  }

  function addRange() {
    setForm((state) => {
      const last = state.badgeRanges[state.badgeRanges.length - 1]
      const fallbackMin = last
        ? Math.min((last.maxCorrect ?? state.numberOfQuestions) + 1, state.numberOfQuestions)
        : 0
      const nextCount = last ? last.badgeCount + 1 : 1
      return {
        ...state,
        badgeRanges: [
          ...state.badgeRanges,
          { minCorrect: fallbackMin, maxCorrect: null, badgeCount: nextCount },
        ],
      }
    })
  }

  function removeRange(index: number) {
    setForm((state) => ({
      ...state,
      badgeRanges: state.badgeRanges.filter((_, i) => i !== index),
    }))
  }

  function updateRange(index: number, patch: Partial<AdminVideoFormValues['badgeRanges'][number]>) {
    setForm((state) => ({
      ...state,
      badgeRanges: state.badgeRanges.map((range, i) =>
        i === index ? { ...range, ...patch } : range,
      ),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        numberOfQuestions: Number(form.numberOfQuestions),
        sortOrder: Number(form.sortOrder),
        badgeRanges: form.badgeRanges.map((range) => ({
          minCorrect: Number(range.minCorrect),
          maxCorrect:
            range.maxCorrect === null || range.maxCorrect === undefined
              ? null
              : Number(range.maxCorrect),
          badgeCount: Number(range.badgeCount),
        })),
      }

      if (editingId) {
        await api.put(`/admin/videos/${editingId}`, payload)
        setMessage('Video berhasil diperbarui.')
      } else {
        await api.post('/admin/videos', payload)
        setMessage('Video berhasil dibuat.')
      }

      await refresh()
      startCreate()
    } catch (error: unknown) {
      console.error('Failed to save video:', error)
      const nextMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menyimpan video.'
      setMessage(nextMessage)
    } finally {
      setSaving(false)
    }
  }

  async function handleYouTubeImport() {
    if (!form.youtubeUrl.trim()) {
      setMessage('Isi dulu YouTube URL.')
      return
    }
    setImporting(true)
    setMessage('')
    try {
      const response = await api.get('/admin/youtube-import', {
        params: { url: form.youtubeUrl.trim() },
      })
      const meta = response.data.data as {
        videoId: string
        title: string
        description: string
        thumbnailUrl: string
        publishedAt: string | null
      }
      setForm((state) => ({
        ...state,
        title: meta.title,
        slug: state.slug || slugify(meta.title),
        description: meta.description,
        thumbnailUrl: meta.thumbnailUrl,
      }))
      setMessage('Metadata YouTube berhasil diimpor.')
    } catch (error: unknown) {
      const text =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (error as { response: { data: { error: string } } }).response.data.error
          : 'Gagal impor dari YouTube.'
      setMessage(text)
    } finally {
      setImporting(false)
    }
  }

  async function performDelete() {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/videos/${confirmDelete.id}`)
      setMessage(`Video "${confirmDelete.title}" dihapus.`)
      await refresh()
      if (editingId === confirmDelete.id) {
        startCreate()
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      setMessage('Gagal menghapus video.')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Videos"
        title="Kelola video QUPU"
        description="Tambah video, edit metadata, atur range badge. Warna badge otomatis dari subject."
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">
              {editingId ? 'Edit video' : 'Tambah video'}
            </h2>
            <button
              type="button"
              onClick={startCreate}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + Form baru
            </button>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <Field label="Judul video">
              <input className={INPUT} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
            </Field>
            <Field label="Slug" hint={`Preview: ${titlePreview || '-'}`}>
              <input className={INPUT} value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </Field>
            <Field
              label="YouTube URL"
              hint="Klik Pull untuk auto-fill judul, deskripsi, dan thumbnail dari YouTube."
            >
              <div className="flex min-w-0 gap-2">
                <input
                  className={INPUT}
                  value={form.youtubeUrl}
                  onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={handleYouTubeImport}
                  disabled={importing || !form.youtubeUrl.trim()}
                  className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? 'Impor...' : 'Pull'}
                </button>
              </div>
            </Field>
            <Field label="Thumbnail URL">
              <input className={INPUT} value={form.thumbnailUrl} onChange={(e) => setForm((s) => ({ ...s, thumbnailUrl: e.target.value }))} />
            </Field>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Field label="Subject">
                <select
                  className={INPUT}
                  value={form.subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Age group">
                <select
                  className={INPUT}
                  value={form.ageGroupId}
                  onChange={(e) => setForm((s) => ({ ...s, ageGroupId: e.target.value }))}
                >
                  {ageGroupOptions.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              <Field label="Jumlah soal">
                <input
                  type="number"
                  className={INPUT}
                  value={String(form.numberOfQuestions)}
                  onChange={(e) => setForm((s) => ({ ...s, numberOfQuestions: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Difficulty">
                <select
                  className={INPUT}
                  value={form.difficulty}
                  onChange={(e) => setForm((s) => ({ ...s, difficulty: e.target.value as AdminVideoFormValues['difficulty'] }))}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </Field>
              <Field label="Sort">
                <input
                  type="number"
                  className={INPUT}
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((s) => ({ ...s, sortOrder: Number(e.target.value) }))}
                />
              </Field>
            </div>

            <Field label="Deskripsi">
              <textarea
                rows={3}
                className={INPUT}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </Field>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {selectedSubject && (
                    <BadgeCurve color={selectedSubject.colorHex} size={28} label={selectedSubject.name} />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Badge ranges</div>
                    <div className="truncate text-[11px] text-slate-500">
                      {selectedSubject ? `Subject: ${selectedSubject.name}` : 'Pilih subject dulu'}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={applyTemplate}
                    disabled={
                      !selectedSubject?.defaultBadgeRanges ||
                      selectedSubject.defaultBadgeRanges.length === 0
                    }
                    title="Apply this subject's template"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Apply template
                  </button>
                  <button
                    type="button"
                    onClick={addRange}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    + Range
                  </button>
                </div>
              </div>

              {form.badgeRanges.length === 0 && (
                <div className="mt-2 rounded-md bg-white px-3 py-2 text-xs text-slate-500">
                  Belum ada range.
                </div>
              )}

              <div className="mt-2 grid gap-2">
                {form.badgeRanges.map((range, index) => (
                  <div key={index} className="grid items-end gap-2 rounded-md bg-white p-2 sm:grid-cols-[auto_1fr_1fr_1fr_auto]">
                    <span className="inline-flex h-9 items-center rounded bg-slate-100 px-2 font-mono text-[10px] font-bold uppercase text-slate-700">
                      R{index + 1}
                    </span>
                    <Field label="Min">
                      <input
                        type="number"
                        className={INPUT}
                        value={String(range.minCorrect)}
                        onChange={(e) => updateRange(index, { minCorrect: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Max" >
                      <input
                        type="number"
                        className={INPUT}
                        value={range.maxCorrect === null ? '' : String(range.maxCorrect)}
                        onChange={(e) => updateRange(index, { maxCorrect: e.target.value === '' ? null : Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Badge">
                      <input
                        type="number"
                        className={INPUT}
                        value={String(range.badgeCount)}
                        onChange={(e) => updateRange(index, { badgeCount: Number(e.target.value) })}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeRange(index)}
                      aria-label="Hapus range"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-500 transition hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash text-xs" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <AdminToggle
                label="Publish"
                helper="Tampil di katalog publik."
                checked={form.isPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
              />
              <AdminToggle
                label="Featured"
                helper="Muncul di home Video Terbaru."
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
              />
            </div>

            {message && (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  message.toLowerCase().startsWith('gagal')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Update video' : 'Buat video'}
            </button>
          </form>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Catalog</h2>
            <span className="text-xs text-slate-500">{videos.length} video</span>
          </div>
          {loading ? (
            <SkeletonCard height="h-64" />
          ) : (
            <div className="grid gap-4">
              {videos.map((video) => {
                const totalRanges = video.badgeRanges.length
                const maxBadges = video.badgeRanges.reduce(
                  (max, range) => Math.max(max, range.badgeCount),
                  0,
                )
                return (
                  <div
                    key={video.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                        <span
                          className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${video.isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}
                        >
                          {video.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                            style={{ backgroundColor: video.subject.colorHex }}
                          >
                            {video.subject.name}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                            {video.ageGroup.name}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                          {video.title}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <BadgeCurve color={video.subject.colorHex} size={16} />
                          {totalRanges} range · max {maxBadges} badge · {video.numberOfQuestions} soal
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(video)}
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(video)}
                          className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDangerousAction
        open={!!confirmDelete}
        title={`Hapus video "${confirmDelete?.title ?? ''}"?`}
        description="Semua skor + badge unlock yang terhubung ke video ini ikut terhapus."
        requiredText={confirmDelete?.slug ?? ''}
        confirmLabel="Hapus video"
        onConfirm={performDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </label>
  )
}

function AdminToggle({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string
  helper?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        {helper && <div className="text-[11px] text-slate-500">{helper}</div>}
      </div>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? 'bg-slate-900' : 'bg-slate-300'
          }`}
        />
        <span
          className={`relative inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </span>
    </label>
  )
}
