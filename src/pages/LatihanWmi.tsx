import { Link } from 'react-router-dom'
import Reveal from '@/components/Reveal'
import WmiConceptDemo from '@/components/wmi/marketing/WmiConceptDemo'
import WmiTrustStats from '@/components/wmi/marketing/WmiTrustStats'
import WmiTestimonials from '@/components/wmi/marketing/WmiTestimonials'
import { FOUNDER, TESTIMONIALS } from '@/data/wmiMarketing'

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
  { icon: 'fa-solid fa-child-reaching', text: 'Dirancang untuk anak Kelas 0–3, dengan bahasa & visual yang ramah anak.' },
]

export default function LatihanWmiPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1 · Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFF6E5] via-[#FFE8C9] to-[#FFD8A8] px-6 py-12 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-brand-orange shadow-sm">
          <i className="fa-solid fa-medal" aria-hidden="true" />
          Latihan WMI
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight text-qupu-brand-blue sm:text-5xl">
          Olimpiade matematika, dimainkan seperti game
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-relaxed text-qupu-brand-blue/80 sm:text-base">
          Anak belajar konsep olimpiade matematika WMI lewat animasi seru — paham caranya, bukan sekadar hafal.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            Daftar Gratis
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white/80 px-6 py-[10px] font-display text-base font-extrabold text-qupu-brand-blue transition-all hover:-translate-y-0.5 hover:bg-qupu-brand-blue hover:text-white"
          >
            <i className="fa-solid fa-play" aria-hidden="true" />
            Main Demo
          </a>
        </div>
      </section>

      {/* 2 · Live demo */}
      <Reveal delay={0.05}>
        <section id="demo" className="scroll-mt-24">
          <WmiConceptDemo />
        </section>
      </Reveal>

      {/* 3 · Apa itu WMI? */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Apa itu WMI?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.text}
                className="rounded-[1.75rem] border-[3px] border-qupu-peach bg-white p-6 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
              >
                <i className={`${w.icon} text-3xl text-qupu-brand-orange`} aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{w.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4 · Cara belajarnya */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-[2.5rem] bg-qupu-cream px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10">
          <h2 className="text-center font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Cara belajarnya
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm font-semibold text-qupu-muted">
            Tiga langkah seru — semuanya pakai XP, badge, dan confetti.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {LEARN_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-[1.75rem] border-[3px] border-white bg-white p-6 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.10)]"
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
        <section className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
            Yang sudah siap untuk anak
          </h2>
          <div className="mt-6">
            <WmiTrustStats />
          </div>
        </section>
      </Reveal>

      {/* 6 · Cerita pendiri (placeholder) */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-3xl rounded-[2rem] border-[3px] border-qupu-peach bg-white p-6 shadow-[5px_6px_0_0_rgba(38,59,85,0.08)] sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-qupu-cream text-3xl text-qupu-brand-blue">
              <i className="fa-solid fa-chalkboard-user" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{FOUNDER.name}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-qupu-brand-orange">{FOUNDER.role}</div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-brand-blue/90">{FOUNDER.story}</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 7 · Testimonials (dormant; the whole band is omitted while empty in V1) */}
      {TESTIMONIALS.length > 0 && (
        <Reveal delay={0.05}>
          <WmiTestimonials />
        </Reveal>
      )}

      {/* 8 · Closing CTA */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-12 text-center text-white shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Jadi salah satu keluarga pertama</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
            Coba Latihan WMI gratis hari ini. Tidak perlu kartu kredit.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-7 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-user-plus" aria-hidden="true" />
              Daftar Gratis
            </Link>
            <Link
              to="/harga"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-white bg-white/10 px-6 py-[10px] font-display text-base font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-qupu-brand-blue"
            >
              <i className="fa-solid fa-tag" aria-hidden="true" />
              Lihat Harga
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
