import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { slugify } from '../../lib/youtube'
import { getApiErrorMessage } from '../../lib/apiError'
import { PageScaffold } from '../../components/admin/PageScaffold'
import BadgeCurve from '../../components/BadgeCurve'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'
import { useToast } from '../../components/admin/Toast'
import { Button, EmptyState, Field, Input, Panel, SectionHeading, Skeleton, Textarea } from '../../components/admin/ui'
import { BadgeRangeEditor } from '../../components/admin/BadgeRangeEditor'

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

export default function AdminSubjectsPage() {
  const toast = useToast()
  const [subjects, setSubjects] = useState<AdminSubject[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        toast.success('Subject diperbarui.')
      } else {
        await api.post('/admin/subjects', payload)
        toast.success('Subject dibuat.')
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
      await api.delete(`/admin/subjects/${confirmDelete.id}`)
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
    <PageScaffold
      eyebrow="Admin · Subjects"
      title="Kategori video & warna badge"
      description="Subject menentukan warna badge untuk semua video di kategori itu."
    >
      <div className="space-y-5">
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
            {editingId ? 'Edit subject' : 'Tambah subject'}
          </SectionHeading>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-admin-line bg-admin-sunk p-3">
            <BadgeCurve color={form.colorHex} size={48} />
            <div className="min-w-0">
              <div className="truncate font-semibold text-admin-ink">{form.name || 'Nama subject'}</div>
              <div className="text-[11px] text-admin-muted">{form.colorHex}</div>
            </div>
          </div>

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Nama" required>
              <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </Field>
            <Field label="Slug" hint={`Preview: ${form.slug || slugify(form.name) || '-'}`}>
              <Input value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </Field>
            <Field label="Warna">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => setForm((s) => ({ ...s, colorHex: e.target.value.toUpperCase() }))}
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-admin-edge bg-white"
                />
                <Input
                  type="text"
                  value={form.colorHex}
                  onChange={(e) => setForm((s) => ({ ...s, colorHex: e.target.value.toUpperCase() }))}
                  className="font-mono"
                  placeholder="#XXXXXX"
                />
              </div>
            </Field>
            <Field label="Deskripsi">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </Field>

            <BadgeRangeEditor
              ranges={form.defaultBadgeRanges}
              onAdd={addRange}
              onRemove={removeRange}
              onUpdate={updateRange}
              title="Default badge ranges"
              subtitle="Template diisi otomatis saat tambah video baru di subject ini."
              emptyHint="Belum ada template. Admin video harus isi range manual."
              unlimitedMaxHint
            />

            <Button type="submit" loading={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat subject'}
            </Button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading right={<span className="text-xs text-admin-muted">{subjects.length} subject</span>}>
            Daftar
          </SectionHeading>
          {loading ? (
            <div className="mt-3 grid gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : subjects.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon="fa-solid fa-shapes"
              title="Belum ada subject"
              hint="Tambah kategori pertama lewat form di samping."
            />
          ) : (
            <ul className="mt-3 divide-y divide-admin-line">
              {subjects.map((subject) => (
                <li key={subject.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <BadgeCurve color={subject.colorHex} size={32} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-admin-ink">{subject.name}</div>
                      <div className="text-[11px] text-admin-muted">
                        {subject.slug} · {subject.videoCount} video · {subject.defaultBadgeRanges.length} range template
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="secondary" size="sm" type="button" onClick={() => startEdit(subject)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(subject)}>
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
    </PageScaffold>
  )
}
