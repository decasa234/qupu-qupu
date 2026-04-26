import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import api from '../lib/api'
import { cn } from '../lib/utils'
import Reveal from '../components/Reveal'
import type { VideoCard as VideoCardType } from '../types'

const FEATURES = [
  {
    title: 'Quiz Baru Setiap Hari',
    desc: 'Konten quiz terbaru setiap hari untuk anak yang aktif dan ingin tahu lebih banyak!',
    image: '/feature-quiz.png',
  },
  {
    title: 'Belajar Sambil Bermain',
    desc: 'Belajar jadi lebih seru dengan game, gambar, dan animasi yang menyenangkan!',
    image: '/feature-bermain.png',
  },
  {
    title: 'Konten Ramah Anak',
    desc: 'Aman, positif, dan dirancang khusus untuk perkembangan anak.',
    image: '/feature-ramah.png',
  },
  {
    title: 'Cocok untuk Usia 5-12',
    desc: 'Konten sesuai dengan tahap belajar dan rasa ingin tahu anak.',
    image: '/feature-usia.png',
  },
]

interface CategoryItem {
  title: string
  image: string
  gradient: string
}

const CATEGORIES: CategoryItem[] = [
  {
    title: 'Matematika Dasar',
    image: '/category-matematika.png',
    gradient: 'from-orange-100 to-orange-200',
  },
  {
    title: 'Literasi',
    image: '/category-literasi.png',
    gradient: 'from-amber-100 to-orange-200',
  },
  {
    title: 'Tebak Gambar',
    image: '/category-tebak-gambar.png',
    gradient: 'from-rose-100 to-orange-200',
  },
  {
    title: 'Odd One Out',
    image: '/category-odd-one-out.png',
    gradient: 'from-violet-100 to-pink-200',
  },
  {
    title: 'Pengetahuan Umum',
    image: '/category-pengetahuan.png',
    gradient: 'from-sky-100 to-orange-200',
  },
]

export default function Home() {
  const [videos, setVideos] = useState<VideoCardType[]>([])

  useEffect(() => {
    async function load() {
      try {
        const featured = await api.get('/public/videos', { params: { featured: 'true' } })
        const featuredList: VideoCardType[] = featured.data.data.videos ?? []

        if (featuredList.length >= 5) {
          setVideos(featuredList.slice(0, 5))
          return
        }

        const response = await api.get('/public/videos')
        const all: VideoCardType[] = response.data.data.videos ?? []
        setVideos(all.slice(0, 5))
      } catch (error) {
        console.error('Failed to load home videos:', error)
      }
    }

    void load()
  }, [])

  return (
    <div className="space-y-10 sm:space-y-14">
      <HeroSection />
      <Reveal delay={0.05}>
        <FeaturesSection />
      </Reveal>
      <Reveal delay={0.1}>
        <CategoriesSection />
      </Reveal>
      <Reveal delay={0.05}>
        <VideosSection videos={videos} />
      </Reveal>
      <Reveal delay={0.05}>
        <StatsBannerSection />
      </Reveal>
      <Reveal delay={0.05}>
        <SubscribeCtaSection />
      </Reveal>
    </div>
  )
}

/* ==================== HERO ==================== */

function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-36 flex w-screen items-center overflow-hidden bg-gradient-to-b from-[#F4A85D] via-[#FAC07A] to-[#FDE3C1] pb-20 pt-40 sm:pb-24 sm:pt-44 lg:pb-28 lg:pt-48"
    >
      <HeroRays />
      <HeroRaysHorizontal />
      <HeroBackdrop />
      <HeroBlueBackdrop />

      {/* <HeroDecor /> */}
      <HeroCloudCurve />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[2fr_3fr] lg:gap-6 lg:px-8">
        <div className="space-y-6 lg:pl-8 xl:pl-16">
          <h1 className="font-display text-6xl font-extrabold !leading-none sm:text-7xl lg:text-7xl">
            <span className="block whitespace-nowrap text-qupu-brand-blue">Belajar Seru</span>
            <span className="block whitespace-nowrap text-qupu-orange">Bareng QUPU!</span>
          </h1>
          <p className="max-w-sm text-sm font-semibold leading-relaxed text-qupu-brand-blue-shadow /85 sm:text-base">
            Channel YouTube edukatif untuk anak usia 5-12 tahun. Quiz seru, pengetahuan umum,
            matematika, literasi, dan game menyenangkan setiap hari!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/videos"
              className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <i className="fa-brands fa-youtube text-base text-red-600" aria-hidden="true" />
              </span>
              Tonton Sekarang
            </Link>
            <a
              href="#kategori"
              className="inline-flex cursor-pointer items-center gap-3 rounded-full border-[3px] border-qupu-orange bg-transparent px-6 py-[10px] font-display text-base font-extrabold text-qupu-orange transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-orange hover:text-white"
            >
            <i className="fa-solid fa-layer-group text-base" aria-hidden="true" />
              Lihat Kategori
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] lg:-my-20 lg:max-w-none xl:-my-24">
          <img
            src="/hero-mascot.png"
            alt="QUPU mascot dengan tumpukan buku"
            draggable={false}
            className="relative z-10 h-auto w-full select-none drop-shadow-[0_20px_40px_rgba(120,60,0,0.25)] lg:scale-110 xl:scale-[1.18]"
          />
        </div>
      </div>
    </section>
  )
}

function HeroRays() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-soft-light"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hero-rays" width="24" height="100%" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="3" height="100%" fill="#FFFFFF" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-rays)" />
    </svg>
  )
}

function HeroRaysHorizontal() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-soft-light"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hero-rays-horizontal" width="100%" height="24" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="100%" height="3" fill="#FFFFFF" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-rays-horizontal)" />
    </svg>
  )
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none pt-10 absolute inset-x-0 top-0 bottom-16 hidden justify-center px-4 sm:px-6 lg:flex lg:px-8">
      <svg
        className="h-full w-full max-w-[1360px]"
        viewBox="0 0 11274 6296"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="#ffecbd"
          fillOpacity="0.7"
          d="M781.992 5545.46C232.393 4881.46 -410.01 2940.68 344.999 1632.96C645.424 1112.61 907 630.964 2095 258.965C3449.99 -165.328 7459 43.9644 8396.5 115.464C9334 186.964 11610 380.465 11230.5 2054.96C10978.3 3167.56 11281.5 4014.61 11230.5 4778.46C11166 5744.46 9674.1 6326.71 8769 6112.97C7911.49 5910.46 6607.17 6263.46 5662.5 6263.46C4754.99 6263.46 4880.83 6335.42 3465.5 6263.46C2157.5 6196.96 1371.66 6188.63 781.992 5545.46Z"
        />
      </svg>
    </div>
  )
}

function HeroBlueBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 hidden h-[120%] w-[45%] lg:block"
      viewBox="0 0 13858 10582"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="#30598A"
        fillOpacity="0.95"
        d="M1621.01 7401.5C-203.486 7975.5 -476.981 8393.5 748.016 8770C1973.01 9146.5 13856.5 10581 13856.5 10581V0.5H13770H7204.02C6405.52 721.5 9094.71 530.3 8823.51 1697.5C8484.51 3156.5 5340.52 3576.99 5340.52 5424.5C5340.52 7199.5 2678.65 7068.76 1621.01 7401.5Z"
      />
    </svg>
  )
}

function HeroCloudCurve() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,90 Q150,40 300,70 T600,60 T900,80 T1200,70 L1200,160 L0,160 Z"
        fill="#FFF2DF"
        opacity="1"
      />
    </svg>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroDecor() {
  return (
    <>
      {/* <Sparkles className="pointer-events-none absolute left-12 top-10 h-5 w-5 text-white/70" /> */}
      {/* <Sparkles className="pointer-events-none absolute left-1/3 top-24 h-4 w-4 text-white/60" /> */}
      {/* <Star className="pointer-events-none absolute right-[28%] top-10 h-10 w-10 fill-amber-300 text-amber-400 drop-shadow" /> */}
      {/* <Sparkles className="pointer-events-none absolute right-[38%] top-28 h-6 w-6 text-white" /> */}
      {/* <Sparkles className="pointer-events-none absolute right-10 bottom-32 h-7 w-7 text-qupu-orange" /> */}
      {/* <Star className="pointer-events-none absolute right-20 top-1/3 h-4 w-4 fill-amber-300 text-amber-300" /> */}
      {/* <Sparkles className="pointer-events-none absolute left-[45%] bottom-24 h-5 w-5 text-qupu-purple" /> */}

      <svg
        className="pointer-events-none absolute right-4 top-24 h-14 w-20 text-white/70"
        viewBox="0 0 80 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4,24 Q14,8 24,24 T44,24 T64,20" />
      </svg>

      <svg
        className="pointer-events-none absolute right-10 bottom-28 h-12 w-16 text-qupu-orange/55"
        viewBox="0 0 64 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4,28 Q14,14 24,28 T44,28 T60,24" />
      </svg>

      <svg
        className="pointer-events-none absolute left-[48%] top-12 h-10 w-10 text-white/55"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4,20 Q12,8 20,20 T36,20" />
      </svg>
    </>
  )
}

/* ==================== FEATURES ==================== */

function FeaturesSection() {
  return (
    <section className="relative z-10 grid gap-5 !mt-[-4rem] sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </section>
  )
}

function FeatureCard({
  title,
  desc,
  image,
}: {
  title: string
  desc: string
  image: string
}) {
  return (
    <div className="group relative rounded-[1.75rem] bg-qupu-brand-blue py-5 pr-2 pl-1 shadow-[6px_8px_0_0_#FFD3B1] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative z-10 flex items-start gap-2">
        <div className="relative -ml-3 -mt-4 h-32 w-32 flex-shrink-0 sm:-ml-4 sm:-mt-5 sm:h-36 sm:w-36 lg:h-40 lg:w-40">
          <img
            src={image}
            alt=""
            draggable={false}
            className="relative h-full w-full select-none object-contain drop-shadow-md"
          />
        </div>
        <div className="flex-1 space-y-2 pt-2">
          <h3 className="font-display text-base font-extrabold !leading-tight text-qupu-brand-yellow sm:text-lg">
            {title}
          </h3>
          <p className="text-xs font-medium leading-tight text-white/90">{desc}</p>
        </div>
      </div>
    </div>
  )
}

/* ==================== CATEGORIES ==================== */

function CategoriesSection() {
  return (
    <section id="kategori" className="space-y-6">
      <div>
        <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
          Kategori Seru QUPU
        </h2>
        <p className="mt-2 text-base font-semibold text-qupu-muted">
          Pilih topik favoritmu dan mulai belajar sambil bermain!
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.title} item={cat} />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({ item }: { item: CategoryItem }) {
  return (
    <button
      type="button"
      className={cn(
        'group relative flex w-[220px] shrink-0 snap-start cursor-pointer flex-col items-stretch overflow-hidden rounded-[1.75rem] border-[3px] border-dashed border-qupu-brand-orange/70 bg-gradient-to-br pt-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-qupu-brand-orange lg:w-auto',
        item.gradient,
      )}
    >
      <h3 className="px-4 text-center font-display text-lg font-extrabold leading-tight text-qupu-brand-blue">
        {item.title}
      </h3>
      <img
        src={item.image}
        alt=""
        draggable={false}
        className="mt-auto block aspect-square w-full select-none object-contain object-bottom"
      />
    </button>
  )
}

/* ==================== VIDEOS ==================== */

function VideosSection({ videos }: { videos: VideoCardType[] }) {
  const cards =
    videos.length === 0
      ? Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="aspect-video w-[220px] shrink-0 animate-pulse rounded-2xl bg-qupu-peach/40 lg:w-auto"
          />
        ))
      : videos.map((video) => <LandingVideoCard key={video.id} video={video} />)

  return (
    <section id="video" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
        <i className="fa-brands fa-youtube text-5xl text-qupu-brand-blue" aria-hidden="true" />
          Video Terbaru dari QUPU
        </h2>
        <Link
          to="/videos"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-transparent px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-brand-blue hover:text-white"
        >
          Lihat Semua Video
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {cards}
      </div>
    </section>
  )
}

function LandingVideoCard({ video }: { video: VideoCardType }) {
  const date = video.publishedAt
    ? formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true, locale: idLocale })
    : ''

  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group block w-[220px] shrink-0 snap-start cursor-pointer space-y-2.5 lg:w-auto"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl border-[3px] border-qupu-brand-blue/15 bg-qupu-cream shadow-[4px_5px_0_0_#FFD3B1] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-qupu-brand-orange">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
          style={{ backgroundColor: video.subject.colorHex }}
        >
          {video.subject.name}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-orange shadow-clay-orange">
            <i className="fa-solid fa-play text-base text-white" aria-hidden="true" />
          </div>
        </div>
      </div>
      <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-qupu-brand-blue group-hover:text-qupu-brand-orange">
        {video.title}
      </h3>
      <p className="flex items-center gap-2 text-xs">
        <span className="font-semibold" style={{ color: video.subject.colorHex }}>
          {video.subject.name}
        </span>
        {date && (
          <>
            <span className="text-qupu-muted/60">•</span>
            <span className="font-medium text-qupu-muted">{date}</span>
          </>
        )}
      </p>
    </Link>
  )
}

/* ==================== STATS BANNER ==================== */

function StatsBannerSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange px-6 py-10 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-12 lg:px-7 lg:py-7">
      <StatsRays />
      <StatsRaysHorizontal />
      <StatsStars />

      <div className="relative grid items-center gap-6 lg:grid-cols-[0.7fr_2.6fr_0.7fr] lg:gap-4">
        <div className="hidden justify-center lg:flex">
          <img
            src="/achievement-left.png"
            alt=""
            draggable={false}
            className="h-auto w-full max-w-[220px] select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            iconClass="fa-brands fa-youtube"
            iconColor="text-red-600"
            title="100+"
            subtitle="Video Edukatif"
            desc="Konten berkualitas untuk anak-anak setiap minggu!"
          />
          <StatCard
            iconClass="fa-solid fa-calendar-days"
            iconColor="text-qupu-brand-orange"
            title="Belajar Seru"
            subtitle="Setiap Hari"
            desc="Upload rutin setiap hari biar makin pintar!"
          />
          <StatCard
            iconClass="fa-brands fa-youtube"
            iconColor="text-red-600"
            title="Channel"
            subtitle="YouTube Anak"
            desc="Ribuan anak sudah belajar bersama QUPU!"
          />
        </div>

        <div className="hidden justify-center lg:flex">
          <img
            src="/achievement-right.png"
            alt=""
            draggable={false}
            className="h-auto w-full max-w-[220px] select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)]"
          />
        </div>
      </div>
    </section>
  )
}

function StatsRays() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-soft-light"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="stats-rays" width="24" height="100%" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="3" height="100%" fill="#FFFFFF" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stats-rays)" />
    </svg>
  )
}

function StatsRaysHorizontal() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-soft-light"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="stats-rays-horizontal" width="100%" height="24" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="100%" height="3" fill="#FFFFFF" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stats-rays-horizontal)" />
    </svg>
  )
}

function StatsStars() {
  return (
    <>
      <i
        className="fa-solid fa-star pointer-events-none absolute left-6 top-6 text-2xl text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute right-12 top-10 text-lg text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute left-1/3 top-4 text-base text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute bottom-6 left-12 text-xl text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute bottom-10 right-1/3 text-sm text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute bottom-12 right-10 text-2xl text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
    </>
  )
}

function StatCard({
  iconClass,
  iconColor,
  title,
  subtitle,
  desc,
}: {
  iconClass: string
  iconColor: string
  title: string
  subtitle: string
  desc: string
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.18)]">
      <div className="mb-3 flex items-center gap-4">
        <i className={cn(iconClass, 'text-5xl', iconColor)} aria-hidden="true" />
        <div className="font-display font-extrabold leading-tight text-qupu-brand-blue">
          <div className="text-xl">{title}</div>
          <div className="text-base text-qupu-brand-orange">{subtitle}</div>
        </div>
      </div>
      <p className="text-sm font-semibold leading-relaxed text-qupu-muted">{desc}</p>
    </div>
  )
}

/* ==================== SUBSCRIBE CTA ==================== */

function SubscribeCtaSection() {
  return (
    <section className="relative rounded-[2rem] bg-qupu-brand-blue !px-4 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-10">
      <SubscribeStars />

      <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <img
            src="/subs-mascot.png"
            alt=""
            draggable={false}
            className="hidden h-auto w-64 shrink-0 self-end select-none drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)] lg:-mb-10 lg:-mt-24 lg:block xl:-mb-10 xl:-mt-32 xl:w-72"
          />
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Yuk, Subscribe QUPU di{' '}
              <span className="text-qupu-brand-orange">YouTube!</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-white/85 sm:text-base">
              Dukung kami untuk terus membuat konten edukatif yang seru, aman, dan bermanfaat
              untuk anak-anak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.youtube.com/@qupuid?sub_confirmation=1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <i className="fa-brands fa-youtube text-base text-red-600" aria-hidden="true" />
            </span>
            Subscribe Sekarang
          </a>
          <button
            type="button"
            aria-label="Notifikasi"
            className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-white/40 text-white transition-colors hover:border-qupu-brand-yellow hover:bg-white/10"
          >
            <i
              className="fa-solid fa-bell origin-top text-base transition-colors group-hover:animate-ring group-hover:text-qupu-brand-yellow"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

function SubscribeStars() {
  return (
    <>
      <i
        className="fa-solid fa-star pointer-events-none absolute left-6 top-6 text-base text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute left-1/3 top-4 text-xs text-qupu-brand-yellow/80"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute right-1/4 top-8 text-sm text-qupu-brand-yellow/70"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute bottom-6 left-12 text-xs text-qupu-brand-yellow/70"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute bottom-8 right-1/2 text-sm text-qupu-brand-yellow/60"
        aria-hidden="true"
      />
      <i
        className="fa-solid fa-star pointer-events-none absolute right-10 top-6 text-xl text-qupu-brand-yellow drop-shadow-sm"
        aria-hidden="true"
      />
    </>
  )
}
