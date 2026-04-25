import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { slugify } from '../lib/youtube'
import type { AdminVideoFormValues, PublicMeta, VideoDetail } from '../types'

const EMPTY_FORM: AdminVideoFormValues = {
  title: '',
  slug: '',
  youtubeUrl: '',
  thumbnailUrl: '',
  subjectId: '',
  ageGroupId: '',
  badgeFamilyId: '',
  numberOfQuestions: 10,
  difficulty: 'easy',
  description: '',
  isPublished: true,
  isFeatured: false,
  sortOrder: 0,
  badgeRules: [
    { tier: 1, minCorrect: 1, maxCorrect: 5 },
    { tier: 2, minCorrect: 6, maxCorrect: 10 },
    { tier: 3, minCorrect: 11, maxCorrect: null },
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
          badgeFamilyId: state.badgeFamilyId || metaResponse.data.data.badgeFamilies[0].id,
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

  const subjectOptions = meta?.subjects ?? []
  const ageGroupOptions = meta?.ageGroups ?? []
  const badgeOptions = meta?.badgeFamilies ?? []

  const titlePreview = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title])

  function startCreate() {
    setEditingId(null)
    setMessage('')
    setForm({
      ...EMPTY_FORM,
      subjectId: subjectOptions[0]?.id ?? '',
      ageGroupId: ageGroupOptions[0]?.id ?? '',
      badgeFamilyId: badgeOptions[0]?.id ?? '',
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
      badgeFamilyId: video.badgeFamily.id,
      numberOfQuestions: video.numberOfQuestions,
      difficulty: video.difficulty,
      description: video.description ?? '',
      isPublished: video.isPublished,
      isFeatured: video.isFeatured,
      sortOrder: video.sortOrder,
      badgeRules: video.badgeRules.map((rule) => ({
        tier: rule.tier,
        minCorrect: rule.minCorrect,
        maxCorrect: rule.maxCorrect,
      })),
    })
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
        badgeRules: form.badgeRules.map((rule) => ({
          tier: rule.tier,
          minCorrect: Number(rule.minCorrect),
          maxCorrect: rule.maxCorrect === null || rule.maxCorrect === undefined
            ? null
            : Number(rule.maxCorrect),
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

  async function handleDelete(videoId: string) {
    try {
      await api.delete(`/admin/videos/${videoId}`)
      setMessage('Video berhasil dihapus.')
      await refresh()
      if (editingId === videoId) {
        startCreate()
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      setMessage('Gagal menghapus video.')
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-6 shadow-soft sm:p-8">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Admin</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">
          Video catalog dan badge rule QUPU
        </h1>
        <p className="mt-3 max-w-2xl text-qupu-muted">
          Tambah video baru, edit metadata, dan atur tier badge per video tanpa menyentuh database manual.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-qupu-orange">Editor</div>
              <h2 className="font-display text-3xl font-bold text-qupu-purple">
                {editingId ? 'Edit video' : 'Tambah video'}
              </h2>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 text-sm font-bold text-qupu-purple"
            >
              <Plus className="h-4 w-4" />
              Form baru
            </button>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <AdminInput label="Judul video" value={form.title} onChange={(value) => setForm((state) => ({ ...state, title: value }))} />
            <AdminInput label="Slug" value={form.slug} onChange={(value) => setForm((state) => ({ ...state, slug: value }))} helper={`Preview: ${titlePreview || '-'}`} />
            <AdminInput label="YouTube URL" value={form.youtubeUrl} onChange={(value) => setForm((state) => ({ ...state, youtubeUrl: value }))} />
            <AdminInput label="Thumbnail URL" value={form.thumbnailUrl} onChange={(value) => setForm((state) => ({ ...state, thumbnailUrl: value }))} />

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSelect
                label="Subject"
                value={form.subjectId}
                onChange={(value) => setForm((state) => ({ ...state, subjectId: value }))}
                options={subjectOptions.map((subject) => ({ value: subject.id, label: subject.name }))}
              />
              <AdminSelect
                label="Age group"
                value={form.ageGroupId}
                onChange={(value) => setForm((state) => ({ ...state, ageGroupId: value }))}
                options={ageGroupOptions.map((group) => ({ value: group.id, label: group.name }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminInput
                label="Jumlah soal"
                type="number"
                value={String(form.numberOfQuestions)}
                onChange={(value) => setForm((state) => ({ ...state, numberOfQuestions: Number(value) }))}
              />
              <AdminSelect
                label="Difficulty"
                value={form.difficulty}
                onChange={(value) => setForm((state) => ({ ...state, difficulty: value as AdminVideoFormValues['difficulty'] }))}
                options={[
                  { value: 'easy', label: 'easy' },
                  { value: 'medium', label: 'medium' },
                  { value: 'hard', label: 'hard' },
                ]}
              />
              <AdminInput
                label="Sort order"
                type="number"
                value={String(form.sortOrder)}
                onChange={(value) => setForm((state) => ({ ...state, sortOrder: Number(value) }))}
              />
            </div>

            <AdminSelect
              label="Badge family"
              value={form.badgeFamilyId}
              onChange={(value) => setForm((state) => ({ ...state, badgeFamilyId: value }))}
              options={badgeOptions.map((family) => ({ value: family.id, label: family.name }))}
            />

            <label className="block">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">Deskripsi</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none focus:border-qupu-orange"
              />
            </label>

            <div className="grid gap-4 rounded-[1.5rem] bg-qupu-shell p-4">
              <div className="font-bold text-qupu-purple">Rule badge per tier</div>
              {form.badgeRules.map((rule, index) => (
                <div key={rule.tier} className="grid gap-3 rounded-[1.2rem] bg-white p-4 sm:grid-cols-3">
                  <div className="font-semibold text-qupu-purple">Tier {rule.tier}</div>
                  <AdminInput
                    label="Min benar"
                    type="number"
                    value={String(rule.minCorrect)}
                    onChange={(value) =>
                      setForm((state) => ({
                        ...state,
                        badgeRules: state.badgeRules.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, minCorrect: Number(value) } : item,
                        ),
                      }))
                    }
                  />
                  <AdminInput
                    label="Max benar"
                    type="number"
                    value={rule.maxCorrect === null ? '' : String(rule.maxCorrect)}
                    onChange={(value) =>
                      setForm((state) => ({
                        ...state,
                        badgeRules: state.badgeRules.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, maxCorrect: value === '' ? null : Number(value) }
                            : item,
                        ),
                      }))
                    }
                    helper={rule.tier === 3 ? 'Kosongkan untuk tier terakhir tanpa batas.' : undefined}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow
                label="Publish video"
                checked={form.isPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
              />
              <ToggleRow
                label="Featured di landing"
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
              />
            </div>

            {message && (
              <div className="rounded-[1.25rem] bg-qupu-cream px-4 py-3 text-sm font-semibold text-qupu-purple">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-purple px-5 py-4 text-base font-bold text-white transition-colors hover:bg-qupu-purple-dark disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : editingId ? 'Update video' : 'Buat video'}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
          <div className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-qupu-orange">Catalog</div>
          {loading ? (
            <div className="h-64 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
          ) : (
            <div className="grid gap-4">
              {videos.map((video) => (
                <div key={video.id} className="rounded-[1.5rem] bg-qupu-shell p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-24 w-36 rounded-[1rem] object-cover"
                      />
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                            style={{ backgroundColor: video.subject.colorHex }}
                          >
                            {video.subject.name}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-qupu-purple">
                            {video.ageGroup.name}
                          </span>
                        </div>
                        <div className="mt-2 font-bold text-qupu-purple">{video.title}</div>
                        <div className="mt-1 text-sm text-qupu-muted">
                          {video.badgeFamily.name} • {video.numberOfQuestions} soal
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(video)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-qupu-purple shadow-soft"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(video.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  helper?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none focus:border-qupu-orange"
      />
      {helper && <div className="mt-2 text-xs font-semibold text-qupu-muted">{helper}</div>}
    </label>
  )
}

function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none focus:border-qupu-orange"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between rounded-[1.25rem] bg-qupu-shell px-4 py-4">
      <span className="font-semibold text-qupu-purple">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-qupu-orange"
      />
    </label>
  )
}
