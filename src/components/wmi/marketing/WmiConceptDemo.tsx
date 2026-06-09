import { useState } from 'react'
import { Link } from 'react-router-dom'
import WmiExplainer from '../WmiExplainer'
import { DEMO_CONCEPTS } from '@/data/wmiMarketing'

export default function WmiConceptDemo({ initialIndex = 0 }: { initialIndex?: number } = {}) {
  const [active, setActive] = useState(initialIndex)
  const concept = DEMO_CONCEPTS[active]

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg font-extrabold text-qupu-brand-blue">Coba sekarang</div>
          <div className="text-xs font-semibold text-qupu-muted">Tanpa daftar · gratis</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_CONCEPTS.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? 'rounded-full bg-qupu-brand-blue px-3 py-1.5 font-display text-xs font-extrabold text-white'
                  : 'rounded-full border-2 border-qupu-peach bg-white px-3 py-1.5 font-display text-xs font-extrabold text-qupu-brand-blue/70 transition hover:-translate-y-0.5'
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* key per concept forces a fresh explainer (restart) when switching tabs */}
      <WmiExplainer
        key={concept.slug}
        slug={concept.slug}
        params={concept.params}
        correctAnswer={concept.correctAnswer}
        lang="id"
      />

      <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-qupu-muted">
        {concept.caption}
      </p>

      <div className="mt-4 flex justify-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
        >
          <i className="fa-solid fa-user-plus" aria-hidden="true" />
          Daftar Gratis untuk lanjut
        </Link>
      </div>
    </div>
  )
}
