import { Link } from 'react-router-dom'
import Reveal from '@/components/Reveal'
import WmiChallenge from '@/components/wmi/marketing/WmiChallenge'
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
    desc: 'Latihan soal asli sebanyak yang anak mau, sambil kumpulkan XP.',
  },
  {
    icon: 'fa-solid fa-trophy',
    bg: 'bg-qupu-brand-orange',
    title: 'Ujian',
    desc: 'Coba paket ujian WMI sungguhan dan raih badge.',
  },
]

// What the child actually builds — the persuasion that matters to a parent.
const OUTCOMES = [
  {
    icon: 'fa-solid fa-diagram-project',
    skill: 'Penalaran logis',
    benefit: 'Berpikir runut dan teratur, menimbang dulu sebelum menjawab, bukan asal menebak.',
  },
  {
    icon: 'fa-solid fa-puzzle-piece',
    skill: 'Pemecahan masalah',
    benefit: 'Memecah soal sulit menjadi langkah-langkah kecil yang bisa diselesaikan.',
  },
  {
    icon: 'fa-solid fa-cube',
    skill: 'Nalar ruang',
    benefit: 'Membayangkan bentuk, pola, dan ruang di kepala, fondasi geometri dan sains.',
  },
  {
    icon: 'fa-solid fa-fire',
    skill: 'Tekun & percaya diri',
    benefit: 'Berani mencoba soal menantang dan tidak menyerah saat belum ketemu.',
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
    <div className="space-y-14 sm:space-y-20">
      {/* 1 · Challenge hook + reveal carousel (this is the page header) */}
      <WmiChallenge />

      {/* 2 · Kenapa anak perlu ini (persuasive, editorial — not a card grid) */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-[2.5rem] bg-qupu-cream px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Kenapa anak perlu ini</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-qupu-brand-blue sm:text-[2.6rem]">
                Bukan soal jadi juara olimpiade. Soal cara berpikir yang menempel seumur hidup.
              </h2>
              <p className="mt-4 max-w-md text-sm font-semibold leading-relaxed text-qupu-brand-blue/80 sm:text-base">
                WMI (World Mathematics Invitation) adalah kompetisi matematika internasional untuk anak. Di QUPU,
                anak belajar konsepnya sebagai latihan berpikir, bukan menghafal rumus.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                  <i className="fa-solid fa-user-plus text-qupu-brand-orange" aria-hidden="true" />
                </span>
                Mulai gratis
              </Link>
            </div>

            <ul>
              {OUTCOMES.map((o) => (
                <li
                  key={o.skill}
                  className="flex items-start gap-4 border-b-2 border-qupu-peach/60 py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-qupu-brand-orange shadow-[3px_4px_0_0_#FFD3B1]">
                    <i className={o.icon} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{o.skill}</div>
                    <p className="mt-0.5 text-sm font-semibold leading-relaxed text-qupu-muted">{o.benefit}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl bg-white/70 px-5 py-4 text-center text-sm font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-graduation-cap mr-2 text-qupu-brand-orange" aria-hidden="true" />
            Keterampilan yang menolong anak di sekolah, ujian, dan kehidupan sehari-hari.
          </div>
        </section>
      </Reveal>

      {/* 3 · Cara belajarnya */}
      <Reveal delay={0.05}>
        <section className="relative overflow-hidden rounded-[2.5rem] bg-qupu-cream px-6 py-12 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Perjalanan Belajar</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Cara belajarnya</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-qupu-muted">
            Tiga langkah seru: semuanya pakai XP, badge, dan confetti.
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

      {/* 4 · Angka QUPU (true stats) */}
      <Reveal delay={0.05}>
        <section className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Sudah Siap</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            Yang sudah siap untuk anak
          </h2>
          <div className="mt-7">
            <WmiTrustStats />
          </div>
        </section>
      </Reveal>

      {/* 5 · Testimonials (dormant; the whole band is omitted while empty in V1) */}
      {TESTIMONIALS.length > 0 && (
        <Reveal delay={0.05}>
          <WmiTestimonials />
        </Reveal>
      )}

      {/* 6 · Closing CTA */}
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
