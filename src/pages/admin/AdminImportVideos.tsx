import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { getApiErrorCode } from '../../lib/apiError'
import { PageScaffold } from '../../components/admin/PageScaffold'
import { Button, buttonClass, EmptyState, Panel, Tag } from '../../components/admin/ui'
import type { ChannelVideoItem, ChannelVideoListResponse, ImportResult } from '../../types'

interface RowState extends ChannelVideoItem {
  resultStatus?: ImportResult['status']
  resultError?: string
}

interface ImportSummary {
  created: number
  alreadyImported: number
  failed: number
}

const ERROR_LABELS: Record<string, string> = {
  youtube_not_found: 'Tidak ditemukan di YouTube',
  youtube_unavailable: 'YouTube tidak tersedia',
  quota_exceeded: 'Kuota YouTube habis',
  slug_conflict: 'Slug bentrok',
  short_video: 'Shorts tidak diimpor',
  import_failed: 'Gagal diimpor',
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

export default function AdminImportVideosPage() {
  const [rows, setRows] = useState<RowState[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const load = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)
    setSelected(new Set())
    setSummary(null)
    try {
      const response = await api.get<{ success: true; data: ChannelVideoListResponse }>(
        '/admin/youtube-channel/videos',
        { params: { page: targetPage } },
      )
      const data = response.data.data
      setRows(data.items)
      setPage(data.page)
      setPageCount(data.pageCount)
      setTotal(data.total)
    } catch (err) {
      const code = getApiErrorCode(err)
      if (code === 'rate_limited') {
        setError('Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.')
      } else if (code === 'youtube_unavailable') {
        setError('YouTube sedang tidak dapat diakses. Coba lagi sebentar.')
      } else if (code === 'server_misconfigured') {
        setError('YouTube belum dikonfigurasi di server. Hubungi admin.')
      } else {
        setError('Gagal memuat daftar video dari channel.')
      }
      setRows([])
      setPageCount(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(1)
  }, [load])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  // Selectable = visible rows that are still available on YouTube and not yet
  // imported. The server filters already-imported rows from fresh fetches, but
  // a row can also flip to alreadyImported in-place after a successful import
  // before the user navigates away — exclude those from select-all.
  const selectableIds = useMemo(
    () => rows.filter((row) => row.available && !row.alreadyImported).map((row) => row.id),
    [rows],
  )
  const selectedSelectableCount = useMemo(
    () => selectableIds.reduce((count, id) => (selected.has(id) ? count + 1 : count), 0),
    [selectableIds, selected],
  )
  const allOnPageSelected =
    selectableIds.length > 0 && selectedSelectableCount === selectableIds.length
  const someOnPageSelected =
    selectedSelectableCount > 0 && selectedSelectableCount < selectableIds.length

  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someOnPageSelected
    }
  }, [someOnPageSelected])

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (selectedSelectableCount === 0) {
        for (const id of selectableIds) next.add(id)
      } else {
        for (const id of selectableIds) next.delete(id)
      }
      return next
    })
  }

  async function importSelected() {
    if (selected.size === 0 || importing) return
    setImporting(true)
    setSummary(null)
    setError(null)
    try {
      const response = await api.post<{
        success: true
        data: { results: ImportResult[] }
      }>('/admin/youtube-channel/import', {
        youtubeVideoIds: Array.from(selected),
      })
      const results = response.data.data.results
      const byId = new Map(results.map((r) => [r.youtubeVideoId, r]))

      let created = 0
      let alreadyImported = 0
      let failed = 0
      const failedIds = new Set<string>()

      for (const result of results) {
        if (result.status === 'created') created++
        else if (result.status === 'already_imported') alreadyImported++
        else {
          failed++
          failedIds.add(result.youtubeVideoId)
        }
      }

      setRows((prev) =>
        prev.map((row) => {
          const result = byId.get(row.id)
          if (!result) return row
          if (result.status === 'created' || result.status === 'already_imported') {
            return {
              ...row,
              alreadyImported: true,
              resultStatus: result.status,
              resultError: undefined,
            }
          }
          return { ...row, resultStatus: 'error', resultError: result.error }
        }),
      )
      setSelected(failedIds)
      setSummary({ created, alreadyImported, failed })
    } catch (err) {
      console.error('Bulk import failed:', err)
      setError('Import gagal — coba lagi.')
    } finally {
      setImporting(false)
    }
  }

  function changePage(target: number) {
    if (target < 1 || target > pageCount || target === page || loading) return
    void load(target)
  }

  return (
    <PageScaffold
      eyebrow="Admin"
      title="Impor dari YouTube"
      description="Pilih video dari channel QUPU yang ingin diimpor sebagai draft. Anda dapat melengkapi subject, kelompok usia, dan badge ranges nanti dari editor video."
      narrow
      actions={
        <Link to="/admin/videos" className={buttonClass('secondary')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Kembali ke Videos
        </Link>
      }
    >
      <div className="space-y-5 pb-24">

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void load(page)}
              className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {summary && !error && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            summary.failed > 0
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
          role="status"
        >
          <div className="font-semibold">
            Berhasil: {summary.created} · Sudah ada: {summary.alreadyImported} · Gagal: {summary.failed}
          </div>
          {summary.failed > 0 && (
            <p className="mt-1 text-xs">
              Baris yang gagal masih dipilih — periksa pesan errornya lalu coba ulangi.
            </p>
          )}
        </div>
      )}

      <Panel padded={false} className="overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-admin-muted">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-admin-edge border-t-qupu-brand-blue" />
            Mengambil daftar video dari YouTube...
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="flex items-center gap-4 border-b border-admin-line bg-admin-sunk px-4 py-2.5">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-admin-ink">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-admin-edge text-qupu-brand-blue focus:ring-qupu-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-40"
                  checked={allOnPageSelected}
                  disabled={importing || selectableIds.length === 0}
                  onChange={toggleAllOnPage}
                  aria-label="Pilih semua video di halaman ini"
                />
                Pilih semua di halaman ini
              </label>
              <span className="text-xs text-admin-muted" aria-live="polite">
                {selectedSelectableCount} / {selectableIds.length} dipilih
              </span>
            </div>
            <ul className="divide-y divide-admin-line">
              {rows.map((row) => {
                const disabled = row.alreadyImported || !row.available
                const isChecked = selected.has(row.id)
                return (
                  <li
                    key={row.id}
                    className={`flex items-start gap-4 px-4 py-3 ${disabled ? 'bg-admin-sunk/60' : ''}`}
                  >
                    <label className="mt-1 inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-admin-edge text-qupu-brand-blue focus:ring-qupu-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-40"
                        checked={isChecked}
                        disabled={disabled || importing}
                        onChange={() => toggle(row.id)}
                        aria-label={`Pilih ${row.title}`}
                      />
                    </label>
                    <img
                      src={row.thumbnailUrl}
                      alt=""
                      className="h-14 w-24 shrink-0 rounded-md bg-admin-line object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`truncate text-sm font-semibold ${
                            disabled ? 'text-admin-faint' : 'text-admin-ink'
                          }`}
                        >
                          {row.title}
                        </div>
                        {row.alreadyImported && <Tag tone="success">Di katalog</Tag>}
                        {!row.available && <Tag tone="warn">Tidak tersedia</Tag>}
                        {row.resultStatus === 'error' && (
                          <Tag tone="danger">{ERROR_LABELS[row.resultError ?? ''] ?? 'Gagal'}</Tag>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-admin-muted">
                        {formatDate(row.publishedAt)} · {row.id}
                      </div>
                      {!row.available && row.unavailableReason && (
                        <div className="mt-0.5 text-xs italic text-admin-muted">{row.unavailableReason}</div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {!loading && !error && rows.length === 0 && (
          <EmptyState
            bordered={false}
            icon="fa-brands fa-youtube"
            title="Tidak ada video baru untuk diimpor"
            hint="Semua video channel sudah ada di katalog."
          />
        )}

        {pageCount > 1 && !loading && !error && (
          <div className="flex items-center justify-between gap-3 border-t border-admin-line px-4 py-3 text-xs text-admin-muted">
            <div>
              Halaman {page} dari {pageCount} · {total} video total
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => changePage(page - 1)}
              >
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                Sebelumnya
              </Button>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={page >= pageCount || loading}
                onClick={() => changePage(page + 1)}
              >
                Selanjutnya
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-admin-line bg-admin-card shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="text-sm font-semibold text-admin-ink" aria-live="polite">
              {selected.size} video dipilih
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" type="button" onClick={clearSelection} disabled={importing}>
                Batal
              </Button>
              <Button type="button" onClick={() => void importSelected()} loading={importing}>
                {importing ? 'Mengimpor...' : `Import ${selected.size} sebagai draft`}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageScaffold>
  )
}
