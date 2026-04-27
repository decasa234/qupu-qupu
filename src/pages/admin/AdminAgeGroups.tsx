import { useEffect, useState } from 'react'
import api from '../../lib/api'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'

interface AdminAgeGroup {
  id: string
  name: string
  minAge: number
  maxAge: number
  description: string | null
  videoCount: number
}

interface FormState {
  name: string
  minAge: number
  maxAge: number
  description: string
}

const EMPTY_FORM: FormState = { name: '', minAge: 5, maxAge: 8, description: '' }
const PANEL = 'rounded-xl border border-slate-200 bg-white p-4'
const INPUT =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500'

export default function AdminAgeGroupsPage() {
  const [groups, setGroups] = useState<AdminAgeGroup[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<AdminAgeGroup | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const response = await api.get('/admin/age-groups')
      setGroups(response.data.data.ageGroups ?? [])
    } catch (error) {
      console.error('Failed to load age groups:', error)
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

  function startEdit(group: AdminAgeGroup) {
    setEditingId(group.id)
    setForm({
      name: group.name,
      minAge: group.minAge,
      maxAge: group.maxAge,
      description: group.description ?? '',
    })
    setMessage('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (editingId) {
        await api.put(`/admin/age-groups/${editingId}`, form)
        setMessage('Age group diperbarui.')
      } else {
        await api.post('/admin/age-groups', form)
        setMessage('Age group dibuat.')
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
      await api.delete(`/admin/age-groups/${confirmDelete.id}`)
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
        eyebrow="Admin · Age Groups"
        title="Rentang usia"
        description="Tag video ke rentang usia. Edit atau tambah sesuai kebutuhan."
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
              {editingId ? 'Edit age group' : 'Tambah age group'}
            </h2>
            {editingId && (
              <button type="button" onClick={startCreate} className="text-xs font-semibold text-slate-600 hover:text-slate-900">Batal</button>
            )}
          </div>

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Nama">
              <input className={INPUT} value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Min age">
                <input type="number" className={INPUT} value={form.minAge} onChange={(e) => setForm((s) => ({ ...s, minAge: Number(e.target.value) }))} />
              </Field>
              <Field label="Max age">
                <input type="number" className={INPUT} value={form.maxAge} onChange={(e) => setForm((s) => ({ ...s, maxAge: Number(e.target.value) }))} />
              </Field>
            </div>
            <Field label="Deskripsi">
              <textarea className={INPUT} rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat age group'}
            </button>
          </form>
        </div>

        <div className={PANEL}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Daftar</h2>
            <span className="text-xs text-slate-500">{groups.length} group</span>
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Memuat...</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {groups.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{g.name}</div>
                    <div className="text-[11px] text-slate-500">{g.minAge}-{g.maxAge} tahun · {g.videoCount} video</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => startEdit(g)} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      Edit
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(g)} className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
              {groups.length === 0 && <li className="py-3 text-sm text-slate-500">Belum ada age group.</li>}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDangerousAction
        open={!!confirmDelete}
        title={`Hapus "${confirmDelete?.name ?? ''}"?`}
        description={
          confirmDelete?.videoCount && confirmDelete.videoCount > 0
            ? `Age group ini masih dipakai oleh ${confirmDelete.videoCount} video.`
            : 'Aksi ini tidak bisa dibatalkan.'
        }
        requiredText={confirmDelete?.name ?? ''}
        confirmLabel="Hapus age group"
        onConfirm={performDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      {children}
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
