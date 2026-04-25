// src/pages/Videos.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import VideoCard from '../components/VideoCard'
import Reveal from '../components/Reveal'
import type { VideoCard as VideoCardType } from '../types'

export default function VideosPage() {
  const [search, setSearch] = useState('')
  const [videos, setVideos] = useState<VideoCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounced(search, 250)

  useEffect(() => {
    async function load() {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError('')

      try {
        const response = await api.get('/public/videos', {
          params: debouncedSearch ? { search: debouncedSearch } : {},
          signal: controller.signal,
        })
        setVideos(response.data.data.videos ?? [])
      } catch (requestError: unknown) {
        if (controller.signal.aborted) return
        console.error('Failed to load videos:', requestError)
        setError('Gagal memuat katalog video.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => abortRef.current?.abort()
  }, [debouncedSearch])

  const looksLikeYoutubeLink = useMemo(
    () => /youtube\.com|youtu\.be/i.test(search.trim()),
    [search],
  )

  return (
    <div className="space-y-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
          <i
            className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-star pointer-events-none absolute right-8 top-3 text-base text-qupu-brand-yellow/80"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-star pointer-events-none absolute right-3 bottom-6 text-sm text-qupu-brand-yellow/70"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                Katalog Video
              </div>
              <h1 className="font-display text-4xl font-extrabold text-qupu-brand-blue sm:text-5xl">
                Cari video QUPU favorit anak
              </h1>
              <p className="max-w-xl text-base font-semibold leading-relaxed text-qupu-muted">
                Ketik judul, topik, atau tempel link YouTube — kami akan cocokkan dengan video yang ada di QUPU.
              </p>

              <div className="relative">
                <i
                  className="fa-solid fa-magnifying-glass pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari judul, deskripsi, atau tempel link YouTube..."
                  className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3.5 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
                  >
                    <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
                  </button>
                )}
              </div>

              {looksLikeYoutubeLink && (
                <div className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-3 py-1.5 text-xs font-semibold text-qupu-brand-orange">
                  <i className="fa-solid fa-link text-xs" aria-hidden="true" />
                  Link YouTube terdeteksi
                </div>
              )}
            </div>

            <div className="hidden justify-center lg:flex">
              <img
                src="/hero-mascot.png"
                alt=""
                draggable={false}
                aria-hidden="true"
                className="h-auto w-full max-w-[280px] select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.2)]"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-[2rem] bg-qupu-peach/40"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Reveal delay={0.05}>
          <section className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-10 text-center shadow-[5px_6px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-magnifying-glass text-2xl" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-qupu-brand-blue">
              Video belum ditemukan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-qupu-muted">
              {looksLikeYoutubeLink
                ? 'Video dari link itu belum ada di katalog QUPU. Coba cari pakai judul atau topik.'
                : 'Coba kata kunci lain, atau hapus filter pencarian.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
              >
                <i className="fa-solid fa-rotate-left text-sm" aria-hidden="true" />
                Hapus pencarian
              </button>
            )}
          </section>
        </Reveal>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                type: 'spring',
                stiffness: 95,
                damping: 14,
                mass: 0.9,
                delay: index * 0.06,
              }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  return debounced
}
