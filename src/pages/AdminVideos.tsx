import { useCallback, useEffect, useMemo, useState } from 'react'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
// Temporary: removed in Tasks 7-8 of the auth-pages redesign plan
import { Pencil, Save, Trash2 } from 'lucide-react'
import PillField from '../components/PillField'
import Toggle from '../components/Toggle'
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
      <Reveal>
        <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
          <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute left-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                Admin · Videos
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
                Kelola video QUPU
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
                Tambah video baru, edit metadata, dan atur tier badge per video tanpa menyentuh database manual.
              </p>
            </div>

            <div className="relative hidden h-44 lg:block">
              <img
                src="/hero-mascot.png"
                alt=""
                draggable={false}
                className="pointer-events-none absolute -right-6 -top-4 h-48 w-auto select-none drop-shadow-[0_18px_30px_rgba(120,60,0,0.18)]"
              />
            </div>
          </div>
        </section>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                Editor
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">
                {editingId ? 'Edit video' : 'Tambah video'}
              </h2>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-transparent px-4 py-[6px] font-display text-sm font-extrabold text-qupu-brand-orange transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-brand-orange hover:text-white"
            >
              <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
              Form baru
            </button>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <PillField icon="fa-solid fa-film" label="Judul video" value={form.title} onChange={(value) => setForm((state) => ({ ...state, title: value }))} />
            <PillField icon="fa-solid fa-link" label="Slug" value={form.slug} onChange={(value) => setForm((state) => ({ ...state, slug: value }))} helper={`Preview: ${titlePreview || '-'}`} />
            <PillField icon="fa-brands fa-youtube" label="YouTube URL" value={form.youtubeUrl} onChange={(value) => setForm((state) => ({ ...state, youtubeUrl: value }))} />
            <PillField icon="fa-solid fa-image" label="Thumbnail URL" value={form.thumbnailUrl} onChange={(value) => setForm((state) => ({ ...state, thumbnailUrl: value }))} />

            <div className="grid gap-4 sm:grid-cols-2">
              <PillSelect
                icon="fa-solid fa-book"
                label="Subject"
                value={form.subjectId}
                onChange={(value) => setForm((state) => ({ ...state, subjectId: value }))}
                options={subjectOptions.map((subject) => ({ value: subject.id, label: subject.name }))}
              />
              <PillSelect
                icon="fa-solid fa-children"
                label="Age group"
                value={form.ageGroupId}
                onChange={(value) => setForm((state) => ({ ...state, ageGroupId: value }))}
                options={ageGroupOptions.map((group) => ({ value: group.id, label: group.name }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <PillField
                icon="fa-solid fa-list-ol"
                label="Jumlah soal"
                type="number"
                value={String(form.numberOfQuestions)}
                onChange={(value) => setForm((state) => ({ ...state, numberOfQuestions: Number(value) }))}
              />
              <PillSelect
                icon="fa-solid fa-gauge-high"
                label="Difficulty"
                value={form.difficulty}
                onChange={(value) => setForm((state) => ({ ...state, difficulty: value as AdminVideoFormValues['difficulty'] }))}
                options={[
                  { value: 'easy', label: 'easy' },
                  { value: 'medium', label: 'medium' },
                  { value: 'hard', label: 'hard' },
                ]}
              />
              <PillField
                icon="fa-solid fa-sort"
                label="Sort order"
                type="number"
                value={String(form.sortOrder)}
                onChange={(value) => setForm((state) => ({ ...state, sortOrder: Number(value) }))}
              />
            </div>

            <PillSelect
              icon="fa-solid fa-medal"
              label="Badge family"
              value={form.badgeFamilyId}
              onChange={(value) => setForm((state) => ({ ...state, badgeFamilyId: value }))}
              options={badgeOptions.map((family) => ({ value: family.id, label: family.name }))}
            />

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Deskripsi</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
              />
            </label>

            <div className="grid gap-4 rounded-[1.75rem] bg-qupu-shell p-5">
              <div className="flex items-center gap-2 font-display text-base font-extrabold text-qupu-brand-blue">
                <i className="fa-solid fa-medal text-qupu-brand-orange" aria-hidden="true" />
                Rule badge per tier
              </div>
              {form.badgeRules.map((rule, index) => {
                const tierColor =
                  rule.tier === 1
                    ? 'bg-qupu-brand-blue text-white'
                    : rule.tier === 2
                    ? 'bg-qupu-brand-orange text-white'
                    : 'bg-qupu-brand-yellow text-qupu-brand-blue'

                return (
                  <div
                    key={rule.tier}
                    className="grid items-end gap-3 rounded-[1.5rem] bg-white p-4 sm:grid-cols-[auto_1fr_1fr]"
                  >
                    <span
                      className={`inline-flex h-12 items-center justify-center rounded-full px-4 font-display text-sm font-extrabold uppercase tracking-[0.16em] ${tierColor}`}
                    >
                      Tier {rule.tier}
                    </span>
                    <PillField
                      icon="fa-solid fa-hashtag"
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
                    <PillField
                      icon="fa-solid fa-hashtag"
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
                )
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Publish video"
                helper="Tampil di katalog publik."
                checked={form.isPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
                iconOn="fa-solid fa-eye"
                iconOff="fa-solid fa-eye-slash"
              />
              <Toggle
                label="Featured di landing"
                helper="Muncul di home Video Terbaru."
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
                iconOn="fa-solid fa-star"
                iconOff="fa-regular fa-star"
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

        <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            <i className="fa-solid fa-rectangle-list" aria-hidden="true" />
            Catalog
          </div>
          {loading ? (
            <SkeletonCard height="h-64" />
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

function PillSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <i
          className={`${icon} pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted`}
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-chevron-down pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-qupu-muted"
          aria-hidden="true"
        />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}
