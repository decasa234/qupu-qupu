// src/pages/VideoDetail.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import Reveal from '../components/Reveal'
import Slider from '../components/Slider'
import ChildModal from '../components/ChildModal'
import { useAuthStore } from '../store/authStore'
import type { Child, ScoreAttemptResult, VideoDetail } from '../types'

export default function VideoDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, activeChildId, children, addChild, setActiveChild } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<ScoreAttemptResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const response = await api.get(`/public/videos/${slug}`)
        setVideo(response.data.data)
      } catch (fetchError) {
        console.error('Failed to load video:', fetchError)
        setLoadError('Video tidak ditemukan atau belum dipublikasikan.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  const previewTier = useMemo(() => {
    if (!video) return null
    return (
      [...video.badgeRules]
        .sort((a, b) => b.tier - a.tier)
        .find(
          (rule) =>
            score >= rule.minCorrect &&
            (rule.maxCorrect === null || score <= rule.maxCorrect),
        ) ?? null
    )
  }, [score, video])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!video || !activeChildId) return

    setSaving(true)
    setSubmitError('')

    try {
      const response = await api.post('/me/video-scores', {
        childId: activeChildId,
        videoId: video.id,
        correctAnswers: score,
      })
      setResult(response.data.data)
    } catch (submitErr: unknown) {
      const nextError =
        typeof submitErr === 'object' &&
        submitErr !== null &&
        'response' in submitErr &&
        typeof (submitErr as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitErr as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menyimpan skor.'
      setSubmitError(nextError)
    } finally {
      setSaving(false)
    }
  }

  const handleChildCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="aspect-video animate-pulse rounded-[2rem] bg-qupu-peach/40" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-qupu-peach/40" />
      </div>
    )
  }

  if (loadError || !video) {
    return (
      <Reveal>
        <section className="rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-10 text-center shadow-[6px_8px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-circle-question text-2xl" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-qupu-brand-blue">
            Video belum tersedia
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-qupu-muted">
            Coba kembali ke beranda untuk memilih video QUPU lainnya.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-house text-sm" aria-hidden="true" />
            Kembali ke beranda
          </Link>
        </section>
      </Reveal>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-qupu-cream shadow-[6px_8px_0_0_#FFD3B1]">
            <div className="aspect-video">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-qupu-muted">
              <span
                className="rounded-full px-3 py-1 text-white"
                style={{ backgroundColor: video.subject.colorHex }}
              >
                {video.subject.name}
              </span>
              <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                {video.ageGroup.name}
              </span>
              <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                {video.numberOfQuestions} soal
              </span>
              {video.publishedAt && (
                <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                  {formatDateLabel(video.publishedAt)}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-qupu-brand-blue">{video.title}</h1>
            <p className="mt-4 text-base leading-7 text-qupu-muted">{video.description}</p>
          </div>
        </Reveal>
      </div>

      <div className="space-y-6">
        <Reveal>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Badge Family
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">
                  {video.badgeFamily.name}
                </div>
                {video.badgeFamily.description && (
                  <p className="mt-2 text-xs font-medium text-qupu-muted">
                    {video.badgeFamily.description}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ backgroundColor: video.badgeFamily.colorHex }}
              >
                3 Tier
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {video.badgeRules.map((rule, index) => (
                <Reveal key={rule.badgeTierId} delay={0.05 * (index + 1)}>
                  <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: rule.colorHex }}
                      >
                        <i className="fa-solid fa-star text-sm" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-qupu-brand-blue">
                          Tier {rule.tier} · {rule.name}
                        </div>
                        <div className="text-xs text-qupu-muted">
                          {rule.minCorrect} – {rule.maxCorrect ?? `${video.numberOfQuestions}+`} jawaban benar
                        </div>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                      style={{ backgroundColor: rule.colorHex }}
                    >
                      Unlock
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Score input card placeholder — Task 12 fills this in */}
        <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-sm text-qupu-muted shadow-[5px_6px_0_0_#FFD3B1]">
          Score input card lives here (Task 12).
        </div>
      </div>

      <ChildModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleChildCreated}
      />

      {/* Suppress unused-vars while right column is stubbed; remove after Task 12 */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
        <span className="hidden">
          {String(score)}
          {String(saving)}
          {String(submitError)}
          {String(result)}
          {String(previewTier)}
          {String(activeChild)}
          {String(isAuthenticated)}
          {String(navigate)}
          {String(setScore)}
          {String(handleSubmit)}
          {Slider.name}
        </span>
      )}
    </div>
  )
}
