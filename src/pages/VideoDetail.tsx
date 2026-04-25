import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Award, Lock, PlayCircle, Trophy } from 'lucide-react'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import type { ScoreAttemptResult, VideoDetail } from '../types'

export default function VideoDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, activeChildId, children } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScoreAttemptResult | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/public/videos/${slug}`)
        setVideo(response.data.data)
      } catch (fetchError) {
        console.error('Failed to load video:', fetchError)
        setError('Video tidak ditemukan atau belum dipublikasikan.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  const submittedScore = useMemo(() => {
    const numericValue = Number(correctAnswers)

    if (!video || Number.isNaN(numericValue)) {
      return 0
    }

    return Math.max(0, Math.min(video.numberOfQuestions, numericValue))
  }, [correctAnswers, video])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!video || !activeChildId) return

    setSaving(true)
    setError('')

    try {
      const response = await api.post('/me/video-scores', {
        childId: activeChildId,
        videoId: video.id,
        correctAnswers: Number(correctAnswers),
      })

      setResult(response.data.data)
    } catch (submitError: unknown) {
      const nextError =
        typeof submitError === 'object' &&
        submitError !== null &&
        'response' in submitError &&
        typeof (submitError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitError as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menyimpan skor.'
      setError(nextError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-[2.5rem] bg-qupu-cream" />
  }

  if (!video) {
    return (
      <div className="rounded-[2.5rem] border border-qupu-peach bg-white p-10 text-center shadow-soft">
        <h1 className="font-display text-4xl font-bold text-qupu-purple">Video belum tersedia</h1>
        <p className="mt-3 text-qupu-muted">Coba kembali ke beranda untuk memilih video QUPU lainnya.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-qupu-orange px-5 py-3 font-bold text-white"
        >
          Kembali ke beranda
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-qupu-peach bg-white shadow-soft">
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

          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
              <span
                className="rounded-full px-3 py-1 text-white"
                style={{ backgroundColor: video.subject.colorHex }}
              >
                {video.subject.name}
              </span>
              <span>{video.ageGroup.name}</span>
              <span>{video.numberOfQuestions} soal</span>
              {video.publishedAt && <span>Dipublikasikan {formatDateLabel(video.publishedAt)}</span>}
            </div>
            <h1 className="font-display text-4xl font-bold text-qupu-ink">{video.title}</h1>
            <p className="mt-4 text-base leading-7 text-qupu-muted">{video.description}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-qupu-orange">Badge family</div>
                <div className="mt-1 font-display text-3xl font-bold text-qupu-purple">
                  {video.badgeFamily.name}
                </div>
                <p className="mt-2 text-sm text-qupu-muted">{video.badgeFamily.description}</p>
              </div>
              <div
                className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white"
                style={{ backgroundColor: video.badgeFamily.colorHex }}
              >
                3 tier
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {video.badgeRules.map((rule) => (
                <div
                  key={rule.badgeTierId}
                  className="flex items-center justify-between rounded-[1.5rem] bg-qupu-shell px-4 py-4"
                >
                  <div>
                    <div className="font-bold text-qupu-purple">Tier {rule.tier}: {rule.name}</div>
                    <div className="text-sm text-qupu-muted">
                      {rule.minCorrect} - {rule.maxCorrect ?? `${video.numberOfQuestions}+`} jawaban benar
                    </div>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: rule.colorHex }}
                  >
                    unlock
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-qupu-cream p-3 text-qupu-orange">
                {isAuthenticated ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-qupu-purple">
                  {!isAuthenticated
                    ? 'Login untuk menyimpan progres'
                    : !activeChild
                      ? 'Pilih profil anak dulu'
                      : `Input skor untuk ${activeChild.name}`}
                </div>
                <p className="text-sm text-qupu-muted">
                  {!isAuthenticated
                    ? 'Video tetap bisa ditonton oleh siapa pun, tapi badge dan progres butuh akun.'
                    : !activeChild
                      ? 'Tambahkan atau pilih profil anak dari navbar sebelum menyimpan skor.'
                      : 'Masukkan jumlah jawaban benar untuk membuka badge tier yang sesuai.'}
                </p>
              </div>
            </div>

            {isAuthenticated && activeChild ? (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="rounded-[1.5rem] bg-qupu-shell p-4">
                  <label className="text-sm font-bold uppercase tracking-[0.16em] text-qupu-muted">
                    Jumlah jawaban benar
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={video.numberOfQuestions}
                    value={correctAnswers}
                    onChange={(event) => setCorrectAnswers(event.target.value)}
                    className="mt-3 w-full rounded-[1.25rem] border border-qupu-peach bg-white px-4 py-4 text-3xl font-bold text-qupu-purple outline-none focus:border-qupu-orange"
                    placeholder="0"
                  />
                  <div className="mt-2 text-sm text-qupu-muted">
                    Maksimal {video.numberOfQuestions} jawaban benar
                  </div>
                </div>

                {error && (
                  <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-4">
                    <div className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-orange">
                      skor tersimpan
                    </div>
                    <div className="mt-2 font-display text-4xl font-bold text-qupu-purple">
                      {result.attempt.scorePercentage}%
                    </div>
                    {result.unlockedBadge ? (
                      <div className="mt-3 rounded-[1rem] bg-white px-4 py-3 text-sm font-semibold text-qupu-muted">
                        <div className="flex items-center gap-2 text-qupu-purple">
                          <Award className="h-4 w-4" />
                          {result.unlockedBadge.familyName} • Tier {result.unlockedBadge.tier}
                        </div>
                        <div className="mt-1">
                          {result.isUpgrade
                            ? 'Badge kamu naik tier. Kerja bagus.'
                            : 'Badge untuk hasil ini sudah tersimpan.'}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-qupu-muted">
                        Belum ada badge yang terbuka dari skor ini. Coba lagi dengan hasil lebih tinggi.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="mt-4 inline-flex rounded-full bg-qupu-purple px-5 py-3 text-sm font-bold text-white"
                    >
                      Lihat dashboard
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || correctAnswers === ''}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-orange px-5 py-4 text-base font-bold text-white transition-colors hover:bg-qupu-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PlayCircle className="h-5 w-5" />
                  {saving ? 'Menyimpan skor...' : `Simpan skor ${submittedScore}/${video.numberOfQuestions}`}
                </button>
              </form>
            ) : !isAuthenticated ? (
              <div className="mt-5 grid gap-3">
                <Link
                  to="/register"
                  className="rounded-full bg-qupu-orange px-5 py-4 text-center text-base font-bold text-white"
                >
                  Buat akun QUPU
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-qupu-peach px-5 py-4 text-center text-base font-semibold text-qupu-purple"
                >
                  Sudah punya akun? Login
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] bg-qupu-shell px-5 py-4 text-sm text-qupu-muted">
                Belum ada profil anak aktif. Gunakan switcher di navbar untuk menambahkan atau memilih profil
                sebelum menyimpan skor.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
