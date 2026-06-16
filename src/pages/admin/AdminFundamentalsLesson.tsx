import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlockRenderer from '../../components/fundamentals/blocks/BlockRenderer'
import type { Lang } from '../../components/fundamentals/blocks/BlockRenderer'
import { BLOCK_TYPES, type LessonBlock, type LessonBlockType } from '../../../api/services/fundamentals/blocks'
import { lessonBlocksSchema } from '../../../api/services/fundamentals/blocks'
import { fetchAdminLesson, updateLesson, type AdminLessonFull } from '../../lib/fundamentalsAdminApi'

function genId(): string {
  const c = globalThis.crypto
  return c?.randomUUID ? c.randomUUID().slice(0, 8) : `b${Math.floor(Math.random() * 1e9)}`
}

function defaultBlock(type: LessonBlockType): LessonBlock {
  const id = genId()
  switch (type) {
    case 'prose':
      return { id, type, body_en: '', body_id: '' }
    case 'tip':
      return { id, type, variant: 'tip', body_en: '', body_id: '' }
    case 'check':
      return { id, type, prompt_en: '', prompt_id: '', choices_en: ['', ''], choices_id: ['', ''], answer_index: 0 }
    case 'worked':
      return { id, type, source: 'paper', code: '' }
    case 'glossary':
      return { id, type, term_slugs: [] }
    case 'image':
      return { id, type, src: '', alt_en: '', alt_id: '' }
    case 'scoring':
      return { id, type }
  }
}

export default function AdminFundamentalsLesson() {
  const { slug = '' } = useParams()
  const [lesson, setLesson] = useState<AdminLessonFull | null>(null)
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lang, setLang] = useState<Lang>('id')
  const [addOpen, setAddOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminLesson(slug)
      setLesson(data)
      setBlocks(data.blocks)
      setError(null)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  function patchBlock(id: string, next: LessonBlock) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? next : b)))
    setSaved(false)
  }
  function move(i: number, dir: -1 | 1) {
    setBlocks((bs) => {
      const j = i + dir
      if (j < 0 || j >= bs.length) return bs
      const copy = [...bs]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
    setSaved(false)
  }
  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id))
    setSaved(false)
  }
  function addBlock(type: LessonBlockType) {
    setBlocks((bs) => [...bs, defaultBlock(type)])
    setAddOpen(false)
    setSaved(false)
  }

  async function save() {
    if (!lesson || saving) return
    const parsed = lessonBlocksSchema.safeParse(blocks)
    if (!parsed.success) {
      setError(`Blok belum valid: ${parsed.error.issues.map((i) => `#${String(i.path[0])} ${i.message}`).join('; ')}`)
      return
    }
    setSaving(true)
    try {
      await updateLesson(slug, { blocks: parsed.data })
      setError(null)
      setSaved(true)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-5xl p-2 text-sm font-semibold text-admin-muted">Memuat…</div>
  if (!lesson) {
    return (
      <div className="max-w-5xl p-2">
        <p className="text-sm font-semibold text-red-600">{error ?? 'Pelajaran tidak ditemukan.'}</p>
        <Link to="/admin/fundamentals" className="mt-2 inline-block text-sm font-bold text-qupu-brand-blue">
          ← Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/fundamentals" className="text-xs font-bold text-qupu-brand-blue">
            ← Fundamentals
          </Link>
          <h1 className="font-display text-2xl font-black text-admin-ink">{lesson.title_id}</h1>
          <div className="text-xs font-semibold text-admin-faint">
            <code>{lesson.slug}</code> · {lesson.module_slug}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-bold text-green-600">Tersimpan ✓</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-qupu-brand-blue px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Menyimpan…' : 'Simpan blok'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <div key={block.id} className="rounded-xl border border-admin-line bg-admin-card p-3 shadow-admin-soft">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-admin-sunk px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-admin-muted">
                  {block.type}
                </span>
                <div className="flex items-center gap-1">
                  <MiniBtn icon="fa-arrow-up" title="Naik" onClick={() => move(i, -1)} disabled={i === 0} />
                  <MiniBtn icon="fa-arrow-down" title="Turun" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} />
                  <MiniBtn icon="fa-trash" title="Hapus" danger onClick={() => removeBlock(block.id)} />
                </div>
              </div>
              <BlockFields block={block} onChange={(n) => patchBlock(block.id, n)} />
            </div>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setAddOpen((o) => !o)}
              className="w-full rounded-xl border-2 border-dashed border-admin-edge py-3 text-sm font-bold text-admin-muted hover:border-qupu-brand-blue hover:text-qupu-brand-blue"
            >
              <i className="fa-solid fa-plus mr-1.5" aria-hidden="true" />
              Tambah blok
            </button>
            {addOpen && (
              <div className="absolute z-10 mt-1 grid w-full gap-1 rounded-xl border border-admin-line bg-admin-card p-2 shadow-lg">
                {BLOCK_TYPES.map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => addBlock(t.type)}
                    className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-admin-ink hover:bg-admin-sunk"
                  >
                    <span className="font-black">{t.label}</span>{' '}
                    <span className="text-admin-faint">({t.type})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wide text-admin-faint">Pratinjau</span>
            <div className="inline-flex overflow-hidden rounded-full border border-admin-edge">
              {(['id', 'en'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[11px] font-black uppercase ${
                    lang === l ? 'bg-qupu-brand-blue text-white' : 'bg-white text-admin-muted'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-admin-line bg-[#FDF8F2] p-4">
            {blocks.length === 0 ? (
              <p className="text-center text-sm font-semibold text-admin-faint">Belum ada blok.</p>
            ) : (
              <BlockRenderer blocks={blocks} lang={lang} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Per-type structured forms ──────────────────────────────────────────────

function BlockFields({ block, onChange }: { block: LessonBlock; onChange: (b: LessonBlock) => void }) {
  switch (block.type) {
    case 'prose':
      return (
        <div className="grid gap-2">
          <TwoLang label="Judul (opsional)" en={block.title_en ?? ''} id={block.title_id ?? ''}
            onEn={(v) => onChange({ ...block, title_en: v })} onId={(v) => onChange({ ...block, title_id: v })} />
          <TwoLang area label="Isi" en={block.body_en} id={block.body_id}
            onEn={(v) => onChange({ ...block, body_en: v })} onId={(v) => onChange({ ...block, body_id: v })} />
        </div>
      )
    case 'tip':
      return (
        <div className="grid gap-2">
          <Select label="Jenis" value={block.variant ?? 'tip'} options={['tip', 'warning']}
            onChange={(v) => onChange({ ...block, variant: v as 'tip' | 'warning' })} />
          <TwoLang label="Judul (opsional)" en={block.title_en ?? ''} id={block.title_id ?? ''}
            onEn={(v) => onChange({ ...block, title_en: v })} onId={(v) => onChange({ ...block, title_id: v })} />
          <TwoLang area label="Isi" en={block.body_en} id={block.body_id}
            onEn={(v) => onChange({ ...block, body_en: v })} onId={(v) => onChange({ ...block, body_id: v })} />
        </div>
      )
    case 'check':
      return (
        <div className="grid gap-2">
          <TwoLang area label="Pertanyaan" en={block.prompt_en} id={block.prompt_id}
            onEn={(v) => onChange({ ...block, prompt_en: v })} onId={(v) => onChange({ ...block, prompt_id: v })} />
          <TwoLang area label="Pilihan (satu per baris)"
            en={block.choices_en.join('\n')} id={block.choices_id.join('\n')}
            onEn={(v) => onChange({ ...block, choices_en: splitLines(v) })}
            onId={(v) => onChange({ ...block, choices_id: splitLines(v) })} />
          <Num label="Indeks jawaban benar (mulai 0)" value={block.answer_index}
            onChange={(v) => onChange({ ...block, answer_index: v })} />
          <TwoLang area label="Penjelasan (opsional)" en={block.explain_en ?? ''} id={block.explain_id ?? ''}
            onEn={(v) => onChange({ ...block, explain_en: v })} onId={(v) => onChange({ ...block, explain_id: v })} />
        </div>
      )
    case 'worked':
      return (
        <div className="grid gap-2">
          <Text label="Kode soal (mis. WMI-20F1A-Q1)" value={block.code}
            onChange={(v) => onChange({ ...block, code: v })} />
          <TwoLang label="Keterangan (opsional)" en={block.caption_en ?? ''} id={block.caption_id ?? ''}
            onEn={(v) => onChange({ ...block, caption_en: v })} onId={(v) => onChange({ ...block, caption_id: v })} />
        </div>
      )
    case 'glossary':
      return (
        <div className="grid gap-2">
          <Text label="Slug kosakata (pisahkan dengan koma)" value={block.term_slugs.join(', ')}
            onChange={(v) => onChange({ ...block, term_slugs: splitCommas(v) })} />
          <TwoLang label="Pengantar (opsional)" en={block.intro_en ?? ''} id={block.intro_id ?? ''}
            onEn={(v) => onChange({ ...block, intro_en: v })} onId={(v) => onChange({ ...block, intro_id: v })} />
        </div>
      )
    case 'image':
      return (
        <div className="grid gap-2">
          <Text label="URL gambar" value={block.src} onChange={(v) => onChange({ ...block, src: v })} />
          <TwoLang label="Teks alternatif" en={block.alt_en} id={block.alt_id}
            onEn={(v) => onChange({ ...block, alt_en: v })} onId={(v) => onChange({ ...block, alt_id: v })} />
          <TwoLang label="Keterangan (opsional)" en={block.caption_en ?? ''} id={block.caption_id ?? ''}
            onEn={(v) => onChange({ ...block, caption_en: v })} onId={(v) => onChange({ ...block, caption_id: v })} />
        </div>
      )
    case 'scoring':
      return (
        <div className="grid gap-2">
          <Text label="Brand (pisahkan koma; kosong = semua)" value={(block.brands ?? []).join(', ')}
            onChange={(v) => onChange({ ...block, brands: splitCommas(v) })} />
          <TwoLang label="Pengantar (opsional)" en={block.intro_en ?? ''} id={block.intro_id ?? ''}
            onEn={(v) => onChange({ ...block, intro_en: v })} onId={(v) => onChange({ ...block, intro_id: v })} />
        </div>
      )
  }
}

function splitLines(v: string): string[] {
  return v.split('\n').map((s) => s.trim()).filter(Boolean)
}
function splitCommas(v: string): string[] {
  return v.split(',').map((s) => s.trim()).filter(Boolean)
}

function TwoLang({
  label, en, id, onEn, onId, area,
}: {
  label: string; en: string; id: string; onEn: (v: string) => void; onId: (v: string) => void; area?: boolean
}) {
  return (
    <div>
      <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-admin-faint">{label}</span>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <Bare value={id} onChange={onId} area={area} placeholder="ID" />
        <Bare value={en} onChange={onEn} area={area} placeholder="EN" />
      </div>
    </div>
  )
}

function Bare({ value, onChange, area, placeholder }: { value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  const cls = 'w-full rounded-lg border border-admin-edge bg-white px-2.5 py-1.5 text-sm font-semibold text-admin-ink focus:border-qupu-brand-blue focus:outline-none'
  return area ? (
    <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
  ) : (
    <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
  )
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-admin-faint">{label}</span>
      <Bare value={value} onChange={onChange} />
    </label>
  )
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-admin-faint">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
        className="w-28 rounded-lg border border-admin-edge bg-white px-2.5 py-1.5 text-sm font-semibold text-admin-ink focus:border-qupu-brand-blue focus:outline-none"
      />
    </label>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-admin-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-admin-edge bg-white px-2.5 py-1.5 text-sm font-semibold text-admin-ink focus:border-qupu-brand-blue focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

function MiniBtn({ icon, title, onClick, disabled, danger }: { icon: string; title: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md border border-admin-edge bg-white text-xs disabled:opacity-30 ${
        danger ? 'text-red-500 hover:bg-red-50' : 'text-admin-muted hover:bg-admin-sunk'
      }`}
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
