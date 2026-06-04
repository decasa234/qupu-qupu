import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { getApiErrorMessage } from '../../lib/apiError'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'
import { useToast } from '../../components/admin/Toast'
import { Button, EmptyState, Field, Input, Panel, SectionHeading, Skeleton, Textarea } from '../../components/admin/ui'

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

export default function AdminAgeGroupsPage() {
  const toast = useToast()
  const [groups, setGroups] = useState<AdminAgeGroup[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  }

  function startEdit(group: AdminAgeGroup) {
    setEditingId(group.id)
    setForm({
      name: group.name,
      minAge: group.minAge,
      maxAge: group.maxAge,
      description: group.description ?? '',
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/admin/age-groups/${editingId}`, form)
        toast.success('Age group diperbarui.')
      } else {
        await api.post('/admin/age-groups', form)
        toast.success('Age group dibuat.')
      }
      await refresh()
      startCreate()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Gagal menyimpan.'))
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
      toast.success(`${confirmDelete.name} dihapus.`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus.'))
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

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading
            right={
              editingId && (
                <Button variant="ghost" size="sm" type="button" onClick={startCreate}>
                  Batal
                </Button>
              )
            }
          >
            {editingId ? 'Edit age group' : 'Tambah age group'}
          </SectionHeading>

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Nama" required>
              <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Min age">
                <Input
                  type="number"
                  value={form.minAge}
                  onChange={(e) => setForm((s) => ({ ...s, minAge: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Max age">
                <Input
                  type="number"
                  value={form.maxAge}
                  onChange={(e) => setForm((s) => ({ ...s, maxAge: Number(e.target.value) }))}
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
            <Button type="submit" loading={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat age group'}
            </Button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading right={<span className="text-xs text-admin-muted">{groups.length} group</span>}>
            Daftar
          </SectionHeading>
          {loading ? (
            <div className="mt-3 grid gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="fa-solid fa-children"
              title="Belum ada age group"
              hint="Tambah rentang usia pertama lewat form di samping."
            />
          ) : (
            <ul className="mt-3 divide-y divide-admin-line">
              {groups.map((group) => (
                <li key={group.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-semibold text-admin-ink">{group.name}</div>
                    <div className="text-[11px] text-admin-muted">
                      {group.minAge}-{group.maxAge} tahun · {group.videoCount} video
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(group)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(group)}>
                      Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
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
