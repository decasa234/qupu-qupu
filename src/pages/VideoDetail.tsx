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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        <Reveal delay={0.05}>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-7">
            {!isAuthenticated && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
                  <i className="fa-solid fa-lock text-xl" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-qupu-brand-blue">
                  Login untuk menyimpan progres
                </h2>
                <p className="mt-2 text-sm text-qupu-muted">
                  Video tetap bisa ditonton oleh siapa pun, tapi badge dan progres butuh akun.
                </p>
                <div className="mt-5 grid gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-user-plus text-sm" aria-hidden="true" />
                    Buat akun QUPU
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white"
                  >
                    Sudah punya akun? Login
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && !activeChild && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
                  <i className="fa-solid fa-user-plus text-xl" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-qupu-brand-blue">
                  Pilih profil anak dulu
                </h2>
                <p className="mt-2 text-sm text-qupu-muted">
                  Tambahkan atau pilih profil anak untuk menyimpan skor.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-plus text-sm" aria-hidden="true" />
                  Tambah profil anak
                </button>
              </div>
            )}

            {isAuthenticated && activeChild && !result && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                    Input Skor
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
                    />
                    <h2 className="font-display text-2xl font-bold text-qupu-brand-blue">
                      Skor {activeChild.name}
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
                  key={previewTier?.tier ?? 'none'}
                  className="rounded-[1.5rem] px-4 py-4 transition-colors"
                  style={{
                    backgroundColor: previewTier ? `${previewTier.colorHex}1F` : '#FFF2DF',
                  }}
                >
                  {previewTier ? (
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: previewTier.colorHex }}
                      >
                        <i className="fa-solid fa-star text-sm" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
                          Akan terbuka
                        </div>
                        <div className="font-display text-base font-extrabold text-qupu-brand-blue">
                          Tier {previewTier.tier} · {previewTier.name}
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

            {result && (
              <div className="text-center">
                {/* Result UI placeholder — Task 13 fills this in */}
                <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-6 text-sm text-qupu-muted">
                  Result placeholder. Task 13 turns this into the celebration view.
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <ChildModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleChildCreated}
      />


    </div>
  )
}
