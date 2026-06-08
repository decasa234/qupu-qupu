import { Link } from 'react-router-dom'

const BULLETS = [
  'Konsep WMI asli untuk anak Kelas 1–3',
  'Penjelasan penyelesaian masalah beranimasi',
  'Assisted highlight + hint langkah demi langkah',
  'XP & Achievement — belajar untuk dapatkan rewards',
]

export default function LatihanWmiSection() {
  return (
    <section
      id="wmi"
      className="relative scroll-mt-24 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14"
    >
      {/* star sprinkles */}
      <i className="fa-solid fa-star pointer-events-none absolute left-8 top-8 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute left-1/2 top-6 text-xs text-qupu-brand-yellow/50" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute bottom-9 left-1/3 text-base text-qupu-brand-yellow/60" aria-hidden="true" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
            <i className="fa-solid fa-medal" aria-hidden="true" />
            Baru · Latihan WMI
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
            Olimpiade matematika,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">dimainkan seperti game</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-full bg-qupu-brand-yellow/40" aria-hidden="true" />
            </span>
          </h2>
          <ul className="space-y-2.5">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm font-semibold sm:text-base">
                <i className="fa-solid fa-circle-check mt-0.5 text-qupu-brand-yellow" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link
              to="/wmi"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              Coba Latihan WMI
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* faux explainer preview — looks like the real demo screen */}
        <Link
          to="/wmi"
          aria-label="Main demo Latihan WMI"
          className="group relative mt-4 block rounded-[2rem] bg-qupu-cream p-3 shadow-[6px_8px_0_0_#234a73] transition-transform duration-200 hover:-translate-y-1 lg:mt-0"
        >
          <div className="rounded-[1.5rem] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
                Demo · Belanja
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-qupu-brand-orange" />
                <span className="h-2 w-2 rounded-full bg-qupu-brand-orange/40" />
                <span className="h-2 w-2 rounded-full bg-qupu-peach" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-2xl text-qupu-brand-orange">
              <i className="fa-solid fa-coins" aria-hidden="true" />
              <span className="font-display text-2xl font-extrabold text-qupu-brand-blue">5.000 − 3.000</span>
            </div>
            <div className="mt-1 text-center font-display text-3xl font-extrabold text-qupu-brand-blue">
              = <span className="text-qupu-brand-orange">2.000</span>
            </div>
          </div>
          <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-xs font-extrabold text-white shadow-[0_3px_0_0_#234a73] transition-transform group-hover:-translate-y-0.5">
            <i className="fa-solid fa-play" aria-hidden="true" />
            Main demo
          </span>
        </Link>
      </div>
    </section>
  )
}
