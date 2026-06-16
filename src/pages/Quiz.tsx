// src/pages/Quiz.tsx
//
// Member-facing quiz page. Lives inside <AppShell> (sticky stat strip +
// bottom tabs), so it is always reached by an authenticated user with an
// active child. That lets it drop the anon-only machinery that VideoDetail
// carries (auth modal, child-name prompt, pendingScore localStorage replay):
// here we can submit straight away.
//
// Single-scroll, mobile-first layout: video → title/meta → badge ranges →
// score entry. Reuses the existing scoring API and the small presentational
// pieces (Slider, BadgeCurve, PostQuizRewardSummary). VideoDetail stays the
// public/marketing catalog page; this is the in-app version that the
// dashboard practice card and library cards route into.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import Slider from '../components/Slider'
import BadgeCurve from '../components/BadgeCurve'
import AuthCard from '../components/AuthCard'
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import PostQuizRewardSummary from '../components/PostQuizRewardSummary'
import { logSessionEvent, useVideoSessionTimer } from '../lib/sessionLogger'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import type { ScoreAttemptResult, VideoDetail, VideoScoreState } from '../types'

export default function QuizPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { activeChildId, children } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<ScoreAttemptResult | null>(null)
  const [existingScore, setExistingScore] = useState<VideoScoreState | null>(null)
  const [editing, setEditing] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  // Pairs quiz_open with quiz_close on unmount for activation analytics.
  // No-op until both ids are ready, so safe with the conditional child id.
  useVideoSessionTimer(activeChildId, video?.id ?? null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const response = await api.get(`/public/videos/${slug}`)
        setVideo(response.data.data)
      } catch (fetchError) {
        console.error('Failed to load quiz video:', fetchError)
        setLoadError('Kuis tidak ditemukan atau belum dipublikasikan.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  useEffect(() => {
    if (!activeChildId || !video) {
      setExistingScore(null)
      return
    }

    let cancelled = false

    async function lookup() {
      try {
        const response = await api.get('/me/video-scores', {
          params: { childId: activeChildId, videoId: video!.id },
        })
        if (cancelled) return
        const data = response.data?.data as VideoScoreState | null
        setExistingScore(data)
        if (data) setScore(data.correctAnswers)
      } catch (lookupError) {
        console.error('Failed to look up existing score:', lookupError)
        if (!cancelled) setExistingScore(null)
      }
    }

    void lookup()

    return () => {
      cancelled = true
    }
  }, [activeChildId, video])

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

  async function submitScore(videoId: string, childId: string, correctAnswers: number) {
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
      logSessionEvent({
        childId,
        eventKind: 'quiz_submit',
        videoId,
        metadata: {
          correctAnswers,
          scorePercentage: submitted.attempt.scorePercentage,
          isCorrection: submitted.isCorrection,
        },
      })
      setExistingScore({
        correctAnswers: submitted.attempt.correctAnswers,
        totalQuestions: submitted.attempt.totalQuestions,
        badgeCount: submitted.earnedBadgeCount,
        scorePercentage: submitted.attempt.scorePercentage,
        latestAttemptAt: submitted.attempt.createdAt,
      })
      setEditing(false)
      // Open the reward summary only when the backend returned a gamification
      // block. Patch the visible coin balance in the top strip right away (the
      // hook is built for this after-score update); xp/level/streak refresh on
      // the next dashboard load since the score payload omits xpToNext.
      if (submitted.gamification) {
        useGamificationStats.getState().patchCoinBalance(childId, submitted.gamification.coinBalance)
        setRewardModalOpen(true)
      }
    } catch (submitErr: unknown) {
      setSubmitError(toIndonesianErrorMessage(submitErr, 'Gagal menyimpan skor.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!video || !activeChildId) return
    await submitScore(video.id, activeChildId, score)
  }

  if (!activeChildId || !activeChild) {
    return (
      <AuthCard
        mascotSrc="/hero-mascot.png"
        eyebrow="Kuis"
        title="Pilih profil anak dulu"
        subtitle="Kuis dan badge dihitung per anak. Ganti profil anak di halaman Profil untuk mulai."
      >
        <Link
          to="/onboard/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
        >
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-[390px] self-center space-y-4 pb-6">
        <Skeleton className="aspect-video rounded-[1.75rem]" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (loadError || !video) {
    return (
      <div className="w-full max-w-[390px] self-center space-y-4 pb-6">
        <BackButton variant="back" to="/video" />
        <div className="rounded-[1.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-circle-question text-2xl" aria-hidden="true" />
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
            Kuis belum tersedia
          </h1>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            {loadError || 'Coba pilih kuis lain dari perpustakaan.'}
          </p>
          <Link
            to="/video"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-book-open text-sm" aria-hidden="true" />
            Ke perpustakaan
          </Link>
        </div>
      </div>
    )
  }

  const scoreOwnerLabel = activeChild.name
  const ownerColor = activeChild.avatarColor ?? '#FB923C'
  const sortedRanges = [...video.badgeRanges].sort((a, b) => a.minCorrect - b.minCorrect)
  const maxBadgeCount = sortedRanges.reduce((max, range) => Math.max(max, range.badgeCount), 0)

  return (
    <div className="w-full max-w-[390px] self-center space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <BackButton variant="back" to="/video" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-orange">
          Kuis
        </span>
      </div>

      {/* Video */}
      <div className="overflow-hidden rounded-[1.5rem] bg-qupu-cream shadow-[5px_6px_0_0_#FFD3B1]">
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

      {/* Title + meta */}
      <div className="rounded-[1.5rem] bg-white p-4 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-qupu-muted">
          <span
            className="rounded-full px-2.5 py-1 text-white"
            style={{ backgroundColor: video.subject.colorHex }}
          >
            {video.subject.name}
          </span>
          <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-qupu-brand-blue">
            {video.ageGroup.name}
          </span>
          <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-qupu-brand-blue">
            {video.numberOfQuestions} soal
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-black leading-tight text-qupu-brand-blue">
          {video.title}
        </h1>
      </div>

      {/* Badge ranges */}
      <div className="rounded-[1.5rem] bg-white p-4 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              Badge {video.subject.name}
            </div>
            <div className="mt-1 font-display text-xl font-black text-qupu-brand-blue">
              {maxBadgeCount === 0 ? 'Range badge' : `Sampai ${maxBadgeCount} badge`}
            </div>
          </div>
          <BadgeCurve color={video.subject.colorHex} size={48} label={`Badge ${video.subject.name}`} />
        </div>

        <div className="mt-3 space-y-2">
          {sortedRanges.map((range, index) => (
            <div
              key={range.id ?? index}
              className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <BadgeCurve color={video.subject.colorHex} size={30} />
                <div>
                  <div className="text-xs font-extrabold text-qupu-brand-blue">
                    {range.minCorrect} – {range.maxCorrect ?? `${video.numberOfQuestions}+`} benar
                  </div>
                  <div className="text-[11px] text-qupu-muted">
                    {range.badgeCount === 0
                      ? 'Belum dapat badge'
                      : `${range.badgeCount} badge ${video.subject.name}`}
                  </div>
                </div>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                style={{ backgroundColor: video.subject.colorHex }}
              >
                {range.badgeCount}×
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Score entry / completed / result */}
      <div className="rounded-[1.5rem] bg-white p-4 shadow-[5px_6px_0_0_#FFD3B1]">
        {!result && (existingScore === null || editing) && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
                Input Skor
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                <span
                  className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: ownerColor }}
                />
                <h2 className="font-display text-xl font-black text-qupu-brand-blue">
                  Skor {scoreOwnerLabel}
                </h2>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-qupu-muted">
                Geser untuk masukkan jumlah jawaban benar (0 – {video.numberOfQuestions}).
              </p>
              {editing && (
                <p className="mt-1 text-[11px] font-bold text-qupu-brand-orange">
                  Mengubah skor yang sudah tersimpan.
                </p>
              )}
            </div>

            <Slider
              value={score}
              max={video.numberOfQuestions}
              onChange={setScore}
              ariaLabel="Jumlah jawaban benar"
            />

            <div
              key={predictedBadgeCount}
              className="rounded-[1.25rem] px-4 py-3.5"
              style={{
                backgroundColor: predictedBadgeCount > 0 ? `${video.subject.colorHex}1F` : '#FFF2DF',
              }}
            >
              {predictedBadgeCount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    {Array.from({ length: Math.min(predictedBadgeCount, 4) }).map((_, idx) => (
                      <BadgeCurve key={idx} color={video.subject.colorHex} size={32} />
                    ))}
                    {predictedBadgeCount > 4 && (
                      <span className="ml-1 inline-flex h-8 items-center rounded-full bg-white px-2 font-display text-xs font-extrabold text-qupu-brand-blue shadow-sm">
                        +{predictedBadgeCount - 4}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-qupu-muted">
                      Akan dapat
                    </div>
                    <div className="font-display text-sm font-extrabold text-qupu-brand-blue">
                      {predictedBadgeCount} badge {video.subject.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-qupu-muted">
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
              {saving
                ? 'Menyimpan...'
                : editing
                  ? `Update skor ${score}/${video.numberOfQuestions}`
                  : `Simpan skor ${score}/${video.numberOfQuestions}`}
            </button>
          </form>
        )}

        {!result && existingScore !== null && !editing && (
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              Sudah selesai
            </div>
            <div className="font-display text-5xl font-black leading-none text-qupu-brand-blue">
              {existingScore.correctAnswers}
              <span className="text-2xl text-qupu-muted">/{existingScore.totalQuestions}</span>
            </div>
            <div className="text-xs font-bold text-qupu-muted">
              {existingScore.scorePercentage}% benar · {existingScore.badgeCount}× badge {video.subject.name}
            </div>
            {existingScore.badgeCount > 0 && (
              <div className="flex items-center -space-x-2">
                {Array.from({ length: Math.min(existingScore.badgeCount, 5) }).map((_, idx) => (
                  <BadgeCurve key={idx} color={video.subject.colorHex} size={32} />
                ))}
                {existingScore.badgeCount > 5 && (
                  <span className="ml-1 inline-flex h-8 items-center rounded-full bg-white px-2 font-display text-xs font-extrabold text-qupu-brand-blue shadow-sm">
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
          <div className="space-y-4 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              Skor Tersimpan
            </div>
            <div className="font-display text-6xl font-black leading-none text-qupu-brand-blue">
              {result.attempt.scorePercentage}%
            </div>
            <div className="text-xs font-bold text-qupu-muted">
              {result.attempt.correctAnswers} / {result.attempt.totalQuestions} jawaban benar
            </div>

            {result.earnedBadgeCount > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-center -space-x-3">
                  {Array.from({ length: Math.min(result.earnedBadgeCount, 5) }).map((_, idx) => (
                    <BadgeCurve key={idx} color={result.subject.colorHex} size={52} />
                  ))}
                  {result.earnedBadgeCount > 5 && (
                    <span className="ml-1 inline-flex h-[3.25rem] items-center rounded-full bg-white px-3 font-display text-base font-extrabold text-qupu-brand-blue shadow-sm">
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
              </div>
            ) : (
              <div className="rounded-[1.25rem] bg-qupu-cream px-4 py-3 text-sm font-semibold text-qupu-muted">
                Belum ada badge yang terbuka dari skor ini. Coba lagi dengan hasil lebih tinggi.
              </div>
            )}

            <div className="grid gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('/belajar')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <i className="fa-solid fa-house text-sm" aria-hidden="true" />
                Ke beranda
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null)
                  setEditing(true)
                  setScore(existingScore?.correctAnswers ?? score)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
              >
                <i className="fa-solid fa-pen-to-square text-sm" aria-hidden="true" />
                Ubah skor
              </button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <PostQuizRewardSummary
          open={rewardModalOpen}
          result={result}
          childName={scoreOwnerLabel}
          onClose={() => setRewardModalOpen(false)}
          onGoToDashboard={() => {
            setRewardModalOpen(false)
            navigate('/belajar')
          }}
        />
      )}
    </div>
  )
}

