// src/components/dashboard/DashboardEmptyState.tsx
//
// Shown in place of the full dashboard when a child has zero activity
// (totalXp === 0 in the payload). Replaces the prior all-zeros first
// impression with a friendly mascot + CTA.

import { Link } from 'react-router-dom'

interface Props {
  childName: string
  ageLabel: string
}

export default function DashboardEmptyState({ childName, ageLabel }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-8 text-center shadow-[6px_8px_0_0_#FFD3B1] sm:p-12">
      <i className="fa-solid fa-star pointer-events-none absolute left-6 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-7 top-6 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
      <i className="fa-solid fa-sparkles pointer-events-none absolute left-1/3 bottom-6 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />

      <img
        src="/hero-mascot.png"
        alt=""
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none mx-auto h-32 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)] sm:h-40"
      />

      <div className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Anak Bunda · {ageLabel}
      </div>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
        Yuk mulai petualangan {childName}!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium text-qupu-muted sm:text-base">
        Selesaikan quiz pertama untuk membuka dashboard, streak harian, lencana, dan pencapaian.
        Tinggal pilih video di bawah.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/videos"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <i className="fa-solid fa-play text-sm" aria-hidden="true" />
          Pilih video
        </Link>
        <Link
          to="/badges"
          className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-blue/30 bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white"
        >
          <i className="fa-solid fa-trophy text-sm" aria-hidden="true" />
          Lihat pencapaian
        </Link>
      </div>
    </section>
  )
}
