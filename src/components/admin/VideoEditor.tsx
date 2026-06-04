import { useMemo, useState } from 'react'
import api from '../../lib/api'
import { slugify } from '../../lib/youtube'
import { getApiErrorMessage } from '../../lib/apiError'
import BadgeCurve from '../BadgeCurve'
import { useToast } from './Toast'
import { Button, Field, Input, Select, Textarea } from './ui'
import { BadgeRangeEditor } from './BadgeRangeEditor'
import type { AdminVideoFormValues, PublicMeta } from '../../types'

/*
 * The full video editor (all fields + badge ranges + publish/featured). Used
 * both for creating a new video and for editing an existing one inline under
 * its catalog card. The parent owns which row is open and remounts this with a
 * `key` so form state resets per target.
 */

export function emptyVideoForm(meta: PublicMeta): AdminVideoFormValues {
  const subject = meta.subjects[0]
  const template = subject?.defaultBadgeRanges ?? []
  return {
    title: '',
    slug: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    subjectId: subject?.id ?? '',
    ageGroupId: meta.ageGroups[0]?.id ?? '',
    numberOfQuestions: 10,
    difficulty: 'easy',
    description: '',
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    badgeRanges:
      template.length > 0
        ? template.map((r) => ({ ...r }))
        : [
            { minCorrect: 0, maxCorrect: 4, badgeCount: 1 },
            { minCorrect: 5, maxCorrect: 7, badgeCount: 2 },
            { minCorrect: 8, maxCorrect: null, badgeCount: 3 },
          ],
  }
}

interface VideoEditorProps {
  meta: PublicMeta
  mode: 'create' | 'edit'
  initial: AdminVideoFormValues
  videoId?: string
  originallyPublished?: boolean
  onSaved: () => void
  onCancel: () => void
}

export default function VideoEditor({
  meta,
  mode,
  initial,
  videoId,
  originallyPublished = false,
  onSaved,
  onCancel,
}: VideoEditorProps) {
  const toast = useToast()
  const [form, setForm] = useState<AdminVideoFormValues>(initial)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  const subjectOptions = meta.subjects
  const ageGroupOptions = meta.ageGroups
  const titlePreview = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title])
  const selectedSubject = useMemo(
    () => subjectOptions.find((s) => s.id === form.subjectId) ?? null,
    [subjectOptions, form.subjectId],
  )

  function handleSubjectChange(subjectId: string) {
    const subject = subjectOptions.find((s) => s.id === subjectId)
    setForm((s) => {
      const isPristine = s.badgeRanges.length === 0
      const shouldApplyTemplate =
        subject &&
        subject.defaultBadgeRanges &&
        subject.defaultBadgeRanges.length > 0 &&
        (mode === 'create' || isPristine)
      return {
        ...s,
        subjectId,
        badgeRanges: shouldApplyTemplate
          ? subject.defaultBadgeRanges!.map((r) => ({ ...r }))
          : s.badgeRanges,
      }
    })
  }

  function applyTemplate() {
    const template = selectedSubject?.defaultBadgeRanges ?? []
    if (template.length === 0) {
      toast.error(`Subject "${selectedSubject?.name ?? ''}" belum punya template.`)
      return
    }
    setForm((s) => ({ ...s, badgeRanges: template.map((r) => ({ ...r })) }))
    toast.success(`Template ${selectedSubject?.name ?? ''} diterapkan.`)
  }

  function addRange() {
    setForm((state) => {
      const last = state.badgeRanges[state.badgeRanges.length - 1]
      const fallbackMin = last
        ? Math.min((last.maxCorrect ?? state.numberOfQuestions ?? 0) + 1, state.numberOfQuestions ?? 0)
        : 0
      const nextCount = last ? last.badgeCount + 1 : 1
      return {
        ...state,
        badgeRanges: [...state.badgeRanges, { minCorrect: fallbackMin, maxCorrect: null, badgeCount: nextCount }],
      }
    })
  }

  function removeRange(index: number) {
    setForm((state) => ({ ...state, badgeRanges: state.badgeRanges.filter((_, i) => i !== index) }))
  }

  function updateRange(index: number, patch: Partial<AdminVideoFormValues['badgeRanges'][number]>) {
    setForm((state) => ({
      ...state,
      badgeRanges: state.badgeRanges.map((range, i) => (i === index ? { ...range, ...patch } : range)),
    }))
  }

  async function handleYouTubeImport() {
    if (!form.youtubeUrl.trim()) {
      toast.error('Isi dulu YouTube URL.')
      return
    }
    setImporting(true)
    try {
      const response = await api.get('/admin/youtube-import', { params: { url: form.youtubeUrl.trim() } })
      const ytMeta = response.data.data as {
        title: string
        description: string
        thumbnailUrl: string
      }
      setForm((state) => ({
        ...state,
        title: ytMeta.title,
        slug: state.slug || slugify(ytMeta.title),
        description: ytMeta.description,
        thumbnailUrl: ytMeta.thumbnailUrl,
      }))
      toast.success('Metadata YouTube berhasil diimpor.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gagal impor dari YouTube.'))
    } finally {
      setImporting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)

    if (form.isPublished) {
      const missing: string[] = []
      if (!form.subjectId) missing.push('Subject')
      if (!form.ageGroupId) missing.push('Age group')
      if (!form.numberOfQuestions || Number(form.numberOfQuestions) <= 0) missing.push('Jumlah soal')
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
          maxCorrect: range.maxCorrect === null || range.maxCorrect === undefined ? null : Number(range.maxCorrect),
          badgeCount: Number(range.badgeCount),
        })),
      }

      if (mode === 'edit' && videoId) {
        await api.put(`/admin/videos/${videoId}`, payload)
        toast.success('Video berhasil diperbarui.')
      } else {
        await api.post('/admin/videos', payload)
        toast.success('Video berhasil dibuat.')
      }
      onSaved()
    } catch (error) {
      console.error('Failed to save video:', error)
      toast.error(getApiErrorMessage(error, 'Gagal menyimpan video.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid gap-3 rounded-xl border border-admin-line bg-admin-sunk p-4" onSubmit={handleSubmit}>
      <Field label="Judul video">
        <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
      </Field>
      <Field label="Slug" hint={`Preview: ${titlePreview || '-'}`}>
        <Input value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
      </Field>
      <Field label="YouTube URL" hint="Klik Pull untuk auto-fill judul, deskripsi, dan thumbnail dari YouTube.">
        <div className="flex min-w-0 gap-2">
          <Input value={form.youtubeUrl} onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))} />
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
        <Input value={form.thumbnailUrl} onChange={(e) => setForm((s) => ({ ...s, thumbnailUrl: e.target.value }))} />
      </Field>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <Field label="Subject">
          <Select value={form.subjectId} onChange={(e) => handleSubjectChange(e.target.value)}>
            <option value="">— pilih subject —</option>
            {subjectOptions.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Age group">
          <Select value={form.ageGroupId} onChange={(e) => setForm((s) => ({ ...s, ageGroupId: e.target.value }))}>
            <option value="">— pilih age group —</option>
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
            value={form.numberOfQuestions ?? ''}
            onChange={(e) => setForm((s) => ({ ...s, numberOfQuestions: Number(e.target.value) }))}
          />
        </Field>
        <Field label="Difficulty">
          <Select
            value={form.difficulty}
            onChange={(e) => setForm((s) => ({ ...s, difficulty: e.target.value as AdminVideoFormValues['difficulty'] }))}
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
            disabled={!selectedSubject?.defaultBadgeRanges || selectedSubject.defaultBadgeRanges.length === 0}
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

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={saving}>
          {saving ? 'Menyimpan...' : mode === 'edit' ? 'Update video' : 'Buat video'}
        </Button>
      </div>
    </form>
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
          className={`absolute inset-0 rounded-full transition-colors ${checked ? 'bg-qupu-brand-blue' : 'bg-admin-edge'}`}
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
