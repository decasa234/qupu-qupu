import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BadgeCurve from '../components/BadgeCurve'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../components/ConfirmDangerousAction'
import { Drawer } from '../components/admin/Drawer'
import { useToast } from '../components/admin/Toast'
import { Toolbar } from '../components/admin/Toolbar'
import {
  Button,
  buttonClass,
  EmptyState,
  Input,
  Panel,
  SectionHeading,
  SegmentedControl,
  Select,
  Skeleton,
  Tag,
} from '../components/admin/ui'
import VideoEditor, { emptyVideoForm } from '../components/admin/VideoEditor'
import api from '../lib/api'
import { filterSortPaginateVideos, type CatalogSort } from '../lib/adminVideoCatalog'
import { statusTone } from '../lib/adminStatus'
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

// A draft is publish-ready once all four publish-gated fields are present.
function isComplete(video: VideoDetail): boolean {
  return Boolean(video.subject && video.ageGroup && video.numberOfQuestions && video.badgeRanges.length > 0)
}

function formFromVideo(video: VideoDetail): AdminVideoFormValues {
  return {
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
    badgeRanges: video.badgeRanges.map((r) => ({
      minCorrect: r.minCorrect,
      maxCorrect: r.maxCorrect,
      badgeCount: r.badgeCount,
    })),
  }
}

// Full PUT payload from an existing video, with optional field overrides — used
// by quick-publish and the bulk actions, which reuse the validated update path.
function payloadFromVideo(video: VideoDetail, overrides: Record<string, unknown> = {}) {
  return {
    title: video.title,
    slug: video.slug,
    youtubeUrl: video.youtubeUrl,
    thumbnailUrl: video.thumbnailUrl,
    subjectId: video.subject?.id ?? null,
    ageGroupId: video.ageGroup?.id ?? null,
    numberOfQuestions: video.numberOfQuestions,
    difficulty: video.difficulty,
    description: video.description ?? '',
    isPublished: video.isPublished,
    isFeatured: video.isFeatured,
    sortOrder: video.sortOrder,
    badgeRanges: video.badgeRanges.map((r) => ({
      minCorrect: r.minCorrect,
      maxCorrect: r.maxCorrect,
      badgeCount: r.badgeCount,
    })),
    ...overrides,
  }
}

export default function AdminVideosPage() {
  const toast = useToast()
  const [meta, setMeta] = useState<PublicMeta | null>(null)
  const [videos, setVideos] = useState<VideoDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<CatalogFilter>('all')
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<VideoDetail | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [autoCompleting, setAutoCompleting] = useState(false)
  const [bulkSubjectId, setBulkSubjectId] = useState('')
  const [bulkAgeGroupId, setBulkAgeGroupId] = useState('')
  const [bulkQuestions, setBulkQuestions] = useState('')

  // Catalog search / filter / sort / pagination
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [ageGroupId, setAgeGroupId] = useState('')
  const [sort, setSort] = useState<CatalogSort>('updated')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 24

  // Stale-video scan (deleted/private on YouTube).
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
    } catch (error) {
      console.error('Failed to load admin videos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const subjectOptions = useMemo(() => meta?.subjects ?? [], [meta])
  const ageGroupOptions = useMemo(() => meta?.ageGroups ?? [], [meta])

  const catalog = useMemo(
    () =>
      filterSortPaginateVideos(videos, {
        search,
        status: filter,
        subjectId,
        ageGroupId,
        sort,
        page,
        pageSize: PAGE_SIZE,
      }),
    [videos, search, filter, subjectId, ageGroupId, sort, page],
  )
  const filteredVideos = catalog.items

  // Reset to page 1 whenever any filter/sort criterion changes
  useEffect(() => {
    setPage(1)
  }, [search, filter, subjectId, ageGroupId, sort])

  const draftCount = useMemo(() => videos.filter((v) => !v.isPublished).length, [videos])

  const staleTotals = useMemo(() => {
    const list = staleVideos ?? []
    return {
      scores: list.reduce((sum, v) => sum + v.scoreAttempts, 0),
      badges: list.reduce((sum, v) => sum + v.badgeUnlocks, 0),
    }
  }, [staleVideos])

  const allFilteredSelected =
    filteredVideos.length > 0 && filteredVideos.every((v) => selected.has(v.id))

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (filteredVideos.every((v) => next.has(v.id))) {
        filteredVideos.forEach((v) => next.delete(v.id))
      } else {
        filteredVideos.forEach((v) => next.add(v.id))
      }
      return next
    })
  }

  function onEditorSaved() {
    setEditingId(null)
    void refresh()
  }

  async function quickPublish(video: VideoDetail) {
    setBusyId(video.id)
    try {
      await api.put(`/admin/videos/${video.id}`, payloadFromVideo(video, { isPublished: true }))
      toast.success(`"${video.title}" diterbitkan.`)
      await refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gagal menerbitkan video.'))
    } finally {
      setBusyId(null)
    }
  }

  async function bulkApply() {
    if (!bulkSubjectId && !bulkAgeGroupId && !bulkQuestions.trim()) {
      toast.error('Pilih subject, age group, atau jumlah soal dulu.')
      return
    }
    const subject = subjectOptions.find((s) => s.id === bulkSubjectId)
    const targets = videos.filter((v) => selected.has(v.id))
    setBulkBusy(true)
    let ok = 0
    let fail = 0
    await Promise.all(
      targets.map(async (video) => {
        const overrides: Record<string, unknown> = {}
        if (bulkSubjectId) overrides.subjectId = bulkSubjectId
        if (bulkAgeGroupId) overrides.ageGroupId = bulkAgeGroupId
        if (bulkQuestions.trim()) overrides.numberOfQuestions = Number(bulkQuestions)
        // Fill the subject's badge template for videos that have none yet, so a
        // bulk subject assignment can make drafts publish-ready in one pass.
        if (bulkSubjectId && subject?.defaultBadgeRanges?.length && video.badgeRanges.length === 0) {
          overrides.badgeRanges = subject.defaultBadgeRanges.map((r) => ({ ...r }))
        }
        try {
          await api.put(`/admin/videos/${video.id}`, payloadFromVideo(video, overrides))
          ok += 1
        } catch {
          fail += 1
        }
      }),
    )
    setBulkBusy(false)
    if (fail) toast.error(`${ok} diperbarui, ${fail} gagal.`)
    else toast.success(`${ok} video diperbarui.`)
    setSelected(new Set())
    setBulkSubjectId('')
    setBulkAgeGroupId('')
    setBulkQuestions('')
    await refresh()
  }

  async function bulkPublish() {
    const targets = videos.filter((v) => selected.has(v.id) && !v.isPublished)
    if (targets.length === 0) {
      toast.error('Tidak ada draft terpilih untuk diterbitkan.')
      return
    }
    setBulkBusy(true)
    let ok = 0
    let skipped = 0
    await Promise.all(
      targets.map(async (video) => {
        try {
          await api.put(`/admin/videos/${video.id}`, payloadFromVideo(video, { isPublished: true }))
          ok += 1
        } catch {
          skipped += 1
        }
      }),
    )
    setBulkBusy(false)
    if (skipped) toast.error(`${ok} diterbitkan, ${skipped} dilewati (belum lengkap).`)
    else toast.success(`${ok} video diterbitkan.`)
    setSelected(new Set())
    await refresh()
  }

  async function autoComplete() {
    setAutoCompleting(true)
    try {
      const response = await api.post('/admin/videos/autocomplete-drafts')
      const { completed, total } = response.data.data as { completed: number; total: number }
      if (completed === 0) {
        toast.info(`Tidak ada draft yang cocok dengan aturan judul (dari ${total} draft).`)
      } else {
        toast.success(`${completed} dari ${total} draft dilengkapi otomatis.`)
      }
      await refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gagal melengkapi otomatis.'))
    } finally {
      setAutoCompleting(false)
    }
  }

  async function performDelete() {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/videos/${confirmDelete.id}`)
      toast.success(`Video "${confirmDelete.title}" dihapus.`)
      if (editingId === confirmDelete.id) setEditingId(null)
      await refresh()
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast.error('Gagal menghapus video.')
    } finally {
      setConfirmDelete(null)
    }
  }

  async function scanStale() {
    setScanning(true)
    try {
      const response = await api.get('/admin/videos/stale')
      setStaleVideos(response.data.data.videos as StaleVideo[])
    } catch (error) {
      const code = getApiErrorCode(error)
      if (code === 'rate_limited') toast.error('Terlalu sering scan. Tunggu sebentar lalu coba lagi.')
      else if (code === 'server_misconfigured') toast.error('YouTube belum dikonfigurasi di server.')
      else toast.error('Gagal scan — YouTube tidak dapat diakses.')
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
        description="Tambah video, lengkapi draft, dan terbitkan. Warna badge otomatis dari subject."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              icon="fa-solid fa-plus"
              onClick={() => setEditingId(editingId === 'new' ? null : 'new')}
            >
              Tambah video
            </Button>
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
                      <div className="text-[0.6875rem] text-admin-muted">
                        {video.youtubeVideoId} · {video.scoreAttempts} skor · {video.badgeUnlocks} badge
                      </div>
                    </div>
                    {(() => { const st = statusTone(video.isPublished ? 'published' : 'draft'); return <Tag tone={st.tone}>{st.label}</Tag> })()}
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

      <Panel>
        <SectionHeading>Catalog</SectionHeading>

        <Toolbar
          search={{ value: search, onChange: setSearch, placeholder: 'Cari judul / YouTube ID…' }}
          filters={
            <>
              <SegmentedControl<CatalogFilter>
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'Semua' },
                  { value: 'draft', label: `Draft${draftCount > 0 ? ` (${draftCount})` : ''}` },
                  { value: 'published', label: 'Diterbitkan' },
                ]}
              />
              <Select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                aria-label="Filter subject"
              >
                <option value="">Semua subject</option>
                {meta?.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select
                value={ageGroupId}
                onChange={(e) => setAgeGroupId(e.target.value)}
                aria-label="Filter usia"
              >
                <option value="">Semua usia</option>
                {meta?.ageGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </>
          }
          sort={
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as CatalogSort)}
              aria-label="Urutkan"
            >
              <option value="updated">Terbaru diperbarui</option>
              <option value="title">Judul A–Z</option>
              <option value="status">Status</option>
            </Select>
          }
          trailing={`${catalog.total} video`}
        />

        {!loading && filteredVideos.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-admin-muted">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-admin-edge text-qupu-brand-blue focus:ring-qupu-brand-blue/30"
                aria-label="Pilih semua video yang tampil"
              />
              Pilih semua
            </label>
            {draftCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                icon="fa-solid fa-wand-magic-sparkles"
                loading={autoCompleting}
                onClick={autoComplete}
                title="Lengkapi subject / age group / soal draft dari pola judul"
              >
                Lengkapi otomatis
              </Button>
            )}
          </div>
        )}

        {selected.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-qupu-brand-blue/20 bg-qupu-brand-blue/5 p-3">
            <span className="text-sm font-semibold text-admin-ink">{selected.size} dipilih</span>
            <div className="w-40">
              <Select value={bulkSubjectId} onChange={(e) => setBulkSubjectId(e.target.value)}>
                <option value="">Subject…</option>
                {subjectOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <Select value={bulkAgeGroupId} onChange={(e) => setBulkAgeGroupId(e.target.value)}>
                <option value="">Age group…</option>
                {ageGroupOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Soal"
                value={bulkQuestions}
                onChange={(e) => setBulkQuestions(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="sm" type="button" loading={bulkBusy} onClick={bulkApply}>
              Terapkan
            </Button>
            <Button size="sm" type="button" loading={bulkBusy} onClick={bulkPublish}>
              Terbitkan
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setSelected(new Set())}>
              Batal
            </Button>
          </div>
        )}

        {loading ? (
          <div className="mt-3 grid gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon="fa-solid fa-film"
            title={
              filter === 'draft'
                ? 'Belum ada draft'
                : filter === 'published'
                  ? 'Belum ada video terbit'
                  : 'Belum ada video'
            }
            hint="Tambah video atau impor dari YouTube."
          />
        ) : (
          <div className="mt-3 grid gap-3">
            {filteredVideos.map((video) => {
              const totalRanges = video.badgeRanges.length
              const maxBadges = video.badgeRanges.reduce((max, r) => Math.max(max, r.badgeCount), 0)
              return (
                <div key={video.id} className="rounded-xl border border-admin-line bg-admin-card">
                  <div className="flex items-start gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(video.id)}
                      onChange={() => toggleSelect(video.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-admin-edge text-qupu-brand-blue focus:ring-qupu-brand-blue/30"
                      aria-label={`Pilih ${video.title}`}
                    />
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-admin-line">
                      <img loading="lazy" decoding="async" src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(() => { const st = statusTone(video.isPublished ? 'published' : 'draft'); return <Tag tone={st.tone}>{st.label}</Tag> })()}
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
                      <div className="mt-1 line-clamp-2 text-sm font-semibold text-admin-ink">{video.title}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-admin-muted">
                        {video.subject && <BadgeCurve color={video.subject.colorHex} size={16} />}
                        {totalRanges} range · max {maxBadges} badge · {video.numberOfQuestions ?? '—'} soal
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      {!video.isPublished && isComplete(video) && (
                        <Button
                          size="sm"
                          type="button"
                          icon="fa-solid fa-paper-plane"
                          loading={busyId === video.id}
                          onClick={() => quickPublish(video)}
                        >
                          Terbitkan
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setEditingId(video.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        type="button"
                        onClick={() => setConfirmDelete(video)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {catalog.pageCount > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <Button
              variant="secondary"
              size="sm"
              disabled={catalog.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              icon="fa-solid fa-chevron-left"
            >
              Prev
            </Button>
            <span className="text-admin-muted">
              Hal {catalog.page} / {catalog.pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={catalog.page >= catalog.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <i className="fa-solid fa-chevron-right ml-1" aria-hidden="true" />
            </Button>
          </div>
        )}
      </Panel>

      {meta && editingId && (() => {
        const isNew = editingId === 'new'
        const target = isNew ? null : videos.find((v) => v.id === editingId) ?? null
        if (!isNew && !target) return null
        return (
          <Drawer
            open
            onClose={() => setEditingId(null)}
            title={isNew ? 'Tambah video' : 'Edit video'}
            width="lg"
          >
            <VideoEditor
              key={editingId}
              meta={meta}
              mode={isNew ? 'create' : 'edit'}
              initial={isNew ? emptyVideoForm(meta) : formFromVideo(target!)}
              videoId={isNew ? undefined : target!.id}
              originallyPublished={isNew ? undefined : target!.isPublished}
              onSaved={onEditorSaved}
              onCancel={() => setEditingId(null)}
            />
          </Drawer>
        )
      })()}

      <ConfirmDangerousAction
        open={!!confirmDelete}
        title={`Hapus video "${confirmDelete?.title ?? ''}"?`}
        description="Video disembunyikan dari katalog dan tidak akan muncul lagi saat impor dari YouTube. Skor & badge anak tetap tersimpan."
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
