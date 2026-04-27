import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { slugify } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import BadgeCurve from '../../components/BadgeCurve'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'

interface BadgeRange {
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

interface AdminSubject {
  id: string
  name: string
  slug: string
  colorHex: string
  description: string | null
  defaultBadgeRanges: BadgeRange[]
  videoCount: number
}

interface FormState {
  name: string
  slug: string
  colorHex: string
  description: string
  defaultBadgeRanges: BadgeRange[]
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  colorHex: '#3B82F6',
  description: '',
  defaultBadgeRanges: [],
}
const PANEL = 'rounded-xl border border-slate-200 bg-white p-4'
const INPUT =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500'

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<AdminSubject[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<AdminSubject | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const response = await api.get('/admin/subjects')
      setSubjects(response.data.data.subjects ?? [])
    } catch (error) {
      console.error('Failed to load subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMessage('')
  }

  function startEdit(subject: AdminSubject) {
    setEditingId(subject.id)
    setForm({
      name: subject.name,
      slug: subject.slug,
      colorHex: subject.colorHex,
      description: subject.description ?? '',
      defaultBadgeRanges: subject.defaultBadgeRanges.map((r) => ({ ...r })),
    })
    setMessage('')
  }

  function addRange() {
    setForm((s) => {
      const last = s.defaultBadgeRanges[s.defaultBadgeRanges.length - 1]
      const fallbackMin = last ? (last.maxCorrect ?? 0) + 1 : 0
      const nextCount = last ? last.badgeCount + 1 : 1
      return {
        ...s,
        defaultBadgeRanges: [
          ...s.defaultBadgeRanges,
          { minCorrect: fallbackMin, maxCorrect: null, badgeCount: nextCount },
        ],
      }
    })
  }

  function removeRange(index: number) {
    setForm((s) => ({
      ...s,
      defaultBadgeRanges: s.defaultBadgeRanges.filter((_, i) => i !== index),
    }))
  }

  function updateRange(index: number, patch: Partial<BadgeRange>) {
    setForm((s) => ({
      ...s,
      defaultBadgeRanges: s.defaultBadgeRanges.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      defaultBadgeRanges: form.defaultBadgeRanges.map((r) => ({
        minCorrect: Number(r.minCorrect),
        maxCorrect:
          r.maxCorrect === null || r.maxCorrect === undefined ? null : Number(r.maxCorrect),
        badgeCount: Number(r.badgeCount),
      })),
    }
    try {
      if (editingId) {
        await api.put(`/admin/subjects/${editingId}`, payload)
        setMessage('Subject diperbarui.')
      } else {
        await api.post('/admin/subjects', payload)
        setMessage('Subject dibuat.')
      }
      await refresh()
      startCreate()
    } catch (error: unknown) {
      setMessage(extractErr(error, 'Gagal menyimpan.'))
    } finally {
      setSaving(false)
    }
  }

  async function performDelete() {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/subjects/${confirmDelete.id}`)
      await refresh()
      if (editingId === confirmDelete.id) startCreate()
      setMessage(`${confirmDelete.name} dihapus.`)
    } catch (error: unknown) {
      setMessage(extractErr(error, 'Gagal menghapus.'))
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Subjects"
        title="Kategori video & warna badge"
        description="Subject menentukan warna badge untuk semua video di kategori itu."
      />

      {message && (
        <div className={`rounded-lg px-3 py-2 text-sm ${message.toLowerCase().startsWith('gagal') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className={PANEL}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">
              {editingId ? 'Edit subject' : 'Tambah subject'}
            </h2>
            {editingId && (
              <button type="button" onClick={startCreate} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Batal
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <BadgeCurve color={form.colorHex} size={48} />
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{form.name || 'Nama subject'}</div>
              <div className="text-[11px] text-slate-500">{form.colorHex}</div>
            </div>
          </div>

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Nama">
              <input className={INPUT} value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </Field>
            <Field label="Slug" hint={`Preview: ${form.slug || slugify(form.name) || '-'}`}>
              <input className={INPUT} value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </Field>
            <Field label="Warna">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => setForm((s) => ({ ...s, colorHex: e.target.value.toUpperCase() }))}
                  className="h-9 w-12 cursor-pointer rounded-md border border-slate-300"
                />
                <input
                  type="text"
                  value={form.colorHex}
                  onChange={(e) => setForm((s) => ({ ...s, colorHex: e.target.value.toUpperCase() }))}
                  className={`${INPUT} font-mono`}
                  placeholder="#XXXXXX"
                />
              </div>
            </Field>
            <Field label="Deskripsi">
              <textarea
                className={INPUT}
                rows={3}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </Field>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
                    Default badge ranges
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Template diisi otomatis saat tambah video baru di subject ini.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addRange}
                  className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  + Range
                </button>
              </div>
              {form.defaultBadgeRanges.length === 0 ? (
                <div className="mt-2 rounded-md bg-white px-3 py-2 text-xs text-slate-500">
                  Belum ada template. Admin video harus isi range manual.
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {form.defaultBadgeRanges.map((range, index) => (
                    <div
                      key={index}
                      className="grid items-end gap-2 rounded-md bg-white p-2 sm:grid-cols-[auto_1fr_1fr_1fr_auto]"
                    >
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
                      <Field label="Max" hint={index === form.defaultBadgeRanges.length - 1 ? 'Kosong = tanpa batas' : undefined}>
                        <input
                          type="number"
                          className={INPUT}
                          value={range.maxCorrect === null ? '' : String(range.maxCorrect)}
                          onChange={(e) =>
                            updateRange(index, {
                              maxCorrect: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
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
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat subject'}
            </button>
          </form>
        </div>

        <div className={PANEL}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Daftar</h2>
            <span className="text-xs text-slate-500">{subjects.length} subject</span>
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Memuat...</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <BadgeCurve color={s.colorHex} size={32} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.slug} · {s.videoCount} video · {s.defaultBadgeRanges.length} range template
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(s)}
                      className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
              {subjects.length === 0 && <li className="py-3 text-sm text-slate-500">Belum ada subject.</li>}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDangerousAction
        open={!!confirmDelete}
        title={`Hapus subject "${confirmDelete?.name ?? ''}"?`}
        description={
          confirmDelete?.videoCount && confirmDelete.videoCount > 0
            ? `Subject ini masih dipakai oleh ${confirmDelete.videoCount} video. Pindahkan video ke subject lain dulu.`
            : 'Aksi ini tidak bisa dibatalkan.'
        }
        requiredText={confirmDelete?.slug ?? ''}
        confirmLabel="Hapus subject"
        onConfirm={performDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </label>
  )
}

function extractErr(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error
  }
  return fallback
}
