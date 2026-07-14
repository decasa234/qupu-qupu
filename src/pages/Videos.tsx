// src/pages/Videos.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCachedPublic } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import VideoCard from '../components/VideoCard'
import Reveal from '../components/Reveal'
import { useAuthStore } from '../store/authStore'
import type { VideoCard as VideoCardType } from '../types'

const PAGE_SIZE = 12

export default function VideosPage() {
  const { isAuthenticated } = useAuthStore()
  const [search, setSearch] = useState('')
  const [videos, setVideos] = useState<VideoCardType[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounced(search, 250)

  useEffect(() => {
    trackEvent('page_view')
  }, [])

  // Reset to page 1 whenever the search term changes — the previous page may
  // not exist in the new result set.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    async function load() {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError('')

      try {
        const response = await getCachedPublic<{
          data: { videos?: VideoCardType[]; pageCount?: number; total?: number }
        }>('/public/videos', {
          params: {
            page,
            pageSize: PAGE_SIZE,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          },
          signal: controller.signal,
        })
        const data = response.data
        setVideos(data.videos ?? [])
        setPageCount(Math.max(1, Number(data.pageCount ?? 1)))
        setTotal(Number(data.total ?? data.videos?.length ?? 0))
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
  }, [debouncedSearch, page])

  function changePage(target: number) {
    if (target < 1 || target > pageCount || target === page || loading) return
    setPage(target)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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
                Cari video QUPU favoritmu!
              </h1>
              <p className="max-w-xl text-base font-semibold leading-relaxed text-qupu-muted">
                Ketik judul, topik, atau tempel link YouTube — QUPU akan menyajikan videonya buat kamu.
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
                  aria-label="Cari video"
                  className="peer w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3.5 text-qupu-ink outline-none transition-colors placeholder:text-sm placeholder:text-transparent focus:border-qupu-brand-orange sm:placeholder:text-base sm:placeholder:text-qupu-muted/60"
                />
                {!search && (
                  <span className="pointer-events-none absolute left-12 right-12 top-1/2 -translate-y-1/2 truncate text-sm font-medium text-qupu-muted/60 peer-focus:hidden sm:hidden">
                    Cari video atau tempel link...
                  </span>
                )}
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

              <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border-[2px] border-dashed border-qupu-brand-blue/30 bg-qupu-cream/70 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-qupu-brand-orange text-white shadow-sm">
                  <i className="fa-solid fa-trophy text-sm" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-[11.25rem]">
                  <div className="font-display text-sm font-extrabold text-qupu-brand-blue">
                    Tonton + isi skor = badge anak
                  </div>
                  <p className="text-xs font-semibold text-qupu-muted">
                    {isAuthenticated
                      ? 'Lihat progres dan koleksi badge anak di dashboard.'
                      : 'Daftar gratis untuk simpan skor dan kumpulkan badge.'}
                  </p>
                </div>
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-gauge text-sm" aria-hidden="true" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-user-plus text-sm" aria-hidden="true" />
                    Daftar Gratis
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden justify-center lg:flex lg:-my-6 xl:-my-10">
              <img loading="lazy" decoding="async"
                src="/hero-mascot.png"
                alt=""
                draggable={false}
                aria-hidden="true"
                className="h-auto w-full max-w-[27.5rem] select-none drop-shadow-[0_14px_30px_rgba(120,60,0,0.22)] lg:scale-110 xl:scale-125"
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
        <>
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

          {pageCount > 1 && (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border-2 border-qupu-peach bg-white px-5 py-3 text-sm shadow-[4px_5px_0_0_#FFD3B1]"
              aria-label="Navigasi halaman"
            >
              <div className="font-semibold text-qupu-muted">
                Halaman <span className="text-qupu-brand-blue">{page}</span> dari {pageCount}
                <span className="ml-2 text-xs text-qupu-muted/70">· {total} video</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => changePage(page - 1)}
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-qupu-brand-blue"
                >
                  <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount || loading}
                  onClick={() => changePage(page + 1)}
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-qupu-brand-orange px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-colors hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </>
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
