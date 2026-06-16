import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  fetchAdminCourse,
  updateLesson,
  updateModule,
  type AdminModule,
} from '../../lib/fundamentalsAdminApi'

export default function AdminFundamentals() {
  const [modules, setModules] = useState<AdminModule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setModules(await fetchAdminCourse())
      setError(null)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function run(action: () => Promise<unknown>) {
    try {
      await action()
      await reload()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-admin-ink">Fundamentals</h1>
          <p className="text-sm font-semibold text-admin-muted">
            Kursus dasar olimpiade — modul, pelajaran, dan blok konten.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModule((s) => !s)}
          className="rounded-lg bg-qupu-brand-blue px-4 py-2 text-sm font-bold text-white"
        >
          <i className="fa-solid fa-plus mr-1.5" aria-hidden="true" />
          Modul
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {showNewModule && (
        <ModuleForm
          submitLabel="Buat modul"
          onSubmit={async (v) => {
            await run(() => createModule(v))
            setShowNewModule(false)
          }}
          withSlug
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-admin-sunk" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((m) => (
            <ModuleCard key={m.slug} module={m} run={run} />
          ))}
          {modules.length === 0 && (
            <p className="rounded-xl border border-admin-line bg-admin-card px-4 py-6 text-center text-sm font-semibold text-admin-muted">
              Belum ada modul. Klik “Modul” untuk membuat yang pertama.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ModuleCard({ module: m, run }: { module: AdminModule; run: (a: () => Promise<unknown>) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [addingLesson, setAddingLesson] = useState(false)

  return (
    <div className="rounded-xl border border-admin-line bg-admin-card p-4 shadow-admin-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black text-admin-ink">{m.title_id}</span>
            <StatusPill status={m.status} />
          </div>
          <div className="text-xs font-semibold text-admin-muted">
            {m.title_en} · <code className="text-admin-faint">{m.slug}</code> · urutan {m.sort_order}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <IconBtn
            icon={m.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}
            title={m.status === 'published' ? 'Jadikan draft' : 'Terbitkan'}
            onClick={() => run(() => updateModule(m.slug, { status: m.status === 'published' ? 'draft' : 'published' }))}
          />
          <IconBtn icon="fa-pen" title="Edit" onClick={() => setEditing((e) => !e)} />
          <IconBtn
            icon="fa-trash"
            title="Hapus"
            danger
            onClick={() => {
              if (confirm(`Hapus modul "${m.title_id}" dan semua pelajarannya?`)) run(() => deleteModule(m.slug))
            }}
          />
        </div>
      </div>

      {editing && (
        <div className="mt-3">
          <ModuleForm
            submitLabel="Simpan"
            initial={m}
            onSubmit={async (v) => {
              await run(() => updateModule(m.slug, v))
              setEditing(false)
            }}
          />
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {m.lessons.map((l) => (
          <div key={l.slug} className="flex items-center gap-2 rounded-lg border border-admin-line bg-admin-bg px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-admin-ink">{l.title_id}</span>
                <StatusPill status={l.status} />
              </div>
              <div className="text-[11px] font-semibold text-admin-faint">
                <code>{l.slug}</code> · {l.block_count} blok · urutan {l.sort_order}
              </div>
            </div>
            <Link
              to={`/admin/fundamentals/lessons/${l.slug}`}
              className="rounded-md bg-qupu-brand-blue px-2.5 py-1.5 text-xs font-bold text-white"
            >
              <i className="fa-solid fa-pen-to-square mr-1" aria-hidden="true" />
              Blok
            </Link>
            <IconBtn
              small
              icon={l.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}
              title={l.status === 'published' ? 'Jadikan draft' : 'Terbitkan'}
              onClick={() => run(() => updateLesson(l.slug, { status: l.status === 'published' ? 'draft' : 'published' }))}
            />
            <IconBtn
              small
              icon="fa-trash"
              danger
              title="Hapus"
              onClick={() => {
                if (confirm(`Hapus pelajaran "${l.title_id}"?`)) run(() => deleteLesson(l.slug))
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2">
        {addingLesson ? (
          <LessonForm
            onSubmit={async (v) => {
              await run(() => createLesson({ ...v, module_slug: m.slug }))
              setAddingLesson(false)
            }}
            onCancel={() => setAddingLesson(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingLesson(true)}
            className="text-xs font-bold text-qupu-brand-blue hover:underline"
          >
            <i className="fa-solid fa-plus mr-1" aria-hidden="true" />
            Pelajaran
          </button>
        )}
      </div>
    </div>
  )
}

function ModuleForm({
  submitLabel,
  initial,
  withSlug,
  onSubmit,
}: {
  submitLabel: string
  initial?: AdminModule
  withSlug?: boolean
  onSubmit: (v: Record<string, unknown>) => Promise<void>
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [titleId, setTitleId] = useState(initial?.title_id ?? '')
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? '')
  const [summaryId, setSummaryId] = useState(initial?.summary_id ?? '')
  const [summaryEn, setSummaryEn] = useState(initial?.summary_en ?? '')
  const [sort, setSort] = useState(initial?.sort_order ?? 0)

  return (
    <div className="mb-4 rounded-xl border border-admin-edge bg-admin-bg p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {withSlug && <Field label="Slug" value={slug} onChange={setSlug} placeholder="memahami-soal" />}
        <Field label="Urutan" value={String(sort)} onChange={(v) => setSort(Number(v) || 0)} type="number" />
        <Field label="Judul (ID)" value={titleId} onChange={setTitleId} />
        <Field label="Judul (EN)" value={titleEn} onChange={setTitleEn} />
        <Field label="Ringkasan (ID)" value={summaryId} onChange={setSummaryId} />
        <Field label="Ringkasan (EN)" value={summaryEn} onChange={setSummaryEn} />
      </div>
      <button
        type="button"
        onClick={() =>
          onSubmit({
            ...(withSlug ? { slug } : {}),
            title_id: titleId,
            title_en: titleEn,
            summary_id: summaryId || null,
            summary_en: summaryEn || null,
            sort_order: sort,
          })
        }
        className="mt-2 rounded-lg bg-qupu-brand-blue px-4 py-2 text-sm font-bold text-white"
      >
        {submitLabel}
      </button>
    </div>
  )
}

function LessonForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [slug, setSlug] = useState('')
  const [titleId, setTitleId] = useState('')
  const [titleEn, setTitleEn] = useState('')

  return (
    <div className="rounded-lg border border-admin-edge bg-admin-bg p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Slug" value={slug} onChange={setSlug} placeholder="membaca-soal" />
        <Field label="Judul (ID)" value={titleId} onChange={setTitleId} />
        <Field label="Judul (EN)" value={titleEn} onChange={setTitleEn} />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onSubmit({ slug, title_id: titleId, title_en: titleEn })}
          className="rounded-lg bg-qupu-brand-blue px-4 py-2 text-sm font-bold text-white"
        >
          Buat pelajaran
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-bold text-admin-muted">
          Batal
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-admin-faint">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-admin-edge bg-white px-2.5 py-1.5 text-sm font-semibold text-admin-ink focus:border-qupu-brand-blue focus:outline-none"
      />
    </label>
  )
}

function StatusPill({ status }: { status: string }) {
  const published = status === 'published'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
        published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {published ? 'Live' : 'Draft'}
    </span>
  )
}

function IconBtn({
  icon,
  title,
  onClick,
  danger,
  small,
}: {
  icon: string
  title: string
  onClick: () => void
  danger?: boolean
  small?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex items-center justify-center rounded-md border border-admin-edge bg-white ${
        small ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
      } ${danger ? 'text-red-500 hover:bg-red-50' : 'text-admin-muted hover:bg-admin-sunk'}`}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  )
}

function errMsg(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const r = e as { response?: { data?: { error?: string } }; message?: string }
    return r.response?.data?.error ?? r.message ?? 'Terjadi kesalahan'
  }
  return 'Terjadi kesalahan'
}
