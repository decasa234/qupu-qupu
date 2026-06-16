import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BlockRenderer from '../components/fundamentals/blocks/BlockRenderer'
import type { Lang } from '../components/fundamentals/blocks/BlockRenderer'
import { fetchLesson, markLessonComplete } from '../lib/fundamentalsApi'
import { useAuthStore } from '../store/authStore'
import { isLocked, type LessonDetail } from '../types/fundamentals'

export default function FundamentalsLesson() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('id')
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!activeChildId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setAnswers({})
    fetchLesson(activeChildId, slug)
      .then((data) => {
        if (cancelled) return
        if (isLocked(data)) {
          navigate('/latihan/fundamental', { replace: true })
          return
        }
        setLesson(data)
      })
      .catch(() => !cancelled && setLesson(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeChildId, slug, navigate])

  const checkTotal = useMemo(
    () => (lesson ? lesson.blocks.filter((b) => b.type === 'check').length : 0),
    [lesson],
  )
  const checkCorrect = Object.values(answers).filter(Boolean).length

  function onCheckAnswered(blockId: string, correct: boolean) {
    setAnswers((prev) => (blockId in prev ? prev : { ...prev, [blockId]: correct }))
  }

  async function finish() {
    if (!activeChildId || !lesson || saving) return
    setSaving(true)
    try {
      await markLessonComplete(activeChildId, lesson.slug, checkCorrect, checkTotal)
    } catch {
      // Non-fatal: progress can be re-saved; still advance the learner.
    } finally {
      setSaving(false)
    }
    navigate(lesson.nextSlug ? `/latihan/fundamental/${lesson.nextSlug}` : '/latihan/fundamental')
  }

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[520px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-[520px] self-center space-y-3 p-2" aria-hidden="true">
        <div className="h-8 w-32 animate-pulse rounded-full bg-qupu-cream" />
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
        <div className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="w-full max-w-[520px] self-center p-6 text-center">
        <p className="text-sm font-semibold text-qupu-muted">Pelajaran tidak ditemukan.</p>
        <Link
          to="/latihan/fundamental"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-4 py-2 text-sm font-bold text-white"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali ke daftar
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[520px] self-center pb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          to="/latihan/fundamental"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Daftar
        </Link>
        {/* Bilingual toggle — seeing the English helps math-vocabulary building. */}
        <div className="inline-flex overflow-hidden rounded-full ring-2 ring-[#FFE3CC]">
          {(['id', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-black uppercase transition-colors ${
                lang === l ? 'bg-qupu-brand-blue text-white' : 'bg-white text-qupu-brand-blue/60'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson header */}
      <header className="rounded-[1.5rem] bg-[#FFF8F0] p-4 ring-2 ring-[#FFE3CC]">
        <h1 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
          {lang === 'en' ? lesson.titleEn : lesson.titleId}
        </h1>
        {(lang === 'en' ? lesson.summaryEn : lesson.summaryId) && (
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            {lang === 'en' ? lesson.summaryEn : lesson.summaryId}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-qupu-muted">
          {lesson.estMinutes != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
              <i className="fa-regular fa-clock" aria-hidden="true" />
              {lesson.estMinutes} {lang === 'en' ? 'min' : 'menit'}
            </span>
          )}
          {checkTotal > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
              <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
              {checkCorrect}/{checkTotal} {lang === 'en' ? 'checks' : 'cek'}
            </span>
          )}
          {lesson.completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7DC] px-2 py-1 text-[#3B6E00]">
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              {lang === 'en' ? 'Completed' : 'Selesai'}
            </span>
          )}
        </div>
      </header>

      {/* Blocks */}
      <div className="mt-5">
        <BlockRenderer blocks={lesson.blocks} lang={lang} onCheckAnswered={onCheckAnswered} />
      </div>

      {/* Footer CTA */}
      <button
        type="button"
        onClick={finish}
        disabled={saving}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3.5 font-display text-lg font-black text-white shadow-[0_5px_0_0_#B8541A] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#B8541A] disabled:opacity-70"
      >
        {saving ? (
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        ) : (
          <i className="fa-solid fa-check text-base" aria-hidden="true" />
        )}
        {lesson.nextSlug
          ? lang === 'en'
            ? 'Done — next lesson'
            : 'Selesai — lanjut'
          : lang === 'en'
            ? 'Finish course section'
            : 'Selesai'}
      </button>
    </div>
  )
}
