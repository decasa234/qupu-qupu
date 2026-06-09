import { Link } from 'react-router-dom'
import { FREE_TIER, COMING_SOON } from '@/data/wmiMarketing'

export default function WmiPricingSection() {
  return (
    <section id="harga" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">Harga</h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted sm:text-base">
          Mulai gratis hari ini. Fitur premium menyusul.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <div className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-white p-6 shadow-[0_8px_0_0_#f0853a] sm:p-8">
          <div className="flex items-center justify-between">
            <div className="font-display text-xl font-extrabold text-qupu-brand-blue">{FREE_TIER.name}</div>
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
              Aktif
            </span>
          </div>
          <div className="mt-2 font-display text-4xl font-extrabold text-qupu-brand-orange">{FREE_TIER.price}</div>
          <div className="text-xs font-semibold text-qupu-muted">{FREE_TIER.note}</div>

          <ul className="mt-5 space-y-2.5">
            {FREE_TIER.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm font-semibold text-qupu-brand-blue/90">
                <i className="fa-solid fa-circle-check mt-0.5 text-green-500" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            {FREE_TIER.cta}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-muted">Segera hadir</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {COMING_SOON.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-qupu-peach bg-qupu-cream px-3 py-1.5 text-xs font-bold text-qupu-muted"
              >
                <i className="fa-solid fa-lock text-[10px]" aria-hidden="true" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
