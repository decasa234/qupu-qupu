import { Link } from 'react-router-dom'

const BULLETS = [
  'Konsep WMI asli untuk anak Kelas 0–3',
  'Belajar langkah demi langkah, bukan menghafal',
  'XP, badge & confetti — anak ketagihan belajar',
]

export default function LatihanWmiSection() {
  return (
    <section
      id="wmi"
      className="scroll-mt-24 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-qupu-brand-blue to-[#3d6ea8] px-6 py-12 shadow-[6px_8px_0_0_#FFD3B1] sm:px-10 sm:py-14"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5a4a00]">
            <i className="fa-solid fa-medal" aria-hidden="true" />
            Baru · Latihan WMI
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Olimpiade matematika, dimainkan seperti game
          </h2>
          <ul className="space-y-2">
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
              className="inline-flex items-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
            >
              Coba Latihan WMI
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Link
          to="/wmi"
          className="group relative block rounded-[2rem] bg-qupu-cream p-3 shadow-[6px_8px_0_0_#234a73]"
        >
          <div className="flex h-40 items-center justify-center gap-5 rounded-[1.5rem] bg-white text-4xl text-qupu-brand-blue">
            <i className="fa-solid fa-dice" aria-hidden="true" />
            <i className="fa-solid fa-coins" aria-hidden="true" />
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-qupu-brand-blue px-4 py-1.5 font-display text-xs font-extrabold text-white">
            <i className="fa-solid fa-play mr-1.5" aria-hidden="true" />
            Main demo
          </span>
        </Link>
      </div>
    </section>
  )
}
