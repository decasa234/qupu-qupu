import { Link } from 'react-router-dom'
import Reveal from '@/components/Reveal'
import WmiConceptDemo from '@/components/wmi/marketing/WmiConceptDemo'
import WmiTrustStats from '@/components/wmi/marketing/WmiTrustStats'
import WmiTestimonials from '@/components/wmi/marketing/WmiTestimonials'
import { TESTIMONIALS } from '@/data/wmiMarketing'

const LEARN_STEPS = [
  {
    icon: 'fa-solid fa-lightbulb',
    bg: 'bg-qupu-brand-yellow',
    title: 'Konsep',
    desc: 'Pelajari satu konsep WMI lewat animasi langkah demi langkah.',
  },
  {
    icon: 'fa-solid fa-dumbbell',
    bg: 'bg-qupu-brand-blue',
    title: 'Drill',
    desc: 'Latihan soal asli, sebanyak yang anak mau — sambil kumpulkan XP.',
  },
  {
    icon: 'fa-solid fa-trophy',
    bg: 'bg-qupu-brand-orange',
    title: 'Ujian',
    desc: 'Coba paket ujian WMI sungguhan dan raih badge.',
  },
]

const WHY = [
  { icon: 'fa-solid fa-earth-asia', text: 'WMI (World Mathematics Invitation) adalah kompetisi matematika internasional untuk anak.' },
  { icon: 'fa-solid fa-brain', text: 'Melatih nalar & pemecahan masalah — bukan menghafal rumus.' },
  { icon: 'fa-solid fa-child-reaching', text: 'Dirancang untuk anak Kelas 1–3, dengan bahasa & visual yang ramah anak.' },
]

const FEATURES = [
  {
    icon: 'fa-solid fa-wand-magic-sparkles',
    title: 'Penjelasan beranimasi',
    desc: 'Setiap soal punya animasi penyelesaian langkah demi langkah — anak melihat caranya, bukan cuma jawabannya.',
  },
  {
    icon: 'fa-solid fa-highlighter',
    title: 'Assisted highlight',
    desc: 'Bagian penting soal disorot otomatis, membantu anak fokus pada inti masalah.',
  },
  {
    icon: 'fa-solid fa-list-ol',
    title: 'Hint bertahap',
    desc: 'Petunjuk muncul selangkah demi selangkah saat anak butuh — tanpa langsung membocorkan jawaban.',
  },
  {
    icon: 'fa-solid fa-trophy',
    title: 'XP & Achievement',
    desc: 'Kumpulkan XP dan buka achievement — belajar jadi seru untuk dapatkan rewards.',
  },
]

/** A scatter of brand-yellow star sprinkles for emphasis surfaces. */
function Sprinkles() {
  return (
    <>
      <i className="fa-solid fa-star pointer-events-none absolute left-8 top-9 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-1/4 top-7 text-xs text-qupu-brand-yellow/60" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute left-1/3 bottom-10 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-10 bottom-14 text-lg text-qupu-brand-yellow/70" aria-hidden="true" />
    </>
  )
}

export default function LatihanWmiPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1 · Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFF6E5] via-[#FFE8C9] to-[#FFD8A8] px-6 py-14 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-20">
        <Sprinkles />
        <img
          src="/hero-mascot.png"
          alt=""
          draggable={false}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 -right-3 hidden h-44 w-auto select-none drop-shadow-[0_14px_30px_rgba(120,60,0,0.22)] lg:block"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-brand-orange shadow-sm">
            <i className="fa-solid fa-medal" aria-hidden="true" />
            Latihan WMI
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight text-qupu-brand-blue sm:text-5xl lg:text-[3.25rem]">
            Olimpiade matematika,{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-qupu-brand-orange">dimainkan seperti game</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-full bg-qupu-brand-yellow/70" aria-hidden="true" />
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-relaxed text-qupu-brand-blue/80 sm:text-base">
            Anak belajar konsep olimpiade matematika WMI lewat animasi seru — paham caranya, bukan sekadar hafal.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <i className="fa-solid fa-user-plus text-qupu-brand-orange" aria-hidden="true" />
              </span>
              Daftar Gratis
            </Link>
            <a
              href="#demo"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white/80 px-6 py-[10px] font-display text-base font-extrabold text-qupu-brand-blue transition-all duration-150 hover:-translate-y-0.5 hover:bg-qupu-brand-blue hover:text-white"
            >
              <i className="fa-solid fa-play" aria-hidden="true" />
              Main Demo
            </a>
          </div>
        </div>
      </section>

      {/* 2 · Live demo */}
      <Reveal delay={0.05}>
        <section id="demo" className="scroll-mt-24 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Coba Langsung</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Mainkan satu konsep sekarang
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm font-semibold text-qupu-muted">
            Tanpa daftar — lihat sendiri serunya belajar WMI.
          </p>
          <div className="mt-7">
            <WmiConceptDemo />
          </div>
        </section>
      </Reveal>

      {/* 3 · Fitur unggulan */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-5xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Bukan sekadar latihan soal</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Dibimbing sampai paham</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-qupu-muted">
            Fitur yang menuntun anak mengerti caranya — seperti animasi yang kamu lihat di demo di atas.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[1.75rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 text-left shadow-[5px_6px_0_0_#FFD3B1] transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-qupu-cream text-xl text-qupu-brand-orange">
                  <i className={f.icon} aria-hidden="true" />
                </span>
                <div className="mt-3 font-display text-base font-extrabold text-qupu-brand-blue">{f.title}</div>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-qupu-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4 · Apa itu WMI? */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-4xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Kenapa WMI</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Apa itu WMI?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.text}
                className="rounded-[1.75rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1] transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-qupu-cream text-2xl text-qupu-brand-orange">
                  <i className={w.icon} aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{w.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4 · Cara belajarnya */}
      <Reveal delay={0.05}>
        <section className="relative overflow-hidden rounded-[2.5rem] bg-qupu-cream px-6 py-12 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Perjalanan Belajar</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Cara belajarnya</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-qupu-muted">
            Tiga langkah seru — semuanya pakai XP, badge, dan confetti.
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {LEARN_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-[1.75rem] border-[3px] border-white bg-white p-6 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.10)] transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
                  Langkah {i + 1}
                </span>
                <span className={`mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md ${s.bg}`}>
                  <i className={`${s.icon} text-2xl`} aria-hidden="true" />
                </span>
                <div className="mt-4 font-display text-lg font-extrabold text-qupu-brand-blue">{s.title}</div>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-qupu-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 5 · Angka QUPU (true stats) */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-5xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Sudah Siap</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Yang sudah siap untuk anak
          </h2>
          <div className="mt-7">
            <WmiTrustStats />
          </div>
        </section>
      </Reveal>

      {/* 6 · Testimonials (dormant; the whole band is omitted while empty in V1) */}
      {TESTIMONIALS.length > 0 && (
        <Reveal delay={0.05}>
          <WmiTestimonials />
        </Reveal>
      )}

      {/* 7 · Closing CTA */}
      <Reveal delay={0.05}>
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-14 text-center text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-16">
          <Sprinkles />
          <img
            src="/subs-mascot.png"
            alt=""
            draggable={false}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 -left-3 hidden h-36 w-auto select-none drop-shadow-[0_12px_26px_rgba(0,0,0,0.25)] lg:block"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Jadi salah satu{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-qupu-brand-yellow">keluarga pertama</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-full bg-white/15" aria-hidden="true" />
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
              Coba Latihan WMI gratis hari ini. Tidak perlu kartu kredit.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-qupu-brand-orange px-7 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                  <i className="fa-solid fa-user-plus text-qupu-brand-orange" aria-hidden="true" />
                </span>
                Daftar Gratis
              </Link>
              <Link
                to="/harga"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] border-white bg-white/10 px-6 py-[10px] font-display text-base font-extrabold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:text-qupu-brand-blue"
              >
                <i className="fa-solid fa-tag" aria-hidden="true" />
                Lihat Harga
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
