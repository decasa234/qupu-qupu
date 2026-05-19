// src/components/HomeDemoQuiz.tsx
//
// Plan 5b: anonymous demo quiz on the landing page. Picks a featured
// video, embeds it, and lets a parent slide a score WITHOUT signing up.
// On submit, the score is stashed in localStorage via savePendingScore
// and an AuthModal opens. After registration, the existing pending-score
// replay in VideoDetail kicks in and the score gets saved against the
// new child.
//
// Hidden for authenticated users — they have the dashboard.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { savePendingScore } from '../lib/pendingScore'
import { trackEvent } from '../lib/analytics'
import { useAuthStore } from '../store/authStore'
import AuthModal from './AuthModal'
import Slider from './Slider'
import BadgeCurve from './BadgeCurve'
import type { VideoDetail } from '../types'

export default function HomeDemoQuiz() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [score, setScore] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) return
    let cancelled = false
    async function load() {
      try {
        const list = await api.get('/public/videos', { params: { featured: 'true' } })
        const featured = (list.data?.data?.videos ?? []) as Array<{ slug: string }>
        const first = featured[0]
        if (!first) return
        const detail = await api.get<{ data: VideoDetail }>(`/public/videos/${first.slug}`)
        if (!cancelled) setVideo(detail.data.data)
      } catch (loadError) {
        console.error('Failed to load demo video:', loadError)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  // Don't render for authenticated users or while the featured video
  // hasn't loaded yet (avoids a flash of empty section).
  if (isAuthenticated || !video || video.numberOfQuestions === null) return null

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    trackEvent('demo_quiz_submit', { slug: video.slug, correctAnswers: score })
    savePendingScore({ videoId: video.id, slug: video.slug, correctAnswers: score })
    setAuthModalOpen(true)
  }

  const handleAuthenticated = () => {
    setAuthModalOpen(false)
    // After auth the existing replay flow in VideoDetail saves the
    // pending score against the new child. Route there so the user
    // immediately sees their saved score + reward summary.
    navigate(`/videos/${video.slug}`)
  }

  const predictedBadge = (() => {
    const range = [...video.badgeRanges]
      .sort((a, b) => b.badgeCount - a.badgeCount)
      .find((r) => score >= r.minCorrect && (r.maxCorrect === null || score <= r.maxCorrect))
    return range?.badgeCount ?? 0
  })()

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
      <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
      <i className="fa-solid fa-sparkles pointer-events-none absolute right-7 top-6 text-base text-qupu-brand-yellow/80" aria-hidden="true" />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Coba dulu, daftar nanti
          </div>
          <h2 className="font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Tonton video, isi skor, lihat lencana
          </h2>
          <p className="text-sm font-medium leading-relaxed text-qupu-muted sm:text-base">
            Putar video di samping. Setelah anak selesai, geser jumlah jawaban benar dan klik
            "Coba simpan skor". Daftar gratis di sini untuk menyimpan progres-nya.
          </p>

          <div className="overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-brand-blue/15 bg-qupu-cream shadow-[4px_5px_0_0_#FFD3B1]">
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              Demo
            </div>
            <h3 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">
              Skor anak
            </h3>
            <p className="mt-1 text-xs font-medium text-qupu-muted">
              Geser jumlah jawaban benar (0 – {video.numberOfQuestions}).
            </p>
          </div>

          <Slider
            value={score}
            max={video.numberOfQuestions}
            onChange={setScore}
            ariaLabel="Jumlah jawaban benar untuk demo"
          />

          {video.subject && (
            <div
              className="rounded-[1.5rem] px-4 py-4 transition-colors"
              style={{
                backgroundColor:
                  predictedBadge > 0 ? `${video.subject.colorHex}1F` : '#FFF2DF',
              }}
            >
              {predictedBadge > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    {Array.from({ length: Math.min(predictedBadge, 4) }).map((_, idx) => (
                      <BadgeCurve key={idx} color={video.subject!.colorHex} size={36} />
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
                      Akan dapat
                    </div>
                    <div className="font-display text-base font-extrabold text-qupu-brand-blue">
                      {predictedBadge} badge {video.subject.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-qupu-muted">
                  <i className="fa-solid fa-circle-info" aria-hidden="true" />
                  Skor ini belum buka badge — coba lagi untuk skor lebih tinggi.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <i className="fa-solid fa-floppy-disk text-base text-qupu-brand-orange" aria-hidden="true" />
            </span>
            Coba simpan skor — daftar gratis
          </button>
          <p className="text-center text-[11px] font-semibold text-qupu-muted">
            Skor kamu akan tersimpan otomatis setelah daftar.
          </p>
        </form>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </section>
  )
}
