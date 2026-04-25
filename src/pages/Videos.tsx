import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Sparkles, X } from 'lucide-react'
import api from '../lib/api'
import VideoCard from '../components/VideoCard'
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
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Katalog video</div>
          <h1 className="font-display text-4xl font-bold text-qupu-purple sm:text-5xl">
            Cari video QUPU favorit anak
          </h1>
          <p className="max-w-2xl text-base text-qupu-muted">
            Ketik judul, topik, atau tempel link YouTube — kami akan cocokkan dengan video yang ada di QUPU.
          </p>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-qupu-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul, deskripsi, atau tempel link YouTube..."
            className="w-full rounded-full border border-qupu-peach bg-qupu-shell px-14 py-4 text-qupu-ink outline-none transition-colors focus:border-qupu-orange"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Hapus pencarian"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {looksLikeYoutubeLink && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-qupu-muted">
            <Sparkles className="h-4 w-4 text-qupu-orange" />
            Link YouTube terdeteksi — mencari video yang cocok di katalog.
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-qupu-cream" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <section className="rounded-[2rem] border border-qupu-peach bg-white p-10 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-orange">
            <Search className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-qupu-purple">Video belum ditemukan</h2>
          <p className="mt-2 text-sm text-qupu-muted">
            {looksLikeYoutubeLink
              ? 'Video dari link itu belum ada di katalog QUPU. Coba cari pakai judul atau topik.'
              : 'Coba kata kunci lain, atau hapus filter pencarian.'}
          </p>
        </section>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
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
