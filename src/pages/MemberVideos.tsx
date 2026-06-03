// src/pages/MemberVideos.tsx
//
// In-shell video library for logged-in members. Lives inside <AppShell> so
// it shares the orange chrome (top stat strip + bottom tabs) with the
// dashboard. Phone-first: sticky cream header + search, subject filter chips,
// and three segments — Rekomendasi (unwatched, newest-first) / Belum (not yet
// watched) / Sudah (already watched). Cards route to /quiz/:slug.
//
// Watched status comes from GET /me/watched-video-ids (distinct score_attempts
// per child). The catalog is small, so we fetch the whole published list once
// and bucket client-side instead of paginating — bucketing by watched status
// needs the full set anyway.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getCachedPublic } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { SubjectOption, VideoCard as VideoCardType } from '../types'

type Segment = 'recommended' | 'unwatched' | 'watched'

const SEGMENTS: Array<{ key: Segment; label: string; icon: string }> = [
  { key: 'recommended', label: 'Rekomendasi', icon: 'fa-solid fa-wand-magic-sparkles' },
  { key: 'unwatched', label: 'Belum', icon: 'fa-solid fa-circle-play' },
  { key: 'watched', label: 'Sudah', icon: 'fa-solid fa-circle-check' },
]

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])
  return debounced
}

export default function MemberVideosPage() {
  const { activeChildId } = useAuthStore()
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<Segment>('recommended')
  const [subjectSlug, setSubjectSlug] = useState<string | null>(null)
  const [videos, setVideos] = useState<VideoCardType[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounced(search, 250)

  // Load the full published catalog + subject list once. Re-runs only if the
  // component remounts; search/subject/segment all filter the in-memory list.
  useEffect(() => {
    async function load() {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError('')

      try {
        const [videosRes, metaRes] = await Promise.all([
          getCachedPublic<{ data: { videos?: VideoCardType[] } }>('/public/videos', {
            params: { page: 1, pageSize: 100 },
            signal: controller.signal,
          }),
          getCachedPublic<{ data: { subjects?: SubjectOption[] } }>('/public/meta', {
            signal: controller.signal,
          }),
        ])
        const list: VideoCardType[] = videosRes.data.videos ?? []
        setVideos(list)
        setSubjects(metaRes.data.subjects ?? [])
      } catch (requestError: unknown) {
        if (controller.signal.aborted) return
        console.error('Failed to load videos:', requestError)
        setError('Gagal memuat video.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => abortRef.current?.abort()
  }, [])

  // Watched IDs depend on the active child; refetch when the child switches.
  useEffect(() => {
    if (!activeChildId) {
      setWatchedIds(new Set())
      return
    }
    let cancelled = false
    api
      .get('/me/watched-video-ids', { params: { childId: activeChildId } })
      .then((res) => {
        if (cancelled) return
        setWatchedIds(new Set<string>(res.data.data.videoIds ?? []))
      })
      .catch(() => {
        // Watched lookup failure must not break the library — just show all as
        // unwatched and let the recommendation segment carry the page.
        if (!cancelled) setWatchedIds(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [activeChildId])

  // Only subjects that actually have at least one published video get a chip.
  const subjectsWithVideos = useMemo(() => {
    const present = new Set(videos.map((v) => v.subject?.slug).filter(Boolean) as string[])
    return subjects.filter((s) => s.slug && present.has(s.slug))
  }, [subjects, videos])

  // Apply search + subject filters, then split by watched status. The
  // recommended segment is unwatched videos surfaced newest-first.
  const { recommended, unwatched, watched } = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    const base = videos.filter((video) => {
      if (subjectSlug && video.subject?.slug !== subjectSlug) return false
      if (term && !video.title.toLowerCase().includes(term)) return false
      return true
    })

    const watchedList = base.filter((v) => watchedIds.has(v.id))
    const unwatchedList = base.filter((v) => !watchedIds.has(v.id))
    const recommendedList = [...unwatchedList].sort((a, b) => {
      const aDate = a.publishedAt ?? ''
      const bDate = b.publishedAt ?? ''
      return bDate.localeCompare(aDate)
    })

    return {
      recommended: recommendedList,
      unwatched: unwatchedList,
      watched: watchedList,
    }
  }, [videos, watchedIds, subjectSlug, debouncedSearch])

  const segmentVideos =
    segment === 'recommended' ? recommended : segment === 'watched' ? watched : unwatched

  const counts: Record<Segment, number> = {
    recommended: recommended.length,
    unwatched: unwatched.length,
    watched: watched.length,
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-8">
      {/* Title is intentionally NOT sticky — it scrolls away under the top stat
          strip instead of colliding with it. Only the filter bar below pins. */}
      <div className="flex items-start justify-between gap-3 px-1 pt-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qupu-brand-orange">
            Tonton &amp; belajar
          </p>
          <h1 className="font-display text-2xl font-black leading-none text-qupu-brand-blue">
            Video QUPU
          </h1>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-[11px] font-black text-white">
          <i className="fa-solid fa-clapperboard" aria-hidden="true" /> {videos.length}
        </span>
      </div>

      <section className="sticky top-12 z-20 -mx-2 rounded-[1.75rem] bg-[#FFF8F0] px-4 pb-4 pt-4 shadow-[0_5px_0_0_rgba(196,97,35,0.28)] lg:top-0">
        <div className="relative">
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-qupu-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul video..."
            aria-label="Cari video"
            className="w-full rounded-full border-2 border-qupu-peach bg-white px-11 py-2.5 text-sm font-semibold text-qupu-ink outline-none transition-colors placeholder:font-medium placeholder:text-qupu-muted/60 focus:border-qupu-brand-orange"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-qupu-cream p-1.5 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
            >
              <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Segment switcher: Rekomendasi / Belum / Sudah */}
        <div
          role="tablist"
          aria-label="Pilih tampilan video"
          className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-qupu-cream p-1"
        >
          {SEGMENTS.map((seg) => (
            <button
              key={seg.key}
              type="button"
              role="tab"
              aria-selected={segment === seg.key}
              onClick={() => setSegment(seg.key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 font-display text-xs font-black transition-colors ${
                segment === seg.key
                  ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                  : 'text-qupu-brand-blue/60 hover:text-qupu-brand-blue'
              }`}
            >
              <i className={`${seg.icon} text-[11px]`} aria-hidden="true" />
              <span>{seg.label}</span>
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  segment === seg.key ? 'bg-white/20 text-white' : 'bg-white text-qupu-brand-blue/70'
                }`}
              >
                {counts[seg.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Subject filter chips */}
        {subjectsWithVideos.length > 0 && (
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip
              label="Semua"
              active={subjectSlug === null}
              onClick={() => setSubjectSlug(null)}
            />
            {subjectsWithVideos.map((subject) => (
              <FilterChip
                key={subject.id}
                label={subject.name}
                color={subject.colorHex}
                active={subjectSlug === subject.slug}
                onClick={() => setSubjectSlug(subject.slug ?? null)}
              />
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[16/10] animate-pulse rounded-[1.5rem] bg-qupu-peach/40"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : segmentVideos.length === 0 ? (
        <EmptyState segment={segment} hasFilter={subjectSlug !== null || search.trim() !== ''} />
      ) : (
        <div className="flex flex-col gap-3">
          {segmentVideos.map((video) => (
            <MemberVideoCard
              key={video.id}
              video={video}
              watched={watchedIds.has(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-xs font-black transition-colors ${
        active
          ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white'
          : 'border-qupu-peach bg-white text-qupu-brand-blue/70 hover:border-qupu-brand-orange'
      }`}
    >
      {color && (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active ? '#FFFFFF' : color }}
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  )
}

function EmptyState({ segment, hasFilter }: { segment: Segment; hasFilter: boolean }) {
  const copy: Record<Segment, { title: string; sub: string; icon: string }> = {
    recommended: {
      title: hasFilter ? 'Tidak ada rekomendasi' : 'Semua sudah ditonton!',
      sub: hasFilter
        ? 'Coba ubah filter atau hapus pencarian.'
        : 'Hebat! Kamu sudah menonton semua video. Cek lagi nanti untuk yang baru.',
      icon: 'fa-solid fa-wand-magic-sparkles',
    },
    unwatched: {
      title: hasFilter ? 'Tidak ada video' : 'Tidak ada yang baru',
      sub: hasFilter
        ? 'Coba kata kunci atau subject lain.'
        : 'Kamu sudah menonton semua video di sini.',
      icon: 'fa-solid fa-circle-play',
    },
    watched: {
      title: 'Belum ada yang ditonton',
      sub: hasFilter
        ? 'Coba ubah filter atau hapus pencarian.'
        : 'Mulai dari tab Rekomendasi untuk menonton video pertamamu!',
      icon: 'fa-solid fa-circle-check',
    },
  }
  const { title, sub, icon } = copy[segment]
  return (
    <section className="rounded-[1.5rem] bg-[#FFF8F0] p-8 text-center shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
        <i className={`${icon} text-xl`} aria-hidden="true" />
      </div>
      <h2 className="mt-3 font-display text-lg font-black text-qupu-brand-blue">{title}</h2>
      <p className="mx-auto mt-1 max-w-xs text-xs font-semibold text-qupu-muted">{sub}</p>
    </section>
  )
}

function MemberVideoCard({ video, watched }: { video: VideoCardType; watched: boolean }) {
  const [thumbBroken, setThumbBroken] = useState(false)
  const subjectColor = video.subject?.colorHex ?? '#30598A'
  const subjectName = video.subject?.name ?? 'Video'
  const showFallback = thumbBroken || !video.thumbnailUrl
  return (
    <Link
      to={`/quiz/${video.slug}`}
      className="group block overflow-hidden rounded-[1.5rem] bg-white shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1]"
    >
      <div className="relative aspect-video overflow-hidden bg-qupu-cream">
        {showFallback ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${subjectColor}26, #FFF2DF)` }}
          >
            <i
              className="fa-solid fa-clapperboard text-4xl"
              style={{ color: subjectColor }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setThumbBroken(true)}
            onLoad={(event) => {
              // YouTube returns a 120×90 grey placeholder (HTTP 200) when a
              // thumbnail size is missing — treat that as broken.
              if (event.currentTarget.naturalWidth > 0 && event.currentTarget.naturalWidth <= 120) {
                setThumbBroken(true)
              }
            }}
          />
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-sm"
          style={{ backgroundColor: subjectColor }}
        >
          {subjectName}
        </span>
        {watched ? (
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#58A700] text-white shadow-[0_3px_0_0_#3F7A00]">
            <i className="fa-solid fa-check text-sm" aria-hidden="true" />
          </span>
        ) : (
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-qupu-brand-orange text-white shadow-[0_3px_0_0_#B8541A]">
            <i className="fa-solid fa-play text-sm" aria-hidden="true" />
          </span>
        )}
        {watched && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-[#58A700] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
            <i className="fa-solid fa-check text-[8px]" aria-hidden="true" /> Sudah
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 font-display text-base font-black leading-tight text-qupu-brand-blue">
          {video.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-qupu-muted">
          {video.numberOfQuestions != null && (
            <span className="inline-flex items-center gap-1">
              <i className="fa-solid fa-circle-question text-qupu-brand-orange" aria-hidden="true" />
              {video.numberOfQuestions} soal
            </span>
          )}
          {video.ageGroup && (
            <>
              <span className="text-qupu-muted/40">•</span>
              <span>{video.ageGroup.name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
