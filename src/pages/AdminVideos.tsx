import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BadgeCurve from '../components/BadgeCurve'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../components/ConfirmDangerousAction'
import { useToast } from '../components/admin/Toast'
import {
  Button,
  buttonClass,
  EmptyState,
  Field,
  Input,
  Panel,
  SectionHeading,
  SegmentedControl,
  Select,
  Skeleton,
  Tag,
  Textarea,
} from '../components/admin/ui'
import { BadgeRangeEditor } from '../components/admin/BadgeRangeEditor'
import api from '../lib/api'
import { slugify } from '../lib/youtube'
import { getApiErrorCode, getApiErrorMessage } from '../lib/apiError'
import type { AdminVideoFormValues, PublicMeta, VideoDetail } from '../types'

type CatalogFilter = 'all' | 'draft' | 'published'

interface StaleVideo {
  id: string
  youtubeVideoId: string
  title: string
  isPublished: boolean
  scoreAttempts: number
  badgeUnlocks: number
}

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
  const toast = useToast()
  const [meta, setMeta] = useState<PublicMeta | null>(null)
  const [videos, setVideos] = useState<VideoDetail[]>([])
  const [form, setForm] = useState<AdminVideoFormValues>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<VideoDetail | null>(null)
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState<CatalogFilter>('all')
  // True when the currently-edited row was already published when loaded —
  // we lock the Publish toggle to prevent destructive unpublish in v1.
  const [originallyPublished, setOriginallyPublished] = useState(false)
  // Stale-video scan (videos deleted/private on YouTube). null = not scanned yet.
  const [scanning, setScanning] = useState(false)
  const [staleVideos, setStaleVideos] = useState<StaleVideo[] | null>(null)
  const [confirmPurge, setConfirmPurge] = useState(false)

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
    setOriginallyPublished(false)
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
      toast.error(`Subject "${subject?.name ?? ''}" belum punya template.`)
      return
    }
    setForm((s) => ({
      ...s,
      badgeRanges: template.map((r) => ({ ...r })),
    }))
    toast.success(`Template ${subject?.name ?? ''} diterapkan.`)
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
    setOriginallyPublished(video.isPublished)
    setForm({
      title: video.title,
      slug: video.slug,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl,
      subjectId: video.subject?.id ?? '',
      ageGroupId: video.ageGroup?.id ?? '',
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

    // Client-side publish-validation mirror: when admin tries to publish, every
    // QUPU-required field must be populated. The server runs the same checks
    // (normalizeVideoInput + DB CHECK constraint) but blocking client-side
    // gives the admin a clearer error than a 400 round-trip.
    if (form.isPublished) {
      const missing: string[] = []
      if (!form.subjectId) missing.push('Subject')
      if (!form.ageGroupId) missing.push('Age group')
      if (!form.numberOfQuestions || Number(form.numberOfQuestions) <= 0) {
        missing.push('Jumlah soal')
      }
      if (form.badgeRanges.length === 0) missing.push('Badge ranges')
      if (missing.length > 0) {
        toast.error(`Lengkapi field berikut sebelum publish: ${missing.join(', ')}.`)
        setSaving(false)
        return
      }
    }

    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        subjectId: form.subjectId || null,
        ageGroupId: form.ageGroupId || null,
        numberOfQuestions:
          form.numberOfQuestions === null ||
          form.numberOfQuestions === undefined ||
          (form.numberOfQuestions as unknown as string) === ''
            ? null
            : Number(form.numberOfQuestions),
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
        toast.success('Video berhasil diperbarui.')
      } else {
        await api.post('/admin/videos', payload)
        toast.success('Video berhasil dibuat.')
      }

      await refresh()
      startCreate()
    } catch (error: unknown) {
      console.error('Failed to save video:', error)
      toast.error(getApiErrorMessage(error, 'Gagal menyimpan video.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleYouTubeImport() {
    if (!form.youtubeUrl.trim()) {
      toast.error('Isi dulu YouTube URL.')
      return
    }
    setImporting(true)
    try {
      const response = await api.get('/admin/youtube-import', {
        params: { url: form.youtubeUrl.trim() },
      })
      const ytMeta = response.data.data as {
        videoId: string
        title: string
        description: string
        thumbnailUrl: string
        publishedAt: string | null
      }
      setForm((state) => ({
        ...state,
        title: ytMeta.title,
        slug: state.slug || slugify(ytMeta.title),
        description: ytMeta.description,
        thumbnailUrl: ytMeta.thumbnailUrl,
      }))
      toast.success('Metadata YouTube berhasil diimpor.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Gagal impor dari YouTube.'))
    } finally {
      setImporting(false)
    }
  }

  async function performDelete() {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/videos/${confirmDelete.id}`)
      toast.success(`Video "${confirmDelete.title}" dihapus.`)
      await refresh()
      if (editingId === confirmDelete.id) {
        startCreate()
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast.error('Gagal menghapus video.')
    } finally {
      setConfirmDelete(null)
    }
  }

  const filteredVideos = useMemo(() => {
    if (filter === 'all') return videos
    if (filter === 'draft') return videos.filter((v) => !v.isPublished)
    return videos.filter((v) => v.isPublished)
  }, [videos, filter])

  const draftCount = useMemo(() => videos.filter((v) => !v.isPublished).length, [videos])

  const staleTotals = useMemo(() => {
    const list = staleVideos ?? []
    return {
      scores: list.reduce((sum, v) => sum + v.scoreAttempts, 0),
      badges: list.reduce((sum, v) => sum + v.badgeUnlocks, 0),
    }
  }, [staleVideos])

  async function scanStale() {
    setScanning(true)
    try {
      const response = await api.get('/admin/videos/stale')
      setStaleVideos(response.data.data.videos as StaleVideo[])
    } catch (error) {
      const code = getApiErrorCode(error)
      if (code === 'rate_limited') {
        toast.error('Terlalu sering scan. Tunggu sebentar lalu coba lagi.')
      } else if (code === 'server_misconfigured') {
        toast.error('YouTube belum dikonfigurasi di server.')
      } else {
        toast.error('Gagal scan — YouTube tidak dapat diakses.')
      }
    } finally {
      setScanning(false)
    }
  }

  async function purgeStale() {
    if (!staleVideos || staleVideos.length === 0) return
    try {
      const response = await api.post('/admin/videos/stale/delete', {
        ids: staleVideos.map((v) => v.id),
      })
      const deleted = response.data.data.deleted as number
      toast.success(`${deleted} video usang dihapus.`)
      setStaleVideos(null)
      setConfirmPurge(false)
      await refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus video usang.'))
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Videos"
        title="Kelola video QUPU"
        description="Tambah video, edit metadata, atur range badge. Warna badge otomatis dari subject."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              icon="fa-solid fa-broom"
              loading={scanning}
              onClick={scanStale}
            >
              Scan usang
            </Button>
            <Link to="/admin/videos/import" className={buttonClass('secondary')}>
              <i className="fa-brands fa-youtube text-rose-500" aria-hidden="true" />
              Impor dari YouTube
            </Link>
          </div>
        }
      />

      {staleVideos !== null && (
        <Panel className="border-amber-200">
          <SectionHeading
            right={
              <Button variant="ghost" size="sm" type="button" onClick={() => setStaleVideos(null)}>
                Tutup
              </Button>
            }
          >
            Video usang di YouTube
          </SectionHeading>
          {staleVideos.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="fa-solid fa-circle-check"
              title="Tidak ada video usang"
              hint="Semua video di katalog masih tersedia di YouTube."
            />
          ) : (
            <>
              <p className="mt-2 text-sm text-admin-muted">
                {staleVideos.length} video sudah tidak ada di YouTube (dihapus atau diprivat).
                Menghapusnya juga menghapus {staleTotals.scores} skor + {staleTotals.badges} badge yang
                sudah didapat anak.
              </p>
              <ul className="mt-3 divide-y divide-admin-line">
                {staleVideos.map((video) => (
                  <li key={video.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-admin-ink">{video.title}</div>
                      <div className="text-[11px] text-admin-muted">
                        {video.youtubeVideoId} · {video.scoreAttempts} skor · {video.badgeUnlocks} badge
                      </div>
                    </div>
                    <Tag tone={video.isPublished ? 'brand' : 'neutral'}>
                      {video.isPublished ? 'Published' : 'Draft'}
                    </Tag>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="danger"
                  type="button"
                  icon="fa-solid fa-trash"
                  onClick={() => setConfirmPurge(true)}
                >
                  Hapus {staleVideos.length} video usang
                </Button>
              </div>
            </>
          )}
        </Panel>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Panel className="min-w-0">
          <SectionHeading
            right={
              <Button variant="secondary" size="sm" type="button" onClick={startCreate}>
                + Form baru
              </Button>
            }
          >
            {editingId ? 'Edit video' : 'Tambah video'}
          </SectionHeading>

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Judul video">
              <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
            </Field>
            <Field label="Slug" hint={`Preview: ${titlePreview || '-'}`}>
              <Input value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </Field>
            <Field
              label="YouTube URL"
              hint="Klik Pull untuk auto-fill judul, deskripsi, dan thumbnail dari YouTube."
            >
              <div className="flex min-w-0 gap-2">
                <Input
                  value={form.youtubeUrl}
                  onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
                />
                <Button
                  type="button"
                  onClick={handleYouTubeImport}
                  loading={importing}
                  disabled={!form.youtubeUrl.trim()}
                  className="shrink-0"
                >
                  {importing ? 'Impor...' : 'Pull'}
                </Button>
              </div>
            </Field>
            <Field label="Thumbnail URL">
              <Input
                value={form.thumbnailUrl}
                onChange={(e) => setForm((s) => ({ ...s, thumbnailUrl: e.target.value }))}
              />
            </Field>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Field label="Subject">
                <Select value={form.subjectId} onChange={(e) => handleSubjectChange(e.target.value)}>
                  {subjectOptions.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Age group">
                <Select
                  value={form.ageGroupId}
                  onChange={(e) => setForm((s) => ({ ...s, ageGroupId: e.target.value }))}
                >
                  {ageGroupOptions.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              <Field label="Jumlah soal">
                <Input
                  type="number"
                  value={String(form.numberOfQuestions)}
                  onChange={(e) => setForm((s) => ({ ...s, numberOfQuestions: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, difficulty: e.target.value as AdminVideoFormValues['difficulty'] }))
                  }
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </Select>
              </Field>
              <Field label="Sort">
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(e) => setForm((s) => ({ ...s, sortOrder: Number(e.target.value) }))}
                />
              </Field>
            </div>

            <Field label="Deskripsi">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </Field>

            <BadgeRangeEditor
              ranges={form.badgeRanges}
              onAdd={addRange}
              onRemove={removeRange}
              onUpdate={updateRange}
              subtitle={selectedSubject ? `Subject: ${selectedSubject.name}` : 'Pilih subject dulu'}
              leading={
                selectedSubject ? (
                  <BadgeCurve color={selectedSubject.colorHex} size={28} label={selectedSubject.name} />
                ) : undefined
              }
              headerActions={
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={applyTemplate}
                  disabled={
                    !selectedSubject?.defaultBadgeRanges ||
                    selectedSubject.defaultBadgeRanges.length === 0
                  }
                  title="Apply this subject's template"
                >
                  Apply template
                </Button>
              }
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <AdminToggle
                label="Publish"
                helper={
                  originallyPublished
                    ? 'Sudah dipublikasikan — unpublish belum didukung di v1.'
                    : 'Aktifkan untuk publish setelah subject, age group, dan badge ranges lengkap.'
                }
                checked={form.isPublished}
                disabled={originallyPublished}
                onChange={(checked) => setForm((state) => ({ ...state, isPublished: checked }))}
              />
              <AdminToggle
                label="Featured"
                helper="Muncul di home Video Terbaru."
                checked={form.isFeatured}
                onChange={(checked) => setForm((state) => ({ ...state, isFeatured: checked }))}
              />
            </div>

            <Button type="submit" loading={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Update video' : 'Buat video'}
            </Button>
          </form>
        </Panel>

        <Panel className="min-w-0">
          <SectionHeading
            right={
              <div className="flex items-center gap-3">
                <SegmentedControl<CatalogFilter>
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'all', label: 'Semua' },
                    { value: 'draft', label: `Draft${draftCount > 0 ? ` (${draftCount})` : ''}` },
                    { value: 'published', label: 'Diterbitkan' },
                  ]}
                />
                <span className="text-xs text-admin-muted">{filteredVideos.length} video</span>
              </div>
            }
          >
            Catalog
          </SectionHeading>

          {loading ? (
            <div className="mt-3 grid gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <div className="mt-3 grid gap-4">
              {filteredVideos.map((video) => {
                const totalRanges = video.badgeRanges.length
                const maxBadges = video.badgeRanges.reduce(
                  (max, range) => Math.max(max, range.badgeCount),
                  0,
                )
                return (
                  <div
                    key={video.id}
                    className="rounded-xl border border-admin-line bg-admin-card p-3 transition-colors hover:border-admin-edge"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-admin-line">
                        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                        <span
                          className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase text-white ${
                            video.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        >
                          {video.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {video.subject ? (
                            <Tag color={video.subject.colorHex}>{video.subject.name}</Tag>
                          ) : (
                            <Tag tone="warn">Belum subject</Tag>
                          )}
                          {video.ageGroup ? (
                            <Tag tone="neutral">{video.ageGroup.name}</Tag>
                          ) : (
                            <Tag tone="warn">Belum age group</Tag>
                          )}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm font-semibold text-admin-ink">
                          {video.title}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-admin-muted">
                          {video.subject && <BadgeCurve color={video.subject.colorHex} size={16} />}
                          {totalRanges} range · max {maxBadges} badge · {video.numberOfQuestions ?? '—'} soal
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1.5">
                        <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(video)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(video)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredVideos.length === 0 && (
                <EmptyState
                  icon="fa-solid fa-film"
                  title={
                    filter === 'draft'
                      ? 'Belum ada draft'
                      : filter === 'published'
                        ? 'Belum ada video terbit'
                        : 'Belum ada video'
                  }
                  hint={
                    filter === 'draft'
                      ? 'Impor dari YouTube untuk membuat draft baru.'
                      : 'Tambah video lewat form di samping.'
                  }
                />
              )}
            </div>
          )}
        </Panel>
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

      <ConfirmDangerousAction
        open={confirmPurge}
        title={`Hapus ${staleVideos?.length ?? 0} video usang?`}
        description={`Permanen. ${staleTotals.scores} skor + ${staleTotals.badges} badge yang sudah didapat anak ikut terhapus.`}
        requiredText={`hapus ${staleVideos?.length ?? 0}`}
        confirmLabel="Hapus permanen"
        onConfirm={purgeStale}
        onClose={() => setConfirmPurge(false)}
      />
    </div>
  )
}

function AdminToggle({
  label,
  helper,
  checked,
  disabled,
  onChange,
}: {
  label: string
  helper?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-lg border border-admin-line bg-white px-3 py-2.5 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-admin-ink">{label}</div>
        {helper && <div className="text-[11px] text-admin-muted">{helper}</div>}
      </div>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? 'bg-qupu-brand-blue' : 'bg-admin-edge'
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
