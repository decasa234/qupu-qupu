// src/pages/VideoDetail.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { formatDateLabel } from '../lib/youtube'
import Reveal from '../components/Reveal'
import Slider from '../components/Slider'
import AuthModal from '../components/AuthModal'
import BadgeCurve from '../components/BadgeCurve'
import ChildNamePrompt from '../components/ChildNamePrompt'
import { clearPendingScore, readPendingScore, savePendingScore } from '../lib/pendingScore'
import { useAuthStore } from '../store/authStore'
import type { ScoreAttemptResult, VideoDetail, VideoScoreState } from '../types'

export default function VideoDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, activeChildId, children } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<ScoreAttemptResult | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [childPromptOpen, setChildPromptOpen] = useState(false)
  const [existingScore, setExistingScore] = useState<VideoScoreState | null>(null)
  const [editing, setEditing] = useState(false)

  const replayInFlightRef = useRef(false)

  useEffect(() => {
    trackEvent('page_view', { slug })
  }, [slug])

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

  useEffect(() => {
    if (!isAuthenticated || !activeChildId || !video) {
      setExistingScore(null)
      return
    }

    let cancelled = false

    async function lookup() {
      try {
        const response = await api.get('/me/video-scores', {
          params: { childId: activeChildId, videoId: video!.id },
        })
        if (!cancelled) {
          const data = response.data?.data as VideoScoreState | null
          setExistingScore(data)
          if (data) setScore(data.correctAnswers)
        }
      } catch (lookupError) {
        console.error('Failed to look up existing score:', lookupError)
        if (!cancelled) setExistingScore(null)
      }
    }

    void lookup()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, activeChildId, video])

  const predictedBadgeCount = useMemo(() => {
    if (!video) return 0
    const matched = [...video.badgeRanges]
      .sort((a, b) => b.badgeCount - a.badgeCount)
      .find(
        (range) =>
          score >= range.minCorrect &&
          (range.maxCorrect === null || score <= range.maxCorrect),
      )
    return matched?.badgeCount ?? 0
  }, [score, video])

  const submitScore = async (videoId: string, childId: string, correctAnswers: number) => {
    setSaving(true)
    setSubmitError('')
    try {
      const response = await api.post('/me/video-scores', {
        childId,
        videoId,
        correctAnswers,
      })
      const submitted = response.data.data as ScoreAttemptResult
      setResult(submitted)
      clearPendingScore()
      setExistingScore({
        correctAnswers: submitted.attempt.correctAnswers,
        totalQuestions: submitted.attempt.totalQuestions,
        badgeCount: submitted.earnedBadgeCount,
        scorePercentage: submitted.attempt.scorePercentage,
        latestAttemptAt: submitted.attempt.createdAt,
      })
      setEditing(false)
    } catch (submitErr: unknown) {
      const nextError =
        typeof submitErr === 'object' &&
        submitErr !== null &&
        'response' in submitErr &&
        typeof (submitErr as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitErr as { response: { data: { error: string } } }).response.data.error
          : 'Gagal menyimpan skor.'
      setSubmitError(nextError)
      clearPendingScore()
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!video) return

    if (!isAuthenticated) {
      trackEvent('score_submit_attempt_anon', { slug, correctAnswers: score })
      savePendingScore({ videoId: video.id, slug, correctAnswers: score })
      setAuthModalOpen(true)
      return
    }

    if (!activeChildId) {
      savePendingScore({ videoId: video.id, slug, correctAnswers: score })
      setChildPromptOpen(true)
      return
    }

    trackEvent('score_submit_attempt', { slug, correctAnswers: score })
    await submitScore(video.id, activeChildId, score)
  }

  useEffect(() => {
    if (!video) return
    if (!isAuthenticated) return
    if (replayInFlightRef.current) return

    const pending = readPendingScore()
    if (!pending) return
    if (pending.videoId !== video.id) return

    if (!activeChildId) {
      setChildPromptOpen(true)
      return
    }

    replayInFlightRef.current = true
    setScore(pending.correctAnswers)
    setAuthModalOpen(false)
    setChildPromptOpen(false)
    void submitScore(video.id, activeChildId, pending.correctAnswers).finally(() => {
      replayInFlightRef.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeChildId, video?.id])

  const handleAuthenticated = () => {
    setAuthModalOpen(false)
  }

  const handleChildCreated = () => {
    setChildPromptOpen(false)
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

  const scoreOwnerLabel = activeChild?.name ?? 'anak'
  const ownerColor = activeChild?.avatarColor ?? '#FB923C'
  const sortedRanges = [...video.badgeRanges].sort((a, b) => a.minCorrect - b.minCorrect)
  const maxBadgeCount = sortedRanges.reduce((max, range) => Math.max(max, range.badgeCount), 0)

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
                  Badge {video.subject.name}
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">
                  {maxBadgeCount === 0
                    ? 'Range badge'
                    : `Sampai ${maxBadgeCount} badge`}
                </div>
                <p className="mt-2 text-xs font-medium text-qupu-muted">
                  Skor benar menentukan jumlah badge {video.subject.name} yang anak dapat dari video ini.
                </p>
              </div>
              <BadgeCurve color={video.subject.colorHex} size={64} label={`Badge ${video.subject.name}`} />
            </div>

            <div className="mt-5 space-y-3">
              {sortedRanges.map((range, index) => (
                <Reveal key={range.id ?? index} delay={0.05 * (index + 1)}>
                  <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BadgeCurve color={video.subject.colorHex} size={36} />
                      <div>
                        <div className="text-sm font-bold text-qupu-brand-blue">
                          {range.minCorrect} – {range.maxCorrect ?? `${video.numberOfQuestions}+`} jawaban benar
                        </div>
                        <div className="text-xs text-qupu-muted">
                          {range.badgeCount === 0
                            ? 'Belum dapat badge'
                            : `${range.badgeCount} badge ${video.subject.name}`}
                        </div>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                      style={{ backgroundColor: video.subject.colorHex }}
                    >
                      {range.badgeCount}×
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-7">
            {!result && (existingScore === null || editing) && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                    Input Skor
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: ownerColor }}
                    />
                    <h2 className="font-display text-2xl font-bold text-qupu-brand-blue">
                      Skor {scoreOwnerLabel}
                    </h2>
                  </div>
                  <p className="mt-2 text-xs text-qupu-muted">
                    Geser untuk masukkan jumlah jawaban benar (0 – {video.numberOfQuestions}).
                  </p>
                </div>

                <Slider
                  value={score}
                  max={video.numberOfQuestions}
                  onChange={setScore}
                  ariaLabel="Jumlah jawaban benar"
                />

                <div
                  key={predictedBadgeCount}
                  className="rounded-[1.5rem] px-4 py-4 transition-colors"
                  style={{
                    backgroundColor:
                      predictedBadgeCount > 0 ? `${video.subject.colorHex}1F` : '#FFF2DF',
                  }}
                >
                  {predictedBadgeCount > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        {Array.from({ length: Math.min(predictedBadgeCount, 4) }).map((_, idx) => (
                          <BadgeCurve key={idx} color={video.subject.colorHex} size={36} />
                        ))}
                        {predictedBadgeCount > 4 && (
                          <span className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-2 font-display text-xs font-extrabold text-qupu-brand-blue shadow-sm">
                            +{predictedBadgeCount - 4}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
                          Akan dapat
                        </div>
                        <div className="font-display text-base font-extrabold text-qupu-brand-blue">
                          {predictedBadgeCount} badge {video.subject.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-qupu-muted">
                      <i className="fa-solid fa-circle-info" aria-hidden="true" />
                      Skor ini belum membuka badge. Coba lagi dengan hasil lebih tinggi.
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                    <i className="fa-solid fa-floppy-disk text-base text-qupu-brand-blue" aria-hidden="true" />
                  </span>
                  {saving ? 'Menyimpan...' : `Simpan skor ${score}/${video.numberOfQuestions}`}
                </button>
              </form>
            )}

            {!result && existingScore !== null && !editing && (
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Sudah selesai
                </div>
                <div className="font-display text-5xl font-extrabold leading-none text-qupu-brand-blue">
                  {existingScore.correctAnswers}
                  <span className="text-2xl text-qupu-muted">/{existingScore.totalQuestions}</span>
                </div>
                <div className="text-xs font-semibold text-qupu-muted">
                  {existingScore.scorePercentage}% benar · {existingScore.badgeCount}× badge {video.subject.name}
                </div>
                {existingScore.badgeCount > 0 && (
                  <div className="flex items-center -space-x-2">
                    {Array.from({ length: Math.min(existingScore.badgeCount, 5) }).map((_, idx) => (
                      <BadgeCurve key={idx} color={video.subject.colorHex} size={36} />
                    ))}
                    {existingScore.badgeCount > 5 && (
                      <span className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-2 font-display text-xs font-extrabold text-qupu-brand-blue shadow-sm">
                        +{existingScore.badgeCount - 5}
                      </span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true)
                    setSubmitError('')
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-qupu-brand-orange underline-offset-4 hover:underline"
                >
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                  Ubah skor
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-5 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Skor Tersimpan
                </div>

                <div className="font-display text-6xl font-extrabold leading-none text-qupu-brand-blue">
                  {result.attempt.scorePercentage}%
                </div>
                <div className="text-xs font-semibold text-qupu-muted">
                  {result.attempt.correctAnswers} / {result.attempt.totalQuestions} jawaban benar
                </div>

                {result.earnedBadgeCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-center -space-x-3">
                      {Array.from({ length: Math.min(result.earnedBadgeCount, 5) }).map((_, idx) => (
                        <BadgeCurve key={idx} color={result.subject.colorHex} size={56} />
                      ))}
                      {result.earnedBadgeCount > 5 && (
                        <span className="ml-1 inline-flex h-14 items-center rounded-full bg-white px-3 font-display text-base font-extrabold text-qupu-brand-blue shadow-sm">
                          +{result.earnedBadgeCount - 5}
                        </span>
                      )}
                    </div>
                    <div
                      className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-sm"
                      style={{ backgroundColor: result.subject.colorHex }}
                    >
                      <i className="fa-solid fa-trophy text-sm" aria-hidden="true" />
                      <span className="font-display text-sm font-extrabold">
                        {result.earnedBadgeCount} badge {result.subject.name}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-qupu-brand-blue">
                      {result.isUpgrade
                        ? `Naik dari ${result.previousBadgeCount} badge — kerja bagus!`
                        : `Sudah pernah dapat ${result.previousBadgeCount} badge dari video ini.`}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-3 text-sm text-qupu-muted">
                    Belum ada badge yang terbuka dari skor ini. Coba lagi dengan hasil lebih tinggi.
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-gauge text-sm" aria-hidden="true" />
                    Lihat dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null)
                      setScore(0)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
                  >
                    <i className="fa-solid fa-rotate-left text-sm" aria-hidden="true" />
                    Coba skor lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <ChildNamePrompt
        open={childPromptOpen}
        onCreated={handleChildCreated}
      />
    </div>
  )
}
